// Audio subsystem — wraps the generic collections factory with audio-specific
// configuration (extensions, valid types, default collection) and exposes a
// `resolveLyricForEpisode` helper that picks the best sidecar lyric file for
// a given audio file stem.

const fs = require('fs');
const path = require('path');
const collections = require('./collections');
const lyrics = require('./lyrics');

// Lazy-load music-metadata (ESM) via cached dynamic import.
let mmPromise = null;
function loadMM() {
  if (!mmPromise) {
    mmPromise = import('music-metadata').catch((err) => {
      mmPromise = null;
      throw err;
    });
  }
  return mmPromise;
}

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

  // Ensure the default collection exists on boot. Creates the folder and
  // writes a stub .collection.json if missing. Caller must call this during
  // boot after store.init() has run.
  function ensureDefaultCollection() {
    store.ensureCollection(config.AUDIO_DEFAULT_COLLECTION_ID, {
      title: config.AUDIO_DEFAULT_COLLECTION_TITLE,
      description: '系统默认合集 · 单文件上传会自动归入此处',
      type: 'other',
    });
  }

  // Given a collection id and an audio file name inside it, find the best
  // lyric/subtitle sidecar and return { file, format, lines } or null.
  // The store already scans subtitle sidecars in buildEpisodes(), but that
  // list only contains metadata (not parsed lines) — here we actually parse.
  function resolveLyricForEpisode(collectionId, audioFile) {
    const col = store.getCollection(collectionId);
    if (!col) return null;
    const ep = col.episodes.find((e) => e.file === audioFile);
    if (!ep || !ep.subtitles || ep.subtitles.length === 0) return null;
    // Pick by format priority (vtt > srt > ass/ssa > lrc > txt).
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

  // Scan audio metadata (trackNumber, artist) for all episodes in a
  // collection using music-metadata. Results are cached in .collection.json
  // episodeMeta so subsequent calls are instant. Returns a map of
  // { [file]: { trackNumber, artist } } or null on error.
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
      if (cached && cached._audioMetaScanned) {
        result[ep.file] = {
          trackNumber: cached.trackNumber != null ? cached.trackNumber : null,
          artist: cached.artist || null,
        };
        continue;
      }
      const absPath = path.join(absDir, ep.file);
      let trackNumber = null, artist = null;
      try {
        const parsed = await mm.parseFile(absPath, { skipCovers: true, duration: false });
        if (parsed.common) {
          if (parsed.common.track && parsed.common.track.no != null) {
            trackNumber = parsed.common.track.no;
          }
          artist = parsed.common.artist || null;
        }
      } catch (_e) { /* unreadable file — leave null */ }
      result[ep.file] = { trackNumber, artist };
      // Merge into episodeMeta for caching, preserving existing fields.
      if (!episodeMeta[ep.file]) episodeMeta[ep.file] = {};
      episodeMeta[ep.file].trackNumber = trackNumber;
      episodeMeta[ep.file].artist = artist;
      episodeMeta[ep.file]._audioMetaScanned = true;
      changed = true;
    }

    // Persist cache back to .collection.json
    if (changed && meta) {
      meta.episodeMeta = episodeMeta;
      try { store.writeMetaFile(absDir, meta); } catch (_e) {}
    }
    return result;
  }

  // Get collection with audio metadata (trackNumber, artist) merged
  // into each episode. If metadata cache doesn't exist yet, returns
  // episodes without those fields and triggers a background scan.
  function getCollectionWithAudioMeta(collectionId) {
    const col = store.getCollection(collectionId);
    if (!col) return null;
    const absDir = store.resolveCollectionPath(collectionId);
    const rawMeta = absDir ? store.readMetaFile(absDir, collectionId) : null;
    const episodeMeta = (rawMeta && rawMeta.episodeMeta) || {};
    for (const ep of col.episodes) {
      const cached = episodeMeta[ep.file];
      if (cached && cached._audioMetaScanned) {
        ep.trackNumber = cached.trackNumber != null ? cached.trackNumber : null;
        ep.artist = cached.artist || null;
      } else {
        ep.trackNumber = null;
        ep.artist = null;
      }
    }
    return col;
  }

  // Override getCollection to always include audio metadata fields.
  const originalGetCollection = store.getCollection;
  function getCollection(id) {
    const col = originalGetCollection(id);
    if (!col) return null;
    const absDir = store.resolveCollectionPath(id);
    const rawMeta = absDir ? store.readMetaFile(absDir, id) : null;
    const episodeMeta = (rawMeta && rawMeta.episodeMeta) || {};
    for (const ep of col.episodes) {
      const cached = episodeMeta[ep.file];
      if (cached && cached._audioMetaScanned) {
        ep.trackNumber = cached.trackNumber != null ? cached.trackNumber : null;
        ep.artist = cached.artist || null;
      } else {
        ep.trackNumber = null;
        ep.artist = null;
      }
    }
    return col;
  }

  return Object.assign({}, store, {
    ensureDefaultCollection,
    resolveLyricForEpisode,
    scanAudioMeta,
    getCollection,
    DEFAULT_ID: config.AUDIO_DEFAULT_COLLECTION_ID,
  });
}

module.exports = { createAudioStore };
