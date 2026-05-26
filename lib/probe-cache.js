// =============================================================================
// lib/probe-cache.js
// =============================================================================
//
// ffprobe wrapper with in-memory deduplication, concurrency-slot integration,
// and a single normalized output schema.
//
// Why this module exists
// ----------------------
// Before v1.9.0, ffprobe was called ad-hoc from several places (streamTo, HLS
// queue admission, multi-audio picker). Each site had its own argv, its own
// timeout handling, and its own way of mapping the ffprobe JSON output onto a
// project-specific shape. The HiFi audio path adds yet another caller that
// needs even richer fields (sampleRate, bitDepth, channelLayout, lossless
// flag, embeddedCover boolean). Rather than copy-pasting a fifth permutation,
// v1.9.0 centralizes the call here.
//
// Three responsibilities
// ----------------------
// 1. **Spawn through the slot.** Every probe goes through lib/concurrency.js
//    so it cannot collide with an in-flight transcode. Probes are background-
//    priority by default — they can wait behind real playback. Callers that
//    need a probe synchronously on a hot path (e.g. /api/episode/.../codecs
//    answering a still-loading player) can request foreground priority.
//
// 2. **Deduplicate concurrent requests.** Two clients asking for the same
//    file's mediaInfo within the same second should result in ONE ffprobe
//    spawn. We keep an in-flight Promise map keyed by (absPath, mtimeMs);
//    a second arrival latches onto the existing Promise rather than queueing
//    a second spawn.
//
// 3. **Normalize the output.** The ffprobe -show_streams -show_format JSON
//    contains roughly 60 fields per stream of which we care about ~15. The
//    rest is dropped here so callers don't have to filter at every site
//    and so the shape can evolve without touching consumers.
//
// What this module deliberately does NOT do
// -----------------------------------------
// - **No on-disk persistence.** Callers that want to cache mediaInfo across
//   restarts must write to their own backing store (typically
//   episodeMeta[file].mediaInfo inside the collection's .collection.json).
//   Persisting from this module would require knowing which store owns
//   the file, which would tie the module to lib/collections.js and make
//   testing in isolation awkward.
//
// - **No background queue / tick.** The scan loop that walks every episode
//   and probes the unprobed ones lives in server.js (tickProbeQueue) so it
//   can share the tier check and the access tracker with tickHlsQueue. This
//   module is invoked one absPath at a time.
//
// - **No mtime invalidation policy.** Callers decide when a cached probe
//   is stale by comparing the cached probedMtime against the file's current
//   mtime. We do not stat() the file ourselves — that would cost a syscall
//   on every miss check and break the assumption that this module is pure
//   "input → ffprobe → output".
//
// Output schema (stable, versioned)
// ---------------------------------
//   {
//     v: 1,                          // schema version; bump on breaking changes
//     probedAt: <ms>,                // wall-clock when ffprobe returned
//     probedMtime: <ms> | null,      // caller-supplied source mtime, echoed back
//     container: 'matroska,webm' | 'mov,mp4,m4a,...' | null,
//     durationSec: <number> | null,  // container duration (best effort)
//     video: {                        // first video stream, or null if absent
//       codec, profile, level, width, height, fps,
//       pixFmt, colorRange, colorPrimaries, bitrate
//     } | null,
//     audio: [                         // every audio stream, stream-index order
//       {
//         index,                       // ffprobe absolute index (use as -map 0:N)
//         codec, profile,
//         channels, channelLayout,
//         sampleRate, bitDepth, bitsPerRawSample,
//         bitrate,
//         language, title,
//         default,                    // disposition.default flag
//         lossless,                   // derived from codec name (see below)
//       }
//     ],
//     subs: [                          // every subtitle stream, stream-index order
//       { index, codec, language, title }
//     ],
//     embeddedCover: <boolean>,       // any "attached_pic" disposition?
//     error: null | '<message>',      // set instead of the structured fields
//                                     // on ffprobe failure; caller persists
//                                     // this so retry-storms are avoided.
//   }
//
// The `lossless` derivation matches the user-facing "HiFi" definition:
// FLAC, ALAC, APE, WavPack, TTA, TAK, DTS-HD MA, TrueHD, raw PCM family,
// and the DSD family. AAC / MP3 / Vorbis / Opus are NOT lossless even when
// configured at very high bitrates.
// =============================================================================

'use strict';

const { spawn } = require('child_process');
const concurrency = require('./concurrency');

/* --------------------------------------------------------------------------
 * Lossless codec table.
 *
 * Sourced from the ffprobe `codec_name` field, which is the libavcodec
 * canonical name (lowercase, hyphen-free). Note that AC-3 and EAC-3 are
 * intentionally NOT lossless — they are perceptual codecs even though they
 * sometimes show up in "lossless" rip metadata.
 *
 * Tweaking this set has user-visible consequences: the HiFi badge in the
 * UI shows a green "Lossless" pill for any codec in this set, and the
 * audio router refuses to re-encode lossless sources to Opus unless the
 * client explicitly cannot decode the lossless container.
 * ------------------------------------------------------------------------ */
const LOSSLESS_CODECS = new Set([
  'flac',
  'alac',
  'ape',
  'wavpack',
  'tta',
  'tak',
  'dts-hd ma',        // ffprobe variant; see also "truehd" below
  'truehd',
  'mlp',
  'pcm_s16le', 'pcm_s16be',
  'pcm_s24le', 'pcm_s24be',
  'pcm_s32le', 'pcm_s32be',
  'pcm_f32le', 'pcm_f32be',
  'pcm_f64le', 'pcm_f64be',
  'pcm_s8',
  'pcm_u8',
  'pcm_dvd',
  'pcm_bluray',
  'dsd_lsbf', 'dsd_msbf', 'dsd_lsbf_planar', 'dsd_msbf_planar',
]);

function isLosslessCodec(codecName) {
  if (!codecName) return false;
  const c = String(codecName).toLowerCase();
  return LOSSLESS_CODECS.has(c);
}

/* --------------------------------------------------------------------------
 * In-flight dedup map.
 *
 * Key: `<absPath>:<mtimeMs|0>` — including mtime in the key means two
 * back-to-back probes after a file edit do not collide and the second one
 * correctly triggers a fresh spawn.
 *
 * Value: pending Promise resolving to the normalized mediaInfo record.
 *
 * Sized informally — typical max is "however many concurrent users are
 * starting playback" which on a single-user DS124 is ~1. Cleanup is on
 * Promise settle, so the map naturally stays small.
 * ------------------------------------------------------------------------ */
const inFlight = new Map();

/* --------------------------------------------------------------------------
 * Internal: spawn ffprobe and parse the JSON output.
 *
 * Slot acquisition lives at this layer so dedup hits do not pay for the
 * acquire+release roundtrip a second time.
 * ------------------------------------------------------------------------ */
async function _runFfprobe(ffprobePath, absPath, opts) {
  const priority = opts.priority === 'foreground' ? 'foreground' : 'background';
  const timeoutMs = Number(opts.timeoutMs) > 0 ? Number(opts.timeoutMs) : 15000;

  let child = null;
  const slot = await concurrency.acquire({
    priority,
    label: 'ffprobe:' + absPath,
    onPreempt: () => {
      // Background probes routinely get preempted by foreground playback;
      // killing the child is the policy. The caller's Promise resolves
      // with an error mediaInfo so the queue tick moves on rather than
      // hanging.
      if (child) {
        try { child.kill('SIGKILL'); } catch (_e) { /* swallow */ }
      }
    },
  });

  try {
    return await new Promise((resolve) => {
      const args = [
        '-v', 'error',
        '-print_format', 'json',
        '-show_streams',
        '-show_format',
        absPath,
      ];
      child = spawn(ffprobePath, args, {
        stdio: ['ignore', 'pipe', 'pipe'],
        windowsHide: true,
      });

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      child.stdout.on('data', (d) => { stdout += d.toString('utf8'); });
      child.stderr.on('data', (d) => {
        // Keep only the tail — ffprobe's stderr can be chatty on broken
        // containers (e.g. truncated mkv: dozens of "Invalid NAL unit
        // size" lines). The first 2 KB is plenty for diagnostics.
        stderr += d.toString('utf8');
        if (stderr.length > 2048) stderr = stderr.slice(-2048);
      });

      const timer = setTimeout(() => {
        timedOut = true;
        try { child.kill('SIGKILL'); } catch (_e) { /* swallow */ }
      }, timeoutMs);

      child.on('error', (err) => {
        clearTimeout(timer);
        resolve({ ok: false, error: 'ffprobe spawn failed: ' + err.message });
      });

      child.on('exit', (code, signal) => {
        clearTimeout(timer);
        if (timedOut) {
          resolve({ ok: false, error: 'ffprobe timeout after ' + timeoutMs + 'ms' });
          return;
        }
        if (signal === 'SIGKILL') {
          // Preempted by foreground; caller logs / retries later.
          resolve({ ok: false, error: 'ffprobe preempted (SIGKILL)' });
          return;
        }
        if (code !== 0) {
          resolve({
            ok: false,
            error: 'ffprobe exit ' + code + ': ' + stderr.split(/\r?\n/).slice(-3).join(' | '),
          });
          return;
        }
        try {
          resolve({ ok: true, raw: JSON.parse(stdout) });
        } catch (e) {
          resolve({ ok: false, error: 'ffprobe JSON parse failed: ' + e.message });
        }
      });
    });
  } finally {
    slot.release();
  }
}

/* --------------------------------------------------------------------------
 * Internal: translate ffprobe raw JSON into the project's mediaInfo shape.
 *
 * This is the only place that knows about ffprobe field names. Adding a new
 * normalized field means editing one of the three sections below (video,
 * audio[], subs[]) plus the schema comment at the top of this file.
 * ------------------------------------------------------------------------ */
function _normalize(raw, mtimeMs) {
  const streams = (raw && raw.streams) || [];
  const fmt = (raw && raw.format) || {};

  let video = null;
  const audio = [];
  const subs = [];
  let embeddedCover = false;

  for (const s of streams) {
    if (s.disposition && s.disposition.attached_pic) {
      embeddedCover = true;
      // Attached cover images are typically MJPEG streams marked as
      // video by ffprobe. Skip them when picking the playable video
      // stream and when enumerating audio.
      continue;
    }
    if (s.codec_type === 'video' && !video) {
      video = {
        codec: _lower(s.codec_name),
        profile: s.profile || null,
        level: s.level != null ? s.level : null,
        width: typeof s.width === 'number' ? s.width : null,
        height: typeof s.height === 'number' ? s.height : null,
        fps: _parseFps(s.r_frame_rate || s.avg_frame_rate),
        pixFmt: s.pix_fmt || null,
        colorRange: s.color_range || null,
        colorPrimaries: s.color_primaries || null,
        bitrate: _num(s.bit_rate),
      };
    } else if (s.codec_type === 'audio') {
      const codec = _lower(s.codec_name);
      audio.push({
        index: typeof s.index === 'number' ? s.index : null,
        codec,
        profile: s.profile || null,
        channels: typeof s.channels === 'number' ? s.channels : null,
        channelLayout: s.channel_layout || null,
        sampleRate: _num(s.sample_rate),
        bitDepth: _num(s.bits_per_sample) || _num(s.bits_per_raw_sample) || null,
        bitsPerRawSample: _num(s.bits_per_raw_sample),
        bitrate: _num(s.bit_rate),
        language: _tag(s, 'language'),
        title: _tag(s, 'title'),
        default: !!(s.disposition && s.disposition.default),
        lossless: isLosslessCodec(codec),
      });
    } else if (s.codec_type === 'subtitle') {
      subs.push({
        index: typeof s.index === 'number' ? s.index : null,
        codec: _lower(s.codec_name),
        language: _tag(s, 'language'),
        title: _tag(s, 'title'),
      });
    }
  }

  return {
    v: 1,
    probedAt: Date.now(),
    probedMtime: mtimeMs != null ? mtimeMs : null,
    container: fmt.format_name || null,
    durationSec: _num(fmt.duration),
    video,
    audio,
    subs,
    embeddedCover,
    error: null,
  };
}

/**
 * @brief Parse a "num/den" frame-rate string from ffprobe into a float.
 *
 * ffprobe returns r_frame_rate as a fraction so that 24000/1001 (≈23.976)
 * round-trips losslessly. We pick that representation when r_frame_rate is
 * present, otherwise fall back to avg_frame_rate which is the variable-
 * frame-rate average.
 *
 * @param {string|null} expr
 * @returns {number|null}
 */
function _parseFps(expr) {
  if (!expr || typeof expr !== 'string') return null;
  const m = expr.match(/^(-?\d+)\/(\d+)$/);
  if (!m) {
    const n = Number(expr);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
  const num = Number(m[1]);
  const den = Number(m[2]);
  if (!den) return null;
  const v = num / den;
  return Number.isFinite(v) && v > 0 ? v : null;
}

/** Lowercase a codec name string defensively. */
function _lower(s) {
  return s == null ? null : String(s).toLowerCase();
}

/** Coerce ffprobe's string-typed numerics to a real number, or null. */
function _num(v) {
  if (v == null) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Pull a tag with the conventional case fallbacks ffmpeg uses. */
function _tag(s, name) {
  if (!s || !s.tags) return null;
  const v = s.tags[name] || s.tags[name.toUpperCase()] || s.tags[name.charAt(0).toUpperCase() + name.slice(1)];
  return v ? String(v) : null;
}

/* --------------------------------------------------------------------------
 * Public API.
 * ------------------------------------------------------------------------ */

/**
 * @brief Run ffprobe on a file and return the normalized mediaInfo record.
 *
 *        Concurrent calls for the same file are deduplicated to a single
 *        ffprobe spawn. The spawn itself goes through lib/concurrency.js so
 *        it cannot collide with an in-flight transcode.
 *
 *        On ffprobe failure the returned record has `error` set and the
 *        structured fields are null / empty. Callers should persist the
 *        failure record so that the next scan tick does not immediately
 *        retry — broken files are usually permanently broken (corrupt
 *        headers, truncated containers) and re-probing them every 30s
 *        wastes the slot.
 *
 * @param {string} ffprobePath  Absolute path to the ffprobe binary.
 * @param {string} absPath      Absolute path to the media file.
 * @param {Object} [opts]
 * @param {number} [opts.mtimeMs]
 *        Source file mtime. Echoed back in `probedMtime` and used as part of
 *        the dedup key so a probed-then-edited file does not return stale
 *        in-flight results. Defaults to 0 (no mtime tracking).
 * @param {'foreground'|'background'} [opts.priority='background']
 *        Concurrency lane. Default is background; the scan tick and on-
 *        first-play warmup both use background. Foreground is reserved for
 *        hot paths that need the answer to compose a route decision
 *        synchronously.
 * @param {number} [opts.timeoutMs=15000]
 *        Hard wall-clock cap on the spawn. Almost any ffprobe completes in
 *        under 500 ms; the 15 s ceiling exists to bound the worst case
 *        (network-mounted file system stalling, broken mkv triggering a
 *        full container walk).
 * @returns {Promise<Object>} normalized mediaInfo record (see schema at top).
 */
function getMediaInfo(ffprobePath, absPath, opts) {
  const o = opts || {};
  const mtimeMs = typeof o.mtimeMs === 'number' ? o.mtimeMs : 0;
  const key = absPath + ':' + mtimeMs;

  const existing = inFlight.get(key);
  if (existing) return existing;

  const p = (async () => {
    const result = await _runFfprobe(ffprobePath, absPath, o);
    if (!result.ok) {
      return {
        v: 1,
        probedAt: Date.now(),
        probedMtime: mtimeMs || null,
        container: null,
        durationSec: null,
        video: null,
        audio: [],
        subs: [],
        embeddedCover: false,
        error: result.error,
      };
    }
    return _normalize(result.raw, mtimeMs);
  })().finally(() => {
    // Drop the in-flight entry the moment the Promise settles, regardless
    // of success or failure. Keeping a settled entry around would turn this
    // module into a memory cache, which is the caller's responsibility.
    inFlight.delete(key);
  });

  inFlight.set(key, p);
  return p;
}

/**
 * @brief Decide whether a cached mediaInfo record is stale relative to the
 *        live file's mtime.
 *
 *        Pure function — no I/O. Callers stat the file themselves and pass
 *        the current mtime alongside the cached record.
 *
 * @param {Object|null} cached Previously persisted mediaInfo record.
 * @param {number} currentMtimeMs Current file mtime (Date.now-style).
 * @returns {boolean} true if the cache should be invalidated and re-probed.
 */
function isStale(cached, currentMtimeMs) {
  if (!cached || typeof cached !== 'object') return true;
  if (cached.v !== 1) return true;
  if (cached.error) {
    // Re-probe errored entries only when the file's mtime has changed.
    // Otherwise treat as permanently broken so the queue tick moves on.
    return Number(cached.probedMtime) !== Number(currentMtimeMs);
  }
  return Number(cached.probedMtime) !== Number(currentMtimeMs);
}

/**
 * @brief Surface in-flight count for diagnostics.
 *
 *        Admin UI uses this to render "Probing: 0 in flight / queued: N".
 *
 * @returns {{inFlight: number}}
 */
function snapshot() {
  return { inFlight: inFlight.size };
}

module.exports = {
  getMediaInfo,
  isStale,
  isLosslessCodec,
  snapshot,
  // Exported for unit tests that want to exercise the JSON-to-shape mapping
  // without spawning ffprobe. Not part of the stable public API.
  _normalize,
  _parseFps,
};
