// Collection-level comments — factory pattern.
// Backed by one JSON file per subsystem:
//   { "<collectionId>": [{ id, username, text, createdAt }] }

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function createStore(options) {
  if (!options || typeof options.file !== 'string' || !options.file) {
    throw new Error('comments.createStore: options.file is required');
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

  function list(collectionId) {
    const arr = cache[collectionId] || [];
    return arr.slice().sort((a, b) => b.createdAt - a.createdAt);
  }

  function add(collectionId, username, text) {
    if (typeof collectionId !== 'string' || !collectionId) throw new Error('collectionId 非法');
    if (typeof username !== 'string' || !username) throw new Error('username 非法');
    if (typeof text !== 'string') throw new Error('text 非法');
    const trimmed = text.trim();
    if (trimmed.length < 1) throw new Error('评论不能为空');
    if (trimmed.length > 2000) throw new Error('评论过长（最多 2000 字）');
    return withLock(() => {
      if (!cache[collectionId]) cache[collectionId] = [];
      const comment = {
        id: crypto.randomUUID(),
        username,
        text: trimmed,
        createdAt: Date.now(),
      };
      cache[collectionId].push(comment);
      writeAtomic();
      return comment;
    });
  }

  function remove(collectionId, commentId, requester) {
    return withLock(() => {
      const arr = cache[collectionId];
      if (!arr) return { ok: false, reason: 'not_found' };
      const idx = arr.findIndex((c) => c.id === commentId);
      if (idx < 0) return { ok: false, reason: 'not_found' };
      const comment = arr[idx];
      const isOwn = requester && requester.username === comment.username;
      const isAdmin = requester && requester.role === 'admin';
      if (!isOwn && !isAdmin) return { ok: false, reason: 'forbidden' };
      arr.splice(idx, 1);
      if (arr.length === 0) delete cache[collectionId];
      writeAtomic();
      return { ok: true };
    });
  }

  function clearCollection(collectionId) {
    return withLock(() => {
      if (cache[collectionId]) {
        delete cache[collectionId];
        writeAtomic();
      }
    });
  }

  function clearUser(username) {
    return withLock(() => {
      let changed = false;
      for (const cid of Object.keys(cache)) {
        const before = cache[cid].length;
        cache[cid] = cache[cid].filter((c) => c.username !== username);
        if (cache[cid].length !== before) changed = true;
        if (cache[cid].length === 0) delete cache[cid];
      }
      if (changed) writeAtomic();
    });
  }

  return { init, list, add, remove, clearCollection, clearUser };
}

module.exports = { createStore };
