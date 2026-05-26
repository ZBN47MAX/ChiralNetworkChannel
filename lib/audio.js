// =============================================================================
// lib/audio.js
// =============================================================================
//
// Audio subsystem — thin wrapper around lib/collections.js that adds:
//   - audio-specific extension / type / default-collection config
//   - a sidecar-lyric resolver (.lrc / .srt / .ass / .vtt)
//   - HiFi-grade metadata scanning via music-metadata (codec, bit depth,
//     sample rate, channels, duration, album / artist / genre / year,
//     embedded cover)
//   - on-disk LRU cache for embedded album covers
//
// HiFi metadata, v2 schema (v1.9.0+)
// ----------------------------------
// Before v1.9.0 the metadata scan was deliberately throttled:
//
//   mm.parseFile(absPath, { skipCovers: true, duration: false })
//
// That call was cheap (~20 ms per file) but stripped almost everything the
// HiFi player wanted to display: bitrate, sample rate, bit depth, channel
// layout, duration, album, genre, embedded cover. The user-visible UI line
// read "#01 · FLAC · 25.3 MB" and a 24-bit/96 kHz lossless track looked
// identical to a 128 kbps MP3 — there was no signal of audio quality at all.
//
// v1.9.0 unlocks the full scan. We trade roughly 50-150 ms per file (one-
// time, cached after) for a UI badge that reads
//
//   "FLAC 24bit/96kHz · 5.1ch · 4127kbps · Lossless"
//
// and gives the user enough information to know what they're playing. The
// extra cost is paid by the background probe queue tick (server.js), not on
// the synchronous play path; the cache lives in `.collection.json`'s
// `episodeMeta[file]` blob alongside the existing trackNumber/artist data
// so there is no schema migration.
//
// Why music-metadata instead of ffprobe
// -------------------------------------
// music-metadata is already a dependency, runs entirely in-process (no spawn
// cost — important on the DS124 where every ffprobe goes through the
// concurrency.js slot), and reports the headline HiFi fields directly from
// the container headers. ffprobe is reserved for video files and for the
// rare audio container music-metadata cannot open (e.g. DSF on older
// versions). The two paths produce records in the same schema (see the
// `mediaInfo` shape documented in lib/probe-cache.js) so consumers do not
// have to branch on which path produced the data.
//
// Cover extraction
// ----------------
// music-metadata returns the embedded picture as a Buffer. Holding all
// covers in RAM is fine for a small library but a 1000-album scan would
// briefly peak at ~80 MB which competes with the rest of the node heap on
// the 1 GiB DS124. Instead we write each cover to
//
//   AUDIO_COVER_CACHE_DIR/<sha1(cid|file)>.<ext>
//
// once, then drop the buffer. The cover endpoint (server.js) serves files
// from this directory via sendFile (Range support, Node-native). Eviction
// is LRU by mtime, capped at AUDIO_COVER_LRU_BYTES; the eviction pass runs
// inside the same 30 s probe tick that drives lib/probe-cache.js.
// =============================================================================

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const collections = require('./collections');
const lyrics = require('./lyrics');
const probeCache = require('./probe-cache');

/** Schema version persisted as `_audioMetaV` in episodeMeta. Bump when the
 *  set of fields written below changes in a way that requires re-scanning. */
const AUDIO_META_SCHEMA_V = 2;

/* --------------------------------------------------------------------------
 * music-metadata is shipped as ESM. We lazy-load via dynamic import and
 * cache the resolved namespace so each subsequent call is synchronous after
 * the first hit. Wrapping in a Promise lets callers race the load with the
 * file open without holding a stale reference if the load failed.
 * ------------------------------------------------------------------------ */
let mmPromise = null;
function loadMM() {
  if (!mmPromise) {
    mmPromise = import('music-metadata').catch((err) => {
      // Reset so the next call retries; a transient ESM load failure
      // (rare, but seen during DSM package upgrades) should not perma-
      // disable HiFi scanning.
      mmPromise = null;
      throw err;
    });
  }
  return mmPromise;
}

/* --------------------------------------------------------------------------
 * music-metadata codec-name normalization.
 *
 * The library returns human-friendly strings like "MPEG 1 Layer 3" or
 * "Apple Lossless". Downstream code in lib/probe-cache.js's lossless table
 * and lib/audio-stream.js's route picker is keyed on ffprobe-style lowercase
 * canonical names ("mp3", "alac"). Normalize here so consumers can branch
 * on a single vocabulary regardless of which scanner produced the record.
 *
 * Mappings cover the formats listed in config.js AUDIO_EXTS plus the
 * lossy/lossless variants users typically encounter in commercial rips.
 * Unknown codec names pass through verbatim (lowercased) so future
 * music-metadata releases don't silently lose coverage.
 * ------------------------------------------------------------------------ */
const MM_CODEC_MAP = {
  'mpeg 1 layer 3': 'mp3',
  'mpeg 2 layer 3': 'mp3',
  'mpeg 1 layer 2': 'mp2',
  'mpa': 'mp3',
  'mp3': 'mp3',
  'aac': 'aac',
  'mp4a-40-2': 'aac',
  'mp4a-40-5': 'aac',
  'mp4a': 'aac',
  'he-aac': 'aac',
  'flac': 'flac',
  'apple lossless audio codec': 'alac',
  'apple lossless': 'alac',
  'alac': 'alac',
  'monkey\'s audio': 'ape',
  'ape': 'ape',
  'wavpack': 'wavpack',
  'tta': 'tta',
  'tak': 'tak',
  'vorbis': 'vorbis',
  'opus': 'opus',
  'wma': 'wma',
  'wma lossless': 'wmalossless',
  'wma 9 lossless': 'wmalossless',
  'pcm': 'pcm_s16le',
  'wav': 'pcm_s16le',
  'dsd': 'dsd_lsbf',
  'aiff': 'pcm_s16be',
};

function normalizeCodec(name) {
  if (!name) return null;
  const key = String(name).trim().toLowerCase();
  if (MM_CODEC_MAP[key]) return MM_CODEC_MAP[key];
  // Aggressive fallbacks for variant labels music-metadata occasionally emits
  // (e.g. "FLAC 1.2.1" or "PCM 16-bit LE"). Take the first whitespace-bounded
  // token and try again before giving up.
  const first = key.split(/\s+/)[0];
  if (MM_CODEC_MAP[first]) return MM_CODEC_MAP[first];
  return key;
}

/* --------------------------------------------------------------------------
 * Translate a music-metadata parse result into the project's mediaInfo
 * schema (lib/probe-cache.js documents the canonical shape). Audio-only;
 * video/sub fields are always null/empty here because music-metadata does
 * not surface video stream data even for MP4 containers carrying video.
 * Callers that need video info on an audio-collection MV file should call
 * lib/probe-cache.js getMediaInfo() separately.
 * ------------------------------------------------------------------------ */
function _mmToMediaInfo(mm, mtimeMs, hasCover) {
  const fmt = mm.format || {};
  const codec = normalizeCodec(fmt.codec);
  const audioStream = {
    index: 0,
    codec,
    profile: fmt.codecProfile || null,
    channels: typeof fmt.numberOfChannels === 'number' ? fmt.numberOfChannels : null,
    channelLayout: null, // music-metadata does not expose layout strings
    sampleRate: typeof fmt.sampleRate === 'number' ? fmt.sampleRate : null,
    bitDepth: typeof fmt.bitsPerSample === 'number' ? fmt.bitsPerSample : null,
    bitsPerRawSample: typeof fmt.bitsPerSample === 'number' ? fmt.bitsPerSample : null,
    bitrate: typeof fmt.bitrate === 'number' ? fmt.bitrate : null,
    language: null,
    title: null,
    default: true,
    lossless: probeCache.isLosslessCodec(codec) || fmt.lossless === true,
  };
  return {
    v: 1,
    probedAt: Date.now(),
    probedMtime: mtimeMs != null ? mtimeMs : null,
    container: fmt.container || null,
    durationSec: typeof fmt.duration === 'number' ? fmt.duration : null,
    video: null,
    audio: [audioStream],
    subs: [],
    embeddedCover: !!hasCover,
    error: null,
  };
}

/* --------------------------------------------------------------------------
 * Cover cache helpers.
 *
 * Path layout:
 *   <AUDIO_COVER_CACHE_DIR>/<sha1(collectionId + ' ' + epFile)>.<ext>
 *
 * The null byte separator prevents collisions on edge-case names like
 * "albumA/track" vs "album" + "A/track" (the latter would never appear in
 * practice but the cost of the explicit separator is one byte).
 *
 * Extension is derived from the music-metadata picture record's MIME type
 * ('image/jpeg' → 'jpg', 'image/png' → 'png', anything else → 'bin').
 * ------------------------------------------------------------------------ */
function _coverKey(collectionId, epFile) {
  return crypto.createHash('sha1')
    .update(collectionId + ' ' + epFile, 'utf8')
    .digest('hex');
}

function _extForMime(mime) {
  const m = (mime || '').toLowerCase();
  if (m === 'image/jpeg' || m === 'image/jpg') return 'jpg';
  if (m === 'image/png') return 'png';
  if (m === 'image/webp') return 'webp';
  if (m === 'image/gif') return 'gif';
  return 'bin';
}

/**
 * @brief Resolve a cover cache path for an episode regardless of presence.
 *
 *        Used by the HTTP cover endpoint to look up the cached file. Tries
 *        each known extension in order and returns the first that exists,
 *        or null if no cover was extracted.
 *
 * @param {string} cacheDir
 * @param {string} collectionId
 * @param {string} epFile
 * @returns {string|null} absolute path or null
 */
function resolveCoverPath(cacheDir, collectionId, epFile) {
  if (!cacheDir || !collectionId || !epFile) return null;
  const stem = path.join(cacheDir, _coverKey(collectionId, epFile));
  for (const ext of ['jpg', 'png', 'webp', 'gif', 'bin']) {
    const p = stem + '.' + ext;
    try { if (fs.existsSync(p)) return p; } catch (_e) { /* swallow */ }
  }
  return null;
}

/**
 * @brief Write a cover image buffer to disk under the LRU cache root.
 *
 *        Best-effort: failures (disk full, permissions) are swallowed and
 *        treated as "no cover" — the UI gracefully falls back to a generic
 *        album icon. mkdir-recursive ensures first-write on a fresh install
 *        creates the directory.
 *
 * @param {string} cacheDir
 * @param {string} collectionId
 * @param {string} epFile
 * @param {{data: Buffer, format: string}} picture
 * @returns {boolean} true if written, false on failure or no picture
 */
function _writeCover(cacheDir, collectionId, epFile, picture) {
  if (!cacheDir || !picture || !Buffer.isBuffer(picture.data)) return false;
  try {
    fs.mkdirSync(cacheDir, { recursive: true });
    const ext = _extForMime(picture.format);
    const out = path.join(cacheDir, _coverKey(collectionId, epFile) + '.' + ext);
    // Use writeFileSync with the buffer directly; for the typical
    // 30-150 KB JPEG the sync cost is negligible and we avoid a callback
    // chain in the hot scan loop.
    fs.writeFileSync(out, picture.data);
    return true;
  } catch (_e) {
    return false;
  }
}

/**
 * @brief LRU eviction sweep for the cover cache.
 *
 *        Walks the cache directory, sorts entries by mtime ascending, and
 *        deletes the oldest until the total size drops below the limit.
 *        Intended to be called from the periodic probe tick in server.js
 *        (server.js owns the schedule); safe to call on every tick because
 *        it short-circuits cheaply when already under budget.
 *
 * @param {string} cacheDir
 * @param {number} maxBytes
 */
function sweepCoverCache(cacheDir, maxBytes) {
  if (!cacheDir || !maxBytes) return;
  let entries;
  try {
    entries = fs.readdirSync(cacheDir, { withFileTypes: true });
  } catch (_e) { return; }

  const items = [];
  let total = 0;
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const full = path.join(cacheDir, ent.name);
    let st;
    try { st = fs.statSync(full); } catch (_e) { continue; }
    items.push({ full, size: st.size, mtimeMs: st.mtimeMs });
    total += st.size;
  }
  if (total <= maxBytes) return;

  items.sort((a, b) => a.mtimeMs - b.mtimeMs); // oldest first
  for (const it of items) {
    if (total <= maxBytes) break;
    try { fs.unlinkSync(it.full); total -= it.size; } catch (_e) { /* swallow */ }
  }
}

/* --------------------------------------------------------------------------
 * Public factory.
 * ------------------------------------------------------------------------ */

function createAudioStore(config) {
  const store = collections.createStore({
    root: config.AUDIO_ROOT,
    mediaExts: config.AUDIO_EXTS,
    imageExts: config.IMAGE_EXTS,
    subtitleExts: config.LYRIC_EXTS,
    validTypes: config.AUDIO_TYPES,
    defaultType: 'other',
    protectedIds: [config.AUDIO_DEFAULT_COLLECTION_ID],
  });

  const coverDir = config.AUDIO_COVER_CACHE_DIR || null;
  const coverLimitBytes = Number(config.AUDIO_COVER_LRU_BYTES) || 0;

  /**
   * @brief Ensure the default collection exists on boot.
   *
   *        Creates the folder and writes a stub .collection.json if missing.
   *        Caller must call this during boot after store.init() has run so
   *        validateId / category seeding has populated the parent context.
   */
  function ensureDefaultCollection() {
    store.ensureCollection(config.AUDIO_DEFAULT_COLLECTION_ID, {
      title: config.AUDIO_DEFAULT_COLLECTION_TITLE,
      description: '系统默认合集 · 单文件上传会自动归入此处',
      type: 'other',
    });
  }

  /**
   * @brief Resolve the lyric / subtitle sidecar that should accompany an
   *        audio episode at playback time.
   *
   *        The store already enumerates sidecars in buildEpisodes() but the
   *        returned record only carries metadata (file name, format). Here
   *        we actually parse the file via lib/lyrics.js so the player can
   *        receive structured cues. Picking is delegated to lyrics.pickBest
   *        which honors the format priority order documented in config.js
   *        LYRIC_EXTS.
   *
   * @param {string} collectionId
   * @param {string} audioFile
   * @returns {{file, format, lines, error}|null}
   */
  function resolveLyricForEpisode(collectionId, audioFile) {
    const col = store.getCollection(collectionId);
    if (!col) return null;
    const ep = col.episodes.find((e) => e.file === audioFile);
    if (!ep || !ep.subtitles || ep.subtitles.length === 0) return null;
    const best = lyrics.pickBest(ep.subtitles);
    if (!best) return null;
    const absDir = store.resolveCollectionPath(collectionId);
    if (!absDir) return null;
    const absPath = path.join(absDir, best.file);
    if (!fs.existsSync(absPath)) return null;
    const parsed = lyrics.parseFile(absPath, best.format);
    return {
      file: best.file,
      format: best.format,
      lines: parsed.lines,
      error: parsed.error || null,
    };
  }

  /**
   * @brief Full HiFi metadata scan for one collection.
   *
   *        Walks every episode, parses with music-metadata, normalizes the
   *        result, persists to .collection.json's episodeMeta, and writes
   *        any embedded cover to the LRU cache. Cached entries with the
   *        current schema version are skipped on subsequent runs so the
   *        amortized cost is one full parse per file per content change.
   *
   *        The scan does NOT acquire the concurrency slot — music-metadata
   *        runs in-process and competes with the node event loop rather
   *        than with ffmpeg children. The slot only matters for spawn-
   *        based scanners (lib/probe-cache.js).
   *
   * @param {string} collectionId
   * @returns {Promise<Object|null>} Map of file → {trackNumber, artist} for
   *          back-compat with v1.8.x consumers. Newer consumers should read
   *          the full mediaInfo via store.getCollection().
   */
  async function scanAudioMeta(collectionId) {
    const absDir = store.resolveCollectionPath(collectionId);
    if (!absDir) return null;
    const col = store.getCollection(collectionId);
    if (!col) return null;
    let mm;
    try { mm = await loadMM(); } catch (_e) { return null; }

    const meta = store.readMetaFile
      ? store.readMetaFile(absDir, collectionId)
      : null;
    const episodeMeta = (meta && meta.episodeMeta) || {};
    let changed = false;
    const result = {};

    for (const ep of col.episodes) {
      const cached = episodeMeta[ep.file];
      if (
        cached
        && cached._audioMetaScanned
        && cached._audioMetaV === AUDIO_META_SCHEMA_V
        && cached.mediaInfo
        && cached.mediaInfo.probedMtime === ep.mtime
      ) {
        result[ep.file] = {
          trackNumber: cached.trackNumber != null ? cached.trackNumber : null,
          artist: cached.artist || null,
        };
        continue;
      }

      const absPath = path.join(absDir, ep.file);
      let parsed = null;
      let mediaInfo = null;
      let hasCover = false;
      try {
        // Full-field parse (v1.9.0+). Covers are read inline so we can
        // extract the embedded picture in the same pass; the buffer is
        // dropped immediately after writeCover so peak memory stays at
        // one picture at a time even for large catalog scans.
        parsed = await mm.parseFile(absPath, {
          skipCovers: false,
          duration: true,
          skipPostHeaders: false,
        });
      } catch (_e) {
        // Unreadable file: persist an error mediaInfo so the next scan
        // tick does not retry-storm on the same broken header. The
        // record's probedMtime carries the current mtime so a content
        // edit (e.g. user replaces a corrupt download) does invalidate
        // and re-probe.
        mediaInfo = {
          v: 1,
          probedAt: Date.now(),
          probedMtime: ep.mtime != null ? ep.mtime : null,
          container: null,
          durationSec: null,
          video: null,
          audio: [],
          subs: [],
          embeddedCover: false,
          error: 'music-metadata parse failed',
        };
      }

      let trackNumber = null;
      let artist = null;
      let album = null;
      let genre = null;
      let year = null;

      if (parsed) {
        const c = parsed.common || {};
        if (c.track && c.track.no != null) trackNumber = c.track.no;
        artist = c.artist || (Array.isArray(c.artists) && c.artists[0]) || null;
        album = c.album || null;
        genre = Array.isArray(c.genre) && c.genre.length > 0 ? c.genre[0] : null;
        year = typeof c.year === 'number' ? c.year : null;
        if (coverDir && Array.isArray(c.picture) && c.picture.length > 0) {
          const pic = c.picture[0];
          hasCover = _writeCover(coverDir, collectionId, ep.file, pic);
        }
        mediaInfo = _mmToMediaInfo(parsed, ep.mtime, hasCover);
      }

      result[ep.file] = { trackNumber, artist };

      // Merge persisted v2 fields. Existing override values (title,
      // description, order) coming from user edits stay untouched —
      // only the auto-derived fields are overwritten.
      const prior = episodeMeta[ep.file] && typeof episodeMeta[ep.file] === 'object'
        ? episodeMeta[ep.file]
        : {};
      episodeMeta[ep.file] = Object.assign({}, prior, {
        trackNumber,
        artist,
        album,
        genre,
        year,
        mediaInfo,
        _audioMetaScanned: true,
        _audioMetaV: AUDIO_META_SCHEMA_V,
      });
      changed = true;
    }

    if (changed && meta) {
      meta.episodeMeta = episodeMeta;
      try { store.writeMetaFile(absDir, meta); } catch (_e) { /* swallow */ }
    }
    return result;
  }

  /**
   * @brief Merge persisted episodeMeta back onto live episode records.
   *
   *        buildEpisodes in lib/collections.js already attaches mediaInfo
   *        (v1.9.0+), but the audio-only legacy fields (trackNumber, artist,
   *        album, ...) are surfaced here so consumers that received their
   *        episode list before scanAudioMeta finished still see them.
   *
   *        Old v1 entries (those missing _audioMetaV or with v=1) are
   *        treated as missing — the field is left null and the next scan
   *        tick will refresh them. We deliberately do NOT trigger a scan
   *        synchronously inside this read-only function; the caller (or
   *        the background tick) owns scheduling.
   *
   * @param {Object} col Collection record from store.getCollection.
   * @param {string} id  Collection id (needed to read .collection.json).
   * @returns {Object|null} Decorated col, or null if id resolves to nothing.
   */
  function _decorateWithAudioMeta(col, id) {
    if (!col) return null;
    const absDir = store.resolveCollectionPath(id);
    const rawMeta = absDir ? store.readMetaFile(absDir, id) : null;
    const episodeMeta = (rawMeta && rawMeta.episodeMeta) || {};
    for (const ep of col.episodes) {
      const cached = episodeMeta[ep.file];
      if (cached && cached._audioMetaScanned && cached._audioMetaV === AUDIO_META_SCHEMA_V) {
        ep.trackNumber = cached.trackNumber != null ? cached.trackNumber : null;
        ep.artist = cached.artist || null;
        ep.album = cached.album || null;
        ep.genre = cached.genre || null;
        ep.year = cached.year != null ? cached.year : null;
      } else {
        // v1 row (or no row at all) — surface nulls and let the scan
        // catch up. v1 had trackNumber and artist only; copy those
        // through so the UI doesn't regress while v2 rescan is pending.
        ep.trackNumber = cached && cached.trackNumber != null ? cached.trackNumber : null;
        ep.artist = (cached && cached.artist) || null;
        ep.album = null;
        ep.genre = null;
        ep.year = null;
      }
    }
    return col;
  }

  function getCollectionWithAudioMeta(collectionId) {
    return _decorateWithAudioMeta(store.getCollection(collectionId), collectionId);
  }

  /**
   * @brief getCollection override that always carries audio HiFi metadata.
   *
   *        Used by every external consumer of the audio store (server.js
   *        routes, etc.). The decoration is cheap (one .collection.json
   *        read on top of the already-warm collection cache) and ensures
   *        the same field set is visible regardless of which path the
   *        caller used.
   */
  const originalGetCollection = store.getCollection;
  function getCollection(id) {
    const col = originalGetCollection(id);
    return _decorateWithAudioMeta(col, id);
  }

  /**
   * @brief Sweep the cover cache (LRU eviction). Intended to be called from
   *        the periodic probe queue tick in server.js — no internal timer.
   */
  function sweepCovers() {
    sweepCoverCache(coverDir, coverLimitBytes);
  }

  return Object.assign({}, store, {
    ensureDefaultCollection,
    resolveLyricForEpisode,
    scanAudioMeta,
    getCollection,
    sweepCovers,
    resolveCoverPath: (id, file) => resolveCoverPath(coverDir, id, file),
    DEFAULT_ID: config.AUDIO_DEFAULT_COLLECTION_ID,
    SCHEMA_VERSION: AUDIO_META_SCHEMA_V,
  });
}

module.exports = {
  createAudioStore,
  // Exported as standalone helpers so other layers (e.g. lib/audio-stream.js
  // when it needs to look up a cover path) can use them without going
  // through the store factory.
  resolveCoverPath,
  sweepCoverCache,
  normalizeCodec,
  AUDIO_META_SCHEMA_V,
};
