// Scoring — every point in Practice is computed here, in code. The AI never
// grades: its opinions can annotate a rubric dimension, but the numbers come
// from these functions and from the scenario data alone.

import { HINT_SCORE_COST } from './engine.js';

/**
 * Incident score: out of 100, a fixed budget the student can see afterwards.
 *   root cause      40   the one thing that matters most
 *   efficiency      20   at or under the scenario's par action count
 *   sim time        10   inside the honest time window
 *   fix safety      15   safe / does nothing / makes it worse
 *   checked first    5   one evidence or check action before any change
 *   escalation      10   escalated when the scenario needed it, or kept calm
 *   hints           -5 each
 */
export function scoreIncident(scenario, attempt) {
  const trueRoot = scenario.rootCauses.find((rc) => rc.correct);
  const rootCorrect = attempt.resolution.rootCauseId === trueRoot?.id;

  // Efficiency: 20 at par, falling 2 per extra action, floor 8.
  const actionCount = attempt.actions.length;
  const over = Math.max(0, actionCount - scenario.parActions);
  const efficiency = over === 0 ? 20 : Math.max(8, 20 - 2 * over);

  // Time: full credit inside par-minutes +25%, sliding to a floor of 4.
  const time = attempt.simMinutes <= scenario.minutes * 1.25
    ? 10
    : Math.max(4, 10 - Math.ceil((attempt.simMinutes - scenario.minutes) / scenario.minutes) * 2);

  const chosenFix = scenario.fixes.find((f) => f.id === attempt.resolution.fixId);
  const fixPoints = chosenFix?.safety === 'safe' ? 15 : chosenFix?.safety === 'noop' ? 5 : 0;

  // Checked before acting: the first action taken reads evidence or runs a
  // check — not a change or an escalation.
  const firstActionId = attempt.actions[0]?.actionId;
  const firstDef = scenario.actions.find((a) => a.id === firstActionId);
  const checkedFirst = firstDef ? firstDef.group === 'evidence' || firstDef.group === 'check' : false;

  // Escalation timing: did an evidence action precede the call for help?
  const groupOf = (actionId) => scenario.actions.find((a) => a.id === actionId)?.group;
  const escalateIdx = attempt.actions.findIndex((a) => groupOf(a.actionId) === 'escalate');
  const escalateAfterEvidence = escalateIdx !== -1
    && attempt.actions.slice(0, escalateIdx).some((a) => ['evidence', 'check'].includes(groupOf(a.actionId)));
  const escalated = escalateIdx !== -1;
  let escalation = 7; // not needed and stayed calm is fine
  if (scenario.expectedEscalate) {
    escalation = escalated ? (escalateAfterEvidence ? 10 : 4) : 0;
  } else if (escalated) {
    escalation = escalateAfterEvidence ? 7 : 0; // noise, not coordination
  }

  const hintPenalty = attempt.hintsUsed * HINT_SCORE_COST;

  const breakdown = {
    rootCause: rootCorrect ? 40 : 0,
    efficiency,
    time,
    fixSafety: fixPoints,
    checkedFirst: checkedFirst ? 5 : 0,
    escalation,
    hints: -hintPenalty,
  };
  const total = Math.max(0, Math.min(100,
    breakdown.rootCause + efficiency + time + fixPoints
    + breakdown.checkedFirst + escalation - hintPenalty));

  return { total, ...breakdown, rootCorrect, fixSafetyName: chosenFix?.safety ?? null };
}

/** Strong / neutral / weak band for level adjustment. */
export function outcomeBand(score) {
  if (score.total >= 75 && score.rootCorrect) return 'strong';
  if (score.total < 50 || !score.rootCorrect) return 'weak';
  return 'neutral';
}

// ---- student skill level ---------------------------------------------------
// 1-5. Up after two strong results, down after two weak ones. Neutral results
// reset nothing and count as the middle of the ladder. The labels are skills,
// never student labels.

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 5;

/** doc: { level, recent: ['strong'|'weak'|'neutral'] } — mutated copy returned. */
export function adjustLevel(doc, band) {
  const next = { level: doc?.level || 1, recent: [...(doc?.recent || [])], updatedAt: new Date().toISOString() };
  if (band === 'neutral') {
    next.recent = []; // neutrality just is — the ladder only remembers streaks
    return next;
  }
  next.recent.push(band);
  next.recent = next.recent.slice(-2);
  if (next.recent.length === 2 && next.recent[0] === next.recent[1]) {
    if (band === 'strong' && next.level < MAX_LEVEL) next.level += 1;
    if (band === 'weak' && next.level > MIN_LEVEL) next.level -= 1;
    next.recent = [];
  }
  return next;
}

// ---- postmortem rubric ------------------------------------------------------
// Fixed rubric: specific, blameless, actionable, correct root cause.
// Dimensions are booleans; the score is a weighted sum computed here.

export const RUBRIC_WEIGHTS = { specific: 25, blameless: 15, actionable: 20, rootCause: 40 };

const BLAME_RE = /\b(his fault|her fault|their fault|someone('s)? fault|careless|stupid|should have known|junior dev|messed up|screwed up|negligent|clown|idiot)\b/i;
const ACTION_RE = /\b(add|set up|setup|configure|monitor|alert|automate|review|limit|cap|back ?up|rotate|renew|extend|test|notify|escalate|instrument|checklist)\b/i;
const NUMBER_RE = /(\d+(?:\.\d+)?\s*(%|ms|s\b|min|hours?|days?|x\b)?|\b\d{2,}\b)/i;

/** Deterministic dimensions — the honest fallback when no AI critique runs. */
export function rubricBooleans(scenario, attempt, body) {
  const text = [body.happened, body.impact, body.rootCause, body.fix, body.prevention].join('\n').toLowerCase();
  const trueRoot = scenario.rootCauses.find((rc) => rc.correct);
  const choseCorrectRoot = attempt.resolution?.rootCauseId === trueRoot?.id;

  // specific: names a concrete service or the concrete artifact + numbers.
  const serviceNames = scenario.services.map((s) => s.name.toLowerCase().split(' ')[0]);
  const namesService = serviceNames.some((n) => n.length > 2 && text.includes(n));
  const hasNumbers = NUMBER_RE.test(text);
  const specific = (namesService || Boolean(body.impact.match(NUMBER_RE))) && hasNumbers;

  const blameless = !BLAME_RE.test(text);

  const actionable = ACTION_RE.test(body.prevention) && body.prevention.length >= 40;

  // correct root cause: the text mentions the true cause AND the resolution
  // matched it at resolve time. Code owns this dimension exclusively.
  const rootWords = (trueRoot?.keywords || []).map((k) => k.toLowerCase());
  const mentionsRoot = body.rootCause.toLowerCase().split(/[^a-z]+/).some((w) => w && rootWords.some((k) => w === k || (k.length > 3 && w.includes(k))));
  const rootCauseMet = mentionsRoot && choseCorrectRoot;

  return { specific, blameless, actionable, rootCause: rootCauseMet };
}

export function rubricScore(dims) {
  return Math.max(0, Math.min(100,
    (dims.specific ? RUBRIC_WEIGHTS.specific : 0)
    + (dims.blameless ? RUBRIC_WEIGHTS.blameless : 0)
    + (dims.actionable ? RUBRIC_WEIGHTS.actionable : 0)
    + (dims.rootCause ? RUBRIC_WEIGHTS.rootCause : 0)));
}

// ---- defend answers ---------------------------------------------------------
// Expected key points come from the scenario; an answer earns 0-2 per question
// by keyword coverage, with a length sanity factor so one keyword is not a pass.

export function scoreDefendAnswer(question, text) {
  const lower = String(text || '').toLowerCase();
  const words = lower.split(/[^a-z0-9-]+/);
  let hit = 0;
  for (const point of question.keyPoints) {
    const matched = point.some((alias) => {
      const a = alias.toLowerCase();
      return words.includes(a) || lower.includes(a);
    });
    if (matched) hit += 1;
  }
  const coverage = question.keyPoints.length ? hit / question.keyPoints.length : 0;
  const lengthFactor = Math.min(1, lower.length / 120); // a real answer has real length
  const points = Math.round(coverage * 2 * (0.5 + 0.5 * lengthFactor));
  return { covered: hit, total: question.keyPoints.length, points: Math.max(0, Math.min(2, points)) };
}

export function scoreDefend(questions, answers) {
  const per = questions.map((q) => {
    const ans = answers.find((a) => a.questionId === q.id);
    const r = ans ? scoreDefendAnswer(q, ans.text) : { covered: 0, total: q.keyPoints.length, points: 0 };
    return { questionId: q.id, ...r };
  });
  const maxPoints = per.length * 2;
  const earned = per.reduce((n, r) => n + r.points, 0);
  return {
    per,
    score: maxPoints ? Math.round((earned / maxPoints) * 100) : 0,
    answeredCount: answers.length,
  };
}
