// Album art extraction for audio files.
//
// Reads embedded artwork from tagged audio files (ID3v2 APIC for MP3,
// METADATA_BLOCK_PICTURE for FLAC/OGG/Opus, MP4 "covr" atom for M4A/M4B,
// WMA "WM/Picture", APE "Cover Art (Front)", etc.) and writes it out as
// a sidecar image (`cover.{jpg,png,webp,...}`) inside the collection
// folder. The existing findCoverFor() logic in lib/collections.js picks
// up the sidecar automatically on the next scan — no cover-auto fiddling
// needed, the collection just starts having a cover.
//
// This module is a thin wrapper over `music-metadata`. We use that
// library because (a) writing hand-rolled parsers for seven binary tag
// formats is fragile, (b) it handles the ID3v2.2 / 2.3 / 2.4 encoding
// quirks, MP4 atom recursion, and OGG comment base64 decoding
// uniformly, and (c) the dep footprint is ~1 MB.
//
// music-metadata v8+ is pure ESM; we load it via dynamic import inside
// a cached promise so the rest of the project can stay CJS. First call
// pays the import cost, every subsequent call reuses the loaded module.

const fs = require('fs');
const path = require('path');

let mmPromise = null;
function loadMM() {
  if (!mmPromise) {
    mmPromise = import('music-metadata').catch((err) => {
      // On load failure, null out so the next caller retries — we don't
      // want a transient import failure to poison the process.
      mmPromise = null;
      throw err;
    });
  }
  return mmPromise;
}

// MIME type → filename extension. Default to .jpg for unknown since
// that's the most common embedded format and browsers handle it.
function extForMime(mime) {
  if (!mime || typeof mime !== 'string') return '.jpg';
  const m = mime.toLowerCase();
  if (m.includes('png'))                   return '.png';
  if (m.includes('webp'))                  return '.webp';
  if (m.includes('gif'))                   return '.gif';
  if (m.includes('bmp'))                   return '.bmp';
  if (m.includes('jpeg') || m.includes('jpg')) return '.jpg';
  return '.jpg';
}

// Sniff the real image format from the first few bytes. MP3 APIC
// frames are notorious for lying — a file can claim image/jpeg in the
// ID3 MIME field but actually contain PNG data — so we ignore the
// tag's self-declared MIME and trust the magic bytes instead. Returns
// null for formats we don't recognize, in which case the caller should
// fall back to whatever the tag claimed.
function sniffImageMime(buf) {
  if (!buf || buf.length < 12) return null;
  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) return 'image/jpeg';
  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47
      && buf[4] === 0x0D && buf[5] === 0x0A && buf[6] === 0x1A && buf[7] === 0x0A) return 'image/png';
  // WebP: 'RIFF' ... 'WEBP'
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46
      && buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) return 'image/webp';
  // GIF: 'GIF8'
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) return 'image/gif';
  // BMP: 'BM'
  if (buf[0] === 0x42 && buf[1] === 0x4D) return 'image/bmp';
  return null;
}

// True if the folder has ANY image file in it (jpg/png/webp/gif/bmp/avif).
// Used as the "should we extract embedded art?" gate: if the admin has
// placed any image in the folder, we respect it and never extract.
// findCoverFor() in lib/collections.js already knows how to pick the
// best one from whatever's present — prioritized cover/folder/poster
// names, otherwise first alphabetically — so we don't need to be smart
// about WHICH image exists, just whether any image exists.
const ANY_IMAGE_RE = /\.(jpe?g|png|webp|gif|bmp|avif)$/i;
function hasAnyImage(folderAbs) {
  try {
    const entries = fs.readdirSync(folderAbs);
    for (const name of entries) {
      if (name.startsWith('.')) continue;
      if (ANY_IMAGE_RE.test(name)) return true;
    }
  } catch (_e) { /* no-op */ }
  return false;
}

// Read the first embedded picture from an audio file and return it as
// { format, data: Buffer } (or null if the file has none). Prefers a
// "Cover (front)" typed picture if multiple are present (ID3 APIC type
// 3, FLAC PICTURE_TYPE 3) — this is the standard "album front" picture
// that MP4 'covr' atoms and most tagging tools emit.
//
// Shared by extractToFolder() (used by the boot scan + upload hook) and
// the per-episode HTTP cover endpoint. Throws if music-metadata can't
// parse the file — callers should catch per-file errors and continue.
async function readFirstPicture(audioAbs) {
  const mm = await loadMM();
  const meta = await mm.parseFile(audioAbs, { skipCovers: false });
  if (!meta || !meta.common) return null;
  const pics = meta.common.picture;
  if (!pics || pics.length === 0) return null;
  let pic = pics.find((p) => p && (p.type === 'Cover (front)' || p.type === 3));
  if (!pic) pic = pics[0];
  if (!pic || !pic.data || pic.data.length === 0) return null;
  const data = Buffer.from(pic.data);
  // Sniff the real format. ID3 APIC frames routinely lie about MIME
  // type (PNG labelled as image/jpeg is the classic offender) — trust
  // the bytes, not the tag.
  const format = sniffImageMime(data) || pic.format || 'image/jpeg';
  return { format, data };
}

// Extract the first embedded picture from a single audio file and write
// it to `cover.{ext}` in the given folder. Atomic via tmp+rename, like
// the rest of the persistence layer. Returns the written filename on
// success, or null if the file has no embedded art.
async function extractToFolder(audioAbs, folderAbs) {
  const pic = await readFirstPicture(audioAbs);
  if (!pic) return null;
  const ext = extForMime(pic.format);
  const outName = 'cover' + ext;
  const outPath = path.join(folderAbs, outName);
  const tmpPath = outPath + '.tmp';
  fs.writeFileSync(tmpPath, pic.data);
  fs.renameSync(tmpPath, outPath);
  return outName;
}

// Scan a single collection folder: if it doesn't already have a cover,
// try each audio file in deterministic (natural-sort) order until one
// yields an embedded picture. First hit wins and we stop.
//
// Returns an object describing the outcome for logging:
//   { status: 'has-cover' }          // skipped, user/earlier-scan placed one
//   { status: 'no-audio' }           // nothing to scan
//   { status: 'none-embedded' }      // scanned but no tracks had art
//   { status: 'extracted', from: <audio file>, wrote: <cover filename> }
async function scanCollectionFolder(folderAbs, audioExts) {
  if (!folderAbs || !Array.isArray(audioExts)) return { status: 'invalid' };
  // Respect any image the admin has already placed (via upload, manual
  // scp, rsync from another system, etc.). Only extract when the folder
  // has no image at all — otherwise findCoverFor() picks an existing one.
  if (hasAnyImage(folderAbs)) return { status: 'has-cover' };

  let entries;
  try { entries = fs.readdirSync(folderAbs, { withFileTypes: true }); }
  catch (_e) { return { status: 'no-audio' }; }

  const audios = [];
  const audioSet = new Set(audioExts.map((e) => e.toLowerCase()));
  for (const ent of entries) {
    if (!ent.isFile()) continue;
    const name = ent.name;
    if (name.startsWith('.')) continue;
    const ext = path.extname(name).toLowerCase();
    if (audioSet.has(ext)) audios.push(name);
  }
  if (audios.length === 0) return { status: 'no-audio' };
  audios.sort((a, b) => a.localeCompare(b, 'zh-CN', { numeric: true, sensitivity: 'base' }));

  for (const name of audios) {
    const abs = path.join(folderAbs, name);
    try {
      const written = await extractToFolder(abs, folderAbs);
      if (written) return { status: 'extracted', from: name, wrote: written };
    } catch (_e) {
      // Per-file parse errors are ignored; move to the next one.
    }
  }
  return { status: 'none-embedded' };
}

module.exports = {
  readFirstPicture,
  extractToFolder,
  scanCollectionFolder,
  hasAnyImage,
};
