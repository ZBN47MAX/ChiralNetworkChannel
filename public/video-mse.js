// =============================================================================
// public/video-mse.js
// =============================================================================
//
// Client-side controller for the v1.9.0 fmp4-mse video lane.
//
// What it does
// ------------
// Fetches the live fmp4 stream from /api/episode/:id/fmp4-stream, demuxes
// fragments via mp4box.js, and feeds them into a MediaSource attached to
// a <video> element. On user-initiated seek (the <video>.seeking event),
// aborts the current fetch + flushes MSE buffers + opens a fresh request
// with `?t=<newSec>` so the server respawns ffmpeg from a new keyframe.
//
// Why we don't just use hls.js
// ----------------------------
// hls.js requires an HLS playlist. The whole reason the fmp4-mse lane
// exists is to avoid the playlist's "wait for ENDLIST" semantics. The
// project still ships hls.js for the iOS Safari fallback path and for
// when this controller hits an unrecoverable error.
//
// Lifecycle
// ---------
// 1. start(streamUrl): create MediaSource, attach to <video>, create
//    mp4boxFile, kick off fetch. The first ~200 KB of stream contains
//    the moov box; mp4boxFile.onReady fires once it's parsed.
// 2. onReady: for each track, addSourceBuffer with the codec mp4box
//    discovered, then setSegmentOptions so subsequent fragments arrive
//    as { trackId, buffer } pairs. Call initializeSegmentation() to
//    get init segments and appendBuffer them.
// 3. As stream chunks arrive, appendBuffer them into mp4box. Each chunk
//    in turn triggers zero or more onSegment callbacks; we forward
//    those to the matching SourceBuffer.
// 4. On <video>.seeking: call seekTo(newTimeSec). This aborts the
//    fetch (AbortController), removes existing SourceBuffer ranges,
//    and starts a fresh stream with `?t=<newTimeSec>`.
// 5. On fatal error: emit `error` event, the caller (app.js) falls
//    back to the HLS path.
//
// Caveats
// -------
// - mp4box.js must be loaded before this script (see index.html script
//   tags). If MP4Box is undefined we synthesize an error so caller can
//   gracefully fall back without crashing.
// - The video element's `duration` is set explicitly from the
//   X-Source-Duration response header; without that hint, MediaSource
//   reports `Infinity` until the stream ends, which breaks the Plyr
//   timeline UI.
// =============================================================================

(function () {
  'use strict';

  // Public class on the window for app.js to instantiate.
  window.ChiralVideoMse = ChiralVideoMse;

  // -----------------------------------------------------------------
  // Global suppression of HTMLMediaElement.play() AbortError noise.
  //
  // Why this exists:
  //   Every source-change on the <video> element — Plyr swapping
  //   .source, ChiralVideoMse rebuilding MediaSource on seek-restart,
  //   hls.js attaching to a new playlist, the v1.11.x fmp4-streamTo
  //   fallback re-setting plyr.source — transitions the element
  //   through `pause → load → play`. Any in-flight play() Promise
  //   from BEFORE the source swap rejects with AbortError. Both
  //   Plyr v3.8.4 AND hls.js internally call .play() without
  //   .catch(), so their orphaned Promise rejections land in
  //   `Uncaught (in promise) AbortError: The play() request was
  //   interrupted by a call to pause()` — even though the orphaned
  //   reject is harmless.
  //
  // What this does (two layers):
  //
  // Layer 1 — HTMLMediaElement.prototype.play() monkey patch:
  //   Every call to <video>.play() / <audio>.play() now returns a
  //   Promise whose AbortError reject is caught and swallowed
  //   internally. Other rejection types pass through unchanged. This
  //   is the strongest layer because it intercepts hls.js / Plyr /
  //   our own code at the only common API they all touch.
  //
  // Layer 2 — window 'unhandledrejection' listener:
  //   Belt-and-suspenders for code paths that bypass the prototype
  //   (some iframes, some browser extensions). event.preventDefault
  //   suppresses the console noise without affecting other rejection
  //   handlers.
  //
  // Idempotent — guarded by a sentinel on window so re-loading the
  // script (HMR, extension injection) does not stack patches.
  //
  // Trade-off:
  //   We swallow a class of warning that, in 99% of cases, is just
  //   timing noise. The 1% where it's a genuine "the user clicked
  //   play but media isn't actually loading" symptom is already
  //   covered by HTMLMediaElement's 'error' event (which Plyr
  //   forwards as its own 'error' event the player UI listens for).
  if (!window.__chiralPlayAbortSuppressed__) {
    window.__chiralPlayAbortSuppressed__ = true;

    // Layer 1: prototype patch.
    try {
      var origPlay = window.HTMLMediaElement && window.HTMLMediaElement.prototype
        && window.HTMLMediaElement.prototype.play;
      if (typeof origPlay === 'function') {
        window.HTMLMediaElement.prototype.play = function () {
          var result;
          try { result = origPlay.apply(this, arguments); }
          catch (syncErr) {
            if (syncErr && syncErr.name === 'AbortError') {
              return Promise.resolve();
            }
            throw syncErr;
          }
          if (result && typeof result.then === 'function') {
            return result.catch(function (err) {
              if (err && err.name === 'AbortError') {
                // Swallow. Resolve undefined to match the legacy
                // (pre-Promise-returning) shape so callers that
                // ignore the return value are unaffected.
                return undefined;
              }
              throw err;
            });
          }
          return result;
        };
      }
    } catch (_e) { /* swallow — leave native play in place */ }

    // Layer 2: belt-and-suspenders for non-prototype paths.
    window.addEventListener('unhandledrejection', function (event) {
      var reason = event && event.reason;
      if (!reason) return;
      var isAbort = reason.name === 'AbortError'
        || (typeof reason === 'object' && reason.code === 20);
      var msg = (typeof reason.message === 'string') ? reason.message : '';
      if (isAbort && /play\(\)|pause\(\)|load\(\)/i.test(msg)) {
        event.preventDefault();
      }
    });
  }

  /**
   * @brief Streaming MSE controller for the fmp4-mse lane.
   *
   * @param {HTMLVideoElement} videoEl
   * @param {Object} [opts]
   * @param {function(string): void} [opts.onError]
   *        Called on unrecoverable errors. The string is a short tag
   *        suitable for log lines + toast messages.
   * @param {function(): void} [opts.onPlayable]
   *        Called once the first SourceBuffer has data and the video
   *        element is in a state where Plyr's play button works.
   */
  function ChiralVideoMse(videoEl, opts) {
    this.video = videoEl;
    this.opts = opts || {};
    this.streamBaseUrl = null;
    this.sessionId = null;
    this.mediaSource = null;
    this.mp4boxFile = null;
    this.sourceBuffers = {}; // trackId -> SourceBuffer
    this.pendingAppends = {}; // trackId -> [ArrayBuffer queue]
    this.abortController = null;
    this.duration = null;
    this.destroyed = false;
    this.seeking = false;
    this.lastSeekTo = 0;

    // Lift seek handling onto the video element. We listen for
    // `seeking` rather than `seeked` because the user dragging the
    // Plyr scrubber fires seeking continuously while seeked only
    // fires after release; we want to start the server-side restart
    // as soon as the user releases the scrubber. seeked is in fact
    // the right edge — once the position has settled, kick off the
    // new fetch.
    this._onSeeked = this._onSeeked.bind(this);
    this.video.addEventListener('seeked', this._onSeeked);
  }

  ChiralVideoMse.prototype._emitError = function (tag) {
    if (this.opts.onError) {
      try { this.opts.onError(tag); } catch (_e) { /* swallow */ }
    }
  };

  ChiralVideoMse.prototype._emitPlayable = function () {
    if (this._emittedPlayable) return;
    this._emittedPlayable = true;
    if (this.opts.onPlayable) {
      try { this.opts.onPlayable(); } catch (_e) { /* swallow */ }
    }
  };

  /**
   * @brief Start streaming from the given base URL.
   *
   *        The base URL is everything except the `&t=<sec>` query — the
   *        controller appends t=0 on first start and t=<newPos> on
   *        seekTo. Example: `/api/episode/abc/fmp4-stream?file=ep.mkv`.
   *
   * @param {string} streamBaseUrl
   * @param {string} [sessionId] Server-side per-session disambiguator.
   * @param {number} [startSec=0]
   */
  ChiralVideoMse.prototype.start = function (streamBaseUrl, sessionId, startSec) {
    if (this.destroyed) return;
    if (typeof window.MP4Box === 'undefined' || !window.MP4Box.createFile) {
      this._emitError('mp4box-missing');
      return;
    }
    if (typeof window.MediaSource === 'undefined') {
      this._emitError('mse-unavailable');
      return;
    }
    this.streamBaseUrl = streamBaseUrl;
    this.sessionId = sessionId || null;
    this._startInternal(startSec || 0);
  };

  ChiralVideoMse.prototype._startInternal = function (startSec) {
    // Tear down any prior MediaSource so we don't have two pipelines
    // racing the same <video> element.
    this._teardownPipeline();
    this._emittedPlayable = false;
    // CRITICAL: stamp lastSeekTo with the start offset so the user-
    // seek detector in _onSeeked treats the upcoming browser-internal
    // "seek to startSec" as the controller's own restart, not as a
    // fresh user-initiated seek.
    //
    // Without this, the playEpisode resume path (onCanPlay sets
    // <video>.currentTime = resumeAt to honor saved progress) fires
    // a `seeked` event whose currentTime is ~resumeAt while
    // lastSeekTo is still 0 — _onSeeked sees a >1s delta and kicks
    // off a redundant fmp4 restart, which tears down the freshly-
    // started play() Promise as an AbortError. Initializing
    // lastSeekTo here closes the race.
    this.lastSeekTo = Number(startSec) || 0;

    var self = this;
    var ms = new MediaSource();
    this.mediaSource = ms;
    this.video.src = URL.createObjectURL(ms);

    ms.addEventListener('sourceopen', function () {
      if (self.destroyed) return;
      if (self.duration && Number.isFinite(self.duration)) {
        try { ms.duration = self.duration; } catch (_e) { /* swallow */ }
      }
      self._kickoffFetch(startSec);
    });

    ms.addEventListener('error', function () {
      self._emitError('mediasource-error');
    });
  };

  ChiralVideoMse.prototype._kickoffFetch = function (startSec) {
    var self = this;
    this.abortController = new AbortController();

    // Build URL with ?t=<sec>. The base may or may not already contain
    // a query string; handle both.
    var sep = this.streamBaseUrl.indexOf('?') === -1 ? '?' : '&';
    var url = this.streamBaseUrl + sep + 't=' + Math.max(0, Math.floor(startSec));
    if (this.sessionId) url += '&sid=' + encodeURIComponent(this.sessionId);

    // mp4box.js needs each appended buffer to carry a `.fileStart`
    // property indicating the absolute byte offset within the stream.
    // We maintain a running counter and stamp every chunk before
    // passing it in.
    var byteOffset = 0;
    this.mp4boxFile = window.MP4Box.createFile();
    this._wireMp4Box(this.mp4boxFile);

    fetch(url, {
      credentials: 'include',
      signal: this.abortController.signal,
    }).then(function (resp) {
      if (!resp.ok) {
        self._emitError('http-' + resp.status);
        return;
      }
      // Pull X-Source-Duration if the server reported it.
      var dur = parseFloat(resp.headers.get('X-Source-Duration') || '');
      if (Number.isFinite(dur) && dur > 0) {
        self.duration = dur;
        if (self.mediaSource && self.mediaSource.readyState === 'open') {
          try { self.mediaSource.duration = dur; } catch (_e) { /* swallow */ }
        }
      }
      var reader = resp.body.getReader();
      function pump() {
        if (self.destroyed) return;
        reader.read().then(function (r) {
          if (r.done) {
            if (self.mp4boxFile) {
              try { self.mp4boxFile.flush(); } catch (_e) {}
            }
            try { self.mediaSource.endOfStream(); } catch (_e) {}
            return;
          }
          var ab = r.value.buffer.slice(
            r.value.byteOffset,
            r.value.byteOffset + r.value.byteLength
          );
          ab.fileStart = byteOffset;
          byteOffset += r.value.byteLength;
          try {
            self.mp4boxFile.appendBuffer(ab);
          } catch (e) {
            self._emitError('mp4box-append');
            return;
          }
          pump();
        }).catch(function (e) {
          if (e && e.name === 'AbortError') return; // expected on seek
          self._emitError('fetch-' + (e && e.message ? 'err' : 'unknown'));
        });
      }
      pump();
    }).catch(function (e) {
      if (e && e.name === 'AbortError') return;
      self._emitError('fetch-init');
    });
  };

  /**
   * @brief Wire up mp4box callbacks: onReady creates SourceBuffers for
   *        every recognized track, initializeSegmentation supplies the
   *        moov-equivalent init segments, and onSegment forwards
   *        fragments to the right SourceBuffer.
   */
  ChiralVideoMse.prototype._wireMp4Box = function (file) {
    var self = this;

    file.onReady = function (info) {
      if (self.destroyed) return;
      if (self.duration == null && info.duration && info.timescale) {
        var dur = info.duration / info.timescale;
        if (Number.isFinite(dur) && dur > 0) {
          self.duration = dur;
          if (self.mediaSource && self.mediaSource.readyState === 'open') {
            try { self.mediaSource.duration = dur; } catch (_e) {}
          }
        }
      }
      // Create one SourceBuffer per track that the browser claims to
      // support. mp4box.js's track.codec is already in the form MSE
      // expects ("avc1.640028", "mp4a.40.2", etc).
      for (var i = 0; i < info.tracks.length; i++) {
        var t = info.tracks[i];
        var mime = (t.video ? 'video/mp4' : 'audio/mp4') + '; codecs="' + t.codec + '"';
        if (!window.MediaSource.isTypeSupported(mime)) continue;
        try {
          var sb = self.mediaSource.addSourceBuffer(mime);
          sb.mode = 'segments';
          self.sourceBuffers[t.id] = sb;
          self.pendingAppends[t.id] = [];
          self._wireSourceBuffer(t.id, sb);
          file.setSegmentOptions(t.id, sb, { nbSamples: 60 });
        } catch (e) {
          self._emitError('addsourcebuffer-' + t.id);
        }
      }
      var initBuffers = file.initializeSegmentation();
      for (var j = 0; j < initBuffers.length; j++) {
        var ib = initBuffers[j];
        self._queueAppend(ib.id, ib.buffer);
      }
      try { file.start(); } catch (_e) {}
    };

    file.onSegment = function (id, sb, buffer /*, sampleNum, isLast */) {
      if (self.destroyed) return;
      self._queueAppend(id, buffer);
    };

    file.onError = function (e) {
      self._emitError('mp4box-error');
    };
  };

  /**
   * @brief Manage append back-pressure per SourceBuffer.
   *
   *        SourceBuffer.appendBuffer is asynchronous and throws if the
   *        previous append is still updating. The queue serializes per-
   *        track appends; updateend pops the next one.
   */
  ChiralVideoMse.prototype._wireSourceBuffer = function (trackId, sb) {
    var self = this;
    sb.addEventListener('updateend', function () {
      var q = self.pendingAppends[trackId];
      if (!q) return;
      if (q.length === 0) {
        // First playable signal: the first track's first appendBuffer
        // has settled. Trigger Plyr's loaded-data path.
        self._emitPlayable();
        return;
      }
      var next = q.shift();
      try { sb.appendBuffer(next); } catch (e) {
        if (e.name === 'QuotaExceededError') {
          // Quota: trim oldest buffered range to free space, then
          // retry. Targeting back-to-current minus 30s strikes a
          // balance between keeping seek-back working and freeing
          // a useful chunk of the buffer.
          try {
            var bufferedRanges = sb.buffered;
            if (bufferedRanges.length > 0) {
              var endOfFirst = bufferedRanges.end(0);
              var nowT = self.video.currentTime;
              if (nowT - 30 > endOfFirst) {
                sb.remove(bufferedRanges.start(0), nowT - 30);
              } else {
                sb.remove(bufferedRanges.start(0), Math.max(bufferedRanges.start(0) + 1, nowT - 5));
              }
              q.unshift(next); // retry after the remove finishes
            }
          } catch (_e2) { /* swallow */ }
        } else {
          self._emitError('append-' + e.name);
        }
      }
    });
    sb.addEventListener('error', function () {
      self._emitError('sourcebuffer-error');
    });
  };

  ChiralVideoMse.prototype._queueAppend = function (trackId, buffer) {
    var sb = this.sourceBuffers[trackId];
    if (!sb) return;
    var q = this.pendingAppends[trackId] || (this.pendingAppends[trackId] = []);
    if (sb.updating || q.length > 0) {
      q.push(buffer);
      return;
    }
    try { sb.appendBuffer(buffer); }
    catch (e) {
      if (e.name === 'InvalidStateError') {
        // Source buffer was removed (e.g. seek tore everything down).
        // Drop the buffer; the new pipeline will request its own init.
        return;
      }
      this._emitError('append-init-' + e.name);
    }
  };

  /**
   * @brief Seek-restart: tear down the current pipeline and start a
   *        fresh fetch with the new t= parameter.
   */
  ChiralVideoMse.prototype.seekTo = function (newSec) {
    if (this.destroyed) return;
    if (!Number.isFinite(newSec) || newSec < 0) return;
    // Debounce: video.seeked can fire twice in rapid succession for a
    // single user drag (especially in Plyr); ignore if the target is
    // within ~250 ms of the previous request.
    if (Math.abs(newSec - this.lastSeekTo) < 0.25) return;
    this.lastSeekTo = newSec;
    this._startInternal(newSec);
  };

  ChiralVideoMse.prototype._onSeeked = function () {
    // Only treat user-initiated seeks as restart triggers. The
    // controller's own _startInternal sets video.currentTime which
    // also fires 'seeked'; skip if the seek lands close to the
    // current pipeline start (we recorded that in lastSeekTo).
    if (this.destroyed || !this.streamBaseUrl) return;
    var t = this.video.currentTime;
    // Within 1s of the previous start position: probably the auto-
    // seek that follows a pipeline reset, not a user drag.
    if (Math.abs(t - this.lastSeekTo) < 1) return;
    this.seekTo(t);
  };

  ChiralVideoMse.prototype._teardownPipeline = function () {
    if (this.abortController) {
      try { this.abortController.abort(); } catch (_e) {}
      this.abortController = null;
    }
    if (this.mediaSource) {
      try {
        if (this.mediaSource.readyState === 'open') {
          this.mediaSource.endOfStream();
        }
      } catch (_e) {}
      this.mediaSource = null;
    }
    this.mp4boxFile = null;
    this.sourceBuffers = {};
    this.pendingAppends = {};
  };

  ChiralVideoMse.prototype.destroy = function () {
    this.destroyed = true;
    this.video.removeEventListener('seeked', this._onSeeked);
    this._teardownPipeline();
    try { this.video.src = ''; this.video.load(); } catch (_e) {}
  };
})();
