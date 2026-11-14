// Practice runtime store — every per-student document lives here: incident
// attempts, drill history, postmortems and defends, skill levels, streaks, AI
// quota counters, and the scenario review queue. Files are JSON documents
// under backend/data/ (the documented pre-beta store; Supabase is the
// migration target). Writes are atomic (tmp + rename) and every doc is
// keyed by student email, so a student can only ever touch their own rows —
// routes resolve the key from the session, never from the request body.

import { readFile, writeFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { ensureContent, scenarios as seedScenarios } from './content.js';
import { scenarioSchema } from './schema.js';

const DATA_DIR = fileURLToPath(new URL('../../../data/', import.meta.url));
const pathFor = (name) => DATA_DIR + name;

// Single-flight caches: the file is read once per process and stays the
// live source of truth; persist() writes the cached doc back atomically.
// Concurrent first reads all resolve to the SAME loaded doc (the entry
// object is mutated in place, never replaced).
const caches = new Map(); // file -> { doc, loading }

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
  try {
    const tmp = pathFor(name + '.tmp');
    await writeFile(tmp, JSON.stringify(entry.doc, null, 2));
    await rename(tmp, pathFor(name));
  } catch (err) {
    console.error(`[practice] failed to persist ${name}: ${err.message}`);
  }
}

/** Read -> mutate -> write, the shape of every store mutation below. */
async function mutate(name, fallback, mutator) {
  const doc = await cached(name, fallback);
  const out = mutator(doc);
  await persist(name);
  return out;
}

// ---- scenario library: authored seeds + the runtime review queue ----------

const QUEUE_FILE = 'practice-queue.json';

/** Drafted/AI or seeded runtime scenarios (never the authored seeds). */
async function queueScenarios() {
  const doc = await cached(QUEUE_FILE, { scenarios: [] });
  const list = Array.isArray(doc.scenarios) ? doc.scenarios : [];
  const ok = [];
  for (const s of list) {
    const parsed = scenarioSchema.safeParse(s);
    if (parsed.success) ok.push(parsed.data);
  }
  return ok;
}

/** Drafts for the review queue, as-is with their review status. */
const queueRows = async () => {
  const doc = await cached(QUEUE_FILE, { scenarios: [] });
  return Array.isArray(doc.scenarios) ? doc.scenarios : [];
};

/** Every playable scenario, regardless of origin. */
export async function allScenarios() {
  await ensureContent();
  const runtime = (await queueScenarios()).filter((s) => s.status === 'published');
  return [...seedScenarios, ...runtime];
}

export async function allDrafts() {
  return queueRows();
}

export async function findScenario(id) {
  await ensureContent();
  const wanted = String(id || '');
  const runtime = await queueScenarios();
  return seedScenarios.find((s) => s.id === wanted)
    || runtime.find((s) => s.id === wanted)
    || null;
}

export async function queueUpsert(scenario) {
  return mutate(QUEUE_FILE, { scenarios: [] }, (doc) => {
    doc.scenarios = Array.isArray(doc.scenarios) ? doc.scenarios : [];
    const existing = doc.scenarios.find((s) => s.id === scenario.id);
    if (existing) Object.assign(existing, scenario);
    else doc.scenarios.push(scenario);
    return scenario;
  });
}

export async function queueRemove(id) {
  return mutate(QUEUE_FILE, { scenarios: [] }, (doc) => {
    doc.scenarios = Array.isArray(doc.scenarios) ? doc.scenarios : [];
    const before = doc.scenarios.length;
    doc.scenarios = doc.scenarios.filter((s) => s.id !== id);
    return doc.scenarios.length < before; // true when something was removed
  });
}

// ---- per-student documents -------------------------------------------------

const ATTEMPTS_FILE = 'practice-incident-attempts.json';   // { email: { attemptId: attempt } }
const DRILLS_FILE = 'practice-drill-attempts.json';         // { email: { seen: {}, days: {} } }
const POSTMORTEMS_FILE = 'practice-postmortems.json';      // { email: { attemptId: { versions, current, share } } }
const DEFEND_FILE = 'practice-defend-attempts.json';        // { email: { attemptId: {...} } }
const LEVELS_FILE = 'practice-levels.json';                 // { email: { track: { level, recent, updatedAt } } }
const STREAKS_FILE = 'practice-streaks.json';               // { email: streakDoc }
const USAGE_FILE = 'practice-ai-usage.json';                // { day, calls, students: {}, roles: {} }

export const attemptsDoc = () => cached(ATTEMPTS_FILE, {});
export const persistAttempts = () => persist(ATTEMPTS_FILE);

export const drillsDoc = () => cached(DRILLS_FILE, {});
export const persistDrills = () => persist(DRILLS_FILE);

export const postmortemsDoc = () => cached(POSTMORTEMS_FILE, {});
export const persistPostmortems = () => persist(POSTMORTEMS_FILE);

export const defendDoc = () => cached(DEFEND_FILE, {});
export const persistDefend = () => persist(DEFEND_FILE);

export const levelsDoc = () => cached(LEVELS_FILE, {});
export const persistLevels = () => persist(LEVELS_FILE);

export const streaksDoc = () => cached(STREAKS_FILE, {});
export const mutateStreaks = (mutator) => mutate(STREAKS_FILE, {}, mutator);

export const usageDoc = () => cached(USAGE_FILE, { day: null, calls: 0, students: {}, roles: {} });

/** bump AI usage for (student, role). Returns { allowed } under the caps. */
export async function aiQuota(email, role, { perStudent, global, dayKey }) {
  return mutate(USAGE_FILE, { day: null, calls: 0, students: {}, roles: {} }, (doc) => {
    if (doc.day !== dayKey) { doc.day = dayKey; doc.calls = 0; doc.students = {}; doc.roles = {}; }
    const mine = (doc.students[email] ?? 0) + 1;
    const total = (doc.calls ?? 0) + 1;
    if (mine > perStudent) return { allowed: false, reason: 'Today’s AI budget for you is used up — the scripted coach answers from here.' };
    if (total > global) return { allowed: false, reason: 'The AI budget for today is spent — the scripted coach answers from here.' };
    doc.students[email] = mine;
    doc.calls = total;
    doc.roles[role] = (doc.roles[role] ?? 0) + 1;
    return { allowed: true, reason: null };
  });
}

// Conveniences that keep the ownership rule in one place.

export async function myAttempts(email) {
  const doc = await attemptsDoc();
  return doc[email] && typeof doc[email] === 'object' ? doc[email] : {};
}

export async function findAttempt(email, attemptId) {
  const mine = await myAttempts(email);
  const at = mine[String(attemptId || '')];
  return at && typeof at === 'object' ? at : null;
}

export async function saveAttempt(email, attempt) {
  const doc = await attemptsDoc();
  doc[email] = doc[email] && typeof doc[email] === 'object' ? doc[email] : {};
  doc[email][attempt.id] = attempt;
  await persistAttempts();
  return attempt;
}

export async function myDrillState(email) {
  const doc = await drillsDoc();
  return doc[email] && typeof doc[email] === 'object' ? doc[email] : { seen: {}, days: {} };
}

/** How many distinct days this student completed a drill (personalization context). */
export async function drillDaysFor(email) {
  const state = await myDrillState(email);
  return Object.keys(state.days || {}).length;
}

/** Students who completed a drill on a given day — emails, for counting. */
export async function drillCompletionsOnDay(dayKey) {
  const doc = await drillsDoc();
  const players = [];
  for (const [email, state] of Object.entries(doc)) {
    if (state?.days && state.days[dayKey]) players.push(email);
  }
  return players;
}

export async function saveDrillState(email, state) {
  const doc = await drillsDoc();
  doc[email] = state;
  await persistDrills();
  return state;
}

export function newShareToken() {
  return randomUUID().replace(/-/g, '');
}

/** Everything the account-deletion sweep must drop for one student. */
export const PRACTICE_FILES = [
  ATTEMPTS_FILE, DRILLS_FILE, POSTMORTEMS_FILE, DEFEND_FILE, LEVELS_FILE, STREAKS_FILE,
];

/**
 * Drop a student from every in-memory cache and re-persist. auth.js's file
 * scrub runs first; this keeps the live caches from quietly writing the
 * scrubbed rows back on the next persist (DPDP deletion must be absolute).
 */
export function dropStudentFromCache(email) {
  for (const [name, entry] of caches) {
    const doc = entry.doc;
    if (!doc || typeof doc !== 'object') continue;
    let touched = false;
    if (email in doc) { delete doc[email]; touched = true; }
    if (doc.students && typeof doc.students === 'object' && email in doc.students) {
      delete doc.students[email];
      touched = true;
    }
    if (touched) persist(name).catch(() => {});
  }
};
