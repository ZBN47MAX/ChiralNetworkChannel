// =============================================================================
// lib/audio-stream.js
// =============================================================================
//
// Real-time HiFi audio remux pipeline. The audio analogue of
// lib/fmp4-stream.js — when the browser can't decode the source codec
// directly, we transcode lossless-preservingly (FLAC-in-MP4 for ALAC /
// APE / WavPack / TTA / TAK / WMA Lossless / AIFF, soxr 24-bit/96 kHz
// FLAC for DSD) and stream the result into the response without an
// intermediate temp file.
//
// What this module deliberately does NOT do
// -----------------------------------------
// - **No byte-range pass-through.** Sources the browser plays natively
//   (mp3, m4a-aac, vorbis, opus, wav, and FLAC on Chrome/Firefox/Edge)
//   are served by the legacy /audio-files express.static handler at
//   the server.js routing layer. The route picker in lib/media-route.js
//   returns `route: 'byte-range'` for those; the server's /audio-stream
//   endpoint detects that and issues an internal redirect to /audio-
//   files/<id>/<file> rather than invoking this module.
//
// - **No on-disk cache.** Audio remux is cheap enough (FLAC encode at
//   ~10x realtime on the A55, no video to copy) that re-running per
//   playback isn't a budget problem. Persistent cache would also
//   double the disk usage for a lossless library, which is the
//   tradeoff most HiFi users *don't* want to make. If a workload
//   emerges where cache is needed it can be bolted on later using
//   the same partial-rename pattern as fmp4-stream.js.
//
// - **No seek-restart state machine.** Audio sessions are short (~3-5
//   minutes typical), seeking inside a track is rare, and the player
//   typically only seeks within already-buffered content. A new
//   request with ?t=<sec> simply spawns a fresh ffmpeg; the prior
//   stream's response 'close' kills the previous child automatically
//   via the existing res.on('close') handler.
//
// Lossless preservation rule
// --------------------------
// Lossless sources NEVER go to a lossy codec on this path. The route
// picker returns one of:
//
//   'fmp4-flac'    → ffmpeg `-c:a flac` (or `-c:a copy` for source FLAC)
//   'dsd-to-flac'  → soxr-precision PCM resample then FLAC encode
//   'fmp4-opus'    → ONLY when the client cannot decode FLAC-in-MP4
//
// The 'fmp4-opus' fallback is the only place a lossless source gets
// reduced to a lossy codec, and the server sets an `X-Audio-Degraded:
// opus-fallback` response header so the UI can surface a red badge to
// the user. The default policy (config.AUDIO_DOWNMIX_DEFAULT) gates
// whether multi-channel sources downmix or preserve channels.
// =============================================================================

'use strict';

const path = require('path');
const { spawn } = require('child_process');
const concurrency = require('./concurrency');
const ffmpegLib = require('./ffmpeg');

/* --------------------------------------------------------------------------
 * Audio-only fmp4 muxer flags.
 *
 * Audio fmp4 doesn't need the `separate_moof + frag_every_frame` set the
 * video path uses because there's no MSE controller waiting to parse
 * fragment boundaries — the <audio> element accepts a vanilla fragmented
 * MP4 stream as long as moov is up front. Keeping the flag set smaller
 * also avoids fragment-header overhead on a short-duration audio stream.
 * ------------------------------------------------------------------------ */
const AUDIO_FMP4_MOVFLAGS = Object.freeze([
  '-movflags', 'frag_keyframe+empty_moov+default_base_moof+faststart',
]);

/* --------------------------------------------------------------------------
 * Per-route ffmpeg argv builders.
 *
 * Each returns the argv suffix that goes after `-i <input>`. Header /
 * boilerplate is added by spawnForRoute below.
 * ------------------------------------------------------------------------ */

/**
 * @brief Build the ffmpeg args for the fmp4-fLaC route.
 *
 *        Two sub-cases:
 *
 *          source FLAC      → -c:a copy        (lossless byte-perfect re-mux)
 *          source non-FLAC  → -c:a flac
 *                             -compression_level 5  (level 5 ≈ 1.5× realtime
 *                             on A55, near-optimal compression)
 *
 *        Channel count: 'preserve' keeps the source layout, 'dplii' /
 *        'stereo' force 2-channel output with or without the dplii
 *        matrix. Lossless paths default to 'preserve' regardless of
 *        the global setting because the whole point of the lane is
 *        HiFi fidelity.
 *
 * @param {string} sourceCodec  Lowercase ffprobe codec name.
 * @param {string} downmixPolicy 'preserve' | 'dplii' | 'stereo'.
 * @returns {string[]} argv fragment
 */
function _argsFlacFmp4(sourceCodec, downmixPolicy) {
  const args = [];
  if (sourceCodec === 'flac') {
    args.push('-c:a', 'copy');
  } else {
    args.push('-c:a', 'flac', '-compression_level', '5');
  }
  // Channel handling. 'preserve' is the default for lossless paths so
  // a 5.1 FLAC ends up as a 6-channel fLaC-in-MP4. Receivers / 5.1
  // headphone systems then play the full layout.
  if (downmixPolicy === 'dplii') {
    args.push('-af', 'aresample=matrix_encoding=dplii', '-ac', '2');
  } else if (downmixPolicy === 'stereo') {
    args.push('-ac', '2');
  }
  // 'preserve' → no -ac, no -af; ffmpeg keeps the source layout intact.
  args.push('-f', 'mp4');
  for (const f of AUDIO_FMP4_MOVFLAGS) args.push(f);
  args.push('pipe:1');
  return args;
}

/**
 * @brief Build the ffmpeg args for the DSD-to-FLAC route.
 *
 *        Uses libsoxr (built into the bundled ffmpeg) at precision 28
 *        — the highest precision available, which costs CPU but
 *        eliminates audible aliasing in the 20 Hz - 20 kHz band. The
 *        target sample rate is 96 kHz which preserves DSD64's frequency
 *        response (DSD64 noise floor rises above 28 kHz, well outside
 *        anything 96 kHz PCM can represent; 88.2 kHz would be closer
 *        to native ratio but interoperates poorly with audio gear).
 *
 *        s32 sample format guarantees 24-bit precision after FLAC
 *        encoding (FLAC truncates s32 down to bitsPerSample, defaulting
 *        to 24 when source bit depth is unknown).
 *
 *        Realistic A55 throughput: ~1.5× realtime for stereo DSD64 with
 *        precision=28. Two-channel only — DSD multi-channel SACDs are
 *        rare and beyond v1.9.0 scope.
 *
 * @returns {string[]} argv fragment
 */
function _argsDsdToFlac() {
  return [
    '-af', 'aresample=resampler=soxr:precision=28',
    '-sample_fmt', 's32',
    '-ar', '96000',
    '-c:a', 'flac',
    '-compression_level', '5',
    '-f', 'mp4',
    ...AUDIO_FMP4_MOVFLAGS,
    'pipe:1',
  ];
}

/**
 * @brief Build the ffmpeg args for the Opus fallback route.
 *
 *        Lossy. ONLY reachable when the client reports it cannot decode
 *        fLaC-in-MP4 (capability flag fmp4flac === false). 510 kbps is
 *        Opus's spec maximum bitrate; at that ceiling Opus is
 *        psychoacoustically transparent for 95%+ of listeners on stereo
 *        content, which is the best we can do without lossless.
 *
 *        Output container: WebM. Opus-in-WebM is universally supported
 *        (Chrome / Firefox / Edge / Safari 17+). Opus-in-MP4 is spec'd
 *        but older browsers vary, and the Opus fallback exists
 *        specifically for clients that don't grok fmp4 well, so we
 *        avoid the MP4 wrapper here.
 *
 * @param {string} downmixPolicy
 * @returns {string[]} argv fragment
 */
function _argsOpusFallback(downmixPolicy) {
  const args = ['-c:a', 'libopus', '-b:a', '510k'];
  if (downmixPolicy === 'dplii') {
    args.push('-af', 'aresample=matrix_encoding=dplii', '-ac', '2');
  } else if (downmixPolicy === 'stereo') {
    args.push('-ac', '2');
  }
  args.push('-f', 'webm', 'pipe:1');
  return args;
}

/* --------------------------------------------------------------------------
 * Spawn glue.
 *
 * Acquires the concurrency slot (foreground priority — user is waiting on
 * the response), runs ffmpeg, pipes stdout to the response, and tears down
 * on client disconnect.
 * ------------------------------------------------------------------------ */
async function _spawnForRoute(ctx) {
  const bin = ffmpegLib.getBin();
  if (!ffmpegLib.isReady() || !bin) {
    throw new Error('ffmpeg not available');
  }

  // -i comes after a no-seek prefix; audio streaming responds to ?t=<sec>
  // by spawning a fresh process (no per-session restart map — see header).
  const prefix = ['-v', 'warning'];
  if (ctx.startSec > 0) prefix.push('-ss', String(ctx.startSec));
  prefix.push('-i', ctx.absInputPath);

  let suffix;
  switch (ctx.routeName) {
    case 'fmp4-flac':
      suffix = _argsFlacFmp4(ctx.sourceCodec, ctx.downmixPolicy);
      break;
    case 'dsd-to-flac':
      suffix = _argsDsdToFlac();
      break;
    case 'fmp4-opus':
      suffix = _argsOpusFallback(ctx.downmixPolicy);
      break;
    default:
      throw new Error('unsupported audio route: ' + ctx.routeName);
  }

  const args = prefix.concat(suffix);
  const label = 'audio-stream:' + ctx.routeName + ':' + path.basename(ctx.file || ctx.absInputPath);

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
 * Public: streamAudio
 *
 * Entry point for /audio-stream HTTP handler. Returns once the ffmpeg
 * child is spawned and stdout is piped to res; lifecycle (exit, kill on
 * client close) is handled internally.
 * ------------------------------------------------------------------------ */

/**
 * @brief Start a real-time HiFi audio transcode and pipe it to res.
 *
 *        Sets Content-Type, Cache-Control, and route-specific headers
 *        (X-Audio-Route, X-Audio-Degraded when applicable). Caller is
 *        responsible for handling the byte-range pass-through case
 *        BEFORE calling this — streamAudio always runs an ffmpeg.
 *
 * @param {Object} ctx
 * @param {string} ctx.absInputPath
 * @param {http.ServerResponse} ctx.res
 * @param {string} ctx.file
 * @param {string} ctx.routeName     'fmp4-flac' | 'dsd-to-flac' | 'fmp4-opus'
 * @param {string} ctx.sourceCodec   Lowercase ffprobe codec name.
 * @param {string} ctx.downmixPolicy 'preserve' | 'dplii' | 'stereo'
 * @param {number} [ctx.startSec=0]
 * @returns {Promise<{child}>}
 */
async function streamAudio(ctx) {
  const startSec = Math.max(0, Number(ctx.startSec) || 0);
  const spawnCtx = Object.assign({}, ctx, { startSec });
  const { child, slot } = await _spawnForRoute(spawnCtx);

  // Response headers.
  try {
    if (ctx.routeName === 'fmp4-opus') {
      ctx.res.setHeader('Content-Type', 'audio/webm');
      ctx.res.setHeader('X-Audio-Degraded', 'opus-fallback');
    } else {
      ctx.res.setHeader('Content-Type', 'audio/mp4');
    }
    ctx.res.setHeader('Cache-Control', 'no-store');
    ctx.res.setHeader('X-Audio-Route', ctx.routeName);
    if (ctx.sourceCodec) {
      ctx.res.setHeader('X-Source-Codec', ctx.sourceCodec);
    }
  } catch (_e) { /* headers may already be sent */ }

  child.stdout.pipe(ctx.res);

  let errTail = '';
  child.stderr.on('data', (d) => {
    errTail += d.toString('utf8');
    if (errTail.length > 2048) errTail = errTail.slice(-2048);
  });

  child.on('error', (err) => {
    // eslint-disable-next-line no-console
    console.error('[audio-stream] spawn error:', err.message);
    try { ctx.res.destroy(err); } catch (_e) { /* swallow */ }
  });

  child.on('exit', (code, signal) => {
    slot.release();
    if (code !== 0 && code !== null && signal !== 'SIGKILL') {
      // eslint-disable-next-line no-console
      console.warn(
        '[audio-stream] non-clean exit',
        { code, signal, route: ctx.routeName, file: ctx.file },
        errTail.split(/\r?\n/).slice(-3).join(' | ')
      );
    }
    try { ctx.res.end(); } catch (_e) { /* swallow */ }
  });

  ctx.res.on('close', () => {
    if (child.exitCode === null) {
      try { child.kill('SIGKILL'); } catch (_e) { /* swallow */ }
    }
  });

  return { child };
}

module.exports = {
  streamAudio,
  // Exported for tests / route diagnostics — produce the argv array
  // without spawning.
  _argsFlacFmp4,
  _argsDsdToFlac,
  _argsOpusFallback,
};
