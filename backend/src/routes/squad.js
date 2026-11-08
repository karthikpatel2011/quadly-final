import { Router } from 'express';
import { randomInt } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';

// Squad: study groups of 2–4 students with a shared 6-char join code and
// "done today" accountability derived read-only from each member's live
// dashboard. Per AGENTS.md/feature-protocol this route owns
// backend/data/squads.json — { [code]: { name, members, createdAt, nudges } }.
//
// Done-today rule (per spec): a member is "done today" only when we can read
// their in-memory account (they hold a valid token this session, i.e. they
// made an authenticated request this process and refreshed presence) and
// account.dashboard.done has ≥1 entry for today's mission-day key. Members
// without a live session render as "offline" — never invented. auth.js does
// not export an email→account lookup, so this route keeps a small in-memory
// presence map refreshed on every authenticated squad request (the Squad page
// polls while open). If the server restarts, accounts and presence both die,
// which is exactly the "no live session → offline" contract.

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const FILE = DATA_DIR + 'squads.json';

const CODE_LEN = 6;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no 0/O, 1/I — codes that read out loud
const MAX_MEMBERS = 4;         // matches the product copy: study with 2–4 friends
const NUDGE_DAILY_CAP = 2;     // max nudges sent per sender per IST day
const QUIET_START_MIN = 22 * 60; // 22:00 IST
const QUIET_END_MIN = 6 * 60;    // 06:00 IST
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;
const PRESENCE_WINDOW_MS = 90 * 1000; // last authenticated squad/drive-side refresh counts as online

// read-only presence cache
const presence = new Map(); // email -> { seenAt, name, doneToday }

const todayUTC = () => new Date().toISOString().slice(0, 10); // mission-day key, matches dashboard.js

async function readDoc() {
  try {
    const doc = JSON.parse(await readFile(FILE, 'utf8'));
    return doc && typeof doc === 'object' ? doc : {};
  } catch {
    return {};
  }
}

async function writeDoc(doc) {
  await writeFile(FILE, JSON.stringify(doc, null, 2));
}

// Serialize read-modify-write on squads.json so two students nudging or
// joining at the same instant cannot drop each other's update.
let writeChain = Promise.resolve();
function withFileLock(fn) {
  const run = writeChain.then(fn);
  writeChain = run.then(() => {}, () => {});
  return run;
}

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
  touchPresence(session);
  return session;
}

// ---------- IST time helpers (quiet hours + daily nudge day key) ----------

function istParts(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  return {
    minutes: shifted.getUTCHours() * 60 + shifted.getUTCMinutes(),
    day: shifted.toISOString().slice(0, 10), // IST calendar day
  };
}

function isQuietHours(now = new Date()) {
  const { minutes } = istParts(now);
  return minutes >= QUIET_START_MIN || minutes < QUIET_END_MIN;
}

// Next 06:00 IST (as ISO) so the UI can say when nudges reopen.
function nextQuietEnd(now = new Date()) {
  const shifted = new Date(now.getTime() + IST_OFFSET_MS);
  let open = Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate(), QUIET_END_MIN, 0, 0) - IST_OFFSET_MS;
  if (open <= now.getTime()) open += 24 * 60 * 60 * 1000;
  return new Date(open).toISOString();
}

// ---------- presence + member view ----------

// Public for sibling feature routes (drive.js) so any squad member who loads
// any squad-tier page keeps presence fresh. Read-only on the account.
/** Read adapter for Home: one student's squad summary (no writes here).
 *  Returns { squad: { name, maxMembers, members: [{email, isMe, online,
 *  doneToday, nudgesReceived}], nudgesLeft, nudgeCap } } or { squad: null }. */
export async function summaryFor(email) {
  const doc = await readDoc();
  const found = squadOf(doc, email);
  if (!found) return { squad: null };
  return stateFor(doc, { email, account: {} }, found);
}

export function touchPresence(session, now = Date.now()) {
  const account = session?.account || {};
  const doneToday = ((account.dashboard?.done || {})[todayUTC()] || []).length > 0;
  presence.set(session.email, {
    seenAt: now,
    name: account.profile?.name || null,
    doneToday,
  });
}

function nameFallback(email) {
  const local = String(email || '').split('@')[0].replace(/[._-]+/g, ' ').trim();
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : 'Student';
}

function squadOf(doc, email) {
  for (const [code, squad] of Object.entries(doc)) {
    if (squad && Array.isArray(squad.members) && squad.members.includes(email)) {
      return { code, squad };
    }
  }
  return null;
}

function memberViews(squad, meEmail, now = Date.now()) {
  return squad.members.map((email) => {
    const seen = presence.get(email);
    const online = Boolean(seen) && now - seen.seenAt <= PRESENCE_WINDOW_MS;
    return {
      email,
      name: online && seen.name ? seen.name : null, // display names only from live sessions; else the client shows the email
      isMe: email === meEmail,
      online,
      doneToday: online ? seen.doneToday : null, // null ⇒ "offline", never guessed
      nudgesReceived: squad.nudgesReceived?.[email] || 0,
    };
  });
}

// Per-sender nudge budget for the day, summed across every squad the sender
// belongs to (the 2/day cap is about the sender, not the squad).
function nudgesSentToday(doc, email, day) {
  let n = 0;
  for (const squad of Object.values(doc)) {
    n += squad.nudgesSent?.[day]?.[email] || 0;
  }
  return n;
}

function stateFor(doc, session, mySquad) {
  const { day } = istParts();
  return {
    ok: true,
    me: session.email,
    squad: mySquad
      ? {
          code: mySquad.code,
          name: mySquad.squad.name,
          createdAt: mySquad.squad.createdAt,
          maxMembers: MAX_MEMBERS,
          members: memberViews(mySquad.squad, session.email),
          nudgesLeft: Math.max(0, NUDGE_DAILY_CAP - nudgesSentToday(doc, session.email, day)),
          nudgeCap: NUDGE_DAILY_CAP,
          quiet: {
            active: isQuietHours(),
            window: '10:00 PM – 6:00 AM IST',
            nextOpenAt: nextQuietEnd(),
          },
        }
      : null,
  };
}

function newCode(doc) {
  let code = '';
  do {
    code = Array.from({ length: CODE_LEN }, () => CODE_ALPHABET[randomInt(CODE_ALPHABET.length)]).join('');
  } while (doc[code]);
  return code;
}

// ---------- routes ----------

// Full squad state for the signed-in student. Also refreshes the caller's
// presence (done-today is derived from their live dashboard at this moment).
router.get('/state', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const doc = await readDoc();
    const found = squadOf(doc, session.email);
    res.json(stateFor(doc, session, found));
  } catch {
    res.status(500).json({ error: 'Squad data could not be read — try again in a moment.' });
  }
});

// Kept from the stub so probes keep answering JSON.
router.get('/health', (req, res) => res.json({ ok: true, feature: 'squad' }));

// Create a squad with an auto 6-char join code. One squad per student.
router.post('/create', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const rawName = String(req.body?.name || '').trim().slice(0, 40);
    const result = await withFileLock(async () => {
      const doc = await readDoc();
      if (squadOf(doc, session.email)) {
        return { error: 'You are already in a squad — leave it before creating a new one.', status: 409 };
      }
      const firstName = session.account.profile?.name?.split(' ')[0] || nameFallback(session.email).split(' ')[0];
      const squad = {
        name: rawName || `${firstName}’s squad`,
        members: [session.email],
        createdAt: new Date().toISOString(),
        nudgesSent: {},
        nudgesReceived: {},
      };
      const code = newCode(doc);
      doc[code] = squad;
      await writeDoc(doc);
      return { code, squad };
    });
    if (result.error) return res.status(result.status).json({ error: result.error });
    const doc = await readDoc();
    res.status(201).json(stateFor(doc, session, { code: result.code, squad: result.squad }));
  } catch {
    res.status(500).json({ error: 'The squad could not be saved — try again in a moment.' });
  }
});

// Join by the 6-char code. Idempotent for the squad you are already in.
router.post('/join', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const code = String(req.body?.code || '').trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (code.length !== CODE_LEN) {
    return res.status(400).json({ error: `Enter the ${CODE_LEN}-character squad code.` });
  }
  try {
    const message = await withFileLock(async () => {
      const doc = await readDoc();
      const mine = squadOf(doc, session.email);
      if (mine && mine.code === code) return null; // already a member — idempotent
      const target = doc[code];
      if (!target || !Array.isArray(target.members)) {
        return { error: 'No squad with that code — check the six characters with your friend.', status: 404 };
      }
      if (mine) {
        return { error: 'You are already in another squad — leave it first, then join this one.', status: 409 };
      }
      if (target.members.length >= MAX_MEMBERS) {
        return { error: `That squad is full (${MAX_MEMBERS} members max) — start your own squad instead.`, status: 409 };
      }
      target.members.push(session.email);
      await writeDoc(doc);
      return null;
    });
    if (message) return res.status(message.status).json({ error: message.error });
    const doc = await readDoc();
    res.json(stateFor(doc, session, squadOf(doc, session.email)));
  } catch {
    res.status(500).json({ error: 'The squad could not be joined — try again in a moment.' });
  }
});

// Leave your squad. A squad with no members left is removed entirely.
router.post('/leave', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  try {
    const leftSomething = await withFileLock(async () => {
      const doc = await readDoc();
      const found = squadOf(doc, session.email);
      if (!found) return false;
      const squad = found.squad;
      squad.members = squad.members.filter((m) => m !== session.email);
      if (squad.members.length === 0) {
        delete doc[found.code]; // last one out deletes the record
      }
      await writeDoc(doc);
      return true;
    });
    const doc = await readDoc();
    res.json({ ...stateFor(doc, session, squadOf(doc, session.email)), left: leftSomething });
  } catch {
    res.status(500).json({ error: 'Could not leave right now — try again in a moment.' });
  }
});

// Nudge one squad member. Server-enforced limits: max 2/day per sender
// (IST day, across squads) and quiet hours 22:00–06:00 IST → 400 friendly.
router.post('/nudge', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const member = String(req.body?.member || '').trim().toLowerCase();
  try {
    const failure = await withFileLock(async () => {
      const doc = await readDoc();
      const found = squadOf(doc, session.email);
      if (!found) return { status: 400, error: 'Join a squad first — nudges go to your squadmates.' };
      if (!member || !found.squad.members.includes(member) || member === session.email) {
        return { status: 400, error: 'Pick a squadmate to nudge — not yourself, not a stranger.' };
      }
      if (isQuietHours()) {
        return {
          status: 400,
          error: 'Quiet hours — nudges pause from 10 PM to 6 AM IST so nobody gets buzzed late at night. Try again after 6 AM.',
        };
      }
      const { day } = istParts();
      if (nudgesSentToday(doc, session.email, day) >= NUDGE_DAILY_CAP) {
        return {
          status: 400,
          error: `You have sent ${NUDGE_DAILY_CAP} nudges today — the counter resets at midnight IST.`,
        };
      }
      const squad = found.squad;
      squad.nudgesSent = squad.nudgesSent || {};
      squad.nudgesSent[day] = squad.nudgesSent[day] || {};
      squad.nudgesSent[day][session.email] = (squad.nudgesSent[day][session.email] || 0) + 1;
      squad.nudgesReceived = squad.nudgesReceived || {};
      squad.nudgesReceived[member] = (squad.nudgesReceived[member] || 0) + 1;
      await writeDoc(doc);
      return null;
    });
    if (failure) return res.status(failure.status).json({ error: failure.error });
    const doc = await readDoc();
    res.json(stateFor(doc, session, squadOf(doc, session.email)));
  } catch {
    res.status(500).json({ error: 'The nudge could not be sent — try again in a moment.' });
  }
});

export default router;
