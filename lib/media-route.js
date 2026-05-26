// =============================================================================
// lib/media-route.js
// =============================================================================
//
// Single decision point for "how should this video be delivered to the
// client?". Replaces several ad-hoc checks that used to live in server.js
// (extension whitelist test, /api/episode/.../codecs response, the
// streamTo error-fallback ladder, the HLS pre-transcode admission).
//
// The four lanes
// --------------
//
//   'native'         Plain byte-range serve from the on-disk file via
//                    express.static. No ffmpeg involvement. Cheapest path.
//                    Used when the source container AND every track inside
//                    it are browser-native for the requesting client.
//
//   'fmp4-mse'       Real-time fmp4 (fragmented MP4) stream driven by
//                    lib/fmp4-stream.js on the server and the
//                    public/video-mse.js controller on the client. Server
//                    runs `ffmpeg -c:v copy [-c:a aac dplii -ac 2 ...] -f mp4
//                    -movflags ... pipe:1`; client wires the response stream
//                    into MediaSource via mp4box.js. Seek = SIGKILL the
//                    ffmpeg child and respawn with `-ss <newSec>`. This
//                    lane is what removes the "transcoding..." waiting
//                    toast for non-iOS browsers — playback starts inside
//                    a second.
//
//   'fmp4-streamTo'  The legacy /media-stream path: ffmpeg → fragmented
//                    MP4 → plain HTTP response, no MSE controller, no seek
//                    support. Kept as a fallback for clients that report
//                    `browserCaps.mseFmp4Streaming === false` (rare older
//                    browsers, MSE-disabled enterprise builds) and for
//                    containers that are easier to remux than to stream
//                    incrementally (.avi / .wmv / .rmvb / .rm — these
//                    don't have a friendly fragment boundary story).
//
//   'hls'            HTTP Live Streaming, the v1.8.x pre-transcode queue
//                    path. ffmpeg outputs segNNN.ts + playlist.m3u8 into
//                    data/hls-cache/<sha1>/ and the client uses hls.js to
//                    consume the playlist. Required for iOS Safari (which
//                    does not support MSE-fed fmp4 streaming) and used as
//                    a last-resort fallback when MSE health-check fails.
//                    This lane has user-visible wait time and is the
//                    reason iOS support is documented as "still has the
//                    transcoding... toast".
//
// Why we keep all four
// --------------------
// It's tempting to collapse fmp4-mse and fmp4-streamTo into one path. The
// reason we don't: 'fmp4-streamTo' is what falls out of the existing
// streamTo() in lib/ffmpeg.js with zero client-side dependencies. Browsers
// with broken MSE or with mp4box.js disabled (network filter, ad blocker
// blanket-blocks unfamiliar JS) still get a playable response. The two
// fmp4 lanes share the same server-side ffmpeg invocation; only the
// muxer flags + the client-side decoding pipeline differ.
//
// Inputs
// ------
//
//   mediaInfo       The normalized record from lib/probe-cache.js (and
//                   for audio sources, lib/audio.js's HiFi scan). May be
//                   null or carry an `error` field — both indicate the
//                   probe didn't succeed and we should pick the safest
//                   lane that doesn't depend on knowing codec details.
//
//   browserCaps     What the client reported via public/capability.js,
//                   POST'ed to /api/client-caps at session start. Shape:
//                     { hevc, av1, vp9, mkv, fmp4flac, fmp4alac,
//                       mseFmp4Streaming, isIOS }
//                   Missing keys default to false (conservative).
//
//   containerExt    Lowercase file extension including the dot, e.g.
//                   '.mkv', '.mp4', '.avi'. Some decisions key on the
//                   container in addition to the codec (mkv with H.264 +
//                   AAC works for Chrome+Edge+Safari but not Firefox).
//
// Return shape
// ------------
//   {
//     route: 'native' | 'fmp4-mse' | 'fmp4-streamTo' | 'hls',
//     reason: 'codec-incompat-audio' | 'unsafe-container' | ...,
//                              // short tag for logs / X-Route-Reason header
//     audioStreamIndex: number | null,
//                              // for HLS / fmp4 paths that benefit from
//                              // explicit -map 0:N selection. null = let
//                              // ffmpeg pick first audio.
//   }
// =============================================================================

'use strict';

/* --------------------------------------------------------------------------
 * Codec / container constants.
 *
 * These are the single source of truth for "what works natively in the
 * browser". Adding a codec here makes it eligible for the byte-range
 * native lane; removing one forces transcode. Tightening this set is
 * safe (worst case the client transcodes something it could have decoded
 * directly); loosening it without testing can produce silent playback
 * (we already lived that with EAC3 over byte-range; see the v1.9.1
 * dplii downmix fix history).
 * ------------------------------------------------------------------------ */

/** Video codecs every modern desktop browser plays in an MP4 container. */
const ALWAYS_NATIVE_VIDEO_CODECS = new Set(['h264', 'avc1', 'avc']);

/** Video codecs that decode natively in WebM containers across Chrome /
 *  Edge / Firefox. Safari support is browserCaps-gated. */
const WEBM_VIDEO_CODECS = new Set(['vp9', 'vp8', 'av1']);

/** Audio codecs the browser can decode out of a byte-range stream when
 *  paired with a compatible container. Adding a codec here also tells
 *  the audio HiFi path that the source can be byte-range passed-through
 *  rather than remuxed. */
const SAFE_AUDIO_CODECS = new Set(['aac', 'mp3', 'opus', 'vorbis', 'flac']);

/** Audio codecs that the browser cannot decode at all and which therefore
 *  force a transcode (fmp4-mse or HLS) regardless of the video codec or
 *  container. */
const INCOMPATIBLE_AUDIO_CODECS = new Set([
  'eac3', 'ec3', 'ac3',
  'dts', 'dts-hd', 'dts-hd ma', 'dca',
  'truehd', 'mlp',
  'wmav1', 'wmav2', 'wmapro', 'wmavoice',
  'opus_xiph', // historical alias; not common
]);

/** Container extensions that every desktop browser plays via byte-range
 *  when the codecs inside are native-friendly. */
const NATIVE_CONTAINERS = new Set(['.mp4', '.m4v', '.webm']);

/** Containers that the browsers occasionally claim to play but where we
 *  can't trust the result without explicit browserCaps confirmation. */
const CAPABILITY_GATED_CONTAINERS = new Set(['.mkv']);

/** Containers we will never serve byte-range — they require demux work the
 *  browsers don't do. fmp4 remux is the right tool here. */
const ALWAYS_TRANSCODE_CONTAINERS = new Set([
  '.avi', '.wmv', '.flv', '.rmvb', '.rm',
  '.ts', '.mts', '.m2ts', '.3gp',
  '.ogv', '.ogg',  // ogg-video is rare and inconsistently supported
  '.mov',          // QuickTime-style atom layout often trips byte-range
]);

/* --------------------------------------------------------------------------
 * Decision helpers.
 * ------------------------------------------------------------------------ */

function _lc(v) { return v == null ? '' : String(v).toLowerCase(); }

function _isAudioSafe(mediaInfo) {
  if (!mediaInfo || !Array.isArray(mediaInfo.audio) || mediaInfo.audio.length === 0) {
    return true; // no audio is fine; video-only files exist
  }
  return mediaInfo.audio.every((t) => SAFE_AUDIO_CODECS.has(_lc(t.codec)));
}

function _hasIncompatibleAudio(mediaInfo) {
  if (!mediaInfo || !Array.isArray(mediaInfo.audio)) return false;
  return mediaInfo.audio.some((t) => INCOMPATIBLE_AUDIO_CODECS.has(_lc(t.codec)));
}

/**
 * @brief Pick the audio stream index to ask ffmpeg to map.
 *
 *        For containers with a single audio stream we let ffmpeg use its
 *        default (`-map 0:a:0?`). For multi-audio mkvs we honor the
 *        `disposition.default` flag first, falling back to the first
 *        stream when nothing is marked default. Callers can override via
 *        opts.preferredAudioIndex.
 *
 * @param {Object} mediaInfo
 * @param {number|null} preferred Caller-supplied explicit selection.
 * @returns {number|null} ffprobe stream index, or null = let ffmpeg pick.
 */
function pickAudioStreamIndex(mediaInfo, preferred) {
  if (typeof preferred === 'number') return preferred;
  if (!mediaInfo || !Array.isArray(mediaInfo.audio) || mediaInfo.audio.length === 0) {
    return null;
  }
  if (mediaInfo.audio.length === 1) return null; // ffmpeg default is fine
  const def = mediaInfo.audio.find((t) => t.default);
  if (def && typeof def.index === 'number') return def.index;
  return null;
}

/* --------------------------------------------------------------------------
 * Public: decideVideoRoute
 * ------------------------------------------------------------------------ */

/**
 * @brief Pick the delivery lane for a video request.
 *
 *        Pure function — no I/O, no state, side-effect free. Suitable for
 *        unit testing by passing synthetic mediaInfo / browserCaps shapes.
 *
 * @param {Object} input
 * @param {Object|null} input.mediaInfo       lib/probe-cache.js record.
 * @param {Object} [input.browserCaps]        capability.js report.
 * @param {string} [input.containerExt]       Lowercase ext with leading dot.
 * @param {number|null} [input.preferredAudioIndex]
 *        Explicit `-map 0:N` selection (multi-audio picker integration).
 * @returns {{route: string, reason: string, audioStreamIndex: (number|null)}}
 */
function decideVideoRoute(input) {
  const mi = input && input.mediaInfo ? input.mediaInfo : null;
  const caps = (input && input.browserCaps) || {};
  const ext = _lc(input && input.containerExt);
  const audioStreamIndex = pickAudioStreamIndex(mi, input && input.preferredAudioIndex);

  // iOS Safari is the only client we deliberately force onto HLS — its
  // MSE implementation does not accept fmp4 streamed from a generic
  // <Response>, so the fmp4-mse path silently produces no playback.
  // This check goes first so iOS never falls into a Native or fmp4-mse
  // decision below.
  if (caps.isIOS) {
    // ...but only if the source actually NEEDS transcoding. A plain mp4
    // with h264+aac plays via byte-range on iOS just fine.
    const audioSafe = _isAudioSafe(mi);
    const v = _lc(mi && mi.video && mi.video.codec);
    if (NATIVE_CONTAINERS.has(ext) && audioSafe && ALWAYS_NATIVE_VIDEO_CODECS.has(v)) {
      return { route: 'native', reason: 'ios-native-friendly', audioStreamIndex };
    }
    return { route: 'hls', reason: 'ios-fallback', audioStreamIndex };
  }

  // No probe data → conservative fallback. fmp4-mse handles every codec
  // ffmpeg can decode, including the ones we can't see in mediaInfo.
  // We don't choose 'hls' here because the wait time is unacceptable
  // for files that often DON'T need transcoding (most mp4s with usable
  // codecs would otherwise just byte-range serve).
  if (!mi || mi.error || !mi.video) {
    if (NATIVE_CONTAINERS.has(ext)) {
      return { route: 'native', reason: 'no-probe-native-ext', audioStreamIndex };
    }
    return { route: 'fmp4-mse', reason: 'no-probe', audioStreamIndex };
  }

  const v = _lc(mi.video.codec);
  const audioSafe = _isAudioSafe(mi);
  const hasIncompatAudio = _hasIncompatibleAudio(mi);

  // Audio is the dominant constraint. Any track the browser can't decode
  // means we must remux audio → AAC stereo (the dplii fix path). Video
  // can still `-c:v copy` in fmp4-mse, which is what makes that lane
  // fast enough to be the default for non-iOS clients.
  if (hasIncompatAudio || !audioSafe) {
    // If the client can't run MSE-fmp4-streaming, fall back to HLS — the
    // legacy streamTo path can't seek a multi-channel mkv either way.
    if (caps.mseFmp4Streaming === false) {
      return { route: 'hls', reason: 'no-mse-fmp4-streaming', audioStreamIndex };
    }
    return { route: 'fmp4-mse', reason: 'audio-incompat', audioStreamIndex };
  }

  // From here on, audio is browser-safe and we're deciding based on the
  // video codec + container combination.

  // Containers that can never go native.
  if (ALWAYS_TRANSCODE_CONTAINERS.has(ext)) {
    // These are usually older formats (avi / wmv / flv) where ffmpeg
    // copy-remuxes the video bitstream into mp4 with negligible CPU.
    // streamTo handles them in one pass; mp4box client-side parsing
    // also works but adds latency for no benefit since users rarely
    // seek inside an .avi sample.
    if (caps.mseFmp4Streaming === false) {
      return { route: 'fmp4-streamTo', reason: 'legacy-container-no-mse', audioStreamIndex };
    }
    return { route: 'fmp4-mse', reason: 'legacy-container', audioStreamIndex };
  }

  // h.264 in mp4/m4v/webm is the universal happy path.
  if (NATIVE_CONTAINERS.has(ext) && ALWAYS_NATIVE_VIDEO_CODECS.has(v)) {
    return { route: 'native', reason: 'h264-native', audioStreamIndex };
  }

  // h.264 in mkv: capability gated. Chrome / Edge / Safari accept it;
  // Firefox does not. capability.js probes via MediaSource.isTypeSupported
  // for 'video/x-matroska; codecs="avc1.640028,mp4a.40.2"'.
  if (CAPABILITY_GATED_CONTAINERS.has(ext) && ALWAYS_NATIVE_VIDEO_CODECS.has(v)) {
    if (caps.mkv === true) {
      return { route: 'native', reason: 'mkv-h264-capable', audioStreamIndex };
    }
    return { route: 'fmp4-mse', reason: 'mkv-h264-incapable', audioStreamIndex };
  }

  // HEVC anywhere: native only if the browser confirms HEVC support.
  if (v === 'hevc' || v === 'h265') {
    if (caps.hevc === true && (NATIVE_CONTAINERS.has(ext) || (ext === '.mkv' && caps.mkv === true))) {
      return { route: 'native', reason: 'hevc-capable', audioStreamIndex };
    }
    // Falls into fmp4-mse: ffmpeg `-c:v copy` keeps HEVC bytes intact
    // inside the fmp4 container; client MSE decodes if it can, else
    // we hard-error and the controller fallback chains to HLS.
    if (caps.mseFmp4Streaming === false) {
      return { route: 'hls', reason: 'hevc-no-mse', audioStreamIndex };
    }
    return { route: 'fmp4-mse', reason: 'hevc-incapable', audioStreamIndex };
  }

  // AV1 anywhere: native only if confirmed. AV1 has near-zero hardware
  // acceleration on the DS124's clients (mostly older browsers / TV-stick
  // form factors), so unconfirmed AV1 falls to HLS where we can at least
  // re-encode the audio.
  if (v === 'av1') {
    if (caps.av1 === true) {
      return { route: 'native', reason: 'av1-capable', audioStreamIndex };
    }
    return { route: 'hls', reason: 'av1-incapable', audioStreamIndex };
  }

  // VP9: WebM-native everywhere modern.
  if (v === 'vp9' || v === 'vp8') {
    if (ext === '.webm' || (NATIVE_CONTAINERS.has(ext) && caps.vp9 === true)) {
      return { route: 'native', reason: 'vp9-native', audioStreamIndex };
    }
    if (caps.mseFmp4Streaming === false) {
      return { route: 'fmp4-streamTo', reason: 'vp9-no-mse', audioStreamIndex };
    }
    return { route: 'fmp4-mse', reason: 'vp9-non-webm', audioStreamIndex };
  }

  // Anything else: punt to fmp4-mse, which can ingest any decodable input
  // and copy the video bitstream when libavcodec can recognize it.
  if (caps.mseFmp4Streaming === false) {
    return { route: 'fmp4-streamTo', reason: 'unknown-video-no-mse', audioStreamIndex };
  }
  return { route: 'fmp4-mse', reason: 'unknown-video', audioStreamIndex };
}

/* --------------------------------------------------------------------------
 * Public: decideAudioRoute (audio HiFi link)
 *
 * Lives in this module too because the same mediaInfo + browserCaps tuple
 * drives both video and audio decisions and we want one place to test in
 * isolation. The actual streaming implementation is lib/audio-stream.js.
 *
 * Lanes:
 *
 *   'byte-range'      Plain static serve from /audio-files. mp3 / aac /
 *                     vorbis / opus / wav universally; flac via byte-range
 *                     on Chrome/Edge/Firefox, fmp4-flac on Safari; alac
 *                     via byte-range on Safari, fmp4-flac re-pack on
 *                     Chrome/Firefox.
 *
 *   'fmp4-flac'       Real-time remux to fmp4 container with FLAC inside.
 *                     Lossless source → lossless output. Used for ape,
 *                     wavpack, tta, tak, wma-lossless, alac on non-Safari,
 *                     and aiff (which is wav-equivalent but with a
 *                     container browsers don't accept). Also the target
 *                     for DSD after sample-rate conversion.
 *
 *   'dsd-to-flac'     soxr-precision DSD → 24/96 FLAC inside fmp4. The
 *                     route name is separate from 'fmp4-flac' so the
 *                     server can pick the right ffmpeg argv at spawn time.
 *
 *   'fmp4-opus'       Lossy fallback when the client can't decode FLAC
 *                     in any wrapper. Surfaced to the UI as a red badge
 *                     so the user knows quality was sacrificed for
 *                     compatibility.
 * ------------------------------------------------------------------------ */

/**
 * @brief Pick the audio HiFi delivery lane.
 *
 * @param {Object} input
 * @param {Object|null} input.mediaInfo       lib/audio.js HiFi record.
 * @param {Object} [input.browserCaps]        capability.js report (audio).
 * @param {string} [input.containerExt]       Lowercase ext with dot.
 * @returns {{route: string, reason: string, lossless: boolean}}
 */
function decideAudioRoute(input) {
  const mi = input && input.mediaInfo ? input.mediaInfo : null;
  const caps = (input && input.browserCaps) || {};
  const ext = _lc(input && input.containerExt);
  const firstAudio = mi && Array.isArray(mi.audio) && mi.audio[0] ? mi.audio[0] : null;
  const codec = firstAudio ? _lc(firstAudio.codec) : null;
  const lossless = firstAudio ? !!firstAudio.lossless : false;

  // DSD is a sampling-method, not a PCM codec. ffmpeg's resampler with
  // libsoxr produces lossless-equivalent 24-bit/96 kHz PCM that we then
  // wrap in FLAC. Distinct lane label so the server can pick the right
  // -af filter graph.
  if (codec && codec.startsWith('dsd_')) {
    return { route: 'dsd-to-flac', reason: 'dsd-source', lossless: true };
  }

  // Browser-native containers with native codecs → byte-range.
  if (codec && SAFE_AUDIO_CODECS.has(codec)) {
    // FLAC has slightly weird container politics: Chrome/Firefox/Edge
    // play `.flac` files via byte-range, Safari does not. Safari users
    // need fmp4-flac instead.
    if (codec === 'flac' && caps.fmp4flac === true && ext === '.flac') {
      // Modern browsers — byte-range is cheaper, prefer it.
      return { route: 'byte-range', reason: 'flac-native', lossless: true };
    }
    if (codec === 'flac') {
      // Either the cap is false, or the container is something exotic.
      // Remux to fmp4-flac for safety.
      if (caps.fmp4flac === true) {
        return { route: 'fmp4-flac', reason: 'flac-non-native-container', lossless: true };
      }
      return { route: 'fmp4-opus', reason: 'flac-no-fmp4flac', lossless: false };
    }
    return { route: 'byte-range', reason: 'codec-native', lossless: false };
  }

  // ALAC: Safari plays .m4a/alac via byte-range; non-Safari needs re-pack.
  if (codec === 'alac') {
    if (caps.fmp4alac === true) {
      return { route: 'byte-range', reason: 'alac-native', lossless: true };
    }
    if (caps.fmp4flac === true) {
      return { route: 'fmp4-flac', reason: 'alac-repack-flac', lossless: true };
    }
    return { route: 'fmp4-opus', reason: 'alac-no-fmp4', lossless: false };
  }

  // Other lossless codecs the browser cannot decode: APE, WavPack, TTA,
  // TAK, WMA Lossless. All re-pack to fmp4-flac.
  if (lossless) {
    if (caps.fmp4flac === true) {
      return { route: 'fmp4-flac', reason: 'lossless-repack', lossless: true };
    }
    return { route: 'fmp4-opus', reason: 'lossless-no-fmp4flac', lossless: false };
  }

  // Unknown / lossy / WMA / etc — byte-range may or may not work depending
  // on browser. We give it a shot via byte-range first; the player
  // error-handler will pivot to fmp4-opus if needed (route taken by the
  // server when caps.fmp4flac is unknown and the source is lossy).
  return { route: 'byte-range', reason: 'unknown-attempt-passthrough', lossless: false };
}

module.exports = {
  decideVideoRoute,
  decideAudioRoute,
  pickAudioStreamIndex,
  // Exported for the small number of callers that test capability flags
  // directly (e.g. /api/episode/.../codecs response payload).
  SAFE_AUDIO_CODECS,
  INCOMPATIBLE_AUDIO_CODECS,
  ALWAYS_NATIVE_VIDEO_CODECS,
  WEBM_VIDEO_CODECS,
  NATIVE_CONTAINERS,
  ALWAYS_TRANSCODE_CONTAINERS,
};
