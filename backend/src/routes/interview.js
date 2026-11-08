import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';
import { markTodayMission } from './dashboard.js';
import { scoreVoiceAnswer } from '../lib/voice-score.js';

// Interview Prep — a self-run mock interview trainer. One question at a time,
// student answers in their own words, reveals the model outline, and grades
// themselves honestly (1-5). Per-student attempts live in
// backend/data/interview-attempts.json as { [email]: { [qid]: {selfScore,
// seconds, at} } } — attempts.json is another feature's file; this module
// owns only interview-attempts.json. The question bank is a seeded document
// in interview-questions.json (behavioural + technical + HR).
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const QUESTIONS_FILE = DATA_DIR + 'interview-questions.json';
const ATTEMPTS_FILE = DATA_DIR + 'interview-attempts.json';
const KEYPOINTS_FILE = DATA_DIR + 'interview-keypoints.json';
const VOICE_FILE = DATA_DIR + 'interview-voice.json';

// Scores at or below this mark queue the question for future review
// ("wrong / self-graded-low feeds future review").
const REVIEW_THRESHOLD = 2;
// Self-run tool: elapsed time is bounded so one stray tab can't warehouse a
// nonsense value; the timer is a visual aid, never a gate.
const MAX_SECONDS = 7200;

async function readQuestions() {
  try {
    const parsed = JSON.parse(await readFile(QUESTIONS_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed.filter((q) => q && q.id && q.question) : [];
  } catch {
    return [];
  }
}

async function readAttempts() {
  try {
    const parsed = JSON.parse(await readFile(ATTEMPTS_FILE, 'utf8'));
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAttempts(attempts) {
  await writeFile(ATTEMPTS_FILE, JSON.stringify(attempts, null, 2));
}

// Deterministic string hash — question order looks shuffled per student but
// is stable across restarts and identical for the same (email, question).
function hash(strVal) {
  let h = 2166136261;
  for (let i = 0; i < strVal.length; i++) {
    h ^= strVal.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Personal question order: sort by hash(email + ':' + qid). Two students get
// different sequences from the same bank; one student always gets the same one.
function orderedFor(email, questions) {
  return [...questions].sort(
    (a, b) => hash(`${email}:${a.id}`) - hash(`${email}:${b.id}`),
  );
}

// The wire form of a question never carries the outline — revealing it is an
// explicit step the student (or their client) must take.
function toQuestionView(q) {
  return { id: q.id, topic: q.topic, question: q.question, timeSec: q.timeSec };
}

function attemptMapFor(attempts, email) {
  const mine = attempts[email];
  return mine && typeof mine === 'object' ? mine : {};
}

// Counts only attempts whose qid is still in the bank, so stale ids from a
// retired question can never inflate "attempted".
function summaryFor(email, attempts, questions) {
  const byId = new Map(questions.map((q) => [q.id, q]));
  const mine = attemptMapFor(attempts, email);
  const validQids = Object.keys(mine).filter((qid) => byId.has(qid));
  const scores = validQids.map((qid) => mine[qid].selfScore);
  const avg = scores.length
    ? Math.round((scores.reduce((s, n) => s + n, 0) / scores.length) * 10) / 10
    : null;
  const reviewQueue = orderedFor(email, validQids.map((qid) => byId.get(qid)))
    .filter((q) => mine[q.id].selfScore <= REVIEW_THRESHOLD)
    .map((q) => ({
      qid: q.id,
      topic: q.topic,
      question: q.question,
      selfScore: mine[q.id].selfScore,
      at: mine[q.id].at,
    }));
  return {
    attempted: validQids.length,
    total: questions.length,
    remaining: questions.length - validQids.length,
    avgScore: avg,
    reviewThreshold: REVIEW_THRESHOLD,
    reviewQueue,
  };
}

function grade(selfScore) {
  const n = Number(selfScore);
  return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null;
}

function spent(seconds) {
  if (seconds === undefined || seconds === null || seconds === '') return null;
  const n = Math.floor(Number(seconds));
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.min(n, MAX_SECONDS);
}

const router = Router();

function requireUser(req, res) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = resolveSession(token);
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  return session;
}

router.get('/health', (req, res) => res.json({ ok: true, feature: 'interview' }));

// GET /api/interview/next — the first question (in this student's stable
// hash order) they have not attempted yet. question: null means the bank is
// exhausted for them; the client shows the honest done state, never repeats
// a question just to have something on screen.
router.get('/next', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const questions = await readQuestions();
  if (questions.length === 0) {
    return res.status(503).json({ error: 'The question bank is unavailable right now.' });
  }
  const attempts = await readAttempts();
  const mine = attemptMapFor(attempts, session.email);
  const next = orderedFor(session.email, questions).find((q) => !mine[q.id]) || null;
  const summary = summaryFor(session.email, attempts, questions);

  res.json({
    ok: true,
    question: next ? toQuestionView(next) : null,
    attempted: summary.attempted,
    remaining: summary.remaining,
    total: summary.total,
  });
});

// GET /api/interview/questions/:qid — full question including the model
// outline. Kept separate from /next so "reveal outline" is a deliberate
// action instead of an answer sitting in the first network response.
router.get('/questions/:qid', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const qid = String(req.params.qid || '');
  const questions = await readQuestions();
  const match = questions.find((q) => q.id === qid);
  if (!match) {
    return res.status(404).json({ error: 'That question does not exist.' });
  }
  res.json({ ok: true, question: match });
});

// POST /api/interview/attempt { qid, selfScore, seconds } — one honest
// self-grade per question. Re-attempting overwrites, so the summary always
// reflects the student's latest judgement of themselves.
router.post('/attempt', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const qid = String(req.body?.qid || '');
  const score = grade(req.body?.selfScore);
  const used = spent(req.body?.seconds);
  if (!qid) {
    return res.status(400).json({ error: 'Missing question id.' });
  }
  if (score === null) {
    return res.status(400).json({ error: 'Grade yourself from 1 to 5.' });
  }
  if (used === null) {
    return res.status(400).json({ error: 'Seconds spent must be a non-negative number.' });
  }

  const questions = await readQuestions();
  if (!questions.some((q) => q.id === qid)) {
    return res.status(400).json({ error: 'Unknown question.' });
  }

  const attempts = await readAttempts();
  const mine = attemptMapFor(attempts, session.email);
  mine[qid] = { selfScore: score, seconds: used, at: new Date().toISOString() };
  attempts[session.email] = mine;
  try {
    await writeAttempts(attempts);
  } catch {
    return res.status(500).json({ error: 'Could not save your attempt — try again.' });
  }

  // A real, graded attempt is a verified interview rep (idempotent per day).
  markTodayMission(session, 'interview', `Self-graded ${score}/5`);

  res.status(200).json({
    ok: true,
    attempt: mine[qid],
    summary: summaryFor(session.email, attempts, questions),
  });
});

// GET /api/interview/summary — the stat row numbers plus the review queue
// (questions self-graded at or below the review threshold).
router.get('/summary', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const questions = await readQuestions();
  const attempts = await readAttempts();
  res.json({ ok: true, ...summaryFor(session.email, attempts, questions) });
});

// POST /api/interview/reset — clears ONLY this student's attempts; other
// emails in the file are untouched.
router.post('/reset', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const questions = await readQuestions();
  const attempts = await readAttempts();
  delete attempts[session.email];
  try {
    await writeAttempts(attempts);
  } catch {
    return res.status(500).json({ error: 'Could not reset your attempts — try again.' });
  }

  res.json({ ok: true, summary: summaryFor(session.email, attempts, questions) });
});

// ---- Voice interview (English) — spoken answers, scored purely by code
// (coverage of the answer's key points, length, pace, filler rate). Audio is
// NEVER stored; the transcript is the only artifact, and it is deletable.

async function readKeyPoints() {
  try {
    const map = JSON.parse(await readFile(KEYPOINTS_FILE, 'utf8'));
    return map && typeof map === 'object' ? map : {};
  } catch {
    return {};
  }
}

async function readVoice() {
  try {
    const doc = JSON.parse(await readFile(VOICE_FILE, 'utf8'));
    return doc && typeof doc === 'object' ? doc : {};
  } catch {
    return {};
  }
}

async function writeVoice(doc) {
  await writeFile(VOICE_FILE, JSON.stringify(doc, null, 2));
}

// The student's voice trajectory for the rail: per-question latest/first
// scores, the average, and the three-day fix plan (three weakest answers).
router.get('/voice/summary', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const questions = await readQuestions();
  await readKeyPoints(); // probes the spec file; absence only degrades readiness
  const voice = await readVoice();
  const mine = voice[session.email] || {};
  const rows = [];
  for (const q of questions) {
    const attempts = mine[q.id]?.attempts || [];
    if (attempts.length === 0) continue;
    rows.push({
      qid: q.id,
      topic: q.topic,
      question: q.question,
      score: attempts[attempts.length - 1].score,
      firstScore: attempts[0].score,
      attempts: attempts.length,
    });
  }
  res.json({
    ok: true,
    total: questions.length,
    answered: rows.length,
    avgScore: rows.length
      ? Math.round(rows.reduce((n, r) => n + r.score, 0) / rows.length)
      : null,
    fixPlan: [...rows].sort((x, y) => x.score - y.score).slice(0, 3),
    rows,
  });
});

router.post('/voice', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const qid = String(req.body?.qid || '');
  const transcript = String(req.body?.transcript || '').trim().slice(0, 4000);
  const spoken = Math.max(0, Math.floor(Number(req.body?.seconds) || 0));
  if (transcript.split(/\s+/).filter(Boolean).length < 5) {
    return res.status(400).json({ error: 'Say (or type) a full answer — a few words cannot be scored.' });
  }
  const questions = await readQuestions();
  const q = questions.find((x) => x.id === qid);
  if (!q) return res.status(404).json({ error: 'Unknown question.' });
  const keymap = await readKeyPoints();
  const spec = keymap[qid];
  if (!spec) return res.status(503).json({ error: 'The scoring spec for this question is unavailable right now.' });

  const verdict = scoreVoiceAnswer(spec, transcript, spoken);
  const voice = await readVoice();
  const mine = voice[session.email] = voice[session.email] || {};
  mine[qid] = mine[qid] || { attempts: [] };
  const firstScore = mine[qid].attempts.length ? mine[qid].attempts[0].score : null;
  mine[qid].attempts.push({
    score: verdict.score,
    transcript,
    seconds: spoken,
    wordCount: verdict.wordCount,
    at: new Date().toISOString(),
  });
  mine[qid].attempts = mine[qid].attempts.slice(-10);
  try {
    await writeVoice(voice);
  } catch (err) {
    console.error('[interview] voice save failed:', err.message);
    return res.status(500).json({ error: 'Could not save the attempt — try again.' });
  }

  // A scored spoken attempt is a verified interview rep for today's plan.
  markTodayMission(session, 'interview', `Voice score ${verdict.score}/100`);

  res.json({
    ok: true,
    score: verdict.score,
    firstScore,
    attemptNumber: mine[qid].attempts.length,
    breakdown: verdict,
  });
});

router.delete('/voice', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const voice = await readVoice();
  delete voice[session.email]; // transcripts gone; nothing else about them exists
  try {
    await writeVoice(voice);
  } catch {
    return res.status(500).json({ error: 'Could not delete the transcripts — try again.' });
  }
  res.json({ ok: true });
});

export default router;
