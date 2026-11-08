// Personalization endpoints — GET returns the student's current direction +
// recommended next action (computed on the fly, cached per profile version).
// The compute path is the deterministic rule engine; the LLM only refines the
// wording when a key is configured and the student keeps personalization on.
// Privacy: only the compact consented context is ever sent to a provider, and
// only when profile.aiPersonalization !== false. The toggle lives in Settings.

import { Router } from 'express';
import { computePersonalization, storedPersonalization } from '../lib/personalize.js';
import { resolveSession } from './auth.js';

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

router.get('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const profileUpdatedAt = session.account.profile?.updatedAt || null;
    const cached = await storedPersonalization(session.email);
    if (cached && cached.profileUpdatedAt === profileUpdatedAt) {
      return res.json({ ok: true, ...cached });
    }
    const fresh = await computePersonalization(session);
    res.json({ ok: true, ...fresh });
  } catch {
    res.status(500).json({ error: 'Personalization could not be computed — try again in a moment.' });
  }
});

router.post('/refresh', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const fresh = await computePersonalization(session);
    res.json({ ok: true, ...fresh });
  } catch {
    res.status(500).json({ error: 'Personalization could not be refreshed — try again in a moment.' });
  }
});

export default router;
