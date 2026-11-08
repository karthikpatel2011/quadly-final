import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

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
const A_EMAIL = `va${stamp}@t.dev`;
const B_EMAIL = `vb${stamp}@t.dev`;
let A, B;

const GOOD_OOP = 'Encapsulation keeps the data private inside the class and only exposes methods. '
  + 'Abstraction hides the implementation behind an interface. '
  + 'Inheritance lets a subclass reuse a parent class. '
  + 'Polymorphism means one call, like payment through card or upi, behaves differently. '
  + 'For example a cart checkout with different payment gateway implementations.';

before(async () => {
  // Voice transcripts are personal data — the suite starts the store empty.
  writeFileSync(dataDir + 'interview-voice.json', JSON.stringify({}, null, 2));
  const a = await api('/auth/register', { method: 'POST', body: { email: A_EMAIL, password: 'secret1', confirm: 'secret1' } });
  const b = await api('/auth/register', { method: 'POST', body: { email: B_EMAIL, password: 'secret1', confirm: 'secret1' } });
  A = a.json.token;
  B = b.json.token;
});

test('the scorer: coverage dominates, fillers cost, thin answers sink', async () => {
  const { scoreVoiceAnswer } = await import('../src/lib/voice-score.js');
  const spec = { targetWords: 40, keyPoints: [
    { point: 'a', aliases: ['alpha'] },
    { point: 'b', aliases: ['beta'] },
    { point: 'c', aliases: ['gamma'] },
  ] };
  const strong = scoreVoiceAnswer(spec, 'Alpha, then beta — and gamma ties it together with enough words to land properly.', 40);
  const weak = scoreVoiceAnswer(spec, 'alpha only, um, like', 5);
  assert.ok(strong.score > weak.score + 20, `strong ${strong.score} vs weak ${weak.score}`);
  assert.equal(strong.keyPointsHit, 3);
  assert.equal(weak.keyPointsHit, 1);
  assert.ok(weak.fillers >= 1);
});

test('a spoken answer scores, stores, and keeps before/after', async () => {
  const a1 = await api('/interview/voice', { method: 'POST', token: A, body: { qid: 't1', transcript: GOOD_OOP, seconds: 60 } });
  assert.equal(a1.status, 200);
  assert.ok(a1.json.score >= 50, `coverage should be strong, got ${a1.json.score}`);
  assert.equal(a1.json.breakdown.keyPointsHit, 5, 'every OOP point hit on the good answer');
  assert.equal(a1.json.firstScore, null);
  const a2 = await api('/interview/voice', { method: 'POST', token: A, body: { qid: 't1', transcript: GOOD_OOP + ' that is the whole picture.', seconds: 55 } });
  assert.equal(a2.json.firstScore, a1.json.score, 'before/after is kept');
  assert.equal(a2.json.attemptNumber, 2);
});

test('scoring verifies or refuses: thin answers, unknown questions, bad spec ids', async () => {
  const thin = await api('/interview/voice', { method: 'POST', token: A, body: { qid: 't1', transcript: 'yes ok sure', seconds: 3 } });
  assert.equal(thin.status, 400);
  const unknown = await api('/interview/voice', { method: 'POST', token: A, body: { qid: 'zz', transcript: 'a full transcript with many words', seconds: 10 } });
  assert.equal(unknown.status, 404);
  const outOfSet = await api('/interview/voice', { method: 'POST', token: A, body: { qid: 'b2', transcript: GOOD_OOP, seconds: 30 } });
  assert.ok(outOfSet.status === 200 || outOfSet.status === 503, 'b2 exists; either scored or spec-unavailable — never a leak');
});

test('summary is per-student and private; the fix plan carries the weakest', async () => {
  const s = await api('/interview/voice/summary', { token: A });
  assert.equal(s.status, 200);
  assert.ok(s.json.answered >= 1);
  assert.ok(s.json.fixPlan.length >= 1);
  const bs = await api('/interview/voice/summary', { token: B });
  assert.equal(bs.json.answered, 0, 'B sees none of A’s voice attempts');
  const raw = JSON.stringify(bs.json);
  assert.ok(!raw.includes('Encapsulation'), 'A’s transcript never leaks to B');
});

test('transcripts are deletable (DPDP): the words go, nothing else exists', async () => {
  const del = await api('/interview/voice', { method: 'DELETE', token: A });
  assert.equal(del.status, 200);
  const s = await api('/interview/voice/summary', { token: A });
  assert.equal(s.json.answered, 0, 'after deletion the student’s voice history is empty');
});
