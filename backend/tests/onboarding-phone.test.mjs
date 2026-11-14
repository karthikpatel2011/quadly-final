import { test, after } from 'node:test';
import assert from 'node:assert/strict';

// The WhatsApp nudge number: optional end to end, saved with the draft,
// stored on the finished profile, editable and clearable in Settings —
// and never allowed to block onboarding or wipe a draft answer.

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
  try { json = await res.json(); } catch { /* no body */ }
  return { status: res.status, json };
};

const stamp = Date.now();
const EMAIL = `ph${stamp}@t.dev`;

let token;

test('register gives a session to onboard with', async () => {
  const r = await api('/auth/register', { method: 'POST', body: { email: EMAIL, password: 'secret1', confirm: 'secret1' } });
  assert.equal(r.status, 201);
  token = r.json.token;
});

test('a draft phone survives: step saves land on the server draft', async () => {
  const draft = await api('/onboarding/draft', { method: 'POST', token, body: { practiceTime: 'Morning', phone: '+91 98765 43210' } });
  assert.equal(draft.status, 200);
  const read = await api('/onboarding/draft', { token });
  assert.equal(read.json.profile.phone, '+919876543210', 'spaces stripped, leading + kept');
});

test('finishing onboarding without resending the phone keeps the draft number', async () => {
  const r = await api('/onboarding', {
    method: 'POST',
    token,
    body: { email: EMAIL, name: 'Nisha Rao', college: 'RVCE', track: 'AI & ML', role: 'AI/ML engineer', year: '3rd year', dailyTime: '30 minutes a day', practiceTime: 'Morning', targetDate: '2027-03-01', selfRating: 'Know the basics' },
  });
  assert.equal(r.status, 201);
  assert.equal(r.json.accountLinked, true);
  const read = await api('/onboarding/draft', { token });
  assert.equal(read.json.profile.phone, '+919876543210', 'final submit did not wipe the draft number');
});

test('Settings can change the number, clear it, and rejects junk silently to none', async () => {
  const change = await api('/onboarding', { method: 'PUT', token, body: { phone: '9876500000' } });
  assert.equal(change.status, 200);
  assert.equal(change.json.profile.phone, '9876500000');

  const junk = await api('/onboarding', { method: 'PUT', token, body: { phone: '12' } });
  assert.equal(junk.status, 200);
  assert.equal(junk.json.profile.phone, null, 'too short counts as no number, never an error');

  const clear = await api('/onboarding', { method: 'PUT', token, body: { phone: '' } });
  assert.equal(clear.status, 200);
  assert.equal(clear.json.profile.phone, null, 'empty clears the opt-in');
});

test('onboarding still completes for a student who never gives a number', async () => {
  const email = `ph2${stamp}@t.dev`;
  const reg = await api('/auth/register', { method: 'POST', body: { email, password: 'secret1', confirm: 'secret1' } });
  const r = await api('/onboarding', {
    method: 'POST',
    token: reg.json.token,
    body: { email, name: 'Arun Kumar', track: 'Not sure', year: '2nd year' },
  });
  assert.equal(r.status, 201);
  const read = await api('/onboarding/draft', { token: reg.json.token });
  assert.ok(!read.json.profile.phone, 'no number given means no number stored');
});
