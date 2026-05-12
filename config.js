const path = require('path');

// All runtime settings in one place.
// Override any of these via environment variables when launching.
module.exports = {
  // ---- HTTP ---------------------------------------------------------
  PORT: Number(process.env.PORT) || 8080,
  HOST: process.env.HOST || '0.0.0.0',
  // Fallback ports tried in order when the preferred PORT is already
  // taken. Picked to avoid well-known service ports and to spread across
  // common alternative web ranges so *something* is almost always free.
  // Override with PORT_FALLBACKS="9090,9091" to customize.
  //
  // IMPORTANT: do NOT append 0 (OS-assigned). A process landing on an
  // ephemeral port in 49152-65535 can't be found by the bat launchers
  // (their PORT_LIST is fixed) and becomes an unkillable zombie.
  // All candidates below must match the PORT_LIST in ChiralNetworkChannel.bat
  // and shutDown.bat — keep them in sync.
  PORT_FALLBACKS: (process.env.PORT_FALLBACKS
    ? process.env.PORT_FALLBACKS.split(',').map((s) => Number(s.trim())).filter((n) => n > 0 && n < 65536)
    : [8081, 8088, 8888, 8090, 9090, 9091, 9191, 18080, 28080, 38080, 48080, 58080, 8000, 8001, 3000, 5000, 7000]
  ),

  // ---- Filesystem roots --------------------------------------------
  // User-authored content lives under ./Resource/. Video and audio are
  // kept in separate subtrees so neither subsystem can accidentally
  // write into the other's tree, but they share a single parent so the
  // admin has ONE "here are my files" folder to back up, mount from a
  // different drive, or point at a NAS share.
  //
  // Override with MEDIA_ROOT / AUDIO_ROOT env vars when running against
  // an external mount (e.g. MEDIA_ROOT=/volume1/media on the DS124).
  MEDIA_ROOT: process.env.MEDIA_ROOT
    ? path.resolve(process.env.MEDIA_ROOT)
    : path.join(__dirname, 'Resource', 'media'),

  AUDIO_ROOT: process.env.AUDIO_ROOT
    ? path.resolve(process.env.AUDIO_ROOT)
    : path.join(__dirname, 'Resource', 'audio'),

  IMAGE_ROOT: process.env.IMAGE_ROOT
    ? path.resolve(process.env.IMAGE_ROOT)
    : path.join(__dirname, 'Resource', 'image'),

  NOVEL_ROOT: process.env.NOVEL_ROOT
    ? path.resolve(process.env.NOVEL_ROOT)
    : path.join(__dirname, 'Resource', 'novel'),

  // Where JSON state files live (users, sessions, progress).
  DATA_ROOT: process.env.DATA_ROOT
    ? path.resolve(process.env.DATA_ROOT)
    : path.join(__dirname, 'data'),

  // ---- Session ------------------------------------------------------
  SESSION_TTL_MS: Number(process.env.SESSION_TTL_MS) || 30 * 24 * 60 * 60 * 1000,

  // ---- Upload limits -----------------------------------------------
  MAX_UPLOAD_BYTES: 20 * 1024 * 1024 * 1024, // 20 GiB per file

  // ---- ffmpeg transcode pipeline -----------------------------------
  // Bundled ffmpeg/ffprobe binaries live under ./bin/ffmpeg/<plat>-<arch>/.
  // The Windows build is packaged into the Inno Setup installer; the
  // Linux-arm64 build is rsynced onto the DS124 during deploy. Both
  // trees are populated by hand — see bin/ffmpeg/README.md.
  //
  // Resolution order for the binary used at runtime:
  //   1. env FFMPEG_PATH / FFPROBE_PATH if set (absolute override)
  //   2. bundled bin matching process.platform + process.arch
  //   3. bare "ffmpeg" / "ffprobe" on PATH (last-resort fallback)
  //
  // If none of the above resolve to a working binary, /media-stream
  // returns 503 and non-whitelisted video extensions become unplayable.
  // Whitelisted formats (VIDEO_SAFE_NATIVE_EXTS) keep working either way.
  FFMPEG_PATH: process.env.FFMPEG_PATH
    ? path.resolve(process.env.FFMPEG_PATH)
    : null,
  FFPROBE_PATH: process.env.FFPROBE_PATH
    ? path.resolve(process.env.FFPROBE_PATH)
    : null,
  FFMPEG_BIN_ROOT: path.join(__dirname, 'bin', 'ffmpeg'),

  // ---- Accepted file extensions ------------------------------------
  VIDEO_EXTS: [
    '.mp4', '.m4v', '.webm', '.ogv', '.ogg',
    '.mov', '.mkv', '.avi', '.wmv', '.flv',
    '.ts', '.mts', '.m2ts', '.3gp', '.rmvb', '.rm'
  ],
  // Whitelist of containers served byte-for-byte (full Range support,
  // complete duration metadata, all internal streams preserved). Files
  // outside this whitelist go through the /media-stream transcode
  // pipeline, which produces fragmented MP4 and trades seekability +
  // multi-track preservation for browser compatibility.
  //
  // .mkv is included here as of 1.7.21 because:
  //   - users want full multi-audio / multi-subtitle preservation
  //     (transcode mode drops everything past the first audio track
  //     and forces fragmented MP4 with broken duration metadata)
  //   - Chrome / Edge / Safari 16+ play H264+AAC mkv natively
  //   - the in-app player.error handler falls back to /media-stream
  //     when native playback fails (Firefox, exotic codecs like DTS/
  //     HEVC), so widening this whitelist is non-destructive
  //
  // Kept intentionally tight outside of mkv — adding an extension is
  // cheap, but a silent native-decode regression on a less-common
  // container would lock users out without an obvious diagnostic.
  VIDEO_SAFE_NATIVE_EXTS: ['.mp4', '.m4v', '.webm', '.mkv'],
  // External subtitle formats accepted alongside video files.
  //
  //   .vtt / .srt        Web-native captions (browser <track> friendly
  //                      after light cleanup; UTF-8/GBK/UTF-16 decoded
  //                      client-side before being handed to the player)
  //   .ass / .ssa        SubStation / Advanced SubStation — common in
  //                      anime fansubs. Styling is dropped on the way
  //                      to VTT; only timing + plain text survive.
  //   .smi / .sami       Microsoft SAMI (Windows Media era). HTML-ish
  //                      single-file format; client-side parser walks
  //                      the SYNC blocks and pairs them as cues.
  //   .ttml / .dfxp      Timed Text Markup Language (XML). Netflix /
  //                      DASH streaming use this. Client-side parser
  //                      pulls <p begin/end> spans and emits VTT.
  //   .sup               PGS bitmaps from Blu-ray rips. Browsers can't
  //                      render PGS via <track>, so the client lazily
  //                      loads vendor/libpgs/libpgs.js (ESM) on first
  //                      use and overlays a canvas on top of <video>.
  //                      The .sup file itself ships as static; the
  //                      DS124 does no PGS work server-side (its ARM
  //                      A55 1.7GHz is not up to OCR or transcoding
  //                      bitmap subs).
  //
  // NOT accepted (image subtitles — browsers cannot render these
  // natively and the client-side path isn't implemented):
  //   .sub + .idx        VobSub bitmaps from DVD rips. Common in older
  //                      DVD-rip pairings; users should pre-convert
  //                      with SubtitleEdit / VobSub2SRT / similar.
  VIDEO_SUBTITLE_EXTS: ['.vtt', '.srt', '.ass', '.ssa', '.smi', '.sami', '.ttml', '.dfxp', '.sup'],

  AUDIO_EXTS: [
    '.mp3', '.m4a', '.aac', '.flac', '.wav', '.ogg', '.oga',
    '.opus', '.wma', '.ape', '.alac', '.aiff', '.aif',
    // Video containers accepted in audio collections so that bonus
    // explainer videos / MV-style episodes can live alongside their
    // audio siblings. Only browser-native containers are listed —
    // anything outside this set would need the /media-stream transcode
    // pipeline, which the audio static handler does not wire up.
    '.mp4', '.webm', '.m4v',
  ],
  // Strong priority order (highest first) for rendering when multiple
  // lyric files exist for the same audio stem.
  LYRIC_EXTS: ['.vtt', '.srt', '.ass', '.ssa', '.lrc', '.txt'],

  IMAGE_EXTS: [
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.avif'
  ],

  // ---- Novel subsystem -------------------------------------------------
  // Skeleton extensions only — readers (TXT/PDF/EPUB rendering) come in
  // a follow-up patch. .pdf is included so that the upload + episode-
  // scan pipeline accepts the same files the image subsystem will also
  // surface via IMAGE_DOC_EXTS once the shared PDF viewer ships.
  NOVEL_EXTS: ['.txt', '.pdf'],

  // ---- Audio default collection ------------------------------------
  // The default collection is auto-created on boot, cannot be deleted,
  // and can only be cleared. Single-file uploads without an explicit
  // target collection land here.
  AUDIO_DEFAULT_COLLECTION_ID: '_default',
  AUDIO_DEFAULT_COLLECTION_TITLE: '默认合集',

  // ---- Valid collection types per subsystem ------------------------
  // These are the *ids* the store accepts on create. Labels ("剧集" etc)
  // are managed by lib/categories.js at runtime and can be renamed by the
  // admin from the UI.
  VIDEO_TYPES: ['series', 'movie', 'other'],
  AUDIO_TYPES: ['audiobook', 'podcast', 'album', 'other'],
  IMAGE_TYPES: ['gallery', 'comic', 'wallpaper', 'other'],
  NOVEL_TYPES: ['novel', 'lightnovel', 'comic', 'other'],

  // Seed used by lib/categories.js when the persistent file doesn't exist.
  // parentId is explicit on every entry: defaults are flat (all top-level).
  // 1.1.0+ admins can introduce nested children via the admin panel — the
  // seed itself stays flat to keep first-boot semantics unchanged.
  CATEGORY_DEFAULTS: {
    video: [
      { id: 'series', label: '剧集', parentId: null, hidden: false },
      { id: 'movie',  label: '电影', parentId: null, hidden: false },
      { id: 'other',  label: '其他', parentId: null, hidden: false },
    ],
    audio: [
      { id: 'audiobook', label: '有声书', parentId: null, hidden: false },
      { id: 'podcast',   label: '播客',   parentId: null, hidden: false },
      { id: 'album',     label: '专辑',   parentId: null, hidden: false },
      { id: 'other',     label: '其他',   parentId: null, hidden: false },
    ],
    image: [
      { id: 'gallery',   label: '图集',   parentId: null, hidden: false },
      { id: 'comic',     label: '漫画',   parentId: null, hidden: false },
      { id: 'wallpaper', label: '壁纸',   parentId: null, hidden: false },
      { id: 'other',     label: '其他',   parentId: null, hidden: false },
    ],
    novel: [
      { id: 'novel',      label: '小说',   parentId: null, hidden: false },
      { id: 'lightnovel', label: '轻小说', parentId: null, hidden: false },
      { id: 'comic',      label: '漫画',   parentId: null, hidden: false },
      { id: 'other',      label: '其他',   parentId: null, hidden: false },
    ],
  },
};
