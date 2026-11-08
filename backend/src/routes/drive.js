import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';
import { touchPresence } from './squad.js';

// Mock Drive: one weekly slot — every Saturday 15:00 IST, capacity 50.
// The "next drive" is computed server-side from a fixed anchor stored in
// backend/data/drives.json (this route owns that file): the anchor is a past
// Saturday 15:00 IST and next = the first anchor + k·7d that is strictly in
// the future. Registrations are per driveId (the drive's start ISO) and store
// only emails; a student's registration is private (registeredByMe) — the
// roster itself never ships to the client.

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const FILE = DATA_DIR + 'drives.json';

// 2026-10-24 was a Saturday; 15:00 IST == 09:30 UTC. Fixed per spec — drives
// recur every 7 days from here, so the weekday/time can never drift.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_SCHEDULE = { anchor: '2026-10-24T09:30:00.000Z', capacity: 50 };
const LIVE_WINDOW_MS = 15 * 60 * 1000; // badge shows "Live" when start is within 15 min

const DEFAULT_DOC = () => ({
  schedule: { ...DEFAULT_SCHEDULE },
  registrations: {},
});

async function readDoc() {
  try {
    const doc = JSON.parse(await readFile(FILE, 'utf8'));
    const base = DEFAULT_DOC();
    if (!doc || typeof doc !== 'object') return base;
    return {
      schedule: { ...base.schedule, ...(doc.schedule && typeof doc.schedule === 'object' ? doc.schedule : {}) },
      registrations: doc.registrations && typeof doc.registrations === 'object' ? doc.registrations : {},
    };
  } catch {
    return DEFAULT_DOC();
  }
}

async function writeDoc(doc) {
  await writeFile(FILE, JSON.stringify(doc, null, 2));
}

let writeChain = Promise.resolve();
function withFileLock(fn) {
  const run = writeChain.then(fn);
  writeChain = run.then(() => {}, () => {});
  return run;
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
  touchPresence(session);
  return session;
}

// Next Saturday 15:00 IST strictly after `now`, from the fixed anchor.
function nextStartMs(schedule, now = Date.now()) {
  const anchor = Date.parse(schedule.anchor);
  const safeAnchor = Number.isNaN(anchor) ? Date.parse(DEFAULT_SCHEDULE.anchor) : anchor;
  let start = safeAnchor + Math.ceil((now - safeAnchor) / WEEK_MS) * WEEK_MS;
  while (start <= now) start += WEEK_MS; // exact-equal edge: move to the next slot
  return start;
}

function driveView(doc, email, now = Date.now()) {
  const startsAtMs = nextStartMs(doc.schedule, now);
  const id = new Date(startsAtMs).toISOString();
  const roster = (doc.registrations[id] || []).filter((e) => typeof e === 'string');
  const capacity = Math.max(1, Number(doc.schedule.capacity) || DEFAULT_SCHEDULE.capacity);
  const remaining = startsAtMs - now;
  return {
    id, // driveId = start ISO; stable key for registrations
    startsAt: id,
    serverNow: new Date(now).toISOString(), // lets the client tick in server time, immune to clock skew
    capacity,
    registered: roster.length,
    registeredByMe: roster.includes(email),
    live: remaining > 0 && remaining <= LIVE_WINDOW_MS, // the sidebar "Live" rule, server-derived
  };
}

// Kept from the stub so probes keep answering JSON.
router.get('/health', (req, res) => res.json({ ok: true, feature: 'drive' }));

/** Read adapter for Home: the upcoming Saturday drive for this student. */
export async function driveSummaryFor(email, now = Date.now()) {
  const doc = await readDoc();
  return driveView(doc, email, now);
}

// GET /api/drive/next — the upcoming Saturday drive + this student's seat.
router.get('/next', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const doc = await readDoc();
    res.json({ ok: true, ...driveView(doc, session.email) });
  } catch {
    res.status(500).json({ error: 'Drive schedule could not be read — try again in a moment.' });
  }
});

// POST /api/drive/register — take a seat on the next drive.
router.post('/register', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const failure = await withFileLock(async () => {
      const doc = await readDoc();
      const view = driveView(doc, session.email);
      const roster = doc.registrations[view.id] || (doc.registrations[view.id] = []);
      if (roster.includes(session.email)) {
        return { status: 409, error: 'You are already registered for this drive — no need to register twice.' };
      }
      if (roster.length >= view.capacity) {
        return { status: 409, error: `This drive is full — all ${view.capacity} seats are taken. The next Saturday opens right after this one wraps.` };
      }
      roster.push(session.email);
      await writeDoc(doc);
      return null;
    });
    if (failure) return res.status(failure.status).json({ error: failure.error });
    const doc = await readDoc();
    res.status(201).json({ ok: true, ...driveView(doc, session.email) });
  } catch {
    res.status(500).json({ error: 'Registration could not be saved — try again in a moment.' });
  }
});

// POST /api/drive/withdraw — give the seat back.
router.post('/withdraw', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const failure = await withFileLock(async () => {
      const doc = await readDoc();
      const view = driveView(doc, session.email);
      const roster = doc.registrations[view.id] || [];
      if (!roster.includes(session.email)) {
        return { status: 400, error: 'You are not registered for this drive.' };
      }
      doc.registrations[view.id] = roster.filter((e) => e !== session.email);
      await writeDoc(doc);
      return null;
    });
    if (failure) return res.status(failure.status).json({ error: failure.error });
    const doc = await readDoc();
    res.json({ ok: true, ...driveView(doc, session.email) });
  } catch {
    res.status(500).json({ error: 'Could not withdraw right now — try again in a moment.' });
  }
});

export default router;
