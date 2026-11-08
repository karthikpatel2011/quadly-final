import { Router } from 'express';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';
import { markTodayMission } from './dashboard.js';
import { istDayKey } from '../lib/streaks.js';

// Daily Practice (PRD §6) — one set a day: three new activities plus one
// review item, about 15 minutes. Every activity is auto-graded by code:
// answer-key MCQs (Fix the Bug, Predict the Output, Read the Error,
// Catch the AI) and a result-checked SQL task (Write the Query) that runs on
// a throwaway in-memory SQLite built from the activity's own schema.
// Rules implemented here: three hint levels served one at a time, first try
// is the recorded score (retries give feedback only), difficulty rises after
// two good days and falls after two weak ones, and missed concepts return
// after 1, 3, and 7 days.

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const BANK_FILE = DATA_DIR + 'practice-activities.json';
const STATE_FILE = DATA_DIR + 'daily-practice-state.json';

const SET_NEW = 3;
const SET_REVIEW = 1;
const SET_TOTAL = SET_NEW + SET_REVIEW;
const GOOD_DAY = 0.75; // ≥ 3/4 first-try correct
const WEAK_DAY = 0.5;  // ≤ 2/4
const REVIEW_GAPS = [1, 3, 7];
const LEVEL_BY_RATING = {
  'Just starting': 1,
  'Know the basics': 1,
  'Can build small things': 2,
  'Nearly job-ready': 2,
};
const MAX_RUN_ROWS = 50;

const MCQ_TYPES = new Set(['predict-output', 'fix-the-bug', 'read-the-error', 'catch-the-ai']);
const TYPES = new Set([...MCQ_TYPES, 'write-query']);

async function readBank() {
  try {
    const doc = JSON.parse(await readFile(BANK_FILE, 'utf8'));
    const list = Array.isArray(doc?.activities) ? doc.activities : [];
    return list.filter((a) => {
      if (!TYPES.has(a.type) || typeof a.id !== 'string' || !a.id
        || typeof a.concept !== 'string' || !a.concept
        || !Number.isInteger(a.difficulty) || a.difficulty < 1 || a.difficulty > 3
        || typeof a.situation !== 'string' || typeof a.question !== 'string'
        || typeof a.explanation !== 'string' || typeof a.takeaway !== 'string'
        || !Array.isArray(a.hints) || a.hints.length !== 3) return false;
      if (MCQ_TYPES.has(a.type)) {
        return Array.isArray(a.options) && a.options.length === 4
          && a.options.every((o) => typeof o === 'string' && o.length > 0)
          && Number.isInteger(a.answerIndex) && a.answerIndex >= 0 && a.answerIndex <= 3;
      }
      const tables = a.schema?.tables;
      return Array.isArray(tables) && tables.length > 0
        && tables.every((t) => typeof t.name === 'string' && Array.isArray(t.columns)
          && t.columns.length > 0 && Array.isArray(t.rows))
        && Array.isArray(a.expected?.rows);
    });
  } catch {
    return [];
  }
}

// One in-process cache; every mutation lands on the same object so parallel
// requests can never drop each other's writes (same pattern as practice.js).
let stateCache = null;
let stateLoad = null;

function loadStateOnce() {
  if (stateLoad) return stateLoad;
  stateLoad = readFile(STATE_FILE, 'utf8')
    .then((raw) => JSON.parse(raw))
    .then((doc) => {
      stateCache = doc && typeof doc === 'object' && !Array.isArray(doc) ? doc : {};
    })
    .catch(() => {
      stateCache = {};
    })
    .then(() => stateCache);
  return stateLoad;
}

async function getState() {
  if (stateCache) return stateCache;
  return loadStateOnce();
}

async function persistState(state) {
  const tmp = `${STATE_FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(state, null, 2));
  await rename(tmp, STATE_FILE);
}

const router = Router();

function requireUser(req, res) {
  const header = req.get('authorization') || '';
  const session = resolveSession(header.startsWith('Bearer ') ? header.slice(7) : '');
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  return session;
}

function hash(strVal) {
  let h = 2166136261;
  for (let i = 0; i < strVal.length; i++) {
    h ^= strVal.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const seededShuffle = (list, seed) => list
  .map((v, i) => ({ v, r: hash(String(seed + i * 7919)) % 10007 }))
  .sort((a, b) => a.r - b.r)
  .map((x) => x.v);

const dayDiff = (fromKey, toKey) => Math.round(
  (Date.parse(toKey + 'T00:00:00Z') - Date.parse(fromKey + 'T00:00:00Z')) / 86400000,
);

// Level is derived, never stored: the last two completed days speak. The
// student's onboarding self-rating seeds the starting level.
function deriveLevel(student, profile) {
  const completed = Object.entries(student?.history || {})
    .filter(([, h]) => h && h.done)
    .sort(([a], [b]) => (a < b ? 1 : -1)); // newest first
  let level = LEVEL_BY_RATING[profile?.selfRating] ?? 1;
  if (completed.length >= 2) {
    const [, h1] = completed[0];
    const [, h2] = completed[1];
    const r1 = h1.score / Math.max(1, h1.total);
    const r2 = h2.score / Math.max(1, h2.total);
    if (r1 >= GOOD_DAY && r2 >= GOOD_DAY) level += 1;
    else if (r1 <= WEAK_DAY && r2 <= WEAK_DAY) level -= 1;
  }
  return Math.min(3, Math.max(1, level));
}

// The review slot: the most overdue missed concept (1, 3, or 7 days out).
function pickReview(student, level, bank, excludeIds) {
  const today = istDayKey();
  const misses = student?.conceptMiss || {};
  let best = null;
  for (const [concept, miss] of Object.entries(misses)) {
    const diff = dayDiff(miss.date, today);
    if (!REVIEW_GAPS.includes(diff)) continue;
    if (!best || diff < best.diff) best = { concept, diff, activityId: miss.activityId };
  }
  if (!best) return null;
  const candidates = bank.filter((a) => a.concept === best.concept && !excludeIds.has(a.id));
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => Math.abs(a.difficulty - level) - Math.abs(b.difficulty - level));
  return candidates[0];
}

function buildSet(email, profile, bank, student, level) {
  const seed = hash(`${email}::${istDayKey()}::daily-practice`);
  const excludeIds = new Set();
  const usedConcepts = new Set();

  const review = pickReview(student, level, bank, excludeIds) ?? null;
  if (review) {
    excludeIds.add(review.id);
    usedConcepts.add(review.concept);
  } else {
    // No concept is due yet (first days on a path): the review slot opens up
    // as a fourth fresh activity. The queue takes over as soon as misses
    // start aging into their 1/3/7-day windows.
  }

  // Recently mastered activities go to the back of the line — previous days
  // only; today's own answers must never reshape today's set.
  const recentGood = new Set();
  const days = Object.keys(student?.done || {}).sort().filter((d) => d !== istDayKey()).slice(-4);
  for (const d of days) {
    for (const [id, rec] of Object.entries(student.done[d] || {})) {
      if (rec.correct) recentGood.add(id);
    }
  }

  const byTrack = bank.filter((a) => a.track === 'general'
    || profile?.track === 'Not sure'
    || (profile?.track && a.track === profile.track));

  let pool = byTrack.filter((a) => a.difficulty === level
    && !excludeIds.has(a.id) && !usedConcepts.has(a.concept));
  let relaxed = false;
  if (pool.length < SET_NEW) {
    relaxed = true;
    pool = byTrack.filter((a) => Math.abs(a.difficulty - level) <= 1
      && !excludeIds.has(a.id) && !usedConcepts.has(a.concept));
  }
  // Prefer activities not recently mastered; reshuffle if that bought enough.
  const fresh = seededShuffle(pool.filter((a) => !recentGood.has(a.id)), seed);
  const filler = seededShuffle(
    pool.filter((a) => recentGood.has(a.id)),
    seed + 1,
  );
  let picks = [...fresh, ...filler].slice(0, SET_NEW + (review ? 0 : 1));
  if (picks.length < SET_NEW) {
    // Last resort: anything track-eligible regardless of difficulty/concept,
    // so the student always has a full set.
    picks = seededShuffle(
      byTrack.filter((a) => !excludeIds.has(a.id) && !picks.includes(a)),
      seed + 2,
    ).slice(0, SET_NEW + (review ? 0 : 1) - picks.length).concat(picks).slice(0, SET_NEW + (review ? 0 : 1));
  }
  for (const a of picks) {
    excludeIds.add(a.id);
    usedConcepts.add(a.concept);
  }
  return { newActivities: picks, review, relaxed };
}

// SQL sandbox — single read-only statement, throwaway in-memory database.
function sanitizeSql(sql) {
  const text = String(sql || '').trim();
  if (!text) return { error: 'Type a query first.' };
  if (!/^(select|with)\b/i.test(text)) {
    return { error: 'Only SELECT (or WITH … SELECT) statements run here.' };
  }
  const stripped = text.replace(/;+\s*$/, '');
  if (/;/.test(stripped)) {
    return { error: 'One statement at a time — remove the extra semicolons.' };
  }
  if (/\b(insert|update|delete|drop|alter|create|attach|detach|pragma|vacuum|replace)\b/i.test(stripped)) {
    return { error: 'This sandbox reads only — no writes, catalog or pragma statements.' };
  }
  return { sql: stripped + ';' };
}

function buildDb(schema) {
  const db = new DatabaseSync(':memory:');
  for (const t of schema.tables) {
    // Column types are inferred from the authored rows: numbers keep their
    // numeric behaviour in comparisons, aggregates, and ORDER BY.
    const defs = t.columns.map((c, i) => {
      const sample = (t.rows[0] || [])[i];
      const type = typeof sample === 'number' ? (Number.isInteger(sample) ? 'INTEGER' : 'REAL') : 'TEXT';
      return `"${String(c).replace(/"/g, '""')}" ${type}`;
    }).join(', ');
    db.exec(`CREATE TABLE "${t.name}" (${defs});`);
    const placeholders = t.columns.map(() => '?').join(', ');
    const ins = db.prepare(`INSERT INTO "${t.name}" VALUES (${placeholders})`);
    for (const row of t.rows) ins.run(...row);
  }
  return db;
}

function runSelect(item, sql) {
  const guard = sanitizeSql(sql);
  if (guard.error) return { error: guard.error };
  let db;
  try {
    db = buildDb(item.schema);
    const cursor = db.prepare(guard.sql);
    const rows = cursor.all();
    const columns = rows.length > 0 ? Object.keys(rows[0]) : item.expected?.columns || [];
    return { columns, rows: rows.slice(0, MAX_RUN_ROWS).map((r) => columns.map((c) => r[c])) };
  } catch (err) {
    return { error: String(err.message || 'The query could not run.').slice(0, 200) };
  } finally {
    try { db?.close(); } catch { /* already closed */ }
  }
}

// Result matrices compare value-by-value with type-forgiving text ('3' = 3):
// the student's job is the query, not SQLite's client-side typing.
const normRows = (rows) => JSON.stringify((rows || []).map((r) => r.map((v) => String(v))));
const rowsEqual = (a, b) => normRows(a) === normRows(b);

function sanitizeItem(item) {
  const view = {
    id: item.id,
    type: item.type,
    track: item.track,
    concept: item.concept,
    difficulty: item.difficulty,
    minutes: item.minutes ?? 3,
    situation: item.situation,
    language: item.language ?? 'text',
    code: item.code ?? '',
    question: item.question,
  };
  if (MCQ_TYPES.has(item.type)) view.options = item.options;
  if (item.type === 'write-query') {
    view.schema = item.schema;
    view.expectedColumns = item.expected?.columns ?? [];
  }
  return view;
}

function studentFor(state, email) {
  state[email] = state[email] || { history: {}, done: {}, conceptMiss: {}, sets: {} };
  const s = state[email];
  s.history = s.history || {};
  s.done = s.done || {};
  s.conceptMiss = s.conceptMiss || {};
  s.sets = s.sets || {};
  return s;
}

/** The day's set is frozen when first issued: whatever else changes in the
 *  student's state today, GET /daily keeps serving exactly these ids. */
function issuedSet(s, dayKey) {
  const issued = s.sets[dayKey];
  return issued && Array.isArray(issued.ids) ? issued : null;
}

function todayRecord(s, dayKey) {
  s.done[dayKey] = s.done[dayKey] || {};
  return s.done[dayKey];
}

function scoreToday(s, dayKey, bankById) {
  const rec = s.done[dayKey] || {};
  let score = 0;
  let answered = 0;
  for (const [id, r] of Object.entries(rec)) {
    if (bankById.has(id)) {
      answered += 1;
      if (r.correct) score += 1;
    }
  }
  return { score, answered };
}

// Fresh bank + index per read: the bank is a hand-edited document, so answer
// positions must never be served from a stale cache.
async function bankById() {
  const bank = await readBank();
  return { bank, byId: new Map(bank.map((a) => [a.id, a])) };
}

router.get('/health', (req, res) => res.json({ ok: true, feature: 'daily-practice' }));

// Today's set: deterministic for (student, day), adaptive difficulty, with
// the review slot filled by the most overdue missed concept when one is due.
router.get('/daily', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const { bank, byId } = await bankById();
  if (bank.length === 0) {
    return res.status(503).json({
      error: 'The activity bank is unavailable right now — Daily Practice has nothing to serve. Try again later.',
    });
  }
  const state = await getState();
  const s = studentFor(state, session.email);
  const dayKey = istDayKey();
  const profile = session.account.profile || {};
  const level = deriveLevel(s, profile);

  // Serve the frozen set when one exists; otherwise build once and freeze.
  let ids;
  let reviewId = null;
  let relaxed = false;
  const issued = issuedSet(s, dayKey);
  if (issued) {
    ids = issued.ids.filter((id) => byId.has(id));
    reviewId = issued.reviewId && ids.includes(issued.reviewId) ? issued.reviewId : null;
    relaxed = Boolean(issued.relaxed);
  } else {
    const built = buildSet(session.email, profile, bank, s, level);
    ids = [...built.newActivities.map((a) => a.id), ...(built.review ? [built.review.id] : [])];
    reviewId = built.review?.id ?? null;
    relaxed = built.relaxed;
    s.sets[dayKey] = { ids, reviewId, relaxed, level, at: new Date().toISOString() };
    const setKeys = Object.keys(s.sets).sort();
    while (setKeys.length > 35) delete s.sets[setKeys.shift()];
    try { await persistState(state); } catch { /* cache holds it */ }
  }

  const items = ids.map((id) => byId.get(id)).filter(Boolean);
  const { score, answered } = scoreToday(s, dayKey, byId);
  const done = items.length > 0 && items.every((a) => s.done[dayKey]?.[a.id]);

  res.json({
    ok: true,
    date: dayKey,
    minutes: 15,
    level: issued?.level ?? level,
    relaxed,
    total: items.length,
    items: items.map(sanitizeItem).map((v) => {
      const rec = s.done[dayKey]?.[v.id];
      return rec ? { ...v, answered: { correct: rec.correct, firstTry: rec.firstTry } } : v;
    }),
    reviewConcept: reviewId ? byId.get(reviewId)?.concept ?? null : null,
    score,
    answered,
    done,
  });
});

// One hint level at a time — POST, so the client can never enumerate all
// three in the page source, and usage is recorded server-side.
router.post('/daily/hint', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const bank = await readBank();
  const byId = new Map(bank.map((a) => [a.id, a]));
  const item = byId.get(String(req.body?.id || ''));
  if (!item) return res.status(404).json({ error: 'That activity is not in the bank.' });

  const state = await getState();
  const s = studentFor(state, session.email);
  const dayKey = istDayKey();
  s.hints = s.hints || {};
  s.hints[dayKey] = s.hints[dayKey] || {};
  const shown = Math.min(3, Math.max(1, Number(req.body?.level) || 1));
  s.hints[dayKey][item.id] = Math.max(s.hints[dayKey][item.id] || 0, shown);
  await persistState(state).catch(() => {});

  res.json({ ok: true, level: shown, hint: item.hints[shown - 1] });
});

// Free sandbox for Write the Query: runs the student's SELECT against the
// activity's schema and returns the rows. Never graded, unlimited.
router.post('/daily/run', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const bank = await readBank();
  const byId = new Map(bank.map((a) => [a.id, a]));
  const item = byId.get(String(req.body?.id || ''));
  if (!item || item.type !== 'write-query') {
    return res.status(404).json({ error: 'No query sandbox for that activity.' });
  }
  const result = runSelect(item, req.body?.sql);
  if (result.error) return res.status(400).json({ ok: false, error: result.error });
  res.json({ ok: true, columns: result.columns, rows: result.rows });
});

// The graded answer. The first recorded attempt IS the score; retries return
// the same feedback contract but never overwrite the record.
router.post('/daily/answer', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const { bank, byId } = await bankById();
  if (bank.length === 0) {
    return res.status(503).json({ error: 'The activity bank is unavailable right now.' });
  }
  const state = await getState();
  const s = studentFor(state, session.email);
  const dayKey = istDayKey();

  // The item must belong to the set frozen for today — a stale or spoofed
  // client can never grade, or finish the day with, anything else.
  const frozen = issuedSet(s, dayKey);
  const todayIds = frozen
    ? frozen.ids.filter((id) => byId.has(id))
    : (() => {
        const profile = session.account.profile || {};
        const level = deriveLevel(s, profile);
        const served = buildSet(session.email, profile, bank, s, level);
        return [...served.newActivities.map((a) => a.id), ...(served.review ? [served.review.id] : [])];
      })();
  const item = byId.get(String(req.body?.id || ''));
  if (!item) return res.status(404).json({ error: 'That activity is not in the bank.' });
  if (!todayIds.includes(item.id)) {
    return res.status(400).json({ error: 'That activity is not part of today’s set.' });
  }

  const rec = todayRecord(s, dayKey);
  const alreadyRecording = rec[item.id] !== undefined;

  let grading;
  if (MCQ_TYPES.has(item.type)) {
    const choice = req.body?.choice;
    if (!Number.isInteger(choice) || choice < 0 || choice > 3) {
      return res.status(400).json({ error: 'Pick one of the four options.' });
    }
    const correct = choice === item.answerIndex;
    grading = {
      correct,
      answerIndex: item.answerIndex,
      explanation: item.explanation,
      optionNotes: item.optionNotes ?? null,
      chosenNote: correct ? null : (item.optionNotes?.[choice] ?? null),
      takeaway: item.takeaway,
    };
  } else if (item.type === 'write-query') {
    const result = runSelect(item, req.body?.sql);
    if (result.error) {
      return res.status(400).json({ ok: false, error: result.error });
    }
    const correct = rowsEqual(result.rows, item.expected?.rows ?? []);
    grading = {
      correct,
      yourColumns: result.columns,
      yourRows: result.rows,
      expectedColumns: item.expected?.columns ?? [],
      expectedRows: item.expected?.rows ?? [],
      explanation: item.explanation,
      takeaway: item.takeaway,
    };
  } else {
    return res.status(400).json({ error: 'Unknown activity type.' });
  }

  if (!alreadyRecording) {
    rec[item.id] = {
      correct: grading.correct,
      firstTry: true,
      choice: MCQ_TYPES.has(item.type) ? req.body.choice : null,
      sql: item.type === 'write-query' ? String(req.body?.sql || '').slice(0, 2000) : null,
      hintsUsed: s.hints?.[dayKey]?.[item.id] ?? 0,
      at: new Date().toISOString(),
    };
    if (!grading.correct) {
      s.conceptMiss[item.concept] = { date: dayKey, activityId: item.id };
    }
    const { score, answered } = scoreToday(s, dayKey, byId);
    const allAnswered = todayIds.length > 0 && todayIds.every((id2) => rec[id2]);
    if (allAnswered && !s.history[dayKey]?.done) {
      s.history[dayKey] = { total: todayIds.length, score, done: true, at: rec[item.id].at };
      markTodayMission(session, 'learn', `Score ${score}/${todayIds.length}`);
    }
    try {
      await persistState(state);
    } catch {
      /* cache keeps the truth; the file catches up next write */
    }
  }

  const { score, answered } = scoreToday(s, dayKey, byId);
  res.json({
    ok: true,
    ...grading,
    firstTryRecorded: !alreadyRecording,
    correct: alreadyRecording ? rec[item.id].correct : grading.correct,
    score,
    answered,
    total: todayIds.length,
    done: todayIds.length > 0 && todayIds.every((id2) => rec[id2]),
  });
});

// Badge/summary read for the shell.
router.get('/daily/summary', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const { bank, byId } = await bankById();
  const state = await getState();
  const s = studentFor(state, session.email);
  const dayKey = istDayKey();
  const { score, answered } = scoreToday(s, dayKey, byId);
  res.json({
    ok: true,
    date: dayKey,
    total: Math.min(SET_TOTAL, bank.length),
    answered,
    score,
    done: bank.length > 0 && answered >= Math.min(SET_TOTAL, bank.length),
    level: deriveLevel(s, session.account.profile || {}),
  });
});

// Pure selection/leveling rules, exported for the engine's tests.
export { buildSet, deriveLevel, pickReview };

export default router;
