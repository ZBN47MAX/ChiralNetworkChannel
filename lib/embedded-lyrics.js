// Reads lyrics embedded inside audio file metadata tags.
//
// Supported tag formats:
//   MP3  — ID3v2 USLT (Unsynchronized Lyrics Text)
//   FLAC / OGG / Opus — Vorbis Comment LYRICS field
//   M4A / AAC / ALAC  — MP4 ©lyr atom
//   WMA               — WMA LYRICS attribute
//
// Uses music-metadata (already a project dependency via lib/album-art.js).
// We duplicate the loadMM() lazy-import pattern rather than coupling modules.

const lyrics = require('./lyrics');

let mmPromise = null;
function loadMM() {
  if (!mmPromise) {
    mmPromise = import('music-metadata').catch((err) => {
      mmPromise = null;
      throw err;
    });
  }
  return mmPromise;
}

// True if the text looks like LRC format: has at least one [mm:ss.xx] timestamp.
function looksLikeLrc(text) {
  return /\[\d{1,3}:\d{2}(?:\.\d{1,3})?\]/.test(text);
}

// Read the raw embedded lyric string from an audio file.
// Returns a string, or null if none found / on error.
async function readRawEmbeddedLyrics(audioAbs) {
  try {
    const mm = await loadMM();
    const meta = await mm.parseFile(audioAbs, { skipCovers: true, duration: false });
    if (!meta || !meta.common) return null;
    const arr = meta.common.lyrics;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    const raw = arr[0];
    if (!raw || typeof raw !== 'string' || !raw.trim()) return null;
    return raw;
  } catch (_e) {
    return null;
  }
}

// Read embedded lyrics and return { format, lines } in the unified lyric format,
// or null if no embedded lyrics are present.
async function readEmbeddedLyrics(audioAbs) {
  const raw = await readRawEmbeddedLyrics(audioAbs);
  if (!raw) return null;

  // Auto-detect format: if the embedded text has LRC timestamp markers,
  // parse as LRC (gives synchronized highlight). Otherwise fall back to
  // plain text (displayed as a static scroll pane).
  if (looksLikeLrc(raw)) {
    const lines = lyrics.parseLrc(raw);
    if (lines && lines.length > 0) return { format: 'lrc', lines };
  }
  const lines = lyrics.parseTxt(raw);
  if (!lines || lines.length === 0) return null;
  return { format: 'txt', lines };
}

module.exports = { readEmbeddedLyrics };
