// Per-user, per-episode watch/listen progress store — factory pattern.
// Each subsystem (video, audio) gets its own instance bound to a JSON file.
//
// Data structure:
//   {
//     "alice": {
//       "<collectionId>": {
//         "<episodeFile>": { "position": 123.4, "duration": 1800, "updatedAt": 1712... }
//       }
//     }
//   }
// Position is in seconds. Duration is optional (filled after loadedmetadata).

const fs = require('fs');
const path = require('path');

function createStore(options) {
  if (!options || typeof options.file !== 'string' || !options.file) {
    throw new Error('progress.createStore: options.file is required');
  }
  const FILE = path.resolve(options.file);
  const TMP  = FILE + '.tmp';

  let cache = null;
  let writeLock = Promise.resolve();
  function withLock(fn) {
    const next = writeLock.then(fn, fn);
    writeLock = next.catch(() => {});
    return next;
  }

  function writeAtomic() {
    const data = JSON.stringify(cache, null, 2);
    fs.writeFileSync(TMP, data);
    fs.renameSync(TMP, FILE);
  }

  async function init() {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    if (!fs.existsSync(FILE)) {
      cache = {};
      await withLock(() => writeAtomic());
      return;
    }
    let raw;
    try { raw = fs.readFileSync(FILE, 'utf8'); }
    catch (e) { throw new Error('无法读取进度文件: ' + e.message); }
    try {
      const parsed = raw.trim() === '' ? {} : JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('根对象非法');
      }
      cache = parsed;
    } catch (e) {
      throw new Error('进度文件已损坏: ' + e.message);
    }
  }

  function get(username, collectionId, file) {
    if (!cache[username]) return null;
    const byCol = cache[username][collectionId];
    if (!byCol) return null;
    return byCol[file] || null;
  }

  function set(username, collectionId, file, patch) {
    if (typeof username !== 'string' || !username) throw new Error('username 非法');
    if (typeof collectionId !== 'string' || !collectionId) throw new Error('collectionId 非法');
    if (typeof file !== 'string' || !file) throw new Error('file 非法');
    const position = Number(patch && patch.position);
    if (!Number.isFinite(position) || position < 0) throw new Error('position 非法');
    const duration = patch && patch.duration != null ? Number(patch.duration) : null;

    return withLock(() => {
      if (!cache[username]) cache[username] = {};
      if (!cache[username][collectionId]) cache[username][collectionId] = {};
      const entry = cache[username][collectionId][file] || {};
      entry.position = position;
      if (Number.isFinite(duration) && duration > 0) entry.duration = duration;
      entry.updatedAt = Date.now();
      if (patch && typeof patch.watched === 'boolean') {
        entry.watched = patch.watched;
        if (patch.watched && !entry.duration) entry.duration = 1;
      }
      cache[username][collectionId][file] = entry;
      writeAtomic();
      return entry;
    });
  }

  function mark(username, collectionId, file, watched) {
    if (typeof username !== 'string' || !username) throw new Error('username 非法');
    return withLock(() => {
      if (!cache[username]) cache[username] = {};
      if (!cache[username][collectionId]) cache[username][collectionId] = {};
      const entry = cache[username][collectionId][file] || { position: 0 };
      entry.watched = !!watched;
      if (watched && !entry.duration) entry.duration = 1;
      if (watched && (!entry.position || entry.position < (entry.duration || 1))) {
        entry.position = entry.duration || 1;
      }
      if (!watched) entry.position = 0;
      entry.updatedAt = Date.now();
      cache[username][collectionId][file] = entry;
      writeAtomic();
      return entry;
    });
  }

  function removeEntry(username, collectionId, file) {
    return withLock(() => {
      if (!cache[username]) return false;
      const col = cache[username][collectionId];
      if (!col || !col[file]) return false;
      delete col[file];
      if (Object.keys(col).length === 0) delete cache[username][collectionId];
      if (cache[username] && Object.keys(cache[username]).length === 0) delete cache[username];
      writeAtomic();
      return true;
    });
  }

  function removeEntries(username, items) {
    return withLock(() => {
      let removed = 0;
      if (!cache[username]) return 0;
      if (!Array.isArray(items)) return 0;
      for (const it of items) {
        if (!it || typeof it !== 'object') continue;
        const cid = it.collectionId;
        const f = it.file;
        const col = cache[username][cid];
        if (col && col[f]) {
          delete col[f];
          removed++;
          if (Object.keys(col).length === 0) delete cache[username][cid];
        }
      }
      if (cache[username] && Object.keys(cache[username]).length === 0) delete cache[username];
      if (removed) writeAtomic();
      return removed;
    });
  }

  function clearEpisode(collectionId, file) {
    return withLock(() => {
      let changed = false;
      for (const u of Object.keys(cache)) {
        if (cache[u] && cache[u][collectionId] && cache[u][collectionId][file]) {
          delete cache[u][collectionId][file];
          if (Object.keys(cache[u][collectionId]).length === 0) delete cache[u][collectionId];
          changed = true;
        }
      }
      if (changed) writeAtomic();
    });
  }

  function dump() { return cache; }
  function listForUser(username) { return cache[username] || {}; }
  function listForCollection(username, collectionId) {
    if (!cache[username]) return {};
    return cache[username][collectionId] || {};
  }

  function clearUser(username) {
    return withLock(() => {
      if (cache[username]) {
        delete cache[username];
        writeAtomic();
      }
    });
  }

  function clearCollection(collectionId) {
    return withLock(() => {
      let changed = false;
      for (const u of Object.keys(cache)) {
        if (cache[u] && cache[u][collectionId]) {
          delete cache[u][collectionId];
          changed = true;
        }
      }
      if (changed) writeAtomic();
    });
  }

  return {
    init, get, set, mark,
    removeEntry, removeEntries,
    clearEpisode, clearUser, clearCollection,
    listForUser, listForCollection, dump,
  };
}

module.exports = { createStore };
