import { Router } from 'express';
import { resolveSession } from './auth.js';
import { intelStatus } from '../../../intel/src/index.js';
import { loadGraph, queryGraph } from '../../../intel/src/graph.js';

// Read-only surface over the intelligence core (AGENT.md §7).
// Session-gated like every dashboard route; nothing here mutates state.
const router = Router();

function requireUser(req, res) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const session = resolveSession(token);
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  return session;
}

router.get('/status', (req, res) => {
  if (!requireUser(req, res)) return;
  res.json({ ok: true, ...intelStatus() });
});

router.get('/graph/query', (req, res) => {
  if (!requireUser(req, res)) return;
  const q = String(req.query.q || '').slice(0, 200);
  const g = loadGraph();
  res.json({ ok: true, query: q, ...queryGraph(g, q) });
});

export default router;
