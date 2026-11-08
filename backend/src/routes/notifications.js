import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

// Notifications — what's-new product notices for the signed-in student
// (seeded in backend/data/notifications.json, newest first on read). These
// are platform-wide announcements, not per-student alerts: nothing here is
// stored under the student's email and nothing is written by this route.
// The dashboard topbar bell is a separate, not-yet-built surface.
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const CONTENT_FILE = DATA_DIR + 'notifications.json';

const MAX_ITEMS = 20;

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

async function readDoc() {
  try {
    return JSON.parse(await readFile(CONTENT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function cleanItems(doc) {
  if (!doc || !Array.isArray(doc.items)) return null;
  const items = doc.items
    .filter((n) => n && typeof n === 'object' && n.title && n.body)
    .map((n) => ({
      id: String(n.id || ''),
      date: typeof n.date === 'string' && n.date ? n.date : null,
      title: String(n.title),
      body: String(n.body),
    }));
  return items;
}

router.get('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const items = cleanItems(await readDoc());
  if (!items) {
    return res.status(200).json({ ok: false, items: [], note: 'No notices published yet.' });
  }
  // Deterministic order: newest first by date, then title — no randomness.
  items.sort((a, b) => ((b.date || '').localeCompare(a.date || '')) || a.title.localeCompare(b.title));
  res.json({ ok: true, items: items.slice(0, MAX_ITEMS) });
});

router.get('/health', (req, res) =>
  res.json({ ok: true, feature: 'notifications', storage: 'backend/data/notifications.json (static seed)' }),
);

export default router;
