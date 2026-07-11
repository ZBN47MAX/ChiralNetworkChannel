'use strict';
const test = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStore } = require('../lib/watch-stats');

// A fixed clock so day-bucketing is deterministic in tests.
function fixedClock(iso) { return () => new Date(iso); }
function tmpFile() {
  return path.join(os.tmpdir(), 'ws-test-' + process.pid + '-' + Math.floor(performance.now() * 1000) + '.json');
}
async function seed(file, clockIso) {
  const s = createStore({ file, clock: fixedClock(clockIso) });
  await s.init();
  return s;
}

// ---- Task 1: record + persistence ----------------------------------

test('record accumulates seconds and views into today bucket', async () => {
  const file = tmpFile();
  const s = createStore({ file, clock: fixedClock('2026-06-09T10:00:00') });
  await s.init();
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 5, view: 0 });
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 4.9, view: 1 });
  const dump = s.dump();
  const cell = dump.alice['2026-06-09'][s.entryKey('video', 'colA', 'ep01.mp4')];
  assert.strictEqual(cell.views, 1);
  assert.ok(Math.abs(cell.sec - 9.9) < 1e-6, 'sec should be ~9.9');
  fs.unlinkSync(file);
});

test('record clamps negative/absurd seconds and ignores empty patches', async () => {
  const file = tmpFile();
  const s = createStore({ file, clock: fixedClock('2026-06-09T10:00:00') });
  await s.init();
  await s.record('bob', 'audio', 'colB', 't1.mp3', { sec: -10, view: 0 }); // sec->0, no view => no-op
  await s.record('bob', 'audio', 'colB', 't1.mp3', { sec: 99999, view: 0 }); // clamp to 3600
  const cell = s.dump().bob['2026-06-09'][s.entryKey('audio', 'colB', 't1.mp3')];
  assert.strictEqual(cell.sec, 3600);
  assert.strictEqual(cell.views, 0);
  fs.unlinkSync(file);
});

test('record rejects bad subsystem', async () => {
  const file = tmpFile();
  const s = createStore({ file, clock: fixedClock('2026-06-09T10:00:00') });
  await s.init();
  await assert.rejects(() => Promise.resolve().then(() => s.record('x', 'image', 'c', 'f', { sec: 5 })));
  fs.unlinkSync(file);
});

test('init reloads persisted data from disk', async () => {
  const file = tmpFile();
  const s1 = createStore({ file, clock: fixedClock('2026-06-09T10:00:00') });
  await s1.init();
  await s1.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 7, view: 1 });
  const s2 = createStore({ file, clock: fixedClock('2026-06-10T10:00:00') });
  await s2.init();
  assert.strictEqual(s2.dump().alice['2026-06-09'][s2.entryKey('video', 'colA', 'ep01.mp4')].views, 1);
  fs.unlinkSync(file);
});

// ---- Task 2: query aggregation -------------------------------------

test('query month aggregates byDay/byMonth/byEpisode/totals', async () => {
  const file = tmpFile();
  let s = await seed(file, '2026-06-09T10:00:00');
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 1800, view: 1 });
  s = await seed(file, '2026-06-10T10:00:00'); // next day, same month
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 600, view: 1 });
  await s.record('alice', 'audio', 'colB', 't1.mp3', { sec: 300, view: 1 });

  const r = s.query('alice', { period: 'month', anchor: '2026-06-15' });
  assert.deepStrictEqual(r.range, { from: '2026-06-01', to: '2026-06-30' });
  assert.strictEqual(r.totals.views, 3);
  assert.strictEqual(r.totals.seconds, 2700);
  assert.strictEqual(r.totals.episodes, 2);
  assert.strictEqual(r.byDay.length, 2);
  assert.strictEqual(r.byMonth.length, 1);
  assert.strictEqual(r.byMonth[0].month, '2026-06');
  // byEpisode sorted by seconds desc -> ep01 (2400) first
  assert.strictEqual(r.byEpisode[0].seconds, 2400);
  assert.strictEqual(r.byEpisode[0].collectionId, 'colA');
  fs.unlinkSync(file);
});

test('query day returns only that day', async () => {
  const file = tmpFile();
  let s = await seed(file, '2026-06-09T10:00:00');
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 100, view: 1 });
  s = await seed(file, '2026-06-10T10:00:00');
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 200, view: 1 });
  const r = s.query('alice', { period: 'day', anchor: '2026-06-09' });
  assert.strictEqual(r.totals.seconds, 100);
  assert.strictEqual(r.byDay.length, 1);
  fs.unlinkSync(file);
});

test('query year buckets into byMonth; all spans everything', async () => {
  const file = tmpFile();
  let s = await seed(file, '2026-01-15T10:00:00');
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 100, view: 1 });
  s = await seed(file, '2026-07-15T10:00:00');
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 200, view: 1 });
  s = await seed(file, '2025-12-31T10:00:00');
  await s.record('alice', 'video', 'colA', 'ep01.mp4', { sec: 50, view: 1 });

  const y = s.query('alice', { period: 'year', anchor: '2026-03-01' });
  assert.strictEqual(y.totals.seconds, 300); // 2025 excluded
  assert.strictEqual(y.byMonth.length, 2);   // 2026-01 + 2026-07

  const all = s.query('alice', { period: 'all' });
  assert.strictEqual(all.totals.seconds, 350);
  assert.strictEqual(all.byMonth.length, 3);
  fs.unlinkSync(file);
});

test('query empty user returns zeroed result', async () => {
  const file = tmpFile();
  const s = await seed(file, '2026-06-09T10:00:00');
  const r = s.query('nobody', { period: 'month', anchor: '2026-06-09' });
  assert.strictEqual(r.totals.views, 0);
  assert.strictEqual(r.totals.episodes, 0);
  assert.deepStrictEqual(r.byEpisode, []);
  fs.unlinkSync(file);
});
