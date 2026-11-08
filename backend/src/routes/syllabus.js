import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

// Syllabus — the semester-wise university chapter map (static content,
// seeded in backend/data/syllabus-content.json). The per-student skill tree
// and its completion records are OWNED BY the Practice/Skills feature
// (backend/data/syllabus.json under { [email]: { done: [skillId] } }); this
// route never reads or writes that file — the page consumes /api/skills/tree
// directly for its read-only skill map.
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const CONTENT_FILE = DATA_DIR + 'syllabus-content.json';

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

// Serve only whitelisted fields so a stray value in the seed doc can never
// leak junk, and force the honest Covered/Extra vocabulary.
function cleanSemesters(doc) {
  if (!doc || !Array.isArray(doc.semesters)) return null;
  const semesters = doc.semesters
    .map((s) => ({
      sem: Number.isFinite(Number(s?.sem)) ? Number(s.sem) : 0,
      subjects: (Array.isArray(s?.subjects) ? s.subjects : [])
        .filter((x) => x && typeof x === 'object' && x.name)
        .map((x) => ({
          id: String(x.id || ''),
          name: String(x.name),
          topic: x.topic ? String(x.topic) : null,
          status: x.status === 'covered' ? 'covered' : 'extra',
          mapsTo: x.status === 'covered' && x.mapsTo ? String(x.mapsTo) : null,
        })),
    }))
    .filter((s) => s.sem > 0 && s.subjects.length > 0);
  return semesters.length > 0 ? semesters : null;
}

async function chaptersHandler(req, res) {
  const session = requireUser(req, res);
  if (!session) return;
  const doc = await readDoc();
  const semesters = cleanSemesters(doc);
  if (!semesters) {
    // Missing seed content is a server-side gap, not an empty student
    // account — the page renders that note instead of a bare empty list.
    return res.status(200).json({
      ok: false,
      semesters: [],
      note: 'The chapter map is being seeded — check back shortly.',
    });
  }
  res.json({
    ok: true,
    semesters,
    note: doc.note || null,
    legend: doc.legend || null,
  });
}

// Canonical mount is /api/syllabus/chapters; `/` answers the same document
// so the resource is addressable both ways.
router.get('/', chaptersHandler);
router.get('/chapters', chaptersHandler);
router.get('/health', (req, res) =>
  res.json({ ok: true, feature: 'syllabus', storage: 'backend/data/syllabus-content.json (static seed)' }),
);

export default router;
