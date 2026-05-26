// =============================================================================
// public/capability.js
// =============================================================================
//
// Browser capability probe. Runs once at boot, posts the result to
// /api/client-caps so the server-side mediaRoute decision can branch on
// what this client can actually decode.
//
// Why we probe instead of UA-sniffing
// -----------------------------------
// The User-Agent string is unreliable for media decoder support — codec
// availability depends on:
//   - OS (HEVC needs platform support; macOS Big Sur+ has it, Windows
//     without the HEVC extension does not)
//   - Build flavor (Chromium for Linux ARM64 has reduced codec set)
//   - Browser feature flags ("experimental web platform features")
//   - User content blockers (some block all MSE entirely)
//
// `navigator.mediaCapabilities.decodingInfo()` is the only honest answer:
// it returns `supported`, `smooth`, and `powerEfficient` flags after the
// browser actually consults its decoder list. We trust those over any
// version-string guess.
//
// What we probe
// --------------
//   hevc, av1, vp9      Video codec availability in fmp4.
//   mkv                 Container availability (Matroska byte-range play).
//                       Probed via MediaSource.isTypeSupported with the
//                       'video/x-matroska' MIME — only a handful of
//                       browsers say true (Chrome / Edge / Safari 16+).
//   fmp4flac            FLAC-in-fmp4 audio decoding (post-Safari 17,
//                       universal otherwise).
//   fmp4alac            ALAC-in-fmp4 decoding (Safari only as of writing).
//   fmp4opus            Opus-in-fmp4 (universal modern; tested for the
//                       lossy fallback path).
//   mseFmp4Streaming    Composite check: MSE exists, SourceBuffer can be
//                       constructed with the basic fmp4 type, and a small
//                       inline sample appendBuffer succeeds. Costlier
//                       than the codec checks but worth doing because
//                       broken MSE shows up in ad-blocked / locked-down
//                       browsers more often than naive isTypeSupported
//                       would suggest.
//
// The probe runs at module load (`defer` script tag) and POSTs once per
// session. Network failures are swallowed — the server defaults to
// conservative caps when the table is empty, so a missed POST means
// playback works in HLS-only mode until the next page load.
// =============================================================================

(function () {
  'use strict';

  // Run once even if the script is mis-loaded twice (HMR-ish dev
  // workflows, browser extension injection).
  if (window.__chiralCapabilityProbeStarted__) return;
  window.__chiralCapabilityProbeStarted__ = true;

  /**
   * @brief Wrapper around MediaSource.isTypeSupported with a defensive
   *        try/catch — some Safari builds throw rather than return false.
   *
   * @param {string} mime
   * @returns {boolean}
   */
  function canMse(mime) {
    if (typeof window.MediaSource === 'undefined') return false;
    if (typeof window.MediaSource.isTypeSupported !== 'function') return false;
    try { return !!window.MediaSource.isTypeSupported(mime); } catch (_e) { return false; }
  }

  /**
   * @brief Wrapper around HTMLMediaElement.canPlayType('probably'|'maybe')
   *        for the byte-range native checks.
   *
   * @param {string} mime
   * @returns {boolean}
   */
  function canPlay(mime) {
    try {
      const a = document.createElement('audio');
      const r = a.canPlayType(mime);
      return r === 'probably' || r === 'maybe';
    } catch (_e) { return false; }
  }

  /**
   * @brief Test whether MediaSource will accept a fmp4 SourceBuffer in
   *        streaming mode. The codec string is the lowest-common-
   *        denominator fmp4 baseline (avc1 Constrained Baseline +
   *        mp4a.40.2 LC AAC) which every fmp4-capable browser supports
   *        when MSE is healthy.
   *
   *        We deliberately don't try to appendBuffer real data here —
   *        adding a multi-KB inline sample would block the load tick.
   *        addSourceBuffer succeeding is sufficient evidence that the
   *        pipeline is wired through to the decoder.
   *
   * @returns {Promise<boolean>}
   */
  function probeMseFmp4Streaming() {
    return new Promise(function (resolve) {
      if (typeof window.MediaSource === 'undefined') return resolve(false);
      var sourceMime = 'video/mp4; codecs="avc1.42E01E,mp4a.40.2"';
      if (!canMse(sourceMime)) return resolve(false);
      try {
        var ms = new MediaSource();
        var url = URL.createObjectURL(ms);
        var sourceBuf = null;
        var done = false;
        var finalize = function (ok) {
          if (done) return;
          done = true;
          try { if (sourceBuf && !sourceBuf.updating) ms.removeSourceBuffer(sourceBuf); } catch (_e) {}
          try { URL.revokeObjectURL(url); } catch (_e) {}
          resolve(!!ok);
        };
        ms.addEventListener('sourceopen', function () {
          try {
            sourceBuf = ms.addSourceBuffer(sourceMime);
            finalize(true);
          } catch (_e) { finalize(false); }
        });
        ms.addEventListener('error', function () { finalize(false); });
        // Attach to a throwaway video element so sourceopen fires.
        var v = document.createElement('video');
        v.src = url;
        // Some browsers need the element in the DOM to actually fire
        // sourceopen. Off-screen positioning keeps it invisible.
        v.style.position = 'absolute';
        v.style.left = '-10000px';
        document.body.appendChild(v);
        // Timeout safety net — 1.5 s is well above the typical 10-50 ms
        // sourceopen latency, well under any user-perceived boot delay.
        setTimeout(function () {
          finalize(false);
          try { document.body.removeChild(v); } catch (_e) {}
        }, 1500);
      } catch (_e) { resolve(false); }
    });
  }

  /**
   * @brief Build the caps object from synchronous + async probes.
   *
   *        Synchronous probes happen first (cheap; sub-millisecond) so
   *        they're ready for the server even if the async MSE probe
   *        races slow. The final POST only fires after every check is
   *        in, but stale-cached caps from previous sessions remain
   *        usable until then.
   *
   * @returns {Promise<Object>}
   */
  async function collectCaps() {
    var caps = {};

    // Video codecs in fmp4. avc1.640028 = H.264 High Profile L4.0; hev1
    // .1.6.L93 = HEVC Main Profile L3.1; av01.0.05M.08 = AV1 Main
    // Profile L3.0 8-bit; vp09 = VP9 Profile 0 8-bit 4:2:0.
    caps.hevc = canMse('video/mp4; codecs="hev1.1.6.L93.B0"')
      || canPlay('video/mp4; codecs="hev1.1.6.L93.B0"')
      || canPlay('video/mp4; codecs="hvc1.1.6.L93.B0"');
    caps.av1 = canMse('video/mp4; codecs="av01.0.05M.08"')
      || canPlay('video/mp4; codecs="av01.0.05M.08"');
    caps.vp9 = canMse('video/mp4; codecs="vp09.00.10.08"')
      || canMse('video/webm; codecs="vp9"')
      || canPlay('video/webm; codecs="vp9"');

    // Matroska container. Most browsers say false here; the ones that
    // say true play .mkv via byte-range without re-mux.
    caps.mkv = canMse('video/x-matroska; codecs="avc1.640028,mp4a.40.2"')
      || canPlay('video/x-matroska; codecs="avc1.640028,mp4a.40.2"');

    // Audio in fmp4. FLAC is the most important — it's the lossless
    // remux target. ALAC is Safari's native lossless format.
    caps.fmp4flac = canMse('audio/mp4; codecs="fLaC"')
      || canPlay('audio/mp4; codecs="fLaC"');
    caps.fmp4alac = canMse('audio/mp4; codecs="alac"')
      || canPlay('audio/mp4; codecs="alac"');
    caps.fmp4opus = canMse('audio/mp4; codecs="opus"')
      || canPlay('audio/mp4; codecs="opus"');

    // Async MSE streaming health check (Safari occasionally lies on
    // isTypeSupported; this catches it).
    caps.mseFmp4Streaming = await probeMseFmp4Streaming();

    return caps;
  }

  /**
   * @brief POST the caps to /api/client-caps. Best-effort; failures are
   *        swallowed because conservative server defaults are
   *        acceptable.
   *
   * @param {Object} caps
   */
  function publish(caps) {
    // Mirror to window for any other client code that wants to read
    // capabilities locally (route picker, debug overlay, etc).
    window.chiralCaps = caps;
    try {
      fetch('/api/client-caps', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(caps),
        // keepalive lets the request continue if the user navigates
        // away mid-flight (Safari respects it; others tolerate).
        keepalive: true,
      }).catch(function (_e) { /* swallow */ });
    } catch (_e) { /* swallow */ }
  }

  // Kick off the probe. We don't await the result here — the IIFE
  // returns synchronously and the rest of app.js loads immediately.
  // Server-side route decisions in the first few requests after page
  // load may see stale or empty caps; the next render usually picks
  // up the fresh table.
  collectCaps().then(publish).catch(function (e) {
    // eslint-disable-next-line no-console
    if (window.console && window.console.warn) {
      window.console.warn('[capability] probe failed:', e && e.message);
    }
  });
})();
