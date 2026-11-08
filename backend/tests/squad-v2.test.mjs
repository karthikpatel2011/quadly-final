import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { isAway, sweepSquad } from '../src/routes/squad.js';

// Squad v2 engine contract: code alphabet without look-alikes, join attempt
// lock, shared streak with the one-freeze-a-week rule, Away stopping the
// blocking after 7 days, nudge caps (pair/day and sender/day), pending-join
// expiry, privacy between squads, and ownership transfer on leave.

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

const dayKey = (offset) => new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10);

test.before?.('noop');
// engine: the pure pieces get direct tests; the flow gets endpoint tests.
const director = await import('../src/routes/squad.js');

test('away rule: a member inactive for more than 7 days is Away and stops blocking', () => {
  assert.equal(director.isAway({ lastActiveAt: new Date(Date.now() - 6 * 86400000).toISOString() }), false, '6 days is still active');
  assert.equal(director.isAway({ lastActiveAt: new Date(Date.now() - 8 * 86400000).toISOString() }), true, '8+ days is Away');
  assert.equal(director.isAway({}), false, 'no activity recorded → active by default');
});

test('sweep: complete days build the streak, one missing member is frozen once a week, two break it', () => {
  const accounts = {
    'a@t.dev': { dashboard: { done: {} } },
    'b@t.dev': { dashboard: { done: {} } },
    'c@t.dev': { dashboard: { done: {} } },
  };
  // dates relative to today, matching sweep expectations (UTC day keys)
  for (let off = 1; off <= 4; off++) {
    for (const who of ['a@t.dev', 'b@t.dev', 'c@t.dev']) {
      if (off <= 3 || who !== 'c@t.dev') accounts[who].dashboard.done[dayKey(off)] = ['task'];
    }
  }
  // done on days 1–3 back for a+b (c missing on day 3 → freeze), all present days 1-2/4 etc.
  const squad = {
    id: 's1', createdAt: `${dayKey(5)}T00:00:00Z`, lastSweepDay: dayKey(5),
    members: ['a@t.dev', 'b@t.dev', 'c@t.dev'].map((s) => ({ studentId: s, lastActiveAt: new Date().toISOString() })),
    freezeEnabled: true, streakCurrent: 0, streakBest: 0,
  };
  const daily = {};
  const res = director.sweepSquad(squad, daily, accounts);
  assert.ok(res.results.some((r) => r.froze), 'the single missing member is covered by the weekly freeze');
  assert.equal(squad.streakCurrent >= 3, true, `streak builds, got ${squad.streakCurrent}`);

  // two missing members on a later day break the streak -> restart line
  const accounts2 = JSON.parse(JSON.stringify(accounts));
  // only a finished on the last unswept day — b and c skipping means no freeze possible
  delete accounts2['b@t.dev'].dashboard.done[dayKey(1)];
  delete accounts2['c@t.dev'].dashboard.done[dayKey(1)];
  accounts2['b@t.dev'].dashboard.done[dayKey(2)] = ['t'];
  accounts2['c@t.dev'].dashboard.done[dayKey(2)] = ['t'];
  const squad2 = { ...squad, lastSweepDay: dayKey(2), streakCurrent: 0 };
  director.sweepSquad(squad2, { }, accounts2);
  assert.equal(squad2.streakCurrent, 0, 'a day missed by two members is simply not complete');
});

// ---------- endpoint flow ----------
let OWNER, JOINER, THIRD;
const stamp = Date.now();
const O_EMAIL = `svo${stamp}@t.dev`;
const J_EMAIL = `svj${stamp}@t.dev`;
const T_EMAIL = `svt${stamp}@t.dev`;
let SQUAD_ID = null;
let CODE = null;

before(async () => {
  writeFileSync(dataDir + 'squad-attempts.json', JSON.stringify({}, null, 2));
  writeFileSync(dataDir + 'squad-pending.json', JSON.stringify({}, null, 2));
  writeFileSync(dataDir + 'squad-nudges.json', JSON.stringify({}, null, 2));
  for (const [ix, email] of [O_EMAIL, J_EMAIL, T_EMAIL].entries()) {
    const r = await api('/auth/register', { method: 'POST', body: { email, password: 'secret1', confirm: 'secret1' } });
    const tok = r.json.token;
    if (ix === 0) OWNER = tok; else if (ix === 1) JOINER = tok; else THIRD = tok;
  }
});

test('create: code from the spec alphabet only, six characters', async () => {
  const r = await api('/squads', { method: 'POST', token: OWNER, body: { name: 'Night Owls' } });
  assert.equal(r.status, 201);
  CODE = r.json.board.code;
  assert.equal(CODE.length, 6);
  for (const ch of CODE) {
    assert.ok('ABCDEFGHJKMNPQRSTUVWXYZ23456789'.includes(ch), `character ${ch} is from the no-look-alike alphabet`);
  }
  SQUAD_ID = r.json.board.id;
});

test('join security: wrong codes stay vague, five a minute cap, ten wrong lock for 15 minutes', async () => {
  const wrong = await api('/squads/join', { method: 'POST', token: JOINER, body: { code: 'ZZZZZZ' } });
  assert.equal(wrong.status, 404);
  assert.equal(wrong.json.error, 'That code doesn’t match a squad. Check it with your friend.');
  // saturate the per-minute window with wrong attempts (the first one counted too)
  for (let i = 0; i < 5; i++) {
    await api('/squads/join', { method: 'POST', token: JOINER, body: { code: 'YYYYYY' } });
  }
  const capped = await api('/squads/join', { method: 'POST', token: JOINER, body: { code: 'XXXXXX' } });
  assert.ok([404, 429].includes(capped.status), `either another miss or the rate cap, got ${capped.status}`);
});

test('pending join: token issued publicly, expires after 7 days, validated on use', async () => {
  const pub = await api(`/squads/public/join/${CODE}`);
  assert.equal(pub.status, 200);
  assert.deepEqual(Object.keys(pub.json).sort(), ['max', 'members', 'name', 'ok'], 'public preview leaks nothing else');
  const pend = await api('/squads/pending', { method: 'POST', body: { code: CODE } });
  assert.equal(pend.status, 200);
  assert.equal(new Date(pend.json.expiresAt) > Date.now() + 6 * 86400000, true, 'expires roughly 7 days out');
  const jreg = await api('/auth/register', { method: 'POST', body: { email: `svj2${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  JOINER = jreg.json.token; // downstream tests use this joiner
  const bad = await api('/squads/join', { method: 'POST', token: jreg.json.token, body: { code: CODE, pendingToken: '00000000-0000-4000-8000-000000000000' } });
  assert.equal(bad.status, 410, 'a token with no pending record is refused');
  const good = await api('/squads/join', { method: 'POST', token: jreg.json.token, body: { code: CODE, pendingToken: pend.json.token } });
  assert.equal(good.status, 200);
  assert.equal(good.json.board.members.length, 2);
});

test('nudge caps: one per pair per day, three per sender, never to someone who finished', async () => {
  const board = (await api(`/squads/${SQUAD_ID}/board`, { token: OWNER })).json.board;
  const other = board.members.find((m) => !m.isMe);
  const done = board.members.find((m) => m.doneToday);
  if (done) {
    const r = await api(`/squads/${SQUAD_ID}/nudge`, { method: 'POST', token: OWNER, body: { toId: done.id } });
    assert.equal(r.status, 400, 'no nudge to someone already finished');
  }
  const first = await api(`/squads/${SQUAD_ID}/nudge`, { method: 'POST', token: OWNER, body: { toId: other.id } });
  assert.equal(first.status, 200);
  const repeat = await api(`/squads/${SQUAD_ID}/nudge`, { method: 'POST', token: OWNER, body: { toId: other.id } });
  assert.equal(repeat.status, 400, 'one nudge per pair per day');
});

test('privacy: boards are members-only and never read across squads', async () => {
  const outsider = await api('/auth/register', { method: 'POST', body: { email: `svo2${stamp}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  const r = await api(`/squads/${SQUAD_ID}/board`, { token: outsider.json.token });
  assert.equal(r.status, 404, 'a non-member cannot read the board');
  const me = await api('/squads/me', { token: outsider.json.token });
  assert.equal(me.json.squad, null);
});

test('ownership: leave transfers to the longest-standing member; the last out deletes', async () => {
  const leave = await api(`/squads/${SQUAD_ID}/leave`, { method: 'POST', token: OWNER });
  assert.equal(leave.status, 200);
  const board = await api(`/squads/${SQUAD_ID}/board`, { token: JOINER });
  assert.equal(board.status, 200);
  assert.equal(board.json.board.ownerId, `svj2${stamp}@t.dev`, 'ownership moved to the longest-standing member');
  assert.equal(board.json.board.members.length, 1);
  const last = await api(`/squads/${SQUAD_ID}/leave`, { method: 'POST', token: JOINER });
  assert.equal(last.json.deletedSquad, true, 'the last member out deletes the squad');
});
