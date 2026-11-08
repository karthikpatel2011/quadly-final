// Public careers listing — open roles only (managed from the admin panel).
import { Router } from 'express';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const DATA_FILE = DATA_DIR + 'careers.json';

const router = Router();

router.get('/', async (req, res) => {
  let doc = [];
  try {
    doc = JSON.parse(await readFile(DATA_FILE, 'utf8'));
  } catch {
    doc = [];
  }
  res.json(doc.filter((j) => j.status === 'open'));
});

export default router;
