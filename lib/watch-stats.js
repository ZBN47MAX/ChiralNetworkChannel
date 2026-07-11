'use strict';
// Per-user watch statistics store — daily-aggregated buckets, factory pattern.
// Sibling of lib/progress.js, but records HISTORY (per-day watched seconds and
// "crossed 70%" counts) rather than only the latest snapshot. Forward-only:
// data accumulates from the first record() call; the past cannot be rebuilt.
//
// On-disk shape:
//   {
//     "alice": {
//       "2026-06-09": {                                  // local-date bucket
//         "video\x00<collectionId>\x00<file>": { "sec": 1320, "views": 2 }
//       }
//     }
//   }
//   sec   = real watched seconds accumulated that day for that episode.
//   views = number of play sessions that crossed the 70% threshold that day.

const fs = require('fs');
const path = require('path');

/** Field separator inside an entry key; never appears in valid ids/filenames. */
const SEP = '\x00';
/** Hard ceiling on a single record() second-delta, guards against clock glitches. */
const MAX_BEAT_SEC = 3600;

/**
 * Zero-pad an integer to two digits.
 * @param {number} n
 * @returns {string}
 */
function pad2(n) { return n < 10 ? '0' + n : '' + n; }

/**
 * Format a Date as a local YYYY-MM-DD day key.
 * @param {Date} date
 * @returns {string}
 */
function toDayKey(date) {
  return date.getFullYear() + '-' + pad2(date.getMonth() + 1) + '-' + pad2(date.getDate());
}

/**
 * Parse a YYYY-MM-DD string into a local midnight Date, or null if malformed.
 * @param {string} s
 * @returns {Date|null}
 */
function fromDayKey(s) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ''));
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

/**
 * Compute the inclusive [from, to] day-key range for a period anchored on a day.
 * @param {string} period  'day' | 'month' | 'quarter' | 'year' | 'all'
 * @param {Date} d         anchor date
 * @returns {{from:string,to:string}|null}  null for 'all' (unbounded)
 */
function rangeFor(period, d) {
  if (period === 'all') return null;
  if (period === 'day') return { from: toDayKey(d), to: toDayKey(d) };
  if (period === 'month') {
    return { from: toDayKey(new Date(d.getFullYear(), d.getMonth(), 1)),
             to:   toDayKey(new Date(d.getFullYear(), d.getMonth() + 1, 0)) };
  }
  if (period === 'quarter') {
    const q = Math.floor(d.getMonth() / 3);
    return { from: toDayKey(new Date(d.getFullYear(), q * 3, 1)),
             to:   toDayKey(new Date(d.getFullYear(), q * 3 + 3, 0)) };
  }
  if (period === 'year') {
    return { from: d.getFullYear() + '-01-01', to: d.getFullYear() + '-12-31' };
  }
  return { from: toDayKey(d), to: toDayKey(d) }; // unknown period -> treat as day
}

/**
 * Create a watch-stats store bound to a JSON file.
 * @param {{file:string, clock?:function():Date}} options
 *        clock is injectable so day-bucketing is deterministic under test.
 */
function createStore(options) {
  if (!options || typeof options.file !== 'string' || !options.file) {
    throw new Error('watch-stats.createStore: options.file is required');
  }
  const FILE = path.resolve(options.file);
  const TMP = FILE + '.tmp';
  const clock = typeof options.clock === 'function' ? options.clock : () => new Date();

  let cache = null;
  let writeLock = Promise.resolve();

  /**
   * Serialize async mutations so concurrent writes never interleave.
   * @param {function():*} fn
   * @returns {Promise<*>}
   */
  function withLock(fn) {
    const next = writeLock.then(fn, fn);
    writeLock = next.catch(() => {});
    return next;
  }

  /** Persist the whole cache via temp-file + rename (atomic on same fs). */
  function writeAtomic() {
    fs.writeFileSync(TMP, JSON.stringify(cache, null, 2));
    fs.renameSync(TMP, FILE);
  }

  /** Load the file into memory, creating an empty one on first run. */
  async function init() {
    fs.mkdirSync(path.dirname(FILE), { recursive: true });
    if (!fs.existsSync(FILE)) { cache = {}; await withLock(() => writeAtomic()); return; }
    let raw;
    try { raw = fs.readFileSync(FILE, 'utf8'); }
    catch (e) { throw new Error('无法读取观看统计文件: ' + e.message); }
    try {
      const parsed = raw.trim() === '' ? {} : JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('根对象非法');
      cache = parsed;
    } catch (e) { throw new Error('观看统计文件已损坏: ' + e.message); }
  }

  /**
   * Build the composite entry key for an episode within a day bucket.
   * @param {string} subsystem
   * @param {string} collectionId
   * @param {string} file
   * @returns {string}
   */
  function entryKey(subsystem, collectionId, file) {
    return [subsystem, collectionId, file].join(SEP);
  }

  /**
   * Accumulate watched seconds and/or one view into TODAY's bucket.
   * @param {string} username
   * @param {string} subsystem  'video' | 'audio'
   * @param {string} collectionId
   * @param {string} file
   * @param {{sec?:number, view?:number|boolean}} patch
   * @returns {Promise<{sec:number,views:number}>|undefined}  undefined on no-op
   */
  function record(username, subsystem, collectionId, file, patch) {
    if (typeof username !== 'string' || !username) throw new Error('username 非法');
    if (subsystem !== 'video' && subsystem !== 'audio') throw new Error('subsystem 非法');
    if (typeof collectionId !== 'string' || !collectionId) throw new Error('collectionId 非法');
    if (typeof file !== 'string' || !file) throw new Error('file 非法');
    let sec = Number(patch && patch.sec);
    if (!Number.isFinite(sec) || sec < 0) sec = 0;
    if (sec > MAX_BEAT_SEC) sec = MAX_BEAT_SEC;
    const view = !!(patch && (patch.view === 1 || patch.view === true));
    if (sec === 0 && !view) return; // nothing meaningful to record

    return withLock(() => {
      const day = toDayKey(clock());
      const k = entryKey(subsystem, collectionId, file);
      if (!cache[username]) cache[username] = {};
      if (!cache[username][day]) cache[username][day] = {};
      const cell = cache[username][day][k] || { sec: 0, views: 0 };
      cell.sec = Math.round((cell.sec + sec) * 1000) / 1000;
      if (view) cell.views += 1;
      cache[username][day][k] = cell;
      writeAtomic();
      return cell;
    });
  }

  /**
   * Aggregate one user's buckets for a period. Pure read; emits raw ids only
   * (subsystem/collectionId/file) — titles/covers are resolved by the caller.
   * @param {string} username
   * @param {{period?:string, anchor?:string}} opts
   * @returns {{range:{from:string,to:string},
   *            totals:{views:number,seconds:number,episodes:number},
   *            byDay:Array<{date:string,seconds:number,views:number}>,
   *            byMonth:Array<{month:string,seconds:number,views:number}>,
   *            byEpisode:Array<object>}}
   */
  function query(username, opts) {
    const period = (opts && opts.period) || 'all';
    const anchorDate = (opts && fromDayKey(opts.anchor)) || clock();
    const range = rangeFor(period, anchorDate);
    const byUser = cache[username] || {};
    const days = Object.keys(byUser)
      .filter((day) => !range || (day >= range.from && day <= range.to))
      .sort();

    const byDay = [];
    const monthMap = new Map(); // 'YYYY-MM' -> { seconds, views }
    const epMap = new Map();    // entryKey   -> aggregate
    let totalViews = 0, totalSec = 0;

    for (const day of days) {
      const cells = byUser[day];
      let dayViews = 0, daySec = 0;
      for (const k of Object.keys(cells)) {
        const c = cells[k];
        dayViews += c.views; daySec += c.sec;
        let agg = epMap.get(k);
        if (!agg) {
          const parts = k.split(SEP);
          agg = { subsystem: parts[0], collectionId: parts[1], file: parts[2],
                  views: 0, seconds: 0, lastDay: day };
          epMap.set(k, agg);
        }
        agg.views += c.views; agg.seconds += c.sec; agg.lastDay = day;
      }
      byDay.push({ date: day, seconds: Math.round(daySec), views: dayViews });
      const ym = day.slice(0, 7);
      const mm = monthMap.get(ym) || { seconds: 0, views: 0 };
      mm.seconds += daySec; mm.views += dayViews; monthMap.set(ym, mm);
      totalViews += dayViews; totalSec += daySec;
    }

    const byMonth = Array.from(monthMap.entries())
      .map(([month, v]) => ({ month, seconds: Math.round(v.seconds), views: v.views }))
      .sort((a, b) => (a.month < b.month ? -1 : 1));
    const byEpisode = Array.from(epMap.values())
      .map((e) => ({ subsystem: e.subsystem, collectionId: e.collectionId, file: e.file,
                     views: e.views, seconds: Math.round(e.seconds), lastDay: e.lastDay }))
      .sort((a, b) => b.seconds - a.seconds);
    const resolvedRange = range || {
      from: days[0] || toDayKey(anchorDate),
      to: days[days.length - 1] || toDayKey(anchorDate),
    };
    return {
      range: resolvedRange,
      totals: { views: totalViews, seconds: Math.round(totalSec), episodes: byEpisode.length },
      byDay, byMonth, byEpisode,
    };
  }

  /** Drop all data for one user (e.g. when they clear history). */
  function clearUser(username) {
    return withLock(() => {
      if (cache[username]) { delete cache[username]; writeAtomic(); }
    });
  }

  /** @returns {object} the in-memory cache (test/debug only) */
  function dump() { return cache; }

  return { init, record, query, clearUser, dump, entryKey, _clock: clock };
}

module.exports = { createStore, toDayKey, fromDayKey, rangeFor };
