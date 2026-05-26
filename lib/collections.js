// Collection (合集) metadata store — factory pattern.
//
// Every subsystem (video, audio) instantiates its own store via createStore()
// with its own root directory, extension list and valid-type list. All state
// lives in the closure, so two instances don't interfere.
//
// Layout on disk: one sub-folder under the given root = one collection; its
// metadata lives in a hidden `.collection.json` file at the folder root.
// Episodes are the media files directly inside the folder. No in-memory cache
// — we always read from disk so manual filesystem edits are reflected.

const fs = require('fs');
const path = require('path');

const DEFAULT_META_FILENAME = '.collection.json';
const WINDOWS_RESERVED_RE = /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i;
const INVALID_ID_CHAR_RE = /[\\/:*?"<>|]/;

// ---- Static helpers (no instance state) ---------------------------------
function mkError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function normalizeExts(exts) {
  const out = new Set();
  if (!Array.isArray(exts)) return out;
  for (const e of exts) {
    if (typeof e !== 'string' || !e) continue;
    const lower = e.toLowerCase();
    out.add(lower.startsWith('.') ? lower : '.' + lower);
  }
  return out;
}

function validateId(id) {
  if (typeof id !== 'string') return '名称非法';
  const trimmed = id.trim();
  if (trimmed.length < 1 || trimmed.length > 80) return '名称非法';
  if (trimmed === '.' || trimmed === '..') return '名称非法';
  if (trimmed.startsWith('.')) return '名称非法';
  // Synology-reserved folder prefixes. When the app runs on a DSM
  // shared folder, the directory listing includes DSM's own bookkeeping
  // directories: @eaDir (thumbnail/index cache spawned by Media Server,
  // Universal Search, Photo Station), @tmp, @database, @appstore, etc.,
  // plus #recycle (per-share trash) and #snapshot (Btrfs snapshots).
  // These are not user content and must never surface as empty
  // collections in the media library UI. The filter is deliberately
  // broad — any name starting with @ or # is rejected — because these
  // characters are conventionally reserved on DSM and a user who
  // genuinely wants a collection starting with one of them can rename.
  if (trimmed.startsWith('@') || trimmed.startsWith('#')) return '名称非法';
  if (INVALID_ID_CHAR_RE.test(trimmed)) return '名称非法';
  const base = trimmed.split('.')[0];
  if (WINDOWS_RESERVED_RE.test(base)) return '名称非法';
  if (/[. ]$/.test(trimmed)) return '名称非法';
  return null;
}

function safeReaddir(dir) {
  try {
    return fs.readdirSync(dir, { withFileTypes: true });
  } catch (_e) {
    return [];
  }
}

function basenameNoExt(filename) {
  const e = path.extname(filename);
  return e ? filename.slice(0, filename.length - e.length) : filename;
}

// ---- Factory ------------------------------------------------------------
// options = {
//   root:          absolute path to the collections root
//   mediaExts:     array of accepted episode file extensions (e.g. .mp4)
//   imageExts:     array of image extensions for cover detection
//   subtitleExts:  array of sidecar subtitle/lyric extensions
//   validTypes:    array of valid type tags
//   defaultType:   default type tag (first of validTypes if omitted)
//   metaFilename:  override the .collection.json filename
//   protectedIds:  array of ids that cannot be deleted via deleteCollection
// }
function createStore(options) {
  if (!options || typeof options !== 'object') {
    throw mkError('createStore 需要配置对象', 'E_INVALID_CONFIG');
  }
  if (typeof options.root !== 'string' || !options.root) {
    throw mkError('root 未配置', 'E_INVALID_CONFIG');
  }

  const ROOT = path.resolve(options.root);
  const MEDIA_EXT_SET = normalizeExts(options.mediaExts || []);
  const IMAGE_EXT_SET = normalizeExts(options.imageExts || []);
  const SUB_EXT_SET = normalizeExts(options.subtitleExts || []);
  const VALID_TYPES = Array.isArray(options.validTypes) && options.validTypes.length > 0
    ? options.validTypes.slice()
    : ['series', 'movie', 'other'];
  const DEFAULT_TYPE = typeof options.defaultType === 'string' && VALID_TYPES.includes(options.defaultType)
    ? options.defaultType
    : VALID_TYPES[VALID_TYPES.length - 1];
  const META_FILENAME = typeof options.metaFilename === 'string' && options.metaFilename.length > 0
    ? options.metaFilename
    : DEFAULT_META_FILENAME;
  const PROTECTED_IDS = new Set(Array.isArray(options.protectedIds) ? options.protectedIds : []);

  // Serialize writes for this store instance.
  let writeLock = Promise.resolve();
  function withLock(fn) {
    const next = writeLock.then(fn, fn);
    writeLock = next.catch(() => {});
    return next;
  }

  // ---- Internal path helpers ----
  function resolveCollectionPath(id) {
    if (typeof id !== 'string') return null;
    const trimmed = id.trim();
    if (validateId(trimmed) !== null) return null;
    const abs = path.resolve(ROOT, trimmed);
    // Must be a direct child of ROOT (no "../" traversal).
    if (path.dirname(abs) !== ROOT) return null;
    return abs;
  }

  // Walk the full collection tree (subject to shouldSkipName and the
  // MAX_SCAN_DEPTH cap) and collect every image file with its RELATIVE
  // path from the collection root. Used by the cover picker and the
  // auto cover detector below. Depth-capped to prevent runaway symlink
  // loops — same contract as scanEpisodesRaw.
  //
  // shouldSkipName and joinRel and MAX_SCAN_DEPTH are defined below in
  // the Episode scanning section; they're hoisted in the closure so
  // this function can use them. Order in the file is unusual (we use
  // identifiers before their textual declaration) but legal in JS
  // because these are function declarations inside the same factory.
  function walkImages(folderAbs) {
    const out = [];
    function walk(dir, relPrefix, depth) {
      if (depth > MAX_SCAN_DEPTH) return;
      const entries = safeReaddir(dir);
      for (const ent of entries) {
        const name = ent.name;
        if (shouldSkipName(name)) continue;
        if (ent.isDirectory()) {
          walk(path.join(dir, name), joinRel(relPrefix, name), depth + 1);
          continue;
        }
        if (!ent.isFile()) continue;
        const ext = path.extname(name).toLowerCase();
        if (!IMAGE_EXT_SET.has(ext)) continue;
        out.push(joinRel(relPrefix, name));
      }
    }
    walk(folderAbs, '', 0);
    // Sort root files first (no `/`), then nested files, with locale+
    // numeric collation inside each bucket. Matches the "root first,
    // then subdirs" policy used everywhere else in the store.
    out.sort((a, b) => {
      const da = a.includes('/') ? 1 : 0;
      const db = b.includes('/') ? 1 : 0;
      if (da !== db) return da - db;
      return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' });
    });
    return out;
  }

  // Given a list of image paths, pick the "most cover-like" one based on
  // the usual naming conventions. Priority: cover.* > folder.* > poster.*
  // (each prefers a root-level hit over a nested one), then first file
  // alphabetically. basenameNoExt strips extension but keeps directory
  // prefix, so we compare against the LAST path segment.
  function pickCoverFromList(images) {
    if (!images || images.length === 0) return null;
    const priorities = ['cover', 'folder', 'poster'];
    for (const want of priorities) {
      for (const img of images) {
        const bare = basenameNoExt(path.basename(img)).toLowerCase();
        if (bare === want) return img;
      }
    }
    return images[0];
  }

  function findCoverFor(folderAbs) {
    // Step 1: look at the collection root only, cheap and covers the
    // common case (cover.jpg lives directly in the collection folder).
    const rootEntries = safeReaddir(folderAbs);
    const rootImages = [];
    for (const ent of rootEntries) {
      if (!ent.isFile()) continue;
      const name = ent.name;
      if (name.startsWith('.')) continue;
      const ext = path.extname(name).toLowerCase();
      if (!IMAGE_EXT_SET.has(ext)) continue;
      rootImages.push(name);
    }
    if (rootImages.length > 0) {
      rootImages.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }));
      return pickCoverFromList(rootImages);
    }
    // Step 2: the collection has no root-level images (common pattern:
    // a `[封面]/cover.jpg` subfolder alongside the video folder, or
    // `images/poster.jpg`). Fall back to the recursive walk so the
    // auto cover detector catches nested art too.
    const allImages = walkImages(folderAbs);
    return pickCoverFromList(allImages);
  }

  function resolveEffectiveCover(storedCover, folderAbs) {
    if (typeof storedCover === 'string' && storedCover.length > 0) {
      try {
        const st = fs.statSync(path.join(folderAbs, storedCover));
        if (st.isFile()) return storedCover;
      } catch (_e) { /* fall through */ }
    }
    return findCoverFor(folderAbs);
  }

  function findCover(id) {
    const abs = resolveCollectionPath(id);
    if (!abs) return null;
    try {
      const st = fs.statSync(abs);
      if (!st.isDirectory()) return null;
    } catch (_e) {
      return null;
    }
    return findCoverFor(abs);
  }

  // Full recursive image list for the cover picker UI. Returns paths
  // relative to the collection root, with root-level files first then
  // nested ones. This is what the "select cover" dialog reads so the
  // admin can pick an image stored inside e.g. `[封面]/cover.jpg` or
  // `images/poster.jpg`, not just ones at the collection root.
  function listCollectionImages(id) {
    const abs = resolveCollectionPath(id);
    if (!abs) return [];
    return walkImages(abs);
  }

  // Full file-tree listing for the "文件结构" detail-page tab.
  //
  // Returns a flat array of entries in tree-walk order: at each
  // directory level, files come first (alphabetical with locale+numeric
  // collation) then subdirectories (ditto). Each subdirectory entry is
  // immediately followed by its contents (recursively), which lets the
  // frontend build a nested tree with a single sequential pass.
  //
  // Entry shapes (discriminated by `type`):
  //   { type: 'dir',   path, name }
  //   { type: 'media', path, name, ext, size }   // MEDIA_EXT_SET match
  //   { type: 'image', path, name, ext, size }   // IMAGE_EXT_SET match
  //   { type: 'subtitle', path, name, ext, size }// SUB_EXT_SET match
  //   { type: 'other', path, name, ext, size }   // everything else
  //
  // `path` is relative to the collection root with forward slashes;
  // `name` is just the last segment. Depth-capped at MAX_SCAN_DEPTH
  // like episode scanning. Does NOT honor episodeMeta overrides —
  // this is a raw filesystem view, intentionally.
  function listCollectionTree(id) {
    const abs = resolveCollectionPath(id);
    if (!abs) return null;
    try {
      if (!fs.statSync(abs).isDirectory()) return null;
    } catch (_e) { return null; }

    const out = [];
    function walk(dir, relPrefix, depth) {
      if (depth > MAX_SCAN_DEPTH) return;
      const dirents = safeReaddir(dir);
      const files = [];
      const subdirs = [];
      for (const ent of dirents) {
        const name = ent.name;
        if (shouldSkipName(name)) continue;
        if (ent.isDirectory()) { subdirs.push(name); continue; }
        if (ent.isFile()) files.push(name);
      }
      files.sort(nameCmp);
      subdirs.sort(nameCmp);

      for (const name of files) {
        const ext = path.extname(name).toLowerCase();
        let type = 'other';
        if (MEDIA_EXT_SET.has(ext)) type = 'media';
        else if (IMAGE_EXT_SET.has(ext)) type = 'image';
        else if (SUB_EXT_SET.has(ext)) type = 'subtitle';
        let size = 0;
        try { size = fs.statSync(path.join(dir, name)).size; } catch (_e) {}
        out.push({
          type,
          path: joinRel(relPrefix, name),
          name,
          ext: ext.slice(1),
          size,
        });
      }
      for (const subdir of subdirs) {
        const subRel = joinRel(relPrefix, subdir);
        out.push({
          type: 'dir',
          path: subRel,
          name: subdir,
        });
        walk(path.join(dir, subdir), subRel, depth + 1);
      }
    }
    walk(abs, '', 0);
    return out;
  }

  function defaultMetaFor(folderName, folderAbs) {
    let mtimeMs = Date.now();
    try {
      const st = fs.statSync(folderAbs);
      if (st && st.mtimeMs) mtimeMs = st.mtimeMs;
    } catch (_e) {}
    return {
      id: folderName,
      title: folderName,
      description: '',
      // `type` is the legacy single-tag field. `types` holds the full
      // list (multi-tag). The first element of `types` mirrors `type`
      // so old code paths that read `type` still work. Disk format
      // always writes both, see writeMetaFileAtomicSync callers.
      type: DEFAULT_TYPE,
      types: [DEFAULT_TYPE],
      // 1.2.0+: per-collection authors. Free-text strings (one collection
      // can have 0..20 authors). The autocomplete suggestion list is built
      // from "every author currently used in any collection of the same kind"
      // — see GET /api/authors. No global registry needed.
      authors: [],
      cover: findCoverFor(folderAbs),
      // Cover transform: lets the admin reframe the cover image.
      //   coverScale: 1..3, multiplier on top of "cover" sizing (1 = fit).
      //   coverX, coverY: 0..100 percent, focal point for both the
      //     background-position and the transform-origin (the image is
      //     zoomed into the focal point, not the geometric center).
      // Defaults = standard cover/center, looks identical to the old
      // behavior so un-edited collections render unchanged.
      coverScale: 1,
      coverX: 50,
      coverY: 50,
      // Resume mode: per-collection policy for what happens when the
      // user navigates to a track (prev/next/direct-select). Two values:
      //   'continue' (default) — seek to the saved position from
      //                          progress.json if any, so playback
      //                          resumes where the user left off.
      //   'restart'             — always start from 0, ignoring saved
      //                          position. Useful for meditation /
      //                          alarm tracks / short loops where
      //                          resuming mid-track is annoying.
      // Video collections also accept this field but the UI toggle is
      // audio-only — video players traditionally always resume.
      resumeMode: 'continue',
      hidden: false,
      createdAt: mtimeMs,
      introSkipSec: 0,
      episodeMeta: {},
    };
  }

  function sanitizeMeta(raw, folderName, folderAbs) {
    const base = defaultMetaFor(folderName, folderAbs);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return base;
    const out = { ...base };
    out.id = folderName;
    if (typeof raw.title === 'string' && raw.title.length > 0) out.title = raw.title;
    if (typeof raw.description === 'string') out.description = raw.description;
    // Accept `types` as the source of truth when present, else fall back
    // to the legacy single `type` field. Always emit both: `types[]`
    // is the canonical list, `type` is `types[0]` so old readers keep
    // working without migration. Each entry must pass the same
    // /^[a-zA-Z0-9_\-]+$/ shape used by createCollection / categories.
    const typeShapeOk = (s) => typeof s === 'string' && s.length > 0 && s.length <= 40 && /^[a-zA-Z0-9_\-]+$/.test(s);
    let parsedTypes = null;
    if (Array.isArray(raw.types)) {
      const seen = new Set();
      parsedTypes = [];
      for (const t of raw.types) {
        if (!typeShapeOk(t)) continue;
        if (seen.has(t)) continue;
        seen.add(t);
        parsedTypes.push(t);
      }
      if (parsedTypes.length === 0) parsedTypes = null;
    }
    if (parsedTypes) {
      out.types = parsedTypes;
      out.type = parsedTypes[0];
    } else if (typeof raw.type === 'string' && raw.type.length > 0 && raw.type.length <= 40) {
      out.type = raw.type;
      out.types = [raw.type];
    }
    // Authors: free-text array, each ≤ 80 chars (room for "First Last" +
    // pseudonym), at most 20 per collection, dedup case-insensitively
    // (preserve original case for display).
    if (Array.isArray(raw.authors)) {
      const out_authors = [];
      const seen = new Set();
      for (const a of raw.authors) {
        if (typeof a !== 'string') continue;
        const w = a.trim();
        if (!w || w.length > 80) continue;
        let k = w;
        try { k = k.normalize('NFKC'); } catch (_e) {}
        k = k.toLowerCase();
        if (seen.has(k)) continue;
        seen.add(k);
        out_authors.push(w);
        if (out_authors.length >= 20) break;
      }
      out.authors = out_authors;
    } else {
      out.authors = [];
    }
    if (raw.cover === null) out.cover = null;
    else if (typeof raw.cover === 'string') out.cover = raw.cover;
    if (typeof raw.coverScale === 'number' && Number.isFinite(raw.coverScale)
        && raw.coverScale >= 1 && raw.coverScale <= 3) {
      out.coverScale = raw.coverScale;
    }
    if (typeof raw.coverX === 'number' && Number.isFinite(raw.coverX)
        && raw.coverX >= 0 && raw.coverX <= 100) {
      out.coverX = raw.coverX;
    }
    if (typeof raw.coverY === 'number' && Number.isFinite(raw.coverY)
        && raw.coverY >= 0 && raw.coverY <= 100) {
      out.coverY = raw.coverY;
    }
    if (raw.resumeMode === 'continue' || raw.resumeMode === 'restart') {
      out.resumeMode = raw.resumeMode;
    }
    if (typeof raw.hidden === 'boolean') out.hidden = raw.hidden;
    if (typeof raw.createdAt === 'number' && Number.isFinite(raw.createdAt)) {
      out.createdAt = raw.createdAt;
    }
    if (typeof raw.introSkipSec === 'number' && Number.isFinite(raw.introSkipSec) && raw.introSkipSec >= 0) {
      out.introSkipSec = raw.introSkipSec;
    }
    if (raw.episodeMeta && typeof raw.episodeMeta === 'object' && !Array.isArray(raw.episodeMeta)) {
      const em = {};
      for (const key of Object.keys(raw.episodeMeta)) {
        const v = raw.episodeMeta[key];
        if (!v || typeof v !== 'object') continue;
        const entry = {};
        if (typeof v.title === 'string') entry.title = v.title;
        if (typeof v.description === 'string') entry.description = v.description;
        if (typeof v.order === 'number' && Number.isFinite(v.order)) entry.order = v.order;
        // Chain-ordering pointer (折叠链表). Must be preserved across the
        // read sanitize, or updateEpisodeMeta would write it but every
        // subsequent getCollection would strip it back to null.
        if (typeof v.follows === 'string' && v.follows.length > 0) entry.follows = v.follows;
        em[key] = entry;
      }
      out.episodeMeta = em;
    } else {
      out.episodeMeta = {};
    }
    return out;
  }

  function readMetaFile(folderAbs, folderName) {
    const metaPath = path.join(folderAbs, META_FILENAME);
    let raw;
    try { raw = fs.readFileSync(metaPath, 'utf8'); } catch (_e) { return null; }
    let parsed;
    try { parsed = JSON.parse(raw); } catch (_e) { return null; }
    return sanitizeMeta(parsed, folderName, folderAbs);
  }

  function writeMetaFileAtomicSync(folderAbs, meta) {
    const metaPath = path.join(folderAbs, META_FILENAME);
    const tmpPath = metaPath + '.tmp';
    const data = JSON.stringify(meta, null, 2);
    fs.writeFileSync(tmpPath, data);
    fs.renameSync(tmpPath, metaPath);
    // Invalidate summary cache for this collection
    if (meta && meta.id) invalidateSummaryCache(meta.id);
  }

  // ---- Episode scanning ----
  //
  // A collection folder can now contain subdirectories. Files are reported
  // with their path RELATIVE to the collection root, using forward slashes
  // regardless of the host OS — e.g. "S01E01.mp4" for a root-level file,
  // "Season 1/S01E01.mp4" for one inside a subfolder.
  //
  // Traversal order is the one the user asked for: at each directory level
  // we emit all media files first (locale-aware filename sort, numeric
  // collation so "2" comes before "10"), then recurse into subfolders in
  // the same alphabetical order. Root files therefore precede any subdir
  // content, and a subdir's own files precede any sub-subdirs.
  //
  // Depth cap: MAX_SCAN_DEPTH=4 below the collection root. This is enough
  // for a "Series / Season / Special" style layout plus one more level,
  // while still catching runaway symlink loops or genuinely crazy trees.
  // Paths beyond that depth are silently ignored — no error, no partial
  // scan — so a moved folder can't wedge the whole library listing.
  //
  // Synology-reserved prefixes (@eaDir, #recycle, #snapshot, etc.) are
  // skipped at every level by the same filter used in listCollectionFolders.
  const MAX_SCAN_DEPTH = 4;

  // Ignore hidden files, Synology system directories, and anything the
  // validateId collection-level check would already reject.
  function shouldSkipName(name) {
    return name.startsWith('.') || name.startsWith('@') || name.startsWith('#');
  }

  // Join a directory-relative prefix with a child name using forward
  // slashes. Empty prefix (= collection root) returns just the name so
  // root files stay as "File.mp4" rather than "/File.mp4".
  function joinRel(prefix, name) {
    return prefix ? prefix + '/' + name : name;
  }

  // Deterministic filename ordering used both for files and subdir names.
  // zh-CN collation with numeric mode makes "S02" fall after "S01" and
  // "第 10 话" after "第 2 话", which is what a Chinese-speaking user
  // actually wants even when filenames mix ASCII and Han characters.
  function nameCmp(a, b) {
    return a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' });
  }

  // Walk the collection tree collecting all sidecar subtitle/lyric files
  // keyed by their media stem's RELATIVE path, so the episode assembler
  // below can attach `{S01E01.en.vtt}` to the episode it belongs to
  // without caring which folder they're in. Two files in different
  // subdirs with the same bare stem DO NOT collide because the key
  // contains the directory prefix.
  function scanSidecars(folderAbs) {
    const subsByStem = {};
    function walk(dir, relPrefix, depth) {
      if (depth > MAX_SCAN_DEPTH) return;
      const entries = safeReaddir(dir);
      for (const ent of entries) {
        const name = ent.name;
        if (shouldSkipName(name)) continue;
        if (ent.isDirectory()) {
          walk(path.join(dir, name), joinRel(relPrefix, name), depth + 1);
          continue;
        }
        if (!ent.isFile()) continue;
        const ext = path.extname(name).toLowerCase();
        if (!SUB_EXT_SET.has(ext)) continue;
        let core = name.slice(0, name.length - ext.length);
        let lang = null;
        // Detect lang tag like ".en", ".zh-CN", ".jpn" — must be ASCII
        // letters/hyphens only, 1-5 chars. This avoids false positives
        // where the dot is part of the filename (e.g. "01.序章.lrc").
        // A nominal lang that collides with a known media extension
        // (e.g. ".wav", ".oga") is NOT treated as lang — it's a media
        // extension being preserved in the sidecar name.
        const ldot = core.lastIndexOf('.');
        if (ldot > 0 && ldot < core.length - 1) {
          const seg = core.slice(ldot + 1);
          if (seg.length <= 5
              && /^[a-zA-Z](?:[a-zA-Z-]*[a-zA-Z])?$/.test(seg)
              && !MEDIA_EXT_SET.has('.' + seg.toLowerCase())) {
            lang = seg;
            core = core.slice(0, ldot);
          }
        }
        // Tolerate sidecars named after the full media filename, e.g.
        // "track.mp3.vtt" or "track.mp3.zh-CN.vtt" alongside "track.mp3".
        // Strip a trailing media extension so the stem matches the
        // episode's bare stem.
        const mdot = core.lastIndexOf('.');
        if (mdot > 0 && MEDIA_EXT_SET.has(core.slice(mdot).toLowerCase())) {
          core = core.slice(0, mdot);
        }
        const bareStem = core;
        const stemKey = joinRel(relPrefix, bareStem);
        if (!subsByStem[stemKey]) subsByStem[stemKey] = [];
        subsByStem[stemKey].push({
          file: joinRel(relPrefix, name),
          lang: lang || 'und',
          format: ext.slice(1),
        });
      }
    }
    walk(folderAbs, '', 0);
    return subsByStem;
  }

  // Group quality variants like "Movie-1080p.mp4" + "Movie-720p.mp4" into
  // one episode with a qualities[] array. Scoped per directory — a
  // "Movie-1080p.mp4" at the root and another "Movie-1080p.mp4" inside
  // a subfolder remain two independent episodes (the base stems differ
  // once you include the directory prefix).
  const QUALITY_RE = /^(.+?)[-_. ]?(\d{3,4})p$/i;

  // Audio-format variant priority. When a single directory has the same
  // bare stem stored in several audio formats (e.g. Track01.flac +
  // Track01.wav + Track01.mp3 — common when a user keeps both lossless
  // and a compressed copy of the same album), they collapse into ONE
  // episode whose main file is picked by this priority (lossless first,
  // then largest size as tiebreaker). The variants ride along on
  // ep.formats[] for future format-switch UIs. We deliberately only
  // merge *audio* extensions: a directory containing both Track01.mp3
  // and Track01.mp4 still yields two episodes (different media types,
  // different playback experience — not a "format variant" of one song).
  const AUDIO_FORMAT_PRIORITY = ['flac', 'wav', 'm4a', 'aac', 'mp3', 'ogg', 'opus'];
  const AUDIO_FORMAT_PRIO_MAP = new Map(AUDIO_FORMAT_PRIORITY.map((e, i) => [e, i]));
  const AUDIO_FORMAT_SET = new Set(AUDIO_FORMAT_PRIORITY);

  function scanEpisodesRaw(folderAbs) {
    const subsByStem = scanSidecars(folderAbs);
    const ordered = [];

    function walk(dir, relPrefix, depth) {
      if (depth > MAX_SCAN_DEPTH) return;
      const entries = safeReaddir(dir);

      const fileRaws = [];
      const subdirs = [];
      for (const ent of entries) {
        const name = ent.name;
        if (shouldSkipName(name)) continue;
        if (ent.isDirectory()) {
          subdirs.push(name);
          continue;
        }
        if (!ent.isFile()) continue;
        const ext = path.extname(name).toLowerCase();
        if (!MEDIA_EXT_SET.has(ext)) continue;
        const full = path.join(dir, name);
        let size = 0, mtime = 0;
        try {
          const st = fs.statSync(full);
          size = st.size;
          mtime = st.mtimeMs;
        } catch (_e) {}
        const bareStem = name.slice(0, name.length - ext.length);
        fileRaws.push({
          file: joinRel(relPrefix, name),
          stem: joinRel(relPrefix, bareStem),
          bareStem,
          bareName: name,
          ext: ext.slice(1),
          size,
          mtime,
        });
      }

      // Files within this directory: alphabetical by bare name.
      fileRaws.sort((a, b) => nameCmp(a.bareName, b.bareName));

      // Detect quality variants within THIS directory only. Keyed by
      // the dir-qualified base ("Season 1/Movie") so cross-dir name
      // collisions don't get merged into the same episode.
      const groups = new Map();
      for (const r of fileRaws) {
        const m = QUALITY_RE.exec(r.bareStem);
        if (m) {
          const base = m[1].replace(/[\-_. ]+$/, '');
          const baseKey = joinRel(relPrefix, base);
          const quality = Number(m[2]);
          if (!groups.has(baseKey)) groups.set(baseKey, []);
          groups.get(baseKey).push({ file: r.file, quality, size: r.size });
        }
      }

      // Stage this directory's emitted episodes locally. We then run a
      // second-pass "audio-format variant" merge over them before
      // appending to the global `ordered` list, so subsequent recursion
      // into subdirs still sees a depth-first ordering identical to the
      // pre-merge behavior.
      const dirEpisodes = [];

      const emitted = new Set();
      for (const r of fileRaws) {
        if (emitted.has(r.file)) continue;
        const m = QUALITY_RE.exec(r.bareStem);
        if (m) {
          const base = m[1].replace(/[\-_. ]+$/, '');
          const baseKey = joinRel(relPrefix, base);
          const g = groups.get(baseKey) || [];
          if (g.length >= 2) {
            g.sort((a, b) => b.quality - a.quality);
            const top = g[0];
            const topRow = fileRaws.find((x) => x.file === top.file);
            const primaryStem = baseKey;
            for (const q of g) emitted.add(q.file);
            dirEpisodes.push({
              file: top.file,
              size: topRow ? topRow.size : top.size,
              mtime: topRow ? topRow.mtime : 0,
              ext: topRow ? topRow.ext : '',
              stem: primaryStem,
              subtitles: (subsByStem[primaryStem] || subsByStem[r.stem] || []).slice(),
              qualities: g.slice(),
              formats: null,
            });
            continue;
          }
        }
        emitted.add(r.file);
        dirEpisodes.push({
          file: r.file,
          size: r.size,
          mtime: r.mtime,
          ext: r.ext,
          stem: r.stem,
          subtitles: (subsByStem[r.stem] || []).slice(),
          qualities: null,
          formats: null,
        });
      }

      // Audio-format variant merge: same dir-qualified stem stored in
      // several audio formats collapses into one episode. Only applies
      // to episodes that survived quality merging unmerged (qualities
      // is still null) AND whose ext is in AUDIO_FORMAT_SET.
      const audioStemGroups = new Map();
      for (const ep of dirEpisodes) {
        if (ep.qualities) continue;
        const ext = String(ep.ext || '').toLowerCase();
        if (!AUDIO_FORMAT_SET.has(ext)) continue;
        if (!audioStemGroups.has(ep.stem)) audioStemGroups.set(ep.stem, []);
        audioStemGroups.get(ep.stem).push(ep);
      }
      const droppedFiles = new Set();
      for (const [, eps] of audioStemGroups) {
        if (eps.length < 2) continue;
        eps.sort((a, b) => {
          const ai = AUDIO_FORMAT_PRIO_MAP.has(a.ext) ? AUDIO_FORMAT_PRIO_MAP.get(a.ext) : 999;
          const bi = AUDIO_FORMAT_PRIO_MAP.has(b.ext) ? AUDIO_FORMAT_PRIO_MAP.get(b.ext) : 999;
          if (ai !== bi) return ai - bi;
          return (b.size || 0) - (a.size || 0);
        });
        const main = eps[0];
        // Carry every variant on `formats` so a future format-switch
        // UI can offer them; current frontend ignores the field.
        main.formats = eps.map((e) => ({ file: e.file, ext: e.ext, size: e.size }));
        // Subtitles: union across all variants. Same lang from a
        // variant's sidecar shouldn't double up — dedupe by lang+file.
        const subSeen = new Set();
        const allSubs = [];
        for (const e of eps) {
          for (const s of (e.subtitles || [])) {
            const k = (s.lang || '') + '|' + (s.file || '');
            if (subSeen.has(k)) continue;
            subSeen.add(k);
            allSubs.push(s);
          }
        }
        main.subtitles = allSubs;
        for (let i = 1; i < eps.length; i++) droppedFiles.add(eps[i].file);
      }

      for (const ep of dirEpisodes) {
        if (droppedFiles.has(ep.file)) continue;
        ordered.push(ep);
      }

      // Recurse into subdirs, same alphabetical order. The depth-first
      // walk means a subdir's files are appended only after all
      // ancestor-level files and earlier sibling-subdirs are done.
      subdirs.sort(nameCmp);
      for (const subdir of subdirs) {
        walk(path.join(dir, subdir), joinRel(relPrefix, subdir), depth + 1);
      }
    }

    walk(folderAbs, '', 0);

    // Fuzzy stem fallback for video episodes that have no sidecar of
    // their own. Common case: a bonus explainer video sits in one
    // subdirectory while the only Chinese caption (a .vtt/.lrc) lives
    // next to its companion audio in another subdirectory, named with
    // a track-number prefix the video lacks. We borrow the captions if
    // either side's bare stem fully contains the other, taking the
    // longest overlap when several candidates match. The borrowed flag
    // lets the client display "字幕来自 X" if it cares.
    const VIDEO_BORROW_EXTS = new Set(['mp4', 'webm', 'm4v']);
    function bareStemOf(stemKey) {
      const i = stemKey.lastIndexOf('/');
      return i < 0 ? stemKey : stemKey.slice(i + 1);
    }
    for (const ep of ordered) {
      if (!ep.subtitles || ep.subtitles.length > 0) continue;
      if (!VIDEO_BORROW_EXTS.has(String(ep.ext || '').toLowerCase())) continue;
      const epBare = bareStemOf(ep.stem);
      if (!epBare || epBare.length < 5) continue;
      let bestKey = null;
      let bestOverlap = 0;
      for (const stemKey of Object.keys(subsByStem)) {
        const subBare = bareStemOf(stemKey);
        if (!subBare) continue;
        let overlap = 0;
        if (subBare.includes(epBare)) overlap = epBare.length;
        else if (epBare.includes(subBare)) overlap = subBare.length;
        else continue;
        if (overlap < 8) continue;          // too short to be a real match
        if (overlap > bestOverlap) {
          bestOverlap = overlap;
          bestKey = stemKey;
        }
      }
      if (bestKey) {
        ep.subtitles = (subsByStem[bestKey] || []).map((s) => Object.assign(
          {}, s, { borrowed: true, borrowedFrom: bestKey }
        ));
      }
    }

    for (const ep of ordered) {
      if (ep.subtitles) ep.subtitles.sort((a, b) => a.lang.localeCompare(b.lang));
    }
    return ordered;
  }

  function buildEpisodes(folderAbs, episodeMeta) {
    // scanEpisodesRaw already emits episodes in the desired tree-walk
    // order (root files → subdirs, alphabetical at every level, files
    // before subdirs within each level). We just decorate with
    // user-authored metadata here and decide whether the manual-order
    // feature should override the tree order.
    const raw = scanEpisodesRaw(folderAbs);
    const em = episodeMeta && typeof episodeMeta === 'object' ? episodeMeta : {};
    const merged = raw.map((r) => {
      const override = em[r.file] || {};
      // Title defaults to the bare filename (extension + any directory
      // prefix stripped). The full relative path is reserved for URL
      // building and progress keys; the display title should read like
      // an episode name, not a path.
      const title = typeof override.title === 'string' && override.title.length > 0
        ? override.title
        : basenameNoExt(path.basename(r.file));
      const description = typeof override.description === 'string' ? override.description : '';
      const order = typeof override.order === 'number' && Number.isFinite(override.order)
        ? override.order
        : null;
      // mediaInfo passthrough (v1.9.0+): the probe-cache layer
      // (lib/probe-cache.js) is the only writer of this field; we
      // forward what's persisted in .collection.json so downstream
      // consumers (HiFi badge renderer, video route decision, MSE
      // duration hint) can read it without a second I/O. The probe
      // backfill scan in server.js populates this lazily; absent or
      // stale entries surface as `null` and the UI falls back to the
      // legacy ext/size display.
      const mediaInfo = (override && typeof override.mediaInfo === 'object' && override.mediaInfo)
        ? override.mediaInfo
        : null;
      // Chain-ordering (折叠链表): a "tail" episode declares the `file`
      // key of the "head" episode it must always trail. The actual
      // re-sequencing — pulling each tail to sit directly behind its head
      // wherever the head lands — happens client-side in applyChains(),
      // so any sort field and the manual play-queue reorder keep the
      // chain glued. Here we only surface the persisted pointer (a string
      // file key, or null when the episode follows nobody).
      const follows = typeof override.follows === 'string' && override.follows.length > 0
        ? override.follows
        : null;
      return {
        file: r.file,
        title,
        description,
        order,
        follows,
        size: r.size,
        mtime: r.mtime,
        ext: r.ext,
        subtitles: r.subtitles || [],
        qualities: r.qualities || null,
        formats: r.formats || null,
        mediaInfo,
      };
    });

    // Back-compat knob: the manual-order feature (admin drags episodes
    // into a custom sequence, persisted as episodeMeta[file].order) only
    // applies to FLAT collections — ones where every episode is at the
    // root level. Once any subdirectory is present, the tree-walk order
    // from scanEpisodesRaw is authoritative and the `order` field in
    // episodeMeta is ignored, because mixing a flat custom sequence
    // with nested directories produces ambiguous "does the subdir go
    // before or after the manually-ordered root files" semantics that
    // aren't worth untangling. Users who care about ordering in a
    // mixed library can use filename prefixes ("01 Intro.mp4") which
    // the locale-aware numeric sort in scanEpisodesRaw honors.
    const isFlat = merged.every((e) => !e.file.includes('/'));
    const allHaveOrder = isFlat && merged.length > 0 && merged.every((e) => e.order !== null);

    if (allHaveOrder) {
      merged.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return nameCmp(a.file, b.file);
      });
    } else {
      // Respect the tree-walk order scanEpisodesRaw already produced —
      // do NOT re-sort. Just stamp sequential display numbers so the
      // UI's "#01 / 12" counter still works.
      for (let i = 0; i < merged.length; i++) merged[i].order = i + 1;
    }
    return merged;
  }

  // ---- Folder listing ----
  function listCollectionFolders() {
    const entries = safeReaddir(ROOT);
    const out = [];
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const name = ent.name;
      if (name.startsWith('.')) continue;
      if (validateId(name) !== null) continue;
      out.push(name);
    }
    return out;
  }

  function migrateAll() {
    invalidateSummaryCache(); // clear all — folder contents may have changed
    try { fs.mkdirSync(ROOT, { recursive: true }); } catch (_e) {}
    const folders = listCollectionFolders();
    for (const name of folders) {
      const folderAbs = path.join(ROOT, name);
      const metaPath = path.join(folderAbs, META_FILENAME);
      if (fs.existsSync(metaPath)) continue;
      const meta = defaultMetaFor(name, folderAbs);
      try { writeMetaFileAtomicSync(folderAbs, meta); } catch (_e) {}
    }
  }

  function summarize(meta, folderAbs) {
    const episodes = buildEpisodes(folderAbs, meta.episodeMeta);
    let totalSize = 0;
    for (const ep of episodes) totalSize += ep.size || 0;
    return {
      id: meta.id,
      title: meta.title,
      description: meta.description,
      type: meta.type,
      types: Array.isArray(meta.types) && meta.types.length > 0 ? meta.types.slice() : [meta.type],
      authors: Array.isArray(meta.authors) ? meta.authors.slice() : [],
      cover: resolveEffectiveCover(meta.cover, folderAbs),
      coverScale: typeof meta.coverScale === 'number' ? meta.coverScale : 1,
      coverX: typeof meta.coverX === 'number' ? meta.coverX : 50,
      coverY: typeof meta.coverY === 'number' ? meta.coverY : 50,
      resumeMode: meta.resumeMode === 'restart' ? 'restart' : 'continue',
      hidden: meta.hidden,
      createdAt: meta.createdAt,
      episodeCount: episodes.length,
      totalSize,
      protected: PROTECTED_IDS.has(meta.id),
    };
  }

  // ── Summary cache: avoid re-scanning every file on every home-page load ──
  // Key = folder name, value = { mtime, metaMtime, summary }
  // Invalidated when folder mtime or .collection.json mtime changes.
  const _summaryCache = new Map();

  function getCachedSummary(name, folderAbs) {
    let folderMtime, metaMtime;
    try { folderMtime = fs.statSync(folderAbs).mtimeMs; } catch (_e) { return null; }
    const metaPath = path.join(folderAbs, META_FILENAME);
    try { metaMtime = fs.statSync(metaPath).mtimeMs; } catch (_e) { metaMtime = 0; }

    const cached = _summaryCache.get(name);
    if (cached && cached.folderMtime === folderMtime && cached.metaMtime === metaMtime) {
      return cached.summary;
    }
    // Cache miss — rebuild
    let meta = readMetaFile(folderAbs, name);
    if (!meta) meta = defaultMetaFor(name, folderAbs);
    const summary = summarize(meta, folderAbs);
    _summaryCache.set(name, { folderMtime, metaMtime, summary, meta });
    return summary;
  }

  function invalidateSummaryCache(name) {
    if (name) _summaryCache.delete(name);
    else _summaryCache.clear();
  }

  function listCollections(opts) {
    const { includeHidden = false } = opts || {};
    const folders = listCollectionFolders();
    const out = [];
    for (const name of folders) {
      const folderAbs = path.join(ROOT, name);
      // Quick hidden check from cache or meta read
      const cached = _summaryCache.get(name);
      if (!includeHidden) {
        if (cached && cached.meta && cached.meta.hidden) continue;
      }
      const summary = getCachedSummary(name, folderAbs);
      if (!summary) continue;
      if (!includeHidden && summary.hidden) continue;
      out.push(summary);
    }
    out.sort((a, b) => b.createdAt - a.createdAt);
    return out;
  }

  /**
   * @brief Enumerate every sidecar subtitle file inside the collection
   *        tree, regardless of which episode it auto-attached to.
   *
   * Returns a flat, file-relative-path-sorted list of all subtitle
   * sidecars (recursive across subdirectories within MAX_SCAN_DEPTH),
   * each tagged with the lang token (if detectable from the
   * filename) and the file extension as the format hint. The frontend
   * uses this to populate a manual "pick subtitle" dialog so the user
   * can attach a subtitle to a video even when the filenames don't
   * match the stem-based auto-attachment heuristic.
   *
   * Internally the underlying `scanSidecars` is already invoked by
   * `scanEpisodesRaw` to wire ep.subtitles. We re-run it here rather
   * than thread a cache through — disk reads are cheap relative to
   * the rest of the response, and avoiding shared state keeps the
   * function reentrant.
   */
  function listAllSubtitles(folderAbs) {
    const subsByStem = scanSidecars(folderAbs);
    const seen = new Set();
    const list = [];
    for (const stem of Object.keys(subsByStem)) {
      for (const sub of subsByStem[stem]) {
        if (seen.has(sub.file)) continue;
        seen.add(sub.file);
        list.push({ file: sub.file, lang: sub.lang, format: sub.format });
      }
    }
    list.sort((a, b) => a.file.localeCompare(b.file, 'zh-CN', {
      numeric: true, sensitivity: 'base',
    }));
    return list;
  }

  function getCollection(id) {
    const abs = resolveCollectionPath(id);
    if (!abs) return null;
    try {
      const st = fs.statSync(abs);
      if (!st.isDirectory()) return null;
    } catch (_e) { return null; }
    const folderName = path.basename(abs);
    let meta = readMetaFile(abs, folderName);
    if (!meta) meta = defaultMetaFor(folderName, abs);
    const episodes = buildEpisodes(abs, meta.episodeMeta);
    let totalSize = 0;
    for (const ep of episodes) totalSize += ep.size || 0;
    return {
      id: meta.id,
      title: meta.title,
      description: meta.description,
      type: meta.type,
      types: Array.isArray(meta.types) && meta.types.length > 0 ? meta.types.slice() : [meta.type],
      authors: Array.isArray(meta.authors) ? meta.authors.slice() : [],
      cover: resolveEffectiveCover(meta.cover, abs),
      coverScale: typeof meta.coverScale === 'number' ? meta.coverScale : 1,
      coverX: typeof meta.coverX === 'number' ? meta.coverX : 50,
      coverY: typeof meta.coverY === 'number' ? meta.coverY : 50,
      resumeMode: meta.resumeMode === 'restart' ? 'restart' : 'continue',
      hidden: meta.hidden,
      createdAt: meta.createdAt,
      introSkipSec: meta.introSkipSec || 0,
      episodes,
      episodeCount: episodes.length,
      totalSize,
      // Flat list of every subtitle file under the collection tree,
      // each with relative path + detected lang + format extension.
      // Used by the player's "manual subtitle picker" UI to let users
      // attach a subtitle that didn't auto-match by stem.
      availableSubtitles: listAllSubtitles(abs),
      protected: PROTECTED_IDS.has(meta.id),
    };
  }

  function createCollection(input) {
    const data = input && typeof input === 'object' ? input : {};
    let id = typeof data.id === 'string' ? data.id.trim() : '';
    if (!id && typeof data.title === 'string') {
      id = data.title.trim();
    }
    const idErr = validateId(id);
    if (idErr !== null) throw mkError(idErr, 'E_INVALID_ID');
    const title = typeof data.title === 'string' && data.title.trim().length > 0
      ? data.title.trim() : id;
    if (title.length > 200) throw mkError('标题非法', 'E_INVALID_TITLE');
    const description = typeof data.description === 'string' ? data.description : '';
    // Accept either `types: [...]` (preferred) or legacy `type: 'x'`.
    // First element of the resolved list becomes the primary `type`.
    let types;
    if (Array.isArray(data.types) && data.types.length > 0) {
      const seen = new Set();
      types = [];
      for (const t of data.types) {
        if (typeof t !== 'string' || t.length === 0 || t.length > 40 || !/^[a-zA-Z0-9_\-]+$/.test(t)) {
          throw mkError('类型非法', 'E_INVALID_TYPE');
        }
        if (seen.has(t)) continue;
        seen.add(t);
        types.push(t);
      }
      if (types.length === 0) types = [DEFAULT_TYPE];
    } else if (typeof data.type === 'string' && data.type.length > 0) {
      if (data.type.length > 40 || !/^[a-zA-Z0-9_\-]+$/.test(data.type)) {
        throw mkError('类型非法', 'E_INVALID_TYPE');
      }
      types = [data.type];
    } else {
      types = [DEFAULT_TYPE];
    }
    const type = types[0];
    const hidden = data.hidden === true;
    // 1.2.0+: optional authors[] on create.
    const authors = sanitizeAuthorsList(data.authors);

    return withLock(() => {
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      if (fs.existsSync(abs)) throw mkError('合集已存在', 'E_COLLECTION_EXISTS');
      fs.mkdirSync(abs, { recursive: false });
      const meta = {
        id, title, description, type, types, authors,
        cover: findCoverFor(abs),
        hidden,
        createdAt: Date.now(),
        episodeMeta: {},
      };
      writeMetaFileAtomicSync(abs, meta);
      return meta;
    });
  }
  // Helper used by both createCollection and the PATCH path.
  function sanitizeAuthorsList(raw) {
    if (!Array.isArray(raw)) return [];
    const out = [];
    const seen = new Set();
    for (const a of raw) {
      if (typeof a !== 'string') continue;
      const w = a.trim();
      if (!w || w.length > 80) continue;
      let k = w;
      try { k = k.normalize('NFKC'); } catch (_e) {}
      k = k.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(w);
      if (out.length >= 20) break;
    }
    return out;
  }

  function updateCollection(id, patch) {
    return withLock(() => {
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      try {
        const st = fs.statSync(abs);
        if (!st.isDirectory()) throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');
      } catch (e) {
        if (e && e.code === 'E_COLLECTION_NOT_FOUND') throw e;
        throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');
      }
      const folderName = path.basename(abs);
      let meta = readMetaFile(abs, folderName);
      if (!meta) meta = defaultMetaFor(folderName, abs);

      const p = patch && typeof patch === 'object' ? patch : {};
      const next = { ...meta };

      if (Object.prototype.hasOwnProperty.call(p, 'title')) {
        if (typeof p.title !== 'string' || p.title.length < 1 || p.title.length > 200) {
          throw mkError('标题非法', 'E_INVALID_TITLE');
        }
        next.title = p.title;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'description')) {
        if (typeof p.description !== 'string') throw mkError('简介非法', 'E_INVALID_DESCRIPTION');
        next.description = p.description;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'types')) {
        if (!Array.isArray(p.types) || p.types.length === 0) {
          throw mkError('类型非法', 'E_INVALID_TYPE');
        }
        const seen = new Set();
        const cleaned = [];
        for (const t of p.types) {
          if (typeof t !== 'string' || t.length === 0 || t.length > 40 || !/^[a-zA-Z0-9_\-]+$/.test(t)) {
            throw mkError('类型非法', 'E_INVALID_TYPE');
          }
          if (seen.has(t)) continue;
          seen.add(t);
          cleaned.push(t);
        }
        next.types = cleaned;
        next.type = cleaned[0];
      } else if (Object.prototype.hasOwnProperty.call(p, 'type')) {
        if (typeof p.type !== 'string' || p.type.length === 0 || p.type.length > 40
            || !/^[a-zA-Z0-9_\-]+$/.test(p.type)) {
          throw mkError('类型非法', 'E_INVALID_TYPE');
        }
        next.type = p.type;
        next.types = [p.type];
      }
      // 1.2.0+: authors[]. Replace-semantics (same as types). null/missing
      // = leave unchanged; empty array = clear all authors.
      if (Object.prototype.hasOwnProperty.call(p, 'authors')) {
        if (!Array.isArray(p.authors)) throw mkError('作者非法', 'E_INVALID_AUTHORS');
        next.authors = sanitizeAuthorsList(p.authors);
      }
      if (Object.prototype.hasOwnProperty.call(p, 'cover')) {
        if (p.cover !== null && typeof p.cover !== 'string') throw mkError('封面非法', 'E_INVALID_COVER');
        next.cover = p.cover;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'coverScale')) {
        const s = Number(p.coverScale);
        if (!Number.isFinite(s) || s < 1 || s > 3) {
          throw mkError('封面缩放非法（1 ~ 3）', 'E_INVALID_COVER_SCALE');
        }
        next.coverScale = s;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'coverX')) {
        const x = Number(p.coverX);
        if (!Number.isFinite(x) || x < 0 || x > 100) {
          throw mkError('封面 X 位置非法（0 ~ 100）', 'E_INVALID_COVER_X');
        }
        next.coverX = x;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'coverY')) {
        const y = Number(p.coverY);
        if (!Number.isFinite(y) || y < 0 || y > 100) {
          throw mkError('封面 Y 位置非法（0 ~ 100）', 'E_INVALID_COVER_Y');
        }
        next.coverY = y;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'resumeMode')) {
        if (p.resumeMode !== 'continue' && p.resumeMode !== 'restart') {
          throw mkError('resumeMode 非法（仅接受 continue / restart）', 'E_INVALID_RESUME_MODE');
        }
        next.resumeMode = p.resumeMode;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'hidden')) {
        if (typeof p.hidden !== 'boolean') throw mkError('隐藏字段非法', 'E_INVALID_HIDDEN');
        next.hidden = p.hidden;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'introSkipSec')) {
        if (typeof p.introSkipSec !== 'number' || !Number.isFinite(p.introSkipSec) || p.introSkipSec < 0) {
          throw mkError('片头时长非法', 'E_INVALID_INTRO');
        }
        next.introSkipSec = p.introSkipSec;
      }
      if (Object.prototype.hasOwnProperty.call(p, 'episodeMeta')) {
        if (!p.episodeMeta || typeof p.episodeMeta !== 'object' || Array.isArray(p.episodeMeta)) {
          throw mkError('episodeMeta 非法', 'E_INVALID_EPISODE_META');
        }
        const em = {};
        for (const key of Object.keys(p.episodeMeta)) {
          const v = p.episodeMeta[key];
          if (!v || typeof v !== 'object') continue;
          const entry = {};
          if (Object.prototype.hasOwnProperty.call(v, 'title')) {
            if (typeof v.title !== 'string') throw mkError('剧集标题非法', 'E_INVALID_EPISODE_META');
            entry.title = v.title;
          }
          if (Object.prototype.hasOwnProperty.call(v, 'description')) {
            if (typeof v.description !== 'string') throw mkError('剧集简介非法', 'E_INVALID_EPISODE_META');
            entry.description = v.description;
          }
          if (Object.prototype.hasOwnProperty.call(v, 'order')) {
            if (typeof v.order !== 'number' || !Number.isFinite(v.order)) {
              throw mkError('剧集顺序非法', 'E_INVALID_EPISODE_META');
            }
            entry.order = v.order;
          }
          if (Object.prototype.hasOwnProperty.call(v, 'follows')) {
            if (v.follows !== null && typeof v.follows !== 'string') {
              throw mkError('跟随目标非法', 'E_INVALID_EPISODE_META');
            }
            if (typeof v.follows === 'string' && v.follows.length > 0) entry.follows = v.follows;
          }
          em[key] = entry;
        }
        next.episodeMeta = em;
      }
      next.id = meta.id;
      next.createdAt = meta.createdAt;
      writeMetaFileAtomicSync(abs, next);
      return next;
    });
  }

  function countMediaFiles(folderAbs) {
    const entries = safeReaddir(folderAbs);
    let n = 0;
    for (const ent of entries) {
      if (!ent.isFile()) continue;
      const name = ent.name;
      if (name.startsWith('.')) continue;
      const ext = path.extname(name).toLowerCase();
      if (MEDIA_EXT_SET.has(ext)) n++;
    }
    return n;
  }

  function deleteCollection(id, opts) {
    const { force = false } = opts || {};
    return withLock(() => {
      if (PROTECTED_IDS.has(id)) {
        throw mkError('该合集受保护，不可删除', 'E_COLLECTION_PROTECTED');
      }
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      let st;
      try { st = fs.statSync(abs); }
      catch (_e) { throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND'); }
      if (!st.isDirectory()) throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');
      const videoCount = countMediaFiles(abs);
      if (!force && videoCount > 0) {
        throw mkError(`合集仍有 ${videoCount} 个文件`, 'E_COLLECTION_NOT_EMPTY');
      }
      fs.rmSync(abs, { recursive: true, force: true });
      return { ok: true, deleted: videoCount };
    });
  }

  // Clear all episode files (and sidecars) from a collection but keep the
  // folder + metadata. Used for the audio default collection which can be
  // cleared but never deleted.
  function clearCollection(id) {
    return withLock(() => {
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      let st;
      try { st = fs.statSync(abs); }
      catch (_e) { throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND'); }
      if (!st.isDirectory()) throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');
      const entries = safeReaddir(abs);
      let removed = 0;
      for (const ent of entries) {
        if (!ent.isFile()) continue;
        if (ent.name === META_FILENAME) continue;
        const ext = path.extname(ent.name).toLowerCase();
        if (MEDIA_EXT_SET.has(ext) || SUB_EXT_SET.has(ext)) {
          try { fs.unlinkSync(path.join(abs, ent.name)); removed++; } catch (_e) {}
        }
      }
      // Clear episodeMeta too.
      const folderName = path.basename(abs);
      let meta = readMetaFile(abs, folderName);
      if (meta) {
        meta.episodeMeta = {};
        try { writeMetaFileAtomicSync(abs, meta); } catch (_e) {}
      }
      return { ok: true, removed };
    });
  }

  function updateEpisodeMeta(id, file, patch) {
    return withLock(() => {
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      let st;
      try { st = fs.statSync(abs); }
      catch (_e) { throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND'); }
      if (!st.isDirectory()) throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');

      if (typeof file !== 'string' || !file) throw mkError('集文件名非法', 'E_INVALID_FILE');
      const epPath = path.join(abs, file);
      try {
        const epSt = fs.statSync(epPath);
        if (!epSt.isFile()) throw new Error();
      } catch (_e) { throw mkError('集不存在', 'E_EPISODE_NOT_FOUND'); }

      const folderName = path.basename(abs);
      let meta = readMetaFile(abs, folderName);
      if (!meta) meta = defaultMetaFor(folderName, abs);
      if (!meta.episodeMeta) meta.episodeMeta = {};

      const current = meta.episodeMeta[file] || {};
      const next = { ...current };
      if (Object.prototype.hasOwnProperty.call(patch || {}, 'title')) {
        if (typeof patch.title !== 'string') throw mkError('剧集标题非法', 'E_INVALID_EPISODE_META');
        next.title = patch.title;
      }
      if (Object.prototype.hasOwnProperty.call(patch || {}, 'description')) {
        if (typeof patch.description !== 'string') throw mkError('剧集简介非法', 'E_INVALID_EPISODE_META');
        next.description = patch.description;
      }
      if (Object.prototype.hasOwnProperty.call(patch || {}, 'order')) {
        if (typeof patch.order !== 'number' || !Number.isFinite(patch.order)) {
          throw mkError('剧集顺序非法', 'E_INVALID_EPISODE_META');
        }
        next.order = patch.order;
      }
      // Chain-ordering pointer (折叠链表): `follows` names the head
      // episode this file must trail. An empty string / null clears the
      // binding (the episode becomes a standalone head again). We only
      // validate that the target is a real sibling file and not the
      // episode itself; multi-level or stale pointers are tolerated and
      // flattened to one level by the client's applyChains().
      if (Object.prototype.hasOwnProperty.call(patch || {}, 'follows')) {
        const fv = patch.follows;
        if (fv === null || fv === '') {
          delete next.follows;
        } else if (typeof fv !== 'string') {
          throw mkError('跟随目标非法', 'E_INVALID_EPISODE_META');
        } else if (fv === file) {
          throw mkError('不能跟随自身', 'E_INVALID_EPISODE_META');
        } else {
          // Containment guard: the target must resolve to a regular file
          // strictly inside the collection folder. Reject any path that
          // escapes via separators or `..`, so a crafted body can't point
          // the pointer at something outside the collection.
          const headAbs = path.resolve(abs, fv);
          const within = headAbs === abs
            ? false
            : (headAbs + path.sep).startsWith(abs + path.sep);
          if (!within) throw mkError('跟随目标非法', 'E_INVALID_EPISODE_META');
          try {
            const headSt = fs.statSync(headAbs);
            if (!headSt.isFile()) throw new Error();
          } catch (_e) { throw mkError('跟随目标不存在', 'E_INVALID_EPISODE_META'); }
          // Linked-list integrity. The chain is singly linked: every
          // episode may be followed by at most one other. Reject if some
          // OTHER episode already follows fv (its successor slot is taken)…
          for (const k of Object.keys(meta.episodeMeta)) {
            if (k === file) continue;
            const km = meta.episodeMeta[k];
            if (km && km.follows === fv) {
              throw mkError('该文件已被其他文件跟随', 'E_FOLLOW_TAKEN');
            }
          }
          // …and reject anything that would close a loop (walking fv's
          // predecessor chain must not reach `file`).
          let walk = fv;
          const visited = new Set();
          while (walk && !visited.has(walk)) {
            if (walk === file) throw mkError('不能形成循环跟随', 'E_FOLLOW_CYCLE');
            visited.add(walk);
            const wm = meta.episodeMeta[walk];
            walk = wm && typeof wm.follows === 'string' ? wm.follows : null;
          }
          next.follows = fv;
        }
      }
      meta.episodeMeta[file] = next;
      writeMetaFileAtomicSync(abs, meta);
      return next;
    });
  }

  // Bulk reorder: accepts a list of { file, order } and updates episodeMeta
  // in one lock hold. Used by the drag-reorder UI.
  function reorderEpisodes(id, items) {
    return withLock(() => {
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      let st;
      try { st = fs.statSync(abs); }
      catch (_e) { throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND'); }
      if (!st.isDirectory()) throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');
      if (!Array.isArray(items)) throw mkError('items 必须是数组', 'E_INVALID_FILES');

      const folderName = path.basename(abs);
      let meta = readMetaFile(abs, folderName);
      if (!meta) meta = defaultMetaFor(folderName, abs);
      if (!meta.episodeMeta) meta.episodeMeta = {};

      for (const it of items) {
        if (!it || typeof it !== 'object') continue;
        const file = typeof it.file === 'string' ? it.file : null;
        const order = typeof it.order === 'number' && Number.isFinite(it.order) ? it.order : null;
        if (!file || order === null) continue;
        // Must exist on disk.
        try {
          const epSt = fs.statSync(path.join(abs, file));
          if (!epSt.isFile()) continue;
        } catch (_e) { continue; }
        const cur = meta.episodeMeta[file] || {};
        meta.episodeMeta[file] = { ...cur, order };
      }
      writeMetaFileAtomicSync(abs, meta);
      return { ok: true };
    });
  }

  function deleteEpisode(id, file) {
    return withLock(() => {
      const abs = resolveCollectionPath(id);
      if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
      let st;
      try { st = fs.statSync(abs); }
      catch (_e) { throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND'); }
      if (!st.isDirectory()) throw mkError('合集不存在', 'E_COLLECTION_NOT_FOUND');

      if (typeof file !== 'string' || !file || file.includes('/') || file.includes('\\')) {
        throw mkError('文件名非法', 'E_INVALID_FILE');
      }
      const epPath = path.join(abs, file);
      try {
        const epSt = fs.statSync(epPath);
        if (!epSt.isFile()) throw new Error();
      } catch (_e) { throw mkError('集不存在', 'E_EPISODE_NOT_FOUND'); }

      const removed = [];
      try { fs.unlinkSync(epPath); removed.push(file); } catch (_e) {}

      // Remove sidecars sharing the stem.
      const ext = path.extname(file);
      const stem = file.slice(0, file.length - ext.length);
      const entries = safeReaddir(abs);
      for (const ent of entries) {
        if (!ent.isFile() || ent.name.startsWith('.')) continue;
        const e = path.extname(ent.name).toLowerCase();
        if (!SUB_EXT_SET.has(e)) continue;
        const nm = ent.name.slice(0, ent.name.length - e.length);
        if (nm === stem || nm.startsWith(stem + '.')) {
          try { fs.unlinkSync(path.join(abs, ent.name)); removed.push(ent.name); } catch (_e) {}
        }
      }

      // Also remove quality variants if this file was the top of a quality group.
      const m = QUALITY_RE.exec(stem);
      if (m) {
        const base = m[1].replace(/[\-_. ]+$/, '');
        for (const ent of entries) {
          if (!ent.isFile() || ent.name.startsWith('.')) continue;
          if (ent.name === file) continue;
          const e = path.extname(ent.name).toLowerCase();
          if (!MEDIA_EXT_SET.has(e)) continue;
          const entStem = ent.name.slice(0, ent.name.length - e.length);
          const em = QUALITY_RE.exec(entStem);
          if (em && em[1].replace(/[\-_. ]+$/, '') === base) {
            try { fs.unlinkSync(path.join(abs, ent.name)); removed.push(ent.name); } catch (_e) {}
          }
        }
      }

      const folderName = path.basename(abs);
      let meta = readMetaFile(abs, folderName);
      if (meta && meta.episodeMeta && meta.episodeMeta[file]) {
        delete meta.episodeMeta[file];
        writeMetaFileAtomicSync(abs, meta);
      }
      return { ok: true, removed };
    });
  }

  function bulkEpisodeOp(sourceId, action, files, target) {
    return withLock(() => {
      if (!Array.isArray(files) || files.length === 0) {
        throw mkError('files 列表为空', 'E_INVALID_FILES');
      }
      if (!['delete', 'move', 'copy'].includes(action)) {
        throw mkError('action 非法', 'E_INVALID_ACTION');
      }
      const srcAbs = resolveCollectionPath(sourceId);
      if (!srcAbs) throw mkError('源合集名称非法', 'E_INVALID_ID');
      try {
        const st = fs.statSync(srcAbs);
        if (!st.isDirectory()) throw new Error();
      } catch (_e) { throw mkError('源合集不存在', 'E_COLLECTION_NOT_FOUND'); }

      let dstAbs = null;
      if (action === 'move' || action === 'copy') {
        if (typeof target !== 'string' || !target) throw mkError('缺少目标合集', 'E_INVALID_TARGET');
        if (target === sourceId) throw mkError('源和目标合集相同', 'E_INVALID_TARGET');
        dstAbs = resolveCollectionPath(target);
        if (!dstAbs) throw mkError('目标合集名称非法', 'E_INVALID_TARGET');
        try {
          const st = fs.statSync(dstAbs);
          if (!st.isDirectory()) throw new Error();
        } catch (_e) { throw mkError('目标合集不存在', 'E_COLLECTION_NOT_FOUND'); }
      }

      const srcFolderName = path.basename(srcAbs);
      let srcMeta = readMetaFile(srcAbs, srcFolderName);
      if (!srcMeta) srcMeta = defaultMetaFor(srcFolderName, srcAbs);
      if (!srcMeta.episodeMeta) srcMeta.episodeMeta = {};
      let srcMetaDirty = false;

      let dstMeta = null, dstMetaDirty = false, dstFolderName = null;
      if (dstAbs) {
        dstFolderName = path.basename(dstAbs);
        dstMeta = readMetaFile(dstAbs, dstFolderName);
        if (!dstMeta) dstMeta = defaultMetaFor(dstFolderName, dstAbs);
        if (!dstMeta.episodeMeta) dstMeta.episodeMeta = {};
      }

      const processed = [];
      const errors = [];

      function collectSidecars(abs, file) {
        const entries = safeReaddir(abs);
        const ext = path.extname(file);
        const stem = file.slice(0, file.length - ext.length);
        const result = [];
        for (const ent of entries) {
          if (!ent.isFile() || ent.name.startsWith('.')) continue;
          if (ent.name === file) continue;
          const e = path.extname(ent.name).toLowerCase();
          if (!SUB_EXT_SET.has(e)) continue;
          const nm = ent.name.slice(0, ent.name.length - e.length);
          if (nm === stem || nm.startsWith(stem + '.')) result.push(ent.name);
        }
        return result;
      }

      for (const rawFile of files) {
        const file = String(rawFile || '');
        if (!file || file.includes('/') || file.includes('\\') || file.startsWith('.')) {
          errors.push({ file, error: '文件名非法' });
          continue;
        }
        const src = path.join(srcAbs, file);
        try {
          const st = fs.statSync(src);
          if (!st.isFile()) throw new Error('not a file');
        } catch (_e) { errors.push({ file, error: '源文件不存在' }); continue; }

        const sidecars = collectSidecars(srcAbs, file);
        const allFiles = [file, ...sidecars];

        try {
          if (action === 'delete') {
            for (const f of allFiles) {
              try { fs.unlinkSync(path.join(srcAbs, f)); } catch (_e) {}
            }
            if (srcMeta.episodeMeta[file]) {
              delete srcMeta.episodeMeta[file];
              srcMetaDirty = true;
            }
            processed.push(file);
          } else {
            const dst = path.join(dstAbs, file);
            if (fs.existsSync(dst)) {
              errors.push({ file, error: '目标合集已存在同名文件' });
              continue;
            }
            if (action === 'move') {
              try {
                for (const f of allFiles) {
                  try {
                    fs.renameSync(path.join(srcAbs, f), path.join(dstAbs, f));
                  } catch (e) {
                    if (e && e.code === 'EXDEV') {
                      fs.copyFileSync(path.join(srcAbs, f), path.join(dstAbs, f));
                      fs.unlinkSync(path.join(srcAbs, f));
                    } else if (e && e.code === 'ENOENT') { /* ignore */ }
                    else { throw e; }
                  }
                }
                if (srcMeta.episodeMeta[file]) {
                  dstMeta.episodeMeta[file] = srcMeta.episodeMeta[file];
                  delete srcMeta.episodeMeta[file];
                  srcMetaDirty = true;
                  dstMetaDirty = true;
                }
                processed.push(file);
              } catch (e) { errors.push({ file, error: '移动失败: ' + e.message }); }
            } else if (action === 'copy') {
              try {
                for (const f of allFiles) {
                  try {
                    fs.copyFileSync(path.join(srcAbs, f), path.join(dstAbs, f));
                  } catch (e) {
                    if (e && e.code === 'ENOENT') { /* sidecar missing */ }
                    else throw e;
                  }
                }
                if (srcMeta.episodeMeta[file]) {
                  dstMeta.episodeMeta[file] = { ...srcMeta.episodeMeta[file] };
                  dstMetaDirty = true;
                }
                processed.push(file);
              } catch (e) { errors.push({ file, error: '复制失败: ' + e.message }); }
            }
          }
        } catch (e) { errors.push({ file, error: e.message }); }
      }

      if (srcMetaDirty) {
        try { writeMetaFileAtomicSync(srcAbs, srcMeta); } catch (_e) {}
      }
      if (dstMetaDirty) {
        try { writeMetaFileAtomicSync(dstAbs, dstMeta); } catch (_e) {}
      }
      return { ok: true, processed, errors, processedCount: processed.length, errorCount: errors.length };
    });
  }

  function listEpisodes(id) {
    const abs = resolveCollectionPath(id);
    if (!abs) return [];
    try {
      const st = fs.statSync(abs);
      if (!st.isDirectory()) return [];
    } catch (_e) { return []; }
    const folderName = path.basename(abs);
    let meta = readMetaFile(abs, folderName);
    if (!meta) meta = defaultMetaFor(folderName, abs);
    return buildEpisodes(abs, meta.episodeMeta);
  }

  // Ensure a pre-defined collection exists (used for audio default collection).
  function ensureCollection(id, input) {
    const abs = resolveCollectionPath(id);
    if (!abs) throw mkError('名称非法', 'E_INVALID_ID');
    if (!fs.existsSync(abs)) {
      try { fs.mkdirSync(abs, { recursive: true }); } catch (_e) {}
    }
    const metaPath = path.join(abs, META_FILENAME);
    if (!fs.existsSync(metaPath)) {
      const data = input && typeof input === 'object' ? input : {};
      const seedType = VALID_TYPES.includes(data.type) ? data.type : DEFAULT_TYPE;
      const meta = {
        id,
        title: typeof data.title === 'string' ? data.title : id,
        description: typeof data.description === 'string' ? data.description : '',
        type: seedType,
        types: [seedType],
        cover: findCoverFor(abs),
        hidden: false,
        createdAt: Date.now(),
        introSkipSec: 0,
        episodeMeta: {},
      };
      try { writeMetaFileAtomicSync(abs, meta); } catch (_e) {}
    }
    return getCollection(id);
  }

  // Ensure root directory exists on disk + run initial metadata migration.
  function init() {
    try { fs.mkdirSync(ROOT, { recursive: true }); } catch (_e) {}
    migrateAll();
  }

  return {
    init,
    migrateAll,
    root: ROOT,
    metaFilename: META_FILENAME,
    validTypes: VALID_TYPES.slice(),
    protectedIds: Array.from(PROTECTED_IDS),

    resolveCollectionPath,
    findCover,
    listCollectionImages,
    listCollectionTree,

    invalidateSummaryCache,
    listCollections,
    getCollection,
    createCollection,
    updateCollection,
    deleteCollection,
    clearCollection,
    ensureCollection,

    updateEpisodeMeta,
    reorderEpisodes,
    deleteEpisode,
    bulkEpisodeOp,
    listEpisodes,

    readMetaFile: (absDir, id) => readMetaFile(absDir, path.basename(absDir)),
    writeMetaFile: writeMetaFileAtomicSync,
  };
}

module.exports = {
  createStore,
  validateId,
};
