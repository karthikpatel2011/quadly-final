import { Router } from 'express';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';
import { markTodayMission } from './dashboard.js';

// Practice hub — Daily 15: one deterministic five-question drill per
// (student, date), drawn from backend/data/practice-questions.json with the
// same hash-seeding pattern as dashboard.js. Attempts persist per student to
// backend/data/attempts.json as { [email]: { [date]: { [qid]: answerIndex } } }.
// The first recorded attempt on a question is immutable — it IS the "first
// try" — while a question stays re-answerable (feedback only) until correct.
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const BANK_FILE = DATA_DIR + 'practice-questions.json';
const ATTEMPTS_FILE = DATA_DIR + 'attempts.json';

const DAILY_TOTAL = 5;
const DRILL_MINUTES = 15;

async function readBank() {
  try {
    const doc = JSON.parse(await readFile(BANK_FILE, 'utf8'));
    const list = Array.isArray(doc?.questions) ? doc.questions : [];
    // Keep only well-formed entries so a hand-edited bank can never crash
    // the drill or serve a question without a verifiable answer.
    return list.filter(
      (q) =>
        typeof q.question === 'string' &&
        q.question.trim().length > 0 &&
        Array.isArray(q.options) &&
        q.options.length === 4 &&
        q.options.every((o) => typeof o === 'string' && o.length > 0) &&
        Number.isInteger(q.answerIndex) &&
        q.answerIndex >= 0 &&
        q.answerIndex <= 3 &&
        typeof q.topic === 'string' &&
        q.topic.trim().length > 0,
    );
  } catch {
    return []; // missing or corrupt bank → honest empty/503 downstream
  }
}

// { [email]: { [date]: { [qid]: answerIndex } } }
// Concurrency: one in-process cache, loaded once, is the source of truth —
// every request mutates the same object, so overlapping requests can never
// lose each other's updates (a bare read-per-request lost a retry's record
// during testing). Persistence is atomic (temp file + rename) and awaited,
// so a reader can never parse a half-written file after a restart either.
let attemptsCache = null;
let attemptsLoad = null;

function loadAttemptsOnce() {
  if (attemptsLoad) return attemptsLoad;
  attemptsLoad = readFile(ATTEMPTS_FILE, 'utf8')
    .then((raw) => JSON.parse(raw))
    .then((doc) => {
      attemptsCache = doc && typeof doc === 'object' && !Array.isArray(doc) ? doc : {};
    })
    .catch(() => {
      attemptsCache = {}; // missing or unreadable file → start clean
    })
    .then(() => attemptsCache);
  return attemptsLoad;
}

async function getAttempts() {
  if (attemptsCache) return attemptsCache;
  return loadAttemptsOnce();
}

async function persistAttempts(state) {
  const tmp = `${ATTEMPTS_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, ATTEMPTS_FILE);
}

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

const todayISO = () => new Date().toISOString().slice(0, 10);

// Deterministic string hash — the daily pick stays stable for a given
// (user, date) and reproducible across restarts. Same scheme as dashboard.js.
function hash(strVal) {
  let h = 2166136261;
  for (let i = 0; i < strVal.length; i++) {
    h ^= strVal.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const qidOf = (bankIndex) => `q${bankIndex + 1}`;

// Even mix of the whole bank, seeded per (email + feature + date) so two
// students — or one student on two days — get different, stable sets.
function pickIndices(email, date, bankLen) {
  const n = Math.min(DAILY_TOTAL, bankLen);
  const seed = hash(`daily15:${email}::${date}`);
  return Array.from({ length: bankLen }, (_, i) => ({ i, r: hash(String(seed + i * 7919)) % 10007 }))
    .sort((a, b) => a.r - b.r)
    .slice(0, n)
    .map((x) => x.i);
}

// Today's drill for a student: client-safe question objects (no answer key)
// plus an internal map used to verify attempts. Question ids come from the
// bank file when present (stable across reorders; also joins attempts to
// Mistake Replay in skills.js) and fall back to derived `q<position>` ids.
function buildDaily(email, date, bank) {
  const picks = pickIndices(email, date, bank.length);
  const questions = [];
  const byId = {};
  for (const i of picks) {
    const q = bank[i];
    let id = typeof q.id === 'string' && q.id.trim() ? q.id.trim() : null;
    if (!id || byId[id]) id = `${qidOf(i)}`; // collision → positional fallback
    questions.push({ id, topic: q.topic, question: q.question, options: q.options });
    byId[id] = { answerIndex: q.answerIndex, topic: q.topic };
  }
  return { questions, byId };
}

// Score = count of first-try-correct answers among today's recorded attempts.
function dayScore(day, byId) {
  let score = 0;
  for (const [qid, idx] of Object.entries(day)) {
    if (byId[qid] && idx === byId[qid].answerIndex) score++;
  }
  return score;
}

router.get('/health', (req, res) => res.json({ ok: true, feature: 'practice' }));

// Today's five questions + this student's recorded state for this date.
// Answers are never included; correctness arrives only from the POST.
router.get('/daily15', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const bank = await readBank();
  if (bank.length === 0) {
    return res.status(503).json({
      error: 'The question bank is empty — Daily 15 has nothing to serve right now. Try again later.',
    });
  }
  const date = todayISO();
  const { questions, byId } = buildDaily(session.email, date, bank);

  const state = await getAttempts();
  const day = state[session.email]?.[date] || {};
  const answered = {};
  const firstTry = {};
  for (const qid of Object.keys(byId)) {
    if (day[qid] !== undefined) {
      answered[qid] = day[qid];
      firstTry[qid] = day[qid] === byId[qid].answerIndex;
    }
  }
  res.json({
    ok: true,
    date,
    minutes: DRILL_MINUTES,
    total: questions.length,
    questions, // { id, topic, question, options[4] } — no answers
    answered, // { [qid]: recorded first-try index }
    firstTry, // { [qid]: true when the recorded attempt was correct }
    score: dayScore(day, byId),
    done: questions.length > 0 && Object.keys(answered).length === questions.length,
  });
});

// Record an attempt { qid, answerIndex }. The first attempt per question is
// stored (it defines the score); retries return fresh feedback but never
// overwrite the record, so "number correct on first try" stays honest.
router.post('/daily15', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const qid = String(req.body?.qid || '');
  const answerIndex = req.body?.answerIndex;
  if (!Number.isInteger(answerIndex) || answerIndex < 0 || answerIndex > 3) {
    return res.status(400).json({ error: 'Pick one of the four options (answerIndex 0–3).' });
  }

  const bank = await readBank();
  if (bank.length === 0) {
    return res.status(503).json({ error: 'The question bank is empty — Daily 15 has nothing to serve right now.' });
  }
  const date = todayISO();
  const { byId, questions } = buildDaily(session.email, date, bank);
  const q = byId[qid];
  if (!q) {
    return res.status(400).json({ error: 'That question is not part of today’s Daily 15.' });
  }

  const state = await getAttempts();
  const email = session.email;
  state[email] = state[email] || {};
  state[email][date] = state[email][date] || {};
  const day = state[email][date];

  if (day[qid] === undefined) {
    day[qid] = answerIndex; // first try, recorded once
    try {
      await persistAttempts(state);
    } catch {
      /* persistence failure must not fail the answer — cache keeps the truth */
    }
  }
  // Retries: same feedback contract, record untouched, score unchanged.

  const answeredCount = Object.keys(day).length;
  const score = dayScore(day, byId);
  const done = questions.length > 0 && answeredCount >= questions.length;
  if (done) {
    // Verified result recorded → today's learn task is complete (no checkbox).
    markTodayMission(session, 'learn', `Passed ${score}/${questions.length}`);
  }
  res.json({
    ok: true,
    qid,
    correct: answerIndex === q.answerIndex,
    answerIndex: q.answerIndex, // the correct option, for instant feedback
    score,
    answered: Math.min(answeredCount, questions.length),
    total: questions.length,
    done,
  });
});

/** Read adapter for Home: today's Daily 15 result for one student. */
export async function dailyResultFor(email, date) {
  const bank = await readBank();
  if (bank.length === 0) return { total: DAILY_TOTAL, score: 0, answered: 0, done: false };
  const { byId, questions } = buildDaily(email, date, bank);
  const state = await getAttempts();
  const day = state[email]?.[date] || {};
  let answered = 0;
  for (const qid of Object.keys(byId)) {
    if (day[qid] !== undefined) answered++;
  }
  return {
    total: questions.length,
    score: dayScore(day, byId),
    answered,
    done: questions.length > 0 && answered >= questions.length,
  };
}

// Sidebar badge data: { score, total, done } for today, per student.
// (reviewsDue on the sidebar belongs to Skills — not this route.)
router.get('/daily15/summary', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const bank = await readBank();
  const date = todayISO();
  if (bank.length === 0) {
    return res.json({ ok: true, date, total: DAILY_TOTAL, score: 0, done: false });
  }
  const { byId, questions } = buildDaily(session.email, date, bank);
  const state = await getAttempts();
  const day = state[session.email]?.[date] || {};
  let answered = 0;
  for (const qid of Object.keys(byId)) {
    if (day[qid] !== undefined) answered++;
  }
  res.json({
    ok: true,
    date,
    total: questions.length,
    score: dayScore(day, byId),
    answered,
    done: questions.length > 0 && answered >= questions.length,
  });
});

export default router;
