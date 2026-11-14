// Daily Drill selection — a day's single moment from an incident, picked for
// the student's level and track, never repeating one the student has seen.
// The pick is deterministic per (student, day): refreshes serve the same
// drill all day, and yesterday's teaser can honestly name what arrives next.

import { drills as ALL_DRILLS, seasons as ALL_SEASONS } from './content.js';

// FNV-1a, same trick as the mission picker — stable per (student, day).
function hash(strVal) {
  let h = 2166136261;
  for (let i = 0; i < strVal.length; i += 1) {
    h ^= strVal.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const byId = (list) => [...list].sort((a, b) => a.id.localeCompare(b.id));

/** Candidate pools, best-fit first; the first non-empty one wins. */
function candidatePools(level, track, seen) {
  const unseen = (d) => !seen[d.id];
  const trackOk = (d) => d.track === null || d.track === track;
  const levelOk = (d) => Math.abs((d.level || 1) - level) <= 2;
  return [
    ALL_DRILLS.filter((d) => unseen(d) && trackOk(d) && levelOk(d)),
    ALL_DRILLS.filter((d) => unseen(d) && trackOk(d)),
    ALL_DRILLS.filter((d) => unseen(d)),
  ];
}

const trackOk = (d, track) => d.track === null || d.track === track;

/**
 * Today's drill for this student. Deterministic per day. When every drill has
 * been seen (the bank is small by design), the least-recently-seen drill for
 * the student's track comes back — honest repetition of ten real moments
 * beats a fake question library.
 */
export function pickTodayDrill({ dayKey, level, track, seen }) {
  const pool = candidatePools(level, track, seen).find((list) => list.length > 0) || [];
  if (pool.length > 0) {
    const idx = hash(`${dayKey}::${track}::${level}`) % pool.length;
    const chosen = byId(pool)[idx];
    return { drill: chosen, season: seasonFor(chosen), repeats: false };
  }
  const oldest = Object.entries(seen || {})
    .map(([id, at]) => ({ id, at: String(at || '') }))
    .sort((a, b) => a.at.localeCompare(b.at));
  const oldestIds = new Set(oldest.slice(0, 4).map((o) => o.id));
  const inTrack = ALL_DRILLS.filter((d) => trackOk(d, track));
  const chosen = inTrack.find((d) => oldestIds.has(d.id)) || inTrack[0] || ALL_DRILLS[0];
  return { drill: chosen, season: seasonFor(chosen), repeats: true };
}

export function seasonFor(drill) {
  return ALL_SEASONS.find((s) => s.id === drill.seasonId) || ALL_SEASONS[0] || null;
}

export function drillById(id) {
  return ALL_DRILLS.find((d) => d.id === String(id || '')) || null;
}

/** What the client gets before answering: no answerIndex, no why. */
export function drillForClient(drill, extra = {}) {
  return {
    id: drill.id,
    scenarioId: drill.scenarioId,
    seasonId: drill.seasonId,
    level: drill.level,
    track: drill.track,
    moment: {
      kind: drill.moment.kind,
      title: drill.moment.title,
      lines: drill.moment.lines || null,
      data: drill.moment.data || null,
      question: drill.moment.question,
      options: drill.moment.options,
    },
    ...extra,
  };
}
