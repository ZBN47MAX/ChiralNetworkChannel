// Per-user track-level likes — stores individual audio tracks the user liked.
// Stored as: { "<username>": [{ collectionId, file }, ...] }

const fs = require('fs');
const path = require('path');

function createStore(options) {
  if (!options || typeof options.file !== 'string' || !options.file) {
    throw new Error('track-likes.createStore: options.file is required');
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

  function has(username, collectionId, file) {
    const arr = cache[username] || [];
    return arr.some((t) => t.collectionId === collectionId && t.file === file);
  }

  async function add(username, collectionId, file) {
    return withLock(() => {
      if (!cache[username]) cache[username] = [];
      const arr = cache[username];
      if (arr.some((t) => t.collectionId === collectionId && t.file === file)) return;
      arr.push({ collectionId, file });
      writeAtomic();
    });
  }

  async function remove(username, collectionId, file) {
    return withLock(() => {
      if (!cache[username]) return;
      const before = cache[username].length;
      cache[username] = cache[username].filter(
        (t) => !(t.collectionId === collectionId && t.file === file)
      );
      if (cache[username].length !== before) writeAtomic();
    });
  }

  async function batchAdd(username, collectionId, files) {
    return withLock(() => {
      if (!cache[username]) cache[username] = [];
      const arr = cache[username];
      let changed = false;
      for (const file of files) {
        if (!arr.some((t) => t.collectionId === collectionId && t.file === file)) {
          arr.push({ collectionId, file });
          changed = true;
        }
      }
      if (changed) writeAtomic();
    });
  }

  async function batchRemove(username, collectionId, files) {
    return withLock(() => {
      if (!cache[username]) return;
      const fileSet = new Set(files);
      const before = cache[username].length;
      cache[username] = cache[username].filter(
        (t) => !(t.collectionId === collectionId && fileSet.has(t.file))
      );
      if (cache[username].length !== before) writeAtomic();
    });
  }

  // Check if ALL files from a collection are liked
  function hasAll(username, collectionId, files) {
    const arr = cache[username] || [];
    return files.every((f) => arr.some((t) => t.collectionId === collectionId && t.file === f));
  }

  async function clearUser(username) {
    return withLock(() => {
      if (!cache[username]) return;
      delete cache[username];
      writeAtomic();
    });
  }

  return { init, list, has, hasAll, add, remove, batchAdd, batchRemove, clearUser };
}

module.exports = { createStore };
