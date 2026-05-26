// =============================================================================
// lib/concurrency.js
// =============================================================================
//
// Global single-slot ffmpeg / ffprobe spawn budget.
//
// Why this module exists
// ----------------------
// The DS124 ships with 1 GiB of non-expandable RAM. Each ffmpeg child carries
// roughly 30-150 MB of resident set depending on workload (probe is cheapest,
// HLS pretranscode the most expensive). On 2026-05-10 we shipped v1.9.0 with
// a soft "two ffmpeg processes is fine" assumption and the device immediately
// went into swap thrashing — the kernel paged out node itself, the front-end
// became unresponsive, and the only fix was a power cycle. That was the
// official discovery that on the DS124 RAM is the binding constraint, not
// CPU, and that any ffmpeg-class spawn must be globally serialized.
//
// This module is the single enforcement point. Every ffmpeg or ffprobe spawn
// in the project routes through `acquire()` first and `release()` on exit.
// New caller sites must NOT call `child_process.spawn(ffmpeg, ...)` directly;
// they must go through the slot.
//
// Priority lanes
// --------------
// Two lanes only — keeping the lattice small avoids the v1.9.0 rabbit hole
// where every new tier added introduced new edge cases:
//
//   foreground   Interactive playback. A user is actively waiting on the HTTP
//                response — audio HiFi stream, video fmp4 stream, on-demand
//                /media-stream remux. These callers expect sub-second TTFB
//                and DO NOT tolerate queueing behind background work.
//
//   background   Best-effort work the user is not waiting on. HLS pretranscode
//                queue, ffprobe scan tick, audio cover extraction. Acceptable
//                outcome under contention: get SIGKILL'd and try again later.
//
// Preemption policy
// -----------------
// When a foreground request arrives and the current holder is background, the
// holder is preempted immediately:
//   1. The new foreground request synchronously takes the slot (no await).
//   2. The displaced holder's `onPreempt` callback is fired. It MUST kill its
//      child process before returning. Failure to do so leaks a process AND
//      double-allocates the slot's RAM budget — exactly the v1.9.0 outage.
//   3. The preempted token's later `release()` call becomes a no-op; the slot
//      has already moved on.
//
// Why kill instead of pause:
// The v1.9.0 design tried SIGSTOP / SIGCONT to "yield" without losing work.
// Two problems killed it: (a) SIGSTOP does not release RAM, only deschedules
// the process, so the RAM-bound contention was unsolved; and (b) the resume
// signal raced the foreground completion and produced an oscillation between
// "stopped" and "running" where the throttled job made no progress. The 2026
// rule is firm: yielding the slot means SIGKILL. Background callers that
// care about progress (pretranscode) must persist their state externally and
// be restartable from scratch.
//
// What this module deliberately does NOT do
// -----------------------------------------
// - It does not own any process lifecycle. Callers spawn their own children
//   and pass `onPreempt` so this module can ask for a kill. It would be
//   tempting to wrap spawn() here so the slot can guarantee cleanup, but
//   that ties the module to a specific argv shape and breaks for ffmpeg
//   wrappers that fork via `nice -n N ffmpeg ...` (POSIX) where the child
//   is `nice`, not `ffmpeg`, and the PGID matters. Leaving spawn to the
//   caller keeps the module thin and reusable.
//
// - It does not arbitrate beyond the slot. There is no fairness, no aging,
//   no preemption between same-priority requests. The DS124's typical
//   workload is a single user so contention within the same lane is rare;
//   when it does happen, FIFO is good enough.
//
// - It does not handle stuck holders. If a background process hangs without
//   ever calling release(), the slot stays held forever. Production safety
//   net is in server.js: a 30 s watchdog checks `snapshot().holder.elapsedMs`
//   and force-releases the slot if the holder has been stuck past a sane
//   ceiling. That watchdog is intentionally out of this module so the
//   lifecycle policy lives next to the queue policy that depends on it.
// =============================================================================

'use strict';

/**
 * Internal holder record.
 *
 * @typedef {Object} Holder
 * @property {number} token         Monotonically increasing token identifier.
 * @property {'foreground'|'background'} priority
 * @property {function|null} onPreempt   Sync callback fired on preemption.
 * @property {string} label         Diagnostic label for logs / admin UI.
 * @property {number} acquiredAt    Wall-clock ms when the slot was granted.
 */

/**
 * Internal waiter record (queued acquisition request awaiting the slot).
 *
 * @typedef {Object} Waiter
 * @property {'foreground'|'background'} priority
 * @property {function|null} onPreempt
 * @property {string} label
 * @property {function} resolve     Promise resolver passed to caller.
 */

/** @type {Holder|null} */
let holder = null;

/** @type {Waiter[]} */
const waitQueue = [];

/** @type {number} */
let tokenSeq = 0;

/**
 * @brief Grant the slot to a waiting request and emit a resolved Promise.
 *
 * Splits out of acquire() so the same code path can be reused by _pump()
 * when the slot is released, and by the preemption fast path inside
 * acquire() itself when a foreground request displaces a background holder.
 *
 * @param {Waiter} waiter The request to grant.
 */
function _grant(waiter) {
  const token = ++tokenSeq;
  holder = {
    token,
    priority: waiter.priority,
    onPreempt: waiter.onPreempt,
    label: waiter.label,
    acquiredAt: Date.now(),
  };
  waiter.resolve({
    token,
    /**
     * @brief Release the slot back to the pool.
     *
     * Idempotent. Safe to call after preemption (the token will no longer
     * match the active holder, so the call is silently dropped). Callers
     * should release() in the child process 'exit' handler regardless of
     * whether they were preempted, simply because tracking the preemption
     * state separately in every call site would be error-prone.
     */
    release() {
      if (holder && holder.token === token) {
        holder = null;
        _pump();
      }
    },
  });
}

/**
 * @brief Pick the next waiter (if any) and grant it the slot.
 *
 * Selection rules:
 *   1. Foreground waiters always win over background waiters, regardless of
 *      arrival order. This matches the policy users expect: interactive
 *      playback never waits on background scans.
 *   2. Within a single priority lane, FIFO. Same-lane contention is rare
 *      enough on a single-user device that anything fancier (aging,
 *      weighted fair queueing) would be over-engineered.
 *
 * Called from release() and from the preemption path in acquire().
 */
function _pump() {
  if (holder) return;
  let nextIdx = -1;
  for (let i = 0; i < waitQueue.length; i++) {
    if (waitQueue[i].priority === 'foreground') { nextIdx = i; break; }
  }
  if (nextIdx === -1 && waitQueue.length > 0) nextIdx = 0;
  if (nextIdx === -1) return;
  const next = waitQueue.splice(nextIdx, 1)[0];
  _grant(next);
}

/**
 * @brief Acquire the global ffmpeg / ffprobe spawn slot.
 *
 * Behavior matrix (current state → action on acquire):
 *
 *   holder=null               → grant immediately (sync resolved Promise).
 *   holder=background, req=fg → preempt holder (fire onPreempt), grant new.
 *   holder=foreground, req=fg → queue FIFO behind current holder.
 *   holder=*,          req=bg → queue (foreground always wins on _pump()).
 *
 * Once acquired, the caller MUST eventually call release() on the returned
 * token. The recommended pattern is to release inside the spawned process's
 * 'exit' handler so that abnormal terminations (SIGKILL from preemption,
 * crashes, OOM-kill) still free the slot:
 *
 *   const slot = await concurrency.acquire({
 *     priority: 'foreground',
 *     onPreempt: () => { try { child.kill('SIGKILL'); } catch (_e) {} },
 *     label: 'audio-stream:' + collectionId + '/' + file,
 *   });
 *   const child = spawn(ffmpeg, args, ...);
 *   child.on('exit', () => slot.release());
 *
 * Note: onPreempt is invoked synchronously by the next acquire() call. It
 * must not do async work; it must initiate the kill and return. The actual
 * 'exit' event arriving later is fine — release() is idempotent.
 *
 * @param {Object} opts
 * @param {'foreground'|'background'} [opts.priority='background']
 *        Lane for this request. Foreground preempts background.
 * @param {function} [opts.onPreempt]
 *        Sync callback fired if this holder is preempted by a foreground
 *        arrival. The callback must terminate the underlying child process.
 *        If absent (e.g. a probe that doesn't expose its child), the slot
 *        is still released by setting holder=null, which can leave a leaked
 *        process — avoid this for anything but trivial short-lived spawns.
 * @param {string} [opts.label='(unlabeled)']
 *        Human-readable identifier surfaced in snapshot() and admin logs.
 * @returns {Promise<{token: number, release: function}>}
 *          Resolves when the slot is granted. The caller's chosen lane and
 *          the current contention determine whether resolution is immediate
 *          (typically <1 ms) or delayed (background work may wait many
 *          minutes behind a long fmp4 stream).
 */
function acquire(opts) {
  const o = opts || {};
  const priority = o.priority === 'foreground' ? 'foreground' : 'background';
  const onPreempt = typeof o.onPreempt === 'function' ? o.onPreempt : null;
  const label = typeof o.label === 'string' && o.label ? o.label : '(unlabeled)';

  return new Promise((resolve) => {
    const req = { priority, onPreempt, label, resolve };

    // Fast path: slot is free.
    if (!holder) { _grant(req); return; }

    // Preemption path: foreground arriving while a background job holds.
    // Snapshot the victim then null out the holder BEFORE firing onPreempt
    // so that any callback re-entry (e.g. the kill handler synchronously
    // invokes release()) sees a consistent state.
    if (priority === 'foreground' && holder.priority === 'background') {
      const victim = holder;
      holder = null;
      try { if (victim.onPreempt) victim.onPreempt(); } catch (_e) { /* swallow */ }
      _grant(req);
      return;
    }

    // Default: enqueue behind whoever is ahead in our lane.
    waitQueue.push(req);
  });
}

/**
 * @brief Diagnostic snapshot of the current slot state.
 *
 * Used by the admin UI and the watchdog in server.js. Returns a plain object
 * suitable for JSON.stringify; no live references to internal state escape.
 *
 * @returns {{holder: (Object|null), waiting: Array<{priority: string, label: string}>}}
 */
function snapshot() {
  return {
    holder: holder ? {
      token: holder.token,
      priority: holder.priority,
      label: holder.label,
      acquiredAt: holder.acquiredAt,
      elapsedMs: Date.now() - holder.acquiredAt,
    } : null,
    waiting: waitQueue.map((w) => ({ priority: w.priority, label: w.label })),
  };
}

/**
 * @brief Forcibly release the slot, ignoring token mismatch.
 *
 * Watchdog escape hatch. Only call this when snapshot() shows a holder that
 * has been stuck past a sane ceiling (default in server.js: 30 minutes for
 * background, 5 minutes for foreground). Calling this leaks any process the
 * stuck holder owned — that is the cost of recovery.
 *
 * @param {string} [reason] Logged for postmortem analysis.
 */
function forceReleaseStuck(reason) {
  if (!holder) return false;
  const evicted = holder;
  holder = null;
  try {
    // eslint-disable-next-line no-console
    console.warn('[concurrency] force-released stuck holder', {
      label: evicted.label,
      priority: evicted.priority,
      elapsedMs: Date.now() - evicted.acquiredAt,
      reason: reason || 'unspecified',
    });
  } catch (_e) { /* swallow */ }
  // Best-effort kill if the holder gave us one.
  try { if (evicted.onPreempt) evicted.onPreempt(); } catch (_e) {}
  _pump();
  return true;
}

module.exports = {
  acquire,
  snapshot,
  forceReleaseStuck,
};
