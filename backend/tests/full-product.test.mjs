import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Full-product push: the V1 onboarding answers, the personalization service
// (deterministic fallback), the opportunities domain (filters, save, tracker,
// privacy), and account deletion with data scrubbing. Real data only — the
// seeded listing is Quadly's own hiring page.

const { createApp } = await import('../src/app.js');

const app = createApp();
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
const dataDir = fileURLToPath(new URL('../data/', import.meta.url));

after(() => new Promise((r) => server.close(r)));

const api = async (path, { method = 'GET', token, body } = {}) => {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  let json = null;
  try { json = await res.json(); } catch { /* empty */ }
  return { status: res.status, json };
};

const stamp = Date.now();
const isoIn = (days) => new Date(Date.now() + days * 864e5).toISOString().slice(0, 10);
let A, B, C_TOKEN, C_EMAIL;

const seedListing = () => {
  writeFileSync(dataDir + 'opportunities.json', JSON.stringify([
    {
      id: 'opp_t1', title: 'Winter internship — backend (Node)', org: 'RealCorp',
      type: 'internship', sourceUrl: 'https://realcorp.example.com/careers/int-node',
      location: 'Remote (India)', remote: true, eligibility: 'Pre-final year',
      paid: 'paid', deadline: new Date(Date.now() + 10 * 86_400_000).toISOString(),
      postedAt: new Date().toISOString(), lastChecked: new Date().toISOString(),
      verification: 'admin-verified',
    },
    {
      id: 'opp_t2', title: 'Open-source fellowship', org: 'OSS India',
      type: 'open-source', sourceUrl: 'https://oss.example.org/fellowship',
      location: 'Remote', remote: true, eligibility: null,
      paid: 'unpaid', deadline: new Date(Date.now() + 30 * 86_400_000).toISOString(),
      postedAt: new Date().toISOString(), lastChecked: new Date().toISOString(),
      verification: 'admin-verified',
    },
  ], null, 2));
};

before(async () => {
  // Suite-owned stores reset.
  for (const f of ['opportunity-tracker.json', 'ai-profile.json', 'plans.json', 'attempts.json']) {
    writeFileSync(dataDir + f, JSON.stringify({}, null, 2));
  }
  seedListing();

  const a = await api('/auth/register', { method: 'POST', body: { email: `fa${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  const b = await api('/auth/register', { method: 'POST', body: { email: `fb${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  assert.equal(a.status, 201);
  A = a.json.token;
  B = b.json.token;
  await api('/onboarding', { method: 'POST', token: A, body: {
    email: `fa${stamp}@t.dev`, name: 'Full Onboard', college: 'IIT Bombay',
    track: 'Software Engineering', role: 'Backend developer', year: '3rd year',
    dailyTime: '1 hour a day', practiceTime: 'Evening',
    targetDate: isoIn(90), selfRating: 'Can build small things',
  }});
  await api('/onboarding', { method: 'POST', token: B, body: {
    email: `fb${stamp}@t.dev`, name: 'Other Student', college: 'Radford University',
    track: 'Cyber Security', role: 'Security analyst', year: '2nd year',
    dailyTime: '15 minutes a day', practiceTime: 'Morning', selfRating: 'Just starting',
  }});
});

test('PRD onboarding answers persist and surface on the dashboard', async () => {
  const d = await api('/dashboard', { token: A });
  assert.equal(d.status, 200);
  assert.equal(d.json.track, 'Software Engineering');
  assert.equal(d.json.year, '3rd year');
  assert.equal(d.json.dailyTime, '1 hour a day');
  assert.equal(d.json.practiceTime, 'Evening');
  assert.equal(d.json.selfRating, 'Can build small things');
  assert.equal(d.json.target.role, 'Backend developer', 'the legacy role mirror stays in step');

  // The personalization service still answers honestly with the thinner
  // PRD profile: interests are no longer collected, so the deterministic
  // fallback is the truthful "exploring" base.
  const p = await api('/personalize', { token: A });
  assert.equal(p.status, 200);
  const card = p.json.result ?? p.json;
  assert.equal(card.stage, 'Exploring');
  assert.ok(card.missingInfo.length >= 1, 'honest missing info');
  assert.ok(['quadly-rules', 'llm'].includes(p.json.meta?.source ?? card.meta?.source ?? 'quadly-rules'));
});

test('profile edit updates the answers and the personalization follows', async () => {
  const put = await api('/onboarding', { method: 'PUT', token: A, body: { stage: 'Preparing for opportunities', interests: ['Backend development'] } });
  assert.equal(put.status, 200);
  assert.equal(put.json.profile.stage, 'Preparing for opportunities');
  const p = await api('/personalize', { token: A });
  const d = p.json.result ?? p.json;
  assert.equal(d.stage, 'Preparing for opportunities');
  assert.equal(d.firstAction.label, 'One timed interview question, self-graded');
});

test('opportunities list, filters, save and tracker statuses are real and private', async () => {
  const list = await api('/opportunities?type=internship', { token: A });
  assert.equal(list.status, 200);
  assert.equal(list.json.items.length, 1, 'type filter keeps only the internship');
  const item = list.json.items[0];
  assert.equal(item.verification, 'admin-verified');

  const save = await api(`/opportunities/${item.id}/save`, { method: 'POST', token: A });
  assert.equal(save.json.savedByMe, true);
  const track = await api(`/opportunities/${item.id}/track`, { method: 'POST', token: A, body: { status: 'applied' } });
  assert.equal(track.json.trackStatus, 'applied');
  const badTrack = await api(`/opportunities/${item.id}/track`, { method: 'POST', token: A, body: { status: 'hacked' } });
  assert.equal(badTrack.status, 400);

  const mineA = await api('/opportunities/mine', { token: A });
  assert.equal(mineA.json.items.length, 1);
  assert.equal(mineA.json.items[0].trackStatus, 'applied');
  const mineB = await api('/opportunities/mine', { token: B });
  assert.equal(mineB.json.items.length, 0, 'tracker data is per student');

  const unsave = await api(`/opportunities/${item.id}/save`, { method: 'DELETE', token: A });
  assert.equal(unsave.json.savedByMe, false);
  const mineAfter = await api('/opportunities/mine', { token: A });
  assert.equal(mineAfter.json.items.length, 0, 'unsave removes the tracked row too');
});

test('expiration never ships as a live listing', async () => {
  writeFileSync(dataDir + 'opportunities.json', JSON.stringify([
    {
      id: 'opp_dead', title: 'Expired thing', org: 'Old Co', type: 'hackathon',
      sourceUrl: 'https://old.example.com', deadline: '2020-01-01T00:00:00.000Z',
      verification: 'admin-verified', postedAt: '2020-01-01T00:00:00.000Z',
    },
  ], null, 2));
  const list = await api('/opportunities', { token: A });
  assert.equal(list.json.items.length, 0, 'expired listings are hidden by default');
  const incl = await api('/opportunities?includeExpired=1', { token: A });
  assert.equal(incl.json.items.length, 1);
  assert.equal(incl.json.items[0].expired, true, 'included items are honestly marked expired');
  seedListing();
});

test('account deletion scrubs the student from every store', async () => {
  const c = await api('/auth/register', { method: 'POST', body: { email: `fc${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  C_TOKEN = c.json.token;
  C_EMAIL = `fc${stamp}@t.dev`;
  const onb = await api('/onboarding', { method: 'POST', token: C_TOKEN, body: { email: C_EMAIL, name: 'Delete Me', college: 'IIT Bombay', avatar: '03', interests: ['Open source'] } });
  assert.equal(onb.status, 201);
  seedListing();
  await api('/opportunities/opp_t1/save', { method: 'POST', token: C_TOKEN });
  const trackerBefore = JSON.parse(readFileSync(dataDir + 'opportunity-tracker.json', 'utf8'));
  assert.ok(trackerBefore[C_EMAIL], 'tracker row exists before deletion');

  const refuse = await api('/auth/account', { method: 'DELETE', token: C_TOKEN, body: { confirm: 'nope' } });
  assert.equal(refuse.status, 400);
  const gone = await api('/auth/account', { method: 'DELETE', token: C_TOKEN, body: { confirm: 'DELETE' } });
  assert.equal(gone.status, 200);

  const trackerAfter = existsSync(dataDir + 'opportunity-tracker.json')
    ? JSON.parse(readFileSync(dataDir + 'opportunity-tracker.json', 'utf8'))
    : {};
  assert.ok(!trackerAfter[C_EMAIL], 'tracker row scrubbed');
  const accountsOnDisk = JSON.parse(readFileSync(dataDir + 'accounts.json', 'utf8'));
  assert.ok(!accountsOnDisk[C_EMAIL.toLowerCase()], 'account row scrubbed');
  const me = await api('/auth/me', { token: C_TOKEN });
  assert.equal(me.status, 401, 'the session dies with the account');
  // seed back for any later suite sharing this data dir
  seedListing();
});

test('personalization isolation: B’s card is B’s own', async () => {
  const b = await api('/personalize', { token: B });
  const d = b.json.result ?? b.json;
  const card = JSON.stringify(d);
  assert.ok(!card.includes('Backend developer'), 'A’s role never leaks into B’s card');
  assert.ok(!card.includes('Software Engineering'), 'A’s track never leaks into B’s card');
  assert.ok(!card.includes('IIT Bombay'), 'A’s college never leaks into B’s card');
  assert.ok(['quadly-rules', 'llm'].includes(b.json.meta?.source ?? d.meta?.source ?? 'quadly-rules'));
});
