import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { markOnboarded, resolveSession, saveProfileDraft } from './auth.js';
import { ensurePlan } from '../lib/plangenerator.js';
import {
  INTEREST_OPTIONS, GOAL_OPTIONS, STAGE_OPTIONS, TIME_OPTIONS,
  cleanList, cleanStage, cleanTime,
  cleanTrack, cleanYear, cleanDailyTime, cleanPracticeTime,
  cleanSelfRating, cleanTargetDate, cleanRole, cleanPhone,
} from '../lib/personalize.js';

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

function sessionFrom(req) {
  const header = req.get('authorization') || '';
  return resolveSession(header.startsWith('Bearer ') ? header.slice(7) : '');
}

// Validate every onboarding field that is present in the request body.
// Unknown fields are ignored — the client only ever sends known answers.
function profilePatch(b = {}) {
  const patch = {};
  if (b.name !== undefined) {
    const name = str(b.name, 60);
    if (name) patch.name = name;
  }
  if (b.college !== undefined) patch.college = str(b.college, 120);
  if (b.track !== undefined) patch.track = cleanTrack(b.track);
  if (b.role !== undefined) patch.role = cleanRole(b.role);
  if (b.year !== undefined) patch.year = cleanYear(b.year);
  if (b.dailyTime !== undefined) patch.dailyTime = cleanDailyTime(b.dailyTime);
  if (b.practiceTime !== undefined) patch.practiceTime = cleanPracticeTime(b.practiceTime);
  if (b.targetDate !== undefined) patch.targetDate = cleanTargetDate(b.targetDate);
  if (b.selfRating !== undefined) patch.selfRating = cleanSelfRating(b.selfRating);
  // The WhatsApp nudge number is optional end to end; an invalid one simply
  // means "no number" — onboarding never blocks on it.
  if (b.phone !== undefined) patch.phone = cleanPhone(b.phone);
  return patch;
}

function daysUntil(dateISO, now = new Date()) {
  if (!dateISO) return null;
  const target = Date.parse(dateISO + 'T00:00:00Z');
  if (!Number.isFinite(target)) return null;
  const today = Date.parse(now.toISOString().slice(0, 10) + 'T00:00:00Z');
  return Math.round((target - today) / 86400000);
}

function formatDate(dateISO) {
  const d = new Date(dateISO + 'T00:00:00Z');
  if (Number.isNaN(d.getTime())) return dateISO;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

// "Why this plan" — every line traces back to an answer the student gave.
// Nothing invented, no promises about features that don't exist yet.
function planWhy(p = {}) {
  const lines = [];
  const track = p.track && p.track !== 'Not sure' ? p.track : null;
  if (track) {
    lines.push(p.role
      ? `${track} track — pointed at ${p.role}.`
      : `${track} track — the skills that get you hired first.`);
  }
  if (p.selfRating) {
    lines.push(`Day 1 meets you where you are: ${p.selfRating.toLowerCase()}.`);
  }
  if (p.dailyTime) {
    lines.push(`${p.dailyTime.replace(' a day', '')} a day — small enough to actually happen.`);
  }
  if (p.practiceTime) {
    lines.push(`Your practice window is ${p.practiceTime.toLowerCase()} — the plan is built around it.`);
  }
  const days = daysUntil(p.targetDate);
  if (days !== null && days > 0) {
    lines.push(`${days} day${days === 1 ? '' : 's'} to your target (${formatDate(p.targetDate)}) — everything counts down to it.`);
  }
  lines.push('One path at a time. Change any answer later and the plan adapts.');
  return lines;
}

// GET /api/onboarding/draft — the server half of per-step saving: a student
// who bookmarks mid-flow or switches tabs gets their answered steps back.
router.get('/draft', (req, res) => {
  const session = sessionFrom(req);
  if (!session) {
    return res.status(401).json({ error: 'Not signed in.' });
  }
  res.json({
    ok: true,
    onboarded: Boolean(session.account.onboarded),
    profile: session.account.profile || {},
  });
});

// POST /api/onboarding/draft — one completed question at a time. Fails soft:
// the client keeps a local draft too, so a revoked token loses nothing.
router.post('/draft', (req, res) => {
  const session = sessionFrom(req);
  if (!session) {
    return res.status(401).json({ error: 'Not signed in.' });
  }
  if (session.account.onboarded) {
    return res.status(409).json({ error: 'This account already finished onboarding.' });
  }
  const patch = profilePatch(req.body || {});
  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: 'Nothing to save.' });
  }
  saveProfileDraft(session.email, patch);
  res.json({ ok: true, saved: Object.keys(patch) });
});

// Save the finished onboarding. A signed-in student's account flips its
// onboarded flag (the gate the login flow checks); a visitor's answers are
// still recorded, just not linked to an account.
router.post('/', async (req, res) => {
  const b = req.body || {};
  const patch = profilePatch(b);
  const session = sessionFrom(req);
  const email = (session && session.email) || str(b.email, 120);

  const profile = {
    email,
    name: patch.name ?? null,
    college: patch.college ?? null,
    // College rides on the profile only — per the PRD it never personalizes
    // anything (single-student product, no college features).
    track: patch.track ?? 'Not sure',
    role: patch.role ?? null,
    year: patch.year ?? null,
    dailyTime: patch.dailyTime ?? null,
    practiceTime: patch.practiceTime ?? null,
    targetDate: patch.targetDate ?? null,
    selfRating: patch.selfRating ?? null,
    // Only ride along when the request carried it — a final submit without a
    // phone must not wipe the number the draft already saved.
    ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
    // Legacy mirror: the dashboard/plan generators read target.role.
    target: { role: patch.role ?? null, company: '' },
    ambassador: null,
    avatar: null,
    createdAt: new Date().toISOString(),
  };

  if (!profile.name) {
    return res.status(400).json({ error: 'Name is required.' });
  }

  let linked = false;
  if (email) {
    // Fresh answers win; anything the draft/Settings already stored that the
    // new flow doesn't collect is preserved, not wiped.
    const { email: _e, createdAt: _c, ...fresh } = profile;
    const merged = { ...(session?.account?.profile || {}), ...fresh };
    linked = markOnboarded(email, merged);
  }

  const doc = await readJSON('onboarding-profiles.json', []);
  doc.push(profile);
  await writeFile(DATA_DIR + 'onboarding-profiles.json', JSON.stringify(doc, null, 2));

  // The onboarding delivers the student's real plan: generated from their
  // answers, persisted per student, served on /app.
  const plan = linked ? ensurePlan(email, profile, new Date().toISOString().slice(0, 10)) : null;
  const planPreview = plan
    ? {
        startedAt: plan.startedAt,
        totalDays: plan.totalDays,
        week1Theme: plan.days[0].theme,
        firstTasks: plan.days[0].tasks.map((t) => t.title),
      }
    : null;

  res.status(201).json({
    ok: true,
    savedAt: profile.createdAt,
    accountLinked: linked,
    plan: planPreview,
    why: planWhy(profile),
  });
});

// Edit the signed-in student's profile (Settings). Only provided fields are
// merged; lists are validated against the same option sets as onboarding.
router.put('/', (req, res) => {
  const session = sessionFrom(req);
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
  if (b.track !== undefined) profile.track = cleanTrack(b.track);
  if (b.role !== undefined) profile.role = cleanRole(b.role);
  if (b.year !== undefined) profile.year = cleanYear(b.year);
  if (b.dailyTime !== undefined) profile.dailyTime = cleanDailyTime(b.dailyTime);
  if (b.practiceTime !== undefined) profile.practiceTime = cleanPracticeTime(b.practiceTime);
  if (b.targetDate !== undefined) profile.targetDate = cleanTargetDate(b.targetDate);
  if (b.selfRating !== undefined) profile.selfRating = cleanSelfRating(b.selfRating);
  // Empty string clears the nudge number; an invalid one is stored as "none".
  if (b.phone !== undefined) profile.phone = cleanPhone(b.phone);
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

  // Keep the legacy role mirror in step with the canonical field.
  if (b.role !== undefined && profile.target) profile.target.role = profile.role;

  profile.updatedAt = new Date().toISOString();
  markOnboarded(session.email, profile);

  // The saved answers changed → caches refresh on next read.
  res.json({ ok: true, profile });
});

export default router;
