// Opportunities — internships, jobs, hackathons, open-source programs. One
// honest dataset: every listing carries its source URL and a verification
// status set by the admin ("admin-verified") — nothing is scraped or invented.
// Students browse with filters, save items, and track their own applications
// (statuses from the product brief). Student tracking data is private.

import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const LIST_FILE = `${DATA_DIR}opportunities.json`;
const TRACK_FILE = `${DATA_DIR}opportunity-tracker.json`;

const STATUSES = ['saved', 'planning', 'applied', 'assessment', 'interview', 'offer', 'rejected', 'withdrawn'];
const TYPES = ['internship', 'job', 'hackathon', 'scholarship', 'fellowship', 'research', 'open-source', 'workshop', 'competition', 'startup'];

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

async function readList() {
  try {
    const doc = JSON.parse(await readFile(LIST_FILE, 'utf8'));
    return Array.isArray(doc) ? doc : [];
  } catch {
    return [];
  }
}

async function writeList(items) {
  await writeFile(LIST_FILE, JSON.stringify(items, null, 2));
}

async function readTracker() {
  try {
    return JSON.parse(await readFile(TRACK_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeTracker(doc) {
  await writeFile(TRACK_FILE, JSON.stringify(doc, null, 2));
}

function publicItem(item, track) {
  return {
    id: item.id,
    title: item.title,
    org: item.org,
    type: item.type,
    sourceUrl: item.sourceUrl,
    location: item.location || null,
    remote: Boolean(item.remote),
    eligibility: item.eligibility || null,
    paid: item.paid || 'unknown', // paid | unpaid | unknown — never inferred
    deadline: item.deadline || null,
    postedAt: item.postedAt || null,
    lastChecked: item.lastChecked || item.postedAt || null,
    verification: item.verification || 'community', // admin-verified | community
    expired: item.deadline ? Date.parse(item.deadline) < Date.now() : false,
    savedByMe: Boolean(track[item.id]),
    trackStatus: track[item.id]?.status || null,
    trackedAt: track[item.id]?.at || null,
  };
}

// GET /api/opportunities?type=&q=&remote=&paid=&includeExpired=
router.get('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const type = String(req.query.type || '').trim();
  const q = String(req.query.q || '').trim().toLowerCase();
  const remote = String(req.query.remote || '') === '1';
  const paid = String(req.query.paid || '').trim(); // paid | unpaid (unknown excluded unless empty)
  const includeExpired = String(req.query.includeExpired || '') === '1';

  const list = await readList();
  const tracker = (await readTracker())[session.email] || {};

  let items = list.filter((it) => !it.deadline || includeExpired || Date.parse(it.deadline) >= Date.now() - 86_400_000);
  if (type && TYPES.includes(type)) items = items.filter((it) => it.type === type);
  if (remote) items = items.filter((it) => it.remote === true);
  if (paid === 'paid') items = items.filter((it) => it.paid === 'paid');
  if (paid === 'unpaid') items = items.filter((it) => it.paid === 'unpaid');
  if (q) {
    items = items.filter((it) =>
      [it.title, it.org, (it.eligibility || ''), (it.location || '')]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }
  // Soonest deadline first; open-ended (no deadline) last, stable.
  items = [...items].sort((a, b) => {
    const da = a.deadline ? Date.parse(a.deadline) : Infinity;
    const dbv = b.deadline ? Date.parse(b.deadline) : Infinity;
    return da - dbv;
  });

  res.json({
    ok: true,
    total: items.length,
    items: items.slice(0, 60).map((it) => publicItem(it, tracker)),
    statuses: STATUSES,
    types: TYPES,
  });
});

// GET /api/opportunities/mine — the student's tracker
router.get('/mine', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const trackerAll = await readTracker();
  const mine = trackerAll[session.email] || {};
  const list = await readList();
  const byId = Object.fromEntries(list.map((it) => [it.id, it]));
  const items = Object.entries(mine)
    .map(([id, t]) => (byId[id] ? { ...publicItem(byId[id], { [id]: t }), trackStatus: t.status, trackedAt: t.at } : null))
    .filter(Boolean)
    .sort((a, b) => String(b.trackedAt).localeCompare(String(a.trackedAt)));
  res.json({ ok: true, statuses: STATUSES, items });
});

router.post('/:id/save', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const list = await readList();
  const item = list.find((it) => it.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'No such opportunity.' });
  const trackerAll = await readTracker();
  const mine = trackerAll[session.email] || {};
  if (!mine[item.id]) {
    mine[item.id] = { status: 'saved', at: new Date().toISOString() };
    trackerAll[session.email] = mine;
    await writeTracker(trackerAll);
  }
  res.json({ ok: true, savedByMe: true, trackStatus: mine[item.id].status });
});

router.delete('/:id/save', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const trackerAll = await readTracker();
  const mine = trackerAll[session.email] || {};
  if (mine[req.params.id]) {
    delete mine[req.params.id];
    trackerAll[session.email] = mine;
    await writeTracker(trackerAll);
  }
  res.json({ ok: true, savedByMe: false, trackStatus: null });
});

router.post('/:id/track', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const status = String(req.body?.status || '');
  if (!STATUSES.includes(status)) {
    return res.status(400).json({ error: `Status must be one of: ${STATUSES.join(', ')}.` });
  }
  const list = await readList();
  if (!list.some((it) => it.id === req.params.id)) {
    return res.status(404).json({ error: 'No such opportunity.' });
  }
  const trackerAll = await readTracker();
  const mine = trackerAll[session.email] || {};
  mine[req.params.id] = { status, at: new Date().toISOString() };
  trackerAll[session.email] = mine;
  await writeTracker(trackerAll);
  res.json({ ok: true, savedByMe: true, trackStatus: status });
});

export default router;
