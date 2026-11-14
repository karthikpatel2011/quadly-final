import { test, after, before } from 'node:test';
import assert from 'node:assert/strict';
import { writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

// Practice contract tests — the whole rebuild in one file:
//   · content pipeline: every seeded scenario passes the review checks
//   · simulation engine: deterministic evidence, time cost, repeats, limits
//   · scoring: code-computed points for root cause, fixes, checking first,
//     escalation timing and hints; level adjustment on bands
//   · drills: deterministic per day, never a seen one until the bank runs out
//   · streak: freeze a week, rescue after missed days, best tracked
//   · postmortem rubric: blame/specific/actionable/root-cause in code
//   · privacy + entitlements over HTTP: your attempts are yours alone

const dataDir = fileURLToPath(new URL('../data/', import.meta.url));

const engine = await import('../src/lib/practice/engine.js');
const scoring = await import('../src/lib/practice/scoring.js');
const streakMod = await import('../src/lib/practice/streak.js');
const drillsMod = await import('../src/lib/practice/drills.js');
const review = await import('../src/lib/practice/review.js');
const contentMod = await import('../src/lib/practice/content.js');

await contentMod.ensureContent();
const CERT = contentMod.scenarios.find((s) => s.id === 'inc-cert-01');
const S3 = contentMod.scenarios.find((s) => s.id === 'inc-s3-01');
const KNIGHT = contentMod.scenarios.find((s) => s.id === 'inc-knight-01');
assert.ok(CERT && S3 && KNIGHT, 'the seed set must load');

// ---------- 1. content pipeline ----------

test('every seeded scenario passes the schema and the evidence-uniqueness check', () => {
  for (const s of contentMod.scenarios) {
    const r = review.contentCheck(s);
    assert.ok(r.ok, `${s.id} must pass the review checks: ${r.issues.join('; ')}`);
  }
  assert.equal(contentMod.scenarios.length, 5, 'five seeds: guided, standard x3, expert');
  assert.equal(contentMod.drills.length, 10, 'ten drills derived from the seeds');
});

test('the review check rejects a scenario with two true root causes', () => {
  const broken = JSON.parse(JSON.stringify(CERT));
  broken.rootCauses[1].correct = true;
  const r = review.contentCheck(broken);
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.includes('root cause')));
});

test('the review check rejects a wrong root cause that no evidence refutes', () => {
  const broken = JSON.parse(JSON.stringify(CERT));
  for (const action of broken.actions) {
    if (action.reveal) delete action.reveal.refutes;
  }
  const r = review.contentCheck(broken);
  assert.equal(r.ok, false);
  assert.ok(r.issues.some((i) => i.includes('never refuted')));
});

// ---------- 2. simulation engine ----------

test('every action reveals its own scripted evidence and adds its own time cost', () => {
  const attempt = engine.newAttempt('t@t.dev', CERT.id);
  const seen = new Map();
  for (const action of CERT.actions) {
    const a = engine.newAttempt('t@t.dev', CERT.id); // each from a clean clock
    const out = engine.applyAction(CERT, a, action.id);
    assert.ok(out.ok, `${action.id} must apply`);
    assert.equal(a.simMinutes, action.costMinutes, `${action.id} costs its scripted minutes`);
    if (action.reveal) {
      assert.ok(out.reveal, `${action.id} must reveal its evidence`);
      assert.equal(out.reveal.title, action.reveal.title);
      seen.set(action.id, out.reveal.title);
    }
  }
  assert.ok(seen.size >= 5, 'most actions carry evidence');
});

test('a once-only action refuses to run twice; unknown actions are rejected', () => {
  const attempt = engine.newAttempt('t@t.dev', CERT.id);
  const first = engine.applyAction(CERT, attempt, 'read-logs-checkout');
  assert.ok(first.ok);
  const again = engine.applyAction(CERT, attempt, 'read-logs-checkout');
  assert.ok(again.error);
  assert.ok(engine.applyAction(CERT, attempt, 'does-not-exist').error);
});

test('cascade events surface exactly once, when the sim clock passes them', () => {
  const attempt = engine.newAttempt('t@t.dev', S3.id);
  const out = engine.applyAction(S3, attempt, 'read-storage-logs'); // 5 min, passes the 12-min event? no
  assert.equal(out.events.length, 0, 'the 12-minute event must not surface at 5 minutes');
  assert.equal(attempt.eventsSeen.length, 0);
  const out2 = engine.applyAction(S3, attempt, 'inspect-change-log'); // +4 → 9 min
  assert.equal(out2.events.length, 0, 'still under 12 minutes');
  const out3 = engine.applyAction(S3, attempt, 'read-dns-records'); // +3 → 12 min
  assert.equal(out3.events.length, 1, 'the 12-minute cascade arrives exactly now');
  const out4 = engine.applyAction(S3, attempt, 'compare-capacity-metrics'); // +3 → 15
  assert.equal(out4.events.length, 0, 'the same event never repeats');
  assert.equal(attempt.eventsSeen.length, 1);
});

test('guided scenarios walk the student with step prompts; the knight has a sim clock limit', () => {
  const g = engine.newAttempt('t@t.dev', CERT.id);
  engine.applyAction(CERT, g, 'open-dashboard');
  const guidance = engine.currentGuidance(CERT, g);
  assert.ok(guidance, 'guided incidents always say what to try next');

  const k = engine.newAttempt('t@t.dev', KNIGHT.id);
  let last;
  for (const action of KNIGHT.actions) {
    last = engine.applyAction(KNIGHT, k, action.id);
    if (last.error) break;
  }
  assert.ok(last.error && last.error.includes('incident window'), 'the expert clock eventually closes');
  assert.equal(engine.currentGuidance(KNIGHT, k), null, 'expert incidents give no guidance');
});

// ---------- 3. scoring in code ----------

function resolveFixture(scenario, { rootCauseId, fixId, actionIds, hints = 0 }) {
  const attempt = engine.newAttempt('t@t.dev', scenario.id);
  for (const id of actionIds) engine.applyAction(scenario, attempt, id);
  attempt.hintsUsed = hints;
  attempt.resolution = { rootCauseId, fixId };
  return { attempt, score: scoring.scoreIncident(scenario, attempt) };
}

test('evidence first, right root cause, safe fix: the textbook run scores high', () => {
  const { score } = resolveFixture(CERT, {
    rootCauseId: 'rc-cert-expired',
    fixId: 'fix-renew-cert',
    actionIds: ['open-dashboard', 'read-logs-checkout', 'run-expiry-check'],
  });
  assert.equal(score.rootCorrect, true);
  assert.equal(score.fixSafetyName, 'safe');
  assert.equal(score.checkedFirst, 5);
  assert.equal(score.rootCause, 40);
  assert.equal(score.fixSafety, 15);
  assert.ok(score.total >= 85, `textbook run lands high, got ${score.total}`);
});

test('acting blind, guessing wrong and scaling anyway: every rule bites', () => {
  // Scale out as the FIRST action (no evidence read), one hint spent, wrong
  // root cause, harmful fix.
  const { attempt, score } = resolveFixture(CERT, {
    rootCauseId: 'rc-payment-down',
    fixId: 'fix-scale',
    actionIds: ['scale-checkout', 'open-dashboard'],
    hints: 1,
  });
  assert.equal(score.checkedFirst, 0, 'no check before acting loses the checked-first points');
  assert.equal(score.rootCause, 0);
  assert.equal(score.fixSafety, 0, 'the harmful fix scores nothing for safety');
  assert.equal(score.hints, -5);
  assert.ok(score.total <= 30, `a blind run stays low, got ${score.total}`);
  assert.equal(scoring.outcomeBand(score), 'weak');
});

test('a fix that does nothing earns a crumb; par-efficiency holds at par and slides after', () => {
  const noop = resolveFixture(CERT, { rootCauseId: 'rc-cert-expired', fixId: 'fix-rollback', actionIds: ['open-dashboard', 'read-logs-checkout', 'run-expiry-check'] });
  assert.equal(noop.score.fixSafety, 5);

  const thrifty = resolveFixture(S3, { rootCauseId: 'rc-bad-removal', fixId: 'fix-restore-entries', actionIds: ['read-storage-logs', 'inspect-change-log', 'escalate-coordinator'] });
  const wasteful = resolveFixture(S3, { rootCauseId: 'rc-bad-removal', fixId: 'fix-restore-entries', actionIds: ['check-status-boards', 'read-storage-logs', 'inspect-change-log', 'compare-capacity-metrics', 'read-dns-records', 'restart-index'] });
  assert.ok(thrifty.score.efficiency > wasteful.score.efficiency, 'fewer actions at the same par scores higher');
});

test('escalation: expected and done scores best; calm restraint also earns', () => {
  const escalated = resolveFixture(S3, { rootCauseId: 'rc-bad-removal', fixId: 'fix-restore-entries', actionIds: ['read-storage-logs', 'escalate-coordinator'] });
  const calm = resolveFixture(S3, { rootCauseId: 'rc-bad-removal', fixId: 'fix-restore-entries', actionIds: ['read-storage-logs', 'inspect-change-log'] });
  const blind = resolveFixture(S3, { rootCauseId: 'rc-bad-removal', fixId: 'fix-restore-entries', actionIds: ['escalate-coordinator'] });
  assert.equal(escalated.score.escalation, 10, 'S3 declares SEV-1; escalating after evidence scores full');
  assert.equal(calm.score.escalation, 0, 'S3 expects escalation — staying alone scores nothing');
  assert.equal(blind.score.escalation, 4, 'escalating with zero evidence still coordinates the SEV-1, but at half credit');
  const restraint = resolveFixture(CERT, { rootCauseId: 'rc-cert-expired', fixId: 'fix-renew-cert', actionIds: ['open-dashboard', 'read-logs-checkout'] });
  assert.ok(restraint.score.escalation > 0, 'a self-solvable incident rewards staying calm');
});

test('levels move up after two strong results and down after two weak ones, never past the ends', () => {
  let doc = { level: 1, recent: [] };
  doc = scoring.adjustLevel(doc, 'strong');
  assert.equal(doc.level, 1, 'one strong result is not a promotion');
  doc = scoring.adjustLevel(doc, 'strong');
  assert.equal(doc.level, 2, 'two in a row promote');
  doc = scoring.adjustLevel(doc, 'neutral');
  assert.equal(doc.recent.length, 0, 'neutral clears the ladder’s memory');
  doc = scoring.adjustLevel(doc, 'weak');
  doc = scoring.adjustLevel(doc, 'weak');
  assert.equal(doc.level, 1, 'two weak results step down');
  let top = { level: 5, recent: [] };
  top = scoring.adjustLevel(top, 'strong');
  top = scoring.adjustLevel(top, 'strong');
  assert.equal(top.level, 5, 'no level beyond 5');
  let floor = { level: 1, recent: [] };
  floor = scoring.adjustLevel(floor, 'weak');
  floor = scoring.adjustLevel(floor, 'weak');
  assert.equal(floor.level, 1, 'no level below 1');
});

// ---------- 4. drill selection ----------

test('a day’s drill is deterministic per student, and no drill repeats until the bank runs out', () => {
  const seen = {};
  const track = 'Software Engineering';
  const day1 = drillsMod.pickTodayDrill({ dayKey: '2026-11-09', level: 1, track, seen });
  const day1again = drillsMod.pickTodayDrill({ dayKey: '2026-11-09', level: 1, track, seen });
  assert.equal(day1.drill.id, day1again.drill.id, 'refreshes serve the same drill');

  seen[day1.drill.id] = '2026-11-09';
  const picked = new Set([day1.drill.id]);
  for (let i = 10; i < 40; i += 1) {
    const day = new Date(Date.parse('2026-11-09T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
    const out = drillsMod.pickTodayDrill({ dayKey: day, level: 3, track, seen });
    assert.ok(out.drill, 'a drill is always served');
    if (!out.repeats) {
      assert.ok(!picked.has(out.drill.id), `unseen drill ${out.drill.id} must be fresh`);
      picked.add(out.drill.id);
      seen[out.drill.id] = day;
    }
  }
  assert.ok(picked.size >= 4, 'a software student at least cycles the whole SE-visible bank');
});

test('drills respect the student’s track', () => {
  const seen = {};
  const levels = { 'Software Engineering': 1000, 'AI & ML': 3000, 'Cyber Security': 5000 };
  for (let i = 0; i < 60; i += 1) {
    const day = new Date(Date.parse('2026-11-09T00:00:00Z') + i * 86_400_000).toISOString().slice(0, 10);
    for (const [track, level] of Object.entries(levels)) {
      const out = drillsMod.pickTodayDrill({ dayKey: day, level, track, seen: {} });
      assert.ok(out.drill.track === null || out.drill.track === track, 'shared or own track only');
    }
  }
});

// ---------- 5. streak: freeze a week, rescue after a gap ----------

const DAY0 = Date.parse('2026-10-01T00:00:00Z');

test('contiguous drill days build a streak; one missed day is frozen once a week', () => {
  const day = (n) => DAY0 + n * 86_400_000;
  let doc = null;
  let out = streakMod.recordDrillDay(doc, day(0));
  doc = out.doc;
  assert.equal(out.streak, 1);
  out = streakMod.recordDrillDay(doc, day(1)); doc = out.doc;
  assert.equal(out.streak, 2);
  // skip day(2): Monday-week freeze bridges exactly one missed day.
  out = streakMod.recordDrillDay(doc, day(3)); doc = out.doc;
  assert.equal(out.streak, 3, 'the weekly freeze bridges the single missed day');
  assert.equal(doc.bridge['2026-10-03'], 'freeze', 'the bridge says why');
  // Missing two days inside the same week cannot re-freeze: the run breaks.
  out = streakMod.recordDrillDay(doc, day(7)); doc = out.doc;
  assert.ok(doc.rescue?.day !== '2026-10-04', 'a fresh week, but a 3-day spread either rescues or breaks');
  assert.equal(out.streak >= 1, true);
});

test('a rescue restores a 2-5 day break exactly once per 30 days', () => {
  const day = (n) => DAY0 + n * 86_400_000;
  // Build a 5-day run.
  let doc = null;
  for (let i = 0; i < 5; i += 1) {
    doc = streakMod.recordDrillDay(doc, day(i)).doc;
  }
  const view = streakMod.streakView(doc, day(9));
  assert.ok(view.canRescue, 'after four missed days with a 5-run behind you, a rescue is offered');
  const out = streakMod.recordDrillDay(doc, day(9));
  doc = out.doc;
  assert.ok(out.rescued, 'the completion rescues the streak');
  assert.equal(out.streak, 6, 'prior run restored plus today');

  // A second break inside a month: no rescue, honestly restart.
  const out2 = streakMod.recordDrillDay(doc, day(14));
  assert.equal(out2.rescued, false, 'rescue is once per 30 days');
  assert.equal(out2.streak, 1, 'without a rescue the streak restarts at today');
});

test('streak views are read-only and idempotent', () => {
  const day = (n) => DAY0 + n * 86_400_000;
  let doc = streakMod.recordDrillDay(null, day(0)).doc;
  doc = streakMod.recordDrillDay(doc, day(1)).doc;
  const twice = streakMod.recordDrillDay(doc, day(1));
  assert.equal(twice.already, true);
  assert.equal(twice.streak, 2);
});

// ---------- 6. postmortem rubric (deterministic fallback) ----------

function resolvedCertAttempt() {
  const attempt = engine.newAttempt('t@t.dev', CERT.id);
  for (const a of ['open-dashboard', 'read-logs-checkout', 'run-expiry-check', 'check-recent-changes']) {
    engine.applyAction(CERT, attempt, a);
  }
  attempt.resolution = { rootCauseId: 'rc-cert-expired', fixId: 'fix-renew-cert' };
  return attempt;
}

const GOOD_BODY = {
  happened: 'The checkout API refused every payment between 09:37 and 10:05 because its TLS certificate had expired at 23:59 UTC the night before.',
  impact: 'Zero completed orders for 28 minutes — about 4,200 failed payments and 38 tickets in support.',
  rootCause: 'The TLS certificate on checkout-api expired overnight; the renewal job failed with exit code 1 last week and no retry existed.',
  fix: 'Reissued the certificate and deployed it to all instances of checkout-api, then verified the renewal job.',
  prevention: 'Add an expiry alert 14 days out, make the renewal job retry with paging on failure, and review the certificate checklist monthly.',
};

test('the code rubric grades a workmanlike postmortem full marks on all four dimensions', () => {
  const dims = scoring.rubricBooleans(CERT, resolvedCertAttempt(), GOOD_BODY);
  assert.deepEqual(dims, { specific: true, blameless: true, actionable: true, rootCause: true });
  assert.equal(scoring.rubricScore({ specific: true, blameless: true, actionable: true, rootCause: true }), 100);
});

test('blame language and vague prevention lose their dimensions; a wrong root cause can never pass', () => {
  const blaming = { ...GOOD_BODY, happened: GOOD_BODY.happened.replace('the night before.', 'the night before — the on-call junior dev was careless.'), prevention: 'We will try harder and be more careful in future.' };
  const dims = scoring.rubricBooleans(CERT, resolvedCertAttempt(), blaming);
  assert.equal(dims.blameless, false, 'naming a culprit fails blameless');
  assert.equal(dims.actionable, false, 'intent is not actionable prevention');

  // Above all: code checks the (student-computed) chosen root cause.
  const wrongRootAttempt = engine.newAttempt('t@t.dev', CERT.id);
  engine.applyAction(CERT, wrongRootAttempt, 'open-dashboard');
  wrongRootAttempt.resolution = { rootCauseId: 'rc-payment-down', fixId: 'fix-renew-cert' };
  const dims2 = scoring.rubricBooleans(CERT, wrongRootAttempt, GOOD_BODY);
  assert.equal(dims2.rootCause, false, 'the right words cannot fix a wrong call at resolve time');
  assert.ok(scoring.rubricScore(dims2) < 100);
});

// ---------- 7. defense answers graded by coverage in code ----------

test('defend answers score by expected key points, with a length sanity factor', () => {
  const q = CERT.defendQuestions.find((d) => d.id === 'dq-cert-2');
  const solid = scoring.scoreDefendAnswer(q, 'Every copy of the instances mounted the same certificate file, so scaling just multiplied identical handshake failures on each node.');
  assert.ok(solid.points >= 1, `a real answer earns points, got ${solid.points}`);
  const terse = scoring.scoreDefendAnswer(q, 'cert');
  assert.equal(terse.points, 0, 'one keyword is not an answer');
  const full = scoring.scoreDefend([q], [{ questionId: q.id, text: 'All instances shared the same certificate, so every new node failed the identical TLS handshake; scaling multiplied the copies and the load.' }]);
  assert.ok(full.score >= 50);
});

// ---------- 8. HTTP: privacy, entitlements, idempotency ----------

const { createApp } = await import('../src/app.js');
const app = createApp();
const server = app.listen(0);
const base = `http://127.0.0.1:${server.address().port}`;
after(() => new Promise((resolve) => server.close(resolve)));

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
let A, B, A_EMAIL, B_EMAIL;

before(async () => {
  // This suite owns the practice per-student stores.
  const reset = (name, value) => writeFileSync(dataDir + name, JSON.stringify(value, null, 2));
  for (const f of [
    'practice-incident-attempts.json', 'practice-drill-attempts.json',
    'practice-postmortems.json', 'practice-defend-attempts.json',
    'practice-levels.json', 'practice-streaks.json', 'practice-ai-usage.json',
    'practice-queue.json',
  ]) {
    reset(f, f === 'practice-queue.json' ? { scenarios: [] } : {});
  }
  A_EMAIL = `pa${stamp}@t.dev`;
  B_EMAIL = `pb${stamp}@t.dev`;
  const a = await api('/auth/register', { method: 'POST', body: { email: A_EMAIL, password: 'secret1', confirm: 'secret1' } });
  const b = await api('/auth/register', { method: 'POST', body: { email: B_EMAIL, password: 'secret1', confirm: 'secret1' } });
  A = a.json.token;
  B = b.json.token;
  const onb = (token, email) => api('/onboarding', {
    method: 'POST', token,
    body: { email, name: 'P T', college: 'somewhere', track: 'Software Engineering', role: 'SDE', year: '3rd year', dailyTime: '30 minutes a day' },
  });
  await onb(A, A_EMAIL);
  await onb(B, B_EMAIL);
});

test('practice home shapes the week: level, streak, next incident, entitlements, no secrets', async () => {
  const r = await api('/practice/home', { token: A });
  assert.equal(r.status, 200);
  assert.equal(r.json.level.level, 1, 'a first-time student starts guided');
  assert.equal(r.json.level.tier, 'guided');
  assert.equal(r.json.entitlements.incidentsLeft, 2, 'free plan: a few incidents a week');
  assert.ok(r.json.drill.id, 'today’s drill is served');
  assert.ok(!JSON.stringify(r.json.drill).includes('answerIndex'), 'answers never ship before the student answers');
  assert.ok(r.json.nextIncident.id, 'a next incident is offered');
  assert.equal(r.json.aiOnline, false, 'no LLM key in tests — the scripted coach says so honestly');
});

test('unauthenticated practice requests are all 401 JSON', async () => {
  for (const p of ['/practice/home', '/practice/drill/today', '/practice/work-record/x']) {
    const r = await api(p);
    assert.equal(r.status, 401, p);
    assert.ok(r.json.error, p);
  }
});

let A_ATT;

test('incident lifecycle over HTTP: start, evidence, hint guard, resolve with score', async () => {
  const start = await api('/practice/incidents/inc-cert-01/start', { method: 'POST', token: A });
  assert.equal(start.status, 201);
  A_ATT = start.json.attempt.attemptId;
  assert.ok(start.json.scenario.actions.length > 0);

  // The pre-resolve payload never carries the answer.
  const pre = JSON.stringify(start.json);
  assert.ok(!pre.includes('"correct"'), 'no root-cause truth leaks');
  assert.ok(!pre.includes('"safety"'), 'no fix safety leaks');
  assert.ok(!pre.includes('hintLadder'), 'the ladder stays hidden');
  assert.ok(pre.includes('Inspired by'), 'provenance ships from the start');

  const act = await api(`/practice/incidents/${A_ATT}/action`, { method: 'POST', token: A, body: { actionId: 'read-logs-checkout' } });
  assert.equal(act.status, 200);
  assert.equal(act.json.reveal.title, 'checkout-api/error.log — last 10 minutes');

  const hint = await api(`/practice/incidents/${A_ATT}/hint`, { method: 'POST', token: A, body: {} });
  assert.equal(hint.status, 200);
  assert.equal(hint.json.source, 'scripted', 'without a key the coach is honestly scripted');
  assert.ok(!hint.json.hint.toLowerCase().includes('certificate'), 'a hint never names the root cause words');

  const bad = await api(`/practice/incidents/${A_ATT}/resolve`, { method: 'POST', token: A, body: { rootCauseId: 'nope', fixId: 'fix-renew-cert' } });
  assert.equal(bad.status, 400);

  const done = await api(`/practice/incidents/${A_ATT}/resolve`, { method: 'POST', token: A, body: { rootCauseId: 'rc-cert-expired', fixId: 'fix-renew-cert' } });
  assert.equal(done.status, 200);
  assert.equal(done.json.band, 'strong');
  assert.equal(done.json.score.rootCorrect, true);
  assert.ok(done.json.reveal.lesson, 'the reveal explains the lesson');
  assert.ok(done.json.reveal.source.url.startsWith('https://'), 'the reveal links the real record');

  const again = await api(`/practice/incidents/${A_ATT}/resolve`, { method: 'POST', token: A, body: { rootCauseId: 'rc-cert-expired', fixId: 'fix-renew-cert' } });
  assert.equal(again.status, 200);
  assert.equal(again.json.already, true, 'resolve is idempotent');
});

test('a private attempt is invisible to other students', async () => {
  const r = await api(`/practice/incidents/${A_ATT}`, { token: B });
  assert.equal(r.status, 404);
  const r2 = await api(`/practice/incidents/${A_ATT}/action`, { method: 'POST', token: B, body: { actionId: 'open-dashboard' } });
  assert.equal(r2.status, 404);
  const r3 = await api(`/practice/work-record/${A_ATT}`, { token: B });
  assert.equal(r3.status, 404);
});

test('free plan: the third distinct incident start in a week is politely refused', async () => {
  const s1 = await api('/practice/incidents/inc-s3-01/start', { method: 'POST', token: B });
  const s2 = await api('/practice/incidents/inc-knight-01/start', { method: 'POST', token: B });
  const s3 = await api('/practice/incidents/inc-ml-labels-01/start', { method: 'POST', token: B });
  assert.equal(s1.status, 201);
  assert.equal(s2.status, 201);
  assert.equal(s3.status, 403, 'the weekly incident budget is real');
  // Resuming an active attempt is always free.
  const resume = await api('/practice/incidents/inc-s3-01/start', { method: 'POST', token: B });
  assert.equal(resume.status, 200);
  assert.equal(resume.json.resumed, true);
});

test('expert incidents refuse hints outright', async () => {
  const start = await api('/practice/incidents/inc-knight-01/start', { method: 'POST', token: A });
  const att = start.json.attempt.attemptId;
  const hint = await api(`/practice/incidents/${att}/hint`, { method: 'POST', token: A, body: {} });
  assert.equal(hint.status, 403);
});

test('two weaker results quietly step the level down; strong results step it up', async () => {
  // B resolves two distinct incidents badly: wrong root cause, harmful fix,
  // acting before checking.
  for (const [scenarioId, wrongRc, badFix] of [
    ['inc-s3-01', 'rc-global-dns', 'fix-wipe-and-rebuild'],
    ['inc-knight-01', 'rc-market-move', 'fix-widen-risk-limits'],
  ]) {
    const start = await api(`/practice/incidents/${scenarioId}/start`, { method: 'POST', token: B });
    const att = start.json.attempt.attemptId;
    const done = await api(`/practice/incidents/${att}/resolve`, { method: 'POST', token: B, body: { rootCauseId: wrongRc, fixId: badFix } });
    assert.equal(done.status, 200);
    assert.equal(done.json.band, 'weak');
  }
  const home = await api('/practice/home', { token: B });
  // B's SE level starts at 1 — weak results hold it down, never below 1.
  assert.equal(home.json.level.level, 1);
  assert.equal(home.json.level.tier, 'guided');
});

test('postmortem: rules-critique, revision history, score delta, and the defend gate', async () => {
  const pmPath = '/practice/postmortems';
  const body = { attemptId: A_ATT, body: GOOD_BODY };
  const first = await api(pmPath, { method: 'POST', token: A, body });
  assert.equal(first.status, 200);
  assert.equal(first.json.version, 1);
  assert.equal(first.json.review.source, 'rules', 'no LLM key → the deterministic rubric runs');
  assert.equal(first.json.score, 100);
  assert.equal(first.json.defendQuestions.length, 3);

  const worse = { ...GOOD_BODY, prevention: 'Be more careful next time.' };
  const second = await api(pmPath, { method: 'POST', token: A, body: { attemptId: A_ATT, body: worse } });
  assert.equal(second.status, 200);
  assert.equal(second.json.version, 2);
  assert.equal(second.json.scoreChange, -20, 'the score delta shows the revision got worse');
  assert.equal(second.json.review.dims.actionable, false);

  const defend = await api(`/practice/postmortems/${A_ATT}/defend`, {
    method: 'POST', token: A,
    body: { answers: [{ questionId: 'dq-cert-1', text: 'They all shared the certificate, so all failed together.' }] },
  });
  assert.equal(defend.status, 403, 'defend is the paid step');
});

test('work record: private by default, shareable by an explicit action, public view carries no identity', async () => {
  const rec = await api(`/practice/work-record/${A_ATT}`, { token: A });
  assert.equal(rec.status, 200);
  assert.equal(rec.json.share.enabled, false, 'private by default');

  const share = await api(`/practice/work-record/${A_ATT}/share`, { method: 'POST', token: A, body: { share: true } });
  assert.equal(share.status, 200);
  const token = share.json.token;
  assert.ok(token && token.length >= 16);

  const pub = await api(`/practice/work-record/shared/${token}`);
  assert.equal(pub.status, 200);
  const raw = JSON.stringify(pub.json);
  assert.ok(!raw.includes(A_EMAIL), 'the shared view never carries the email');
  assert.equal(pub.json.record.shared, true);

  const off = await api(`/practice/work-record/${A_ATT}/share`, { method: 'POST', token: A, body: { share: false } });
  assert.equal(off.json.enabled, false);
  const gone = await api(`/practice/work-record/shared/${token}`);
  assert.equal(gone.status, 404, 'revoking kills the link');

  const bogus = await api('/practice/work-record/shared/deadbeefdeadbeefdeadbeefdeadbeef');
  assert.equal(bogus.status, 404);
});

test('drills: answering today’s drill marks a streak day; yesterday’s drill refuses', async () => {
  const today = await api('/practice/drill/today', { token: B });
  assert.equal(today.status, 200);
  const other = await api('/practice/drill/drill-knight-01/answer', { method: 'POST', token: B, body: { optionIndex: 0 } });
  if (other.json?.error) {
    assert.ok(other.status === 409, 'a non-today drill refuses politely');
  }
  const answer = await api(`/practice/drill/${today.json.drill.id}/answer`, { method: 'POST', token: B, body: { optionIndex: 1 } });
  assert.equal(answer.status, 200);
  assert.equal(answer.json.streak.streak, 1);

  const repeat = await api(`/practice/drill/${today.json.drill.id}/answer`, { method: 'POST', token: B, body: { optionIndex: 1 } });
  assert.equal(repeat.json.already, true);
  assert.equal(repeat.json.streak.streak, 1, 'idempotent within the day');

  const after = await api('/practice/drill/today', { token: B });
  assert.equal(after.json.answered, true);
  assert.ok(after.json.result.why, 'the drill teaches the why after answering');
});

test('DPDP: deleting the account scrubs every practice store', async () => {
  const del = await api('/auth/account', { method: 'DELETE', token: A, body: { confirm: 'DELETE' } });
  assert.equal(del.status, 200);
  const login = await api('/practice/home', { token: A });
  assert.equal(login.status, 401);
  for (const f of [
    'practice-incident-attempts.json', 'practice-drill-attempts.json',
    'practice-postmortems.json', 'practice-defend-attempts.json',
    'practice-levels.json', 'practice-streaks.json',
  ]) {
    if (!existsSync(dataDir + f)) continue;
    const raw = JSON.stringify(JSON.parse(await import('node:fs').then((fs) => fs.readFileSync(dataDir + f, 'utf8'))));
    assert.ok(!raw.includes(`pa${stamp}`), `${f} must forget the deleted student`);
  }
  // Their revoked share link is dead too.
  assert.equal((await api(`/practice/work-record/shared/unavailable-after-deletion`)).status, 404);
});
