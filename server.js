// Chiral Network Channel — dual-subsystem media library server (1.3)
// Video under /media, audio under /audio. Shared user accounts.
// Only administrators can create/edit/delete/upload collections.

const express = require('express');
const multer = require('multer');
const cookieParser = require('cookie-parser');
const path = require('path');
const fs = require('fs');

const config = require('./config');
const users = require('./lib/users');
const sessions = require('./lib/sessions');
const collectionsLib = require('./lib/collections');
const progressLib = require('./lib/progress');
const commentsLib = require('./lib/comments');
const favoritesLib = require('./lib/favorites');
const trackLikesLib = require('./lib/track-likes');
const audioLib = require('./lib/audio');
const lyricsLib = require('./lib/lyrics');
const categoriesLib = require('./lib/categories');
const duplicateWhitelistLib = require('./lib/duplicate-whitelist');
const auth = require('./lib/auth');
const albumArt = require('./lib/album-art');
const ffmpeg = require('./lib/ffmpeg');
const systemLoad = require('./lib/system-load');

const VERSION = require('./version.json').version;
const BOOT_TIME = Date.now();

const app = express();
app.set('trust proxy', 'loopback, linklocal, uniquelocal');

/* --------------------------------------------------------------------
 * Filename validation
 * ------------------------------------------------------------------ */
const INVALID_FILENAME_CHARS = /[\\/:*?"<>|]/;
function validateFilename(raw) {
  if (typeof raw !== 'string') return '文件名必须是字符串';
  const name = raw.trim();
  if (!name) return '文件名不能为空';
  if (name.length > 200) return '文件名过长';
  if (name === '.' || name === '..') return '文件名非法';
  if (name.startsWith('.')) return '文件名不能以点开头';
  if (INVALID_FILENAME_CHARS.test(name)) return '文件名包含非法字符';
  if (name.includes('/') || name.includes('\\')) return '文件名不能包含路径分隔符';
  return null;
}
function isSimpleFilename(name) {
  return typeof name === 'string' && name.length > 0
    && !name.includes('/') && !name.includes('\\');
}

// Safe relative path check used by routes that accept nested episode
// paths (media-stream, audio lyric/cover). A "safe" path is:
//   - non-empty, not absolute
//   - split on `/`, every segment non-empty, not `.`, not `..`
//   - no segment starting with `.`, `@`, or `#` (hidden files,
//     Synology system dirs, recycle bin)
//   - no Windows-illegal characters in any segment
// This is defence-in-depth — the subsequent path.join + startsWith
// check in the handler is the real security boundary. But rejecting
// obviously hostile input early keeps the access logs readable and
// fails fast on bugs rather than on disk-layout quirks.
const UNSAFE_PATH_SEG_CHARS = /[\\:*?"<>|]/;
function isSafeRelativePath(p) {
  if (typeof p !== 'string' || !p) return false;
  if (p.startsWith('/') || p.startsWith('\\')) return false;
  const parts = p.split('/');
  for (const part of parts) {
    if (!part) return false;
    if (part === '.' || part === '..') return false;
    if (part.startsWith('.')) return false;
    if (part.startsWith('@') || part.startsWith('#')) return false;
    if (UNSAFE_PATH_SEG_CHARS.test(part)) return false;
  }
  return true;
}

function setSidCookie(res, sid) {
  res.cookie(auth.SESSION_COOKIE, sid, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: config.SESSION_TTL_MS,
    path: '/',
  });
}
function publicUser(user) {
  if (!user) return null;
  // Backfill any kinds (video/audio/image/novel/...) missing on legacy
  // records. Single source of truth is config.CATEGORY_DEFAULTS.
  const vc = {};
  for (const k of Object.keys(config.CATEGORY_DEFAULTS || {})) vc[k] = [];
  if (user.visibleCategories && typeof user.visibleCategories === 'object') {
    for (const k of Object.keys(vc)) {
      if (Array.isArray(user.visibleCategories[k])) vc[k] = user.visibleCategories[k].slice();
    }
  }
  // Permissions: legacy records (created before 1.67) have no field;
  // fill with all-false so frontend code can read user.permissions.X
  // unconditionally without optional-chaining everywhere.
  const perms = { upload: false, create: false, modify: false, delete: false };
  if (user.permissions && typeof user.permissions === 'object') {
    for (const k of Object.keys(perms)) {
      if (user.permissions[k] === true) perms[k] = true;
    }
  }
  return {
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    visibleCategories: vc,
    permissions: perms,
  };
}
function errorStatus(err) {
  if (!err || !err.code) return 500;
  if (err.code === 'E_USER_EXISTS') return 409;
  if (err.code === 'E_USER_NOT_FOUND') return 404;
  if (err.code === 'E_COLLECTION_EXISTS') return 409;
  if (err.code === 'E_COLLECTION_NOT_FOUND') return 404;
  if (err.code === 'E_COLLECTION_NOT_EMPTY') return 409;
  if (err.code === 'E_COLLECTION_PROTECTED') return 403;
  if (err.code === 'E_EPISODE_NOT_FOUND') return 404;
  if (err.code.startsWith('E_INVALID_')) return 400;
  return 500;
}

/* --------------------------------------------------------------------
 * Login rate limiting (in-memory, per remote address)
 * ------------------------------------------------------------------ */
const loginAttempts = new Map();
const LOGIN_WINDOW_MS = 10 * 60 * 1000;
const LOGIN_MAX_FAIL = 10;

function clientIp(req) {
  return req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';
}
function loginBlocked(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= LOGIN_MAX_FAIL;
}
function recordLoginFailure(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now - entry.firstAt > LOGIN_WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAt: now });
  } else {
    entry.count += 1;
  }
}
function clearLoginFailures(ip) {
  loginAttempts.delete(ip);
}

/* --------------------------------------------------------------------
 * Boot
 * ------------------------------------------------------------------ */
async function boot() {
  // Per-step boot timing. Logs go to server.log via the VBS launcher's
  // stdio redirect, so launcher dump-on-failure can show where we hung.
  const bootStart = Date.now();
  const step = (label) => {
    const ms = Date.now() - bootStart;
    const pad = String(ms).padStart(6, ' ');
    console.log(`  [boot +${pad}ms] ${label}`);
  };

  step('boot start — node ' + process.version + ' pid=' + process.pid);
  step('  MEDIA_ROOT = ' + config.MEDIA_ROOT);
  step('  AUDIO_ROOT = ' + config.AUDIO_ROOT);
  step('  DATA_ROOT  = ' + config.DATA_ROOT);

  await users.init();
  step('users.init done (' + users.count() + ' users)');
  await sessions.init();
  step('sessions.init done');

  // --- Per-subsystem stores -----------------------------------------
  const videoStore = collectionsLib.createStore({
    root: config.MEDIA_ROOT,
    mediaExts: config.VIDEO_EXTS,
    imageExts: config.IMAGE_EXTS,
    subtitleExts: config.VIDEO_SUBTITLE_EXTS,
    validTypes: config.VIDEO_TYPES,
    defaultType: 'other',
  });
  videoStore.init();
  step('videoStore.init done (migrated media/ folders)');

  const audioStore = audioLib.createAudioStore(config);
  audioStore.init();
  audioStore.ensureDefaultCollection();
  step('audioStore.init done');

  const imageStore = collectionsLib.createStore({
    root: config.IMAGE_ROOT,
    mediaExts: config.IMAGE_EXTS,
    imageExts: config.IMAGE_EXTS,
    subtitleExts: [],
    validTypes: config.IMAGE_TYPES,
    defaultType: 'other',
  });
  imageStore.init();
  step('imageStore.init done');

  // Novel subsystem — skeleton store. Reader UI (TXT/PDF rendering)
  // is shipped in a follow-up; this just wires CRUD/upload/listing
  // through the same lib/collections code path used by video/image.
  fs.mkdirSync(config.NOVEL_ROOT, { recursive: true });
  const novelStore = collectionsLib.createStore({
    root: config.NOVEL_ROOT,
    mediaExts: config.NOVEL_EXTS,
    imageExts: config.IMAGE_EXTS,
    subtitleExts: [],
    validTypes: config.NOVEL_TYPES,
    defaultType: 'other',
  });
  novelStore.init();
  step('novelStore.init done');

  // Boot-time embedded-art scan for audio collections.
  //
  // For every audio collection that doesn't already have a cover file
  // (cover.jpg / folder.jpg / poster.jpg / etc.), walk its tracks in
  // natural-sort order and try to extract the first embedded picture,
  // writing it as a sidecar so findCoverFor() picks it up next time a
  // list/get request comes in.
  //
  // This runs asynchronously in the background — boot doesn't wait.
  // First-request latency isn't affected because `summarize()` re-reads
  // the folder on every /api/collections call, so as soon as the scan
  // finishes for a collection, the next request sees the new cover.
  // Per-file errors are silently ignored so one malformed tag can't
  // block the whole library.
  (async () => {
    try {
      const cols = audioStore.listCollections({ includeHidden: true });
      let extracted = 0;
      for (const col of cols) {
        const abs = audioStore.resolveCollectionPath(col.id);
        if (!abs) continue;
        try {
          const res = await albumArt.scanCollectionFolder(abs, config.AUDIO_EXTS);
          if (res && res.status === 'extracted') extracted++;
        } catch (_e) { /* per-collection error, move on */ }
      }
      if (extracted > 0) {
        console.log(`  album-art: extracted covers for ${extracted} audio collection(s)`);
      }
    } catch (e) {
      console.warn('  album-art boot scan failed:', e.message);
    }
  })();

  const videoProgress = progressLib.createStore({
    file: path.join(config.DATA_ROOT, 'progress.json'),
  });
  const audioProgress = progressLib.createStore({
    file: path.join(config.DATA_ROOT, 'audio-progress.json'),
  });
  const imageProgress = progressLib.createStore({
    file: path.join(config.DATA_ROOT, 'image-progress.json'),
  });
  const novelProgress = progressLib.createStore({
    file: path.join(config.DATA_ROOT, 'novel-progress.json'),
  });
  await videoProgress.init();
  await audioProgress.init();
  await imageProgress.init();
  await novelProgress.init();
  step('progress stores loaded');

  const videoComments = commentsLib.createStore({
    file: path.join(config.DATA_ROOT, 'comments.json'),
  });
  const audioComments = commentsLib.createStore({
    file: path.join(config.DATA_ROOT, 'audio-comments.json'),
  });
  const imageComments = commentsLib.createStore({
    file: path.join(config.DATA_ROOT, 'image-comments.json'),
  });
  const novelComments = commentsLib.createStore({
    file: path.join(config.DATA_ROOT, 'novel-comments.json'),
  });
  await videoComments.init();
  await audioComments.init();
  await imageComments.init();
  await novelComments.init();
  step('comments stores loaded');

  const videoFavorites = favoritesLib.createStore({
    file: path.join(config.DATA_ROOT, 'favorites.json'),
  });
  const audioFavorites = favoritesLib.createStore({
    file: path.join(config.DATA_ROOT, 'audio-favorites.json'),
  });
  const imageFavorites = favoritesLib.createStore({
    file: path.join(config.DATA_ROOT, 'image-favorites.json'),
  });
  const novelFavorites = favoritesLib.createStore({
    file: path.join(config.DATA_ROOT, 'novel-favorites.json'),
  });
  const trackLikes = trackLikesLib.createStore({
    file: path.join(config.DATA_ROOT, 'audio-track-likes.json'),
  });
  const imageLikes = trackLikesLib.createStore({
    file: path.join(config.DATA_ROOT, 'image-likes.json'),
  });
  await videoFavorites.init();
  await audioFavorites.init();
  await imageFavorites.init();
  await novelFavorites.init();
  await trackLikes.init();
  await imageLikes.init();
  step('favorites stores loaded');

  const categoriesStore = categoriesLib.createStore({
    file: path.join(config.DATA_ROOT, 'categories.json'),
    seed: config.CATEGORY_DEFAULTS,
  });
  await categoriesStore.init();
  step('categories store loaded');

  const dupWhitelist = duplicateWhitelistLib.createStore({
    file: path.join(config.DATA_ROOT, 'duplicate-whitelist.json'),
  });
  await dupWhitelist.init();
  step('duplicate whitelist loaded');

  // ffmpeg probe — the streaming transcode layer needs a working
  // ffmpeg + ffprobe binary. Failure is non-fatal: whitelisted formats
  // (mp4/m4v/webm) keep playing via the static /media mount, it's only
  // the /media-stream route for AVI/WMV/MKV/... that goes down.
  const ff = await ffmpeg.init(config);
  if (ff.ok) {
    step(`ffmpeg: ready [${ff.source}] ${ff.version}`);
  } else {
    step(`ffmpeg: NOT AVAILABLE [${ff.source}] — ${ff.reason}`);
    console.warn('  /media-stream will return 503 until a valid ffmpeg binary is found.');
    console.warn('  See bin/ffmpeg/README.md for install instructions.');
  }

  // --- Middleware ---------------------------------------------------
  app.use(express.json({ limit: '64kb' }));
  app.use(cookieParser());
  app.use(auth.loadSession(sessions, users));

  // ============================================================
  // Adaptive transcode scheduler — access tracker.
  // ------------------------------------------------------------
  // The HLS pretranscode queue (further down) decides between three
  // tiers — paused / throttled / full — using two inputs: CPU idle %
  // (lib/system-load.js) and "is anyone actively using the site".
  // The latter is just "did any logged-in user hit any API endpoint
  // in the last ACCESS_TTL_MS". Implemented as a single shared
  // wall-clock timestamp, updated on every authenticated request via
  // this tiny middleware. Cheap enough (one Date.now() per req) that
  // we don't bother debouncing.
  //
  // Why "any authenticated request" rather than "playback-only":
  // browsing the collection list, scrolling thumbnails, refreshing
  // the queue panel — all of those are "user actively using the
  // site" signals. The user explicitly asked for this in the
  // 2026-05-10 design discussion: "登录用户在线就算" (a logged-in
  // user being online counts as active).
  //
  // 5-minute TTL: long enough that page transitions / polling lulls
  // don't flap throttled→full→throttled, short enough that closing
  // the browser unlocks full-throttle within minutes.
  // ============================================================
  const ACCESS_TTL_MS = 5 * 60 * 1000;
  const accessTracker = { lastApiHitAt: 0 };
  app.use((req, _res, next) => {
    if (req.user) accessTracker.lastApiHitAt = Date.now();
    next();
  });
  function isAnyoneAccessing() {
    return accessTracker.lastApiHitAt > 0
      && (Date.now() - accessTracker.lastApiHitAt) < ACCESS_TTL_MS;
  }
  // CPU idle sampler — one global instance. Started here so it is
  // running before any HLS request can land.
  systemLoad.start();

  // index.html — version-injected so the `?v=__BUILD__` cache-busters
  // on app.js / style.css always match the running server. no-cache so
  // browsers always revalidate (304 saves the body when unchanged); the
  // versioned children are then immutable for a year.
  //
  // __VERSION__ is the human-readable form (e.g. "Release1.8.0") used
  // for in-page display like the menu footer. Kept separate from the
  // URL-encoded __BUILD__ so we don't get %2E in the displayed text.
  const indexPath = path.join(__dirname, 'public', 'index.html');
  const indexHtml = fs.readFileSync(indexPath, 'utf8')
    .replace(/__BUILD__/g, encodeURIComponent(VERSION))
    .replace(/__VERSION__/g, VERSION);
  const serveIndex = (req, res) => {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.send(indexHtml);
  };
  app.get('/', serveIndex);
  app.get('/index.html', serveIndex);

  // Service worker: must NOT be long-cached or clients can get stuck on
  // an old SW after a server upgrade. The SW spec already caps it at
  // 24h, but no-cache is the safe default — served fresh on every
  // navigation, the browser revalidates against the file.
  app.get('/sw.js', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Service-Worker-Allowed', '/');
    res.sendFile(path.join(__dirname, 'public', 'sw.js'));
  });

  // Static assets (app.js, style.css, vendor/*, etc.) — long cache.
  // The `?v=<version>` query string in index.html invalidates app.js
  // and style.css on every release; vendor/plyr/* never change so
  // immutable is safe even without a buster.
  app.use(express.static(path.join(__dirname, 'public'), {
    maxAge: '30d',
    immutable: true,
    index: false,
  }));

  // Subsystem file mounts use dedicated URLs so they don't shadow the
  // /audio/api/* API routes. `/media-files` serves videos, `/audio-files`
  // serves audio + lyric sidecars. (`/media` is kept for backwards-compat.)
  // Explicit MIME map for every video extension we accept. Node's `send`
  // (which powers express.static) has a built-in mime-db, but some of the
  // less common extensions either map to application/octet-stream or to
  // a format string that confuses browser codec detection (e.g. nothing
  // for .rmvb). Octet-stream makes browsers refuse to even TRY decoding,
  // so we set them all explicitly below. Formats the browser genuinely
  // can't decode (AVI/WMV/FLV/RMVB/RM) still won't play, but setting a
  // real MIME type lets the client-side error handler recognize "format
  // not supported" vs "file missing" and show the right message.
  const VIDEO_MIME = {
    '.mp4':  'video/mp4',
    '.m4v':  'video/mp4',
    '.webm': 'video/webm',
    '.ogv':  'video/ogg',
    '.ogg':  'video/ogg',
    '.mov':  'video/quicktime',
    '.mkv':  'video/x-matroska',
    '.avi':  'video/x-msvideo',
    '.wmv':  'video/x-ms-wmv',
    '.flv':  'video/x-flv',
    '.ts':   'video/mp2t',
    '.mts':  'video/mp2t',
    '.m2ts': 'video/mp2t',
    '.3gp':  'video/3gpp',
    '.rmvb': 'application/vnd.rn-realmedia-vbr',
    '.rm':   'application/vnd.rn-realmedia',
  };
  const videoStaticHandler = express.static(config.MEDIA_ROOT, {
    acceptRanges: true,
    cacheControl: false,
    dotfiles: 'ignore',
    fallthrough: false,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.vtt') { res.setHeader('Content-Type', 'text/vtt; charset=utf-8'); return; }
      if (ext === '.srt') { res.setHeader('Content-Type', 'text/plain; charset=utf-8'); return; }
      const mime = VIDEO_MIME[ext];
      if (mime) res.setHeader('Content-Type', mime);
    },
  });
  app.use('/media', auth.mediaGuard(config.IMAGE_EXTS), videoStaticHandler);

  // ================================================================
  // /media-stream/:id/:file — on-the-fly transcode stream.
  //
  // The /media static handler above serves files byte-for-byte with
  // Range support. That's perfect for mp4/webm/m4v which the browser
  // can decode natively. For every other video container (avi, wmv,
  // mkv, flv, rmvb, ts, ...) the browser either can't decode it at all
  // or can't decode the codec inside, and we need ffmpeg to remux or
  // re-encode the stream into fragmented MP4 in real time.
  //
  // The response is a streaming MP4 (no Accept-Ranges). Seeking is
  // handled client-side by re-requesting this URL with ?t=<seconds>,
  // which we pass to ffmpeg as an input-seek offset.
  //
  // Auth mirrors /media (videos require a session; images don't apply
  // here since this endpoint only serves video).
  //
  // The `*` param captures the episode path within the collection folder
  // and lives in req.params[0]. It may contain forward slashes for
  // nested files (e.g. "Season 1/S01E01.mp4"). isSafeRelativePath plus
  // the post-resolve startsWith check below guarantee the resolved
  // file stays inside folderAbs — no traversal possible.
  app.get('/media-stream/:id/*', auth.requireAuth, async (req, res) => {
    const id = req.params.id;
    const file = req.params[0];
    if (collectionsLib.validateId(id) !== null) {
      return res.status(400).type('text/plain').send('invalid collection id');
    }
    if (!isSafeRelativePath(file)) {
      return res.status(400).type('text/plain').send('invalid filename');
    }
    const folderAbs = videoStore.resolveCollectionPath(id);
    if (!folderAbs) return res.status(404).type('text/plain').send('collection not found');
    const fileAbs = path.resolve(folderAbs, file);
    // Real security boundary: confirm the resolved absolute path is
    // still rooted inside the collection folder. Cheap, catches bugs
    // in isSafeRelativePath if any slip through, and is independent
    // of path-separator shenanigans on different OSes.
    if (fileAbs !== folderAbs && !fileAbs.startsWith(folderAbs + path.sep)) {
      return res.status(400).type('text/plain').send('invalid path');
    }
    if (!fs.existsSync(fileAbs)) {
      return res.status(404).type('text/plain').send('episode not found');
    }
    const ext = path.extname(file).toLowerCase();
    if (!config.VIDEO_EXTS.includes(ext)) {
      return res.status(400).type('text/plain').send('not a video file');
    }

    const startSec = Math.max(0, Number(req.query.t) || 0);
    try {
      await ffmpeg.streamTo(fileAbs, res, { startSec });
    } catch (e) {
      // streamTo handles its own error paths (destroys the response on
      // spawn failure), so this catch is only for programming errors.
      console.error('media-stream handler error:', e);
      if (!res.headersSent) res.status(500).type('text/plain').send('stream error');
    }
  });

  // Admin-only diagnostic — used by the settings panel to show whether
  // the transcode layer is alive and which binary is in use.
  app.get('/api/system/ffmpeg', auth.requireAdmin, (_req, res) => {
    res.json(ffmpeg.status());
  });

  // ============================================================
  // Embedded subtitle support (mkv-internal SRT/ASS streams).
  //
  // Browsers (notably Chromium) don't expose mkv-internal text
  // subtitle tracks via player.textTracks. To unblock users with
  // Amazon-rip mkvs that ship 10+ language SRT inside the container,
  // these two routes:
  //
  //   GET /api/episode/:cid/:file/embedded-subs
  //     → ffprobe the file, return JSON of text subtitle streams.
  //       Used by the manual-subtitle dialog to compose its picker
  //       list alongside scanSidecars' external files.
  //
  //   GET /subtitle-extract/:cid/:file/:streamIdx.vtt
  //     → ffmpeg-extract that one stream to WebVTT, cache to
  //       data/subtitle-cache/<sha1>-<streamIdx>.vtt, serve it.
  //       Cached entries are reused on subsequent requests; the
  //       cache is keyed off (collection id, file path, stream
  //       index) so renaming or moving the source busts the cache.
  // ============================================================

  const subtitleCacheDir = path.join(config.DATA_ROOT, 'subtitle-cache');
  try { fs.mkdirSync(subtitleCacheDir, { recursive: true }); } catch (_e) {}

  /**
   * @brief Resolve and validate a (collection id, episode file)
   *        request param pair. Mirrors the security boundary used in
   *        /media-stream — invalid id, unsafe path, traversal, and
   *        non-video extension all 4xx out before any disk I/O.
   * @returns Absolute file path on success, or { status, message }
   *          object describing the failure reason.
   */
  function resolveEpisodeFile(req) {
    const id = req.params.id;
    const file = req.params[0];
    if (collectionsLib.validateId(id) !== null) {
      return { status: 400, message: 'invalid collection id' };
    }
    if (!isSafeRelativePath(file)) {
      return { status: 400, message: 'invalid filename' };
    }
    const folderAbs = videoStore.resolveCollectionPath(id);
    if (!folderAbs) return { status: 404, message: 'collection not found' };
    const fileAbs = path.resolve(folderAbs, file);
    if (fileAbs !== folderAbs && !fileAbs.startsWith(folderAbs + path.sep)) {
      return { status: 400, message: 'invalid path' };
    }
    if (!fs.existsSync(fileAbs)) return { status: 404, message: 'episode not found' };
    const ext = path.extname(file).toLowerCase();
    if (!config.VIDEO_EXTS.includes(ext)) {
      return { status: 400, message: 'not a video file' };
    }
    return { fileAbs, id, file };
  }

  // ============================================================
  // HLS audio-remux pipeline (1.7.40) — for mkvs whose audio codec
  // the browser can't decode (EAC3 / DTS / TrueHD / MLP). Replaces
  // the 1.7.39 mp4 pre-remux approach (which had ffmpeg `.mp4.part`
  // extension issues, and required waiting 1-3 minutes before the
  // user could see anything). HLS streams the result as 6-second
  // .ts segments + an event playlist; client-side hls.js fetches
  // the playlist and plays segments as they appear, so the user
  // sees video + hears audio within ~5-10 seconds of pressing play
  // and can seek to any point that's already been transcoded.
  //
  // Cache key is sha1(collectionId|epFile); cache dir contains
  // playlist.m3u8 + seg00000.ts seg00001.ts ... once an ep has
  // been fully transcoded the playlist closes with #EXT-X-ENDLIST
  // and subsequent plays just static-serve the cached files.
  // ============================================================
  const hlsCacheDir = path.join(config.DATA_ROOT, 'hls-cache');
  try { fs.mkdirSync(hlsCacheDir, { recursive: true }); } catch (_e) {}

  /**
   * Map<cacheKey, {
   *   proc:      ChildProcess (or null for orphan jobs adopted from
   *              a previous node process).
   *   pid:       proc.pid (or scanned pid for orphans). On POSIX this
   *              is also the process-group id because
   *              startHlsTranscode passes detached:true. The
   *              scheduler signals via process.kill(-pgid, sig) so
   *              libx264 worker threads pause/resume atomically.
   *   startedAt: ms epoch ffmpeg was spawned (or adopted).
   *   epFile:    ep file path; only used for log lines.
   *   fromQueue: true for queue-spawned jobs (every job in the new
   *              scheduler is a queue job; on-demand transcode was
   *              removed in 1.9.0 — see /hls-start handler).
   *   orphan:    true for jobs adopted from a prior node process
   *              (see scanOrphanFfmpegs).
   *   tier:      'full' | 'throttle' — captured at spawn time so the
   *              status panel can show why this job got those
   *              ffmpeg parameters.
   *   paused:    true while the job is SIGSTOP'd by the scheduler
   *              (someone is actively using the site AND CPU is
   *              busy). Cleared by the next SIGCONT.
   * }>
   *
   * Tracks in-flight ffmpeg HLS jobs so the queue worker doesn't
   * double-spawn into the same cache dir, the orphan reaper can
   * find them, and the scheduler can SIGSTOP/SIGCONT them as
   * traffic and CPU load shift between tiers.
   */
  const hlsJobs = new Map();

  // ============================================================
  // Adaptive scheduler config (1.9.0, revised post-deploy).
  // ------------------------------------------------------------
  // Three tiers, picked once per HLS_QUEUE_TICK_MS:
  //
  //   'full'     no logged-in user has hit any API in ACCESS_TTL_MS
  //              (default 5min). Spawn the next queue job with
  //              -threads 3 + nice 0 — about 80% of a 4-core DS124,
  //              leaving one core free for DSM background services.
  //
  //   'throttle' someone IS using the site AND CPU idle > 60%.
  //              Spawn with -threads 2 + nice 0 — about 50% of the
  //              box, light enough for browsing.
  //
  //   'wait'     someone is using the site AND CPU idle ≤ 60%.
  //              DO NOT spawn a new job. Already-running jobs are
  //              left alone — see "no SIGSTOP" note below.
  //
  // No SIGSTOP / paused tier
  // ------------------------
  // The original 1.9.0 design had a 'paused' tier that SIGSTOP'd
  // running jobs whenever idle dipped below 60%. Field test showed
  // this thrashed: a -threads 2 ffmpeg on the DS124 itself drives
  // idle to ~10%, which immediately triggers paused → SIGSTOP →
  // idle jumps to 90% → SIGCONT → idle drops → SIGSTOP. Loop every
  // 5s, ffmpeg made no progress.
  //
  // The fix the user picked (2026-05-10): drop the 'paused' tier
  // entirely. The 60% threshold is now ONLY a "should we spawn a
  // NEW job" gate. Once a job is spawned, -threads 2 caps it at
  // ~50% of the box on its own — that's the throttle the user
  // actually wanted; we don't need scheduler-level pause on top.
  // Already-running jobs run to completion regardless of tier
  // changes.
  // ============================================================
  const IDLE_THRESHOLD_PCT = 60;
  // Sampled by lib/system-load.js every 5s — same cadence as the
  // queue tick, so the idle reading is at most one tick stale.
  function pickTier() {
    if (!isAnyoneAccessing()) return 'full';
    if (systemLoad.getIdlePercent() > IDLE_THRESHOLD_PCT) return 'throttle';
    return 'wait';
  }

  /**
   * @brief Suspend an ffmpeg job via SIGSTOP. Targets the process
   *        group (negative pid) on POSIX so libx264 worker threads
   *        and any helper processes freeze together — leaving even
   *        one worker running would burn CPU while the scheduler
   *        thinks it has yielded.
   *
   *        SIGSTOP cannot be caught or ignored, which is exactly
   *        what we want: ffmpeg has no chance to scribble half a
   *        segment while transitioning.
   *
   *        Windows has no SIGSTOP-equivalent for child processes
   *        outside of the debugger API; on Windows we no-op (dev
   *        box only — the scheduler still tracks paused state for
   *        diagnostics, but ffmpeg keeps running).
   */
  function pauseJob(rec) {
    if (!rec || rec.paused || !rec.pid) return;
    rec.paused = true;
    if (process.platform === 'win32') return;
    try {
      process.kill(-rec.pid, 'SIGSTOP');
      console.log('hls pause:', rec.epFile, '(pgid=' + rec.pid + ')');
    } catch (e) {
      console.warn('hls pause failed pgid', rec.pid, ':', e.message);
    }
  }

  /**
   * @brief Resume a previously SIGSTOP'd job via SIGCONT. Same
   *        process-group target as pauseJob so every libx264
   *        worker wakes up. Idempotent: SIGCONT to a not-stopped
   *        process is a harmless no-op at the kernel level, but we
   *        gate on rec.paused anyway to keep the log honest.
   */
  function resumeJob(rec) {
    if (!rec || !rec.paused || !rec.pid) return;
    rec.paused = false;
    if (process.platform === 'win32') return;
    try {
      process.kill(-rec.pid, 'SIGCONT');
      console.log('hls resume:', rec.epFile, '(pgid=' + rec.pid + ')');
    } catch (e) {
      console.warn('hls resume failed pgid', rec.pid, ':', e.message);
    }
  }

  // Orphan reaper interval. Single-purpose now (1.9.0): the
  // 1.8.x demote scanner is gone — the scheduler tick handles
  // pause/resume on its own cadence and there are no tier
  // promotions to log. We still need to reap orphans because
  // adopted ffmpeg processes don't fire 'exit' on the parent
  // proc handle (we don't own it), so we poll kill -0 to detect
  // when they die and clean up the queue row.
  const HLS_ORPHAN_SCAN_MS = 15000;
  setInterval(() => {
    for (const [key, rec] of hlsJobs) {
      if (!rec.orphan) continue;
      let alive = true;
      try { process.kill(rec.pid, 0); } catch (_e) { alive = false; }
      if (!alive) {
        hlsJobs.delete(key);
        // Drop the queue entry too. ENDLIST present → cache is
        // canonical and on-demand access just static-serves.
        // ENDLIST absent → partial cache; the next /hls-start
        // for this file re-enqueues and the scheduler tries
        // again. Either way the worker is done with this row.
        hlsQueue.delete(key);
        saveHlsQueue();
        console.log('hls orphan exit: ' + rec.epFile + ' (pid=' + rec.pid + ')');
      }
    }
  }, HLS_ORPHAN_SCAN_MS).unref();

  // ============================================================
  // HLS pre-transcode queue
  // ------------------------------------------------------------
  // User-triggered batch transcode for an entire collection. The
  // intent (per user request 2026-05-10): import a batch of HEVC
  // mkvs in the evening, the box can't keep up with realtime
  // playback today, but overnight pre-transcode means tomorrow
  // every file in that collection cache-hits and plays instantly.
  //
  // Queue model (1.9.0 adaptive rewrite):
  //   - Map<cacheKey, {id, file, fileAbs, audioStreamIndex,
  //                    addedAt, status, epFile}>
  //   - Persisted to data/hls-queue.json on every mutation so
  //     queue survives node + NAS restarts.
  //   - Single source of transcode in this rewrite: there is no
  //     longer an "on-demand viewer transcode" path. /hls-start
  //     either returns a cached ENDLIST playlist or enqueues +
  //     refuses playback. The queue is the ONLY place ffmpeg gets
  //     spawned for HLS — keeps the CPU budget centrally policed.
  //   - Worker fires every HLS_QUEUE_TICK_MS and:
  //       a. picks a tier ('full' | 'throttle' | 'wait') from
  //          access activity + CPU idle %.
  //       b. wait: someone using site + CPU busy → no new spawn,
  //          let any running job finish (-threads 2 caps it).
  //       c. throttle: spawn next job at -threads 2 nice 0
  //          (~50% of 4 cores).
  //       d. full: spawn next job at -threads 3 nice 0
  //          (~80% of 4 cores).
  //   - Cache hit (ENDLIST present) before spawn → drop from
  //     queue without spawning.
  // ============================================================
  const hlsQueue = new Map();
  const hlsQueuePath = path.join(config.DATA_ROOT, 'hls-queue.json');
  // 5s tick — same window as the CPU sampler. Faster than that and
  // a transient load spike would flap a job paused→running→paused
  // multiple times before the average settled.
  const HLS_QUEUE_TICK_MS = 5000;

  function loadHlsQueue() {
    try {
      const raw = fs.readFileSync(hlsQueuePath, 'utf8');
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        for (const item of arr) {
          if (item && item.key) {
            // Reset any stale 'running' from a prior node session
            // back to 'pending' — a running entry from before the
            // restart is an orphan whose ffmpeg may still be alive
            // (stdio:ignore + detached on POSIX) or may have died.
            // Re-evaluating it via the worker is safest: cache-hit
            // path drops it cleanly, otherwise we restart it.
            item.status = 'pending';
            const { key, ...rest } = item;
            hlsQueue.set(key, rest);
          }
        }
        if (hlsQueue.size > 0) console.log('hls queue loaded:', hlsQueue.size, 'entries');
      }
    } catch (_e) {
      // First boot or corrupt file — start fresh. Don't bail on
      // boot for queue state; the queue is a convenience layer.
    }
  }
  function saveHlsQueue() {
    try {
      const arr = [];
      for (const [k, v] of hlsQueue) arr.push({ key: k, ...v });
      fs.writeFileSync(hlsQueuePath, JSON.stringify(arr, null, 2));
    } catch (e) {
      console.warn('hls queue save failed:', e.message);
    }
  }
  loadHlsQueue();

  /**
   * @brief Adopt ffmpeg processes that survived a node restart.
   *
   *        startHlsTranscode uses stdio:ignore + detached:true on
   *        POSIX so ffmpeg keeps running across node restarts (the
   *        whole point of the overnight pretranscode design). But
   *        a fresh node has an empty hlsJobs Map, and the queue
   *        worker would happily spawn a SECOND ffmpeg into the
   *        same cache dir on next tick — overlapping segment
   *        writes corrupt the .m3u8 and ruin the cache.
   *
   *        Fix: scan ps for ffmpeg processes whose cmdline
   *        targets one of our hls-cache/<key>/ dirs, register
   *        each as an "orphan" entry in hlsJobs (proc:null since
   *        we don't own the handle, but pid + epFile + flags
   *        let the demote scanner / worker treat them correctly).
   *        The 15s scanner polls kill -0 to detect orphan exit
   *        and cleans up.
   */
  function scanOrphanFfmpegs() {
    if (process.platform === 'win32') return;
    let psOut = '';
    try {
      const { execSync } = require('child_process');
      psOut = execSync('ps -e -o pid,nice,args 2>/dev/null', { encoding: 'utf8', timeout: 5000 });
    } catch (e) {
      console.warn('hls orphan scan: ps failed:', e.message);
      return;
    }
    let adopted = 0;
    for (const line of psOut.split('\n')) {
      if (!line.includes('ffmpeg')) continue;
      const m = line.match(/hls-cache[/\\]([0-9a-f]{40})[/\\]/);
      if (!m) continue;
      const key = m[1];
      if (hlsJobs.has(key)) continue; // already tracked
      const trimmed = line.trim();
      const pidMatch = trimmed.match(/^(\d+)\b/);
      if (!pidMatch) continue;
      const pid = Number(pidMatch[1]);
      const qEntry = hlsQueue.get(key);
      hlsJobs.set(key, {
        proc: null,
        pid,
        startedAt: Date.now(),
        epFile: (qEntry && qEntry.epFile) || ('orphan-' + key.slice(0, 8)),
        fromQueue: !!qEntry,
        orphan: true,
        // Adopted jobs were spawned by some prior process and we
        // don't know whether the previous node had paused them.
        // Default to "running"; if the new scheduler tick picks
        // 'paused' it'll send SIGSTOP and we'll converge.
        paused: false,
        tier: (qEntry && qEntry.epFile) ? 'unknown' : 'unknown',
      });
      // Mark queue entry running so worker pick-list skips it.
      if (qEntry) { qEntry.status = 'running'; }
      adopted++;
      console.log('hls orphan adopted: pid=' + pid + ' key=' + key.slice(0, 8) + ' file=' + ((qEntry && qEntry.epFile) || '?'));
    }
    if (adopted > 0) saveHlsQueue();
  }
  // Run once at boot (after loadHlsQueue) so the first worker
  // tick already sees the orphans.
  scanOrphanFfmpegs();

  /**
   * @brief List every in-flight queue ffmpeg the scheduler should
   *        manage — regular spawns AND adopted orphans. Returns an
   *        array because in degenerate cases (e.g. the 1.8 → 1.9
   *        transition adopts two orphans from a prior buggy run)
   *        more than one can be alive. The scheduler pauses /
   *        resumes ALL of them on tier transitions and only
   *        spawns a new one when the list is empty, capping
   *        steady-state concurrency at 1 again.
   */
  function listRunningQueueJobs() {
    const jobs = [];
    for (const [, rec] of hlsJobs) {
      if (rec.fromQueue || rec.orphan) jobs.push(rec);
    }
    return jobs;
  }

  /**
   * @brief Adaptive scheduler tick.
   *
   *        Three-tier state machine:
   *          paused   → SIGSTOP any running queue job, no new spawn.
   *          throttle → resume paused, or spawn next with threads:2.
   *          full     → resume paused, or spawn next with threads:3.
   *
   *        Tier choice comes from pickTier(): "is anyone using the
   *        site" + CPU idle %. The tick runs every 5s so transitions
   *        are coarse but not laggy — a returning viewer's first API
   *        hit updates accessTracker.lastApiHitAt, and the next tick
   *        (≤5s later) will pause whatever queue job is running.
   *
   *        Job parameters (threads / nice / preset) are baked in at
   *        spawn time and DO NOT retune mid-flight — switching from
   *        full to throttle while a -threads 3 job is running just
   *        leaves it at threads 3. Re-spawning to retune would lose
   *        progress (HLS event playlist can't resume), and SIGSTOP
   *        already gives the user-traffic case the CPU it needs.
   *
   *        New job picks: oldest pending in the queue. Cache hits
   *        (ENDLIST present) are dropped without spawning. ffprobe
   *        runs once to decide whether libx264 re-encode is needed
   *        (HEVC / VP9 / etc) or `-c:v copy` is enough (h264).
   */
  async function tickHlsQueue() {
    const tier = pickTier();
    const running = listRunningQueueJobs();

    // Always wake any paused job from a prior scheduler version.
    // Pre-revision 1.9.0 had a 'paused' tier that SIGSTOP'd on
    // idle dips; the revised scheduler never SIGSTOPs but should
    // unstick anything left frozen by the older code (or by an
    // operator's manual SIGSTOP — harmless to no-op SIGCONT a
    // running process).
    for (const r of running) if (r.paused) resumeJob(r);

    // 'wait' tier: someone is using the site AND CPU idle ≤ 60%.
    // Don't spawn a new job — we'd just push the box deeper.
    // Already-running jobs are left alone; -threads 2 caps each
    // ffmpeg's CPU on its own.
    if (tier === 'wait') return;

    // Steady-state cap: at most one queue job at a time. If
    // anything is still running (regular spawn or orphan), wait
    // for it to finish before picking the next.
    if (running.length > 0) return;

    // No running job → maybe pick the next one from the queue.
    let pickKey = null;
    let pick = null;
    for (const [k, v] of hlsQueue) {
      if (v.status === 'pending') { pickKey = k; pick = v; break; }
    }
    if (!pick) return;

    // Defensive: never spawn if hlsJobs already has this key.
    // Could happen if an orphan adoption landed between the
    // findRunningQueueJob call and here (orphans show fromQueue
    // only when the queue still has a row for them; if the queue
    // entry was already deleted, an orphan with the same key
    // would not be classified as fromQueue and thus not block
    // findRunningQueueJob — so this guard catches that race).
    if (hlsJobs.has(pickKey)) {
      pick.status = 'running';
      saveHlsQueue();
      return;
    }

    // Cache hit drops without spawn. ENDLIST means a previous run
    // already finished this transcode — orphan adoption that
    // completed silently after a prior node restart, typically.
    const dir = path.join(hlsCacheDir, pickKey);
    const playlistPath = path.join(dir, 'playlist.m3u8');
    if (fs.existsSync(playlistPath)) {
      try {
        if (fs.readFileSync(playlistPath, 'utf8').includes('#EXT-X-ENDLIST')) {
          hlsQueue.delete(pickKey);
          saveHlsQueue();
          console.log('hls queue: skip (already cached) ' + pick.epFile);
          return;
        }
      } catch (_e) {}
    }

    // v1.10.0+ audio-only fix mode: the source video bitstream is
    // always copied untouched into the .ts container, so no codec
    // probe is needed before spawning. Caller's responsibility (the
    // pretranscode-mkv route) is to filter out files whose audio is
    // already browser-safe.
    //
    // Tier → ffmpeg parameters. nice 0 in both tiers since the
    // throttled tier's CPU cap is enforced by -threads 2 (half the
    // box). Demoting nice on top wouldn't help here — the user is
    // browsing, not transcoding their own video, and node + nginx
    // get plenty of cycles between AAC encode batches.
    const threads = (tier === 'full') ? 3 : 2;

    pick.status = 'running';
    saveHlsQueue();
    try {
      const proc = ffmpeg.startHlsTranscode(pick.fileAbs, dir, {
        audioStreamIndex: pick.audioStreamIndex,
        niceLevel: 0,
        threads,
      });
      const now = Date.now();
      const rec = {
        proc,
        pid: proc.pid,
        startedAt: now,
        epFile: pick.epFile,
        fromQueue: true,
        paused: false,
        tier,
      };
      hlsJobs.set(pickKey, rec);
      console.log('hls queue: start ' + pick.epFile
        + ' (pid=' + proc.pid + ', tier=' + tier
        + ', threads=' + threads
        + ', remaining=' + hlsQueue.size + ')');
      proc.on('exit', (code) => {
        hlsJobs.delete(pickKey);
        // Drop from queue regardless of exit code. Partial cache
        // is recoverable: the next /hls-start for the same file
        // re-enqueues if ENDLIST is missing.
        hlsQueue.delete(pickKey);
        saveHlsQueue();
        console.log('hls queue: done ' + pick.epFile
          + ' (exit=' + code + ', remaining=' + hlsQueue.size + ')');
      });
    } catch (e) {
      // Spawn failed (e.g. ffmpeg binary missing). Drop the entry
      // so the queue doesn't deadlock retrying.
      hlsQueue.delete(pickKey);
      saveHlsQueue();
      console.warn('hls queue: spawn failed for ' + pick.epFile + ': ' + e.message);
    }
  }
  setInterval(() => {
    tickHlsQueue().catch((e) => console.warn('hls queue tick error:', e.message));
  }, HLS_QUEUE_TICK_MS).unref();

  // Cache key includes the audio stream index. Default audio (a == null)
  // and an explicit audio index produce different keys so caches don't
  // collide when the user switches language. The 1.7.47-and-earlier key
  // shape was sha1(cid|file) — old caches under that hash become orphans
  // and are simply ignored. They take disk but don't affect correctness;
  // operators can `rm -rf data/hls-cache/<old>` to reclaim.
  function hlsCacheKey(cid, file, audioStreamIndex) {
    const crypto = require('crypto');
    const aTag = (audioStreamIndex == null) ? 'd' : ('a' + audioStreamIndex);
    return crypto.createHash('sha1').update(cid + '|' + file + '|' + aTag).digest('hex');
  }

  // Audio codecs hls.js + browsers reliably decode out of MPEG-TS.
  // Anything outside this set triggers the audio-only fix HLS path:
  // re-encode to AAC stereo (dplii downmix), copy the video bit-
  // stream untouched. As of v1.10.0 video codec no longer factors
  // into the transcode decision — the user opted to never libx264
  // re-encode video on the DS124's ARM A55 because a feature film's
  // HEVC re-encode takes 3-4 hours wall time while audio-only fix
  // finishes in 5-15 minutes.
  const HLS_SAFE_AUDIO_CODECS = new Set(['aac', 'mp3', 'opus', 'vorbis', 'flac']);

  /**
   * @brief Count finalized .ts segments in a cache dir. Used by the
   *        client to render "X% transcoded" / "queued" progress for
   *        a video that hasn't reached ENDLIST yet. Cheap directory
   *        scan; no parsing of the playlist itself.
   *
   *        Returns 0 if the dir doesn't exist (queue spawn hasn't
   *        run yet) or readdir fails.
   */
  function countSegments(dir) {
    try {
      const entries = fs.readdirSync(dir);
      let n = 0;
      for (const e of entries) if (/^seg\d+\.ts$/.test(e)) n += 1;
      return n;
    } catch (_e) { return 0; }
  }

  /**
   * @brief Position of a key in the pending queue (1-indexed). 0 if
   *        not pending (running, missing, or absent). Lets the
   *        client surface "you're #3 in the queue" without needing
   *        a separate /api/hls-queue round-trip.
   */
  function queuePosition(key) {
    let pos = 0;
    for (const [k, v] of hlsQueue) {
      if (v.status !== 'pending') continue;
      pos += 1;
      if (k === key) return pos;
    }
    return 0;
  }

  /**
   * @brief GET /api/episode/:id/hls-start
   *
   *        1.9.0 rewrite: no longer spawns ffmpeg on demand. Instead:
   *
   *          - browser-native codec combo (h264 + safe audio +
   *            default audio track) → 'not-needed', client falls
   *            back to byte-range native serve.
   *          - cache exists with ENDLIST → 'ready', client streams
   *            from the static /hls-cache mount.
   *          - cache exists without ENDLIST → 'transcoding'. ffmpeg
   *            is currently running (or paused by the scheduler)
   *            for this key, but the file has NOT been fully
   *            transcoded. Per the user's 2026-05-10 design call,
   *            playback is REFUSED until ENDLIST hits.
   *          - no cache and no in-flight job → enqueue + return
   *            'queued' with the position. Scheduler picks it up
   *            on the next idle window.
   *
   *        Response shape (always 200, status discriminates):
   *          { status: 'not-needed' }
   *          { status: 'ready',       key }
   *          { status: 'transcoding', key, segments, paused, tier,
   *                                   message }
   *          { status: 'queued',      key, position, queueSize,
   *                                   message }
   *
   *        The "transcoding" / "queued" branches both signal the
   *        client to show a "video not ready yet" panel rather than
   *        starting playback. The client may poll this endpoint to
   *        watch the state transition to 'ready'.
   */
  app.get('/api/episode/:id/hls-start', auth.requireAuth, async (req, res) => {
    req.params[0] = req.query.file || '';
    const r = resolveEpisodeFile(req);
    if (r.status) return res.status(r.status).json({ error: r.message });

    // ?a=<absolute_stream_index> — picks a specific audio stream.
    // Empty / invalid → first audio stream, same as legacy behavior.
    let audioStreamIndex = null;
    if (req.query.a != null && String(req.query.a).length > 0) {
      const n = Number(req.query.a);
      if (Number.isInteger(n) && n >= 0) {
        audioStreamIndex = n;
      }
    }

    // Probe up front. v1.10.0+ only cares about audio: video is
    // always copied through HLS unchanged, so the video codec
    // doesn't decide whether HLS is needed.
    let info;
    try { info = await ffmpeg.probeMediaCodecs(r.fileAbs); } catch (_e) { info = {}; }
    const audios = Array.isArray(info.audioCodecs) ? info.audioCodecs : [];
    const audioOK = audios.length > 0 && audios.every((c) => HLS_SAFE_AUDIO_CODECS.has(c));
    if (audioStreamIndex != null) {
      const tracks = Array.isArray(info.audioTracks) ? info.audioTracks : [];
      const found = tracks.some((t) => t && t.streamIndex === audioStreamIndex);
      if (!found) {
        return res.status(400).json({ error: 'audio stream index not present in file' });
      }
    }
    // Skip HLS only when audio is browser-safe AND no specific
    // audio index requested. Specific-audio always goes through
    // HLS — that's the only way to put a non-first track on the
    // wire. With audio already safe and no track switch, byte-
    // range native serve plays the mkv directly; the browser
    // either can or can't decode the video on its own.
    if (audioOK && audioStreamIndex == null) {
      return res.json({ status: 'not-needed' });
    }

    const key = hlsCacheKey(r.id, r.file, audioStreamIndex);
    const dir = path.join(hlsCacheDir, key);
    const playlistPath = path.join(dir, 'playlist.m3u8');

    // Cache hit (ENDLIST) → ready to stream.
    if (fs.existsSync(playlistPath)) {
      try {
        const m = fs.readFileSync(playlistPath, 'utf8');
        if (m.includes('#EXT-X-ENDLIST')) {
          return res.json({ status: 'ready', key });
        }
      } catch (_e) {}
    }

    // In-flight transcode (running or scheduler-paused) for this
    // key. Tell the client it's still being worked on; do NOT let
    // playback start. The user can poll until ENDLIST appears.
    if (hlsJobs.has(key)) {
      const rec = hlsJobs.get(key);
      return res.json({
        status: 'transcoding',
        key,
        segments: countSegments(dir),
        paused: !!rec.paused,
        tier: rec.tier || (rec.fromQueue ? 'queue' : 'unknown'),
        message: rec.paused
          ? '视频转码已暂停（有用户在使用，CPU 占用较高），稍后自动继续'
          : '视频正在后台转码，请稍候再试',
      });
    }

    // No cache and no in-flight job → enqueue and refuse playback.
    // The scheduler will pick it up on the next idle tick.
    if (!hlsQueue.has(key)) {
      hlsQueue.set(key, {
        id: r.id,
        file: r.file,
        fileAbs: r.fileAbs,
        audioStreamIndex,
        addedAt: Date.now(),
        status: 'pending',
        epFile: r.file.split('/').pop(),
      });
      saveHlsQueue();
      console.log('hls queue: auto-enqueue ' + r.file + ' (queue=' + hlsQueue.size + ')');
    }
    return res.json({
      status: 'queued',
      key,
      position: queuePosition(key),
      queueSize: hlsQueue.size,
      message: '视频尚未转码完成，已加入队列，等待空闲时间处理',
    });
  });

  /**
   * @brief Player heartbeat — kept for compatibility with existing
   *        clients, but its 1.8.x role (anti-demote) is gone. The
   *        new scheduler keys "is anyone using the site" off the
   *        global access tracker (loadSession middleware), which
   *        every authenticated request already updates. Specific
   *        heartbeats from the video player are now redundant
   *        signal but harmless to receive.
   *
   *        We still respond with the current status of the keyed
   *        job so the client can show "transcoding paused" UI when
   *        the scheduler has SIGSTOP'd it.
   */
  app.post('/api/hls-heartbeat', auth.requireAuth, (req, res) => {
    const key = String(req.query.key || '').trim();
    const rec = hlsJobs.get(key);
    if (!rec) {
      // Either the transcode finished (ENDLIST + hlsJobs.delete
      // fired) or the key was never tracked. Client should stop
      // beating in either case.
      return res.json({ status: 'gone' });
    }
    res.json({
      status: 'alive',
      paused: !!rec.paused,
      tier: rec.tier || 'unknown',
    });
  });

  /**
   * @brief Walk a collection's root directory recursively for .mkv
   *        files. Shared by mkv-status and pretranscode-mkv. The
   *        relative paths use forward-slash regardless of platform
   *        so the same string round-trips between modal selection
   *        and hlsCacheKey hashing.
   * @param folderAbs Absolute path to the collection root.
   * @returns Array of `{rel, full}` — rel is forward-slash relative
   *          to folderAbs, full is absolute.
   */
  function walkCollectionMkvs(folderAbs) {
    const out = [];
    (function walk(dir, baseRel) {
      let entries;
      try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
      catch (_e) { return; }
      for (const e of entries) {
        const full = path.join(dir, e.name);
        const rel = baseRel ? baseRel + '/' + e.name : e.name;
        if (e.isDirectory()) walk(full, rel);
        else if (e.isFile() && e.name.toLowerCase().endsWith('.mkv')) {
          out.push({ rel, full });
        }
      }
    })(folderAbs, '');
    return out;
  }

  /**
   * @brief Delete the entire HLS cache directory for one key (the
   *        playlist + every segment). Best-effort: missing dir is
   *        a no-op success. Caller is responsible for stopping any
   *        in-flight ffmpeg whose `-hls_segment_filename` still
   *        points into this dir before invoking — otherwise the
   *        next segment write recreates the dir mid-deletion.
   */
  function deleteCacheForKey(key) {
    const dir = path.join(hlsCacheDir, key);
    try {
      fs.rmSync(dir, { recursive: true, force: true });
      return true;
    } catch (e) {
      console.warn('hls cache delete failed ' + key.slice(0, 8) + ': ' + e.message);
      return false;
    }
  }

  /**
   * @brief Force-stop the in-flight ffmpeg process for one cache
   *        key. POSIX path sends SIGTERM to the pgid (the detached
   *        child runs in its own session, so the negative pid
   *        nukes ffmpeg + every helper), with a 1.5s SIGKILL
   *        follow-up to handle the rare case where SIGTERM is
   *        ignored. Windows dev path falls back to ChildProcess
   *        .kill() (best-effort).
   *
   *        Used by the force-re-transcode path of pretranscode-mkv.
   *        Idempotent: returns false if no such job existed.
   */
  function killRunningJob(key) {
    const rec = hlsJobs.get(key);
    if (!rec) return false;
    if (process.platform === 'win32') {
      try { if (rec.proc) rec.proc.kill(); } catch (_e) {}
    } else if (rec.pid) {
      try { process.kill(-rec.pid, 'SIGTERM'); } catch (_e) {}
      setTimeout(() => {
        try { process.kill(-rec.pid, 'SIGKILL'); } catch (_e) {}
      }, 1500).unref();
    }
    hlsJobs.delete(key);
    return true;
  }

  /**
   * @brief GET /api/collection/:id/mkv-status
   *
   *        List every .mkv in a collection (recursive walk) with
   *        its current HLS cache state. Powers the per-collection
   *        transcode modal: the user sees what's already cached,
   *        what's queued, what's running, and what hasn't been
   *        touched, then picks rows to enqueue.
   *
   *        Deliberately NO ffprobe — a collection with 100+ mkvs
   *        would take ~30s of wall time which makes the modal feel
   *        broken. Audio-codec analysis is left to enqueue-time
   *        (server-side, only for batch-mode without explicit
   *        files[]). For explicit per-file selection the user's
   *        intent overrides the audio-codec heuristic — if they
   *        pick a file whose audio is already browser-safe, we
   *        transcode it anyway (audio-only fix at ~5-10x realtime
   *        is cheap, see v1.10.0 design call).
   *
   * @returns {mkvs: [{rel, epFile, sizeBytes, cacheStatus}],
   *           totalMkvs}
   *           cacheStatus ∈ 'none' | 'cached' | 'cached-partial' |
   *                         'queued' | 'running'
   */
  app.get('/api/collection/:id/mkv-status', auth.requireAuth, (req, res) => {
    const id = req.params.id;
    if (collectionsLib.validateId(id) !== null) {
      return res.status(400).json({ error: 'invalid collection id' });
    }
    const folderAbs = videoStore.resolveCollectionPath(id);
    if (!folderAbs) return res.status(404).json({ error: 'collection not found' });

    const mkvs = walkCollectionMkvs(folderAbs);
    const out = mkvs.map((m) => {
      const key = hlsCacheKey(id, m.rel, null);
      let cacheStatus = 'none';
      if (hlsJobs.has(key)) {
        cacheStatus = 'running';
      } else if (hlsQueue.has(key)) {
        cacheStatus = 'queued';
      } else {
        const playlistPath = path.join(hlsCacheDir, key, 'playlist.m3u8');
        if (fs.existsSync(playlistPath)) {
          try {
            const m3u8 = fs.readFileSync(playlistPath, 'utf8');
            cacheStatus = m3u8.includes('#EXT-X-ENDLIST') ? 'cached' : 'cached-partial';
          } catch (_e) {}
        }
      }
      let sizeBytes = 0;
      try { sizeBytes = fs.statSync(m.full).size; } catch (_e) {}
      return {
        rel: m.rel,
        epFile: m.rel.split('/').pop(),
        sizeBytes,
        cacheStatus,
      };
    });

    res.json({ mkvs: out, totalMkvs: out.length });
  });

  /**
   * @brief POST /api/collection/:id/pretranscode-mkv
   *
   *        Enqueue .mkv files for HLS audio-only fix transcode. Two
   *        modes share this endpoint:
   *
   *          BATCH (no body.files):
   *            Recursive walk of the collection. ffprobes every
   *            non-cached / non-queued .mkv to skip files whose
   *            audio is already browser-safe — those wouldn't
   *            benefit from a fix. The bulk-manage toolbar uses
   *            this path to "pre-transcode the whole catalog".
   *
   *          SELECTIVE (body.files is a non-empty array of rel paths):
   *            Only the listed files are considered. No audio
   *            probe — the user explicitly picked the file via
   *            the per-collection transcode modal, so we honor
   *            that even when audio is technically fine.
   *
   *        body.force=true (either mode) wipes any existing cache
   *        for the selected keys + kills any in-flight ffmpeg
   *        before enqueueing, so the file re-transcodes from
   *        scratch. Without force, already-cached / already-
   *        queued / already-running entries are skipped.
   *
   * @body  { files?: string[], force?: boolean }
   * @returns {added, skippedCached, skippedQueued, skippedAudioOK,
   *           skippedH264 (alias of skippedAudioOK for legacy
   *           bulk-toolbar consumers), missing, queueSize,
   *           totalMkvs}
   */
  app.post('/api/collection/:id/pretranscode-mkv', auth.requireAuth, async (req, res) => {
    const id = req.params.id;
    if (collectionsLib.validateId(id) !== null) {
      return res.status(400).json({ error: 'invalid collection id' });
    }
    const folderAbs = videoStore.resolveCollectionPath(id);
    if (!folderAbs) return res.status(404).json({ error: 'collection not found' });

    const body = req.body || {};
    const userFiles = Array.isArray(body.files)
      ? body.files.filter((s) => typeof s === 'string' && s)
      : null;
    const selective = userFiles && userFiles.length > 0;
    const force = !!body.force;

    const allMkvs = walkCollectionMkvs(folderAbs);

    // Filter to candidates. Selective mode = user-picked subset;
    // batch mode = every .mkv in the collection.
    let candidates;
    if (selective) {
      const wanted = new Set(userFiles);
      candidates = allMkvs.filter((m) => wanted.has(m.rel));
    } else {
      candidates = allMkvs;
    }

    let added = 0;
    let skippedCached = 0;
    let skippedQueued = 0;
    let skippedAudioOK = 0;
    for (const c of candidates) {
      const key = hlsCacheKey(id, c.rel, null);

      if (force) {
        // Force: nuke in-flight + queue + cache for this key, then
        // enqueue fresh. No audio probe — user explicitly opted in.
        killRunningJob(key);
        hlsQueue.delete(key);
        deleteCacheForKey(key);
      } else {
        // Default: dedupe vs queue / jobs / cache.
        if (hlsJobs.has(key) || hlsQueue.has(key)) { skippedQueued++; continue; }
        const playlistPath = path.join(hlsCacheDir, key, 'playlist.m3u8');
        if (fs.existsSync(playlistPath)) {
          try {
            if (fs.readFileSync(playlistPath, 'utf8').includes('#EXT-X-ENDLIST')) {
              skippedCached++; continue;
            }
          } catch (_e) {}
        }
        // Batch mode only: ffprobe to skip files whose audio is
        // already browser-safe. Selective mode honors the user's
        // explicit pick — see SELECTIVE branch in the JSDoc.
        if (!selective) {
          try {
            const info = await ffmpeg.probeMediaCodecs(c.full);
            const audios = Array.isArray(info.audioCodecs) ? info.audioCodecs : [];
            const audioOK = audios.length > 0
              && audios.every((cc) => HLS_SAFE_AUDIO_CODECS.has(cc));
            if (audioOK) { skippedAudioOK++; continue; }
          } catch (_e) {}
        }
      }

      hlsQueue.set(key, {
        id,
        file: c.rel,
        fileAbs: c.full,
        audioStreamIndex: null,
        addedAt: Date.now(),
        status: 'pending',
        epFile: c.rel.split('/').pop(),
      });
      added++;
    }

    // Count selective entries whose rel path no longer exists (file
    // got deleted / renamed between modal open and submit). Client
    // can flag those rows so the user knows their selection partially
    // missed.
    let missing = 0;
    if (selective) {
      const present = new Set(allMkvs.map((m) => m.rel));
      for (const r of userFiles) if (!present.has(r)) missing++;
    }

    saveHlsQueue();
    console.log('hls queue: enqueue collection ' + id
      + ' added=' + added
      + ' cached=' + skippedCached
      + ' queued=' + skippedQueued
      + ' audioOK=' + skippedAudioOK
      + (force ? ' (force)' : '')
      + (selective ? ' (selective ' + userFiles.length + ')' : ''));
    res.json({
      added,
      skippedCached,
      skippedQueued,
      skippedAudioOK,
      // Legacy alias: bulk-manage toolbar in app.js still reads
      // skippedH264. Keep mirroring until that callsite migrates.
      skippedH264: skippedAudioOK,
      missing,
      queueSize: hlsQueue.size,
      totalMkvs: allMkvs.length,
    });
  });

  /**
   * @brief GET /api/hls-queue — snapshot of pending queue + in-
   *        flight jobs + scheduler state.
   *
   *        Adds (1.9.0) a `scheduler` field so the admin / debug
   *        panel can see WHY the queue is or isn't progressing:
   *          tier:           current pickTier() result
   *          idlePct:        last sampled CPU idle %
   *          idleThreshold:  the 60% gate
   *          accessing:      isAnyoneAccessing()
   *          accessAgeSec:   how long since the last logged-in
   *                          API hit (Infinity when none yet)
   *          accessTtlSec:   the 5-minute window the gate uses
   */
  app.get('/api/hls-queue', auth.requireAuth, (req, res) => {
    const queue = [];
    for (const [k, v] of hlsQueue) {
      queue.push({
        key: k.slice(0, 12),
        file: v.epFile || v.file,
        collection: v.id,
        status: v.status,
        addedAt: v.addedAt,
      });
    }
    const active = [];
    for (const [k, v] of hlsJobs) {
      active.push({
        key: k.slice(0, 12),
        file: v.epFile,
        pid: v.pid,
        paused: !!v.paused,
        tier: v.tier || 'unknown',
        fromQueue: !!v.fromQueue,
        orphan: !!v.orphan,
        startedAt: v.startedAt,
        segments: countSegments(path.join(hlsCacheDir, k)),
      });
    }
    const accessAgeMs = accessTracker.lastApiHitAt > 0
      ? Date.now() - accessTracker.lastApiHitAt
      : Infinity;
    res.json({
      queue,
      active,
      scheduler: {
        tier: pickTier(),
        idlePct: Math.round(systemLoad.getIdlePercent() * 10) / 10,
        idleThreshold: IDLE_THRESHOLD_PCT,
        accessing: isAnyoneAccessing(),
        accessAgeSec: accessAgeMs === Infinity ? null : Math.round(accessAgeMs / 1000),
        accessTtlSec: Math.round(ACCESS_TTL_MS / 1000),
      },
    });
  });

  // Static byte-range serve for the hls cache. Both .m3u8 and .ts.
  // Note: .m3u8 must NOT be cached aggressively — it grows as ffmpeg
  // adds segments, and hls.js relies on re-fetching to find them.
  app.use('/hls-cache', auth.requireAuth, express.static(hlsCacheDir, {
    acceptRanges: true,
    cacheControl: false,
    dotfiles: 'ignore',
    setHeaders: (res2, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.m3u8') {
        res2.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
        res2.setHeader('Cache-Control', 'no-cache');
      } else if (ext === '.ts') {
        res2.setHeader('Content-Type', 'video/mp2t');
        res2.setHeader('Cache-Control', 'public, max-age=86400');
      }
    },
  }));

  app.get('/api/episode/:id/codecs', auth.requireAuth, async (req, res) => {
    // Lightweight ffprobe wrapper that reports just the codec info
    // the client needs to decide native-vs-transcode. mkvs with
    // EAC3 / DTS / TrueHD / MLP audio play silent in Chrome and
    // Firefox even though video H264 decodes fine — client uses
    // this endpoint to swap to /media-stream when those codecs
    // appear, since transcode remuxes audio to AAC.
    req.params[0] = req.query.file || '';
    const r = resolveEpisodeFile(req);
    if (r.status) return res.status(r.status).json({ error: r.message });
    try {
      const info = await ffmpeg.probeMediaCodecs(r.fileAbs);
      res.json(info);
    } catch (e) {
      console.error('codecs probe error:', e);
      res.json({});
    }
  });

  app.get('/api/episode/:id/embedded-subs', auth.requireAuth, async (req, res) => {
    // 1.7.26: route uses query string `?file=` instead of path
    // wildcard. The previous `:id/*/embedded-subs` form ran into
    // path-to-regexp v6 wildcard semantics where the trailing
    // literal is matched as part of the route definition (so the
    // wildcard captured ONLY the ep file, not file+suffix), making
    // our endsWith('/embedded-subs') check fall through and emit
    // "malformed path" for every request. Query-string is invariant
    // and avoids the wildcard quirk altogether.
    req.params[0] = req.query.file || '';
    const r = resolveEpisodeFile(req);
    if (r.status) return res.status(r.status).json({ error: r.message });
    try {
      const list = await ffmpeg.listEmbeddedSubtitles(r.fileAbs);
      res.json({ subs: list });
    } catch (e) {
      console.error('embedded-subs probe error:', e);
      res.json({ subs: [] });
    }
  });

  app.get('/subtitle-extract/:id/:streamIdx.vtt', auth.requireAuth, async (req, res) => {
    // 1.7.26: same query-string switch — `?file=` instead of
    // /:id/<ep>/<idx>.vtt path. ep file path on disk can contain
    // arbitrary segments (Season X/EpY.mkv), and threading that
    // through Express path matching with a trailing `<idx>.vtt`
    // chunk is fragile; query-string keeps file as opaque.
    const streamIdx = Number(req.params.streamIdx);
    if (!Number.isFinite(streamIdx) || streamIdx < 0) {
      return res.status(400).type('text/plain').send('invalid stream index');
    }
    req.params[0] = req.query.file || '';
    const r = resolveEpisodeFile(req);
    if (r.status) return res.status(r.status).type('text/plain').send(r.message);

    // Cache key: sha1 of (collection id + ep relative path + stream idx).
    // Renaming any of those busts cache automatically.
    const crypto = require('crypto');
    const cacheKey = crypto.createHash('sha1')
      .update(r.id + '|' + r.file + '|' + streamIdx)
      .digest('hex');
    const cachePath = path.join(subtitleCacheDir, cacheKey + '.vtt');

    res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=86400');

    if (fs.existsSync(cachePath)) {
      // Cache hit — stream from disk. Don't re-extract; the cache is
      // immutable once written.
      fs.createReadStream(cachePath).pipe(res);
      return;
    }
    try {
      await ffmpeg.extractEmbeddedSubtitle(r.fileAbs, streamIdx, cachePath);
      fs.createReadStream(cachePath).pipe(res);
    } catch (e) {
      console.error('subtitle-extract error:', e.message);
      // Clean up any partial output ffmpeg may have produced before
      // bailing — otherwise next request would 200 with garbage.
      try { fs.unlinkSync(cachePath); } catch (_e) {}
      res.status(500).type('text/plain').send('extract failed: ' + e.message);
    }
  });

  const audioStaticHandler = express.static(config.AUDIO_ROOT, {
    acceptRanges: true,
    cacheControl: false,
    dotfiles: 'ignore',
    fallthrough: false,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.vtt') res.setHeader('Content-Type', 'text/vtt; charset=utf-8');
      if (['.srt', '.lrc', '.ass', '.ssa', '.txt'].includes(ext)) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      }
    },
  });
  app.use('/audio-files', auth.mediaGuard(config.IMAGE_EXTS), audioStaticHandler);

  // Image files static mount — all image files are publicly browsable
  // (same as covers), no auth guard needed.
  const imageStaticHandler = express.static(config.IMAGE_ROOT, {
    acceptRanges: true,
    dotfiles: 'deny',
    index: false,
    maxAge: '7d',
    immutable: true,
  });
  app.use('/image-files', imageStaticHandler);

  // Novel files static mount — covers and uploaded books (txt/pdf).
  // Same minimal guard as image (no transcode pipeline). Sets a UTF-8
  // text/plain header for .txt so browsers don't second-guess the
  // encoding when previewed directly.
  const novelStaticHandler = express.static(config.NOVEL_ROOT, {
    acceptRanges: true,
    dotfiles: 'deny',
    fallthrough: false,
    setHeaders: (res, filePath) => {
      const ext = path.extname(filePath).toLowerCase();
      if (ext === '.txt') res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      if (ext === '.pdf') res.setHeader('Content-Type', 'application/pdf');
    },
  });
  app.use('/novel-files', novelStaticHandler);

  // ── Image thumbnails: on-demand generation + disk cache ──
  // GET /image-thumbs/:collectionId/path/to/file.jpg
  // Generates a 400px-wide JPEG thumbnail via ffmpeg on first request,
  // caches it under <IMAGE_ROOT>/<collection>/.thumbs/<file>.jpg
  // Subsequent requests serve the cached file directly.
  app.get(/^\/image-thumbs\/([^/]+)\/(.+)$/, (req, res) => {
    const colId = decodeURIComponent(req.params[0]);
    const file = decodeURIComponent(req.params[1]);
    if (!isSafeRelativePath(file)) return res.status(400).end();
    const colPath = imageStore.resolveCollectionPath(colId);
    if (!colPath) return res.status(404).end();
    const srcPath = path.join(colPath, file);
    // Thumbnail cache path: <collection>/.thumbs/<file>.jpg
    const thumbDir = path.join(colPath, '.thumbs', path.dirname(file));
    const thumbName = path.basename(file, path.extname(file)) + '.jpg';
    const thumbPath = path.join(thumbDir, thumbName);
    // Serve cached thumbnail if it exists
    if (fs.existsSync(thumbPath)) {
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
      return res.sendFile(thumbPath);
    }
    // Generate thumbnail via ffmpeg
    if (!fs.existsSync(srcPath)) return res.status(404).end();
    if (!ffmpeg.isReady()) {
      // Fallback: serve original with cache headers
      res.setHeader('Cache-Control', 'public, max-age=604800');
      return res.sendFile(srcPath);
    }
    try { fs.mkdirSync(thumbDir, { recursive: true }); } catch (_e) {}
    const { spawn } = require('child_process');
    const st = ffmpeg.status();
    const args = [
      '-i', srcPath,
      '-vf', 'scale=400:-2',
      '-vframes', '1',
      '-q:v', '4',
      '-f', 'image2',
      thumbPath,
      '-y',
    ];
    const child = spawn(st.ffmpeg, args, { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
    child.on('exit', (code) => {
      if (code === 0 && fs.existsSync(thumbPath)) {
        res.setHeader('Content-Type', 'image/jpeg');
        res.setHeader('Cache-Control', 'public, max-age=604800, immutable');
        res.sendFile(thumbPath);
      } else {
        // Fallback to original
        res.setHeader('Cache-Control', 'public, max-age=604800');
        res.sendFile(srcPath);
      }
    });
    child.on('error', () => {
      res.setHeader('Cache-Control', 'public, max-age=604800');
      res.sendFile(srcPath);
    });
  });

  // ================================================================
  // Health + Auth
  // ================================================================
  app.get('/api/health', (req, res) => {
    res.json({
      ok: true,
      version: VERSION,
      uptime: Math.floor((Date.now() - BOOT_TIME) / 1000),
      users: users.count(),
    });
  });

  // Public: category tags (filter chip labels).
  app.get('/api/categories', (req, res) => {
    res.json({ categories: categoriesStore.get() });
  });
  // Admin: rewrite category tags wholesale.
  app.get('/api/admin/categories', auth.requireAdmin, (req, res) => {
    res.json({ categories: categoriesStore.get() });
  });
  app.put('/api/admin/categories', auth.requireAdmin, async (req, res) => {
    try {
      const next = await categoriesStore.replace(req.body || {});
      res.json({ categories: next });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // 1.2.0+: cross-field, cross-kind search. Single endpoint that walks
  // collections in one or all kinds, scoring each against a multi-word
  // query (whitespace-AND) over the requested fields (title / tags /
  // keywords / authors / desc). Returns hits with their kind annotated
  // so the client can render mixed results without a per-kind round-trip.
  //
  // Filtering still respects taint / hidden / per-user grant via the
  // same effectiveHiddenIds + expandGrant logic as the home list.
  app.get('/api/search', (req, res) => {
    const stores = { video: videoStore, audio: audioStore, image: imageStore, novel: novelStore };
    const kindParam = String(req.query.kind || 'all');
    const kinds = kindParam === 'all' ? Object.keys(stores) : [kindParam];
    for (const k of kinds) if (!stores[k]) return res.status(400).json({ error: '未知板块: ' + k });
    const fields = String(req.query.fields || 'title')
      .split(',').map((s) => s.trim()).filter(Boolean);
    /**
     * @brief Allowed search field tokens.
     *
     * - title    Collection display title
     * - tags     Tag labels (and ids) attached to the collection,
     *            including ancestors of the leaf tags
     * - keywords Smart-tagging keywords from those same tags
     * - authors  Collection's authors / studio list
     * - desc     Free-text description
     * - episodes Per-episode title + filename of every episode in
     *            the collection (search drills into individual files
     *            rather than just the collection wrapper)
     */
    const allowedFields = new Set(['title', 'tags', 'keywords', 'authors', 'desc', 'episodes']);
    const useFields = fields.filter((f) => allowedFields.has(f));
    if (useFields.length === 0) useFields.push('title');
    const qRaw = String(req.query.q || '').trim();
    if (!qRaw) return res.json({ hits: [], total: 0, kinds, fields: useFields });
    function normForMatch(s) {
      let v = String(s || '');
      try { v = v.normalize('NFKC'); } catch (_e) {}
      return v.toLowerCase();
    }
    // Whitespace AND: every term must match SOMEWHERE in the chosen
    // fields. Term itself can match any single field.
    const terms = qRaw.split(/\s+/).map(normForMatch).filter(Boolean);
    if (terms.length === 0) return res.json({ hits: [], total: 0, kinds, fields: useFields });

    const role = (req.user && req.user.role) || 'guest';
    const includeHidden = role === 'admin' && req.query.includeHidden === '1';

    const hits = [];
    for (const k of kinds) {
      const store = stores[k];
      const hiddenCats = categoriesStore.effectiveHiddenIds(k);
      const grant = categoriesStore.expandGrant(
        k,
        (req.user && req.user.visibleCategories && Array.isArray(req.user.visibleCategories[k]))
          ? req.user.visibleCategories[k]
          : []
      );
      const cats = (categoriesStore.get()[k] || []);
      const labelById = new Map();
      const keywordsById = new Map();
      for (const c of cats) {
        labelById.set(c.id, c.label);
        keywordsById.set(c.id, Array.isArray(c.keywords) ? c.keywords : []);
      }
      const list = store.listCollections({ includeHidden: true });
      for (const c of list) {
        // Visibility — same rules as the home list filter.
        if (c.hidden && role !== 'admin') continue;
        const colTypes = Array.isArray(c.types) && c.types.length > 0 ? c.types : [c.type];
        if (!includeHidden) {
          // Tainted by hidden tag? Skip unless admin includeHidden.
          let tainted = false;
          for (const t of colTypes) {
            if (hiddenCats.has(t) && !grant.has(t)) { tainted = true; break; }
          }
          if (tainted) continue;
          if (c.hidden) continue;
        }

        // Build the searchable text bundles per field.
        const titleText = useFields.includes('title') ? normForMatch(c.title || c.id) : '';
        let tagsText = '';
        if (useFields.includes('tags')) {
          const expanded = categoriesStore.expandUpward(k, colTypes);
          const labels = [];
          for (const tid of expanded) {
            const lbl = labelById.get(tid);
            if (lbl) labels.push(lbl);
            labels.push(tid); // also match by id for power users
          }
          tagsText = normForMatch(labels.join(' '));
        }
        let keywordsText = '';
        if (useFields.includes('keywords')) {
          const expanded = categoriesStore.expandUpward(k, colTypes);
          const kws = [];
          for (const tid of expanded) {
            const list2 = keywordsById.get(tid);
            if (Array.isArray(list2)) for (const w of list2) kws.push(w);
          }
          keywordsText = normForMatch(kws.join(' '));
        }
        const authorsText = useFields.includes('authors')
          ? normForMatch((c.authors || []).join(' '))
          : '';
        const descText = useFields.includes('desc') ? normForMatch(c.description || '') : '';

        /**
         * @brief Per-episode searchable rows + matched-episode list.
         *
         * `episodesText` is the haystack used by the collection-level
         * AND-across-terms check below — it concatenates every
         * episode's title + filename so a single term can match the
         * collection as long as ANY episode contains it.
         *
         * `matchedEpisodes` is the precise list of episodes where
         * EVERY search term occurs in the same episode's row. That's
         * what the frontend renders as a clickable "命中的集数"
         * sublist under the collection card. Capped at 10 per
         * collection to keep response payload bounded.
         */
        let episodesText = '';
        let matchedEpisodes = [];
        if (useFields.includes('episodes')) {
          const epRows = [];
          for (const ep of (c.episodes || [])) {
            const text = normForMatch((ep.title || '') + ' ' + (ep.file || ''));
            epRows.push({ ep, text });
          }
          // Collection-level haystack — newline-separated so cross-
          // episode boundaries don't accidentally match a phrase that
          // doesn't actually exist in any single episode.
          episodesText = epRows.map((r) => r.text).join('\n');
          for (const r of epRows) {
            if (terms.every((t) => r.text.includes(t))) {
              matchedEpisodes.push({
                file: r.ep.file,
                title: r.ep.title || r.ep.file,
                order: r.ep.order || 0,
              });
              if (matchedEpisodes.length >= 10) break;
            }
          }
        }

        // Whitespace-AND across terms; each term may match any field.
        let allMatch = true;
        for (const term of terms) {
          const matchOne =
            (useFields.includes('title') && titleText.includes(term)) ||
            (useFields.includes('tags') && tagsText.includes(term)) ||
            (useFields.includes('keywords') && keywordsText.includes(term)) ||
            (useFields.includes('authors') && authorsText.includes(term)) ||
            (useFields.includes('desc') && descText.includes(term)) ||
            (useFields.includes('episodes') && episodesText.includes(term));
          if (!matchOne) { allMatch = false; break; }
        }
        if (!allMatch) continue;
        // Annotate kind so the client can route detail-page links correctly.
        // Attach matched-episode list (may be empty) so the frontend
        // can render direct-to-episode jumplinks under the card.
        hits.push({ ...c, _kind: k, _matchedEpisodes: matchedEpisodes });
      }
    }
    // Sort: created desc by default.
    hits.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    res.json({ hits, total: hits.length, kinds, fields: useFields });
  });

  // 1.2.0+: author autocomplete. Returns the deduped, sorted list of every
  // author currently used in any collection of the given kind. Light-weight
  // — listCollections is cached, so this is O(N) over already-loaded
  // metadata. No global registry file; the source of truth is the
  // collection .collection.json files themselves.
  app.get('/api/authors', (req, res) => {
    const kind = String(req.query.kind || '');
    const stores = { video: videoStore, audio: audioStore, image: imageStore, novel: novelStore };
    const list = [];
    if (kind === 'all' || kind === '') {
      for (const k of Object.keys(stores)) {
        const cols = stores[k].listCollections({ includeHidden: true });
        for (const c of cols) {
          if (Array.isArray(c.authors)) for (const a of c.authors) list.push(a);
        }
      }
    } else if (stores[kind]) {
      const cols = stores[kind].listCollections({ includeHidden: true });
      for (const c of cols) {
        if (Array.isArray(c.authors)) for (const a of c.authors) list.push(a);
      }
    } else {
      return res.status(400).json({ error: '未知板块: ' + kind });
    }
    // Dedup case-insensitively while keeping the most-recently-used casing.
    const seen = new Map();
    for (const a of list) {
      let k = a;
      try { k = k.normalize('NFKC'); } catch (_e) {}
      k = k.toLowerCase();
      seen.set(k, a);
    }
    const authors = Array.from(seen.values()).sort((a, b) => a.localeCompare(b, 'zh-CN'));
    res.json({ authors });
  });

  app.get('/api/auth/status', (req, res) => {
    res.json({
      needsFirstUser: users.count() === 0,
      user: publicUser(req.user),
      // Effective role — 'guest' when no session, otherwise the user's role.
      // The frontend uses this to decide whether to render hidden-category UI.
      role: (req.user && req.user.role) || 'guest',
      version: VERSION,
    });
  });

  app.get('/api/auth/me', (req, res) => {
    if (!req.user) return res.status(401).json({ error: '未登录' });
    res.json({ user: publicUser(req.user) });
  });

  app.post('/api/auth/register', async (req, res) => {
    const { username, password } = req.body || {};
    try {
      const role = users.count() === 0 ? 'admin' : 'user';
      const created = await users.create(username, password, { role });
      const sess = sessions.create(created.username, config.SESSION_TTL_MS);
      setSidCookie(res, sess.sid);
      res.status(201).json({ user: created });
    } catch (e) {
      res.status(errorStatus(e)).json({ error: e.message });
    }
  });

  app.post('/api/auth/login', (req, res) => {
    const ip = clientIp(req);
    if (loginBlocked(ip)) {
      return res.status(429).json({ error: '登录失败次数过多，请稍后重试' });
    }
    const { username, password } = req.body || {};
    if (typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: '缺少参数' });
    }
    if (!users.verify(username, password)) {
      recordLoginFailure(ip);
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    clearLoginFailures(ip);
    const sess = sessions.create(username, config.SESSION_TTL_MS);
    setSidCookie(res, sess.sid);
    res.json({ user: publicUser(users.get(username)) });
  });

  app.post('/api/auth/logout', (req, res) => {
    if (req.session) sessions.destroy(req.session.sid);
    res.clearCookie(auth.SESSION_COOKIE, { path: '/' });
    res.status(204).end();
  });

  app.post('/api/auth/password', auth.requireAuth, async (req, res) => {
    const { oldPassword, newPassword } = req.body || {};
    if (!users.verify(req.user.username, oldPassword)) {
      return res.status(401).json({ error: '原密码错误' });
    }
    try {
      await users.update(req.user.username, { password: newPassword });
      res.json({ ok: true });
    } catch (e) {
      res.status(errorStatus(e)).json({ error: e.message });
    }
  });

  // ================================================================
  // Sort functions used by both subsystems.
  // ================================================================
  const SORT_FUNCTIONS = {
    created:       (a, b) => b.createdAt - a.createdAt,
    'created-asc': (a, b) => a.createdAt - b.createdAt,
    title:         (a, b) => (b.title || b.id).localeCompare(a.title || a.id, 'zh-CN', { numeric: true, sensitivity: 'base' }),
    'title-asc':   (a, b) => (a.title || a.id).localeCompare(b.title || b.id, 'zh-CN', { numeric: true, sensitivity: 'base' }),
    episodes:      (a, b) => b.episodeCount - a.episodeCount,
    'episodes-asc':(a, b) => a.episodeCount - b.episodeCount,
    size:          (a, b) => b.totalSize - a.totalSize,
    'size-asc':    (a, b) => a.totalSize - b.totalSize,
    filename:      (a, b) => b.id.localeCompare(a.id, 'zh-CN', { numeric: true, sensitivity: 'base' }),
    'filename-asc':(a, b) => a.id.localeCompare(b.id, 'zh-CN', { numeric: true, sensitivity: 'base' }),
    createdAt:     (a, b) => b.createdAt - a.createdAt,
    'createdAt-asc':(a, b) => a.createdAt - b.createdAt,
  };

  // ================================================================
  // Mount a full CRUD + upload + progress + history + comments +
  // favorites route set for a given subsystem.
  //
  // kind: 'video' | 'audio'
  // prefix: '' (for video, backwards-compat) or '/audio' (for audio)
  // store / progress / comments / favorites: the per-subsystem instances
  // mediaDir: absolute path used by multer destination
  // extsAllowed: acceptable file extensions on upload
  // ================================================================
  function mountSubsystem({
    kind, prefix, store, progress, comments, favorites,
    mediaDir, mediaExts, subtitleExts, extraExts,
  }) {
    const p = prefix || '';

    // ---- Collection list + filter + sort -------------------------
    //
    // Visibility model (after category-hide rework):
    //
    //   roles:
    //     guest   = no session at all (req.user == null)
    //     user    = logged-in with role 'user'
    //     admin   = logged-in with role 'admin'
    //
    //   "hidden" content = c.hidden === true OR category is marked hidden.
    //
    //   Rules (applied in order):
    //     1. A ?type=X query is a pure intersection — collections whose
    //        type doesn't match are always dropped.
    //     2. The "全部" view (no ?type=) hides hidden content for EVERYONE,
    //        including admins. That's the whole point of hiding a tag.
    //     3. When a specific ?type=X chip is clicked:
    //          - admin sees everything (including hidden ones) under that
    //            chip — admins have full chip access.
    //          - non-hidden tags: everyone sees.
    //          - hidden tags: guest denied; non-admin user needs grant.
    //
    //   Admins see every chip in the filter row (that's handled frontend-
    //   side). The direct-id route `/api/collections/:id` mirrors this —
    //   admins can always fetch a hidden collection by id.
    app.get(`${p}/api/collections`, (req, res) => {
      try {
        let list = store.listCollections({ includeHidden: true });
        // ── Multi-tag filter parsing ──
        // Supported query forms:
        //   ?types=a,b,c   — new multi-tag list
        //   ?op=OR|AND|NOR|NOT — combination operator (default OR)
        //   ?type=a        — legacy single-tag form (still accepted)
        // `selected` is the empty set when "全部" is being viewed.
        const selected = new Set();
        const rawTypes = req.query.types || req.query.type;
        if (rawTypes && rawTypes !== 'all') {
          for (const t of String(rawTypes).split(',')) {
            const tt = t.trim();
            if (tt) selected.add(tt);
          }
        }
        const opRaw = String(req.query.op || 'OR').toUpperCase();
        // ONLY is a UI-side single-select mode: the client guarantees
        // selected.size === 1 when op=ONLY, so it filters identically to
        // OR. NOR is legacy (removed in 1.67) — still accepted on the
        // wire so old URLs / bookmarks don't break.
        const op = ['OR', 'AND', 'NOR', 'NOT', 'ONLY'].includes(opRaw) ? opRaw : 'OR';

        // 1.1.0+: hierarchy semantics.
        //   - hiddenCats expands to include every descendant of any hidden
        //     node, so a hidden parent automatically taints children too.
        //   - grant expands the same way (granting a parent implicitly
        //     grants the entire subtree). Granting a child does NOT
        //     up-propagate (granting "R18.光" stays narrow, doesn't
        //     unlock the entire R18 family).
        const hiddenCats = categoriesStore.effectiveHiddenIds(kind);
        const role = (req.user && req.user.role) || 'guest';
        const grant = categoriesStore.expandGrant(
          kind,
          (req.user && req.user.visibleCategories && Array.isArray(req.user.visibleCategories[kind]))
            ? req.user.visibleCategories[kind]
            : []
        );
        // Admin-only escape hatch — bulk-manage mode passes
        // includeHidden=1 to surface c.hidden collections so they can
        // be retagged / deleted / reassigned. Silently ignored for
        // non-admins.
        const includeHidden = role === 'admin' && req.query.includeHidden === '1';

        // Visibility rule (strict — any hidden tag taints the collection):
        //   For each collection compute dirtyTypes = its tags that are in
        //   hiddenCats AND not in this viewer's grant. If dirtyTypes is
        //   non-empty, the collection is "tainted by hidden tags" and only
        //   shows when the user has explicitly chip-selected at least one
        //   of those dirty tags. The "全部" view (selected empty) always
        //   hides tainted collections. This is stricter than the previous
        //   "any visible tag rescues" rule — a collection with B(visible)
        //   + A(hidden) + C(hidden) stays hidden when filtering by B,
        //   because the user did not opt in to A/C exposure.
        //
        //   Taint applies to admins too — otherwise hidden tags would
        //   leak into the admin's "全部" view (the very thing that hiding
        //   a tag is supposed to prevent). The single bypass is the
        //   admin-only includeHidden=1 query (bulk-manage mode), which
        //   turns OFF both the c.hidden filter and the tag-taint filter
        //   so all collections can be retagged in one place.
        list = list.filter((c) => {
          const colTypes = Array.isArray(c.types) && c.types.length > 0 ? c.types : [c.type];
          // effectiveTypes adds every ancestor of every leaf. This is what
          // makes "selecting a parent chip" surface every collection
          // tagged with any descendant — without forcing admins to
          // physically tag every collection with both parent and child.
          const effectiveTypes = categoriesStore.expandUpward(kind, colTypes);

          // c.hidden = "admin manually hid this single collection".
          // Non-admins never see those.
          if (c.hidden && role !== 'admin') return false;

          // Compute taint from category-level hidden flags. hiddenCats
          // already includes descendants of hidden parents, so checking
          // colTypes against it covers "leaf under a hidden ancestor".
          const dirtyTypes = new Set();
          if (!includeHidden) {
            for (const t of colTypes) {
              if (hiddenCats.has(t) && !grant.has(t)) dirtyTypes.add(t);
            }
          }

          if (dirtyTypes.size > 0) {
            // Tainted collection. Must be unlocked by a chip-selected
            // dirty tag (or one of its hidden ancestors), otherwise hidden.
            if (selected.size === 0) return false;
            let unlocked = false;
            for (const s of selected) {
              // selecting a hidden ancestor of a dirty leaf also unlocks
              if (dirtyTypes.has(s)) { unlocked = true; break; }
              // ancestor / descendant chip selected → unlock if it lands
              // in either the dirty set or its expanded ancestors
              if (effectiveTypes.has(s) && hiddenCats.has(s)) { unlocked = true; break; }
            }
            if (!unlocked) return false;
          }

          if (selected.size === 0) {
            // "全部" view — c.hidden hidden by default; admin can lift
            // via includeHidden=1 (bulk-manage mode).
            if (c.hidden && !includeHidden) return false;
            return true;
          }

          // Op-based filtering. Now matches each selected chip against
          // effectiveTypes — selecting a parent counts as a hit on any
          // descendant; selecting a leaf still requires that exact leaf
          // (or one of its descendants) to be tagged.
          let inter = 0;
          for (const s of selected) if (effectiveTypes.has(s)) inter++;
          switch (op) {
            case 'OR':   return inter > 0;
            case 'AND':  return inter === selected.size;
            case 'NOR':  return inter === 0;       // legacy
            case 'NOT':  return inter < selected.size;
            case 'ONLY': return inter > 0;          // client guarantees selected.size === 1
          }
          return false;
        });

        if (req.query.q) {
          const q = String(req.query.q).trim().toLowerCase();
          if (q) list = list.filter((c) => (c.title || c.id).toLowerCase().includes(q));
        }
        if (req.query.fav === '1' && req.user) {
          const mine = new Set(favorites.list(req.user.username));
          list = list.filter((c) => mine.has(c.id));
        }
        const sortKey = String(req.query.sort || 'created');
        const sortFn = SORT_FUNCTIONS[sortKey] || SORT_FUNCTIONS.created;
        list.sort(sortFn);
        // Optional pagination: ?limit=N&offset=M
        const total = list.length;
        const limit = req.query.limit ? Math.max(1, Number(req.query.limit) || 50) : null;
        const offset = req.query.offset ? Math.max(0, Number(req.query.offset) || 0) : 0;
        if (limit) list = list.slice(offset, offset + limit);
        res.json({ collections: list, sort: sortKey, kind, role, total });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.get(`${p}/api/collections/:id`, (req, res) => {
      try {
        const col = store.getCollection(req.params.id);
        if (!col) return res.status(404).json({ error: '合集不存在' });

        // Direct-id access only gates on c.hidden (the manual per-
        // collection lock). Category-level hiding is a list-display
        // policy — chip-unlock can rescue tainted collections in the
        // listing, and direct access via URL must therefore work too.
        // Anyone with the URL can read; that's intentional under the
        // new "hidden = default-off display, not access control" rule.
        const role = (req.user && req.user.role) || 'guest';
        if (role !== 'admin' && col.hidden) {
          return res.status(404).json({ error: '合集不存在' });
        }
        res.json({ collection: col });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.post(`${p}/api/collections`, auth.requirePerm('create'), async (req, res) => {
      try {
        const meta = await store.createCollection(req.body || {});
        res.status(201).json({ collection: meta });
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    app.patch(`${p}/api/collections/:id`, auth.requirePerm('modify'), async (req, res) => {
      try {
        const meta = await store.updateCollection(req.params.id, req.body || {});
        res.json({ collection: meta });
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    app.delete(`${p}/api/collections/:id`, auth.requirePerm('delete'), async (req, res) => {
      const force = req.query.force === '1' || req.query.force === 'true';
      try {
        const result = await store.deleteCollection(req.params.id, { force });
        await progress.clearCollection(req.params.id);
        await comments.clearCollection(req.params.id);
        await favorites.clearCollection(req.params.id);
        res.json(result);
      } catch (e) {
        const body = { error: e.message };
        if (e.code === 'E_COLLECTION_NOT_EMPTY') {
          const m = e.message.match(/\d+/);
          if (m) body.count = Number(m[0]);
          body.hint = '加 ?force=1 强制删除';
        }
        res.status(errorStatus(e)).json(body);
      }
    });

    // Clear a protected (default) collection.
    app.post(`${p}/api/collections/:id/clear`, auth.requirePerm('delete'), async (req, res) => {
      try {
        const result = await store.clearCollection(req.params.id);
        await progress.clearCollection(req.params.id);
        res.json(result);
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    app.get(`${p}/api/collections/:id/images`, (req, res) => {
      const id = req.params.id;
      if (collectionsLib.validateId(id) !== null) {
        return res.status(400).json({ error: '合集名称非法' });
      }
      const abs = store.resolveCollectionPath(id);
      if (!abs || !fs.existsSync(abs)) {
        return res.status(404).json({ error: '合集不存在' });
      }
      res.json({ images: store.listCollectionImages(id) });
    });

    // ── Video frame capture (admin only) ──
    if (kind === 'video') {
      // POST body: { file, time } — extract full-quality frame, save to collection
      app.post(`${p}/api/collections/:id/capture-frame`, auth.requirePerm('modify'), async (req, res) => {
        try {
          const id = req.params.id;
          const { file, time } = req.body || {};
          if (!file || !isSafeRelativePath(file)) return res.status(400).json({ error: '文件名非法' });
          if (!ffmpeg.isReady()) return res.status(503).json({ error: 'ffmpeg 不可用' });
          const abs = store.resolveCollectionPath(id);
          if (!abs) return res.status(404).json({ error: '合集不存在' });
          const videoPath = path.join(abs, file);
          if (!fs.existsSync(videoPath)) return res.status(404).json({ error: '视频文件不存在' });
          const buf = await ffmpeg.captureFrame(videoPath, Number(time) || 0);
          const outName = 'frame_' + Date.now() + '.jpg';
          fs.writeFileSync(path.join(abs, outName), buf);
          store.migrateAll();
          res.json({ image: outName });
        } catch (e) {
          res.status(500).json({ error: '截帧失败: ' + e.message });
        }
      });
      // POST body: { file, count? } — return base64 preview thumbnails at even intervals
      app.post(`${p}/api/collections/:id/preview-frames`, auth.requirePerm('modify'), async (req, res) => {
        try {
          const id = req.params.id;
          const { file, count } = req.body || {};
          if (!file || !isSafeRelativePath(file)) return res.status(400).json({ error: '文件名非法' });
          if (!ffmpeg.isReady()) return res.status(503).json({ error: 'ffmpeg 不可用' });
          const abs = store.resolveCollectionPath(id);
          if (!abs) return res.status(404).json({ error: '合集不存在' });
          const videoPath = path.join(abs, file);
          if (!fs.existsSync(videoPath)) return res.status(404).json({ error: '视频文件不存在' });
          const frames = await ffmpeg.previewFrames(videoPath, count || 12);
          res.json({ frames });
        } catch (e) {
          res.status(500).json({ error: '预览帧提取失败: ' + e.message });
        }
      });
    }

    // ── Audio embedded cover extraction (admin only) ──
    // POST body: { file: "track.mp3" }
    // Extracts embedded cover art from an audio file and saves as image to the collection folder.
    if (kind === 'audio') {
      app.post(`${p}/api/collections/:id/extract-cover`, auth.requirePerm('modify'), async (req, res) => {
        try {
          const id = req.params.id;
          const { file } = req.body || {};
          if (!file || !isSafeRelativePath(file)) return res.status(400).json({ error: '文件名非法' });
          const abs = store.resolveCollectionPath(id);
          if (!abs) return res.status(404).json({ error: '合集不存在' });
          const audioPath = path.join(abs, file);
          if (!fs.existsSync(audioPath)) return res.status(404).json({ error: '音频文件不存在' });
          const pic = await albumArt.readFirstPicture(audioPath);
          if (!pic) return res.status(404).json({ error: '该文件没有内嵌封面' });
          const ext = (pic.format || 'image/jpeg').replace('image/', '.');
          const outName = 'cover_' + Date.now() + ext;
          fs.writeFileSync(path.join(abs, outName), pic.data);
          store.migrateAll();
          res.json({ image: outName });
        } catch (e) {
          res.status(500).json({ error: '提取封面失败: ' + e.message });
        }
      });
    }

    // Full file-tree view used by the collection detail page's
    // "文件结构" tab. Returns every file + subdirectory under the
    // collection in tree-walk order so the frontend can build a
    // collapsible explorer with a single pass. Visibility gate mirrors
    // the single-collection GET above — non-admins can't list the tree
    // of a hidden collection, and the audio `_default` still shows
    // normally because it's not in the hidden set.
    app.get(`${p}/api/collections/:id/tree`, (req, res) => {
      try {
        const id = req.params.id;
        if (collectionsLib.validateId(id) !== null) {
          return res.status(400).json({ error: '合集名称非法' });
        }
        const col = store.getCollection(id);
        if (!col) return res.status(404).json({ error: '合集不存在' });

        // Same direct-access policy as GET /api/collections/:id —
        // c.hidden is the only category-independent gate.
        const role = (req.user && req.user.role) || 'guest';
        if (role !== 'admin' && col.hidden) {
          return res.status(404).json({ error: '合集不存在' });
        }

        const tree = store.listCollectionTree(id);
        if (tree === null) return res.status(404).json({ error: '合集不存在' });
        res.json({ tree });
      } catch (e) {
        res.status(500).json({ error: e.message });
      }
    });

    app.patch(`${p}/api/collections/:id/episodes/:file`, auth.requirePerm('delete'), async (req, res) => {
      try {
        const { id, file } = req.params;
        if (!isSimpleFilename(file)) return res.status(400).json({ error: '文件名非法' });
        const meta = await store.updateEpisodeMeta(id, file, req.body || {});
        res.json({ episodeMeta: meta });
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    // Reorder episodes in bulk: body = { items: [{file, order}, ...] }
    app.post(`${p}/api/collections/:id/episodes/reorder`, auth.requirePerm('delete'), async (req, res) => {
      try {
        const { id } = req.params;
        const result = await store.reorderEpisodes(id, (req.body || {}).items);
        res.json(result);
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    app.delete(`${p}/api/collections/:id/episodes/:file`, auth.requirePerm('delete'), async (req, res) => {
      try {
        const { id, file } = req.params;
        if (!isSimpleFilename(file)) return res.status(400).json({ error: '文件名非法' });
        const result = await store.deleteEpisode(id, file);
        await progress.clearEpisode(id, file);
        res.json(result);
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    app.post(`${p}/api/collections/:id/episodes/bulk`, auth.requirePerm('delete'), async (req, res) => {
      const sourceId = req.params.id;
      const { action, files, target } = req.body || {};
      try {
        const result = await store.bulkEpisodeOp(sourceId, action, files, target);
        if (action === 'delete' || action === 'move') {
          for (const f of result.processed) {
            await progress.clearEpisode(sourceId, f);
          }
        }
        res.json(result);
      } catch (e) {
        res.status(errorStatus(e)).json({ error: e.message });
      }
    });

    // ---- Upload (admin only) -------------------------------------
    const uploadMiddleware = multer({
      storage: multer.diskStorage({
        destination: (req, file, cb) => {
          const id = req.params && req.params.id;
          if (typeof id !== 'string' || !id) return cb(new Error('缺少合集 id'));
          const abs = store.resolveCollectionPath(id);
          if (!abs) return cb(new Error('合集名称非法'));
          if (!fs.existsSync(abs)) return cb(new Error('合集不存在'));
          cb(null, abs);
        },
        filename: (req, file, cb) => {
          const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
          file.originalname = original;
          const err = validateFilename(original);
          if (err) return cb(new Error(err));
          const abs = store.resolveCollectionPath(req.params.id);
          if (!abs) return cb(new Error('合集名称非法'));
          if (fs.existsSync(path.join(abs, original))) {
            return cb(new Error('文件已存在: ' + original));
          }
          cb(null, original);
        },
      }),
      limits: { fileSize: config.MAX_UPLOAD_BYTES, files: 200 },
      fileFilter: (req, file, cb) => {
        const original = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(original).toLowerCase();
        const allowed = [...mediaExts, ...config.IMAGE_EXTS, ...(subtitleExts || []), ...(extraExts || [])];
        if (!allowed.includes(ext)) {
          return cb(new Error('不支持的文件类型: ' + ext));
        }
        cb(null, true);
      },
    });

    app.post(`${p}/api/collections/:id/upload`, auth.requirePerm('upload'), (req, res) => {
      uploadMiddleware.array('files')(req, res, async (err) => {
        if (err) return res.status(400).json({ error: err.message });
        const files = (req.files || []).map((f) => ({ name: f.filename, size: f.size }));

        // Post-upload hook for the audio subsystem: if this collection
        // doesn't yet have a cover image, scan the newly-uploaded audio
        // files for embedded artwork and write the first hit as a
        // cover sidecar. We check `kind` so video uploads aren't
        // tagged — video files can also contain cover art (APE chapters,
        // Matroska attachments) but that's a different feature scope.
        if (kind === 'audio' && req.files && req.files.length > 0) {
          try {
            const abs = store.resolveCollectionPath(req.params.id);
            if (abs && !albumArt.hasAnyImage(abs)) {
              for (const f of req.files) {
                const ext = path.extname(f.filename).toLowerCase();
                if (!mediaExts.includes(ext)) continue;
                try {
                  const wrote = await albumArt.extractToFolder(f.path, abs);
                  if (wrote) break;  // first-hit wins
                } catch (_e) { /* per-file, try next */ }
              }
            }
          } catch (_e) { /* extraction is best-effort */ }
        }

        res.json({ ok: true, count: files.length, files });
      });
    });

    // ---- Progress ------------------------------------------------
    app.get(`${p}/api/progress`, auth.requireAuth, (req, res) => {
      res.json({ progress: progress.listForUser(req.user.username) });
    });

    app.get(`${p}/api/progress/:id/:file`, auth.requireAuth, (req, res) => {
      const { id, file } = req.params;
      if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
      if (!isSimpleFilename(file)) return res.status(400).json({ error: '文件名非法' });
      res.json({ progress: progress.get(req.user.username, id, file) });
    });

    app.post(`${p}/api/progress/:id/:file`, auth.requireAuth, async (req, res) => {
      const { id, file } = req.params;
      if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
      if (!isSimpleFilename(file)) return res.status(400).json({ error: '文件名非法' });
      try {
        const entry = await progress.set(req.user.username, id, file, req.body || {});
        res.json({ progress: entry });
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    });

    app.post(`${p}/api/progress/:id/:file/mark`, auth.requireAuth, async (req, res) => {
      const { id, file } = req.params;
      if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
      if (!isSimpleFilename(file)) return res.status(400).json({ error: '文件名非法' });
      const watched = !!(req.body && req.body.watched);
      try {
        const entry = await progress.mark(req.user.username, id, file, watched);
        res.json({ progress: entry });
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    });

    // ---- History -------------------------------------------------
    app.get(`${p}/api/history`, auth.requireAuth, (req, res) => {
      const byCol = progress.listForUser(req.user.username);
      const out = [];
      for (const colId of Object.keys(byCol)) {
        const eps = byCol[colId];
        let latest = null, latestFile = null;
        for (const file of Object.keys(eps)) {
          const e = eps[file];
          if (!latest || e.updatedAt > latest.updatedAt) {
            latest = e;
            latestFile = file;
          }
        }
        if (!latest) continue;
        const col = store.getCollection(colId);
        out.push({
          id: colId,
          title: col ? col.title : colId,
          cover: col ? col.cover : null,
          // Propagate the admin's cover crop so history thumbnails match
          // the framing chosen on the home grid and detail page.
          coverScale: col && typeof col.coverScale === 'number' ? col.coverScale : 1,
          coverX: col && typeof col.coverX === 'number' ? col.coverX : 50,
          coverY: col && typeof col.coverY === 'number' ? col.coverY : 50,
          type: col ? col.type : 'other',
          types: col ? (Array.isArray(col.types) && col.types.length ? col.types.slice() : [col.type]) : ['other'],
          lastFile: latestFile,
          lastEpisodeTitle: col
            ? (col.episodes.find((e) => e.file === latestFile) || {}).title || latestFile
            : latestFile,
          position: latest.position,
          duration: latest.duration || null,
          updatedAt: latest.updatedAt,
          exists: !!col,
        });
      }
      out.sort((a, b) => b.updatedAt - a.updatedAt);
      res.json({ history: out });
    });

    app.delete(`${p}/api/history`, auth.requireAuth, async (req, res) => {
      await progress.clearUser(req.user.username);
      res.json({ ok: true });
    });

    app.post(`${p}/api/history/delete`, auth.requireAuth, async (req, res) => {
      const items = req.body && req.body.items;
      if (!Array.isArray(items)) return res.status(400).json({ error: 'items 必须是数组' });
      const removed = await progress.removeEntries(req.user.username, items);
      res.json({ ok: true, removed });
    });

    // ---- Comments ------------------------------------------------
    app.get(`${p}/api/collections/:id/comments`, (req, res) => {
      if (collectionsLib.validateId(req.params.id) !== null) {
        return res.status(400).json({ error: '合集名称非法' });
      }
      res.json({ comments: comments.list(req.params.id) });
    });

    app.post(`${p}/api/collections/:id/comments`, auth.requireAuth, async (req, res) => {
      if (collectionsLib.validateId(req.params.id) !== null) {
        return res.status(400).json({ error: '合集名称非法' });
      }
      const col = store.getCollection(req.params.id);
      if (!col) return res.status(404).json({ error: '合集不存在' });
      try {
        const c = await comments.add(req.params.id, req.user.username, (req.body || {}).text);
        res.status(201).json({ comment: c });
      } catch (e) {
        res.status(400).json({ error: e.message });
      }
    });

    app.delete(`${p}/api/collections/:id/comments/:commentId`, auth.requireAuth, async (req, res) => {
      const result = await comments.remove(req.params.id, req.params.commentId, {
        username: req.user.username,
        role: req.user.role,
      });
      if (!result.ok) {
        const status = result.reason === 'forbidden' ? 403 : 404;
        return res.status(status).json({ error: result.reason === 'forbidden' ? '无权删除' : '评论不存在' });
      }
      res.json({ ok: true });
    });

    // ---- Favorites -----------------------------------------------
    app.get(`${p}/api/favorites`, auth.requireAuth, (req, res) => {
      res.json({ favorites: favorites.list(req.user.username) });
    });

    app.post(`${p}/api/favorites/:id`, auth.requireAuth, async (req, res) => {
      const id = req.params.id;
      if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
      const col = store.getCollection(id);
      if (!col) return res.status(404).json({ error: '合集不存在' });
      await favorites.add(req.user.username, id);
      res.json({ ok: true });
    });

    app.delete(`${p}/api/favorites/:id`, auth.requireAuth, async (req, res) => {
      await favorites.remove(req.user.username, req.params.id);
      res.json({ ok: true });
    });
  }

  // Mount video at legacy (no prefix) and audio at /audio.
  mountSubsystem({
    kind: 'video',
    prefix: '',
    store: videoStore,
    progress: videoProgress,
    comments: videoComments,
    favorites: videoFavorites,
    mediaDir: config.MEDIA_ROOT,
    mediaExts: config.VIDEO_EXTS,
    subtitleExts: config.VIDEO_SUBTITLE_EXTS,
  });
  mountSubsystem({
    kind: 'audio',
    prefix: '/audio',
    store: audioStore,
    progress: audioProgress,
    comments: audioComments,
    favorites: audioFavorites,
    mediaDir: config.AUDIO_ROOT,
    mediaExts: config.AUDIO_EXTS,
    subtitleExts: config.LYRIC_EXTS,
  });

  // ================================================================
  // Audio-only: lyric endpoint for a specific episode.
  // Returns the best lyric file parsed into unified { t, end, text } lines.
  //
  // Uses a regex route rather than `:file` because the episode path may
  // contain forward slashes when the track lives inside a subfolder
  // (recursive scan since the tree-view feature). The regex captures
  // collection id (one segment) and episode path (any number of
  // segments between /episodes/ and /lyric). Express decodes URL-encoded
  // slashes back to `/` before matching, so both %2F-encoded and plain
  // `/` URLs land here correctly.
  // ================================================================
  app.get(/^\/audio\/api\/collections\/([^/]+)\/episodes\/(.+)\/lyric$/, auth.requireAuth, (req, res) => {
    const id = req.params[0];
    const file = req.params[1];
    if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
    if (!isSafeRelativePath(file)) return res.status(400).json({ error: '文件名非法' });
    const lyric = audioStore.resolveLyricForEpisode(id, file);
    if (!lyric) return res.json({ lyric: null });
    res.json({ lyric });
  });

  mountSubsystem({
    kind: 'image',
    prefix: '/image',
    store: imageStore,
    progress: imageProgress,
    comments: imageComments,
    favorites: imageFavorites,
    mediaDir: config.IMAGE_ROOT,
    mediaExts: config.IMAGE_EXTS,
    subtitleExts: [],
  });

  mountSubsystem({
    kind: 'novel',
    prefix: '/novel',
    store: novelStore,
    progress: novelProgress,
    comments: novelComments,
    favorites: novelFavorites,
    mediaDir: config.NOVEL_ROOT,
    mediaExts: config.NOVEL_EXTS,
    subtitleExts: [],
  });

  // ================================================================
  // Audio-only: track-level likes ("我喜欢")
  // ================================================================
  app.get('/audio/api/track-likes', auth.requireAuth, (req, res) => {
    const likes = trackLikes.list(req.user.username).map((t) => {
      const col = audioStore.getCollection(t.collectionId);
      return {
        ...t,
        _type: col ? col.type : null,
        _types: col ? (Array.isArray(col.types) && col.types.length ? col.types.slice() : [col.type]) : null,
      };
    });
    res.json({ likes });
  });
  app.post('/audio/api/track-likes', auth.requireAuth, async (req, res) => {
    const { collectionId, file } = req.body || {};
    if (!collectionId || !file) return res.status(400).json({ error: '缺少 collectionId 或 file' });
    await trackLikes.add(req.user.username, collectionId, file);
    res.json({ ok: true });
  });
  app.delete('/audio/api/track-likes', auth.requireAuth, async (req, res) => {
    const { collectionId, file } = req.body || {};
    if (!collectionId || !file) return res.status(400).json({ error: '缺少 collectionId 或 file' });
    await trackLikes.remove(req.user.username, collectionId, file);
    res.json({ ok: true });
  });
  app.post('/audio/api/track-likes/batch', auth.requireAuth, async (req, res) => {
    const { collectionId, files, action } = req.body || {};
    if (!collectionId || !Array.isArray(files)) return res.status(400).json({ error: '参数非法' });
    if (action === 'remove') {
      await trackLikes.batchRemove(req.user.username, collectionId, files);
    } else {
      await trackLikes.batchAdd(req.user.username, collectionId, files);
    }
    res.json({ ok: true });
  });

  // ================================================================
  // Image-only: per-image likes ("收藏")
  // ================================================================
  app.get('/image/api/image-likes', auth.requireAuth, (req, res) => {
    const likes = imageLikes.list(req.user.username).map((t) => {
      const col = imageStore.getCollection(t.collectionId);
      return {
        ...t,
        _type: col ? col.type : null,
        _types: col ? (Array.isArray(col.types) && col.types.length ? col.types.slice() : [col.type]) : null,
      };
    });
    res.json({ likes });
  });
  app.post('/image/api/image-likes', auth.requireAuth, async (req, res) => {
    const { collectionId, file } = req.body || {};
    if (!collectionId || !file) return res.status(400).json({ error: '缺少参数' });
    await imageLikes.add(req.user.username, collectionId, file);
    res.json({ ok: true });
  });
  app.delete('/image/api/image-likes', auth.requireAuth, async (req, res) => {
    const { collectionId, file } = req.body || {};
    if (!collectionId || !file) return res.status(400).json({ error: '缺少参数' });
    await imageLikes.remove(req.user.username, collectionId, file);
    res.json({ ok: true });
  });

  // ================================================================
  // Audio-only: all-episodes endpoint — returns episodes from every
  // visible (non-hidden) audio collection merged into one flat list.
  // Each episode includes its source collectionId and collectionTitle
  // so the frontend can build a cross-collection playlist.
  // ================================================================
  app.get('/audio/api/all-episodes', auth.requireAuth, (req, res) => {
    try {
      const cols = audioStore.listCollections({ includeHidden: false });
      // 1.1.0+: include descendants of hidden parents in the taint check.
      const hiddenCats = categoriesStore.effectiveHiddenIds('audio');
      const episodes = [];
      for (const summary of cols) {
        // "Play all" follows the same rule as the home "全部" view:
        // exclude any collection whose tags include even one hidden
        // category (strict taint rule). Admins included — play-all is
        // a default-mode flow, not a chip-select escape hatch.
        const ts = Array.isArray(summary.types) && summary.types.length ? summary.types : [summary.type];
        const anyTagHidden = ts.some((t) => hiddenCats.has(t));
        if (summary.hidden || anyTagHidden) continue;
        const col = audioStore.getCollection(summary.id);
        if (!col) continue;
        for (const ep of col.episodes) {
          episodes.push({
            file: ep.file,
            title: ep.title,
            size: ep.size,
            mtime: ep.mtime,
            ext: ep.ext,
            order: ep.order,
            trackNumber: ep.trackNumber || null,
            artist: ep.artist || null,
            collectionId: summary.id,
            collectionTitle: summary.title || summary.id,
          });
        }
      }
      res.json({ episodes, total: episodes.length });
    } catch (e) {
      res.status(500).json({ error: '加载失败: ' + e.message });
    }
  });

  // ================================================================
  // Audio-only: scan/refresh track metadata (trackNumber, artist).
  // POST triggers a full scan; GET just returns cached results.
  // ================================================================
  app.post('/audio/api/collections/:id/scan-meta', auth.requirePerm('modify'), async (req, res) => {
    const id = req.params.id;
    if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
    try {
      const meta = await audioStore.scanAudioMeta(id);
      if (!meta) return res.status(404).json({ error: '合集不存在' });
      res.json({ scanned: Object.keys(meta).length });
    } catch (e) {
      res.status(500).json({ error: '元数据扫描失败: ' + e.message });
    }
  });

  // ================================================================
  // Audio-only: per-track embedded cover art.
  //
  // Streams the first embedded picture (ID3v2 APIC, FLAC
  // METADATA_BLOCK_PICTURE, MP4 'covr', OGG/Opus, etc.) from the given
  // audio file. 404 when the file has no embedded art — callers
  // (episode list thumbnails, audio player cover) are expected to treat
  // 404 as "show nothing" rather than falling back to the collection
  // cover, per product spec.
  //
  // Browser caches for an hour so the 30-track episode list doesn't
  // slam the server when scrolled or re-entered.
  //
  // Regex-route rationale same as the /lyric endpoint above: the
  // episode file may be a multi-segment path inside a subfolder.
  // ================================================================
  app.get(/^\/audio\/api\/collections\/([^/]+)\/episodes\/(.+)\/cover$/, auth.requireAuth, async (req, res) => {
    const id = req.params[0];
    const file = req.params[1];
    if (collectionsLib.validateId(id) !== null) return res.status(400).json({ error: '合集名称非法' });
    if (!isSafeRelativePath(file)) return res.status(400).json({ error: '文件名非法' });
    const colDir = audioStore.resolveCollectionPath(id);
    if (!colDir) return res.status(404).json({ error: '合集不存在' });
    const abs = path.resolve(colDir, file);
    if (abs !== colDir && !abs.startsWith(colDir + path.sep)) {
      return res.status(400).json({ error: '路径非法' });
    }
    try {
      const st = fs.statSync(abs);
      if (!st.isFile()) return res.status(404).json({ error: '文件不存在' });
    } catch (_e) {
      return res.status(404).json({ error: '文件不存在' });
    }
    // Only try to extract from audio-extension files; refuse cover
    // requests for lyric/image sidecars to avoid confusing errors.
    const ext = path.extname(file).toLowerCase();
    if (!config.AUDIO_EXTS.includes(ext)) {
      return res.status(404).json({ error: '不是音频文件' });
    }
    try {
      const pic = await albumArt.readFirstPicture(abs);
      if (!pic) return res.status(404).end();
      res.setHeader('Content-Type', pic.format || 'image/jpeg');
      res.setHeader('Cache-Control', 'private, max-age=3600');
      res.setHeader('Content-Length', pic.data.length);
      res.end(pic.data);
    } catch (e) {
      res.status(500).json({ error: '读取封面失败: ' + (e.message || e) });
    }
  });

  // ================================================================
  // Admin (operates across both subsystems)
  // ================================================================
  app.get('/api/admin/users', auth.requireAdmin, (req, res) => {
    res.json({ users: users.list() });
  });

  app.delete('/api/admin/users/:username', auth.requireAdmin, async (req, res) => {
    const target = req.params.username;
    if (target === req.user.username) return res.status(400).json({ error: '不能删除自己' });
    try {
      await users.remove(target);
      sessions.destroyAllFor(target);
      await videoProgress.clearUser(target);
      await audioProgress.clearUser(target);
      await imageProgress.clearUser(target);
      await novelProgress.clearUser(target);
      await videoFavorites.clearUser(target);
      await audioFavorites.clearUser(target);
      await imageFavorites.clearUser(target);
      await novelFavorites.clearUser(target);
      await videoComments.clearUser(target);
      await audioComments.clearUser(target);
      await imageComments.clearUser(target);
      await novelComments.clearUser(target);
      res.json({ ok: true });
    } catch (e) {
      res.status(errorStatus(e)).json({ error: e.message });
    }
  });

  app.post('/api/admin/users/:username/password', auth.requireAdmin, async (req, res) => {
    try {
      await users.update(req.params.username, { password: (req.body || {}).password });
      sessions.destroyAllFor(req.params.username);
      res.json({ ok: true });
    } catch (e) {
      res.status(errorStatus(e)).json({ error: e.message });
    }
  });

  // Admin: set a user's per-kind category whitelist.
  // Body: { visibleCategories: { video: [...], audio: [...] } }
  app.post('/api/admin/users/:username/visible-categories', auth.requireAdmin, async (req, res) => {
    try {
      const next = await users.update(req.params.username, {
        visibleCategories: (req.body || {}).visibleCategories,
      });
      res.json({ user: next });
    } catch (e) {
      res.status(errorStatus(e)).json({ error: e.message });
    }
  });

  // Admin: set a user's content-action permissions (upload / create /
  // modify / delete). Admin role bypasses these gates entirely; this
  // endpoint only meaningfully affects role:'user' accounts.
  // Body: { permissions: { upload: bool, create: bool, modify: bool, delete: bool } }
  app.post('/api/admin/users/:username/permissions', auth.requireAdmin, async (req, res) => {
    try {
      const next = await users.update(req.params.username, {
        permissions: (req.body || {}).permissions,
      });
      res.json({ user: next });
    } catch (e) {
      res.status(errorStatus(e)).json({ error: e.message });
    }
  });

  app.post('/api/admin/rescan', auth.requireAdmin, (req, res) => {
    try {
      videoStore.migrateAll();
      audioStore.migrateAll();
      audioStore.ensureDefaultCollection();
      imageStore.migrateAll();
      novelStore.migrateAll();
      res.json({
        ok: true,
        video: videoStore.listCollections({ includeHidden: true }).length,
        audio: audioStore.listCollections({ includeHidden: true }).length,
        image: imageStore.listCollections({ includeHidden: true }).length,
        novel: novelStore.listCollections({ includeHidden: true }).length,
      });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get('/api/admin/stats', auth.requireAdmin, (req, res) => {
    const v = videoStore.listCollections({ includeHidden: true });
    const a = audioStore.listCollections({ includeHidden: true });
    const im = imageStore.listCollections({ includeHidden: true });
    const nv = novelStore.listCollections({ includeHidden: true });
    /**
     * @brief Reduce a kind's collection list to the stats digest the
     *        admin panel renders.
     *
     * The `hidden` count is the number of collections that disappear
     * from the default "all" home view for non-admin users. A
     * collection vanishes either because it was explicitly hidden
     * (its own `hidden` flag) OR because at least one of its tags is
     * in the kind's effectiveHiddenIds set (a hidden parent tag taints
     * every collection sitting under that subtree). Counting only
     * `c.hidden=true` undercounts the second case, which is the larger
     * one in practice — admins typically hide entire categories rather
     * than individual collections.
     *
     * @param list   Full collection list for one kind (includeHidden: true)
     * @param kind   Kind id used to look up effectiveHiddenIds
     */
    function digest(list, kind) {
      const totalSize = list.reduce((s, c) => s + (c.totalSize || 0), 0);
      const totalEpisodes = list.reduce((s, c) => s + (c.episodeCount || 0), 0);
      const byType = {};
      for (const c of list) {
        const ts = Array.isArray(c.types) && c.types.length > 0 ? c.types : [c.type];
        for (const t of ts) byType[t] = (byType[t] || 0) + 1;
      }
      const topLarge = list.slice().sort((a, b) => b.totalSize - a.totalSize).slice(0, 5)
        .map((c) => ({ id: c.id, title: c.title, size: c.totalSize, episodes: c.episodeCount }));
      const hiddenCats = categoriesStore.effectiveHiddenIds(kind);
      let hiddenSelf = 0;
      let hiddenByTag = 0;
      for (const c of list) {
        const isSelfHidden = !!c.hidden;
        const ts = Array.isArray(c.types) && c.types.length > 0 ? c.types : [c.type];
        const tainted = ts.some((t) => hiddenCats.has(t));
        if (isSelfHidden) hiddenSelf++;
        else if (tainted) hiddenByTag++;
      }
      return {
        collections: list.length,
        // Total invisible-by-default count (the headline number).
        hidden: hiddenSelf + hiddenByTag,
        // Breakdown so the panel can show "where the hidden count
        // comes from" if useful — the home admin tab currently just
        // reads .hidden but the structured fields cost nothing.
        hiddenSelf,
        hiddenByTag,
        episodes: totalEpisodes,
        totalSize, byType, topLarge,
      };
    }
    res.json({
      users: users.count(),
      video: digest(v, 'video'),
      audio: digest(a, 'audio'),
      image: digest(im, 'image'),
      novel: digest(nv, 'novel'),
      uptime: Math.floor((Date.now() - BOOT_TIME) / 1000),
      version: VERSION,
    });
  });

  app.get('/api/admin/health-check', auth.requireAdmin, (req, res) => {
    function check(store, progress) {
      const liveIds = new Set(store.listCollections({ includeHidden: true }).map((c) => c.id));
      const dump = progress.dump();
      const orphanProgress = [];
      const orphanEpisodes = [];
      for (const u of Object.keys(dump)) {
        for (const cid of Object.keys(dump[u])) {
          if (!liveIds.has(cid)) {
            orphanProgress.push({ user: u, collection: cid });
            continue;
          }
          const col = store.getCollection(cid);
          if (!col) continue;
          const liveFiles = new Set(col.episodes.map((e) => e.file));
          for (const f of Object.keys(dump[u][cid])) {
            if (!liveFiles.has(f)) orphanEpisodes.push({ user: u, collection: cid, file: f });
          }
        }
      }
      const missingCovers = [];
      for (const c of store.listCollections({ includeHidden: true })) {
        if (!c.cover) continue;
        const covPath = path.join(store.root, c.id, c.cover);
        if (!fs.existsSync(covPath)) missingCovers.push({ collection: c.id, cover: c.cover });
      }
      return { orphanProgress, orphanEpisodes, missingCovers };
    }
    const video = check(videoStore, videoProgress);
    const audio = check(audioStore, audioProgress);
    const image = check(imageStore, imageProgress);
    const novel = check(novelStore, novelProgress);
    function summarize(d) {
      return {
        orphanProgressCount: d.orphanProgress.length,
        orphanEpisodeCount: d.orphanEpisodes.length,
        missingCoverCount: d.missingCovers.length,
      };
    }
    res.json({
      video, audio, image, novel,
      summary: {
        video: summarize(video),
        audio: summarize(audio),
        image: summarize(image),
        novel: summarize(novel),
      },
    });
  });

  app.post('/api/admin/health-check/clean', auth.requireAdmin, async (req, res) => {
    async function clean(store, progress) {
      const liveIds = new Set(store.listCollections({ includeHidden: true }).map((c) => c.id));
      const dump = progress.dump();
      let cleaned = 0;
      for (const u of Object.keys(dump)) {
        for (const cid of Object.keys(dump[u])) {
          if (!liveIds.has(cid)) {
            await progress.clearCollection(cid);
            cleaned++;
            continue;
          }
          const col = store.getCollection(cid);
          if (!col) continue;
          const liveFiles = new Set(col.episodes.map((e) => e.file));
          for (const f of Object.keys(dump[u][cid] || {})) {
            if (!liveFiles.has(f)) {
              await progress.clearEpisode(cid, f);
              cleaned++;
            }
          }
        }
      }
      return cleaned;
    }
    const videoCleaned = await clean(videoStore, videoProgress);
    const audioCleaned = await clean(audioStore, audioProgress);
    const imageCleaned = await clean(imageStore, imageProgress);
    const novelCleaned = await clean(novelStore, novelProgress);
    res.json({
      ok: true,
      cleaned: videoCleaned + audioCleaned + imageCleaned + novelCleaned,
      video: videoCleaned,
      audio: audioCleaned,
      image: imageCleaned,
      novel: novelCleaned,
    });
  });

  // ================================================================
  // Admin: duplicate-collection detection
  // ================================================================
  // Two modes:
  //   suspect    — normalized-equality (strip whitespace/punct, lowercase,
  //                NFKC) OR Levenshtein distance ≤ 2 of the normalized form
  //   similarity — character-bigram Jaccard ≥ threshold (0..1). Bigrams are
  //                language-agnostic so 中/日/英 mixes all behave reasonably.
  //
  // Output: groups of collections that should be reviewed together. Each
  // collection in a group carries id / title / types / episodeCount /
  // totalSize. Groups are formed by union-find over edges that cross the
  // threshold so transitive matches collapse into one group.
  function _normalizeTitle(s) {
    if (!s) return '';
    let t = String(s);
    try { t = t.normalize('NFKC'); } catch (_e) {}
    return t.toLowerCase().replace(/[\s\p{P}\p{S}]+/gu, '');
  }
  function _bigrams(s) {
    const out = new Set();
    if (!s || s.length < 2) {
      if (s) out.add(s);
      return out;
    }
    for (let i = 0; i < s.length - 1; i++) out.add(s.slice(i, i + 2));
    return out;
  }
  function _jaccard(a, b) {
    if (a.size === 0 && b.size === 0) return 1;
    if (a.size === 0 || b.size === 0) return 0;
    let inter = 0;
    const [small, large] = a.size <= b.size ? [a, b] : [b, a];
    for (const x of small) if (large.has(x)) inter++;
    return inter / (a.size + b.size - inter);
  }
  function _levenshtein(a, b, cap) {
    if (a === b) return 0;
    if (Math.abs(a.length - b.length) > cap) return cap + 1;
    const m = a.length, n = b.length;
    if (m === 0) return n;
    if (n === 0) return m;
    let prev = new Array(n + 1);
    let curr = new Array(n + 1);
    for (let j = 0; j <= n; j++) prev[j] = j;
    for (let i = 1; i <= m; i++) {
      curr[0] = i;
      let rowMin = curr[0];
      for (let j = 1; j <= n; j++) {
        const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
        curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
        if (curr[j] < rowMin) rowMin = curr[j];
      }
      if (rowMin > cap) return cap + 1;
      [prev, curr] = [curr, prev];
    }
    return prev[n];
  }
  app.get('/api/admin/duplicates', auth.requireAdmin, (req, res) => {
    const kind = String(req.query.kind || 'video');
    const stores = { video: videoStore, audio: audioStore, image: imageStore, novel: novelStore };
    const store = stores[kind];
    if (!store) return res.status(400).json({ error: '未知板块: ' + kind });
    const mode = req.query.mode === 'similarity' ? 'similarity' : 'suspect';
    let threshold = Number(req.query.threshold);
    if (!Number.isFinite(threshold)) threshold = 0.7;
    threshold = Math.max(0.5, Math.min(0.95, threshold));

    const cols = store.listCollections({ includeHidden: true }).map((c) => ({
      id: c.id,
      title: c.title || c.id,
      types: Array.isArray(c.types) && c.types.length ? c.types.slice() : [c.type || 'other'],
      episodeCount: c.episodeCount || 0,
      totalSize: c.totalSize || 0,
      hidden: !!c.hidden,
      norm: _normalizeTitle(c.title || c.id),
    }));
    if (mode === 'similarity') {
      for (const c of cols) c._gram = _bigrams(c.norm);
    }
    // Whitelist: pairs the admin has manually marked "not a duplicate".
    // Edges that hit the whitelist are dropped before union-find, so the
    // pair never appears in any group on subsequent scans. If the rest
    // of a group dissolves to <2 members as a result, the group itself
    // is suppressed naturally.
    const whitelistKeys = dupWhitelist.keySet(kind);
    // Union-find over collections.
    const parent = cols.map((_, i) => i);
    const find = (x) => { while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; } return x; };
    const union = (a, b) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb; };
    const edges = []; // [{a, b, score}]
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const a = cols[i], b = cols[j];
        if (!a.norm && !b.norm) continue;
        if (whitelistKeys.has(duplicateWhitelistLib.pairKey(a.id, b.id))) continue;
        let score = 0;
        let match = false;
        if (mode === 'similarity') {
          score = _jaccard(a._gram, b._gram);
          if (score >= threshold) match = true;
        } else {
          if (a.norm && a.norm === b.norm) { match = true; score = 1; }
          else {
            // Cap Levenshtein distance proportional to the shorter title:
            // short titles like "EP1"/"EP2"/"S1"/"S2" or "v1"/"v2" all
            // sit at distance 1 and would otherwise merge into one giant
            // group. Require min length ≥ 4 before any near-miss match,
            // and cap at min(2, floor(minLen/3)) so 4-char titles need
            // exact match (cap=1), 6-char need ≤2 etc.
            const minLen = Math.min(a.norm.length, b.norm.length);
            if (minLen >= 4) {
              const cap = Math.min(2, Math.max(1, Math.floor(minLen / 3)));
              const d = _levenshtein(a.norm, b.norm, cap);
              if (d <= cap) {
                match = true;
                const maxLen = Math.max(a.norm.length, b.norm.length, 1);
                score = Math.max(0, 1 - d / maxLen);
              }
            }
          }
        }
        if (match) {
          edges.push({ a: i, b: j, score });
          union(i, j);
        }
      }
    }
    // Bucket cols by root, keep only buckets with ≥ 2 members.
    const buckets = new Map();
    for (let i = 0; i < cols.length; i++) {
      const r = find(i);
      if (!buckets.has(r)) buckets.set(r, []);
      buckets.get(r).push(i);
    }
    const groups = [];
    for (const [, idxs] of buckets) {
      if (idxs.length < 2) continue;
      let topScore = 0;
      for (const e of edges) {
        if (idxs.includes(e.a) && idxs.includes(e.b) && e.score > topScore) topScore = e.score;
      }
      groups.push({
        topScore,
        collections: idxs.map((i) => {
          const c = cols[i];
          return {
            id: c.id,
            title: c.title,
            types: c.types,
            episodeCount: c.episodeCount,
            totalSize: c.totalSize,
            hidden: c.hidden,
          };
        }),
      });
    }
    groups.sort((x, y) => y.topScore - x.topScore);
    res.json({ kind, mode, threshold, total: cols.length, groups });
  });

  // List the whitelist for a kind. Each entry is annotated with the
  // current title (or null if the collection has been deleted) so the
  // UI can render "已不存在" for dangling references.
  app.get('/api/admin/duplicates/whitelist', auth.requireAdmin, (req, res) => {
    const kind = String(req.query.kind || 'video');
    const stores = { video: videoStore, audio: audioStore, image: imageStore, novel: novelStore };
    const store = stores[kind];
    if (!store) return res.status(400).json({ error: '未知板块: ' + kind });
    const cols = store.listCollections({ includeHidden: true });
    const titleOf = new Map();
    for (const c of cols) titleOf.set(c.id, c.title || c.id);
    const pairs = dupWhitelist.getKind(kind).map(([a, b]) => ({
      a, b,
      titleA: titleOf.has(a) ? titleOf.get(a) : null,
      titleB: titleOf.has(b) ? titleOf.get(b) : null,
    }));
    res.json({ kind, pairs });
  });
  app.post('/api/admin/duplicates/whitelist', auth.requireAdmin, async (req, res) => {
    try {
      const kind = String((req.body && req.body.kind) || 'video');
      const a = String((req.body && req.body.a) || '');
      const b = String((req.body && req.body.b) || '');
      if (!a || !b) return res.status(400).json({ error: '需要两个合集 id' });
      if (a === b) return res.status(400).json({ error: '同一合集不能加白名单' });
      await dupWhitelist.add(kind, a, b);
      res.json({ ok: true, pairs: dupWhitelist.getKind(kind) });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });
  app.delete('/api/admin/duplicates/whitelist', auth.requireAdmin, async (req, res) => {
    try {
      const kind = String(req.query.kind || 'video');
      const a = String(req.query.a || '');
      const b = String(req.query.b || '');
      if (!a || !b) return res.status(400).json({ error: '需要两个合集 id' });
      await dupWhitelist.remove(kind, a, b);
      res.json({ ok: true, pairs: dupWhitelist.getKind(kind) });
    } catch (e) {
      res.status(400).json({ error: e.message });
    }
  });

  // ================================================================
  // Listen + graceful shutdown
  // ================================================================
  // Port selection: try config.PORT first, then fall back through
  // config.PORT_FALLBACKS until something binds. If everything in the
  // fallback list is occupied we exit with an error — see the comment
  // in config.js explaining why we DON'T include port 0 (OS-assigned)
  // as a final escape hatch.
  const PORT_FILE = path.join(__dirname, '.server.port');
  const PID_FILE = path.join(__dirname, '.server.pid');
  const LOCK_DIR = path.join(__dirname, '.server.boot-lock');

  // Write PID synchronously before we even try to listen. The launcher
  // relies on the PID file appearing fast so a second click can detect
  // "a boot is already in progress" and join the health poll instead of
  // starting a parallel node. Previously we wrote the PID inside the
  // listening callback, which left a ~30ms+ window where a racing launcher
  // saw no PID file and started a duplicate process.
  try {
    fs.writeFileSync(PID_FILE, String(process.pid), { encoding: 'ascii' });
  } catch (e) {
    console.warn('  early .server.pid write failed:', e.message);
  }

  const portCandidates = [config.PORT, ...(config.PORT_FALLBACKS || [])];
  // De-duplicate while preserving order.
  const tried = new Set();
  const orderedCandidates = portCandidates.filter((p) => {
    if (tried.has(p)) return false;
    tried.add(p);
    return true;
  });

  function cleanupOnExitFiles() {
    try { fs.unlinkSync(PORT_FILE); } catch (_) { /* no-op */ }
    try { fs.unlinkSync(PID_FILE); } catch (_) { /* no-op */ }
    try { fs.rmdirSync(LOCK_DIR); } catch (_) { /* no-op */ }
  }
  // Best-effort cleanup on any self-inflicted exit (including ones from
  // tryListen's "all candidates failed" branch or uncaughtException below).
  // Does NOT run on TerminateProcess (taskkill /F) — the shutDown.bat
  // command-line sweep is the safety net for that case.
  process.on('exit', cleanupOnExitFiles);

  function tryListen(idx) {
    if (idx >= orderedCandidates.length) {
      console.error('  All candidate ports failed. Giving up.');
      process.exit(1);
      return;
    }
    const candidate = orderedCandidates[idx];
    step('tryListen ' + (candidate === 0 ? 'OS-assigned' : candidate));
    // exclusive: true so Windows surfaces EADDRINUSE cleanly instead of
    // silently allowing two processes to share a port (libuv default on
    // Windows uses SO_EXCLUSIVEADDRUSE, but the explicit flag removes any
    // ambiguity across platforms).
    const s = app.listen({ port: candidate, host: config.HOST, exclusive: true });
    s.once('error', (err) => {
      if (err && (err.code === 'EADDRINUSE' || err.code === 'EACCES')) {
        const label = candidate === 0 ? 'OS-assigned' : String(candidate);
        console.warn(`  Port ${label} unavailable (${err.code}) — trying next candidate`);
        tryListen(idx + 1);
      } else {
        console.error('  listen() failed:', err);
        process.exit(1);
      }
    });
    s.once('listening', () => {
      const actualPort = s.address().port;
      const shown = config.HOST === '0.0.0.0' ? 'localhost' : config.HOST;
      step('listening on ' + actualPort + ' — writing .server.port');
      // PID was already written pre-listen. Persist the actual port now so
      // launchers/shutdown scripts can find us. Also release the boot lock
      // so a future launcher is free to cold-start us again.
      try {
        fs.writeFileSync(PORT_FILE, String(actualPort), { encoding: 'ascii' });
      } catch (e) {
        console.warn('  Could not write .server.port:', e.message);
      }
      try { fs.rmdirSync(LOCK_DIR); } catch (_) { /* lock may not exist */ }
      console.log('');
      console.log('  Chiral Network Channel v' + VERSION);
      console.log('  -----------------------');
      console.log(`  Local:  http://${shown}:${actualPort}`);
      if (actualPort !== config.PORT) {
        console.log(`  (note: preferred port ${config.PORT} was busy, fell back to ${actualPort})`);
      }
      console.log(`  Video:  ${config.MEDIA_ROOT}`);
      console.log(`  Audio:  ${config.AUDIO_ROOT}`);
      console.log(`  Users:  ${users.count()}`);
      console.log('');
      // Expose to the outer shutdown handler.
      serverRef.instance = s;
    });
  }

  const serverRef = { instance: null };
  tryListen(0);

  let shuttingDown = false;
  function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n  received ${signal} — shutting down gracefully`);
    // `exit` handler will also sweep these, but unlinking here means the
    // files are gone before http server close finishes (helps fast restart).
    try { fs.unlinkSync(PORT_FILE); } catch (_) { /* no-op */ }
    try { fs.unlinkSync(PID_FILE); } catch (_) { /* no-op */ }
    try { fs.rmdirSync(LOCK_DIR); } catch (_) { /* no-op */ }
    const s = serverRef.instance;
    if (s) {
      s.close(() => {
        console.log('  http server closed');
        process.exit(0);
      });
    } else {
      process.exit(0);
    }
    setTimeout(() => {
      console.log('  forced exit');
      process.exit(0);
    }, 5000).unref();
  }
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Surface early process-level failures to server.err so the launcher's
// log-dump can show them on timeout. Without these handlers an async throw
// during require() or boot() setup may leave the hidden node.exe alive
// just long enough for the launcher's BOOT_TIMEOUT window to elapse with
// nothing in the log. The `exit` handler registered inside boot() takes
// care of unlinking the dotfiles after we call process.exit(1).
process.on('uncaughtException', (err) => {
  console.error('[fatal] uncaughtException:', err && err.stack || err);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error('[fatal] unhandledRejection:', reason && reason.stack || reason);
  process.exit(1);
});

boot().catch((err) => {
  console.error('[fatal] Boot failed:', err && err.stack || err);
  process.exit(1);
});
