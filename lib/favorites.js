// Per-user favorites — factory pattern.
// Stored as: { "<username>": ["<collectionId>", ...] }

const fs = require('fs');
const path = require('path');

function createStore(options) {
  if (!options || typeof options.file !== 'string' || !options.file) {
    throw new Error('favorites.createStore: options.file is required');
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
    fs.writeFileSync(TMP, JSON.stringify(cache, null, 2));
    fs.renameSync(TMP, FILE);
  }

  async function init() {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    if (!fs.existsSync(FILE)) {
      cache = {};
      await withLock(() => writeAtomic());
      return;
    }
    const raw = fs.readFileSync(FILE, 'utf8');
    try {
      const parsed = raw.trim() === '' ? {} : JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        throw new Error('root must be object');
      }
      cache = parsed;
    } catch (e) {
      throw new Error(path.basename(FILE) + ' 已损坏: ' + e.message);
    }
  }

  function list(username) { return (cache[username] || []).slice(); }
  function has(username, collectionId) {
    const arr = cache[username] || [];
    return arr.indexOf(collectionId) >= 0;
  }

  function add(username, collectionId) {
    return withLock(() => {
      if (!cache[username]) cache[username] = [];
      if (cache[username].indexOf(collectionId) < 0) {
        cache[username].push(collectionId);
        writeAtomic();
      }
      return cache[username].slice();
    });
  }

  function remove(username, collectionId) {
    return withLock(() => {
      const arr = cache[username];
      if (!arr) return false;
      const idx = arr.indexOf(collectionId);
      if (idx < 0) return false;
      arr.splice(idx, 1);
      if (arr.length === 0) delete cache[username];
      writeAtomic();
      return true;
    });
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
        const idx = (cache[u] || []).indexOf(collectionId);
        if (idx >= 0) {
          cache[u].splice(idx, 1);
          changed = true;
          if (cache[u].length === 0) delete cache[u];
        }
      }
      if (changed) writeAtomic();
    });
  }

  return { init, list, has, add, remove, clearUser, clearCollection };
}

module.exports = { createStore };
