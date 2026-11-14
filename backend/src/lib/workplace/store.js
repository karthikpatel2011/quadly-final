// Workplace runtime store — progress, submissions, chat quota, and the
// skills passport. JSON documents under backend/data/ (the documented
// pre-beta store; migrations/workplace.sql is the Supabase target with the
// same shapes). Writes are atomic (tmp + rename); every document is keyed
// by student email and routes resolve the key from the session, never from
// the request body.

import { readFile, writeFile, rename, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../../../data/', import.meta.url));
const pathFor = (name) => DATA_DIR + name;

const caches = new Map();

async function cached(name, fallback) {
  let entry = caches.get(name);
  if (!entry) {
    entry = { doc: fallback, loading: null };
    const loading = (async () => {
      let doc = fallback;
      try {
        const raw = JSON.parse(await readFile(pathFor(name), 'utf8'));
        if (raw && typeof raw === 'object') doc = raw;
      } catch {
        /* first boot or corrupt — the fallback is the truth */
      }
      entry.doc = doc;
      entry.loading = null;
      return doc;
    })();
    entry.loading = loading;
    caches.set(name, entry);
  }
  return entry.loading ? entry.loading.then(() => entry.doc) : entry.doc;
}

async function persist(name) {
  const entry = caches.get(name);
  if (!entry) return;
  await mkdir(DATA_DIR, { recursive: true });
  const tmp = pathFor(name + '.tmp');
  await writeFile(tmp, JSON.stringify(entry.doc, null, 2));
  await rename(tmp, pathFor(name));
}

export function getProgress(email) {
  return cached('workplace-progress.json', {}).then((doc) => doc[String(email || '').toLowerCase()] || null);
}

export function saveProgress(email, progress) {
  return cached('workplace-progress.json', {}).then((doc) => {
    doc[String(email || '').toLowerCase()] = { ...progress, lastActiveAt: new Date().toISOString() };
    return persist('workplace-progress.json').then(() => doc[String(email || '').toLowerCase()]);
  });
}

export function getSubmissions(email) {
  return cached('workplace-submissions.json', {}).then((doc) => doc[String(email || '').toLowerCase()] || []);
}

export function addSubmission(email, submission) {
  return cached('workplace-submissions.json', {}).then((doc) => {
    const key = String(email || '').toLowerCase();
    const list = doc[key] || [];
    list.push({ ...submission, createdAt: new Date().toISOString() });
    doc[key] = list.slice(-100); // the record never balloons; latest 100 kept
    return persist('workplace-submissions.json').then(() => doc[key]);
  });
}

export function getPassport(email) {
  return cached('workplace-passports.json', {}).then((doc) => doc[String(email || '').toLowerCase()] || null);
}

export function savePassport(email, passport) {
  return cached('workplace-passports.json', {}).then((doc) => {
    doc[String(email || '').toLowerCase()] = { ...passport, updatedAt: new Date().toISOString() };
    return persist('workplace-passports.json').then(() => doc[String(email || '').toLowerCase()]);
  });
}

// Chat quota — a daily per-student cap so no character conversation can run
// away with the AI spend (the prompt-injection surface is capped with it).
const CHAT_DAILY_CAP = 12;

export async function chatAllowance(email, dayKey) {
  const doc = await cached('workplace-chat.json', {});
  const key = String(email || '').toLowerCase();
  const mine = doc[key] || { day: dayKey, n: 0 };
  if (mine.day !== dayKey) return { allowed: true, n: 0, cap: CHAT_DAILY_CAP };
  return { allowed: mine.n < CHAT_DAILY_CAP, n: mine.n, cap: CHAT_DAILY_CAP };
}

export async function countChat(email, dayKey) {
  const doc = await cached('workplace-chat.json', {});
  const key = String(email || '').toLowerCase();
  const mine = doc[key] || { day: dayKey, n: 0 };
  mine.day = dayKey;
  mine.n = (mine.day === dayKey ? mine.n : 0) + 1;
  doc[key] = mine;
  await persist('workplace-chat.json');
  return mine;
}
