// Chiral Network Channel — service worker.
//
// Purpose: app-shell cache so repeat visits load instantly even if the
// browser HTTP cache has been evicted, and so the UI shell can render
// before the network responds. Strategy is deliberately narrow:
//
//   - Static shell (app.js, style.css, vendor/*): cache-first.
//     Their URLs include a `?v=<version>` query string set by the
//     server, so a version bump produces a fresh cache key and the
//     stale entry is dropped on the next sweep.
//
//   - index.html / `/`: network-first with cache fallback. We never
//     want to serve a stale shell that points at a nonexistent
//     `?v=<old>` chunk, so the network is preferred.
//
//   - Everything else (API, /image-files, /audio-files, /media-stream,
//     /image-thumbs, etc.): pass through. These either return per-user
//     state, are huge media payloads (Range requests fight the cache),
//     or are already covered by HTTP Cache-Control on the static
//     mounts. SW stays out of the way.
//
// Cache name is keyed off this file's content; bump SW_VERSION to
// force all clients to drop the previous shell cache on activate.

const SW_VERSION = 'v1';
const SHELL_CACHE = 'ds124-shell-' + SW_VERSION;

self.addEventListener('install', (event) => {
  // Take over as soon as the new SW is parsed. Without this, the new
  // version sits in "waiting" until every tab is closed.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(
      names
        .filter((n) => n.startsWith('ds124-shell-') && n !== SHELL_CACHE)
        .map((n) => caches.delete(n))
    );
    await self.clients.claim();
  })());
});

// Decide whether this request belongs to the cacheable app shell.
function isShellAsset(url) {
  if (url.origin !== self.location.origin) return false;
  const p = url.pathname;
  if (p === '/app.js' || p === '/style.css') return true;
  if (p.startsWith('/vendor/')) return true;
  return false;
}

function isShellHTML(url) {
  if (url.origin !== self.location.origin) return false;
  return url.pathname === '/' || url.pathname === '/index.html';
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  if (isShellAsset(url)) {
    event.respondWith(cacheFirst(req));
    return;
  }

  if (isShellHTML(url)) {
    event.respondWith(networkFirst(req));
    return;
  }

  // All other paths: pass through. SW does not intercept.
});

async function cacheFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  const hit = await cache.match(req);
  if (hit) return hit;
  try {
    const res = await fetch(req);
    if (res && res.status === 200) {
      cache.put(req, res.clone());
      // Best-effort: drop older cached entries for the same path with
      // different `?v=` so the cache doesn't accumulate prior versions
      // of app.js / style.css across releases.
      sweepStaleVersions(cache, new URL(req.url));
    }
    return res;
  } catch (err) {
    // Last-resort fallback: any prior cached version, even if URL
    // mismatched (e.g. older `?v=`).
    const fallback = await cache.match(req, { ignoreSearch: true });
    if (fallback) return fallback;
    throw err;
  }
}

async function sweepStaleVersions(cache, freshUrl) {
  try {
    const keys = await cache.keys();
    for (const k of keys) {
      const u = new URL(k.url);
      if (u.origin === freshUrl.origin
          && u.pathname === freshUrl.pathname
          && u.search !== freshUrl.search) {
        cache.delete(k);
      }
    }
  } catch (e) { /* sweep is fire-and-forget */ }
}

async function networkFirst(req) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const res = await fetch(req);
    if (res && res.status === 200) cache.put(req, res.clone());
    return res;
  } catch (err) {
    const hit = await cache.match(req);
    if (hit) return hit;
    throw err;
  }
}
