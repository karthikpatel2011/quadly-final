import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));

async function readJSON(file, fallback) {
  try {
    return JSON.parse(await readFile(DATA_DIR + file, 'utf8'));
  } catch {
    return fallback;
  }
}

const router = Router();

// GET / — public roster. Emails are stripped: only safe fields leave the server.
router.get('/', async (req, res) => {
  const roster = await readJSON('ambassadors.json', { ambassadors: [] });
  const list = Array.isArray(roster) ? roster : roster.ambassadors || [];
  res.json(
    list.map(({ id, name, college, handle }) => ({
      id,
      name: String(name ?? ''),
      college: String(college ?? ''),
      handle: String(handle ?? ''),
    })),
  );
});

const YEARNAMES = ['1st year', '2nd year', '3rd year', '4th year', '5-year integrated'];
const EMAIL_RE = /^\S+@\S+\.\S+$/;
const trimmed = (v, max) => String(v ?? '').trim().slice(0, max);

// POST /apply — public application endpoint. Appends only; existing entries are
// never modified or deleted.
router.post('/apply', async (req, res) => {
  const b = req.body || {};
  const name = trimmed(b.name, 80);
  const email = trimmed(b.email, 120).toLowerCase();
  const college = trimmed(b.college, 120);
  const year = trimmed(b.year, 30);
  const handle = trimmed(b.handle, 40) || null;
  const reach = trimmed(b.reach, 60) || null;
  const message = trimmed(b.message, 2000);
  const privacy = b.consents?.privacy === true;
  const updates = b.consents?.updates === true;

  if (name.length < 2) {
    return res.status(400).json({ error: 'Please enter your full name.' });
  }
  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (college.length < 3) {
    return res.status(400).json({ error: 'Please enter your college name.' });
  }
  if (!YEARNAMES.includes(year)) {
    return res.status(400).json({ error: 'Select your year of study.' });
  }
  if (message.length < 20) {
    return res.status(400).json({ error: 'Tell us a bit more — at least 20 characters.' });
  }
  if (!privacy) {
    return res.status(400).json({ error: 'Consent to the Privacy Policy is required.' });
  }

  const doc = await readJSON('ambassador-applications.json', []);
  const applications = Array.isArray(doc) ? doc : [];

  const duplicate = applications.some(
    (a) =>
      a.status === 'pending' &&
      a.email === email &&
      String(a.college ?? '').trim().toLowerCase() === college.toLowerCase(),
  );
  if (duplicate) {
    return res.status(409).json({ error: 'You already have a pending application for this college.' });
  }

  const entry = {
    id: `app_${Date.now().toString(36)}`,
    name,
    email,
    college,
    year,
    handle,
    reach,
    message,
    consents: { privacy: true, updates },
    status: 'pending',
    createdAt: new Date().toISOString(),
  };

  applications.push(entry);
  await writeFile(DATA_DIR + 'ambassador-applications.json', JSON.stringify(applications, null, 2));

  res.status(201).json({ ok: true, id: entry.id });
});

export default router;
