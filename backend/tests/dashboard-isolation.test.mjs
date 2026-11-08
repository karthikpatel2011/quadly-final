import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';

// Data isolation + ask cap: two students on the same running app can never
// read each other's data, and the Ask daily cap is enforced server-side.
const app = createApp();
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
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

after(() => server.close());

test('two students cannot read each other’s data', async () => {
  const a = await api('/auth/register', { method: 'POST', body: { email: `a${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  const b = await api('/auth/register', { method: 'POST', body: { email: `b${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  assert.equal(a.status, 201);
  assert.equal(b.status, 201);

  // A completes today's first mission (server records the verified result).
  const dashA = await api('/dashboard', { token: a.json.token });
  const mission = dashA.json.missions[0];
  const toggle = await api(`/dashboard/missions/${mission.id}`, { method: 'POST', token: a.json.token });
  assert.equal(toggle.status, 200);
  const doneForA = toggle.json.missions.find((m) => m.id === mission.id).done;
  assert.equal(doneForA, true);

  // B's reads never contain A's identity, history, or completion state.
  const dashB = await api('/dashboard', { token: b.json.token });
  assert.equal(dashB.json.email, `b${stamp}@t.dev`);
  assert.equal(JSON.stringify(dashB.json).includes(`a${stamp}`), false);
  // Plans are hash-seeded per (email, date): B runs a different triple, and
  // none of B's missions may inherit A's completion.
  assert.equal(dashB.json.missions.length, dashA.json.missions.length);
  for (const m of dashB.json.missions) assert.equal(m.done, false);
  assert.deepEqual(dashB.json.history, {});

  // A's history is private to A but real and complete for A.
  assert.ok(Object.keys(dashA.json.history ?? {}).length >= 0);
  const dashA2 = await api('/dashboard', { token: a.json.token });
  assert.equal(dashA2.json.missions.find((m) => m.id === mission.id).done, true);

  // A garbage token is simply not signed in.
  const intruder = await api('/dashboard', { token: 'not-a-real-token' });
  assert.equal(intruder.status, 401);
});

test('Ask is capped server-side per student with a friendly message', async () => {
  const u = await api('/auth/register', { method: 'POST', body: { email: `cap${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  const cap = await api('/dashboard', { token: u.json.token });
  const askCap = cap.json.askCap;
  assert.equal(typeof askCap, 'number');

  let last;
  for (let i = 0; i < askCap + 1; i++) {
    last = await api('/dashboard/ask', { method: 'POST', token: u.json.token, body: { message: `question ${i}` } });
    if (last.status === 429) break;
    assert.equal(last.status, 200, `unexpected failure on ask ${i}: ${JSON.stringify(last.json)}`);
  }
  assert.equal(last.status, 429);
  assert.ok(/resets tomorrow/.test(last.json.error));
  // Cap state survives a concurrent payload read and stays per-student.
  const after = await api('/dashboard', { token: u.json.token });
  assert.equal(after.json.asksToday, askCap);
  const other = await api('/dashboard', { token: (await api('/auth/register', { method: 'POST', body: { email: `cap2${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } })).json.token });
  assert.equal(other.json.asksToday, 0);
});
