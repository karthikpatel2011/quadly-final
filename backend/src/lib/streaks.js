// Streak summary — pure function, the one rule engine for streaks.
// A day counts when at least one verified task result is recorded (writes to
// the done-map come only from verified activity results — there is no
// checkbox). The day rolls over at 4 am India time; callers pass keys built
// by istDayKey(). A live today never breaks the streak. One automatic freeze
// covers a single missed day inside the run; a second consecutive miss
// breaks it, and the real misses drive the rescue line.

const DAY_MS = 86_400_000;

/** The IST quiz-day that owns this moment (day flips at 4 am IST). */
export function istDayKey(ms = Date.now()) {
  return new Date(ms + 90 * 60_000).toISOString().slice(0, 10);
}

function shiftKey(key, days) {
  const ms = Date.parse(`${key}T00:00:00Z`) + days * DAY_MS;
  return new Date(ms).toISOString().slice(0, 10);
}

/**
 * done: { 'YYYY-MM-DD': [taskIds] } — verified days have ≥1 entry.
 * Returns { streak, freezesLeft, missedDays, fresh }.
 */
export function streakSummary(done, todayKey = istDayKey()) {
  const counts = (k) => Array.isArray(done?.[k]) && done[k].length > 0;

  // Anchor on a counted day when possible; a live, still-empty today never
  // breaks anything, so the walk starts at yesterday.
  let anchor = todayKey;
  if (!counts(anchor)) anchor = shiftKey(anchor, -1);

  if (!counts(anchor)) {
    // Nothing verified today or yesterday: a fresh student, or a lapse.
    const hasAny = Object.values(done || {}).some((v) => Array.isArray(v) && v.length > 0);
    if (!hasAny) return { streak: 0, freezesLeft: 1, missedDays: 0, fresh: true };
    let missed = 0;
    let probe = anchor;
    while (!counts(probe) && missed < 60) {
      missed += 1;
      probe = shiftKey(probe, -1);
    }
    if (!counts(probe)) return { streak: 0, freezesLeft: 1, missedDays: 0, fresh: false };
    return { streak: 0, freezesLeft: 1, missedDays: missed, fresh: false };
  }

  // Walk the history from the anchor: counted days add up; a single missed
  // day inside the run is covered by the one weekly freeze; a second
  // consecutive miss (or an exhausted freeze) ends the walk.
  let streak = 0;
  let freezesLeft = 1;
  let day = anchor;
  for (let i = 0; i < 3650; i++) {
    if (counts(day)) {
      streak += 1;
    } else {
      const nextOlder = shiftKey(day, -1);
      if (freezesLeft === 1 && counts(nextOlder)) {
        freezesLeft = 0; // the freeze bridges exactly this one day
      } else {
        break; // the run ends here — a real gap starts
      }
    }
    day = shiftKey(day, -1);
  }

  // Real misses only exist when the live today is uncounted and the run has
  // already ended before yesterday (the freeze could not bridge the gap).
  let missedDays = 0;
  if (!counts(todayKey)) {
    let probe = shiftKey(todayKey, -1);
    while (!counts(probe) && missedDays < 60) {
      missedDays += 1;
      probe = shiftKey(probe, -1);
    }
  }

  return { streak, freezesLeft, missedDays, fresh: false };
}
