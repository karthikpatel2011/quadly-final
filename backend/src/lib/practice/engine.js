// Scenario simulation engine — a scenario is deterministic, scripted data; the
// student's choices carve a path through it. The engine never invents
// evidence: every reveal comes from the scenario file, every number the
// client sees was computed here on the server. Nothing about the outcome
// (true root cause, fix safety, lesson) reaches the client before resolve.

import { randomUUID } from 'node:crypto';
import { LEVEL_LABELS, tierForLevel } from './schema.js';

/** The parts of a scenario the room may see while the incident is live. */
export function scenarioForRoom(scenario) {
  return {
    id: scenario.id,
    title: scenario.title,
    track: scenario.track,
    shared: scenario.shared === true,
    level: scenario.level,
    levelLabel: LEVEL_LABELS[scenario.level] || 'Practicing',
    tier: tierForLevel(scenario.level),
    minutes: scenario.minutes,
    timeLimitMinutes: scenario.timeLimitMinutes ?? null,
    story: scenario.story,
    services: scenario.services,
    timeline: scenario.timeline,
    actions: scenario.actions.map((a) => ({
      id: a.id,
      label: a.label,
      group: a.group,
      costMinutes: a.costMinutes,
      once: a.once !== false,
    })),
    rootCauses: scenario.rootCauses.map((rc) => ({ id: rc.id, label: rc.label })),
    fixes: scenario.fixes.map((f) => ({ id: f.id, label: f.label })),
    guidance: scenario.guidance || [],
    source: { company: scenario.source.company, url: scenario.source.url, title: scenario.source.title },
    inspiredByNote: scenario.inspiredByNote,
    expectedEscalate: scenario.expectedEscalate === true,
  };
}

/** Everything, handed over once the attempt is resolved. */
export function scenarioReveal(scenario) {
  return {
    trueRootCause: scenario.rootCauses.find((rc) => rc.correct) || null,
    fixes: scenario.fixes,
    lesson: scenario.lesson,
    realAction: scenario.realAction,
    hintLadder: scenario.hintLadder,
    defendQuestions: scenario.defendQuestions.map((q) => ({ id: q.id, question: q.question })),
    source: scenario.source,
    inspiredByNote: scenario.inspiredByNote,
  };
}

/** One attempt = one student playing one scenario. All state lives server-side. */
export function newAttempt(email, scenarioId) {
  return {
    id: `att_${randomUUID()}`,
    studentId: email,
    scenarioId,
    startedAt: new Date().toISOString(),
    simMinutes: 0,
    actions: [],            // [{ actionId, at, simMinutes }]
    eventsSeen: [],         // cascade events surfaced by the sim clock
    hintsUsed: 0,
    hypothesis: null,
    notes: null,
    status: 'active',
    resolution: null,       // set by resolveAttempt
  };
}

function findAction(scenario, actionId) {
  return scenario.actions.find((a) => a.id === actionId) || null;
}

/** Guided-mode step prompt for the current point of the investigation. */
export function currentGuidance(scenario, attempt) {
  const list = scenario.guidance || [];
  const done = attempt.actions.length;
  let best = null;
  for (const g of list) if (g.afterActions <= done) best = g;
  return best ? best.text : null;
}

/**
 * Run one action. Returns { reveal?, events[] } plus a mutated attempt.
 * Rules: an action must exist, a once-only action cannot repeat, and the
 * sim clock cannot run past the scenario's expert time limit.
 */
export function applyAction(scenario, attempt, actionId) {
  const action = findAction(scenario, actionId);
  if (!action) return { error: 'That action is not part of this incident.' };
  const already = attempt.actions.some((a) => a.actionId === actionId);
  if (action.once !== false && already) {
    return { error: 'You have already done that — the evidence will not change.' };
  }
  if (scenario.timeLimitMinutes && attempt.simMinutes + action.costMinutes > scenario.timeLimitMinutes) {
    return { error: 'The incident window has closed — no time left for that. State your resolution now.' };
  }

  attempt.simMinutes += action.costMinutes;
  attempt.actions.push({ actionId, at: new Date().toISOString(), simMinutes: attempt.simMinutes });

  // Cascade events whose scripted moment the sim clock just passed.
  const newlySeen = [];
  for (const ev of scenario.events || []) {
    if (ev.atMin <= attempt.simMinutes && !attempt.eventsSeen.some((e) => e.text === ev.text)) {
      attempt.eventsSeen.push({ atSimMin: ev.atMin, text: ev.text });
      newlySeen.push({ atSimMin: ev.atMin, text: ev.text });
    }
  }

  return {
    ok: true,
    reveal: action.reveal
      ? { actionId: action.id, group: action.group, ...action.reveal, atSimMinutes: attempt.simMinutes }
      : null,
    events: newlySeen,
  };
}

/** Next hint from the scripted ladder. The ladder never names the root cause. */
export function nextHint(scenario, attempt) {
  const idx = Math.min(attempt.hintsUsed, scenario.hintLadder.length - 1);
  attempt.hintsUsed += 1;
  const exhausted = attempt.hintsUsed > scenario.hintLadder.length;
  return {
    text: scenario.hintLadder[idx],
    hintsUsed: attempt.hintsUsed,
    exhausted,
  };
}

/** The student-visible investigation log: alert, actions, cascade events. */
export function buildTimeline(scenario, attempt) {
  const byId = new Map(scenario.actions.map((a) => [a.id, a]));
  const rows = [];
  for (const t of scenario.timeline) rows.push({ atSimMin: t.atMin, kind: 'alert', text: t.text });
  for (const ev of attempt.eventsSeen) rows.push({ atSimMin: ev.atSimMin, kind: 'event', text: ev.text });
  for (const a of attempt.actions) {
    const def = byId.get(a.actionId);
    rows.push({
      atSimMin: a.simMinutes,
      kind: 'action',
      actionId: a.actionId,
      label: def?.label || a.actionId,
      group: def?.group || 'evidence',
      reveal: def?.reveal
        ? { kind: def.reveal.kind, title: def.reveal.title, lines: def.reveal.lines }
        : null,
    });
  }
  rows.sort((a, b) => (a.atSimMin - b.atSimMin) || String(a.actionId || '').localeCompare(b.actionId || ''));
  return rows;
}

/** Client-shaped view of an in-progress or resolved attempt. */
export function attemptView(scenario, attempt) {
  return {
    attemptId: attempt.id,
    scenarioId: attempt.scenarioId,
    status: attempt.status,
    startedAt: attempt.startedAt,
    simMinutes: attempt.simMinutes,
    timeLimitMinutes: scenario.timeLimitMinutes ?? null,
    minutesUsed: attempt.simMinutes,
    hintsUsed: attempt.hintsUsed,
    hintCost: attempt.hintsUsed * HINT_SCORE_COST,
    actionCount: attempt.actions.length,
    hypothesis: attempt.hypothesis,
    notes: attempt.notes,
    actionsTaken: attempt.actions.map((a) => a.actionId),
    timeline: buildTimeline(scenario, attempt),
    guidance: currentGuidance(scenario, attempt),
    resolution: attempt.resolution,
  };
}

export const HINT_SCORE_COST = 5;
