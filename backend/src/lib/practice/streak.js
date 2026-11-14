// Practice streak — one day counts only if a drill was actually completed
// that day. The day boundary is the shared 4 am IST rule (lib/streaks.js).
// Forgiveness is explicit and persists: a bridge ledger records which missed
// days were forgiven and why. One freeze a week bridges a single missed day.
// A rescue can restore a run broken by 2-5 missed days, at most once per 30
// days; rescue bridges the whole gap. Bridged days never count as completed.

import { istDayKey } from '../streaks.js';

const DAY_MS = 86_400_000;

export function shiftDay(key, days) {
  const ms = Date.parse(`${key}T00:00:00Z`) + days * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

export function dayDiff(fromKey, toKey) {
  return Math.round((Date.parse(`${toKey}T00:00:00Z`) - Date.parse(`${fromKey}T00:00:00Z`)) / DAY_MS);
}

/** ISO week key ('YYYY-Www') — the freeze budget is one per week. */
export function isoWeek(dayKey) {
  const d = new Date(`${dayKey}T00:00:00Z`);
  const day = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((d - yearStart) / DAY_MS + 1) / 7);
  return `${d.getUTCFullYear()}-W${String(week).padStart(2, '0')}`;
}

function emptyDoc() {
  return { done: {}, bridge: {}, freezeWeeks: {}, rescue: null, best: 0 };
}

/** Current run: completed days count; bridged days connect without counting. */
export function currentStreak(done, bridge, todayKey) {
  let streak = 0;
  let day = todayKey;
  for (let i = 0; i < 400; i += 1) {
    if (done[day]) {
      streak += 1;
    } else if (bridge[day]) {
      // forgiven day — recorded (and paid for) at completion time
    } else {
      break;
    }
    day = shiftDay(day, -1);
  }
  return streak;
}

/** Streak as it stood on the last completed day at or before dayKey. */
function priorRunAt(state, dayKey) {
  return currentStreak(state.done, state.bridge, dayKey);
}

/** Rescue rule: a 2-5 day gap, a prior run of >= 3, unused in the last 30 days. */
export function rescueAvailable(state, todayKey) {
  const days = Object.keys(state.done).filter(Boolean).sort();
  const lastDone = days[days.length - 1];
  if (!lastDone) return false;
  const missed = dayDiff(lastDone, todayKey) - 1;
  if (missed < 2 || missed > 5) return false;
  if (priorRunAt(state, lastDone) < 3) return false;
  const rescue = state.rescue;
  if (rescue?.day && dayDiff(rescue.day, todayKey) <= 30) return false;
  return true;
}

/**
 * Record a completed drill day — the only streak write in Practice.
 * Mutates the doc and returns what happened. Idempotent per day.
 */
export function recordDrillDay(doc, atMs = Date.now()) {
  const state = { ...emptyDoc(), ...(doc || {}) };
  state.done = { ...(state.done || {}) };
  state.bridge = { ...(state.bridge || {}) };
  state.freezeWeeks = { ...(state.freezeWeeks || {}) };
  const todayKey = istDayKey(atMs);

  if (state.done[todayKey]) {
    return { doc: state, todayKey, already: true, ...viewOf(state, todayKey) };
  }

  const days = Object.keys(state.done).filter(Boolean).sort();
  const lastDone = days[days.length - 1];
  let rescued = false;

  if (lastDone) {
    const spread = dayDiff(lastDone, todayKey); // 1 = contiguous completion
    if (spread === 2) {
      const missedDay = shiftDay(todayKey, -1);
      const week = isoWeek(missedDay);
      if (state.freezeWeeks[week] !== true) {
        state.bridge[missedDay] = 'freeze';
        state.freezeWeeks[week] = true;
      }
      // No freeze left this week — the run honestly ends, today starts a new one.
    } else if (spread >= 3 && spread <= 6 && rescueAvailable(state, todayKey)) {
      rescued = true;
      state.rescue = { day: todayKey, restored: priorRunAt(state, lastDone) };
      for (let i = 1; i < spread; i += 1) {
        state.bridge[shiftDay(todayKey, -i)] = 'rescue';
      }
    }
  }

  state.done[todayKey] = true;
  state.best = Math.max(state.best || 0, currentStreak(state.done, state.bridge, todayKey));
  state.updatedAt = new Date().toISOString();

  return { doc: state, todayKey, already: false, rescued, ...viewOf(state, todayKey) };
}

function viewOf(state, todayKey) {
  return {
    streak: currentStreak(state.done, state.bridge, todayKey),
    best: Math.max(state.best || 0, currentStreak(state.done, state.bridge, todayKey)),
    days: Object.keys(state.done).length,
    canRescue: rescueAvailable(state, todayKey),
  };
}

/** Read-only summary for the home screen. */
export function streakView(doc, atMs = Date.now()) {
  const state = { ...emptyDoc(), ...(doc || {}) };
  return viewOf(state, istDayKey(atMs));
}
