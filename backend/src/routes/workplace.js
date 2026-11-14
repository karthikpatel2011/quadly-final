// Workplace — the simulated first job at Setu Freight (fictional company,
// honest "job simulation" framing everywhere). One episode per sitting:
// Company Academy lesson → work ticket → voice defend → deterministic
// scorecard. The LLM only voices characters (lib/workplace/chat.js); every
// outcome is computed in lib/workplace/evaluator.js, and every verified
// episode flows through the platform's shared completion hook
// (markTodayMission) so the plan and streak react like every other feature.

import { Router } from 'express';
import { resolveSession } from './auth.js';
import { buildPayload, markTodayMission } from './dashboard.js';
import { workplaceEntitlements } from '../lib/entitlement.js';
import { STORY, EPISODES, episodeById, PERSONAS } from '../lib/workplace/content.js';
import { seedFor, evaluateEpisode, cleanTier, sanitizeInput, weeklyGaps } from '../lib/workplace/evaluator.js';
import { characterReply } from '../lib/workplace/chat.js';
import {
  getProgress, saveProgress, getSubmissions, addSubmission,
  getPassport, savePassport, chatAllowance, countChat,
} from '../lib/workplace/store.js';

const router = Router();

// Day/week logic: the same 4 am India rollover the rest of the platform uses.
const istDayKey = (ms = Date.now()) => new Date(ms + 90 * 60_000).toISOString().slice(0, 10);

function requireUser(req, res) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = resolveSession(token);
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  if (!session.account.onboarded) {
    res.status(409).json({ error: 'Finish onboarding first — the simulation needs your track and pace.' });
    return null;
  }
  return session;
}

function verifiedIds(submissions) {
  return new Set(submissions.filter((s) => s.pass).map((s) => s.episodeId));
}

/** Episode visibility for a progress state: verified < attempted < open <
 *  locked (past episodes stay reviewable; entitlement gates the weeks). */
function episodeStatus(ep, progress, verified) {
  if (verified.has(ep.id)) return 'verified';
  if (progress && progress.currentEpisodeId === ep.id) return 'open';
  const order = EPISODES.findIndex((e) => e.id === ep.id);
  const currentOrder = EPISODES.findIndex((e) => e.id === progress?.currentEpisodeId);
  return currentOrder >= 0 && order < currentOrder ? 'missed' : 'locked';
}

function publicEpisode(ep, status, progress, verified, seed) {
  const base = {
    id: ep.id, week: ep.week, day: ep.day, weekday: ep.weekday,
    title: ep.title, kind: ep.kind, minutes: ep.minutes,
    status, managerLine: ep.managerLine,
  };
  if (status === 'verified' || status === 'missed') return base;
  if (status === 'open') {
    return {
      ...base,
      academy: {
        title: ep.academy.title,
        minutes: ep.academy.minutes,
        body: ep.academy.body,
        // Answers never leave the server — the client gets the prompt + options only.
        quiz: ep.academy.quiz.map((item) => ({ q: item.q, options: item.options })),
      },
      ticket: {
        from: ep.ticket.from,
        persona: PERSONAS[ep.ticket.from] || PERSONAS.priya,
        channel: ep.ticket.channel,
        intro: ep.ticket.intro(seed),
        code: ep.ticket.code ? ep.ticket.code(seed) : null,
        ask: ep.ticket.ask,
        inputKind: ep.ticket.inputKind,
        choices: ep.ticket.choices
          ? (typeof ep.ticket.choices === 'function' ? ep.ticket.choices(seed) : ep.ticket.choices)
          : null,
      },
      academyDone: Boolean(progress?.academyDone?.[ep.id]),
    };
  }
  return base; // locked: title only, no payload leaks
}

function storyState(progress, submissions, entitlement, seed) {
  const verified = verifiedIds(submissions);
  const episodes = EPISODES.map((ep) => {
    const status = episodeStatus(ep, progress, verified);
    return ep.week > entitlement.weeks && status !== 'verified'
      ? { ...publicEpisode(ep, 'locked', progress, verified, seed), lockedByPlan: true }
      : publicEpisode(ep, status, progress, verified, seed);
  });
  return episodes;
}

// ------------------------------------------------------- GET /today -------
// Home's "Today at work" card and the /workplace bootstrap in one read.
router.get('/today', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const entitlement = workplaceEntitlements(session.account);
  const progress = await getProgress(session.email);
  const submissions = await getSubmissions(session.email);
  const seed = seedFor(session.email);

  if (!progress) {
    return res.json({
      ok: true,
      story: { slug: STORY.slug, title: STORY.title, company: STORY.company_name, weeks: STORY.total_weeks, activeWeeks: STORY.active_weeks },
      entitlement,
      progress: null,
      today: null,
    });
  }

  const verified = verifiedIds(submissions);
  const current = EPISODES.find((e) => e.id === progress.currentEpisodeId) || null;
  const nextUnverified = EPISODES.find((e) => !verified.has(e.id) && e.week <= entitlement.weeks) || null;
  const todayEp = current && !verified.has(current.id) ? current : nextUnverified;
  const done = verified.size;

  res.json({
    ok: true,
    story: { slug: STORY.slug, title: STORY.title, company: STORY.company_name, weeks: STORY.total_weeks, activeWeeks: STORY.active_weeks },
    entitlement,
    progress: {
      tier: progress.tier,
      status: progress.status,
      verifiedCount: done,
      total: EPISODES.filter((e) => e.week <= entitlement.weeks).length,
      currentEpisodeId: progress.currentEpisodeId,
      startedAt: progress.startedAt,
    },
    today: todayEp
      ? {
          id: todayEp.id,
          week: todayEp.week,
          day: todayEp.day,
          weekday: todayEp.weekday,
          title: todayEp.title,
          minutes: todayEp.minutes,
          managerLine: todayEp.managerLine,
          from: todayEp.ticket.from,
          personaName: PERSONAS[todayEp.ticket.from]?.name || 'Your manager',
          weekOf: { week: todayEp.week, of: entitlement.weeks },
        }
      : null,
  });
});

// ------------------------------------------------------- GET /story -------
// The workspace rail + work record: every episode with its status, and the
// student's best attempt summary where one exists.
router.get('/story', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const entitlement = workplaceEntitlements(session.account);
  const progress = await getProgress(session.email);
  const submissions = await getSubmissions(session.email);
  const seed = seedFor(session.email);
  const verified = verifiedIds(submissions);

  const bestByEpisode = {};
  for (const sub of submissions) {
    const prev = bestByEpisode[sub.episodeId];
    if (!prev || (sub.pass && !prev.pass) || (sub.pass === prev.pass && sub.overall > prev.overall)) {
      bestByEpisode[sub.episodeId] = sub;
    }
  }

  const episodes = storyState(progress, submissions, entitlement, seed).map((ep) => {
    const best = bestByEpisode[ep.id];
    return {
      ...ep,
      attempt: best
        ? { pass: best.pass, overall: best.overall, rubric: best.rubric, at: best.at, attempts: best.attemptNo || 1 }
        : null,
    };
  });

  res.json({
    ok: true,
    story: { slug: STORY.slug, title: STORY.title, company: STORY.company_name, brief: STORY.company_brief, weeks: STORY.total_weeks, activeWeeks: entitlement.weeks },
    entitlement,
    tier: progress?.tier || null,
    episodes,
  });
});

// ------------------------------------------------------ POST /start -------
router.post('/start', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const entitlement = workplaceEntitlements(session.account);
  const existing = await getProgress(session.email);
  if (existing) {
    return res.status(409).json({ error: 'Your simulation is already underway — pick it up from the workplace.' });
  }
  const tier = cleanTier(sanitizeInput(req.body?.tier, 12));
  if (!entitlement.tiers.includes(tier)) {
    return res.status(402).json({ error: 'That tier needs the paid plan — guided or standard are open to you today.' });
  }
  const first = EPISODES.find((e) => e.week === 1 && e.day === 1);
  const saved = await saveProgress(session.email, {
    storyId: STORY.slug,
    tier,
    currentEpisodeId: first.id,
    status: 'active',
    academyDone: {},
    attempts: {},
    startedAt: new Date().toISOString(),
  });
  res.status(201).json({ ok: true, progress: saved });
});

// -------------------------------------------- POST /academy/complete ------
// The 2-minute lesson check. Wrong answers get the "why" and a retry — no
// shame, no dead end; the ticket unlocks only on a fully correct check.
router.post('/academy/complete', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const episode = episodeById(sanitizeInput(req.body?.episodeId, 12));
  if (!episode) return res.status(404).json({ error: 'No such episode.' });
  const progress = await getProgress(session.email);
  if (!progress || progress.currentEpisodeId !== episode.id) {
    return res.status(409).json({ error: 'That is not today\'s episode.' });
  }
  const answers = Array.isArray(req.body?.answers) ? req.body.answers : [];
  const results = episode.academy.quiz.map((q, i) => {
    const given = Number(answers[i]);
    return { correct: given === q.answer, why: q.why };
  });
  const allCorrect = results.every((r) => r.correct);
  if (allCorrect && !progress.academyDone[episode.id]) {
    progress.academyDone[episode.id] = true;
    await saveProgress(session.email, progress);
  }
  res.json({ ok: true, results, unlocked: allCorrect });
});

// ------------------------------------------------------- POST /chat -------
router.post('/chat', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const episode = episodeById(sanitizeInput(req.body?.episodeId, 12));
  if (!episode) return res.status(404).json({ error: 'No such episode.' });
  const progress = await getProgress(session.email);
  if (!progress || progress.currentEpisodeId !== episode.id) {
    return res.status(409).json({ error: 'The characters are only in the room for today\'s episode.' });
  }
  const message = sanitizeInput(req.body?.message, 500);
  if (!message) return res.status(400).json({ error: 'Say something first.' });

  const day = istDayKey();
  const allowance = await chatAllowance(session.email, day);
  if (!allowance.allowed) {
    return res.status(429).json({ error: `You've had ${allowance.cap} chats today — the characters will pick this up tomorrow. The ticket itself never expires.` });
  }
  await countChat(session.email, day);
  const turn = allowance.n;
  const { reply, source } = await characterReply({
    episode,
    personaKey: episode.ticket.from,
    message,
    seed: seedFor(session.email),
    tier: progress.tier,
    turn,
  });
  res.json({ ok: true, from: episode.ticket.from, personaName: PERSONAS[episode.ticket.from]?.name, reply, source });
});

// ----------------------------------------------------- POST /submit -------
// The only written path to a verified episode: deterministic evaluation,
// then the shared completion hook (streak/plan react), then the passport.
router.post('/submit', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const episode = episodeById(sanitizeInput(req.body?.episodeId, 12));
  if (!episode) return res.status(404).json({ error: 'No such episode.' });
  const progress = await getProgress(session.email);
  if (!progress || progress.currentEpisodeId !== episode.id) {
    return res.status(409).json({ error: 'That is not today\'s episode.' });
  }
  if (!progress.academyDone[episode.id]) {
    return res.status(409).json({ error: 'The Company Academy check comes first — two minutes, then the ticket opens.' });
  }

  // Attempts are capped per day per episode: honest retries, no brute force.
  const day = istDayKey();
  const attemptRec = progress.attempts[episode.id] || { day, n: 0 };
  const attemptsToday = attemptRec.day === day ? attemptRec.n : 0;
  if (attemptsToday >= 3) {
    return res.status(429).json({ error: 'Three honest attempts today — sleep on it. The ticket reopens tomorrow with everything you built.' });
  }

  const verdict = evaluateEpisode({
    episode,
    tier: progress.tier,
    email: session.email,
    work: req.body?.work,
    choiceId: sanitizeInput(req.body?.choiceId, 4) || null,
    defend: req.body?.defend,
  });

  progress.attempts[episode.id] = { day, n: attemptsToday + 1 };

  // The shared hook: a verified episode completes the day's learn task, so
  // the streak, the plan meter, and Home all move together — one mutator.
  let taskMarked = false;
  if (verdict.pass) {
    const learnBefore = buildPayload(session.email, session).missions.find((m) => m.category === 'learn');
    taskMarked = Boolean(learnBefore && !learnBefore.done);
    markTodayMission(session, 'learn', `Workplace — ${episode.title}`);

    progress.status = episode.week === 2 && episode.day === 5 ? 'starter_complete' : 'active';
    progress.lastVerifiedAt = new Date().toISOString();
    // The pointer only ever moves inside the plan's paid-for weeks.
    const entitlement = workplaceEntitlements(session.account);
    const currentOrder = EPISODES.findIndex((x) => x.id === episode.id);
    const next = EPISODES.find((e, order) => order > currentOrder && e.week <= entitlement.weeks);
    progress.currentEpisodeId = next ? next.id : episode.id;
  }
  await saveProgress(session.email, progress);

  const submission = {
    episodeId: episode.id,
    week: episode.week,
    day: episode.day,
    tier: verdict.tier,
    pass: verdict.pass,
    overall: verdict.overall,
    rubric: verdict.rubric,
    feedback: verdict.feedback,
    // Only the transcript is kept — never audio (DPDP: transcribe, evaluate, discard).
    voiceTranscript: sanitizeInput(req.body?.defend, 2000) || null,
    work: sanitizeInput(req.body?.work, 4000) || null,
    attemptNo: attemptsToday + 1,
  };
  const all = await addSubmission(session.email, submission);

  // Skills passport — STAR stories + the 1–2 weekly gaps, deterministic.
  let passport = await getPassport(session.email);
  passport = passport || { stories: {}, gaps: [], label: 'Job simulation — training record' };
  passport.stories = passport.stories || {};
  if (verdict.pass && verdict.star) {
    passport.stories[episode.id] = verdict.star;
  }
  passport.gaps = weeklyGaps(all);
  await savePassport(session.email, passport);

  res.json({
    ok: true,
    verdict: {
      pass: verdict.pass,
      overall: verdict.overall,
      rubric: verdict.rubric,
      checks: verdict.checks.map((c) => ({ kind: c.kind, axis: c.axis, note: c.note, pass: c.pass })),
      feedback: verdict.feedback,
      taskMarked,
    },
    attemptsLeft: Math.max(0, 3 - (attemptsToday + 1)),
  });
});

// --------------------------------------------------- GET /passport --------
// The skills passport: STAR interview stories + weekly gaps from verified
// work only, labelled as a simulation every time it is shown.
router.get('/passport', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const passport = await getPassport(session.email);
  const submissions = await getSubmissions(session.email);
  const verified = submissions.filter((s) => s.pass);
  res.json({
    ok: true,
    label: 'Job simulation — training record (never work experience)',
    story: { slug: STORY.slug, title: STORY.title, company: STORY.company_name },
    weeks: { current: verified.length ? Math.max(...verified.map((s) => s.week)) : 0, of: STORY.active_weeks },
    star: passport?.stories ? Object.values(passport.stories) : [],
    gaps: passport?.gaps || [],
    verifiedEpisodes: verified.map((s) => ({ episodeId: s.episodeId, week: s.week, day: s.day, overall: s.overall, at: s.createdAt })),
    empty: verified.length === 0,
  });
});

export default router;
