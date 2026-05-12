// Plain-text user store backed by a JSON file.
// Personal LAN-only media library; single-process with an async write mutex.

const fs = require('fs');
const path = require('path');
const config = require('../config');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const TMP_FILE = USERS_FILE + '.tmp';

const USERNAME_RE = /^[A-Za-z0-9_.\-]+$/;
const VALID_ROLES = ['user', 'admin'];

// Source of truth for the set of subsystem kinds (video / audio / image
// / novel / ...). Driven from config.CATEGORY_DEFAULTS so adding a new
// subsystem only requires editing config.js — visibleCategories
// sanitization, default-shape construction, and stripPassword all
// follow automatically.
function kinds() { return Object.keys(config.CATEGORY_DEFAULTS || {}); }
function emptyVisibleCategories() {
  const out = {};
  for (const k of kinds()) out[k] = [];
  return out;
}

// Granular per-user permissions for content actions. Admin role bypasses
// these — only role:'user' accounts are gated. New users default to all
// false so admin must explicitly grant. Schema must stay flat (no nesting
// or arrays) so the admin dialog can render it as a checkbox row trivially.
//   upload  — POST /<kind>/api/collections/:id/upload (push files in)
//   create  — POST /<kind>/api/collections (new collection)
//   modify  — PATCH /<kind>/api/collections/:id (title / description /
//             types / cover / hidden) + cover-related routes
//             (capture-frame, preview-frames, extract-cover, scan-meta)
//   delete  — DELETE /<kind>/api/collections/:id (collection-level kill)
//             AND episode CRUD (rename / move / delete / reorder / bulk)
//             AND POST /<kind>/api/collections/:id/clear
const PERM_KEYS = ['upload', 'create', 'modify', 'delete'];
function emptyPermissions() {
  const out = {};
  for (const k of PERM_KEYS) out[k] = false;
  return out;
}
function sanitizePermissions(p) {
  const out = emptyPermissions();
  if (!p || typeof p !== 'object') return out;
  for (const k of PERM_KEYS) out[k] = !!p[k];
  return out;
}

let cache = null;

// Serialize all write ops so concurrent async callers don't clobber each other.
let writeLock = Promise.resolve();
function withLock(fn) {
  const next = writeLock.then(fn, fn);
  writeLock = next.catch(() => {});
  return next;
}

function mkError(message, code) {
  const err = new Error(message);
  err.code = code;
  return err;
}

function validateUsername(username) {
  if (
    typeof username !== 'string' ||
    username.length < 3 ||
    username.length > 32 ||
    !USERNAME_RE.test(username) ||
    username === '.' ||
    username === '..'
  ) {
    throw mkError('用户名非法', 'E_INVALID_USERNAME');
  }
}

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 1 || password.length > 128) {
    throw mkError('密码非法', 'E_INVALID_PASSWORD');
  }
  for (let i = 0; i < password.length; i++) {
    if (password.charCodeAt(i) < 0x20) {
      throw mkError('密码非法', 'E_INVALID_PASSWORD');
    }
  }
}

function validateRole(role) {
  if (!VALID_ROLES.includes(role)) {
    throw mkError('角色非法', 'E_INVALID_ROLE');
  }
}

function stripPassword(user) {
  // Backfill missing kinds in old user records — visibleCategories
  // written before a new subsystem was added wouldn't have a key for it.
  const vc = emptyVisibleCategories();
  if (user.visibleCategories && typeof user.visibleCategories === 'object') {
    for (const k of kinds()) {
      if (Array.isArray(user.visibleCategories[k])) vc[k] = user.visibleCategories[k].slice();
    }
  }
  return {
    username: user.username,
    role: user.role,
    createdAt: user.createdAt,
    visibleCategories: vc,
    permissions: sanitizePermissions(user.permissions),
  };
}

function sanitizeVisibleCategories(v) {
  const out = emptyVisibleCategories();
  if (!v || typeof v !== 'object') return out;
  for (const kind of kinds()) {
    const arr = Array.isArray(v[kind]) ? v[kind] : [];
    const seen = new Set();
    for (const id of arr) {
      if (typeof id !== 'string' || !id) continue;
      if (id.length > 40 || !/^[a-zA-Z0-9_\-]+$/.test(id)) continue;
      if (seen.has(id)) continue;
      seen.add(id);
      out[kind].push(id);
    }
  }
  return out;
}

function writeAtomic() {
  const data = JSON.stringify(cache, null, 2);
  fs.writeFileSync(TMP_FILE, data);
  fs.renameSync(TMP_FILE, USERS_FILE);
}

async function init() {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  if (!fs.existsSync(USERS_FILE)) {
    cache = {};
    await withLock(() => writeAtomic());
  }
  let raw;
  try {
    raw = fs.readFileSync(USERS_FILE, 'utf8');
  } catch (e) {
    throw mkError('无法读取用户文件: ' + e.message, 'E_USERS_READ');
  }
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('根对象不是普通对象');
    }
    cache = parsed;
  } catch (e) {
    throw mkError('用户文件已损坏: ' + e.message, 'E_USERS_CORRUPT');
  }
}

function create(username, password, opts = {}) {
  const role = opts.role == null ? 'user' : opts.role;
  validateUsername(username);
  validatePassword(password);
  validateRole(role);
  return withLock(() => {
    if (Object.prototype.hasOwnProperty.call(cache, username)) {
      throw mkError('用户已存在', 'E_USER_EXISTS');
    }
    const user = {
      username,
      password,
      role,
      createdAt: Date.now(),
      visibleCategories: emptyVisibleCategories(),
      permissions: emptyPermissions(),
    };
    cache[username] = user;
    writeAtomic();
    return stripPassword(user);
  });
}

function get(username) {
  if (!Object.prototype.hasOwnProperty.call(cache, username)) return null;
  return cache[username];
}

function verify(username, password) {
  const user = get(username);
  if (!user) return false;
  return user.password === password;
}

function update(username, patch) {
  return withLock(() => {
    if (!Object.prototype.hasOwnProperty.call(cache, username)) {
      throw mkError('用户不存在', 'E_USER_NOT_FOUND');
    }
    const current = cache[username];
    const next = { ...current };
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'password')) {
      validatePassword(patch.password);
      next.password = patch.password;
    }
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'role')) {
      validateRole(patch.role);
      next.role = patch.role;
    }
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'visibleCategories')) {
      next.visibleCategories = sanitizeVisibleCategories(patch.visibleCategories);
    }
    if (patch && Object.prototype.hasOwnProperty.call(patch, 'permissions')) {
      next.permissions = sanitizePermissions(patch.permissions);
    }
    // username and createdAt are immutable.
    cache[username] = next;
    writeAtomic();
    return stripPassword(next);
  });
}

function remove(username) {
  return withLock(() => {
    if (!Object.prototype.hasOwnProperty.call(cache, username)) {
      return false;
    }
    delete cache[username];
    writeAtomic();
    return true;
  });
}

function list() {
  return Object.values(cache).map(stripPassword);
}

function count() {
  return Object.keys(cache).length;
}

module.exports = {
  init,
  create,
  get,
  verify,
  update,
  remove,
  list,
  count,
  PERM_KEYS,
};
