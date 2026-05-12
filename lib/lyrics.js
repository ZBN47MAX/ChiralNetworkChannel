// Unified lyric / subtitle parser.
//
// Input: file path + format string (extension without the dot).
// Output: { format, lines: [{ t: number|null, end: number|null, text: string }] }
//
// Supported formats (priority from highest to lowest):
//   vtt, srt, ass, ssa, lrc, txt
//
// .ass / .ssa: style and override tags (\N, \h, {...}) are stripped; only
//              the text and start-time are kept.
// .txt      : no timestamps — returned as a single line list for static
//              document-style display (the client decides to show it as
//              a scroll-free pane).

const fs = require('fs');
const path = require('path');

// ---- helpers ----

function parseTimestampHMS(s) {
  // Accepts "HH:MM:SS.mmm", "HH:MM:SS,mmm", "M:SS.mmm", "MM:SS.xx" ...
  // Returns seconds (float) or null.
  if (typeof s !== 'string') return null;
  s = s.trim();
  if (!s) return null;
  // Normalize "," fraction separator to "."
  s = s.replace(',', '.');
  const parts = s.split(':');
  if (parts.length < 2 || parts.length > 3) return null;
  let h = 0, m = 0, sec = 0;
  try {
    if (parts.length === 3) {
      h = Number(parts[0]);
      m = Number(parts[1]);
      sec = Number(parts[2]);
    } else {
      m = Number(parts[0]);
      sec = Number(parts[1]);
    }
  } catch (_e) { return null; }
  if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(sec)) return null;
  return h * 3600 + m * 60 + sec;
}

function readFileSafe(filePath) {
  try { return fs.readFileSync(filePath, 'utf8'); }
  catch (_e) { return null; }
}

// ---- .lrc ----
// [mm:ss.xx]line
// Multiple time tags on one line are valid: [00:10.00][00:20.00]line
function parseLrc(text) {
  const lines = [];
  const srcLines = text.split(/\r?\n/);
  const tagRe = /\[(\d{1,3}:\d{1,2}(?:\.\d{1,3})?)\]/g;
  for (const raw of srcLines) {
    if (!raw) continue;
    // Skip ID tags like [ti:Title] [ar:Artist] — they have letters inside.
    if (/^\s*\[[a-zA-Z]{1,6}:/.test(raw)) continue;
    const times = [];
    tagRe.lastIndex = 0;
    let m;
    let lastEnd = 0;
    while ((m = tagRe.exec(raw)) !== null) {
      const t = parseTimestampHMS(m[1]);
      if (t !== null) times.push(t);
      lastEnd = tagRe.lastIndex;
    }
    if (times.length === 0) continue;
    const text = raw.slice(lastEnd).trim();
    for (const t of times) {
      lines.push({ t, end: null, text });
    }
  }
  lines.sort((a, b) => a.t - b.t);
  // Fill "end" with next line's start.
  for (let i = 0; i < lines.length - 1; i++) lines[i].end = lines[i + 1].t;
  return lines;
}

// ---- .srt ----
// index\n HH:MM:SS,mmm --> HH:MM:SS,mmm\n text...\n\n
function parseSrt(text) {
  const lines = [];
  const blocks = text.replace(/\r/g, '').split(/\n{2,}/);
  for (const blk of blocks) {
    const rows = blk.split('\n').filter((x) => x.length > 0);
    if (rows.length < 2) continue;
    // First row may be an index line — skip it if numeric.
    let idx = 0;
    if (/^\d+$/.test(rows[0].trim())) idx = 1;
    const timing = rows[idx];
    const arrowMatch = /(\d{1,3}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,3}:\d{2}:\d{2}[,.]\d{1,3})/.exec(timing);
    if (!arrowMatch) continue;
    const start = parseTimestampHMS(arrowMatch[1]);
    const end = parseTimestampHMS(arrowMatch[2]);
    if (start === null) continue;
    const textRows = rows.slice(idx + 1);
    const content = textRows.join('\n').trim();
    if (!content) continue;
    lines.push({ t: start, end, text: content });
  }
  lines.sort((a, b) => a.t - b.t);
  return lines;
}

// ---- .vtt ----
// WEBVTT header, then cues similar to SRT with "." instead of ",".
function parseVtt(text) {
  const stripped = text.replace(/^\uFEFF/, '');
  const lines = [];
  const body = stripped.replace(/\r/g, '').replace(/^WEBVTT[^\n]*\n+/, '');
  const blocks = body.split(/\n{2,}/);
  for (const blk of blocks) {
    const rows = blk.split('\n').filter((x) => x.length > 0);
    if (rows.length < 2) continue;
    // Skip an optional cue identifier.
    let idx = 0;
    if (!/-->/.test(rows[idx])) idx = 1;
    if (idx >= rows.length) continue;
    const arrowMatch = /(\d{1,3}:\d{2}:\d{2}\.\d{1,3}|\d{1,2}:\d{2}\.\d{1,3})\s*-->\s*(\d{1,3}:\d{2}:\d{2}\.\d{1,3}|\d{1,2}:\d{2}\.\d{1,3})/.exec(rows[idx]);
    if (!arrowMatch) continue;
    const start = parseTimestampHMS(arrowMatch[1]);
    const end = parseTimestampHMS(arrowMatch[2]);
    if (start === null) continue;
    const textRows = rows.slice(idx + 1);
    const content = textRows.join('\n').trim();
    if (!content) continue;
    lines.push({ t: start, end, text: content });
  }
  lines.sort((a, b) => a.t - b.t);
  return lines;
}

// ---- .ass / .ssa ----
// [Events] section with Dialogue lines. Format order is declared in a Format:
// line but is typically Layer,Start,End,Style,Name,MarginL,MarginR,MarginV,Effect,Text.
// Style overrides inside {\...} are stripped. \N and \h become \n and space.
function parseAss(text) {
  const lines = [];
  const raw = text.replace(/\r/g, '').split('\n');
  let inEvents = false;
  let formatFields = null;
  for (const row of raw) {
    const trimmed = row.trim();
    if (!trimmed) continue;
    if (/^\[.*\]\s*$/.test(trimmed)) {
      inEvents = /^\[events\]$/i.test(trimmed);
      continue;
    }
    if (!inEvents) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx < 0) continue;
    const tag = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const rest = trimmed.slice(colonIdx + 1);
    if (tag === 'format') {
      formatFields = rest.split(',').map((s) => s.trim().toLowerCase());
      continue;
    }
    if (tag !== 'dialogue') continue;
    if (!formatFields) {
      // Fall back to the canonical order.
      formatFields = ['layer', 'start', 'end', 'style', 'name', 'marginl', 'marginr', 'marginv', 'effect', 'text'];
    }
    // Dialogue lines split on ',' but only up to (formatFields.length - 1) times
    // because the Text field can contain commas itself.
    const maxSplits = formatFields.length - 1;
    const pieces = [];
    let cursor = 0;
    for (let i = 0; i < maxSplits; i++) {
      const next = rest.indexOf(',', cursor);
      if (next < 0) break;
      pieces.push(rest.slice(cursor, next));
      cursor = next + 1;
    }
    pieces.push(rest.slice(cursor));
    const values = {};
    for (let i = 0; i < formatFields.length && i < pieces.length; i++) {
      values[formatFields[i]] = pieces[i];
    }
    const start = parseTimestampHMS((values.start || '').trim());
    const end = parseTimestampHMS((values.end || '').trim());
    if (start === null) continue;
    let textContent = values.text || '';
    // Strip override blocks {\...}
    textContent = textContent.replace(/\{[^}]*\}/g, '');
    // Replace escape sequences.
    textContent = textContent.replace(/\\N/g, '\n').replace(/\\n/g, '\n').replace(/\\h/g, ' ');
    textContent = textContent.trim();
    if (!textContent) continue;
    lines.push({ t: start, end, text: textContent });
  }
  lines.sort((a, b) => a.t - b.t);
  return lines;
}

// ---- .txt ----
// No timestamps. Emit each non-empty line as { t: null, text }.
function parseTxt(text) {
  const out = [];
  const raw = text.replace(/\r/g, '').split('\n');
  for (const row of raw) {
    if (row.trim().length === 0) {
      out.push({ t: null, end: null, text: '' });
    } else {
      out.push({ t: null, end: null, text: row });
    }
  }
  return out;
}

// ---- public entry ----

const PARSERS = {
  vtt: parseVtt,
  srt: parseSrt,
  ass: parseAss,
  ssa: parseAss,
  lrc: parseLrc,
  txt: parseTxt,
};

// Format priority, highest first.
const PRIORITY = ['vtt', 'srt', 'ass', 'ssa', 'lrc', 'txt'];

function parseFile(filePath, format) {
  const fmt = (format || path.extname(filePath).slice(1)).toLowerCase();
  const fn = PARSERS[fmt];
  if (!fn) return { format: fmt, lines: [], error: '不支持的格式' };
  const text = readFileSafe(filePath);
  if (text === null) return { format: fmt, lines: [], error: '读取失败' };
  try {
    const lines = fn(text);
    return { format: fmt, lines };
  } catch (e) {
    return { format: fmt, lines: [], error: '解析失败: ' + e.message };
  }
}

// Pick the best lyric file from a list of {file, format} candidates.
function pickBest(candidates) {
  if (!Array.isArray(candidates) || candidates.length === 0) return null;
  const byPriority = candidates.slice().sort((a, b) => {
    const ai = PRIORITY.indexOf((a.format || '').toLowerCase());
    const bi = PRIORITY.indexOf((b.format || '').toLowerCase());
    if (ai < 0 && bi < 0) return 0;
    if (ai < 0) return 1;
    if (bi < 0) return -1;
    return ai - bi;
  });
  return byPriority[0];
}

module.exports = {
  parseFile,
  pickBest,
  PRIORITY,
  // Exported mostly for testing.
  parseLrc, parseSrt, parseVtt, parseAss, parseTxt,
};
