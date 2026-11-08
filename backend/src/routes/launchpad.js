import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

// Launchpad — curated job/internship starting points, seeded in
// backend/data/launchpad.json. These are permanent, well-known destinations
// (company portals + boards); Quadly explicitly does NOT scrape live
// openings, and every response says so. Read-only and identical for every
// student — no per-student state is stored here.
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const CONTENT_FILE = DATA_DIR + 'launchpad.json';

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

function cleanResources(doc) {
  if (!doc || !Array.isArray(doc.resources)) return null;
  const resources = doc.resources
    .filter((r) => r && typeof r === 'object' && r.name && typeof r.link === 'string' && r.link.startsWith('https://'))
    .map((r) => ({
      id: String(r.id || ''),
      name: String(r.name),
      type: r.type === 'portal' ? 'portal' : 'aggregator',
      link: String(r.link),
      blurb: r.blurb ? String(r.blurb) : null,
    }));
  return resources.length > 0 ? resources : null;
}

router.get('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const doc = await readDoc();
  const resources = cleanResources(doc);
  if (!resources) {
    // Seed missing/load error is a server-side gap — say so, honestly.
    return res.status(200).json({
      ok: false,
      resources: [],
      note: 'The curated list is being prepared — check back shortly.',
    });
  }
  res.json({
    ok: true,
    resources,
    note:
      doc.note ||
      'Curated starting points — openings change daily; we don’t scrape.',
    updated: doc.updated || null,
  });
});

router.get('/health', (req, res) =>
  res.json({ ok: true, feature: 'launchpad', storage: 'backend/data/launchpad.json (static seed)' }),
);

export default router;
