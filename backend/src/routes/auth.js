import { Router } from 'express';
import { randomUUID, scryptSync, randomBytes, timingSafeEqual } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import path from 'node:path';

// Accounts now persist to backend/data/accounts.json (pre-beta store; the
// documented migration target is Supabase). Passwords are salted + scrypt
// hashed — the plaintext never touches disk. Session tokens persist too, so
// browser sessions survive backend restarts.

const DATA_DIR = path.resolve(import.meta.dirname, '../../data/');
const ACCOUNTS_FILE = path.join(DATA_DIR, 'accounts.json');
const MAX_TOKENS = 20;

const EMAIL_RE = /^\S+@\S+\.\S+$/;

const accounts = new Map(); // emailLower -> account record (live cache)

function persistAccounts() {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
    const tmp = ACCOUNTS_FILE + '.tmp';
    writeFileSync(tmp, JSON.stringify(Object.fromEntries(accounts), null, 2));
    renameSync(tmp, ACCOUNTS_FILE);
  } catch (err) {
    console.error('[auth] failed to persist accounts:', err.message);
  }
}

function loadAccounts() {
  if (!existsSync(ACCOUNTS_FILE)) return;
  try {
    for (const [email, account] of Object.entries(JSON.parse(readFileSync(ACCOUNTS_FILE, 'utf8')))) {
      accounts.set(email, account);
    }
    console.log(`[auth] loaded ${accounts.size} persisted account(s)`);
  } catch (err) {
    console.error('[auth] failed to load accounts file:', err.message);
  }
}
loadAccounts();

function hashPassword(password, salt) {
  return scryptSync(String(password), salt, 64).toString('hex');
}

function verifyPassword(account, password) {
  try {
    const candidate = Buffer.from(scryptSync(String(password), account.salt, 64));
    return timingSafeEqual(candidate, Buffer.from(account.passwordHash, 'hex'));
  } catch {
    return false;
  }
}

const router = Router();

// Registration: email + password + confirm. The account starts with
// onboarded:false — the join flow hands off to /onboarding.
router.post('/register', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');
  const confirm = String(req.body?.confirm || '');

  if (!EMAIL_RE.test(email)) {
    return res.status(400).json({ error: 'Enter a valid email address.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'Password needs at least 6 characters.' });
  }
  if (password !== confirm) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }
  if (accounts.has(email)) {
    return res.status(409).json({ error: 'That email is already registered — try logging in.' });
  }

  const salt = randomBytes(16).toString('hex');
  const token = randomUUID();
  accounts.set(email, {
    salt,
    passwordHash: hashPassword(password, salt),
    onboarded: false,
    profile: null,
    dashboard: { done: {}, chat: [] },
    tokens: [token],
    createdAt: new Date().toISOString(),
  });
  persistAccounts();
  res.status(201).json({ ok: true, email, onboarded: false, token });
});

// Login: email + password → session token + onboarding state, so the app
// knows whether to send this user through /onboarding.
router.post('/login', (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  const password = String(req.body?.password || '');

  const account = accounts.get(email);
  if (!account || !verifyPassword(account, password)) {
    return res.status(401).json({ error: 'No matching account — check your email or register with Try Now.' });
  }

  const token = randomUUID();
  account.tokens.push(token);
  account.tokens = account.tokens.slice(-MAX_TOKENS);
  persistAccounts();
  res.json({ ok: true, email, onboarded: Boolean(account.onboarded), token });
});

// Who am I — identified by session token, never by bare email in the URL.
router.get('/me', (req, res) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  for (const [email, account] of accounts) {
    if (account.tokens.includes(token)) {
      return res.json({ ok: true, email, onboarded: Boolean(account.onboarded), profile: account.profile });
    }
  }
  res.status(401).json({ error: 'Not signed in.' });
});

router.post('/logout', (req, res) => {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  for (const account of accounts.values()) {
    const i = account.tokens.indexOf(token);
    if (i !== -1) account.tokens.splice(i, 1);
  }
  persistAccounts();
  res.json({ ok: true });
});

/** Account deletion (DPDP): removes the account plus its per-student rows
 *  from every student-owned store. Synchronous on purpose — auth owns these
 *  writes — and best-effort on the mirrors: a failed mirror never blocks the
 *  account itself from being destroyed. Admin audit logs keep their entries
 *  (they record that an action happened, nothing else personal). */
function scrubFile(name, mutate) {
  const file = path.join(DATA_DIR, name);
  if (!existsSync(file)) return;
  try {
    const doc = JSON.parse(readFileSync(file, 'utf8'));
    const out = mutate(doc);
    const tmp = file + '.tmp';
    writeFileSync(tmp, JSON.stringify(out ?? doc, null, 2));
    renameSync(tmp, file);
  } catch {
    /* best-effort */
  }
}

router.delete('/account', (req, res) => {
  const header = req.get('authorization') || '';
  const session = resolveSession(header.startsWith('Bearer ') ? header.slice(7) : '');
  if (!session) {
    return res.status(401).json({ error: 'Not signed in.' });
  }
  if (String(req.body?.confirm || '').trim() !== 'DELETE') {
    return res.status(400).json({ error: 'Type DELETE to confirm account removal.' });
  }
  const email = session.email;

  // The account itself (sessions die with it).
  accounts.delete(email);
  persistAccounts();

  // Per-student rows in the student-owned stores.
  const dropKey = (doc) => { delete doc[email]; return doc; };
  scrubFile('attempts.json', dropKey);
  scrubFile('interview-attempts.json', dropKey);
  scrubFile('opportunity-tracker.json', dropKey);
  scrubFile('home-views.json', dropKey);
  scrubFile('dashboard-state.json', dropKey);
  scrubFile('plans.json', dropKey);
  scrubFile('ai-profile.json', dropKey);
  scrubFile('projects.json', (doc) => (Array.isArray(doc) ? doc.filter((p) => p.email !== email) : doc));
  scrubFile('onboarding-profiles.json', (doc) => (Array.isArray(doc) ? doc.filter((p) => p.email !== email) : doc));
  scrubFile('squads.json', (doc) => {
    if (!doc || typeof doc !== 'object') return doc;
    for (const id of Object.keys(doc)) {
      const sq = doc[id];
      if (!sq || !Array.isArray(sq.members)) continue;
      const had = sq.members.some((m) => (typeof m === 'string' ? m : m.studentId) === email);
      if (!had) continue;
      sq.members = sq.members.filter((m) => (typeof m === 'string' ? m : m.studentId) !== email);
      if (sq.ownerId === email) {
        const nextOwner = [...sq.members].sort((a, b) => ((a.joinedAt || '') < (b.joinedAt || '') ? -1 : 1))[0];
        if (nextOwner) { sq.ownerId = nextOwner.studentId; nextOwner.role = 'owner'; }
      }
      if (sq.members.length === 0) delete doc[id];
    }
    return doc;
  });

  res.json({ ok: true });
});

// Used by the onboarding route to flip an account's onboarded flag,
// and to attach the saved profile to the account.
export function markOnboarded(email, profile) {
  const account = accounts.get(String(email || '').toLowerCase());
  if (!account) return false;
  account.onboarded = true;
  if (profile) account.profile = profile;
  persistAccounts();
  return true;
}

// Per-step onboarding save: merges validated fields onto the profile without
// flipping the onboarded flag (the final POST does that). Unknown account
// (revoked token mid-flow) → false; the client keeps its local draft.
export function saveProfileDraft(email, patch) {
  const account = accounts.get(String(email || '').toLowerCase());
  if (!account) return false;
  account.profile = { ...(account.profile || {}), ...patch, updatedAt: new Date().toISOString() };
  persistAccounts();
  return true;
}

// Cross-route session lookup — lets the dashboard tier resolve a Bearer
// token to its account without exposing the accounts map.
export function resolveSession(token) {  for (const [email, account] of accounts) {
    if (account.tokens.includes(token)) {
      return { email, account };
    }
  }
  return null;
}

export default router;
