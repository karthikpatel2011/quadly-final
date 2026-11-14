// Home V1 — a calm personal page: "What should I do today, and what is new
// for me?" No posting, no free-form feed. Everything is read from the other
// features through narrow adapters (Plan/day tasks via buildPayload, Daily 15
// via practice.js, the drive via drive.js, the squad via squad.js); writes
// here are only the student's own (avatar, leaderboard-name consent) and the
// official college items an admin schedules. Files under backend/data/:
//   official-items.json · official-audit.json · home-views.json · avatars/
// Day/week logic: the 4 am India rollover lives in lib/streaks.js.

import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import {
  readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, unlinkSync,
} from 'node:fs';
import path from 'node:path';
import { z } from 'zod';
import { resolveSession, markOnboarded } from './auth.js';
import { buildPayload } from './dashboard.js';
import { drillResultFor, drillCompletionsOnDay } from './practice.js';
import { driveSummaryFor } from './drive.js';
import { summaryFor as squadSummaryFor } from './squad.js';

const router = Router();

const dataDir = path.resolve(import.meta.dirname, '../../data/');
const avatarDir = path.join(dataDir, 'avatars/');
const filePath = (name) => path.join(dataDir, name);

function readJSON(name, fallback) {
  const file = filePath(name);
  if (!existsSync(file)) return fallback;
  try {
    return JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function writeJSON(name, data) {
  mkdirSync(dataDir, { recursive: true });
  const tmp = filePath(name + '.tmp');
  writeFileSync(tmp, JSON.stringify(data, null, 2));
  renameSync(tmp, filePath(name));
}

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

// ---------- time: UTC store, IST display, 4 am India rollover ----------

function istDayKey(ms = Date.now()) {
  return new Date(ms + 90 * 60_000).toISOString().slice(0, 10);
}

function istLabelFor(key) {
  const d = new Date(`${key}T00:00:00+05:30`);
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });
}

function istWhenText(iso) {
  const d = new Date(iso);
  return d.toLocaleString('en-IN', {
    weekday: 'short', hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata',
  });
}

// Task category → the real activity that completes it.
const HREF_BY_CATEGORY = {
  learn: 'practice',
  interview: 'interviews',
  ship: 'projects',
  apply: 'plan',
  network: 'squad',
};

const accountsMap = () => readJSON('accounts.json', {});

// ---------- official college items (admin-written, student-read) ----------

const OFFICIAL_MAX = 3; // at most three items on Home — calm, not a noticeboard

const officialSchema = z.object({
  title: z.string().trim().min(3).max(120),
  body: z.string().trim().min(3).max(300),
  link: z.string().trim().url().max(300).optional().or(z.literal('')),
  college: z.string().trim().max(120), // 'all' or one college name
  startsAt: z.string().datetime(),
  endsAt: z.string().datetime(),
});

function officialItems() {
  return readJSON('official-items.json', []);
}

function auditOfficial(action, item, by) {
  const log = readJSON('official-audit.json', []);
  log.push({
    id: `ofa_${randomUUID()}`,
    action,
    itemId: item?.id ?? null,
    title: item?.title ?? null,
    by: by || '--admin--',
    at: new Date().toISOString(),
  });
  writeJSON('official-audit.json', log.slice(-500));
}

function activeNoticesFor(college, email, now = Date.now()) {
  const items = officialItems()
    .filter((it) => {
      const start = Date.parse(it.startsAt);
      const end = Date.parse(it.endsAt);
      if (!(Number.isFinite(start) && Number.isFinite(end))) return false;
      if (now < start || now > end) return false; // scheduled, not ended — dead items never ship
      return it.college === 'all' || (college && it.college === college);
    })
    .sort((a, b) => Date.parse(b.startsAt) - Date.parse(a.startsAt))
    .slice(0, OFFICIAL_MAX);

  // "New" marking: anything created after this student's last read of Home.
  const viewsDoc = readJSON('home-views.json', {});
  const mine = viewsDoc[email] || {};
  const nowMs = Date.now();
  const marked = items.map((it) => ({ ...it, isNew: nowMs - Date.parse(it.createdAt || it.startsAt || 0) > 0 && !mine[it.id] }));
  const seen = { ...mine };
  for (const it of items) seen[it.id] = nowMs;
  viewsDoc[email] = seen;
  writeJSON('home-views.json', viewsDoc);
  return marked;
}

// ---------- GET /home ----------

router.get('/home', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const email = session.email;
  const profile = session.account.profile || {};
  const payload = buildPayload(email, session);
  const college = profile.college || null;
  const date = payload.date || new Date().toISOString().slice(0, 10);
  const label = istLabelFor(istDayKey());

  // Section 1 — Today: plan missions, streak rule from lib/streaks.js.
  let today;
  try {
    const missions = payload.missions.map((m) => ({
      id: m.id,
      category: m.category,
      categoryLabel: { learn: 'Learn', interview: 'Interview', ship: 'Ship', apply: 'Apply', network: 'Network' }[m.category] || m.category,
      title: m.title,
      minutes: m.minutes || 15,
      done: Boolean(m.done),
      result: m.result || null,
      href: HREF_BY_CATEGORY[m.category] || 'plan',
    }));
    const minutesLeft = missions.filter((m) => !m.done).reduce((n, m) => n + (m.minutes || 15), 0);
    today = {
      status: 'ok',
      data: {
        date,
        label,
        name: payload.name,
        college: payload.college,
        avatar: payload.avatar,
        onboarded: Boolean(session.account.onboarded),
        hasPlan: Boolean(payload.plan),
        plan: payload.plan,
        missions,
        doneCount: missions.filter((m) => m.done).length,
        total: missions.length,
        minutesLeft,
        streak: payload.streak,
        freezesLeft: payload.freezesLeft ?? 1,
        missedDays: payload.missedDays ?? 0,
        streakFresh: Boolean(payload.streakFresh),
      },
    };
  } catch {
    today = { status: 'error', data: null };
  }

  // Section 2 — Today's practice: the day's drill for this student, plus how
  // many classmates finished it today (a count only — no names at drill level).
  let challenge;
  try {
    const drill = await drillResultFor(email);
    const players = await drillCompletionsOnDay(date);
    const collegeMates = players.filter((e) => e !== email
      && (accountsMap()[e]?.profile?.college || null) === college);
    challenge = {
      status: 'ok',
      data: {
        title: drill.title ? `Daily drill — ${drill.title}` : 'Daily drill',
        seasonName: drill.seasonName,
        answered: drill.answeredToday,
        correct: drill.correct,
        takeaway: drill.takeaway,
        href: 'practice/drill',
        minutes: 5,
        playedAtCollege: collegeMates.length,
      },
    };
  } catch {
    challenge = { status: 'error', data: null };
  }

  // Section 3 — Your college this week: the next drive + official items.
  let collegeWeek;
  try {
    const drive = await driveSummaryFor(email);
    collegeWeek = {
      status: 'ok',
      data: {
        drive: {
          startsAt: drive.startsAt,
          serverNow: drive.serverNow,
          capacity: drive.capacity,
          registered: drive.registered,
          registeredByMe: drive.registeredByMe,
          live: drive.live,
          whenText: istWhenText(drive.startsAt),
        },
        notices: activeNoticesFor(college, email),
      },
    };
  } catch {
    collegeWeek = { status: 'error', data: null };
  }

  // Section 4 — Your wins: private, generated only from verified data.
  let wins;
  try {
    const items = [];
    if (payload.streak > 0 && payload.streak % 7 === 0) {
      items.push({ id: `win-streak-${payload.streak}`, text: `${payload.streak}-day streak — kept by finished work.`, at: new Date().toISOString() });
    }
    const attemptsI = readJSON('interview-attempts.json', {});
    const mineI = attemptsI[email] || {};
    const days = Object.values(mineI);
    if (days.length >= 4) {
      const sorted = [...days].sort((a, b) => String(a.at).localeCompare(String(b.at)));
      const half = Math.floor(sorted.length / 2);
      const avg = (list) => list.reduce((n, x) => n + (Number(x.selfScore) || 0), 0) / list.length;
      const older = avg(sorted.slice(0, half));
      const newer = avg(sorted.slice(half));
      if (newer > older + 0.15) {
        items.push({
          id: `win-interview-${sorted[sorted.length - 1].at}`,
          text: `Interview self-score improving — ${older.toFixed(1)} → ${newer.toFixed(1)} average.`,
          at: sorted[sorted.length - 1].at,
        });
      }
    }
    const projects = readJSON('projects.json', []);
    const mineP = projects.filter((pj) => pj.email === email);
    const bestP = mineP
      .map((pj) => ({ title: pj.title || 'Your project', score: pj.doctor?.score, total: pj.doctor?.total, at: pj.updatedAt || pj.createdAt }))
      .filter((pj) => typeof pj.score === 'number' && pj.score >= 4 && pj.at)
      .sort((a, b) => String(b.at).localeCompare(String(a.at)))[0];
    if (bestP) {
      items.push({ id: `win-project-${bestP.title}`, text: `${bestP.title} — doctor score ${bestP.score}/${bestP.total}.`, at: bestP.at });
    }
    wins = { status: items.length > 0 ? 'ok' : 'empty', data: { items: items.slice(-3).reverse() } };
  } catch {
    wins = { status: 'error', data: { items: [] } };
  }

  // Section 5 — Your squad (read adapter; squad.js owns its own files).
  let squad;
  try {
    const state = await squadSummaryFor(email);
    squad = { status: 'ok', data: state };
  } catch {
    squad = { status: 'error', data: { squad: null } };
  }

  // End of the page: "You're caught up" + the next scheduled thing.
  let caughtUp;
  try {
    const drive = collegeWeek?.status === 'ok' ? collegeWeek.data.drive : null;
    caughtUp = {
      status: 'ok',
      data: {
        next: drive ? { label: 'Mock drive', at: drive.startsAt, whenText: drive.whenText } : null,
      },
    };
  } catch {
    caughtUp = { status: 'error', data: { next: null } };
  }

  res.json({
    ok: true,
    date,
    label,
    today,
    challenge,
    collegeWeek,
    wins,
    squad,
    caughtUp,
  });
});

// ---------- leaderboard-name consent (top scorers show names only with it) ----------

router.get('/profile/show-name', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  res.json({ ok: true, showName: session.account.profile?.showName === true });
});

router.post('/profile/show-name', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const show = req.body?.show === true;
  const profile = { ...(session.account.profile || {}) };
  profile.showName = show;
  markOnboarded(session.email, profile);
  res.json({ ok: true, showName: show });
});

// ---------- avatar upload (magic bytes, metadata strip, random name) ----------

const AVATAR_MAGIC = {
  png: { bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), ext: 'png', type: 'image/png' },
  jpg: { bytes: Buffer.from([0xff, 0xd8, 0xff]), ext: 'jpg', type: 'image/jpeg' },
  webp: { bytes: Buffer.from('RIFF'), ext: 'webp', type: 'image/webp' },
};
const MAX_AVATAR_BINARY = 2 * 1024 * 1024; // 2 MB, per the Home spec
const MAX_AVATAR_DIM = 1024;

function detectImage(buf) {
  for (const [kind, spec] of Object.entries(AVATAR_MAGIC)) {
    if (kind === 'webp') {
      if (buf.length > 12 && buf.subarray(0, 4).equals(spec.bytes) && buf.subarray(8, 12).toString('ascii') === 'WEBP') return kind;
    } else if (buf.subarray(0, spec.bytes.length).equals(spec.bytes)) {
      return kind;
    }
  }
  return null;
}

function pngDims(buf) {
  return buf.length >= 24 ? { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) } : null;
}

function jpegDims(buf) {
  for (let i = 2; i < buf.length - 9;) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const len = buf.readUInt16BE(i + 2);
    const isSOF = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isSOF) return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    i += 2 + len;
  }
  return null;
}

function webpDims(buf) {
  if (buf.subarray(12, 16).toString('ascii') === 'VP8X' && buf.length >= 30) {
    const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
    const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
    return { w, h };
  }
  return null; // simple WebP carries no metadata to trust — size stays gated by bytes
}

/** PNG: keep only IHDR/PLTE/tRNS/IDAT/IEND — eXIf/tEXt/iCCP/pHYs never ship. */
function stripPng(buf) {
  const keep = new Set(['IHDR', 'PLTE', 'tRNS', 'IDAT', 'IEND']);
  const out = [AVATAR_MAGIC.png.bytes];
  let at = 8;
  while (at + 8 <= buf.length) {
    const len = buf.readUInt32BE(at);
    const type = buf.subarray(at + 4, at + 8).toString('ascii');
    const end = at + 12 + len;
    if (end > buf.length) break;
    if (keep.has(type)) out.push(buf.subarray(at, end)); // length+type+data+crc (a valid chunk)
    at = end;
    if (type === 'IEND') break;
  }
  return Buffer.concat(out);
}

/** JPEG: drop the APPn (n>0) comment/marker payloads that carry EXIF. */
function stripJpeg(buf) {
  const parts = [buf.subarray(0, 2)];
  let at = 2;
  while (at < buf.length - 3) {
    if (buf[at] !== 0xff) { at++; continue; }
    const marker = buf[at + 1];
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7) || marker === 0xff) {
      parts.push(buf.subarray(at, at + 2));
      at += 2;
      continue;
    }
    const len = buf.readUInt16BE(at + 2);
    const keepSegment = marker === 0xda || marker === 0xd9
      || !(marker >= 0xe1 && marker <= 0xef) && marker !== 0xfe; // drop APP1..APP15 + COM
    const seg = buf.subarray(at, Math.min(buf.length, at + 2 + len));
    if (keepSegment) parts.push(seg);
    at = endOfMarker(at, len);
    if (marker === 0xda) break; // entropy-coded data follows verbatim
  }
  if (at < buf.length) parts.push(buf.subarray(at));
  return Buffer.concat(parts);
}

function endOfMarker(at, len) {
  return at + 2 + len;
}

/** WebP: rebuild the RIFF container without EXIF/XMP/ICCP chunks. */
function stripWebp(buf) {
  const chunks = [];
  let at = 12;
  let hadMeta = false;
  while (at + 8 <= buf.length) {
    const type = buf.subarray(at, at + 4).toString('ascii');
    const len = buf.readUInt32LE(at + 4);
    const dataEnd = Math.min(buf.length, at + 8 + len + (len % 2));
    if (!['VP8 ', 'VP8L', 'VP8X', 'ALPH'].includes(type)) { hadMeta = true; }
    else chunks.push([type, buf.subarray(at + 8, Math.min(buf.length, at + 8 + len))]);
    at = dataEnd;
  }
  if (!hadMeta || chunks.length === 0) return buf; // nothing to strip
  const metadataFlags = 0x20 | 0x08 | 0x04; // ICC / EXIF / XMP
  const body = [];
  for (const [type, data] of chunks) {
    if (type === 'VP8X') {
      data[4] = data[4] & ~metadataFlags & 0xff; // keep alpha bit, drop metadata flags
      data[4] = data[4] | (chunks.some(([t]) => t === 'ALPH') ? 0x10 : 0);
    }
    const chunk = Buffer.concat([Buffer.from(type, 'ascii'), (() => { const l = Buffer.alloc(4); l.writeUInt32LE(data.length); return l; })(), data, data.length % 2 ? Buffer.from([0]) : Buffer.alloc(0)]);
    body.push(chunk);
  }
  const size = Buffer.alloc(4);
  size.writeUInt32LE(body.reduce((n, b) => n + b.length, 4 /* 'WEBP' */));
  return Buffer.concat([Buffer.from('RIFF'), size, Buffer.from('WEBP'), ...body]);
}

const avatarUploadSchema = z.object({
  dataUrl: z.string().regex(/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/, 'Avatars must be PNG, JPG, or WebP images.'),
});

router.post('/profile/avatar', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  if (!session.account.onboarded) {
    return res.status(409).json({ error: 'Finish onboarding first, then set your picture here.' });
  }
  const parsed = avatarUploadSchema.safeParse(req.body || {});
  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.issues[0]?.message });
  }
  const b64 = parsed.data.dataUrl.slice(parsed.data.dataUrl.indexOf(',') + 1);
  if (b64.length > MAX_AVATAR_BINARY * 1.4) {
    return res.status(413).json({ error: 'That image is too large — keep avatars under 2 MB.' });
  }
  let raw;
  try {
    raw = Buffer.from(b64, 'base64');
  } catch {
    return res.status(400).json({ error: 'The image data could not be read.' });
  }
  if (raw.length > MAX_AVATAR_BINARY) {
    return res.status(413).json({ error: 'That image is too large — keep avatars under 2 MB.' });
  }
  const kind = detectImage(raw);
  if (!kind) {
    return res.status(400).json({ error: 'That file is not a real PNG, JPG, or WebP image.' });
  }
  const dims = kind === 'png' ? pngDims(raw) : kind === 'jpg' ? jpegDims(raw) : webpDims(raw);
  if (dims && (dims.w > MAX_AVATAR_DIM || dims.h > MAX_AVATAR_DIM)) {
    return res.status(400).json({ error: `Avatars stay at ${MAX_AVATAR_DIM}×${MAX_AVATAR_DIM} or smaller — they are shown square.` });
  }
  const stripped = kind === 'png' ? stripPng(raw) : kind === 'jpg' ? stripJpeg(raw) : stripWebp(raw);

  mkdirSync(avatarDir, { recursive: true });
  const name = `ava_${randomUUID()}.${kind === 'jpg' ? 'jpg' : kind}`;
  writeFileSync(path.join(avatarDir, name), stripped);

  const prof = { ...(session.account.profile || {}) };
  const previous = prof.avatar;
  if (previous && String(previous).startsWith('custom:')) {
    try { unlinkSync(path.join(avatarDir, String(previous).slice(7))); } catch { /* already gone */ }
  } else if (previous && !prof.avatarPreset) {
    prof.avatarPreset = previous; // remember the settled pick for "remove"
  }
  prof.avatar = `custom:${name}`;
  markOnboarded(session.email, prof); // persists via the auth store we must not touch

  res.status(201).json({ ok: true, avatar: `/api/avatars/${name}`, preset: prof.avatarPreset || null });
});

router.get('/profile/avatar', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const profile = session.account.profile || {};
  const custom = String(profile.avatar || '').startsWith('custom:') ? profile.avatar.slice(7) : null;
  res.json({
    ok: true,
    custom: custom ? `/api/avatars/${custom}` : null,
    preset: custom ? (profile.avatarPreset || null) : (profile.avatar || null),
  });
});

router.delete('/profile/avatar', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const profile = { ...(session.account.profile || {}) };
  const custom = String(profile.avatar || '').startsWith('custom:') ? profile.avatar.slice(7) : null;
  if (custom) {
    try { unlinkSync(path.join(avatarDir, custom)); } catch { /* already gone */ }
    profile.avatar = profile.avatarPreset || null; // fall back to the preset pick
  }
  const preset = profile.avatar;
  profile.avatarPreset = undefined;
  markOnboarded(session.email, profile);
  res.json({ ok: true, preset: preset || null });
});

// Uploaded avatars — private to the signed-in student, random file names.
router.get('/avatars/:file', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const file = String(req.params.file || '');
  const types = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp' };
  const m = file.match(/^ava_[0-9a-f-]+\.(png|jpg|webp)$/);
  if (!m) return res.status(404).json({ error: 'No such avatar.' });
  const file2 = path.join(avatarDir, file);
  if (!file2.startsWith(avatarDir) || !existsSync(file2)) {
    return res.status(404).json({ error: 'No such avatar.' });
  }
  res.setHeader('Content-Type', types[m[1]]);
  res.setHeader('Cache-Control', 'private, max-age=86400');
  res.send(readFileSync(file2));
});

export default router;
