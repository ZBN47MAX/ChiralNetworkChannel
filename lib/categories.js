// Category tag store — labels for collection types ("剧集", "有声书", etc).
//
// Structure on disk (data/categories.json):
//   {
//     "video": [
//       { "id": "series", "label": "剧集", "parentId": null, "order": 0, "hidden": false, "keywords": [] },
//       ...
//     ],
//     "audio": [...],
//     ...
//   }
//
// Hierarchy (added in 1.1.0, expanded to 5 levels in 1.3.0):
//   - parentId: id of the parent category in the same kind, or null for top-level.
//   - order:    sibling sort key under the same parent.
//   - Depth ≤ MAX_DEPTH (5 levels: top → 1st → 2nd → 3rd → 4th nested child).
//   - Cycles, dangling parentIds and over-depth nodes are detected by sanitize
//     and reset to top-level (parentId = null) with a console.warn.
//   - Older files without parentId/order load as flat top-level (zero migration).

const fs = require('fs');
const path = require('path');

const MAX_DEPTH = 5; // top (depth 0) + 4 nested levels.

function createStore(options) {
  if (!options || typeof options.file !== 'string' || !options.file) {
    throw new Error('categories.createStore: options.file is required');
  }
  const FILE = path.resolve(options.file);
  const TMP  = FILE + '.tmp';
  const SEED = options.seed || { video: [], audio: [] };

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

  const KINDS = Object.keys(SEED);  // e.g. ['video', 'audio', 'image', 'novel']

  // Per-kind sanitize: validate each entry, normalize parentId/order, then
  // resolve hierarchy (drop cycles + over-depth + dangling parents to null).
  function sanitize(input) {
    const out = {};
    for (const kind of KINDS) out[kind] = [];
    for (const kind of KINDS) {
      const arr = (input && Array.isArray(input[kind])) ? input[kind] : [];
      const seen = new Set();
      const items = [];
      for (const item of arr) {
        if (!item || typeof item !== 'object') continue;
        const id    = typeof item.id    === 'string' ? item.id.trim()    : '';
        const label = typeof item.label === 'string' ? item.label.trim() : '';
        if (!id || !label) continue;
        if (id.length > 40 || label.length > 40) continue;
        if (!/^[a-zA-Z0-9_\-]+$/.test(id)) continue;
        if (seen.has(id)) continue;
        seen.add(id);
        const parentIdRaw = typeof item.parentId === 'string' ? item.parentId.trim() : '';
        const parentId = parentIdRaw ? parentIdRaw : null;
        const order = (typeof item.order === 'number' && Number.isFinite(item.order)) ? item.order : 0;
        items.push({
          id,
          label,
          parentId,
          order,
          hidden: !!item.hidden,
          keywords: sanitizeKeywords(item.keywords),
        });
      }
      // Resolve parentId references: drop dangling (parentId not in seen),
      // detect cycles via DFS, enforce MAX_DEPTH. Order field gets a backfill
      // from array position so existing files stay stable on read.
      out[kind] = resolveHierarchy(items, kind);
    }
    return out;
  }

  // Resolve parentId references in-place. Mutates `items` and returns the
  // sanitized list (same array). Uses `idMap` for O(1) lookups; iteration
  // cap on the cycle DFS prevents pathological inputs from hanging boot.
  function resolveHierarchy(items, kind) {
    const idMap = new Map();
    for (const it of items) idMap.set(it.id, it);
    // Drop parentId values that don't reference a sibling in the same kind.
    for (const it of items) {
      if (it.parentId && !idMap.has(it.parentId)) {
        console.warn(`[categories] ${kind}: ${it.id}.parentId "${it.parentId}" not found, promoted to top-level`);
        it.parentId = null;
      }
      if (it.parentId === it.id) {
        console.warn(`[categories] ${kind}: ${it.id} self-references, promoted to top-level`);
        it.parentId = null;
      }
    }
    // Cycle / over-depth pass. For each node, walk up; if we revisit a
    // node in the current path or exceed MAX_DEPTH-1 (depth 0 = top), break
    // the cycle by setting the offending parentId to null.
    const SAFETY = 1000;
    for (const it of items) {
      let cur = it;
      const path = new Set();
      let steps = 0;
      while (cur && cur.parentId) {
        if (path.has(cur.id)) {
          console.warn(`[categories] ${kind}: cycle detected at ${cur.id}, breaking`);
          cur.parentId = null;
          break;
        }
        path.add(cur.id);
        steps++;
        if (steps > SAFETY) {
          console.warn(`[categories] ${kind}: parent chain exceeded safety bound at ${cur.id}, breaking`);
          cur.parentId = null;
          break;
        }
        if (steps >= MAX_DEPTH) {
          // The current node is at depth=steps with a still-present parent
          // — that pushes it past MAX_DEPTH. Promote.
          console.warn(`[categories] ${kind}: ${it.id} exceeds depth ${MAX_DEPTH}, promoted`);
          it.parentId = null;
          break;
        }
        cur = idMap.get(cur.parentId);
      }
    }
    // Backfill order from array position (stable). Same parent → ascending.
    const orderByParent = new Map();
    for (const it of items) {
      const k = it.parentId || '';
      const next = (orderByParent.get(k) || 0);
      if (typeof it.order !== 'number' || !Number.isFinite(it.order)) it.order = next;
      orderByParent.set(k, next + 1);
    }
    return items;
  }

  // Smart-tagging vocabulary: per-category keyword list. Title containing
  // any of these substrings (case-insensitive) auto-checks the chip in the
  // create-collection dialog. Stored alongside id/label/hidden/parentId so
  // a single PUT /api/admin/categories writes everything.
  function sanitizeKeywords(input) {
    if (!Array.isArray(input)) return [];
    const out = [];
    const seen = new Set();
    for (const raw of input) {
      if (typeof raw !== 'string') continue;
      const w = raw.trim();
      if (!w || w.length > 60) continue;
      // Dedupe key folds NFKC + lowercase so full-width / ligature /
      // case variants don't slip through as separate entries.
      let k = w;
      try { k = k.normalize('NFKC'); } catch (_e) {}
      k = k.toLowerCase();
      if (seen.has(k)) continue;
      seen.add(k);
      out.push(w);
      if (out.length >= 100) break;
    }
    return out;
  }
  // Convenience: which category ids carry hidden=true (this node alone).
  // For the "anything under a hidden ancestor counts as hidden" semantic
  // used by filter / taint logic, use effectiveHiddenIds() instead.
  function hiddenIds(kind) {
    const list = (cache && cache[kind]) || [];
    const set = new Set();
    for (const c of list) if (c.hidden) set.add(c.id);
    return set;
  }
  function validIds(kind) {
    const list = (cache && cache[kind]) || [];
    return new Set(list.map((c) => c.id));
  }

  // ---- Hierarchy helpers (1.1.0+) ---------------------------------
  function _list(kind) {
    return (cache && cache[kind]) || [];
  }
  function _idMap(kind) {
    const m = new Map();
    for (const c of _list(kind)) m.set(c.id, c);
    return m;
  }
  // Returns nested view: each Node = { ...flat, depth, children: Node[] }.
  // Children sorted by order then label so UIs render deterministically.
  function getTree(kind) {
    const list = _list(kind);
    const byParent = new Map();
    for (const c of list) {
      const p = c.parentId || null;
      if (!byParent.has(p)) byParent.set(p, []);
      byParent.get(p).push(c);
    }
    const cmp = (a, b) => (a.order - b.order) || a.label.localeCompare(b.label, 'zh-CN');
    function build(parentId, depth) {
      const kids = (byParent.get(parentId) || []).slice().sort(cmp);
      return kids.map((c) => ({ ...c, depth, children: build(c.id, depth + 1) }));
    }
    return build(null, 0);
  }
  // Self + all descendants. Empty Set if id missing or null.
  function descendantIds(kind, id) {
    const out = new Set();
    if (!id) return out;
    const list = _list(kind);
    if (!list.some((c) => c.id === id)) return out;
    out.add(id);
    const childrenOf = new Map();
    for (const c of list) {
      const p = c.parentId || null;
      if (!childrenOf.has(p)) childrenOf.set(p, []);
      childrenOf.get(p).push(c.id);
    }
    const stack = [id];
    while (stack.length) {
      const cur = stack.pop();
      for (const childId of childrenOf.get(cur) || []) {
        if (!out.has(childId)) {
          out.add(childId);
          stack.push(childId);
        }
      }
    }
    return out;
  }
  // Walk up the parent chain. Does NOT include `id` itself.
  function ancestorIds(kind, id) {
    const out = [];
    if (!id) return out;
    const m = _idMap(kind);
    let cur = m.get(id);
    let steps = 0;
    while (cur && cur.parentId && steps < MAX_DEPTH + 1) {
      out.push(cur.parentId);
      cur = m.get(cur.parentId);
      steps++;
    }
    return out;
  }
  // Union of (each hidden node ∪ its descendants).
  function effectiveHiddenIds(kind) {
    const out = new Set();
    for (const c of _list(kind)) {
      if (!c.hidden) continue;
      for (const id of descendantIds(kind, c.id)) out.add(id);
    }
    return out;
  }
  // For each granted id, expand to (self ∪ descendants). Does NOT walk up.
  // Used to compute the user's effective visibleCategories on the server.
  function expandGrant(kind, ids) {
    const out = new Set();
    if (!Array.isArray(ids)) return out;
    for (const id of ids) {
      for (const child of descendantIds(kind, id)) out.add(child);
    }
    return out;
  }
  // Given a list of leaf ids (typically a collection's c.types[]), expand
  // to (self ∪ all ancestors). Used to drive the parent-chip-matches-children
  // semantic in mountSubsystem's op filter.
  function expandUpward(kind, ids) {
    const out = new Set();
    if (!Array.isArray(ids)) return out;
    for (const id of ids) {
      if (!id) continue;
      out.add(id);
      for (const a of ancestorIds(kind, id)) out.add(a);
    }
    return out;
  }
  // "魔法少女 / まどか / 叛逆" — full label path of an id.
  function pathLabel(kind, id, sep) {
    const s = typeof sep === 'string' ? sep : ' / ';
    if (!id) return '';
    const m = _idMap(kind);
    const node = m.get(id);
    if (!node) return id;
    const labels = [node.label];
    let cur = node;
    let steps = 0;
    while (cur && cur.parentId && steps < MAX_DEPTH + 1) {
      const parent = m.get(cur.parentId);
      if (!parent) break;
      labels.unshift(parent.label);
      cur = parent;
      steps++;
    }
    return labels.join(s);
  }

  async function init() {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    if (!fs.existsSync(FILE)) {
      cache = sanitize(SEED);
      // Always guarantee at least one entry per subsystem by falling back
      // to the seed when sanitation drops everything.
      for (const kind of KINDS) {
        if (!cache[kind].length && SEED[kind]) cache[kind] = SEED[kind].slice();
      }
      await withLock(() => writeAtomic());
      return;
    }
    try {
      const raw = fs.readFileSync(FILE, 'utf8');
      const parsed = raw.trim() === '' ? {} : JSON.parse(raw);
      cache = sanitize(parsed);
      for (const kind of KINDS) {
        if (!cache[kind].length && SEED[kind]) cache[kind] = SEED[kind].slice();
      }
    } catch (e) {
      throw new Error('categories.json 已损坏: ' + e.message);
    }
  }

  function get() {
    const out = {};
    for (const kind of KINDS) {
      out[kind] = (cache[kind] || []).map((c) => ({ ...c }));
    }
    return out;
  }

  function replace(newCategories) {
    const sanitized = sanitize(newCategories);
    for (const kind of KINDS) {
      if (sanitized[kind].length === 0 && SEED[kind]) sanitized[kind] = SEED[kind].slice();
    }
    return withLock(() => {
      cache = sanitized;
      writeAtomic();
      return get();
    });
  }

  return {
    init, get, replace,
    hiddenIds, validIds,
    getTree, descendantIds, ancestorIds,
    effectiveHiddenIds, expandGrant, expandUpward, pathLabel,
  };
}

module.exports = { createStore, MAX_DEPTH };
