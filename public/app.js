(function () {
  'use strict';

  // ==================================================================
  // SVG Icons — inline, no emoji, monochrome line/fill
  // ==================================================================
  const ICONS = {
    'star-outline': '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><polygon points="12,3 14.5,9 21,9.5 16,13.8 17.6,20.5 12,17 6.4,20.5 8,13.8 3,9.5 9.5,9"/></svg>',
    'star-filled':  '<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12,3 14.5,9 21,9.5 16,13.8 17.6,20.5 12,17 6.4,20.5 8,13.8 3,9.5 9.5,9"/></svg>',
    'picture':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14"/><circle cx="8.5" cy="10" r="1.4"/><polyline points="3,19 9,12 13,16 16,13 21,19"/></svg>',
    'edit':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 20h4L20 8l-4-4L4 16v4z"/><line x1="15" y1="5" x2="19" y2="9"/></svg>',
    'upload':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><path d="M12 17V4"/><path d="M6 10l6-6 6 6"/><path d="M4 20h16"/></svg>',
    'clock':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><polyline points="12,7 12,12 15,14"/></svg>',
    'manage':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="7" height="7"/><rect x="13" y="4" width="7" height="7"/><rect x="4" y="13" width="7" height="7"/><polyline points="13,16 15,18 20,13" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    'trash':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 6h16"/><path d="M9 6V4h6v2"/><path d="M6 6l1 14h10l1-14"/><line x1="10" y1="10" x2="10" y2="17"/><line x1="14" y1="10" x2="14" y2="17"/></svg>',
    'menu':         '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
    'menu-h':       '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
    'history':      '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M3 12a9 9 0 1 0 3-6.7"/><polyline points="3,4 3,9 8,9"/><polyline points="12,8 12,13 16,15"/></svg>',
    'plus':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
    'search':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><circle cx="11" cy="11" r="6"/><line x1="20" y1="20" x2="15.5" y2="15.5"/></svg>',
    'drag-handle':  '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="6" r="1.5"/><circle cx="15" cy="6" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="18" r="1.5"/><circle cx="15" cy="18" r="1.5"/></svg>',
    'admin':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><path d="M12 2l8 3v6c0 5-3.5 9-8 11-4.5-2-8-6-8-11V5l8-3z"/></svg>',
    'key':          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><circle cx="8" cy="15" r="4"/><path d="M10.5 12.5L21 2"/><line x1="17" y1="6" x2="20" y2="9"/></svg>',
    'logout':       '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M15 4h4v16h-4"/><polyline points="10,8 14,12 10,16"/><line x1="14" y1="12" x2="4" y2="12"/></svg>',
    'mini':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"><rect x="3" y="4" width="18" height="14" rx="1"/><rect x="11" y="11" width="8" height="5" rx="0.5" fill="currentColor"/></svg>',
    'text':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><path d="M4 7h16M4 12h10M4 17h16"/></svg>',
    'move':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><polyline points="14,6 20,12 14,18"/><line x1="4" y1="12" x2="20" y2="12"/></svg>',
    'copy':         '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="8" y="8" width="12" height="12"/><polyline points="16,4 4,4 4,16" fill="none" stroke-linejoin="round"/></svg>',
    'check':        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"><polyline points="4,12 10,18 20,6"/></svg>',
    'checkbox':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16"/></svg>',
    'checkbox-on':  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16"/><polyline points="8,12 11,15 16,9" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/></svg>',
    'next-ep':      '<svg viewBox="0 0 18 18" fill="currentColor"><path d="M4 3l8 6-8 6V3z"/><rect x="13" y="3" width="2" height="12"/></svg>',
    'prev-ep':      '<svg viewBox="0 0 18 18" fill="currentColor"><path d="M14 3l-8 6 8 6V3z"/><rect x="3" y="3" width="2" height="12"/></svg>',
    // Media controls for mini-players (audio + video). Share the same
    // 18-unit grid as prev-ep/next-ep so they line up visually.
    'play':         '<svg viewBox="0 0 18 18" fill="currentColor"><path d="M4 3l11 6-11 6V3z"/></svg>',
    'pause':        '<svg viewBox="0 0 18 18" fill="currentColor"><rect x="4" y="3" width="3.5" height="12"/><rect x="10.5" y="3" width="3.5" height="12"/></svg>',
    'close':        '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="4" x2="14" y2="14"/><line x1="14" y1="4" x2="4" y2="14"/></svg>',
    'expand':       '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round"><polyline points="10,3 15,3 15,8"/><polyline points="8,15 3,15 3,10"/><line x1="15" y1="3" x2="10" y2="8"/><line x1="3" y1="15" x2="8" y2="10"/></svg>',
    'sort-asc':     '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"/><polyline points="6,10 12,4 18,10"/></svg>',
    'sort-desc':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"><line x1="12" y1="4" x2="12" y2="20"/><polyline points="6,14 12,20 18,14"/></svg>',
    // 'transcode' is the pretranscode-queue button glyph: a film
    // frame on the left → arrow → a stack of three output cells on
    // the right. Reads as "convert one source into queued outputs".
    'transcode':    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"><rect x="3" y="6" width="7" height="12" rx="0.5"/><line x1="3" y1="9" x2="10" y2="9"/><line x1="3" y1="15" x2="10" y2="15"/><line x1="12" y1="12" x2="16" y2="12"/><polyline points="14.5,10 16.5,12 14.5,14"/><rect x="18" y="7" width="3.5" height="3"/><rect x="18" y="11" width="3.5" height="3"/><rect x="18" y="15" width="3.5" height="3"/></svg>',
  };

  function injectIcons(root) {
    const scope = root || document;
    for (const el of scope.querySelectorAll('[data-icon]')) {
      const name = el.dataset.icon;
      if (ICONS[name]) {
        const currentSvg = el.querySelector('svg');
        const newSvg = ICONS[name];
        if (!currentSvg || currentSvg.outerHTML !== newSvg) {
          el.innerHTML = newSvg;
        }
      }
    }
  }

  // ==================================================================
  // DOM refs
  // ==================================================================
  const $ = (id) => document.getElementById(id);

  const viewLogin   = $('view-login');
  const viewHome    = $('view-home');
  const viewDetail  = $('view-detail');
  const viewPlayer  = $('view-player');
  const viewAudioPlayer = $('view-audio-player');
  const viewGallery = $('view-gallery');
  const galleryBulkBar      = $('gallery-bulk-bar');
  const galleryBulkToggle   = $('gallery-bulk-toggle');
  const galleryBulkActions  = $('gallery-bulk-actions');
  const galleryBulkCount    = $('gallery-bulk-count');
  const galleryBulkSelectAllBtn = $('gallery-bulk-select-all');
  const galleryBulkClearBtn = $('gallery-bulk-clear');
  const galleryBulkFolderSel = $('gallery-bulk-folder');
  const galleryBulkDeleteBtn = $('gallery-bulk-delete');
  const galleryBulkExitBtn  = $('gallery-bulk-exit');
  const viewHistory = $('view-history');
  const viewAdmin   = $('view-admin');
  const galleryGrid = $('gallery-grid');
  const galleryLightbox = $('gallery-lightbox');
  const galleryLbImg = $('gallery-lb-img');
  const galleryLbPrev = $('gallery-lb-prev');
  const galleryLbNext = $('gallery-lb-next');
  const galleryLbClose = $('gallery-lb-close');
  const galleryLbCounter = $('gallery-lb-counter');

  const title       = $('title');
  const backBtn     = $('back-btn');
  const countEl     = $('count');
  const statusEl    = $('status');
  const userPill    = $('user-pill');
  const userName    = $('user-name');
  const loginBtn    = $('login-btn');
  const themeSelect = $('theme-select');
  const langSelect  = $('lang-select');
  // Settings menu now lives inside the user pill (click username to open).
  const menuBtn     = userPill;
  const menuPopover = $('menu-popover');
  const headerHistoryBtn = $('header-history-btn');
  const headerCreateBtn  = $('header-create-btn');
  const headerSearchBtn  = $('header-search-btn');
  const uploadInput = $('upload-input');

  const loginTabs   = $('login-tabs');
  const loginForm   = $('login-form');
  const loginError  = $('login-error');
  const loginNotice = $('login-notice');
  const loginLabel  = $('login-submit-label');

  const cardsEl      = $('cards');
  const filterChips  = $('filter-chips');
  const filterOpBar  = $('filter-op');
  const searchInput  = $('search-input');
  const favToggle    = $('fav-toggle');
  const favToggleIn  = $('fav-toggle-input');
  const showHiddenIn = $('show-hidden-input');
  const sortSelect   = $('sort-select');
  const sortDirBtn   = $('sort-dir-btn');
  const homeContinue = $('home-continue');
  const continueScroll = $('continue-scroll');
  const homeRecent   = $('home-recent');
  const recentScroll = $('recent-scroll');
  const homeImageLiked = $('home-image-liked');
  const viewLikedImagesBtn = $('view-liked-images-btn');
  const likedImagesCount = $('liked-images-count');
  const likedImagesScroll = $('liked-images-scroll');
  const homePlayAll  = $('home-play-all');
  const playAllBtn   = $('play-all-btn');
  const playAllShuffleBtn = $('play-all-shuffle-btn');
  const playAllCount = $('play-all-count');
  const homeLiked    = $('home-liked');
  const playLikedBtn = $('play-liked-btn');
  const playLikedShuffleBtn = $('play-liked-shuffle-btn');
  const likedCount   = $('liked-count');
  const playAllToggle = $('play-all-toggle');
  const playAllTracklist = $('play-all-tracklist');
  const playLikedToggle = $('play-liked-toggle');
  const playLikedTracklist = $('play-liked-tracklist');
  const likedShowHidden = $('liked-show-hidden');
  const likedImagesShowHidden = $('liked-images-show-hidden');

  const detailHero   = $('detail-hero');
  const detailBg     = $('detail-bg');
  const detailCover  = $('detail-cover');
  const detailType   = $('detail-type');
  const detailAuthors = $('detail-authors');
  const detailTitle  = $('detail-title');
  const detailStats  = $('detail-stats');
  const detailDesc   = $('detail-desc');
  const playContinueBtn = $('play-continue-btn');
  const playContinueLabel = $('play-continue-label');
  const playStartBtn = $('play-start-btn');
  const detailToolbar = $('detail-toolbar');
  const actFav       = $('act-fav');
  const actLikeAllWrap = $('act-like-all-wrap');
  const actLikeAll   = $('act-like-all');
  const actCover     = $('act-cover');
  const actEdit      = $('act-edit');
  const actUpload    = $('act-upload');
  const actIntro     = $('act-intro');
  const actPretranscode = $('act-pretranscode');
  const actManage    = $('act-manage');
  const actDelete    = $('act-delete');
  const epSortBar    = $('ep-sort-bar');
  const epSortSelect = $('ep-sort-select');
  const epSortDirBtn = $('ep-sort-dir-btn');
  const episodeList  = $('episode-list');
  const fileTreeEl   = $('file-tree');
  const detailTabEpisodes = $('detail-tab-episodes');
  const detailTabTree     = $('detail-tab-tree');
  const imgPreview       = $('img-preview');
  const imgPreviewImg    = $('img-preview-img');
  const imgPreviewCaption = $('img-preview-caption');
  const homeBulkBtn      = $('home-bulk-btn');
  const bulkColBar       = $('bulk-col-bar');
  const bulkColCount     = $('bulk-col-count');
  const bulkColSelectAll = $('bulk-col-select-all');
  const bulkColClearSel  = $('bulk-col-clear-sel');
  const bulkColRetag     = $('bulk-col-retag');
  const bulkColAuthors   = $('bulk-col-authors');
  const bulkColResume    = $('bulk-col-resume');
  const bulkColPretranscode = $('bulk-col-pretranscode');
  const bulkColDelete    = $('bulk-col-delete');
  const bulkColExit      = $('bulk-col-exit');
  const bulkRetagDialog  = $('bulk-retag-dialog');
  const bulkRetagForm    = $('bulk-retag-form');
  const bulkRetagSubtitle = $('bulk-retag-subtitle');
  const bulkRetagError   = $('bulk-retag-error');
  const bulkRetagCancel  = $('bulk-retag-cancel');
  const bulkAuthorsDialog   = $('bulk-authors-dialog');
  const bulkAuthorsForm     = $('bulk-authors-form');
  const bulkAuthorsSubtitle = $('bulk-authors-subtitle');
  const bulkAuthorsError    = $('bulk-authors-error');
  const bulkAuthorsCancel   = $('bulk-authors-cancel');
  const commentCompose = $('comment-compose');
  const commentText  = $('comment-text');
  const commentSubmit = $('comment-submit');
  const commentError = $('comment-error');
  const commentList  = $('comment-list');

  const playerContainer  = $('player-container');
  const player           = $('player');
  const playerErrorOverlay = $('player-error-overlay');
  const playerErrorMsg   = $('player-error-msg');
  const playerErrorDownload = $('player-error-download');
  const skipIntroBtn     = $('skip-intro-btn');
  const videoPortal      = $('video-portal');
  const playerSidebarTitle = $('player-sidebar-title');
  const playerEpSortBar    = $('player-ep-sort-bar');
  const playerEpSortSelect = $('player-ep-sort-select');
  const playerEpSortDirBtn = $('player-ep-sort-dir-btn');
  const playerEpisodeList = $('player-episode-list');
  const playerEpTitle    = $('player-ep-title');
  const playerEpMeta     = $('player-ep-meta');
  const prevEpBtn        = $('prev-ep-btn');
  const nextEpBtn        = $('next-ep-btn');
  const loopBtn          = $('loop-btn');
  const loopAllBtn       = $('loop-all-btn');
  const shuffleBtn       = $('shuffle-btn');
  const miniPlayer       = $('mini-player');
  const miniPlayerSlot   = $('mini-player-slot');
  const miniPlayerTitle  = $('mini-player-title');
  const miniExpandBtn    = $('mini-expand-btn');
  const miniCloseBtn     = $('mini-close-btn');

  // Audio mini-player handles — a separate floating card (not a portal,
  // because <audio> playback doesn't care where in the DOM it lives, so
  // we don't need to relocate it like we do for the video portal).
  const audioMini        = $('audio-mini-player');
  const audioMiniCover   = $('audio-mini-cover');
  const audioMiniTitle   = $('audio-mini-title');
  const audioMiniSub     = $('audio-mini-sub');
  const audioMiniScrub   = $('audio-mini-scrub');
  const audioMiniFill    = $('audio-mini-progress-fill');
  const audioMiniTimeCur = $('audio-mini-time-cur');
  const audioMiniTimeTotal = $('audio-mini-time-total');
  const audioMiniPlayBtn = $('audio-mini-play');
  const audioMiniPrevBtn = $('audio-mini-prev');
  const audioMiniNextBtn = $('audio-mini-next');
  const audioMiniExpandBtn = $('audio-mini-expand');
  const audioMiniCloseBtn  = $('audio-mini-close');

  const historyList     = $('history-list');
  const clearHistoryBtn = $('clear-history-btn');
  const historyManageBtn = $('history-manage-btn');
  const historyManageBar = $('history-manage-bar');
  const historyManageCount = $('history-manage-count');
  const historyAllBtn    = $('history-all-btn');
  const historyDeleteBtn = $('history-delete-btn');
  const historyExitBtn   = $('history-exit-btn');

  const adminUsersBody  = $('admin-users-body');
  const rescanBtn       = $('rescan-btn');
  const statsGrid       = $('stats-grid');
  const statsTopBody    = $('stats-top-body');
  const healthScanBtn   = $('health-scan-btn');
  const healthCleanBtn  = $('health-clean-btn');
  const healthSummary   = $('health-summary');
  const healthDetails   = $('health-details');

  const manageBar       = $('manage-bar');
  const manageCountEl   = $('manage-count');
  const manageAllBtn    = $('manage-all-btn');
  const manageMoveBtn   = $('manage-move-btn');
  const manageCopyBtn   = $('manage-copy-btn');
  const manageDeleteBtn = $('manage-delete-btn');
  const manageExitBtn   = $('manage-exit-btn');
  const epMenu          = $('ep-menu');
  const epFollowSelect  = $('ep-follow-select');

  const createDialog = $('create-dialog');
  const createForm   = $('create-form');
  const createError  = $('create-error');
  const createCancel = $('create-cancel');

  const editDialog   = $('edit-dialog');
  const editForm     = $('edit-form');
  const editError    = $('edit-error');
  const editCancel   = $('edit-cancel');

  const episodeEditDialog = $('episode-edit-dialog');
  const episodeEditForm   = $('episode-edit-form');
  const episodeEditError  = $('episode-edit-error');
  const episodeEditFile   = $('episode-edit-file');
  const episodeEditCancel = $('episode-edit-cancel');
  const episodeEditDelete = $('episode-edit-delete');

  const introDialog  = $('intro-dialog');
  const introForm    = $('intro-form');
  const introError   = $('intro-error');
  const introCancel  = $('intro-cancel');

  // v1.10.0 transcode picker dialog. Replaces the previous one-click
  // "pretranscode the whole collection" handler with a list+checkbox
  // UX: admin sees what's already cached vs. not, and picks rows to
  // enqueue. Cached rows can be re-transcoded (force=true on submit).
  const transcodeModal = $('transcode-modal');
  const transcodeForm = $('transcode-form');
  const transcodeSubtitle = $('transcode-subtitle');
  const transcodeList = $('transcode-list');
  const transcodeError = $('transcode-error');
  const transcodeCancel = $('transcode-cancel');
  const transcodeSubmit = $('transcode-submit');
  const transcodeSelectNeeded = $('transcode-select-needed');
  const transcodeSelectAll = $('transcode-select-all');
  const transcodeClearSel = $('transcode-clear-sel');
  const transcodeSelectedCount = $('transcode-selected-count');
  // In-flight modal state. cid = collection id the modal is open
  // for; mkvs = the rendered row list (rel path + cacheStatus).
  // Cleared on every open so a stale collection's rows can't leak
  // across dialog reopens.
  const transcodeModalState = { cid: null, mkvs: [] };

  const passwdDialog = $('passwd-dialog');
  const passwdForm   = $('passwd-form');
  const passwdError  = $('passwd-error');
  const passwdCancel = $('passwd-cancel');

  const coverDialog   = $('cover-dialog');
  const coverForm     = $('cover-form');
  const coverError    = $('cover-error');
  const coverGrid     = $('cover-grid');
  const coverCurrentName = $('cover-current-name');
  const coverCancel   = $('cover-cancel');
  const coverAutoBtn  = $('cover-auto');
  const coverUploadTrigger = $('cover-upload-trigger');
  const coverUploadInput = $('cover-upload-input');
  const coverEditor   = $('cover-editor');
  const coverBulkToggle = $('cover-bulk-toggle');
  const coverBulkActions = $('cover-bulk-actions');
  const coverBulkCount = $('cover-bulk-count');
  const coverBulkSelectAll = $('cover-bulk-select-all');
  const coverBulkClear = $('cover-bulk-clear');
  const coverBulkDelete = $('cover-bulk-delete');
  const coverBulkExit = $('cover-bulk-exit');
  // Cover-grid bulk-delete state. mode toggles the ✓ overlay class on
  // .cover-grid; selected stores ticked file paths. Cleared on dialog
  // close so re-opening the dialog starts fresh.
  const coverBulk = { mode: false, selected: new Set() };
  const coverEditorPreviews = $('cover-editor-previews');
  const coverScaleRange = $('cover-scale-range');
  const coverScaleVal = $('cover-scale-val');
  const coverResetCrop = $('cover-reset-crop');

  const bulkTargetDialog = $('bulk-target-dialog');
  const bulkTargetForm   = $('bulk-target-form');
  const bulkTargetTitle  = $('bulk-target-title');
  const bulkTargetSubtitle = $('bulk-target-subtitle');
  const bulkTargetSearchInput = $('bulk-target-search-input');
  const bulkTargetSearchBtn   = $('bulk-target-search-btn');
  const bulkTargetResults     = $('bulk-target-results');
  const bulkTargetError  = $('bulk-target-error');
  const bulkTargetCancel = $('bulk-target-cancel');
  const bulkTargetOk     = $('bulk-target-ok');

  const confirmDialogEl  = $('confirm-dialog');
  const confirmTitleEl   = $('confirm-title');
  const confirmMessageEl = $('confirm-message');
  const confirmOkBtn     = $('confirm-ok');
  const confirmCancelBtn = $('confirm-cancel');

  const toastContainer  = $('toast-container');

  // ==================================================================
  // State
  // ==================================================================
  const state = {
    user: null,
    needsFirstUser: false,
    // Active media subsystem — 'video' or 'audio'. Controls which API
    // routes and /media-files mount are used, and which home view is shown.
    kind: 'video',
    collections: [],
    currentCollection: null,
    currentComments: [],
    progressAll: {},
    favorites: new Set(),
    // `types` is a Set of selected category ids. Empty Set = "全部".
    // `typeOp` is the multi-tag combination operator: OR (任一), AND
    // (全部), NOR (全无), NOT (非全部 — at least one selected NOT in
    // the collection's tags). Operator is irrelevant when types is
    // empty (back-end short-circuits).
    filter: { q: '', types: new Set(), typeOp: 'OR', fav: false, sort: 'created', sortAsc: false, includeHidden: false },
    loginMode: 'login',
    currentFile: null,
    pendingFreshStart: false,
    selectedCover: null,
    // Live cover-transform state used by the cropper UI inside the cover
    // dialog. scale is 1..3 (1 = plain cover), x/y are 0..100 percentages
    // for the focal point (both background-position and transform-origin).
    // All three get reset to defaults whenever the selected source image
    // changes, so crops never bleed across different files.
    coverCrop: { scale: 1, x: 50, y: 50 },
    coverImages: [],
    playerSpeed: 1,
    loopMode: false,     // single-track loop
    loopAllMode: false,  // list/album loop — mutually exclusive with loopMode and shuffleMode
    shuffleMode: false,  // random pick
    editingEpisodeFile: null,
    subtitleBlobUrls: [],
    /**
     * PGS (.sup, Blu-ray) image-subtitle state. Browsers can't render
     * PGS through <track>, so we lazy-load vendor/libpgs/libpgs.js
     * (ESM) on first use and let it overlay an auto-created canvas
     * on top of the <video>. Lives next to subtitleBlobUrls because
     * the lifecycle is identical: scope is one episode, cleared on
     * episode change in two places (line ~1913 close-player and
     * line ~5172 ep-switch). Mutual-exclusive with Plyr text-track
     * captions — turning one on hides the other.
     *
     *   rendererClass — cached PgsRenderer constructor after first
     *                   dynamic import; null until then.
     *   renderer      — active PgsRenderer instance, or null when
     *                   no PGS sub is mounted.
     *   file          — sub.file path of the mounted PGS, used to
     *                   short-circuit redundant remounts when the
     *                   user re-picks the same row.
     *   visible       — whether the canvas is currently shown
     *                   (controlled by 确认 / CC toggle); separate
     *                   from `renderer != null` because we keep the
     *                   parsed sub mounted even when hidden so a
     *                   later toggle-on doesn't need to re-fetch.
     */
    pgs: { rendererClass: null, renderer: null, file: null, visible: false },
    miniMode: false,
    adminTab: 'users',
    manageMode: false,
    // File-tree tab state for the current collection detail view.
    // currentTree holds the flat entries array returned by
    // /api/collections/:id/tree once it's fetched for a collection;
    // null means we haven't asked yet. treeLoading prevents double-
    // fetching on rapid tab switches. activeTab is the current panel
    // the user is looking at in the detail view.
    currentTree: null,
    treeLoading: false,
    activeTab: 'episodes',
    // "Specified play" scope. Non-null string = subdir path that
    // should bound the player's prev/next navigation. Set by the
    // file-tree click handler when the user plays a file from inside
    // a subdirectory (the scope is that file's parent dir), and
    // ALSO re-read from the URL hash `?scope=` parameter in
    // parseHash/showPlayer so the scope survives a page reload and
    // auto-next events (each next-navigation writes the same scope
    // back into the URL).
    specifiedPlayScope: null,
    // Session play queue (会话级播放列表): an in-memory, NON-persisted
    // ordering of the currently-playing collection's episodes that the
    // user can drag to reorder during playback. Shape:
    //   { colId: string, order: [fileKey, ...] }   or null when inactive.
    // Seeded from the sort preference + chain gluing when a collection
    // starts playing, rebuilt on collection switch or sort change, and
    // discarded when the playback screen is left (see handleRoute) or on
    // reload. next/prev read it via scopedEpisodes, so playback order
    // follows the user's manual arrangement.
    playQueue: null,
    // Collection-level bulk manage mode (home page, admin only).
    // Distinct from episode-level manageMode which works inside a
    // collection detail view.
    bulkColMode: false,
    bulkColSelected: new Set(),
    selectedEpisodes: new Set(),
    bulkAction: null,     // 'move' | 'copy' | 'delete'
    bulkFiles: [],        // files to operate on
    bulkSingle: false,    // single-episode submenu operation
    bulkTargetChosenId: '', // move/copy target picked from the search list
    plyr: null,
    historyItems: [],     // last loaded history list
    historyManageMode: false,
    historySelected: new Set(),  // keys: collectionId + '\x00' + file
    gesturesAttached: false,
    gestureLongPressing: false,
    gestureSavedSpeed: 1,
    desktopHoldSpeed: false,
    desktopHoldSpeedOrig: 1,
    autoVideoMiniEnabled: true,
    autoAudioMiniEnabled: true,
    // Audio mini-player state. `audioMiniVisible` tracks whether the
    // floating audio card is currently on screen. `audioMiniMode` picks
    // between the in-browser fixed overlay and the Document PiP window
    // (Chrome/Edge 116+). `audioMiniPipWindow` holds the PiP window
    // reference while it's open so we can close it on mode switches.
    audioMiniVisible: false,
    audioMiniMode: 'in-browser',  // 'in-browser' | 'document-pip'
    audioMiniPipWindow: null,
    // "What audio track is actually playing right now?" — distinct from
    // state.currentCollection/currentFile which track what the user is
    // VIEWING. These drift: you can play an audio track and then
    // navigate into a video collection, at which point
    // state.currentCollection becomes the video one and the audio
    // mini's prev/next lookups (which used to read state.currentCol)
    // found nothing because the audio track isn't in the new view's
    // episode list. audioNowPlaying is set by loadAudioTrack and
    // cleared by stopAudioPlayback, and is the single source of truth
    // for the mini and the <audio> ended handler.
    audioNowPlaying: null,  // { col, file } | null
    // Subtitle font-size multiplier — unit-less number that drives
    // the `--sub-scale` CSS variable. Default 1.0 = 1em; range
    // 0.5-3.0 enforced by applySubScale(). Replaces the older
    // `subSize: 'small'/'medium'/'large'` enum (still readable from
    // legacy localStorage values, see boot-time decoder).
    subScale: 1.0,
    /**
     * Tracks the currently-locked landscape side ('primary' |
     * 'secondary' | null) inside fullscreen, so the manual flip
     * button knows which side to toggle to. 1.7.43 replaced the
     * 1.7.42 deviceorientation-driven gravity-flip auto-listener
     * because HTTP origins (the DS124 LAN IP is not HTTPS) don't
     * receive deviceorientation events — Chrome/Safari gate sensor
     * APIs behind secure context. The manual button works on any
     * origin and gives the user explicit control instead of relying
     * on a sensor reading that may never fire.
     */
    flipSide: null,
    categories: {        // loaded at boot from /api/categories
      video: [{ id: 'series', label: '剧集' }, { id: 'movie', label: '电影' }, { id: 'other', label: '其他' }],
      audio: [{ id: 'audiobook', label: '有声书' }, { id: 'podcast', label: '播客' }, { id: 'album', label: '专辑' }, { id: 'other', label: '其他' }],
      image: [{ id: 'gallery', label: '图集' }, { id: 'comic', label: '漫画' }, { id: 'wallpaper', label: '壁纸' }, { id: 'other', label: '其他' }],
    },
  };

  const THEME_KEY = 'ds124:theme';
  const SPEED_KEY = 'ds124:speed';
  const LOOP_KEY     = 'ds124:loop';
  const LOOP_ALL_KEY = 'ds124:loop-all';
  const SHUFFLE_KEY  = 'ds124:shuffle';
  const SORT_KEY  = 'ds124:sort';
  const MINI_LAYOUT_KEY = 'ds124:miniLayout';
  const AUTO_MINI_KEY = 'ds124:autoMini';                 // legacy, migrated on first load
  const AUTO_VIDEO_MINI_KEY = 'ds124:autoVideoMini';
  const AUTO_AUDIO_MINI_KEY = 'ds124:autoAudioMini';
  const FILTER_TYPE_OP_KEY = 'ds124:filterTypeOp';
  const AUDIO_MINI_LAYOUT_KEY = 'ds124:audioMiniLayout';
  const AUDIO_MINI_MODE_KEY = 'ds124:audioMiniMode';
  const KIND_KEY = 'ds124:kind';
  const SUB_SIZE_KEY = 'ds124:subSize';
  const EP_SORT_PREFIX = 'ds124:epSort:';
  /**
   * @brief Per-collection manual subtitle picks.
   *
   * One localStorage entry per collection, value is JSON-encoded
   * `{ "<epFile>": "<subtitleRelativePath>" }`. Persists user-chosen
   * subtitles across page reloads on the same episode. Auto-attached
   * subtitles (matched by stem) are not stored here — they're
   * recomputed every time the episode loads from `ep.subtitles`.
   */
  const MANUAL_SUB_KEY_PREFIX = 'ds124:manualSub:';
  function getManualSubsFor(cid) {
    try {
      const raw = localStorage.getItem(MANUAL_SUB_KEY_PREFIX + cid);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return (parsed && typeof parsed === 'object') ? parsed : {};
    } catch (_e) { return {}; }
  }
  function setManualSubFor(cid, epFile, subFile) {
    const m = getManualSubsFor(cid);
    if (subFile) m[epFile] = subFile;
    else delete m[epFile];
    try {
      if (Object.keys(m).length === 0) {
        localStorage.removeItem(MANUAL_SUB_KEY_PREFIX + cid);
      } else {
        localStorage.setItem(MANUAL_SUB_KEY_PREFIX + cid, JSON.stringify(m));
      }
    } catch (_e) {}
  }

  // ── Per-collection episode sort preferences ──
  function getEpSortPref(collectionId) {
    try {
      const raw = localStorage.getItem(EP_SORT_PREFIX + collectionId);
      if (raw) {
        const o = JSON.parse(raw);
        return { field: o.field || 'default', asc: o.asc !== false };
      }
    } catch (_e) {}
    return { field: 'default', asc: true };
  }
  function setEpSortPref(collectionId, field, asc) {
    try { localStorage.setItem(EP_SORT_PREFIX + collectionId, JSON.stringify({ field, asc })); } catch (_e) {}
  }
  /**
   * @brief Re-sequence an ordered episode list so each chain is contiguous,
   *        ordered by its links (折叠链表 = a singly-linked list).
   * @details `follows` is a predecessor pointer: episode B with
   *          `follows === A` comes directly after A. The chain is a true
   *          linked list — each episode may be followed by at most ONE
   *          other (enforced when the pointer is set), so chains are linear:
   *          A ← B ← C renders as A B C. A "head" is an episode that does
   *          not follow any present episode; from each head we walk the
   *          successor links and emit the whole chain in link order,
   *          right where the head sits in the incoming order. Heads keep
   *          their relative position; the link order — NOT the incoming
   *          order — decides the sequence inside a chain, so dragging a
   *          chain member around can't scramble it.
   *
   *          Robustness: a pointer to a missing file (deleted head) makes
   *          the episode its own head; if bad data has two episodes
   *          following the same node, only the first claims the successor
   *          slot and the rest are appended at the end; a cycle is broken
   *          by a visited-guard. Input is not mutated.
   * @param eps Episodes in some already-decided display order.
   * @return A new array with chains glued in link order.
   */
  function applyChains(eps) {
    if (!Array.isArray(eps) || eps.length < 2) return eps;
    const byFile = new Map(eps.map((e) => [e.file, e]));
    // successor map: predecessor file -> the episode that follows it.
    const succ = new Map();
    const isTail = new Set();
    for (const e of eps) {
      if (e.follows && byFile.has(e.follows)) {
        isTail.add(e.file);
        if (!succ.has(e.follows)) succ.set(e.follows, e);   // first claimant wins
      }
    }
    if (!isTail.size) return eps;    // no chains configured — cheap exit
    const out = [];
    const emitted = new Set();
    for (const e of eps) {
      if (isTail.has(e.file) || emitted.has(e.file)) continue;  // not a head
      let cur = e;
      while (cur && !emitted.has(cur.file)) {                   // walk the links
        out.push(cur);
        emitted.add(cur.file);
        cur = succ.get(cur.file);
      }
    }
    // Append anything left over (orphaned by bad multi-follow data / cycles).
    for (const e of eps) if (!emitted.has(e.file)) out.push(e);
    return out;
  }

  function sortEpisodes(episodes, field, asc) {
    if (field === 'default') return applyChains(episodes);
    const cmp = (a, b) => {
      let va, vb;
      switch (field) {
        case 'filename':
          va = String(a.file || ''); vb = String(b.file || '');
          return va.localeCompare(vb, 'zh-CN', { numeric: true, sensitivity: 'base' });
        case 'title':
          va = String(a.title || ''); vb = String(b.title || '');
          return va.localeCompare(vb, 'zh-CN', { numeric: true, sensitivity: 'base' });
        case 'trackNumber':
          va = a.trackNumber != null ? a.trackNumber : Infinity;
          vb = b.trackNumber != null ? b.trackNumber : Infinity;
          return va - vb;
        case 'artist':
          va = String(a.artist || '\uffff'); vb = String(b.artist || '\uffff');
          return va.localeCompare(vb, 'zh-CN', { numeric: true, sensitivity: 'base' });
        case 'mtime':
          va = a.mtime || 0; vb = b.mtime || 0;
          return va - vb;
        default: return 0;
      }
    };
    const sorted = episodes.slice().sort(cmp);
    if (!asc) sorted.reverse();
    return applyChains(sorted);
  }
  // Sync sort bar UI to a preference object and show/hide it.
  function syncSortBar(selectEl, dirBtn, bar, pref, show) {
    if (!bar) return;
    bar.hidden = !show;
    if (!show) return;
    if (selectEl) selectEl.value = pref.field;
    if (dirBtn) dirBtn.textContent = pref.asc ? '↑' : '↓';
  }
  // Bind change handlers for a sort bar. Returns cleanup function.
  function bindSortBar(selectEl, dirBtn, collectionId, onSortChange) {
    function onSelect() {
      const pref = getEpSortPref(collectionId);
      pref.field = selectEl.value;
      setEpSortPref(collectionId, pref.field, pref.asc);
      if (dirBtn) dirBtn.textContent = pref.asc ? '↑' : '↓';
      onSortChange();
    }
    function onDir() {
      const pref = getEpSortPref(collectionId);
      pref.asc = !pref.asc;
      setEpSortPref(collectionId, pref.field, pref.asc);
      dirBtn.textContent = pref.asc ? '↑' : '↓';
      onSortChange();
    }
    selectEl.addEventListener('change', onSelect);
    dirBtn.addEventListener('click', onDir);
    return () => {
      selectEl.removeEventListener('change', onSelect);
      dirBtn.removeEventListener('click', onDir);
    };
  }

  try {
    const s = Number(localStorage.getItem(SPEED_KEY));
    if ([0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].indexOf(s) >= 0) state.playerSpeed = s;
    state.loopMode    = localStorage.getItem(LOOP_KEY) === '1';
    state.loopAllMode = localStorage.getItem(LOOP_ALL_KEY) === '1';
    state.shuffleMode = localStorage.getItem(SHUFFLE_KEY) === '1';
    const sk = localStorage.getItem(SORT_KEY);
    if (sk) state.filter.sort = sk;
    const sa = localStorage.getItem('ds124:sortAsc');
    if (sa !== null) state.filter.sortAsc = sa === '1';
    const ih = localStorage.getItem('ds124:includeHidden');
    if (ih !== null) state.filter.includeHidden = ih === '1';
    // Mini-player auto-toggles. The legacy single-key `ds124:autoMini`
    // controlled both video and audio. We migrate it once: if neither
    // new key is set but the legacy key is, copy its value to both, then
    // delete the legacy key so future writes don't drift.
    const avm = localStorage.getItem(AUTO_VIDEO_MINI_KEY);
    const aam = localStorage.getItem(AUTO_AUDIO_MINI_KEY);
    const legacy = localStorage.getItem(AUTO_MINI_KEY);
    if (avm == null && aam == null && legacy != null) {
      const v = legacy === '1';
      state.autoVideoMiniEnabled = v;
      state.autoAudioMiniEnabled = v;
      try {
        localStorage.setItem(AUTO_VIDEO_MINI_KEY, v ? '1' : '0');
        localStorage.setItem(AUTO_AUDIO_MINI_KEY, v ? '1' : '0');
        localStorage.removeItem(AUTO_MINI_KEY);
      } catch (_e) {}
    } else {
      if (avm != null) state.autoVideoMiniEnabled = avm === '1';
      if (aam != null) state.autoAudioMiniEnabled = aam === '1';
    }
    const amm = localStorage.getItem(AUDIO_MINI_MODE_KEY);
    if (amm === 'in-browser' || amm === 'document-pip') state.audioMiniMode = amm;
    const k = localStorage.getItem(KIND_KEY);
    if (k === 'video' || k === 'audio' || k === 'image' || k === 'novel') state.kind = k;
    // Subtitle scale — accept either the legacy string ('small' /
    // 'medium' / 'large') or the new numeric value. Coerce legacy
    // strings to a sensible point on the new continuous scale.
    const ss = localStorage.getItem(SUB_SIZE_KEY);
    if (ss === 'small') state.subScale = 0.75;
    else if (ss === 'medium') state.subScale = 1.0;
    else if (ss === 'large') state.subScale = 1.4;
    else if (ss != null) {
      const n = parseFloat(ss);
      if (isFinite(n) && n >= 0.4 && n <= 3.0) state.subScale = n;
    }
    const ftop = localStorage.getItem(FILTER_TYPE_OP_KEY);
    if (ftop === 'OR' || ftop === 'AND' || ftop === 'NOT' || ftop === 'ONLY') {
      state.filter.typeOp = ftop;
    } else if (ftop === 'NOR') {
      // Legacy: NOR was removed in 1.67. Migrate to OR (the safest default
      // — OR with the same chip set widens results, never hides them).
      state.filter.typeOp = 'OR';
      try { localStorage.setItem(FILTER_TYPE_OP_KEY, 'OR'); } catch (_e) {}
    }
  } catch (e) {}

  // Icon injection for static markup.
  injectIcons(document);

  // ==================================================================
  // Theme — multi-option dropdown driven by `<select id="theme-select">`
  // and per-theme palettes under `style/<id>.css`.
  //
  // Discovery: the `<option>` list inside `#theme-select` IS the source
  // of truth for which themes the app exposes. Adding a theme means
  // dropping `style/<id>.css`, adding a `<link>` for it in
  // `index.html`, adding the `<option value="<id>">` here, and adding
  // `header.theme.<id>` to every `language/<lang>.json`. Zero JS edits.
  // ==================================================================

  /**
   * @brief Enumerate the theme ids the page currently knows about.
   *
   * Returns the list directly from `#theme-select`'s option values,
   * so themes added at HTML-edit time are picked up automatically. If
   * the select hasn't mounted yet (extremely early boot) we fall back
   * to the canonical baseline pair so `applyTheme` validation can
   * still run.
   *
   * @returns {string[]} Ordered list of theme ids (e.g. ['dark','light','division']).
   */
  function getKnownThemes() {
    if (themeSelect) {
      return Array.from(themeSelect.options).map((o) => o.value);
    }
    return ['dark', 'light'];
  }

  /**
   * @brief Read the currently active theme id off `<html data-theme>`.
   *
   * If the attribute is missing, mistyped, or names a theme this
   * build doesn't ship, falls back to 'dark' so callers always
   * receive a known-good id.
   *
   * @returns {string} The validated active theme id.
   */
  function currentTheme() {
    const v = document.documentElement.getAttribute('data-theme');
    return getKnownThemes().includes(v) ? v : 'dark';
  }

  /**
   * @brief Activate a theme by id.
   *
   * Stamps `data-theme` on `<html>` (which switches every CSS
   * variable cascade since each `style/<id>.css` is keyed off that
   * attribute), persists the choice in localStorage, and syncs the
   * `<select>` so the visible value stays consistent with state.
   *
   * @param t Theme id; if unknown, silently coerced to 'dark'.
   */
  function applyTheme(t) {
    if (!getKnownThemes().includes(t)) t = 'dark';
    document.documentElement.setAttribute('data-theme', t);
    try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
    if (themeSelect && themeSelect.value !== t) themeSelect.value = t;
  }
  /**
   * @brief Read a theme's `--theme-name` CSS variable.
   *
   * Each `style/<id>.css` declares its own display name as a CSS
   * string variable inside the `:root[data-theme="<id>"]` block.
   * To read it for a theme that may not be the active one, we
   * temporarily swap the `data-theme` attribute on `<html>`,
   * sample the computed `--theme-name`, and restore the previous
   * attribute. The browser performs style recalc but no paint
   * during this synchronous swap, so the boot-time pass over all
   * themes is invisible to the user.
   *
   * CSS string values come back from `getPropertyValue` wrapped in
   * the original quote characters; we strip a single leading and
   * trailing `"` or `'`. If the variable is undeclared (theme file
   * forgot to set it), we fall back to the theme id verbatim so
   * the dropdown is never blank.
   *
   * @param themeId Theme id matching a `<option value>` and a
   *                `:root[data-theme="<id>"]` selector.
   * @returns The display name string, or themeId if undeclared.
   */
  function readThemeName(themeId) {
    const root = document.documentElement;
    const prev = root.getAttribute('data-theme');
    root.setAttribute('data-theme', themeId);
    const raw = getComputedStyle(root).getPropertyValue('--theme-name').trim();
    if (prev !== null) root.setAttribute('data-theme', prev);
    else root.removeAttribute('data-theme');
    const stripped = raw.replace(/^['"]|['"]$/g, '').trim();
    return stripped || themeId;
  }

  /**
   * @brief Populate every theme `<option>`'s text from its CSS
   *        `--theme-name` declaration.
   *
   * Theme names are owned by their CSS files (a single source of
   * truth, no `language/*.json` entry duplication). This function
   * reads each available theme's name once at boot and writes it
   * into the matching `<option>` so the dropdown always reflects
   * what the theme files declare. Theme name choice is locale-
   * independent — whatever you write in `--theme-name` shows up
   * the same in every UI language.
   */
  function syncThemeOptionLabels() {
    if (!themeSelect) return;
    for (const opt of themeSelect.options) {
      opt.textContent = readThemeName(opt.value);
    }
  }
  if (themeSelect) {
    themeSelect.addEventListener('change', () => {
      applyTheme(themeSelect.value);
    });
  }
  applyTheme(currentTheme());
  syncThemeOptionLabels();

  // ==================================================================
  // I18N — system text fully decoupled into per-locale JSON templates
  // under `language/<lang>.json`.
  //
  // Discovery: the `<option>` list inside `#lang-select` IS the source
  // of truth for which locales the app fetches. Adding a locale means
  // dropping `language/<id>.json`, adding the `<option value="<id>">`
  // (with the language's endonym as its label — "中文", not
  // "Chinese"), and rebuilding-or-not (no JS edits needed). The
  // dictionary is fetched at boot; UI initially renders with the HTML
  // baseline strings (the literal text inside each `data-i18n` element)
  // until the JSON arrives, then `applyI18n()` re-stamps every
  // tagged element with the localized value. Missing keys fall back
  // to the zh dictionary first, then to the raw key, so a half-
  // translated locale stays readable.
  //
  // DOM-side contract:
  //   - `data-i18n="key"`              → element.textContent
  //   - `data-i18n-title="key"`        → element.title
  //   - `data-i18n-placeholder="key"`  → input.placeholder
  //   - `data-i18n-aria-label="key"`   → element.aria-label
  //
  // Coverage status (1.7.2): full header + menu-popover + admin
  // categories search placeholder. Admin editors / dialogs / toasts /
  // detail / player views are rolled out incrementally in follow-up
  // patches.
  // ==================================================================

  /**
   * @brief In-memory dictionary cache, keyed by locale id.
   *
   * Populated by `loadI18nDicts()` on boot. Empty until the fetches
   * complete; `t()` falls through to the raw key during that window
   * (which is fine because the HTML carries the zh literal as the
   * baseline already, so users see Chinese, not raw keys).
   */
  const I18N_DICT = {};

  /**
   * @brief Storage key for the user's preferred locale.
   */
  const LANG_KEY = 'ds124:lang';

  /**
   * @brief Currently active locale id. Mutated by `applyLang()`.
   */
  let currentLang = 'zh';

  /**
   * @brief Enumerate locale ids advertised in the language `<select>`.
   *
   * Mirrors `getKnownThemes()` for the i18n side. Falls back to the
   * baseline triple if the select hasn't mounted yet.
   *
   * @returns {string[]} Ordered list of locale ids.
   */
  function getKnownLangs() {
    if (langSelect) {
      return Array.from(langSelect.options).map((o) => o.value);
    }
    return ['zh', 'zh-TW', 'en'];
  }

  /**
   * @brief Translate a key into the active locale's string, with
   *        optional `{placeholder}` interpolation.
   *
   * Lookup order: active locale → 'zh' baseline → raw key. The raw-
   * key fallback is intentional: it surfaces missing keys during
   * development as readable strings rather than hiding them as
   * empty text or undefined output.
   *
   * Placeholders are written `{name}` in the dictionary value and
   * substituted with `String(params[name])`. Unknown placeholders
   * are left as-is (so a typo'd key surfaces in the UI). Values
   * that don't include any `{...}` short-circuit the regex pass.
   *
   * @param key    Dotted i18n key (e.g. 'header.kind.video').
   * @param params Optional object of placeholder values. Omit for
   *               keys without placeholders.
   * @returns The translated string, baseline string, or raw key.
   *
   * @example t('admin.cat.added', { id: 'foo', where: '顶层' })
   *          // → "已添加 foo（作为 顶层 的标签，保存后生效）"
   */
  function t(key, params) {
    const langDict = I18N_DICT[currentLang] || {};
    let raw;
    if (Object.prototype.hasOwnProperty.call(langDict, key)) raw = langDict[key];
    else {
      const fallback = I18N_DICT.zh || {};
      raw = Object.prototype.hasOwnProperty.call(fallback, key) ? fallback[key] : key;
    }
    if (!params || raw.indexOf('{') === -1) return raw;
    return raw.replace(/\{(\w+)\}/g, (m, name) =>
      Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : m
    );
  }

  /**
   * @brief Stamp localized text onto every i18n-tagged node in a tree.
   *
   * Walks `[data-i18n]`, `[data-i18n-title]`, `[data-i18n-placeholder]`
   * and `[data-i18n-aria-label]` under the given root and writes the
   * looked-up string. Cheap on every lang switch (one O(N) pass over
   * tagged nodes only, not the whole DOM). Safe to call before the
   * dictionary loads — `t()`'s key fallback keeps output readable.
   *
   * @section FallbackPolicy Fallback policy — HTML baseline
   *   The first time this function visits a node, it caches whatever
   *   text/attribute value the HTML originally shipped with into a
   *   `data-i18n-*-fallback` dataset slot. On every subsequent
   *   localization pass (lang switch / dynamic insertion re-render),
   *   if the active locale's dictionary lacks the key, the cached
   *   HTML baseline is restored instead of a raw key or a forced
   *   zh fallback.
   *
   *   This makes dictionary entries OPTIONAL: writers can add a key
   *   to override the baseline in a specific locale, but skipping
   *   the entry leaves the HTML literal intact across every locale.
   *   Adding a new theme / locale therefore no longer forces N×M
   *   dictionary maintenance — you write the option's HTML text once
   *   in `index.html` and translate selectively, only where a locale
   *   needs a different reading.
   *
   *   `t()` (the non-DOM helper used inline in `_renderEditPanelHtml`,
   *   `setCatStatus`, etc.) keeps the older `active → zh → raw key`
   *   chain because callers there have no HTML baseline to fall back
   *   on, and surfacing missing keys as raw strings during dev is
   *   useful.
   *
   * @param root Optional subtree root; defaults to `document`. Pass a
   *             freshly-rendered subtree (e.g. just-set innerHTML) to
   *             localize dynamically inserted content.
   */
  function applyI18n(root) {
    const r = root || document;
    const dict = I18N_DICT[currentLang] || {};
    /**
     * @brief Resolve `key` against the active dict, fall back to the
     *        cached HTML baseline if missing.
     *
     * Caches the HTML baseline (current attribute / textContent on
     * the element) the first time we see that key on that element,
     * so subsequent lang switches still have something to fall back
     * to even after we've overwritten the live value.
     */
    const resolve = (el, key, fallbackDatasetKey, currentValue) => {
      if (el.dataset[fallbackDatasetKey] === undefined) {
        el.dataset[fallbackDatasetKey] = currentValue == null ? '' : String(currentValue);
      }
      return Object.prototype.hasOwnProperty.call(dict, key)
        ? dict[key]
        : el.dataset[fallbackDatasetKey];
    };
    for (const el of r.querySelectorAll('[data-i18n]')) {
      el.textContent = resolve(el, el.dataset.i18n, 'i18nFallback', el.textContent);
    }
    for (const el of r.querySelectorAll('[data-i18n-title]')) {
      el.setAttribute('title', resolve(el, el.dataset.i18nTitle, 'i18nTitleFallback', el.getAttribute('title')));
    }
    for (const el of r.querySelectorAll('[data-i18n-placeholder]')) {
      el.setAttribute('placeholder', resolve(el, el.dataset.i18nPlaceholder, 'i18nPlaceholderFallback', el.getAttribute('placeholder')));
    }
    for (const el of r.querySelectorAll('[data-i18n-aria-label]')) {
      el.setAttribute('aria-label', resolve(el, el.dataset.i18nAriaLabel, 'i18nAriaLabelFallback', el.getAttribute('aria-label')));
    }
  }

  /**
   * @brief Activate a locale.
   *
   * Persists the choice, mirrors it onto `<html lang>` (so screen
   * readers / browser tooling see the right language), syncs the
   * `<select>`'s value, and rewrites every i18n-tagged node.
   *
   * Handles unknown locale ids by silently coercing to 'zh'.
   *
   * @param lang Locale id (must match a `<option value>` in
   *             `#lang-select` — i.e. a known locale).
   */
  function applyLang(lang) {
    const known = getKnownLangs();
    if (!known.includes(lang)) lang = 'zh';
    currentLang = lang;
    try { localStorage.setItem(LANG_KEY, lang); } catch (_e) {}
    // BCP 47 conformance: zh → zh-CN, others use the id verbatim
    // (e.g. zh-TW is already valid; en is fine; ja, fr, etc. would
    // also pass through unchanged).
    const htmlLang = lang === 'zh' ? 'zh-CN' : lang;
    document.documentElement.setAttribute('lang', htmlLang);
    if (langSelect && langSelect.value !== lang) langSelect.value = lang;
    applyI18n();
  }

  /**
   * @brief Fetch every advertised locale's `language/<id>.json`.
   *
   * Runs in parallel; failed fetches (network error, missing file,
   * invalid JSON) leave that locale's slot in `I18N_DICT` empty so
   * `t()` falls back to zh / raw key for it. Calls `applyI18n()`
   * once at the end so the page transitions from baseline literals
   * to localized strings as soon as the dictionaries land.
   *
   * @returns Promise that resolves once all fetches have settled.
   */
  async function loadI18nDicts() {
    const langs = getKnownLangs();
    await Promise.all(langs.map(async (lang) => {
      try {
        const res = await fetch(`language/${encodeURIComponent(lang)}.json`, {
          credentials: 'same-origin',
          cache: 'default',
        });
        if (!res.ok) return;
        const data = await res.json();
        if (data && typeof data === 'object') {
          I18N_DICT[lang] = data;
        }
      } catch (_e) {
        // Swallow — t() handles missing locales gracefully.
      }
    }));
    applyI18n();
  }

  // Restore persisted locale before the dictionaries arrive so the
  // <select> shows the right value immediately. The actual text swap
  // waits for loadI18nDicts() to populate I18N_DICT.
  try {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && getKnownLangs().includes(stored)) currentLang = stored;
  } catch (_e) {}
  if (langSelect) {
    langSelect.value = currentLang;
    langSelect.addEventListener('change', () => applyLang(langSelect.value));
  }
  document.documentElement.setAttribute('lang', currentLang === 'zh' ? 'zh-CN' : currentLang);
  // Kick off the parallel dict fetch. Do NOT await here — boot must
  // proceed; applyI18n is called at the end of loadI18nDicts when the
  // promises settle.
  loadI18nDicts();

  /**
   * @brief Console / plugin entry point for runtime i18n hacks.
   *
   * Power users / future plugin scripts can append a locale in the
   * console without reloading:
   *
   *     window.DS124_I18N.dict.fr = { ... };
   *     window.DS124_I18N.setLang('fr');
   *
   * — assuming an `<option value="fr">` is added to `#lang-select`
   * first (or `getKnownLangs()` is monkey-patched).
   */
  window.DS124_I18N = {
    dict: I18N_DICT,
    t,
    applyI18n,
    setLang: applyLang,
    getLang: () => currentLang,
    reload: loadI18nDicts,
  };

  // ==================================================================
  // Subsystem switcher (video ⇄ audio)
  // ==================================================================
  const kindSwitch = document.getElementById('kind-switch');
  function applyKindUI() {
    if (!kindSwitch) return;
    // Drives the sliding pill via a CSS attribute selector.
    kindSwitch.setAttribute('data-active', state.kind);
    document.documentElement.setAttribute('data-kind', state.kind);
    // Update active label styling
    for (const btn of kindSwitch.querySelectorAll('[data-kind]')) {
      btn.classList.toggle('active', btn.dataset.kind === state.kind);
    }
    // Position the slider
    const activeBtn = kindSwitch.querySelector('[data-kind="' + state.kind + '"]');
    const slider = kindSwitch.querySelector('.kind-slider');
    if (activeBtn && slider) {
      slider.style.left = activeBtn.offsetLeft + 'px';
      slider.style.width = activeBtn.offsetWidth + 'px';
    }
    // Update filter chips for the active subsystem's type tags.
    //
    // Visibility rules per role:
    //   - guest  (not logged in)         → only non-hidden categories
    //   - user   (role 'user')           → non-hidden ∪ (hidden ∩ visibleCategories grant)
    //   - admin                          → everything, with a dot on hidden ones
    //
    // Hidden categories the user has no grant for are simply not rendered;
    // there is no "link直连" fallback any more.
    const chips = document.getElementById('filter-chips');
    if (chips) {
      let list = (state.categories && state.categories[state.kind]) || [];
      // 1.1.0+: home chip rail shows top-level (parentId == null) categories only.
      // Children surface in dialogs / detail pages / admin panel — selecting a
      // top-level chip implicitly matches every collection tagged with any of
      // its descendants (server-side expandUpward handles the matching).
      list = list.filter((c) => c.parentId == null);
      const role = state.user ? state.user.role : 'guest';
      if (role !== 'admin') {
        // Mirror the server's effectiveHiddenIds + expandGrant for visibility.
        // A top-level chip is hidden if c.hidden itself is true (note: a
        // visible top-level whose only children are hidden is still rendered,
        // since clicking it surfaces non-hidden grandchildren etc.).
        const vc = state.user && state.user.visibleCategories;
        const grantArr = (vc && Array.isArray(vc[state.kind])) ? vc[state.kind] : [];
        const grant = clientExpandGrant(state.kind, grantArr);
        list = list.filter((c) => {
          if (!c.hidden) return true;
          if (role === 'guest') return false;
          return grant.has(c.id);
        });
      }
      const inner = ['<button type="button" data-type="all">全部</button>']
        .concat(list.map((c) => {
          const hint = c.hidden ? ' · 隐藏' : '';
          return `<button type="button" data-type="${escapeHtml(c.id)}" title="${escapeHtml(c.label + hint)}">${escapeHtml(c.label)}${c.hidden ? '<span class="chip-hidden-dot" aria-hidden="true"></span>' : ''}</button>`;
        })).join('');
      chips.innerHTML = inner;
      // Multi-select active state. "全部" chip is active when no
      // category is selected; otherwise each chip mirrors whether its
      // id is in the selected Set.
      const selected = state.filter.types;
      for (const btn of chips.querySelectorAll('button')) {
        const t = btn.dataset.type;
        const on = (t === 'all') ? selected.size === 0 : selected.has(t);
        btn.classList.toggle('active', on);
      }
      // Sub-chip stack — three rows for three category levels, all
      // automatic (no manual toggles since 1.2.8).
      //   Row 1 = #filter-chips (top-level, always above)
      //   Row 2 = depth-1 children of any selected cat's top-level ancestor
      //   Row 3 = depth-2 children of any selected cat's depth-1 ancestor
      //
      // Auto-expand rule:
      //   - row 2 shows iff a top-level ancestor in the selection's path
      //     has visible depth-1 children (i.e. "the picked tag has subtags")
      //   - row 3 shows iff a depth-1 ancestor in the selection's path has
      //     visible depth-2 children (i.e. "the picked subtag has grand-subtags")
      //
      // Selection vs auto-expand decoupling:
      //   1.2.7 had sub-chip click "kill the parent and add the child"
      //   (path-aware replace), which conflicted with auto-expand because
      //   killing the parent removed the visual cue that "we're inside
      //   this branch." Since 1.2.8, sub-chip click follows the SAME
      //   op-aware rules as top-chip click (toggle add/remove for
      //   OR/AND/NOT, replace-all for ONLY). Auto-expand is then driven
      //   purely by reveal-path, independent of selection cardinality.
      //
      // Layout: full-width container #filter-substack docked at the
      // bottom of the .home-toolbar flex row (`flex: 1 0 100%; order: 99`
      // pushes it to its own line below all toolbar controls).
      const fullCats = (state.categories && state.categories[state.kind]) || [];
      const grantArrSub = (state.user && state.user.visibleCategories && Array.isArray(state.user.visibleCategories[state.kind]))
        ? state.user.visibleCategories[state.kind] : [];
      const grantSub = clientExpandGrant(state.kind, grantArrSub);
      const cmp = (a, b) => ((a.order || 0) - (b.order || 0)) || a.label.localeCompare(b.label, 'zh-CN');

      // Build N reveal sets — one per nestable depth (1.3.0: depths 1..4
      // since MAX_DEPTH=5 means top + 4 nested levels). For each selected
      // cat, walk its ancestor chain root-first and bucket the ancestor
      // at each depth into the corresponding reveal set. Each row N's
      // contents = visibleChildren of the cats in revealLevels[N-1].
      const REVEAL_LEVELS = 4; // rows 2..5 (depth-1 .. depth-4 children)
      const revealLevels = Array.from({ length: REVEAL_LEVELS }, () => new Set());
      for (const id of state.filter.types) {
        const path = [];
        let cur = fullCats.find((c) => c.id === id);
        let guard = 0;
        while (cur && guard < 12) {
          path.unshift(cur);
          if (!cur.parentId) break;
          cur = fullCats.find((c) => c.id === cur.parentId);
          guard++;
        }
        for (let i = 0; i < REVEAL_LEVELS; i++) {
          if (path[i]) revealLevels[i].add(path[i].id);
        }
      }

      function visibleChildren(parentId) {
        return fullCats
          .filter((c) => c.parentId === parentId)
          .filter((c) => !(c.hidden && role !== 'admin' && !grantSub.has(c.id)))
          .sort(cmp);
      }

      function chipBtn(c, depth) {
        const isActive = state.filter.types.has(c.id);
        const hint = c.hidden ? ' · 隐藏' : '';
        return `<button type="button" class="${isActive ? 'active' : ''}" data-type="${escapeHtml(c.id)}" data-parent="${escapeHtml(c.parentId)}" data-depth="${depth}" title="${escapeHtml(c.label + hint)}">${escapeHtml(c.label)}${c.hidden ? '<span class="chip-hidden-dot" aria-hidden="true"></span>' : ''}</button>`;
      }
      function depthRow(cats, depth) {
        return `<div class="filter-sub-row" data-depth="${depth}">${cats.map((c) => chipBtn(c, depth)).join('')}</div>`;
      }

      const parts = [];
      for (let i = 0; i < REVEAL_LEVELS; i++) {
        const cats = [];
        for (const pid of revealLevels[i]) cats.push(...visibleChildren(pid));
        if (cats.length) parts.push(depthRow(cats, i + 1));
      }

      let stack = document.getElementById('filter-substack');
      if (!stack) {
        stack = document.createElement('div');
        stack.id = 'filter-substack';
        stack.className = 'filter-substack';
        chips.parentElement.appendChild(stack);
      }
      stack.innerHTML = parts.join('');
      stack.hidden = parts.length === 0;

      // Active-tag pinned bar — sits ABOVE the chip strip via CSS
      // `flex: 1 0 100%; order: -1`. Lists each selected cat as a
      // chip-with-× showing its full path label (root / ... / leaf).
      // Click × to remove that single tag from the selection. Empty
      // selection hides the bar entirely.
      let activeBar = document.getElementById('filter-active-tags');
      if (!activeBar) {
        activeBar = document.createElement('div');
        activeBar.id = 'filter-active-tags';
        activeBar.className = 'filter-active-tags';
        chips.parentElement.insertBefore(activeBar, chips);
        activeBar.addEventListener('click', (e) => {
          const x = e.target.closest('button[data-clear-type]');
          if (!x) return;
          state.filter.types.delete(x.dataset.clearType);
          syncFilterOpUI();
          applyKindUI();
          reloadHome();
        });
      }
      if (state.filter.types.size > 0) {
        activeBar.innerHTML = Array.from(state.filter.types).map((id) => {
          const label = clientPathLabel(state.kind, id) || id;
          return `<span class="active-tag-chip"><span class="active-tag-label">${escapeHtml(label)}</span><button type="button" class="active-tag-x" data-clear-type="${escapeHtml(id)}" aria-label="移除">×</button></span>`;
        }).join('');
        activeBar.hidden = false;
      } else {
        activeBar.innerHTML = '';
        activeBar.hidden = true;
      }

      // Drop any leftover DOM from earlier 1.2.x versions so they don't
      // double-render after upgrade.
      const stale = document.getElementById('filter-sub-chips');
      if (stale) stale.remove();
      const staleToggle = chips.parentElement.querySelector('.filter-chips-toggle');
      if (staleToggle) staleToggle.remove();
      const staleSubToggles = stack.querySelectorAll('.filter-substack-toggle');
      staleSubToggles.forEach((t) => t.remove());
    }
    // Swap the search placeholder.
    const search = document.getElementById('search-input');
    if (search) search.placeholder = state.kind === 'audio' ? '搜索合集标题...' : '搜索合集标题...';
    // Swap the home-page "继续" row label between watching and listening
    // so the audio view doesn't say 观看 (watch).
    const contLabel = document.getElementById('home-continue-label');
    if (contLabel) {
      contLabel.textContent = state.kind === 'audio' ? '// CONTINUE LISTENING'
        : state.kind === 'image' ? '// CONTINUE VIEWING'
        : state.kind === 'novel' ? '// CONTINUE READING'
        : '// CONTINUE WATCHING';
    }
    // Audio-only: home-page upload button.
    const aub = document.getElementById('home-audio-upload-btn');
    if (aub) aub.hidden = state.kind !== 'audio';
  }
  function setKind(k) {
    if (k !== 'video' && k !== 'audio' && k !== 'image' && k !== 'novel') return;
    if (state.kind === k) return;
    // Hard-stop any currently-playing media when switching BETWEEN video
    // and audio. Switching to/from image / novel mode should NOT stop
    // playback — users should be able to browse images / read books
    // while listening to audio (or watching video, less commonly).
    const wasMedia = state.kind === 'video' || state.kind === 'audio';
    const toMedia  = k === 'video' || k === 'audio';
    if (wasMedia && toMedia) {
      try { stopAllMedia(); } catch (e) {}
    }
    // Pre-warm Plyr on first switch into video/audio so the first play
    // doesn't pay the ~50KB-gzipped JS download. No-op after first hit.
    if (toMedia) loadPlyrAssets().catch(() => {});
    // Fade cards out for a smoother feel, let the pill animation play.
    if (cardsEl) cardsEl.classList.add('cards-fading');
    setTimeout(() => {
      state.kind = k;
      state.filter.types = new Set();
      state.filter.fav = false;
      state.filter.q = '';
      state.favorites = new Set();
      try { localStorage.setItem(KIND_KEY, k); } catch (e) {}
      applyKindUI();
      if (state.user) { loadFavorites().catch(() => {}); loadTrackLikes().catch(() => {}); loadImageLikes().catch(() => {}); }
      // Route to home of the new subsystem.
      navigate('#/');
      // Fade back in after the new cards have rendered.
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (cardsEl) cardsEl.classList.remove('cards-fading');
        }, 50);
      });
    }, 180);
  }
  if (kindSwitch) {
    for (const btn of kindSwitch.querySelectorAll('[data-kind]')) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        setKind(btn.dataset.kind);
      });
    }
  }
  applyKindUI();

  // ==================================================================
  // Toast + confirm
  // ==================================================================
  function toast(msg, type, duration) {
    const el = document.createElement('div');
    el.className = 'toast toast-' + (type || 'info');
    el.textContent = msg;
    toastContainer.appendChild(el);
    setTimeout(() => el.classList.add('fade-out'), (duration || 2600) - 300);
    setTimeout(() => el.remove(), duration || 2600);
  }
  function confirmBox(message, title) {
    return new Promise((resolve) => {
      confirmTitleEl.textContent = '// ' + (title || 'CONFIRM');
      confirmMessageEl.textContent = message || '确认此操作？';
      confirmDialogEl.showModal();
      const onOk = () => { cleanup(); resolve(true); };
      const onCancel = () => { cleanup(); resolve(false); };
      function cleanup() {
        confirmOkBtn.removeEventListener('click', onOk);
        confirmCancelBtn.removeEventListener('click', onCancel);
        confirmDialogEl.close();
      }
      confirmOkBtn.addEventListener('click', onOk);
      confirmCancelBtn.addEventListener('click', onCancel);
    });
  }

  // ==================================================================
  // API — subsystem-aware. Collection/progress/history/comments/favorites
  // URLs are automatically prefixed with "/audio" when state.kind === 'audio'.
  // Global paths (auth/admin/health) stay untouched.
  // ==================================================================
  const SHARED_PREFIXES = ['/api/auth', '/api/admin', '/api/health', '/api/categories', '/api/search', '/api/authors'];
  function subUrl(p) {
    // Video uses the legacy unprefixed routes (/api/...). Every other
    // kind (audio / image / novel / future) lives at /<kind>/api/...
    if (state.kind === 'video') return p;
    if (typeof p !== 'string') return p;
    for (const sp of SHARED_PREFIXES) if (p.startsWith(sp)) return p;
    if (p.startsWith('/api/')) return '/' + state.kind + p;
    return p;
  }
  async function api(method, path, body) {
    const opts = { method, credentials: 'same-origin', headers: {} };
    if (body != null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    const url = subUrl(path);
    const res = await fetch(url, opts);
    if (res.status === 204) return null;
    let data = null;
    try { data = await res.json(); } catch (e) { data = {}; }
    if (!res.ok) {
      const err = new Error(data.error || `HTTP ${res.status}`);
      err.status = res.status;
      err.data = data;
      throw err;
    }
    return data;
  }

  // ==================================================================
  // Auth
  // ==================================================================
  async function loadAuthStatus() {
    try {
      const s = await api('GET', '/api/auth/status');
      state.user = s.user || null;
      state.needsFirstUser = !!s.needsFirstUser;
    } catch (e) {
      state.user = null;
    }
    updateHeaderAuth();
    if (state.user) { await loadFavorites(); await loadTrackLikes(); await loadImageLikes(); }
    else { state.favorites = new Set(); state.trackLikes = []; state.imageLikes = []; }
  }
  function updateHeaderAuth() {
    if (state.user) {
      loginBtn.hidden = true;
      userPill.hidden = false;
      userName.textContent = state.user.username;
      headerHistoryBtn.hidden = false;
      if (!headerHistoryBtn.querySelector('svg')) injectIcons(headerHistoryBtn);
    } else {
      loginBtn.hidden = false;
      userPill.hidden = true;
      headerHistoryBtn.hidden = true;
      state.filter.fav = false;
      if (favToggleIn) favToggleIn.checked = false;
    }
    // Menu items visibility.
    menuPopover.querySelector('[data-menu-action="admin"]').hidden = !(state.user && state.user.role === 'admin');
    menuPopover.querySelector('[data-menu-action="password"]').hidden = !state.user;
    menuPopover.querySelector('[data-menu-action="logout"]').hidden = !state.user;
    // Admin-only UI elements throughout the app — gate by a data attribute
    // on <html> so CSS can show/hide `.admin-only` sections globally.
    const isAdmin = !!(state.user && state.user.role === 'admin');
    const root = document.documentElement;
    root.setAttribute('data-role', isAdmin ? 'admin' : (state.user ? 'user' : 'guest'));
    // Granular permission flags. Admin always has all four; user has
    // whatever admin granted via /api/admin/users/:u/permissions; guest
    // has none. CSS pairs each flag with `.perm-<name>` to show/hide the
    // matching action button (see style.css).
    const perms = (state.user && state.user.permissions) || {};
    for (const key of ['upload', 'create', 'modify', 'delete']) {
      const granted = isAdmin || !!perms[key];
      if (granted) root.setAttribute('data-perm-' + key, '1');
      else root.removeAttribute('data-perm-' + key);
    }
    if (headerCreateBtn) headerCreateBtn.hidden = !(isAdmin || perms.create);
    // Filter-chip visibility depends on role + whitelist, so repaint after
    // any auth change (login, logout, whitelist update).
    try { applyKindUI(); } catch (_e) {}
  }
  function isAdmin() {
    return !!(state.user && state.user.role === 'admin');
  }
  // Returns true if the current user is admin OR has the named granular
  // permission. Use this everywhere we used to check isAdmin() for an
  // action that is now delegatable.
  function canPerm(name) {
    if (!state.user) return false;
    if (state.user.role === 'admin') return true;
    return !!(state.user.permissions && state.user.permissions[name]);
  }
  headerHistoryBtn.addEventListener('click', () => navigate('#/history'));
  if (headerCreateBtn) headerCreateBtn.addEventListener('click', () => openCreateDialog());
  if (headerSearchBtn) headerSearchBtn.addEventListener('click', () => navigate('#/search'));
  const homeAdvancedSearchBtn = document.getElementById('home-advanced-search');
  if (homeAdvancedSearchBtn) {
    homeAdvancedSearchBtn.addEventListener('click', () => {
      // Carry the home toolbar's current query into the standalone page.
      const q = (state.filter && state.filter.q) ? state.filter.q : '';
      const params = q ? '?q=' + encodeURIComponent(q) + '&fields=title&kind=' + state.kind : '';
      navigate('#/search' + params);
    });
  }

  async function doLogin(username, password) {
    const { user } = await api('POST', '/api/auth/login', { username, password });
    state.user = user;
    state.needsFirstUser = false;
    updateHeaderAuth();
    await loadFavorites();
    return user;
  }
  async function doRegister(username, password) {
    const { user } = await api('POST', '/api/auth/register', { username, password });
    state.user = user;
    state.needsFirstUser = false;
    updateHeaderAuth();
    await loadFavorites();
    return user;
  }
  async function doLogout() {
    try { await api('POST', '/api/auth/logout'); } catch (e) {}
    state.user = null;
    state.progressAll = {};
    state.favorites = new Set();
    closeMiniPlayer();
    stopPlayer();
    updateHeaderAuth();
    navigate('#/');
  }
  loginBtn.addEventListener('click', () => navigate('#/login'));

  async function loadFavorites() {
    if (!state.user) { state.favorites = new Set(); return; }
    try {
      const { favorites } = await api('GET', '/api/favorites');
      state.favorites = new Set(favorites || []);
    } catch (e) { state.favorites = new Set(); }
  }

  // ── Track-level likes (audio mode) ──
  // Stored as array of { collectionId, file } in state.trackLikes.
  state.trackLikes = [];
  async function loadTrackLikes() {
    if (!state.user || state.kind !== 'audio') { state.trackLikes = []; return; }
    try {
      const res = await fetch('/audio/api/track-likes', { credentials: 'same-origin' });
      if (res.ok) {
        const data = await res.json();
        state.trackLikes = data.likes || [];
      } else {
        state.trackLikes = [];
      }
    } catch (e) { state.trackLikes = []; }
  }
  function isTrackLiked(collectionId, file) {
    return state.trackLikes.some((t) => t.collectionId === collectionId && t.file === file);
  }
  async function toggleTrackLike(collectionId, file) {
    const liked = isTrackLiked(collectionId, file);
    try {
      await fetch('/audio/api/track-likes', {
        method: liked ? 'DELETE' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, file }),
      });
      if (liked) {
        state.trackLikes = state.trackLikes.filter(
          (t) => !(t.collectionId === collectionId && t.file === file)
        );
      } else {
        state.trackLikes.push({ collectionId, file });
      }
    } catch (e) { toast('操作失败', 'error'); }
  }
  async function batchToggleLikes(collectionId, files, add) {
    try {
      await fetch('/audio/api/track-likes/batch', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId, files, action: add ? 'add' : 'remove' }),
      });
      if (add) {
        for (const f of files) {
          if (!isTrackLiked(collectionId, f)) state.trackLikes.push({ collectionId, file: f });
        }
      } else {
        const fileSet = new Set(files);
        state.trackLikes = state.trackLikes.filter(
          (t) => !(t.collectionId === collectionId && fileSet.has(t.file))
        );
      }
    } catch (e) { toast('操作失败', 'error'); }
  }

  // ==================================================================
  // Settings / menu popover
  // ==================================================================
  function syncAutoMiniToggle() {
    const v = document.getElementById('auto-video-mini-toggle');
    if (v) {
      v.classList.toggle('on', !!state.autoVideoMiniEnabled);
      const it = v.closest('.menu-item-toggle');
      if (it) it.setAttribute('aria-pressed', String(!!state.autoVideoMiniEnabled));
    }
    const a = document.getElementById('auto-audio-mini-toggle');
    if (a) {
      a.classList.toggle('on', !!state.autoAudioMiniEnabled);
      const it = a.closest('.menu-item-toggle');
      if (it) it.setAttribute('aria-pressed', String(!!state.autoAudioMiniEnabled));
    }
  }
  function toggleMenu(force) {
    const want = typeof force === 'boolean' ? force : menuPopover.hidden;
    menuPopover.hidden = !want;
    menuBtn.setAttribute('aria-expanded', String(want));
    if (want) {
      syncAutoMiniToggle();
      const rect = menuBtn.getBoundingClientRect();
      menuPopover.style.top = (rect.bottom + 6) + 'px';
      menuPopover.style.right = (window.innerWidth - rect.right) + 'px';
    }
  }
  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });
  document.addEventListener('click', (e) => {
    if (!menuPopover.hidden && !menuPopover.contains(e.target) && e.target !== menuBtn) {
      toggleMenu(false);
    }
    if (!epMenu.hidden && !epMenu.contains(e.target) && !e.target.closest('.ep-submenu-btn')) {
      epMenu.hidden = true;
    }
  });
  menuPopover.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-menu-action]');
    if (!btn) return;
    const action = btn.dataset.menuAction;
    // Toggle items keep the menu open so the user sees the state change.
    if (action === 'toggle-auto-video-mini') {
      state.autoVideoMiniEnabled = !state.autoVideoMiniEnabled;
      try { localStorage.setItem(AUTO_VIDEO_MINI_KEY, state.autoVideoMiniEnabled ? '1' : '0'); } catch (err) {}
      syncAutoMiniToggle();
      toast('视频自动小窗: ' + (state.autoVideoMiniEnabled ? '开' : '关'));
      return;
    }
    if (action === 'toggle-auto-audio-mini') {
      state.autoAudioMiniEnabled = !state.autoAudioMiniEnabled;
      try { localStorage.setItem(AUTO_AUDIO_MINI_KEY, state.autoAudioMiniEnabled ? '1' : '0'); } catch (err) {}
      syncAutoMiniToggle();
      toast('音频自动小窗: ' + (state.autoAudioMiniEnabled ? '开' : '关'));
      return;
    }
    if (action === 'cycle-sub-size') {
      // Coarse 8-stop cycle, mirrored against the same `--sub-scale`
      // CSS variable the slider drives. The slider in the "+ 字幕"
      // dialog gives continuous control; this cycle is a quick-flip
      // for users who don't want to open the dialog.
      // 1.10.1: max stop raised 2.0x → 3.0x per user feedback that
      // 2.0x was still too small on TV-box-distance viewing.
      const stops = [0.6, 0.8, 1.0, 1.4, 2.0, 2.4, 2.7, 3.0];
      const cur = Number(state.subScale) || 1;
      // Pick the next stop strictly larger than current; wrap to the
      // smallest stop after the largest. Tolerance avoids picking the
      // same stop twice when current sits exactly on one.
      const next = stops.find((s) => s > cur + 0.01);
      state.subScale = next != null ? next : stops[0];
      applySubScale();
      toast('字幕字号: ' + subScaleLabel());
      return;
    }
    if (action === 'cycle-audio-mini-mode') {
      // Toggle between the in-browser floating card and the Chrome
      // Document PiP window. If PiP isn't supported on this browser,
      // force back to in-browser and toast so the user knows.
      if (state.audioMiniMode === 'in-browser') {
        if (!documentPipSupported()) {
          toast('当前浏览器不支持全局悬浮（需要 Chrome/Edge 116+）', 'error');
          return;
        }
        state.audioMiniMode = 'document-pip';
      } else {
        // Switching back from PiP → close the PiP window if it's open.
        closeAudioMiniPip();
        state.audioMiniMode = 'in-browser';
      }
      try { localStorage.setItem(AUDIO_MINI_MODE_KEY, state.audioMiniMode); } catch (err) {}
      syncAudioMiniModeLabel();
      toast('音频悬浮模式: ' + audioMiniModeLabel());
      // If the mini is already showing, re-apply the mode now.
      if (state.audioMiniVisible) {
        if (state.audioMiniMode === 'document-pip') {
          openAudioMiniInPip().catch(() => {});
        } else {
          closeAudioMiniPip();
        }
      }
      return;
    }
    toggleMenu(false);
    if (action === 'history') navigate('#/history');
    else if (action === 'admin') navigate('#/admin');
    else if (action === 'password') openPasswdDialog();
    else if (action === 'logout') doLogout();
  });
  /**
   * @brief Format a numeric subtitle scale as a human label like
   *        "1.0x" / "0.7x". Used by the menu cycle's toast and the
   *        slider's <output> readout.
   */
  function subScaleLabel() {
    const n = Number(state.subScale) || 1;
    return n.toFixed(1) + 'x';
  }

  /**
   * @brief Push the active subtitle scale to the rest of the system.
   *
   * - Writes the unit-less multiplier to the `--sub-scale` CSS
   *   custom property on `<html>`. Both `<video>::cue` and
   *   `.plyr__caption` consume the variable, so the change reflects
   *   in both subtitle render paths immediately.
   * - Persists to localStorage so the choice survives reloads.
   * - Updates the legacy menu-popover `<span id="sub-size-label">`
   *   so the cycle button shows the current value as a chip.
   * - Mirrors the value into the slider in the "+ 字幕" dialog if
   *   it's already mounted (lets cycle / slider stay in sync).
   */
  function applySubScale() {
    const n = Number(state.subScale);
    // 1.10.1: ceiling raised 2.5 → 3.0 so the cycle's new 2.4 / 2.7 / 3.0
    // stops and any localStorage write from that cycle aren't clamped back.
    const clamped = isFinite(n) ? Math.max(0.5, Math.min(3.0, n)) : 1;
    state.subScale = clamped;
    document.documentElement.style.setProperty('--sub-scale', String(clamped));
    try { localStorage.setItem(SUB_SIZE_KEY, String(clamped)); } catch (_e) {}
    const lab = document.getElementById('sub-size-label');
    if (lab) lab.textContent = subScaleLabel();
    const slider = document.getElementById('manual-subtitle-scale');
    const out = document.getElementById('manual-subtitle-scale-out');
    if (slider) slider.value = String(clamped);
    if (out) out.textContent = subScaleLabel();
  }
  applySubScale();

  // ==================================================================
  // Router
  // ==================================================================
  function parseHash() {
    const h = location.hash || '#/';
    // Split off any query string so the path regex stays clean.
    // Hash URLs can carry a ?key=val tail, e.g.
    //   #/c/:id/play/:file?scope=Season%201
    // The query doesn't go through window.location.search — it's all
    // part of location.hash — so we parse it ourselves.
    const qIdx = h.indexOf('?');
    const pathPart = qIdx >= 0 ? h.slice(0, qIdx) : h;
    const queryStr = qIdx >= 0 ? h.slice(qIdx + 1) : '';
    const params = {};
    if (queryStr) {
      for (const pair of queryStr.split('&')) {
        const eq = pair.indexOf('=');
        const k = eq >= 0 ? pair.slice(0, eq) : pair;
        const v = eq >= 0 ? pair.slice(eq + 1) : '';
        if (k) {
          try { params[decodeURIComponent(k)] = decodeURIComponent(v); }
          catch (_e) { params[k] = v; }
        }
      }
    }
    let m;
    if ((m = pathPart.match(/^#\/c\/([^/]+)\/play\/(.+)$/))) {
      return {
        view: 'player',
        id: decodeURIComponent(m[1]),
        file: decodeURIComponent(m[2]),
        scope: 'scope' in params ? params.scope : null,
      };
    }
    if ((m = pathPart.match(/^#\/c\/([^/]+)\/gallery$/))) {
      return { view: 'gallery', id: decodeURIComponent(m[1]) };
    }
    if ((m = pathPart.match(/^#\/c\/(.+)$/))) {
      return { view: 'detail', id: decodeURIComponent(m[1]) };
    }
    if (pathPart === '#/login')   return { view: 'login' };
    if (pathPart === '#/history') return { view: 'history' };
    if (pathPart === '#/admin')   return { view: 'admin' };
    if (pathPart === '#/search')  return {
      view: 'search',
      q: 'q' in params ? params.q : '',
      fields: 'fields' in params ? params.fields : '',
      searchKind: 'kind' in params ? params.kind : '',
      hidden: 'hidden' in params ? params.hidden : '',
    };
    return { view: 'home' };
  }
  function navigate(hash) {
    if (location.hash === hash) handleRoute();
    else location.hash = hash;
  }
  async function handleRoute() {
    const r = parseHash();
    // Specified-play scope is a per-navigation state. Entering the
    // player view reads it from the URL (r.scope); navigating to any
    // other view clears it so the next player navigation starts clean.
    // Doing this BEFORE the view dispatch means every await below
    // operates with the correct scope already in state.
    state.specifiedPlayScope = (r.view === 'player') ? (r.scope != null ? r.scope : null) : null;
    // Leaving the playback screen discards the session play queue, so the
    // manual order lives only "for this play". The one exception: audio
    // that keeps playing in the background mini-player — its queue must
    // survive so auto-advance keeps honoring the user's order. Video has
    // no background mode, so exiting its player always clears.
    if (r.view !== 'player' && state.playQueue) {
      const ap = state.audioNowPlaying;
      const bgAudioSameCol = ap && ap.col && ap.col.id === state.playQueue.colId;
      if (!bgAudioSameCol) state.playQueue = null;
    }
    try {
      if (r.view === 'login')    await showLogin();
      else if (r.view === 'home')    await showHome();
      else if (r.view === 'detail')  await showDetail(r.id);
      else if (r.view === 'gallery') await showGalleryView(r.id, null);
      else if (r.view === 'player') {
        // If audio is actively playing and the target matches the audio collection,
        // route to the audio player regardless of state.kind (which may be 'video').
        const np = state.audioNowPlaying;
        const isAudioTrack = np && np.col && np.col.id === r.id;
        if (state.kind === 'image') await showGalleryView(r.id, r.file);
        else if (state.kind === 'audio' || isAudioTrack) await showAudioPlayer(r.id, r.file);
        else if (state.kind === 'novel') await showNovelReader(r.id, r.file);
        else await showPlayer(r.id, r.file);
      }
      else if (r.view === 'history') await showHistory();
      else if (r.view === 'admin')   await showAdmin();
      else if (r.view === 'search')  await showSearchPage(r.q, r.fields, r.searchKind, r.hidden);
    } catch (e) {
      console.error('route error', e);
      toast('导航失败: ' + e.message, 'error');
    }
  }
  window.addEventListener('hashchange', handleRoute);

  // Auto-scroll the document during drag operations. Native HTML5 drag
  // doesn't auto-scroll the viewport, which makes long admin category
  // lists impossible to reorganize when source and target are on
  // different screens. Listen for dragover; if the cursor is within
  // EDGE_PX of the top/bottom edge, scrollBy a step proportional to
  // depth into the edge (smoother than fixed step). Inert when no
  // drag is happening (the event simply doesn't fire).
  (function installDragAutoScroll() {
    const EDGE_PX = 60;
    const MAX_STEP = 22;
    function onDragOver(e) {
      const y = e.clientY;
      const h = window.innerHeight;
      let dy = 0;
      if (y < EDGE_PX) {
        dy = -Math.ceil(MAX_STEP * (1 - y / EDGE_PX));
      } else if (y > h - EDGE_PX) {
        dy = Math.ceil(MAX_STEP * (1 - (h - y) / EDGE_PX));
      }
      if (dy !== 0) window.scrollBy(0, dy);
    }
    window.addEventListener('dragover', onDragOver, { passive: true });
  })();

  // ==================================================================
  // View management
  // ==================================================================
  function hideAllViews() {
    viewLogin.hidden = true;
    viewHome.hidden = true;
    viewDetail.hidden = true;
    viewPlayer.hidden = true;
    if (viewAudioPlayer) viewAudioPlayer.hidden = true;
    if (viewGallery) {
      viewGallery.hidden = true;
      // Tear down bulk-delete mode so re-entering the gallery doesn't
      // leak a stale checkbox overlay or selected-state from the
      // previous collection.
      if (galleryBulk && galleryBulk.mode) {
        try { exitGalleryBulkMode(); } catch (_e) {}
      }
    }
    if (galleryLightbox) galleryLightbox.hidden = true;
    viewHistory.hidden = true;
    viewAdmin.hidden = true;
    const viewSearch = document.getElementById('view-search');
    if (viewSearch) viewSearch.hidden = true;
    const viewNovelReader = document.getElementById('view-novel-reader');
    if (viewNovelReader) viewNovelReader.hidden = true;
    if (typeof novelReaderTeardown === 'function') {
      try { novelReaderTeardown(); } catch (e) {}
      novelReaderTeardown = null;
    }
    // Close any mobile audio overlays on view change so they don't
    // linger over an unrelated page (e.g. navigating to home from the
    // audio view while the lyric or queue sheet was open).
    const lyricMask = document.getElementById('amst-lyric-mask');
    const lyricClose = document.getElementById('amst-lyric-close');
    const queueMask = document.getElementById('amst-queue-mask');
    const sb = document.getElementById('audio-sidebar');
    if (lyricMask) lyricMask.hidden = true;
    if (lyricClose) lyricClose.hidden = true;
    if (queueMask) queueMask.hidden = true;
    if (audioLyricPanel) audioLyricPanel.classList.remove('amst-lyric-active');
    if (sb) sb.classList.remove('amst-sheet-active');
    exitManageMode();
  }
  function resetHeaderActions() {
    backBtn.hidden = true;
    statusEl.textContent = '';
    countEl.textContent = '';
  }

  /**
   * @brief Surface the currently visible top-level `<section.view>` as
   *        `<html data-view="<id>">` so CSS can target views in
   *        attribute selectors without touching JS.
   *
   * Driven by a MutationObserver watching every `section.view`'s
   * `hidden` attribute. Whenever any view is shown / hidden, scan
   * the list, take the first non-hidden one, strip the conventional
   * `view-` prefix, and stamp the result on `<html>`. Examples:
   *   - `view-home` shown   → `<html data-view="home">`
   *   - `view-detail` shown → `<html data-view="detail">`
   *   - all hidden          → `<html data-view="">`
   *
   * @section ConsumerContract Consumer contract
   *   This is the canonical hook for theme effects (and any future
   *   per-view CSS rules) to know which view is on screen. Themes
   *   must include a `[data-view="home"]` qualifier on any
   *   decorative effect (scanline overlays, particle systems, etc.)
   *   so the effect is suppressed in detail / player / gallery /
   *   admin / login / search / novel-reader / history / audio-player
   *   views — those are task-focused screens where ambient motion
   *   distracts.
   *
   * @section WhyMutationObserver Why a MutationObserver
   *   `hideAllViews()` is called from ~10 different code paths and
   *   the matching show-step is even more scattered (each route /
   *   action sets `view.hidden = false` inline). A single observer
   *   listening on the small fixed set of view elements is the
   *   minimum-touch way to keep `data-view` in sync without a
   *   per-call `setActiveView()` handshake every show-site.
   *
   * @section Bootstrap Bootstrap
   *   Runs once at script-parse time. Because `<script src="app.js">`
   *   sits at the end of `<body>` (no defer needed), every
   *   `section.view` is already in the DOM when this IIFE runs, so
   *   the initial `syncActiveView()` call sees the correct state.
   */
  (function watchActiveView() {
    const views = document.querySelectorAll('section.view');
    function syncActiveView() {
      let visibleId = '';
      for (const v of views) {
        if (!v.hidden) {
          visibleId = v.id || '';
          break;
        }
      }
      const stripped = visibleId.replace(/^view-/, '');
      document.documentElement.setAttribute('data-view', stripped);
    }
    const obs = new MutationObserver(syncActiveView);
    for (const v of views) {
      obs.observe(v, { attributes: true, attributeFilter: ['hidden'] });
    }
    syncActiveView();
  })();

  /**
   * @brief Move the persistent <video> portal into a different DOM
   *        parent without losing playback position or play state.
   *
   * Used by every transition that toggles between full-size player,
   * detail-page in-flow video, and the floating mini-player. Each
   * transition is implemented as `appendChild` of the same shared
   * portal node into a new container — the underlying <video>
   * element survives the move, so in principle currentTime and the
   * paused state should carry across.
   *
   * In practice Blink (and historically WebKit) sometimes invokes
   * the HTMLMediaElement "load resource" algorithm when the element
   * is reparented, which snaps currentTime back to 0 and pauses
   * playback. This was reported as "from the mini-player, expanding
   * back to the full player resets the video to the start" — the
   * symptom of the spec gray area.
   *
   * Workaround: snapshot currentTime + paused before the move, do
   * the move, then if currentTime drifted by more than a small
   * tolerance restore it; if the element was playing before the
   * move and ends up paused after, kick play() again. The 0.5s
   * tolerance avoids treating sub-second jitter (which the player
   * naturally produces during normal playback) as a reset.
   */
  function mountVideoIn(container) {
    if (videoPortal.parentElement === container) return;
    const haveTime = !!player && Number.isFinite(player.currentTime);
    const savedTime = haveTime ? player.currentTime : 0;
    const wasPaused = player ? player.paused : true;
    container.appendChild(videoPortal);
    if (haveTime && savedTime > 0) {
      try {
        if (Math.abs((player.currentTime || 0) - savedTime) > 0.5) {
          player.currentTime = savedTime;
        }
      } catch (_e) {}
    }
    if (!wasPaused && player && player.paused) {
      try { player.play(); } catch (_e) {}
    }
  }

  function stopPlayer() {
    try { player.pause(); } catch (e) {}
    // Remove dynamic tracks and clean up blob URLs.
    for (const t of player.querySelectorAll('track')) t.remove();
    for (const u of state.subtitleBlobUrls) { try { URL.revokeObjectURL(u); } catch (e) {} }
    state.subtitleBlobUrls = [];
    // Tear down PGS renderer if any — its canvas is parented to the
    // video wrapper and would survive episode change otherwise.
    disposePgsRenderer();
    // Release any hls.js MSE buffer we attached for an EAC3-style mkv.
    disposeHls();
    // Drop server-sourced audio-track list — belongs to the ep that
    // just unloaded; if the next ep lands native (no HLS) the menu
    // should fall back to player.audioTracks rather than show stale
    // language entries from an unrelated mkv.
    state.serverAudioTracks = [];
    state.currentHlsAudioIdx = null;
    state.hlsCollectionId = null;
    state.hlsEpFile = null;
    player.removeAttribute('src');
    try { player.load(); } catch (e) {}
    state.currentFile = null;
    skipIntroBtn.hidden = true;
    if (!state.miniMode) videoPortal.style.display = 'none';
  }

  backBtn.addEventListener('click', () => {
    const r = parseHash();
    // Virtual collections (__liked_images__, __liked_audio__, __all_audio__)
    // have no real detail page — go straight home instead of trying to load
    // a nonexistent collection.
    const isVirtual = r.id && r.id.startsWith('__') && r.id.endsWith('__');
    // player → gallery (if image) or detail; gallery → detail; else → home
    if (r.view === 'player' && !isVirtual) {
      if (state.kind === 'image') navigate('#/c/' + encodeURIComponent(r.id) + '/gallery');
      else navigate('#/c/' + encodeURIComponent(r.id));
    }
    else if (r.view === 'gallery' && !isVirtual) navigate('#/c/' + encodeURIComponent(r.id));
    else navigate('#/');
  });

  // ==================================================================
  // Mini player
  // ==================================================================
  function maybeActivateMiniPlayer() {
    if (!state.autoVideoMiniEnabled) {
      // User opted out — stop playback on navigation instead of floating it.
      if (state.currentFile && !state.miniMode) stopPlayer();
      return;
    }
    if (!state.currentFile || player.paused || player.ended) return;
    if (state.miniMode) return;
    // If the browser is already showing this video in its own native
    // Picture-in-Picture window (via Plyr's built-in PiP control),
    // don't also open OUR mini — otherwise the user sees two floaty
    // boxes and can't figure out which one they're supposed to click.
    // When the user exits browser PiP we re-evaluate via the
    // leavepictureinpicture event below.
    if (document.pictureInPictureElement === player) return;
    mountVideoIn(miniPlayerSlot);
    videoPortal.style.display = 'block';
    miniPlayer.hidden = false;
    miniPlayerTitle.textContent = state.currentCollection
      ? state.currentCollection.title + ' · ' + (state.currentFile || '')
      : state.currentFile || '';
    state.miniMode = true;
    state.miniReturnHash = window.location.hash || '#/';
    restoreMiniLayout();
  }
  // Mutual exclusion with the browser's native Picture-in-Picture:
  //
  //  - On ENTER native PiP: hide our custom mini if it's showing. The
  //    native PiP window is more prominent and always-on-top, and the
  //    user just explicitly requested it by clicking Plyr's PiP
  //    button. Having two floaters at once is the exact "double mini"
  //    bug the user reported.
  //
  //  - On LEAVE native PiP: re-check whether we should show our mini.
  //    If the user exited PiP while they're on a non-player view
  //    (e.g. browsing the home page), the video has no visible home,
  //    so our mini takes over.
  if (player && typeof player.addEventListener === 'function') {
    player.addEventListener('enterpictureinpicture', () => {
      if (state.miniMode) {
        // Don't tear down playback — just hide the custom mini. The
        // video is now rendering into the native PiP window, which
        // keeps the underlying <video> element playing.
        try { miniPlayer.hidden = true; } catch (_) {}
        state.miniMode = false;
      }
    });
    player.addEventListener('leavepictureinpicture', () => {
      // Only activate if the current route isn't the full player view
      // (where the video naturally lives).
      if (viewPlayer && !viewPlayer.hidden) return;
      maybeActivateMiniPlayer();
    });
  }
  function closeMiniPlayer() {
    if (!state.miniMode) return;
    stopPlayer();
    miniPlayer.hidden = true;
    state.miniMode = false;
  }
  // Hard-stop every media surface on the page. Called when the user flips
  // the video/audio mode pill, because letting either player survive that
  // transition causes the bug where you end up hearing two things at once
  // (e.g. a docked video mini keeps playing while a freshly loaded audio
  // track starts in the new mode). Unlike closeMiniPlayer(), this is
  // unconditional — it works whether the video is in full view, docked in
  // the mini, or not playing at all, and it also kills the <audio> element.
  function stopAllMedia() {
    try { stopPlayer(); } catch (e) {}
    if (state.miniMode) {
      try { miniPlayer.hidden = true; } catch (e) {}
      state.miniMode = false;
    }
    try {
      if (audioPlayerEl) {
        audioPlayerEl.pause();
        audioPlayerEl.removeAttribute('src');
        audioPlayerEl.load();
      }
    } catch (e) {}
    // Also hide the audio mini — if the user is mid-switch while the
    // audio mini is floating on screen, it should disappear along
    // with the audio source. (hideAudioMini is hoisted — it's declared
    // as a function a few hundred lines below, but inside the same
    // IIFE so the reference resolves at call-time.)
    try { if (typeof hideAudioMini === 'function') hideAudioMini(); } catch (e) {}
    state.currentFile = null;
  }
  miniCloseBtn.addEventListener('click', closeMiniPlayer);
  miniExpandBtn.addEventListener('click', () => {
    if (!state.currentCollection || !state.currentFile) return;
    navigate('#/c/' + encodeURIComponent(state.currentCollection.id)
      + '/play/' + encodeURIComponent(state.currentFile));
  });

  function restoreMiniLayout() {
    if (window.innerWidth <= 600) return;
    try {
      const s = JSON.parse(localStorage.getItem(MINI_LAYOUT_KEY) || 'null');
      if (!s) return;
      if (typeof s.width === 'number') miniPlayer.style.width = s.width + 'px';
      if (typeof s.height === 'number') miniPlayer.style.height = s.height + 'px';
      if (typeof s.left === 'number') {
        miniPlayer.style.left = s.left + 'px';
        miniPlayer.style.right = 'auto';
      }
      if (typeof s.top === 'number') {
        miniPlayer.style.top = s.top + 'px';
        miniPlayer.style.bottom = 'auto';
      }
    } catch (e) {}
  }
  function saveMiniLayout() {
    if (window.innerWidth <= 600) return;
    const r = miniPlayer.getBoundingClientRect();
    try {
      localStorage.setItem(MINI_LAYOUT_KEY, JSON.stringify({
        left: r.left, top: r.top, width: r.width, height: r.height,
      }));
    } catch (e) {}
  }

  // Drag-to-move, threshold-based.
  //
  // Design: any mousedown on the mini-player (except buttons / resize
  // handles) arms a "pending drag". If the pointer moves more than
  // DRAG_THRESHOLD pixels before mouseup, we escalate to a real drag;
  // otherwise it's a click and we let it bubble through to Plyr's
  // click-to-play handler on the underlying <video>.
  //
  // Why this shape: previously drag was only bound to .mini-player-info
  // (the bottom bar), which forced users to grab a thin strip. The user
  // wanted to grab anywhere on the mini — including the top / video
  // area — but naïvely attaching drag to the whole #mini-player stole
  // every click from Plyr (you couldn't play/pause by clicking the
  // video). The threshold approach cleanly separates intent:
  //   click (move < 4px) → Plyr gets it
  //   drag  (move ≥ 4px) → we claim it, swallow the trailing click
  const miniInfoBar = miniPlayer.querySelector('.mini-player-info');
  const DRAG_THRESHOLD = 4;
  let miniDrag = null;     // active drag state (post-threshold)
  let miniPending = null;  // pre-threshold "maybe-drag" state
  function isMiniDragTarget(target) {
    if (!target || !target.closest) return false;
    // Hard exclusions: buttons and resize corners never start a drag.
    if (target.closest('button')) return false;
    if (target.closest('.mini-resize-handle')) return false;
    // Everything else (video slot, info bar, borders) is a candidate.
    return true;
  }
  function beginDrag(clientX, clientY) {
    const rect = miniPlayer.getBoundingClientRect();
    miniDrag = { startX: clientX, startY: clientY, startLeft: rect.left, startTop: rect.top };
    miniPlayer.classList.add('dragging');
    if (miniInfoBar) miniInfoBar.classList.add('dragging');
    miniPlayer.style.width = rect.width + 'px';
    miniPlayer.style.height = rect.height + 'px';
    miniPlayer.style.left = rect.left + 'px';
    miniPlayer.style.top = rect.top + 'px';
    miniPlayer.style.right = 'auto';
    miniPlayer.style.bottom = 'auto';
  }
  function duringDrag(clientX, clientY) {
    if (!miniDrag) return;
    const dx = clientX - miniDrag.startX;
    const dy = clientY - miniDrag.startY;
    let left = miniDrag.startLeft + dx;
    let top  = miniDrag.startTop + dy;
    const rect = miniPlayer.getBoundingClientRect();
    left = Math.max(0, Math.min(window.innerWidth - rect.width, left));
    top  = Math.max(0, Math.min(window.innerHeight - rect.height, top));
    miniPlayer.style.left = left + 'px';
    miniPlayer.style.top  = top + 'px';
  }
  function endDrag() {
    miniPending = null;
    if (!miniDrag) return;
    miniDrag = null;
    miniPlayer.classList.remove('dragging');
    if (miniInfoBar) miniInfoBar.classList.remove('dragging');
    saveMiniLayout();
  }
  // After a drag ends, the browser will fire a click on whatever was
  // under the pointer. Without this, a drag from the video surface
  // ends by toggling Plyr play/pause. Install a capture-phase click
  // eater that swallows exactly one subsequent click.
  function armMiniClickSwallow() {
    const swallow = (e) => {
      e.preventDefault();
      e.stopPropagation();
      miniPlayer.removeEventListener('click', swallow, true);
    };
    miniPlayer.addEventListener('click', swallow, true);
    // Safety net: if no click ever arrives (e.g. drag ended outside
    // the mini), unhook after a tick so we don't permanently eat the
    // next click.
    setTimeout(() => {
      miniPlayer.removeEventListener('click', swallow, true);
    }, 300);
  }
  // Threshold gate: return true if (dx,dy) from pending origin has
  // crossed DRAG_THRESHOLD. Caller should escalate to real drag.
  function miniPendingCrossed(clientX, clientY) {
    if (!miniPending) return false;
    const dx = clientX - miniPending.startX;
    const dy = clientY - miniPending.startY;
    return dx * dx + dy * dy > DRAG_THRESHOLD * DRAG_THRESHOLD;
  }
  miniPlayer.addEventListener('mousedown', (e) => {
    if (window.innerWidth <= 600) return;
    if (e.button !== 0) return;
    if (!isMiniDragTarget(e.target)) return;
    miniPending = { startX: e.clientX, startY: e.clientY };
    // Deliberately do NOT preventDefault here — we want a short click
    // (without moving) to still reach Plyr's click-to-play handler.
  });
  miniPlayer.addEventListener('touchstart', (e) => {
    if (window.innerWidth <= 600) return;
    if (!e.touches.length) return;
    if (!isMiniDragTarget(e.target)) return;
    const t = e.touches[0];
    miniPending = { startX: t.clientX, startY: t.clientY };
  }, { passive: true });
  document.addEventListener('mousemove', (e) => {
    if (miniPending && !miniDrag && miniPendingCrossed(e.clientX, e.clientY)) {
      const start = miniPending;
      miniPending = null;
      beginDrag(start.startX, start.startY);
      armMiniClickSwallow();
      e.preventDefault();
    }
    if (miniDrag) duringDrag(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', (e) => {
    endDrag();
  });
  document.addEventListener('touchmove', (e) => {
    if (!e.touches.length) return;
    const t = e.touches[0];
    if (miniPending && !miniDrag && miniPendingCrossed(t.clientX, t.clientY)) {
      const start = miniPending;
      miniPending = null;
      beginDrag(start.startX, start.startY);
      armMiniClickSwallow();
      e.preventDefault();
    }
    if (miniDrag) {
      duringDrag(t.clientX, t.clientY);
      e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', endDrag);
  document.addEventListener('touchcancel', endDrag);

  if (window.ResizeObserver) {
    const ro = new ResizeObserver(() => {
      if (!state.miniMode || miniDrag) return;
      saveMiniLayout();
    });
    ro.observe(miniPlayer);
  }

  // ==================================================================
  // AUDIO MINI PLAYER
  //
  // Unlike the video mini, this one is NOT a portal — the <audio>
  // element keeps playing wherever it is in the DOM, so there's no need
  // to physically relocate it. The mini is just a floating UI widget
  // that reads state from audioPlayerEl and writes commands back to it
  // via its own buttons.
  //
  // Two rendering modes:
  //   - 'in-browser':  position:fixed inside the main document. Can be
  //                    dragged around. Default.
  //   - 'document-pip': Chrome/Edge Document Picture-in-Picture API.
  //                    The DOM node is moved into a separate OS window
  //                    that floats above all other applications. Falls
  //                    back to in-browser on browsers without the API.
  // ==================================================================

  // Apply the current cover / title / sub to the mini.
  //
  // Robustness rules:
  //   1. Prefer state.audioNowPlaying (which is the authoritative
  //      "audio is playing THIS" reference set by loadAudioTrack).
  //      Only fall back to state.currentCollection/currentFile when
  //      audioNowPlaying hasn't been populated yet — i.e. on initial
  //      page load before the first loadAudioTrack call.
  //   2. Final fallback: derive from audioPlayerEl.src URL so even if
  //      state is totally empty but the audio element IS loaded (e.g.
  //      after a stub test or a bizarre race), we still show SOMETHING
  //      truthful instead of the HTML "未在播放" placeholder.
  //   3. Always write SOMETHING to title/sub so the default HTML
  //      placeholder never survives a call to this function.
  function updateAudioMiniMeta() {
    // audioNowPlaying is the source of truth. view-scoped state is
    // only a fallback for the brief window between page load and the
    // first loadAudioTrack call.
    let col = null;
    let file = null;
    if (state.audioNowPlaying && state.audioNowPlaying.col) {
      col  = state.audioNowPlaying.col;
      file = state.audioNowPlaying.file;
    } else if (state.currentCollection && state.currentFile
               && state.kind === 'audio') {
      col  = state.currentCollection;
      file = state.currentFile;
    }

    let title = '';
    let sub = '';
    let coverUrl = '';

    if (col && file) {
      const ep = col.episodes && col.episodes.find((e) => e.file === file);
      title = (ep && ep.title) || file;
      sub   = col.title || col.id;
      coverUrl = '/audio/api/collections/'
        + encodeURIComponent(col.id) + '/episodes/'
        + encodePath(file) + '/cover';
    } else if (audioPlayerEl && audioPlayerEl.src) {
      // Fallback: audio element is loaded but we have no tracked
      // collection object. Derive a title from the URL's last segment.
      try {
        const u = new URL(audioPlayerEl.src, window.location.href);
        const parts = u.pathname.split('/').filter(Boolean);
        const raw = parts.pop() || '';
        title = decodeURIComponent(raw) || '正在播放';
        const colId = parts.length ? decodeURIComponent(parts.pop()) : '';
        sub = colId || '—';
      } catch (_) {
        title = '正在播放';
        sub = '—';
      }
    } else {
      title = '未在播放';
      sub = '—';
    }

    if (audioMiniTitle) audioMiniTitle.textContent = title;
    if (audioMiniSub)   audioMiniSub.textContent   = sub;

    if (audioMiniCover) {
      audioMiniCover.style.backgroundImage = 'none';
      if (coverUrl) {
        const expectedFile = file;
        const probe = new Image();
        probe.onload = () => {
          // Race guard — user may have moved to another track while
          // this probe was in flight. Use audioNowPlaying for the
          // race check since it's the same reference we loaded from.
          const np = state.audioNowPlaying;
          if (np && np.file !== expectedFile) return;
          audioMiniCover.style.backgroundImage = `url("${coverUrl}")`;
        };
        probe.onerror = () => { /* 404 → blank */ };
        probe.src = coverUrl;
      }
    }
  }
  // Shared audio source-loader used by BOTH showAudioPlayer (the full
  // player view) AND the audio-mini prev/next buttons. Honors the
  // collection's per-collection `resumeMode`:
  //   - 'continue' (default): seek to saved position on loadedmetadata
  //   - 'restart': always start from 0, ignore saved position
  // This is the only place that encodes "how do we resume a track?" so
  // the three navigation paths (detail-page click → showAudioPlayer,
  // mini prev/next click → loadAudioTrack direct, continue-button →
  // showAudioPlayer) all behave identically.
  function loadAudioTrack(collection, ep, options) {
    if (!audioPlayerEl || !collection || !ep) return;
    const opts = options || {};
    const forceRestart = !!opts.forceRestart
      || collection.resumeMode === 'restart';
    const saved = (state.progressAll[collection.id] || {})[ep.file];
    const resumeAt = !forceRestart && saved && saved.position
      && (!saved.duration || saved.position < saved.duration - 3)
      ? saved.position : 0;
    state.currentCollection = collection;
    state.currentFile = ep.file;
    // Record the authoritative "audio is playing THIS" reference.
    // This is what the mini and ended handler consult — they can't
    // trust state.currentCollection because the user might navigate
    // to a different view while audio keeps playing in the background.
    state.audioNowPlaying = { col: collection, file: ep.file };
    swapAudioPlayerForEp(ep);
    // v1.9.0: route audio through the HiFi /audio-stream endpoint so
    // the server can pick the right lane (byte-range native, fmp4-fLaC
    // remux, DSD-to-FLAC, or Opus fallback). For browser-native codecs
    // the server 302-redirects to /audio-files so behavior is identical
    // to legacy clients.
    audioPlayerEl.src = audioStreamUrl(collection.id, ep.file);
    // X-Audio-Degraded response header signals an Opus fallback; the
    // <audio> element doesn't surface response headers directly, so we
    // attach a one-shot listener via a HEAD probe on first error. Most
    // playbacks never hit this path.
    if (audioPlayerEl.dataset.degradedListener !== '1') {
      audioPlayerEl.dataset.degradedListener = '1';
      audioPlayerEl.addEventListener('error', () => {
        // Best-effort: emit a toast hinting at the issue. Specific
        // diagnostics come from server logs.
        if (typeof toast === 'function') {
          try { toast('音频播放失败，请检查浏览器是否支持当前编码', 'warn', 6000); } catch (_e) {}
        }
      });
    }
    // Seek on loadedmetadata (the element doesn't know its duration
    // until then; setting currentTime before metadata is a no-op).
    const onMeta = () => {
      if (resumeAt > 3) {
        try { audioPlayerEl.currentTime = resumeAt; } catch (_) {}
      }
      audioPlayerEl.removeEventListener('loadedmetadata', onMeta);
    };
    audioPlayerEl.addEventListener('loadedmetadata', onMeta);
    try { audioPlayerEl.play().catch(() => {}); } catch (e) {}
  }

  // Sync the play/pause icon to match audioPlayerEl's real state.
  // Uses the shared ICONS map so the symbol matches the rest of the
  // app's SVG-based icon language instead of unicode text characters.
  function updateAudioMiniPlayIcon() {
    if (!audioMiniPlayBtn) return;
    const iconKey = (audioPlayerEl && audioPlayerEl.paused) ? 'play' : 'pause';
    audioMiniPlayBtn.innerHTML = ICONS[iconKey];
  }
  // Sync the progress bar + time display from audioPlayerEl.
  function updateAudioMiniProgress() {
    if (!audioPlayerEl || !audioMiniFill) return;
    const cur = audioPlayerEl.currentTime || 0;
    const dur = isFinite(audioPlayerEl.duration) ? audioPlayerEl.duration : 0;
    const pct = dur > 0 ? Math.max(0, Math.min(100, (cur / dur) * 100)) : 0;
    audioMiniFill.style.width = pct + '%';
    if (audioMiniTimeCur)   audioMiniTimeCur.textContent   = formatTime(cur);
    if (audioMiniTimeTotal) audioMiniTimeTotal.textContent = formatTime(dur);
  }

  // Show the audio mini. Obeys the user's enabled flag and the
  // currently-selected mode. No-op if audio isn't actually loaded.
  function showAudioMini() {
    if (!audioMini) return;
    if (!state.autoAudioMiniEnabled) return;
    if (!audioPlayerEl || !audioPlayerEl.src) return;
    if (state.audioMiniVisible) {
      updateAudioMiniMeta();
      updateAudioMiniPlayIcon();
      updateAudioMiniProgress();
      return;
    }
    // Mutex: never show both the audio mini and the video mini at
    // once. If video is playing in its mini, stop it so we don't get
    // overlapping audio streams.
    stopVideoPlayback();
    audioMini.hidden = false;
    state.audioMiniVisible = true;
    updateAudioMiniMeta();
    updateAudioMiniPlayIcon();
    updateAudioMiniProgress();
    restoreAudioMiniLayout();
    // Mode: if document-pip is selected AND the browser supports it,
    // move the element into the PiP window.
    if (state.audioMiniMode === 'document-pip') {
      openAudioMiniInPip().catch(() => {
        // Fall back silently — leave in-browser.
      });
    }
  }
  function hideAudioMini() {
    if (!audioMini) return;
    audioMini.hidden = true;
    state.audioMiniVisible = false;
    closeAudioMiniPip();
  }
  // Hard stop — pauses audio, hides mini, clears src. Used by the
  // mini's close button and by the video-start mutex path.
  function stopAudioPlayback() {
    try { if (audioPlayerEl) audioPlayerEl.pause(); } catch (e) {}
    try {
      if (audioPlayerEl) {
        audioPlayerEl.removeAttribute('src');
        audioPlayerEl.load();
      }
    } catch (e) {}
    hideAudioMini();
    state.currentFile = null;
    state.audioNowPlaying = null;
  }
  // Hard stop for the video side — used by the audio-start mutex path.
  // Mirrors stopAllMedia's video half without touching audio.
  function stopVideoPlayback() {
    try { stopPlayer(); } catch (e) {}
    if (state.miniMode) {
      try { miniPlayer.hidden = true; } catch (e) {}
      state.miniMode = false;
    }
  }

  // Called from showHome / showDetail / showHistory / showAdmin (same
  // places maybeActivateMiniPlayer is called). Shows the audio mini if
  // audio is loaded and playing in the background.
  function maybeActivateAudioMini() {
    if (!state.autoAudioMiniEnabled) {
      if (audioPlayerEl && audioPlayerEl.src && !audioPlayerEl.paused) {
        // User disabled auto-mini → stop playback on nav instead of
        // floating it. Matches maybeActivateMiniPlayer's semantics.
        stopAudioPlayback();
      }
      return;
    }
    if (!audioPlayerEl || !audioPlayerEl.src) return;
    showAudioMini();
  }

  // Wire buttons on the mini.
  if (audioMiniPlayBtn) {
    audioMiniPlayBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!audioPlayerEl) return;
      if (audioPlayerEl.paused) audioPlayerEl.play().catch(() => {});
      else audioPlayerEl.pause();
    });
  }
  if (audioMiniPrevBtn) {
    audioMiniPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // Read from audioNowPlaying, NOT state.currentCollection — the
      // user may be on a totally different view while audio plays in
      // the background, and currentCollection would be wrong.
      const np = state.audioNowPlaying;
      if (!np || !np.col) return;
      const p = prevTrackIn(np.col, np.file);
      if (p) {
        loadAudioTrack(np.col, p);
        updateAudioMiniMeta();
      }
    });
  }
  if (audioMiniNextBtn) {
    audioMiniNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const np = state.audioNowPlaying;
      if (!np || !np.col) return;
      const n = nextTrackIn(np.col, np.file);
      if (n) {
        loadAudioTrack(np.col, n);
        updateAudioMiniMeta();
      }
    });
  }
  if (audioMiniExpandBtn) {
    audioMiniExpandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const np = state.audioNowPlaying;
      if (!np || !np.col || !np.file) return;
      // Leave the mini alone — navigation into #view-audio-player
      // will hide it via the route handler.
      navigate('#/c/' + encodeURIComponent(np.col.id)
        + '/play/' + encodeURIComponent(np.file));
    });
  }
  if (audioMiniCloseBtn) {
    audioMiniCloseBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      stopAudioPlayback();
    });
  }
  // Click-to-scrub on the progress bar.
  if (audioMiniScrub) {
    audioMiniScrub.addEventListener('click', (e) => {
      e.stopPropagation();
      if (!audioPlayerEl || !isFinite(audioPlayerEl.duration)) return;
      const rect = audioMiniScrub.getBoundingClientRect();
      const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      audioPlayerEl.currentTime = audioPlayerEl.duration * pct;
    });
  }

  // NOTE: the `audio element → mini event sync` block used to live
  // here but it references `audioPlayerEl`, which is a `const`
  // declared ~1500 lines below. Accessing a `const` before its
  // declaration throws ReferenceError at module-load under strict
  // mode (temporal dead zone), which aborted the entire IIFE and
  // left half the app un-wired ("all blown up"). The block has been
  // moved to run right after `const audioPlayerEl = $('audio-player')`
  // so audioPlayerEl is always initialized first.

  // Drag-to-move the in-browser audio mini. Reuses the same pattern as
  // the video mini but on a fresh coordinate-tracking state variable.
  // No-op when the mini is reparented into a PiP window.
  let audioMiniDrag = null;
  function isAudioMiniDragTarget(target) {
    if (!target || !target.closest) return false;
    if (target.closest('button')) return false;
    if (target.closest('.audio-mini-progress')) return false;
    return true;
  }
  function beginAudioMiniDrag(cx, cy) {
    const rect = audioMini.getBoundingClientRect();
    audioMiniDrag = { startX: cx, startY: cy, startLeft: rect.left, startTop: rect.top };
    audioMini.classList.add('dragging');
    audioMini.style.left = rect.left + 'px';
    audioMini.style.top  = rect.top  + 'px';
    audioMini.style.right = 'auto';
    audioMini.style.bottom = 'auto';
  }
  function duringAudioMiniDrag(cx, cy) {
    if (!audioMiniDrag) return;
    const dx = cx - audioMiniDrag.startX;
    const dy = cy - audioMiniDrag.startY;
    const rect = audioMini.getBoundingClientRect();
    const left = Math.max(0, Math.min(window.innerWidth  - rect.width,  audioMiniDrag.startLeft + dx));
    const top  = Math.max(0, Math.min(window.innerHeight - rect.height, audioMiniDrag.startTop  + dy));
    audioMini.style.left = left + 'px';
    audioMini.style.top  = top  + 'px';
  }
  function endAudioMiniDrag() {
    if (!audioMiniDrag) return;
    audioMiniDrag = null;
    audioMini.classList.remove('dragging');
    saveAudioMiniLayout();
  }
  function saveAudioMiniLayout() {
    if (!audioMini || audioMini.classList.contains('in-pip')) return;
    if (window.innerWidth <= 600) return;
    const r = audioMini.getBoundingClientRect();
    try {
      localStorage.setItem(AUDIO_MINI_LAYOUT_KEY, JSON.stringify({
        left: r.left, top: r.top,
      }));
    } catch (_) {}
  }
  function restoreAudioMiniLayout() {
    if (window.innerWidth <= 600) return;
    try {
      const s = JSON.parse(localStorage.getItem(AUDIO_MINI_LAYOUT_KEY) || 'null');
      if (!s) return;
      if (typeof s.left === 'number') { audioMini.style.left = s.left + 'px'; audioMini.style.right = 'auto'; }
      if (typeof s.top  === 'number') { audioMini.style.top  = s.top  + 'px'; audioMini.style.bottom = 'auto'; }
    } catch (_) {}
  }
  if (audioMini) {
    audioMini.addEventListener('mousedown', (e) => {
      if (audioMini.classList.contains('in-pip')) return;
      if (window.innerWidth <= 600) return;
      if (e.button !== 0) return;
      if (!isAudioMiniDragTarget(e.target)) return;
      beginAudioMiniDrag(e.clientX, e.clientY);
      e.preventDefault();
    });
    audioMini.addEventListener('touchstart', (e) => {
      if (audioMini.classList.contains('in-pip')) return;
      if (window.innerWidth <= 600) return;
      if (!e.touches.length) return;
      if (!isAudioMiniDragTarget(e.target)) return;
      beginAudioMiniDrag(e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }
  document.addEventListener('mousemove', (e) => { if (audioMiniDrag) duringAudioMiniDrag(e.clientX, e.clientY); });
  document.addEventListener('mouseup',   endAudioMiniDrag);
  document.addEventListener('touchmove', (e) => {
    if (audioMiniDrag && e.touches.length) {
      duringAudioMiniDrag(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', endAudioMiniDrag);

  // ---- Document Picture-in-Picture mode ----
  //
  // Chrome/Edge 116+: window.documentPictureInPicture.requestWindow()
  // returns a Window that can host arbitrary DOM and floats above the
  // OS. We move #audio-mini-player into it and copy the main document's
  // CSS over so it looks the same. On close, we move the element back.
  function documentPipSupported() {
    return typeof window !== 'undefined'
      && 'documentPictureInPicture' in window
      && typeof window.documentPictureInPicture.requestWindow === 'function';
  }
  async function openAudioMiniInPip() {
    if (!documentPipSupported() || !audioMini) return;
    if (state.audioMiniPipWindow) return;  // already open
    const pipWin = await window.documentPictureInPicture.requestWindow({
      width: 460,
      height: 110,
    });
    state.audioMiniPipWindow = pipWin;
    // Copy stylesheets so the mini looks identical inside the PiP window.
    for (const sheet of Array.from(document.styleSheets)) {
      try {
        const link = pipWin.document.createElement('link');
        if (sheet.href) {
          link.rel  = 'stylesheet';
          link.href = sheet.href;
          pipWin.document.head.appendChild(link);
        } else if (sheet.ownerNode) {
          // Inline <style> — clone the node text.
          const style = pipWin.document.createElement('style');
          style.textContent = sheet.ownerNode.textContent || '';
          pipWin.document.head.appendChild(style);
        }
      } catch (_e) { /* some sheets are CORS-blocked, ignore */ }
    }
    // Move the element into the PiP window and flag it so drag/CSS
    // know to skip the "fixed-position in main doc" behavior.
    audioMini.classList.add('in-pip');
    pipWin.document.body.appendChild(audioMini);
    // When the user closes the PiP window, pull the element back into
    // the main doc and reset our state.
    pipWin.addEventListener('pagehide', () => {
      try {
        audioMini.classList.remove('in-pip');
        document.body.appendChild(audioMini);
      } catch (_e) {}
      state.audioMiniPipWindow = null;
    });
  }
  function closeAudioMiniPip() {
    if (!state.audioMiniPipWindow) return;
    try { state.audioMiniPipWindow.close(); } catch (_e) {}
    state.audioMiniPipWindow = null;
    if (audioMini) {
      audioMini.classList.remove('in-pip');
      try { document.body.appendChild(audioMini); } catch (_e) {}
    }
  }

  // Settings menu: cycle / label helpers used below.
  function audioMiniModeLabel() {
    return state.audioMiniMode === 'document-pip' ? '全局悬浮' : '浏览器内';
  }
  function syncAudioMiniModeLabel() {
    const el = document.getElementById('audio-mini-mode-label');
    if (el) el.textContent = audioMiniModeLabel();
  }
  syncAudioMiniModeLabel();

  // Initial icon fill for both mini players. These buttons used text
  // characters (◀, ▶, ❚❚, 展开, ×) which looked inconsistent with
  // the rest of the SVG-based icon system. Swap to the shared ICONS
  // map at boot so all mini-player buttons render as matching SVGs.
  // updateAudioMiniPlayIcon() then continues to swap play ↔ pause
  // on the fly as playback state changes.
  function fillMiniIcon(btn, iconKey) {
    if (btn && ICONS[iconKey]) btn.innerHTML = ICONS[iconKey];
  }
  fillMiniIcon(audioMiniPrevBtn,   'prev-ep');
  fillMiniIcon(audioMiniPlayBtn,   'play');     // updated by updateAudioMiniPlayIcon
  fillMiniIcon(audioMiniNextBtn,   'next-ep');
  fillMiniIcon(audioMiniExpandBtn, 'expand');
  fillMiniIcon(audioMiniCloseBtn,  'close');
  fillMiniIcon(miniExpandBtn,      'expand');
  fillMiniIcon(miniCloseBtn,       'close');

  // --- Custom 4-corner resize for the mini player --------------------
  // CSS `resize: both` only offers the bottom-right grip. We draw all
  // four corner handles and drive width/height/left/top manually.
  let miniResize = null;
  function beginResize(handle, clientX, clientY) {
    const rect = miniPlayer.getBoundingClientRect();
    miniResize = {
      handle,
      startX: clientX,
      startY: clientY,
      startLeft: rect.left,
      startTop: rect.top,
      startWidth: rect.width,
      startHeight: rect.height,
    };
    miniPlayer.style.left = rect.left + 'px';
    miniPlayer.style.top = rect.top + 'px';
    miniPlayer.style.width = rect.width + 'px';
    miniPlayer.style.height = rect.height + 'px';
    miniPlayer.style.right = 'auto';
    miniPlayer.style.bottom = 'auto';
    document.body.style.userSelect = 'none';
  }
  function duringResize(clientX, clientY) {
    if (!miniResize) return;
    const cs = getComputedStyle(miniPlayer);
    const minW = parseFloat(cs.minWidth)  || 160;
    const minH = parseFloat(cs.minHeight) || 120;
    const maxW = window.innerWidth  * 0.95;
    const maxH = window.innerHeight * 0.95;
    const dx = clientX - miniResize.startX;
    const dy = clientY - miniResize.startY;
    let { startLeft: L, startTop: T, startWidth: W, startHeight: H } = miniResize;
    const h = miniResize.handle;

    if (h === 'br') { W += dx; H += dy; }
    else if (h === 'bl') { W -= dx; H += dy; L += dx; }
    else if (h === 'tr') { W += dx; H -= dy; T += dy; }
    else if (h === 'tl') { W -= dx; H -= dy; L += dx; T += dy; }

    // Clamp width first, then fix left if a left-edge drag clipped it.
    if (W < minW) {
      if (h === 'bl' || h === 'tl') L -= (minW - W);
      W = minW;
    }
    if (W > maxW) {
      if (h === 'bl' || h === 'tl') L += (W - maxW);
      W = maxW;
    }
    if (H < minH) {
      if (h === 'tr' || h === 'tl') T -= (minH - H);
      H = minH;
    }
    if (H > maxH) {
      if (h === 'tr' || h === 'tl') T += (H - maxH);
      H = maxH;
    }
    L = Math.max(0, Math.min(window.innerWidth  - W, L));
    T = Math.max(0, Math.min(window.innerHeight - H, T));

    miniPlayer.style.left   = L + 'px';
    miniPlayer.style.top    = T + 'px';
    miniPlayer.style.width  = W + 'px';
    miniPlayer.style.height = H + 'px';
  }
  function endResize() {
    if (!miniResize) return;
    miniResize = null;
    document.body.style.userSelect = '';
    saveMiniLayout();
  }
  for (const grip of miniPlayer.querySelectorAll('.mini-resize-handle')) {
    grip.addEventListener('mousedown', (e) => {
      if (window.innerWidth <= 600) return;
      e.preventDefault();
      e.stopPropagation();
      beginResize(grip.dataset.rh, e.clientX, e.clientY);
    });
    grip.addEventListener('touchstart', (e) => {
      if (window.innerWidth <= 600) return;
      if (!e.touches.length) return;
      e.stopPropagation();
      beginResize(grip.dataset.rh, e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: true });
  }
  document.addEventListener('mousemove', (e) => {
    if (miniResize) duringResize(e.clientX, e.clientY);
  });
  document.addEventListener('mouseup', endResize);
  document.addEventListener('touchmove', (e) => {
    if (miniResize && e.touches.length) {
      duringResize(e.touches[0].clientX, e.touches[0].clientY);
      e.preventDefault();
    }
  }, { passive: false });
  document.addEventListener('touchend', endResize);
  document.addEventListener('touchcancel', endResize);

  // ==================================================================
  // Plyr lazy loader — image/novel sessions never download the ~146KB
  // Plyr bundle. Video/audio entry points (showPlayer, showAudioPlayer)
  // await this before instantiating; setKind pre-warms it on switch
  // into video/audio so the first play has no perceptible delay.
  // ==================================================================
  let plyrLoadPromise = null;
  function loadPlyrAssets() {
    if (plyrLoadPromise) return plyrLoadPromise;
    plyrLoadPromise = new Promise((resolve, reject) => {
      const css = document.createElement('link');
      css.rel = 'stylesheet';
      css.href = 'vendor/plyr/plyr.css';
      document.head.appendChild(css);
      const js = document.createElement('script');
      js.src = 'vendor/plyr/plyr.min.js';
      js.onload = () => resolve();
      js.onerror = () => {
        plyrLoadPromise = null;  // allow retry
        reject(new Error('Plyr load failed'));
      };
      document.head.appendChild(js);
    });
    return plyrLoadPromise;
  }

  // ==================================================================
  // Plyr initialization
  // ==================================================================
  async function initPlyr() {
    if (state.plyr) return;
    try { await loadPlyrAssets(); } catch (e) { console.warn(e); return; }
    if (typeof Plyr === 'undefined') {
      console.warn('Plyr not loaded');
      return;
    }
    state.plyr = new Plyr(player, {
      controls: [
        'play-large', 'restart', 'play',
        'progress', 'current-time', 'duration',
        'mute', 'volume',
        'settings', 'pip', 'fullscreen',
      ],
      // 1.7.29 dropped 'captions' from both arrays:
      //   - controls bar: removed the CC button outright (we replace
      //     it with a custom 字幕 entry inside the settings popup,
      //     peer of speed / quality / audio-track)
      //   - settings popup: don't let Plyr generate its own captions
      //     sub-panel; ours combines external files (.srt/.ass/.sup)
      //     and embedded mkv streams in one place, which Plyr's stock
      //     panel can't (it only sees player.textTracks).
      // Plyr's captions module still loads (state.plyr.toggleCaptions
      // / .currentTrack / 'captionsenabled' events keep working) — we
      // just bypass its UI.
      settings: ['quality', 'speed'],
      // 1.7.30 — captions.update=true makes Plyr listen for the
      // textTrackList 'addtrack' event in addition to 'removetrack'.
      // Plyr's default (false) skips 'addtrack', meaning any track
      // appended after construction (i.e. all of our dynamically
      // mounted text-track subtitles — manual external picks, mkv
      // embedded extracts) is INVISIBLE to plyr.captions.tracks.
      // That's why "内嵌激活不了" since 1.7.20: state.plyr.toggleCaptions
      // (true) had nothing in its track list to enable. Flipping
      // this on makes plyr re-discover tracks live, so currentTrack
      // assignment + toggleCaptions(true) actually work after our
      // appendChild.
      captions: { update: true },
      quality: {
        default: 1080,
        options: [2160, 1440, 1080, 720, 576, 480, 360],
      },
      speed: { selected: state.playerSpeed, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      keyboard: { focused: false, global: false },
      tooltips: { controls: true, seek: true },
      iconUrl: '/vendor/plyr/plyr.svg',
      i18n: {
        restart: '重播',
        rewind: '后退 {seektime}s',
        play: '播放',
        pause: '暂停',
        fastForward: '前进 {seektime}s',
        seek: '定位',
        seekLabel: '{currentTime} / {duration}',
        played: '已播放',
        buffered: '已缓存',
        currentTime: '当前',
        duration: '时长',
        volume: '音量',
        mute: '静音',
        unmute: '取消静音',
        enableCaptions: '启用字幕',
        disableCaptions: '关闭字幕',
        download: '下载',
        enterFullscreen: '全屏',
        exitFullscreen: '退出全屏',
        frameTitle: '{title} 播放器',
        captions: '字幕',
        settings: '设置',
        menuBack: '返回',
        speed: '速度',
        normal: '正常',
        quality: '画质',
        loop: '循环',
        start: '开始',
        end: '结束',
        all: '全部',
        reset: '重置',
        disabled: '关闭',
        enabled: '开启',
        advertisement: '广告',
        qualityBadge: { 2160: '4K', 1440: '2K', 1080: 'HD', 720: 'HD', 576: 'SD', 480: 'SD' },
      },
    });

    // Inject a single "next episode" button right after play/pause +
    // intercept the captions (CC) button so it always opens the manual
    // subtitle picker dialog — both wired once on Plyr ready.
    // (Prev-episode lives in the sidebar only; see user spec.)
    state.plyr.on('ready', () => {
      const controls = state.plyr.elements && state.plyr.elements.controls;
      if (!controls) return;

      // ---- Next-episode button injection (idempotent). --------------
      if (!controls.querySelector('[data-plyr-custom="next-ep"]')) {
        const next = document.createElement('button');
        next.type = 'button';
        next.className = 'plyr__control plyr__control--custom';
        next.setAttribute('data-plyr-custom', 'next-ep');
        next.setAttribute('aria-label', '下一集');
        next.innerHTML = ICONS['next-ep'] + '<span class="plyr__tooltip" role="tooltip">下一集</span>';
        next.addEventListener('click', () => {
          if (state.miniMode) state.pendingMiniRestore = true;
          gotoEp(nextEpisode());
        });

        const playBtn = controls.querySelector('[data-plyr="play"]');
        if (playBtn && playBtn.nextSibling) {
          controls.insertBefore(next, playBtn.nextSibling);
        } else {
          controls.appendChild(next);
        }
      }

      // 1.7.29 removed the standalone CC button and its cloneNode
      // takeover. Subtitle selection lives entirely inside the
      // settings popup now — see the "字幕" inject block below.
      // Plyr's captions module still loads (toggleCaptions API,
      // captionsenabled/disabled events, currentTrack etc. all
      // unchanged) so the existing PGS / addSubtitleTrack /
      // mountEmbeddedSubtitle paths keep working; only the visible
      // CC button + its cloneNode-replaced click handler are gone.

      // ---- Audio-track switcher injected into Plyr settings menu. --
      //
      // 1.7.22 moved this from a separate control-bar button (1.7.21
      // version) into Plyr's built-in settings popup, peer of the
      // speed / quality / captions entries. Rationale (user request):
      // a single settings-cog gathers all "preferences I tweak per
      // playback" — speed, captions, audio language. The standalone
      // 音轨 button cluttered the controls bar even on single-audio
      // mkvs (toggle-on-existence + position guesswork on the home-
      // panel was finicky).
      //
      // Implementation: walk into state.plyr.elements.settings.panels.
      // home (the main menu div), find its inner [role="menu"], and
      // append our menu item. Mirrors Plyr's own DOM:
      //
      //   <div role="menu">  ← homePanelInner
      //     <button class="plyr__control plyr__control--forward"
      //             role="menuitem" aria-haspopup="true">
      //       <span>速度<span class="plyr__menu__value">正常</span></span>
      //     </button>
      //     ... captions, quality ...
      //     <button data-plyr-custom="audio-track" ... >  ← we add this
      //       <span>音轨<span class="plyr__menu__value">English</span></span>
      //     </button>
      //   </div>
      //
      // Sub-panel is also a sibling div inside the settings popup
      // (peer of plyr-settings-{id}-home), with class-matched back
      // button + role="menuitemradio" rows so Plyr's own CSS gives
      // us radio-dot indicators and forward/back arrows for free.
      //
      // Nav between panels piggybacks on `hidden` attribute toggling
      // (Plyr's same mechanism, just driven by us). We don't re-hook
      // into Plyr's panel transition machinery — the hidden-attribute
      // dance is enough for visual swap and Plyr's height auto-sizing
      // (.plyr__menu__container > div { transition: height ... })
      // adapts on its own.
      //
      // HTMLMediaElement.audioTracks coverage stays:
      //   Chrome / Edge / Safari → implemented
      //   Firefox                → not implemented; menu item stays
      //                            display:none and never shows up.
      const settingsApi = state.plyr.elements && state.plyr.elements.settings;
      const homePanel = settingsApi && settingsApi.panels && settingsApi.panels.home;
      const homePanelInner = homePanel && homePanel.querySelector('[role="menu"]');
      const settingsContainer = homePanel && homePanel.parentNode;
      if (homePanelInner && settingsContainer && !homePanelInner.querySelector('[data-plyr-custom="audio-track"]')) {
        // Main-panel menu item (peer of speed / captions / quality).
        const audItem = document.createElement('button');
        audItem.type = 'button';
        audItem.className = 'plyr__control plyr__control--forward';
        audItem.setAttribute('role', 'menuitem');
        audItem.setAttribute('aria-haspopup', 'true');
        audItem.dataset.plyrCustom = 'audio-track';
        audItem.innerHTML = '<span>音轨<span class="plyr__menu__value" data-aud-current>—</span></span>';

        // Sub-panel (peer of -home, -speed, etc.) hosts the radio list.
        const audPanel = document.createElement('div');
        audPanel.id = 'plyr-settings-audio-track';
        audPanel.hidden = true;
        settingsContainer.appendChild(audPanel);

        /**
         * @brief Build a human-readable label for one server-probed
         *        audio track. Title field wins (rips routinely set
         *        meaningful titles like "English E-AC3 5.1"); falls
         *        back to language + channel-count, then a numeric
         *        index suffix.
         */
        const labelForServerTrack = (t, ordinal) => {
          if (t && t.title) return t.title;
          const parts = [];
          if (t && t.language && t.language !== 'und') parts.push(t.language.toUpperCase());
          if (t && t.codec) parts.push(t.codec.toUpperCase());
          if (t && typeof t.channels === 'number') {
            parts.push(t.channels === 1 ? 'Mono' : t.channels === 2 ? 'Stereo' : (t.channels + 'ch'));
          }
          return parts.length ? parts.join(' · ') : ('音轨 ' + ordinal);
        };

        /**
         * @brief Render the sub-panel from whichever audio-track
         *        source is authoritative for the current playback
         *        path. Two sources, in priority order:
         *
         *          1. state.serverAudioTracks — populated from
         *             /api/episode/.../codecs whenever HLS is in use.
         *             The HLS playlist itself only carries one audio
         *             rendition (the one ffmpeg was asked to map),
         *             so HTMLMediaElement.audioTracks is useless
         *             here. We display every source-side track and
         *             switch by re-running the HLS pipeline with
         *             ?a=<absolute_stream_index>.
         *
         *          2. player.audioTracks — the standard HTMLMedia-
         *             Element list, used for native byte-range mkv
         *             playback (Chromium honors the in-container
         *             AudioTrackList for that path). Firefox falls
         *             here with an empty list — the disabled
         *             placeholder row covers it.
         *
         *        Called every time the menu opens so dynamic add/
         *        removetrack events between mounts don't leave a
         *        stale list.
         */
        const renderAudPanel = () => {
          const items = [
            '<button type="button" class="plyr__control plyr__control--back" role="menuitem"><span aria-hidden="true">音轨</span><span class="plyr__sr-only">返回</span></button>'
          ];
          const serverTracks = Array.isArray(state.serverAudioTracks) ? state.serverAudioTracks : [];
          if (serverTracks.length > 0) {
            // HLS path. The "current" track is whichever absolute
            // stream index hls-start was last invoked with — tracked
            // separately from player.audioTracks because the HLS
            // stream only ever has one audio rendition exposed.
            for (let i = 0; i < serverTracks.length; i++) {
              const t = serverTracks[i];
              const lbl = labelForServerTrack(t, i + 1);
              const sIdx = t && typeof t.streamIndex === 'number' ? t.streamIndex : i;
              const checked = (sIdx === state.currentHlsAudioIdx) ? 'true' : 'false';
              items.push(
                '<button type="button" class="plyr__control" role="menuitemradio" aria-checked="' + checked +
                '" data-aud-mode="hls" data-aud-stream-idx="' + sIdx + '"><span>' + escapeHtml(lbl) + '</span></button>'
              );
            }
          } else {
            const ats = player.audioTracks;
            if (!ats || ats.length === 0) {
              items.push('<button type="button" class="plyr__control" role="menuitem" disabled aria-disabled="true"><span>当前视频没有可选音轨</span></button>');
            } else {
              for (let i = 0; i < ats.length; i++) {
                const at = ats[i];
                // Label preference: mkv container "title" tag → BCP-47
                // language code uppercased → numeric fallback. Most
                // rips put a readable title so we get "English (Line-
                // in)" not "Audio #1".
                const lbl = at.label
                  || (at.language ? at.language.toUpperCase() : '')
                  || ('音轨 ' + (i + 1));
                const checked = at.enabled ? 'true' : 'false';
                items.push(
                  '<button type="button" class="plyr__control" role="menuitemradio" aria-checked="' + checked +
                  '" data-aud-mode="native" data-aud-idx="' + i + '"><span>' + escapeHtml(lbl) + '</span></button>'
                );
              }
            }
          }
          audPanel.innerHTML = items.join('');
        };

        /**
         * @brief Update the value text shown next to "音轨" in the
         *        main settings menu (matches how Plyr shows the
         *        current speed value as "正常" or "1.5×"). The menu
         *        item is ALWAYS visible per user request (rev 1.7.23
         *        dropped the conditional display:none) — only the
         *        value text changes:
         *           0 tracks  → "无"
         *           1 track   → that track's label
         *           N tracks  → currently-active track's label
         *
         *        Picks the same source as renderAudPanel — server
         *        list under HLS, HTMLMediaElement list otherwise —
         *        so the home-panel summary matches the sub-panel.
         */
        const updateAudMenuItemValue = () => {
          let lbl = '无';
          const serverTracks = Array.isArray(state.serverAudioTracks) ? state.serverAudioTracks : [];
          if (serverTracks.length > 0) {
            let active = serverTracks.find((t) => t && t.streamIndex === state.currentHlsAudioIdx);
            if (!active) active = serverTracks[0];
            lbl = labelForServerTrack(active, 1);
          } else {
            const ats = player.audioTracks;
            if (ats && ats.length > 0) {
              let active = null;
              for (let i = 0; i < ats.length; i++) if (ats[i].enabled) { active = ats[i]; break; }
              if (!active) active = ats[0];
              lbl = active.label
                || (active.language ? active.language.toUpperCase() : '')
                || '默认';
            }
          }
          const valueSpan = audItem.querySelector('[data-aud-current]');
          if (valueSpan) valueSpan.textContent = lbl;
        };

        audItem.addEventListener('click', (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          renderAudPanel();
          // Hide all peer panels, then show ours. This mirrors
          // Plyr's own panel-switch behavior (hidden-attribute
          // toggle).
          for (const pane of settingsContainer.children) {
            if (pane !== audPanel) pane.hidden = true;
          }
          audPanel.hidden = false;
        });

        audPanel.addEventListener('click', async (ev) => {
          const back = ev.target.closest('.plyr__control--back');
          if (back) {
            ev.preventDefault();
            ev.stopPropagation();
            audPanel.hidden = true;
            homePanel.hidden = false;
            return;
          }
          const trackBtn = ev.target.closest('[data-aud-mode]');
          if (!trackBtn) return;
          ev.preventDefault();
          ev.stopPropagation();
          const mode = trackBtn.dataset.audMode;
          if (mode === 'hls') {
            // HLS audio switch. The current ffmpeg pipeline only puts
            // one audio rendition on the wire, so changing track
            // means re-running hls-start with a different `?a=`. The
            // server caches per (cid|file|a) so a previously-tried
            // language is instant the second time.
            const sIdx = parseInt(trackBtn.dataset.audStreamIdx, 10);
            if (!Number.isFinite(sIdx) || sIdx === state.currentHlsAudioIdx) {
              audPanel.hidden = true;
              homePanel.hidden = false;
              return;
            }
            await switchHlsAudio(sIdx);
            renderAudPanel();
            updateAudMenuItemValue();
            audPanel.hidden = true;
            homePanel.hidden = false;
            const settingsBtn = controls.querySelector('[data-plyr="settings"]');
            if (settingsBtn) settingsBtn.click();
            return;
          }
          // Native (HTMLMediaElement) path — same as before.
          const idx = parseInt(trackBtn.dataset.audIdx, 10);
          const ats = player.audioTracks;
          if (!ats || isNaN(idx) || idx >= ats.length) return;
          // AudioTrackList is single-select per the HTML spec, but
          // some browsers don't auto-deselect siblings — write all
          // explicitly to be safe.
          for (let i = 0; i < ats.length; i++) ats[i].enabled = (i === idx);
          updateAudMenuItemValue();
          // Close the popup entirely so the user gets a clear signal
          // that the change took effect (clicking a setting in Plyr's
          // built-in panels also closes the menu, so we mirror).
          audPanel.hidden = true;
          homePanel.hidden = false;
          const settingsBtn = controls.querySelector('[data-plyr="settings"]');
          if (settingsBtn) settingsBtn.click();
        });

        // Track-list mutation listeners. Plyr swaps state.plyr.source
        // on episode change; the underlying <video> rebuilds its
        // audioTracks list and fires addtrack/removetrack as new
        // streams parse out. loadedmetadata is the most reliable
        // catch-all signal that the new list is settled.
        if (player.audioTracks) {
          try {
            player.audioTracks.addEventListener('addtrack', updateAudMenuItemValue);
            player.audioTracks.addEventListener('removetrack', updateAudMenuItemValue);
            player.audioTracks.addEventListener('change', updateAudMenuItemValue);
          } catch (_e) {}
        }
        player.addEventListener('loadedmetadata', updateAudMenuItemValue);
        updateAudMenuItemValue();

        // Insert at the end of the home panel — captions item is
        // injected separately below and ends up after audio-track.
        homePanelInner.appendChild(audItem);
      }

      // ---- Manual flip button + auto-landscape (1.7.43). ------------
      //
      // 1.7.42's gravity-flip auto-detection (deviceorientation
      // listener) was DOA on the DS124 LAN deployment because
      // Chrome/Safari gate sensor APIs (DeviceOrientationEvent,
      // DeviceMotionEvent) behind secure context, and the player
      // is served over HTTP 192.168.10.175. Replaced with a manual
      // flip button injected into the Plyr controls bar — the user
      // taps it after physically flipping their phone, and we
      // re-lock the screen to the opposite landscape side. Works
      // on any origin (no sensor permission needed) and gives
      // explicit control.
      //
      // Auto-landscape on enter-fullscreen stays as-is: lock to
      // landscape-primary when entering, unlock on exit. iOS Safari
      // ignores both lock and the manual button (no API support),
      // but its native fullscreen handles orientation via the OS.
      if (!controls.querySelector('[data-plyr-custom="flip-screen"]')) {
        const flipBtn = document.createElement('button');
        flipBtn.type = 'button';
        flipBtn.className = 'plyr__control plyr__control--custom';
        flipBtn.setAttribute('data-plyr-custom', 'flip-screen');
        flipBtn.setAttribute('aria-label', '翻转屏幕方向');
        flipBtn.title = '翻转屏幕（180°）';
        // Inline circular-arrow icon. Same 18-unit grid as Plyr's
        // own controls so it visually matches play / fullscreen
        // / etc.
        flipBtn.innerHTML =
          '<svg viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
          + '<path d="M14 6.5a5.5 5.5 0 1 1-1.6-3.9"/>'
          + '<polyline points="14 2 14 6.5 9.5 6.5"/>'
          + '</svg>'
          + '<span class="plyr__tooltip" role="tooltip">翻转</span>';

        flipBtn.addEventListener('click', (ev) => {
          ev.preventDefault();
          // Decide target side from current state.flipSide; default
          // to 'primary' when nothing is locked yet (entering
          // fullscreen also seeds primary, so this only matters if
          // the user clicks before going fullscreen on a desktop
          // browser — harmless no-op there).
          const next = state.flipSide === 'primary' ? 'secondary' : 'primary';
          state.flipSide = next;
          if (screen && screen.orientation && typeof screen.orientation.lock === 'function') {
            try {
              const p = screen.orientation.lock('landscape-' + next);
              if (p && typeof p.catch === 'function') p.catch(() => {});
            } catch (_e) {}
          }
        });

        // Insert before fullscreen so the icon order reads
        // … pip / flip / fullscreen — flip sits next to fullscreen
        // because they're both about screen-shape control.
        const fsBtn = controls.querySelector('[data-plyr="fullscreen"]');
        if (fsBtn && fsBtn.parentNode === controls) {
          controls.insertBefore(flipBtn, fsBtn);
        } else {
          controls.appendChild(flipBtn);
        }
      }

      // Fullscreen orientation handlers — auto-lock landscape on
      // entry, unlock on exit. The manual flip button piggybacks on
      // the same locked state via state.flipSide.
      state.plyr.on('enterfullscreen', () => {
        if (screen && screen.orientation && typeof screen.orientation.lock === 'function') {
          try {
            const p = screen.orientation.lock('landscape-primary');
            if (p && typeof p.catch === 'function') p.catch(() => {});
            state.flipSide = 'primary';
          } catch (_e) {}
        }
      });
      state.plyr.on('exitfullscreen', () => {
        state.flipSide = null;
        if (screen && screen.orientation && typeof screen.orientation.unlock === 'function') {
          try { screen.orientation.unlock(); } catch (_e) {}
        }
      });

      // ---- 字幕 menu item + sub panel (1.7.29). ---------------------
      //
      // Replaces the old standalone CC button + manual-subtitle-dialog
      // pair. All subtitle interactions now happen inside Plyr's
      // settings popup, peer of speed / quality / 音轨:
      //
      //   设置 ▶  速度 ▶ ...
      //           字幕 ▶ <current pick or 关闭>
      //           音轨 ▶ ...
      //
      // The 字幕 sub-panel merges three signal sources into one radio
      // list:
      //   - 「关闭字幕」 (radio, default-selected when nothing on)
      //   - Embedded text streams (mkv/mp4-internal SRT/ASS),
      //     fetched async from /api/episode/.../embedded-subs on
      //     first open, cached per episode in cachedEmbedded
      //   - External files (c.availableSubtitles), already known
      //     synchronously from the collection fetch
      //   - 「清除手动选择」 (non-radio button at the bottom)
      //
      // Selecting any radio mounts + enables the chosen subtitle in
      // ONE step (no separate "确认" — that two-step flow was the
      // root of every CC-button-vs-settings-menu race we hit during
      // 1.7.15-1.7.28). The settings popup closes on selection,
      // mirroring Plyr's stock behavior for speed / quality.
      if (homePanelInner && settingsContainer && !homePanelInner.querySelector('[data-plyr-custom="captions"]')) {
        const capItem = document.createElement('button');
        capItem.type = 'button';
        capItem.className = 'plyr__control plyr__control--forward';
        capItem.setAttribute('role', 'menuitem');
        capItem.setAttribute('aria-haspopup', 'true');
        capItem.dataset.plyrCustom = 'captions';
        capItem.innerHTML = '<span>字幕<span class="plyr__menu__value" data-cap-current>关闭</span></span>';

        const capPanel = document.createElement('div');
        capPanel.id = 'plyr-settings-captions-custom';
        capPanel.hidden = true;
        settingsContainer.appendChild(capPanel);

        // Episode-scoped cache of the /api/episode/.../embedded-subs
        // probe result. The cache key is "<collectionId>|<epFile>" —
        // 1.7.35 added explicit key tracking because relying on
        // loadedmetadata to invalidate (which we did up to 1.7.34)
        // missed cases where the user navigated to a different
        // episode without plyr emitting loadedmetadata in time, and
        // the next subtitle picker open showed the previous ep's
        // stream list against the current ep's file. The user could
        // pick "Chinese Traditional (stream 5)" from the previous
        // ep's list, but that index pointed at a different language
        // (e.g. Turkish at stream 5 in some episodes) in the actual
        // current file. Now every open re-checks the key and re-
        // fetches if the ep changed.
        let cachedEmbedded = null;
        let cachedEmbeddedFor = null;
        const fetchEmbeddedIfNeeded = async () => {
          const c = state.currentCollection;
          const epFile = state.currentFile;
          const key = c && epFile ? c.id + '|' + epFile : null;
          if (cachedEmbeddedFor === key && cachedEmbedded !== null) return;
          cachedEmbeddedFor = key;
          cachedEmbedded = null;
          if (!c || !epFile) { cachedEmbedded = []; return; }
          try {
            const url = '/api/episode/' + encodeURIComponent(c.id)
              + '/embedded-subs?file=' + encodeURIComponent(epFile);
            const r = await fetch(url);
            // Bail if the user navigated away mid-fetch.
            const k2 = state.currentCollection && state.currentFile
              ? state.currentCollection.id + '|' + state.currentFile : null;
            if (k2 !== key) return;
            if (r.ok) {
              const data = await r.json();
              cachedEmbedded = Array.isArray(data.subs) ? data.subs : [];
            } else {
              cachedEmbedded = [];
            }
          } catch (_e) {
            cachedEmbedded = [];
          }
        };

        /**
         * @brief Single source of truth for the "字幕 ▶ <value>"
         *        display text. 1.7.33 stopped trying to derive this
         *        from Plyr's internal state — plyr's `.toggled` /
         *        `.active` / `.plyr--captions-active` class / textTrack
         *        mode are all updated at different points in the
         *        toggleCaptions lifecycle (some sync, some via
         *        setTimeout, some only on non-passive calls), and
         *        any read right after our own toggleCaptions(true)
         *        risked catching the state mid-transition and
         *        showing "关闭" while the subtitle was already
         *        rendering. New approach: the click handler that
         *        mounts each subtitle owns the label and writes it
         *        explicitly via updateCapValue(newLabel). Plyr
         *        events serve as a one-way passive sync ("if plyr
         *        says captions are off, force label to 关闭") for
         *        cases where state changes outside our handlers
         *        (auto-restore, captionsdisabled emit on episode
         *        teardown, etc.).
         */
        let currentCapLabel = '关闭';
        const updateCapValue = (newLabel) => {
          if (typeof newLabel === 'string') currentCapLabel = newLabel;
          let displayed = currentCapLabel;
          if (displayed.length > 18) displayed = displayed.slice(0, 17) + '…';
          const v = capItem.querySelector('[data-cap-current]');
          if (v) v.textContent = displayed;
        };
        const captionsAreOnLocal = () => {
          // Used by renderCapPanel to decide which radio is active.
          // Same multi-signal check we had — this is read-only,
          // so race conditions just affect highlighting, not the
          // home-panel value text.
          if (state.pgs && state.pgs.visible) return true;
          if (state.plyr && state.plyr.captions && state.plyr.captions.toggled) return true;
          if (state.plyr && state.plyr.elements && state.plyr.elements.container) {
            return state.plyr.elements.container.classList.contains('plyr--captions-active');
          }
          return false;
        };

        const renderCapPanel = () => {
          const c = state.currentCollection;
          const external = (c && Array.isArray(c.availableSubtitles)) ? c.availableSubtitles : [];
          const embedded = cachedEmbedded;
          const isOff = !captionsAreOnLocal();
          const map = (state.currentCollection && state.currentFile)
            ? (getManualSubsFor(state.currentCollection.id) || {}) : {};
          const pickedId = map[state.currentFile || ''] || null;

          const items = [];
          // Back button
          items.push('<button type="button" class="plyr__control plyr__control--back" role="menuitem"><span aria-hidden="true">字幕</span><span class="plyr__sr-only">返回</span></button>');
          // Off
          items.push('<button type="button" class="plyr__control" role="menuitemradio" aria-checked="' + (isOff ? 'true' : 'false') + '" data-cap-action="off"><span>关闭字幕</span></button>');

          // Embedded section
          if (embedded === null) {
            items.push('<button type="button" class="plyr__control" role="menuitem" disabled aria-disabled="true"><span>[内嵌] 探测中…</span></button>');
          } else {
            for (const sub of embedded) {
              const lbl = sub.title
                || (sub.language && sub.language !== 'und' ? sub.language.toUpperCase() : '#' + sub.streamIndex);
              const subId = '@embed:' + sub.streamIndex;
              const isCur = !isOff && pickedId === subId;
              items.push('<button type="button" class="plyr__control" role="menuitemradio" aria-checked="' + (isCur ? 'true' : 'false')
                + '" data-cap-embedded-idx="' + sub.streamIndex
                + '" data-cap-label="' + escapeHtml(lbl)
                + '" data-cap-lang="' + escapeHtml(sub.language || 'und')
                + '"><span>[内嵌] ' + escapeHtml(lbl) + '</span></button>');
            }
          }

          // External files section
          for (const sub of external) {
            const fileName = sub.file.includes('/')
              ? sub.file.slice(sub.file.lastIndexOf('/') + 1)
              : sub.file;
            const isCur = !isOff && pickedId === sub.file;
            items.push('<button type="button" class="plyr__control" role="menuitemradio" aria-checked="' + (isCur ? 'true' : 'false')
              + '" data-cap-file="' + escapeHtml(sub.file)
              + '"><span>[外置] ' + escapeHtml(fileName) + '</span></button>');
          }

          // Empty-state vs clear button
          const totalItems = (embedded === null ? 0 : embedded.length) + external.length;
          if (totalItems === 0 && embedded !== null) {
            items.push('<button type="button" class="plyr__control" role="menuitem" disabled aria-disabled="true"><span>当前剧集没有可用字幕</span></button>');
          } else if (totalItems > 0) {
            // Visual separator + clear-pick action.
            items.push('<button type="button" class="plyr__control" role="menuitem" data-cap-action="clear" style="opacity: 0.7;"><span>清除手动选择</span></button>');
          }

          capPanel.innerHTML = items.join('');
        };

        // Plyr lifecycle hooks — passive sync only. Click handler
        // owns label writes for explicit user picks; these listeners
        // catch state changes that happen outside our handlers
        // (e.g. plyr emits captionsdisabled when source changes,
        // auto-restore mounting a track without our awareness).
        state.plyr.on('captionsdisabled', () => {
          if (!(state.pgs && state.pgs.visible)) updateCapValue('关闭');
        });
        state.plyr.on('loadedmetadata', () => {
          // New episode → invalidate embedded probe cache + reset
          // home-panel label. The auto-restore code path will
          // overwrite the label later if it successfully re-mounts
          // the previously-picked subtitle.
          cachedEmbedded = null;
          updateCapValue('关闭');
        });
        updateCapValue();

        /**
         * @brief Sync the outer .plyr__menu__container > div wrapper's
         *        inline height to the captions panel's rendered size.
         *
         * Plyr's panel-switch animation works by setting the wrapper
         * div's height to the active sub-panel's scrollHeight via
         * inline style — but only when plyr's own click handler runs
         * (settings → speed / quality etc.). We swap to our captions
         * panel by toggling `hidden` directly, so plyr never gets a
         * chance to update the wrapper. Result before 1.7.35: the
         * wrapper stays at home-panel height (~100px), captions
         * panel scrollHeight is 800+px, panel content beyond ~100px
         * gets clipped — user sees only the first 4-5 entries (off,
         * SDH, Arabic, Chinese Simplified, Chinese Traditional) and
         * can never reach Turkish at the bottom.
         *
         * Cap the height so the popup doesn't grow beyond what the
         * viewport can hold. capPanel itself has overflow-y: auto, so
         * any rows beyond the cap remain reachable via scroll. Mobile
         * uses a tighter cap (55vh) to leave room for plyr controls
         * + system bars.
         */
        const syncCaptionsPanelHeight = () => {
          if (!settingsContainer || !settingsContainer.style) return;
          const isMobile = window.innerWidth <= 600;
          const cap = window.innerHeight * (isMobile ? 0.55 : 0.6);
          // Force layout flush so scrollHeight is accurate after the
          // most recent renderCapPanel() write.
          void capPanel.offsetHeight;
          const want = Math.min(capPanel.scrollHeight, cap);
          settingsContainer.style.height = want + 'px';
          capPanel.style.maxHeight = want + 'px';
        };

        capItem.addEventListener('click', async (ev) => {
          ev.preventDefault();
          ev.stopPropagation();
          for (const pane of settingsContainer.children) {
            if (pane !== capPanel) pane.hidden = true;
          }
          capPanel.hidden = false;
          renderCapPanel();
          syncCaptionsPanelHeight();
          // fetchEmbeddedIfNeeded handles its own stale-cache check;
          // calling it unconditionally is now safe (no-op on cache
          // hit, fresh fetch on miss or different epFile).
          await fetchEmbeddedIfNeeded();
          if (!capPanel.hidden) {
            renderCapPanel();
            syncCaptionsPanelHeight();
          }
        });

        capPanel.addEventListener('click', async (ev) => {
          // Back button
          const back = ev.target.closest('.plyr__control--back');
          if (back) {
            ev.preventDefault();
            ev.stopPropagation();
            capPanel.hidden = true;
            homePanel.hidden = false;
            // Restore outer wrapper height to home panel size — we
            // bumped it up when entering captions panel and have to
            // shrink it back so the home panel doesn't render with
            // 60vh empty space below.
            if (settingsContainer && settingsContainer.style) {
              void homePanel.offsetHeight;
              settingsContainer.style.height = homePanel.scrollHeight + 'px';
            }
            return;
          }

          const btn = ev.target.closest('[role="menuitem"], [role="menuitemradio"]');
          if (!btn || btn.disabled) return;
          ev.preventDefault();
          ev.stopPropagation();

          const c = state.currentCollection;
          const epFile = state.currentFile;
          if (!c || !epFile) return;

          const closeMenu = () => {
            // Hide our panel + emulate a click on the settings cog
            // to close the popup entirely (matching how Plyr closes
            // its menu after a built-in selection).
            capPanel.hidden = true;
            homePanel.hidden = false;
            const settingsBtn = controls.querySelector('[data-plyr="settings"]');
            if (settingsBtn) settingsBtn.click();
          };

          // Off radio
          if (btn.dataset.capAction === 'off') {
            try { state.plyr.toggleCaptions(false); } catch (_e) {}
            hidePgsRenderer();
            updateCapValue('关闭');
            closeMenu();
            return;
          }

          // Clear button
          if (btn.dataset.capAction === 'clear') {
            setManualSubFor(c.id, epFile, null);
            removeManualSubtitleTracks();
            disposePgsRenderer();
            try { state.plyr.toggleCaptions(false); } catch (_e) {}
            updateCapValue('关闭');
            toast('已清除手动字幕，下次进入本集恢复自动字幕', 'success');
            closeMenu();
            return;
          }

          // Mount + enable a subtitle pick.
          removeManualSubtitleTracks();
          disposePgsRenderer();

          let ok;
          let pickId;
          let isPgs = false;
          let displayLabel = '已开启';  // home-panel value text

          if (btn.dataset.capEmbeddedIdx !== undefined) {
            const streamIdx = parseInt(btn.dataset.capEmbeddedIdx, 10);
            const lbl = btn.dataset.capLabel || '';
            const lang = btn.dataset.capLang || 'und';
            ok = await mountEmbeddedSubtitle(c.id, epFile, streamIdx, lbl, lang);
            pickId = '@embed:' + streamIdx;
            // Use the embedded track's title as the home-panel value.
            displayLabel = lbl || ('内嵌 #' + streamIdx);
          } else if (btn.dataset.capFile !== undefined) {
            const subFile = btn.dataset.capFile;
            const sub = (c.availableSubtitles || []).find((s) => s.file === subFile);
            if (!sub) return;
            if ((sub.format || '').toLowerCase() === 'sup') {
              ok = await setupPgsRenderer(c.id, sub);
              isPgs = true;
            } else {
              ok = await addSubtitleTrack(c.id, sub, { defaultTrack: true, labelPrefix: '手动: ' });
            }
            pickId = subFile;
            // Use the bare filename (no path) as the home-panel value.
            const fileName = sub.file.includes('/')
              ? sub.file.slice(sub.file.lastIndexOf('/') + 1)
              : sub.file;
            // Trim the file extension for a cleaner readout.
            displayLabel = fileName.replace(/\.[^.]+$/, '');
          }

          if (!ok) {
            toast('字幕加载失败', 'warn');
            return;
          }

          setManualSubFor(c.id, epFile, pickId);

          if (isPgs) {
            showPgsRenderer();
            try { state.plyr.emit('captionsenabled'); } catch (_e) {}
          } else {
            // setTimeout(0) lets Plyr's textTrackList addtrack listener
            // populate captions.tracks before we look up our newly
            // mounted "手动: ..." track. Without this the toggle ends
            // up firing against an empty list.
            await new Promise((resolve) => setTimeout(resolve, 0));
            let plyrIdx = -1;
            if (state.plyr.captions && Array.isArray(state.plyr.captions.tracks)) {
              for (let i = 0; i < state.plyr.captions.tracks.length; i++) {
                const lbl = state.plyr.captions.tracks[i].label || '';
                if (lbl.indexOf('手动: ') === 0) { plyrIdx = i; break; }
              }
            }
            if (plyrIdx === -1) plyrIdx = 0;
            try { state.plyr.currentTrack = plyrIdx; } catch (_e) {}
            try { state.plyr.toggleCaptions(true); } catch (_e) {}
          }

          // Explicit label write — single source of truth, no race
          // with plyr internal state.
          updateCapValue(displayLabel);
          toast('字幕已开启', 'success');
          closeMenu();
        });

        // Place 字幕 before 音轨 in the home panel so the order reads
        // 速度 / 字幕 / 音轨 / quality (if exposed).
        const audioItem = homePanelInner.querySelector('[data-plyr-custom="audio-track"]');
        if (audioItem) homePanelInner.insertBefore(capItem, audioItem);
        else homePanelInner.appendChild(capItem);
      }

      /**
       * Force every settings-menu main item to stay visible.
       *
       * Plyr's stock behavior is to hide an item when its underlying
       * functionality has nothing to expose:
       *   - captions hidden when textTracks is empty
       *   - quality hidden when only a single source is loaded
       * Per user spec the menu structure is always-on — even an
       * empty captions list should still surface a "字幕" entry so
       * users know where to look.
       *
       * Run this independently of the audio-track inject block above
       * so the unhide logic still fires when our [data-plyr-custom=
       * "audio-track"] item is already present (subsequent ready
       * triggers from source changes).
       *
       * Plyr's actual hide mechanism varies by version — sometimes
       * the [hidden] HTML attribute, sometimes inline `display:none`.
       * Strip both. Also walk into every panel (home, speed,
       * captions, quality, ours) so deeply-nested menu items are
       * caught as well.
       *
       * Driven by every plyr lifecycle event we have a hook for, so
       * the items can never linger hidden across a source change.
       */
      const forceShowSettingItems = () => {
        const settingsApi2 = state.plyr.elements && state.plyr.elements.settings;
        const containers = [];
        if (settingsApi2 && settingsApi2.panels && settingsApi2.panels.home) {
          // Home panel + its siblings (sub-panels) all live in the
          // same parent div inside the settings popup.
          const home = settingsApi2.panels.home;
          containers.push(home);
          if (home.parentNode) {
            for (const sib of home.parentNode.children) {
              if (sib !== home) containers.push(sib);
            }
          }
        } else {
          // Fallback: query the DOM directly via .plyr__menu__container.
          const popup = controls.querySelector('.plyr__menu__container');
          if (popup) containers.push(popup);
        }
        for (const c of containers) {
          for (const item of c.querySelectorAll('[role="menuitem"], [role="menuitemradio"]')) {
            if (item.hasAttribute('hidden')) item.removeAttribute('hidden');
            if (item.style.display === 'none') item.style.display = '';
          }
        }
      };
      state.plyr.on('ready', forceShowSettingItems);
      state.plyr.on('loadedmetadata', forceShowSettingItems);
      state.plyr.on('captionsenabled', forceShowSettingItems);
      state.plyr.on('captionsdisabled', forceShowSettingItems);
      state.plyr.on('languagechange', forceShowSettingItems);
      // Run once now, plus a deferred pass — Plyr does some menu
      // mutation in microtasks after 'ready' fires, so a 0-tick
      // setTimeout catches items added during that window.
      forceShowSettingItems();
      setTimeout(forceShowSettingItems, 0);

      // 1.7.36 — JS-driven fallback for the `:has(.plyr--menu-open)`
      // CSS rule used to grant overflow:visible to #player-container
      // when the settings menu is open. :has() is supported on
      // Chrome 105+ / Edge 105+ / Safari 16+ / Firefox 121+, but in-
      // the-wild we've seen at least one browser where the popup
      // still ends up clipped (possibly DS124-bundled Chromium or a
      // device that hasn't updated). MutationObserver on the
      // .plyr--menu-open class adds/removes a plain .ds-menu-open
      // class on #player-container, which the CSS treats identically
      // — so :has-aware browsers and observer-driven browsers both
      // see the same effect.
      const plyrContainer2 = state.plyr.elements && state.plyr.elements.container;
      const playerContainerEl = document.getElementById('player-container');
      if (plyrContainer2 && playerContainerEl && typeof MutationObserver !== 'undefined') {
        const syncMenuOpenClass = () => {
          const open = plyrContainer2.classList.contains('plyr--menu-open');
          playerContainerEl.classList.toggle('ds-menu-open', open);
        };
        new MutationObserver(syncMenuOpenClass).observe(plyrContainer2, {
          attributes: true,
          attributeFilter: ['class'],
        });
        syncMenuOpenClass();
      }
    });

    // Track user-selected speed from Plyr's settings menu — but ignore
    // transient changes caused by long-press 2× gesture.
    state.plyr.on('ratechange', () => {
      if (state.gestureLongPressing) return;
      state.playerSpeed = state.plyr.speed;
      try { localStorage.setItem(SPEED_KEY, String(state.playerSpeed)); } catch (e) {}
    });

    attachPlayerGestures();
  }

  // ------------------------------------------------------------------
  // Touch gestures (mobile / tablet):
  //   - double-tap left half  → rewind 10s
  //   - double-tap right half → forward 10s
  //   - long press (≥ 450ms)  → playback speed 2×, release restores
  // Ignores taps landing on Plyr controls / menus / overlaid big play.
  // ------------------------------------------------------------------
  function attachPlayerGestures() {
    if (state.gesturesAttached) return;
    state.gesturesAttached = true;

    let lastTapTime = 0, lastTapX = 0, lastTapY = 0;
    let touchStartTime = 0, touchStartX = 0, touchStartY = 0;
    let longPressTimer = null;

    function inVideoArea(t) {
      if (!t || !t.closest) return false;
      if (t.closest('.plyr__controls, .plyr__menu, .plyr__control--overlaid, .plyr__tooltip')) return false;
      return !!t.closest('.plyr__video-wrapper') || t.tagName === 'VIDEO';
    }
    function setSpeed(v) {
      try {
        if (state.plyr) state.plyr.speed = v;
        else player.playbackRate = v;
      } catch (e) {}
    }

    videoPortal.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) {
        clearTimeout(longPressTimer);
        return;
      }
      if (!inVideoArea(e.target)) return;
      const t = e.touches[0];
      touchStartTime = Date.now();
      touchStartX = t.clientX;
      touchStartY = t.clientY;
      clearTimeout(longPressTimer);
      longPressTimer = setTimeout(() => {
        if (player.paused) return;
        state.gestureSavedSpeed = (state.plyr ? state.plyr.speed : player.playbackRate) || 1;
        state.gestureLongPressing = true;
        setSpeed(2);
        toast('2× 加速');
      }, 450);
    }, { passive: true });

    videoPortal.addEventListener('touchmove', (e) => {
      if (e.touches.length !== 1) return;
      const t = e.touches[0];
      if (Math.abs(t.clientX - touchStartX) > 10 || Math.abs(t.clientY - touchStartY) > 10) {
        clearTimeout(longPressTimer);
      }
    }, { passive: true });

    videoPortal.addEventListener('touchend', (e) => {
      clearTimeout(longPressTimer);
      if (state.gestureLongPressing) {
        state.gestureLongPressing = false;
        setSpeed(state.gestureSavedSpeed || 1);
        toast('恢复 ' + (state.gestureSavedSpeed || 1) + '×');
        e.preventDefault();
        return;
      }
      const dt = Date.now() - touchStartTime;
      if (dt > 400) return;
      if (!inVideoArea(e.target)) return;
      const ch = e.changedTouches && e.changedTouches[0];
      if (!ch) return;
      if (Math.abs(ch.clientX - touchStartX) > 10 || Math.abs(ch.clientY - touchStartY) > 10) return;
      const now = Date.now();
      const isDouble = (now - lastTapTime < 300) &&
        Math.hypot(ch.clientX - lastTapX, ch.clientY - lastTapY) < 60;
      if (isDouble) {
        const wrapper = (e.target.closest && e.target.closest('.plyr__video-wrapper')) || videoPortal;
        const rect = wrapper.getBoundingClientRect();
        const isRight = ch.clientX > rect.left + rect.width / 2;
        if (isRight) {
          player.currentTime = Math.min(player.duration || 0, player.currentTime + 10);
          toast('快进 10s');
        } else {
          player.currentTime = Math.max(0, player.currentTime - 10);
          toast('后退 10s');
        }
        lastTapTime = 0;
        e.preventDefault();
      } else {
        lastTapTime = now;
        lastTapX = ch.clientX;
        lastTapY = ch.clientY;
      }
    });

    videoPortal.addEventListener('touchcancel', () => {
      clearTimeout(longPressTimer);
      if (state.gestureLongPressing) {
        state.gestureLongPressing = false;
        setSpeed(state.gestureSavedSpeed || 1);
      }
    });
  }

  // ==================================================================
  // LOGIN
  // ==================================================================
  async function showLogin() {
    maybeActivateMiniPlayer();
    maybeActivateAudioMini();
    hideAllViews();
    resetHeaderActions();
    title.textContent = 'CHIRAL NETWORK CHANNEL';
    viewLogin.hidden = false;
    if (state.needsFirstUser) {
      state.loginMode = 'register';
      loginNotice.hidden = false;
      loginNotice.textContent = '首次启动 · 注册即为管理员';
      loginTabs.hidden = true;
    } else {
      loginNotice.hidden = true;
      loginTabs.hidden = false;
    }
    renderLoginMode();
    loginError.textContent = '';
    loginForm.username.value = '';
    loginForm.password.value = '';
    setTimeout(() => loginForm.username.focus(), 50);
  }
  function renderLoginMode() {
    for (const btn of loginTabs.querySelectorAll('button')) {
      btn.classList.toggle('active', btn.dataset.mode === state.loginMode);
    }
    loginLabel.textContent = state.loginMode === 'register' ? 'REGISTER' : 'LOGIN';
  }
  loginTabs.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-mode]');
    if (!btn) return;
    state.loginMode = btn.dataset.mode;
    renderLoginMode();
    loginError.textContent = '';
  });
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = loginForm.username.value.trim();
    const password = loginForm.password.value;
    loginError.textContent = '';
    try {
      if (state.loginMode === 'register') await doRegister(username, password);
      else await doLogin(username, password);
      navigate('#/');
    } catch (err) {
      loginError.textContent = err.message || '失败';
    }
  });

  // ==================================================================
  // HOME
  // ==================================================================
  async function showHome() {
    maybeActivateMiniPlayer();
    maybeActivateAudioMini();
    hideAllViews();
    resetHeaderActions();
    title.textContent = 'CHIRAL NETWORK CHANNEL';
    viewHome.hidden = false;
    // Defensive re-render of the filter chip bar. applyKindUI is
    // responsible for building chip buttons from state.categories +
    // state.user.role; calling it here on every home-page entry
    // guarantees the row reflects the current state even if some
    // earlier code path left it stale. Specifically this unbreaks
    // the "hidden category chip disappears after navigation" bug,
    // where the chip was rendered correctly after a category save
    // but vanished on the next home visit.
    try { applyKindUI(); } catch (_e) {}
    {
      const selected = state.filter.types;
      for (const btn of filterChips.querySelectorAll('button')) {
        const t = btn.dataset.type;
        const on = (t === 'all') ? selected.size === 0 : selected.has(t);
        btn.classList.toggle('active', on);
      }
    }
    try { syncFilterOpUI(); } catch (_e) {}
    searchInput.value = state.filter.q;
    sortSelect.value = state.filter.sort.replace('-asc', '');
    updateSortDirUI();
    if (favToggleIn) favToggleIn.checked = state.filter.fav;
    if (showHiddenIn) showHiddenIn.checked = !!state.filter.includeHidden;
    favToggle.hidden = !state.user;
    try { updateToolbarSummary(); } catch (_e) {}
    await reloadHome();
  }
  async function reloadHome() {
    try { updateToolbarSummary(); } catch (_e) {}
    playAllTracklistLoaded = false;
    if (playAllTracklist) { playAllTracklist.hidden = true; playAllTracklist.innerHTML = ''; }
    if (playAllToggle) playAllToggle.textContent = '▼';
    if (playLikedTracklist) { playLikedTracklist.hidden = true; playLikedTracklist.innerHTML = ''; }
    if (playLikedToggle) playLikedToggle.textContent = '▼';
    cardsEl.innerHTML = renderSkeletonCards(8);
    const params = new URLSearchParams();
    if (state.filter.q) params.set('q', state.filter.q);
    if (state.filter.types && state.filter.types.size > 0) {
      params.set('types', Array.from(state.filter.types).join(','));
      if (state.filter.typeOp && state.filter.typeOp !== 'OR') {
        params.set('op', state.filter.typeOp);
      }
    }
    if (state.filter.fav && state.user) params.set('fav', '1');
    if (state.filter.sort) {
      // state.filter.sort is already the final key (e.g. 'created' or
      // 'created-asc') — sortDirBtn / sortSelect handlers run buildSortKey
      // before assigning. Pre-1.2.8 we double-wrapped here, producing keys
      // like 'created-asc-asc' that the server doesn't recognise; it
      // silently fell back to 'created' (DESC), so the asc button looked
      // dead. Just pass the stored key through.
      params.set('sort', state.filter.sort);
    }
    // Hidden visibility is gated to the admin-only "含隐藏" toggle and
    // nothing else. Bulk-manage mode used to imply includeHidden=1 so
    // admins could retag / delete hidden collections in one place, but
    // the user (2026-05-05) declared hidden = top priority semantics —
    // the "全部" view must NEVER reveal hidden content under any mode.
    // Admins who want to batch-edit hidden collections now toggle the
    // 含隐藏 checkbox first, then enter bulk mode. The server-side
    // `includeHidden=1` query is gated to admin role; non-admins
    // setting it get silently ignored.
    const wantHidden = state.filter.includeHidden && isAdmin();
    if (wantHidden) params.set('includeHidden', '1');
    try {
      const [{ collections }, progressRes] = await Promise.all([
        api('GET', '/api/collections?' + params.toString()),
        state.user ? api('GET', '/api/progress').catch(() => ({ progress: {} }))
                   : Promise.resolve({ progress: {} }),
      ]);
      state.collections = collections || [];
      state.progressAll = (progressRes && progressRes.progress) || {};
      countEl.textContent = state.collections.length ? state.collections.length + ' 个合集' : '';
      renderContinueWatching();
      renderRecentlyAdded();
      renderPlayAllSection();
      renderLikedSection();
      renderImageLikedSection();
      renderCards();
    } catch (err) {
      cardsEl.innerHTML = `<div class="cards-status error">加载失败: ${escapeHtml(err.message)}</div>`;
    }
  }
  function renderSkeletonCards(n) {
    let html = '';
    for (let i = 0; i < n; i++) html += '<div class="card skeleton-card"></div>';
    return html;
  }
  // Build the inline `style="..."` attribute string used by every cover-
  // bearing element to feed the ::before image layer. Returns '' when
  // there's no cover so the element falls back to its solid background.
  function coverVarsStyle(obj, fileOverride) {
    const file = fileOverride || (obj && obj.cover);
    if (!file || !obj) return '';
    const url = mediaUrl(obj.id || obj._id, file);
    const scale = typeof obj.coverScale === 'number' ? obj.coverScale : 1;
    const x = typeof obj.coverX === 'number' ? obj.coverX : 50;
    const y = typeof obj.coverY === 'number' ? obj.coverY : 50;
    // Use single quotes inside url() so the outer style="" attribute's
    // double quotes don't terminate early.
    return `--cover-url: url('${url}'); --cover-x: ${x}%; --cover-y: ${y}%; --cover-scale: ${scale};`;
  }
  function applyCoverVars(el, col) {
    if (!el) return;
    if (!col || !col.cover) {
      el.style.removeProperty('--cover-url');
      el.style.removeProperty('--cover-x');
      el.style.removeProperty('--cover-y');
      el.style.removeProperty('--cover-scale');
      return;
    }
    el.style.setProperty('--cover-url', `url("${mediaUrl(col.id, col.cover)}")`);
    el.style.setProperty('--cover-x', (typeof col.coverX === 'number' ? col.coverX : 50) + '%');
    el.style.setProperty('--cover-y', (typeof col.coverY === 'number' ? col.coverY : 50) + '%');
    el.style.setProperty('--cover-scale', String(typeof col.coverScale === 'number' ? col.coverScale : 1));
  }
  function renderContinueWatching() {
    if (!state.user) { homeContinue.hidden = true; return; }
    // One card per collection, not per episode. For each collection with any
    // unfinished progress, pick the episode whose record was touched most
    // recently (MRU) as the "resume here" target. All other episode records
    // stay on disk — they're still shown on the collection detail page and
    // in the history view.
    const byId = {};
    for (const col of state.collections) byId[col.id] = col;
    const items = [];
    for (const colId of Object.keys(state.progressAll)) {
      const col = byId[colId];
      if (!col) continue;
      const byEp = state.progressAll[colId];
      let mruP = null;
      let mruFile = null;
      for (const file of Object.keys(byEp)) {
        const p = byEp[file];
        if (!p || !p.position) continue;
        const finished = p.watched === true
          || (p.duration && p.position / p.duration > 0.9);
        if (finished) continue;
        if (!mruP || (p.updatedAt || 0) > (mruP.updatedAt || 0)) {
          mruP = p;
          mruFile = file;
        }
      }
      if (!mruP) continue;
      const ep = col.episodes && col.episodes.find((e) => e.file === mruFile);
      items.push({ col, epFile: mruFile, ep, progress: mruP });
    }
    items.sort((a, b) => (b.progress.updatedAt || 0) - (a.progress.updatedAt || 0));
    const top = items.slice(0, 12);
    if (!top.length) { homeContinue.hidden = true; continueScroll.innerHTML = ''; return; }
    homeContinue.hidden = false;
    continueScroll.innerHTML = top.map((it) => {
      const pct = it.progress.duration
        ? Math.max(0, Math.min(100, (it.progress.position / it.progress.duration) * 100))
        : 0;
      const cov = it.col.cover ? `style="${coverVarsStyle(it.col)}"` : '';
      return `
        <div class="mini-card" data-id="${encodeURIComponent(it.col.id)}" data-file="${encodeURIComponent(it.epFile)}">
          <div class="mini-card-cover" ${cov}></div>
          <div class="mini-card-meta">
            <div class="mini-card-title">${escapeHtml(it.col.title)}</div>
            <div class="mini-card-ep mono">${escapeHtml(it.ep ? it.ep.title : it.epFile)}</div>
            <div class="mini-card-bar"><span style="width:${pct}%"></span></div>
          </div>
        </div>
      `;
    }).join('');
    for (const el of continueScroll.querySelectorAll('.mini-card')) {
      el.addEventListener('click', () => {
        const id = decodeURIComponent(el.dataset.id);
        const file = decodeURIComponent(el.dataset.file);
        navigate('#/c/' + encodeURIComponent(id) + '/play/' + encodeURIComponent(file));
      });
    }
  }
  function renderRecentlyAdded() {
    const recent = state.collections.slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(0, 10);
    if (!recent.length) { homeRecent.hidden = true; return; }
    homeRecent.hidden = false;
    recentScroll.innerHTML = recent.map((col) => {
      const cov = col.cover ? `style="${coverVarsStyle(col)}"` : '';
      return `
        <div class="mini-card" data-id="${encodeURIComponent(col.id)}">
          <div class="mini-card-cover" ${cov}></div>
          <div class="mini-card-meta">
            <div class="mini-card-title">${escapeHtml(col.title)}</div>
            <div class="mini-card-ep mono">${col.episodeCount} ${countUnit()} · ${escapeHtml(typeLabel(col.type))}</div>
          </div>
        </div>
      `;
    }).join('');
    for (const el of recentScroll.querySelectorAll('.mini-card')) {
      el.addEventListener('click', () => {
        navigate('#/c/' + decodeURIComponent(el.dataset.id));
      });
    }
  }
  // ── "Play All" section (audio mode only) ──
  function renderPlayAllSection() {
    if (!homePlayAll) return;
    if (state.kind !== 'audio' || !state.user) {
      homePlayAll.hidden = true;
      return;
    }
    // Show section; count is filled async.
    homePlayAll.hidden = false;
    const totalTracks = state.collections.reduce((s, c) => s + (c.episodeCount || 0), 0);
    if (playAllCount) playAllCount.textContent = totalTracks + ' 首';
  }
  async function startPlayAll(shuffle) {
    try {
      const res = await api('GET', '/api/all-episodes');
      if (!res || !res.episodes || res.episodes.length === 0) {
        toast('没有可播放的音频', 'error'); return;
      }
      let episodes = res.episodes.map((e, i) => ({
        file: e.file,
        title: e.title,
        size: e.size,
        mtime: e.mtime,
        ext: e.ext,
        order: i + 1,
        trackNumber: e.trackNumber,
        artist: e.artist,
        subtitles: [],
        qualities: null,
        _collectionId: e.collectionId,
        _collectionTitle: e.collectionTitle,
      }));
      if (shuffle) {
        // Fisher-Yates shuffle
        for (let i = episodes.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [episodes[i], episodes[j]] = [episodes[j], episodes[i]];
        }
      }
      // Build a virtual "all audio" collection for the player.
      const virtualCol = {
        id: '__all_audio__',
        title: '全部音频',
        description: '',
        type: 'other',
        cover: null,
        episodes: episodes,
        episodeCount: episodes.length,
        totalSize: episodes.reduce((s, e) => s + (e.size || 0), 0),
        _virtual: true,
      };
      state.currentCollection = virtualCol;
      state.specifiedPlayScope = null;
      const first = episodes[0];
      navigate('#/c/__all_audio__/play/' + encodeURIComponent(first.file));
    } catch (e) {
      toast('加载全部音频失败: ' + e.message, 'error');
    }
  }
  if (playAllBtn) playAllBtn.addEventListener('click', () => startPlayAll(false));
  if (playAllShuffleBtn) playAllShuffleBtn.addEventListener('click', () => startPlayAll(true));

  // Check if a category type is hidden for a given kind.
  function isCategoryHidden(kind, type) {
    if (!type) return false;
    const list = (state.categories && state.categories[kind]) || [];
    const cat = list.find((c) => c.id === type);
    return cat ? !!cat.hidden : false;
  }
  // Filter liked items, excluding those whose parent collection category is hidden
  // (unless showHidden is true).
  function filterLikedByHidden(likes, kind, showHidden) {
    if (showHidden) return likes;
    return likes.filter((t) => {
      // Multi-tag analog: a liked track is "hidden" only when EVERY
      // tag of its parent collection is in a hidden category. A
      // single non-hidden tag rescues it (mirrors the home-list rule).
      const ts = Array.isArray(t._types) && t._types.length > 0 ? t._types : (t._type ? [t._type] : []);
      if (ts.length === 0) return true;
      return !ts.every((typ) => isCategoryHidden(kind, typ));
    });
  }
  // ── "My Likes" section (audio mode only) ──
  function renderLikedSection() {
    if (!homeLiked) return;
    if (state.kind !== 'audio' || !state.user) {
      homeLiked.hidden = true;
      return;
    }
    // Reset toggle on each render (default off = hide hidden items)
    if (likedShowHidden) likedShowHidden.checked = false;
    const visible = filterLikedByHidden(state.trackLikes, 'audio', false);
    if (visible.length === 0 && state.trackLikes.length === 0) { homeLiked.hidden = true; return; }
    homeLiked.hidden = false;
    if (likedCount) likedCount.textContent = visible.length + ' 首';
  }
  // ── "Liked Images" section (image mode only) ──
  function renderImageLikedSection() {
    if (!homeImageLiked) return;
    if (state.kind !== 'image' || !state.user) {
      homeImageLiked.hidden = true;
      return;
    }
    // Reset toggle on each render (default off = hide hidden items)
    if (likedImagesShowHidden) likedImagesShowHidden.checked = false;
    const allLikes = state.imageLikes || [];
    const likes = filterLikedByHidden(allLikes, 'image', false);
    if (likes.length === 0 && allLikes.length === 0) { homeImageLiked.hidden = true; return; }
    homeImageLiked.hidden = false;
    if (likedImagesCount) likedImagesCount.textContent = likes.length + ' 张';
    renderImageLikedGrid(likes);
  }
  function renderImageLikedGrid(likes) {
    if (!likedImagesScroll) return;
    likedImagesScroll.innerHTML = likes.map((t) => {
      const url = '/image-thumbs/' + encodeURIComponent(t.collectionId) + '/' + encodePath(t.file);
      return '<div class="gallery-thumb" data-col="' + escapeHtml(t.collectionId) + '" data-file="' + escapeHtml(t.file) + '">' +
        '<img src="' + url + '" alt="" loading="lazy">' +
      '</div>';
    }).join('');
    for (const thumb of likedImagesScroll.querySelectorAll('.gallery-thumb')) {
      thumb.addEventListener('click', () => {
        navigate('#/c/' + encodeURIComponent(thumb.dataset.col) +
                 '/play/' + encodeURIComponent(thumb.dataset.file));
      });
    }
  }
  if (viewLikedImagesBtn) viewLikedImagesBtn.addEventListener('click', () => {
    // Build a virtual collection from liked images for gallery view,
    // respecting the hidden filter toggle.
    const showHidden = likedImagesShowHidden ? likedImagesShowHidden.checked : false;
    const likes = filterLikedByHidden(state.imageLikes || [], 'image', showHidden);
    if (!likes.length) { toast('还没有收藏的图片', 'error'); return; }
    const episodes = likes.map((t, i) => ({
      file: t.file, title: t.file.replace(/^.*\//, '').replace(/\.[^.]+$/, ''),
      size: 0, mtime: 0, ext: '', order: i + 1,
      subtitles: [], qualities: null,
      _collectionId: t.collectionId,
    }));
    const virtualCol = {
      id: '__liked_images__', title: '我喜欢的图片', description: '', type: 'other',
      cover: null, episodes, episodeCount: episodes.length, totalSize: 0, _virtual: true,
    };
    state.currentCollection = virtualCol;
    navigate('#/c/__liked_images__/play/' + encodeURIComponent(episodes[0].file));
  });

  async function startPlayLiked(shuffle) {
    const showHidden = likedShowHidden ? likedShowHidden.checked : false;
    const filtered = filterLikedByHidden(state.trackLikes, 'audio', showHidden);
    if (!filtered.length) { toast('还没有喜欢的曲目', 'error'); return; }
    // Group by collection and fetch episode details
    const byCol = {};
    for (const t of filtered) {
      if (!byCol[t.collectionId]) byCol[t.collectionId] = [];
      byCol[t.collectionId].push(t.file);
    }
    const episodes = [];
    for (const [colId, files] of Object.entries(byCol)) {
      try {
        const res = await api('GET', '/api/collections/' + encodeURIComponent(colId));
        if (!res || !res.collection) continue;
        const col = res.collection;
        const fileSet = new Set(files);
        for (const ep of col.episodes) {
          if (fileSet.has(ep.file)) {
            episodes.push({
              file: ep.file, title: ep.title, size: ep.size, mtime: ep.mtime,
              ext: ep.ext, order: episodes.length + 1,
              trackNumber: ep.trackNumber, artist: ep.artist,
              subtitles: [], qualities: null,
              _collectionId: colId, _collectionTitle: col.title || colId,
            });
          }
        }
      } catch (_e) {}
    }
    if (!episodes.length) { toast('喜欢的曲目已不可用', 'error'); return; }
    if (shuffle) {
      for (let i = episodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [episodes[i], episodes[j]] = [episodes[j], episodes[i]];
      }
    }
    const virtualCol = {
      id: '__liked_audio__',
      title: '我喜欢',
      description: '',
      type: 'other',
      cover: null,
      episodes: episodes,
      episodeCount: episodes.length,
      totalSize: episodes.reduce((s, e) => s + (e.size || 0), 0),
      _virtual: true,
    };
    state.currentCollection = virtualCol;
    state.specifiedPlayScope = null;
    navigate('#/c/__liked_audio__/play/' + encodeURIComponent(episodes[0].file));
  }
  if (playLikedBtn) playLikedBtn.addEventListener('click', () => startPlayLiked(false));
  if (playLikedShuffleBtn) playLikedShuffleBtn.addEventListener('click', () => startPlayLiked(true));
  // Toggle hidden filter for audio likes
  if (likedShowHidden) likedShowHidden.addEventListener('change', () => {
    const showHidden = likedShowHidden.checked;
    const visible = filterLikedByHidden(state.trackLikes, 'audio', showHidden);
    if (likedCount) likedCount.textContent = visible.length + ' 首';
  });
  // Toggle hidden filter for image likes
  if (likedImagesShowHidden) likedImagesShowHidden.addEventListener('change', () => {
    const showHidden = likedImagesShowHidden.checked;
    const visible = filterLikedByHidden(state.imageLikes || [], 'image', showHidden);
    if (likedImagesCount) likedImagesCount.textContent = visible.length + ' 张';
    renderImageLikedGrid(visible);
  });

  // ── Tracklist toggle for "Play All" section ──
  let playAllTracklistLoaded = false;
  if (playAllToggle) playAllToggle.addEventListener('click', async () => {
    if (!playAllTracklist) return;
    const wasHidden = playAllTracklist.hidden;
    playAllTracklist.hidden = !wasHidden;
    playAllToggle.textContent = wasHidden ? '▲' : '▼';
    if (wasHidden && !playAllTracklistLoaded) {
      playAllTracklist.innerHTML = '<li class="mono" style="justify-content:center;color:var(--text-muted)">加载中...</li>';
      try {
        const res = await api('GET', '/api/all-episodes');
        const eps = (res && res.episodes) || [];
        playAllTracklist.innerHTML = eps.map((e, i) =>
          '<li data-col="' + escapeHtml(e.collectionId) + '" data-file="' + escapeHtml(e.file) + '">' +
            '<span class="tl-num mono">' + (i + 1) + '</span>' +
            '<span class="tl-title">' + escapeHtml(e.title) + '</span>' +
            '<span class="tl-col">' + escapeHtml(e.collectionTitle) + '</span>' +
          '</li>'
        ).join('') || '<li class="mono" style="justify-content:center">（空）</li>';
        playAllTracklistLoaded = true;
        for (const li of playAllTracklist.querySelectorAll('li[data-file]')) {
          li.addEventListener('click', () => {
            const colId = li.dataset.col;
            const file = li.dataset.file;
            navigate('#/c/' + encodeURIComponent(colId) + '/play/' + encodeURIComponent(file));
          });
        }
      } catch (e) {
        playAllTracklist.innerHTML = '<li class="mono" style="color:var(--danger)">加载失败</li>';
      }
    }
  });

  // ── Tracklist toggle for "Liked" section ──
  if (playLikedToggle) playLikedToggle.addEventListener('click', () => {
    if (!playLikedTracklist) return;
    const wasHidden = playLikedTracklist.hidden;
    playLikedTracklist.hidden = !wasHidden;
    playLikedToggle.textContent = wasHidden ? '▲' : '▼';
    if (wasHidden) {
      const likes = state.trackLikes || [];
      playLikedTracklist.innerHTML = likes.map((t, i) =>
        '<li data-col="' + escapeHtml(t.collectionId) + '" data-file="' + escapeHtml(t.file) + '">' +
          '<span class="tl-num mono">' + (i + 1) + '</span>' +
          '<span class="tl-title">' + escapeHtml(t.file.replace(/^.*\//, '').replace(/\.[^.]+$/, '')) + '</span>' +
          '<span class="tl-col">' + escapeHtml(t.collectionId) + '</span>' +
        '</li>'
      ).join('') || '<li class="mono" style="justify-content:center">（空）</li>';
      for (const li of playLikedTracklist.querySelectorAll('li[data-file]')) {
        li.addEventListener('click', () => {
          const colId = li.dataset.col;
          const file = li.dataset.file;
          navigate('#/c/' + encodeURIComponent(colId) + '/play/' + encodeURIComponent(file));
        });
      }
    }
  });

  function renderCards() {
    const frag = document.createDocumentFragment();
    for (const col of state.collections) {
      const card = document.createElement('div');
      const hasCover = !!col.cover;
      const selected = state.bulkColMode && state.bulkColSelected.has(col.id);
      card.className = 'card'
        + (hasCover ? ' card-has-cover' : '')
        + (state.bulkColMode ? ' bulk-mode' : '')
        + (selected ? ' bulk-selected' : '');
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.dataset.id = col.id;
      if (hasCover) applyCoverVars(card, col);
      const colProgress = state.progressAll[col.id] || {};
      const watched = countWatched(colProgress);
      const watchBadge = state.user && col.episodeCount > 0
        ? `<span class="card-watch">${watched}/${col.episodeCount}</span>` : '';
      const favStar = state.favorites.has(col.id) ? '<span class="card-fav-mark">★</span>' : '';
      // Bulk-mode checkbox overlay. Appears only when state.bulkColMode
      // is on. The protected flag short-circuits selection since we
      // skip protected collections in batch ops anyway (see bulk-col
      // handlers); rendering the checkbox would be misleading.
      const bulkCheck = state.bulkColMode && !col.protected
        ? `<div class="card-bulk-check" data-icon="${selected ? 'checkbox-on' : 'checkbox'}" aria-hidden="true"></div>`
        : '';
      card.innerHTML = `
        ${favStar}
        ${bulkCheck}
        <div class="card-body">
          <div class="card-type" title="${escapeHtml(clientPathLabel(state.kind, col.type))}">${escapeHtml(disambigTypeLabel(state.kind, col.type))}</div>
          <div class="card-name">${escapeHtml(col.title || col.id)}</div>
          <div class="card-meta">
            <span>${col.episodeCount} ${countUnit()}</span>
            <span>${formatSize(col.totalSize)}</span>
            ${watchBadge}
          </div>
        </div>
      `;
      card.addEventListener('click', () => {
        if (state.bulkColMode) {
          // In bulk mode, clicking toggles selection instead of
          // navigating. Protected collections can't be selected.
          if (col.protected) {
            toast('受保护的合集不能批量操作', 'warning');
            return;
          }
          const nowSelected = !state.bulkColSelected.has(col.id);
          if (nowSelected) state.bulkColSelected.add(col.id);
          else state.bulkColSelected.delete(col.id);
          // Update only the clicked card in place. A full renderCards()
          // rebuilds the whole grid (cardsEl.innerHTML = ''), which resets
          // the scroll position to the top — jarring when selecting after
          // scrolling down. Toggling the class + checkbox icon avoids that.
          card.classList.toggle('bulk-selected', nowSelected);
          const checkEl = card.querySelector('.card-bulk-check');
          if (checkEl) {
            checkEl.dataset.icon = nowSelected ? 'checkbox-on' : 'checkbox';
            injectIcons(card);
          }
          updateBulkColBar();
          return;
        }
        navigate('#/c/' + encodeURIComponent(col.id));
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          if (state.bulkColMode) card.click();
          else navigate('#/c/' + encodeURIComponent(col.id));
        }
      });
      frag.appendChild(card);
    }
    // "+" new-collection tile — needs create permission, shown under any
    // filter except text-search, fav, or bulk mode. Clicking pre-fills
    // the active type.
    if (canPerm('create') && !state.filter.q && !state.filter.fav && !state.bulkColMode) {
      const addCard = document.createElement('div');
      addCard.className = 'card card-add';
      addCard.setAttribute('role', 'button');
      addCard.setAttribute('tabindex', '0');
      addCard.innerHTML = `
        <div class="card-body">
          <div class="card-plus">+</div>
          <div class="card-meta"><span>新建合集</span></div>
        </div>
      `;
      // Pre-fill the create dialog with the single selected chip, if
      // exactly one is selected. Multi-chip → no primary suggestion.
      const presetType = state.filter.types.size === 1
        ? state.filter.types.values().next().value
        : 'all';
      addCard.addEventListener('click', () => openCreateDialog(presetType));
      addCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openCreateDialog(presetType); }
      });
      frag.appendChild(addCard);
    }
    cardsEl.innerHTML = '';
    if (!state.collections.length) {
      const msg = state.filter.q || state.filter.types.size > 0 || state.filter.fav
        ? '没有匹配的合集'
        : (state.user ? '还没有合集 · 点 + 新建' : '还没有合集 · 登录后创建');
      cardsEl.innerHTML = '<div class="cards-status">' + escapeHtml(msg) + '</div>';
    }
    cardsEl.appendChild(frag);
    injectIcons(cardsEl);
  }
  function countWatched(colProgress) {
    let n = 0;
    for (const file in colProgress) {
      const p = colProgress[file];
      if (!p) continue;
      if (p.watched === true) { n++; continue; }
      if (p.duration && p.position / p.duration > 0.9) n++;
    }
    return n;
  }

  // =================================================================
  // Bulk collection management (home-page admin tool).
  //
  // Distinct from state.manageMode which is the *episode-level* bulk
  // mode that runs inside a collection detail view. Here we let the
  // admin toggle into a mode where every card gets a checkbox, they
  // click to select, then the docked bottom bar (#bulk-col-bar) offers
  // three batch operations: re-tag, delete (with two-stage confirm),
  // and change resume mode.
  //
  // Uses the existing per-collection PATCH / DELETE routes rather
  // than a new batch endpoint — for a personal NAS with dozens of
  // collections, a short Promise.allSettled() storm is fine, and
  // avoids adding a new endpoint to the server.
  // =================================================================
  function enterBulkColMode() {
    if (!isAdmin()) return;
    state.bulkColMode = true;
    state.bulkColSelected.clear();
    bulkColBar.hidden = false;
    if (homeBulkBtn) homeBulkBtn.classList.add('active');
    document.body.classList.add('bulk-col-active');
    updateBulkColBar();
    // Refresh chip / sub-chip visuals so the active selection still
    // reads correctly under bulk mode (without this, the chips kept
    // their state but the sub-stack rows could lag, making it look
    // like the tag filter went dead). 1.5.0+: bulk mode no longer
    // implies includeHidden — the 含隐藏 checkbox is the sole admin
    // gate. Want to batch-edit hidden collections? Tick 含隐藏 first,
    // then enter bulk mode.
    try { applyKindUI(); } catch (_e) {}
    syncChipActiveState();
    reloadHome();
  }
  function exitBulkColMode() {
    state.bulkColMode = false;
    state.bulkColSelected.clear();
    bulkColBar.hidden = true;
    if (homeBulkBtn) homeBulkBtn.classList.remove('active');
    document.body.classList.remove('bulk-col-active');
    try { applyKindUI(); } catch (_e) {}
    syncChipActiveState();
    // Re-fetch without includeHidden so the visible list goes back to
    // the normal "全部 view hides hidden" behaviour once bulk mode ends.
    reloadHome();
  }
  // Mirror state.filter.types onto the chip strip's `.active` classes.
  // Used after bulk-mode transitions so the chip visual matches the
  // actual filter even when we didn't go through the chip click path.
  function syncChipActiveState() {
    const selected = state.filter.types;
    for (const b of filterChips.querySelectorAll('button')) {
      const bt = b.dataset.type;
      const on = (bt === 'all') ? selected.size === 0 : selected.has(bt);
      b.classList.toggle('active', on);
    }
  }
  function updateBulkColBar() {
    if (bulkColCount) bulkColCount.textContent = String(state.bulkColSelected.size);
    const hasAny = state.bulkColSelected.size > 0;
    for (const btn of [bulkColRetag, bulkColAuthors, bulkColResume, bulkColPretranscode, bulkColDelete]) {
      if (btn) btn.disabled = !hasAny;
    }
  }

  // Run an async operation on every selected collection and refresh
  // the home page once done. Keeps the caller clean of Promise plumbing
  // and collects per-item failures into a toast summary.
  async function runBulkColOp(label, opFn) {
    const ids = Array.from(state.bulkColSelected);
    if (ids.length === 0) return;
    let ok = 0, fail = 0;
    const errors = [];
    for (const id of ids) {
      try {
        await opFn(id);
        ok++;
      } catch (e) {
        fail++;
        errors.push(id + ': ' + (e && e.message ? e.message : 'error'));
      }
    }
    if (fail === 0) {
      toast(label + ' 完成 · ' + ok + ' 个合集', 'success');
    } else {
      toast(label + ' · 成功 ' + ok + ' 失败 ' + fail + (errors.length ? ' · ' + errors[0] : ''), 'error');
    }
    exitBulkColMode();
    await reloadHome();
  }

  // Bulk select-all / clear-all over the *currently rendered* list.
  // Protected collections (e.g. audio _default) are skipped — they
  // can't be batch-modified anyway.
  function bulkColSelectAllVisible() {
    if (!isAdmin() || !state.bulkColMode) return;
    let added = 0;
    for (const col of state.collections) {
      if (col.protected) continue;
      if (!state.bulkColSelected.has(col.id)) {
        state.bulkColSelected.add(col.id);
        added++;
      }
    }
    renderCards();
    updateBulkColBar();
    if (added > 0) toast('已全选 ' + state.bulkColSelected.size + ' 个合集', 'success');
  }
  function bulkColClearSelection() {
    if (state.bulkColSelected.size === 0) return;
    state.bulkColSelected.clear();
    renderCards();
    updateBulkColBar();
  }

  // Re-tag dialog: chip multi-select over every category for the
  // current kind (including ones marked hidden — admin needs to see
  // the full set to move collections into / out of hidden categories).
  // Submits PATCH {types:[...]} per selected collection — first chip
  // is the primary tag.
  function bulkColChangeTag() {
    if (state.bulkColSelected.size === 0) return;
    const cats = (state.categories && state.categories[state.kind]) || [];
    if (cats.length === 0) { toast('没有可用的标签', 'warning'); return; }
    if (bulkRetagError) bulkRetagError.textContent = '';
    if (bulkRetagSubtitle) {
      bulkRetagSubtitle.textContent = '为已选 ' + state.bulkColSelected.size + ' 个合集设置新标签';
    }
    const listEl = bulkRetagForm.querySelector('[data-list="bulk-retag"]');
    renderTypesCheckboxList(listEl, []);
    bulkRetagDialog.showModal();
  }
  async function bulkColChangeTagSubmit(ev) {
    ev.preventDefault();
    const listEl = bulkRetagForm.querySelector('[data-list="bulk-retag"]');
    const types = readTypesFromList(listEl);
    if (types.length === 0) {
      if (bulkRetagError) bulkRetagError.textContent = '至少选择一个标签';
      return;
    }
    bulkRetagDialog.close();
    await runBulkColOp('改标签', (id) =>
      api('PATCH', '/api/collections/' + encodeURIComponent(id), { types })
    );
  }

  // Bulk authors dialog. Three modes:
  //   append  → fetch each collection's current authors and merge new
  //             ones in (dedup by case-folded value).
  //   replace → overwrite each collection's authors with the dialog list.
  //   clear   → empty out authors on every selected collection.
  // Reuses the chip-input wiring from create/edit so the entry UX is
  // identical (datalist autocomplete from /api/authors).
  function bulkColChangeAuthors() {
    if (state.bulkColSelected.size === 0) return;
    if (bulkAuthorsError) bulkAuthorsError.textContent = '';
    if (bulkAuthorsSubtitle) {
      bulkAuthorsSubtitle.textContent = '为已选 ' + state.bulkColSelected.size + ' 个合集修改作者 / 公司';
    }
    const listEl = bulkAuthorsForm.querySelector('.authors-chip-list[data-list="bulk-authors"]');
    const inputEl = bulkAuthorsForm.querySelector('.author-input[data-list="bulk-authors"]');
    renderAuthorsChipList(listEl, []);
    wireAuthorInput(inputEl, listEl);
    refreshAuthorsDatalist();
    // Default mode reset to append on each open so a one-off "clear"
    // doesn't silently persist into the next session.
    const radios = bulkAuthorsForm.querySelectorAll('input[name="bulk-authors-mode"]');
    for (const r of radios) r.checked = (r.value === 'append');
    bulkAuthorsDialog.showModal();
  }
  async function bulkColChangeAuthorsSubmit(ev) {
    ev.preventDefault();
    const listEl = bulkAuthorsForm.querySelector('.authors-chip-list[data-list="bulk-authors"]');
    const authors = readAuthorsFromList(listEl);
    let mode = 'append';
    for (const r of bulkAuthorsForm.querySelectorAll('input[name="bulk-authors-mode"]')) {
      if (r.checked) { mode = r.value; break; }
    }
    if (mode !== 'clear' && authors.length === 0) {
      if (bulkAuthorsError) bulkAuthorsError.textContent = '请至少添加一个作者 / 公司，或选择「清空」模式';
      return;
    }
    bulkAuthorsDialog.close();
    const norm = (s) => String(s || '').trim().toLowerCase();
    if (mode === 'replace') {
      await runBulkColOp('改作者 / 公司', (id) =>
        api('PATCH', '/api/collections/' + encodeURIComponent(id), { authors })
      );
    } else if (mode === 'clear') {
      await runBulkColOp('清空作者 / 公司', (id) =>
        api('PATCH', '/api/collections/' + encodeURIComponent(id), { authors: [] })
      );
    } else {
      // append: GET current authors per collection, merge dedup, PATCH.
      // The extra GET round-trip is fine — bulk is admin-triggered with
      // dozens of items at most, and the existing single-collection
      // PATCH route is reused intentionally to avoid a new endpoint.
      await runBulkColOp('追加作者 / 公司', async (id) => {
        const { collection } = await api('GET', '/api/collections/' + encodeURIComponent(id));
        const cur = Array.isArray(collection && collection.authors) ? collection.authors : [];
        const seen = new Set(cur.map(norm));
        const merged = cur.slice();
        for (const a of authors) {
          if (seen.has(norm(a))) continue;
          merged.push(a);
          seen.add(norm(a));
        }
        return api('PATCH', '/api/collections/' + encodeURIComponent(id), { authors: merged });
      });
    }
  }

  async function bulkColChangeResume() {
    if (state.bulkColSelected.size === 0) return;
    const picked = window.prompt(
      '为已选 ' + state.bulkColSelected.size + ' 个合集设置播放模式:\n\n' +
      'continue = 继续播放（记住进度）\n' +
      'restart = 从头开始（每次从 0 开始）\n\n输入:',
      'continue'
    );
    if (!picked) return;
    const v = picked.trim().toLowerCase();
    if (v !== 'continue' && v !== 'restart') {
      toast('只能填 continue 或 restart', 'error'); return;
    }
    await runBulkColOp('改播放模式', (id) =>
      api('PATCH', '/api/collections/' + encodeURIComponent(id), { resumeMode: v })
    );
  }

  // Delete with two-stage confirmation per user spec. First dialog
  // asks "are you sure", second dialog is a last-chance safety net
  // and explicitly warns that the operation is irreversible.
  async function bulkColDeleteSelected() {
    if (state.bulkColSelected.size === 0) return;
    const n = state.bulkColSelected.size;
    const first = window.confirm('即将删除 ' + n + ' 个合集。继续？');
    if (!first) return;
    const second = window.confirm(
      '最后一次确认：\n\n这 ' + n + ' 个合集及其所有内容将被永久删除，\n操作不可恢复。\n\n确定删除？'
    );
    if (!second) return;
    await runBulkColOp('删除', (id) =>
      api('DELETE', '/api/collections/' + encodeURIComponent(id) + '?force=1')
    );
  }

  if (homeBulkBtn) {
    homeBulkBtn.addEventListener('click', () => {
      if (state.bulkColMode) exitBulkColMode();
      else enterBulkColMode();
    });
  }
  if (bulkColExit)      bulkColExit.addEventListener('click', exitBulkColMode);
  if (bulkColSelectAll) bulkColSelectAll.addEventListener('click', bulkColSelectAllVisible);
  if (bulkColClearSel)  bulkColClearSel.addEventListener('click', bulkColClearSelection);
  if (bulkColRetag)     bulkColRetag.addEventListener('click', bulkColChangeTag);
  if (bulkColAuthors)   bulkColAuthors.addEventListener('click', bulkColChangeAuthors);
  if (bulkColResume)    bulkColResume.addEventListener('click', bulkColChangeResume);
  if (bulkColPretranscode) bulkColPretranscode.addEventListener('click', async () => {
    // Bulk pretranscode: loop over selected video collections,
    // POST /pretranscode-mkv each. Server itself filters non-mkv
    // and already-cached files; we just dispatch + aggregate
    // counts for the toast. Non-video collections are silently
    // skipped (the endpoint will succeed with totalMkvs:0).
    const ids = Array.from(state.bulkColSelected);
    if (ids.length === 0) return;
    // 1.10.1: explicit warning before batch enqueueing — re-iterates
    // the rule that transcoding is only meant for mkv with broken
    // browser audio. Users in v1.10.0 occasionally batched the whole
    // library "just in case", wasting NAS CPU and cache.
    const ok = window.confirm(
      '注意：转码只用于「mkv 导入且浏览器播放时没声音」的修复。\n'
      + '本批操作会扫描已选 ' + ids.length + ' 个合集所有 mkv 并入队（服务端会跳过音轨已 OK 的）。\n'
      + '正常能播放的文件不需要转码 — 转码不会提升画质，只会占用 NAS CPU 与缓存。\n\n'
      + '确定继续吗？',
    );
    if (!ok) return;
    bulkColPretranscode.disabled = true;
    let totalAdded = 0, totalSkipped = 0, totalMkvs = 0, errors = 0;
    let queueSize = 0;
    for (const id of ids) {
      const d = await enqueuePretranscodeForCollection(id, { silent: true });
      if (!d) { errors++; continue; }
      totalAdded += d.added || 0;
      totalSkipped += (d.skippedCached || 0) + (d.skippedQueued || 0) + (d.skippedH264 || 0);
      totalMkvs += d.totalMkvs || 0;
      queueSize = d.queueSize || queueSize;
    }
    bulkColPretranscode.disabled = false;
    const lvl = totalAdded > 0 ? 'success' : (errors > 0 ? 'warning' : 'info');
    toast(ids.length + ' 集合 / mkv ' + totalMkvs + ' / 新入队 ' + totalAdded + ' / 跳过 ' + totalSkipped + (errors ? ' / 失败 ' + errors : '') + ' / 队列 ' + queueSize, lvl, 6000);
  });
  if (bulkColDelete)    bulkColDelete.addEventListener('click', bulkColDeleteSelected);
  if (bulkRetagForm)    bulkRetagForm.addEventListener('submit', bulkColChangeTagSubmit);
  if (bulkRetagCancel)  bulkRetagCancel.addEventListener('click', () => bulkRetagDialog.close());
  if (bulkAuthorsForm)   bulkAuthorsForm.addEventListener('submit', bulkColChangeAuthorsSubmit);
  if (bulkAuthorsCancel) bulkAuthorsCancel.addEventListener('click', () => bulkAuthorsDialog.close());
  // Operator switcher visibility + active-button sync. Hidden when no
  // chip is selected (operator is irrelevant). Called after chip click
  // and on initial load via syncFilterOpUI().
  function syncFilterOpUI() {
    if (!filterOpBar) return;
    const sel = state.filter.types;
    filterOpBar.hidden = !sel || sel.size === 0;
    for (const b of filterOpBar.querySelectorAll('button[data-op]')) {
      b.classList.toggle('active', b.dataset.op === state.filter.typeOp);
    }
  }

  // Mobile-only: synthesise a one-line summary of the current filter state
  // for the collapsed toolbar pill. Called from reloadHome (every render)
  // so changes to chips / search / fav / op / sort all flow through.
  // Desktop ignores this — the pill is hidden by CSS.
  function updateToolbarSummary() {
    const el = document.getElementById('toolbar-summary-text');
    if (!el) return;
    const parts = [];
    if (state.filter.types && state.filter.types.size > 0) {
      const arr = Array.from(state.filter.types);
      const op = state.filter.typeOp || 'OR';
      const first = typeLabel(arr[0]);
      if (arr.length === 1) parts.push(first);
      else parts.push(first + ' +' + (arr.length - 1) + ' ' + op);
    }
    if (state.filter.q) {
      const q = state.filter.q.length > 16 ? state.filter.q.slice(0, 16) + '…' : state.filter.q;
      parts.push('搜: ' + q);
    }
    if (state.filter.fav) parts.push('★ 收藏');
    if (parts.length === 0) parts.push('全部');
    el.textContent = parts.join(' · ');
  }

  // Wire the mobile collapse/expand toggle. Click on the summary pill
  // flips .home-toolbar.expanded which the CSS uses to switch between
  // the compact one-line layout and the full chip / sort / search /
  // admin column.
  const toolbarExpandBtn = document.getElementById('toolbar-expand-btn');
  if (toolbarExpandBtn) {
    toolbarExpandBtn.addEventListener('click', () => {
      const tb = document.querySelector('.home-toolbar');
      if (!tb) return;
      tb.classList.toggle('expanded');
    });
  }
  if (filterOpBar) {
    filterOpBar.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-op]');
      if (!b) return;
      const op = b.dataset.op;
      if (op !== 'OR' && op !== 'AND' && op !== 'NOT' && op !== 'ONLY') return;
      state.filter.typeOp = op;
      // Switching INTO ONLY: collapse multi-selection to the most
      // recently added tag. Set preserves insertion order, so the last
      // entry from Array.from is "the last one the user clicked".
      if (op === 'ONLY' && state.filter.types.size > 1) {
        const arr = Array.from(state.filter.types);
        const last = arr[arr.length - 1];
        state.filter.types.clear();
        state.filter.types.add(last);
        // Sync chip active state to the new single-tag selection.
        for (const cb of filterChips.querySelectorAll('button')) {
          const ct = cb.dataset.type;
          const on = (ct === 'all') ? false : (ct === last);
          cb.classList.toggle('active', on);
        }
      }
      try { localStorage.setItem(FILTER_TYPE_OP_KEY, op); } catch (_e) {}
      syncFilterOpUI();
      reloadHome();
    });
  }
  // Sub-chip rail click — uses the SAME op-aware logic as top-chip
  // click. Decoupling selection from auto-expand was the 1.2.8 design
  // call: previously sub-chip click killed the parent (path-aware
  // replace) which clashed with auto-expand because removing the
  // parent eliminated the visual cue that we were inside its subtree.
  // Now both top and sub chips obey filter.typeOp:
  //   ONLY → replace entire selection with this single chip
  //   OR / AND / NOT → toggle add/remove (selection accumulates)
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#filter-substack .filter-sub-row button[data-type]');
    if (!btn) return;
    const t = btn.dataset.type;
    if (state.filter.typeOp === 'ONLY') {
      if (state.filter.types.has(t) && state.filter.types.size === 1) {
        state.filter.types.clear();
      } else {
        state.filter.types.clear();
        state.filter.types.add(t);
      }
    } else {
      if (state.filter.types.has(t)) state.filter.types.delete(t);
      else state.filter.types.add(t);
    }
    syncFilterOpUI();
    applyKindUI();
    reloadHome();
  });

  filterChips.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-type]');
    if (!btn) return;
    const t = btn.dataset.type;
    // "全部" is a clear-all gesture, not a tag. Clicking it empties
    // the selection and falls back to the unfiltered home view.
    if (t === 'all') {
      state.filter.types.clear();
    } else if (state.filter.typeOp === 'ONLY') {
      // ONLY mode: clicking a chip is a radio-button gesture — replace
      // the entire selection with just this tag, or clear if it was
      // already the active one (toggle-off).
      if (state.filter.types.has(t) && state.filter.types.size === 1) {
        state.filter.types.clear();
      } else {
        state.filter.types.clear();
        state.filter.types.add(t);
      }
    } else {
      // Toggle membership. Holding shift behaves identically to a
      // simple click — we don't differentiate "single-select with
      // shift" because chips are already a list-style multi-control.
      if (state.filter.types.has(t)) state.filter.types.delete(t);
      else state.filter.types.add(t);
    }
    const selected = state.filter.types;
    for (const b of filterChips.querySelectorAll('button')) {
      const bt = b.dataset.type;
      const on = (bt === 'all') ? selected.size === 0 : selected.has(bt);
      b.classList.toggle('active', on);
    }
    syncFilterOpUI();
    // Re-run applyKindUI so the sub-stack (rows 2/3) tracks the new
    // selection. Without this the chip strip updates but the depth-1
    // / depth-2 rails stay stuck on whatever the previous selection
    // implied — picking a top-level chip with children wouldn't show
    // its row 2, and picking one without children wouldn't clear an
    // older row 2 still on screen.
    applyKindUI();
    reloadHome();
  });
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    state.filter.q = searchInput.value.trim();
    if (searchTimer) clearTimeout(searchTimer);
    searchTimer = setTimeout(reloadHome, 200);
  });
  favToggleIn.addEventListener('change', () => {
    state.filter.fav = favToggleIn.checked;
    reloadHome();
  });
  if (showHiddenIn) {
    showHiddenIn.addEventListener('change', () => {
      state.filter.includeHidden = showHiddenIn.checked;
      try { localStorage.setItem('ds124:includeHidden', showHiddenIn.checked ? '1' : '0'); } catch (e) {}
      reloadHome();
    });
  }
  sortSelect.addEventListener('change', () => {
    state.filter.sort = buildSortKey(sortSelect.value, state.filter.sortAsc);
    try { localStorage.setItem(SORT_KEY, sortSelect.value); } catch (e) {}
    reloadHome();
  });
  sortDirBtn.addEventListener('click', () => {
    state.filter.sortAsc = !state.filter.sortAsc;
    try { localStorage.setItem('ds124:sortAsc', state.filter.sortAsc ? '1' : '0'); } catch (e) {}
    state.filter.sort = buildSortKey(sortSelect.value, state.filter.sortAsc);
    updateSortDirUI();
    reloadHome();
  });
  function updateSortDirUI() {
    // Rewrite the inner [data-icon] span instead of putting data-icon
    // on the button itself. injectIcons.querySelectorAll('[data-icon]')
    // skips scope, so a button-level data-icon never gets painted; the
    // first click was inadvertently overwriting the SVG inside the
    // inner span (whose data-icon never updates again), leaving the
    // button frozen on whatever icon won the first paint.
    const name = state.filter.sortAsc ? 'sort-asc' : 'sort-desc';
    sortDirBtn.innerHTML = `<span data-icon="${name}"></span>`;
    if (sortDirBtn.dataset.icon) delete sortDirBtn.dataset.icon;
    injectIcons(sortDirBtn);
  }
  function buildSortKey(field, ascending) {
    return ascending ? field + '-asc' : field;
  }

  // ==================================================================
  // DETAIL
  // ==================================================================
  async function showDetail(id) {
    maybeActivateMiniPlayer();
    maybeActivateAudioMini();
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = id.toUpperCase();
    viewDetail.hidden = false;
    state.manageMode = false;
    state.selectedEpisodes.clear();
    manageBar.hidden = true;
    // Reset file-tree tab state for the new collection: drop any
    // cached tree from the previous collection and default to the
    // legacy "EPISODES" panel.
    state.currentTree = null;
    state.treeLoading = false;
    switchDetailTab('episodes');

    detailTitle.textContent = '加载中...';
    detailType.textContent = '';
    detailDesc.textContent = '';
    detailStats.textContent = '';
    applyCoverVars(detailCover, null);
    applyCoverVars(detailBg, null);
    episodeList.innerHTML = renderSkeletonList(6);
    commentList.innerHTML = '';
    detailToolbar.hidden = true;

    try {
      const [{ collection }, progressRes, commentsRes] = await Promise.all([
        api('GET', '/api/collections/' + encodeURIComponent(id)),
        state.user ? api('GET', '/api/progress').catch(() => ({ progress: {} }))
                   : Promise.resolve({ progress: {} }),
        api('GET', '/api/collections/' + encodeURIComponent(id) + '/comments').catch(() => ({ comments: [] })),
      ]);
      state.currentCollection = collection;
      state.progressAll = (progressRes && progressRes.progress) || {};
      state.currentComments = commentsRes.comments || [];

      if (state.user) {
        detailToolbar.hidden = false;
        injectIcons(detailToolbar);
      }
      updateFavButton(collection.id);
      // Show batch-like switch in audio mode
      if (actLikeAllWrap && actLikeAll) {
        if (state.kind === 'audio' && state.user && collection.episodes.length > 0) {
          actLikeAllWrap.hidden = false;
          const files = collection.episodes.map((e) => e.file);
          actLikeAll.checked = files.every((f) => isTrackLiked(collection.id, f));
        } else {
          actLikeAllWrap.hidden = true;
        }
      }

      detailTitle.textContent = collection.title || collection.id;
      // 1.1.0+: detail page has more space → show the full path of the
      // primary type ("魔法少女 / 叛逆") so admins know which subtree the
      // collection lives in. Card badges keep using the leaf label.
      detailType.textContent = clientPathLabel(state.kind, collection.type) || typeLabel(collection.type);
      detailStats.textContent = [collection.episodeCount + ' ' + countUnit(), formatSize(collection.totalSize)].join(' · ');
      // Authors row: hidden when none, otherwise comma-joined.
      if (detailAuthors) {
        const auths = Array.isArray(collection.authors) ? collection.authors : [];
        if (auths.length === 0) {
          detailAuthors.hidden = true;
          detailAuthors.textContent = '';
        } else {
          detailAuthors.hidden = false;
          detailAuthors.textContent = '作者 / 公司：' + auths.join(', ');
        }
      }
      detailDesc.textContent = collection.description || '';
      if (collection.cover) {
        applyCoverVars(detailCover, collection);
        applyCoverVars(detailBg, collection);
        detailHero.classList.add('has-cover');
      } else {
        applyCoverVars(detailCover, null);
        applyCoverVars(detailBg, null);
        detailHero.classList.remove('has-cover');
      }

      // ── Episode sort bar (hide for image mode) ──
      if (epSortBar && epSortSelect && epSortDirBtn) {
        const showSort = state.kind !== 'image';
        const pref = getEpSortPref(collection.id);
        syncSortBar(epSortSelect, epSortDirBtn, epSortBar, pref, showSort);
        // Remove old listeners by cloning elements
        const newSelect = epSortSelect.cloneNode(true);
        const newBtn = epSortDirBtn.cloneNode(true);
        epSortSelect.replaceWith(newSelect);
        epSortDirBtn.replaceWith(newBtn);
        // Update references (since we use const, reassign isn't possible;
        // but we can re-query once here for the handler scope).
        const sel = $('ep-sort-select');
        const btn = $('ep-sort-dir-btn');
        sel.addEventListener('change', () => {
          const p = getEpSortPref(collection.id);
          p.field = sel.value;
          setEpSortPref(collection.id, p.field, p.asc);
          btn.textContent = p.asc ? '↑' : '↓';
          renderEpisodeList(collection, episodeList, false);
        });
        btn.addEventListener('click', () => {
          const p = getEpSortPref(collection.id);
          p.asc = !p.asc;
          setEpSortPref(collection.id, p.field, p.asc);
          btn.textContent = p.asc ? '↑' : '↓';
          renderEpisodeList(collection, episodeList, false);
        });
      }
      // Image mode: render thumbnail grid instead of episode list
      if (state.kind === 'image') {
        renderDetailImageGrid(collection, episodeList);
      } else {
        renderEpisodeList(collection, episodeList, false);
      }

      const continueEp = findContinueEpisode(collection);
      const hasProgress = !!(continueEp && continueEp._hasProgress);
      // "继续播放" works for both audio and video; the old "继续观看"
      // is video-specific and reads wrong for audio collections where
      // the user is resuming a track, not watching anything.
      playContinueLabel.textContent = hasProgress ? '继续播放' : '播放';
      playStartBtn.hidden = !hasProgress;

      playContinueBtn.onclick = () => {
        if (!state.user) { navigate('#/login'); return; }
        const ep = continueEp || collection.episodes[0];
        if (!ep) return;
        state.pendingFreshStart = false;
        navigate('#/c/' + encodeURIComponent(collection.id) + '/play/' + encodeURIComponent(ep.file));
      };
      playStartBtn.onclick = () => {
        if (!state.user) { navigate('#/login'); return; }
        const first = collection.episodes[0];
        if (!first) return;
        state.pendingFreshStart = true;
        navigate('#/c/' + encodeURIComponent(collection.id) + '/play/' + encodeURIComponent(first.file));
      };

      countEl.textContent = collection.episodeCount + ' ' + countUnit();
      commentCompose.hidden = !state.user;
      commentText.value = '';
      commentError.textContent = '';
      renderComments();
    } catch (err) {
      detailTitle.textContent = '加载失败';
      detailDesc.textContent = err.message || '';
    }
  }
  function renderSkeletonList(n) {
    let html = '';
    for (let i = 0; i < n; i++) html += '<li class="skeleton-row"></li>';
    return html;
  }
  function updateFavButton(id) {
    const isFav = state.favorites.has(id);
    actFav.dataset.icon = isFav ? 'star-filled' : 'star-outline';
    actFav.innerHTML = ICONS[actFav.dataset.icon];
    actFav.classList.toggle('active', isFav);
    actFav.title = isFav ? '取消收藏' : '收藏';
  }

  // Detail toolbar actions
  actFav.addEventListener('click', () => {
    if (state.currentCollection) toggleFavorite(state.currentCollection.id);
  });
  // Batch like all tracks in collection (audio mode)
  if (actLikeAll) {
    actLikeAll.addEventListener('change', async () => {
      const col = state.currentCollection;
      if (!col || state.kind !== 'audio') return;
      const files = col.episodes.map((e) => e.file);
      const allLiked = files.every((f) => isTrackLiked(col.id, f));
      await batchToggleLikes(col.id, files, !allLiked);
      actLikeAll.checked = !allLiked;
      toast(!allLiked ? '已全部加入我喜欢' : '已全部移出我喜欢');
    });
  }
  actCover.addEventListener('click', () => {
    if (state.currentCollection) openCoverDialog(state.currentCollection);
  });
  actEdit.addEventListener('click', () => {
    if (state.currentCollection) openEditDialog(state.currentCollection);
  });
  // Accept lists MUST stay in sync with config.js VIDEO_EXTS + AUDIO_EXTS
   // + LYRIC_EXTS + IMAGE_EXTS. No audio/*,video/* wildcards — those let
   // through unsupported files that the server then rejects with a
   // confusing error. Explicit extensions make the OS file picker show
   // exactly what the server will accept.
  const VIDEO_ACCEPT = '.mp4,.m4v,.webm,.ogv,.ogg,.mov,.mkv,.avi,.wmv,.flv,.ts,.mts,.m2ts,.3gp,.rmvb,.rm,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif,.srt,.vtt';
  const AUDIO_ACCEPT = '.mp3,.m4a,.aac,.flac,.wav,.ogg,.oga,.opus,.wma,.ape,.alac,.aiff,.aif,.vtt,.srt,.ass,.ssa,.lrc,.txt,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif';
  const IMAGE_ACCEPT = '.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif';
  const NOVEL_ACCEPT = '.txt,.pdf,.jpg,.jpeg,.png,.webp,.gif,.bmp,.avif';
  actUpload.addEventListener('click', () => {
    if (!state.currentCollection) return;
    // Just-in-time switch. uploadInput is a single element shared by all
    // subsystems; the accept attribute is re-written to match state.kind
    // every time the user clicks upload, so the OS file picker's filter
    // always reflects the current collection's kind.
    uploadInput.accept = state.kind === 'audio' ? AUDIO_ACCEPT
      : state.kind === 'image' ? IMAGE_ACCEPT
      : state.kind === 'novel' ? NOVEL_ACCEPT
      : VIDEO_ACCEPT;
    uploadInput.click();
  });
  actIntro.addEventListener('click', () => {
    if (state.currentCollection) openIntroDialog(state.currentCollection);
  });
  if (actPretranscode) {
    actPretranscode.addEventListener('click', () => {
      if (!state.currentCollection) return;
      // Per-collection transcode is video-only — audio / image / novel
      // collections have no mkv to transcode. Hide the button visually
      // for non-video kinds; this guard catches the JS path too.
      if (state.kind !== 'video') {
        toast('仅视频集合需要转码 mkv', 'warning');
        return;
      }
      // v1.10.0+: open the picker modal instead of one-shot enqueueing
      // every mkv. Modal lists each .mkv with its cache state and lets
      // the admin tick rows. Old behavior is still reachable via the
      // bulk-manage bottom bar (multi-collection batch).
      openTranscodeModalForCollection(state.currentCollection.id);
    });
  }
  actManage.addEventListener('click', () => {
    if (!state.currentCollection) return;
    if (state.manageMode) exitManageMode();
    else enterManageMode();
  });
  actDelete.addEventListener('click', () => {
    if (state.currentCollection) confirmDeleteCollection(state.currentCollection);
  });

  async function toggleFavorite(id) {
    if (!state.user) return;
    try {
      if (state.favorites.has(id)) {
        await api('DELETE', '/api/favorites/' + encodeURIComponent(id));
        state.favorites.delete(id);
        toast('已取消收藏');
      } else {
        await api('POST', '/api/favorites/' + encodeURIComponent(id));
        state.favorites.add(id);
        toast('已收藏', 'success');
      }
      updateFavButton(id);
    } catch (err) {
      toast('操作失败: ' + err.message, 'error');
    }
  }

  // Extract the directory prefix from an episode's relative file path.
  // Root files return '' (empty string); nested files return everything
  // up to the last '/'. Used by renderEpisodeList to decide when to
  // emit a `// Season 1/` group header between episodes.
  function epDir(file) {
    const i = String(file || '').lastIndexOf('/');
    return i < 0 ? '' : file.slice(0, i);
  }

  function renderEpisodeList(collection, listEl, isSidebar) {
    const colProgress = state.progressAll[collection.id] || {};
    const canEdit = canPerm('delete') && !isSidebar;
    // The player sidebar (isSidebar) is the session play queue — render
    // it in play-queue order and make it reorderable. The detail-page
    // list (browse / admin) keeps the persisted sort + admin drag-order.
    const pref = getEpSortPref(collection.id);
    const eps = isSidebar
      ? orderedEpisodes(collection)
      : sortEpisodes(collection.episodes, pref.field, pref.asc);
    // Track the directory the current row sits in, so we can insert
    // a group header whenever the path prefix changes. collection.episodes
    // is already sorted tree-walk order by the backend, which means
    // episodes sharing a directory are contiguous and one pass suffices.
    let lastDir = null;
    const pieces = [];
    for (const ep of eps) {
      const dir = epDir(ep.file);
      if (dir !== lastDir) {
        lastDir = dir;
        if (dir) {
          // Non-root subdirectory reached — emit an uppercase path
          // label. The header is non-interactive (pointer-events: none
          // in CSS) so clicks fall through to whatever's beneath.
          pieces.push(
            `<li class="ep-group-header">// <span class="ep-group-path">${escapeHtml(dir)}/</span></li>`
          );
        }
      }
      const isNested = dir !== '';
      const p = colProgress[ep.file];
      let pct = 0, finished = false;
      if (p) {
        if (p.watched === true) finished = true;
        if (p.duration) {
          pct = Math.max(0, Math.min(100, (p.position / p.duration) * 100));
          if (pct > 90) finished = true;
        }
      }
      const active = state.currentFile === ep.file ? ' active' : '';
      const done = finished ? ' done' : '';
      const selected = state.selectedEpisodes.has(ep.file) ? ' selected' : '';
      const nested = isNested ? ' nested' : '';
      const progressBar = (p && p.position > 0 && !finished)
        ? `<div class="ep-progress"><span style="width:${pct}%"></span></div>` : '';
      const subsBadge = ep.subtitles && ep.subtitles.length
        ? `<span class="ep-sub-badge mono">CC</span>` : '';
      // Every container is playable now — ffmpeg handles the ones the
      // browser can't decode natively via /media-stream. The old
      // "仅下载" download-only badge is gone with the preempt path.
      const dlBadge = '';
      // Per-track embedded cover thumbnail — only for audio kind.
      // CSS background-image silently degrades on 404, so tracks
      // without embedded art render as a blank cell (no error, no
      // broken-image icon). Kind-gated so the video episode list
      // keeps its existing compact layout. Nested tracks use encodePath
      // so the subfolder separator survives the round trip.
      const trackCover = (state.kind === 'audio')
        ? `<div class="ep-cover" style="background-image:url('/audio/api/collections/${encodeURIComponent(collection.id)}/episodes/${encodePath(ep.file)}/cover')"></div>`
        : '';
      // Bulk-select checkbox, reorder drag handle and the per-episode
      // submenu are all suppressed for nested episodes — the backend
      // edit routes only accept single-segment :file (path-traversal
      // hardening) and changing that is out of scope for this pass.
      // Nested episodes are therefore read-only: playable, progress-
      // tracked, but not renameable/deletable/movable from the UI.
      const editableHere = canEdit && !isNested;
      const manageCheckbox = (state.manageMode && editableHere)
        ? `<div class="ep-check" data-icon="${state.selectedEpisodes.has(ep.file) ? 'checkbox-on' : 'checkbox'}"></div>`
        : '';
      const submenuBtn = editableHere
        ? `<button type="button" class="ep-submenu-btn" data-file="${encodeURIComponent(ep.file)}" title="更多" aria-label="更多"><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg></button>`
        : '';
      // Reorder grip — shown on the player sidebar (session queue) AND on
      // the detail page for editable rows (admin persisted order). Both
      // drive the pointer-based reorder. Up/down buttons are queue-only.
      const showGrip = isSidebar || (editableHere && !state.manageMode);
      const queueGrip = showGrip ? `<span class="q-grip" title="拖动排序" aria-label="拖动排序">⠿</span>` : '';
      const queueMoves = isSidebar
        ? `<span class="q-moves"><button type="button" class="q-up" title="上移" aria-label="上移">▲</button><button type="button" class="q-down" title="下移" aria-label="下移">▼</button></span>`
        : '';
      pieces.push(`
        <li class="ep-row${active}${done}${selected}${nested}${showGrip ? ' q-row' : ''}" data-file="${encodeURIComponent(ep.file)}">
          ${manageCheckbox}
          ${queueGrip}
          <div class="ep-index mono">${String(ep.order).padStart(2, '0')}</div>
          ${trackCover}
          <div class="ep-body">
            <div class="ep-title">${escapeHtml(ep.title)} ${subsBadge}${dlBadge}</div>
            <div class="ep-meta mono">${escapeHtml(ep.ext.toUpperCase())} · ${formatSize(ep.size)}${finished ? ' · 已播完' : (p && p.position > 0 ? ' · ' + formatTime(p.position) : '')}</div>
            ${progressBar}
            ${ep.description ? `<div class="ep-desc">${escapeHtml(ep.description)}</div>` : ''}
          </div>
          ${submenuBtn}
          ${queueMoves}
        </li>
      `);
    }
    const html = pieces.join('');
    listEl.innerHTML = html || '<li class="ep-empty">此合集还没有集数</li>';
    injectIcons(listEl);

    for (const row of listEl.querySelectorAll('li.ep-row[data-file]')) {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.ep-submenu-btn')) return;
        // Reorder controls (sidebar queue) manipulate the queue, not playback.
        if (e.target.closest('.q-grip, .q-up, .q-down')) return;
        const file = decodeURIComponent(row.dataset.file);
        if (state.manageMode) {
          if (state.selectedEpisodes.has(file)) state.selectedEpisodes.delete(file);
          else state.selectedEpisodes.add(file);
          updateManageBar();
          renderEpisodeList(collection, listEl, isSidebar);
          return;
        }
        if (!state.user) { navigate('#/login'); return; }
        navigate('#/c/' + encodeURIComponent(collection.id) + '/play/' + encodeURIComponent(file));
      });
    }
    for (const btn of listEl.querySelectorAll('.ep-submenu-btn')) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEpisodeSubmenu(btn, decodeURIComponent(btn.dataset.file));
      });
    }
    if (canEdit && !state.manageMode) wireEpisodeDragReorder(listEl, collection);
    // Player sidebar = session play queue → enable in-memory reordering.
    if (isSidebar) wireQueueDragReorder(listEl, collection, () => renderEpisodeList(collection, listEl, isSidebar));
  }

  // Admin persisted reorder on the detail page. Pointer-based (works on
  // touch + mouse; the previous HTML5-DnD version did nothing on phones)
  // via the shared wirePointerReorder helper, committing the full order
  // to episodeMeta.order through the bulk endpoint.
  function wireEpisodeDragReorder(listEl, collection) {
    wirePointerReorder(listEl, (files) => { persistEpisodeOrder(collection, files); });
  }
  /**
   * @brief Persist a full episode order to the server (admin).
   * @details Sends EVERY episode's new 1..N order in one bulk request.
   *          A full ordering matters: buildEpisodes only honors manual
   *          order when ALL episodes carry one (the allHaveOrder gate);
   *          the old code PATCHed only changed rows, which could leave
   *          some at order=null and silently discard the reorder.
   * @param collection The collection being reordered.
   * @param files      The desired order as a list of file keys.
   */
  async function persistEpisodeOrder(collection, files) {
    const valid = files.filter((f) => collection.episodes.some((e) => e.file === f));
    if (valid.length < 2) return;
    const items = valid.map((f, i) => ({ file: f, order: i + 1 }));
    try {
      await api('POST',
        '/api/collections/' + encodeURIComponent(collection.id) + '/episodes/reorder',
        { items });
      toast('已更新顺序', 'success');
      showDetail(collection.id);
    } catch (err) {
      toast('顺序保存失败: ' + (err.message || ''), 'error');
      showDetail(collection.id);   // re-render to snap rows back to truth
    }
  }

  // =================================================================
  // File-tree tab
  //
  // Fetches /api/collections/:id/tree on first switch and caches the
  // result in state.currentTree for the duration of the detail view.
  // Renders as a collapsible <ul> — click a directory to expand /
  // collapse it, click a media file to play with "specified play"
  // scope set to its parent directory, click an image to open the
  // lightbox, other files are non-interactive.
  //
  // The tree is built from the flat entries array returned by the
  // API. Entries come in tree-walk order (files-then-subdirs
  // recursively), which lets us build a nested structure with a
  // single pass: for each entry, look up its parent directory in a
  // path→node map, append as a child. Directory entries also create
  // a new node in the map.
  // =================================================================
  function buildTreeFromEntries(entries) {
    const rootChildren = [];
    const byPath = new Map();
    byPath.set('', { children: rootChildren });
    for (const entry of entries || []) {
      const slash = entry.path.lastIndexOf('/');
      const parentPath = slash >= 0 ? entry.path.slice(0, slash) : '';
      const parent = byPath.get(parentPath);
      if (!parent) continue; // orphan, shouldn't happen with sane tree-walk input
      const node = Object.assign({}, entry);
      if (entry.type === 'dir') node.children = [];
      parent.children.push(node);
      if (entry.type === 'dir') byPath.set(entry.path, node);
    }
    return rootChildren;
  }

  function renderFileTree(collection, entries) {
    fileTreeEl.innerHTML = '';
    const tree = buildTreeFromEntries(entries);
    if (!tree.length) {
      fileTreeEl.innerHTML = '<li class="ep-empty">合集为空</li>';
      return;
    }
    const rootUl = fileTreeEl;
    renderTreeNodes(tree, rootUl, collection, /*depth*/ 0);
  }

  function renderTreeNodes(nodes, parentUl, collection, depth) {
    for (const node of nodes) {
      const li = document.createElement('li');
      li.className = 'tree-node tree-node-' + node.type;
      if (node.type === 'dir') {
        // Directory: header with chevron, children list below.
        // Root-level dirs (depth 0) start expanded; nested start
        // collapsed. User toggles via click on the header. Chevron
        // uses text characters (▶/▼) to avoid pulling in new SVGs.
        const expanded = depth === 0;
        const header = document.createElement('div');
        header.className = 'tree-row tree-dir-row' + (expanded ? ' expanded' : '');
        header.innerHTML =
          '<span class="tree-chevron">' + (expanded ? '▼' : '▶') + '</span>' +
          '<span class="tree-label">' + escapeHtml(node.name) + '</span>' +
          '<span class="tree-meta mono">' + (node.children.length) + ' 项</span>';
        li.appendChild(header);
        const childUl = document.createElement('ul');
        childUl.className = 'tree-children';
        if (!expanded) childUl.hidden = true;
        renderTreeNodes(node.children, childUl, collection, depth + 1);
        li.appendChild(childUl);
        header.addEventListener('click', () => {
          const open = !childUl.hidden;
          childUl.hidden = open;
          header.classList.toggle('expanded', !open);
          header.querySelector('.tree-chevron').textContent = open ? '▶' : '▼';
        });
      } else if (node.type === 'media') {
        // Media file: click to navigate to the player with scope set
        // to the file's parent directory. Scope gets serialized into
        // the URL hash as ?scope=... so a refresh keeps the scope.
        const parentDir = node.path.includes('/')
          ? node.path.slice(0, node.path.lastIndexOf('/'))
          : '';
        li.innerHTML =
          '<div class="tree-row tree-media-row">' +
            '<span class="tree-icon">▶</span>' +
            '<span class="tree-label">' + escapeHtml(node.name) + '</span>' +
            '<span class="tree-meta mono">' + escapeHtml((node.ext || '').toUpperCase()) + ' · ' + formatSize(node.size) + '</span>' +
          '</div>';
        li.firstElementChild.addEventListener('click', () => {
          if (!state.user) { navigate('#/login'); return; }
          let hash = '#/c/' + encodeURIComponent(collection.id) +
                     '/play/' + encodeURIComponent(node.path);
          hash += '?scope=' + encodeURIComponent(parentDir);
          navigate(hash);
        });
      } else if (node.type === 'image') {
        // Image file: click to open the lightbox preview.
        li.innerHTML =
          '<div class="tree-row tree-image-row">' +
            '<span class="tree-icon">◈</span>' +
            '<span class="tree-label">' + escapeHtml(node.name) + '</span>' +
            '<span class="tree-meta mono">' + escapeHtml((node.ext || '').toUpperCase()) + ' · ' + formatSize(node.size) + '</span>' +
          '</div>';
        li.firstElementChild.addEventListener('click', () => {
          openImagePreview(collection.id, node.path);
        });
      } else {
        // Subtitle / other: inert, just displays info.
        const iconChar = node.type === 'subtitle' ? '◷' : '·';
        li.innerHTML =
          '<div class="tree-row tree-other-row">' +
            '<span class="tree-icon">' + iconChar + '</span>' +
            '<span class="tree-label">' + escapeHtml(node.name) + '</span>' +
            '<span class="tree-meta mono">' + escapeHtml((node.ext || '').toUpperCase()) + ' · ' + formatSize(node.size) + '</span>' +
          '</div>';
      }
      parentUl.appendChild(li);
    }
  }

  // Lazy-load /api/collections/:id/tree on first tab switch to save a
  // round trip for users who never open the tree view. Cached in
  // state.currentTree until showDetail() is called for another id.
  async function ensureTreeLoaded(collection) {
    if (state.currentTree) { renderFileTree(collection, state.currentTree); return; }
    if (state.treeLoading) return;
    state.treeLoading = true;
    fileTreeEl.innerHTML = '<li class="ep-empty">加载中...</li>';
    try {
      const res = await api('GET', '/api/collections/' + encodeURIComponent(collection.id) + '/tree');
      state.currentTree = res.tree || [];
      renderFileTree(collection, state.currentTree);
    } catch (err) {
      fileTreeEl.innerHTML = '<li class="ep-empty">加载失败: ' + escapeHtml(err.message) + '</li>';
    } finally {
      state.treeLoading = false;
    }
  }

  function switchDetailTab(which) {
    if (which !== 'episodes' && which !== 'tree') return;
    state.activeTab = which;
    for (const btn of document.querySelectorAll('.detail-tab')) {
      btn.classList.toggle('active', btn.dataset.tab === which);
    }
    detailTabEpisodes.hidden = which !== 'episodes';
    detailTabEpisodes.classList.toggle('active', which === 'episodes');
    detailTabTree.hidden = which !== 'tree';
    detailTabTree.classList.toggle('active', which === 'tree');
    if (which === 'tree' && state.currentCollection) {
      ensureTreeLoaded(state.currentCollection);
    }
  }
  // Wire up the tab bar once — click any button with data-tab.
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.detail-tab');
    if (!btn) return;
    switchDetailTab(btn.dataset.tab);
  });

  // ------ Image lightbox ------
  function openImagePreview(collectionId, imagePath) {
    imgPreviewImg.src = mediaUrl(collectionId, imagePath);
    imgPreviewCaption.textContent = imagePath;
    imgPreview.hidden = false;
  }
  function closeImagePreview() {
    imgPreview.hidden = true;
    imgPreviewImg.src = '';
  }
  if (imgPreview) {
    imgPreview.addEventListener('click', closeImagePreview);
    document.addEventListener('keydown', (e) => {
      if (!imgPreview.hidden && e.key === 'Escape') closeImagePreview();
    });
  }

  function findContinueEpisode(collection) {
    // Tracking is per-collection: pick the MRU (most recently updated)
    // episode that still has unfinished progress, not the first in-order
    // one. Rationale: if a user watches ep1 to 50%, then jumps to ep3 and
    // reaches 70%, hitting "继续观看" should take them back to ep3 (what
    // they last touched), not ep1. Per-episode records are preserved on
    // disk — this function just decides the default resume target.
    const colProgress = state.progressAll[collection.id] || {};
    let mruEp = null;
    let mruAt = -1;
    for (const ep of collection.episodes) {
      const p = colProgress[ep.file];
      if (!p || !p.position || p.watched === true) continue;
      if (p.duration && p.position / p.duration >= 0.9) continue;
      const at = p.updatedAt || 0;
      if (at > mruAt) {
        mruAt = at;
        mruEp = ep;
      }
    }
    if (mruEp) return Object.assign({}, mruEp, { _hasProgress: true });
    // No unfinished progress anywhere — fall through to the first episode
    // that hasn't been finished yet (covers "never watched" and "finished
    // every episode so just play from the top again" cases).
    for (const ep of collection.episodes) {
      const p = colProgress[ep.file];
      const finished = p && (p.watched === true || (p.duration && p.position / p.duration > 0.9));
      if (!finished) return ep;
    }
    return collection.episodes[0] || null;
  }

  function renderComments() {
    const list = state.currentComments || [];
    if (!list.length) {
      commentList.innerHTML = '<li class="comment-empty mono">暂无评论</li>';
      return;
    }
    const canDelete = (c) => state.user && (state.user.username === c.username || state.user.role === 'admin');
    commentList.innerHTML = list.map((c) => `
      <li class="comment-row" data-id="${escapeHtml(c.id)}">
        <div class="comment-head">
          <span class="comment-user mono">${escapeHtml(c.username)}</span>
          <span class="comment-time mono">${new Date(c.createdAt).toLocaleString()}</span>
          ${canDelete(c) ? '<button type="button" class="comment-del mono">删除</button>' : ''}
        </div>
        <div class="comment-text">${escapeHtml(c.text)}</div>
      </li>
    `).join('');
    for (const btn of commentList.querySelectorAll('.comment-del')) {
      btn.addEventListener('click', async (e) => {
        const row = e.target.closest('.comment-row');
        if (!row) return;
        const ok = await confirmBox('删除此评论？', 'DELETE COMMENT');
        if (!ok) return;
        try {
          await api('DELETE', '/api/collections/' + encodeURIComponent(state.currentCollection.id) + '/comments/' + encodeURIComponent(row.dataset.id));
          state.currentComments = state.currentComments.filter((c) => c.id !== row.dataset.id);
          renderComments();
          toast('已删除');
        } catch (err) { toast('删除失败: ' + err.message, 'error'); }
      });
    }
  }
  commentSubmit.addEventListener('click', async () => {
    if (!state.user || !state.currentCollection) return;
    const text = commentText.value.trim();
    commentError.textContent = '';
    if (!text) { commentError.textContent = '评论不能为空'; return; }
    try {
      const { comment } = await api('POST',
        '/api/collections/' + encodeURIComponent(state.currentCollection.id) + '/comments',
        { text });
      state.currentComments.unshift(comment);
      commentText.value = '';
      renderComments();
      toast('已发表', 'success');
    } catch (err) {
      commentError.textContent = err.message || '发送失败';
    }
  });

  // ==================================================================
  // MANAGE MODE
  // ==================================================================
  function enterManageMode() {
    state.manageMode = true;
    state.selectedEpisodes.clear();
    actManage.classList.add('active');
    if (state.currentCollection) {
      renderEpisodeList(state.currentCollection, episodeList, false);
    }
    updateManageBar();
    manageBar.hidden = false;
  }
  function exitManageMode() {
    if (!state.manageMode) return;
    state.manageMode = false;
    state.selectedEpisodes.clear();
    if (actManage) actManage.classList.remove('active');
    manageBar.hidden = true;
    if (state.currentCollection && !viewDetail.hidden) {
      renderEpisodeList(state.currentCollection, episodeList, false);
    }
  }
  function updateManageBar() {
    manageCountEl.textContent = state.selectedEpisodes.size;
  }

  manageExitBtn.addEventListener('click', exitManageMode);
  manageAllBtn.addEventListener('click', () => {
    if (!state.currentCollection) return;
    const all = state.currentCollection.episodes.map((e) => e.file);
    if (state.selectedEpisodes.size === all.length) state.selectedEpisodes.clear();
    else all.forEach((f) => state.selectedEpisodes.add(f));
    updateManageBar();
    renderEpisodeList(state.currentCollection, episodeList, false);
  });
  manageDeleteBtn.addEventListener('click', async () => {
    if (!state.currentCollection || !state.selectedEpisodes.size) return;
    const files = Array.from(state.selectedEpisodes);
    const ok = await confirmBox(`删除 ${files.length} 集？磁盘上的视频文件会一并移除。`, 'BULK DELETE');
    if (!ok) return;
    await runBulkOp('delete', files, null);
  });
  manageMoveBtn.addEventListener('click', () => {
    if (!state.currentCollection || !state.selectedEpisodes.size) return;
    openBulkTargetDialog('move', Array.from(state.selectedEpisodes));
  });
  manageCopyBtn.addEventListener('click', () => {
    if (!state.currentCollection || !state.selectedEpisodes.size) return;
    openBulkTargetDialog('copy', Array.from(state.selectedEpisodes));
  });

  async function runBulkOp(action, files, target) {
    try {
      const body = { action, files };
      if (target) body.target = target;
      const result = await api('POST',
        '/api/collections/' + encodeURIComponent(state.currentCollection.id) + '/episodes/bulk',
        body);
      const msg = `处理 ${result.processedCount} 集` + (result.errorCount ? `（${result.errorCount} 失败）` : '');
      toast(msg, result.errorCount ? 'error' : 'success');
      exitManageMode();
      // Refresh detail to reflect changes.
      showDetail(state.currentCollection.id);
    } catch (err) {
      toast('操作失败: ' + err.message, 'error');
    }
  }

  // ==================================================================
  // BULK TARGET DIALOG (shared: single episode + manage mode)
  // ------------------------------------------------------------------
  // The target collection is chosen with an on-demand search box rather
  // than a full <select> of every collection: the user types a name,
  // presses the 搜索 button (or Enter), and a single request renders the
  // matching collections as a selectable list. No full list is ever
  // materialised client-side, so the dialog stays usable when the library
  // holds hundreds/thousands of collections.
  //
  // Matching is plain title substring, served by the existing
  // GET /api/collections?q=&limit=&includeHidden=1 endpoint — deliberately
  // no pinyin and no live/as-you-type search (a dependency-free, one-shot
  // search per the 2026-06-08 requirement).
  // ==================================================================

  /**
   * @brief Open the move/copy target picker for the given episodes.
   * @param action     'move' | 'copy'.
   * @param files      Episode rel-paths to operate on.
   * @param singleFile When set, the single-episode label variant is used.
   * @details Resets the search box + result list to their idle state;
   *          nothing is fetched until the user runs a search.
   */
  function openBulkTargetDialog(action, files, singleFile) {
    state.bulkAction = action;
    state.bulkFiles = files;
    state.bulkSingle = !!singleFile;
    state.bulkTargetChosenId = '';   // no target picked yet
    bulkTargetError.textContent = '';
    const actionLabel = action === 'move' ? 'MOVE TO' : 'COPY TO';
    bulkTargetTitle.textContent = '// ' + actionLabel;
    bulkTargetSubtitle.textContent = singleFile
      ? `${action === 'move' ? '移动' : '复制'} 集: ${singleFile}`
      : `${files.length} 集将被${action === 'move' ? '移动' : '复制'}到目标合集`;
    bulkTargetOk.textContent = action === 'move' ? '移动' : '复制';

    bulkTargetSearchInput.value = '';
    bulkTargetResults.innerHTML = '<li class="bulk-target-hint">输入合集名后点「搜索」</li>';
    bulkTargetDialog.showModal();
    // Focus the query box so the user can type immediately.
    setTimeout(() => bulkTargetSearchInput.focus(), 0);
  }

  /**
   * @brief Run one search and render the matching collections.
   * @details Hits GET /api/collections?q=…&limit=…&includeHidden=1, drops
   *          the current (source) collection from the candidates, and
   *          paints the rest as clickable rows. The picked-target state is
   *          cleared on every fresh search so a stale highlight can never
   *          be submitted.
   */
  async function runBulkTargetSearch() {
    const q = bulkTargetSearchInput.value.trim();
    bulkTargetError.textContent = '';
    state.bulkTargetChosenId = '';
    if (!q) {
      bulkTargetResults.innerHTML = '<li class="bulk-target-hint">请先输入合集名</li>';
      return;
    }
    bulkTargetResults.innerHTML = '<li class="bulk-target-hint">搜索中…</li>';
    try {
      const params = new URLSearchParams({ q, limit: '30', includeHidden: '1' });
      const { collections } = await api('GET', '/api/collections?' + params.toString());
      const others = (collections || []).filter((c) => c.id !== state.currentCollection.id);
      if (!others.length) {
        bulkTargetResults.innerHTML = '<li class="bulk-target-hint">没有匹配的合集</li>';
        return;
      }
      bulkTargetResults.innerHTML = others.map((c) => {
        const title = escapeHtml(c.title || c.id);
        const count = (c.episodeCount != null ? c.episodeCount : 0) + ' ' + countUnit();
        return `<li class="bulk-target-result" role="option" aria-selected="false" data-id="${escapeHtml(c.id)}">`
          + `<span class="bulk-target-result-title">${title}</span>`
          + `<span class="bulk-target-result-meta">${count}</span></li>`;
      }).join('');
    } catch (err) {
      bulkTargetResults.innerHTML = '<li class="bulk-target-hint">搜索失败：' + escapeHtml(err.message) + '</li>';
    }
  }

  bulkTargetSearchBtn.addEventListener('click', runBulkTargetSearch);
  // Enter inside the query box runs a search rather than submitting the
  // form (form submit would fire the move/copy with no target chosen).
  bulkTargetSearchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); runBulkTargetSearch(); }
  });
  // Click a result row to pick it as the move/copy target (single select).
  bulkTargetResults.addEventListener('click', (e) => {
    const li = e.target.closest('.bulk-target-result');
    if (!li) return;
    state.bulkTargetChosenId = li.dataset.id || '';
    bulkTargetError.textContent = '';
    for (const row of bulkTargetResults.querySelectorAll('.bulk-target-result')) {
      const on = row === li;
      row.classList.toggle('selected', on);
      row.setAttribute('aria-selected', on ? 'true' : 'false');
    }
  });

  bulkTargetCancel.addEventListener('click', () => bulkTargetDialog.close('cancel'));
  bulkTargetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    bulkTargetError.textContent = '';
    const target = state.bulkTargetChosenId;
    if (!target) {
      bulkTargetError.textContent = '请搜索并选择目标合集';
      return;
    }
    bulkTargetDialog.close('confirm');
    await runBulkOp(state.bulkAction, state.bulkFiles, target);
  });

  // ==================================================================
  // EPISODE SUBMENU (per-row ⋮)
  // ==================================================================
  /**
   * @brief Fill the in-popover "跟随" picker for a given episode.
   * @details Reads live state.currentCollection (refreshed by showDetail
   *          after every change), so the selected value always reflects
   *          what is currently persisted — fixing the stale "不跟随"
   *          display.
   *
   *          Linked-list rule: each episode may be followed by at most one
   *          other, so a candidate target is offered only when its
   *          "successor slot" is free — i.e. no OTHER episode already
   *          follows it. (That is why, once A2 follows A1, A1 disappears
   *          from everyone else's list and only A2 — the current tail — can
   *          be followed onward.) Self and any choice that would close a
   *          loop are also excluded.
   * @param file The episode the popover was opened for.
   */
  function populateEpFollowSelect(file) {
    if (!epFollowSelect || !state.currentCollection) return;
    const col = state.currentCollection;
    const eps = col.episodes;
    const byFile = new Map(eps.map((e) => [e.file, e]));
    const ep = byFile.get(file);
    // Which files already have a follower OTHER than `file` (slot taken).
    const slotTaken = new Set();
    for (const e of eps) {
      if (e.file !== file && e.follows && byFile.has(e.follows)) slotTaken.add(e.follows);
    }
    // Would file → T close a loop? Walk T's predecessor links; hitting
    // `file` means file is already upstream of T.
    const wouldCycle = (target) => {
      let cur = byFile.get(target);
      const seen = new Set();
      while (cur && cur.follows && byFile.has(cur.follows) && !seen.has(cur.file)) {
        if (cur.follows === file) return true;
        seen.add(cur.file);
        cur = byFile.get(cur.follows);
      }
      return false;
    };
    const opts = ['<option value="">— 不跟随 —</option>'];
    for (const other of eps) {
      if (other.file === file) continue;
      if (slotTaken.has(other.file)) continue;     // already has a follower
      if (wouldCycle(other.file)) continue;         // would form a loop
      opts.push(`<option value="${escapeHtml(other.file)}">${escapeHtml(other.title || other.file)}</option>`);
    }
    epFollowSelect.innerHTML = opts.join('');
    epFollowSelect.value = ep && ep.follows ? ep.follows : '';
  }

  function openEpisodeSubmenu(anchorBtn, file) {
    state.editingEpisodeFile = file;
    injectIcons(epMenu);
    populateEpFollowSelect(file);
    const rect = anchorBtn.getBoundingClientRect();
    // Position popover below the button, clipped to viewport.
    let top = rect.bottom + 4;
    let left = rect.right - 160;  // popover width ~160
    if (left < 8) left = 8;
    if (top + 260 > window.innerHeight) top = Math.max(8, rect.top - 260);
    epMenu.style.top = top + 'px';
    epMenu.style.left = left + 'px';
    epMenu.hidden = false;
  }
  // Chain-ordering: changing the in-popover "跟随" picker persists the
  // follows pointer immediately and re-renders (showDetail), so the new
  // chain order is visible at once. Bound once — the select is a fixed
  // element; the target episode comes from state.editingEpisodeFile.
  if (epFollowSelect) {
    epFollowSelect.addEventListener('change', async () => {
      const file = state.editingEpisodeFile;
      const col = state.currentCollection;
      if (!file || !col) return;
      const val = epFollowSelect.value;
      epMenu.hidden = true;
      try {
        await api('PATCH',
          '/api/collections/' + encodeURIComponent(col.id) + '/episodes/' + encodeURIComponent(file),
          { follows: val });
        toast(val ? '已设置跟随' : '已取消跟随', 'success');
        showDetail(col.id);
      } catch (err) {
        toast('设置失败: ' + (err.message || ''), 'error');
      }
    });
  }
  epMenu.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-ep-action]');
    if (!btn) return;
    const action = btn.dataset.epAction;
    const file = state.editingEpisodeFile;
    epMenu.hidden = true;
    if (!file || !state.currentCollection) return;

    if (action === 'edit') {
      openEpisodeEditDialog(state.currentCollection, file);
    } else if (action === 'upload-subtitle') {
      triggerSubtitleUpload(state.currentCollection.id, file);
    } else if (action === 'delete') {
      const ok = await confirmBox(`删除集「${file}」？磁盘上的视频文件会一并移除。`, 'DELETE EPISODE');
      if (!ok) return;
      try {
        await api('DELETE',
          '/api/collections/' + encodeURIComponent(state.currentCollection.id) + '/episodes/' + encodeURIComponent(file));
        toast('已删除 ' + file, 'success');
        showDetail(state.currentCollection.id);
      } catch (err) { toast('删除失败: ' + err.message, 'error'); }
    } else if (action === 'move' || action === 'copy') {
      openBulkTargetDialog(action, [file], file);
    }
  });

  // ------- Per-episode subtitle/lyric upload -------
  const subtitleUploadInput = $('subtitle-upload-input');
  let pendingSubtitleTarget = null;  // { collectionId, episodeFile }
  function triggerSubtitleUpload(collectionId, episodeFile) {
    if (!subtitleUploadInput) return;
    pendingSubtitleTarget = { collectionId, episodeFile };
    subtitleUploadInput.value = '';
    subtitleUploadInput.click();
  }
  if (subtitleUploadInput) {
    subtitleUploadInput.addEventListener('change', () => {
      const file = (subtitleUploadInput.files || [])[0];
      subtitleUploadInput.value = '';
      if (!file || !pendingSubtitleTarget) return;
      const target = pendingSubtitleTarget;
      pendingSubtitleTarget = null;
      // Rename to <episode-stem>.<ext> so the backend picks it up as a
      // sidecar for the right episode.
      const ext = (file.name.match(/\.[a-z0-9]+$/i) || [''])[0];
      const epStem = target.episodeFile.replace(/\.[^.]+$/, '');
      const newName = epStem + ext;
      const renamed = new File([file], newName, { type: file.type });
      const form = new FormData();
      form.append('files', renamed, newName);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', subUrl('/api/collections/' + encodeURIComponent(target.collectionId) + '/upload'));
      xhr.withCredentials = true;
      statusEl.textContent = '上传字幕...';
      xhr.addEventListener('load', () => {
        statusEl.textContent = '';
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch (e) {}
        if (xhr.status >= 200 && xhr.status < 300) {
          toast('字幕已关联: ' + newName, 'success');
          if (state.currentCollection && state.currentCollection.id === target.collectionId) {
            showDetail(target.collectionId);
          }
        } else {
          toast('上传失败: ' + (data.error || 'HTTP ' + xhr.status), 'error');
        }
      });
      xhr.addEventListener('error', () => {
        statusEl.textContent = '';
        toast('上传失败: 网络错误', 'error');
      });
      xhr.send(form);
    });
  }

  // ==================================================================
  // PLAYER
  // ==================================================================
  async function showPlayer(id, file) {
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = id.toUpperCase();
    viewPlayer.hidden = false;
    // Lazy: ensure Plyr is loaded + state.plyr is wired before we
    // touch state.plyr.source / .play below. No-op after first call.
    await initPlyr();

    // Mutex: starting video always stops any audio that was playing,
    // so the user never hears two streams at once. Cross-tab playback
    // is naturally independent — this only affects the current tab.
    try { stopAudioPlayback(); } catch (e) {}

    if (state.miniMode) {
      miniPlayer.hidden = true;
      state.miniMode = false;
      if (!state.pendingMiniRestore) {
        // User explicitly expanded mini → full player; move video immediately
        // so playback is visible without waiting for the progress fetch below.
        mountVideoIn(playerContainer);
        videoPortal.style.display = 'block';
        hidePlayerError();
      }
    }
    if (!state.user) { navigate('#/login'); return; }

    let collection = state.currentCollection;
    if (!collection || collection.id !== id) {
      try {
        const res = await api('GET', '/api/collections/' + encodeURIComponent(id));
        collection = res.collection;
        state.currentCollection = collection;
      } catch (err) {
        toast('加载合集失败: ' + err.message, 'error');
        navigate('#/');
        return;
      }
    }
    try {
      const res = await api('GET', '/api/progress');
      state.progressAll = res.progress || {};
    } catch (e) {}

    const ep = collection.episodes.find((e) => e.file === file);
    if (!ep) {
      toast('集数不存在: ' + file, 'error');
      navigate('#/c/' + encodeURIComponent(id));
      return;
    }
    const sameVideo = state.currentFile === file;
    state.currentFile = file;

    playerSidebarTitle.textContent = '// ' + (collection.title || collection.id);
    // ── Player sidebar sort bar ──
    if (playerEpSortBar && playerEpSortSelect && playerEpSortDirBtn) {
      const pref = getEpSortPref(collection.id);
      syncSortBar(playerEpSortSelect, playerEpSortDirBtn, playerEpSortBar, pref, true);
      const newS = playerEpSortSelect.cloneNode(true);
      const newB = playerEpSortDirBtn.cloneNode(true);
      playerEpSortSelect.replaceWith(newS);
      playerEpSortDirBtn.replaceWith(newB);
      const sel2 = $('player-ep-sort-select');
      const btn2 = $('player-ep-sort-dir-btn');
      sel2.addEventListener('change', () => {
        const p = getEpSortPref(collection.id);
        p.field = sel2.value;
        setEpSortPref(collection.id, p.field, p.asc);
        btn2.textContent = p.asc ? '↑' : '↓';
        buildPlayQueue(collection);   // sort change re-seeds the queue
        renderEpisodeList(collection, playerEpisodeList, true);
      });
      btn2.addEventListener('click', () => {
        const p = getEpSortPref(collection.id);
        p.asc = !p.asc;
        setEpSortPref(collection.id, p.field, p.asc);
        btn2.textContent = p.asc ? '↑' : '↓';
        buildPlayQueue(collection);   // sort change re-seeds the queue
        renderEpisodeList(collection, playerEpisodeList, true);
      });
    }
    renderEpisodeList(collection, playerEpisodeList, true);
    setTimeout(() => {
      const active = playerEpisodeList.querySelector('li.ep-row.active');
      if (active) active.scrollIntoView({ block: 'nearest' });
    }, 50);

    playerEpTitle.textContent = ep.title;
    playerEpMeta.textContent = [
      '#' + String(ep.order).padStart(2, '0'),
      ep.ext.toUpperCase(),
      formatSize(ep.size),
    ].join(' · ');

    mountVideoIn(playerContainer);
    videoPortal.style.display = 'block';
    hidePlayerError();

    if (!sameVideo) {
      for (const t of player.querySelectorAll('track')) t.remove();
      for (const u of state.subtitleBlobUrls) { try { URL.revokeObjectURL(u); } catch (e) {} }
      state.subtitleBlobUrls = [];
      // Drop any PGS renderer mounted for the previous episode —
      // its libpgs sub data and canvas overlay are episode-scoped.
      disposePgsRenderer();
      // Tear down hls.js too so stale MSE buffers don't bleed into
      // the next ep's playback.
      disposeHls();

      const saved = (state.progressAll[collection.id] || {})[ep.file];
      const freshStart = state.pendingFreshStart;
      state.pendingFreshStart = false;
      const resumeAt = !freshStart && saved && saved.position
        && (!saved.duration || saved.position < saved.duration - 3)
        ? saved.position : 0;

      // Decide native vs transcode-stream up front. This flag gates
      // two things:
      //   1. Whether resumeAt is passed to the server as ?t= (stream)
      //      or applied client-side via currentTime (native).
      //   2. Whether the in-player seek handler (below, near the
      //      <video> error listener) reloads the source on seek.
      // Streamed sources can't honor byte-range seeks — the only way
      // to jump to a new offset is to re-request the stream with ?t=.
      const streaming = needsTranscode(ep.ext);

      state.currentIsStream = streaming;
      state.streamStartSec = streaming ? resumeAt : 0;
      // Reset the native→transcode fallback flag for each new
      // episode. Otherwise a previous mkv that failed native and
      // fell back would leave the flag latched, and the next mkv
      // (or a re-pick of the same one) would skip the native
      // attempt entirely.
      state.transcodeFallbackTried = false;

      // ----------------------------------------------------------
      // 1.7.40: HLS audio-fallback for browser-incompatible audio.
      //
      // Native ext (mkv/mp4/webm) goes through an audio-codec gate:
      //   1. /api/episode/.../hls-start probes audio codec
      //   2. If audio is browser-safe (aac/mp3/opus/vorbis/flac) →
      //      'not-needed' → skip, plain native byte-range serve
      //   3. Otherwise spin up ffmpeg HLS transcode (event playlist,
      //      6s segments, video copied verbatim, EAC3/DTS/TrueHD →
      //      AAC), wait for first segment to land on disk
      //   4. Lazy-load hls.js + attach to <video> element, the
      //      MANIFEST_PARSED event tells us playback can start
      //
      // Compared to 1.7.39 mp4 pre-remux: HLS lets the user start
      // watching after ~5-10s (first segment) instead of waiting
      // 1-3 minutes for the entire mp4 to finish, and seeking jumps
      // to whichever segment covers the target time. Background
      // ffmpeg keeps writing segments while playback continues; the
      // final ENDLIST tag appears when ffmpeg exits, after which
      // hls.js stops polling the playlist.
      // ----------------------------------------------------------
      const hlsToken = (state.hlsToken = (state.hlsToken || 0) + 1);
      let useHlsKey = null;
      // Reset HLS-bound metadata on every episode pick. The server-
      // sourced audio-track list is only meaningful for whatever ep
      // we currently have on the wire, so stale entries from a prior
      // ep would cause the picker to show wrong languages.
      state.serverAudioTracks = [];
      state.currentHlsAudioIdx = null;
      state.hlsCollectionId = null;
      state.hlsEpFile = null;
      if (!streaming) {
        showPlayerLoading('音频转换准备中…');
        let pendingDetail = null;
        try {
          useHlsKey = await startHlsAndWait(collection.id, ep.file);
        } catch (e) {
          if (e && e.code === 'transcoding-pending') {
            pendingDetail = e.detail;
          }
        }
        if (state.hlsToken !== hlsToken) { hidePlayerLoading(); return; }
        // v1.11.0 zero-wait video lane. Three-step fallback ladder:
        //
        //   1. fmp4-mse        ChiralVideoMse + mp4box.js + the new
        //                      /api/episode/:id/fmp4-stream endpoint.
        //                      Streams a live fragmented MP4 directly
        //                      into MediaSource. ~1 s to first frame,
        //                      seek-restart fully supported.
        //
        //   2. fmp4-streamTo   Plain <video src="/media-stream/...">.
        //                      The legacy mixedArgs pipeline already
        //                      copies the source video and re-encodes
        //                      audio (dplii downmix). No MSE / mp4box
        //                      dependency. No seek support (each ?t=
        //                      re-spawns ffmpeg) but immediate play.
        //
        //   3. HLS toast       v1.10.x behavior: tell the user the
        //                      transcoding queue is still running and
        //                      bail out without starting playback.
        //
        // P1 (v1.11.0 fix): the previous v1.11.0 implementation gated
        // step 1 on window.chiralCaps.mseFmp4Streaming, which is set
        // ASYNC by public/capability.js's probe + POST handshake. A
        // user who clicked Play within ~500 ms of page load saw caps
        // as undefined and skipped step 1 entirely, landing on toast.
        // The fix is to use only SYNCHRONOUSLY-observable evidence
        // (window.ChiralVideoMse + MP4Box + MediaSource) and probe
        // capability on the fly (MediaSource.isTypeSupported is sync).
        // capability.js still runs and the POST is still useful for
        // future server-side route decisions, but the player no longer
        // waits on it.
        //
        // Background HLS queue is preserved: lib/fmp4-stream.js writes
        // partial output.mp4 to data/hls-cache/<sha1>/ so the second
        // playback of the same file is a cache-hit sendFile (zero CPU).
        // iOS continues to use HLS via the same queue.
        if (pendingDetail) {
          const ua = (navigator && navigator.userAgent) || '';
          const isIOS = /\b(iPhone|iPad|iPod)\b/.test(ua)
            || /CPU (?:iPhone )?OS \d+/.test(ua);
          // v1.11.1: fmp4-mse default disabled. mp4box.js demuxer
          // hangs on PTS-anomaly sources (Redline.mkv) with no
          // observable failure mode (no onError, just silent
          // pending). Falling back via 8s timeout is correct but
          // the user-visible latency is unacceptable. fmp4-streamTo
          // (plain <video src>) is 0.5-2s startup, browser-native
          // decoding, no mp4box dependency — strictly safer.
          //
          // We keep the fmp4-mse code path in place + the capability
          // probe in capability.js so a future toggle (admin pref,
          // URL flag) can re-enable it for users who specifically
          // want seek-restart-without-respawn. Default behavior is
          // streamTo across the board.
          //
          // To experiment locally: temporarily flip mseHealthy to
          // the previous expression. Watch the console for
          // [fmp4-mse:timeout] or [fmp4-mse:mp4box-error] tags —
          // those are the canonical fail modes we're avoiding.
          const mseHealthy = false;

          if (window.console && window.console.info) {
            window.console.info(
              '[playEpisode] HLS pending — mseHealthy=' + mseHealthy + ' isIOS=' + isIOS + ' file=' + ep.file
            );
          }

          // ----- Step 1: fmp4-mse -----
          if (mseHealthy) {
            showPlayerLoading('零等待直流准备中…');
            try {
              const streamUrl = fmp4StreamUrl(collection.id, ep.file);
              // Pass resumeAt as startSec so:
              //   1. server-side ffmpeg seeks via -ss <resumeAt> from
              //      the first frame, so user starts ~resumeAt seconds
              //      into the file without any client-side seek dance.
              //   2. ChiralVideoMse stamps lastSeekTo = resumeAt,
              //      preventing the AbortError race where the browser-
              //      internal `seeked` to resumeAt would otherwise be
              //      treated as a user seek and trigger a redundant
              //      fmp4 restart that tears down play() Promise.
              await attachFmp4Mse(streamUrl, '', resumeAt > 0 ? resumeAt : 0);
              if (state.hlsToken !== hlsToken) {
                hidePlayerLoading();
                return;
              }
              // v1.11.0 audio-track switching support: populate the
              // same state.hlsCollectionId / state.hlsEpFile / state.
              // serverAudioTracks set the HLS path uses, so the
              // settings-menu picker has data to display and
              // switchHlsAudio's fmp4-mse branch (also v1.11.0) can
              // find the cid/file pair when the user picks a
              // different language.
              state.hlsCollectionId = collection.id;
              state.hlsEpFile = ep.file;
              try {
                const tracks = await fetchEpisodeAudioTracks(collection.id, ep.file);
                if (state.hlsToken !== hlsToken) { hidePlayerLoading(); return; }
                state.serverAudioTracks = tracks;
                if (tracks.length > 0 && tracks[0].streamIndex != null) {
                  state.currentHlsAudioIdx = tracks[0].streamIndex;
                }
              } catch (_e) { /* keep menu empty on failure */ }
              hidePlayerLoading();
              if (window.console && window.console.info) {
                window.console.info('[playEpisode] fmp4-mse OK (startSec=' + resumeAt + ')');
              }
              // Resume position is honored server-side via -ss <resumeAt>
              // on the fmp4-stream spawn, so the browser-internal
              // currentTime is already at the right offset. We only
              // re-apply playback speed + kick play() through the
              // safePlay helper to swallow the AbortError that fires
              // when the MSE rebuild races the play() Promise (the
              // exact symptom users saw on the Redline test file).
              const onCanPlay = () => {
                try { if (state.plyr) state.plyr.speed = state.playerSpeed; } catch (_e) {}
                safePlay();
              };
              if (state.plyr) state.plyr.once('canplay', onCanPlay);
              else player.addEventListener('canplay', onCanPlay, { once: true });
              return;
            } catch (e) {
              hidePlayerLoading();
              if (window.console && window.console.warn) {
                window.console.warn(
                  '[playEpisode] fmp4-mse failed (' + (e && e.message) + '), trying fmp4-streamTo'
                );
              }
            }
          }

          // ----- Step 2: fmp4-streamTo (legacy /media-stream pipe) -----
          // Forces forceStream:true so videoSrcFor returns /media-stream/...
          // regardless of file extension whitelist (.mkv is on the
          // native-friendly whitelist but multi-channel EAC3/DTS need
          // the transcode pipe).
          //
          // v1.11.1 CRITICAL: flag state.currentIsStream so the in-
          // player seek handler (line ~13431) knows to translate user
          // seeks into a fresh /media-stream?t=<target> request. Without
          // this, the legacy `streaming = needsTranscode(ep.ext)` check
          // at line 6108 left the flag false for .mkv (it's on the
          // native-friendly whitelist), and seeking on a multi-channel
          // .mkv that landed in step 2 silently broke — the user clicked
          // ahead and the player just stalled until the chunked stream
          // caught up naturally.
          try {
            disposeHls();
            state.currentIsStream = true;
            state.streamStartSec = resumeAt > 3 ? resumeAt : 0;
            const streamToUrl = videoSrcFor(collection.id, ep.file, {
              forceStream: true,
              startSec: resumeAt > 3 ? resumeAt : 0,
            });
            const onCanPlay = () => {
              hidePlayerLoading();
              // Resume position is honored server-side via ?t=<resumeAt>
              // baked into streamToUrl above; we deliberately do NOT
              // set currentTime here because that would (a) trigger
              // the in-player `seeking` listener at line ~13431,
              // which would issue ANOTHER /media-stream?t= request
              // and double-spawn ffmpeg, and (b) race the play()
              // Promise into an AbortError.
              try { if (state.plyr) state.plyr.speed = state.playerSpeed; } catch (_e) {}
              safePlay();
            };
            showPlayerLoading('实时转码中…');
            if (state.plyr) {
              state.plyr.source = {
                type: 'video',
                sources: [{ src: streamToUrl, type: 'video/mp4' }],
              };
              state.plyr.once('canplay', onCanPlay);
            } else {
              player.src = streamToUrl;
              try { player.load(); } catch (_e) {}
              player.addEventListener('canplay', onCanPlay, { once: true });
            }
            if (window.console && window.console.info) {
              window.console.info('[playEpisode] fmp4-streamTo attached: ' + streamToUrl);
            }
            return;
          } catch (e) {
            hidePlayerLoading();
            if (window.console && window.console.warn) {
              window.console.warn(
                '[playEpisode] fmp4-streamTo failed (' + (e && e.message) + '), falling back to HLS toast'
              );
            }
          }

          // ----- Step 3: HLS toast (legacy bail-out) -----
          toast(formatTranscodingMessage(pendingDetail), 'warn', 8000);
          return;
        }
        if (!useHlsKey) hidePlayerLoading();
        // useHlsKey === null can mean:
        //   - audio is already browser-safe (AAC/MP3 mkv) — bail to
        //     native serve below; the loading overlay is hidden
        //     above; this is the common path for most ep.
        //   - hls-start failed (ffmpeg error / 504 timeout) — same
        //     fallback as native; user gets silent video for unsupported
        //     audio. Toast warns them.
        // When HLS is in use, also fetch the audio track list so the
        // settings-menu picker has language / title labels for each
        // stream. The HLS playlist itself only carries one audio
        // rendition, so HTMLMediaElement.audioTracks would otherwise
        // be empty / single-entry and the menu would say "no tracks".
        if (useHlsKey) {
          state.hlsCollectionId = collection.id;
          state.hlsEpFile = ep.file;
          try {
            const tracks = await fetchEpisodeAudioTracks(collection.id, ep.file);
            if (state.hlsToken !== hlsToken) { hidePlayerLoading(); return; }
            state.serverAudioTracks = tracks;
            // The first audio in stream-index order is what hls-start
            // mapped when no `?a=` was passed — track that as the
            // active selection so the menu's radio dot lines up.
            if (tracks.length > 0 && tracks[0].streamIndex != null) {
              state.currentHlsAudioIdx = tracks[0].streamIndex;
            }
          } catch (_e) { /* keep empty — menu just won't show entries */ }
        }
      }

      const srcOpts = { startSec: streaming ? resumeAt : 0, forceStream: streaming };

      if (useHlsKey) {
        // HLS attach path. hls.js takes over <video>.src, so DON'T
        // call state.plyr.source = ... (would clobber the MSE buffer).
        const playlistUrl = '/hls-cache/' + encodeURIComponent(useHlsKey) + '/playlist.m3u8';
        try {
          await attachHls(playlistUrl);
          hidePlayerLoading();
          if (state.hlsToken !== hlsToken) return;
          // Apply resume + speed + play. Use plyr if available so its
          // own state stays in sync (currentTime / speed display).
          const onCanPlay = () => {
            if (resumeAt > 3) {
              try {
                if (state.plyr) state.plyr.currentTime = resumeAt;
                else player.currentTime = resumeAt;
              } catch (e) {}
            }
            try {
              if (state.plyr) state.plyr.speed = state.playerSpeed;
            } catch (e) {}
            try {
              if (state.plyr) state.plyr.play();
              else player.play();
            } catch (e) {}
          };
          if (state.plyr) state.plyr.once('canplay', onCanPlay);
          else player.addEventListener('canplay', onCanPlay, { once: true });
        } catch (err) {
          hidePlayerLoading();
          console.warn('hls attach failed, falling back to silent native', err);
          toast('HLS 启动失败，回退到无声播放', 'warn');
          useHlsKey = null;  // fall through to native path
        }
      }

      if (!useHlsKey) {
        // Multi-quality path: use Plyr's source API so its settings
        // menu shows a Quality switcher. Each source gets a `size`
        // tag (=vertical resolution) that Plyr reads for the menu
        // label.
        const hasQualities = state.plyr && Array.isArray(ep.qualities) && ep.qualities.length >= 2;
        if (hasQualities) {
          const sources = ep.qualities.map((q) => ({
            src: videoSrcFor(collection.id, q.file, srcOpts),
            type: streaming ? 'video/mp4' : mimeTypeForVideo(q.file),
            size: q.quality,
          }));
          try {
            state.plyr.source = { type: 'video', sources };
            state.plyr.once('canplay', () => {
              if (!streaming && resumeAt > 3) {
                try { state.plyr.currentTime = resumeAt; } catch (e) {}
              }
              try { state.plyr.speed = state.playerSpeed; } catch (e) {}
              try { state.plyr.play(); } catch (e) {}
            });
          } catch (err) {
            console.warn('plyr source failed, falling back', err);
            player.src = videoSrcFor(collection.id, ep.file, srcOpts);
          }
        } else {
          player.src = videoSrcFor(collection.id, ep.file, srcOpts);
          if (!streaming) {
            const onMeta = () => {
              if (resumeAt > 3) player.currentTime = resumeAt;
              player.removeEventListener('loadedmetadata', onMeta);
            };
            player.addEventListener('loadedmetadata', onMeta);
          }
          if (state.plyr) {
            try { state.plyr.speed = state.playerSpeed; } catch (e) {}
          }
          try { player.play(); } catch (e) {}
        }
      }

      if (ep.subtitles && ep.subtitles.length) {
        loadSubtitles(collection.id, ep).catch((e) => console.warn('subtitle load failed', e));
      }
      // Manual subtitle restore — if the user previously picked a
      // subtitle for this episode via the manual dialog, re-attach it
      // here. Looks up the saved relative path against the
      // collection-wide list so a renamed/moved subtitle silently
      // drops out instead of erroring.
      const manualMap = getManualSubsFor(collection.id);
      const manualPath = manualMap[ep.file];
      if (manualPath) {
        if (typeof manualPath === 'string' && manualPath.indexOf('@embed:') === 0) {
          // Embedded restore (1.7.24) — re-extract the same stream
          // from the new episode's container. mkv/mp4 streams are
          // identified by ffprobe index; Amazon-style rips keep the
          // same stream layout across episodes (e.g. Chinese
          // Traditional is always at index N), so this works out as
          // a usable restore even though the index is technically
          // not a stable cross-episode identifier.
          const streamIdx = parseInt(manualPath.slice(7), 10);
          if (!isNaN(streamIdx)) {
            mountEmbeddedSubtitle(collection.id, ep.file, streamIdx, '', 'und')
              .catch((e) => console.warn('embedded subtitle restore failed', e));
          }
        } else if (Array.isArray(collection.availableSubtitles)) {
          const sub = collection.availableSubtitles.find((s) => s.file === manualPath);
          if (sub) {
            if ((sub.format || '').toLowerCase() === 'sup') {
              // PGS restore — re-mount the renderer in HIDDEN state.
              // The user can flip it on with a CC click. We don't
              // auto-show because Plyr's captions.active LS preference
              // (which gates text-track auto-show) doesn't cover PGS,
              // and silently revealing burned subtitles when the user
              // didn't ask is more annoying than asking them to tap CC.
              setupPgsRenderer(collection.id, sub)
                .catch((e) => console.warn('PGS subtitle restore failed', e));
            } else {
              addSubtitleTrack(collection.id, sub, { defaultTrack: true, labelPrefix: '手动: ' })
                .catch((e) => console.warn('manual subtitle restore failed', e));
            }
          }
        }
      }
    }

    countEl.textContent = '#' + String(ep.order).padStart(2, '0') + ' / ' + collection.episodeCount;

    const idx = collection.episodes.findIndex((e) => e.file === file);
    prevEpBtn.disabled = idx <= 0;
    nextEpBtn.disabled = idx < 0 || idx >= collection.episodes.length - 1;
    // Loop-all and shuffle always have a valid target, so prev/next
    // should never appear disabled at the list boundaries under those
    // modes — that was misleading "dead button" UX.
    if (state.loopAllMode || state.shuffleMode) {
      prevEpBtn.disabled = false;
      nextEpBtn.disabled = false;
    }
    updateLoopShuffleUI();

    // Auto-advance from mini: new episode is loaded and playing — restore
    // mini mode and navigate back to whatever view the user was on before.
    if (state.pendingMiniRestore) {
      state.pendingMiniRestore = false;
      mountVideoIn(miniPlayerSlot);
      videoPortal.style.display = 'block';
      miniPlayer.hidden = false;
      miniPlayerTitle.textContent = (collection.title || collection.id) + ' · ' + (ep.title || ep.file);
      state.miniMode = true;
      restoreMiniLayout();
      navigate(state.miniReturnHash || '#/');
    }
  }
  // ==================================================================
  // audioPlayerEl is the live "current audio player element" reference.
  // For audio-only episodes it's the <audio> element (Plyr-wrapped, full
  // mini/lyric/sleep integration). For video episodes inside an audio
  // collection (MV / explainer clips) swapAudioPlayerForEp() swaps it to
  // a sibling <video> element so the same handler code keeps working.
  // Made `let` so the ref can be reassigned at runtime; all 50+ call
  // sites read it dynamically from this closure variable.
  let audioPlayerEl     = $('audio-player');
  const audioVideoEl    = $('audio-player-video');
  const amstVideoEl     = $('amst-video');
  const _audioElBound   = new WeakSet();

  // Match the breakpoint used by the .amst mobile stage CSS. matchMedia
  // is queried each call so a window resize across the breakpoint picks
  // the correct surface for the next ep load. (Within a single ep
  // playback we don't migrate between desktop/mobile elements — that
  // would require state migration we don't need for this use case.)
  function isMobileLayout() {
    return window.matchMedia && window.matchMedia('(max-width: 600px)').matches;
  }

  // Toggle visibility + reassign audioPlayerEl based on whether the
  // episode is video AND whether the current layout is mobile. Idempotent
  // — no-op when the desired element is already active. Pauses + clears
  // the previous element's src so two sources don't fight for output.
  function swapAudioPlayerForEp(ep) {
    if (!audioPlayerEl) return;
    const ext = String(ep && ep.file || '').toLowerCase().split('.').pop();
    const isVideo = ext === 'mp4' || ext === 'webm' || ext === 'm4v';
    const mobile = isMobileLayout();
    const audioBaseEl = $('audio-player');
    const target = isVideo
      ? (mobile ? amstVideoEl : audioVideoEl)
      : audioBaseEl;
    if (!target || target === audioPlayerEl) return;
    // Tear down previous element's playback so the new one starts clean.
    try { audioPlayerEl.pause(); } catch (_) {}
    try {
      audioPlayerEl.removeAttribute('src');
      audioPlayerEl.load();
    } catch (_) {}
    // Plyr wraps the <audio> in a .plyr container after initAudioPlyr
    // runs, so hide the wrapper if it exists, otherwise the bare element.
    // Use style.display rather than the `hidden` attribute because the
    // .plyr container has explicit display rules that override [hidden].
    if (audioBaseEl) {
      const audioContainer = audioBaseEl.closest('.plyr') || audioBaseEl;
      audioContainer.style.display = isVideo ? 'none' : '';
    }
    if (audioVideoEl) audioVideoEl.hidden = !isVideo || mobile;
    if (amstVideoEl)  amstVideoEl.hidden  = !isVideo || !mobile;
    // Mobile cover frame: drop the 1:1 aspect lock and hide the cover
    // image so #amst-video can fill the slot at its native ratio.
    const coverFrame = amstVideoEl ? amstVideoEl.parentElement : null;
    const amstCover  = $('amst-cover');
    if (coverFrame) coverFrame.classList.toggle('has-video', isVideo && mobile);
    if (amstCover)  amstCover.hidden = isVideo && mobile;
    audioPlayerEl = target;
    bindAudioPlayerMiniSync(target);
    bindAudioPlayerProgressSave(target);
  }

  // Bind the mini-player sync events. Idempotent via WeakSet so calling
  // it on the same element twice is safe. swapAudioPlayerForEp() calls
  // this for the video element on first switch.
  function bindAudioPlayerMiniSync(el) {
    if (!el || _audioElBound.has(el)) return;
    _audioElBound.add(el);
    el.addEventListener('play',       updateAudioMiniPlayIcon);
    el.addEventListener('pause',      updateAudioMiniPlayIcon);
    el.addEventListener('playing',    updateAudioMiniPlayIcon);
    el.addEventListener('waiting',    updateAudioMiniPlayIcon);
    el.addEventListener('ended',      updateAudioMiniPlayIcon);
    el.addEventListener('loadstart',      () => { updateAudioMiniMeta(); updateAudioMiniPlayIcon(); });
    el.addEventListener('loadedmetadata', () => { updateAudioMiniMeta(); updateAudioMiniProgress(); });
    el.addEventListener('timeupdate', () => {
      if (state.audioMiniVisible) updateAudioMiniProgress();
    });
  }
  bindAudioPlayerMiniSync(audioPlayerEl);
  bindAudioPlayerMiniSync(audioVideoEl);
  bindAudioPlayerMiniSync(amstVideoEl);
  const audioSidebarTitle = $('audio-sidebar-title');
  const audioEpSortBar    = $('audio-ep-sort-bar');
  const audioEpSortSelect = $('audio-ep-sort-select');
  const audioEpSortDirBtn = $('audio-ep-sort-dir-btn');
  const audioEpisodeList = $('audio-episode-list');
  const audioCover      = $('audio-cover');
  const audioEpTitle    = $('audio-ep-title');
  const audioEpMeta     = $('audio-ep-meta');
  const audioPrevBtn    = $('audio-prev-btn');
  const audioNextBtn    = $('audio-next-btn');
  const audioLoopBtn    = $('audio-loop-btn');
  const audioLoopAllBtn = $('audio-loop-all-btn');
  const audioShuffleBtn = $('audio-shuffle-btn');
  const audioLikeBtn    = $('audio-like-btn');
  const audioSleepBtn   = $('audio-sleep-btn');
  const audioSleepLabel = $('audio-sleep-label');
  const audioLyricPanel = $('audio-lyric-panel');
  const audioLyricList  = $('audio-lyric-list');
  const audioLyricEmpty = $('audio-lyric-empty');
  const audioFsubEl     = $('audio-fsub');
  const audioFsubText   = $('audio-fsub-text');
  const audioFsubToggle = $('audio-fsub-toggle');
  const amstFsubBtn     = $('amst-fsub');

  // Floating subtitle: shows just the active lyric line in a fixed
  // overlay so the user can keep eyes off the lyric panel. State is
  // user-toggled and persisted to localStorage (default off — explicit
  // opt-in keeps a clean playback view).
  let audioFsubVisible = (() => {
    try { return localStorage.getItem('ds124_audio_fsub') === '1'; }
    catch (_) { return false; }
  })();
  function setAudioFsubVisible(v) {
    audioFsubVisible = !!v;
    try { localStorage.setItem('ds124_audio_fsub', v ? '1' : '0'); } catch (_) {}
    applyAudioFsubVisible();
    syncAudioFsubToggleUI();
  }
  function applyAudioFsubVisible() {
    if (!audioFsubEl) return;
    const hasContent = !!(audioLyric && audioLyric.lines && audioLyric.lines.length);
    audioFsubEl.hidden = !audioFsubVisible || !hasContent;
  }
  function updateAudioFsubText() {
    if (!audioFsubText) return;
    if (!audioLyric || audioLyric.activeIndex < 0
        || !audioLyric.lines || !audioLyric.lines[audioLyric.activeIndex]) {
      audioFsubText.textContent = '';
      return;
    }
    audioFsubText.textContent = audioLyric.lines[audioLyric.activeIndex].text || '';
  }
  function syncAudioFsubToggleUI() {
    if (audioFsubToggle) audioFsubToggle.checked = audioFsubVisible;
    if (amstFsubBtn) amstFsubBtn.classList.toggle('active', audioFsubVisible);
  }
  if (audioFsubToggle) {
    audioFsubToggle.addEventListener('change', () => setAudioFsubVisible(audioFsubToggle.checked));
  }
  if (amstFsubBtn) {
    amstFsubBtn.addEventListener('click', () => setAudioFsubVisible(!audioFsubVisible));
  }
  syncAudioFsubToggleUI();

  // Drag + resize persistence. The pill starts CSS-centered (left:50% +
  // translateX:-50%); the first user drag flips it to absolute left/top
  // and from then on we stop fighting CSS. Resize is the browser's
  // built-in `resize: both` corner grip; ResizeObserver records the
  // outcome. State stored in localStorage and re-applied on next visit
  // (clamped to current viewport so a phone-saved layout doesn't end up
  // off-screen on desktop and vice versa).
  if (audioFsubEl) {
    const FSUB_LAYOUT_KEY = 'ds124_audio_fsub_layout';
    let fsubDrag = null;

    function applyFsubLayout(layout) {
      if (!layout) return;
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = Math.max(160, Math.min(layout.width || 0, vw));
      const h = Math.max(44, Math.min(layout.height || 0, vh));
      let left = Number.isFinite(layout.left) ? layout.left : null;
      let top  = Number.isFinite(layout.top)  ? layout.top  : null;
      if (left == null || top == null) return;
      left = Math.max(0, Math.min(left, vw - w));
      top  = Math.max(0, Math.min(top,  vh - h));
      audioFsubEl.style.left = left + 'px';
      audioFsubEl.style.top  = top + 'px';
      audioFsubEl.style.right = 'auto';
      audioFsubEl.style.bottom = 'auto';
      audioFsubEl.style.transform = 'none';
      if (w > 0) audioFsubEl.style.width  = w + 'px';
      if (h > 0) audioFsubEl.style.height = h + 'px';
    }
    function persistFsubLayout() {
      try {
        const r = audioFsubEl.getBoundingClientRect();
        localStorage.setItem(FSUB_LAYOUT_KEY, JSON.stringify({
          left: r.left, top: r.top, width: r.width, height: r.height,
        }));
      } catch (_) {}
    }
    function loadFsubLayout() {
      try {
        const raw = localStorage.getItem(FSUB_LAYOUT_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (_) { return null; }
    }

    // Movement threshold (px) before pointerdown commits to a real drag.
    // Below this, we treat the gesture as a click/tap and leave the CSS
    // centered layout alone. Without this guard, every accidental tap on
    // mobile would freeze the pill at fixed left/top px and lose the
    // CSS auto-centering behavior.
    const FSUB_DRAG_THRESHOLD = 4;
    audioFsubEl.addEventListener('pointerdown', (e) => {
      // Skip clicks that landed on the resize grip — the browser handles
      // those natively. The grip occupies the bottom-right ~14px square.
      const r = audioFsubEl.getBoundingClientRect();
      const onGrip = (e.clientX > r.right - 18) && (e.clientY > r.bottom - 18);
      if (onGrip) return;
      // Stash the press info but DO NOT mutate layout yet. The first
      // pointermove that exceeds the threshold flips us into real drag
      // mode. A pointerup before that = a tap, which leaves the CSS
      // centered layout untouched.
      fsubDrag = {
        startX: e.clientX, startY: e.clientY,
        originRect: r, dragging: false, pointerId: e.pointerId,
      };
    });
    audioFsubEl.addEventListener('pointermove', (e) => {
      if (!fsubDrag) return;
      const dx = e.clientX - fsubDrag.startX;
      const dy = e.clientY - fsubDrag.startY;
      // Below threshold = still a tap candidate. Don't disturb layout.
      if (!fsubDrag.dragging) {
        if (Math.abs(dx) < FSUB_DRAG_THRESHOLD && Math.abs(dy) < FSUB_DRAG_THRESHOLD) return;
        // First real movement: snap to free positioning.
        try { audioFsubEl.setPointerCapture(fsubDrag.pointerId); } catch (_) {}
        const r = fsubDrag.originRect;
        audioFsubEl.style.left = r.left + 'px';
        audioFsubEl.style.top  = r.top + 'px';
        audioFsubEl.style.right = 'auto';
        audioFsubEl.style.bottom = 'auto';
        audioFsubEl.style.transform = 'none';
        audioFsubEl.style.width = r.width + 'px';
        fsubDrag.dx = fsubDrag.startX - r.left;
        fsubDrag.dy = fsubDrag.startY - r.top;
        fsubDrag.dragging = true;
        audioFsubEl.classList.add('dragging');
      }
      const vw = window.innerWidth, vh = window.innerHeight;
      const w = audioFsubEl.offsetWidth, h = audioFsubEl.offsetHeight;
      const x = Math.max(0, Math.min(e.clientX - fsubDrag.dx, vw - w));
      const y = Math.max(0, Math.min(e.clientY - fsubDrag.dy, vh - h));
      audioFsubEl.style.left = x + 'px';
      audioFsubEl.style.top  = y + 'px';
      e.preventDefault();
    });
    function endFsubDrag(e) {
      if (!fsubDrag) return;
      const wasDragging = fsubDrag.dragging;
      try { audioFsubEl.releasePointerCapture(fsubDrag.pointerId); } catch (_) {}
      fsubDrag = null;
      audioFsubEl.classList.remove('dragging');
      // Only persist if we actually committed to a drag — otherwise a
      // mere tap would write a position that defeats CSS centering.
      if (wasDragging) persistFsubLayout();
    }
    audioFsubEl.addEventListener('pointerup', endFsubDrag);
    audioFsubEl.addEventListener('pointercancel', endFsubDrag);

    // Double-click anywhere on the pill = reset to the CSS-centered
    // default. Wipes inline left/top/transform/width and clears stored
    // layout so the next visit also starts centered. This is the
    // escape hatch in case a stray tap-and-drag-1px somehow flipped
    // the pill into free-positioning mode.
    audioFsubEl.addEventListener('dblclick', () => {
      audioFsubEl.style.left = '';
      audioFsubEl.style.top = '';
      audioFsubEl.style.right = '';
      audioFsubEl.style.bottom = '';
      audioFsubEl.style.transform = '';
      audioFsubEl.style.width = '';
      audioFsubEl.style.height = '';
      try { localStorage.removeItem(FSUB_LAYOUT_KEY); } catch (_) {}
    });

    // Persist native resize-handle outcomes. Only writes when the pill
    // is already in free-positioning mode (inline left set + transform
    // disabled) — otherwise a CSS-driven layout shift (e.g. window
    // resize) would falsely persist and break centering.
    if (typeof ResizeObserver !== 'undefined') {
      let rsTimer = 0;
      const ro = new ResizeObserver(() => {
        if (fsubDrag) return;
        if (!audioFsubEl.style.left || audioFsubEl.style.transform !== 'none') return;
        clearTimeout(rsTimer);
        rsTimer = setTimeout(persistFsubLayout, 200);
      });
      ro.observe(audioFsubEl);
    }

    // Restore previous layout. Wait one frame so the element has a
    // measured rect before we read it.
    requestAnimationFrame(() => applyFsubLayout(loadFsubLayout()));
  }
  const sleepPopover    = $('sleep-popover');

  let audioPlyr = null;
  let audioLyric = null;  // { lines, activeIndex, userScroll, scrollLockUntil }
  let audioSleep = { mode: 'hard', fade: false, endAt: 0, timerId: null, tickId: null };

  async function initAudioPlyr() {
    if (audioPlyr) return;
    if (!audioPlayerEl) return;
    try { await loadPlyrAssets(); } catch (e) { console.warn(e); return; }
    if (typeof Plyr === 'undefined') return;
    audioPlyr = new Plyr(audioPlayerEl, {
      controls: [
        'play-large', 'restart', 'play',
        'progress', 'current-time', 'duration',
        'mute', 'volume', 'settings',
      ],
      settings: ['speed'],
      speed: { selected: 1, options: [0.5, 0.75, 1, 1.25, 1.5, 1.75, 2] },
      iconUrl: '/vendor/plyr/plyr.svg',
      i18n: {
        play: '播放', pause: '暂停', restart: '重播',
        seek: '定位', volume: '音量', mute: '静音', unmute: '取消静音',
        settings: '设置', speed: '速度', normal: '正常',
      },
    });
  }

  async function showAudioPlayer(id, file) {
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = id.toUpperCase();
    viewAudioPlayer.hidden = false;
    if (!state.user) { navigate('#/login'); return; }

    // Mutex: entering the audio player stops any video that was
    // playing (main view OR mini). Also hide the audio mini since the
    // user is now looking at the full audio player — no need for a
    // floating card duplicating the same controls.
    try { stopVideoPlayback(); } catch (e) {}
    hideAudioMini();

    await initAudioPlyr();

    // Use audioNowPlaying as authoritative source so that navigation to
    // another video collection while audio mini is active doesn't cause
    // a false sameFile=false and reload the track from scratch.
    const np = state.audioNowPlaying;
    let collection = (np && np.col && np.col.id === id) ? np.col : state.currentCollection;
    // Virtual "all audio" collection already loaded in memory — skip API.
    if ((id === '__all_audio__' || id === '__liked_audio__' || id === '__liked_images__') && collection && collection._virtual) {
      // keep as is
    } else if (!collection || collection.id !== id) {
      try {
        const res = await api('GET', '/api/collections/' + encodeURIComponent(id));
        collection = res.collection;
        state.currentCollection = collection;
      } catch (err) {
        toast('加载合集失败: ' + err.message, 'error');
        navigate('#/');
        return;
      }
    }
    try {
      const res = await api('GET', '/api/progress');
      state.progressAll = res.progress || {};
    } catch (e) {}

    const ep = collection.episodes.find((e) => e.file === file);
    if (!ep) {
      toast('集数不存在: ' + file, 'error');
      navigate('#/c/' + encodeURIComponent(id));
      return;
    }
    const sameFile = np && np.file === file;
    state.currentFile = file;

    audioSidebarTitle.textContent = '// ' + (collection.title || collection.id);
    // ── Audio sidebar sort bar ──
    if (audioEpSortBar && audioEpSortSelect && audioEpSortDirBtn) {
      const pref = getEpSortPref(collection.id);
      syncSortBar(audioEpSortSelect, audioEpSortDirBtn, audioEpSortBar, pref, true);
      const newS = audioEpSortSelect.cloneNode(true);
      const newB = audioEpSortDirBtn.cloneNode(true);
      audioEpSortSelect.replaceWith(newS);
      audioEpSortDirBtn.replaceWith(newB);
      const sel3 = $('audio-ep-sort-select');
      const btn3 = $('audio-ep-sort-dir-btn');
      sel3.addEventListener('change', () => {
        const p = getEpSortPref(collection.id);
        p.field = sel3.value;
        setEpSortPref(collection.id, p.field, p.asc);
        btn3.textContent = p.asc ? '↑' : '↓';
        buildPlayQueue(collection);   // sort change re-seeds the queue
        renderAudioEpisodeList(collection);
      });
      btn3.addEventListener('click', () => {
        const p = getEpSortPref(collection.id);
        p.asc = !p.asc;
        setEpSortPref(collection.id, p.field, p.asc);
        btn3.textContent = p.asc ? '↑' : '↓';
        buildPlayQueue(collection);   // sort change re-seeds the queue
        renderAudioEpisodeList(collection);
      });
    }
    renderAudioEpisodeList(collection);

    // Per-track cover: load the currently-playing track's own embedded
    // art via /audio/api/collections/:id/episodes/:file/cover. If the
    // track has no embedded art (404), clear the background entirely —
    // we intentionally do NOT fall back to collection.cover, per spec.
    // Use an Image() probe so a 404 doesn't flash the old cover
    // briefly before clearing.
    audioCover.style.backgroundImage = 'none';
    const amstCoverEl = document.getElementById('amst-cover');
    if (amstCoverEl) amstCoverEl.style.backgroundImage = 'none';
    const trackCoverUrl = '/audio/api/collections/'
      + encodeURIComponent(collection.id) + '/episodes/'
      + encodePath(ep.file) + '/cover';
    const probe = new Image();
    probe.onload = () => {
      // Ignore races: if the user already moved to another track, bail.
      if (state.currentFile !== ep.file) return;
      const url = `url("${trackCoverUrl}")`;
      audioCover.style.backgroundImage = url;
      if (amstCoverEl) amstCoverEl.style.backgroundImage = url;
      // Lyric-overlay backdrop: same blurred image. CSS reads the var.
      document.documentElement.style.setProperty('--amst-cover-url', url);
      const lyricBg = document.getElementById('amst-lyric-bg');
      if (lyricBg) lyricBg.style.backgroundImage = url;
    };
    probe.onerror = () => { /* 404 → leave blank */ };
    probe.src = trackCoverUrl;

    audioEpTitle.textContent = ep.title;
    // v1.9.0 HiFi badge — replaces the legacy "#01 · FLAC · 25 MB" line
    // with a richer "FLAC 24bit/96kHz · 5.1ch · 4127kbps [Lossless]"
    // render. Falls back to the legacy format when mediaInfo isn't
    // present yet (first boot or pending probe-queue scan).
    audioEpMeta.innerHTML = formatAudioHiFiBadge(ep);
    // Mobile stage title block — mirrors the desktop title/meta plus
    // the artist (which the desktop layout omits) and collection name.
    const amstTitle = document.getElementById('amst-title');
    const amstArtist = document.getElementById('amst-artist');
    const amstCol = document.getElementById('amst-collection');
    if (amstTitle) amstTitle.textContent = ep.title || '';
    if (amstArtist) amstArtist.textContent = ep.artist || '未知作者 / 公司';
    if (amstCol) amstCol.textContent = collection.title || collection.id || '';
    // Sync like button
    if (audioLikeBtn) {
      audioLikeBtn.checked = !collection._virtual && isTrackLiked(collection.id, ep.file);
    }
    try { syncAmstControls(); } catch (_e) {}
    // Re-sync the mobile play icon to current paused state. The
    // play/pause events drive it normally, but on view re-entry (e.g.
    // expanding from background-audio mini) no event fires and the
    // icon would stick on its initial ▶.
    try {
      const ic = document.getElementById('amst-play-icon');
      if (ic && audioPlayerEl) {
        if (audioPlayerEl.paused) ic.innerHTML = '<path d="M7 4l14 8-14 8V4z"/>';
        else ic.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      }
    } catch (_e) {}

    if (!sameFile) {
      const freshStart = state.pendingFreshStart;
      state.pendingFreshStart = false;
      loadAudioTrack(collection, ep, { forceRestart: freshStart });

      // Fetch lyric.
      audioLyric = null;
      renderLyricPanel();
      loadAudioLyric(collection.id, ep.file);
    }

    countEl.textContent = '#' + String(ep.order).padStart(2, '0') + ' / ' + collection.episodeCount;
    const idx = collection.episodes.findIndex((e) => e.file === file);
    audioPrevBtn.disabled = idx <= 0;
    audioNextBtn.disabled = idx < 0 || idx >= collection.episodes.length - 1;
    // With loop-all or shuffle active, prev/next always have a valid
    // target so we never disable them at the list boundaries.
    if (state.loopAllMode || state.shuffleMode) {
      audioPrevBtn.disabled = false;
      audioNextBtn.disabled = false;
    }
    updateLoopShuffleUI();
  }

  function renderAudioEpisodeList(collection) {
    if (!audioEpisodeList) return;
    // Render in session play-queue order so the list IS the queue: drag
    // to reorder here changes what plays next.
    const eps = orderedEpisodes(collection);
    const rows = eps.map((ep) => {
      const p = (state.progressAll[collection.id] || {})[ep.file];
      const isActive = ep.file === state.currentFile;
      const done = p && p.duration && p.position / p.duration > 0.9;
      const prog = p && p.duration
        ? Math.min(1, Math.max(0, p.position / p.duration))
        : 0;
      return `<li class="ep-row q-row ${isActive ? 'active' : ''} ${done ? 'done' : ''}" data-file="${encodeURIComponent(ep.file)}">
        <span class="q-grip" title="拖动排序" aria-label="拖动排序">⠿</span>
        <span class="ep-num mono">#${String(ep.order).padStart(2, '0')}</span>
        <div class="ep-body">
          <div class="ep-title">${escapeHtml(ep.title)}</div>
          <div class="ep-meta mono">${formatSize(ep.size)}</div>
          <div class="ep-progress"><span style="width:${(prog * 100).toFixed(1)}%"></span></div>
        </div>
        <span class="q-moves">
          <button type="button" class="q-up" title="上移" aria-label="上移">▲</button>
          <button type="button" class="q-down" title="下移" aria-label="下移">▼</button>
        </span>
      </li>`;
    }).join('');
    audioEpisodeList.innerHTML = rows || '<li class="cards-status mono">（空）</li>';
    for (const row of audioEpisodeList.querySelectorAll('li.ep-row')) {
      row.addEventListener('click', (e) => {
        // Ignore clicks on the reorder controls — those manipulate the
        // queue, they don't switch tracks.
        if (e.target.closest('.q-grip, .q-up, .q-down')) return;
        const f = decodeURIComponent(row.dataset.file);
        navigate('#/c/' + encodeURIComponent(collection.id) + '/play/' + encodeURIComponent(f));
      });
    }
    wireQueueDragReorder(audioEpisodeList, collection, () => renderAudioEpisodeList(collection));
  }

  // ------ lyric loading + rendering ------
  async function loadAudioLyric(collectionId, file) {
    try {
      const res = await api('GET',
        '/api/collections/' + encodeURIComponent(collectionId)
        + '/episodes/' + encodePath(file) + '/lyric');
      if (res && res.lyric && Array.isArray(res.lyric.lines) && res.lyric.lines.length) {
        audioLyric = {
          lines: res.lyric.lines,
          format: res.lyric.format,
          activeIndex: -1,
          userScroll: false,
          scrollLockUntil: 0,
        };
      } else {
        audioLyric = null;
      }
    } catch (e) {
      audioLyric = null;
    }
    renderLyricPanel();
    // New ep / new lyric — reset the floating subtitle text and re-eval
    // visibility (it auto-hides when no lyric content is available).
    updateAudioFsubText();
    applyAudioFsubVisible();
  }

  function renderLyricPanel() {
    if (!audioLyricList || !audioLyricEmpty) return;
    audioLyricList.innerHTML = '';
    if (!audioLyric || !audioLyric.lines || audioLyric.lines.length === 0) {
      audioLyricEmpty.hidden = false;
      return;
    }
    audioLyricEmpty.hidden = true;
    const hasTime = audioLyric.lines.some((l) => typeof l.t === 'number');
    const frag = document.createDocumentFragment();
    audioLyric.lines.forEach((line, i) => {
      const li = document.createElement('li');
      li.className = 'lyric-line' + (hasTime ? '' : ' static');
      li.textContent = line.text || '\u00a0';
      li.dataset.idx = String(i);
      if (hasTime && typeof line.t === 'number') {
        li.addEventListener('click', () => {
          try { audioPlayerEl.currentTime = line.t; audioPlayerEl.play().catch(() => {}); }
          catch (e) {}
        });
      }
      frag.appendChild(li);
    });
    audioLyricList.appendChild(frag);
  }

  function updateLyricHighlight() {
    if (!audioLyric || !audioLyricList) return;
    const t = audioPlayerEl.currentTime || 0;
    const lines = audioLyric.lines;
    // Binary search for the last line with line.t <= t
    let lo = 0, hi = lines.length - 1, idx = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      const lt = lines[mid].t;
      if (typeof lt !== 'number') { lo = mid + 1; continue; }
      if (lt <= t) { idx = mid; lo = mid + 1; }
      else { hi = mid - 1; }
    }
    const indexChanged = idx !== audioLyric.activeIndex;
    if (indexChanged) {
      audioLyric.activeIndex = idx;
      const prev = audioLyricList.querySelector('.lyric-line.active');
      if (prev) prev.classList.remove('active');
      if (idx >= 0) {
        const el = audioLyricList.querySelector(`.lyric-line[data-idx="${idx}"]`);
        if (el) el.classList.add('active');
      }
      // Mirror the active line into the floating overlay subtitle.
      updateAudioFsubText();
    }
    if (idx < 0) return;
    const el = audioLyricList.querySelector(`.lyric-line[data-idx="${idx}"]`);
    if (!el) return;
    // User-scroll lockout still active → don't fight the user.
    if (Date.now() < audioLyric.scrollLockUntil) return;
    const panel = audioLyricPanel;
    const r = el.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    // Distance from the line's center to the panel's center. If it's
    // already close enough AND nothing changed, no-op (avoid redundant
    // scrollTo on every timeupdate). If it's far enough — either because
    // the active line just changed OR because the user manually scrolled
    // away earlier and the lockout has now expired — re-center.
    const lineMid = r.top + r.height / 2;
    const panelMid = pr.top + pr.height / 2;
    const offCenter = Math.abs(lineMid - panelMid);
    const tolerance = pr.height * 0.15;  // ~15% of panel height
    if (!indexChanged && offCenter <= tolerance) return;
    const target = panel.scrollTop + (r.top - pr.top) - (pr.height / 2 - r.height / 2);
    panel.scrollTo({ top: target, behavior: 'smooth' });
  }

  // Bind progress-save + ended-advance handlers. Bound to both audio and
  // video sibling so video episodes inside an audio collection save
  // progress and auto-advance the same way audio episodes do. Handlers
  // read `audioPlayerEl` from the closure so they always see the
  // currently-active element.
  function bindAudioPlayerProgressSave(el) {
    if (!el || _audioElBound2.has(el)) return;
    _audioElBound2.add(el);
    el.addEventListener('timeupdate', () => {
      updateLyricHighlight();
      // Save progress every 5s
      if (!state.user || !state.currentFile || !state.currentCollection) return;
      if (state.kind !== 'audio') return;
      const now = Date.now();
      if (now - lastAudioSave < 5000) return;
      lastAudioSave = now;
      if (!isFinite(audioPlayerEl.currentTime) || audioPlayerEl.currentTime <= 0) return;
      const id = state.currentCollection.id;
      const file = state.currentFile;
      api('POST', `/api/progress/${encodeURIComponent(id)}/${encodeURIComponent(file)}`, {
        position: audioPlayerEl.currentTime,
        duration: isFinite(audioPlayerEl.duration) ? audioPlayerEl.duration : null,
      }).catch(() => {});
      if (!state.progressAll[id]) state.progressAll[id] = {};
      state.progressAll[id][file] = Object.assign({}, state.progressAll[id][file] || {}, {
        position: audioPlayerEl.currentTime,
        duration: isFinite(audioPlayerEl.duration) ? audioPlayerEl.duration : undefined,
        updatedAt: now,
      });
    });
    el.addEventListener('ended', () => {
      // Save as watched — against audioNowPlaying, NOT the view state,
      // so background playback correctly attributes progress to the
      // track that actually just finished.
      const np = state.audioNowPlaying;
      if (state.user && np && np.col && np.file
          && isFinite(audioPlayerEl.duration) && audioPlayerEl.duration > 0) {
        api('POST', `/api/progress/${encodeURIComponent(np.col.id)}/${encodeURIComponent(np.file)}`, {
          position: audioPlayerEl.duration,
          duration: audioPlayerEl.duration,
        }).catch(() => {});
      }
      if (state.loopMode) {
        try { audioPlayerEl.currentTime = 0; audioPlayerEl.play(); } catch (e) {}
        return;
      }
      // Sleep soft mode: stop now instead of advancing.
      if (audioSleep.endAt && audioSleep.mode === 'soft' && Date.now() >= audioSleep.endAt) {
        cancelSleepTimer();
        toast('定时已到 · 当前曲播完自动停止');
        return;
      }
      if (!np || !np.col) return;
      const next = nextTrackIn(np.col, np.file);
      if (!next) return;
      // If the audio player view is the current one, navigate so the
      // sidebar highlights the new active track. Otherwise load the
      // next track in place without yanking the user out of whatever
      // page they're on.
      if (viewAudioPlayer && !viewAudioPlayer.hidden && state.kind === 'audio') {
        navigate(playHash(np.col.id, next.file));
      } else {
        loadAudioTrack(np.col, next);
        updateAudioMiniMeta();
      }
    });
  }
  const _audioElBound2 = new WeakSet();
  bindAudioPlayerProgressSave(audioPlayerEl);
  bindAudioPlayerProgressSave(audioVideoEl);
  bindAudioPlayerProgressSave(amstVideoEl);
  let lastAudioSave = 0;

  // ── Audio track like button ──
  if (audioLikeBtn) {
    audioLikeBtn.addEventListener('change', async () => {
      const col = state.currentCollection;
      const file = state.currentFile;
      if (!col || !file || col._virtual) return;
      await toggleTrackLike(col.id, file);
      audioLikeBtn.checked = isTrackLiked(col.id, file);
    });
  }

  if (audioLyricPanel) {
    audioLyricPanel.addEventListener('wheel', () => {
      if (!audioLyric) return;
      audioLyric.scrollLockUntil = Date.now() + 4000;
    }, { passive: true });
    audioLyricPanel.addEventListener('touchmove', () => {
      if (!audioLyric) return;
      audioLyric.scrollLockUntil = Date.now() + 4000;
    }, { passive: true });
  }

  // Extract the parent directory of a file path (relative to the
  // collection root). Root files return ''. Mirrors the epDir helper
  // used in the episode list, re-declared here as a local util so
  // the nav functions don't depend on hoist order.
  function parentDirOf(file) {
    const i = String(file || '').lastIndexOf('/');
    return i < 0 ? '' : file.slice(0, i);
  }
  // Narrow an episode array to just the ones matching the current
  // specifiedPlayScope. When scope is null (default), returns the
  // full array untouched. When scope is set, returns only episodes
  // whose parent directory equals the scope — this is what makes
  // "specified play" stay inside the folder the user clicked from.
  // User-level player modes (loopMode / loopAllMode / shuffleMode)
  // keep working on the NARROWED pool, so "list loop + scope =
  // Season 1" loops back to S01E01 after S01E12, not across seasons.
  /**
   * @brief (Re)build the session play queue for a collection.
   * @details Seeds the queue from the current sort preference + chain
   *          gluing, capturing just the ordered file keys. Called when a
   *          collection starts playing and whenever its sort changes.
   * @param collection The collection now playing.
   */
  function buildPlayQueue(collection) {
    if (!collection || !collection.id) { state.playQueue = null; return; }
    const pref = getEpSortPref(collection.id);
    const ordered = sortEpisodes(collection.episodes, pref.field, pref.asc);
    state.playQueue = { colId: collection.id, order: ordered.map((e) => e.file) };
  }

  /**
   * @brief Episodes of a collection in current play-queue order.
   * @details Lazily builds the queue if absent or belonging to another
   *          collection. Reconciles against the live episode set: files
   *          missing from disk drop out, and freshly-added files are
   *          appended in their sorted+chained position — all without
   *          discarding the user's manual arrangement.
   * @param collection The collection to order.
   * @return Episode objects in play-queue order (full collection, scope
   *         filtering is applied separately by scopedEpisodes).
   */
  function orderedEpisodes(collection) {
    if (!collection || !collection.episodes) return [];
    if (!state.playQueue || state.playQueue.colId !== collection.id) {
      buildPlayQueue(collection);
    }
    const byFile = new Map(collection.episodes.map((e) => [e.file, e]));
    const out = [];
    const seen = new Set();
    for (const f of state.playQueue.order) {
      const ep = byFile.get(f);
      if (ep && !seen.has(f)) { out.push(ep); seen.add(f); }
    }
    if (seen.size !== collection.episodes.length) {
      const pref = getEpSortPref(collection.id);
      for (const ep of sortEpisodes(collection.episodes, pref.field, pref.asc)) {
        if (!seen.has(ep.file)) { out.push(ep); seen.add(ep.file); }
      }
      state.playQueue.order = out.map((e) => e.file);
    }
    return out;
  }

  /**
   * @brief Commit a new manual order for the play queue.
   * @details Re-glues chains (applyChains) so every tail still trails its
   *          head, then stores the resulting file-key order. Because
   *          next/prev read scopedEpisodes (which reads the queue), the
   *          playback order updates immediately with no extra wiring.
   * @param collection The collection the queue belongs to.
   * @param files      The desired order as a list of file keys.
   */
  function setPlayQueueOrder(collection, files) {
    if (!collection || !collection.episodes) return;
    const byFile = new Map(collection.episodes.map((e) => [e.file, e]));
    const eps = files.map((f) => byFile.get(f)).filter(Boolean);
    const glued = applyChains(eps);
    state.playQueue = { colId: collection.id, order: glued.map((e) => e.file) };
  }

  function scopedEpisodes(collection) {
    // Base order comes from the session play queue (which is itself
    // seeded from the sort preference + chains and then user-reorderable),
    // so prev/next always follow whatever the user sees in the queue UI.
    const eps = orderedEpisodes(collection);
    if (state.specifiedPlayScope == null) return eps;
    return eps.filter((e) => parentDirOf(e.file) === state.specifiedPlayScope);
  }

  /**
   * @brief Generic pointer-based row reordering for an episode list.
   * @details Uses Pointer Events rather than HTML5 drag-and-drop so it
   *          behaves identically on touch and mouse (HTML5 DnD does not
   *          fire on touch — the cause of the old "drag does nothing on
   *          phone" bug). A drag begins only from a .q-grip handle, so a
   *          normal tap on the row still does its default action (play /
   *          select). The DOM is reordered live; on release the resulting
   *          file-key order is read back and handed to onCommit.
   *
   *          Grip listeners are bound per-element. The grips are recreated
   *          on every render, so their listeners are discarded with the
   *          old DOM — no accumulation across re-renders.
   * @param listEl   The <ul> whose li.ep-row[data-file] children reorder.
   * @param onCommit Receives the new ordered array of file keys.
   */
  function wirePointerReorder(listEl, onCommit) {
    const readOrder = () => Array.from(listEl.querySelectorAll('li.ep-row[data-file]'))
      .map((r) => decodeURIComponent(r.dataset.file));
    let dragRow = null;      // the row actively being dragged
    let pending = null;      // a mouse press on the row body, awaiting threshold
    let startX = 0, startY = 0;
    const THRESHOLD = 5;     // px of movement before a body press becomes a drag

    const reorderTo = (clientY) => {
      const others = Array.from(listEl.querySelectorAll('li.ep-row[data-file]'))
        .filter((r) => r !== dragRow);
      for (const r of others) {
        const rect = r.getBoundingClientRect();
        if (clientY < rect.top + rect.height / 2) { listEl.insertBefore(dragRow, r); return; }
      }
      listEl.appendChild(dragRow);
    };
    const onMove = (ev) => {
      // Promote a pending body-press to an active drag once it moves enough.
      if (pending && !dragRow) {
        if (Math.abs(ev.clientY - startY) < THRESHOLD && Math.abs(ev.clientX - startX) < THRESHOLD) return;
        dragRow = pending; pending = null;
        dragRow.classList.add('dragging');
      }
      if (!dragRow) return;
      ev.preventDefault();
      reorderTo(ev.clientY);
    };
    const onUp = () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', onUp);
      pending = null;
      if (!dragRow) return;          // press without enough movement → was a click
      dragRow.classList.remove('dragging');
      dragRow = null;
      // Swallow the click the browser fires after the drop so the row's
      // play/navigate handler doesn't trigger on release. Self-removing,
      // with a timeout in case no click follows.
      const killClick = (ev) => {
        ev.stopPropagation(); ev.preventDefault();
        document.removeEventListener('click', killClick, true);
      };
      document.addEventListener('click', killClick, true);
      setTimeout(() => document.removeEventListener('click', killClick, true), 350);
      onCommit(readOrder());
    };
    const startDrag = (row) => {
      dragRow = row;
      dragRow.classList.add('dragging');
      document.addEventListener('pointermove', onMove, { passive: false });
      document.addEventListener('pointerup', onUp);
    };
    // Grip handle: immediate drag — the touch-friendly path (touch-action
    // :none on .q-grip keeps the gesture from scrolling the list).
    for (const grip of listEl.querySelectorAll('.q-grip')) {
      grip.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const row = grip.closest('li.ep-row[data-file]');
        if (row) startDrag(row);
      });
    }
    // Whole-row drag on desktop: a left-button press anywhere on the row
    // body starts a drag once it moves past THRESHOLD; a press without
    // movement remains a normal click (play). Touch is intentionally
    // excluded here so a finger can still scroll the list — touch reorders
    // via the grip. Presses on interactive children are ignored.
    for (const row of listEl.querySelectorAll('li.ep-row[data-file]')) {
      row.addEventListener('pointerdown', (e) => {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        if (e.target.closest('.q-grip, .q-up, .q-down, .ep-submenu-btn, button, a, input, select')) return;
        pending = row; startX = e.clientX; startY = e.clientY;
        document.addEventListener('pointermove', onMove, { passive: false });
        document.addEventListener('pointerup', onUp);
      });
    }
  }

  /**
   * @brief Attach reordering to the session play-queue list.
   * @details Grip drag (via wirePointerReorder) plus .q-up / .q-down tap
   *          fallback. Every commit re-glues chains (setPlayQueueOrder)
   *          and redraws; next/prev follow automatically via scopedEpisodes.
   * @param listEl     The queue <ul>.
   * @param collection The collection the queue belongs to.
   * @param rerender   Callback that redraws the list after a commit.
   */
  function wireQueueDragReorder(listEl, collection, rerender) {
    const commit = (files) => { setPlayQueueOrder(collection, files); rerender(); };
    // Up/down tap fallback, bound per-button (fresh each render).
    for (const btn of listEl.querySelectorAll('.q-up, .q-down')) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const row = btn.closest('li.ep-row[data-file]');
        if (!row) return;
        if (btn.classList.contains('q-up') && row.previousElementSibling) {
          listEl.insertBefore(row, row.previousElementSibling);
        } else if (btn.classList.contains('q-down') && row.nextElementSibling) {
          listEl.insertBefore(row.nextElementSibling, row);
        } else { return; }
        commit(Array.from(listEl.querySelectorAll('li.ep-row[data-file]')).map((r) => decodeURIComponent(r.dataset.file)));
      });
    }
    wirePointerReorder(listEl, commit);
  }

  // Pick the next/prev track within an explicit (collection, file)
  // pair. Honors shuffle / loop-all / sequential just like the video
  // nextEpisode() does. Used by the audio mini prev/next and the
  // audio <audio> ended handler, both of which need to operate on
  // `state.audioNowPlaying` (which may differ from the view-scoped
  // state.currentCollection if the user has navigated away).
  function nextTrackIn(collection, currentFile) {
    if (!collection || !currentFile) return null;
    const eps = scopedEpisodes(collection);
    if (!eps || eps.length === 0) return null;
    if (state.shuffleMode && eps.length > 1) {
      const others = eps.filter((e) => e.file !== currentFile);
      return others[Math.floor(Math.random() * others.length)];
    }
    const idx = eps.findIndex((e) => e.file === currentFile);
    if (idx >= 0 && idx < eps.length - 1) return eps[idx + 1];
    if (state.loopAllMode) return eps[0];
    return null;
  }
  function prevTrackIn(collection, currentFile) {
    if (!collection || !currentFile) return null;
    const eps = scopedEpisodes(collection);
    if (!eps || eps.length === 0) return null;
    if (state.shuffleMode && eps.length > 1) {
      const others = eps.filter((e) => e.file !== currentFile);
      return others[Math.floor(Math.random() * others.length)];
    }
    const idx = eps.findIndex((e) => e.file === currentFile);
    if (idx > 0) return eps[idx - 1];
    if (state.loopAllMode) return eps[eps.length - 1];
    return null;
  }
  // Thin view-scoped wrappers preserved for the full audio player
  // page's prev/next buttons, which naturally operate on the current
  // view (state.currentCollection / state.currentFile == whatever the
  // user is looking at).
  function audioNextEpisode() {
    return nextTrackIn(state.currentCollection, state.currentFile);
  }
  function audioPrevEpisode() {
    return prevTrackIn(state.currentCollection, state.currentFile);
  }
  // Helper: build a play-URL hash that preserves the current
  // specifiedPlayScope. Used by audio prev/next + audio ended to keep
  // scope alive across track changes, same as gotoEp does for video.
  function playHash(colId, file) {
    let h = '#/c/' + encodeURIComponent(colId) + '/play/' + encodeURIComponent(file);
    if (state.specifiedPlayScope != null) {
      h += '?scope=' + encodeURIComponent(state.specifiedPlayScope);
    }
    return h;
  }
  if (audioPrevBtn) audioPrevBtn.addEventListener('click', () => {
    const p = audioPrevEpisode();
    if (p) navigate(playHash(state.currentCollection.id, p.file));
  });
  if (audioNextBtn) audioNextBtn.addEventListener('click', () => {
    const n = audioNextEpisode();
    if (n) navigate(playHash(state.currentCollection.id, n.file));
  });
  // Audio mode buttons share togglePlayMode() with the video side so
  // the exact-same mutex + persistence logic applies. updateLoopShuffleUI
  // syncs both players' button states from shared state.
  if (audioLoopBtn)    audioLoopBtn.addEventListener('change',    () => togglePlayMode('loop'));
  if (audioLoopAllBtn) audioLoopAllBtn.addEventListener('change', () => togglePlayMode('loopAll'));
  if (audioShuffleBtn) audioShuffleBtn.addEventListener('change', () => togglePlayMode('shuffle'));

  // ==================================================================
  // Mobile audio stage wiring (≤600px)
  //
  // Bind a streaming-app-shaped UI on top of the existing <audio>
  // element + Plyr controller. The mobile DOM is visible only on phone
  // (CSS media query); on desktop these handlers attach but the
  // elements are display:none so events never fire from them.
  //
  // State source of truth stays with the desktop toggles
  // (audioLoopBtn etc.) — mobile buttons just dispatch click() on them
  // so togglePlayMode runs and updateLoopShuffleUI repaints both sets.
  // syncAmstControls() (called by updateLoopShuffleUI) mirrors the
  // checkbox state into mobile button .active classes.
  // ==================================================================
  const amst = {
    cover:   document.getElementById('amst-cover'),
    title:   document.getElementById('amst-title'),
    artist:  document.getElementById('amst-artist'),
    coll:    document.getElementById('amst-collection'),
    seek:    document.getElementById('amst-seek'),
    timeCur: document.getElementById('amst-time-cur'),
    timeTot: document.getElementById('amst-time-tot'),
    play:    document.getElementById('amst-play'),
    playIcon:document.getElementById('amst-play-icon'),
    prev:    document.getElementById('amst-prev'),
    next:    document.getElementById('amst-next'),
    shuffle: document.getElementById('amst-shuffle'),
    loop:    document.getElementById('amst-loop'),
    loopBadge:document.getElementById('amst-loop-badge'),
    like:    document.getElementById('amst-like'),
    sleep:   document.getElementById('amst-sleep'),
    sleepLbl:document.getElementById('amst-sleep-label-mobile'),
    lyrics:  document.getElementById('amst-lyrics'),
    queue:   document.getElementById('amst-queue'),
  };
  const amstLyricMask = document.getElementById('amst-lyric-mask');
  const amstLyricClose = document.getElementById('amst-lyric-close');
  const amstQueueMask = document.getElementById('amst-queue-mask');
  const sleepSheetMask = document.getElementById('sleep-sheet-mask');

  // Format `currentTime` / `duration` to "m:ss" or "h:mm:ss". Reuses
  // the existing formatTime helper for consistency with the desktop
  // bottom mini.
  function amstFmt(s) { return formatTime(s); }

  // Reflect current loop / shuffle / like state onto mobile buttons.
  // Loop has 3 states (off / single / list) compressed into one button
  // here; we render a small badge above the icon to distinguish.
  function syncAmstControls() {
    if (!amst.shuffle) return;
    amst.shuffle.classList.toggle('active', !!state.shuffleMode);
    let lbl = '';
    if (state.loopMode) lbl = '1';
    else if (state.loopAllMode) lbl = '∞';
    amst.loop.classList.toggle('active', !!(state.loopMode || state.loopAllMode));
    if (amst.loopBadge) {
      amst.loopBadge.textContent = lbl;
      amst.loopBadge.hidden = !lbl;
    }
    // Like — mirror the audio side checkbox (which itself is updated
    // when track changes via loadAudioTrack).
    if (audioLikeBtn) {
      amst.like.classList.toggle('active', !!audioLikeBtn.checked);
    }
    // Sleep label is updated by setSleepLabel(); mirror its content.
    if (amst.sleepLbl && audioSleepLabel) {
      const txt = audioSleepLabel.textContent || '';
      amst.sleepLbl.textContent = txt === '定时关闭' ? '定时' : txt;
      amst.sleep.classList.toggle('active', !!audioSleepBtn && audioSleepBtn.classList.contains('active'));
    }
  }

  // ── Play / pause / prev / next ──
  if (amst.play) {
    amst.play.addEventListener('click', () => {
      if (!audioPlayerEl) return;
      if (audioPlayerEl.paused) audioPlayerEl.play().catch(() => {});
      else audioPlayerEl.pause();
    });
  }
  if (amst.prev && audioPrevBtn) {
    amst.prev.addEventListener('click', () => audioPrevBtn.click());
  }
  if (amst.next && audioNextBtn) {
    amst.next.addEventListener('click', () => audioNextBtn.click());
  }

  // ── Shuffle: simple toggle through the existing checkbox ──
  if (amst.shuffle && audioShuffleBtn) {
    amst.shuffle.addEventListener('click', () => {
      audioShuffleBtn.checked = !audioShuffleBtn.checked;
      audioShuffleBtn.dispatchEvent(new Event('change'));
    });
  }

  // ── Loop cycle: off → single (loopMode) → list (loopAllMode) → off ──
  if (amst.loop && audioLoopBtn && audioLoopAllBtn) {
    amst.loop.addEventListener('click', () => {
      if (!state.loopMode && !state.loopAllMode) {
        // off → single
        audioLoopBtn.checked = true;
        audioLoopBtn.dispatchEvent(new Event('change'));
      } else if (state.loopMode) {
        // single → list (turn single off, list on)
        audioLoopBtn.checked = false;
        audioLoopBtn.dispatchEvent(new Event('change'));
        audioLoopAllBtn.checked = true;
        audioLoopAllBtn.dispatchEvent(new Event('change'));
      } else {
        // list → off
        audioLoopAllBtn.checked = false;
        audioLoopAllBtn.dispatchEvent(new Event('change'));
      }
    });
  }

  // ── Like ──
  if (amst.like && audioLikeBtn) {
    amst.like.addEventListener('click', () => {
      audioLikeBtn.checked = !audioLikeBtn.checked;
      audioLikeBtn.dispatchEvent(new Event('change'));
      amst.like.classList.toggle('active', audioLikeBtn.checked);
    });
  }

  // ── Sleep: open the existing popover ──
  if (amst.sleep && audioSleepBtn) {
    amst.sleep.addEventListener('click', (e) => {
      // Delegate to the desktop button's handler, which detects the
      // phone-width viewport and opens the panel as a bottom sheet
      // (see openSleepPopover). stopPropagation keeps the document-level
      // outside-click closer from immediately dismissing it.
      audioSleepBtn.click();
      e.stopPropagation();
    });
  }

  // ── Lyrics overlay ──
  function openLyricOverlay() {
    if (!audioLyricPanel || !amstLyricMask) return;
    amstLyricMask.hidden = false;
    audioLyricPanel.classList.add('amst-lyric-active');
    if (amstLyricClose) amstLyricClose.hidden = false;
  }
  function closeLyricOverlay() {
    if (!audioLyricPanel || !amstLyricMask) return;
    amstLyricMask.hidden = true;
    audioLyricPanel.classList.remove('amst-lyric-active');
    if (amstLyricClose) amstLyricClose.hidden = true;
  }
  if (amst.lyrics) amst.lyrics.addEventListener('click', openLyricOverlay);
  if (amstLyricClose) amstLyricClose.addEventListener('click', closeLyricOverlay);
  if (amstLyricMask) {
    amstLyricMask.addEventListener('click', (e) => {
      // Tap on backdrop dismisses; close button has its own handler.
      if (e.target === amstLyricMask || e.target.classList.contains('amst-mask-bg') || e.target.classList.contains('amst-mask-tint')) {
        closeLyricOverlay();
      }
    });
  }

  // ── Queue bottom sheet ──
  function openQueueSheet() {
    const sb = document.getElementById('audio-sidebar');
    if (!sb || !amstQueueMask) return;
    sb.classList.add('amst-sheet-active');
    amstQueueMask.hidden = false;
  }
  function closeQueueSheet() {
    const sb = document.getElementById('audio-sidebar');
    if (!sb || !amstQueueMask) return;
    sb.classList.remove('amst-sheet-active');
    amstQueueMask.hidden = true;
  }
  if (amst.queue) amst.queue.addEventListener('click', openQueueSheet);
  if (amstQueueMask) amstQueueMask.addEventListener('click', closeQueueSheet);
  // Auto-close the queue when a track is picked from it (so the user
  // returns to the now-playing screen). Audio episode list rows are
  // wired in renderAudioEpisodeList; we tap the click on the parent.
  if (audioEpisodeList) {
    audioEpisodeList.addEventListener('click', (e) => {
      if (e.target.closest('li')) closeQueueSheet();
    });
  }

  // ── Custom progress slider ──
  let amstSeekDragging = false;
  if (amst.seek && audioPlayerEl) {
    amst.seek.addEventListener('pointerdown', () => { amstSeekDragging = true; });
    amst.seek.addEventListener('pointerup',   () => { amstSeekDragging = false; });
    amst.seek.addEventListener('change', () => { amstSeekDragging = false; });
    // Live preview while dragging — show the would-be currentTime in
    // the cur-time label without committing yet.
    amst.seek.addEventListener('input', () => {
      const dur = audioPlayerEl.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      const t = (Number(amst.seek.value) / 1000) * dur;
      if (amst.timeCur) amst.timeCur.textContent = amstFmt(t);
      const pct = (Number(amst.seek.value) / 1000) * 100;
      amst.seek.style.setProperty('--amst-fill', pct + '%');
    });
    // Commit seek on change (pointer-up / keyboard step).
    amst.seek.addEventListener('change', () => {
      const dur = audioPlayerEl.duration;
      if (!Number.isFinite(dur) || dur <= 0) return;
      audioPlayerEl.currentTime = (Number(amst.seek.value) / 1000) * dur;
    });

    // Drive the slider + time labels from the audio element directly
    // (Plyr-independent, so it works even if Plyr fails to load).
    // Helper bound to both audio + video sibling so video episodes
    // also drive the mobile stage progress slider.
    const _amstBound = new WeakSet();
    function bindAudioPlayerAmstSync(el) {
      if (!el || _amstBound.has(el)) return;
      _amstBound.add(el);
      el.addEventListener('timeupdate', () => {
        if (amstSeekDragging) return;
        const dur = audioPlayerEl.duration;
        if (!Number.isFinite(dur) || dur <= 0) return;
        const v = Math.round((audioPlayerEl.currentTime / dur) * 1000);
        amst.seek.value = String(v);
        amst.seek.style.setProperty('--amst-fill', (v / 10) + '%');
        if (amst.timeCur) amst.timeCur.textContent = amstFmt(audioPlayerEl.currentTime);
      });
      el.addEventListener('loadedmetadata', () => {
        if (amst.timeTot) amst.timeTot.textContent = amstFmt(audioPlayerEl.duration);
      });
      el.addEventListener('durationchange', () => {
        if (amst.timeTot) amst.timeTot.textContent = amstFmt(audioPlayerEl.duration);
      });
      el.addEventListener('play',  () => {
        if (amst.playIcon) amst.playIcon.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
      });
      el.addEventListener('pause', () => {
        if (amst.playIcon) amst.playIcon.innerHTML = '<path d="M7 4l14 8-14 8V4z"/>';
      });
    }
    bindAudioPlayerAmstSync(audioPlayerEl);
    bindAudioPlayerAmstSync(audioVideoEl);
    bindAudioPlayerAmstSync(amstVideoEl);
  }

  // ------ sleep timer ------
  function startSleepTimer(minutes) {
    cancelSleepTimer();
    const ms = minutes * 60 * 1000;
    audioSleep.endAt = Date.now() + ms;
    audioSleep.fadeAnnounced = false;
    audioSleep.warn10Announced = false;
    const modeLabel = audioSleep.mode === 'soft' ? '软停 · 播完本集停' : '硬停 · 到点暂停';
    const fadeLabel = audioSleep.fade ? ' · 最后 30s 渐出' : '';
    toast(`定时已启动 · ${minutes} 分 · ${modeLabel}${fadeLabel}`, 'success', 3200);
    if (audioSleep.mode === 'hard') {
      audioSleep.timerId = setTimeout(() => {
        try { audioPlayerEl.pause(); } catch (e) {}
        cancelSleepTimer();
        toast('⏱ 定时已到 · 已暂停', 'success', 3200);
      }, ms);
    }
    // Ticker: updates label, drives fade-out, warns at 10s.
    audioSleep.tickId = setInterval(() => {
      const left = audioSleep.endAt - Date.now();
      if (left <= 0) {
        updateSleepLabel();
        if (audioSleep.mode === 'soft' && audioPlayerEl.paused === false) {
          // Soft mode keeps ticking until the ended event fires.
          if (audioSleepBtn) audioSleepBtn.classList.add('waiting');
          return;
        }
        if (audioSleep.mode === 'hard') {
          clearInterval(audioSleep.tickId);
          audioSleep.tickId = null;
        }
        return;
      }
      if (audioSleep.fade && left <= 30000) {
        if (!audioSleep.fadeAnnounced) {
          audioSleep.fadeAnnounced = true;
          toast('进入音量渐出阶段 (30s)', 'info', 2200);
        }
        const frac = Math.max(0, left / 30000);
        try { audioPlayerEl.volume = frac; } catch (e) {}
      }
      if (left <= 10000 && !audioSleep.warn10Announced) {
        audioSleep.warn10Announced = true;
        if (audioSleepBtn) audioSleepBtn.classList.add('urgent');
      }
      updateSleepLabel();
    }, 500);
    updateSleepLabel();
    if (audioSleepBtn) audioSleepBtn.classList.add('active');
  }
  function cancelSleepTimer() {
    if (audioSleep.timerId) clearTimeout(audioSleep.timerId);
    if (audioSleep.tickId) clearInterval(audioSleep.tickId);
    audioSleep.timerId = null;
    audioSleep.tickId = null;
    audioSleep.endAt = 0;
    audioSleep.fadeAnnounced = false;
    audioSleep.warn10Announced = false;
    try { audioPlayerEl.volume = 1; } catch (e) {}
    if (audioSleepBtn) {
      audioSleepBtn.classList.remove('active');
      audioSleepBtn.classList.remove('urgent');
      audioSleepBtn.classList.remove('waiting');
    }
    updateSleepLabel();
  }
  function updateSleepLabel() {
    if (!audioSleepLabel) return;
    if (!audioSleep.endAt) {
      audioSleepLabel.textContent = '定时关闭';
    } else {
      const left = Math.max(0, audioSleep.endAt - Date.now());
      const m = Math.floor(left / 60000);
      const s = Math.floor((left % 60000) / 1000);
      audioSleepLabel.textContent = `${m}:${String(s).padStart(2, '0')}`;
    }
    // Mirror to mobile-stage sleep label (without the 「定时关闭」 idle
    // text — show 「定时」 when idle, countdown when active).
    try { syncAmstControls(); } catch (_e) {}
  }
  if (audioSleepBtn && sleepPopover) {
    /**
     * @brief Whether the sleep popover should render as a mobile bottom
     *        sheet rather than a desktop anchored popover.
     * @details Mirrors the ≤600px breakpoint used by the mobile audio
     *          stage CSS so the JS positioning logic and the stylesheet
     *          stay in agreement.
     * @return true on phone-width viewports.
     */
    function sleepIsMobile() {
      return window.matchMedia('(max-width: 600px)').matches;
    }

    /**
     * @brief Reveal the sleep-timer panel.
     * @details Desktop: anchors the panel under the sleep button via
     *          getBoundingClientRect. Mobile: clears those inline offsets
     *          (so the bottom-sheet CSS in the ≤600px media query takes
     *          over) and shows the dim backdrop. The inline styles MUST be
     *          cleared on mobile, otherwise a stale desktop top/right left
     *          over from a prior open (e.g. after a viewport resize) would
     *          beat the stylesheet and push the sheet off-screen again.
     */
    function openSleepPopover() {
      sleepPopover.hidden = false;
      if (sleepIsMobile()) {
        sleepPopover.style.top = '';
        sleepPopover.style.right = '';
        sleepPopover.style.left = '';
        if (sleepSheetMask) sleepSheetMask.hidden = false;
      } else {
        if (sleepSheetMask) sleepSheetMask.hidden = true;
        const r = audioSleepBtn.getBoundingClientRect();
        sleepPopover.style.top = (r.bottom + 6) + 'px';
        sleepPopover.style.right = (window.innerWidth - r.right) + 'px';
      }
    }

    /**
     * @brief Hide the sleep-timer panel and its mobile backdrop.
     */
    function closeSleepPopover() {
      sleepPopover.hidden = true;
      if (sleepSheetMask) sleepSheetMask.hidden = true;
    }

    audioSleepBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (sleepPopover.hidden) openSleepPopover();
      else closeSleepPopover();
    });
    // Tapping the dim backdrop dismisses the mobile bottom sheet.
    if (sleepSheetMask) sleepSheetMask.addEventListener('click', closeSleepPopover);
    sleepPopover.addEventListener('click', (e) => {
      const preset = e.target.closest('[data-sleep-min]');
      if (preset) {
        const m = Number(preset.dataset.sleepMin);
        if (Number.isFinite(m) && m > 0) { startSleepTimer(m); closeSleepPopover(); }
        return;
      }
      if (e.target.id === 'sleep-custom-btn') {
        const input = document.getElementById('sleep-custom-min');
        const m = Number(input && input.value);
        if (Number.isFinite(m) && m > 0 && m <= 720) { startSleepTimer(m); closeSleepPopover(); }
        else toast('请输入 1-720 分钟', 'error');
        return;
      }
      if (e.target.id === 'sleep-cancel-btn' || e.target.closest('#sleep-cancel-btn')) {
        cancelSleepTimer();
        toast('已取消定时');
        closeSleepPopover();
        return;
      }
      const modeInput = e.target.closest('input[name="sleep-mode"]');
      if (modeInput) audioSleep.mode = modeInput.value;
      if (e.target.id === 'sleep-fade-input') audioSleep.fade = !!e.target.checked;
    });
    document.addEventListener('click', (e) => {
      if (sleepPopover.hidden) return;
      if (sleepPopover.contains(e.target) || e.target === audioSleepBtn || audioSleepBtn.contains(e.target)) return;
      if (sleepSheetMask && e.target === sleepSheetMask) return; // its own handler closes
      closeSleepPopover();
    });
  }

  async function loadSubtitles(collectionId, ep) {
    for (let i = 0; i < ep.subtitles.length; i++) {
      const ok = await addSubtitleTrack(collectionId, ep.subtitles[i], {
        defaultTrack: i === 0,
      });
      if (!ok) continue;
    }
  }

  // 1.7.29 deleted renderManualSubtitleList (only ever called by the
  // now-gone manual-subtitle-dialog) and openManualSubtitleDialog
  // (only ever called by the now-gone CC button click handler).
  // Their replacement lives in initPlyr's ready handler — the custom
  // 字幕 menu item inside Plyr's settings popup, which fetches
  // /api/episode/.../embedded-subs and lists all picks (off / each
  // embedded stream / each external file / clear) as Plyr-styled
  // radio rows.

  /**
   * @brief Remove every <track> element previously created by the
   *        manual picker (label prefix "手动: "), revoke their blob
   *        URLs, and clear the LS slot. Called on "清除手动选择" and
   *        before re-applying a new manual pick (so we don't pile up
   *        stale manual tracks across changes).
   */
  function removeManualSubtitleTracks() {
    if (!player) return;
    for (const t of player.querySelectorAll('track')) {
      if (t.label && t.label.indexOf('手动: ') === 0) {
        // We don't track which blob URL belongs to which <track>
        // individually — the global state.subtitleBlobUrls list is
        // wholesale revoked on episode change. Manual mid-episode
        // removes leak one blob URL until the next ep change, which
        // is acceptable (~few KB).
        try { player.removeChild(t); } catch (_e) {}
      }
    }
  }

  // ============================================================
  // PGS (.sup) subtitles — image-based, Blu-ray rip format.
  //
  // Browsers cannot render PGS via <track> (it's RLE-encoded YCbCr
  // bitmaps, not text), so we lazy-load `vendor/libpgs/libpgs.js`
  // (ES-module bundle, ~62KB raw / ~20KB gz) on first use and let
  // its `PgsRenderer` overlay an auto-created canvas on top of the
  // <video> element. The canvas registers `timeupdate` / `seeking`
  // listeners on the video, so it follows playback automatically;
  // we only own visibility (display:none/block) and lifecycle
  // (dispose on episode change, dispose when switching to a text
  // track, etc.).
  //
  // Server-side stays static — the .sup file ships unchanged via
  // /media-files. The DS124's ARM A55 1.7GHz can't OCR or transcode
  // bitmap subs in real time, so all decoding happens client-side.
  // ============================================================

  /**
   * @brief Lazy-import vendor/libpgs/libpgs.js (ES module) and cache
   *        the PgsRenderer constructor on `state.pgs.rendererClass`.
   *        Called once per session, the first time a user picks a
   *        .sup row in the manual subtitle dialog.
   *
   * @returns The PgsRenderer constructor on success, null on failure
   *          (network error, parse error, etc.). Callers should
   *          surface a user-visible error in the latter case.
   */
  async function loadPgsRendererClass() {
    if (state.pgs.rendererClass) return state.pgs.rendererClass;
    try {
      const mod = await import('/vendor/libpgs/libpgs.js');
      if (mod && mod.PgsRenderer) {
        state.pgs.rendererClass = mod.PgsRenderer;
        return mod.PgsRenderer;
      }
    } catch (e) {
      console.warn('libpgs lazy import failed', e);
    }
    return null;
  }

  /**
   * @brief Tear down the active PgsRenderer (if any), null out the
   *        state slots, and remove the auto-created canvas from the
   *        DOM. Idempotent — safe to call when no PGS is mounted.
   *
   * Called from:
   *   - episode-end / close-player cleanup (line ~1913)
   *   - episode-switch cleanup (line ~5171)
   *   - dialog row-click when switching from PGS to a text track
   *   - dialog "清除手动选择" button
   */
  function disposePgsRenderer() {
    if (state.pgs.renderer) {
      try { state.pgs.renderer.dispose(); } catch (_e) {}
    }
    state.pgs.renderer = null;
    state.pgs.file = null;
    state.pgs.visible = false;
  }

  /**
   * @brief Mount a PGS (.sup) subtitle track for the current episode.
   *        Disposes any existing PGS renderer first (so re-picks
   *        don't stack instances), then constructs a new PgsRenderer
   *        bound to the global <video id="player"> with subUrl
   *        pointing at the static .sup file.
   *
   *        The renderer is created in HIDDEN state — its canvas
   *        starts with display:none. The 确认 button in the dialog
   *        is what flips visibility on, mirroring the two-step flow
   *        used for text-track subtitles ("行点击 = 选择, 确认 =
   *        启用"). This keeps PGS and text-track UX identical from
   *        the user's POV.
   *
   * @param collectionId Collection id whose path to ask the server for.
   * @param sub          {file, lang, format} entry from the dialog list.
   *                     `format` must equal 'sup'.
   * @returns true on success, false if libpgs failed to load or
   *          PgsRenderer construction threw.
   */
  async function setupPgsRenderer(collectionId, sub) {
    disposePgsRenderer();
    const Renderer = await loadPgsRendererClass();
    if (!Renderer) return false;
    const subUrl = mediaUrl(collectionId, sub.file);
    try {
      const renderer = new Renderer({
        video: player,
        subUrl: subUrl,
        workerUrl: '/vendor/libpgs/libpgs.worker.js',
        timeOffset: 0,
      });
      // libpgs auto-creates a canvas inside video's parent (the
      // .plyr__video-wrapper for our setup) when no explicit canvas
      // is passed. Hide it until the user confirms in the dialog,
      // and lock down its layering so it never blocks Plyr controls
      // or video clicks (pointer-events:none) and never paints above
      // the controls bar (z-index 2, below Plyr's typical ~3).
      const cvs = renderer.canvas;
      if (cvs) {
        cvs.style.display = 'none';
        cvs.style.pointerEvents = 'none';
        cvs.style.zIndex = '2';
      }
      state.pgs.renderer = renderer;
      state.pgs.file = sub.file;
      state.pgs.visible = false;
      return true;
    } catch (e) {
      console.warn('PgsRenderer construction failed', e);
      return false;
    }
  }

  /**
   * @brief Reveal the mounted PGS canvas (display:block) and clear
   *        any concurrent Plyr text-track captions so two layers
   *        don't fight for the same screen space. Called from the
   *        dialog 确认 button when a PGS is mounted.
   *
   * Caller should call syncCapPressed() afterwards so the CC button
   * picks up the new visible state.
   */
  function showPgsRenderer() {
    if (!state.pgs.renderer) return;
    try { state.plyr.toggleCaptions(false); } catch (_e) {}
    state.pgs.visible = true;
    if (state.pgs.renderer.canvas) {
      state.pgs.renderer.canvas.style.display = 'block';
    }
  }

  /**
   * @brief Hide the mounted PGS canvas without disposing it. The
   *        renderer keeps its parsed sub data so a later show is
   *        instant (no re-fetch). Called from the CC button's OFF
   *        click path.
   */
  function hidePgsRenderer() {
    if (!state.pgs.renderer) return;
    state.pgs.visible = false;
    if (state.pgs.renderer.canvas) {
      state.pgs.renderer.canvas.style.display = 'none';
    }
  }

  // ============================================================
  // Embedded text subtitles (mkv-internal SRT / ASS streams).
  //
  // Chrome / Edge don't expose mkv-internal subtitle streams via
  // player.textTracks (long-standing chromium limitation), so we
  // ship them out via a server-side ffmpeg extract endpoint that
  // returns the chosen stream as WebVTT and caches to disk. Mount
  // path mirrors the external-track flow:
  //   - clear old <track>s + tear down PGS for clean swap
  //   - fetch the .vtt → blob → object URL → <track src=...>
  //   - tag the label with "手动: " so removeManualSubtitleTracks
  //     and other label-keyed code paths treat it identically
  // ============================================================

  /**
   * @brief Fetch + mount one mkv-internal subtitle stream as a WebVTT
   *        track on the global <video>.
   *
   * @param collectionId Collection id whose route to ask the server.
   * @param epFile       Episode file path within the collection.
   * @param streamIdx    ffprobe stream index for the embedded sub
   *                     (from /api/episode/.../embedded-subs).
   * @param label        Human-readable name shown in Plyr's captions
   *                     menu. "手动: " prefix is added automatically
   *                     so removeManualSubtitleTracks can find it.
   * @param lang         BCP-47 hint for srclang. Defaults to 'und'.
   * @returns true on success (track appended), false on fetch /
   *           extract failure.
   */
  async function mountEmbeddedSubtitle(collectionId, epFile, streamIdx, label, lang) {
    const url = '/subtitle-extract/' + encodeURIComponent(collectionId)
      + '/' + streamIdx + '.vtt?file=' + encodeURIComponent(epFile);
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.srclang = lang || 'und';
    track.label = '手动: ' + (label || '内嵌字幕');
    track.default = true;
    try {
      // Fetch eagerly so an HTTP 500 from ffmpeg surfaces as a return-
      // false (caller shows an error message) rather than silently
      // attaching a track whose src 404s a tick later.
      const r = await fetch(url);
      if (!r.ok) return false;
      const text = await r.text();
      const blob = new Blob([text], { type: 'text/vtt' });
      const blobUrl = URL.createObjectURL(blob);
      state.subtitleBlobUrls.push(blobUrl);
      track.src = blobUrl;
    } catch (_e) {
      return false;
    }
    player.appendChild(track);
    return true;
  }

  // 1.7.29 removed the manual-subtitle-dialog wholesale (HTML + all
  // its handlers). Subtitle picking, mounting, and enabling now live
  // inside Plyr's settings popup as the custom 字幕 menu item — see
  // initPlyr's ready handler. The dialog's font-size slider used to
  // bind here too; that piece is preserved by the global menu's
  // 字幕字号 cycle entry (see ds124:subSize handling) so this
  // delete doesn't lose user-facing functionality.

  /**
   * @brief Fetch one sidecar subtitle, convert it to VTT, and attach
   *        a `<track>` element to the video player.
   *
   * Shared between auto-load (called from `loadSubtitles` for every
   * stem-matched sidecar in `ep.subtitles`) and the manual picker
   * (called when the user explicitly chose a subtitle from the
   * collection-wide list). All format conversions, encoding fallback,
   * and blob lifecycle live here so both call sites stay in sync.
   *
   * @param collectionId Collection id whose path to ask the server for.
   * @param sub          `{file, lang, format}` triplet — same shape as
   *                     ep.subtitles[i] / availableSubtitles[i].
   * @param opts.defaultTrack
   *                     Whether to mark this track as default-on. Auto-
   *                     load uses true for i===0; manual picker passes
   *                     true to override the auto-default.
   * @param opts.labelPrefix
   *                     Optional prefix string for the track label —
   *                     manual picker passes "手动: " so users can
   *                     distinguish their picks from auto-attached
   *                     tracks in the Plyr captions menu.
   * @returns true on success, false on fetch / decode error.
   */
  async function addSubtitleTrack(collectionId, sub, opts) {
    const options = opts || {};
    // PGS (.sup) is image-based — going through this code path would
    // fetch the binary, run it through decodeSubtitleBuffer (utf-8
    // first try → garbled), then subtitleToVtt (treats garbled bytes
    // as SRT, emits an empty VTT), and end up creating a <track>
    // with zero cues. Plyr would list it in the captions menu but
    // selecting it would show nothing. Bail early so the auto-load
    // path (loadSubtitles → ep.subtitles loop) skips PGS files;
    // dialog manual picks for .sup go through setupPgsRenderer
    // instead and never reach this function.
    if ((sub.format || '').toLowerCase() === 'sup') return false;
    const url = mediaUrl(collectionId, sub.file);
    const track = document.createElement('track');
    track.kind = 'subtitles';
    track.srclang = sub.lang || 'und';
    const baseLabel = sub.lang === 'und' ? '字幕' : String(sub.lang).toUpperCase();
    track.label = (options.labelPrefix || '') + baseLabel;
    if (options.defaultTrack) track.default = true;
    try {
      const res = await fetch(url);
      const buf = await res.arrayBuffer();
      const text = decodeSubtitleBuffer(buf);
      const vtt = subtitleToVtt(text, sub.format);
      const blob = new Blob([vtt], { type: 'text/vtt' });
      const blobUrl = URL.createObjectURL(blob);
      state.subtitleBlobUrls.push(blobUrl);
      track.src = blobUrl;
    } catch (_e) {
      return false;
    }
    player.appendChild(track);
    return true;
  }
  /**
   * @brief Dispatch a decoded subtitle text to the right converter.
   *
   * @param text   The decoded subtitle file contents (UTF string).
   * @param format Lowercase format hint (file extension without dot)
   *               from the sidecar metadata. Unknown formats fall
   *               through to a heuristic auto-detect using the file
   *               header — keeps mislabeled files working.
   * @returns A WEBVTT-compliant string, ready to wrap in a Blob.
   */
  function subtitleToVtt(text, format) {
    const fmt = String(format || '').toLowerCase();
    if (fmt === 'vtt') return normalizeVtt(text);
    if (fmt === 'srt') return srtToVtt(text);
    if (fmt === 'ass' || fmt === 'ssa') return assToVtt(text);
    if (fmt === 'smi' || fmt === 'sami') return smiToVtt(text);
    if (fmt === 'ttml' || fmt === 'dfxp') return ttmlToVtt(text);
    // Unknown format hint — sniff the header to pick a converter.
    const head = (text || '').slice(0, 256).trim().toLowerCase();
    if (head.startsWith('webvtt')) return normalizeVtt(text);
    if (head.startsWith('[script info]') || head.includes('[v4+ styles]') || head.includes('[events]')) return assToVtt(text);
    if (head.startsWith('<sami') || head.startsWith('<!doctype sami')) return smiToVtt(text);
    if (head.startsWith('<?xml') || head.includes('<tt ') || head.includes('<tt>')) return ttmlToVtt(text);
    // Default: treat as SRT (numeric cue blocks with `-->` arrows).
    return srtToVtt(text);
  }
  // Try UTF-8 strict first, then GB18030 (covers GBK/GB2312 — common in
  // Chinese-locale subtitle files), then UTF-16 LE/BE. fatal:true forces
  // TextDecoder to throw on invalid sequences instead of inserting U+FFFD,
  // so the fallback chain actually fallbacks. Returns the decoded string
  // with any BOM stripped.
  function decodeSubtitleBuffer(buf) {
    const encodings = ['utf-8', 'gb18030', 'utf-16le', 'utf-16be'];
    for (const enc of encodings) {
      try {
        const text = new TextDecoder(enc, { fatal: true }).decode(buf);
        return text.replace(/^﻿/, '');
      } catch (_e) { /* try next */ }
    }
    // Last-resort: utf-8 lossy. Better mojibake than nothing.
    return new TextDecoder('utf-8').decode(buf).replace(/^﻿/, '');
  }
  function normalizeVtt(text) {
    let out = text.replace(/\r/g, '');
    if (!/^WEBVTT/.test(out)) out = 'WEBVTT\n\n' + out;
    return out;
  }
  function srtToVtt(srt) {
    return 'WEBVTT\n\n' + srt.replace(/\r/g, '')
      .replace(/(\d{2}:\d{2}:\d{2}),(\d{3})/g, '$1.$2');
  }

  /**
   * @brief Format a millisecond count as a VTT-compliant timestamp.
   *
   * VTT requires `HH:MM:SS.mmm` — three-digit milliseconds, two-digit
   * hours/minutes/seconds. Negative inputs clamp to zero (some
   * subtitle authoring tools emit pre-roll lead-in cues with negative
   * starts; ignore the offset rather than choke).
   */
  function _msToVttTime(ms) {
    const total = Math.max(0, Math.round(ms));
    const h = Math.floor(total / 3600000);
    const m = Math.floor((total % 3600000) / 60000);
    const s = Math.floor((total % 60000) / 1000);
    const msPart = total % 1000;
    return String(h).padStart(2, '0') + ':' +
           String(m).padStart(2, '0') + ':' +
           String(s).padStart(2, '0') + '.' +
           String(msPart).padStart(3, '0');
  }

  /**
   * @brief Decode a handful of common HTML entities used in subtitle
   *        files. Not exhaustive — just the ones that show up in
   *        SAMI / TTML payloads in the wild.
   */
  function _decodeBasicEntities(s) {
    return String(s)
      .replace(/&nbsp;/gi, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&apos;/g, "'")
      .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCodePoint(parseInt(hex, 16)))
      .replace(/&#(\d+);/g, (_, dec) => String.fromCodePoint(parseInt(dec, 10)));
  }

  /**
   * @brief Convert an ASS / SSA timestamp (`H:MM:SS.cs`, centiseconds)
   *        to a VTT timestamp (`HH:MM:SS.mmm`).
   *
   * ASS is hour:minute:second.cs where cs is 2-digit centiseconds.
   * VTT wants 3-digit milliseconds. Pad the centiseconds with one
   * trailing zero. Returns the input unchanged on a mismatch — the
   * resulting VTT cue will be silently dropped by the browser parser
   * which is at least non-fatal.
   */
  function _assTimeToVtt(t) {
    const m = String(t || '').trim().match(/^(\d+):(\d{2}):(\d{2})\.(\d{1,3})$/);
    if (!m) return t;
    const h = String(parseInt(m[1], 10)).padStart(2, '0');
    const fracPad = (m[4] + '000').slice(0, 3);
    return `${h}:${m[2]}:${m[3]}.${fracPad}`;
  }

  /**
   * @brief Convert an ASS / SSA subtitle to VTT.
   *
   * ASS / SSA structure (sections delimited by `[Section Name]`):
   *
   *   [Script Info]
   *   ...
   *   [V4+ Styles]
   *   Format: Name, Fontname, ...
   *   Style: ...
   *   [Events]
   *   Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
   *   Dialogue: 0,0:00:01.50,0:00:03.20,Default,,0,0,0,,Hello\Nworld
   *
   * The `Format:` line under `[Events]` declares the field order; we
   * follow it (rather than hardcoding the canonical ASS layout) so
   * non-standard authoring tools that reorder fields still parse.
   * Everything before the Text field is comma-separated; Text itself
   * may contain commas, so we only split N-1 times.
   *
   * Inline ASS overrides (`{\b1\fs20\c&H00FF00&}`) are stripped — VTT
   * has nothing equivalent. `\N` is a hard line break, `\h` is a
   * non-breaking space, `\n` (lowercase) is a soft break. Comments
   * (`Comment:` lines) are skipped — they're director notes, not
   * intended to render.
   */
  function assToVtt(ass) {
    const out = ['WEBVTT', ''];
    let inEvents = false;
    let fields = null;
    for (const rawLine of String(ass).replace(/\r/g, '').split('\n')) {
      const ln = rawLine.replace(/^﻿/, '');
      const trimmed = ln.trim();
      if (/^\[[^\]]+\]\s*$/.test(trimmed)) {
        inEvents = trimmed.toLowerCase() === '[events]';
        continue;
      }
      if (!inEvents) continue;
      if (/^Format\s*:/i.test(ln)) {
        fields = ln.replace(/^Format\s*:\s*/i, '').split(',').map((s) => s.trim().toLowerCase());
        continue;
      }
      if (!/^Dialogue\s*:/i.test(ln)) continue;
      // Default ASS field order if no Format: row was seen yet.
      const fieldNames = fields || ['layer', 'start', 'end', 'style', 'name',
                                    'marginl', 'marginr', 'marginv', 'effect', 'text'];
      const textIdx = fieldNames.indexOf('text');
      const startIdx = fieldNames.indexOf('start');
      const endIdx = fieldNames.indexOf('end');
      if (textIdx < 0 || startIdx < 0 || endIdx < 0) continue;
      // Split body at the first textIdx commas; rest is Text.
      const body = ln.replace(/^Dialogue\s*:\s*/i, '');
      const parts = [];
      let cur = '';
      let count = 0;
      for (let i = 0; i < body.length; i++) {
        if (body[i] === ',' && count < textIdx) {
          parts.push(cur);
          cur = '';
          count++;
        } else {
          cur += body[i];
        }
      }
      parts.push(cur);
      const start = _assTimeToVtt(parts[startIdx]);
      const end = _assTimeToVtt(parts[endIdx]);
      let text = String(parts[textIdx] || '');
      // Strip override-tag blocks: {\b1\an8} etc.
      text = text.replace(/\{[^}]*\}/g, '');
      // Line-break / soft-break / hard-space escapes.
      text = text.replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, ' ');
      // Remove any literal carriage returns and trim trailing whitespace.
      text = text.replace(/\r/g, '').trim();
      if (!text) continue;
      out.push(`${start} --> ${end}`);
      out.push(text);
      out.push('');
    }
    return out.join('\n');
  }

  /**
   * @brief Convert a SAMI / SMI subtitle file to VTT.
   *
   * SAMI is HTML-ish — the body contains a sequence of
   *   `<SYNC Start="<ms>"><P Class="...">text</P>`
   * blocks. The end time of one cue is the start of the next; the
   * last cue stretches a fixed 5s. Empty / `&nbsp;`-only paragraphs
   * are end-of-cue markers — skip them rather than emit an empty
   * cue. Tags inside the paragraph are dropped; entities are decoded.
   */
  function smiToVtt(smi) {
    const out = ['WEBVTT', ''];
    const events = [];
    const re = /<SYNC[^>]*\bStart\s*=\s*["']?(\d+)["']?[^>]*>([\s\S]*?)(?=<SYNC|<\/BODY|<\/SAMI|$)/gi;
    let m;
    while ((m = re.exec(String(smi))) !== null) {
      const startMs = parseInt(m[1], 10);
      let body = String(m[2] || '');
      body = body.replace(/<br\s*\/?>/gi, '\n');
      body = body.replace(/<\/?[^>]+>/g, '');
      body = _decodeBasicEntities(body);
      // SAMI uses literal "&nbsp;" or whitespace as a "clear caption"
      // marker — anything visually empty is treated as a no-text
      // boundary, not a renderable cue.
      const text = body.replace(/[\s ]+/g, ' ').trim();
      events.push({ startMs, text });
    }
    for (let i = 0; i < events.length; i++) {
      const e = events[i];
      if (!e.text) continue;
      const endMs = (i + 1 < events.length) ? events[i + 1].startMs : (e.startMs + 5000);
      if (endMs <= e.startMs) continue;
      out.push(`${_msToVttTime(e.startMs)} --> ${_msToVttTime(endMs)}`);
      out.push(e.text);
      out.push('');
    }
    return out.join('\n');
  }

  /**
   * @brief Convert a TTML / DFXP subtitle (XML) to VTT.
   *
   * TTML uses `<p begin="..." end="..."> text </p>` cues, optionally
   * inside `<div>` containers, namespaced under
   * `http://www.w3.org/ns/ttml`. We use a regex extractor instead of
   * DOMParser to keep the converter side-effect-free in cases where
   * the XML uses unusual namespaces or has malformed inner markup.
   *
   * `<br/>` inside `<p>` becomes a real newline; other inline tags
   * (e.g. `<span tts:fontWeight="bold">`) are stripped — VTT styling
   * isn't worth round-tripping for the common case. Timestamps come
   * in two flavors: ISO time (`HH:MM:SS.mmm`) which is already VTT-
   * compatible, and "seconds with unit" (`12.5s`) which we convert.
   */
  function ttmlToVtt(xml) {
    const out = ['WEBVTT', ''];
    const re = /<p\b[^>]*\bbegin\s*=\s*["']([^"']+)["'][^>]*\bend\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/p>/gi;
    const reSwap = /<p\b[^>]*\bend\s*=\s*["']([^"']+)["'][^>]*\bbegin\s*=\s*["']([^"']+)["'][^>]*>([\s\S]*?)<\/p>/gi;
    function pushMatch(beginRaw, endRaw, body) {
      const start = _ttmlTimeToVtt(beginRaw);
      const end = _ttmlTimeToVtt(endRaw);
      let text = String(body)
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<\/?[^>]+>/g, '');
      text = _decodeBasicEntities(text).replace(/\r/g, '').trim();
      if (!text) return;
      out.push(`${start} --> ${end}`);
      out.push(text);
      out.push('');
    }
    let m;
    while ((m = re.exec(String(xml))) !== null) pushMatch(m[1], m[2], m[3]);
    while ((m = reSwap.exec(String(xml))) !== null) pushMatch(m[2], m[1], m[3]);
    return out.join('\n');
  }
  function _ttmlTimeToVtt(t) {
    const trimmed = String(t || '').trim();
    // Already in HH:MM:SS.mmm form — pad / truncate fractional digits to 3.
    const isoMatch = trimmed.match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d+))?$/);
    if (isoMatch) {
      const h = String(parseInt(isoMatch[1], 10)).padStart(2, '0');
      const ms = (isoMatch[4] ? (isoMatch[4] + '000').slice(0, 3) : '000');
      return `${h}:${isoMatch[2]}:${isoMatch[3]}.${ms}`;
    }
    // "12.5s" / "30s" / "0.5s" — seconds with unit suffix.
    const secMatch = trimmed.match(/^([\d.]+)s$/i);
    if (secMatch) return _msToVttTime(parseFloat(secMatch[1]) * 1000);
    // Plain numeric seconds (no unit).
    if (/^[\d.]+$/.test(trimmed)) return _msToVttTime(parseFloat(trimmed) * 1000);
    return trimmed;
  }

  // Pick the next episode to play at the end of the current one.
  // Honors shuffle / loop-all / sequential. loopMode is handled at the
  // `ended` event callsites BEFORE calling this (single-track restart
  // never leaves the current file).
  //
  //   shuffleMode  → random pick from any OTHER track in the collection
  //   loopAllMode  → sequential, wrapping back to ep 0 after the last
  //   default      → sequential, returning null (stop) after the last
  function nextEpisode() {
    if (!state.currentCollection || !state.currentFile) return null;
    const eps = scopedEpisodes(state.currentCollection);
    if (eps.length === 0) return null;
    if (state.shuffleMode && eps.length > 1) {
      const others = eps.filter((e) => e.file !== state.currentFile);
      return others[Math.floor(Math.random() * others.length)];
    }
    const idx = eps.findIndex((e) => e.file === state.currentFile);
    if (idx >= 0 && idx < eps.length - 1) return eps[idx + 1];
    // At the end of the list.
    if (state.loopAllMode) return eps[0];
    return null;
  }
  function prevEpisode() {
    if (!state.currentCollection || !state.currentFile) return null;
    const eps = scopedEpisodes(state.currentCollection);
    if (eps.length === 0) return null;
    if (state.shuffleMode && eps.length > 1) {
      const others = eps.filter((e) => e.file !== state.currentFile);
      return others[Math.floor(Math.random() * others.length)];
    }
    const idx = eps.findIndex((e) => e.file === state.currentFile);
    if (idx > 0) return eps[idx - 1];
    // At the start of the list.
    if (state.loopAllMode) return eps[eps.length - 1];
    return null;
  }
  function gotoEp(ep) {
    if (!ep || !state.currentCollection) return;
    // Preserve the current specifiedPlayScope in the next hash URL
    // so auto-advance through episodes inside a folder keeps the
    // scope intact. Without this, nextEpisode() finds the right
    // episode but navigate() drops the scope and subsequent
    // next/prev calls see scope=null and walk the full collection.
    let hash = '#/c/' + encodeURIComponent(state.currentCollection.id) +
               '/play/' + encodeURIComponent(ep.file);
    if (state.specifiedPlayScope != null) {
      hash += '?scope=' + encodeURIComponent(state.specifiedPlayScope);
    }
    navigate(hash);
  }
  prevEpBtn.addEventListener('click', () => gotoEp(prevEpisode()));
  nextEpBtn.addEventListener('click', () => gotoEp(nextEpisode()));
  // Single-track loop / list loop / shuffle are mutually exclusive —
  // activating one clears the other two. Persist each to its own
  // localStorage key so user preference survives reloads.
  function setPlayMode(which) {
    // which ∈ 'loop' | 'loopAll' | 'shuffle' | null
    state.loopMode    = which === 'loop';
    state.loopAllMode = which === 'loopAll';
    state.shuffleMode = which === 'shuffle';
    try {
      localStorage.setItem(LOOP_KEY,     state.loopMode    ? '1' : '0');
      localStorage.setItem(LOOP_ALL_KEY, state.loopAllMode ? '1' : '0');
      localStorage.setItem(SHUFFLE_KEY,  state.shuffleMode ? '1' : '0');
    } catch (e) {}
    updateLoopShuffleUI();
  }
  function togglePlayMode(which) {
    const alreadyOn =
      (which === 'loop'    && state.loopMode) ||
      (which === 'loopAll' && state.loopAllMode) ||
      (which === 'shuffle' && state.shuffleMode);
    setPlayMode(alreadyOn ? null : which);
    // Audio uses 单曲 (track) while video uses 单集 (episode) — same
    // feature, subsystem-appropriate noun.
    const loopLabel = state.kind === 'audio' ? '单曲循环: ' : '单集循环: ';
    toast(
      (which === 'loop'    ? loopLabel :
       which === 'loopAll' ? '列表循环: ' :
                             '随机播放: ')
      + (alreadyOn ? '关' : '开')
    );
  }
  loopBtn.addEventListener('change',    () => togglePlayMode('loop'));
  loopAllBtn && loopAllBtn.addEventListener('change', () => togglePlayMode('loopAll'));
  shuffleBtn.addEventListener('change', () => togglePlayMode('shuffle'));
  function updateLoopShuffleUI() {
    if (loopBtn)    loopBtn.checked    = state.loopMode;
    if (loopAllBtn) loopAllBtn.checked = state.loopAllMode;
    if (shuffleBtn) shuffleBtn.checked = state.shuffleMode;
    // Audio player mirrors the same state.
    if (audioLoopBtn)    audioLoopBtn.checked    = state.loopMode;
    if (audioLoopAllBtn) audioLoopAllBtn.checked = state.loopAllMode;
    if (audioShuffleBtn) audioShuffleBtn.checked = state.shuffleMode;
    // Mobile audio stage: same state, different visual.
    try { syncAmstControls(); } catch (_e) {}
    // Re-evaluate prev/next button disabled state — when loopAll or shuffle
    // is active, the buttons should never be disabled (there's always a
    // valid next/prev target via wrapping or random pick).
    if (state.currentCollection && state.currentFile) {
      if (state.loopAllMode || state.shuffleMode) {
        prevEpBtn.disabled = false;
        nextEpBtn.disabled = false;
      } else {
        const eps = state.currentCollection.episodes || [];
        const idx = eps.findIndex((e) => e.file === state.currentFile);
        prevEpBtn.disabled = idx <= 0;
        nextEpBtn.disabled = idx < 0 || idx >= eps.length - 1;
      }
    }
  }
  let lastProgressSave = 0;
  player.addEventListener('timeupdate', () => {
    if (!state.user || !state.currentFile || !state.currentCollection) return;
    const introSec = state.currentCollection.introSkipSec || 0;
    if (introSec > 0 && player.currentTime < introSec && player.currentTime > 0.1) {
      skipIntroBtn.textContent = '跳过片头 ➤ ' + formatTime(introSec);
      skipIntroBtn.hidden = false;
    } else {
      skipIntroBtn.hidden = true;
    }
    const now = Date.now();
    if (now - lastProgressSave < 5000) return;
    lastProgressSave = now;
    if (!isFinite(player.currentTime) || player.currentTime <= 0) return;
    const id = state.currentCollection.id;
    const file = state.currentFile;
    api('POST', `/api/progress/${encodeURIComponent(id)}/${encodeURIComponent(file)}`, {
      position: player.currentTime,
      duration: isFinite(player.duration) ? player.duration : null,
    }).catch(() => {});
    if (!state.progressAll[id]) state.progressAll[id] = {};
    state.progressAll[id][file] = Object.assign({}, state.progressAll[id][file] || {}, {
      position: player.currentTime,
      duration: isFinite(player.duration) ? player.duration : undefined,
      updatedAt: now,
    });
  });
  player.addEventListener('ended', () => {
    if (!state.user || !state.currentCollection || !state.currentFile) return;
    const id = state.currentCollection.id;
    const file = state.currentFile;
    if (isFinite(player.duration) && player.duration > 0) {
      api('POST', `/api/progress/${encodeURIComponent(id)}/${encodeURIComponent(file)}`, {
        position: player.duration,
        duration: player.duration,
      }).catch(() => {});
      if (!state.progressAll[id]) state.progressAll[id] = {};
      state.progressAll[id][file] = {
        position: player.duration, duration: player.duration, updatedAt: Date.now(),
      };
    }
    if (state.loopMode) {
      player.currentTime = 0;
      player.play().catch(() => {});
      return;
    }
    const next = nextEpisode();
    if (next) {
      if (state.miniMode) state.pendingMiniRestore = true;
      gotoEp(next);
    }
  });
  player.addEventListener('error', () => {
    if (!state.currentFile) return;
    playerEpMeta.textContent = '解码失败 · 浏览器不支持此编码';
  });
  skipIntroBtn.addEventListener('click', () => {
    const introSec = state.currentCollection && state.currentCollection.introSkipSec;
    if (introSec && player.currentTime < introSec) player.currentTime = introSec;
  });

  // ------------------------------------------------------------------
  // Volume OSD — semi-transparent overlay when adjusting volume via keys
  // ------------------------------------------------------------------
  let volumeOSDTimer = null;
  function showVolumeOSD(vol) {
    let osd = document.getElementById('volume-osd');
    if (!osd) {
      osd = document.createElement('div');
      osd.id = 'volume-osd';
      const container = document.getElementById('player-main') || document.getElementById('view-player');
      if (container) container.appendChild(osd);
      else return;
    }
    const pct = Math.round(vol * 100);
    osd.innerHTML = '<div class="volume-osd-icon">&#x1f50a;</div>'
      + '<div class="volume-osd-bar"><div class="volume-osd-fill" style="width:' + pct + '%"></div></div>'
      + '<div class="volume-osd-pct">' + pct + '%</div>';
    osd.classList.add('visible');
    clearTimeout(volumeOSDTimer);
    volumeOSDTimer = setTimeout(() => osd.classList.remove('visible'), 1200);
  }

  // ------------------------------------------------------------------
  // Desktop "tap to seek / hold to 2×" state.
  //
  // Seek does NOT happen on keydown. Instead:
  //   keydown  → start a hold timer
  //   keyup (before timer fires) → it was a tap, do the ±10s seek now
  //   timer fires (still held)   → enter 2× speed, suppress later seek
  //   keyup (in hold mode)       → restore original speed
  // This guarantees a held key never produces the initial seek jump.
  // ------------------------------------------------------------------
  const HOLD_DELAY_MS = 220;
  let arrowHold = null;  // { key, timer, holdMode }

  function enterHoldSpeed() {
    if (state.desktopHoldSpeed) return;
    if (player.paused) return;
    state.desktopHoldSpeedOrig = (state.plyr ? state.plyr.speed : player.playbackRate) || 1;
    state.desktopHoldSpeed = true;
    state.gestureLongPressing = true;  // reuse guard so ratechange doesn't persist 2x
    try {
      if (state.plyr) state.plyr.speed = 2;
      else player.playbackRate = 2;
    } catch (e) {}
    toast('2× 加速');
  }
  function exitHoldSpeed() {
    if (!state.desktopHoldSpeed) return;
    const orig = state.desktopHoldSpeedOrig || 1;
    state.desktopHoldSpeed = false;
    try {
      if (state.plyr) state.plyr.speed = orig;
      else player.playbackRate = orig;
    } catch (e) {}
    state.gestureLongPressing = false;
    toast('恢复 ' + orig + '×');
  }
  function clearArrowHold() {
    if (!arrowHold) return;
    clearTimeout(arrowHold.timer);
    arrowHold = null;
  }
  function seekTap(key) {
    if (key === 'ArrowLeft') {
      player.currentTime = Math.max(0, player.currentTime - 10);
    } else if (key === 'ArrowRight') {
      player.currentTime = Math.min(player.duration || 0, player.currentTime + 10);
    }
  }
  document.addEventListener('keyup', (e) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    if (!arrowHold || arrowHold.key !== e.key) return;
    const wasHold = arrowHold.holdMode;
    clearArrowHold();
    if (wasHold) {
      exitHoldSpeed();
    } else {
      // Short tap — perform the seek now, so holding never pre-jumps.
      seekTap(e.key);
    }
  });
  // If the tab loses focus mid-hold, auto-release (prevents stuck 2x).
  window.addEventListener('blur', () => {
    clearArrowHold();
    exitHoldSpeed();
  });

  document.addEventListener('keydown', (e) => {
    if (viewPlayer.hidden && !state.miniMode) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (player.paused) player.play(); else player.pause();
        break;
      case 'ArrowLeft':
      case 'ArrowRight':
        e.preventDefault();
        // Ignore OS auto-repeat; we drive hold via our own timer instead.
        if (e.repeat) break;
        // Only one arrow tracked at a time — if user presses the other
        // arrow before releasing the first, finalize the previous one.
        if (arrowHold && arrowHold.key !== e.key) {
          const prev = arrowHold;
          clearArrowHold();
          if (prev.holdMode) exitHoldSpeed();
          else seekTap(prev.key);
        }
        if (arrowHold) break;
        arrowHold = { key: e.key, holdMode: false, timer: null };
        arrowHold.timer = setTimeout(() => {
          if (!arrowHold) return;
          arrowHold.holdMode = true;
          enterHoldSpeed();
        }, HOLD_DELAY_MS);
        break;
      case 'ArrowUp':
        e.preventDefault();
        player.volume = Math.min(1, player.volume + 0.10);
        showVolumeOSD(player.volume);
        break;
      case 'ArrowDown':
        e.preventDefault();
        player.volume = Math.max(0, player.volume - 0.10);
        showVolumeOSD(player.volume);
        break;
      case 'f': case 'F':
        e.preventDefault();
        if (state.plyr) state.plyr.fullscreen.toggle();
        else if (!document.fullscreenElement) player.requestFullscreen && player.requestFullscreen();
        else document.exitFullscreen && document.exitFullscreen();
        break;
      case 'm': case 'M':
        e.preventDefault();
        player.muted = !player.muted;
        break;
      case 'n': case 'N':
        e.preventDefault();
        gotoEp(nextEpisode());
        break;
      case 'p': case 'P':
        e.preventDefault();
        gotoEp(prevEpisode());
        break;
      case 'l': case 'L':
        e.preventDefault();
        togglePlayMode('loop');
        break;
      case 's': case 'S':
        e.preventDefault();
        togglePlayMode('shuffle');
        break;
    }
  });

  // Render image thumbnails inside the detail page episode list area.
  function renderDetailImageGrid(collection, listEl) {
    if (!listEl) return;
    const eps = collection.episodes || [];
    listEl.className = 'gallery-grid';
    listEl.innerHTML = '';
    if (!eps.length) {
      listEl.innerHTML = '<div class="cards-status mono">（空）</div>';
      return;
    }
    // Build galleryImages from ALL episodes so lightbox can browse the full set
    galleryImages = eps.map((ep) => ({
      file: ep.file,
      url: mediaUrl(collection.id, ep.file),
      title: ep.title,
    }));
    // Preview: only show first 20 thumbnails; click goes to full gallery
    const PREVIEW_LIMIT = 20;
    const galleryHash = '#/c/' + encodeURIComponent(collection.id) + '/gallery';
    const preview = galleryImages.slice(0, PREVIEW_LIMIT);
    for (let i = 0; i < preview.length; i++) {
      const img = preview[i];
      const div = document.createElement('div');
      div.className = 'gallery-thumb';
      div.dataset.idx = i;
      div.innerHTML = '<img src="' + thumbUrl(collection.id, img.file) + '" alt="' + escapeHtml(img.title) + '" loading="lazy">';
      div.addEventListener('click', () => navigate(galleryHash));
      listEl.appendChild(div);
    }
    if (eps.length > PREVIEW_LIMIT) {
      const more = document.createElement('div');
      more.className = 'gallery-thumb gallery-more';
      more.textContent = '+' + (eps.length - PREVIEW_LIMIT);
      more.addEventListener('click', () => navigate(galleryHash));
      listEl.appendChild(more);
    }
  }

  // ==================================================================
  // IMAGE GALLERY
  // ==================================================================
  let galleryImages = []; // { file, url }
  let galleryIndex = 0;
  let galleryAutoTimer = null;
  // Gallery bulk-delete mode (admin/perm-delete only).
  // selected holds currently ticked file paths; mode toggles the
  // checkbox overlay on every thumb and gates click semantics
  // (lightbox vs select). Cleared on view exit / mode exit.
  const galleryBulk = { mode: false, selected: new Set() };

  // ── Image likes ──
  state.imageLikes = [];
  async function loadImageLikes() {
    if (!state.user || state.kind !== 'image') { state.imageLikes = []; return; }
    try {
      const res = await fetch('/image/api/image-likes', { credentials: 'same-origin' });
      if (res.ok) { const d = await res.json(); state.imageLikes = d.likes || []; }
      else state.imageLikes = [];
    } catch (_e) { state.imageLikes = []; }
  }
  function isImageLiked(colId, file) {
    return state.imageLikes.some((t) => t.collectionId === colId && t.file === file);
  }
  async function toggleImageLike(colId, file) {
    const liked = isImageLiked(colId, file);
    try {
      await fetch('/image/api/image-likes', {
        method: liked ? 'DELETE' : 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collectionId: colId, file }),
      });
      if (liked) state.imageLikes = state.imageLikes.filter((t) => !(t.collectionId === colId && t.file === file));
      else state.imageLikes.push({ collectionId: colId, file });
    } catch (_e) { toast('操作失败', 'error'); }
  }
  const GALLERY_INTERVAL_KEY = 'ds124:galleryInterval';
  const galleryLbAuto = $('gallery-lb-auto');
  const galleryLbInterval = $('gallery-lb-interval');
  const galleryLbIntervalVal = $('gallery-lb-interval-val');

  // Sync the label next to the slider
  function syncIntervalLabel() {
    if (galleryLbIntervalVal && galleryLbInterval) {
      galleryLbIntervalVal.textContent = galleryLbInterval.value + 's';
    }
  }
  // Restore saved interval (clamp to new 1-15 range)
  try {
    const saved = localStorage.getItem(GALLERY_INTERVAL_KEY);
    if (saved && galleryLbInterval) {
      const v = Math.max(1, Math.min(15, Number(saved) || 5));
      galleryLbInterval.value = v;
    }
  } catch (_e) {}
  syncIntervalLabel();

  function startGalleryAuto() {
    stopGalleryAuto();
    const sec = Number(galleryLbInterval ? galleryLbInterval.value : 5) || 5;
    galleryAutoTimer = setInterval(() => {
      galleryIndex = (galleryIndex + 1) % galleryImages.length;
      updateGalleryLightbox();
    }, sec * 1000);
  }
  function stopGalleryAuto() {
    if (galleryAutoTimer) { clearInterval(galleryAutoTimer); galleryAutoTimer = null; }
  }
  if (galleryLbAuto) {
    galleryLbAuto.addEventListener('change', () => {
      if (galleryLbAuto.checked) startGalleryAuto();
      else stopGalleryAuto();
    });
  }
  if (galleryLbInterval) {
    galleryLbInterval.addEventListener('input', () => {
      syncIntervalLabel();
      try { localStorage.setItem(GALLERY_INTERVAL_KEY, galleryLbInterval.value); } catch (_e) {}
      if (galleryLbAuto && galleryLbAuto.checked) startGalleryAuto();
    });
  }

  async function showGalleryView(id, file) {
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    viewGallery.hidden = false;
    if (!state.user) { navigate('#/login'); return; }

    let collection = state.currentCollection;
    if (!collection || collection.id !== id) {
      try {
        const res = await api('GET', '/api/collections/' + encodeURIComponent(id));
        collection = res.collection;
        state.currentCollection = collection;
      } catch (err) {
        toast('加载合集失败: ' + err.message, 'error');
        navigate('#/');
        return;
      }
    }
    title.textContent = collection.title || collection.id;

    // Build image list from episodes (full-quality URLs for lightbox)
    galleryImages = collection.episodes.map((ep) => ({
      file: ep.file,
      url: mediaUrl(collection.id, ep.file),
      thumb: thumbUrl(collection.id, ep.file),
      title: ep.title,
    }));

    // Reset bulk-mode state on every gallery open so stale selections
    // from a different collection can't persist. The toolbar visibility
    // (admin-only / perm-delete) is handled by the existing CSS gates;
    // we only flip the actions-row open if it was already on.
    galleryBulk.selected.clear();
    if (galleryBulkBar) galleryBulkBar.hidden = false;
    if (galleryBulkActions) galleryBulkActions.hidden = !galleryBulk.mode;
    syncGalleryBulkUI();
    populateGalleryFolderSelect();

    // Render thumbnail grid with pagination for performance.
    // Only render GALLERY_PAGE_SIZE at a time; a "load more" sentinel
    // at the bottom uses IntersectionObserver to auto-load the next batch.
    const GALLERY_PAGE_SIZE = 60;
    let galleryRendered = 0;
    if (galleryGrid) {
      galleryGrid.innerHTML = '';
      galleryGrid.classList.toggle('gallery-bulk-mode', galleryBulk.mode);
      function renderGalleryBatch() {
        const end = Math.min(galleryRendered + GALLERY_PAGE_SIZE, galleryImages.length);
        for (let i = galleryRendered; i < end; i++) {
          const img = galleryImages[i];
          const div = document.createElement('div');
          div.className = 'gallery-thumb';
          if (galleryBulk.mode && galleryBulk.selected.has(img.file)) {
            div.classList.add('gallery-thumb-selected');
          }
          div.dataset.idx = i;
          div.dataset.file = img.file;
          const checkOverlay = '<span class="gallery-thumb-check" aria-hidden="true"></span>';
          div.innerHTML = checkOverlay + '<img alt="' + escapeHtml(img.title) + '" loading="lazy">';
          // Defer setting src until visible via IntersectionObserver (use thumbnail)
          div.dataset.src = img.thumb;
          div.addEventListener('click', () => {
            if (galleryBulk.mode) {
              toggleGalleryBulkSelection(div.dataset.file, div);
            } else {
              openGalleryLightbox(Number(div.dataset.idx));
            }
          });
          galleryGrid.appendChild(div);
        }
        galleryRendered = end;
        // Lazy-load images as they scroll into view
        if (window.IntersectionObserver) {
          const obs = new IntersectionObserver((entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                const imgEl = entry.target.querySelector('img');
                if (imgEl && !imgEl.src && entry.target.dataset.src) {
                  imgEl.src = entry.target.dataset.src;
                }
                obs.unobserve(entry.target);
              }
            }
          }, { rootMargin: '200px' });
          for (const thumb of galleryGrid.querySelectorAll('.gallery-thumb:not([data-observed])')) {
            thumb.dataset.observed = '1';
            obs.observe(thumb);
          }
        } else {
          // Fallback: set src immediately
          for (const thumb of galleryGrid.querySelectorAll('.gallery-thumb')) {
            const imgEl = thumb.querySelector('img');
            if (imgEl && !imgEl.src && thumb.dataset.src) imgEl.src = thumb.dataset.src;
          }
        }
        // Add "load more" sentinel
        const oldSentinel = galleryGrid.querySelector('.gallery-sentinel');
        if (oldSentinel) oldSentinel.remove();
        if (galleryRendered < galleryImages.length) {
          const sentinel = document.createElement('div');
          sentinel.className = 'gallery-sentinel';
          sentinel.textContent = '加载更多...';
          galleryGrid.appendChild(sentinel);
          if (window.IntersectionObserver) {
            const sObs = new IntersectionObserver((entries) => {
              if (entries[0].isIntersecting) {
                sObs.disconnect();
                sentinel.remove();
                renderGalleryBatch();
              }
            }, { rootMargin: '400px' });
            sObs.observe(sentinel);
          }
        }
      }
      if (galleryImages.length > 0) renderGalleryBatch();
      else galleryGrid.innerHTML = '<div class="cards-status mono">（空）</div>';
    }

    // If a specific file was requested, open it in lightbox
    if (file) {
      const idx = galleryImages.findIndex((img) => img.file === file);
      if (idx >= 0) openGalleryLightbox(idx);
    }
  }
  // ---- Gallery bulk-delete helpers ----------------------------------
  function toggleGalleryBulkSelection(file, divEl) {
    if (!file) return;
    if (galleryBulk.selected.has(file)) {
      galleryBulk.selected.delete(file);
      if (divEl) divEl.classList.remove('gallery-thumb-selected');
    } else {
      galleryBulk.selected.add(file);
      if (divEl) divEl.classList.add('gallery-thumb-selected');
    }
    syncGalleryBulkUI();
  }
  function syncGalleryBulkUI() {
    if (galleryBulkCount) galleryBulkCount.textContent = String(galleryBulk.selected.size);
    if (galleryBulkDeleteBtn) galleryBulkDeleteBtn.disabled = galleryBulk.selected.size === 0;
  }
  function populateGalleryFolderSelect() {
    if (!galleryBulkFolderSel) return;
    // Derive each thumb's folder prefix (the path up to the last "/").
    // Files at the collection root contribute the synthetic key "/" so
    // admins can still pick "just the loose root files" if needed.
    const counts = new Map();
    for (const img of galleryImages) {
      const i = img.file.lastIndexOf('/');
      const dir = i >= 0 ? img.file.slice(0, i) : '';
      counts.set(dir, (counts.get(dir) || 0) + 1);
    }
    const folders = Array.from(counts.entries()).sort((a, b) => a[0].localeCompare(b[0], 'zh-CN'));
    // The placeholder option uses a sentinel value rather than empty
    // string — empty is a legitimate folder key (root files), so we
    // need a distinct sentinel to distinguish "no choice" from "root".
    const opts = ['<option value="__placeholder__">— 按子目录选 —</option>'];
    for (const [dir, n] of folders) {
      const label = dir === '' ? '/（根目录）' : dir;
      opts.push(`<option value="${escapeHtml(dir)}">${escapeHtml(label)} · ${n}</option>`);
    }
    galleryBulkFolderSel.innerHTML = opts.join('');
  }
  function selectGalleryFolder(dir) {
    if (!galleryBulk.mode) return;
    let added = 0;
    for (const img of galleryImages) {
      const i = img.file.lastIndexOf('/');
      const d = i >= 0 ? img.file.slice(0, i) : '';
      if (d === dir && !galleryBulk.selected.has(img.file)) {
        galleryBulk.selected.add(img.file);
        added++;
      }
    }
    // Reflect new selection on already-rendered thumbs without a full
    // re-render — tear-up new IntersectionObservers would be expensive.
    if (galleryGrid) {
      for (const t of galleryGrid.querySelectorAll('.gallery-thumb')) {
        if (galleryBulk.selected.has(t.dataset.file)) t.classList.add('gallery-thumb-selected');
      }
    }
    syncGalleryBulkUI();
    if (added > 0) toast('已选 ' + galleryBulk.selected.size + ' 张图片', 'success');
  }
  function enterGalleryBulkMode() {
    galleryBulk.mode = true;
    galleryBulk.selected.clear();
    if (galleryBulkActions) galleryBulkActions.hidden = false;
    if (galleryBulkToggle) galleryBulkToggle.classList.add('active');
    if (galleryGrid) galleryGrid.classList.add('gallery-bulk-mode');
    syncGalleryBulkUI();
  }
  function exitGalleryBulkMode() {
    galleryBulk.mode = false;
    galleryBulk.selected.clear();
    if (galleryBulkActions) galleryBulkActions.hidden = true;
    if (galleryBulkToggle) galleryBulkToggle.classList.remove('active');
    if (galleryGrid) {
      galleryGrid.classList.remove('gallery-bulk-mode');
      for (const t of galleryGrid.querySelectorAll('.gallery-thumb-selected')) {
        t.classList.remove('gallery-thumb-selected');
      }
    }
    syncGalleryBulkUI();
  }
  async function galleryBulkDeleteSelected() {
    const col = state.currentCollection;
    if (!col || galleryBulk.selected.size === 0) return;
    const n = galleryBulk.selected.size;
    const ok = await confirmBox(`删除 ${n} 张图片？磁盘上的文件会一并移除，操作不可撤销。`, 'BULK DELETE');
    if (!ok) return;
    const files = Array.from(galleryBulk.selected);
    try {
      const result = await api('POST', '/api/collections/' + encodeURIComponent(col.id) + '/episodes/bulk', {
        action: 'delete', files,
      });
      const okN = result.processedCount || 0;
      const failN = result.errorCount || 0;
      toast(`删除完成 · 成功 ${okN}` + (failN ? ` · 失败 ${failN}` : ''), failN ? 'warning' : 'success');
      // Drop deleted files locally so the in-memory state stays in sync.
      const removed = new Set(result.processed || files);
      galleryImages = galleryImages.filter((img) => !removed.has(img.file));
      if (Array.isArray(col.episodes)) {
        col.episodes = col.episodes.filter((ep) => !removed.has(ep.file));
        col.episodeCount = col.episodes.length;
      }
      exitGalleryBulkMode();
      // Re-render the grid from the trimmed list.
      showGalleryView(col.id, null);
    } catch (e) {
      toast('删除失败: ' + e.message, 'error');
    }
  }
  if (galleryBulkToggle) galleryBulkToggle.addEventListener('click', () => {
    if (galleryBulk.mode) exitGalleryBulkMode();
    else enterGalleryBulkMode();
  });
  if (galleryBulkExitBtn) galleryBulkExitBtn.addEventListener('click', exitGalleryBulkMode);
  if (galleryBulkSelectAllBtn) galleryBulkSelectAllBtn.addEventListener('click', () => {
    if (!galleryBulk.mode) return;
    for (const img of galleryImages) galleryBulk.selected.add(img.file);
    if (galleryGrid) {
      for (const t of galleryGrid.querySelectorAll('.gallery-thumb')) {
        t.classList.add('gallery-thumb-selected');
      }
    }
    syncGalleryBulkUI();
  });
  if (galleryBulkClearBtn) galleryBulkClearBtn.addEventListener('click', () => {
    galleryBulk.selected.clear();
    if (galleryGrid) {
      for (const t of galleryGrid.querySelectorAll('.gallery-thumb-selected')) {
        t.classList.remove('gallery-thumb-selected');
      }
    }
    syncGalleryBulkUI();
  });
  if (galleryBulkFolderSel) galleryBulkFolderSel.addEventListener('change', () => {
    const dir = galleryBulkFolderSel.value;
    if (dir === '__placeholder__') return;
    selectGalleryFolder(dir);
    galleryBulkFolderSel.selectedIndex = 0;
  });
  if (galleryBulkDeleteBtn) galleryBulkDeleteBtn.addEventListener('click', galleryBulkDeleteSelected);

  function openGalleryLightbox(idx) {
    if (!galleryLightbox || !galleryImages.length) return;
    galleryIndex = idx;
    updateGalleryLightbox();
    galleryLightbox.hidden = false;
  }
  function closeGalleryLightbox() {
    stopGalleryAuto();
    if (galleryLbAuto) galleryLbAuto.checked = false;
    if (galleryLightbox) galleryLightbox.hidden = true;
    if (galleryLbImg) galleryLbImg.src = '';
  }
  function updateGalleryLightbox() {
    if (!galleryLbImg) return;
    const img = galleryImages[galleryIndex];
    if (!img) return;
    galleryLbImg.src = img.url;
    if (galleryLbCounter) {
      galleryLbCounter.textContent = (galleryIndex + 1) + ' / ' + galleryImages.length;
    }
    // Sync like button
    if (galleryLbLike && state.currentCollection) {
      galleryLbLike.checked = isImageLiked(state.currentCollection.id, img.file);
    }
  }
  if (galleryLbPrev) galleryLbPrev.addEventListener('click', () => {
    if (galleryIndex > 0) { galleryIndex--; updateGalleryLightbox(); }
    else { galleryIndex = galleryImages.length - 1; updateGalleryLightbox(); }
  });
  if (galleryLbNext) galleryLbNext.addEventListener('click', () => {
    if (galleryIndex < galleryImages.length - 1) { galleryIndex++; updateGalleryLightbox(); }
    else { galleryIndex = 0; updateGalleryLightbox(); }
  });
  // Lightbox like button
  const galleryLbLike = $('gallery-lb-like');
  if (galleryLbLike) {
    galleryLbLike.addEventListener('change', async () => {
      const col = state.currentCollection;
      const img = galleryImages[galleryIndex];
      if (!col || !img) return;
      await toggleImageLike(col.id, img.file);
      galleryLbLike.checked = isImageLiked(col.id, img.file);
    });
  }

  // Click zones on image for prev/next
  const galleryLbZoneLeft = $('gallery-lb-zone-left');
  const galleryLbZoneRight = $('gallery-lb-zone-right');
  if (galleryLbZoneLeft) galleryLbZoneLeft.addEventListener('click', () => {
    if (galleryLbPrev) galleryLbPrev.click();
  });
  if (galleryLbZoneRight) galleryLbZoneRight.addEventListener('click', () => {
    if (galleryLbNext) galleryLbNext.click();
  });
  if (galleryLbClose) galleryLbClose.addEventListener('click', closeGalleryLightbox);
  // Touch swipe support for lightbox (only on the image stage, not the bar)
  let lbTouchStartX = 0;
  let lbTouchStartY = 0;
  let lbSwipeValid = false;
  const galleryLbStage = $('gallery-lb-stage') || galleryLightbox;
  if (galleryLbStage) {
    galleryLbStage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        lbTouchStartX = e.touches[0].clientX;
        lbTouchStartY = e.touches[0].clientY;
        lbSwipeValid = true;
      }
    }, { passive: true });
    galleryLbStage.addEventListener('touchend', (e) => {
      if (!lbSwipeValid || e.changedTouches.length !== 1) return;
      lbSwipeValid = false;
      const dx = e.changedTouches[0].clientX - lbTouchStartX;
      const dy = e.changedTouches[0].clientY - lbTouchStartY;
      // Require horizontal swipe > 50px and more horizontal than vertical
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0 && galleryLbNext) galleryLbNext.click();  // swipe left = next
      else if (dx > 0 && galleryLbPrev) galleryLbPrev.click();  // swipe right = prev
    }, { passive: true });
  }
  document.addEventListener('keydown', (e) => {
    if (!galleryLightbox || galleryLightbox.hidden) return;
    if (e.key === 'Escape') { closeGalleryLightbox(); e.preventDefault(); }
    if (e.key === 'ArrowLeft' && galleryLbPrev) { galleryLbPrev.click(); e.preventDefault(); }
    if (e.key === 'ArrowRight' && galleryLbNext) { galleryLbNext.click(); e.preventDefault(); }
  });

  // ==================================================================
  // HISTORY
  // ==================================================================
  async function showHistory() {
    maybeActivateMiniPlayer();
    maybeActivateAudioMini();
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = 'PLAYBACK HISTORY';
    viewHistory.hidden = false;
    state.historyManageMode = false;
    state.historySelected.clear();
    historyManageBar.hidden = true;
    if (historyManageBtn) historyManageBtn.classList.remove('active');
    if (!state.user) { navigate('#/login'); return; }
    historyList.innerHTML = renderSkeletonList(4);
    try {
      const { history } = await api('GET', '/api/history');
      state.historyItems = history || [];
      renderHistoryList();
    } catch (err) {
      historyList.innerHTML = `<li class="cards-status error">加载失败: ${escapeHtml(err.message)}</li>`;
    }
  }

  function historyKey(id, file) { return id + '\x00' + file; }

  function renderHistoryList() {
    const history = state.historyItems;
    if (!history.length) {
      historyList.innerHTML = '<li class="cards-status">还没有播放记录</li>';
      historyManageBar.hidden = true;
      return;
    }
    historyList.innerHTML = history.map((h) => {
      let pct = 0;
      if (h.duration) pct = Math.max(0, Math.min(100, (h.position / h.duration) * 100));
      const missing = !h.exists ? ' <span class="history-gone">(已删除)</span>' : '';
      const key = historyKey(h.id, h.lastFile);
      const selected = state.historySelected.has(key) ? ' selected' : '';
      const checkbox = state.historyManageMode
        ? `<div class="ep-check" data-icon="${state.historySelected.has(key) ? 'checkbox-on' : 'checkbox'}"></div>`
        : '';
      return `
        <li class="history-row${selected}" data-id="${escapeHtml(h.id)}" data-file="${escapeHtml(h.lastFile)}" data-exists="${h.exists}">
          ${checkbox}
          <div class="history-thumb" ${h.cover ? `style="${coverVarsStyle(h)}"` : ''}></div>
          <div class="history-body">
            <div class="history-title">${escapeHtml(h.title)}${missing}</div>
            <div class="history-sub mono">${escapeHtml(typeLabel(h.type))} · ${escapeHtml(h.lastEpisodeTitle)}</div>
            <div class="history-progress"><span style="width:${pct}%"></span></div>
            <div class="history-time mono">${escapeHtml(formatTime(h.position))} / ${h.duration ? escapeHtml(formatTime(h.duration)) : '??'} · ${new Date(h.updatedAt).toLocaleString()}</div>
          </div>
          <button type="button" class="history-del-btn" data-key="${escapeHtml(key)}" aria-label="删除这条" title="删除这条">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"/><line x1="19" y1="5" x2="5" y2="19"/></svg>
          </button>
        </li>
      `;
    }).join('');
    injectIcons(historyList);

    for (const row of historyList.querySelectorAll('li.history-row')) {
      row.addEventListener('click', (e) => {
        if (e.target.closest('.history-del-btn')) return;
        const id = row.dataset.id;
        const file = row.dataset.file;
        if (state.historyManageMode) {
          const key = historyKey(id, file);
          if (state.historySelected.has(key)) state.historySelected.delete(key);
          else state.historySelected.add(key);
          updateHistoryManageBar();
          renderHistoryList();
          return;
        }
        if (row.dataset.exists !== 'true') {
          toast('该合集已删除', 'error');
          return;
        }
        navigate('#/c/' + encodeURIComponent(id) + '/play/' + encodeURIComponent(file));
      });
    }
    for (const btn of historyList.querySelectorAll('.history-del-btn')) {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const row = btn.closest('.history-row');
        const id = row.dataset.id;
        const file = row.dataset.file;
        try {
          await api('POST', '/api/history/delete', {
            items: [{ collectionId: id, file }],
          });
          state.historyItems = state.historyItems.filter((h) => !(h.id === id && h.lastFile === file));
          renderHistoryList();
          toast('已删除');
        } catch (err) { toast('删除失败: ' + err.message, 'error'); }
      });
    }
  }

  function updateHistoryManageBar() {
    historyManageCount.textContent = state.historySelected.size;
  }

  historyManageBtn.addEventListener('click', () => {
    state.historyManageMode = !state.historyManageMode;
    state.historySelected.clear();
    historyManageBar.hidden = !state.historyManageMode;
    historyManageBtn.classList.toggle('active', state.historyManageMode);
    updateHistoryManageBar();
    renderHistoryList();
  });
  historyExitBtn.addEventListener('click', () => {
    state.historyManageMode = false;
    state.historySelected.clear();
    historyManageBar.hidden = true;
    historyManageBtn.classList.remove('active');
    renderHistoryList();
  });
  historyAllBtn.addEventListener('click', () => {
    const all = state.historyItems.map((h) => historyKey(h.id, h.lastFile));
    if (state.historySelected.size === all.length) state.historySelected.clear();
    else all.forEach((k) => state.historySelected.add(k));
    updateHistoryManageBar();
    renderHistoryList();
  });
  historyDeleteBtn.addEventListener('click', async () => {
    if (!state.historySelected.size) return;
    const ok = await confirmBox(`删除选中的 ${state.historySelected.size} 条历史记录？`, 'DELETE HISTORY');
    if (!ok) return;
    const items = [];
    for (const key of state.historySelected) {
      const [id, file] = key.split('\x00');
      items.push({ collectionId: id, file });
    }
    try {
      const r = await api('POST', '/api/history/delete', { items });
      toast(`已删除 ${r.removed} 条`, 'success');
      state.historySelected.clear();
      state.historyManageMode = false;
      historyManageBar.hidden = true;
      historyManageBtn.classList.remove('active');
      // Reload from server to be sure we're in sync.
      const { history } = await api('GET', '/api/history');
      state.historyItems = history || [];
      renderHistoryList();
    } catch (err) { toast('删除失败: ' + err.message, 'error'); }
  });
  clearHistoryBtn.addEventListener('click', async () => {
    const ok = await confirmBox('清空所有播放历史？进度将全部丢失。', 'CLEAR HISTORY');
    if (!ok) return;
    try {
      await api('DELETE', '/api/history');
      state.progressAll = {};
      state.historyItems = [];
      showHistory();
      toast('已清空历史');
    } catch (err) { toast('失败: ' + err.message, 'error'); }
  });

  // ==================================================================
  // ADMIN
  // ==================================================================
  async function showAdmin() {
    maybeActivateMiniPlayer();
    maybeActivateAudioMini();
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = 'ADMIN';
    viewAdmin.hidden = false;
    if (!state.user || state.user.role !== 'admin') {
      adminUsersBody.innerHTML = '<tr><td colspan="4" class="cards-status">需要管理员权限</td></tr>';
      return;
    }
    showAdminTab(state.adminTab);
  }

  // 1.2.0+: standalone search page. Cross-field, cross-kind, AND multi-term.
  // URL state: #/search?q=&fields=&kind=
  async function showSearchPage(q, fields, searchKind, hidden) {
    maybeActivateMiniPlayer();
    maybeActivateAudioMini();
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = 'SEARCH';
    const view = document.getElementById('view-search');
    if (!view) return;
    view.hidden = false;
    const qInput = document.getElementById('search-page-input');
    const submit = document.getElementById('search-page-submit');
    const status = document.getElementById('search-page-status');
    const results = document.getElementById('search-page-results');
    // Restore URL state into form fields.
    qInput.value = q || '';
    const fieldList = (fields || 'title').split(',').map((s) => s.trim()).filter(Boolean);
    for (const cb of view.querySelectorAll('input[name="search-field"]')) {
      cb.checked = fieldList.includes(cb.value);
    }
    if (fieldList.length === 0) {
      const tcb = view.querySelector('input[name="search-field"][value="title"]');
      if (tcb) tcb.checked = true;
    }
    const kk = searchKind || 'all';
    for (const r of view.querySelectorAll('input[name="search-kind"]')) {
      r.checked = (r.value === kk);
    }
    // 含隐藏 toggle: admin-only via CSS .admin-only auto-hide.
    const hiddenCb = document.getElementById('search-page-hidden');
    if (hiddenCb) hiddenCb.checked = (hidden === '1');
    setTimeout(() => qInput.focus(), 50);
    // Auto-run when arriving with a non-empty q (e.g. shared link).
    if (q && q.trim()) runSearchPage();
    else {
      status.textContent = '输入关键词后回车搜索';
      results.innerHTML = '';
    }
    // Wire submit (rebind each open is fine; same elements, idempotent
    // via removeEventListener pattern would be tighter but submission is
    // low-frequency so re-attaching once per show is acceptable).
    if (!view._searchWired) {
      view._searchWired = true;
      submit.addEventListener('click', () => runSearchPage());
      qInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') { e.preventDefault(); runSearchPage(); }
      });
      for (const cb of view.querySelectorAll('input[name="search-field"]')) {
        cb.addEventListener('change', () => { if (qInput.value.trim()) runSearchPage(); });
      }
      for (const r of view.querySelectorAll('input[name="search-kind"]')) {
        r.addEventListener('change', () => { if (qInput.value.trim()) runSearchPage(); });
      }
      const hiddenCbWire = document.getElementById('search-page-hidden');
      if (hiddenCbWire) {
        hiddenCbWire.addEventListener('change', () => { if (qInput.value.trim()) runSearchPage(); });
      }
    }
  }
  async function runSearchPage() {
    const view = document.getElementById('view-search');
    const qInput = document.getElementById('search-page-input');
    const status = document.getElementById('search-page-status');
    const results = document.getElementById('search-page-results');
    const q = qInput.value.trim();
    if (!q) { status.textContent = '请输入关键词'; results.innerHTML = ''; return; }
    const fields = Array.from(view.querySelectorAll('input[name="search-field"]:checked')).map((cb) => cb.value);
    if (fields.length === 0) { status.textContent = '请至少勾选一个搜索范围'; return; }
    const kindEl = view.querySelector('input[name="search-kind"]:checked');
    const kk = (kindEl && kindEl.value) || 'all';
    const hiddenCbRun = document.getElementById('search-page-hidden');
    // includeHidden=1 is server-side admin-gated; non-admin clients
    // sending it get silently ignored. Still avoid putting it on the
    // wire when not checked, to keep URLs clean.
    const wantHidden = !!(hiddenCbRun && hiddenCbRun.checked && isAdmin && isAdmin());
    // URL sync — treat as bookmarkable. replaceState avoids polluting
    // the back-stack on every keystroke pivot.
    const params = new URLSearchParams();
    params.set('q', q);
    if (fields.length) params.set('fields', fields.join(','));
    if (kk) params.set('kind', kk);
    if (wantHidden) params.set('hidden', '1');
    const newHash = '#/search?' + params.toString();
    if (location.hash !== newHash) {
      try { history.replaceState(null, '', newHash); } catch (_e) { /* noop */ }
    }
    status.textContent = '搜索中...';
    results.innerHTML = '';
    try {
      // Server param is `includeHidden=1` (URL param `hidden=1` is the
      // bookmarkable form). Translate when calling.
      const apiParams = new URLSearchParams(params);
      if (apiParams.has('hidden')) {
        apiParams.delete('hidden');
        apiParams.set('includeHidden', '1');
      }
      const data = await api('GET', '/api/search?' + apiParams.toString());
      const hits = (data && data.hits) || [];
      status.textContent = `命中 ${hits.length} 个合集（板块：${kk === 'all' ? '全部' : kk}，范围：${fields.join('+')}）`;
      if (hits.length === 0) {
        results.innerHTML = '<div class="cards-status">无结果</div>';
        return;
      }
      // Render compact cards (link to detail page).
      // Cards are wrapped in a non-clickable container instead of an
      // <a> so the per-episode mini-links nested below can each have
      // their own href without the parent anchor swallowing the click
      // (HTML disallows nested anchors). Card-level click is rebound
      // below as a JS handler.
      results.innerHTML = hits.map((c) => {
        const kindLabel = ({ video: '视频', audio: '音频', image: '图片', novel: '小说' })[c._kind] || c._kind;
        const auths = Array.isArray(c.authors) && c.authors.length ? '<div class="search-card-meta mono">作者 / 公司：' + escapeHtml(c.authors.join(', ')) + '</div>' : '';
        const path = clientPathLabelForKind(c._kind, c.type) || c.type;
        // Per-episode jumplinks (only present when the user opted into
        // the "episodes" field and at least one episode in this
        // collection matched all search terms).
        let epsHtml = '';
        if (Array.isArray(c._matchedEpisodes) && c._matchedEpisodes.length > 0) {
          const items = c._matchedEpisodes.map((ep) => {
            const order = (typeof ep.order === 'number' && ep.order > 0)
              ? ('#' + String(ep.order).padStart(2, '0') + ' ')
              : '';
            const labelHtml = escapeHtml(order + (ep.title || ep.file));
            const href = '#/c/' + encodeURIComponent(c.id) + '/play/' + encodeURIComponent(ep.file);
            return `<a class="search-card-ep" href="${href}" data-kind="${escapeHtml(c._kind)}">${labelHtml}</a>`;
          }).join('');
          epsHtml = `<div class="search-card-episodes">${items}</div>`;
        }
        return `
          <div class="search-card" data-kind="${escapeHtml(c._kind)}" data-id="${escapeHtml(c.id)}">
            <a class="search-card-link" href="#/c/${encodeURIComponent(c.id)}" data-kind="${escapeHtml(c._kind)}">
              <div class="search-card-kind mono">[${escapeHtml(kindLabel)}]</div>
              <div class="search-card-body">
                <div class="search-card-title">${escapeHtml(c.title || c.id)}</div>
                <div class="search-card-meta mono">${escapeHtml(path)} · ${c.episodeCount || 0} ${countUnit(c._kind)} · ${formatSize(c.totalSize || 0)}</div>
                ${auths}
              </div>
            </a>
            ${epsHtml}
          </div>`;
      }).join('');
      // Intercept clicks on collection links AND per-episode jumplinks
      // so state.kind is switched to match the hit's kind before the
      // hash route handler renders the destination view.
      results.querySelectorAll('.search-card-link, .search-card-ep').forEach((a) => {
        a.addEventListener('click', () => {
          const k = a.dataset.kind;
          if (k && state.kind !== k) {
            state.kind = k;
            try { localStorage.setItem(KIND_KEY, k); } catch (_e) {}
            applyKindUI();
          }
        });
      });
    } catch (e) {
      status.textContent = '搜索失败：' + e.message;
    }
  }
  // Kind-specific pathLabel — clientPathLabel uses state.kind, which may
  // not match a search hit from another kind. Build from the right cat list.
  function clientPathLabelForKind(kind, id) {
    const list = (state.categories && state.categories[kind]) || [];
    const m = new Map();
    for (const c of list) m.set(c.id, c);
    const node = m.get(id);
    if (!node) return id;
    const labels = [node.label];
    let cur = node;
    let steps = 0;
    while (cur && cur.parentId && steps < 5) {
      const parent = m.get(cur.parentId);
      if (!parent) break;
      labels.unshift(parent.label);
      cur = parent;
      steps++;
    }
    return labels.join(' / ');
  }
  function showAdminTab(name) {
    state.adminTab = name;
    for (const t of document.querySelectorAll('.admin-tab')) {
      t.classList.toggle('active', t.dataset.adminTab === name);
    }
    document.getElementById('admin-tab-users').hidden = name !== 'users';
    document.getElementById('admin-tab-stats').hidden = name !== 'stats';
    document.getElementById('admin-tab-health').hidden = name !== 'health';
    document.getElementById('admin-tab-categories').hidden = name !== 'categories';
    document.getElementById('admin-tab-duplicates').hidden = name !== 'duplicates';
    const mkvPane = document.getElementById('admin-tab-mkv-queue');
    if (mkvPane) mkvPane.hidden = name !== 'mkv-queue';
    if (name === 'users') loadAdminUsers();
    if (name === 'stats') loadAdminStats();
    if (name === 'health') loadAdminHealth();
    if (name === 'categories') loadAdminCategories();
    if (name === 'duplicates') loadAdminDuplicates();
    if (name === 'mkv-queue') {
      loadMkvQueue();
      startMkvQueueAutoRefresh();
    } else {
      stopMkvQueueAutoRefresh();
    }
  }

  /**
   * @brief Render the MKV pretranscode queue dashboard from
   *        /api/hls-queue. Shows two tables:
   *          - active ffmpegs (running now, with pid + nice + source)
   *          - pending entries (queued for the worker to pick)
   *        Status text in the toolbar shows last refresh + counts.
   */
  async function loadMkvQueue() {
    const status = document.getElementById('mkv-queue-status');
    const activeBody = document.getElementById('mkv-queue-active-body');
    const pendingBody = document.getElementById('mkv-queue-pending-body');
    if (!status || !activeBody || !pendingBody) return;
    status.textContent = '加载中…';
    let d;
    try {
      const r = await fetch('/api/hls-queue');
      if (!r.ok) throw new Error('HTTP ' + r.status);
      d = await r.json();
    } catch (e) {
      status.textContent = '加载失败: ' + e.message;
      return;
    }
    // Active table.
    if (!d.active || d.active.length === 0) {
      activeBody.innerHTML = '<tr><td colspan="5" class="mono" style="opacity:0.6">(无)</td></tr>';
    } else {
      activeBody.innerHTML = d.active.map((j) => {
        const elapsed = j.startedAt ? Math.round((Date.now() - j.startedAt) / 1000) : 0;
        const elapsedStr = elapsed >= 60 ? Math.floor(elapsed / 60) + 'm' + (elapsed % 60) + 's' : elapsed + 's';
        const source = j.fromQueue ? 'queue' : 'user';
        const nice = j.demoted ? 19 : 10;
        return '<tr><td>' + escapeHtml(j.file || '?') + '</td>'
          + '<td class="mono">' + j.pid + '</td>'
          + '<td class="mono">' + nice + '</td>'
          + '<td class="mono">' + source + '</td>'
          + '<td class="mono">' + elapsedStr + '</td></tr>';
      }).join('');
    }
    // Pending table.
    if (!d.queue || d.queue.length === 0) {
      pendingBody.innerHTML = '<tr><td colspan="4" class="mono" style="opacity:0.6">(空)</td></tr>';
    } else {
      pendingBody.innerHTML = d.queue.map((q) => {
        const ago = q.addedAt ? Math.round((Date.now() - q.addedAt) / 1000) : 0;
        const agoStr = ago >= 3600 ? Math.floor(ago / 3600) + 'h前'
          : ago >= 60 ? Math.floor(ago / 60) + 'm前'
          : ago + 's前';
        return '<tr><td>' + escapeHtml(q.file || '?') + '</td>'
          + '<td class="mono">' + escapeHtml(q.collection || '?') + '</td>'
          + '<td class="mono">' + escapeHtml(q.status || '?') + '</td>'
          + '<td class="mono">' + agoStr + '</td></tr>';
      }).join('');
    }
    status.textContent = '活跃 ' + (d.active ? d.active.length : 0) + ' / 待转 ' + (d.queue ? d.queue.length : 0)
      + ' · 更新 ' + new Date().toLocaleTimeString();
  }
  function startMkvQueueAutoRefresh() {
    stopMkvQueueAutoRefresh();
    state._mkvQueueTimer = setInterval(loadMkvQueue, 5000);
  }
  function stopMkvQueueAutoRefresh() {
    if (state._mkvQueueTimer) {
      clearInterval(state._mkvQueueTimer);
      state._mkvQueueTimer = null;
    }
  }
  // Wire the manual refresh button (no-op if dashboard not present).
  const mkvQueueRefreshBtn = document.getElementById('mkv-queue-refresh-btn');
  if (mkvQueueRefreshBtn) mkvQueueRefreshBtn.addEventListener('click', loadMkvQueue);
  for (const t of document.querySelectorAll('.admin-tab')) {
    t.addEventListener('click', () => showAdminTab(t.dataset.adminTab));
  }

  // ----- Admin: category editor (1.7.0 chip-layer model) -----
  // Working draft stored in this scope so edits can be cancelled.
  // KINDS is the canonical list — driven from state.categories so adding
  // a new subsystem only requires a server-side config change.
  let catDraft = {};
  const ADMIN_KIND_LIST = ['video', 'audio', 'image', 'novel'];
  // Per-kind selection set: which chips have been "expanded" (their
  // children appear in the next layer). Mirrors the home filter chip
  // reveal-path mechanism (1.2.5-1.3.0). Persisted across reloads.
  const catSelection = { video: new Set(), audio: new Set(), image: new Set(), novel: new Set() };
  // Per-kind active editing target — the chip whose label / hidden /
  // parent / keywords are wired to the inline edit panel. null = no
  // editor open (cat-edit-empty hint shown instead).
  const catActiveEditId = { video: null, audio: null, image: null, novel: null };
  const CAT_SELECTION_LS_KEY = 'ds124:adminCatSelection';
  const CAT_ACTIVE_EDIT_LS_KEY = 'ds124:adminCatActiveEdit';
  try {
    const rawSel = localStorage.getItem(CAT_SELECTION_LS_KEY);
    if (rawSel) {
      const parsed = JSON.parse(rawSel);
      for (const k of ADMIN_KIND_LIST) {
        if (Array.isArray(parsed[k])) catSelection[k] = new Set(parsed[k]);
      }
    }
  } catch (_e) {}
  try {
    const rawAct = localStorage.getItem(CAT_ACTIVE_EDIT_LS_KEY);
    if (rawAct) {
      const parsed = JSON.parse(rawAct);
      for (const k of ADMIN_KIND_LIST) {
        if (typeof parsed[k] === 'string') catActiveEditId[k] = parsed[k];
      }
    }
  } catch (_e) {}
  function persistCatSelection() {
    try {
      const out = {};
      for (const k of ADMIN_KIND_LIST) out[k] = Array.from(catSelection[k] || []);
      localStorage.setItem(CAT_SELECTION_LS_KEY, JSON.stringify(out));
    } catch (_e) {}
  }
  function persistCatActiveEdit() {
    try {
      const out = {};
      for (const k of ADMIN_KIND_LIST) out[k] = catActiveEditId[k] || null;
      localStorage.setItem(CAT_ACTIVE_EDIT_LS_KEY, JSON.stringify(out));
    } catch (_e) {}
  }
  // Live filter string (lowercased) applied to the active kind's editor.
  // Non-empty query swaps the chip-stack + edit-panel out for a flat
  // search-results list (cat-search-results); empty query restores the
  // chip-layer view. Persisted only in memory — survives kind-switch
  // within a session but resets on full reload (was confusing otherwise).
  let catFilterQuery = '';
  // Active sub-tab (which kind's editor is currently visible). Only the
  // active editor is shown; the other three .category-editor blocks
  // carry the [hidden] attribute. Persisted across reloads.
  const CAT_ACTIVE_KIND_LS_KEY = 'ds124:adminCatActiveKind';
  let adminCatActiveKind = 'video';
  try {
    const stored = localStorage.getItem(CAT_ACTIVE_KIND_LS_KEY);
    if (stored && ['video', 'audio', 'image', 'novel'].includes(stored)) {
      adminCatActiveKind = stored;
    }
  } catch (_e) {}
  function setAdminCatActiveKind(kind) {
    if (!['video', 'audio', 'image', 'novel'].includes(kind)) return;
    adminCatActiveKind = kind;
    try { localStorage.setItem(CAT_ACTIVE_KIND_LS_KEY, kind); } catch (_e) {}
    for (const tab of document.querySelectorAll('.cat-kind-tab')) {
      const isActive = tab.dataset.catKind === kind;
      tab.classList.toggle('active', isActive);
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
    }
    for (const ed of document.querySelectorAll('.category-editor[data-cat-kind]')) {
      ed.hidden = ed.dataset.catKind !== kind;
    }
  }
  function adminKinds() {
    return Object.keys(state.categories || { video: [], audio: [] });
  }
  function deepCopyCatMap(src) {
    const out = {};
    for (const k of adminKinds()) {
      out[k] = ((src && src[k]) || []).map((c) => ({ ...c }));
    }
    return out;
  }

  async function loadAdminCategories() {
    try {
      const { categories } = await api('GET', '/api/admin/categories');
      catDraft = deepCopyCatMap(categories);
    } catch (e) {
      catDraft = deepCopyCatMap(state.categories);
    }
    renderCategoryLists();
    setCatStatus('', '');
  }
  // 1.1.0+: hierarchy helpers operating on the draft (live edits before save).
  // 1.3.0: depth bumped 3 → 5 to match the server (lib/categories.js MAX_DEPTH).
  const ADMIN_MAX_DEPTH = 5;
  function _draftIdxOf(kind, id) {
    return catDraft[kind].findIndex((c) => c.id === id);
  }
  function _draftChildrenOf(kind, parentId) {
    return catDraft[kind].filter((c) => (c.parentId || null) === (parentId || null));
  }
  function _draftHasChildren(kind, id) {
    return catDraft[kind].some((c) => c.parentId === id);
  }
  function _draftDepthOf(kind, id) {
    let cur = catDraft[kind].find((c) => c.id === id);
    let depth = 0;
    let steps = 0;
    while (cur && cur.parentId && steps < ADMIN_MAX_DEPTH + 1) {
      depth++;
      cur = catDraft[kind].find((c) => c.id === cur.parentId);
      steps++;
    }
    return depth;
  }
  // Height of the subtree rooted at id (0 = leaf, 1 = has children, ...).
  function _draftSubtreeHeight(kind, id) {
    let best = 0;
    function walk(nodeId, h) {
      if (h > best) best = h;
      for (const c of catDraft[kind]) {
        if (c.parentId === nodeId) walk(c.id, h + 1);
      }
    }
    walk(id, 0);
    return best;
  }
  function _draftIsAncestor(kind, ancestorId, descendantId) {
    let cur = catDraft[kind].find((c) => c.id === descendantId);
    let steps = 0;
    while (cur && cur.parentId && steps < ADMIN_MAX_DEPTH + 1) {
      if (cur.parentId === ancestorId) return true;
      cur = catDraft[kind].find((c) => c.id === cur.parentId);
      steps++;
    }
    return false;
  }
  // List of valid parent options for a given node, keyed for the <select>.
  // Excludes self, descendants, and any candidate that would push the node's
  // subtree past ADMIN_MAX_DEPTH.
  function _eligibleParents(kind, idOfN) {
    const subH = _draftSubtreeHeight(kind, idOfN);
    const result = [{ id: '', label: '（顶层）', depth: 0 }];
    for (const c of catDraft[kind]) {
      if (c.id === idOfN) continue;
      if (_draftIsAncestor(kind, idOfN, c.id)) continue; // c is descendant of N
      const cDepth = _draftDepthOf(kind, c.id);
      if (cDepth + 1 + subH > ADMIN_MAX_DEPTH - 1) continue;
      result.push({ id: c.id, label: c.label, depth: cDepth });
    }
    return result;
  }
  // Sorted siblings in catDraft under a given parent (parentId === null
  // for top-level). Reused by chip-layer rendering and by the eligible-
  // parents helper. Sort: order field then label localeCompare.
  function _draftSiblingsSorted(kind, parentId) {
    return (catDraft[kind] || [])
      .filter((c) => (c.parentId || null) === (parentId || null))
      .slice()
      .sort((a, b) => ((a.order || 0) - (b.order || 0)) || a.label.localeCompare(b.label, 'zh-CN'));
  }
  // Hidden inheritance: a chip is "hidden in chain" if itself or any
  // ancestor has hidden=true. Drives the small red dot indicator on chips,
  // matching home filter chips (.chip-hidden-dot).
  function _isHiddenInChain(kind, id) {
    let cur = (catDraft[kind] || []).find((c) => c.id === id);
    let steps = 0;
    while (cur && steps < ADMIN_MAX_DEPTH + 1) {
      if (cur.hidden) return true;
      if (!cur.parentId) break;
      cur = (catDraft[kind] || []).find((c) => c.id === cur.parentId);
      steps++;
    }
    return false;
  }
  // Compute layered chip rows from catDraft + catSelection. Mirrors home
  // applyKindUI's revealLevels: level 0 = all top-level chips; level i+1
  // = sorted-children of every chip at level i that's currently in the
  // selection set. Stops early when a level has no parents in selection.
  function _computeRevealLevels(kind) {
    const levels = [];
    const top = _draftSiblingsSorted(kind, null);
    levels.push(top);
    for (let i = 0; i < ADMIN_MAX_DEPTH - 1; i++) {
      const parents = levels[i].filter((c) => catSelection[kind].has(c.id));
      if (parents.length === 0) break;
      const children = [];
      for (const p of parents) {
        for (const c of _draftSiblingsSorted(kind, p.id)) children.push(c);
      }
      if (children.length === 0) break;
      levels.push(children);
    }
    return levels;
  }
  // Resolve which parent the row-end "+ 新建" button should attach the
  // new chip to. Layer 0 (top row) → null. Deeper layers → activeEditId
  // when it's in the upper-layer selection (the natural "I'm editing X,
  // add a sibling under X's selected sibling") otherwise the first
  // selected chip in the upper layer (sorted order). Returns null when
  // no parent in upper layer is selected (shouldn't happen since the
  // layer wouldn't render).
  function _addParentForLayer(kind, layerIdx, levels) {
    if (layerIdx === 0) return null;
    const upper = levels[layerIdx - 1] || [];
    const sel = catSelection[kind];
    const activeId = catActiveEditId[kind];
    if (activeId && upper.some((c) => c.id === activeId) && sel.has(activeId)) {
      return activeId;
    }
    const firstSel = upper.find((c) => sel.has(c.id));
    return firstSel ? firstSel.id : null;
  }
  // Set the entire selection chain to the ancestor path of leafId,
  // dropping any prior selection entries that aren't on this chain,
  // and pin leafId as the active editing target. Used after creating
  // a new chip, after parent changes, and after search-result jumps —
  // all three are "I want to land on this exact chip and edit it",
  // which under the single-active-per-layer invariant means the
  // selection must be exactly the chain leading to it (no stragglers
  // from a previous drilldown).
  function _setActiveChain(kind, leafId) {
    if (!leafId) return;
    const chain = new Set();
    let cur = (catDraft[kind] || []).find((c) => c.id === leafId);
    let steps = 0;
    while (cur && steps < ADMIN_MAX_DEPTH + 1) {
      chain.add(cur.id);
      if (!cur.parentId) break;
      cur = (catDraft[kind] || []).find((c) => c.id === cur.parentId);
      steps++;
    }
    const sel = catSelection[kind];
    const toRemove = [];
    for (const sid of sel) if (!chain.has(sid)) toRemove.push(sid);
    for (const sid of toRemove) sel.delete(sid);
    for (const cid of chain) sel.add(cid);
    catActiveEditId[kind] = leafId;
    persistCatSelection();
    persistCatActiveEdit();
  }
  // After "保存分类" sanitize the selection / active sets to only contain
  // ids that survived (sanitize on the server may have promoted broken
  // parent links to top-level, so the ids themselves usually stay; this
  // is more of a guard against deleted-then-saved edge cases).
  function _cleanupSelectionToValid() {
    for (const kind of ADMIN_KIND_LIST) {
      const validIds = new Set((catDraft[kind] || []).map((c) => c.id));
      const oldSel = catSelection[kind] || new Set();
      const newSel = new Set();
      for (const id of oldSel) if (validIds.has(id)) newSel.add(id);
      catSelection[kind] = newSel;
      if (catActiveEditId[kind] && !validIds.has(catActiveEditId[kind])) {
        catActiveEditId[kind] = null;
      }
    }
    persistCatSelection();
    persistCatActiveEdit();
  }

  // ---- Chip-layer + edit-panel rendering (per-kind) ------------------
  function renderCategoryEditorFor(kind) {
    const editor = document.querySelector(`.category-editor[data-cat-kind="${kind}"]`);
    if (!editor) return;
    const stack = editor.querySelector('.cat-layer-stack');
    const editPanel = editor.querySelector('.cat-edit-panel');
    const editEmpty = editor.querySelector('.cat-edit-empty');
    const searchResults = editor.querySelector('.cat-search-results');
    if (!stack || !editPanel || !editEmpty || !searchResults) return;

    // Filter mode: q non-empty → flat search results, hide everything else.
    // Filter only applies to the currently visible kind (active sub-tab);
    // other kinds keep their last layer-stack render even while q non-empty.
    const q = (catFilterQuery || '').trim();
    if (q && kind === adminCatActiveKind) {
      stack.hidden = true;
      editPanel.hidden = true;
      editEmpty.hidden = true;
      searchResults.hidden = false;
      searchResults.innerHTML = _renderSearchResultsHtml(kind, q);
      _wireSearchResultsEvents(kind, searchResults);
      return;
    }
    searchResults.hidden = true;
    stack.hidden = false;

    // Render layer-stack
    const levels = _computeRevealLevels(kind);
    const sel = catSelection[kind];
    const activeId = catActiveEditId[kind];
    let html = '';
    for (let i = 0; i < levels.length; i++) {
      const layerNum = i + 1;
      const chipsHtml = levels[i].map((c) => {
        const cls = ['cat-chip'];
        if (sel.has(c.id)) cls.push('active');
        if (activeId === c.id) cls.push('editing');
        const isHidden = _isHiddenInChain(kind, c.id);
        const dot = isHidden ? '<span class="cat-chip-hidden-dot" aria-hidden="true">●</span>' : '';
        return `<button type="button" class="${cls.join(' ')}" data-id="${escapeHtml(c.id)}" data-layer="${layerNum}" title="${escapeHtml(c.label)}（${escapeHtml(c.id)}）">${escapeHtml(c.label)}${dot}</button>`;
      }).join('');
      const parentForAdd = _addParentForLayer(kind, i, levels);
      const addLabel = t(i === 0 ? 'admin.cat.layerRow.addTopLabel' : 'admin.cat.layerRow.addChildLabel');
      const parentLabel = parentForAdd
        ? ((catDraft[kind].find((c) => c.id === parentForAdd) || {}).label || parentForAdd)
        : null;
      let addTitle;
      if (i === 0) {
        addTitle = t('admin.cat.layerRow.addTopTitle');
      } else if (parentLabel) {
        addTitle = t('admin.cat.layerRow.addChildTitle', { parent: parentLabel });
      } else {
        addTitle = t('admin.cat.layerRow.addChildTitleNoParent');
      }
      const addBtn = `<button type="button" class="cat-chip-add" data-layer="${layerNum}" data-parent-id="${escapeHtml(parentForAdd || '')}" title="${escapeHtml(addTitle)}">${escapeHtml(addLabel)}</button>`;
      html += `<div class="cat-layer-row" data-layer="${layerNum}" data-kind="${kind}">${chipsHtml}${addBtn}</div>`;
    }
    stack.innerHTML = html;

    // Render edit panel for activeEditId, or show empty hint.
    if (activeId && _draftIdxOf(kind, activeId) >= 0) {
      editEmpty.hidden = true;
      editPanel.hidden = false;
      editPanel.innerHTML = _renderEditPanelHtml(kind, activeId);
      _wireEditPanelEvents(kind, editPanel);
    } else {
      // activeId got stale (e.g. deleted) → clear it.
      if (activeId) {
        catActiveEditId[kind] = null;
        persistCatActiveEdit();
      }
      editPanel.hidden = true;
      editPanel.innerHTML = '';
      editEmpty.hidden = false;
    }
  }
  function renderAllCategoryEditors() {
    for (const kind of ADMIN_KIND_LIST) renderCategoryEditorFor(kind);
  }
  // Backwards-compat alias — some places (loadAdminCategories, save
  // handler, import) used to call renderCategoryLists; keeping the name
  // around as a thin wrapper avoids a sweep.
  function renderCategoryLists() { renderAllCategoryEditors(); }

  /**
   * @brief Render the inline edit panel HTML for a single tag.
   *
   * All visible labels / titles / placeholders go through the i18n
   * dispatcher `t()` so the panel switches language automatically
   * with `applyLang()`. The structure mirrors the pre-1.7.2 hand-
   * written Chinese version exactly; only the text source changed.
   *
   * @param kind Subsystem id ('video' | 'audio' | 'image' | 'novel').
   * @param id   Category id whose row sits in `catDraft[kind]`.
   * @returns innerHTML string for the `.cat-edit-panel` container.
   */
  function _renderEditPanelHtml(kind, id) {
    const c = (catDraft[kind] || []).find((x) => x.id === id);
    if (!c) return '';
    const eligible = _eligibleParents(kind, id);
    const parentOptions = eligible.map((p) =>
      `<option value="${escapeHtml(p.id)}"${(c.parentId || '') === p.id ? ' selected' : ''}>${escapeHtml(p.label)}</option>`
    ).join('');
    const kws = Array.isArray(c.keywords) ? c.keywords : [];
    const kwChips = kws.map((w, ki) =>
      `<span class="cat-kw-chip">${escapeHtml(w)}<button type="button" class="cat-kw-del" data-ki="${ki}" title="${escapeHtml(t('admin.cat.editPanel.closeBtn'))}">×</button></span>`
    ).join('');
    const depth = _draftDepthOf(kind, id);
    const canAddChild = depth < ADMIN_MAX_DEPTH - 1;
    const hasKids = _draftHasChildren(kind, id);
    const path = (typeof clientPathLabel === 'function') ? clientPathLabel(kind, id, ' / ') : c.label;
    const promoteBtn = depth > 0
      ? `<button type="button" class="cat-edit-promote-top icon-btn" title="${escapeHtml(t('admin.cat.editPanel.promoteTopTitle'))}">${escapeHtml(t('admin.cat.editPanel.promoteTopBtn'))}</button>`
      : '';
    const addChildBtn = canAddChild
      ? `<button type="button" class="cat-edit-add-child icon-btn" title="${escapeHtml(t('admin.cat.editPanel.addChildTitle'))}">${escapeHtml(t('admin.cat.editPanel.addChildBtn'))}</button>`
      : '';
    const delTitleKey = hasKids
      ? 'admin.cat.editPanel.deleteTitleDisable'
      : 'admin.cat.editPanel.deleteTitleEnable';
    return `
      <div class="cat-edit-head">
        <span class="cat-edit-title">${escapeHtml(t('admin.cat.editPanel.titlePrefix') + path)}</span>
        <span class="cat-edit-id mono" title="${escapeHtml(t('admin.cat.editPanel.idTitle'))}">${escapeHtml(id)}</span>
        <button type="button" class="cat-edit-close icon-btn" title="${escapeHtml(t('admin.cat.editPanel.closeBtnTitle'))}">${escapeHtml(t('admin.cat.editPanel.closeBtn'))}</button>
      </div>
      <div class="cat-edit-fields">
        <label class="field">
          <span>${escapeHtml(t('admin.cat.editPanel.labelField'))}</span>
          <input type="text" class="cat-edit-label" value="${escapeHtml(c.label)}" maxlength="40">
        </label>
        <label class="cat-edit-hidden-row">
          <input type="checkbox" class="cat-edit-hidden-input" ${c.hidden ? 'checked' : ''}>
          <span>${escapeHtml(t('admin.cat.editPanel.hiddenField'))}</span>
        </label>
        <label class="field">
          <span>${escapeHtml(t('admin.cat.editPanel.parentField'))}</span>
          <select class="cat-edit-parent">${parentOptions}</select>
        </label>
        <div class="cat-edit-actions">
          ${promoteBtn}
          ${addChildBtn}
          <button type="button" class="cat-edit-delete" ${hasKids ? 'disabled' : ''} title="${escapeHtml(t(delTitleKey))}">${escapeHtml(t('admin.cat.editPanel.deleteBtn'))}</button>
        </div>
      </div>
      <div class="cat-edit-keywords-block">
        <div class="cat-kw-label">${escapeHtml(t('admin.cat.editPanel.kwLabel'))}</div>
        <div class="cat-kw-chips">${kwChips}</div>
        <input type="text" class="cat-kw-input" placeholder="${escapeHtml(t('admin.cat.editPanel.kwInputPh'))}" maxlength="60">
      </div>
    `;
  }
  function _wireEditPanelEvents(kind, panel) {
    const id = catActiveEditId[kind];
    if (!id) return;
    const closeBtn = panel.querySelector('.cat-edit-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        catActiveEditId[kind] = null;
        persistCatActiveEdit();
        renderCategoryEditorFor(kind);
      });
    }
    const labelInput = panel.querySelector('.cat-edit-label');
    if (labelInput) {
      labelInput.addEventListener('input', () => {
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        catDraft[kind][i].label = labelInput.value;
        // Live-patch the chip(s) showing this id so admin sees the rename
        // without losing input focus. Only label text changes; structure
        // (active/editing classes, hidden dot) stays unchanged.
        const editor = panel.closest('.category-editor');
        if (editor) {
          const isHidden = _isHiddenInChain(kind, id);
          const dot = isHidden ? '<span class="cat-chip-hidden-dot" aria-hidden="true">●</span>' : '';
          for (const chip of editor.querySelectorAll(`.cat-chip[data-id="${CSS.escape(id)}"]`)) {
            chip.innerHTML = `${escapeHtml(labelInput.value)}${dot}`;
          }
        }
        const titleEl = panel.querySelector('.cat-edit-title');
        if (titleEl && typeof clientPathLabel === 'function') {
          // Recompute path so a renamed ancestor would also show, though
          // we're editing the leaf here so usually only the tail changes.
          titleEl.textContent = '编辑：' + clientPathLabel(kind, id, ' / ');
        }
      });
    }
    const hiddenInput = panel.querySelector('.cat-edit-hidden-input');
    if (hiddenInput) {
      hiddenInput.addEventListener('change', () => {
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        catDraft[kind][i].hidden = hiddenInput.checked;
        // Re-render the kind so chip dots (chain hidden) propagate.
        renderCategoryEditorFor(kind);
        setCatStatus(t('admin.cat.hiddenChanged', { id }), '');
      });
    }
    const parentSel = panel.querySelector('.cat-edit-parent');
    if (parentSel) {
      parentSel.addEventListener('change', () => {
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        const newParent = parentSel.value || null;
        catDraft[kind][i].parentId = newParent;
        // Re-pin the chain to the relocated chip so it stays visible
        // and the editor doesn't drift to a stale selection.
        _setActiveChain(kind, id);
        renderCategoryEditorFor(kind);
        const parent = newParent
          ? ((catDraft[kind].find((c) => c.id === newParent) || {}).label || newParent)
          : t('admin.cat.added.where.top');
        setCatStatus(t('admin.cat.parentChanged', { parent }), '');
      });
    }
    const promoteBtn = panel.querySelector('.cat-edit-promote-top');
    if (promoteBtn) {
      promoteBtn.addEventListener('click', () => {
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        catDraft[kind][i].parentId = null;
        renderCategoryEditorFor(kind);
        setCatStatus(t('admin.cat.promotedTop', { id }), '');
      });
    }
    const addChildBtn = panel.querySelector('.cat-edit-add-child');
    if (addChildBtn) {
      addChildBtn.addEventListener('click', () => openCatAddChildDialog(kind, id));
    }
    const delBtn = panel.querySelector('.cat-edit-delete:not([disabled])');
    if (delBtn) {
      delBtn.addEventListener('click', () => {
        if (_draftHasChildren(kind, id)) {
          setCatStatus(t('admin.cat.deleteHasKidsErr', { id }), 'error');
          return;
        }
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        const removed = catDraft[kind].splice(i, 1)[0];
        catSelection[kind].delete(id);
        catActiveEditId[kind] = null;
        persistCatSelection();
        persistCatActiveEdit();
        renderCategoryEditorFor(kind);
        setCatStatus(t('admin.cat.deleted', { id: removed && removed.id }), '');
      });
    }
    // Keyword chip delete buttons
    for (const btn of panel.querySelectorAll('.cat-kw-del')) {
      btn.addEventListener('click', () => {
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        const ki = Number(btn.dataset.ki);
        const arr = Array.isArray(catDraft[kind][i].keywords) ? catDraft[kind][i].keywords.slice() : [];
        arr.splice(ki, 1);
        catDraft[kind][i].keywords = arr;
        renderCategoryEditorFor(kind);
        setCatStatus(t('admin.cat.kwUpdated'), '');
      });
    }
    const kwInput = panel.querySelector('.cat-kw-input');
    if (kwInput) {
      const commit = (raw) => {
        const i = _draftIdxOf(kind, id);
        if (i < 0) return;
        const arr = Array.isArray(catDraft[kind][i].keywords) ? catDraft[kind][i].keywords.slice() : [];
        for (const part of String(raw).split(/[,，]/)) {
          const w = part.trim();
          if (!w || w.length > 60) continue;
          const wn = _normForMatch(w);
          if (arr.some((x) => _normForMatch(x) === wn)) continue;
          arr.push(w);
        }
        catDraft[kind][i].keywords = arr;
        renderCategoryEditorFor(kind);
        const newInput = document.querySelector(`.category-editor[data-cat-kind="${kind}"] .cat-kw-input`);
        if (newInput) newInput.focus();
        setCatStatus(t('admin.cat.kwUpdated'), '');
      };
      kwInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
          e.preventDefault();
          if (kwInput.value.trim()) commit(kwInput.value);
        } else if (e.key === 'Backspace' && kwInput.value === '') {
          const i = _draftIdxOf(kind, id);
          if (i < 0) return;
          const arr = Array.isArray(catDraft[kind][i].keywords) ? catDraft[kind][i].keywords : [];
          if (arr.length > 0) {
            arr.pop();
            catDraft[kind][i].keywords = arr;
            renderCategoryEditorFor(kind);
            const newInput = document.querySelector(`.category-editor[data-cat-kind="${kind}"] .cat-kw-input`);
            if (newInput) newInput.focus();
            setCatStatus(t('admin.cat.kwUpdated'), '');
          }
        }
      });
      kwInput.addEventListener('blur', () => {
        if (kwInput.value.trim()) commit(kwInput.value);
      });
    }
  }
  // Flat search-results renderer + click handler (filter-active mode).
  function _renderSearchResultsHtml(kind, q) {
    const ql = q.toLowerCase();
    const draft = catDraft[kind] || [];
    const matches = draft.filter((c) => {
      if ((c.label || '').toLowerCase().includes(ql)) return true;
      if (String(c.id || '').toLowerCase().includes(ql)) return true;
      const kws = Array.isArray(c.keywords) ? c.keywords : [];
      for (const w of kws) if (String(w).toLowerCase().includes(ql)) return true;
      return false;
    });
    if (matches.length === 0) {
      return `<div class="cat-search-empty">${escapeHtml(t('admin.cat.searchEmpty'))}</div>`;
    }
    return matches.map((c) => {
      const path = (typeof clientPathLabel === 'function') ? clientPathLabel(kind, c.id, ' / ') : c.label;
      const isHidden = _isHiddenInChain(kind, c.id);
      const dot = isHidden ? '<span class="cat-chip-hidden-dot" aria-hidden="true">●</span>' : '';
      return `<button type="button" class="cat-search-item" data-id="${escapeHtml(c.id)}" title="点击进入编辑">
        <span class="path-label">${escapeHtml(path)}${dot}</span>
        <span class="kind-tag mono">${escapeHtml(c.id)}</span>
      </button>`;
    }).join('');
  }
  function _wireSearchResultsEvents(kind, container) {
    for (const btn of container.querySelectorAll('.cat-search-item')) {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        _setActiveChain(kind, id);
        // Clear filter and return to layer view.
        catFilterQuery = '';
        const inp = document.getElementById('cat-filter-input');
        if (inp) inp.value = '';
        renderCategoryEditorFor(kind);
      });
    }
  }
  // Drop every selection entry whose depth ≥ the given depth. Used by
  // chip click to enforce the "single-active per layer" invariant: a
  // new selection at layer N invalidates any prior selection at the
  // same or deeper layers (those deeper chips were only visible because
  // their parents were selected; replacing the parent collapses them).
  function _trimSelectionAtDepth(kind, depth) {
    const sel = catSelection[kind];
    const toRemove = [];
    for (const sid of sel) {
      if (_draftDepthOf(kind, sid) >= depth) toRemove.push(sid);
    }
    for (const sid of toRemove) sel.delete(sid);
  }
  // Chip click: single-active-per-layer drilldown (NOT a toggle filter).
  // Admin doesn't have a typeOp / OR-AND-NOT semantic to differentiate
  // "expand multiple parents" from "edit X" — so a click on chip X is
  // unambiguously "I want to edit X (and as a side-effect, see X's
  // children below)". Concretely: trim selection at X's depth and
  // deeper, then add X. Re-clicking the active chip exits editing
  // (trim only, no re-add).
  function _handleCatChipClick(kind, chip) {
    const id = chip.dataset.id;
    const isActive = catActiveEditId[kind] === id;
    const depth = _draftDepthOf(kind, id);
    _trimSelectionAtDepth(kind, depth);
    if (isActive) {
      catActiveEditId[kind] = null;
    } else {
      catSelection[kind].add(id);
      catActiveEditId[kind] = id;
    }
    persistCatSelection();
    persistCatActiveEdit();
    renderCategoryEditorFor(kind);
  }
  function _handleCatChipAddClick(kind, addBtn) {
    const parentId = addBtn.dataset.parentId || null;
    openCatAddChildDialog(kind, parentId);
  }
  function setCatStatus(msg, cls) {
    const s = document.getElementById('cat-save-status');
    if (!s) return;
    s.textContent = msg;
    s.classList.remove('ok', 'error');
    if (cls) s.classList.add(cls);
  }
  // Quick "add child tag" dialog — invoked by each chip-row's "+ 新建"
  // button (chip-add) and the edit panel's "+ 子" shortcut. parentId
  // null is allowed and means "create a top-level chip".
  function openCatAddChildDialog(kind, parentId) {
    const dlg = document.getElementById('cat-add-child-dialog');
    if (!dlg) return;
    const idInput = document.getElementById('cat-add-child-id');
    const labelInput = document.getElementById('cat-add-child-label');
    const errEl = document.getElementById('cat-add-child-error');
    const subtitle = document.getElementById('cat-add-child-subtitle');
    let parentDesc;
    if (parentId) {
      const parent = (catDraft[kind] || []).find((c) => c.id === parentId);
      const parentLabel = parent ? parent.label : parentId;
      parentDesc = parentLabel + '（' + parentId + '）';
    } else {
      parentDesc = t('admin.cat.dialog.parentTop');
    }
    if (subtitle) subtitle.textContent = t('admin.cat.dialog.subtitle', { parent: parentDesc, kind });
    if (idInput) idInput.value = '';
    if (labelInput) labelInput.value = '';
    if (errEl) errEl.textContent = '';
    dlg.dataset.kind = kind;
    dlg.dataset.parentId = parentId || '';
    if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    // Defer focus until after showModal layout settles, otherwise some
    // browsers leave focus on the most-recent body element.
    setTimeout(() => { if (idInput) idInput.focus(); }, 0);
  }
  const catAddChildDialog = document.getElementById('cat-add-child-dialog');
  if (catAddChildDialog) {
    const form = document.getElementById('cat-add-child-form');
    const cancel = document.getElementById('cat-add-child-cancel');
    const errEl = document.getElementById('cat-add-child-error');
    if (cancel) {
      cancel.addEventListener('click', () => {
        if (typeof catAddChildDialog.close === 'function') catAddChildDialog.close();
        else catAddChildDialog.removeAttribute('open');
      });
    }
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const kind = catAddChildDialog.dataset.kind;
        // dataset.parentId === '' (set by openCatAddChildDialog when
        // parentId was null) collapses to null via || coercion below.
        const parentId = catAddChildDialog.dataset.parentId || null;
        const id = (document.getElementById('cat-add-child-id').value || '').trim();
        const label = (document.getElementById('cat-add-child-label').value || '').trim();
        const showErr = (msg) => { if (errEl) errEl.textContent = msg; };
        if (!id || !label) { showErr(t('admin.cat.dialog.errEmpty')); return; }
        if (!/^[a-zA-Z0-9_\-]+$/.test(id)) { showErr(t('admin.cat.dialog.errIdBadChar')); return; }
        if (id.length > 40 || label.length > 40) { showErr(t('admin.cat.dialog.errTooLong')); return; }
        if (!Array.isArray(catDraft[kind])) { showErr(t('admin.cat.dialog.errBadKind', { kind })); return; }
        if (catDraft[kind].some((c) => c.id === id)) { showErr(t('admin.cat.dialog.errIdExists')); return; }
        if (parentId && typeof _draftDepthOf === 'function') {
          const pDepth = _draftDepthOf(kind, parentId);
          if (pDepth + 1 > ADMIN_MAX_DEPTH - 1) { showErr(t('admin.cat.dialog.errDepth')); return; }
        }
        catDraft[kind].push({ id, label, parentId, hidden: false, keywords: [] });
        // Pin the active chain to the new chip so it's immediately
        // visible in the layer stack and the edit panel locks onto it.
        _setActiveChain(kind, id);
        if (typeof catAddChildDialog.close === 'function') catAddChildDialog.close();
        else catAddChildDialog.removeAttribute('open');
        renderCategoryEditorFor(kind);
        const where = parentId
          ? ((catDraft[kind].find((c) => c.id === parentId) || {}).label || parentId)
          : t('admin.cat.added.where.top');
        setCatStatus(t('admin.cat.added', { id, where }), '');
      });
    }
  }
  // Editor-wide click delegate: cat-sort-btn (per-kind A→Z resort), chip
  // toggle (cat-chip), and chip-add (row-end "+ 新建"). The HTML "footer
  // add-row" of 1.6.x has been removed entirely (its function migrated
  // to the layer-1 chip-add button).
  document.addEventListener('click', (e) => {
    const sortBtn = e.target.closest('.cat-sort-btn');
    if (sortBtn) {
      const kind = sortBtn.dataset.kind;
      if (Array.isArray(catDraft[kind])) {
        catDraft[kind].sort((a, b) => a.label.localeCompare(b.label, 'zh-CN'));
        renderCategoryEditorFor(kind);
        setCatStatus(t('admin.cat.sorted'), '');
      }
      return;
    }
    const chip = e.target.closest('.cat-chip[data-id]');
    if (chip) {
      const editor = chip.closest('.category-editor[data-cat-kind]');
      if (editor) _handleCatChipClick(editor.dataset.catKind, chip);
      return;
    }
    const addBtn = e.target.closest('.cat-chip-add');
    if (addBtn) {
      const editor = addBtn.closest('.category-editor[data-cat-kind]');
      if (editor) _handleCatChipAddClick(editor.dataset.catKind, addBtn);
      return;
    }
  });
  const catSaveBtn = document.getElementById('cat-save-btn');
  const catResetBtn = document.getElementById('cat-reset-btn');
  if (catSaveBtn) {
    catSaveBtn.addEventListener('click', async () => {
      setCatStatus(t('admin.cat.saving'), '');
      try {
        const res = await api('PUT', '/api/admin/categories', catDraft);
        state.categories = res.categories;
        catDraft = deepCopyCatMap(res.categories);
        // Sanitize selection / active sets (sanitize on the server may
        // have dropped or moved entries).
        _cleanupSelectionToValid();
        renderAllCategoryEditors();
        setCatStatus(t('admin.cat.saved'), 'ok');
        // Repaint the home filter chips / dropdowns with the new labels.
        applyKindUI();
        toast(t('admin.cat.savedToast'), 'success');
      } catch (err) {
        setCatStatus(t('admin.cat.saveFailed', { msg: err.message }), 'error');
      }
    });
  }
  if (catResetBtn) {
    catResetBtn.addEventListener('click', () => loadAdminCategories());
  }
  // Filter input toolbar — toggles the active kind's editor between
  // chip-layer view and the flat search-results list.
  const catFilterInput = document.getElementById('cat-filter-input');
  if (catFilterInput) {
    let filterDebounce = null;
    catFilterInput.addEventListener('input', () => {
      catFilterQuery = catFilterInput.value || '';
      clearTimeout(filterDebounce);
      filterDebounce = setTimeout(() => renderCategoryEditorFor(adminCatActiveKind), 120);
    });
  }
  // Sub-tab buttons (一 tab 一 kind). The four .category-editor blocks
  // are always in the DOM but only the active one is visible. Switching
  // re-renders the new kind's editor so any catDraft mutations (e.g.
  // an import that touched this kind while another was active) are
  // reflected; cheap enough to do unconditionally.
  for (const btn of document.querySelectorAll('.cat-kind-tab')) {
    btn.addEventListener('click', () => {
      const k = btn.dataset.catKind;
      if (!k || k === adminCatActiveKind) return;
      setAdminCatActiveKind(k);
      renderCategoryEditorFor(k);
    });
  }
  // Restore active kind on boot now that DOM is wired up.
  setAdminCatActiveKind(adminCatActiveKind);
  // ---- Config export / import (currently: categories only) ----------
  // Export pulls the current draft (so unsaved edits aren't lost) and
  // serialises it with a small envelope that flags schema version + the
  // sections present. Future iterations can add { users, settings }
  // alongside `categories`; the `version` field lets import refuse
  // unfamiliar shapes rather than silently dropping data.
  const catExportBtn = document.getElementById('cat-export-btn');
  const catImportBtn = document.getElementById('cat-import-btn');
  const catImportFile = document.getElementById('cat-import-file');
  if (catExportBtn) {
    catExportBtn.addEventListener('click', () => {
      const envelope = {
        type: 'ds124-config',
        version: 1,
        exportedAt: new Date().toISOString(),
        sections: ['categories'],
        categories: catDraft,
      };
      const json = JSON.stringify(envelope, null, 2);
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.download = `ds124-config-${ts}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      // Revoke a tick later so the click has time to fire on slow
      // browsers (Safari has been observed dropping the download if the
      // URL is revoked synchronously).
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      toast('已导出配置 JSON', 'success');
    });
  }
  if (catImportBtn && catImportFile) {
    catImportBtn.addEventListener('click', () => catImportFile.click());
    catImportFile.addEventListener('change', async () => {
      const file = catImportFile.files && catImportFile.files[0];
      if (!file) return;
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        // Accept either the full envelope or a bare `{ video: [...], ... }`
        // categories map (the same shape PUT /api/admin/categories takes),
        // so power-users can hand-edit a minimal file.
        let cats = null;
        if (data && typeof data === 'object') {
          if (data.categories && typeof data.categories === 'object') {
            if (data.type && data.type !== 'ds124-config') {
              throw new Error('文件 type 字段不是 ds124-config');
            }
            if (data.version && data.version > 1) {
              throw new Error('不支持的配置版本: ' + data.version);
            }
            cats = data.categories;
          } else if (Array.isArray(data.video) || Array.isArray(data.audio) || Array.isArray(data.image) || Array.isArray(data.novel)) {
            cats = data;
          }
        }
        if (!cats) throw new Error('JSON 内容里找不到 categories');
        // Validate every entry has the required shape; reject the whole
        // import on the first bad row rather than silently dropping it.
        for (const k of Object.keys(cats)) {
          if (!Array.isArray(cats[k])) throw new Error('字段 ' + k + ' 不是数组');
          for (const c of cats[k]) {
            if (!c || typeof c !== 'object') throw new Error(k + ' 内有非对象条目');
            if (typeof c.id !== 'string' || !c.id) throw new Error(k + ' 内某条目缺少 id');
            if (typeof c.label !== 'string') throw new Error(k + ' 条目「' + c.id + '」缺少 label');
          }
        }
        const ok = await confirmBox(
          `导入将覆盖当前分类草稿（${Object.keys(cats).map((k) => k + ':' + (cats[k] || []).length).join(', ')}）。点保存按钮才会真正写入服务器。继续？`,
          'IMPORT CATEGORIES'
        );
        if (!ok) return;
        catDraft = deepCopyCatMap(cats);
        renderCategoryLists();
        setCatStatus('已载入导入草稿，点「保存分类」写入服务器', 'ok');
        toast('已导入配置', 'success');
      } catch (e) {
        toast('导入失败: ' + (e && e.message ? e.message : e), 'error');
      } finally {
        // Reset the file input so re-selecting the same file fires a
        // fresh "change" — without this the second import is silently
        // ignored.
        catImportFile.value = '';
      }
    });
  }

  // ----- Admin: duplicate-collection check -----
  // Cross-kind helper: builds a URL prefixed by an explicit kind so the
  // duplicates panel can edit/delete in any subsystem regardless of the
  // user's current state.kind.
  function kindFetch(kind, method, path, body) {
    let url = path;
    if (kind !== 'video' && path.startsWith('/api/') && !SHARED_PREFIXES.some((sp) => path.startsWith(sp))) {
      url = '/' + kind + path;
    }
    const opts = { method, credentials: 'same-origin', headers: {} };
    if (body != null) {
      opts.headers['Content-Type'] = 'application/json';
      opts.body = JSON.stringify(body);
    }
    return fetch(url, opts).then(async (res) => {
      if (res.status === 204) return null;
      let data = null;
      try { data = await res.json(); } catch (e) { data = {}; }
      if (!res.ok) {
        const err = new Error(data.error || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    });
  }
  const dupState = { kind: 'video', mode: 'suspect', threshold: 70 };
  const KIND_LABELS = { video: '视频', audio: '音频', image: '图片', novel: '小说' };
  function setDupStatus(msg, cls) {
    const el = document.getElementById('dup-status');
    if (!el) return;
    el.textContent = msg;
    el.classList.remove('ok', 'error');
    if (cls) el.classList.add(cls);
  }
  async function loadAdminDuplicates() {
    const params = new URLSearchParams({
      kind: dupState.kind,
      mode: dupState.mode,
      threshold: String(dupState.threshold / 100),
    });
    const out = document.getElementById('dup-results');
    if (out) out.innerHTML = '<div class="cards-status">扫描中...</div>';
    setDupStatus('扫描中...', '');
    try {
      const data = await api('GET', '/api/admin/duplicates?' + params.toString());
      renderDuplicates(data);
    } catch (e) {
      if (out) out.innerHTML = '<div class="cards-status">加载失败：' + escapeHtml(e.message) + '</div>';
      setDupStatus('失败', 'error');
    }
  }
  function renderDuplicates(data) {
    const out = document.getElementById('dup-results');
    if (!out) return;
    const groups = (data && data.groups) || [];
    setDupStatus(`${KIND_LABELS[dupState.kind] || dupState.kind} · 扫描 ${data.total} 项 · 命中 ${groups.length} 组`, 'ok');
    if (groups.length === 0) {
      out.innerHTML = '<div class="cards-status">未发现重复嫌疑。</div>';
      return;
    }
    // 1.1.0+: show full path label "魔法少女 / 叛逆" so admins can tell
    // which subtree a tag belongs to when looking at duplicate groups.
    const labelOf = (id) => clientPathLabel(dupState.kind, id) || id;
    out.innerHTML = groups.map((g, gi) => {
      const score = Math.round((g.topScore || 0) * 100);
      const rows = g.collections.map((c) => {
        const types = (c.types || []).map((t) => `<span class="dup-type">${escapeHtml(labelOf(t))}</span>`).join('');
        return `
          <tr data-id="${escapeHtml(c.id)}">
            <td class="dup-pick"><input type="checkbox" class="dup-row-check" aria-label="选中以加入白名单"></td>
            <td class="dup-title">${escapeHtml(c.title)}${c.hidden ? ' <span class="dup-tag">已隐藏</span>' : ''}</td>
            <td class="dup-types">${types}</td>
            <td class="mono">${c.episodeCount}</td>
            <td class="mono">${formatSize(c.totalSize)}</td>
            <td class="dup-row-actions">
              <button type="button" class="icon-btn dup-edit-btn">编辑</button>
              <button type="button" class="icon-btn dup-open-btn">打开</button>
              <button type="button" class="icon-btn dup-del-btn">删除</button>
            </td>
          </tr>`;
      }).join('');
      return `
        <div class="dup-group" data-gi="${gi}">
          <div class="dup-group-head">
            <span class="dup-group-title">组 #${gi + 1}</span>
            <span class="dup-group-score mono">最高相同率 ${score}%</span>
          </div>
          <table class="admin-table dup-table">
            <thead><tr><th></th><th>标题</th><th>标签</th><th>${countUnit(dupState.kind)}数</th><th>体积</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }).join('');
    // Wire row checkboxes — keep the "标为非重复" button enabled only
    // when exactly two boxes are checked across all groups.
    out.querySelectorAll('.dup-row-check').forEach((cb) => {
      cb.addEventListener('change', updateDupMarkBtnState);
    });
    updateDupMarkBtnState();
    // Wire row-level actions, scoped to the kind that produced this scan.
    const scanKind = dupState.kind;
    out.querySelectorAll('.dup-edit-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const id = btn.closest('tr').dataset.id;
        try {
          const { collection } = await kindFetch(scanKind, 'GET', '/api/collections/' + encodeURIComponent(id));
          // Edit dialog reads state.kind for kind-specific UI bits (audio
          // resume mode). Sync state.kind to the scan kind so the dialog
          // renders the right options.
          if (state.kind !== scanKind) {
            state.kind = scanKind;
            try { localStorage.setItem(KIND_KEY, scanKind); } catch (_e) {}
            applyKindUI();
          }
          openEditDialog(collection);
        } catch (e) {
          toast('加载合集失败: ' + e.message, 'error');
        }
      });
    });
    out.querySelectorAll('.dup-open-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const id = btn.closest('tr').dataset.id;
        // Open the collection in a NEW tab instead of navigating in place,
        // so the admin keeps the duplicate scan open for comparison.
        // Collection ids are kind-scoped and a freshly-booted tab reads the
        // active subsystem from KIND_KEY, so persist the scan's kind first.
        // We intentionally leave this tab's state.kind / UI untouched — only
        // the new tab should switch subsystems.
        try { localStorage.setItem(KIND_KEY, scanKind); } catch (_e) {}
        const url = new URL(location.href);
        url.hash = '#/c/' + encodeURIComponent(id);
        window.open(url.href, '_blank', 'noopener');
      });
    });
    out.querySelectorAll('.dup-del-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const tr = btn.closest('tr');
        const id = tr.dataset.id;
        const ok = await confirmBox(`删除合集「${id}」将连同其媒体文件一并永久删除，不可撤销。确定？`, 'DELETE COLLECTION');
        if (!ok) return;
        try {
          // force=1 is required: collections in a duplicate scan always have
          // media files, and the server rejects deleting a non-empty
          // collection unless forced (E_COLLECTION_NOT_EMPTY). Matches the
          // bulk-delete path. Without it this delete always failed silently.
          await kindFetch(scanKind, 'DELETE', '/api/collections/' + encodeURIComponent(id) + '?force=1');
          toast('已删除 ' + id);
          loadAdminDuplicates();
        } catch (e) {
          toast('删除失败: ' + e.message, 'error');
        }
      });
    });
  }
  document.addEventListener('click', (e) => {
    const kindBtn = e.target.closest('.dup-kind-btn');
    if (kindBtn) {
      dupState.kind = kindBtn.dataset.dupKind;
      for (const b of document.querySelectorAll('.dup-kind-btn')) {
        b.classList.toggle('active', b === kindBtn);
      }
      loadAdminDuplicates();
    }
  });
  document.addEventListener('change', (e) => {
    if (e.target && e.target.name === 'dup-mode') {
      dupState.mode = e.target.value;
      const row = document.querySelector('.dup-threshold-row');
      if (row) row.hidden = dupState.mode !== 'similarity';
      loadAdminDuplicates();
    }
  });
  const dupRefreshBtn = document.getElementById('dup-refresh-btn');
  if (dupRefreshBtn) dupRefreshBtn.addEventListener('click', () => loadAdminDuplicates());
  function getCheckedDupIds() {
    return Array.from(document.querySelectorAll('#dup-results .dup-row-check:checked'))
      .map((cb) => cb.closest('tr').dataset.id);
  }
  function updateDupMarkBtnState() {
    const btn = document.getElementById('dup-mark-btn');
    if (!btn) return;
    // At least 2 must be checked. Selecting N items whitelists every pair
    // among them — C(N,2) = N*(N-1)/2 pairs — so the button advertises how
    // many pairs the current selection will produce.
    const n = getCheckedDupIds().length;
    const pairs = n >= 2 ? (n * (n - 1)) / 2 : 0;
    btn.disabled = (n < 2);
    btn.textContent = n >= 2
      ? `标为非重复（选中 ${n} 项 → ${pairs} 对）`
      : `标为非重复（至少选 2 项${n ? '，已选 ' + n : ''}）`;
  }
  const dupMarkBtn = document.getElementById('dup-mark-btn');
  if (dupMarkBtn) {
    dupMarkBtn.addEventListener('click', async () => {
      const picked = getCheckedDupIds();
      if (picked.length < 2) return;
      const pairs = (picked.length * (picked.length - 1)) / 2;
      try {
        // Send the whole set; the server forms every pair in one atomic write.
        await api('POST', '/api/admin/duplicates/whitelist', { kind: dupState.kind, ids: picked });
        toast(`已加入白名单：${picked.length} 项 / ${pairs} 对组合`, 'success');
        loadAdminDuplicates();
      } catch (e) {
        toast('加入失败: ' + e.message, 'error');
      }
    });
  }
  const dupWhitelistBtn = document.getElementById('dup-whitelist-btn');
  const dupWhitelistDialog = document.getElementById('dup-whitelist-dialog');
  const dupWhitelistClose = document.getElementById('dup-whitelist-close');
  async function openDupWhitelistDialog() {
    if (!dupWhitelistDialog) return;
    const subtitle = document.getElementById('dup-whitelist-subtitle');
    const list = document.getElementById('dup-whitelist-list');
    if (subtitle) subtitle.textContent = `板块：${KIND_LABELS[dupState.kind] || dupState.kind} · 加载中...`;
    if (list) list.innerHTML = '';
    dupWhitelistDialog.showModal();
    try {
      const data = await api('GET', '/api/admin/duplicates/whitelist?kind=' + encodeURIComponent(dupState.kind));
      renderDupWhitelist(data);
    } catch (e) {
      if (subtitle) subtitle.textContent = '加载失败：' + e.message;
    }
  }
  function renderDupWhitelist(data) {
    const subtitle = document.getElementById('dup-whitelist-subtitle');
    const list = document.getElementById('dup-whitelist-list');
    const pairs = (data && data.pairs) || [];
    if (subtitle) subtitle.textContent = `板块：${KIND_LABELS[dupState.kind] || dupState.kind} · 共 ${pairs.length} 对`;
    if (!list) return;
    if (pairs.length === 0) {
      list.innerHTML = '<div class="cards-status">白名单为空。</div>';
      return;
    }
    list.innerHTML = pairs.map((p, i) => {
      const labelA = p.titleA == null
        ? `<span class="dup-wl-dead">${escapeHtml(p.a)}（已不存在）</span>`
        : escapeHtml(p.titleA);
      const labelB = p.titleB == null
        ? `<span class="dup-wl-dead">${escapeHtml(p.b)}（已不存在）</span>`
        : escapeHtml(p.titleB);
      return `
        <div class="dup-wl-row" data-i="${i}" data-a="${escapeHtml(p.a)}" data-b="${escapeHtml(p.b)}">
          <div class="dup-wl-pair">
            <div>${labelA}</div>
            <div class="mono dup-wl-vs">≠</div>
            <div>${labelB}</div>
          </div>
          <button type="button" class="icon-btn dup-wl-remove">解除</button>
        </div>`;
    }).join('');
    list.querySelectorAll('.dup-wl-remove').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('.dup-wl-row');
        const a = row.dataset.a;
        const b = row.dataset.b;
        try {
          await api('DELETE', '/api/admin/duplicates/whitelist?'
            + 'kind=' + encodeURIComponent(dupState.kind)
            + '&a=' + encodeURIComponent(a)
            + '&b=' + encodeURIComponent(b));
          toast('已解除', 'success');
          // Refresh dialog content + main results.
          const data2 = await api('GET', '/api/admin/duplicates/whitelist?kind=' + encodeURIComponent(dupState.kind));
          renderDupWhitelist(data2);
          loadAdminDuplicates();
        } catch (e) {
          toast('解除失败: ' + e.message, 'error');
        }
      });
    });
  }
  if (dupWhitelistBtn) dupWhitelistBtn.addEventListener('click', openDupWhitelistDialog);
  if (dupWhitelistClose) dupWhitelistClose.addEventListener('click', () => dupWhitelistDialog.close());
  const dupThreshInput = document.getElementById('dup-threshold');
  const dupThreshOut = document.getElementById('dup-threshold-out');
  if (dupThreshInput) {
    let t = null;
    dupThreshInput.addEventListener('input', () => {
      dupState.threshold = Number(dupThreshInput.value);
      if (dupThreshOut) dupThreshOut.textContent = dupState.threshold + '%';
      clearTimeout(t);
      t = setTimeout(() => { if (dupState.mode === 'similarity') loadAdminDuplicates(); }, 250);
    });
  }

  let adminUsersCache = [];
  async function loadAdminUsers() {
    adminUsersBody.innerHTML = '<tr><td colspan="4" class="cards-status">加载中...</td></tr>';
    try {
      const { users } = await api('GET', '/api/admin/users');
      adminUsersCache = users;
      adminUsersBody.innerHTML = users.map((u) => {
        const vc = u.visibleCategories || {};
        let vcount = 0;
        for (const k of Object.keys(vc)) vcount += (Array.isArray(vc[k]) ? vc[k].length : 0);
        const vcLabel = vcount === 0 ? '全部' : (vcount + ' 项');
        // Permission summary: admin = "全开", others = count of granted perms.
        const perms = u.permissions || {};
        let pcount = 0;
        for (const k of ['upload','create','modify','delete']) if (perms[k]) pcount++;
        const permLabel = u.role === 'admin' ? '全开' : (pcount === 0 ? '无' : (pcount + '/4'));
        return `
        <tr data-username="${escapeHtml(u.username)}">
          <td class="mono">${escapeHtml(u.username)}</td>
          <td class="mono">${escapeHtml(u.role)}</td>
          <td class="mono">${new Date(u.createdAt).toLocaleString()}</td>
          <td class="admin-user-actions">
            <button type="button" class="icon-btn admin-visible-btn" title="可见分类">可见: ${vcLabel}</button>
            <button type="button" class="icon-btn admin-perms-btn" title="操作权限" ${u.role === 'admin' ? 'disabled' : ''}>权限: ${permLabel}</button>
            <button type="button" class="icon-btn admin-del-btn" ${u.username === state.user.username ? 'disabled' : ''}>删除</button>
          </td>
        </tr>`;
      }).join('');
      for (const btn of adminUsersBody.querySelectorAll('.admin-del-btn')) {
        btn.addEventListener('click', async () => {
          const row = btn.closest('tr');
          const un = row.dataset.username;
          const ok = await confirmBox(`删除用户 ${un}？其评论、收藏、进度将一并清空。`, 'DELETE USER');
          if (!ok) return;
          try {
            await api('DELETE', '/api/admin/users/' + encodeURIComponent(un));
            loadAdminUsers();
            toast('已删除 ' + un);
          } catch (err) { toast('删除失败: ' + err.message, 'error'); }
        });
      }
      for (const btn of adminUsersBody.querySelectorAll('.admin-visible-btn')) {
        btn.addEventListener('click', () => {
          const row = btn.closest('tr');
          const un = row.dataset.username;
          const u = adminUsersCache.find((x) => x.username === un);
          openVisibleCategoriesDialog(u);
        });
      }
      for (const btn of adminUsersBody.querySelectorAll('.admin-perms-btn')) {
        btn.addEventListener('click', () => {
          const row = btn.closest('tr');
          const un = row.dataset.username;
          const u = adminUsersCache.find((x) => x.username === un);
          openUserPermsDialog(u);
        });
      }
    } catch (err) {
      adminUsersBody.innerHTML = `<tr><td colspan="4" class="cards-status error">加载失败: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  // ----- Visible-categories dialog -----
  function openVisibleCategoriesDialog(user) {
    if (!user) return;
    const dialog = document.getElementById('visible-cats-dialog');
    const body = document.getElementById('visible-cats-body');
    const userEl = document.getElementById('visible-cats-user');
    if (!dialog || !body) return;
    userEl.textContent = user.username;
    const KIND_LABELS = { video: '视频', audio: '音频', image: '图片', novel: '小说' };
    const allKinds = Object.keys(state.categories || {});
    const vc = user.visibleCategories || {};
    // 1.1.0+: render in tree DFS order with depth indent. Parent and child
    // checkboxes are independent — granting a parent automatically opens
    // the entire subtree at runtime (server expandGrant); granting only a
    // child does NOT up-propagate (admin can give narrow access).
    const sections = allKinds.map((kind) => {
      const flat = clientFlattenTree(clientGetTree(kind));
      const allowed = new Set(Array.isArray(vc[kind]) ? vc[kind] : []);
      const items = flat.map((c) => {
        const isChecked = allowed.has(c.id);
        const depth = c.depth || 0;
        const indent = depth > 0 ? '<span class="vc-indent" aria-hidden="true">└</span>' : '';
        return `<label class="vc-row" data-depth="${depth}">
          <input type="checkbox" data-kind="${kind}" data-id="${escapeHtml(c.id)}" ${isChecked ? 'checked' : ''}>
          ${indent}<span>${escapeHtml(c.label)}</span>
          <span class="mono vc-id">${escapeHtml(c.id)}</span>
        </label>`;
      }).join('');
      return `<div class="vc-section">
        <div class="section-label">// ${escapeHtml(KIND_LABELS[kind] || kind)}</div>
        ${items || '<div class="mono" style="color:var(--text-dim)">没有分类</div>'}
      </div>`;
    }).join('');
    body.innerHTML = sections + '<div class="mono" style="color:var(--text-dim);margin-top:12px">空选 = 该子系统全部可见（无白名单）<br>勾选父标签 = 自动开放整个子树</div>';
    dialog.showModal();

    const save = document.getElementById('visible-cats-save');
    const cancel = document.getElementById('visible-cats-cancel');
    const onSave = async () => {
      const next = {};
      for (const k of allKinds) next[k] = [];
      for (const cb of body.querySelectorAll('input[type="checkbox"]')) {
        if (cb.checked && next[cb.dataset.kind]) next[cb.dataset.kind].push(cb.dataset.id);
      }
      try {
        await api('POST',
          '/api/admin/users/' + encodeURIComponent(user.username) + '/visible-categories',
          { visibleCategories: next });
        toast('已更新 ' + user.username + ' 的可见分类', 'success');
        dialog.close();
        loadAdminUsers();
        // If the admin edited their own row (impossible — admin isn't filtered)
        // or the current logged-in user is the target, refresh state.user too.
        if (state.user && state.user.username === user.username) {
          state.user.visibleCategories = next;
          applyKindUI();
        }
      } catch (err) {
        toast('保存失败: ' + err.message, 'error');
      }
      save.removeEventListener('click', onSave);
      cancel.removeEventListener('click', onCancel);
    };
    const onCancel = () => {
      dialog.close();
      save.removeEventListener('click', onSave);
      cancel.removeEventListener('click', onCancel);
    };
    save.addEventListener('click', onSave);
    cancel.addEventListener('click', onCancel);
  }

  // ----- User-permissions dialog (admin → grant per-user content perms) -----
  function openUserPermsDialog(user) {
    if (!user) return;
    if (user.role === 'admin') return; // admin always has all four
    const dialog = document.getElementById('user-perms-dialog');
    const userEl = document.getElementById('user-perms-user');
    if (!dialog || !userEl) return;
    userEl.textContent = user.username;
    const cur = user.permissions || {};
    for (const cb of dialog.querySelectorAll('input[type="checkbox"][data-perm]')) {
      cb.checked = !!cur[cb.dataset.perm];
    }
    dialog.showModal();

    const save = document.getElementById('user-perms-save');
    const cancel = document.getElementById('user-perms-cancel');
    const onSave = async () => {
      const next = { upload: false, create: false, modify: false, delete: false };
      for (const cb of dialog.querySelectorAll('input[type="checkbox"][data-perm]')) {
        next[cb.dataset.perm] = !!cb.checked;
      }
      try {
        await api('POST',
          '/api/admin/users/' + encodeURIComponent(user.username) + '/permissions',
          { permissions: next });
        toast('已更新 ' + user.username + ' 的权限', 'success');
        dialog.close();
        loadAdminUsers();
        // If admin happens to be editing themselves (impossible — admin
        // role disables the trigger button) or the current session
        // matches the target, push fresh perms into state.user so any
        // open page reflects without reload.
        if (state.user && state.user.username === user.username) {
          state.user.permissions = next;
          updateHeaderAuth();
        }
      } catch (err) {
        toast('保存失败: ' + err.message, 'error');
      }
      save.removeEventListener('click', onSave);
      cancel.removeEventListener('click', onCancel);
    };
    const onCancel = () => {
      dialog.close();
      save.removeEventListener('click', onSave);
      cancel.removeEventListener('click', onCancel);
    };
    save.addEventListener('click', onSave);
    cancel.addEventListener('click', onCancel);
  }

  async function loadAdminStats() {
    statsGrid.innerHTML = '<div class="stat-cell">加载中...</div>';
    statsTopBody.innerHTML = '';
    try {
      const s = await api('GET', '/api/admin/stats');
      const v = s.video;
      const a = s.audio;
      const im = s.image || { collections: 0, hidden: 0, episodes: 0, totalSize: 0, byType: {}, topLarge: [] };
      const nv = s.novel || { collections: 0, hidden: 0, episodes: 0, totalSize: 0, byType: {}, topLarge: [] };
      const cell = (label, value) =>
        `<div class="stat-cell"><div class="stat-label mono">${label}</div><div class="stat-value mono">${value}</div></div>`;
      const sep = (title) =>
        `<div class="section-label" style="grid-column:1/-1;margin:16px 0 4px">${title}</div>`;
      // 1.5.0: rolled back the per-tag breakdown (1.4.0 added it but
      // user found it too granular). Each kind now shows only the
      // four core counts; per-tag drill-down is available in the
      // dedicated categories tab if needed.
      const KIND_UNIT_LABEL = {
        video: 'EPISODES', audio: 'TRACKS', image: 'IMAGES', novel: 'BOOKS',
      };
      function kindSummary(kind, digest) {
        return sep('// ' + kind.toUpperCase())
          + cell('COLLECTIONS', digest.collections)
          + cell('HIDDEN',      digest.hidden)
          + cell(KIND_UNIT_LABEL[kind] || 'EPISODES', digest.episodes)
          + cell('TOTAL SIZE',  formatSize(digest.totalSize));
      }
      statsGrid.innerHTML =
        sep('// SYSTEM')
        + cell('USERS',   s.users)
        + cell('UPTIME',  formatUptime(s.uptime))
        + cell('VERSION', escapeHtml(s.version))
        + kindSummary('video', v)
        + kindSummary('audio', a)
        + kindSummary('image', im)
        + kindSummary('novel', nv);
      const topLarge = [
        ...(v.topLarge || []).map((c) => ({ ...c, kind: 'VIDEO' })),
        ...(a.topLarge || []).map((c) => ({ ...c, kind: 'AUDIO' })),
        ...(im.topLarge || []).map((c) => ({ ...c, kind: 'IMAGE' })),
        ...(nv.topLarge || []).map((c) => ({ ...c, kind: 'NOVEL' })),
      ].sort((x, y) => y.size - x.size).slice(0, 5);
      statsTopBody.innerHTML = topLarge.map((c) => `
        <tr>
          <td>${escapeHtml(c.title)} <span class="mono" style="font-size:9px;opacity:.5">${c.kind}</span></td>
          <td class="mono">${c.episodes}</td>
          <td class="mono">${formatSize(c.size)}</td>
        </tr>
      `).join('');
    } catch (err) {
      statsGrid.innerHTML = `<div class="cards-status error">加载失败: ${escapeHtml(err.message)}</div>`;
    }
  }
  async function loadAdminHealth() {
    healthSummary.innerHTML = '加载中...';
    healthDetails.innerHTML = '';
    try {
      const h = await api('GET', '/api/admin/health-check');
      const summKinds = Object.keys(h.summary || {});
      let sumP = 0, sumE = 0, sumC = 0;
      for (const k of summKinds) {
        sumP += (h.summary[k] && h.summary[k].orphanProgressCount) || 0;
        sumE += (h.summary[k] && h.summary[k].orphanEpisodeCount) || 0;
        sumC += (h.summary[k] && h.summary[k].missingCoverCount) || 0;
      }
      healthSummary.innerHTML = `
        <div>孤立进度: <b>${sumP}</b></div>
        <div>孤立集记录: <b>${sumE}</b></div>
        <div>缺失封面: <b>${sumC}</b></div>
      `;
      const orphanProgress = [];
      const orphanEpisodes = [];
      const missingCovers  = [];
      for (const k of summKinds) {
        if (h[k] && Array.isArray(h[k].orphanProgress)) orphanProgress.push(...h[k].orphanProgress);
        if (h[k] && Array.isArray(h[k].orphanEpisodes)) orphanEpisodes.push(...h[k].orphanEpisodes);
        if (h[k] && Array.isArray(h[k].missingCovers))  missingCovers.push(...h[k].missingCovers);
      }
      let html = '';
      if (orphanProgress.length) {
        html += '<div class="section-label" style="margin-top:20px">// ORPHAN PROGRESS</div><ul class="health-list mono">';
        for (const o of orphanProgress) html += `<li>${escapeHtml(o.user)} → ${escapeHtml(o.collection)}</li>`;
        html += '</ul>';
      }
      if (orphanEpisodes.length) {
        html += '<div class="section-label" style="margin-top:20px">// ORPHAN EPISODES</div><ul class="health-list mono">';
        for (const o of orphanEpisodes) html += `<li>${escapeHtml(o.user)} → ${escapeHtml(o.collection)} / ${escapeHtml(o.file)}</li>`;
        html += '</ul>';
      }
      if (missingCovers.length) {
        html += '<div class="section-label" style="margin-top:20px">// MISSING COVERS</div><ul class="health-list mono">';
        for (const m of missingCovers) html += `<li>${escapeHtml(m.collection)} → ${escapeHtml(m.cover)}</li>`;
        html += '</ul>';
      }
      if (!html) html = '<div class="cards-status">一切正常</div>';
      healthDetails.innerHTML = html;
    } catch (err) {
      healthSummary.innerHTML = `<span class="cards-status error">加载失败: ${escapeHtml(err.message)}</span>`;
    }
  }
  rescanBtn.addEventListener('click', async () => {
    try {
      const r = await api('POST', '/api/admin/rescan');
      toast('重扫完成：共 ' + r.collections + ' 个合集', 'success');
      if (state.adminTab === 'stats') loadAdminStats();
    } catch (err) { toast('重扫失败: ' + err.message, 'error'); }
  });
  healthScanBtn.addEventListener('click', loadAdminHealth);
  healthCleanBtn.addEventListener('click', async () => {
    const ok = await confirmBox('清理所有孤立进度和集记录？', 'CLEAN');
    if (!ok) return;
    try {
      const r = await api('POST', '/api/admin/health-check/clean');
      toast('已清理 ' + r.cleaned + ' 条', 'success');
      loadAdminHealth();
    } catch (err) { toast('清理失败: ' + err.message, 'error'); }
  });

  // ==================================================================
  // DIALOGS (create, edit, episode-edit, intro, passwd, cover)
  // ==================================================================
  // Render the multi-select type checkbox list inside a dialog. The
  // list is keyed off `state.categories[kind]` so admins editing
  // categories upstream see the change reflected when they next open
  // a create/edit dialog.
  //
  // Selection model: the FIRST checked item is the "primary" tag and
  // is what other UI surfaces (card chip, history badge) display. We
  // preserve user click order in a data-order attribute so the primary
  // matches what the user picked first; see readTypesFromList.
  function renderTypesCheckboxList(listEl, selectedTypes) {
    if (!listEl) return;
    // 1.1.0+: render in tree DFS order with data-depth so children sit
    // visually under their parent. The flat selection model is unchanged
    // — a child id is just another id; types[0] is still the primary.
    const flat = clientFlattenTree(clientGetTree(state.kind));
    const sel = new Set(Array.isArray(selectedTypes) ? selectedTypes : []);
    const orderMap = new Map();
    if (Array.isArray(selectedTypes)) {
      selectedTypes.forEach((t, i) => orderMap.set(t, i + 1));
    }
    // Detect labels that occur more than once in this kind so we can
    // disambiguate them inline. Without this, two "萝莉" leaves under
    // different parents are indistinguishable in the chip list.
    const labelCounts = new Map();
    for (const c of flat) {
      labelCounts.set(c.label, (labelCounts.get(c.label) || 0) + 1);
    }
    // Direct-children count per parent id, used for the "(N)" suffix
    // on parent chips. Source from the raw kind list (not the flattened
    // tree) so we don't double-count when admins reuse an id at multiple
    // levels — the kind list has unique ids.
    const childCount = new Map();
    for (const cc of clientCatList(state.kind)) {
      if (cc.parentId) childCount.set(cc.parentId, (childCount.get(cc.parentId) || 0) + 1);
    }
    listEl.innerHTML = flat.map((c) => {
      const checked = sel.has(c.id) ? ' checked' : '';
      const order = orderMap.has(c.id) ? orderMap.get(c.id) : '';
      const depth = c.depth || 0;
      const indent = depth > 0 ? '<span class="type-chip-indent" aria-hidden="true">└</span>' : '';
      const ambiguous = depth > 0 && (labelCounts.get(c.label) || 0) > 1;
      const fullPath = clientPathLabel(state.kind, c.id);
      // Ambiguous children get their parent path inlined as a badge
      // prefix (1.5.0+: upgraded from fade-only); unambiguous children
      // keep the bare label so the list stays scannable. The title attr
      // is always the full path so hover gives admins certainty either way.
      const parentPath = fullPath.replace(/ \/ [^/]*$/, '');
      const labelHtml = ambiguous
        ? `<span class="type-chip-parent">${escapeHtml(parentPath)}</span>${escapeHtml(c.label)}`
        : escapeHtml(c.label);
      // Suffix "(N)" on parent chips so admins know at a glance how many
      // direct children each parent has — useful when navigating a deep
      // tree to decide whether to drill in.
      const cn = childCount.get(c.id) || 0;
      const countHtml = cn > 0 ? ` <span class="type-chip-count">(${cn})</span>` : '';
      return `<label class="type-chip-cb" data-depth="${depth}" title="${escapeHtml(fullPath)}"><input type="checkbox" value="${escapeHtml(c.id)}" data-order="${order}"${checked}>${indent}<span>${labelHtml}${countHtml}</span></label>`;
    }).join('');
    let nextOrder = (Array.isArray(selectedTypes) ? selectedTypes.length : 0) + 1;
    for (const cb of listEl.querySelectorAll('input[type=checkbox]')) {
      cb.addEventListener('change', () => {
        if (cb.checked) {
          cb.dataset.order = String(nextOrder++);
        } else {
          cb.dataset.order = '';
        }
      });
    }
  }
  function readTypesFromList(listEl) {
    if (!listEl) return [];
    const checked = Array.from(listEl.querySelectorAll('input[type=checkbox]:checked'));
    checked.sort((a, b) => (Number(a.dataset.order) || 0) - (Number(b.dataset.order) || 0));
    return checked.map((cb) => cb.value);
  }
  // ---- Authors chip input (1.2.0+) -----------------------------------
  // Drafts of authors live on the dialog's chip list as DOM state. Read
  // back via readAuthorsFromList. Suggestions come from /api/authors and
  // are mirrored into the shared <datalist id="authors-datalist">, which
  // every <input list="authors-datalist"> reads from automatically.
  async function refreshAuthorsDatalist() {
    try {
      const data = await api('GET', '/api/authors?kind=' + encodeURIComponent(state.kind));
      const list = (data && data.authors) || [];
      const dl = document.getElementById('authors-datalist');
      if (!dl) return;
      dl.innerHTML = list.map((a) => `<option value="${escapeHtml(a)}"></option>`).join('');
    } catch (_e) { /* non-fatal */ }
  }
  function renderAuthorsChipList(listEl, authors) {
    if (!listEl) return;
    const arr = Array.isArray(authors) ? authors : [];
    listEl.innerHTML = arr.map((a, i) =>
      `<span class="author-chip" data-i="${i}">${escapeHtml(a)}<button type="button" class="author-del" data-i="${i}" title="删除">×</button></span>`
    ).join('');
    listEl.querySelectorAll('.author-del').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const i = Number(btn.dataset.i);
        const cur = readAuthorsFromList(listEl);
        cur.splice(i, 1);
        renderAuthorsChipList(listEl, cur);
      });
    });
  }
  function readAuthorsFromList(listEl) {
    if (!listEl) return [];
    return Array.from(listEl.querySelectorAll('.author-chip')).map((el) => {
      // Read the text excluding the × button.
      const clone = el.cloneNode(true);
      const btn = clone.querySelector('button');
      if (btn) btn.remove();
      return (clone.textContent || '').trim();
    }).filter((s) => s.length > 0);
  }
  function wireAuthorInput(inputEl, listEl) {
    if (!inputEl || !listEl) return;
    const commit = (raw) => {
      const cur = readAuthorsFromList(listEl);
      let added = 0;
      for (const part of String(raw).split(/[,，]/)) {
        const w = part.trim();
        if (!w || w.length > 80) continue;
        let k = w;
        try { k = k.normalize('NFKC'); } catch (_e) {}
        k = k.toLowerCase();
        if (cur.some((x) => {
          let xk = x;
          try { xk = xk.normalize('NFKC'); } catch (_e) {}
          return xk.toLowerCase() === k;
        })) continue;
        cur.push(w);
        added++;
        if (cur.length >= 20) break;
      }
      if (added > 0) renderAuthorsChipList(listEl, cur);
    };
    // Use addEventListener; teardown handled by dialog close pattern below.
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ',' || e.key === '，') {
        e.preventDefault();
        if (inputEl.value.trim()) {
          commit(inputEl.value);
          inputEl.value = '';
        }
      } else if (e.key === 'Backspace' && inputEl.value === '') {
        const cur = readAuthorsFromList(listEl);
        if (cur.length > 0) {
          cur.pop();
          renderAuthorsChipList(listEl, cur);
        }
      }
    };
    const onBlur = () => {
      if (inputEl.value.trim()) {
        commit(inputEl.value);
        inputEl.value = '';
      }
    };
    // Fresh per-open: blow away previous handlers if any.
    if (inputEl._authorTeardown) inputEl._authorTeardown();
    inputEl.addEventListener('keydown', onKey);
    inputEl.addEventListener('blur', onBlur);
    inputEl._authorTeardown = () => {
      inputEl.removeEventListener('keydown', onKey);
      inputEl.removeEventListener('blur', onBlur);
      inputEl._authorTeardown = null;
    };
  }
  // ---- Client-side hierarchy mirrors (parallel to lib/categories.js) ----
  // Chip filtering and the visibleCategories dialog need the same
  // descendantIds / expandGrant / pathLabel semantics on the client. Kept
  // small and dependency-free so they don't drift from the server.
  function clientCatList(kind) {
    return (state.categories && state.categories[kind]) || [];
  }
  function clientChildrenMap(kind) {
    const m = new Map();
    for (const c of clientCatList(kind)) {
      const p = c.parentId || null;
      if (!m.has(p)) m.set(p, []);
      m.get(p).push(c.id);
    }
    return m;
  }
  function clientDescendantIds(kind, id) {
    const out = new Set();
    if (!id) return out;
    const list = clientCatList(kind);
    if (!list.some((c) => c.id === id)) return out;
    out.add(id);
    const childrenOf = clientChildrenMap(kind);
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      for (const childId of childrenOf.get(cur) || []) {
        if (!out.has(childId)) {
          out.add(childId);
          stack.push(childId);
        }
      }
    }
    return out;
  }
  function clientExpandGrant(kind, ids) {
    const out = new Set();
    if (!Array.isArray(ids)) return out;
    for (const id of ids) for (const c of clientDescendantIds(kind, id)) out.add(c);
    return out;
  }
  function clientPathLabel(kind, id, sep) {
    const s = typeof sep === 'string' ? sep : ' / ';
    if (!id) return '';
    const list = clientCatList(kind);
    const m = new Map();
    for (const c of list) m.set(c.id, c);
    const node = m.get(id);
    if (!node) return id;
    const labels = [node.label];
    let cur = node;
    let steps = 0;
    while (cur && cur.parentId && steps < 5) {
      const parent = m.get(cur.parentId);
      if (!parent) break;
      labels.unshift(parent.label);
      cur = parent;
      steps++;
    }
    return labels.join(s);
  }
  // Returns nested view {id, label, parentId, hidden, keywords, depth, children:[]}.
  function clientGetTree(kind) {
    const list = clientCatList(kind);
    const byParent = new Map();
    for (const c of list) {
      const p = c.parentId || null;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(c);
    }
    const cmp = (a, b) => ((a.order || 0) - (b.order || 0)) || a.label.localeCompare(b.label, 'zh-CN');
    function build(parentId, depth) {
      const kids = (byParent.get(parentId) || []).slice().sort(cmp);
      return kids.map((c) => ({ ...c, depth, children: build(c.id, depth + 1) }));
    }
    return build(null, 0);
  }
  // Flatten a tree (DFS) so renderTypesCheckboxList / VisibleCategories
  // dialog can render rows in display order while keeping data-depth.
  function clientFlattenTree(tree) {
    const out = [];
    function walk(nodes) {
      for (const n of nodes) {
        out.push(n);
        if (n.children && n.children.length) walk(n.children);
      }
    }
    walk(tree);
    return out;
  }

  // Title-vs-keyword match is intentionally lax: NFKC normalize both
  // sides (folds full-width ＡＢＣ → ABC, ﬁ ligature → fi, etc.), then
  // lowercase, then plain substring includes. Works equally well for
  // CJK / Latin / mixed titles.
  function _normForMatch(s) {
    let v = String(s || '');
    try { v = v.normalize('NFKC'); } catch (_e) {}
    return v.toLowerCase();
  }
  function detectTypesFromTitle(title) {
    const t = _normForMatch(title);
    if (!t.trim()) return [];
    const cats = (state.categories && state.categories[state.kind]) || [];
    const hits = [];
    for (const c of cats) {
      const kws = Array.isArray(c.keywords) ? c.keywords : [];
      for (const w of kws) {
        if (!w) continue;
        if (t.includes(_normForMatch(w))) {
          hits.push(c.id);
          break;
        }
      }
    }
    return dedupKeepSpecific(hits, state.kind);
  }
  // If both an ancestor and a descendant matched, keep only the descendant.
  // Reason: the server's expandUpward already turns "tagged with child" into
  // "matches parent chip too", so dropping the parent here yields the same
  // filter behavior with a more specific primary tag (types[0] = leaf).
  function dedupKeepSpecific(ids, kind) {
    if (!Array.isArray(ids) || ids.length < 2) return ids || [];
    const set = new Set(ids);
    const drop = new Set();
    for (const id of ids) {
      // every ancestor of id that's also in `set` is now redundant
      const m = new Map();
      for (const c of clientCatList(kind)) m.set(c.id, c);
      let cur = m.get(id);
      let steps = 0;
      while (cur && cur.parentId && steps < 5) {
        if (set.has(cur.parentId)) drop.add(cur.parentId);
        cur = m.get(cur.parentId);
        steps++;
      }
    }
    return ids.filter((id) => !drop.has(id));
  }
  // Tracks the state for the currently-open create dialog: chip change
  // listener (for cleanup) + manuallyTouched set + debounce timer. Lives
  // outside openCreateDialog so the close handler can dispose them and
  // re-open works fresh each time. Without this, every open accumulated
  // a delegated "change" listener on the chip list (a leak that grew
  // per-session) and the debounce timer kept ticking after close.
  let createDialogTeardown = null;
  function openCreateDialog(presetType) {
    createError.textContent = '';
    createForm.title.value = '';
    createForm.description.value = '';
    const listEl = createForm.querySelector('[data-list="create"]');
    // Preset comes from the active filter chip — preserve it as the
    // primary tag if it's a real category (not 'all'). Otherwise seed
    // with 'other' as a sensible default.
    const seed = presetType && presetType !== 'all' ? [presetType] : ['other'];
    renderTypesCheckboxList(listEl, seed);
    // Authors: empty start; refresh suggestions in the background.
    const authorsListEl = createForm.querySelector('.authors-chip-list[data-list="create"]');
    const authorsInputEl = createForm.querySelector('.author-input[data-list="create"]');
    renderAuthorsChipList(authorsListEl, []);
    wireAuthorInput(authorsInputEl, authorsListEl);
    refreshAuthorsDatalist();
    createDialog.showModal();
    setTimeout(() => createForm.title.focus(), 50);
    // Live auto-detection: as the title is typed, pre-check chips whose
    // keywords appear in the title. User-modified chips (manually toggled)
    // are remembered in `manuallyTouched` so we don't overwrite their
    // intent on every keystroke. Auto-detected chips get a visual marker
    // until the user touches them.
    if (createDialogTeardown) createDialogTeardown();
    const manuallyTouched = new Set();
    const onChipChange = (e) => {
      const t = e.target;
      if (t && t.matches('input[type=checkbox]')) {
        manuallyTouched.add(t.value);
        const lab = t.closest('.type-chip-cb');
        if (lab) lab.classList.remove('type-chip-auto');
      }
    };
    listEl.addEventListener('change', onChipChange);
    let debounceT = null;
    const autoApply = () => {
      const detected = new Set(detectTypesFromTitle(createForm.title.value));
      for (const cb of listEl.querySelectorAll('input[type=checkbox]')) {
        if (manuallyTouched.has(cb.value)) continue;
        const lab = cb.closest('.type-chip-cb');
        const isPreset = (presetType && presetType !== 'all' && cb.value === presetType);
        if (detected.has(cb.value)) {
          if (!cb.checked) {
            cb.checked = true;
            // Append to selection order if not already in.
            const orders = Array.from(listEl.querySelectorAll('input[type=checkbox]'))
              .map((x) => Number(x.dataset.order) || 0);
            cb.dataset.order = String((Math.max(0, ...orders)) + 1);
          }
          if (lab) lab.classList.add('type-chip-auto');
        } else if (!isPreset) {
          if (cb.checked) {
            cb.checked = false;
            cb.dataset.order = '';
          }
          if (lab) lab.classList.remove('type-chip-auto');
        }
      }
    };
    const onTitleInput = () => {
      clearTimeout(debounceT);
      debounceT = setTimeout(autoApply, 200);
    };
    createForm.title.addEventListener('input', onTitleInput);
    createDialogTeardown = () => {
      listEl.removeEventListener('change', onChipChange);
      createForm.title.removeEventListener('input', onTitleInput);
      clearTimeout(debounceT);
      createDialogTeardown = null;
    };
  }
  createDialog.addEventListener('close', () => {
    if (createDialogTeardown) createDialogTeardown();
  });
  createCancel.addEventListener('click', () => createDialog.close('cancel'));
  createForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    createError.textContent = '';
    const types = readTypesFromList(createForm.querySelector('[data-list="create"]'));
    if (types.length === 0) { createError.textContent = '至少选择一个类型'; return; }
    const authors = readAuthorsFromList(createForm.querySelector('.authors-chip-list[data-list="create"]'));
    try {
      const { collection } = await api('POST', '/api/collections', {
        title: createForm.title.value.trim(),
        types,
        authors,
        description: createForm.description.value.trim(),
      });
      createDialog.close('confirm');
      toast('已创建 ' + collection.title, 'success');
      navigate('#/c/' + encodeURIComponent(collection.id));
    } catch (err) {
      createError.textContent = err.message || '创建失败';
    }
  });

  function openEditDialog(collection) {
    editError.textContent = '';
    // The submit handler reads state.currentCollection.id for the PATCH
    // URL. Older call sites (detail page edit button) set this upstream;
    // newer ones (admin duplicates panel) do not. Sync here so any
    // entry path is safe — no more silent writes to a stale collection.
    state.currentCollection = collection;
    editForm.title.value = collection.title || '';
    const listEl = editForm.querySelector('[data-list="edit"]');
    const seedTypes = Array.isArray(collection.types) && collection.types.length > 0
      ? collection.types.slice()
      : [collection.type || 'other'];
    renderTypesCheckboxList(listEl, seedTypes);
    // Authors: seed with the collection's existing list. Suggestions
    // come from /api/authors (refreshed in background — non-blocking).
    const editAuthorsListEl = editForm.querySelector('.authors-chip-list[data-list="edit"]');
    const editAuthorsInputEl = editForm.querySelector('.author-input[data-list="edit"]');
    renderAuthorsChipList(editAuthorsListEl, Array.isArray(collection.authors) ? collection.authors : []);
    wireAuthorInput(editAuthorsInputEl, editAuthorsListEl);
    refreshAuthorsDatalist();
    editForm.description.value = collection.description || '';
    editForm.elements.namedItem('hiddenFlag').checked = !!collection.hidden;
    // Resume-mode radio group is audio-only. Show it when the admin
    // is editing an audio collection; keep it hidden for video where
    // the traditional "always resume" behavior is the right default.
    const resumeFieldset = document.getElementById('edit-resume-mode');
    if (resumeFieldset) {
      const isAudio = state.kind === 'audio';
      resumeFieldset.hidden = !isAudio;
      if (isAudio) {
        const want = collection.resumeMode === 'restart' ? 'restart' : 'continue';
        const radios = editForm.elements.namedItem('resumeMode');
        if (radios) {
          // NodeList for multiple radios with the same name; single
          // element if only one.
          if (radios.length) {
            for (const r of radios) r.checked = (r.value === want);
          } else if (radios.value != null) {
            radios.checked = (radios.value === want);
          }
        }
      }
    }
    editDialog.showModal();
    setTimeout(() => editForm.title.focus(), 50);
  }
  // "按关联字词识别" inside edit dialog. Unlike create, this is
  // explicitly user-triggered (button click) — never auto-runs on
  // typing — so it can never silently undo a tag the admin already
  // chose. It only ADDs hits that aren't already checked, and tags
  // them with type-chip-auto for clarity.
  const editAutoDetectBtn = document.getElementById('edit-auto-detect-btn');
  if (editAutoDetectBtn) {
    editAutoDetectBtn.addEventListener('click', () => {
      const listEl = editForm.querySelector('[data-list="edit"]');
      if (!listEl) return;
      const detected = new Set(detectTypesFromTitle(editForm.title.value));
      let added = 0;
      const orders = Array.from(listEl.querySelectorAll('input[type=checkbox]'))
        .map((x) => Number(x.dataset.order) || 0);
      let nextOrder = (Math.max(0, ...orders)) + 1;
      for (const cb of listEl.querySelectorAll('input[type=checkbox]')) {
        if (!detected.has(cb.value)) continue;
        const lab = cb.closest('.type-chip-cb');
        if (!cb.checked) {
          cb.checked = true;
          cb.dataset.order = String(nextOrder++);
          added++;
          if (lab) lab.classList.add('type-chip-auto');
        }
      }
      if (added > 0) toast(`自动追加 ${added} 个标签`, 'success');
      else toast('标题没有命中任何关联字词');
    });
  }
  editCancel.addEventListener('click', () => editDialog.close('cancel'));
  editForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    editError.textContent = '';
    const col = state.currentCollection;
    if (!col) return;
    const types = readTypesFromList(editForm.querySelector('[data-list="edit"]'));
    if (types.length === 0) { editError.textContent = '至少选择一个类型'; return; }
    const authors = readAuthorsFromList(editForm.querySelector('.authors-chip-list[data-list="edit"]'));
    try {
      const body = {
        title: editForm.title.value.trim(),
        types,
        authors,
        description: editForm.description.value.trim(),
        hidden: editForm.elements.namedItem('hiddenFlag').checked,
      };
      // Only include resumeMode when the field was shown (audio
      // collection). Video collections never send it, so their
      // server-side meta keeps whatever default's there.
      if (state.kind === 'audio') {
        const radios = editForm.elements.namedItem('resumeMode');
        let pick = 'continue';
        if (radios && radios.length) {
          for (const r of radios) if (r.checked) { pick = r.value; break; }
        }
        body.resumeMode = pick;
      }
      await api('PATCH', '/api/collections/' + encodeURIComponent(col.id), body);
      editDialog.close('confirm');
      toast('已保存', 'success');
      showDetail(col.id);
    } catch (err) {
      editError.textContent = err.message || '保存失败';
    }
  });

  function openEpisodeEditDialog(collection, file) {
    state.editingEpisodeFile = file;
    const ep = collection.episodes.find((e) => e.file === file);
    episodeEditError.textContent = '';
    episodeEditFile.textContent = file;
    episodeEditForm.title.value = ep && ep.title !== basenameNoExt(file) ? ep.title : '';
    episodeEditForm.description.value = ep && ep.description ? ep.description : '';
    episodeEditForm.order.value = ep ? ep.order : '';
    episodeEditDialog.showModal();
    setTimeout(() => episodeEditForm.title.focus(), 50);
  }
  episodeEditCancel.addEventListener('click', () => episodeEditDialog.close('cancel'));
  episodeEditDelete.addEventListener('click', async () => {
    const col = state.currentCollection;
    if (!col || !state.editingEpisodeFile) return;
    const file = state.editingEpisodeFile;
    const ok = await confirmBox(`删除集「${file}」？此操作会从磁盘移除该视频文件及其字幕。`, 'DELETE EPISODE');
    if (!ok) return;
    try {
      await api('DELETE', '/api/collections/' + encodeURIComponent(col.id) + '/episodes/' + encodeURIComponent(file));
      episodeEditDialog.close('confirm');
      toast('已删除 ' + file, 'success');
      showDetail(col.id);
    } catch (err) {
      episodeEditError.textContent = err.message || '删除失败';
    }
  });
  episodeEditForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    episodeEditError.textContent = '';
    const col = state.currentCollection;
    if (!col || !state.editingEpisodeFile) return;
    const body = {
      title: episodeEditForm.title.value.trim(),
      description: episodeEditForm.description.value.trim(),
    };
    const orderRaw = episodeEditForm.order.value.trim();
    if (orderRaw !== '') body.order = Number(orderRaw);
    try {
      await api('PATCH',
        '/api/collections/' + encodeURIComponent(col.id) + '/episodes/' + encodeURIComponent(state.editingEpisodeFile),
        body);
      episodeEditDialog.close('confirm');
      toast('已保存', 'success');
      showDetail(col.id);
    } catch (err) {
      episodeEditError.textContent = err.message || '保存失败';
    }
  });

  function openIntroDialog(collection) {
    introError.textContent = '';
    introForm.introSkipSec.value = collection.introSkipSec || 0;
    introDialog.showModal();
    setTimeout(() => introForm.introSkipSec.focus(), 50);
  }
  introCancel.addEventListener('click', () => introDialog.close('cancel'));
  introForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    introError.textContent = '';
    const col = state.currentCollection;
    if (!col) return;
    const v = Number(introForm.introSkipSec.value);
    try {
      await api('PATCH', '/api/collections/' + encodeURIComponent(col.id), { introSkipSec: v });
      introDialog.close('confirm');
      toast('已保存', 'success');
      showDetail(col.id);
    } catch (err) {
      introError.textContent = err.message || '保存失败';
    }
  });

  function openPasswdDialog() {
    passwdError.textContent = '';
    passwdForm.oldPassword.value = '';
    passwdForm.newPassword.value = '';
    passwdDialog.showModal();
    setTimeout(() => passwdForm.oldPassword.focus(), 50);
  }
  passwdCancel.addEventListener('click', () => passwdDialog.close('cancel'));
  passwdForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    passwdError.textContent = '';
    try {
      await api('POST', '/api/auth/password', {
        oldPassword: passwdForm.oldPassword.value,
        newPassword: passwdForm.newPassword.value,
      });
      passwdDialog.close('confirm');
      toast('密码已更新', 'success');
    } catch (err) {
      passwdError.textContent = err.message || '失败';
    }
  });

  async function openCoverDialog(collection) {
    coverError.textContent = '';
    state.selectedCover = collection.cover || null;
    state.coverCrop = {
      scale: typeof collection.coverScale === 'number' ? collection.coverScale : 1,
      x:     typeof collection.coverX === 'number' ? collection.coverX : 50,
      y:     typeof collection.coverY === 'number' ? collection.coverY : 50,
    };
    coverCurrentName.textContent = collection.cover || '(自动)';
    // Show/hide subsystem-specific cover buttons
    if (coverCaptureFrame) coverCaptureFrame.hidden = state.kind !== 'video';
    if (coverExtractAudio) coverExtractAudio.hidden = state.kind !== 'audio';
    coverGrid.innerHTML = '<div class="cover-grid-empty mono">加载中...</div>';
    coverDialog.showModal();
    updateCoverEditor();
    try {
      const { images } = await api('GET', '/api/collections/' + encodeURIComponent(collection.id) + '/images');
      state.coverImages = images || [];
      renderCoverGrid(collection.id);
    } catch (err) {
      coverGrid.innerHTML = '<div class="cover-grid-empty mono">加载失败: ' + escapeHtml(err.message) + '</div>';
    }
  }
  function renderCoverGrid(collectionId) {
    if (!state.coverImages.length) {
      coverGrid.innerHTML = '<div class="cover-grid-empty mono">文件夹里没有图片 · 点"上传新图"添加一张</div>';
      return;
    }
    // Sync bulk-mode CSS marker (overlays only render when this is on).
    coverGrid.classList.toggle('cover-bulk-mode', coverBulk.mode);
    coverGrid.innerHTML = state.coverImages.map((file) => {
      const sel = file === state.selectedCover ? ' selected' : '';
      const bulkSel = coverBulk.selected.has(file) ? ' cover-thumb-bulk-selected' : '';
      // Files in subdirectories can't be deleted via the existing
      // episodes/bulk endpoint (it rejects file names containing /).
      // Mark them with a class so the ✕ button can reflect that
      // visually (greyed) and the click handler can short-circuit
      // with a helpful toast pointing to the gallery view.
      const isNested = file.indexOf('/') >= 0 || file.indexOf('\\') >= 0;
      const nested = isNested ? ' cover-thumb-nested' : '';
      const url = mediaUrl(collectionId, file);
      const delTitle = isNested ? '子目录图片请到合集详情页 / 图集页删除' : '删除此图（不可撤销）';
      const delBtn = `<button type="button" class="cover-thumb-del" title="${delTitle}" tabindex="-1">✕</button>`;
      const checkOverlay = '<span class="cover-thumb-check" aria-hidden="true"></span>';
      return `
        <div class="cover-thumb${sel}${bulkSel}${nested}" data-file="${encodeURIComponent(file)}">
          ${checkOverlay}
          ${delBtn}
          <div class="cover-thumb-img" style="background-image: url('${url}')"></div>
          <div class="cover-thumb-name mono">${escapeHtml(file)}</div>
        </div>
      `;
    }).join('');
    for (const thumb of coverGrid.querySelectorAll('.cover-thumb')) {
      thumb.addEventListener('click', (e) => {
        // Per-thumb single delete button — short-circuit before the
        // outer click handler so it doesn't double-fire as a "select
        // as cover" gesture.
        if (e.target.closest('.cover-thumb-del')) {
          e.stopPropagation();
          handleCoverThumbDelete(thumb);
          return;
        }
        const picked = decodeURIComponent(thumb.dataset.file);
        if (coverBulk.mode) {
          toggleCoverBulkSelection(picked, thumb);
          return;
        }
        // Switching to a different source image resets the crop — a
        // center/1x crop that worked for image A usually doesn't for
        // image B, and silently carrying it over leads to "my crop
        // disappeared" confusion. Picking the same file leaves the
        // current crop untouched so users can fine-tune iteratively.
        if (picked !== state.selectedCover) {
          state.coverCrop = { scale: 1, x: 50, y: 50 };
        }
        state.selectedCover = picked;
        coverCurrentName.textContent = state.selectedCover;
        for (const t of coverGrid.querySelectorAll('.cover-thumb')) t.classList.remove('selected');
        thumb.classList.add('selected');
        updateCoverEditor();
      });
    }
  }
  // ---- Cover dialog: image delete (single + bulk) -------------------
  function toggleCoverBulkSelection(file, thumb) {
    if (!file) return;
    if (coverBulk.selected.has(file)) {
      coverBulk.selected.delete(file);
      if (thumb) thumb.classList.remove('cover-thumb-bulk-selected');
    } else {
      coverBulk.selected.add(file);
      if (thumb) thumb.classList.add('cover-thumb-bulk-selected');
    }
    syncCoverBulkUI();
  }
  function syncCoverBulkUI() {
    if (coverBulkCount) coverBulkCount.textContent = String(coverBulk.selected.size);
    if (coverBulkDelete) coverBulkDelete.disabled = coverBulk.selected.size === 0;
  }
  function enterCoverBulkMode() {
    coverBulk.mode = true;
    coverBulk.selected.clear();
    if (coverBulkActions) coverBulkActions.hidden = false;
    if (coverBulkToggle) coverBulkToggle.classList.add('active');
    if (coverGrid) coverGrid.classList.add('cover-bulk-mode');
    syncCoverBulkUI();
  }
  function exitCoverBulkMode() {
    coverBulk.mode = false;
    coverBulk.selected.clear();
    if (coverBulkActions) coverBulkActions.hidden = true;
    if (coverBulkToggle) coverBulkToggle.classList.remove('active');
    if (coverGrid) {
      coverGrid.classList.remove('cover-bulk-mode');
      for (const t of coverGrid.querySelectorAll('.cover-thumb-bulk-selected')) {
        t.classList.remove('cover-thumb-bulk-selected');
      }
    }
    syncCoverBulkUI();
  }
  async function handleCoverThumbDelete(thumb) {
    if (!thumb) return;
    const file = decodeURIComponent(thumb.dataset.file);
    if (thumb.classList.contains('cover-thumb-nested')) {
      toast('子目录图片请到合集详情页 / 图集页删除', 'warning');
      return;
    }
    const col = state.currentCollection;
    if (!col) return;
    const ok = await confirmBox(`删除图片「${file}」？磁盘上的文件会一并移除，操作不可撤销。`, 'DELETE IMAGE');
    if (!ok) return;
    try {
      await api('DELETE', '/api/collections/' + encodeURIComponent(col.id) + '/episodes/' + encodeURIComponent(file));
      // Local state sync. If the deleted file was the active cover,
      // fall back to "auto" so the next save doesn't try to point at
      // a missing file.
      state.coverImages = state.coverImages.filter((f) => f !== file);
      if (state.selectedCover === file) {
        state.selectedCover = null;
        coverCurrentName.textContent = '(自动)';
      }
      renderCoverGrid(col.id);
      updateCoverEditor();
      toast('已删除 ' + file, 'success');
    } catch (e) {
      toast('删除失败: ' + (e && e.message ? e.message : e), 'error');
    }
  }
  async function bulkCoverDeleteSelected() {
    const col = state.currentCollection;
    if (!col || coverBulk.selected.size === 0) return;
    const all = Array.from(coverBulk.selected);
    // Reject nested files up front — episodes/bulk endpoint also
    // refuses them, but warning here gives a clearer message than
    // the per-file "文件名非法" the server returns.
    const nested = all.filter((f) => f.indexOf('/') >= 0 || f.indexOf('\\') >= 0);
    const flat = all.filter((f) => f.indexOf('/') < 0 && f.indexOf('\\') < 0);
    if (flat.length === 0) {
      toast('选中的全部图片都在子目录，请到详情页 / 图集页删除', 'warning');
      return;
    }
    const n = flat.length;
    const skipMsg = nested.length > 0 ? `\n（${nested.length} 张子目录图片会跳过，请到详情页删）` : '';
    const ok = await confirmBox(`删除 ${n} 张图片？磁盘文件会一并移除，操作不可撤销。${skipMsg}`, 'BULK DELETE IMAGES');
    if (!ok) return;
    try {
      const result = await api('POST', '/api/collections/' + encodeURIComponent(col.id) + '/episodes/bulk', {
        action: 'delete', files: flat,
      });
      const okN = result.processedCount || 0;
      const failN = result.errorCount || 0;
      const removed = new Set(result.processed || flat);
      // Drop deleted files locally so the grid re-renders without them.
      state.coverImages = state.coverImages.filter((f) => !removed.has(f));
      if (state.selectedCover && removed.has(state.selectedCover)) {
        state.selectedCover = null;
        coverCurrentName.textContent = '(自动)';
      }
      exitCoverBulkMode();
      renderCoverGrid(col.id);
      updateCoverEditor();
      toast(`删除完成 · 成功 ${okN}` + (failN ? ` · 失败 ${failN}` : ''), failN ? 'warning' : 'success');
    } catch (e) {
      toast('批量删除失败: ' + (e && e.message ? e.message : e), 'error');
    }
  }
  if (coverBulkToggle) coverBulkToggle.addEventListener('click', () => {
    if (coverBulk.mode) exitCoverBulkMode();
    else enterCoverBulkMode();
  });
  if (coverBulkExit) coverBulkExit.addEventListener('click', exitCoverBulkMode);
  if (coverBulkSelectAll) coverBulkSelectAll.addEventListener('click', () => {
    if (!coverBulk.mode) return;
    for (const f of state.coverImages) {
      if (f.indexOf('/') < 0 && f.indexOf('\\') < 0) coverBulk.selected.add(f);
    }
    if (coverGrid) {
      for (const t of coverGrid.querySelectorAll('.cover-thumb:not(.cover-thumb-nested)')) {
        t.classList.add('cover-thumb-bulk-selected');
      }
    }
    syncCoverBulkUI();
  });
  if (coverBulkClear) coverBulkClear.addEventListener('click', () => {
    coverBulk.selected.clear();
    if (coverGrid) {
      for (const t of coverGrid.querySelectorAll('.cover-thumb-bulk-selected')) {
        t.classList.remove('cover-thumb-bulk-selected');
      }
    }
    syncCoverBulkUI();
  });
  if (coverBulkDelete) coverBulkDelete.addEventListener('click', bulkCoverDeleteSelected);
  // Tear down bulk mode whenever the cover dialog closes so the next
  // open starts on the normal "select-as-cover" interaction.
  if (coverDialog) coverDialog.addEventListener('close', () => {
    if (coverBulk.mode) exitCoverBulkMode();
  });
  // Push the current coverCrop + selectedCover down into the preview
  // frames. Hides the whole editor panel when there's nothing to crop
  // (auto/no cover selected) so the dialog stays compact.
  function updateCoverEditor() {
    const col = state.currentCollection;
    if (!col || !state.selectedCover) {
      coverEditor.hidden = true;
      return;
    }
    coverEditor.hidden = false;
    const url = mediaUrl(col.id, state.selectedCover);
    coverEditorPreviews.style.setProperty('--cover-url', `url("${url}")`);
    coverEditorPreviews.style.setProperty('--cover-x', state.coverCrop.x + '%');
    coverEditorPreviews.style.setProperty('--cover-y', state.coverCrop.y + '%');
    coverEditorPreviews.style.setProperty('--cover-scale', String(state.coverCrop.scale));
    coverScaleRange.value = String(state.coverCrop.scale);
    coverScaleVal.textContent = state.coverCrop.scale.toFixed(2) + 'x';
  }
  // Zoom slider — live update to all three previews.
  coverScaleRange.addEventListener('input', () => {
    const s = Number(coverScaleRange.value);
    if (!Number.isFinite(s)) return;
    state.coverCrop.scale = Math.max(1, Math.min(3, s));
    updateCoverEditor();
  });
  // Reset button — back to 1x center.
  coverResetCrop.addEventListener('click', () => {
    state.coverCrop = { scale: 1, x: 50, y: 50 };
    updateCoverEditor();
  });
  // Drag-to-pan + wheel-to-zoom on any of the preview frames. All three
  // frames share a single coverCrop, so dragging on the small detail
  // preview also pans the big card preview instantly.
  (function wireCoverPreviewDrag() {
    let drag = null;
    function onDown(e) {
      const frame = e.target.closest('.cover-preview-frame');
      if (!frame) return;
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      const rect = frame.getBoundingClientRect();
      drag = {
        frame, rect,
        startX: e.clientX,
        startY: e.clientY,
        startCX: state.coverCrop.x,
        startCY: state.coverCrop.y,
        pointerId: e.pointerId,
      };
      try { frame.setPointerCapture(e.pointerId); } catch (_) {}
      e.preventDefault();
    }
    function onMove(e) {
      if (!drag) return;
      const dx = e.clientX - drag.startX;
      const dy = e.clientY - drag.startY;
      // Moving the pointer right reveals more of the LEFT side of the
      // image, so the focal point's X percentage should DECREASE. Same
      // intuition on Y. Normalize by frame size so the gesture feels
      // consistent regardless of which preview the user is dragging on,
      // and divide by scale so zoomed-in dragging is proportionally
      // slower (you're moving a smaller window across the image).
      const scaleDivisor = Math.max(1, state.coverCrop.scale);
      const nx = drag.startCX - (dx / drag.rect.width)  * 100 / scaleDivisor;
      const ny = drag.startCY - (dy / drag.rect.height) * 100 / scaleDivisor;
      state.coverCrop.x = Math.max(0, Math.min(100, nx));
      state.coverCrop.y = Math.max(0, Math.min(100, ny));
      updateCoverEditor();
    }
    function onUp(e) {
      if (!drag) return;
      try { drag.frame.releasePointerCapture(drag.pointerId); } catch (_) {}
      drag = null;
    }
    function onWheel(e) {
      const frame = e.target.closest('.cover-preview-frame');
      if (!frame) return;
      e.preventDefault();
      const delta = -Math.sign(e.deltaY) * 0.08;
      const next = Math.max(1, Math.min(3, state.coverCrop.scale + delta));
      state.coverCrop.scale = next;
      updateCoverEditor();
    }
    coverEditorPreviews.addEventListener('pointerdown', onDown);
    coverEditorPreviews.addEventListener('pointermove', onMove);
    coverEditorPreviews.addEventListener('pointerup', onUp);
    coverEditorPreviews.addEventListener('pointercancel', onUp);
    coverEditorPreviews.addEventListener('wheel', onWheel, { passive: false });
  })();
  coverAutoBtn.addEventListener('click', () => {
    state.selectedCover = null;
    state.coverCrop = { scale: 1, x: 50, y: 50 };
    coverCurrentName.textContent = '(自动)';
    for (const t of coverGrid.querySelectorAll('.cover-thumb')) t.classList.remove('selected');
    updateCoverEditor();
  });
  coverCancel.addEventListener('click', () => coverDialog.close('cancel'));
  coverForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    coverError.textContent = '';
    const col = state.currentCollection;
    if (!col) return;
    try {
      // Send cover + the three transform fields in one PATCH. When the
      // user picked "(自动)" (selectedCover === null) we skip the
      // transform fields — they don't apply to the auto-detected cover,
      // and the server falls back to defaults.
      const body = { cover: state.selectedCover };
      if (state.selectedCover) {
        body.coverScale = Number(state.coverCrop.scale.toFixed(3));
        body.coverX = Number(state.coverCrop.x.toFixed(2));
        body.coverY = Number(state.coverCrop.y.toFixed(2));
      } else {
        body.coverScale = 1;
        body.coverX = 50;
        body.coverY = 50;
      }
      await api('PATCH', '/api/collections/' + encodeURIComponent(col.id), body);
      coverDialog.close('confirm');
      toast('封面已更新', 'success');
      showDetail(col.id);
    } catch (err) {
      coverError.textContent = err.message || '保存失败';
    }
  });
  coverUploadTrigger.addEventListener('click', () => coverUploadInput.click());
  coverUploadInput.addEventListener('change', async () => {
    const files = Array.from(coverUploadInput.files || []);
    coverUploadInput.value = '';
    if (!files.length || !state.currentCollection) return;
    const file = files[0];
    const form = new FormData();
    form.append('files', file, file.name);
    coverError.textContent = '上传中...';
    const xhr = new XMLHttpRequest();
    xhr.open('POST', subUrl('/api/collections/' + encodeURIComponent(state.currentCollection.id) + '/upload'));
    xhr.withCredentials = true;
    xhr.onload = async () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        coverError.textContent = '';
        try {
          const { images } = await api('GET', '/api/collections/' + encodeURIComponent(state.currentCollection.id) + '/images');
          state.coverImages = images || [];
          state.selectedCover = file.name;
          // New upload = fresh image, so fresh crop.
          state.coverCrop = { scale: 1, x: 50, y: 50 };
          coverCurrentName.textContent = file.name;
          renderCoverGrid(state.currentCollection.id);
          updateCoverEditor();
        } catch (e) {}
      } else {
        let msg = 'HTTP ' + xhr.status;
        try { msg = JSON.parse(xhr.responseText).error || msg; } catch (e) {}
        coverError.textContent = '上传失败: ' + msg;
      }
    };
    xhr.onerror = () => { coverError.textContent = '上传失败: 网络错误'; };
    xhr.send(form);
  });

  // ── Video frame capture: inline video player ──
  const coverCaptureFrame = $('cover-capture-frame');
  const coverFramePanel = $('cover-frame-panel');
  const coverFrameSelect = $('cover-frame-select');
  const coverFrameCapture = $('cover-frame-capture');
  const coverFrameClose = $('cover-frame-close');
  const coverFrameVideo = $('cover-frame-video');
  // Streaming state for the cover-frame inline player. Mirrors the main
  // player's state.currentIsStream / streamStartSec — needed because a
  // /media-stream response is a single fragmented MP4 with no Range
  // support, so any seek has to be implemented by re-requesting the
  // stream with a new ?t= offset. Without this, the seek bar in the
  // capture panel is dead for transcoded formats (.mkv/.mov/etc.) and
  // the user can only screenshot the head of the file.
  let coverFrameIsStream = false;
  let coverFrameStartSec = 0;
  let coverFrameSeekBusy = false;

  function coverFrameLoadVideo(startSec) {
    const col = state.currentCollection;
    if (!col || !coverFrameVideo) return;
    const idx = Number(coverFrameSelect.value);
    const ep = col.episodes[idx];
    if (!ep) return;
    const begin = Number(startSec) || 0;
    const bare = (ep.file || '').split('/').pop();
    const ext = bare.split('.').pop();
    coverFrameIsStream = needsTranscode(ext);
    coverFrameStartSec = coverFrameIsStream ? begin : 0;
    coverFrameVideo.src = videoSrcFor(col.id, ep.file, { startSec: coverFrameStartSec });
    coverFrameVideo.load();
    coverFrameCapture.disabled = true;
  }

  if (coverCaptureFrame) {
    coverCaptureFrame.addEventListener('click', () => {
      const col = state.currentCollection;
      if (!col || !col.episodes.length) { toast('合集没有视频文件', 'error'); return; }
      coverFrameSelect.innerHTML = col.episodes.map((ep, i) =>
        '<option value="' + i + '">' + escapeHtml((i + 1) + '. ' + (ep.title || ep.file)) + '</option>'
      ).join('');
      coverFramePanel.hidden = false;
      coverFrameLoadVideo(0);
    });
  }
  if (coverFrameSelect) {
    coverFrameSelect.addEventListener('change', () => coverFrameLoadVideo(0));
  }
  if (coverFrameVideo) {
    // Enable capture button only when paused with a valid (finite, non-negative) time
    coverFrameVideo.addEventListener('pause', () => {
      const t = coverFrameStartSec + coverFrameVideo.currentTime;
      coverFrameCapture.disabled = coverFrameSeekBusy || !isFinite(t) || t < 0;
    });
    coverFrameVideo.addEventListener('play', () => {
      coverFrameCapture.disabled = true;
    });
    coverFrameVideo.addEventListener('loadeddata', () => {
      coverFrameCapture.disabled = true;
    });
    // Seek redirect for transcoded streams — same approach as the main
    // player. Tiny seeks (< 0.5s) are filtered out as they're usually
    // browser buffer-settling rather than user intent.
    coverFrameVideo.addEventListener('seeking', () => {
      if (!coverFrameIsStream || coverFrameSeekBusy) return;
      const localTarget = coverFrameVideo.currentTime;
      if (localTarget < 0.5) return;
      const absTarget = coverFrameStartSec + localTarget;
      const col = state.currentCollection;
      if (!col) return;
      const idx = Number(coverFrameSelect.value);
      const ep = col.episodes[idx];
      if (!ep) return;
      coverFrameSeekBusy = true;
      coverFrameStartSec = absTarget;
      coverFrameVideo.src = videoSrcFor(col.id, ep.file, { startSec: absTarget });
      const onMeta = () => {
        coverFrameVideo.removeEventListener('loadedmetadata', onMeta);
        coverFrameSeekBusy = false;
      };
      coverFrameVideo.addEventListener('loadedmetadata', onMeta);
    });
  }
  if (coverFrameClose) {
    coverFrameClose.addEventListener('click', () => {
      coverFramePanel.hidden = true;
      if (coverFrameVideo) { coverFrameVideo.pause(); coverFrameVideo.removeAttribute('src'); coverFrameVideo.load(); }
    });
  }
  if (coverFrameCapture) {
    coverFrameCapture.addEventListener('click', async () => {
      const col = state.currentCollection;
      if (!col || !coverFrameVideo) return;
      const idx = Number(coverFrameSelect.value);
      const ep = col.episodes[idx];
      if (!ep) return;
      // Absolute time = ?t= start offset + video element currentTime
      const time = coverFrameStartSec + coverFrameVideo.currentTime;
      if (!isFinite(time) || time < 0) { toast('无效时间点', 'error'); return; }
      coverError.textContent = '截帧保存中...';
      coverFrameCapture.disabled = true;
      try {
        const res = await api('POST', '/api/collections/' + encodeURIComponent(col.id) + '/capture-frame', {
          file: ep.file, time,
        });
        if (res && res.image) {
          const { images } = await api('GET', '/api/collections/' + encodeURIComponent(col.id) + '/images');
          state.coverImages = images || [];
          state.selectedCover = res.image;
          state.coverCrop = { scale: 1, x: 50, y: 50 };
          coverCurrentName.textContent = res.image;
          renderCoverGrid(col.id);
          updateCoverEditor();
          coverFramePanel.hidden = true;
          coverFrameVideo.pause();
          coverFrameVideo.removeAttribute('src');
          coverFrameVideo.load();
          coverError.textContent = '';
          toast('截帧已设为封面候选', 'success');
        }
      } catch (e) {
        coverError.textContent = '截帧失败: ' + (e.message || '未知错误');
        coverFrameCapture.disabled = false;
      }
    });
  }

  // ── Audio embedded cover extraction button ──
  const coverExtractAudio = $('cover-extract-audio');
  if (coverExtractAudio) {
    coverExtractAudio.addEventListener('click', async () => {
      const col = state.currentCollection;
      if (!col) return;
      const eps = col.episodes || [];
      if (!eps.length) { toast('合集没有音频文件', 'error'); return; }
      // Show which tracks have embedded covers (try to find one)
      coverError.textContent = '检测内嵌封面...';
      // Try each episode's cover endpoint to find which ones have embedded art
      const withCover = [];
      for (const ep of eps) {
        try {
          const r = await fetch(subUrl('/api/collections/' + encodeURIComponent(col.id) +
            '/episodes/' + encodePath(ep.file) + '/cover'), { method: 'HEAD', credentials: 'same-origin' });
          if (r.ok) withCover.push(ep);
        } catch (_e) {}
        if (withCover.length >= 20) break; // limit probing
      }
      if (!withCover.length) {
        coverError.textContent = '';
        toast('所有音频文件均无内嵌封面', 'error');
        return;
      }
      const labels = withCover.map((e, i) => (i + 1) + '. ' + (e.title || e.file));
      const choice = prompt('以下文件含内嵌封面，选择一个提取（输入序号）：\n\n' + labels.join('\n'), '1');
      if (!choice) { coverError.textContent = ''; return; }
      const idx = parseInt(choice, 10) - 1;
      if (idx < 0 || idx >= withCover.length) { coverError.textContent = ''; toast('序号无效', 'error'); return; }
      const ep = withCover[idx];
      coverError.textContent = '提取中...';
      try {
        const res = await api('POST', '/audio/api/collections/' + encodeURIComponent(col.id) + '/extract-cover', {
          file: ep.file,
        });
        if (res && res.image) {
          const { images } = await api('GET', '/api/collections/' + encodeURIComponent(col.id) + '/images');
          state.coverImages = images || [];
          state.selectedCover = res.image;
          state.coverCrop = { scale: 1, x: 50, y: 50 };
          coverCurrentName.textContent = res.image;
          renderCoverGrid(col.id);
          updateCoverEditor();
          coverError.textContent = '';
          toast('封面提取成功', 'success');
        }
      } catch (e) {
        coverError.textContent = '提取失败: ' + (e.message || '未知错误');
      }
    });
  }

  async function confirmDeleteCollection(col) {
    const msg = col.episodeCount > 0
      ? `合集「${col.title || col.id}」含 ${col.episodeCount} ${countUnit()}（${formatSize(col.totalSize)}）。删除将同时删除所有媒体文件。`
      : `删除空合集「${col.title || col.id}」？`;
    const ok = await confirmBox(msg, 'DELETE COLLECTION');
    if (!ok) return;
    const force = col.episodeCount > 0 ? '?force=1' : '';
    try {
      await api('DELETE', '/api/collections/' + encodeURIComponent(col.id) + force);
      toast('已删除', 'success');
      navigate('#/');
    } catch (err) {
      toast('删除失败: ' + err.message, 'error');
    }
  }

  // ==================================================================
  // UPLOAD
  // ==================================================================
  uploadInput.addEventListener('change', () => {
    const files = Array.from(uploadInput.files || []);
    uploadInput.value = '';
    if (!files.length || !state.currentCollection) return;
    uploadFiles(state.currentCollection.id, files);
  });
  function uploadFiles(id, files) {
    const form = new FormData();
    for (const f of files) form.append('files', f, f.name);
    const xhr = new XMLHttpRequest();
    xhr.open('POST', subUrl('/api/collections/' + encodeURIComponent(id) + '/upload'));
    xhr.withCredentials = true;
    statusEl.textContent = `上传中 0% · ${files.length} 文件`;
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        statusEl.textContent = `上传中 ${Math.round((e.loaded / e.total) * 100)}% · ${files.length} 文件`;
      }
    });
    xhr.addEventListener('load', () => {
      let data = {};
      try { data = JSON.parse(xhr.responseText); } catch (e) {}
      if (xhr.status >= 200 && xhr.status < 300) {
        statusEl.textContent = '';
        toast('已上传 ' + (data.count || files.length) + ' 个文件', 'success');
        if (state.currentCollection && state.currentCollection.id === id) showDetail(id);
      } else {
        statusEl.textContent = '';
        toast('上传失败: ' + (data.error || 'HTTP ' + xhr.status), 'error');
      }
    });
    xhr.addEventListener('error', () => {
      statusEl.textContent = '';
      toast('上传失败: 网络错误', 'error');
    });
    xhr.send(form);
  }

  // ==================================================================
  // AUDIO UPLOAD DIALOG — home-page entry point for the audio subsystem
  // ==================================================================
  const audioUploadBtn     = $('home-audio-upload-btn');
  const audioUploadDialog  = $('audio-upload-dialog');
  const audioUploadForm    = $('audio-upload-form');
  const audioUploadTarget  = $('audio-upload-target');
  const audioUploadFiles   = $('audio-upload-files');
  const audioUploadError   = $('audio-upload-error');
  const audioUploadProgress = $('audio-upload-progress');
  const audioUploadCancel  = $('audio-upload-cancel');

  async function openAudioUploadDialog() {
    if (!audioUploadDialog || state.kind !== 'audio') return;
    audioUploadError.textContent = '';
    audioUploadProgress.hidden = true;
    audioUploadForm.reset();
    // Populate the target collection dropdown.
    try {
      const { collections } = await api('GET', '/api/collections?includeHidden=1');
      const list = Array.isArray(collections) ? collections : [];
      // Put the default collection first.
      list.sort((a, b) => {
        if (a.protected && !b.protected) return -1;
        if (b.protected && !a.protected) return 1;
        return (a.title || a.id).localeCompare(b.title || b.id, 'zh-CN');
      });
      audioUploadTarget.innerHTML = list.map((c) => {
        const label = c.protected ? `${escapeHtml(c.title || c.id)} · 默认` : escapeHtml(c.title || c.id);
        return `<option value="${escapeHtml(c.id)}">${label}</option>`;
      }).join('');
      if (!list.length) {
        audioUploadError.textContent = '没有可用的音频合集';
      }
    } catch (err) {
      audioUploadError.textContent = '加载合集失败: ' + err.message;
    }
    audioUploadDialog.showModal();
  }
  if (audioUploadBtn) {
    audioUploadBtn.addEventListener('click', openAudioUploadDialog);
  }
  if (audioUploadCancel) {
    audioUploadCancel.addEventListener('click', () => audioUploadDialog.close('cancel'));
  }
  if (audioUploadForm) {
    audioUploadForm.addEventListener('submit', (e) => {
      e.preventDefault();
      audioUploadError.textContent = '';
      const id = audioUploadTarget.value;
      const files = Array.from(audioUploadFiles.files || []);
      if (!id) { audioUploadError.textContent = '请选择合集'; return; }
      if (!files.length) { audioUploadError.textContent = '请选择文件'; return; }
      const form = new FormData();
      for (const f of files) form.append('files', f, f.name);
      const xhr = new XMLHttpRequest();
      xhr.open('POST', subUrl('/api/collections/' + encodeURIComponent(id) + '/upload'));
      xhr.withCredentials = true;
      audioUploadProgress.hidden = false;
      audioUploadProgress.textContent = '上传中 0% · ' + files.length + ' 文件';
      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable) {
          const pct = Math.round((ev.loaded / ev.total) * 100);
          audioUploadProgress.textContent = '上传中 ' + pct + '% · ' + files.length + ' 文件';
        }
      });
      xhr.addEventListener('load', () => {
        let data = {};
        try { data = JSON.parse(xhr.responseText); } catch (e) {}
        if (xhr.status >= 200 && xhr.status < 300) {
          audioUploadDialog.close('confirm');
          toast('已上传 ' + (data.count || files.length) + ' 个文件到 ' + id, 'success');
          // Refresh home or detail if showing.
          if (viewHome && !viewHome.hidden) showHome();
          if (state.currentCollection && state.currentCollection.id === id && viewDetail && !viewDetail.hidden) {
            showDetail(id);
          }
        } else {
          audioUploadError.textContent = '上传失败: ' + (data.error || 'HTTP ' + xhr.status);
          audioUploadProgress.hidden = true;
        }
      });
      xhr.addEventListener('error', () => {
        audioUploadError.textContent = '上传失败: 网络错误';
        audioUploadProgress.hidden = true;
      });
      xhr.send(form);
    });
  }

  function wireDetailDragDrop() {
    viewDetail.addEventListener('dragover', (e) => {
      if (!state.user || !state.currentCollection) return;
      if (!e.dataTransfer.types.includes('Files')) return;
      e.preventDefault();
      viewDetail.classList.add('drag-hover');
    });
    viewDetail.addEventListener('dragleave', (e) => {
      if (e.target !== viewDetail) return;
      viewDetail.classList.remove('drag-hover');
    });
    viewDetail.addEventListener('drop', (e) => {
      viewDetail.classList.remove('drag-hover');
      if (!state.user || !state.currentCollection) return;
      if (!e.dataTransfer.files || !e.dataTransfer.files.length) return;
      e.preventDefault();
      uploadFiles(state.currentCollection.id, Array.from(e.dataTransfer.files));
    });
  }
  wireDetailDragDrop();

  // ==================================================================
  // Helpers
  // ==================================================================
  // URL path encoder that preserves `/` as a segment separator while
  // percent-encoding every other reserved character inside each
  // segment. encodeURIComponent by itself would turn "Season 1/ep.mp4"
  // into "Season%201%2Fep.mp4", which the server's express.static
  // handler rejects as a single (nonexistent) filename rather than a
  // nested path. Split-and-encode keeps the real separator structure.
  function encodePath(p) {
    return String(p || '').split('/').map(encodeURIComponent).join('/');
  }
  /**
   * @brief Build the audio HiFi streaming URL.
   *
   *        Always returns `/audio-stream/<id>/<file>` regardless of
   *        codec — the server-side router decides whether to redirect
   *        to /audio-files (byte-range native) or to spawn ffmpeg for
   *        fmp4-fLaC / DSD-to-FLAC / Opus fallback. Centralizing the
   *        prefix here lets future changes route legacy callers en
   *        masse.
   *
   *        Mirror logic of mediaUrl for the virtual-collection re-
   *        resolution: "__all_audio__" etc. carry _collectionId on
   *        each episode.
   */
  function audioStreamUrl(id, file) {
    let resolvedId = id;
    if (
      (id === '__all_audio__' || id === '__liked_audio__')
      && state.currentCollection
      && state.currentCollection._virtual
    ) {
      const ep = state.currentCollection.episodes.find((e) => e.file === file);
      if (ep && ep._collectionId) resolvedId = ep._collectionId;
    }
    return '/audio-stream/' + encodeURIComponent(resolvedId) + '/' + encodePath(file);
  }

  /**
   * @brief Build the fragmented-MP4 MSE streaming URL for video.
   *
   *        Used by the v1.9.0 ChiralVideoMse controller when the
   *        server-side decideVideoRoute returns 'fmp4-mse'. The URL
   *        intentionally omits ?t= and &sid= — the controller adds
   *        them on each fetch (initial t=0, then ?t=<seek> on every
   *        user-initiated seek).
   */
  function fmp4StreamUrl(id, file, audioStreamIndex) {
    let url = '/api/episode/' + encodeURIComponent(id)
      + '/fmp4-stream?file=' + encodeURIComponent(file);
    // Optional `&a=<absolute ffprobe stream index>` — picks a specific
    // audio track. Server's /api/episode/:id/fmp4-stream handler will
    // map this stream via `-map 0:N` when spawning ffmpeg. Used by
    // switchHlsAudio's fmp4-mse branch (v1.11.0+) to swap languages.
    if (
      typeof audioStreamIndex === 'number'
      && Number.isInteger(audioStreamIndex)
      && audioStreamIndex >= 0
    ) {
      url += '&a=' + audioStreamIndex;
    }
    return url;
  }

  /**
   * @brief Render the HiFi audio metadata badge for an episode.
   *
   *        Uses ep.mediaInfo (populated by lib/audio.js scanAudioMeta
   *        and surfaced via lib/collections.js buildEpisodes) to show
   *        codec, bit depth, sample rate, channels, bitrate, and a
   *        "无损" pill for lossless codecs. Falls back to the legacy
   *        "#01 · FLAC · 25 MB" line when mediaInfo is absent (first
   *        boot, scan-pending, or v1 schema episode).
   *
   *        Returned as HTML so the lossless pill can be a styled
   *        <span class="hifi-badge lossless">. Caller must use
   *        .innerHTML, not .textContent.
   */
  function formatAudioHiFiBadge(ep) {
    if (!ep) return '';
    const mi = ep.mediaInfo;
    const fallback = () => [
      '#' + String(ep.order || 0).padStart(2, '0'),
      escapeHtml((ep.ext || '').toUpperCase()),
      escapeHtml(formatSize(ep.size)),
    ].join(' · ');
    if (!mi || mi.error || !Array.isArray(mi.audio) || mi.audio.length === 0) {
      return fallback();
    }
    const a = mi.audio[0];
    if (!a || !a.codec) return fallback();
    let codec = String(a.codec).toUpperCase();
    if (codec === 'PCM_S16LE' || codec === 'PCM_S24LE' || codec === 'PCM_S32LE'
      || codec === 'PCM_S16BE' || codec === 'PCM_S24BE' || codec === 'PCM_S32BE'
      || codec.startsWith('PCM_F')) {
      codec = 'PCM';
    } else if (codec.startsWith('DSD_')) {
      codec = 'DSD';
    } else if (codec === 'MP4A' || codec === 'MP4A-40-2') {
      codec = 'AAC';
    }
    const parts = [];
    let spec = codec;
    if (a.bitDepth) spec += ' ' + a.bitDepth + 'bit';
    if (a.sampleRate) {
      const khz = a.sampleRate / 1000;
      spec += (a.bitDepth ? '/' : ' ') + (Number.isInteger(khz) ? khz : khz.toFixed(1)) + 'kHz';
    }
    parts.push(escapeHtml(spec));
    if (a.channels) parts.push(escapeHtml(a.channels + 'ch'));
    if (a.bitrate && a.bitrate > 0) {
      parts.push(escapeHtml(Math.round(a.bitrate / 1000) + 'kbps'));
    }
    let html = parts.join(' · ');
    if (a.lossless) {
      html += ' <span class="hifi-badge lossless">无损</span>';
    } else {
      html += ' <span class="hifi-badge lossy">有损</span>';
    }
    return html;
  }

  function mediaUrl(id, file) {
    const base = state.kind === 'image' ? '/image-files'
               : state.kind === 'audio' ? '/audio-files'
               : state.kind === 'novel' ? '/novel-files'
               : '/media';
    // Virtual "all audio" playlist: each episode carries its own
    // _collectionId pointing to the real collection on disk.
    let resolvedId = id;
    if ((id === '__all_audio__' || id === '__liked_audio__' || id === '__liked_images__') && state.currentCollection && state.currentCollection._virtual) {
      const ep = state.currentCollection.episodes.find((e) => e.file === file);
      if (ep && ep._collectionId) resolvedId = ep._collectionId;
    }
    return base + '/' + encodeURIComponent(resolvedId) + '/' + encodePath(file);
  }
  // Thumbnail URL for image previews (home page, detail grid, liked grid).
  // Falls back to full image URL for non-image subsystems.
  function thumbUrl(id, file) {
    if (state.kind !== 'image') return mediaUrl(id, file);
    let resolvedId = id;
    if ((id === '__liked_images__') && state.currentCollection && state.currentCollection._virtual) {
      const ep = state.currentCollection.episodes.find((e) => e.file === file);
      if (ep && ep._collectionId) resolvedId = ep._collectionId;
    }
    return '/image-thumbs/' + encodeURIComponent(resolvedId) + '/' + encodePath(file);
  }
  // Containers served byte-for-byte by /media (full Range seek, full
  // duration metadata, all internal streams preserved). Anything
  // outside this set goes through /media-stream, which ffmpeg muxes
  // into a fragmented MP4 on the fly — that transcode drops every
  // audio track past the first, drops all subtitle tracks, and
  // produces a stream the browser cannot byte-range seek (the
  // duration shows up as one GOP ≈ 20s and any seek triggers a
  // server-side restart from ?t=).
  //
  // .mkv was added in 1.7.21 because:
  //   - user wanted full multi-audio / multi-subtitle preservation
  //     for Project.Hail.Mary.2026 (mkv with several language tracks)
  //   - Chrome / Edge / Safari 16+ decode H264+AAC mkv natively
  //   - the player.error handler below auto-falls-back to
  //     /media-stream on MEDIA_ERR_SRC_NOT_SUPPORTED, so Firefox /
  //     HEVC / DTS-only mkvs degrade gracefully to transcode
  //
  // Mirror of config.VIDEO_SAFE_NATIVE_EXTS — keep them in sync.
  const SAFE_NATIVE_VIDEO_EXTS = new Set(['mp4', 'm4v', 'webm', 'mkv']);
  function normalizeExt(ext) {
    if (!ext) return '';
    return String(ext).replace(/^\./, '').toLowerCase();
  }
  function needsTranscode(ext) {
    return !SAFE_NATIVE_VIDEO_EXTS.has(normalizeExt(ext));
  }
  // URL builder that picks between the raw static mount and the ffmpeg
  // transcode stream based on the file extension. For streamed sources
  // the `startSec` option maps to the server's `?t=` query parameter,
  // which ffmpeg uses as an input-seek offset — that's how we implement
  // "resume from progress" and mid-playback seeks for non-seekable
  // transcoded streams.
  function videoSrcFor(id, file, opts) {
    const o = opts || {};
    const startSec = o.startSec || 0;
    const audioStreamIndex = (
      typeof o.audioStreamIndex === 'number'
      && Number.isInteger(o.audioStreamIndex)
      && o.audioStreamIndex >= 0
    ) ? o.audioStreamIndex : null;
    // 1.7.36 added opts.forceStream so callers can override the
    // ext-only native check. Use case: showPlayer's audio-codec
    // probe (1.7.35) detects EAC3/DTS/TrueHD/MLP audio inside an
    // otherwise-native ext (.mkv) and needs to route around
    // /media to /media-stream so ffmpeg transcodes the unsupported
    // audio. Without this flag, the URL builder still saw `.mkv`
    // and returned the static /media URL — ep would play silent.
    const forceStream = !!o.forceStream;
    // Extension detection must look at the BARE filename, not the full
    // relative path — "Season 1/S01E01.mp4" has ext "mp4", not "1/S01E01.mp4".
    const bare = (file || '').split('/').pop();
    const ext = bare.split('.').pop();
    if (!forceStream && !needsTranscode(ext) && audioStreamIndex == null) {
      return '/media/' + encodeURIComponent(id) + '/' + encodePath(file);
    }
    let base = '/media-stream/' + encodeURIComponent(id) + '/' + encodePath(file);
    const params = [];
    if (startSec > 0) params.push('t=' + Math.floor(startSec));
    // v1.11.0+ pass audio index when caller specified one. Server's
    // /media-stream handler (line ~533) reads ?a= and forwards it
    // through ffmpeg.streamTo → mixedArgs → -map 0:N.
    if (audioStreamIndex != null) params.push('a=' + audioStreamIndex);
    if (params.length) base += '?' + params.join('&');
    return base;
  }
  // Client-side mirror of server.js's VIDEO_MIME map. Used when handing
  // sources to Plyr's quality switcher — Plyr wants a valid `type` hint
  // or it won't switch quality levels cleanly. The naive `'video/' + ext`
  // concatenation produced nonsense like `video/mkv` which isn't a real
  // MIME type. Fall back to `video/mp4` for unknown extensions since
  // that's the most widely accepted guess.
  const CLIENT_VIDEO_MIME = {
    mp4: 'video/mp4', m4v: 'video/mp4',
    webm: 'video/webm',
    ogv: 'video/ogg', ogg: 'video/ogg',
    mov: 'video/quicktime',
    mkv: 'video/x-matroska',
    avi: 'video/x-msvideo',
    wmv: 'video/x-ms-wmv',
    flv: 'video/x-flv',
    ts: 'video/mp2t', mts: 'video/mp2t', m2ts: 'video/mp2t',
    '3gp': 'video/3gpp',
    rmvb: 'application/vnd.rn-realmedia-vbr',
    rm: 'application/vnd.rn-realmedia',
  };
  function mimeTypeForVideo(filename) {
    const ext = normalizeExt((filename || '').split('.').pop());
    return CLIENT_VIDEO_MIME[ext] || 'video/mp4';
  }
  function showPlayerError(message, downloadUrl, downloadName) {
    playerErrorMsg.textContent = message;
    playerErrorDownload.href = downloadUrl || '#';
    playerErrorDownload.setAttribute('download', downloadName || '');
    playerErrorOverlay.hidden = false;
  }
  function hidePlayerError() {
    playerErrorOverlay.hidden = true;
  }

  /**
   * @brief Show / hide / update the audio-remux loading overlay.
   *        Used while server-side ffmpeg copies video + transcodes
   *        EAC3/DTS/TrueHD/MLP audio to AAC for an mkv. The user
   *        sees a spinner + progress percent instead of a black
   *        video frame; once the cache is ready the overlay hides
   *        and source switches to the remuxed mp4.
   */
  function showPlayerLoading(msg, progress) {
    const overlay = document.getElementById('player-loading-overlay');
    if (!overlay) return;
    const m = document.getElementById('player-loading-msg');
    const p = document.getElementById('player-loading-progress');
    if (m) m.textContent = msg || '正在加载…';
    if (p) p.textContent = (progress != null) ? Math.round(progress * 100) + '%' : '';
    overlay.hidden = false;
  }
  function updatePlayerLoading(msg, progress) {
    const overlay = document.getElementById('player-loading-overlay');
    if (!overlay || overlay.hidden) return;
    if (msg != null) {
      const m = document.getElementById('player-loading-msg');
      if (m) m.textContent = msg;
    }
    if (progress != null) {
      const p = document.getElementById('player-loading-progress');
      if (p) p.textContent = Math.round(progress * 100) + '%';
    }
  }
  function hidePlayerLoading() {
    const overlay = document.getElementById('player-loading-overlay');
    if (overlay) overlay.hidden = true;
  }

  /**
   * @brief Tear down any active hls.js instance attached to the
   *        global <video>. Idempotent. Called from episode-change
   *        and close-player cleanup paths so a previous ep's MSE
   *        SourceBuffer doesn't leak / collide when the new ep
   *        doesn't need HLS (most common case after the user moves
   *        from an EAC3 mkv to an AAC mkv). Also stops the
   *        server-side transcode heartbeat — see startHlsHeartbeat
   *        for why that matters.
   */
  function disposeHls() {
    stopHlsHeartbeat();
    if (state.hls) {
      try { state.hls.destroy(); } catch (_e) {}
      state.hls = null;
    }
    // v1.11.0 — also tear down the fmp4-mse controller on the same
    // disposal path. Two pipelines feeding the same <video> element
    // is the most common cause of "no audio after switching ep" or
    // "stale frames at the start" in mixed-codec libraries.
    if (state.videoMse) {
      try { state.videoMse.destroy(); } catch (_e) {}
      state.videoMse = null;
    }
  }

  /**
   * @brief Start (or replace) the periodic POST that tells the
   *        server "I am still watching this HLS key". The server
   *        runs ffmpeg at nice 10 by default and demotes to nice 19
   *        after HLS_HEARTBEAT_TTL (45s) of silence — heartbeats
   *        are how we keep the active viewer's transcode at full
   *        priority while still allowing background-tab transcodes
   *        to drift down and yield CPU.
   *
   *        20s cadence: server demote threshold is 45s, so we can
   *        miss one beat (network jitter, brief mobile tab freeze)
   *        without triggering an unnecessary demote. Demote is
   *        one-way (RLIMIT_NICE on the DS124 prevents promoting
   *        back), so getting it wrong has a real cost — the slow
   *        cadence + 2x-tolerance is intentional.
   *
   *        Replaces any prior heartbeat — switchHlsAudio gets a
   *        new key for the new audio track and the old one's
   *        heartbeat is implicitly cancelled here.
   */
  function startHlsHeartbeat(key) {
    stopHlsHeartbeat();
    state._hlsHeartbeatKey = key;
    state._hlsHeartbeatTimer = setInterval(async () => {
      const cur = state._hlsHeartbeatKey;
      if (!cur) return;
      try {
        const r = await fetch('/api/hls-heartbeat?key=' + encodeURIComponent(cur),
                              { method: 'POST' });
        if (r.ok) {
          const body = await r.json();
          // 'gone' = ffmpeg already finished (ENDLIST written, job
          // dropped from hlsJobs). Cache is canonical; nothing to
          // ping anymore.
          if (body.status === 'gone') stopHlsHeartbeat();
        }
      } catch (_e) {
        // Network blip — let next tick retry. Don't tear down on
        // a single failed POST or a flaky wifi drops the whole
        // priority promotion.
      }
    }, 20000);
  }
  function stopHlsHeartbeat() {
    if (state._hlsHeartbeatTimer) {
      clearInterval(state._hlsHeartbeatTimer);
      state._hlsHeartbeatTimer = null;
    }
    state._hlsHeartbeatKey = null;
  }

  /**
   * @brief POST /api/collection/:id/pretranscode-mkv for a single
   *        collection and surface the result.
   *
   *        Two callers today:
   *          - bulk-manage bottom bar (looped over selected ids)
   *            sends no body and gets batch behavior — server walks
   *            the collection, skips files whose audio is already
   *            browser-safe, enqueues the rest.
   *          - per-collection transcode modal sends
   *            `{files:[rel...], force:bool}` to enqueue only the
   *            files the admin checked, optionally wiping cache for
   *            re-transcoded entries.
   *
   * @param cid  Collection id.
   * @param opts Options:
   *               silent: suppress error toast on failure.
   *               body:   request JSON body (forwarded to server as-is).
   *                       Omit for legacy batch behavior.
   *
   * @returns object with the response counts on success, null on
   *          failure (already toast-reported unless silent).
   */
  async function enqueuePretranscodeForCollection(cid, opts) {
    try {
      const init = { method: 'POST' };
      if (opts && opts.body) {
        init.headers = { 'Content-Type': 'application/json' };
        init.body = JSON.stringify(opts.body);
      }
      const r = await fetch('/api/collection/' + encodeURIComponent(cid) + '/pretranscode-mkv', init);
      if (!r.ok) {
        let msg = 'HTTP ' + r.status;
        try { const e = await r.json(); if (e.error) msg += ': ' + e.error; } catch (_e) {}
        throw new Error(msg);
      }
      return await r.json();
    } catch (e) {
      if (!(opts && opts.silent)) toast('入队失败 ' + cid + ': ' + e.message, 'error');
      return null;
    }
  }

  /**
   * @brief Fetch the per-collection mkv list with HLS cache state.
   *        Powers the transcode picker modal.
   * @returns {Promise<{mkvs, totalMkvs} | null>}
   */
  async function fetchMkvStatus(cid) {
    try {
      const r = await fetch('/api/collection/' + encodeURIComponent(cid) + '/mkv-status');
      if (!r.ok) {
        let msg = 'HTTP ' + r.status;
        try { const e = await r.json(); if (e.error) msg += ': ' + e.error; } catch (_e) {}
        throw new Error(msg);
      }
      return await r.json();
    } catch (e) {
      toast('扫描失败: ' + e.message, 'error');
      return null;
    }
  }

  /**
   * @brief Human label for a cacheStatus value from /mkv-status.
   *        Kept tiny so renderTranscodeRows reads cleanly.
   */
  function transcodeStatusLabel(st) {
    switch (st) {
      case 'cached':         return '已转码';
      case 'cached-partial': return '缓存残缺';
      case 'queued':         return '队列中';
      case 'running':        return '转码中';
      default:               return '未转码';
    }
  }

  /**
   * @brief Render the list of rows in the transcode modal from the
   *        current modal state. Each row is a clickable <label>
   *        wrapping a checkbox + filename + path + status + size.
   *        Running / queued rows are non-interactive (no point
   *        re-enqueuing — they're already in flight); cached and
   *        none rows are selectable.
   *
   *        Defaults at first render:
   *          - none → checked
   *          - cached-partial → checked (resume from scratch)
   *          - cached → unchecked (user opts in for re-transcode)
   *          - queued / running → unchecked + disabled
   */
  function renderTranscodeRows() {
    if (!transcodeList) return;
    const mkvs = transcodeModalState.mkvs || [];
    if (mkvs.length === 0) {
      transcodeList.innerHTML = '<div class="transcode-list-empty">合集下没有 mkv 文件</div>';
      updateTranscodeSelectedCount();
      return;
    }
    const parts = [];
    for (let i = 0; i < mkvs.length; i++) {
      const m = mkvs[i];
      const st = m.cacheStatus || 'none';
      const disabled = (st === 'queued' || st === 'running');
      const defaultChecked = (st === 'none' || st === 'cached-partial');
      const rowCls = 'transcode-row' + (disabled ? ' disabled' : '');
      const subdir = m.rel.includes('/') ? m.rel.slice(0, m.rel.lastIndexOf('/')) : '';
      const pathLine = subdir ? '<span class="row-path">' + escapeHtml(subdir) + '/</span>' : '';
      parts.push(
        '<label class="' + rowCls + '" data-idx="' + i + '">'
        + '<input type="checkbox" class="transcode-row-check"'
        + (defaultChecked ? ' checked' : '')
        + (disabled ? ' disabled' : '')
        + ' data-st="' + st + '">'
        + '<span class="transcode-row-name">'
        + '<span class="row-name-line" title="' + escapeHtml(m.epFile) + '">'
        + escapeHtml(m.epFile) + '</span>'
        + pathLine
        + '</span>'
        + '<span class="transcode-row-status" data-st="' + st + '">'
        + transcodeStatusLabel(st) + '</span>'
        + '<span class="transcode-row-size">' + formatSize(m.sizeBytes || 0) + '</span>'
        + '</label>',
      );
    }
    transcodeList.innerHTML = parts.join('');
    updateTranscodeSelectedCount();
  }

  /**
   * @brief Recount the ticked rows and update the header counter.
   *        Also disables / enables the submit button — submitting
   *        zero files is a no-op so we block it at the UI layer.
   */
  function updateTranscodeSelectedCount() {
    if (!transcodeList || !transcodeSelectedCount) return;
    const checks = transcodeList.querySelectorAll('input.transcode-row-check:checked:not(:disabled)');
    transcodeSelectedCount.textContent = String(checks.length);
    if (transcodeSubmit) transcodeSubmit.disabled = checks.length === 0;
  }

  /**
   * @brief Open the per-collection transcode picker for cid. Fetches
   *        mkv-status, renders rows, shows the dialog. Re-fetches on
   *        every open so cache state reflects the latest queue tick.
   */
  async function openTranscodeModalForCollection(cid) {
    if (!transcodeModal) return;
    transcodeModalState.cid = cid;
    transcodeModalState.mkvs = [];
    if (transcodeError) transcodeError.textContent = '';
    if (transcodeSubtitle) transcodeSubtitle.textContent = '扫描中…';
    if (transcodeList) transcodeList.innerHTML = '<div class="transcode-list-empty">加载中…</div>';
    if (transcodeSubmit) transcodeSubmit.disabled = true;
    transcodeModal.showModal();
    const r = await fetchMkvStatus(cid);
    // Bail if the user closed the modal while waiting on the fetch.
    // Submit is disabled until renderTranscodeRows so partial state
    // can't be acted on.
    if (!transcodeModal.open || transcodeModalState.cid !== cid) return;
    if (!r) {
      if (transcodeSubtitle) transcodeSubtitle.textContent = '加载失败';
      if (transcodeList) transcodeList.innerHTML = '<div class="transcode-list-empty">加载失败，请重试</div>';
      return;
    }
    transcodeModalState.mkvs = Array.isArray(r.mkvs) ? r.mkvs : [];
    if (transcodeSubtitle) {
      const counts = { cached: 0, 'cached-partial': 0, queued: 0, running: 0, none: 0 };
      for (const m of transcodeModalState.mkvs) {
        const st = m.cacheStatus || 'none';
        if (counts[st] != null) counts[st]++;
      }
      transcodeSubtitle.textContent = 'mkv ' + transcodeModalState.mkvs.length
        + ' · 已转 ' + counts.cached
        + ' · 残缺 ' + counts['cached-partial']
        + ' · 队列 ' + counts.queued
        + ' · 转码中 ' + counts.running
        + ' · 未转 ' + counts.none;
    }
    renderTranscodeRows();
  }

  // Toolbar buttons: bulk select / clear / "select needed" (only
  // none + cached-partial). Each operates on the currently rendered
  // rows, ignoring disabled ones.
  if (transcodeSelectAll) transcodeSelectAll.addEventListener('click', () => {
    if (!transcodeList) return;
    const checks = transcodeList.querySelectorAll('input.transcode-row-check:not(:disabled)');
    checks.forEach((c) => { c.checked = true; });
    updateTranscodeSelectedCount();
  });
  if (transcodeClearSel) transcodeClearSel.addEventListener('click', () => {
    if (!transcodeList) return;
    const checks = transcodeList.querySelectorAll('input.transcode-row-check');
    checks.forEach((c) => { c.checked = false; });
    updateTranscodeSelectedCount();
  });
  if (transcodeSelectNeeded) transcodeSelectNeeded.addEventListener('click', () => {
    if (!transcodeList) return;
    const checks = transcodeList.querySelectorAll('input.transcode-row-check:not(:disabled)');
    checks.forEach((c) => {
      const st = c.getAttribute('data-st');
      c.checked = (st === 'none' || st === 'cached-partial');
    });
    updateTranscodeSelectedCount();
  });
  // Per-row click → recount. Delegated since rows are re-rendered
  // on every modal open.
  if (transcodeList) transcodeList.addEventListener('change', (ev) => {
    if (ev.target && ev.target.classList && ev.target.classList.contains('transcode-row-check')) {
      updateTranscodeSelectedCount();
    }
  });
  if (transcodeCancel) transcodeCancel.addEventListener('click', () => {
    transcodeModal && transcodeModal.close('cancel');
  });
  // Submit: collect checked rows, classify into "force needed"
  // (cached / cached-partial) vs. plain enqueue. If any need force,
  // confirm with the admin before nuking caches.
  if (transcodeForm) transcodeForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!transcodeError) return;
    transcodeError.textContent = '';
    const cid = transcodeModalState.cid;
    if (!cid) return;
    const rows = transcodeList.querySelectorAll('label.transcode-row');
    const picked = [];
    let hasCached = false;
    let hasPartial = false;
    rows.forEach((rowEl) => {
      const cb = rowEl.querySelector('input.transcode-row-check');
      if (!cb || !cb.checked || cb.disabled) return;
      const idx = Number(rowEl.getAttribute('data-idx'));
      const m = transcodeModalState.mkvs[idx];
      if (!m) return;
      picked.push(m);
      if (m.cacheStatus === 'cached') hasCached = true;
      if (m.cacheStatus === 'cached-partial') hasPartial = true;
    });
    if (picked.length === 0) {
      transcodeError.textContent = '请至少选择一个文件';
      return;
    }
    // Re-transcode of a fully-cached file destroys its current
    // playable cache. The user can absolutely opt in (that's the
    // whole point of the feature) but we make them confirm once.
    // Partial caches are auto-overwritten without prompting since
    // they're not "currently playable" anyway.
    const needForce = hasCached || hasPartial;
    if (hasCached) {
      const ok = window.confirm(
        '所选文件中有已完整转码的，重新转码将删除现有缓存并从头转。继续吗？',
      );
      if (!ok) return;
    }
    transcodeSubmit.disabled = true;
    const d = await enqueuePretranscodeForCollection(cid, {
      body: {
        files: picked.map((m) => m.rel),
        force: needForce,
      },
    });
    transcodeSubmit.disabled = false;
    if (!d) return;
    const lines = [];
    if (d.added) lines.push('入队 ' + d.added);
    if (d.skippedCached) lines.push('已缓存跳过 ' + d.skippedCached);
    if (d.skippedQueued) lines.push('队列跳过 ' + d.skippedQueued);
    if (d.skippedAudioOK || d.skippedH264) lines.push('已兼容跳过 ' + (d.skippedAudioOK || d.skippedH264));
    if (d.missing) lines.push('丢失 ' + d.missing);
    lines.push('队列 ' + d.queueSize);
    toast(lines.join(' / '), d.added ? 'success' : 'info', 5000);
    transcodeModal.close('ok');
  });

  /**
   * @brief Lazy-load hls.js (vendor/hls/hls.min.js, IIFE bundle that
   *        attaches to window.Hls) on first use. Caches the constructor
   *        on state so repeated calls are instant.
   * @returns Promise<typeof Hls|null> — the Hls class on success, null
   *          on script-load error.
   */
  function loadHlsJs() {
    if (window.Hls) return Promise.resolve(window.Hls);
    if (state._hlsLoading) return state._hlsLoading;
    state._hlsLoading = new Promise((resolve) => {
      const s = document.createElement('script');
      s.src = '/vendor/hls/hls.min.js';
      s.onload = () => resolve(window.Hls || null);
      s.onerror = () => resolve(null);
      document.head.appendChild(s);
    });
    return state._hlsLoading;
  }

  /**
   * @brief Kick off server-side HLS transcode for an episode and
   *        return the cache key needed to construct the playlist URL.
   *
   *        Server probes audio codec; if browser-safe, returns
   *        {status:'not-needed'} and we skip HLS entirely. Otherwise
   *        starts ffmpeg HLS event-mode transcode and waits for the
   *        first segment + playlist manifest to materialize on disk
   *        (typically 3-10 seconds). Returns once /hls-cache/<key>/
   *        playlist.m3u8 is fetchable.
   *
   * @returns Promise<string|null> — sha1 cache key on success, null
   *          if HLS isn't needed (audio is browser-safe) OR start
   *          failed for any reason.
   */
  async function startHlsAndWait(collectionId, epFile, audioStreamIndex) {
    let url = '/api/episode/' + encodeURIComponent(collectionId)
      + '/hls-start?file=' + encodeURIComponent(epFile);
    if (audioStreamIndex != null) {
      url += '&a=' + encodeURIComponent(audioStreamIndex);
    }
    // v1.9.0 server-side response shape:
    //   { status: 'not-needed' }         browser-native codec, native serve
    //   { status: 'ready',       key }   cache hit ENDLIST, attach hls
    //   { status: 'transcoding', key, segments, paused, tier, message }
    //                                    queue-running for this key, NOT
    //                                    ready yet → caller must NOT play
    //   { status: 'queued',      key, position, queueSize, message }
    //                                    no cache no in-flight → enqueued
    //                                    → caller must NOT play
    //
    // Pre-1.9.0 503 + status:queued (HLS_MAX_ACTIVE cap) is gone, but
    // the legacy retry loop is kept for backwards compatibility in case
    // the server is still on an older build during a partial deploy.
    //
    // For 'transcoding' / 'queued' we throw a tagged error so the caller
    // can distinguish "no HLS needed" (return null) from "HLS needed but
    // not ready" (must abort player flow, NOT fallback to /media native
    // serve — that would feed a multi-channel EAC3 mkv directly to the
    // browser, which decodes the H.264 video but leaves audio silent
    // because Chromium has no EAC3 decoder).
    const queueDeadline = Date.now() + 60000;
    for (;;) {
      let r;
      try { r = await fetch(url); }
      catch (_e) { return null; }
      if (r.status === 503) {
        let body = {};
        try { body = await r.json(); } catch (_e) {}
        if (body.status === 'queued' && Date.now() < queueDeadline) {
          toast('排队中，已有 ' + (body.activeCount || '?') + '/2 路转码…', 'info', 2500);
          await new Promise((res) => setTimeout(res, 5000));
          continue;
        }
        return null;
      }
      if (!r.ok) return null;
      let data;
      try { data = await r.json(); } catch (_e) { return null; }
      if (data.status === 'not-needed') return null;
      if (data.status === 'streaming' || data.status === 'ready') {
        startHlsHeartbeat(data.key);
        return data.key;
      }
      if (data.status === 'transcoding' || data.status === 'queued') {
        const err = new Error('transcoding-pending');
        err.code = 'transcoding-pending';
        err.detail = data;
        throw err;
      }
      return null;
    }
  }

  /**
   * @brief Format a v1.9.0 'transcoding' / 'queued' status payload into
   *        a user-facing toast string. Centralised here because two
   *        call sites (initial play + audio track switch) both surface
   *        the same UI when a multi-channel mkv hasn't finished
   *        transcoding yet.
   */
  function formatTranscodingMessage(detail) {
    if (!detail) return '视频转码尚未完成，请稍后再试';
    if (detail.status === 'queued') {
      const pos = detail.position || '?';
      const qSize = detail.queueSize || '?';
      return `视频排队中（第 ${pos}/${qSize}），后台正在按顺序转码。请几分钟到几小时后再来`;
    }
    if (detail.status === 'transcoding') {
      const segs = detail.segments != null ? detail.segments : 0;
      const tail = detail.paused ? '（系统繁忙中暂停）' : '';
      return `视频转码进行中，已完成 ${segs} 段${tail}。等转完后再播会有声音`;
    }
    return detail.message || '视频转码尚未完成，请稍后再试';
  }

  /**
   * @brief Fetch /api/episode/.../codecs and project out the audio
   *        track list. Used by the HLS picker to populate its menu
   *        with language / title / channel labels — the in-browser
   *        HLS stream only carries one audio rendition (the one we
   *        asked ffmpeg to map), so HTMLMediaElement.audioTracks is
   *        useless here.
   *
   * @returns Promise<Array<{streamIndex, codec, language, title,
   *          channels, default}>> — empty array on probe failure.
   */
  async function fetchEpisodeAudioTracks(collectionId, epFile) {
    const url = '/api/episode/' + encodeURIComponent(collectionId)
      + '/codecs?file=' + encodeURIComponent(epFile);
    try {
      const r = await fetch(url);
      if (!r.ok) return [];
      const data = await r.json();
      return Array.isArray(data && data.audioTracks) ? data.audioTracks : [];
    } catch (_e) {
      return [];
    }
  }

  /**
   * @brief Bind a Hls.js instance to the global <video> for a given
   *        playlist URL. Tears down any previous instance first.
   *        Resolves once Hls.js fires MANIFEST_PARSED so the caller
   *        knows playback can start.
   */
  async function attachHls(playlistUrl) {
    const Hls = await loadHlsJs();
    if (!Hls) {
      throw new Error('hls.js failed to load');
    }
    // Dispose any previous instance for the same <video>.
    if (state.hls) {
      try { state.hls.destroy(); } catch (_e) {}
      state.hls = null;
    }
    return new Promise((resolve, reject) => {
      if (!Hls.isSupported()) {
        // Safari handles HLS natively without Hls.js — set src directly.
        player.src = playlistUrl;
        player.addEventListener('loadedmetadata', () => resolve(), { once: true });
        player.addEventListener('error', () => reject(new Error('native HLS error')), { once: true });
        return;
      }
      const hls = new Hls({
        // Slightly aggressive playlist refresh so newly-encoded
        // segments appear without the user noticing.
        liveSyncDuration: 6,
        liveMaxLatencyDuration: 30,
      });
      state.hls = hls;
      hls.loadSource(playlistUrl);
      hls.attachMedia(player);
      hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
      hls.on(Hls.Events.ERROR, (_evt, data) => {
        if (data.fatal) reject(new Error('hls.js fatal: ' + data.type + ' / ' + data.details));
      });
    });
  }

  /**
   * @brief v1.11.0 — attach the ChiralVideoMse controller to <video>
   *        for the fmp4-mse zero-wait video lane.
   *
   *        Resolves once the first SourceBuffer has data (the
   *        controller's `onPlayable` callback). Rejects on any
   *        fmp4-mse failure so the caller can fall back to HLS.
   *
   *        Tears down any prior hls.js or ChiralVideoMse instance to
   *        prevent two pipelines feeding the same <video> element.
   *
   *        Requires ChiralVideoMse + MP4Box to be loaded (index.html
   *        loads them before app.js). When either is missing
   *        synchronously throws so the caller picks HLS immediately.
   *
   * @param {string} streamBaseUrl Full URL to /api/episode/:id/fmp4-stream?file=...
   * @param {string} sessionId     Per-tab disambiguator. Empty string is OK.
   * @returns {Promise<void>} resolves when video has its first frame.
   */
  /**
   * @brief Invoke play() and swallow the Promise reject ifs the browser
   *        decides the request was interrupted (AbortError).
   *
   *        HTMLMediaElement.play() returns a Promise that rejects with
   *        AbortError when the browser preempts it — e.g. a new
   *        `src` assignment, a `pause()` call from JS, a seek before
   *        the first frame decodes. The MSE pipeline rebuilds its
   *        MediaSource on every seek-restart, which sets a new
   *        blob: URL into <video>.src; that triggers the abort and
   *        the orphaned Promise prints as an "Uncaught (in promise)"
   *        in DevTools. Wrapping every play() through this helper
   *        keeps the console clean and avoids confusing users who
   *        glance at the error overlay.
   */
  function safePlay() {
    try {
      const p = state.plyr ? state.plyr.play() : player.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* swallow */ });
    } catch (_e) { /* swallow */ }
  }

  async function attachFmp4Mse(streamBaseUrl, sessionId, startSec) {
    // Dispose prior pipelines.
    if (state.hls) {
      try { state.hls.destroy(); } catch (_e) {}
      state.hls = null;
    }
    if (state.videoMse) {
      try { state.videoMse.destroy(); } catch (_e) {}
      state.videoMse = null;
    }
    if (typeof window.ChiralVideoMse === 'undefined' || typeof window.MP4Box === 'undefined') {
      throw new Error('fmp4-mse-unavailable');
    }
    const startAt = Number(startSec) > 0 ? Number(startSec) : 0;
    return new Promise((resolve, reject) => {
      let settled = false;
      // Hard 8s timeout. If mp4box doesn't reach onPlayable in that
      // window the source bitstream is most likely something its
      // demuxer can't handle (PTS inconsistencies, weird codec
      // params, container quirks — Redline.mkv being the canonical
      // case). Rejecting here lets the caller fall back to the
      // fmp4-streamTo lane (plain <video src>) instead of leaving
      // the loading overlay spinning forever with no error in the
      // console (the silent-failure mode the user hit on Redline).
      const timeoutHandle = setTimeout(() => {
        if (settled) return;
        settled = true;
        if (state.videoMse) {
          try { state.videoMse.destroy(); } catch (_e) {}
          state.videoMse = null;
        }
        reject(new Error('fmp4-mse:timeout'));
      }, 8000);
      const onError = (tag) => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutHandle);
        // Cleanup the half-initialized controller before rejecting so
        // the caller starting the fallback path doesn't race with
        // stale appendBuffer calls.
        if (state.videoMse) {
          try { state.videoMse.destroy(); } catch (_e) {}
          state.videoMse = null;
        }
        reject(new Error('fmp4-mse:' + tag));
      };
      const onPlayable = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timeoutHandle);
        resolve();
      };
      state.videoMse = new ChiralVideoMse(player, { onError, onPlayable });
      state.videoMse.start(streamBaseUrl, sessionId || '', startAt);
    });
  }

  /**
   * @brief Switch the HLS audio rendition to a different absolute
   *        ffprobe stream index. The server caches per (cid|file|a)
   *        so the first switch to a given language pays the ffmpeg
   *        spawn + first-segment latency (typically 5-10s for an
   *        H264-copy source, 15-30s for an HEVC re-encode), and
   *        subsequent switches back to that language are instant.
   *
   *        Preserves play position by snapshotting currentTime
   *        before the switch and restoring it on the new pipeline's
   *        first canplay. Auto-resume keeps the speed setting too.
   *
   * @param newStreamIdx Absolute ffprobe stream index of the
   *                     desired audio track (e.g. 3 for English on
   *                     Ghost in the Shell). Must come from one of
   *                     the entries in state.serverAudioTracks.
   */
  async function switchHlsAudio(newStreamIdx) {
    if (!state.hlsCollectionId || !state.hlsEpFile) return;
    const cid = state.hlsCollectionId;
    const epFile = state.hlsEpFile;
    const wasTime = (() => {
      try { return state.plyr ? state.plyr.currentTime : player.currentTime; }
      catch (_e) { return 0; }
    })();
    showPlayerLoading('切换音轨…');

    // v1.11.1 audio-switch fallback ladder (mirrors playEpisode):
    //
    //   step 1: fmp4-mse with &a=<newStreamIdx>  — DISABLED by default
    //   step 2: fmp4-streamTo with ?a=<newStreamIdx>  ← default
    //   step 3: HLS with new audioStreamIndex (legacy queue path)
    //
    // Step 1 only runs when state.videoMse exists (set by the
    // playEpisode fmp4-mse success path), which currently never
    // happens because playEpisode defaults to fmp4-streamTo too.
    // The branch is preserved for the future toggle.
    //
    // Step 2 NEVER enqueues server-side HLS. The /media-stream
    // endpoint is request-scoped: ffmpeg spawns, streams, exits when
    // the response closes. No background ffmpeg lingers, no toast
    // about "transcoding in queue" — the user just sees the picture
    // briefly switch then continue with the new language.

    // ----- Step 1: fmp4-mse with new audio idx -----
    if (state.videoMse) {
      try {
        const newStreamUrl = fmp4StreamUrl(cid, epFile, newStreamIdx);
        await attachFmp4Mse(newStreamUrl, '', wasTime);
        state.currentHlsAudioIdx = newStreamIdx;
        hidePlayerLoading();
        const onCanPlay = () => {
          try { if (state.plyr) state.plyr.speed = state.playerSpeed; } catch (_e) {}
          safePlay();
        };
        if (state.plyr) state.plyr.once('canplay', onCanPlay);
        else player.addEventListener('canplay', onCanPlay, { once: true });
        if (window.console && window.console.info) {
          window.console.info('[switchHlsAudio] fmp4-mse switched to a=' + newStreamIdx);
        }
        return;
      } catch (e) {
        if (window.console && window.console.warn) {
          window.console.warn(
            '[switchHlsAudio] fmp4-mse switch failed (' + (e && e.message) + '), trying fmp4-streamTo'
          );
        }
      }
    }

    // ----- Step 2: fmp4-streamTo with ?a=<newStreamIdx> -----
    // No HLS queue involvement. Server's /media-stream endpoint
    // (line ~506 in server.js) reads ?a= and forwards to
    // ffmpeg.streamTo → mixedArgs → -map 0:<idx>.
    try {
      disposeHls(); // tear down any prior pipeline
      // v1.11.1: flag state.currentIsStream so seek-on-streamTo
      // (line ~13431 player.seeking listener) translates user
      // jumps into a fresh /media-stream?t= request. Without this
      // the player would stall on every fast-forward.
      state.currentIsStream = true;
      state.streamStartSec = wasTime > 1 ? wasTime : 0;
      const streamToUrl = videoSrcFor(cid, epFile, {
        forceStream: true,
        startSec: wasTime > 1 ? wasTime : 0,
        audioStreamIndex: newStreamIdx,
      });
      state.currentHlsAudioIdx = newStreamIdx;
      const onCanPlay = () => {
        hidePlayerLoading();
        try { if (state.plyr) state.plyr.speed = state.playerSpeed; } catch (_e) {}
        safePlay();
      };
      if (state.plyr) {
        state.plyr.source = {
          type: 'video',
          sources: [{ src: streamToUrl, type: 'video/mp4' }],
        };
        state.plyr.once('canplay', onCanPlay);
      } else {
        player.src = streamToUrl;
        try { player.load(); } catch (_e) {}
        player.addEventListener('canplay', onCanPlay, { once: true });
      }
      if (window.console && window.console.info) {
        window.console.info('[switchHlsAudio] fmp4-streamTo switched to a=' + newStreamIdx);
      }
      return;
    } catch (e) {
      if (window.console && window.console.warn) {
        window.console.warn(
          '[switchHlsAudio] fmp4-streamTo switch failed (' + (e && e.message) + '), falling back to HLS'
        );
      }
    }

    // ----- Step 3: HLS (legacy bail-out, may enqueue server queue) -----
    let newKey = null;
    let pendingDetail = null;
    try {
      newKey = await startHlsAndWait(cid, epFile, newStreamIdx);
    } catch (e) {
      if (e && e.code === 'transcoding-pending') pendingDetail = e.detail;
    }
    if (pendingDetail) {
      hidePlayerLoading();
      toast(formatTranscodingMessage(pendingDetail), 'warn', 8000);
      return;
    }
    if (!newKey) {
      hidePlayerLoading();
      toast('音轨切换失败', 'warn');
      return;
    }
    state.currentHlsAudioIdx = newStreamIdx;
    const playlistUrl = '/hls-cache/' + encodeURIComponent(newKey) + '/playlist.m3u8';
    try {
      await attachHls(playlistUrl);
    } catch (err) {
      hidePlayerLoading();
      toast('HLS 重新挂载失败', 'warn');
      console.warn('switchHlsAudio attachHls failed', err);
      return;
    }
    hidePlayerLoading();
    const onCanPlay = () => {
      if (wasTime > 1) {
        try {
          if (state.plyr) state.plyr.currentTime = wasTime;
          else player.currentTime = wasTime;
        } catch (_e) {}
      }
      try { if (state.plyr) state.plyr.speed = state.playerSpeed; } catch (_e) {}
      safePlay();
    };
    if (state.plyr) state.plyr.once('canplay', onCanPlay);
    else player.addEventListener('canplay', onCanPlay, { once: true });
  }
  // Seek handling for transcoded streams.
  //
  // A streamed /media-stream response is a single unbroken fragmented
  // MP4 — the server can't honor HTTP Range requests on it, and the
  // browser therefore can't seek outside the currently buffered window.
  // To give the user a working seek bar we intercept the `seeking`
  // event, compute the absolute target (relative to the original file,
  // not the current stream), and re-request /media-stream with a new
  // ?t= offset. ffmpeg restarts at the new keyframe-aligned position
  // and the pipeline resumes.
  //
  // Known cosmetic quirk: after a rebuild, the <video> element's
  // internal duration reflects the remaining portion of the file, so
  // Plyr's progress bar shrinks to represent only the tail. The play
  // position is still accurate, just the reference length drifts.
  // Fixing this properly needs a client-side time-offset translation
  // layer over Plyr — deferred to a later pass.
  let streamSeekBusy = false;
  player.addEventListener('seeking', () => {
    if (!state.currentIsStream || streamSeekBusy) return;
    const localTarget = player.currentTime;
    // Tiny seeks are usually buffer-settling noise from the browser
    // itself (e.g. right after loadedmetadata), not user intent.
    if (localTarget < 0.5) return;
    const absTarget = (state.streamStartSec || 0) + localTarget;
    const col = state.currentCollection;
    const file = state.currentFile;
    if (!col || !file) return;
    streamSeekBusy = true;
    state.streamStartSec = absTarget;
    // 1.7.36: pass forceStream so .mkv files routed to /media-stream
    // by the audio-codec gate (1.7.35) keep using /media-stream when
    // we re-source on seek. Without forceStream, videoSrcFor saw
    // .mkv as native-eligible and built a /media URL — that broke
    // the seek (the static URL doesn't accept ?t= and would just
    // restart playback from the beginning of the original file).
    // v1.11.1: preserve audio track selection across seek-restart.
    // state.currentHlsAudioIdx is set by switchHlsAudio (line ~13352)
    // when the user picks a non-default language; without forwarding
    // it here, every seek would silently revert to the default audio
    // and the user would have to re-pick after each scrub.
    const newSrc = videoSrcFor(col.id, file, {
      startSec: absTarget,
      forceStream: state.currentIsStream,
      audioStreamIndex: state.currentHlsAudioIdx,
    });
    const onMeta = () => {
      player.removeEventListener('loadedmetadata', onMeta);
      streamSeekBusy = false;
      const p = player.play();
      if (p && typeof p.catch === 'function') p.catch(function () { /* swallow */ });
    };
    player.addEventListener('loadedmetadata', onMeta);
    player.src = newSrc;
  });

  // One-time listener on the <video> element. Fires when the browser
  // fails to decode the current source — typically because the container
  // is OK (e.g. .mkv) but the codec inside isn't (e.g. HEVC on Firefox).
  // Most non-mp4/webm containers now go through /media-stream instead,
  // so this is mostly a belt-and-suspenders fallback for the whitelist
  // (mp4 with a weird codec, or a streamed response that failed after
  // the <video> element already started decoding).
  player.addEventListener('error', () => {
    const err = player.error;
    if (!err) return;
    const url = player.currentSrc || player.src || '';
    const file = state.currentFile || 'video';
    // MEDIA_ERR code 4 = MEDIA_ERR_SRC_NOT_SUPPORTED (format/codec issue)
    if (err.code === 4) {
      // Native → transcode fallback.
      //
      // Since 1.7.21 .mkv is in the native-serve whitelist so users
      // get full duration / seek / multi-track. Firefox doesn't ship
      // an mkv parser, and certain Chrome builds reject mkvs with
      // unusual codecs (HEVC, DTS, TrueHD, ...). For those cases the
      // raw byte-range request lands here as code-4, and we silently
      // re-source the same episode through /media-stream so ffmpeg
      // remuxes/encodes it into a browser-safe fragmented MP4.
      //
      // Guard against infinite loops with state.transcodeFallbackTried —
      // reset on every episode load (gotoEp / source-change paths).
      // Only fall back when we were on the static /media route; if
      // /media-stream itself errors there's no further fallback to
      // try, so we surface the error instead.
      const col = state.currentCollection;
      const onStreamRoute = url.indexOf('/media-stream/') !== -1;
      if (!state.transcodeFallbackTried && !onStreamRoute && col && file) {
        state.transcodeFallbackTried = true;
        const newSrc = '/media-stream/' + encodeURIComponent(col.id) + '/' + encodePath(file);
        state.currentIsStream = true;
        state.streamStartSec = 0;
        console.warn('Native playback rejected — falling back to /media-stream:', file);
        try { player.src = newSrc; player.load(); player.play().catch(() => {}); } catch (_e) {}
        return;
      }
      showPlayerError(
        '浏览器无法解码此视频。可能是容器格式不支持，或容器里的编码（如 H.265/HEVC、旧版 AVC Profile）没有对应的内置解码器。请下载后用本地播放器（如 VLC）观看。',
        url,
        file
      );
    } else {
      // Decode/network/abort — still surface an actionable fallback.
      showPlayerError(
        '播放失败 (err ' + err.code + '): ' + (err.message || '未知错误'),
        url,
        file
      );
    }
  });
  // Unit label for "N <units>" — kind-specific so audio reads "首",
  // image reads "张", novel reads "篇" instead of the video-centric
  // "集". Everywhere that renders a collection's episode count should
  // use this helper. `kind` defaults to the current subsystem but can
  // be overridden when rendering a specific collection whose kind is
  // known independently (e.g. cross-kind search results).
  function countUnit(kind) {
    const k = kind || state.kind;
    if (k === 'audio') return '首';
    if (k === 'image') return '张';
    if (k === 'novel') return '篇';
    return '集';
  }
  // Like typeLabel but adds the parent path inline if the leaf's label
  // is not unique within `kind` — disambiguates same-named children
  // under different parents. Returns a plain string (caller is
  // responsible for HTML-escaping when interpolating into innerHTML).
  function disambigTypeLabel(kind, id) {
    const list = clientCatList(kind);
    const node = list.find((c) => c.id === id);
    if (!node) return typeLabel(id);
    let count = 0;
    for (const c of list) if (c.label === node.label) count++;
    if (count <= 1) return node.label;
    return clientPathLabel(kind, id);
  }
  function typeLabel(type) {
    // Look up the label in any subsystem's category list (a tag id can
    // exist in multiple subsystems, e.g. "comic" in image and novel).
    if (state.categories) {
      for (const kind of Object.keys(state.categories)) {
        const list = state.categories[kind] || [];
        for (const c of list) if (c.id === type) return c.label;
      }
    }
    // Fallback: fixed defaults for old collections that reference ids the
    // admin later removed.
    if (type === 'series')    return '剧集';
    if (type === 'movie')     return '电影';
    if (type === 'audiobook') return '有声书';
    if (type === 'podcast')   return '播客';
    if (type === 'album')     return '专辑';
    if (type === 'other')     return '其他';
    return type || '其他';
  }
  // SWR cache for categories: writeable from boot pre-render and from
  // the network response. Keyed off the running build so a server
  // upgrade that changes category schema invalidates the cache.
  const CATS_LS_KEY = 'ds124:categories:v1';
  function hydrateCategoriesFromCache() {
    try {
      const cached = localStorage.getItem(CATS_LS_KEY);
      if (!cached) return;
      const parsed = JSON.parse(cached);
      if (parsed && typeof parsed === 'object') state.categories = parsed;
    } catch (e) { /* corrupt cache → ignore, fall back to defaults */ }
  }
  async function loadCategories() {
    try {
      const res = await api('GET', '/api/categories');
      if (res && res.categories) {
        state.categories = res.categories;
        try { localStorage.setItem(CATS_LS_KEY, JSON.stringify(res.categories)); } catch (e) {}
      }
    } catch (e) { /* keep cached or defaults */ }
  }
  function escapeHtml(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));
  }
  function formatSize(bytes) {
    if (!bytes && bytes !== 0) return '';
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let i = 0, n = bytes;
    while (n >= 1024 && i < units.length - 1) { n /= 1024; i++; }
    return n.toFixed(n >= 10 || i === 0 ? 0 : 1) + ' ' + units[i];
  }
  function formatTime(seconds) {
    seconds = Math.floor(seconds || 0);
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${m}:${String(s).padStart(2, '0')}`;
  }
  function formatUptime(sec) {
    if (sec < 60) return sec + 's';
    if (sec < 3600) return Math.floor(sec / 60) + 'm';
    if (sec < 86400) return Math.floor(sec / 3600) + 'h';
    return Math.floor(sec / 86400) + 'd';
  }
  function basenameNoExt(file) {
    const i = file.lastIndexOf('.');
    return i > 0 ? file.slice(0, i) : file;
  }

  // ==================================================================
  // Novel reader (v1: .txt only — .pdf shows a download stub)
  //
  // Reading position is stored as char offset in the post-decoded text:
  //   position = scrollTop  (px), duration = scrollHeight - clientHeight
  // Normalised by ratio on restore so font-size changes don't lose place.
  // The same /<kind>/api/progress endpoints used by audio/video back this.
  // ==================================================================
  const NOVEL_FONT_KEY = 'ds124:novelFont';
  const NOVEL_FONT_DEFAULT = 18;
  const NOVEL_FONT_MIN = 12;
  const NOVEL_FONT_MAX = 32;
  function novelGetFontSize() {
    try {
      const v = parseInt(localStorage.getItem(NOVEL_FONT_KEY), 10);
      if (Number.isFinite(v) && v >= NOVEL_FONT_MIN && v <= NOVEL_FONT_MAX) return v;
    } catch (e) {}
    return NOVEL_FONT_DEFAULT;
  }
  function novelSetFontSize(v) {
    v = Math.max(NOVEL_FONT_MIN, Math.min(NOVEL_FONT_MAX, v));
    try { localStorage.setItem(NOVEL_FONT_KEY, String(v)); } catch (e) {}
    document.documentElement.style.setProperty('--novel-font-size', v + 'px');
    return v;
  }

  // Same fallback chain as decodeSubtitleBuffer — keeps the chain centralised
  // would need a wider refactor; for now we accept the duplication since
  // the novel reader only reads one file at a time.
  function novelDecodeBuffer(buf) {
    const encodings = ['utf-8', 'gb18030', 'utf-16le', 'utf-16be'];
    for (const enc of encodings) {
      try {
        return new TextDecoder(enc, { fatal: true }).decode(buf).replace(/^﻿/, '');
      } catch (e) { /* try next */ }
    }
    return new TextDecoder('utf-8').decode(buf).replace(/^﻿/, '');
  }

  // Lazy-load pdf.js. ~350KB main + ~1.4MB worker (gzip ~500KB total).
  // Image / novel-txt / audio sessions never trigger this. Cached promise
  // means subsequent PDFs reuse the same module instance + worker.
  let pdfjsLoadPromise = null;
  function loadPdfjs() {
    if (pdfjsLoadPromise) return pdfjsLoadPromise;
    pdfjsLoadPromise = (async () => {
      const mod = await import('/vendor/pdfjs/pdf.min.mjs');
      mod.GlobalWorkerOptions.workerSrc = '/vendor/pdfjs/pdf.worker.min.mjs';
      return mod;
    })().catch((e) => { pdfjsLoadPromise = null; throw e; });
    return pdfjsLoadPromise;
  }

  // Render a PDF into the supplied content element. Pages are rendered
  // sequentially to canvases stacked vertically. cMapUrl is required for
  // CJK PDFs to substitute glyphs correctly. Returns when all pages are
  // painted; a per-page status element is shown while waiting.
  async function renderPdfInto(content, url) {
    content.innerHTML = '<div class="novel-reader-loading mono">// 正在解析 PDF...</div>';
    const pdfjs = await loadPdfjs();
    const doc = await pdfjs.getDocument({
      url,
      cMapUrl: '/vendor/pdfjs/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: '/vendor/pdfjs/standard_fonts/',
    }).promise;
    content.innerHTML = '';
    const status = document.createElement('div');
    status.className = 'novel-pdf-status mono';
    content.appendChild(status);
    const containerWidth = Math.max(320, content.clientWidth - 60);
    for (let i = 1; i <= doc.numPages; i++) {
      status.textContent = `// 渲染第 ${i}/${doc.numPages} 页…`;
      try {
        const page = await doc.getPage(i);
        const base = page.getViewport({ scale: 1.0 });
        const scale = Math.min(2.5, Math.max(1.0, containerWidth / base.width));
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement('canvas');
        canvas.className = 'novel-pdf-page';
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.maxWidth = '100%';
        canvas.style.height = 'auto';
        await page.render({
          canvasContext: canvas.getContext('2d'),
          viewport,
        }).promise;
        content.insertBefore(canvas, status);
      } catch (e) {
        console.warn('pdf page render failed', i, e);
      }
    }
    status.remove();
    return doc.numPages;
  }

  // Per-active-reader teardown. Set when showNovelReader installs handlers,
  // called when leaving the view (hideAllViews / route change). Without
  // this, scroll listeners + visibility handlers from old sessions stack up.
  let novelReaderTeardown = null;

  async function showNovelReader(id, file) {
    if (novelReaderTeardown) { try { novelReaderTeardown(); } catch (e) {} novelReaderTeardown = null; }
    hideAllViews();
    resetHeaderActions();
    backBtn.hidden = false;
    title.textContent = (id || '').toUpperCase();
    const view = document.getElementById('view-novel-reader');
    if (!view) return;
    view.hidden = false;
    if (!state.user) { navigate('#/login'); return; }

    let collection = state.currentCollection;
    if (!collection || collection.id !== id) {
      try {
        const res = await api('GET', '/api/collections/' + encodeURIComponent(id));
        collection = res.collection;
        state.currentCollection = collection;
      } catch (err) {
        toast('加载合集失败: ' + err.message, 'error');
        navigate('#/');
        return;
      }
    }
    state.currentFile = file;

    // Refresh user progress so the restore below has fresh data on
    // first nav into a reader (the home/detail loaders already populate
    // state.progressAll, but a deep-link straight to /play/ skips them).
    try {
      const pr = await api('GET', '/api/progress');
      state.progressAll = (pr && pr.progress) || state.progressAll || {};
    } catch (e) { /* keep what we had */ }

    const eps = (collection.episodes || []).slice();
    const idx = eps.findIndex((e) => e.file === file);
    const ep = idx >= 0 ? eps[idx] : null;

    const collEl = document.getElementById('novel-reader-collection');
    const titleEl = document.getElementById('novel-reader-title');
    if (collEl) collEl.textContent = collection.title || collection.id;
    if (titleEl) titleEl.textContent = (ep && ep.title) || file;

    const prevBtn = document.getElementById('novel-reader-prev');
    const nextBtn = document.getElementById('novel-reader-next');
    if (prevBtn) {
      prevBtn.disabled = idx <= 0;
      prevBtn.onclick = () => {
        if (idx > 0) navigate('#/c/' + encodeURIComponent(id) + '/play/' + encodeURIComponent(eps[idx-1].file));
      };
    }
    if (nextBtn) {
      nextBtn.disabled = idx < 0 || idx >= eps.length - 1;
      nextBtn.onclick = () => {
        if (idx >= 0 && idx < eps.length - 1) navigate('#/c/' + encodeURIComponent(id) + '/play/' + encodeURIComponent(eps[idx+1].file));
      };
    }

    novelSetFontSize(novelGetFontSize());
    const fontInc = document.getElementById('novel-font-inc');
    const fontDec = document.getElementById('novel-font-dec');
    if (fontInc) fontInc.onclick = () => novelSetFontSize(novelGetFontSize() + 2);
    if (fontDec) fontDec.onclick = () => novelSetFontSize(novelGetFontSize() - 2);

    const content = document.getElementById('novel-reader-content');
    const fillEl = document.getElementById('novel-reader-progress-fill');
    const pctEl = document.getElementById('novel-progress-pct');
    if (!content) return;
    content.innerHTML = '<div class="novel-reader-loading mono">// 加载中...</div>';
    if (fillEl) fillEl.style.width = '0%';
    if (pctEl) pctEl.textContent = '0%';

    const url = '/novel-files/' + encodeURIComponent(id) + '/' + encodePath(file);
    const isPdf = ep && (ep.ext === 'pdf' || /\.pdf$/i.test(file));

    if (isPdf) {
      try {
        const pages = await renderPdfInto(content, url);
        if (!pages || pages <= 0) {
          content.innerHTML = '<div class="novel-reader-empty mono">// 空 PDF</div>';
          return;
        }
      } catch (err) {
        content.innerHTML = `<div class="novel-reader-error mono">// PDF 加载失败：${escapeHtml(err.message)}</div>`;
        return;
      }
    } else {
      let text;
      try {
        const r = await fetch(url, { credentials: 'same-origin' });
        if (!r.ok) throw new Error('HTTP ' + r.status);
        const buf = await r.arrayBuffer();
        text = novelDecodeBuffer(buf);
      } catch (err) {
        content.innerHTML = `<div class="novel-reader-error mono">// 加载失败：${escapeHtml(err.message)}</div>`;
        return;
      }
      if (!text || !text.trim()) {
        content.innerHTML = '<div class="novel-reader-empty mono">// 空文件</div>';
        return;
      }
      // Paragraphs separated by blank lines; single \n inside a paragraph
      // becomes a hard line break. text-indent and white-space:pre-wrap
      // (per CSS) preserve indentation and Chinese typographic conventions.
      const paras = text.replace(/\r/g, '').split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
      content.innerHTML = paras.map((p) =>
        `<p>${escapeHtml(p).replace(/\n/g, '<br>')}</p>`
      ).join('');
    }

    // Restore. Position is in scrollTop pixels from the previous visit;
    // we scale by ratio so a different font size still lands roughly where
    // the user left off. requestAnimationFrame waits for layout to settle.
    const colProgress = state.progressAll[id] || {};
    const saved = colProgress[file];
    if (saved && Number.isFinite(saved.position) && saved.duration > 0) {
      const ratio = Math.max(0, Math.min(1, saved.position / saved.duration));
      requestAnimationFrame(() => {
        content.scrollTop = ratio * Math.max(1, content.scrollHeight - content.clientHeight);
      });
    } else {
      content.scrollTop = 0;
    }

    // Save throttling: 2s of scroll-quiet → POST. Also save on visibility
    // hidden / unload. POST body matches video/audio contract: position
    // (current px), duration (max scrollable px). The watched flag is set
    // when we hit the end (>= 95% scroll).
    let saveTimer = null;
    const saveProgress = (final = false) => {
      if (!content || !state.currentCollection || state.currentCollection.id !== id) return;
      const position = Math.round(content.scrollTop);
      const duration = Math.max(1, Math.round(content.scrollHeight - content.clientHeight));
      const pct = Math.min(100, Math.round((position / duration) * 100));
      if (fillEl) fillEl.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
      const body = { position, duration };
      if (pct >= 95) body.watched = true;
      api('POST', '/api/progress/' + encodeURIComponent(id) + '/' + encodeURIComponent(file), body).catch(() => {});
      if (!state.progressAll[id]) state.progressAll[id] = {};
      state.progressAll[id][file] = { position, duration, watched: pct >= 95, updatedAt: Date.now() };
    };
    const onScroll = () => {
      if (saveTimer) return;
      saveTimer = setTimeout(() => { saveTimer = null; saveProgress(); }, 2000);
      // Repaint progress bar immediately for snappy feedback (no network).
      const position = content.scrollTop;
      const duration = Math.max(1, content.scrollHeight - content.clientHeight);
      const pct = Math.min(100, Math.round((position / duration) * 100));
      if (fillEl) fillEl.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
    };
    const onVisibility = () => { if (document.visibilityState === 'hidden') saveProgress(true); };
    const onUnload = () => saveProgress(true);
    content.addEventListener('scroll', onScroll, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('beforeunload', onUnload);

    novelReaderTeardown = () => {
      if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; }
      saveProgress(true);
      content.removeEventListener('scroll', onScroll);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('beforeunload', onUnload);
    };

    // Initial paint of the progress UI.
    requestAnimationFrame(() => {
      const position = content.scrollTop;
      const duration = Math.max(1, content.scrollHeight - content.clientHeight);
      const pct = Math.min(100, Math.round((position / duration) * 100));
      if (fillEl) fillEl.style.width = pct + '%';
      if (pctEl) pctEl.textContent = pct + '%';
    });
  }

  // ==================================================================
  // Boot
  // ==================================================================
  async function boot() {
    // Stale-while-revalidate: hydrate categories from localStorage and
    // render UI immediately, before any network round-trip. The fetches
    // below refresh state.categories and we re-apply once they land.
    hydrateCategoriesFromCache();
    applyKindUI();

    // Pre-warm Plyr only if the user is starting in a media subsystem.
    // Image/novel sessions skip the ~146KB Plyr download entirely until
    // (or unless) they switch into video/audio later.
    if (state.kind === 'video' || state.kind === 'audio') {
      loadPlyrAssets().catch(() => {});
    }

    await Promise.all([loadAuthStatus(), loadCategories()]);
    // Re-apply: categories may have shifted server-side; user may now
    // unlock hidden categories that were filtered out of the cached set.
    applyKindUI();

    if (state.needsFirstUser) { navigate('#/login'); return; }
    handleRoute();

    // Register service worker in the background. This caches the app
    // shell (index.html, app.js, style.css, vendor/*) and is purely an
    // optimization layer — failures are silently ignored.
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js').catch(() => {});
    }
  }
  boot();
})();
