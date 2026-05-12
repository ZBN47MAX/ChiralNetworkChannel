// System CPU load monitor for the adaptive HLS transcode scheduler.
//
// Purpose
// -------
// The pretranscode scheduler (server.js) needs a coarse signal for
// "how busy is the box right now" so it can decide whether to:
//
//   - run a queue ffmpeg full-throttle (no other load),
//   - run it throttled (someone is browsing, but the box has slack),
//   - or pause it entirely (someone is actively hammering the CPU).
//
// "CPU idle %" averaged over a short window is the cleanest signal we
// can get on the DS124 without root tools. Read /proc/stat once every
// SAMPLE_MS, diff against the previous sample, and expose the result.
//
// Strategy
// --------
// Linux: parse /proc/stat first line, fields:
//   cpu  user nice system idle iowait irq softirq steal guest guest_nice
// idle_total = idle + iowait    (de-facto Linux convention)
// busy_total = sum(all) - idle_total
// idlePct over the [prev,now] window = delta_idle / delta_total * 100.
//
// Windows: /proc/stat doesn't exist. Fall back to os.cpus(), which
// reports cumulative tick counts per logical core in {user, nice, sys,
// idle, irq}. Sum across cores and apply the same delta math. The
// numbers aren't identical to /proc but they're close enough for our
// "is the box busy or not" coarse decision and Windows is dev-only.
//
// Sampling cadence
// ----------------
// SAMPLE_MS = 5000. Faster than the scheduler's 5s tick would oscillate
// the throttle/full decision on every burst of API traffic; slower
// would lag the response to someone returning to a browser tab. 5s is
// the same window the scheduler operates on, so they line up.
//
// First-call edge case
// --------------------
// We can only compute idle% over a [prev,now] window — the very first
// sample has no prior point. init() takes one baseline sample at boot
// and the first getIdlePercent() call returns 100 (assume idle until
// we know otherwise — biases the scheduler toward "go ahead and run"
// during the boot warm-up, which is fine: if the box was actually
// busy at boot the next 5s sample corrects it).

'use strict';

const fs = require('fs');
const os = require('os');

// Window between samples. Aligned with the scheduler tick interval in
// server.js so the idle% never lags by more than one tick.
const SAMPLE_MS = 5000;

// Most recently computed idle percentage [0..100]. Initialized to 100
// so the first scheduler tick after boot doesn't misread an unknown
// state as "busy". Updated on every successful sample.
let lastIdlePct = 100;

// Raw tick counters from the previous sample, used to compute deltas.
// null until the first sample completes.
let prev = null;

// Interval handle; exported for tests / clean shutdown.
let timer = null;

/**
 * @brief Read raw cpu time counters from /proc/stat (Linux) or
 *        os.cpus() (everywhere else). Returns {idle, total} in jiffies/
 *        ticks. Values are cumulative since boot — caller diffs them
 *        across samples.
 *
 *        Linux fields used:
 *          idle  = stat.idle + stat.iowait   (the standard "is the cpu
 *                                             waiting for work" sum)
 *          total = sum of every field on the cpu line
 *
 *        os.cpus() fields used (all platforms incl. Windows fallback):
 *          idle  = sum of times.idle across logical cores
 *          total = sum of (user+nice+sys+idle+irq) across cores
 *
 * @returns {{idle:number, total:number}} on success, or null on failure.
 */
function readCpuTicks() {
  if (process.platform === 'linux') {
    let raw;
    try {
      raw = fs.readFileSync('/proc/stat', 'utf8');
    } catch (_e) {
      // /proc unreadable (container without /proc, hardened sandbox).
      // Fall through to the os.cpus() path so the scheduler still
      // gets *some* signal.
      raw = null;
    }
    if (raw) {
      // First line is the aggregate "cpu" row. Subsequent lines are
      // per-core ("cpu0", "cpu1", ...) which we don't need.
      const firstLine = raw.split('\n', 1)[0];
      const parts = firstLine.trim().split(/\s+/);
      // parts[0] === 'cpu', parts[1..] are counters.
      if (parts[0] === 'cpu' && parts.length >= 5) {
        const nums = parts.slice(1).map((n) => Number(n) || 0);
        const idle = nums[3] + (nums[4] || 0); // idle + iowait
        let total = 0;
        for (const n of nums) total += n;
        return { idle, total };
      }
    }
  }
  // Cross-platform fallback. os.cpus() returns one entry per logical
  // core; sum the times so the {idle,total} pair represents the whole
  // box, matching the /proc/stat aggregate row semantically.
  const cpus = os.cpus();
  if (!cpus || cpus.length === 0) return null;
  let idle = 0;
  let total = 0;
  for (const c of cpus) {
    const t = c.times;
    if (!t) continue;
    idle += t.idle || 0;
    total += (t.user || 0) + (t.nice || 0) + (t.sys || 0)
           + (t.idle || 0) + (t.irq || 0);
  }
  return { idle, total };
}

/**
 * @brief Take one sample and update lastIdlePct based on the delta vs
 *        the previous sample. No-op on the very first call (prev is
 *        null) — that call just establishes the baseline.
 *
 *        Resilient to non-monotonic readings: if total goes backwards
 *        (clock skew, /proc oddity) we keep the old value rather than
 *        emitting a nonsense percentage.
 */
function tick() {
  const now = readCpuTicks();
  if (!now) return;
  if (prev) {
    const dIdle = now.idle - prev.idle;
    const dTotal = now.total - prev.total;
    if (dTotal > 0 && dIdle >= 0) {
      let pct = (dIdle / dTotal) * 100;
      if (pct < 0) pct = 0;
      if (pct > 100) pct = 100;
      lastIdlePct = pct;
    }
  }
  prev = now;
}

/**
 * @brief Start the sampling interval. Idempotent — calling twice does
 *        nothing extra. .unref()'d so this monitor never keeps the
 *        node process alive on its own.
 *
 *        Takes one baseline sample synchronously so getIdlePercent()
 *        returns the initial 100 (idle assumption) until the next
 *        SAMPLE_MS tick produces a real number.
 */
function start() {
  if (timer) return;
  // Baseline sample. prev is null at this point so tick() just stores
  // the current counters without computing a percentage.
  tick();
  timer = setInterval(tick, SAMPLE_MS);
  // Never block process exit on this poller alone — node should exit
  // cleanly when express.close() runs even if a sample is mid-flight.
  if (timer.unref) timer.unref();
}

/**
 * @brief Stop sampling and reset state. Test hook only — production
 *        code calls start() once at boot and never tears it down.
 */
function stop() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  prev = null;
  lastIdlePct = 100;
}

/**
 * @brief The scheduler's primary input: how idle the box is right now.
 *
 *        Returns a value in [0, 100] where 100 means "completely idle"
 *        and 0 means "100% pegged". The scheduler compares this
 *        against a threshold (default 60%) to decide whether the
 *        throttled-tier transcode is allowed to run alongside live
 *        user traffic.
 *
 *        Returns the LAST sampled value, not the instantaneous one.
 *        Sampling happens every SAMPLE_MS so the value is always at
 *        most one window stale — acceptable since the scheduler tick
 *        runs on the same cadence.
 *
 * @returns {number} idle percentage in [0,100].
 */
function getIdlePercent() {
  return lastIdlePct;
}

module.exports = {
  start,
  stop,
  getIdlePercent,
  // Exported for tests / diagnostics.
  _SAMPLE_MS: SAMPLE_MS,
  _readCpuTicks: readCpuTicks,
};
