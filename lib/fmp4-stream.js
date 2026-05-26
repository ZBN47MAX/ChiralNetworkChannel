// =============================================================================
// lib/fmp4-stream.js
// =============================================================================
//
// Real-time fragmented MP4 video stream with server-side seek-restart and
// disk cache. The v1.9.0 path that eliminates the "transcoding..." wait
// for non-iOS clients consuming multi-channel mkv / EAC3 / DTS sources.
//
// How playback works end-to-end
// ----------------------------
// 1. Client (public/video-mse.js) issues `GET /api/episode/:id/fmp4-stream?
//    file=<rel>&t=<sec>&sid=<sessionId>` with credentials.
// 2. Server checks `FMP4_CACHE_DIR/<sha1>/output.mp4`. If present and
//    complete, sendFile with Range support — done, zero CPU. Otherwise
//    enter live transcode path.
// 3. Acquire the concurrency slot at foreground priority. Any background
//    HLS pre-transcode currently holding the slot is preempted (SIGKILL'd).
// 4. Spawn ffmpeg with the input-seeked invocation:
//        ffmpeg -v warning -ss <t> -fflags +genpts -i <path>
//               -c:v copy
//               [-c:a copy | -c:a aac dplii downmix args]
//               -map 0:v:0? -map 0:<audioIdx>?
//               -avoid_negative_ts make_zero
//               -f mp4
//               -movflags frag_keyframe+empty_moov+default_base_moof+
//                          separate_moof+frag_every_frame
//               -frag_duration <us>
//               pipe:1
// 5. Pipe stdout into the HTTP response. Tee a copy to a partial cache
//    file at `output.mp4.partial`. ffmpeg exiting 0 + the response
//    closing cleanly → atomic rename to `output.mp4`. Any other exit
//    path → unlink the partial.
// 6. Maintain a per-session map of active ffmpeg children. A new
//    request with the same sessionId for the same episode is treated
//    as a seek: SIGKILL the old child (releasing its slot via the
//    onPreempt path), then proceed with the new spawn.
//
// Why per-session and not per-episode
// ----------------------------------
// Two tabs of the same browser can play the same episode. They share the
// session cookie but probably not the same playback position. If we keyed
// the active map by episode only, switching tabs would tear each other's
// streams down. The sessionId comes from `auth.getSession(req)`; the
// client appends it explicitly to keep this layer independent of cookies
// (the same /api/.../fmp4-stream endpoint is also used by the offline
// downloader, which has no cookie).
//
// Why kill-and-restart on seek instead of segmented seek
// ------------------------------------------------------
// Two alternatives we rejected:
//
//   - Stream the entire file once, let the client seek by byte-range
//     against a different cache. Doesn't work — fragmented MP4 doesn't
//     have a deterministic mapping from byte offset to playback time
//     without parsing every moof header first, which moves the work
//     to the client at first-play time AND requires the file to be
//     complete before any seek can land.
//
//   - Pre-segment the stream like HLS does. Defeats the whole point —
//     pre-segmenting requires transcode-to-completion before playback
//     can start, which is the HLS wait this lane was created to avoid.
//
// Kill-and-restart is simple, has bounded resource use (one ffmpeg in
// flight at any time), and seek-latency is bounded by `ffmpeg -ss`
// keyframe-snap which on ARM A55 is typically 100-300 ms.
//
// Cache hit policy
// ----------------
// We cache the FULL output of a from-scratch (t=0) transcode. Seek-spawn
// outputs are not cached because they start partway through and would
// collide with the t=0 cache on filename. The trade-off: second play
// from the beginning is instant (sendFile), but seek inside an as-yet-
// uncached file pays the full transcode-from-keyframe cost every time.
// Acceptable for a single-user device.
//
// Cache lookup uses the same sha1-of-absolute-path key used by the HLS
// path so v1.8.x HLS caches and v1.9.0 fmp4 caches cohabit under
// FMP4_CACHE_DIR without a migration. The presence of `output.mp4`
// in the dir signals "fmp4 cache hit"; `playlist.m3u8 + segNNN.ts +
// ENDLIST` signals "HLS cache hit" (used by iOS Safari fallback).
// =============================================================================

'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');
const concurrency = require('./concurrency');
const ffmpegLib = require('./ffmpeg');

/* --------------------------------------------------------------------------
 * Active session map.
 *
 * Key:   `<sessionId>|<episodeId>|<file>`
 * Value: { child, slot, partialPath, label }
 *
 * Single map per process. Lifetime tied to ffmpeg's 'exit' handler — we
 * delete the entry there, never from outside the spawn function.
 * ------------------------------------------------------------------------ */
const activeSessions = new Map();

function _sessionKey(sessionId, episodeId, file) {
  return String(sessionId || 'anon') + '|' + String(episodeId) + '|' + String(file);
}

/* --------------------------------------------------------------------------
 * Cache key — sha1(absInputPath). Matches the legacy HLS cache key so the
 * two formats share `<cacheRoot>/<sha1>/` directories. Choice of input-
 * path-only (no audio-stream index, no downmix policy) is deliberate:
 * the cache stores the result of a from-scratch, default-audio, default-
 * downmix transcode. Multi-audio or custom-downmix runs always bypass
 * the cache.
 * ------------------------------------------------------------------------ */
function cacheKeyFor(absInputPath) {
  return crypto.createHash('sha1').update(absInputPath, 'utf8').digest('hex');
}

/**
 * @brief Look for a complete fmp4 cache file on disk.
 *
 * @param {string} cacheRoot
 * @param {string} absInputPath
 * @returns {string|null} Absolute path to `output.mp4` if it exists, else null.
 */
function getCachePath(cacheRoot, absInputPath) {
  if (!cacheRoot) return null;
  const key = cacheKeyFor(absInputPath);
  const candidate = path.join(cacheRoot, key, 'output.mp4');
  try {
    if (fs.existsSync(candidate)) return candidate;
  } catch (_e) { /* swallow */ }
  return null;
}

/* --------------------------------------------------------------------------
 * Audio argument builder.
 *
 * Picks between `-c:a copy` (when the source audio is browser-safe and
 * `audioDownmixPolicy === 'preserve'`) and the dplii downmix re-encode.
 *
 * The decision matrix here is intentionally narrower than the video
 * media-route decision: this function is called only on the fmp4-mse /
 * fmp4-streamTo paths, which means the route picker already concluded
 * that pure byte-range native isn't possible. Within that, the question
 * is "can we keep the audio bytes intact, or do we need to re-encode?".
 *
 * Lossless audio in a video container (FLAC track inside mkv) gets
 * `-c:a copy` when fmp4-flac is supported, preserving HiFi quality.
 * EAC3 / DTS / TrueHD always re-encode (browser can't decode them at
 * all).
 *
 * @param {Object|null} mediaInfo
 * @param {number|null} audioStreamIndex
 * @param {Object} opts
 * @param {boolean} opts.canFmp4Flac    Client supports fLaC-in-MP4?
 * @param {string} opts.downmixPolicy   'preserve' | 'dplii' | 'stereo'
 * @returns {string[]} ffmpeg args fragment (audio codec + filter + channels)
 */
function _buildAudioArgs(mediaInfo, audioStreamIndex, opts) {
  const canFmp4Flac = !!(opts && opts.canFmp4Flac);
  const policy = (opts && opts.downmixPolicy) || 'preserve';

  let audioStream = null;
  if (mediaInfo && Array.isArray(mediaInfo.audio) && mediaInfo.audio.length > 0) {
    if (typeof audioStreamIndex === 'number') {
      audioStream = mediaInfo.audio.find((t) => t.index === audioStreamIndex) || mediaInfo.audio[0];
    } else {
      audioStream = mediaInfo.audio[0];
    }
  }
  const codec = audioStream ? String(audioStream.codec || '').toLowerCase() : null;

  // No audio → omit audio args entirely. ffmpeg's -map 0:a:0? makes the
  // mapping optional, so a video-only output is still valid.
  if (!audioStream) return [];

  // Browser-safe lossy codecs we can copy directly when the downmix
  // policy is permissive.
  const COPYABLE_LOSSY = new Set(['aac', 'mp3', 'opus', 'vorbis']);
  // Lossless codecs the browser plays when remuxed into fmp4 — but only
  // when capability has been confirmed.
  const COPYABLE_LOSSLESS = new Set(['flac']);

  if (policy === 'preserve') {
    if (COPYABLE_LOSSY.has(codec)) {
      return ['-c:a', 'copy'];
    }
    if (COPYABLE_LOSSLESS.has(codec) && canFmp4Flac) {
      return ['-c:a', 'copy'];
    }
  }

  // Re-encode path: AAC 192 kbps stereo. dplii downmix matrix selects
  // the right coefficients for multi-channel sources (the v1.9.1 fix).
  // For pure 'stereo' policy callers we drop dplii to avoid the slight
  // phase-rotation it imposes on already-stereo content.
  const out = ['-c:a', 'aac', '-b:a', '192k'];
  if (policy === 'stereo') {
    out.push('-ac', '2');
  } else {
    out.push('-af', 'aresample=matrix_encoding=dplii', '-ac', '2');
  }
  return out;
}

/* --------------------------------------------------------------------------
 * Argv construction.
 *
 * Returns the full ffmpeg argv (no nice prefix; that's added at spawn
 * time on POSIX). The argv is exported for unit tests.
 * ------------------------------------------------------------------------ */
function buildFfmpegArgs(absInputPath, opts) {
  const o = opts || {};
  const startSec = Number(o.startSec) > 0 ? Number(o.startSec) : 0;
  const fragDurationUs = Number(o.fragDurationUs) > 0 ? Number(o.fragDurationUs) : 1000000;
  const audioStreamIndex = (typeof o.audioStreamIndex === 'number') ? o.audioStreamIndex : null;

  const args = ['-v', 'warning'];

  // Input-seek before -i is keyframe-aware and fast (libav decodes the
  // closest keyframe and discards frames until startSec). Output-seek
  // would have to demux + decode every frame from 0 — unacceptable on
  // the A55 for a multi-hour mkv.
  if (startSec > 0) args.push('-ss', String(startSec));

  // +genpts: regenerate PTS from frame numbers. Same fix as the HLS
  // pipeline (v1.9.2) — without it, mkv containers with a non-zero
  // start_time produce first-fragment PTS offsets that confuse MSE
  // and result in silent / no-video states.
  args.push('-fflags', '+genpts', '-i', absInputPath);

  // Video is always copy. A55 cannot real-time libx264 at 1080p, and
  // the fmp4-mse contract specifically promises "video bytes unchanged".
  // Clients that can't decode the source codec fall through to HLS via
  // the video-mse.js error fallback.
  args.push('-c:v', 'copy');

  // Audio args via the per-stream decision helper.
  const audioArgs = _buildAudioArgs(o.mediaInfo, audioStreamIndex, {
    canFmp4Flac: !!o.canFmp4Flac,
    downmixPolicy: o.downmixPolicy || 'preserve',
  });
  for (const a of audioArgs) args.push(a);

  // Stream mapping. Always map first video stream optional, and either
  // an explicit audio stream or the default. Subtitles, data, and
  // attached_pic streams are dropped — they can't live in fmp4 reliably.
  args.push('-map', '0:v:0?');
  if (audioStreamIndex != null) {
    args.push('-map', '0:' + audioStreamIndex + '?');
  } else {
    args.push('-map', '0:a:0?');
  }

  // make_zero pairs with +genpts to clamp any residual negative DTS to
  // 0 instead of dropping the frame. v1.9.2 audio-rendition disable
  // fix; still needed here because mp4box.js applies the same starting-
  // timestamp expectation hls.js does.
  args.push('-avoid_negative_ts', 'make_zero');

  // MSE-friendly fmp4 muxer flags. See lib/ffmpeg.js FMP4_MSE_MOVFLAGS
  // for the rationale of every entry.
  args.push('-f', 'mp4');
  for (const f of ffmpegLib.FMP4_MSE_MOVFLAGS) args.push(f);

  args.push('-frag_duration', String(fragDurationUs));
  args.push('pipe:1');

  return args;
}

/* --------------------------------------------------------------------------
 * Spawn helper.
 *
 * Used by streamFmp4 (the main public function) and indirectly by tests.
 * Returns the child process and a release function for the concurrency
 * slot. Caller is responsible for piping stdout / handling exit.
 * ------------------------------------------------------------------------ */
async function _spawnFfmpeg(args, label) {
  const bin = ffmpegLib.getBin();
  if (!ffmpegLib.isReady() || !bin) {
    throw new Error('ffmpeg not available');
  }

  let child = null;
  const slot = await concurrency.acquire({
    priority: 'foreground',
    label,
    onPreempt: () => {
      if (child) {
        try { child.kill('SIGKILL'); } catch (_e) { /* swallow */ }
      }
    },
  });

  // Foreground audio/video on POSIX gets nice 0 (default). HLS pre-
  // transcode uses 19 in lib/ffmpeg.js. The single-slot enforcement
  // already serializes work; nice differences only matter on the rare
  // contended-CPU moment between slot acquisition and release.
  const isPosix = process.platform !== 'win32';
  try {
    child = isPosix
      ? spawn('nice', ['-n', '0', bin.ffmpeg, ...args], {
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
          detached: true,
        })
      : spawn(bin.ffmpeg, args, {
          stdio: ['ignore', 'pipe', 'pipe'],
          windowsHide: true,
        });
  } catch (err) {
    slot.release();
    throw err;
  }

  return { child, slot };
}

/* --------------------------------------------------------------------------
 * Public: streamFmp4
 *
 * Pipe a live fmp4 transcode into an HTTP response. Maintains the active-
 * session map for seek-restart, optionally writes a partial cache file
 * that is atomically promoted on clean exit.
 * ------------------------------------------------------------------------ */

/**
 * @brief Start (or restart) a real-time fmp4 video stream.
 *
 * @param {Object} ctx
 * @param {string} ctx.absInputPath   Absolute path to the source file.
 * @param {http.ServerResponse} ctx.res   Express response to pipe into.
 * @param {string} ctx.episodeId      Collection id, used for the session key.
 * @param {string} ctx.file           Relative file path within the collection.
 * @param {string} [ctx.sessionId]    Auth session id; falls back to 'anon'.
 * @param {Object} [ctx.mediaInfo]    Probe record from lib/probe-cache.js.
 * @param {number} [ctx.startSec]     Input-seek offset, default 0.
 * @param {number|null} [ctx.audioStreamIndex]
 *        Explicit audio track selection (multi-audio picker integration).
 * @param {boolean} [ctx.canFmp4Flac] Client capability flag.
 * @param {string} [ctx.downmixPolicy]
 *        'preserve' | 'dplii' | 'stereo', default config.AUDIO_DOWNMIX_DEFAULT.
 * @param {string} [ctx.cacheRoot]    config.FMP4_CACHE_DIR, optional.
 * @param {number} [ctx.fragDurationUs] config.FMP4_FRAG_DURATION_US.
 * @returns {Promise<{child, sessionKey}>}
 */
async function streamFmp4(ctx) {
  const key = _sessionKey(ctx.sessionId, ctx.episodeId, ctx.file);

  // Seek-restart: tear down any previous stream from the same session
  // pointing at the same episode/file. Foreground concurrency.acquire
  // would also evict if it caught a background holder, but a same-
  // priority foreground holder (this case) does not preempt itself —
  // we have to do it explicitly.
  const existing = activeSessions.get(key);
  if (existing) {
    try {
      if (existing.child && existing.child.exitCode === null) {
        existing.child.kill('SIGKILL');
      }
    } catch (_e) { /* swallow */ }
    activeSessions.delete(key);
    // Drop any partial cache the previous spawn was writing; it would
    // be incomplete after the kill.
    if (existing.partialPath) {
      try { fs.unlinkSync(existing.partialPath); } catch (_e) { /* swallow */ }
    }
  }

  const args = buildFfmpegArgs(ctx.absInputPath, {
    mediaInfo: ctx.mediaInfo,
    startSec: ctx.startSec,
    audioStreamIndex: ctx.audioStreamIndex,
    canFmp4Flac: ctx.canFmp4Flac,
    downmixPolicy: ctx.downmixPolicy,
    fragDurationUs: ctx.fragDurationUs,
  });

  const label = 'fmp4-stream:' + path.basename(ctx.file);
  const { child, slot } = await _spawnFfmpeg(args, label);

  // Headers. Content-Type stays generic mp4; the X-* headers expose the
  // route decision to the UI's debug panel.
  try {
    ctx.res.setHeader('Content-Type', 'video/mp4');
    ctx.res.setHeader('Cache-Control', 'no-store');
    ctx.res.setHeader('X-Transcode-Mode', 'fmp4-mse');
    ctx.res.setHeader(
      'X-Source-Codec',
      (ctx.mediaInfo && ctx.mediaInfo.video && ctx.mediaInfo.video.codec) || 'unknown'
    );
    if (ctx.mediaInfo && ctx.mediaInfo.durationSec != null) {
      ctx.res.setHeader('X-Source-Duration', String(ctx.mediaInfo.durationSec));
    }
  } catch (_e) { /* response may already be sent */ }

  // Partial cache writer: only for from-scratch (t=0) runs to avoid
  // collisions. The 1 GiB device can spare ~100 MB of disk per cached
  // episode; the size is bounded by content and naturally LRU'd by
  // user usage (admins can clear data/hls-cache to reset).
  let partialPath = null;
  let cacheFinal = null;
  if (ctx.cacheRoot && (!ctx.startSec || ctx.startSec === 0)) {
    const dir = path.join(ctx.cacheRoot, cacheKeyFor(ctx.absInputPath));
    try { fs.mkdirSync(dir, { recursive: true }); } catch (_e) { /* swallow */ }
    partialPath = path.join(dir, 'output.mp4.partial');
    cacheFinal = path.join(dir, 'output.mp4');
    try { fs.unlinkSync(partialPath); } catch (_e) { /* may not exist */ }
  }

  const partialStream = partialPath ? fs.createWriteStream(partialPath) : null;

  // Pipe stdout to BOTH the response and (optionally) the partial cache.
  // Using two .pipe() calls is fine — Node multiplexes the readable.
  child.stdout.pipe(ctx.res);
  if (partialStream) {
    child.stdout.pipe(partialStream);
  }

  // Diagnostic stderr tail. Capture last 4 KB for postmortem on non-zero
  // exit. ffmpeg's "info" output is verbose enough that capturing
  // everything would dwarf node's heap for long-running streams; the
  // tail is enough to surface the actual error line on failures.
  let errTail = '';
  child.stderr.on('data', (d) => {
    errTail += d.toString('utf8');
    if (errTail.length > 4096) errTail = errTail.slice(-4096);
  });

  activeSessions.set(key, { child, slot, partialPath, label });

  child.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[fmp4-stream] spawn error:', err.message);
    try { ctx.res.destroy(err); } catch (_e) { /* swallow */ }
  });

  child.on('exit', (code, signal) => {
    activeSessions.delete(key);
    slot.release();
    if (partialStream) {
      partialStream.end();
    }

    const cleanExit = code === 0 && !signal;
    if (cleanExit && partialPath && cacheFinal) {
      try { fs.renameSync(partialPath, cacheFinal); } catch (_e) { /* swallow */ }
    } else if (partialPath) {
      try { fs.unlinkSync(partialPath); } catch (_e) { /* swallow */ }
    }

    if (!cleanExit && code !== null && signal !== 'SIGKILL') {
      // eslint-disable-next-line no-console
      console.warn(
        '[fmp4-stream] non-clean exit',
        { code, signal, label },
        errTail.split(/\r?\n/).slice(-3).join(' | ')
      );
    }

    try { ctx.res.end(); } catch (_e) { /* swallow */ }
  });

  // Client disconnect (browser closed, seek triggered new request, network
  // failure): the response 'close' fires before our 'exit' handler runs.
  // Kill the child so we don't leak an encoder. activeSessions deletion
  // happens inside the 'exit' handler the kill triggers.
  ctx.res.on('close', () => {
    if (child.exitCode === null) {
      try { child.kill('SIGKILL'); } catch (_e) { /* swallow */ }
    }
  });

  return { child, sessionKey: key };
}

/* --------------------------------------------------------------------------
 * Public: tryCacheHit
 *
 * Synchronous cache lookup that, on hit, sends the cached output via the
 * response's sendFile equivalent. Returns true if the cache hit served
 * the response, false otherwise.
 * ------------------------------------------------------------------------ */

/**
 * @brief Attempt to satisfy the request from the on-disk fmp4 cache.
 *
 *        Cache hits bypass concurrency.acquire entirely — sendFile is
 *        an OS-level copy that doesn't compete with ffmpeg for the RAM
 *        budget. The response is sent with full Range support so clients
 *        can seek freely.
 *
 *        Only used for from-scratch (t=0) requests. Seek requests
 *        bypass the cache and always run a live ffmpeg.
 *
 * @param {Object} ctx
 * @param {string} ctx.absInputPath
 * @param {string} ctx.cacheRoot
 * @param {http.IncomingMessage} ctx.req   Used to forward Range headers.
 * @param {http.ServerResponse} ctx.res
 * @returns {boolean} true if cache hit served, false to continue to live.
 */
function tryCacheHit(ctx) {
  if (!ctx || !ctx.cacheRoot || !ctx.absInputPath) return false;
  const cached = getCachePath(ctx.cacheRoot, ctx.absInputPath);
  if (!cached) return false;
  try {
    ctx.res.setHeader('Content-Type', 'video/mp4');
    ctx.res.setHeader('X-Transcode-Mode', 'fmp4-cache-hit');
    ctx.res.setHeader('Cache-Control', 'public, max-age=3600');
    ctx.res.sendFile(cached, { acceptRanges: true });
    return true;
  } catch (_e) {
    return false;
  }
}

/* --------------------------------------------------------------------------
 * Public: snapshot
 *
 * Surface the active session count for admin diagnostics.
 * ------------------------------------------------------------------------ */
function snapshot() {
  return {
    activeSessions: activeSessions.size,
    keys: Array.from(activeSessions.keys()),
  };
}

module.exports = {
  streamFmp4,
  tryCacheHit,
  getCachePath,
  cacheKeyFor,
  buildFfmpegArgs,
  snapshot,
};
