import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { istDayKey } from '../src/lib/streaks.js';

// Daily Practice engine contract: a frozen deterministic set, answer-material
// sanitization, one-at-a-time hints, first-try immutability, completion that
// marks the verified plan task, the 1/3/7-day spaced-return review slot, and
// the two-good/two-weak difficulty rule.

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
  try { json = await res.json(); } catch { /* binary or empty */ }
  return { status: res.status, json };
};

const stamp = Date.now();
const A_EMAIL = `dp${stamp}@t.dev`;
let A;

before(async () => {
  // The engine owns its state document; the suite starts it clean.
  writeFileSync(dataDir + 'daily-practice-state.json', JSON.stringify({}, null, 2));
  const a = await api('/auth/register', { method: 'POST', body: { email: A_EMAIL, password: 'secret1', confirm: 'secret1' } });
  assert.equal(a.status, 201);
  A = a.json.token;
  const ob = await api('/onboarding', { method: 'POST', token: A, body: {
    email: A_EMAIL, name: 'DP Tester', college: 'Test Univ', track: 'Software Engineering',
    year: '3rd year', dailyTime: '30 minutes a day', selfRating: 'Know the basics',
  }});
  assert.equal(ob.status, 201);
});

test('the set is deterministic, full-size, and carries no answer material', async () => {
  const d1 = await api('/practice/daily', { token: A });
  assert.equal(d1.status, 200);
  assert.equal(d1.json.total, 4, 'three new activities plus the review slot');
  const ids = JSON.stringify(d1.json.items.map((i) => i.id));
  const d2 = await api('/practice/daily', { token: A });
  assert.equal(JSON.stringify(d2.json.items.map((i) => i.id)), ids, 'the set survives re-fetch');
  const blob = JSON.stringify(d1.json);
  assert.ok(!blob.includes('"answerIndex"'), 'no answer keys reach the client');
  assert.ok(!blob.includes('"hints"'), 'hints never ship in the GET');
  assert.ok(!blob.includes('"expected"'), 'expected query results never ship in the GET');
});

test('hints climb one level at a time and cap at three', async () => {
  const d = await api('/practice/daily', { token: A });
  const id = d.json.items[0].id;
  for (const level of [1, 2, 3]) {
    const h = await api('/practice/daily/hint', { method: 'POST', token: A, body: { id, level } });
    assert.equal(h.json.level, level);
    assert.ok(h.json.hint.length > 0);
  }
  const capped = await api('/practice/daily/hint', { method: 'POST', token: A, body: { id, level: 9 } });
  assert.equal(capped.json.level, 3, 'levels cap at three');
});

test('first try is the record; retries never change it; completion marks the plan', async () => {
  const d = await api('/practice/daily', { token: A });
  let expectedScore = 0;
  for (const item of d.json.items) {
    const body = item.type === 'write-query'
      ? { id: item.id, sql: 'SELECT * FROM students' }
      : { id: item.id, choice: 0 };
    const a1 = await api('/practice/daily/answer', { method: 'POST', token: A, body });
    assert.equal(a1.status, 200);
    const a2 = await api('/practice/daily/answer', { method: 'POST', token: A, body });
    assert.equal(a2.json.firstTryRecorded, false, 'the retry never re-records');
    assert.equal(a2.json.correct, a1.json.correct);
    if (a1.json.correct) expectedScore += 1;
  }
  const fin = await api('/practice/daily', { token: A });
  assert.equal(fin.json.done, true);
  assert.equal(fin.json.score, expectedScore);
  const dash = await api('/dashboard', { token: A });
  const dayKey = istDayKey();
  assert.ok((dash.json.history?.[dayKey] || []).length >= 1, 'the verified day is recorded');
  assert.ok(
    (dash.json.missions || []).some((m) => m.done && /^Score \d\/\d/.test(m.result ?? '')),
    'the learn mission is marked with today’s score',
  );
});

test('spaced return: a concept missed yesterday lands in the review slot', async () => {
  const { buildSet } = await import('../src/routes/daily-practice.js');
  const bank = JSON.parse(readFileSync(dataDir + 'practice-activities.json', 'utf8')).activities;
  const yesterday = istDayKey(Date.now() - 24 * 3600 * 1000);
  const tomorrowIsOut = istDayKey(Date.now() - 2 * 24 * 3600 * 1000); // 2 days out → not due
  const student = {
    history: {}, done: {},
    conceptMiss: {
      'sql-select-where': { date: yesterday, activityId: 'wq-select-where' },
      'js-coercion-add': { date: tomorrowIsOut, activityId: 'po-js-add-sub' },
    },
  };
  const set = buildSet('spaced@test.dev', { track: 'Software Engineering' }, bank, student, 1);
  assert.ok(set.review, 'a review item is scheduled');
  assert.equal(set.review.concept, 'sql-select-where', 'the 1-day-due concept wins');
  assert.equal(set.newActivities.length, 3);
  const ids = set.newActivities.map((a) => a.id).concat(set.review.id);
  assert.equal(new Set(ids).size, 4, 'no duplicate activities in one set');
});

test('adaptive level: two good days rise, two weak days fall, mixed holds', async () => {
  const { deriveLevel } = await import('../src/routes/daily-practice.js');
  const k = (back) => istDayKey(Date.now() - back * 24 * 3600 * 1000);
  const good = { done: true, score: 4, total: 4 };
  const weak = { done: true, score: 1, total: 4 };
  const mk = (h1, h2) => ({ history: { [k(1)]: h1, [k(2)]: h2 }, done: {}, conceptMiss: {} });
  assert.equal(deriveLevel(mk(good, good), {}), 2, 'two good days rise');
  assert.equal(deriveLevel(mk(weak, weak), {}), 1, 'two weak days fall to the floor');
  assert.equal(deriveLevel(mk(good, weak), { selfRating: 'Know the basics' }), 1, 'mixed days hold');
  assert.equal(deriveLevel({ history: {} }, { selfRating: 'Nearly job-ready' }), 2, 'the self-rating seeds the start');
});
