import { test } from 'node:test';
import assert from 'node:assert/strict';
import { streakSummary, istDayKey } from '../src/lib/streaks.js';

const key = (offsetDays, from = '2026-11-10') => {
  const ms = Date.parse(`${from}T00:00:00Z`) + offsetDays * 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
};

test('a live today never breaks the streak', () => {
  const done = { [key(-2)]: ['a'], [key(-1)]: ['b'] };
  const s = streakSummary(done, key(0));
  assert.equal(s.streak, 2);
  assert.equal(s.missedDays, 0);
});

test('one missed day is covered by the weekly freeze', () => {
  const done = { [key(-3)]: ['a'], [key(-2)]: ['b'], [key(-1)]: ['c'] };
  const s = streakSummary(done, key(0)); // today missed, yesterday covered the freeze? no:
  // today(y=-0?) walk: today not done → gap=[y(-1) is done] wait: yesterday done → gap empty
  assert.equal(s.streak, 3);
  assert.equal(s.freezesLeft, 1);
  assert.equal(s.missedDays, 0);
});

test('a yesterday miss is frozen without breaking the run', () => {
  const done = { [key(-2)]: ['a'], [key(0)]: ['b'] };
  const s = streakSummary(done, key(0));
  assert.equal(s.streak, 2); // today + the frozen gap keeps the Monday run
  assert.equal(s.freezesLeft, 0);
  assert.equal(s.missedDays, 0);
});

test('two consecutive missed days break the streak and count as missed', () => {
  const done = { [key(-4)]: ['a'], [key(-3)]: ['b'] };
  const s = streakSummary(done, key(0));
  assert.equal(s.streak, 0);
  assert.equal(s.missedDays, 2); // key(-2), key(-1)
});

test('a brand-new account is fresh, never "missed"', () => {
  const s = streakSummary({}, key(0));
  assert.equal(s.streak, 0);
  assert.equal(s.fresh, true);
  assert.equal(s.missedDays, 0);
});

test('istDayKey rolls at 4 am IST (22:30 UTC on the prior day)', () => {
  assert.equal(istDayKey(Date.parse('2026-11-10T22:29:00Z')), '2026-11-10');
  assert.equal(istDayKey(Date.parse('2026-11-10T22:31:00Z')), '2026-11-11');
});
