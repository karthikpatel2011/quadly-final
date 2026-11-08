import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

// Admin sessions are in-memory tokens issued by POST /login. Sign-in
// credentials come from backend/.env (ADMIN_EMAIL / ADMIN_PASSWORD).
const adminSessions = new Set();

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));

async function readJSON(file, fallback) {
  try {
    return JSON.parse(await readFile(DATA_DIR + file, 'utf8'));
  } catch {
    return fallback;
  }
}

async function writeJSON(file, data) {
  await writeFile(DATA_DIR + file, JSON.stringify(data, null, 2));
}

const str = (v, max) => String(v ?? '').trim().slice(0, max) || null;

const router = Router();

// Admin sign-in: email + password from backend/.env. Issues a session token;
// every route registered below the requireAdmin gate needs Bearer auth.
router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  if (!ADMIN_EMAIL || !ADMIN_PASSWORD || email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Wrong admin email or password.' });
  }

  const token = randomUUID();
  adminSessions.add(token);
  res.json({ ok: true, token });
});

// Named export so sibling route modules (home.js moderation queue) can gate
// their admin endpoints with the identical session check.
export function requireAdmin(req, res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  if (!adminSessions.has(token)) {
    return res.status(403).json({ error: 'Unauthorized — sign in as the admin.' });
  }
  next();
}

router.use(requireAdmin); // everything below this line needs a session

// ── Ambassador applications queue ──
router.get('/applications', async (req, res) => {
  res.json(await readJSON('ambassador-applications.json', []));
});

router.post('/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const status = String(req.body?.status || '');
  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return res.status(400).json({ error: 'Status must be pending, approved or rejected.' });
  }
  const list = await readJSON('ambassador-applications.json', []);
  const app = list.find((a) => a.id === id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });
  app.status = status;
  await writeJSON('ambassador-applications.json', list);
  res.json({ ok: true, application: app });
});

router.post('/applications/:id/promote', async (req, res) => {
  const { id } = req.params;
  const list = await readJSON('ambassador-applications.json', []);
  const app = list.find((a) => a.id === id);
  if (!app) return res.status(404).json({ error: 'Application not found.' });

  const data = await readJSON('ambassadors.json', { ambassadors: [] });
  const roster = data.ambassadors || [];
  if (roster.some((a) => (a.email || '').toLowerCase() === (app.email || '').toLowerCase())) {
    return res.status(409).json({ error: 'This email is already on the ambassador roster.' });
  }

  const entry = {
    id: 'amb_' + Date.now().toString(36),
    name: app.name,
    college: app.college,
    handle: app.handle || null,
    email: app.email,
    addedAt: new Date().toISOString(),
  };
  roster.push(entry);
  await writeJSON('ambassadors.json', { ...data, ambassadors: roster });

  app.status = 'promoted';
  app.promoted = true;
  await writeJSON('ambassador-applications.json', list);

  res.status(201).json({ ok: true, ambassador: entry, application: app });
});

// ── Onboarding profiles (read-only from the admin) ──
router.get('/profiles', async (req, res) => {
  res.json(await readJSON('onboarding-profiles.json', []));
});

// ── Ambassador roster (server view — includes emails) ──
router.get('/ambassadors', async (req, res) => {
  const data = await readJSON('ambassadors.json', { ambassadors: [] });
  res.json(data.ambassadors || []);
});

router.post('/ambassadors/delete', async (req, res) => {
  const id = String(req.body?.id || '');
  const data = await readJSON('ambassadors.json', { ambassadors: [] });
  const next = data.ambassadors.filter((a) => a.id !== id);
  if (next.length === (data.ambassadors || []).length) {
    return res.status(404).json({ error: 'Ambassador not found.' });
  }
  await writeJSON('ambassadors.json', { ...data, ambassadors: next });
  res.json({ ok: true });
});

// ── Careers content management ──
router.get('/careers', async (req, res) => {
  res.json(await readJSON('careers.json', []));
});

router.post('/careers', async (req, res) => {
  const title = str(req.body?.title, 80);
  if (!title) return res.status(400).json({ error: 'A job title is required.' });
  const job = {
    id: 'job_' + Date.now().toString(36),
    title,
    team: str(req.body?.team, 60) || 'Quadly',
    type: str(req.body?.type, 40) || 'Full-time',
    location: str(req.body?.location, 80) || 'Remote (India)',
    description: str(req.body?.description, 1200) || '',
    status: 'open',
    createdAt: new Date().toISOString(),
  };
  const doc = await readJSON('careers.json', []);
  doc.push(job);
  await writeJSON('careers.json', doc);
  res.status(201).json({ ok: true, job });
});

router.post('/careers/:id/update', async (req, res) => {
  const { id } = req.params;
  const doc = await readJSON('careers.json', []);
  const job = doc.find((j) => j.id === id);
  if (!job) return res.status(404).json({ error: 'Role not found.' });
  if (req.body?.title !== undefined) job.title = str(req.body.title, 80) || job.title;
  if (req.body?.team !== undefined) job.team = str(req.body.team, 60);
  if (req.body?.type !== undefined) job.type = str(req.body.type, 40);
  if (req.body?.location !== undefined) job.location = str(req.body.location, 80);
  if (req.body?.description !== undefined) job.description = str(req.body.description, 1200);
  if (req.body?.status !== undefined) {
    if (!['open', 'closed'].includes(req.body.status)) {
      return res.status(400).json({ error: 'Status must be open or closed.' });
    }
    job.status = req.body.status;
  }
  await writeJSON('careers.json', doc);
  res.json({ ok: true, job });
});

router.post('/careers/:id/delete', async (req, res) => {
  const { id } = req.params;
  const doc = await readJSON('careers.json', []);
  const next = doc.filter((j) => j.id !== id);
  if (next.length === doc.length) return res.status(404).json({ error: 'Role not found.' });
  await writeJSON('careers.json', next);
  res.json({ ok: true });
});

// ── Mail center ──
router.get('/mail', async (req, res) => {
  res.json(await readJSON('mail.json', []));
});

router.post('/mail/send', async (req, res) => {
  const to = str(req.body?.to, 200);
  const subject = str(req.body?.subject, 200);
  const body = String(req.body?.body || '');
  if (!/^\S+@\S+\.\S+$/.test(to || '')) {
    return res.status(400).json({ error: 'Enter a valid recipient email.' });
  }
  if (!subject) return res.status(400).json({ error: 'A subject is required.' });
  if (!body.trim()) return res.status(400).json({ error: 'The message body is empty.' });

  const { deliverMail } = await import('../lib/mailer.js');
  const delivery = await deliverMail({ to, subject, body });

  const entry = {
    id: 'mail_' + Date.now().toString(36),
    to,
    subject,
    body,
    status: delivery.status,
    provider: delivery.provider,
    error: delivery.error || null,
    createdAt: new Date().toISOString(),
    sentAt: delivery.status === 'sent' ? new Date().toISOString() : null,
  };
  const doc = await readJSON('mail.json', []);
  doc.push(entry);
  await writeJSON('mail.json', doc);

  res.json({ ok: true, mail: entry });
});

router.post('/mail/:id/delete', async (req, res) => {
  const { id } = req.params;
  const doc = await readJSON('mail.json', []);
  const next = doc.filter((m) => m.id !== id);
  if (next.length === doc.length) return res.status(404).json({ error: 'Mail not found.' });
  await writeJSON('mail.json', next);
  res.json({ ok: true });
});

const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || '');

export default router;

// ── Official college items (Home "Your college this week") ──
// Admin-written, scheduled notices: placement-cell items, ambassador events,
// deadlines. Students read only their college's items or all-college ones;
// every create/delete lands in the audit log.

router.get('/official-items', async (req, res) => {
  res.json({
    ok: true,
    items: await readJSON('official-items.json', []),
    audit: (await readJSON('official-audit.json', [])).slice(-40).reverse(),
  });
});

router.post('/official-items', async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 120);
  const body = str(b.body, 300);
  const college = str(b.college, 120) || 'all';
  const link = str(b.link, 300);
  const startsAt = new Date(String(b.startsAt || ''));
  const endsAt = new Date(String(b.endsAt || ''));
  if (!title || !body) return res.status(400).json({ error: 'A title and a short description are required.' });
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime())) {
    return res.status(400).json({ error: 'Give a valid start and end time.' });
  }
  if (endsAt <= startsAt) return res.status(400).json({ error: 'The end must come after the start.' });
  if (endsAt - startsAt > 31 * 24 * 60 * 60 * 1000) {
    return res.status(400).json({ error: 'An item shows for at most 31 days.' });
  }
  const item = {
    id: `off_${randomUUID()}`,
    title, body,
    link: link || null,
    college,
    startsAt: startsAt.toISOString(),
    endsAt: endsAt.toISOString(),
    createdAt: new Date().toISOString(),
    createdBy: 'admin',
  };
  const items = await readJSON('official-items.json', []);
  items.push(item);
  await writeJSON('official-items.json', items);
  const audit = await readJSON('official-audit.json', []);
  audit.push({ id: `ofa_${randomUUID()}`, action: 'create', itemId: item.id, title, by: 'admin', at: item.createdAt });
  await writeJSON('official-audit.json', audit.slice(-500));
  res.status(201).json({ ok: true, item });
});

router.post('/official-items/:id/delete', async (req, res) => {
  const items = await readJSON('official-items.json', []);
  const item = items.find((i) => i.id === req.params.id);
  if (!item) return res.status(404).json({ error: 'No such item.' });
  await writeJSON('official-items.json', items.filter((i) => i.id !== req.params.id));
  const audit = await readJSON('official-audit.json', []);
  audit.push({ id: `ofa_${randomUUID()}`, action: 'delete', itemId: item.id, title: item.title, by: 'admin', at: new Date().toISOString() });
  await writeJSON('official-audit.json', audit.slice(-500));
  res.json({ ok: true });
});

// ── Opportunity listings (Opportunities page; admin-verified only) ──

router.get('/opportunities', async (req, res) => {
  res.json({ ok: true, items: await readJSON('opportunities.json', []) });
});

router.post('/opportunities', async (req, res) => {
  const b = req.body || {};
  const title = str(b.title, 120);
  const org = str(b.org, 120);
  const type = str(b.type, 30);
  const allowed = ['internship', 'job', 'hackathon', 'scholarship', 'fellowship', 'research', 'open-source', 'workshop', 'competition', 'startup'];
  if (!title || !org) return res.status(400).json({ error: 'Title and organization are required.' });
  if (!allowed.includes(type)) return res.status(400).json({ error: `Type must be one of: ${allowed.join(', ')}.` });
  const sourceUrl = str(b.sourceUrl, 300);
  if (!sourceUrl || !/^https:\/\//.test(sourceUrl)) {
    return res.status(400).json({ error: 'A https source URL is required — every listing names its source.' });
  }
  const deadline = str(b.deadline, 30);
  if (deadline && Number.isNaN(Date.parse(deadline))) {
    return res.status(400).json({ error: 'The deadline is not a valid date.' });
  }
  const item = {
    id: `opp_${randomUUID()}`,
    title, org, type,
    sourceUrl,
    location: str(b.location, 120) || null,
    remote: b.remote === true,
    eligibility: str(b.eligibility, 200) || null,
    paid: ['paid', 'unpaid', 'unknown'].includes(b.paid) ? b.paid : 'unknown',
    deadline: deadline || null,
    postedAt: new Date().toISOString(),
    lastChecked: new Date().toISOString(),
    verification: 'admin-verified',
  };
  const items = await readJSON('opportunities.json', []);
  items.push(item);
  await writeJSON('opportunities.json', items);
  res.status(201).json({ ok: true, item });
});

router.post('/opportunities/:id/delete', async (req, res) => {
  const items = await readJSON('opportunities.json', []);
  if (!items.some((i) => i.id === req.params.id)) return res.status(404).json({ error: 'No such listing.' });
  await writeJSON('opportunities.json', items.filter((i) => i.id !== req.params.id));
  res.json({ ok: true });
});
