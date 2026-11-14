// Practice — three features on one engine: the Incident Room, the Daily
// Drill, and Postmortem & Defend. Endpoints under /api/practice.
//
// Rules the whole file keeps:
//   · Simulation state, evidence, time and scores live on the server; the
//     client only renders what these handlers return.
//   · Every score is computed in code (lib/practice/scoring.js) — the AI may
//     annotate a rubric dimension, never invent points.
//   · Every request body validates with zod; failures answer { error }.
//   · A student can only touch their own attempts — the key comes from the
//     session, never from the request.
//   · Writes are rate-limited per student; AI roles have hard daily quotas
//     and deterministic fallbacks.

import { Router } from 'express';
import { z } from 'zod';
import { resolveSession } from './auth.js';
import { markTodayMission } from './dashboard.js';
import { requireAdmin } from './admin.js';
import { llmAvailable } from '../lib/llm.js';
import { istDayKey } from '../lib/streaks.js';
import { practiceEntitlements } from '../lib/entitlement.js';
import {
  LEVEL_LABELS, tierForLevel, firstIssue,
  actionCallSchema, hypothesisSchema, resolveSchema, drillAnswerSchema,
  postmortemBodySchema, defendAnswerSchema, shareSchema,
  aiHintSchema, aiCritiqueSchema, aiDraftSchema,
} from '../lib/practice/schema.js';
import {
  allScenarios, findScenario, allDrafts, queueUpsert, queueRemove, newShareToken,
  attemptsDoc, drillsDoc, postmortemsDoc, defendDoc, levelsDoc, mutateStreaks, streaksDoc,
  myAttempts, findAttempt, saveAttempt,
  myDrillState, saveDrillState, persistPostmortems, persistDefend,
} from '../lib/practice/store.js';
import { ensureContent } from '../lib/practice/content.js';
import {
  scenarioForRoom, scenarioReveal, newAttempt, applyAction, nextHint,
  attemptView, HINT_SCORE_COST,
} from '../lib/practice/engine.js';
import {
  scoreIncident, outcomeBand, adjustLevel, rubricBooleans, rubricScore,
  RUBRIC_WEIGHTS, scoreDefend,
} from '../lib/practice/scoring.js';
import { streakView, recordDrillDay, isoWeek } from '../lib/practice/streak.js';
import { pickTodayDrill, drillById, drillForClient, seasonFor } from '../lib/practice/drills.js';
import { aiPractice, leaksRootCause } from '../lib/practice/ai.js';
import { contentCheck } from '../lib/practice/review.js';

const router = Router();

function bearer(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function requireUser(req, res) {
  const session = resolveSession(bearer(req));
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  return session;
}

// ---- per-student write rate limit (in-memory; restarts reset it, the
// stores do not) ----------------------------------------------------------------

const WRITE_BUDGET = 30; // writes per minute per student
const writes = new Map(); // email -> { minute, n }

function allowWrite(email) {
  const minute = Math.floor(Date.now() / 60_000);
  let slot = writes.get(email);
  if (!slot || slot.minute !== minute) slot = { minute, n: 0 };
  slot.n += 1;
  writes.set(email, slot);
  return slot.n <= WRITE_BUDGET;
}

function ensureBudget(email, res) {
  if (!allowWrite(email)) {
    res.status(429).json({ error: 'Too many requests in a row — wait a moment and try again.' });
    return false;
  }
  return true;
}

// ---- shared context -----------------------------------------------------------

function studentTrack(session) {
  const track = session.account.profile?.track;
  const KNOWN = ['Software Engineering', 'AI & ML', 'Cyber Security'];
  return KNOWN.includes(track) ? track : 'Software Engineering';
}

async function levelDocFor(email, track) {
  const doc = await levelsDoc();
  return doc[email]?.[track] || { level: 1, recent: [], updatedAt: null };
}

async function saveLevelDoc(email, track, levelDoc) {
  const doc = await levelsDoc();
  doc[email] = doc[email] || {};
  doc[email][track] = levelDoc;
}

const levelMeta = (level) => ({
  level,
  label: `Level ${level}: ${LEVEL_LABELS[level] || 'Practicing'}`,
  tier: tierForLevel(level),
});

// Scenarios offered to this student: their track first, shared always, others
// only when the bank has nothing closer.
function scenariosOffered(list, track) {
  const forTrack = list.filter((s) => s.track === track || s.shared === true);
  return forTrack.length > 0 ? forTrack : list;
}

/** Catalog rows for the home page. */
function catalogRow(s, done) {
  return {
    id: s.id,
    title: s.title,
    track: s.track,
    shared: s.shared === true,
    ...levelMeta(s.level),
    minutes: s.minutes,
    company: s.source.company,
    inspiredByNote: s.inspiredByNote,
    completed: done.has(s.id),
  };
}

// ---------- GET /home — the whole Practice home screen in one read ----------

router.get('/home', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const email = session.email;
  const track = studentTrack(session);
  const dayKey = istDayKey();

  const [levelDoc, streakDoc, drillState, attempts, scenarios, postmortemDoc] = await Promise.all([
    levelDocFor(email, track), streaksDoc().then((d) => d[email]), myDrillState(email),
    myAttempts(email), allScenarios(), postmortemsDoc(),
  ]);
  const level = levelDoc.level;
  const entitlements = practiceEntitlements(session.account);

  // Today's drill (deterministic; answering happens on POST).
  const answeredToday = drillState.days?.[dayKey] || null;
  const { drill, season, repeats } = pickTodayDrill({
    dayKey, level, track, seen: drillState.seen || {},
  });

  // Incident starts this ISO week — the free-plan budget.
  const weekKey = isoWeek(dayKey);
  const startsThisWeek = Object.values(attempts).filter((a) => isoWeek(a.startedAt.slice(0, 10)) === weekKey).length;
  const incidentsLeft = entitlements.freeIncidentStartsPerWeek === Infinity
    ? null
    : Math.max(0, entitlements.freeIncidentStartsPerWeek - startsThisWeek);

  // Next incident: closest level to the student's, not already completed.
  const completed = new Set(
    Object.values(attempts).filter((a) => a.status === 'resolved').map((a) => a.scenarioId),
  );
  const offered = scenariosOffered(scenarios, track);
  const pickable = (order) => [...offered].sort((a, b) => order(a) - order(b));
  const byDistance = pickable((s) => Math.abs(s.level - level) * 100 + (s.shared ? 0 : 1));
  const unseen = byDistance.filter((s) => !completed.has(s.id));
  const nextIncident = (unseen[0] || byDistance[0] || null);

  // Recent work: last attempts, newest first, with postmortem/defend markers.
  const myPostmortems = postmortemDoc[email] || {};
  const recent = Object.values(attempts)
    .sort((a, b) => String(b.startedAt).localeCompare(String(a.startedAt)))
    .slice(0, 5)
    .map((a) => ({
      attemptId: a.id,
      scenarioId: a.scenarioId,
      title: scenarios.find((s) => s.id === a.scenarioId)?.title || a.scenarioId,
      status: a.status,
      startedAt: a.startedAt,
      score: a.resolution?.score?.total ?? null,
      hasPostmortem: Boolean(myPostmortems[a.scenarioId]?.versions?.length),
    }));

  res.json({
    ok: true,
    track,
    date: dayKey,
    level: levelMeta(level),
    streak: streakView(streakDoc),
    entitlements: {
      plan: entitlements.plan,
      incidentsLeft,
      allIncidents: entitlements.allIncidents,
      defendStep: entitlements.defendStep,
    },
    drill: {
      ...drillForClient(drill, { seasonName: season?.name || null, repeats }),
      answered: Boolean(answeredToday),
      result: answeredToday
        ? {
          drillId: answeredToday.drillId,
          correct: answeredToday.correct === true,
          takeaway: drillById(answeredToday.drillId)?.takeaway || null,
        }
        : null,
    },
    nextIncident: nextIncident ? catalogRow(nextIncident, completed) : null,
    catalog: byDistance.map((s) => catalogRow(s, completed)).slice(0, 8),
    recent,
    aiOnline: llmAvailable(),
  });
});

// ---------- Incident Room -----------------------------------------------------

router.post('/incidents/:id/start', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (!ensureBudget(session.email, res)) return;
  const scenario = await findScenario(req.params.id);
  if (!scenario) return res.status(404).json({ error: 'That incident is not in the library.' });

  const mine = await myAttempts(session.email);
  const existing = Object.values(mine).find(
    (a) => a.scenarioId === scenario.id && a.status === 'active',
  );
  if (existing) {
    return res.json({ ok: true, attempt: attemptView(scenario, existing), scenario: scenarioForRoom(scenario), resumed: true });
  }

  // Free-plan budget: at most N incident starts per ISO week.
  const entitlements = practiceEntitlements(session.account);
  const weekKey = isoWeek(istDayKey());
  const startsThisWeek = Object.values(mine).filter(
    (a) => isoWeek(a.startedAt.slice(0, 10)) === weekKey,
  ).length;
  if (startsThisWeek >= entitlements.freeIncidentStartsPerWeek) {
    return res.status(403).json({
      error: entitlements.plan === 'free'
        ? 'The free plan includes a few incidents a week. Come back tomorrow, or upgrade for all of them.'
        : 'You have reached this week’s incident limit.',
    });
  }

  const attempt = newAttempt(session.email, scenario.id);
  await saveAttempt(session.email, attempt);
  res.status(201).json({ ok: true, attempt: attemptView(scenario, attempt), scenario: scenarioForRoom(scenario), resumed: false });
});

// Resume view after a refresh (never re-post what the room already did).
router.get('/incidents/:attemptId', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const attempt = await findAttempt(session.email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });
  res.json({ ok: true, attempt: attemptView(scenario, attempt), scenario: scenarioForRoom(scenario) });
});

router.post('/incidents/:attemptId/action', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (!ensureBudget(session.email, res)) return;
  const parsed = actionCallSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed, 'Pick an action first.') });

  const attempt = await findAttempt(session.email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  if (attempt.status !== 'active') return res.status(409).json({ error: 'This incident is already resolved.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });

  const out = applyAction(scenario, attempt, parsed.data.actionId);
  if (out.error) return res.status(400).json({ error: out.error });
  await saveAttempt(session.email, attempt);
  res.json({ ok: true, reveal: out.reveal, events: out.events, attempt: attemptView(scenario, attempt) });
});

router.post('/incidents/:attemptId/hypothesis', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (!ensureBudget(session.email, res)) return;
  const parsed = hypothesisSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed) });

  const attempt = await findAttempt(session.email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  if (attempt.status !== 'active') return res.status(409).json({ error: 'This incident is already resolved.' });
  attempt.hypothesis = parsed.data.text;
  attempt.notes = String(req.body?.notes || '').slice(0, 2000) || attempt.notes || null;
  await saveAttempt(session.email, attempt);
  const scenario = await findScenario(attempt.scenarioId);
  res.json({ ok: true, attempt: attemptView(scenario, attempt) });
});

// A hint costs a little score, comes from the scripted ladder, and can never
// name the true root cause — an AI rephrase with that leak is vetoed to the
// scripted version by code.
router.post('/incidents/:attemptId/hint', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (!ensureBudget(session.email, res)) return;
  const attempt = await findAttempt(session.email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  if (attempt.status !== 'active') return res.status(409).json({ error: 'This incident is already resolved.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });
  if (scenario.level >= 5) {
    return res.status(403).json({ error: 'Expert incidents give no hints — that is the point of them.' });
  }
  if (attempt.hintsUsed >= scenario.hintLadder.length) {
    return res.status(409).json({ error: 'You have used every hint this incident has.' });
  }

  const trueRoot = scenario.rootCauses.find((rc) => rc.correct);
  const scripted = nextHint(scenario, attempt);

  const prompt = [
    'You are an on-call coach inside an incident-practice game.',
    'Rephrase the hint below so it reads naturally for ONE student live in this situation.',
    'Do not add facts, do not name the cause, do not mention scoring. Keep it under 60 words.',
    `Evidence gathered so far (titles only): ${attempt.actions.map((a) => a.actionId).join(', ') || 'none'}.`,
    `Hint to rephrase: ${JSON.stringify(scripted.text)}`,
    'Return JSON: {"text": "your rephrased hint"}',
  ].join('\n');

  const out = await aiPractice({
    role: 'hint',
    email: session.email,
    prompt,
    schema: aiHintSchema,
    fallback: () => ({ text: scripted.text }),
    maxTokens: 200,
    guard: (data) => !leaksRootCause(data.text, trueRoot) && data.text.length <= 400,
  });

  await saveAttempt(session.email, attempt);
  res.json({
    ok: true,
    hint: out.data.text,
    source: out.ok ? 'ai' : 'scripted',
    hintsUsed: attempt.hintsUsed,
    hintCost: HINT_SCORE_COST,
  });
});

router.post('/incidents/:attemptId/resolve', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (!ensureBudget(session.email, res)) return;
  const parsed = resolveSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed, 'Pick a root cause and a fix.') });

  const attempt = await findAttempt(session.email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });

  // Idempotent completion: a second resolve returns the same truth.
  if (attempt.status === 'resolved') {
    return res.json({ ok: true, already: true, attempt: attemptView(scenario, attempt), reveal: scenarioReveal(scenario) });
  }

  const { rootCauseId, fixId } = parsed.data;
  if (!scenario.rootCauses.some((rc) => rc.id === rootCauseId)) {
    return res.status(400).json({ error: 'That root cause is not one of the options.' });
  }
  if (!scenario.fixes.some((f) => f.id === fixId)) {
    return res.status(400).json({ error: 'That fix is not one of the options.' });
  }
  const chosenFix = scenario.fixes.find((f) => f.id === fixId);

  attempt.resolution = { rootCauseId, fixId };
  attempt.status = 'resolved';
  attempt.finishedAt = new Date().toISOString();
  const score = scoreIncident(scenario, attempt);
  attempt.resolution.fixSafety = chosenFix.safety;
  attempt.resolution.rootCorrect = score.rootCorrect;
  attempt.resolution.score = score;
  await saveAttempt(session.email, attempt);

  // The level moves quietly, on the skill the scenario exercises.
  const band = outcomeBand(score);
  const track = scenario.track;
  const levelDoc = await levelDocFor(session.email, track);
  const nextLevelDoc = adjustLevel(levelDoc, band);
  await saveLevelDoc(session.email, track, nextLevelDoc);

  // The shared, verified task-completion path (the plan's Learn task).
  markTodayMission(session, 'learn', `Incident room: ${scenario.title} — ${score.total}/100.`);

  res.json({
    ok: true,
    already: false,
    attempt: attemptView(scenario, attempt),
    reveal: scenarioReveal(scenario),
    score,
    levelChanged: nextLevelDoc.level !== levelDoc.level ? levelMeta(nextLevelDoc.level) : null,
    band,
  });
});

// ---------- Daily Drill -------------------------------------------------------

router.get('/drill/today', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  await ensureContent(); // fresh processes must load the drill bank first
  const email = session.email;
  const track = studentTrack(session);
  const dayKey = istDayKey();
  const [levelDoc, streakDoc, drillState] = await Promise.all([
    levelDocFor(email, track), streaksDoc().then((d) => d[email]), myDrillState(email),
  ]);
  const { drill, season, repeats } = pickTodayDrill({
    dayKey, level: levelDoc.level, track, seen: drillState.seen || {},
  });
  const answered = drillState.days?.[dayKey] || null;
  res.json({
    ok: true,
    date: dayKey,
    season: { id: season?.id, name: season?.name, blurb: season?.blurb },
    drill: drillForClient(drill, { seasonName: season?.name || null, repeats }),
    answered: Boolean(answered),
    result: answered
      ? { correct: answered.correct === true, why: drillById(answered.drillId)?.moment.why || null, takeaway: drillById(answered.drillId)?.takeaway || null }
      : null,
    streak: streakView(streakDoc),
    level: levelMeta(levelDoc.level),
  });
});

router.post('/drill/:id/answer', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  await ensureContent(); // fresh processes must load the drill bank first
  const email = session.email;
  if (!ensureBudget(email, res)) return;
  const parsed = drillAnswerSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed, 'Pick an answer.') });

  const drill = drillById(req.params.id);
  if (!drill) return res.status(404).json({ error: 'That drill is not in the bank.' });
  const track = studentTrack(session);
  const dayKey = istDayKey();

  const state = await myDrillState(email);
  const today = state.days?.[dayKey];
  if (today) {
    // Idempotent: the day is done, the same honest answer comes back.
    const answered = drillById(today.drillId);
    const { drill: nextDrill } = pickTodayDrill({ dayKey: nextDayKey(), level: (await levelDocFor(email, track)).level, track, seen: { ...(state.seen || {}), [today.drillId]: dayKey } });
    return res.json({
      ok: true, already: true,
      result: {
        drillId: today.drillId,
        choice: today.choice,
        correct: today.correct === true,
        why: answered?.moment.why || null,
        takeaway: answered?.takeaway || null,
      },
      teaser: nextDrill ? nextTeaser(nextDrill) : null,
      streak: streakView((await streaksDoc())[email]),
    });
  }

  // Answering a drill that is not today's is not allowed.
  const { drill: todayDrill } = pickTodayDrill({ dayKey, level: (await levelDocFor(email, track)).level, track, seen: state.seen || {} });
  if (todayDrill.id !== drill.id) {
    return res.status(409).json({ error: 'That is not today’s drill — open today’s drill from the Practice home.' });
  }

  const correct = parsed.data.optionIndex === drill.moment.answerIndex;

  // One seen-mark, one day entry, one streak day (all idempotent together).
  state.seen = { ...(state.seen || {}), [drill.id]: dayKey };
  state.days = { ...(state.days || {}), [dayKey]: { drillId: drill.id, choice: parsed.data.optionIndex, correct, at: new Date().toISOString() } };
  await saveDrillState(email, state);

  const streakOut = await mutateStreaks((doc) => {
    const mine = doc[email] || {};
    const out = recordDrillDay(mine);
    doc[email] = out.doc;
    return out;
  });

  const mark = markTodayMission(session, 'learn', `Daily drill: ${drill.moment.title}${correct ? ' — answered correctly.' : '.'}`);
  const markNote = mark?.id || null;

  // Tomorrow's teaser, computed from tomorrow's actual pick.
  const { drill: nextDrill } = pickTodayDrill({
    dayKey: nextDayKey(), level: (await levelDocFor(email, track)).level, track, seen: state.seen,
  });

  res.json({
    ok: true,
    already: false,
    result: {
      drillId: drill.id,
      choice: parsed.data.optionIndex,
      correct,
      why: drill.moment.why,
      takeaway: drill.takeaway,
    },
    teaser: nextDrill ? nextTeaser(nextDrill) : null,
    streak: streakOut,
    markedTask: Boolean(markNote),
  });
});

function nextDayKey() {
  const ms = Date.parse(`${istDayKey()}T00:00:00Z`) + 86_400_000;
  return new Date(ms).toISOString().slice(0, 10);
}

function nextTeaser(drill) {
  return { text: drill.teaser, title: drill.moment.title };
}

// ---------- Postmortem & Defend ------------------------------------------------

const postmortemFor = async (email, attemptId) => {
  const doc = await postmortemsDoc();
  return doc[email]?.[attemptId] && typeof doc[email][attemptId] === 'object' ? doc[email][attemptId] : null;
};

router.post('/postmortems', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const email = session.email;
  if (!ensureBudget(email, res)) return;
  const attemptRaw = String(req.body?.attemptId || '').trim();
  const parsed = postmortemBodySchema.safeParse(req.body?.body || {});
  if (!attemptRaw) return res.status(400).json({ error: 'Which incident attempt is this postmortem for?' });
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed, 'Write real answers in every section first.') });

  const attempt = await findAttempt(email, attemptRaw);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  if (attempt.status !== 'resolved') return res.status(409).json({ error: 'Resolve the incident first, then write its postmortem.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });

  const body = parsed.data;

  // Code starts from the deterministic rubric, then the AI may refine the
  // three judgment dimensions. The root-cause dimension is code's alone.
  const det = rubricBooleans(scenario, attempt, body);
  const trueRoot = scenario.rootCauses.find((rc) => rc.correct);

  const prompt = [
    'You are reviewing a student\'s postmortem for an incident-practice game.',
    'Grade ONLY against this rubric: specific (names services, times, numbers), blameless (no fault-finding language), actionable (the prevention section lists concrete future work).',
    'Be strict but fair. Notes are one short, kind sentence each.',
    `The incident, briefly: ${scenario.title} — ${scenario.story}`,
    `Student's postmortem (JSON): ${JSON.stringify(body)}`,
    'Return JSON: {"specific": {"met": bool, "note": string}, "blameless": {"met": bool, "note": string}, "actionable": {"met": bool, "note": string}, "summary": string}',
  ].join('\n');

  const baseNotes = {
    specific: det.specific ? 'Names concrete services and numbers.' : 'Add the concrete bits: which service, which times, what the numbers were.',
    blameless: det.blameless ? 'Talks about systems, not culprits.' : 'Some phrasing puts fault on people — describe the system conditions instead.',
    actionable: det.actionable ? 'The prevention section lists real future work.' : 'The prevention section needs specific follow-up work, not intent.',
  };

  const out = await aiPractice({
    role: 'critique',
    email,
    prompt,
    schema: aiCritiqueSchema,
    fallback: () => ({ specific: { met: det.specific, note: baseNotes.specific }, blameless: { met: det.blameless, note: baseNotes.blameless }, actionable: { met: det.actionable, note: baseNotes.actionable }, summary: det.specific && det.blameless && det.actionable ? 'Clear and workmanlike. Keep the concreteness.' : 'A solid draft — the notes point at what sharpen it.' }),
    maxTokens: 400,
  });
  const critique = out.data;

  const dims = {
    specific: out.ok ? critique.specific.met === true : det.specific,
    blameless: out.ok ? critique.blameless.met === true : det.blameless,
    actionable: out.ok ? critique.actionable.met === true : det.actionable,
    rootCause: det.rootCause, // code-owned, always
  };
  const notes = {
    specific: critique.specific?.note || baseNotes.specific,
    blameless: critique.blameless?.note || baseNotes.blameless,
    actionable: critique.actionable?.note || baseNotes.actionable,
    rootCause: det.rootCause
      ? 'Names the true root cause.'
      : 'The stated root cause does not match the one the evidence pointed to — re-read your own timeline.',
  };
  const score = rubricScore(dims);

  const doc = await postmortemsDoc();
  const docKey = doc[email]?.[attemptRaw] || { versions: [], current: 0, share: { enabled: false, token: null } };
  const previous = docKey.versions?.[docKey.current - 1]?.score ?? null;
  const version = {
    n: (docKey.versions?.length || 0) + 1,
    body,
    dims,
    score,
    feedback: { notes, summary: critique.summary || '', source: out.ok ? 'ai' : 'rules' },
    savedAt: new Date().toISOString(),
  };
  docKey.versions = [...(docKey.versions || []), version];
  docKey.current = version.n;
  doc[email] = doc[email] || {};
  doc[email][attemptRaw] = docKey;
  await persistPostmortems();

  res.json({
    ok: true,
    version: version.n,
    score,
    scoreChange: previous === null ? null : score - previous,
    review: { dims, notes, summary: version.feedback.summary, weights: RUBRIC_WEIGHTS, source: version.feedback.source },
    defendQuestions: scenario.defendQuestions.map((q) => ({ id: q.id, question: q.question })),
    entitlements: practiceEntitlements(session.account),
  });
});

router.post('/postmortems/:id/defend', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const email = session.email;
  if (!ensureBudget(email, res)) return;

  const entitlements = practiceEntitlements(session.account);
  if (!entitlements.defendStep) {
    return res.status(403).json({ error: 'Defending your postmortem is part of the paid plan — everything else in Practice stays free.' });
  }

  const parsed = defendAnswerSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed, 'Answer each question with a real sentence or two.') });

  const pm = await postmortemFor(email, String(req.params.id || ''));
  if (!pm) return res.status(404).json({ error: 'Write the postmortem first, then defend it.' });
  const attempt = await findAttempt(email, String(req.params.id || ''));
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });

  const defs = await defendDoc();
  const existing = defs[email]?.[String(req.params.id)];
  if (existing) {
    return res.json({ ok: true, already: true, result: existing });
  }

  const result = scoreDefend(scenario.defendQuestions, parsed.data.answers);
  const row = {
    attemptId: attempt.id,
    scenarioId: scenario.id,
    answers: parsed.data.answers,
    score: result.score,
    per: result.per,
    at: new Date().toISOString(),
  };
  defs[email] = defs[email] || {};
  defs[email][String(req.params.id)] = row;
  await persistDefend();

  res.json({ ok: true, already: false, result: row });
});

// ---------- Work record -------------------------------------------------------

/** One work record — the proof artifact. The owner and a shared reader both
 *  get the full record; a shared link is explicit consent to show the work
 *  (it never carries the student's identity).
 */
async function workRecordFor(scenario, attempt, pm, defend, { shared = false } = {}) {
  return {
    attemptId: attempt.id,
    shared,
    scenario: {
      id: scenario.id,
      title: scenario.title,
      track: scenario.track,
      level: scenario.level,
      minutes: scenario.minutes,
      company: scenario.source.company,
      sourceUrl: scenario.source.url,
      sourceTitle: scenario.source.title,
      inspiredByNote: scenario.inspiredByNote,
      lesson: scenario.lesson,
      realAction: scenario.realAction,
    },
    path: {
      actionsTaken: attempt.actions.map((a) => a.actionId),
      simMinutes: attempt.simMinutes,
      hintsUsed: attempt.hintsUsed,
      hypothesis: attempt.hypothesis,
      timeline: attemptView(scenario, attempt).timeline,
      resolution: attempt.resolution,
    },
    score: attempt.resolution?.score || null,
    postmortem: pm
      ? {
        current: pm.current,
        versions: (pm.versions || []).map((v) => ({
          n: v.n, score: v.score, dims: v.dims, summary: v.feedback?.summary || '', savedAt: v.savedAt, body: v.body,
        })),
      }
      : null,
    defend: defend || null,
  };
}

router.get('/work-record/:attemptId', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const email = session.email;
  const attempt = await findAttempt(email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  if (attempt.status !== 'resolved') return res.status(409).json({ error: 'Resolve the incident first — the record is the proof after.' });
  const scenario = await findScenario(attempt.scenarioId);
  if (!scenario) return res.status(404).json({ error: 'The scenario behind this attempt is gone.' });
  const pm = await postmortemFor(email, attempt.id);
  const defs = await defendDoc();
  const record = await workRecordFor(scenario, attempt, pm, defs[email]?.[attempt.id] || null);
  res.json({
    ok: true,
    record,
    share: pm ? { enabled: pm.share?.enabled === true, token: pm.share?.enabled ? pm.share.token : null } : null,
  });
});

router.post('/work-record/:attemptId/share', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const email = session.email;
  if (!ensureBudget(email, res)) return;
  const parsed = shareSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed) });
  const attempt = await findAttempt(email, req.params.attemptId);
  if (!attempt) return res.status(404).json({ error: 'No such attempt of yours.' });
  if (attempt.status !== 'resolved') return res.status(409).json({ error: 'Resolve the incident first.' });
  const pm = await postmortemFor(email, attempt.id);
  if (!pm) return res.status(409).json({ error: 'Write the postmortem first — a shared record is proof of the write-up, not just the score.' });

  pm.share = pm.share || { enabled: false, token: null };
  pm.share.enabled = parsed.data.share;
  if (pm.share.enabled && !pm.share.token) pm.share.token = newShareToken();
  await persistPostmortems();

  res.json({
    ok: true,
    enabled: pm.share.enabled,
    token: pm.share.enabled ? pm.share.token : null,
  });
});

// Public read-only record — token in the URL, no session, no email anywhere.
router.get('/work-record/shared/:token', async (req, res) => {
  const token = String(req.params.token || '').replace(/[^a-f0-9]/g, '');
  if (!token || token.length < 16) return res.status(404).json({ error: 'No such record.' });
  const [pmDoc, defs] = await Promise.all([postmortemsDoc(), defendDoc()]);
  for (const [owner, mine] of Object.entries(pmDoc)) {
    for (const [attemptId, pm] of Object.entries(mine || {})) {
      if (pm?.share?.enabled !== true || pm.share?.token !== token) continue;
      const attempts = await myAttempts(owner);
      const attempt = attempts[attemptId];
      if (!attempt || attempt.status !== 'resolved') continue;
      const scenario = await findScenario(attempt.scenarioId);
      if (!scenario) continue;
      const record = await workRecordFor(scenario, attempt, pm, defs[owner]?.[attemptId] || null, {
        shared: true,
      });
      return res.json({ ok: true, record });
    }
  }
  return res.status(404).json({ error: 'No such record.' });
});

// ---------- Admin: the scenario review queue -----------------------------------
// Drafts come from the AI (or a contributor) but nothing is playable until a
// human passes it through the same content checks the seeds pass.

const draftRequestSchema = z.object({
  company: z.string().trim().min(2).max(60),
  sourceUrl: z.string().trim().url().max(400),
  incidentSummary: z.string().trim().min(40).max(2000),
  track: z.enum(['Software Engineering', 'AI & ML', 'Cyber Security']),
  note: z.string().trim().max(300).optional(),
});

router.get('/admin/scenarios', requireAdmin, async (req, res) => {
  const rows = await allDrafts();
  const enriched = rows.map((s) => ({ ...s, checks: contentCheck(s) }));
  res.json({ ok: true, scenarios: enriched });
});

router.post('/admin/scenarios/draft', requireAdmin, async (req, res) => {
  const parsed = draftRequestSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: firstIssue(parsed) });
  const { company, sourceUrl, incidentSummary, track } = parsed.data;

  const prompt = [
    'You are drafting ONE scenario for an educational incident-practice game, based on a public postmortem summary a reviewer pastes.',
    'Hard rules:',
    '· Use ONLY synthetic logs, numbers and service names — never copy real text or data.',
    `· Set inspiredByNote to a sentence starting "Inspired by ${company}'s" and mention it is simplified with synthetic data.`,
    '· The evidence must support exactly ONE root cause; mark it correct: true. Include at least 2 evidence/check reveals that support it and reveals whose "refutes" arrays rule out each wrong root cause.',
    '· Include exactly one safe fix, at least one noop and one harmful fix. 3 hints. 3 defend questions with keyPoints.',
    '· No emoji. Plain, calm wording. Incidents are blameless.',
    `The public incident to draft from (summary by the reviewer): ${incidentSummary}`,
    '· Source URL for the record:', sourceUrl,
    'Set: track=' + track + ', level choice justified by the prompt rules, title, story, services, timeline, events, actions, rootCauses, fixes, hintLadder, guidance (if level 1), defendQuestions, lesson, realAction, source {company, url, title}, status="draft".',
    'Return JSON: {"scenario": {...full scenario per the schema...}, "notes": "one line for the reviewer"}.',
  ].join('\n');

  const fallback = () => null; // no deterministic draft exists — an honest error
  const out = await aiPractice({
    role: 'draft',
    email: process.env.ADMIN_EMAIL || 'admin',
    prompt,
    schema: aiDraftSchema,
    fallback,
    maxTokens: 3500,
  });
  if (!out.ok || !out.data?.scenario) {
    return res.status(503).json({
      error: 'The scenario drafter is unavailable (no AI key or the draft failed validation). A human can author the JSON directly into the review queue.',
    });
  }

  const draft = {
    ...out.data.scenario,
    status: 'draft',
    createdAt: new Date().toISOString(),
    draftNote: out.data.notes || parsed.data.note || null,
  };
  const checks = contentCheck(draft);
  const saved = await queueUpsert(draft);
  res.status(201).json({ ok: true, scenario: saved, checks });
});

router.post('/admin/scenarios/:id/approve', requireAdmin, async (req, res) => {
  const rows = await allDrafts();
  const draft = rows.find((s) => s.id === req.params.id);
  if (!draft) return res.status(404).json({ error: 'No such draft in the queue.' });
  const checks = contentCheck(draft);
  if (!checks.ok) {
    return res.status(422).json({ error: 'The scenario does not pass the review checks yet.', issues: checks.issues });
  }
  draft.status = 'published';
  draft.reviewedBy = process.env.ADMIN_EMAIL || 'admin';
  await queueUpsert(draft);
  res.json({ ok: true, scenario: draft });
});

router.post('/admin/scenarios/:id/reject', requireAdmin, async (req, res) => {
  const removed = await queueRemove(req.params.id);
  if (!removed) return res.status(404).json({ error: 'No such draft in the queue.' });
  res.json({ ok: true });
});

// ---------- Cross-feature adapters (home.js + personalize.js) -----------------

/** Home page "challenge" section: today's drill state for this student. */
export async function drillResultFor(email) {
  await ensureContent();
  const state = await myDrillState(email);
  const dayKey = istDayKey();
  const today = state.days?.[dayKey] || null;
  const drill = today ? drillById(today.drillId) : null;
  return {
    answeredToday: Boolean(today),
    correct: today ? today.correct === true : false,
    title: drill ? drill.moment.title : null,
    takeaway: drill ? drill.takeaway : null,
    seasonName: drill ? seasonFor(drill)?.name || null : null,
  };
}

/** How many distinct days this student completed a drill — the personalization context. */
export { drillDaysFor, drillCompletionsOnDay } from '../lib/practice/store.js';

export default router;
