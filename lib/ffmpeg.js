// ffmpeg / ffprobe integration for the on-the-fly video transcode layer.
//
// Purpose
// -------
// Browsers can only natively decode a tiny slice of container formats
// (mp4/webm/m4v). The library accepts a much larger set (avi, wmv, flv,
// mkv, rmvb, ts, ...). This module provides a streaming transcode
// pipeline that turns any of those into a fragmented MP4 stream the
// browser can play via a plain <video src=...> tag.
//
// Strategy
// --------
// 1. Locate a usable ffmpeg + ffprobe binary at boot (bundled preferred,
//    env override allowed, bare PATH as last-resort fallback).
// 2. On a stream request, ffprobe the input first to read the codecs.
// 3. If both the video codec and the audio codec are things the browser
//    natively understands inside an MP4 container (H.264/HEVC + AAC/MP3),
//    use `-c copy` to just remux into fragmented MP4 — no re-encoding.
//    This is cheap enough for the DS124 to do in real time.
// 4. Otherwise fall back to software re-encoding with libx264 + AAC.
//    This will be slow on ARM64 but it's the only way to play those
//    files without a native decoder.
// 5. Pipe ffmpeg stdout directly into the HTTP response. The output is
//    fragmented MP4 (moof-based), so the browser can start playing
//    before the full file is produced.
// 6. Support seeking via an `?t=<seconds>` query parameter — the client
//    re-requests the stream from that offset, we restart ffmpeg with
//    `-ss <t> -i input` (input-seek, fast because libav seeks to the
//    nearest keyframe before decoding).
//
// Hard limits
// -----------
// - Streamed responses do NOT support HTTP Range requests. Seeking is
//   handled by re-requesting the stream with ?t=, not by byte-range.
// - Re-encoding on the DS124 (RTD1619B ARM64, 4x A55) will likely fall
//   behind real-time for 1080p content. If that becomes an issue the
//   first knob to turn is `-vf scale=-2:720` in encodeArgs below. Not
//   doing that by default — prefer "slow but full quality" over
//   "fast and blurry" until a specific file demonstrates the need.

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let BIN = null;        // { ffmpeg, ffprobe } resolved paths
let READY = false;     // did ffmpeg -version actually run?
let VERSION_LINE = ''; // first line of `ffmpeg -version` output, for logging

/* --------------------------------------------------------------------
 * Binary resolution
 * ------------------------------------------------------------------ */

// Map node's process.arch to the subdir suffix used under bin/ffmpeg/.
// We only actually ship win-x64 and linux-arm64 today, but the map is
// written in full so nothing else has to change when a new target is
// added later.
function platformDir() {
  const p = process.platform;
  const a = process.arch;
  if (p === 'win32' && a === 'x64') return 'win-x64';
  if (p === 'linux' && a === 'arm64') return 'linux-arm64';
  if (p === 'linux' && a === 'x64') return 'linux-x64';
  if (p === 'darwin' && a === 'arm64') return 'darwin-arm64';
  if (p === 'darwin' && a === 'x64') return 'darwin-x64';
  return null;
}

function exeName(base) {
  return process.platform === 'win32' ? `${base}.exe` : base;
}

// Try to locate ffmpeg + ffprobe binaries. Does NOT spawn them here —
// init() does the actual liveness check. This just computes paths.
function resolveBin(config) {
  const envFfmpeg = config.FFMPEG_PATH;
  const envFfprobe = config.FFPROBE_PATH;

  // Env override wins unconditionally — if it's set we trust it, even
  // if the file doesn't exist. The init() liveness check will catch
  // that and log a clear error.
  if (envFfmpeg && envFfprobe) {
    return { ffmpeg: envFfmpeg, ffprobe: envFfprobe, source: 'env' };
  }

  // Bundled binary under bin/ffmpeg/<plat>-<arch>/.
  const dir = platformDir();
  if (dir) {
    const bundledFfmpeg = path.join(config.FFMPEG_BIN_ROOT, dir, exeName('ffmpeg'));
    const bundledFfprobe = path.join(config.FFMPEG_BIN_ROOT, dir, exeName('ffprobe'));
    if (fs.existsSync(bundledFfmpeg) && fs.existsSync(bundledFfprobe)) {
      return {
        ffmpeg: envFfmpeg || bundledFfmpeg,
        ffprobe: envFfprobe || bundledFfprobe,
        source: 'bundled',
      };
    }
  }

  // Last-resort fallback: bare command name, let the OS find it on PATH.
  // The init() probe will tell us whether this actually works.
  return {
    ffmpeg: envFfmpeg || 'ffmpeg',
    ffprobe: envFfprobe || 'ffprobe',
    source: 'path',
  };
}

/* --------------------------------------------------------------------
 * Boot probe — runs `ffmpeg -version` once to confirm the binary works
 * ------------------------------------------------------------------ */

function init(config) {
  return new Promise((resolve) => {
    BIN = resolveBin(config);
    const child = spawn(BIN.ffmpeg, ['-version'], {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let buf = '';
    child.stdout.on('data', (d) => { buf += d.toString('utf8'); });
    child.stderr.on('data', (d) => { buf += d.toString('utf8'); });

    child.on('error', (err) => {
      READY = false;
      VERSION_LINE = err.message;
      resolve({ ok: false, reason: err.message, source: BIN.source });
    });
    child.on('exit', (code) => {
      if (code === 0) {
        READY = true;
        VERSION_LINE = (buf.split(/\r?\n/)[0] || '').trim();
        resolve({ ok: true, version: VERSION_LINE, source: BIN.source });
      } else {
        READY = false;
        VERSION_LINE = `exit ${code}: ${buf.slice(0, 200)}`;
        resolve({ ok: false, reason: VERSION_LINE, source: BIN.source });
      }
    });
  });
}

function isReady() { return READY; }
function status() {
  return {
    ready: READY,
    version: VERSION_LINE,
    ffmpeg: BIN && BIN.ffmpeg,
    ffprobe: BIN && BIN.ffprobe,
    source: BIN && BIN.source,
  };
}

/* --------------------------------------------------------------------
 * ffprobe — read codec info from the input file
 * ------------------------------------------------------------------ */

// Codecs the browser can play back when they're wrapped in an MP4
// container. Keeping both lists tight on purpose — if a codec isn't
// here the remux path won't be attempted and we'll re-encode instead,
// which is the safer default.
//
// v1.9.0 update: lists expanded to include video codecs vp9 + av1 and
// audio codecs opus + vorbis + flac. All three new audio codecs are
// playable in fragmented MP4 by every desktop browser at supported
// version levels (Chrome >= 73 / Firefox >= 76 / Safari >= 17 for
// fLaC-in-MP4; Opus-in-MP4 likewise universal). Worst-case failure
// mode for unsupported clients: the <video> element fires `error`
// and the video-mse.js controller falls back to fmp4-fLaC remux or
// HLS — same defensive ladder we use for HEVC and AV1.
const REMUXABLE_VIDEO_CODECS = new Set(['h264', 'hevc', 'h265', 'vp9', 'av1']);
const REMUXABLE_AUDIO_CODECS = new Set(['aac', 'mp3', 'opus', 'vorbis', 'flac']);

function probe(filePath) {
  return new Promise((resolve, reject) => {
    if (!BIN) return reject(new Error('ffmpeg not initialized'));
    const args = [
      '-v', 'error',
      '-print_format', 'json',
      '-show_streams',
      '-show_format',
      filePath,
    ];
    const child = spawn(BIN.ffprobe, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    let out = '';
    let err = '';
    child.stdout.on('data', (d) => { out += d.toString('utf8'); });
    child.stderr.on('data', (d) => { err += d.toString('utf8'); });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code !== 0) return reject(new Error(`ffprobe exit ${code}: ${err.slice(0, 300)}`));
      try {
        const parsed = JSON.parse(out);
        const video = (parsed.streams || []).find((s) => s.codec_type === 'video');
        const audio = (parsed.streams || []).find((s) => s.codec_type === 'audio');
        resolve({
          videoCodec: video ? video.codec_name : null,
          audioCodec: audio ? audio.codec_name : null,
          duration: parsed.format && Number(parsed.format.duration) || null,
          raw: parsed,
        });
      } catch (e) {
        reject(new Error('ffprobe parse failed: ' + e.message));
      }
    });
  });
}

/* --------------------------------------------------------------------
 * Streaming pipeline
 * ------------------------------------------------------------------ */

// Shared tail flags that turn any ffmpeg invocation into a fragmented
// MP4 stream written to stdout. `frag_keyframe` cuts a new fragment on
// every keyframe, `empty_moov` writes an empty moov box up front so
// the <video> element can start playing before the whole file is
// produced, and `default_base_moof` makes the fragments standalone.
//
// Used by streamTo() for the legacy /media-stream path. The fmp4-mse
// pipeline (lib/fmp4-stream.js, v1.9.0+) uses FMP4_MSE_MOVFLAGS below
// instead — that set has the additional `separate_moof` flag needed by
// mp4box.js to demux fragments independently.
const FRAG_MP4_TAIL = [
  '-movflags', 'frag_keyframe+empty_moov+default_base_moof+faststart',
  '-f', 'mp4',
  'pipe:1',
];

/**
 * MSE-friendly fragmented MP4 muxer flags (v1.9.0+).
 *
 * Differences vs FRAG_MP4_TAIL above:
 *
 *   separate_moof
 *     Each fragment has its own moof box rather than sharing the
 *     trailing one. Required by MSE: SourceBuffer.appendBuffer needs
 *     to ingest a fragment as an atomic unit, not a fragment-without-
 *     its-header that depends on a tail moof never to arrive (mp4box.js
 *     simply rejects the latter shape).
 *
 *   default_base_moof
 *     Already in FRAG_MP4_TAIL but worth restating: makes the moof's
 *     base offset independent of the parent moov, which mp4box.js
 *     relies on when it stitches fragments together for the live
 *     decoder.
 *
 *   empty_moov
 *     Same role as in FRAG_MP4_TAIL — write a zero-data moov box up
 *     front so the client can start parsing without waiting for the
 *     trailing moov a non-fragmented mp4 would carry.
 *
 *   frag_every_frame
 *     Each frame becomes its own fragment. Combined with -frag_duration
 *     this gives sub-second fragment boundaries which keeps the MSE
 *     buffer pump tight on the client side. The cost is more fragment-
 *     header bytes (each moof carries ~100 B of structural overhead);
 *     for a 1 Mbps stream that's ~3 % overhead, well worth the
 *     latency improvement on seek.
 *
 * Caller adds `-frag_duration <us>` (config.FMP4_FRAG_DURATION_US, default
 * 1 000 000 = 1 second) between the muxer flags and `pipe:1`.
 *
 * Exported as a CONSTANT array so callers do `[...FMP4_MSE_MOVFLAGS]` to
 * avoid mutating the shared reference when they append the duration flag
 * and the final pipe target.
 */
const FMP4_MSE_MOVFLAGS = Object.freeze([
  '-movflags', 'frag_keyframe+empty_moov+default_base_moof+separate_moof+frag_every_frame',
]);

/**
 * @brief Build ffmpeg args for streaming a media file with per-stream
 *        copy/encode decisions.
 *
 *        Replaces the older remuxArgs / encodeArgs pair (1.7.37). The
 *        old encodeArgs re-encoded video unconditionally whenever
 *        audio wasn't AAC/MP3, which on Invincible.S01 (H264 + EAC3)
 *        meant ffmpeg ran libx264 over already-fine H264 — wasted
 *        CPU AND introduced AV-sync drift because timestamp rebase
 *        on the video re-encode didn't always line up with the
 *        independently re-encoded AAC. New behavior: copy whichever
 *        stream is browser-safe, encode only the unsafe one.
 *
 * @param filePath   Absolute path to source media.
 * @param startSec   Input-seek offset (ffmpeg `-ss` before `-i`,
 *                   keyframe-aligned fast seek).
 * @param videoCopy  If true, video stream is `-c:v copy`; otherwise
 *                   re-encoded with libx264 veryfast / yuv420p.
 * @param audioCopy  If true, audio stream is `-c:a copy`; otherwise
 *                   re-encoded with aac / 160k / 2-channel downmix.
 * @returns String[] suitable for spawn(BIN.ffmpeg, args, ...).
 */
function mixedArgs(filePath, startSec, videoCopy, audioCopy, audioStreamIndex) {
  const args = [];
  if (startSec > 0) args.push('-ss', String(startSec));
  args.push('-i', filePath);

  if (videoCopy) {
    args.push('-c:v', 'copy');
  } else {
    // veryfast is the best speed/size trade-off for real-time
    // transcode on constrained hardware. ultrafast on ARM64 is
    // tempting but the bitrate explodes and network IO becomes
    // the next bottleneck.
    args.push('-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23');
    args.push('-pix_fmt', 'yuv420p');
  }

  if (audioCopy) {
    args.push('-c:a', 'copy');
  } else {
    // Downmix to stereo to maximize browser compatibility — 5.1
    // AAC plays fine in Chrome but Firefox falls back to first two
    // channels anyway, so we save bandwidth + sidestep the issue.
    //
    // The aresample=matrix_encoding=dplii prefix is the same fix
    // applied to the HLS pipeline in v1.9.1 — without it, EAC3
    // 7.1 / 5.1+2 layouts hit libavcodec's near-zero auto-downmix
    // matrix and the encoder produces a valid-but-silent AAC
    // stream. dplii is a no-op pass-through for stereo / mono
    // sources, so applying it unconditionally is safe.
    args.push('-c:a', 'aac', '-b:a', '160k');
    args.push('-af', 'aresample=matrix_encoding=dplii');
    args.push('-ac', '2');
  }

  // Drop subtitle + data streams — they can't live in a fragmented MP4
  // reliably and mkv often has them. Video + audio only.
  //
  // v1.11.0+ — audioStreamIndex picks a specific audio track for the
  // multi-audio picker. The legacy `0:a:0?` default keeps the
  // pre-1.11.0 behavior when the param is omitted / invalid.
  args.push('-map', '0:v:0?');
  if (typeof audioStreamIndex === 'number'
    && Number.isInteger(audioStreamIndex)
    && audioStreamIndex >= 0) {
    args.push('-map', '0:' + audioStreamIndex + '?');
  } else {
    args.push('-map', '0:a:0?');
  }
  return args.concat(FRAG_MP4_TAIL);
}

// Pipe a streaming transcode into `res`. Handles its own error paths
// and lifecycle. Caller only needs to set headers BEFORE calling this
// (we set Content-Type ourselves but anything else — CORS, auth
// cookies already handled upstream — is the caller's business).
//
// Returns the spawned child process so the caller can attach extra
// listeners (e.g. req.on('close') to kill it if the client aborts).
async function streamTo(filePath, res, { startSec = 0, audioStreamIndex = null } = {}) {
  if (!READY || !BIN) {
    res.status(503).type('text/plain').send('ffmpeg not available');
    return null;
  }

  // Per-stream copy/encode decision (1.7.37). The previous all-or-
  // nothing remux/encode coupling forced ffmpeg to re-encode video
  // whenever audio wasn't AAC/MP3, which (a) wasted CPU on already-
  // browser-friendly H264 video and (b) drifted A/V sync on long
  // mkvs (Invincible S01 was the canonical case). Probe both
  // streams independently and copy whichever's already browser-safe.
  //
  // v1.11.0+ — when the caller specified an explicit
  // audioStreamIndex (multi-audio picker), force audio re-encode
  // because the legacy first-track probe doesn't tell us anything
  // useful about the chosen non-default track. Worst case we waste
  // a few CPU cycles re-encoding an already-AAC stream; that's
  // cheaper than serving silent video because the track turned out
  // to be DTS.
  let videoCopy = false;
  let audioCopy = false;
  try {
    const info = await probe(filePath);
    if (info.videoCodec && REMUXABLE_VIDEO_CODECS.has(info.videoCodec)) {
      videoCopy = true;
    }
    if (audioStreamIndex == null
      && info.audioCodec
      && REMUXABLE_AUDIO_CODECS.has(info.audioCodec)) {
      audioCopy = true;
    }
  } catch (e) {
    // Probe failure leaves both flags false → full re-encode, which
    // is strictly more permissive than copy. Logged so operators can
    // see which files force the slow path.
    console.warn('ffmpeg probe failed, falling back to full re-encode:', filePath, e.message);
  }

  const args = mixedArgs(filePath, startSec, videoCopy, audioCopy, audioStreamIndex);
  const modeStr = videoCopy && audioCopy ? 'remux'
    : videoCopy ? 'audio-encode'
    : audioCopy ? 'video-encode'
    : 'encode';

  res.setHeader('Content-Type', 'video/mp4');
  res.setHeader('Cache-Control', 'no-store');
  // NOT setting Accept-Ranges — this response is not seekable by byte
  // range. Seek is handled by the client re-requesting with ?t=.
  res.setHeader('X-Transcode-Mode', modeStr);

  const child = spawn(BIN.ffmpeg, args, {
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  // Surface ffmpeg's stderr in the server log so we can see what went
  // wrong when a stream fails mid-playback. Throttle by only keeping
  // the tail — ffmpeg is very chatty during normal operation.
  let errTail = '';
  child.stderr.on('data', (d) => {
    errTail += d.toString('utf8');
    if (errTail.length > 4096) errTail = errTail.slice(-4096);
  });

  child.stdout.pipe(res);

  child.on('error', (err) => {
    console.error('ffmpeg spawn error:', err.message);
    try { res.destroy(err); } catch (e) {}
  });

  child.on('exit', (code, signal) => {
    if (code !== 0 && code !== null) {
      // Non-zero exit and we haven't been signalled (client abort).
      // Most likely a corrupt input or an unsupported stream type.
      console.warn(
        `ffmpeg exit ${code} (${modeStr}) for ${filePath}:`,
        errTail.split(/\r?\n/).slice(-3).join(' | ')
      );
    }
    // If the response is still open, end it — either we finished
    // cleanly or ffmpeg died and the browser will notice via short
    // stream.
    try { res.end(); } catch (e) {}
  });

  // If the client disconnects mid-stream (user navigated away, seeked,
  // etc.) kill ffmpeg immediately — otherwise we'd leak an encoder.
  res.on('close', () => {
    if (child.exitCode === null) {
      try { child.kill('SIGKILL'); } catch (e) {}
    }
  });

  return child;
}

/* --------------------------------------------------------------------
 * captureFrame — extract a single frame as JPEG buffer
 * ------------------------------------------------------------------ */

function captureFrame(filePath, timeSec) {
  return new Promise((resolve, reject) => {
    if (!BIN || !READY) return reject(new Error('ffmpeg not available'));
    const args = [
      '-ss', String(Number(timeSec) || 0),
      '-i', filePath,
      '-vframes', '1',
      '-f', 'image2',
      '-vcodec', 'mjpeg',
      '-q:v', '2',
      'pipe:1',
    ];
    const child = spawn(BIN.ffmpeg, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const chunks = [];
    child.stdout.on('data', (d) => chunks.push(d));
    let stderr = '';
    child.stderr.on('data', (d) => { stderr += d.toString('utf8').slice(0, 2000); });
    child.on('error', (err) => reject(err));
    child.on('exit', (code) => {
      if (code === 0 && chunks.length > 0) {
        resolve(Buffer.concat(chunks));
      } else {
        reject(new Error('ffmpeg frame capture failed (exit ' + code + '): ' + stderr.slice(0, 200)));
      }
    });
  });
}

// Small thumbnail variant for preview grids (320px wide, lower quality)
function captureThumb(filePath, timeSec) {
  return new Promise((resolve, reject) => {
    if (!BIN || !READY) return reject(new Error('ffmpeg not available'));
    const args = [
      '-ss', String(Number(timeSec) || 0),
      '-i', filePath,
      '-vframes', '1',
      '-vf', 'scale=320:-2',
      '-f', 'image2',
      '-vcodec', 'mjpeg',
      '-q:v', '6',
      'pipe:1',
    ];
    const child = spawn(BIN.ffmpeg, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });
    const chunks = [];
    child.stdout.on('data', (d) => chunks.push(d));
    child.on('error', (err) => reject(err));
    child.on('exit', (code) => {
      if (code === 0 && chunks.length > 0) resolve(Buffer.concat(chunks));
      else reject(new Error('thumb capture failed'));
    });
  });
}

// Extract evenly-spaced preview thumbnails from a video
async function previewFrames(filePath, count) {
  const info = await probe(filePath);
  const dur = info.duration;
  if (!dur || dur <= 0) return [];
  const n = Math.min(count || 12, 24);
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = (dur / (n + 1)) * (i + 1);
    try {
      const buf = await captureThumb(filePath, t);
      frames.push({ time: Math.round(t * 10) / 10, data: 'data:image/jpeg;base64,' + buf.toString('base64') });
    } catch (_e) { /* skip failed frames */ }
  }
  return frames;
}

/* --------------------------------------------------------------------
 * Embedded subtitle support (mkv / mp4 internal subtitle streams).
 *
 * Browsers (notably Chrome/Edge) don't expose mkv-internal SRT/ASS
 * tracks via player.textTracks even when the container parses fine
 * for video + audio. To unblock users with Amazon-rip mkvs that ship
 * 10+ language SRT inside the container, we let the client request
 * an embedded stream by index, ffmpeg-extract it on the fly, and
 * cache the resulting WebVTT to disk so subsequent fetches are O(1).
 *
 * We deliberately keep this synchronous-extract-on-demand: pre-extract-
 * all-streams-at-scan-time was tempting but blows up ffmpeg invocations
 * (collection of 8 mkvs × 11 streams = 88 spawns) for tracks the user
 * usually never reads. Pay the ~200ms extract cost once, on first
 * click, and cache it.
 * ------------------------------------------------------------------ */

/**
 * @brief List subtitle streams embedded in a container (mkv/mp4/...).
 *
 *        Reads the same ffprobe JSON output as probe() but filters for
 *        codec_type='subtitle' and projects each entry to the minimal
 *        shape the client needs: {streamIndex, codec, language, title}.
 *        Bitmap subtitles (PGS / VobSub / DVB) are excluded — those
 *        can't be remuxed to WebVTT (they're images, not text). PGS
 *        is handled separately via libpgs from external .sup files.
 *
 * @param filePath Absolute path to a video container.
 * @returns Promise<Array<{streamIndex, codec, language, title}>>.
 *          Empty array on probe failure or zero subtitle streams.
 */
function listEmbeddedSubtitles(filePath) {
  return probe(filePath).then((info) => {
    const streams = (info && info.raw && info.raw.streams) || [];
    const out = [];
    const TEXT_SUB_CODECS = new Set([
      'subrip', 'srt', 'ass', 'ssa', 'webvtt', 'vtt', 'mov_text', 'text',
    ]);
    for (const s of streams) {
      if (s.codec_type !== 'subtitle') continue;
      const codec = String(s.codec_name || '').toLowerCase();
      if (!TEXT_SUB_CODECS.has(codec)) continue;
      out.push({
        streamIndex: s.index,
        codec: codec,
        language: (s.tags && (s.tags.language || s.tags.LANGUAGE)) || 'und',
        title: (s.tags && (s.tags.title || s.tags.TITLE)) || '',
      });
    }
    return out;
  }).catch(() => []);
}

/**
 * @brief Probe a media file and report video / audio codec info.
 *
 *        Used by the player's native-vs-transcode decision: a .mkv
 *        with H264+AAC plays directly via byte-range, but the same
 *        container with EAC3 / DTS / TrueHD / MLP audio fails
 *        silently in Chrome / Firefox (video decodes, audio is mute).
 *        Reporting codecs lets the client redirect such files to the
 *        /media-stream transcode pipeline before the user notices.
 *
 *        Wraps probe(): same heavy ffprobe call used by streamTo's
 *        remux-vs-encode check, but projects out a stable shape for
 *        the public-facing /api/episode/.../codecs endpoint.
 *
 * @param filePath Absolute path to a video container.
 * @returns Promise<{videoCodec, audioCodecs[], audioTracks[], subCount, durationSec}>
 *          - videoCodec: first video stream's codec_name or null
 *          - audioCodecs: array of every audio stream's codec_name
 *            (in stream-index order); used by the client to test
 *            "do all audio tracks fall in the browser-safe set"
 *          - audioTracks: array of {streamIndex, codec, language,
 *            title, channels, default} — richer per-track metadata
 *            consumed by the HLS multi-audio picker. streamIndex is
 *            the absolute ffprobe index (use as `-map 0:<idx>`).
 *          - subCount: count of text+bitmap subtitle streams
 *          - durationSec: container duration (helpful for nav)
 *          Resolves with `{}` on probe failure so the API layer can
 *          fall back gracefully.
 */
function probeMediaCodecs(filePath) {
  return probe(filePath).then((info) => {
    const streams = (info && info.raw && info.raw.streams) || [];
    const audioCodecs = [];
    const audioTracks = [];
    let videoCodec = null;
    let subCount = 0;
    for (const s of streams) {
      if (s.codec_type === 'video' && !videoCodec) {
        videoCodec = String(s.codec_name || '').toLowerCase();
      } else if (s.codec_type === 'audio') {
        const codec = String(s.codec_name || '').toLowerCase();
        audioCodecs.push(codec);
        audioTracks.push({
          streamIndex: typeof s.index === 'number' ? s.index : null,
          codec,
          language: (s.tags && (s.tags.language || s.tags.LANGUAGE)) || 'und',
          title: (s.tags && (s.tags.title || s.tags.TITLE)) || '',
          channels: typeof s.channels === 'number' ? s.channels : null,
          default: !!(s.disposition && s.disposition.default),
        });
      } else if (s.codec_type === 'subtitle') {
        subCount += 1;
      }
    }
    return {
      videoCodec,
      audioCodecs,
      audioTracks,
      subCount,
      durationSec: info && info.duration ? info.duration : null,
    };
  }).catch(() => ({}));
}

/**
 * @brief Extract one embedded subtitle stream from a container into a
 *        WebVTT file on disk. Idempotent — caller is expected to skip
 *        the call when the destination file already exists.
 *
 * @param filePath  Absolute path to the source video.
 * @param streamIdx ffprobe stream index (NOT the subtitle-only index;
 *                  use the .index field returned by listEmbeddedSubtitles).
 * @param outPath   Absolute path where the .vtt should be written.
 * @returns Promise<void> — resolves on ffmpeg exit 0, rejects on failure.
 */
function extractEmbeddedSubtitle(filePath, streamIdx, outPath) {
  return new Promise((resolve, reject) => {
    if (!READY || !BIN) return reject(new Error('ffmpeg not available'));
    const args = [
      '-v', 'error',
      '-i', filePath,
      // Map a specific stream by absolute index. `0:<idx>` ties to the
      // ffprobe-reported index, which is stable across runs.
      '-map', '0:' + streamIdx,
      // Force WebVTT output. ffmpeg's webvtt muxer accepts ASS/SRT/
      // mov_text source via the text-codec converter automatically.
      '-c:s', 'webvtt',
      '-f', 'webvtt',
      // Overwrite if a half-written cache file is somehow present.
      '-y',
      outPath,
    ];
    const child = spawn(BIN.ffmpeg, args, {
      stdio: ['ignore', 'ignore', 'pipe'],
      windowsHide: true,
    });
    let err = '';
    child.stderr.on('data', (d) => { err += d.toString('utf8'); if (err.length > 2048) err = err.slice(-2048); });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error('ffmpeg exit ' + code + ': ' + err.split(/\r?\n/).slice(-3).join(' | ')));
    });
  });
}

/**
 * @brief Start an HLS (HTTP Live Streaming) transcode in
 *        AUDIO-ONLY FIX mode (v1.10.0+): the video bitstream is
 *        always `-c:v copy`'d and only the audio is re-encoded /
 *        downmixed (EAC3 / DTS / TrueHD / AC3 / multi-channel
 *        → AAC stereo via the dplii matrix). Outputs a
 *        `playlist.m3u8` event-style playlist + `segNNN.ts`
 *        segments to outDir, each ~6s.
 *
 *        Design call (2026-05-11): the DS124's ARM A55 quad-core
 *        cannot libx264 re-encode 1080p HEVC at faster than
 *        ~0.5x realtime, which means a feature-length film takes
 *        3-4 hours of wall time. The user accepted that running
 *        the transcoder purely for audio repair (HEVC stays HEVC
 *        in the .ts container) is preferable: it finishes in
 *        minutes rather than hours, the cache footprint shrinks
 *        because copied HEVC is far smaller than re-encoded H264,
 *        and modern browsers (Safari, Edge, Chromium >= 107 on
 *        platforms with HEVC hardware) can play HEVC-in-TS
 *        directly. Older / non-HEVC-capable clients (Firefox,
 *        older Chromium) lose video — that is an explicit and
 *        accepted trade-off, documented in the README adaptation-
 *        limits section.
 *
 *        ffmpeg config:
 *          -c:v copy        Always. Source bitstream copied into
 *                           the .ts container untouched.
 *          -c:a aac 192k    Re-encode audio so the browser can
 *                           decode it.
 *          -af aresample=matrix_encoding=dplii
 *                           Dolby Pro Logic II downmix matrix.
 *                           Skips the libavcodec auto-pick that
 *                           lands on the broken zero matrix for
 *                           "7.1" and "5.1+2"-style layouts (the
 *                           silent-output bug fixed in v1.9.1).
 *          -ac 2            Force 2-channel output.
 *          -fflags +genpts / -avoid_negative_ts make_zero
 *                           PTS regeneration so seg00000.ts starts
 *                           at 0 — without these, hls.js disables
 *                           the audio rendition (v1.9.2 fix).
 *          -hls_time 6      ~6s per .ts segment
 *          -hls_playlist_type event
 *                           Append-as-generated; final ENDLIST tag
 *                           appears only when ffmpeg exits, so
 *                           hls.js keeps reloading the playlist
 *                           for new segments. Once ENDLIST shows
 *                           up, hls.js switches into VOD mode and
 *                           stops polling.
 *
 * @param inputPath Source video path.
 * @param outDir    Cache dir for playlist + segments. Created if
 *                  missing; caller owns cleanup on failure.
 * @param opts      Optional knobs:
 *                    audioStreamIndex  Absolute ffprobe stream index
 *                                      to map for audio. null/undef
 *                                      → first audio (`0:a:0?`).
 *                                      Used by the multi-audio
 *                                      picker so the same input can
 *                                      be cached per-track and the
 *                                      user can switch language.
 *                    threads           ffmpeg `-threads` count. With
 *                                      audio-only fix mode there is
 *                                      no libx264 worker pool to
 *                                      shape; the value now caps the
 *                                      AAC encoder + muxer thread
 *                                      pool, which is far cheaper.
 *                                      Kept callable for backward
 *                                      compatibility with the
 *                                      RAM-aware scheduler.
 *                    niceLevel         POSIX nice value for the
 *                                      child process. Background
 *                                      pre-transcodes pass 19; on-
 *                                      demand viewer transcodes
 *                                      pass 10.
 * @returns child process handle so caller can kill on abort.
 */
function startHlsTranscode(inputPath, outDir, opts) {
  if (!READY || !BIN) throw new Error('ffmpeg not available');
  try { fs.mkdirSync(outDir, { recursive: true }); } catch (_e) {}
  const audioStreamIndex = (opts && typeof opts.audioStreamIndex === 'number')
    ? opts.audioStreamIndex : null;
  // niceLevel: caller-overridable nice value. Default 10 matches the
  // original "active viewer" priority. The pretranscode queue passes
  // 19 directly so background pre-encodes start at the lowest tier
  // and don't compete with on-demand transcodes for CPU. Range
  // clamped to 0-19 (negative nice requires CAP_SYS_NICE which the
  // unprivileged admin user on the DS124 doesn't have).
  let niceLevel = (opts && typeof opts.niceLevel === 'number') ? opts.niceLevel : 10;
  if (!Number.isFinite(niceLevel)) niceLevel = 10;
  niceLevel = Math.max(0, Math.min(19, Math.round(niceLevel)));
  // threads: caller-overridable ffmpeg worker count. In v1.10.0+
  // audio-only fix mode there is no libx264 pool to shape, so the
  // value mostly limits the AAC encoder + muxer thread budget,
  // which is cheap. Kept callable so the RAM-aware scheduler
  // (server.js tickHlsQueue) still has a knob — full tier passes
  // 3, throttled tier passes 2. Clamped to [1,4] to match the
  // 4-core ARM A55.
  let threadCount = (opts && typeof opts.threads === 'number') ? opts.threads : 2;
  if (!Number.isFinite(threadCount)) threadCount = 2;
  threadCount = Math.max(1, Math.min(4, Math.round(threadCount)));
  // -fflags +genpts: regenerate PTS from frame DTS so the output
  // doesn't inherit the source mkv's container start_time offset.
  // Without this, a typical mkv with first video PTS = 1.483s and
  // first audio PTS = 1.461s produces HLS seg00000.ts where both
  // streams start at ~1.5s instead of 0. hls.js' demuxer then
  // sees an "audio rendition that arrives 1.46s after the first
  // video frame" pattern and disables the audio track entirely
  // (player.audioTracks shows zero entries, the audio menu is
  // empty, and playback is silent — verified 2026-05-11 with
  // Bohemian.Rhapsody and Invincible S01E01 even after the
  // dplii downmix fix proved cache audio is non-silent).
  //
  // -avoid_negative_ts make_zero: pairs with +genpts to clamp
  // any residual DTS negative values to 0 instead of dropping
  // them, which avoids the same disabled-audio failure mode in
  // a different code path.
  //
  // Both flags are file-input safe (b-frame DTS ordering still
  // works correctly when PTS are regenerated from frame numbers).
  const args = ['-v', 'warning', '-fflags', '+genpts', '-i', inputPath];
  // v1.10.0: always copy the source video bitstream into the .ts
  // container. The previous design ran libx264 ultrafast for non-
  // H264 sources, which on the DS124's ARM A55 clocked ~0.4-0.5x
  // realtime for 1080p HEVC — a 2-hour film took 4-5 hours wall
  // time and the user typically gave up before the cache reached
  // ENDLIST. The audio-only fix mode trades video re-encoding for
  // playback compatibility: HEVC stays HEVC inside the .ts segment,
  // so Safari / Edge / recent Chromium with HEVC hardware play
  // fine, but Firefox / older Chromium see "no compatible video
  // track" and fail to start. The user explicitly accepted that
  // limitation 2026-05-11 in exchange for transcodes finishing in
  // minutes (audio-only is bound by demux + AAC encode speed,
  // typically 5-10x realtime on the A55).
  args.push('-c:v', 'copy');
  // Multi-channel EAC3 / AC3 sources (DDP 5.1 / 7.1) hit a known
  // silent-output trap when transcoded with the bare `-c:a aac
  // -ac 2` chain on the bundled libavcodec build: cache segments
  // contain a valid 192 kbps AAC stereo stream (verified via
  // ffprobe — duration / bit_rate / channel_layout=stereo all
  // sane), but the browser plays absolutely no audio. The bug
  // shows up specifically for "7.1" and "5.1+2"-style channel
  // layouts where the libavcodec auto-downmix matrix returns
  // near-zero coefficients for the front channels.
  //
  // Reproduced 2026-05-10 with at least:
  //   Bohemian.Rhapsody.2018.DDP.7.1.H.265-EDGE2020.mkv  (EAC3 8 ch / 7.1)
  //   Rick and Morty Season 8                            (multi-channel)
  //
  // Fix: prepend an explicit aresample filter with
  // matrix_encoding=dplii — Dolby Pro Logic II, the ITU-R BS.775-3
  // derived 5.1/7.1 → stereo downmix matrix. Forcing dplii skips
  // the libavcodec auto-pick that lands on the broken zero matrix.
  // For genuine stereo / mono sources aresample is a near-no-op
  // pass-through, so this is safe to apply unconditionally without
  // probing channel_layout up front.
  //
  // Matrix order matters: the filter must run BEFORE the encoder
  // sees the planar samples. Putting `-af` after `-c:a aac` would
  // attach it to the demuxed audio chain post-encode and have no
  // effect on the AAC encoder's input layout.
  args.push('-c:a', 'aac', '-b:a', '192k');
  args.push('-af', 'aresample=matrix_encoding=dplii');
  args.push('-ac', '2');
  // Always map first video stream. For audio: an explicit absolute
  // index (`0:5`) wins; otherwise fall back to the first audio
  // stream (`0:a:0?`). The `?` makes the map optional — silent
  // video stays valid output.
  args.push('-map', '0:v:0?');
  if (audioStreamIndex != null) {
    args.push('-map', '0:' + audioStreamIndex + '?');
  } else {
    args.push('-map', '0:a:0?');
  }
  args.push(
    // -avoid_negative_ts make_zero: pair with input-side
    // -fflags +genpts above. Together they guarantee seg00000.ts
    // has both audio and video starting at PTS 0 — without this
    // hls.js disables the audio rendition. See the +genpts
    // comment block at the top of this function.
    '-avoid_negative_ts', 'make_zero',
    '-hls_time', '6',
    '-hls_playlist_type', 'event',
    '-hls_segment_filename', path.join(outDir, 'seg%05d.ts'),
    '-hls_flags', 'temp_file',
    '-y',
    path.join(outDir, 'playlist.m3u8'),
  );
  // Resource shaping for the quad-core ARM A55 in the DS124
  // (4x A55 @ 1.7GHz / RTD1619B, 1GB RAM). Much less critical in
  // v1.10.0+ audio-only fix mode (no libx264 worker pool to
  // saturate), but the nice + detached + threads triple still has
  // value:
  //
  //   nice -n 10            Start at "polite" priority. The kernel
  //                         CFS scheduler still gives ffmpeg most
  //                         of the core when nothing else needs
  //                         it (typical case), but yields fairly
  //                         to node + nginx on contention. The
  //                         server promotes/demotes via renice -g
  //                         based on whether anyone is actually
  //                         watching (lib/ffmpeg.js owns no policy
  //                         beyond the start nice level).
  //   -threads <N>          AAC encoder + muxer thread budget. The
  //                         pre-v1.10 use of this flag was to cap
  //                         libx264's worker pool; today it mostly
  //                         affects the AAC encoder which scales
  //                         poorly past 2 threads anyway. Kept so
  //                         the RAM-aware scheduler in server.js
  //                         can still differentiate full vs.
  //                         throttled tiers.
  //   detached: true        On POSIX this calls setsid() before
  //                         exec, making child.pid the new PGID.
  //                         Server uses SIGSTOP / SIGCONT on the
  //                         pgid to pause/resume the entire ffmpeg
  //                         tree atomically when the scheduler
  //                         flips tier. NOT followed by
  //                         child.unref() — we still want the
  //                         parent to observe the 'exit' event so
  //                         hlsJobs.delete() runs and the cache
  //                         entry becomes "ready" once ENDLIST
  //                         hits the playlist.
  //
  // ionice/cpulimit are deliberately not used: the DS124 toolchain
  // ships neither (verified via `command -v` 2026-05-10), and the
  // single SATA spindle means IO priority would only matter under
  // multi-job IO contention which the global concurrency cap of 1
  // already guards against.
  //
  // Windows dev box has no `nice` and no setsid-equivalent for
  // detached. We skip both there — Windows is dev-only (the
  // shipping target is the DS124 NAS), and a Windows dev session
  // hammering one CPU core is acceptable.
  const isPosix = process.platform !== 'win32';
  // -threads <N>: AAC encoder / muxer thread budget. Set by the
  // adaptive scheduler based on tier; full tier passes 3,
  // throttled tier passes 2. In audio-only fix mode this has far
  // less impact than the pre-v1.10 libx264 days, but is retained
  // for back-pressure consistency with the scheduler.
  const ffArgs = ['-threads', String(threadCount), ...args];
  // stdio: ['ignore', 'ignore', 'ignore'] is critical for the
  // long-running-transcode case: audio-only fix at ~5-10x realtime
  // still takes 10-30 minutes for a feature film, and node MUST be
  // allowed to restart (deploy / debug / DSM package update)
  // within that window without aborting the transcode. With
  // stderr left as a pipe to node, ffmpeg's next av_log() call
  // after node exits would EPIPE and terminate the process — so
  // we cut every fd to /dev/null. detached:true already puts
  // ffmpeg in its own session (immune to SIGHUP); ignore-all-
  // stdio gives it full disconnect.
  //
  // Cost: we lose the errTail console.warn diagnostic on non-zero
  // exit — but the playlist.m3u8 + segment files on disk tell us
  // everything we need to know (how far it got, ENDLIST present
  // or not), and a failed transcode that wrote a partial cache
  // is recoverable by deleting that cache dir.
  //
  // Note we still listen for 'exit' (no .unref()) so node-while-
  // alive sees the transcode finish and runs hlsJobs.delete +
  // logs the completion. That's the path for the common case of
  // node staying up; the disconnected-stdio path only matters
  // when node dies mid-transcode.
  const child = isPosix
    ? spawn('nice', ['-n', String(niceLevel), BIN.ffmpeg, ...ffArgs], {
        stdio: ['ignore', 'ignore', 'ignore'],
        windowsHide: true,
        detached: true,
      })
    : spawn(BIN.ffmpeg, ffArgs, {
        stdio: ['ignore', 'ignore', 'ignore'],
        windowsHide: true,
      });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) {
      console.warn('hls transcode exit', code, 'for', inputPath);
    }
  });
  return child;
}

module.exports = {
  init,
  isReady,
  status,
  probe,
  streamTo,
  captureFrame,
  previewFrames,
  listEmbeddedSubtitles,
  extractEmbeddedSubtitle,
  probeMediaCodecs,
  startHlsTranscode,
  // Constants exported so lib/fmp4-stream.js (v1.9.0+) and lib/audio-
  // stream.js (v1.9.0+) can share the muxer flag sets without re-
  // defining them. Treat as read-only on the caller side; both arrays
  // are frozen above to enforce that at runtime.
  FRAG_MP4_TAIL,
  FMP4_MSE_MOVFLAGS,
  REMUXABLE_VIDEO_CODECS,
  REMUXABLE_AUDIO_CODECS,
  // Exposed for fmp4-stream's per-codec decision so it can re-use the
  // same copy/encode logic streamTo uses without re-implementing it.
  mixedArgs,
  // ffmpeg / ffprobe path getter for lib/probe-cache.js — the cache
  // layer takes the path explicitly rather than re-discovering the
  // bundled binary, so this getter is the one shared accessor.
  getBin: () => (BIN ? { ffmpeg: BIN.ffmpeg, ffprobe: BIN.ffprobe, source: BIN.source } : null),
  // exported for tests / diagnostics
  _platformDir: platformDir,
};
