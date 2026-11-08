import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { resolveSession } from './auth.js';
import { markTodayMission } from './dashboard.js';

// Projects — the student's resume-ready build tracker with the deterministic
// "Project Doctor" review (a fixed checklist, no AI). Per-student state lives
// under the student's email inside backend/data/projects.json, matching the
// dashboard-tier persistence pattern: in-memory accounts die on restart (see
// auth.js), but saved builds survive it.
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const PROJECTS_FILE = DATA_DIR + 'projects.json';

const NAME_MIN = 3;
const NAME_MAX = 80;
const BLURB_MIN = 80; // doctor bar — not a save gate
const BLURB_MAX = 600; // hard save cap
const STACK_ITEM_MAX = 12;
const PROJECT_CAP = 50;

// github.com/<user>/<repo> — exactly one repo (optional .git / trailing
// slash), not a profile, org, or a deep link into it. Everything runs
// server-side on the student's own text only.
const GITHUB_REPO_RE =
  /^https?:\/\/(?:www\.)?github\.com\/[A-Za-z0-9][A-Za-z0-9-]*\/[A-Za-z0-9._-]+(?:\.git)?\/?$/i;
// The doctor's "result/metric" bar: any number in the blurb stands in for a
// concrete outcome (users, latency, accuracy, stars…).
const METRIC_RE = /\d+/;

async function readAll() {
  try {
    const parsed = JSON.parse(await readFile(PROJECTS_FILE, 'utf8'));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

async function writeAll(db) {
  await writeFile(PROJECTS_FILE, JSON.stringify(db, null, 2));
}

function ownList(db, email) {
  const list = db[email];
  return Array.isArray(list) ? list : [];
}

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

// Accepts an array or a comma-separated string; trims, drops empties and
// duplicates (case-insensitive), caps the list.
function sanitizeStack(input) {
  const raw = Array.isArray(input) ? input : String(input || '').split(',');
  const seen = new Set();
  const out = [];
  for (const item of raw) {
    const t = String(item || '').trim().slice(0, 32);
    const key = t.toLowerCase();
    if (!t || seen.has(key)) continue;
    seen.add(key);
    out.push(t);
    if (out.length >= STACK_ITEM_MAX) break;
  }
  return out;
}

// Trimmed URL that always carries a scheme; '' when the field is empty.
function sanitizeLink(raw) {
  let v = String(raw || '').trim();
  if (!v) return '';
  if (!/^https?:\/\//i.test(v)) v = 'https://' + v;
  return v;
}

function isHttpUrl(v) {
  try {
    const u = new URL(v);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
}

// The deterministic Project Doctor. The spec scores the build out of 5, with
// the repo conditions ("has repo link", "repoUrl looks like
// github.com/<user>/<repo>") merged into one item: plain presence is already
// the save gate, so the doctor's repo item passes only for a proper
// github.com/<user>/<repo> URL — and its failed hint says which half broke.
function doctorFor(project) {
  const blurb = String(project.blurb || '');
  const repo = String(project.repoUrl || '');
  const demo = String(project.liveUrl || '');
  const stack = Array.isArray(project.stack) ? project.stack : [];

  const items = [
    {
      key: 'repo',
      label: 'GitHub repo link (github.com/<user>/<repo>)',
      pass: GITHUB_REPO_RE.test(repo),
      hint: repo
        ? 'Point the repo link at a public, cloneable github.com/<user>/<repo> — not a profile page, deep link, or another host.'
        : 'Attach the GitHub repo — github.com/<user>/<repo> is the proof a recruiter can open.',
    },
    {
      key: 'demo',
      label: 'Live demo link attached',
      pass: Boolean(demo),
      hint: 'Add the deployed URL — a build a hiring manager can open beats source code alone.',
    },
    {
      key: 'blurb-length',
      label: 'Blurb is at least 80 characters',
      pass: blurb.length >= BLURB_MIN,
      hint: `Say what it does, your part, and the outcome — ${blurb.length}/80 characters so far.`,
    },
    {
      key: 'blurb-metric',
      label: 'Blurb mentions a result or metric',
      pass: METRIC_RE.test(blurb),
      hint: 'Add one concrete number — users, requests/sec, accuracy %, downloads, stars.',
    },
    {
      key: 'stack',
      label: 'Stack names at least 2 technologies',
      pass: stack.length >= 2,
      hint: 'List the technologies you actually used — at least two, comma-separated.',
    },
  ];

  const score = items.filter((i) => i.pass).length;
  return { score, total: items.length, items };
}

const router = Router();

// GET /api/projects — this student's builds, newest first, each with its
// deterministic doctor report. Never another student's list.
router.get('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const db = await readAll();
  const projects = ownList(db, session.email)
    .slice()
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')))
    .map((p) => ({ ...p, doctor: doctorFor(p) }));

  res.json({ ok: true, email: session.email, projects });
});

// POST /api/projects — add a build. Save gates: name ≥ 3 chars, and at least
// one of repoUrl / liveUrl. The doctor's stricter bars are review-only, so
// students can save a draft and improve the score from the checklist.
router.post('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const name = String(req.body?.name || '').trim();
  const blurb = String(req.body?.blurb || '').trim();
  const stack = sanitizeStack(req.body?.stack);
  const repoUrl = sanitizeLink(req.body?.repoUrl);
  const liveUrl = sanitizeLink(req.body?.liveUrl);

  const fail = (error, field) => res.status(400).json({ error, field });

  if (name.length < NAME_MIN) {
    return fail(`Project name needs at least ${NAME_MIN} characters.`, 'name');
  }
  if (name.length > NAME_MAX) {
    return fail(`Project names are capped at ${NAME_MAX} characters.`, 'name');
  }
  if (!repoUrl && !liveUrl) {
    return fail('Add a repo link or a live demo link — a build without proof is just a claim.', 'links');
  }
  if (repoUrl && !isHttpUrl(repoUrl)) {
    return fail('That repo link does not look like a URL — e.g. https://github.com/you/your-repo', 'repoUrl');
  }
  if (liveUrl && !isHttpUrl(liveUrl)) {
    return fail('That demo link does not look like a URL — e.g. https://your-build.example.com', 'liveUrl');
  }
  if (blurb.length > BLURB_MAX) {
    return fail(`Blurbs are capped at ${BLURB_MAX} characters — keep the pitch tight.`, 'blurb');
  }

  const db = await readAll();
  const list = ownList(db, session.email);
  if (list.length >= PROJECT_CAP) {
    return res.status(400).json({
      error: `You are tracking ${PROJECT_CAP} builds already — delete one before adding another.`,
    });
  }

  const project = {
    id: 'p_' + randomUUID(),
    name,
    blurb,
    stack,
    repoUrl,
    liveUrl,
    createdAt: new Date().toISOString(),
  };
  db[session.email] = [...list, project];
  await writeAll(db);

    // A saved project (with its doctor score) is a verified ship rep.
  markTodayMission(session, 'ship', `Project saved — doctor ${doctorFor(project).score}/${doctorFor(project).total}`);
res.status(201).json({ ok: true, email: session.email, project: { ...project, doctor: doctorFor(project) } });
});

// DELETE /api/projects/:id — remove one of THIS student's builds by id.
router.delete('/:id', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;

  const id = String(req.params.id || '');
  const db = await readAll();
  const list = ownList(db, session.email);
  const next = list.filter((p) => p.id !== id);
  if (next.length === list.length) {
    return res.status(404).json({ error: 'That project is not on your board anymore.' });
  }

  if (next.length === 0) delete db[session.email];
  else db[session.email] = next;
  await writeAll(db);

  res.json({ ok: true, email: session.email, removed: id });
});

export default router;
