import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Workplace — the simulated first job. Contract under test: outcomes are
// deterministic (code decides, never the AI), per-student seeds make copied
// answers fail, the Voice Defend is transcript-only (no audio anywhere),
// verified episodes flow through the shared completion hook (streak/plan),
// and every student sees only their own simulation.

const { createApp } = await import('../src/app.js');
const { seedFor, sanitizeInput, evaluateEpisode, weeklyGaps } = await import('../src/lib/workplace/evaluator.js');
const { episodeById } = await import('../src/lib/workplace/content.js');

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

const dataDir = fileURLToPath(new URL('../data/', import.meta.url));
const stamp = Date.now();
writeFileSync(dataDir + 'workplace-progress.json', JSON.stringify({}, null, 2));
writeFileSync(dataDir + 'workplace-submissions.json', JSON.stringify({}, null, 2));
writeFileSync(dataDir + 'workplace-passports.json', JSON.stringify({}, null, 2));
writeFileSync(dataDir + 'workplace-chat.json', JSON.stringify({}, null, 2));

const EMAIL = `wp${stamp}@t.dev`;
const EMAIL_B = `wpb${stamp}@t.dev`;
let A, B;

async function register(email) {
  const r = await api('/auth/register', { method: 'POST', body: { email, password: 'secret1', confirm: 'secret1' } });
  assert.equal(r.status, 201);
  const o = await api('/onboarding', {
    method: 'POST', token: r.json.token,
    body: { email, name: 'Workplace Tester', track: 'Software Engineering', role: 'Backend developer', year: '3rd year' },
  });
  assert.equal(o.status, 201);
  return r.json.token;
}

// ------------------------------------------------------ evaluator units ----

test('seedFor: stable per student, unique-enough across students, inside the vocab', () => {
  const a1 = seedFor('asha@t.dev');
  const a2 = seedFor('ASHA@t.dev ');
  const b = seedFor('bhuvan@t.dev');
  assert.deepEqual(a1, a2, 'case/whitespace does not change the seed');
  assert.match(a1.shipId, /^SFT-\d{4}$/);
  assert.notEqual(`${a1.city}|${a1.customer}|${a1.fn}`, `${b.city}|${b.customer}|${b.fn}`, 'two students rarely share a whole ticket');
});

test('sanitizeInput: control characters are stripped and length is capped', () => {
  const dirty = 'hello\u0000\u001F world  \n  next';
  assert.equal(sanitizeInput(dirty, 100), 'hello world  \n  next');
  assert.equal(sanitizeInput('x'.repeat(9999), 50).length, 50);
});

test('evaluateEpisode: the honest w1d1 answer passes, every check green', () => {
  const ep = episodeById('w1d1');
  const verdict = evaluateEpisode({
    episode: ep, tier: 'standard', email: 'asha@t.dev',
    work: 'I changed the mapping to booked: "Confirmed". I verified it against the contract comment directly above the STATUS_LABELS constant in dashboard/labels.js.',
    defend: 'The constants file is the source of truth here. The comment above STATUS_LABELS defines booked as confirmed-but-not-dispatched, so the label lied. I fixed that one mapping and nothing else.',
  });
  assert.equal(verdict.pass, true);
  assert.equal(verdict.overall, 100);
  assert.ok(verdict.star, 'a verified fix earns a STAR story');
  assert.match(verdict.star.result, /simulation/i, 'the story is honestly labelled');
});

test('evaluateEpisode: a right label with no verification named fails on ownership', () => {
  const ep = episodeById('w1d1');
  const verdict = evaluateEpisode({
    episode: ep, tier: 'standard', email: 'asha@t.dev',
    work: 'Changed the label to booked: "Confirmed". Should work now.',
    defend: 'I fixed the label and it looks right. The dashboard will show confirmed now, dispatch stays the same, nothing else changed anywhere.',
  });
  assert.equal(verdict.pass, false);
  assert.ok(verdict.feedback.missed.some((m) => /truth lives/i.test(m)));
  assert.ok(verdict.overall < 100);
  assert.equal(verdict.star, null, 'no story from unverified work');
});

test('evaluateEpisode: seedRef anti-cheat — the wrong function name can never pass', () => {
  const ep = episodeById('w2d3');
  const seed = seedFor('copycat@t.dev');
  const friend = seedFor('friend@t.dev');
  const text = (fn) => `Line 8: ${fn} divides by zero when the shipments list is empty. Suggest returning null so the card renders "no data".`;
  const mine = evaluateEpisode({ episode: ep, tier: 'standard', email: 'copycat@t.dev', work: text(seed.fn), defend: 'I pointed at the exact line and suggested the guard because an empty list divides by zero and the review comment should propose the fix.' });
  const pasted = evaluateEpisode({ episode: ep, tier: 'standard', email: 'copycat@t.dev', work: text(friend.fn), defend: 'I pointed at the exact line and suggested the guard because an empty list divides by zero and the review comment should propose the fix.' });
  const fnCheck = (v) => v.checks.find((c) => c.note.includes('actual function'));
  assert.equal(fnCheck(mine).pass, true);
  assert.equal(fnCheck(pasted).pass, false, 'a friend’s answer names the wrong function');
});

test('evaluateEpisode: tiers scale the defend bar — guided lenient, expert strict', () => {
  const ep = episodeById('w1d1');
  const work = 'I changed the mapping to booked: "Confirmed" — the constant in dashboard/labels.js defines booked as confirmed.';
  const shortDefend = 'The constants file defines booked as confirmed, so I fixed that mapping.';
  const guided = evaluateEpisode({ episode: ep, tier: 'guided', email: 'g@t.dev', work, defend: shortDefend });
  const expert = evaluateEpisode({ episode: ep, tier: 'expert', email: 'e@t.dev', work, defend: shortDefend });
  assert.equal(guided.pass, true, 'guided: one covered idea, shorter transcript');
  assert.equal(expert.pass, false, 'expert: the same transcript is too thin');
});

test('weeklyGaps: built from verified rubric axes only, weakest first, capped at two', () => {
  assert.deepEqual(weeklyGaps([]), [], 'no verified work, no gaps — real progress only');
  const gaps = weeklyGaps([
    { pass: true, rubric: { communication: 60, impact: 95, teamwork: 90 } },
    { pass: true, rubric: { communication: 70, impact: 92 } },
  ]);
  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].axis, 'communication');
  assert.ok(gaps[0].plan.length > 10, 'each gap carries a micro-plan');
});

// ---------------------------------------------------------- route tests ----

test('workplace answers 401 JSON to strangers', async () => {
  const r = await api('/workplace/today');
  assert.equal(r.status, 401);
  assert.ok(r.json.error);
});

test('start: free plan refuses expert, accepts guided; today opens w1d1', async () => {
  A = await register(EMAIL);
  const greedy = await api('/workplace/start', { method: 'POST', token: A, body: { tier: 'expert' } });
  assert.equal(greedy.status, 402, 'expert is a paid tier');
  const start = await api('/workplace/start', { method: 'POST', token: A, body: { tier: 'guided' } });
  assert.equal(start.status, 201);
  assert.equal(start.json.progress.currentEpisodeId, 'w1d1');

  const today = await api('/workplace/today', { token: A });
  assert.equal(today.json.progress.tier, 'guided');
  assert.equal(today.json.today.id, 'w1d1');
  assert.equal(today.json.today.weekOf.of, 1, 'free plan: week 1 of the starter story');
  assert.ok(today.json.today.managerLine);
});

test('today: quiz answers never leave the server; the ticket carries the student seed', async () => {
  const today = await api('/workplace/story', { token: A });
  const open = today.json.episodes.find((e) => e.status === 'open');
  for (const q of open.academy.quiz) {
    assert.deepEqual(Object.keys(q).sort(), ['options', 'q'], 'a quiz item is prompt + options, nothing else');
    assert.equal(typeof q.q, 'string', 'the prompt itself is a string, not a leaked object');
    assert.ok(Array.isArray(q.options));
  }
  const seed = seedFor(EMAIL);
  assert.ok(open.ticket.intro.includes(seed.shipId), 'the ticket names THIS student’s shipment');
});

test('academy check: the ticket stays gated first, wrong answers teach, correct ones unlock', async () => {
  const gated = await api('/workplace/submit', { method: 'POST', token: A, body: { episodeId: 'w1d1', work: 'x', defend: 'y' } });
  assert.equal(gated.status, 409, 'no submission before the academy check');
  assert.match(gated.json.error, /Academy/i);

  const wrong = await api('/workplace/academy/complete', { method: 'POST', token: A, body: { episodeId: 'w1d1', answers: [0] } });
  assert.equal(wrong.status, 200);
  assert.equal(wrong.json.unlocked, false);
  assert.ok(wrong.json.results[0].why);

  const right = await api('/workplace/academy/complete', { method: 'POST', token: A, body: { episodeId: 'w1d1', answers: [1] } });
  assert.equal(right.json.unlocked, true);
});

test('chat: the persona answers deterministically without an LLM key, and the daily cap holds', async () => {
  const first = await api('/workplace/chat', { method: 'POST', token: A, body: { episodeId: 'w1d1', message: 'I am stuck on where to look.' } });
  assert.equal(first.status, 200);
  assert.equal(first.json.source, 'deterministic');
  assert.ok(first.json.reply.length > 10);

  let last;
  for (let i = 0; i < 12; i++) {
    last = await api('/workplace/chat', { method: 'POST', token: A, body: { episodeId: 'w1d1', message: `checking the cap ${i}` } });
  }
  assert.equal(last.status, 429, 'the per-student daily chat cap is a real limit');
});

test('submit: a verified episode flows through the shared hook — plan mission done, streak moves', async () => {
  const goodWork = 'I changed the mapping to booked: "Confirmed". I verified it against the contract comment directly above the STATUS_LABELS constant in dashboard/labels.js.';
  const goodDefend = 'The constants file is the source of truth here. The comment above STATUS_LABELS defines booked as confirmed-but-not-dispatched, so the label lied. I fixed that one mapping and nothing else.';
  const fail1 = await api('/workplace/submit', { method: 'POST', token: A, body: { episodeId: 'w1d1', work: 'Changed the label somewhere in the dashboard.', defend: 'It should work now, I think the dashboard will show the right thing for the customers.' } });
  assert.equal(fail1.status, 200);
  assert.equal(fail1.json.verdict.pass, false);
  assert.equal(fail1.json.attemptsLeft, 2, 'honest retries, capped');

  const pass = await api('/workplace/submit', { method: 'POST', token: A, body: { episodeId: 'w1d1', work: goodWork, defend: goodDefend } });
  assert.equal(pass.json.verdict.pass, true);
  assert.equal(pass.json.verdict.taskMarked, true, 'the shared completion hook ran');

  const home = await api('/home', { token: A });
  const learn = home.json.today.data.missions.find((m) => m.category === 'learn');
  assert.equal(learn.done, true, 'the day’s learn mission is done via the ONE mutator');
  assert.match(learn.result, /Workplace — /, 'the result names the episode honestly');

  const today = await api('/workplace/today', { token: A });
  assert.equal(today.json.today.id, 'w1d2', 'the pointer moved to day 2');
  assert.equal(today.json.progress.verifiedCount, 1);

  const again = await api('/workplace/submit', { method: 'POST', token: A, body: { episodeId: 'w1d1', work: goodWork, defend: goodDefend } });
  assert.equal(again.status, 409, 'a verified day stays verified');
});

test('passport: STAR story from the verified episode, labelled a simulation', async () => {
  const p = await api('/workplace/passport', { token: A });
  assert.equal(p.status, 200);
  assert.match(p.json.label, /never work experience/i);
  assert.equal(p.json.star.length, 1);
  assert.equal(p.json.star[0].episodeId, 'w1d1');
  assert.ok(p.json.star[0].action.length > 10);
});

test('isolation: student B’s workplace starts empty and never sees A’s simulation', async () => {
  B = await register(EMAIL_B);
  const bToday = await api('/workplace/today', { token: B });
  assert.equal(bToday.json.progress, null, 'B has not started');
  const raw = JSON.stringify(bToday.json);
  assert.ok(!raw.includes(seedFor(EMAIL).shipId), 'B’s payload never carries A’s seeded shipment');
  const bPassport = await api('/workplace/passport', { token: B });
  assert.equal(bPassport.json.empty, true);
  assert.equal(bPassport.json.star.length, 0);
});

test('week gate: a free student’s week-2 episodes are present but locked by plan', async () => {
  const story = await api('/workplace/story', { token: A });
  const w2 = story.json.episodes.filter((e) => e.week === 2);
  assert.equal(w2.length, 5);
  assert.ok(w2.every((e) => e.status === 'locked' && e.lockedByPlan));
  assert.ok(w2.every((e) => !e.academy && !e.ticket), 'locked episodes leak no payload');
});
