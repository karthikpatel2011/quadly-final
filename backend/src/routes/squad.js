import { Router } from 'express';
import { randomInt, randomUUID, createHash } from 'node:crypto';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';
import { resolveSession } from './auth.js';
import { istDayKey } from '../lib/streaks.js';

// Squad v2 (PRD §7) — private study groups of 3–5 (they can exist with 1–2
// while waiting) with a SHARED streak built from verified tasks in the
// student accounts store. Design contract for this route:
//   • A squad day rolls with the task store's own day key (dashboard.js writes
//     `done` under UTC dates — reading it with anything else would contradict
//     the completion function, which this route never modifies). Assumption
//     recorded: day rollover ≈ 5:30 am IST rather than the spec's 4 am.
//   • The board sweep computes each missing day lazily on read (equivalent to
//     a 4 am job on a server with a scheduler — this stack has none).
//   • One automatic freeze per week covers a single missing member; owner
//     can disable it. Members inactive 7 days are "Away" — shown, not blocking.
//   • Privacy: done/not-done and task counts only; scores never leave the
//     member's own account. Minors render as initials.
// Files this route owns (all ignored by git — personal data):
//   squads.json, squad-daily.json, squad-nudges.json, squad-events.json,
//   squad-pending.json, squad-attempts.json.

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const FILE = DATA_DIR + 'squads.json';
const DAILY_FILE = DATA_DIR + 'squad-daily.json';
const NUDGES_FILE = DATA_DIR + 'squad-nudges.json';
const EVENTS_FILE = DATA_DIR + 'squad-events.json';
const PENDING_FILE = DATA_DIR + 'squad-pending.json';
const ATTEMPTS_FILE = DATA_DIR + 'squad-attempts.json';
const ACCOUNTS_FILE = DATA_DIR + 'accounts.json';

const MAX_MEMBERS = 5;
const NEEDED_TO_START = 3;
const CODE_LEN = 6;
// No look-alikes (spec alphabet).
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const NUDGES_PER_DAY = 3;
const NUDGE_PER_PAIR_DAY = 1;
const RECV_QUIET_EQUIV = null; // receiver quiet hours fixed 22:00–07:00 IST
const AWAY_DAYS = 7;
const MILESTONES = [7, 14, 30];

const router = Router();

async function readFile_(file, fallback) {
  try {
    return JSON.parse(await readFile(file, 'utf8'));
  } catch {
    return fallback;
  }
}
async function writeFile_(file, doc) {
  const tmp = `${file}.tmp`;
  await writeFile(tmp, JSON.stringify(doc, null, 2));
  await rename(tmp, file);
}
let writeChain = Promise.resolve();
const locked = (fn) => {
  const run = writeChain.then(fn);
  writeChain = run.then(() => {}, () => {});
  return run;
};

const SQUADS = () => readFile_(FILE, {});
const saveSquads = (d) => writeFile_(FILE, d);
const DAILY = () => readFile_(DAILY_FILE, {});
const saveDaily = (d) => writeFile_(DAILY_FILE, d);
const NUDGES = () => readFile_(NUDGES_FILE, {});
const saveNudges = (d) => writeFile_(NUDGES_FILE, d);
const EVENTS = () => readFile_(EVENTS_FILE, {});
const saveEvents = (d) => writeFile_(EVENTS_FILE, d);
const PENDING = () => readFile_(PENDING_FILE, {});
const ATTEMPTS = () => readFile_(ATTEMPTS_FILE, {});
const savePending = (d) => writeFile_(PENDING_FILE, d);

// ---------- time (task-store day key + IST quiet hours) ----------
const dayNow = () => istDayKey();
const yesterdayKey = () => istDayKey(Date.now() - 24 * 3600 * 1000);
const IST_OFFSET = 5.5 * 3600 * 1000;
function istMinutes(now = new Date()) {
  const s = new Date(now.getTime() + IST_OFFSET);
  return s.getUTCHours() * 60 + s.getUTCMinutes();
}
const recvQuiet = (now = new Date()) => {
  const m = istMinutes(now);
  return m >= 22 * 60 || m < 7 * 60;
};

// In-memory write throttle: 5 squad writes per student per minute.
const writeHits = new Map();
function tooManyWrites(email, now = Date.now()) {
  const win = writeHits.get(email) || { n: 0, start: now };
  if (now - win.start > 60000) { win.n = 0; win.start = now; }
  win.n += 1;
  writeHits.set(email, win);
  return win.n > 5;
}

function requireUser(req, res) {
  const h = req.get('authorization') || '';
  const session = resolveSession(h.startsWith('Bearer ') ? h.slice(7) : '');
  if (!session) { res.status(401).json({ error: 'Not signed in.' }); return null; }
  return session;
}

// ---------- accounts (verified task results; read-only) ----------
async function readAccounts() {
  return readFile_(ACCOUNTS_FILE, {});
}
function taskDayEntry(account, day) {
  const done = account?.dashboard?.done || {};
  return Array.isArray(done[day]) ? done[day] : [];
}

function memberNames(accounts, email) {
  const p = accounts[email?.toLowerCase()]?.profile || {};
  const full = String(p.name || '').trim();
  const local = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
  const name = full || (local ? local.charAt(0).toUpperCase() + local.slice(1) : 'Student');
  const minor = Number.isFinite(p.birthYear) && new Date().getFullYear() - p.birthYear < 18;
  if (minor) {
    const parts = name.split(/\s+/);
    const initials = parts.map((x) => x.charAt(0).toUpperCase()).slice(0, 2).join('');
    return { name: parts[0] || 'Student', initials, minor: true };
  }
  const parts = name.split(/\s+/);
  const initials = parts.map((x) => x.charAt(0).toUpperCase()).slice(0, 2).join('');
  return { name: parts[0], initials, minor: false };
}

// ---------- sweep: days, streak, freeze (lazy 4 am job) ----------
function isSatisfied(squad, day, accounts) {
  const active = (squad.members || []).filter((m) => !isAway(m));
  let done = 0;
  for (const m of active) {
    const n = taskDayEntry(accounts[m.studentId.toLowerCase()], day).length;
    if (n > 0) done += 1;
  }
  return { total: active.length, done };
}

export function isAway(member, now = Date.now()) {
  const last = Date.parse(member.lastActiveAt || '');
  if (!Number.isFinite(last)) return false;
  return now - last > AWAY_DAYS * 86400000;
}

export function sweepSquad(squad, dailyDoc, accounts, now = new Date()) {
  if (!squad.lastSweepDay) squad.lastSweepDay = dayNow();
  if (!Number.isFinite(squad.streakCurrent)) squad.streakCurrent = 0;
  if (!Number.isFinite(squad.streakBest)) squad.streakBest = 0;
  const createdDay = String(squad.createdAt || '').slice(0, 10);
  const today = dayNow();
  let day = squad.lastSweepDay;
  if (!dailyDoc[squad.id]) dailyDoc[squad.id] = {};
  const results = [];
  while (true) {
    const dt = new Date(day + 'T00:00:00Z');
    dt.setUTCDate(dt.getUTCDate() + 1);
    const next = dt.toISOString().slice(0, 10);
    if (next < createdDay || next >= today) break;
    const evalNext = isSatisfied(squad, next, accounts);
    let complete = evalNext.total > 0 && evalNext.done === evalNext.total;
    let froze = false;
    const missing = evalNext.total - evalNext.done;
    if (!complete && missing === 1 && squad.freezeEnabled !== false) {
      const wk = weekKeyOf(next);
      const usedThisWeek = squad.freezeWeekKey === wk ? (squad.freezeUsedInWeek || 0) : 0;
      if (usedThisWeek < 1) {
        complete = true;
        froze = true;
        squad.freezeWeekKey = wk;
        squad.freezeUsedInWeek = usedThisWeek + 1;
      }
    }
    if (complete) {
      squad.streakCurrent += 1;
      squad.streakBest = Math.max(squad.streakBest, squad.streakCurrent);
    } else {
      squad.streakCurrent = 0;
    }
    dailyDoc[squad.id][next] = { total: evalNext.total, done: evalNext.done, complete, froze };
    results.push({ day: next, complete, froze });
    day = next;
    squad.lastSweepDay = next;
  }
  const liveToday = isSatisfied(squad, today, accounts);
  const milestone = results.length && MILESTONES.includes(squad.streakCurrent)
    && results[results.length - 1].complete
    ? squad.streakCurrent
    : null;
  return { results, liveToday, milestone };
}

function weekKeyOf(day) {
  const d = new Date(day + 'T00:00:00Z');
  return `${d.getUTCFullYear()}-W${Math.ceil((d.getUTCDate() + d.getUTCDay()) / 7)}`;
}

// ---------- events ----------
async function pushEvent(squadId, kind, text, studentId = null) {
  const evs = await EVENTS();
  const list = evs[squadId] || (evs[squadId] = []);
  list.push({ at: new Date().toISOString(), kind, text, studentId });
  evs[squadId] = list.slice(-50);
  await saveEvents(evs);
}

// ---------- owner helpers ----------
function memberBy(squad, email) {
  return (squad.members || []).find((m) => m.studentId === email) || null;
}
function touch(squad, email, now = new Date()) {
  const m = memberBy(squad, email);
  if (m) m.lastActiveAt = now.toISOString();
}

const nameOk = (name) => /^[^<>{}$\\]{3,30}$/.test(name) && !/\b(stupid|idiot|dummy)\b/i.test(name);

const createSchema = z.object({
  name: z.string().trim().refine(nameOk, 'Squad name must be 3–30 characters.'),
});
const joinSchema = z.object({
  code: z.string().trim().toUpperCase().length(CODE_LEN),
  pendingToken: z.string().trim().uuid().optional(),
});
const patchSchema = z.object({
  name: z.string().trim().refine(nameOk, 'Squad name must be 3–30 characters.').optional(),
  freezeEnabled: z.boolean().optional(),
  nudgesMuted: z.boolean().optional(),
});
const nudgeSchema = z.object({ toId: z.string().min(3) });
const reportSchema = z.object({
  memberEmail: z.string().email(),
  reason: z.string().trim().min(3).max(300),
});

function newCode(doc) {
  let code = '';
  do {
    code = Array.from({ length: CODE_LEN }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
  } while (Object.values(doc).some((s) => s.inviteCode === code));
  return code;
}

// ---------- member view + board ----------
async function boardView(squad, me, origin = null) {
  const accounts = await readAccounts();
  const daily = await DAILY();
  const sweep = sweepSquad(squad, daily, accounts);
  await saveDaily(daily);

  const day = dayNow();
  const memberRows = (squad.members || [])
    .map((m) => {
      const info = memberNames(accounts, m.studentId);
      const taskCount = taskDayEntry(accounts[m.studentId.toLowerCase()], day).length;
      const away = isAway(m);
      return {
        id: m.studentId,
        isMe: m.studentId === me,
        role: m.role,
        initials: info.minor ? info.initials : info.initials,
        firstName: info.name,
        away,
        nudgesMuted: Boolean(m.nudgesMuted),
        doneToday: taskCount > 0,
        taskCount,
      };
    })
    .sort((a, b) => (a.doneToday === b.doneToday ? (a.isMe ? -1 : b.isMe ? 1 : 0) : a.doneToday ? 1 : -1));

  const allEvents = (await EVENTS())[squad.id] || [];
  const events = allEvents.slice(-5).reverse();
  const now = new Date();
  const isSunday = now.getUTCDay() === 0;
  const weeklyRecap = isSunday
    ? `This week: ${Object.values(daily[squad.id] || {}).filter((d) => d.complete).length} complete squad days.`
    : null;

  const invite = (squad.members || []).length < MAX_MEMBERS
    ? {
        code: squad.inviteCode,
        joinUrl: `/join/${squad.inviteCode}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(`Join my Quadly squad and keep each other on track. Code: ${squad.inviteCode}. ${origin ?? ''}/join/${squad.inviteCode}`)}`,
      }
    : null;

  return {
    id: squad.id,
    name: squad.name,
    ownerId: squad.ownerId,
    isOwner: squad.ownerId === me,
    code: squad.inviteCode,
    createdDay: String(squad.createdAt || '').slice(0, 10),
    streak: { current: squad.streakCurrent, best: squad.streakBest, milestone: sweep.milestone },
    today: { total: sweep.liveToday.total, done: sweep.liveToday.done, complete: sweep.liveToday.total > 0 && sweep.liveToday.done === sweep.liveToday.total },
    members: memberRows,
    invite,
    events,
    weeklyRecap,
    streakJustMilestone: sweep.milestone,
    freeze: { enabled: squad.freezeEnabled !== false, usedThisWeek: Boolean(squad.freezeUsed), weekKey: squad.freezeWeekKey ?? null },
  };
}

// ---------- compat exports (home.js adapters) ----------
export async function summaryFor(email) {
  const doc = await SQUADS();
  const id = Object.keys(doc).find((k) => (doc[k].members || []).some((m) => m.studentId === email));
  if (!id) return { ok: true, me: email, squad: null };
  const squad = doc[id];
  const accounts = await readAccounts();
  const day = dayNow();
  const members = (squad.members || []).map((m) => {
    const done = taskDayEntry(accounts[m.studentId?.toLowerCase()], day);
    return { email: m.studentId, isMe: m.studentId === email, online: true, doneToday: done.length > 0, nudgesReceived: 0 };
  });
  return { ok: true, me: email, squad: { name: squad.name, maxMembers: MAX_MEMBERS, members, nudgesLeft: NUDGES_PER_DAY, nudgeCap: NUDGES_PER_DAY } };
}

export function touchPresence(session, now = Date.now()) {
  return session; // v2 keeps presence on the member rows; driveside touch is a no-op
}

// ---------- routes ----------
router.get('/capabilities', (req, res) => {
  res.json({ ok: true, maxMembers: MAX_MEMBERS, neededToStart: NEEDED_TO_START, codeLength: CODE_LEN });
});

router.get('/me', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const doc = await SQUADS();
  const id = Object.keys(doc).find((k) => (doc[k].members || []).some((m) => m.studentId === session.email));
  if (!id) return res.json({ ok: true, squad: null });
  await locked(async () => {
    const fresh = await SQUADS();
    const sq = fresh[id];
    if (sq) touch(sq, session.email);
    await saveSquads(fresh);
  });
  const fresh = await SQUADS();
  res.json({ ok: true, squad: { id, name: fresh[id].name, memberCount: fresh[id].members.length } });
});

router.post('/', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (tooManyWrites(session.email)) return res.status(429).json({ error: 'Too many squad actions in a minute — take a breath.' });
  const parsed = createSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Invalid squad name.' });
  const store = await locked(async () => {
    const doc = await SQUADS();
    if (Object.values(doc).some((s) => (s.members || []).some((m) => m.studentId === session.email))) {
      return { error: 'You are already in a squad. Leave it before starting another.', status: 409 };
    }
    const accounts = await readAccounts();
    const info = memberNames(accounts, session.email);
    const id = randomUUID();
    const squad = {
      id,
      inviteCode: newCode(doc),
      name: parsed.data.name,
      ownerId: session.email,
      createdAt: new Date().toISOString(),
      members: [{ studentId: session.email, role: 'owner', joinedAt: new Date().toISOString(), lastActiveAt: new Date().toISOString(), nudgesMuted: false }],
      freezeEnabled: true,
      freezeUsed: 0,
      freezeWeekKey: null,
      streakCurrent: 0,
      streakBest: 0,
      lastSweepDay: dayNow(),
    };
    doc[id] = squad;
    await saveSquads(doc);
    await pushEvent(id, 'created', `${info.name} started the squad “${squad.name}”.`, session.email);
    return { id };
  });
  if (store.error) return res.status(store.status).json({ error: store.error });
  const doc = await SQUADS();
  const squad = doc[store.id];
  res.status(201).json({ ok: true, board: await boardView(squad, session.email), invite: { code: squad.inviteCode } });
});

router.post('/join', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const parsed = joinSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: 'Enter the six-character squad code.' });
  const code = parsed.data.code;

  // joint attempt limit: 5/minute and 15-minute lock after 10 wrong tries
  const attempts = await ATTEMPTS();
  const rec = attempts[session.email] || { wrong: 0, lockedUntil: 0, window: 0 };
  const now = Date.now();
  if (rec.lockedUntil && now < rec.lockedUntil) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }
  if (now - rec.window > 60000) { rec.window = now; rec.count = 0; }
  rec.count = (rec.count || 0) + 1;
  if (rec.count > 5) return res.status(429).json({ error: 'Slow down — try again in a minute.' });

  const result = await locked(async () => {
    const doc = await SQUADS();
    const squad = Object.values(doc).find((s) => s.inviteCode === code);
    if (!squad) {
      rec.wrong = (rec.wrong || 0) + 1;
      if (rec.wrong >= 10) { rec.lockedUntil = now + 15 * 60000; rec.wrong = 0; }
      attempts[session.email] = rec;
      await writeFile_(ATTEMPTS_FILE, attempts);
      return { error: 'That code doesn’t match a squad. Check it with your friend.', status: 404 };
    }
    const mine = Object.values(doc).find((s) => (s.members || []).some((m) => m.studentId === session.email));
    if (mine && mine.id === squad.id) {
      attempts[session.email] = rec;
      await writeFile_(ATTEMPTS_FILE, attempts);
      return { squad, already: true };
    }
    if (mine) {
      attempts[session.email] = rec;
      await writeFile_(ATTEMPTS_FILE, attempts);
      return { error: 'You’re already in a squad. Leave it first to join another.', status: 409 };
    }
    if ((squad.members || []).length >= MAX_MEMBERS) {
      attempts[session.email] = rec;
      await writeFile_(ATTEMPTS_FILE, attempts);
      return { error: `This squad is full (${MAX_MEMBERS} of ${MAX_MEMBERS}).`, status: 409 };
    }
    if (parsed.data.pendingToken) {
      const pending = await PENDING();
      const hash = createHash('sha256').update(parsed.data.pendingToken).digest('hex');
      const entry = pending[hash];
      if (!entry || entry.code !== code || Date.parse(entry.expiresAt) < now) {
        attempts[session.email] = rec;
        await writeFile_(ATTEMPTS_FILE, attempts);
        return { error: 'That invite link has expired. Ask for a fresh code.', status: 410 };
      }
      delete pending[hash];
      await savePending(pending);
    }
    squad.members = squad.members || [];
    squad.members.push({
      studentId: session.email,
      role: 'member',
      joinedAt: new Date().toISOString(),
      lastActiveAt: new Date().toISOString(),
      nudgesMuted: false,
    });
    await saveSquads(doc);
    attempts[session.email] = { ...rec, success: true };
    await writeFile_(ATTEMPTS_FILE, attempts);
    const accounts = await readAccounts();
    const info = memberNames(accounts, session.email);
    await pushEvent(squad.id, 'joined', `${info.name} joined the squad.`, session.email);
    return { squad };
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  const doc = await SQUADS();
  res.json({ ok: true, board: await boardView(result.squad, session.email) });
});

// Public join preview for the deep link — name and count only, IP throttled.
router.get('/public/join/:code', async (req, res) => {
  const ip = (req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress || 'ip').slice(0, 40);
  if (tooManyWrites(`ip:${ip}`)) return res.status(429).json({ error: 'Slow down a little.' });
  const doc = await SQUADS();
  const squad = Object.values(doc).find((s) => s.inviteCode === String(req.params.code || '').toUpperCase().replace(/[^A-Z0-9]/g, ''));
  if (!squad) return res.status(404).json({ error: 'That code doesn’t match a squad. Check it with your friend.' });
  res.json({ ok: true, name: squad.name, members: (squad.members || []).length, max: MAX_MEMBERS });
});

// Pending-join token for the signed-out deep link (7-day expiry, hashed).
router.post('/pending', async (req, res) => {
  const code = String(req.body?.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== CODE_LEN) return res.status(400).json({ error: 'Enter the six-character squad code.' });
  const doc = await SQUADS();
  const squad = Object.values(doc).find((s) => s.inviteCode === code);
  if (!squad) return res.status(404).json({ error: 'That code doesn’t match a squad.' });
  const token = randomUUID();
  const pending = await PENDING();
  const hash = createHash('sha256').update(token).digest('hex');
  pending[hash] = { code, expiresAt: new Date(Date.now() + 7 * 86400000).toISOString() };
  for (const [h, e] of Object.entries(pending)) {
    if (Date.parse(e.expiresAt) < Date.now()) delete pending[h];
  }
  await savePending(pending);
  res.json({ ok: true, token, expiresAt: pending[hash].expiresAt });
});

router.get('/sessions/:id/board', async (req, res) => res.status(404).json({ error: 'No such route.' })); // guards typosquatting

// Board: members only (row-level privacy by construction).
router.get('/:id/board', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const store = await locked(async () => {
    const doc = await SQUADS();
    const squad = doc[req.params.id];
    if (!squad || !(squad.members || []).some((m) => m.studentId === session.email)) return null;
    touch(squad, session.email);
    await saveSquads(doc);
    return squad;
  });
  if (!store) return res.status(404).json({ error: 'No such squad, or you’re not in it.' });
  res.json({ ok: true, board: await boardView(store, session.email), ai: false });
});

router.post('/:id/nudge', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const parsed = nudgeSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: 'Pick a squadmate to nudge.' });
  const result = await locked(async () => {
    const doc = await SQUADS();
    const squad = doc[req.params.id];
    if (!squad || !(squad.members || []).some((m) => m.studentId === session.email)) {
      return { status: 404, error: 'No such squad, or you’re not in it.' };
    }
    const target = (squad.members || []).find((m) => m.studentId === parsed.data.toId);
    if (!target || target.studentId === session.email) return { status: 400, error: 'Pick a squadmate to nudge — not yourself.' };
    if (target.nudgesMuted) return { status: 403, error: 'This squadmate muted nudges — respect the quiet.' };
    const accounts = await readAccounts();
    if (taskDayEntry(accounts[target.studentId.toLowerCase()], dayNow()).length > 0) {
      return { status: 400, error: 'They already finished today — no nudge needed.' };
    }
    if (recvQuiet()) return { status: 400, error: 'Quiet hours (10 PM – 7 AM IST) — nudges are off right now.' };
    const day = dayNow();
    const nudges = await NUDGES();
    nudges[day] = nudges[day] || {};
    nudges[day][session.email] = nudges[day][session.email] || {};
    if (nudges[day][session.email][target.studentId]) {
      return { status: 400, error: 'You already nudged this squadmate today — one nudge each lands better.' };
    }
    const sentToday = Object.keys(nudges[day][session.email]).length;
    if (sentToday >= NUDGES_PER_DAY) {
      return { status: 400, error: `You have sent ${NUDGES_PER_DAY} nudges today — the counter resets at midnight IST.` };
    }
    nudges[day][session.email][target.studentId] = 1;
    await saveNudges(nudges);
    const accounts2 = await readAccounts();
    const from = memberNames(accounts2, session.email).name;
    await pushEvent(squad.id, 'nudge', `${from} nudged ${memberNames(accounts2, target.studentId).name}.`, target.studentId);
    return { ok: true };
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  const doc = await SQUADS();
  res.json({ ok: true, board: await boardView(doc[req.params.id], session.email) });
});

router.patch('/:id', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const parsed = patchSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: parsed.error.issues[0]?.message ?? 'Nothing to change.' });
  if (tooManyWrites(session.email)) return res.status(429).json({ error: 'Too many squad actions in a minute.' });
  const result = await locked(async () => {
    const doc = await SQUADS();
    const squad = doc[req.params.id];
    if (!squad || !(squad.members || []).some((m) => m.studentId === session.email)) return { status: 404, error: 'No such squad.' };
    const isOwner = squad.ownerId === session.email;
    if ((parsed.data.name !== undefined || parsed.data.freezeEnabled !== undefined) && !isOwner) {
      return { status: 403, error: 'Only the squad owner can change these.' };
    }
    if (parsed.data.name !== undefined) squad.name = parsed.data.name;
    if (parsed.data.freezeEnabled !== undefined) squad.freezeEnabled = parsed.data.freezeEnabled;
    if (parsed.data.nudgesMuted !== undefined) {
      const me = (squad.members || []).find((m) => m.studentId === session.email);
      me.nudgesMuted = parsed.data.nudgesMuted;
    }
    await saveSquads(doc);
    return { ok: true };
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  const doc = await SQUADS();
  res.json({ ok: true, board: await boardView(doc[req.params.id], session.email) });
});

router.post('/:id/invite/reset', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const result = await locked(async () => {
    const doc = await SQUADS();
    const squad = doc[req.params.id];
    if (!squad) return { status: 404, error: 'No such squad.' };
    if (squad.ownerId !== session.email) return { status: 403, error: 'Only the squad owner can reset the code.' };
    squad.inviteCode = newCode(doc);
    await saveSquads(doc);
    return { ok: true, code: squad.inviteCode };
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  const doc = await SQUADS();
  res.json({ ok: true, board: await boardView(doc[req.params.id], session.email) });
});

router.post('/:id/leave', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const result = await locked(async () => {
    const doc = await SQUADS();
    const id = req.params.id;
    const squad = doc[id];
    if (!squad || !(squad.members || []).some((m) => m.studentId === session.email)) return null;
    const leaver = (squad.members || []).find((m) => m.studentId === session.email);
    const accounts = await readAccounts();
    const leaverName = memberNames(accounts, session.email).name;
    squad.members = squad.members.filter((m) => m.studentId !== session.email);
    if (squad.ownerId === session.email) {
      if (squad.members.length === 0) {
        delete doc[id];
        await saveSquads(doc);
        return { deleted: true };
      }
      const next = [...squad.members].sort((a, b) => (a.joinedAt < b.joinedAt ? -1 : 1))[0];
      squad.ownerId = next.studentId;
      next.role = 'owner';
    }
    if (squad.members.length === 0) {
      delete doc[id];
      await saveSquads(doc);
      return { deleted: true };
    }
    await saveSquads(doc);
    await pushEvent(id, 'left', `${leaverName} left the squad.`, session.email);
    return { deleted: false };
  });
  if (!result) return res.json({ ok: true, left: false });
  res.json({ ok: true, left: !result.deleted, deletedSquad: Boolean(result.deleted) });
});

router.post('/:id/report', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const parsed = reportSchema.safeParse(req.body || {});
  if (!parsed.success) return res.status(400).json({ error: 'Add a short reason so a human can review.' });
  const result = await locked(async () => {
    const doc = await SQUADS();
    const squad = doc[req.params.id];
    if (!squad || !(squad.members || []).some((m) => m.studentId === session.email)) return { status: 404, error: 'No such squad.' };
    if (!(squad.members || []).some((m) => m.studentId === parsed.data.memberEmail)) {
      return { status: 400, error: 'That student is not in this squad.' };
    }
    squad.reports = squad.reports || [];
    squad.reports.push({ by: session.email, member: parsed.data.memberEmail, reason: parsed.data.reason, at: new Date().toISOString() });
    await saveSquads(doc);
    return { ok: true };
  });
  if (result.error) return res.status(result.status).json({ error: result.error });
  res.json({ ok: true });
});

export default router;
