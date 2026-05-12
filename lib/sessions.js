'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SESSIONS_FILE = path.join(__dirname, '..', 'data', 'sessions.json');
const DEFAULT_TTL = 30 * 24 * 60 * 60 * 1000;

let store = {};
let writeLock = Promise.resolve();

function withLock(fn) {
  const next = writeLock.then(fn, fn);
  writeLock = next.then(() => {}, () => {});
  return next;
}

function invalidArg(msg) {
  const e = new Error(msg);
  e.code = 'E_INVALID_ARG';
  return e;
}

function persist() {
  return withLock(() => {
    const tmp = SESSIONS_FILE + '.tmp';
    const data = JSON.stringify(store, null, 2);
    fs.writeFileSync(tmp, data);
    fs.renameSync(tmp, SESSIONS_FILE);
  });
}

async function init() {
  fs.mkdirSync(path.dirname(SESSIONS_FILE), { recursive: true });
  if (!fs.existsSync(SESSIONS_FILE)) {
    store = {};
    await persist();
  } else {
    const raw = fs.readFileSync(SESSIONS_FILE, 'utf8');
    try {
      store = raw.trim() === '' ? {} : JSON.parse(raw);
    } catch (err) {
      throw new Error('sessions.json is corrupt: ' + err.message);
    }
    if (store === null || typeof store !== 'object' || Array.isArray(store)) {
      throw new Error('sessions.json is corrupt: expected object');
    }
  }
  sweepExpired();
}

function create(username, ttlMs = DEFAULT_TTL) {
  if (typeof username !== 'string' || username.length === 0) {
    throw invalidArg('username must be a non-empty string');
  }
  if (typeof ttlMs !== 'number' || !Number.isFinite(ttlMs) || ttlMs <= 0) {
    throw invalidArg('ttlMs must be a positive number');
  }
  const now = Date.now();
  const sess = {
    sid: crypto.randomUUID(),
    username,
    createdAt: now,
    expiresAt: now + ttlMs,
  };
  store[sess.sid] = sess;
  persist();
  return sess;
}

function get(sid) {
  const sess = store[sid];
  if (!sess) return null;
  if (sess.expiresAt <= Date.now()) {
    delete store[sid];
    persist();
    return null;
  }
  return sess;
}

function destroy(sid) {
  if (!Object.prototype.hasOwnProperty.call(store, sid)) return false;
  delete store[sid];
  persist();
  return true;
}

function destroyAllFor(username) {
  let count = 0;
  for (const sid of Object.keys(store)) {
    if (store[sid].username === username) {
      delete store[sid];
      count++;
    }
  }
  if (count > 0) persist();
  return count;
}

function sweepExpired() {
  const now = Date.now();
  let count = 0;
  for (const sid of Object.keys(store)) {
    if (store[sid].expiresAt <= now) {
      delete store[sid];
      count++;
    }
  }
  if (count > 0) persist();
  return count;
}

module.exports = {
  init,
  create,
  get,
  destroy,
  destroyAllFor,
  sweepExpired,
  DEFAULT_TTL,
};
