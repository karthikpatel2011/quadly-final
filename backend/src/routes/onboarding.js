import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { llmAvailable, llmComplete } from '../lib/llm.js';
import { markOnboarded, resolveSession } from './auth.js';
import {
  INTEREST_OPTIONS, GOAL_OPTIONS, STAGE_OPTIONS, TIME_OPTIONS,
  cleanList, cleanStage, cleanTime,
} from '../lib/personalize.js';
import { ensurePlan } from '../lib/plangenerator.js';

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));

async function readJSON(file, fallback) {
  try {
    return JSON.parse(await readFile(DATA_DIR + file, 'utf8'));
  } catch {
    return fallback;
  }
}

const str = (v, max) => String(v ?? '').trim().slice(0, max) || null;

const router = Router();

// "Check via LLM whether an ambassador is connected to this college."
// Tries an exact match, then name-variant matching, then the LLM (only when a
// key is configured); without an LLM the heuristic still answers.
router.post('/ambassador-lookup', async (req, res) => {
  const college = String(req.body?.college || '').trim();
  if (college.length < 3) {
    return res.status(400).json({ error: 'College name is too short.' });
  }

  const roster = await readJSON('ambassadors.json', { ambassadors: [] });
  const list = roster.ambassadors || [];
  const norm = (s) => String(s).toLowerCase().replace(/[^a-z0-9]/g, '');
  const q = norm(college);

  let ambassador = list.find((a) => norm(a.college) === q) || null;
  let matchedVia = ambassador ? 'exact' : null;

  if (!ambassador) {
    ambassador =
      list.find((a) => norm(a.college).includes(q) || q.includes(norm(a.college))) || null;
    matchedVia = ambassador ? 'fuzzy' : null;
  }

  if (!ambassador && llmAvailable()) {
    const answer = await llmComplete(
      `A student typed this college name: "${college}". ` +
        `Here is the ambassador roster: ${JSON.stringify(list.map(({ id, name, college: c }) => ({ id, name, college: c })))}. ` +
        `If exactly one roster entry is the same college (allow spelling variants and abbreviations), reply with only its id. Otherwise reply with only: none`,
    );
    const id = answer && answer.trim().replace(/"/g, '');
    if (id && id.toLowerCase() !== 'none') {
      ambassador = list.find((a) => a.id === id) || null;
      matchedVia = ambassador ? 'llm' : null;
    }
  }

  res.json({ found: Boolean(ambassador), ambassador, matchedVia });
});

// Public GitHub profile lookup — read-only, no OAuth, no LeetCode-style scoring.
router.get('/github', async (req, res) => {
  const username = String(req.query.username || '').trim();
  if (!/^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i.test(username)) {
    return res.status(400).json({ error: 'That is not a valid GitHub username.' });
  }

  try {
    const r = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { 'User-Agent': 'quadly-onboarding', Accept: 'application/vnd.github+json' },
    });
    if (r.status === 404) {
      return res.status(404).json({ error: 'We could not find that GitHub username.' });
    }
    if (!r.ok) {
      return res.status(502).json({ error: 'GitHub is not responding right now — try again in a moment.' });
    }
    const u = await r.json();
    res.json({
      login: u.login,
      name: u.name,
      avatarUrl: u.avatar_url,
      publicRepos: u.public_repos,
      followers: u.followers,
      bio: u.bio,
    });
  } catch {
    res.status(502).json({ error: 'GitHub is not responding right now — try again in a moment.' });
  }
});

// Save the finished onboarding. When the visitor is a signed-up user
// (email from the join flow), the save also flips their account's
// onboarded flag server-side — that is the "has not completed onboarding
// yet" gate the login flow checks.
router.post('/', async (req, res) => {
  const b = req.body || {};
  const profile = {
    email: str(b.email, 120),
    name: str(b.name, 60),
    college: str(b.college, 120),
    ambassador: b.ambassador?.id
      ? {
          id: str(b.ambassador.id, 40),
          name: str(b.ambassador.name, 80),
          college: str(b.ambassador.college, 120),
          linked: false, // placeholder until ambassador profiles ship
        }
      : null,
    target: { company: str(b.target?.company, 60), role: str(b.target?.role, 60) },
    github: str(b.github, 40),
    avatar: str(b.avatar, 40),
    interests: cleanList(b.interests, new Set(INTEREST_OPTIONS), 6),
    goals: cleanList(b.goals, new Set(GOAL_OPTIONS), 6),
    stage: cleanStage(str(b.stage, 40)),
    timeCommitment: cleanTime(str(b.timeCommitment, 40)),
    note: str(b.note, 300), // free text — clients must warn against secrets
    createdAt: new Date().toISOString(),
  };

  if (!profile.name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  const linked = profile.email
    ? markOnboarded(profile.email, {
        name: profile.name, college: profile.college, target: profile.target,
        github: profile.github, ambassador: profile.ambassador, avatar: profile.avatar,
        interests: profile.interests, goals: profile.goals, stage: profile.stage,
        timeCommitment: profile.timeCommitment, note: profile.note,
      })
    : false;

  const doc = await readJSON('onboarding-profiles.json', []);
  doc.push(profile);
  await writeFile(DATA_DIR + 'onboarding-profiles.json', JSON.stringify(doc, null, 2));

  // The onboarding delivers the student's real 90-day plan: generated from
  // their role/company/ambassador, persisted per student, served on /app.
  const plan = linked ? ensurePlan(profile.email, profile, new Date().toISOString().slice(0, 10)) : null;
  const planPreview = plan
    ? {
        startedAt: plan.startedAt,
        totalDays: plan.totalDays,
        week1Theme: plan.days[0].theme,
        firstTasks: plan.days[0].tasks.map((t) => t.title),
      }
    : null;

  res.status(201).json({ ok: true, savedAt: profile.createdAt, accountLinked: linked, plan: planPreview });
});


// Edit the signed-in student's profile (Settings). Only provided fields are
// merged; lists are validated against the same option sets as onboarding.
router.put('/', (req, res) => {
  const header = req.get('authorization') || '';
  const session = resolveSession(header.startsWith('Bearer ') ? header.slice(7) : '');
  if (!session) {
    return res.status(401).json({ error: 'Not signed in.' });
  }
  if (!session.account.onboarded) {
    return res.status(409).json({ error: 'Finish onboarding first — Settings edits your saved answers.' });
  }
  const b = req.body || {};
  const profile = { ...(session.account.profile || {}) };

  if (b.name !== undefined) {
    const name = str(b.name, 60);
    if (!name) return res.status(400).json({ error: 'Name cannot be empty.' });
    profile.name = name;
  }
  if (b.college !== undefined) profile.college = str(b.college, 120);
  if (b.target !== undefined) {
    profile.target = {
      company: str(b.target?.company, 60) || '',
      role: str(b.target?.role, 60) || '',
    };
  }
  if (b.github !== undefined) profile.github = str(b.github, 40);
  if (b.interests !== undefined) profile.interests = cleanList(b.interests, new Set(INTEREST_OPTIONS), 6);
  if (b.goals !== undefined) profile.goals = cleanList(b.goals, new Set(GOAL_OPTIONS), 6);
  if (b.stage !== undefined) profile.stage = cleanStage(str(b.stage, 40), profile.stage || 'Exploring');
  if (b.timeCommitment !== undefined) profile.timeCommitment = cleanTime(str(b.timeCommitment, 40), profile.timeCommitment || '30 minutes a day');
  if (b.note !== undefined) profile.note = str(b.note, 300);
  if (b.aiPersonalization !== undefined) profile.aiPersonalization = b.aiPersonalization === true;

  profile.updatedAt = new Date().toISOString();
  markOnboarded(session.email, profile);

  // The saved answers changed → the personalization cache refreshes on next read.
  res.json({ ok: true, profile });
});

export default router;
