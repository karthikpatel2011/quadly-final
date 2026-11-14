import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

// Skill tree — the syllabus-shaped practice map the student paces through.
//
// Storage (backend/data/syllabus.json):
//   { "tree": [ { id, name, summary, skills: [{ id, name, detail }] } ],
//     "students": { [email]: { done: [skillId], updatedAt } } }
// — per-student state never leaks across emails; two students can never see
// each other's progress.

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const SKILL_FILE = DATA_DIR + 'syllabus.json';

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
  };
}

async function persistStudent(email, entry) {
  const doc = (await readJson(SKILL_FILE)) || {};
  doc.tree = Array.isArray(doc.tree) ? doc.tree : [];
  doc.students = doc.students && typeof doc.students === 'object' ? doc.students : {};
  doc.students[email] = {
    done: entry.done,
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

export default router;
