import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

// Skill tree + Mistake replay (the Practice tier's backend half).
//
// Storage (backend/data/syllabus.json):
//   { "tree": [ { id, name, summary, skills: [{ id, name, detail }] } ],
//     "students": { [email]: { done: [skillId], replayed: [qid], updatedAt } } }
// — per-student state never leaks across emails; two students can never see
// each other's progress or replay log.
//
// Read-only dependencies owned by the Practice feature (defensively handled:
// a missing/empty file yields empty reviews, never a crash):
//   attempts.json            { [email]: { [date]: { [qid]: chosenIndex } } }
//   practice-questions.json  { "questions": [{ qid, topic, question, options, answerIndex }] }
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const SKILL_FILE = DATA_DIR + 'syllabus.json';
const ATTEMPTS_FILE = DATA_DIR + 'attempts.json'; // read only — never written here
const QUESTIONS_FILE = DATA_DIR + 'practice-questions.json'; // read only

const REPLAY_CAP = 1000; // per-student replay log ceiling (pre-beta guard)

async function readJson(file) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return null; // missing or corrupt file = honest empty state, never a 500
  }
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

// ---------- shared per-student state helpers ----------

function studentDoc(raw, email) {
  const students = raw && typeof raw.students === 'object' && raw.students ? raw.students : {};
  const mine = students[email] && typeof students[email] === 'object' ? students[email] : {};
  return {
    done: Array.isArray(mine.done) ? mine.done.map(String) : [],
    replayed: Array.isArray(mine.replayed) ? mine.replayed.map(String) : [],
  };
}

async function persistStudent(email, entry) {
  const doc = (await readJson(SKILL_FILE)) || {};
  doc.tree = Array.isArray(doc.tree) ? doc.tree : [];
  doc.students = doc.students && typeof doc.students === 'object' ? doc.students : {};
  doc.students[email] = {
    done: entry.done,
    replayed: entry.replayed,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(SKILL_FILE, JSON.stringify(doc, null, 2));
}

// ---------- skill tree ----------

// Valid domains/skills only (corrupt seeds degrade to an empty tree).
function syllabusTree(doc) {
  const raw = doc && Array.isArray(doc.tree) ? doc.tree : [];
  return raw.filter((d) => d && typeof d === 'object' && d.id && Array.isArray(d.skills));
}

function skillLocation(tree, skillId) {
  for (const domain of tree) {
    const index = domain.skills.findIndex((s) => s && s.id === skillId);
    if (index !== -1) {
      return { domain, skill: domain.skills[index], index };
    }
  }
  return null;
}

// Tree payload with per-skill status. Unlock rule (deterministic, sequential
// within a domain): a skill is 'ready' when the previous skill in its domain
// is done; everything before that stays 'locked'. Progress % derives only
// from the student's recorded completions.
function treePayload(tree, doneList) {
  const done = new Set(doneList.map(String));
  const domains = [];
  let doneCount = 0;
  let totalSkills = 0;
  for (const domain of tree) {
    const skills = [];
    let domainDone = 0;
    let prevDone = true;
    let prevName = null;
    for (const skill of domain.skills) {
      if (!skill || !skill.id) continue;
      const isDone = done.has(skill.id);
      const status = isDone ? 'done' : prevDone ? 'ready' : 'locked';
      skills.push({
        id: skill.id,
        name: skill.name || skill.id,
        detail: skill.detail || '',
        status,
        ...(status === 'locked' && prevName ? { lockedBy: prevName } : {}),
      });
      if (isDone) domainDone += 1;
      prevDone = isDone;
      prevName = skill.name || skill.id;
      totalSkills += 1;
    }
    doneCount += domainDone;
    domains.push({
      id: domain.id,
      name: domain.name || domain.id,
      summary: domain.summary || '',
      total: skills.length,
      done: domainDone,
      pct: skills.length ? Math.round((domainDone / skills.length) * 100) : 0,
      skills,
    });
  }
  return {
    domains,
    totalSkills,
    doneCount,
    overallPct: totalSkills ? Math.round((doneCount / totalSkills) * 100) : 0,
  };
}

router.get('/health', (req, res) => res.json({ ok: true, feature: 'skills' }));

router.get('/tree', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const doc = await readJson(SKILL_FILE);
  const tree = syllabusTree(doc);
  const student = studentDoc(doc, session.email);
  res.json({ ok: true, ...treePayload(tree, student.done) });
});

// Toggle one sub-skill's completion for THIS student. Locked skills are
// rejected server-side, so a stale client can never skip the sequence.
router.post('/toggle', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const skillId = String(req.body?.skillId || '').trim();
  if (!skillId) {
    return res.status(400).json({ error: 'Missing skillId.' });
  }
  const doc = await readJson(SKILL_FILE);
  const tree = syllabusTree(doc);
  const found = skillLocation(tree, skillId);
  if (!found) {
    return res.status(400).json({ error: 'That skill is not in the syllabus tree.' });
  }
  const preceding = treePayload(tree, studentDoc(doc, session.email).done);
  const current = preceding.domains
    .find((d) => d.id === found.domain.id)
    ?.skills.find((s) => s.id === skillId);
  if (current?.status === 'locked') {
    return res.status(409).json({
      error: `“${current.name}” is locked — finish “${current.lockedBy}” first.`,
    });
  }

  const entry = studentDoc(doc, session.email);
  const has = entry.done.includes(skillId);
  entry.done = has ? entry.done.filter((id) => id !== skillId) : [...entry.done, skillId];

  try {
    await persistStudent(session.email, entry);
  } catch {
    return res.status(500).json({ error: 'Could not save that — check the server logs and retry.' });
  }
  res.json({ ok: true, skillId, done: !has, ...treePayload(tree, entry.done) });
});

// ---------- mistake replay ----------

// Normalize the Practice-owned question bank. Shape fallbacks kept broad on
// purpose: the file is another feature's contract and may be empty mid-sprint.
//
// ID contract: questions that carry an explicit qid/id/_id are keyed by it.
// The current seed ships WITHOUT ids while attempts.json references keys like
// "q7"/"q17", so each id-less question is ALSO registered under the stable
// positional alias `q${index + 1}` (1-based: q1..qN). Explicit ids always win
// over aliases; collisions between two id-less claims never overwrite.
function questionIndex(raw) {
  const list = Array.isArray(raw)
    ? raw
    : raw && Array.isArray(raw.questions)
      ? raw.questions
      : raw && Array.isArray(raw.items)
        ? raw.items
        : [];
  const map = new Map();
  const put = (key, entry) => {
    if (key !== undefined && key !== null && !map.has(String(key))) map.set(String(key), entry);
  };
  const entries = [];
  list.forEach((q, pos) => {
    if (!q || typeof q !== 'object') return;
    entries.push({
      pos,
      explicit: q.qid ?? q.id ?? q._id,
      topic: q.topic || q.subject || 'Practice',
      question: q.question || q.text || q.prompt || '',
      answerIndex: Number(q.answerIndex),
      options: Array.isArray(q.options) ? q.options.map(String) : null,
    });
  });
  // Pass 1: explicit ids. Pass 2: positional aliases — so an explicit id can
  // never be shadowed by an id-less question's alias and vice versa.
  entries.forEach((e) => put(e.explicit, e));
  entries.forEach((e) => {
    if (e.explicit === undefined || e.explicit === null) put(`q${e.pos + 1}`, e);
  });
  return map;
}

// One wrong, judgeable answer per (date, qid). Unknown qids and questions
// without a numeric answerIndex are skipped — we never guess correctness.
// Replayed qids come from the student's OWN persisted replay log, so a due
// flag survives restarts and a second client sees the same queue.
async function collectMistakes(email) {
  const [attempts, questionsRaw, skillDoc] = await Promise.all([
    readJson(ATTEMPTS_FILE),
    readJson(QUESTIONS_FILE),
    readJson(SKILL_FILE),
  ]);
  const student = studentDoc(skillDoc, email);
  const replayed = new Set(student.replayed);
  const questions = questionIndex(questionsRaw);
  const mine = attempts && typeof attempts === 'object' ? attempts[email] : null;
  const items = [];
  if (mine && typeof mine === 'object') {
    const dates = Object.keys(mine).sort().reverse(); // newest day first
    for (const date of dates) {
      const day = mine[date];
      if (!day || typeof day !== 'object') continue;
      for (const qidRaw of Object.keys(day)) {
        const qid = String(qidRaw);
        const q = questions.get(qid);
        if (!q || !Number.isFinite(q.answerIndex)) continue;
        const chosen = Number(day[qidRaw]);
        if (!Number.isFinite(chosen) || chosen === q.answerIndex) continue;
        items.push({
          qid,
          date,
          topic: q.topic,
          question: q.question,
          wrongIndex: chosen,
          answerIndex: q.answerIndex,
          options: q.options,
          due: !replayed.has(qid),
        });
      }
    }
  }
  return { items, student };
}

router.get('/reviews', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const { items } = await collectMistakes(session.email);
  const dueCount = items.filter((i) => i.due).length;
  res.json({ ok: true, items, dueCount, total: items.length });
});

// Mark one mistake replayed — clears it from this student's due queue.
router.post('/replay', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const qid = String(req.body?.qid ?? '').trim();
  if (!qid) {
    return res.status(400).json({ error: 'Missing qid.' });
  }
  // First pass validates against what was actually answered wrong (and was
  // not already replayed-and-cleared); second pass reads the persisted state
  // back so the returned due count is exactly what the next GET will show.
  const before = await collectMistakes(session.email);
  if (!before.items.some((i) => i.qid === qid)) {
    return res.status(400).json({ error: 'No logged mistake for that question.' });
  }
  // (Re-)mark as replayed; a repeat replay moves the qid to the end of the log.
  const student = before.student;
  const replayed = [...student.replayed.filter((q) => q !== qid), qid];
  while (replayed.length > REPLAY_CAP) replayed.shift();

  try {
    await persistStudent(session.email, { done: student.done, replayed });
  } catch {
    return res.status(500).json({ error: 'Could not save that — check the server logs and retry.' });
  }
  const after = await collectMistakes(session.email);
  res.json({ ok: true, qid, dueCount: after.items.filter((i) => i.due).length });
});

export default router;
