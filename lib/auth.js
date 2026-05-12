// Express middleware helpers for session auth and media access control.

const path = require('path');

const SESSION_COOKIE = 'sid';

function loadSession(sessions, users) {
  return function (req, _res, next) {
    req.session = null;
    req.user = null;
    const sid = req.cookies && req.cookies[SESSION_COOKIE];
    if (sid) {
      const sess = sessions.get(sid);
      if (sess) {
        const user = users.get(sess.username);
        if (user) {
          req.session = sess;
          req.user = user;
        } else {
          sessions.destroy(sid);
        }
      }
    }
    next();
  };
}

function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: '需要登录' });
  next();
}

function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: '需要登录' });
  if (req.user.role !== 'admin') return res.status(403).json({ error: '需要管理员权限' });
  next();
}

// Permission-aware gate. Admin always passes. Non-admins pass only if
// their req.user.permissions[name] is truthy. Used to delegate selected
// content actions (upload / create / modify / delete) to specific users
// without granting them full admin role.
function requirePerm(name) {
  return function (req, res, next) {
    if (!req.user) return res.status(401).json({ error: '需要登录' });
    if (req.user.role === 'admin') return next();
    const p = req.user.permissions;
    if (p && p[name]) return next();
    return res.status(403).json({ error: '无此操作权限：' + name });
  };
}

// Guard for /media/* and /audio/*: image files pass through unauthenticated
// (so covers show up in the public collection grid); everything else
// requires a session.
function mediaGuard(imageExts) {
  const set = new Set((imageExts || []).map((e) => e.toLowerCase()));
  return function (req, res, next) {
    const ext = path.extname(req.path).toLowerCase();
    if (set.has(ext)) return next();
    if (!req.user) return res.status(401).type('text/plain').send('login required');
    next();
  };
}

module.exports = {
  SESSION_COOKIE,
  loadSession,
  requireAuth,
  requireAdmin,
  requirePerm,
  mediaGuard,
};
