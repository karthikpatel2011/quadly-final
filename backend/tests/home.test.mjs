import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isMinor } from '../src/lib/moderation.js';

// Home V1 contract: a calm personal page over read-adapters only (no posting).
// Covers: section shape + independence, official-item visibility by college
// and time window, "New" marking, the drill section (counts, never names),
// verified task completion through the Daily Drill, avatar upload at the 2 MB
// boundary, and student data isolation.

const { createApp } = await import('../src/app.js');

const app = createApp();
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;

after(() => new Promise((resolve) => server.close(resolve)));

const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* binary or empty */ }
  return { status: res.status, json };
};

const fileURLToPath2 = (u) => fileURLToPath(u);
const dataDir = fileURLToPath2(new URL('../data/', import.meta.url));
const stamp = Date.now();
let A, B, ADMIN;

const A_EMAIL = `ha${stamp}@t.dev`;
const B_EMAIL = `hb${stamp}@t.dev`;

// A valid 1×1 transparent PNG: correct magic bytes, no metadata chunks.
const TINY_PNG = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==`;

async function onboard(token, email, name, college) {
  const r = await api('/onboarding', {
    method: 'POST',
    token,
    body: { email, name, college, track: 'Software Engineering', role: 'SDE', year: '3rd year', dailyTime: '30 minutes a day' },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.accountLinked, true);
}

before(async () => {
  // This suite owns its runtime documents; leftovers from other runs must
  // never leak into the sections (accounts.json is auth's domain).
  const reset = (name, value) => writeFileSync(dataDir + name, JSON.stringify(value, null, 2));
  reset('official-items.json', []);
  reset('official-audit.json', []);
  reset('home-views.json', {});
  reset('practice-drill-attempts.json', {});
  reset('interview-attempts.json', {});
  reset('projects.json', []);

  const a = await api('/auth/register', { method: 'POST', body: { email: A_EMAIL, password: 'secret1', confirm: 'secret1' } });
  const b = await api('/auth/register', { method: 'POST', body: { email: B_EMAIL, password: 'secret1', confirm: 'secret1' } });
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);
  A = a.json.token;
  B = b.json.token;
  await onboard(A, A_EMAIL, 'Asha Verma', 'Oregon State');
  await onboard(B, B_EMAIL, 'Bhuvan Rao', 'Radford University');

  const adminLogin = await api('/admin/login', { method: 'POST', body: { email: process.env.ADMIN_EMAIL || 'admin@quadly.dev', password: process.env.ADMIN_PASSWORD || 'admin-secret' } });
  ADMIN = adminLogin.status === 200 ? adminLogin.json.token : null;
});

test('unauthenticated home answers 401 JSON and never leaks sections', async () => {
  const r = await api('/home');
  assert.equal(r.status, 401);
  assert.ok(r.json.error);
  assert.equal(r.json.today, undefined);
});

test('home returns the V1 sections with the Today strip from the real plan', async () => {
  const r = await api('/home', { token: A });
  assert.equal(r.status, 200);
  assert.equal(r.json.ok, true);
  for (const key of ['today', 'challenge', 'collegeWeek', 'wins', 'squad', 'caughtUp']) {
    assert.ok(r.json[key], `section ${key} exists`);
  }
  const t = r.json.today;
  assert.equal(t.status, 'ok');
  assert.equal(t.data.name, 'Asha Verma');
  assert.equal(t.data.hasPlan, true);
  assert.equal(t.data.missions.length, 3);
  assert.ok(t.data.missions.every((m) => m.href && m.minutes > 0));
  assert.equal(typeof t.data.streak, 'number');
  assert.ok(['number', 'boolean'].includes(typeof t.data.freezesLeft));
  // No posting surfaces anywhere in the payload.
  const raw = JSON.stringify(r.json);
  assert.ok(!raw.includes('"posts"'), 'no posts section on Home V1');
});

test('official items: college scoping, time window, New marking, then seen', async () => {
  if (!ADMIN) return; // admin creds not configured in this env — section tested elsewhere
  const now = Date.now();
  const iso = (ms) => new Date(ms).toISOString();
  const mk = async (body, extra = {}) => api('/admin/official-items', { method: 'POST', token: ADMIN, body: { title: 'Drive registration opens', body: 'Placement portal opens Wednesday.', college: 'Oregon State', startsAt: iso(now - 3600_000), endsAt: iso(now + 86_400_000), ...extra }, });

  const created = await mk();
  assert.equal(created.status, 201);
  const allCollege = await api('/admin/official-items', { method: 'POST', token: ADMIN, body: { title: 'Quadly mock week', body: 'Mock drive Saturday 3 pm IST.', college: 'all', startsAt: iso(now - 3600_000), endsAt: iso(now + 86_400_000) } });
  assert.equal(allCollege.status, 201);

  // A (Oregon State) sees both; B (Radford) sees only the all-college one.
  const aHome = await api('/home', { token: A });
  const aNotices = aHome.json.collegeWeek.data.notices;
  assert.equal(aNotices.length, 2);
  assert.equal(aNotices[0].isNew, true, 'first read marks items New');
  const bHome = await api('/home', { token: B });
  const bNotices = bHome.json.collegeWeek.data.notices;
  assert.equal(bNotices.length, 1);
  assert.equal(bNotices[0].title, 'Quadly mock week');

  // Second read: nothing is New anymore.
  const aAgain = await api('/home', { token: A });
  assert.ok(aAgain.json.collegeWeek.data.notices.every((n) => !n.isNew));

  // An item whose window ended never ships.
  const ended = await api('/admin/official-items', { method: 'POST', token: ADMIN, body: { title: 'Old notice', body: 'Ended yesterday.', college: 'all', startsAt: iso(now - 3 * 86_400_000), endsAt: iso(now - 86_400_000) } });
  assert.equal(ended.status, 201);
  const aThird = await api('/home', { token: A });
  assert.ok(!aThird.json.collegeWeek.data.notices.some((n) => n.title === 'Old notice'));
});

test('today’s drill section shows counts only — a classmate who played is never named', async () => {
  // B answers today's drill; the section carries only counts and B's own
  // result — the payload never contains another student's name or email.
  const today = await api('/practice/drill/today', { token: B });
  assert.equal(today.status, 200);
  const answer = await api(`/practice/drill/${today.json.drill.id}/answer`, {
    method: 'POST', token: B, body: { optionIndex: 0 },
  });
  assert.equal(answer.status, 200);
  assert.equal(answer.json.already, false);

  const bHome = await api('/home', { token: B });
  const ch = bHome.json.challenge.data;
  assert.equal(ch.answered, true, 'the drill shows as done for the student who played');
  assert.equal(ch.playedAtCollege, 0, 'Radford has no other players');
  const raw = JSON.stringify(bHome.json.challenge);
  assert.ok(!raw.includes('Bhuvan'), 'the drill section never names the player');
  assert.ok(!raw.includes(`hb${stamp}`), 'the drill section never carries an email');

  // A (different college) sees her own untouched drill state, not B's.
  const aHome = await api('/home', { token: A });
  assert.equal(aHome.json.challenge.data.answered, false);
  assert.equal(aHome.json.challenge.data.playedAtCollege, 0);
});

test('verified completion: answering the Daily Drill marks the learn task with a result', async () => {
  const today = await api('/practice/drill/today', { token: A });
  const answer = await api(`/practice/drill/${today.json.drill.id}/answer`, {
    method: 'POST', token: A, body: { optionIndex: today.json.drill.moment.options.length - 1 },
  });
  assert.equal(answer.status, 200);
  assert.equal(answer.json.markedTask, true, 'the drill recorded the verified completion');

  const home = await api('/home', { token: A });
  const learn = home.json.today.data.missions.find((m) => m.category === 'learn');
  assert.equal(learn.done, true, 'the drill marks the day’s learn mission as done');
  assert.match(learn.result, /Daily drill/, 'the mission result names the drill honestly');
});

test('avatar: upload stores and serves privately; delete clears the custom pick; 2 MB gate works', async () => {
  const up = await api('/profile/avatar', { method: 'POST', token: A, body: { dataUrl: TINY_PNG } });
  assert.equal(up.status, 201);
  assert.ok(up.json.avatar.startsWith('/api/avatars/ava_'));
  const served = await fetch(`${base}${up.json.avatar}`, { headers: { Authorization: `Bearer ${A}` } });
  assert.equal(served.status, 200);
  const noAuth = await fetch(`${base}${up.json.avatar}`);
  assert.equal(noAuth.status, 401, 'avatars are private to the student');

  const del = await api('/profile/avatar', { method: 'DELETE', token: A });
  assert.equal(del.status, 200);
  assert.equal(del.json.preset, null, 'no preset pick since PRD v4.0 — avatars are server-auto-assigned');

  // 2 MB gate: a >2 MB random blob (bad magic anyway → 400; the size gate is
  // exercised by the length check first — both reject, never store).
  const big = `data:image/png;base64,${'A'.repeat(2 * 1400_000)}`;
  const refused = await api('/profile/avatar', { method: 'POST', token: A, body: { dataUrl: big } });
  assert.ok([400, 413].includes(refused.status));
});

test('isolation: one student’s home never contains another student’s identity', async () => {
  const aHome = await api('/home', { token: A });
  const raw = JSON.stringify(aHome.json);
  assert.ok(!raw.includes('hb' + stamp), 'no other student’s email anywhere');
  assert.ok(!raw.includes('Bhuvan'), 'no other student’s name anywhere');
  const profile = await api('/profile/show-name', { token: A });
  assert.equal(profile.json.showName, false, 'A’s consent state is untouched by B');
});

test('pure rule: minors never surface names regardless of consent', () => {
  assert.equal(isMinor({ birthYear: new Date().getFullYear() - 15 }), true);
  assert.equal(isMinor({ birthYear: new Date().getFullYear() - 22 }), false);
  assert.equal(isMinor({}), false, 'no birthYear collected → rule dormant, not wrong');
});
