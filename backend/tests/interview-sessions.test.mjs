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

test('interview sessions: create is resume-aware, turns adapt, end produces a transparent report, data is private', async () => {
  const email = `ivs-${Date.now()}@t.dev`;
  const tok = (await api('/auth/register', { method: 'POST', body: { email, password: 'secret1', confirm: 'secret1' } })).json.token;

  const caps = await api('/interviews/capabilities', { token: tok });
  assert.equal(caps.json.ok, true);
  assert.equal(typeof caps.json.ai, 'boolean', 'the room must know which interviewer mode is real');

  const created = await api('/interviews/session', { method: 'POST', token: tok, body: {
    company: 'Zoho', role: 'Backend Developer', interviewTypes: ['Technical'], level: 'Fresher',
    language: 'en', persona: 'manager',
    resumeText: 'Built a placement tracker with Node.js and MongoDB used by 50 students.',
    companyDocs: [{ name: 'jd.txt', text: 'Strong JavaScript fundamentals and REST API design are required.' }],
  }});
  assert.equal(created.status, 201);
  const id = created.json.id;
  assert.ok(created.json.interview.transcript[0].text.includes('Zoho'), 'the greeting names the company');
  assert.deepEqual(created.json.interview.context.skills.includes('Node.js'), true, 'skills extracted from the actual resume text');

  const t1 = await api(`/interviews/session/${id}/turn`, { method: 'POST', token: tok, body: { text: 'Yes I can hear you clearly, English please.' } });
  assert.equal(t1.status, 200);
  const t2 = await api(`/interviews/session/${id}/turn`, { method: 'POST', token: tok, body: { text: 'I built a placement tracker with Node.js and Express, scored by fifty students weekly.' } });
  assert.ok(t2.json.turn.text.includes('introduce yourself'), 'the introduction question comes first');
  const t3 = await api(`/interviews/session/${id}/turn`, { method: 'POST', token: tok, body: { text: 'I handled the Express API layer, the MongoDB schemas, and cut the dashboard load time by forty percent.' } });
  assert.ok(t3.json.turn.text.includes('Node.js'), 'the resume deep-dive quotes the skill the candidate actually used');

  const ended = await api(`/interviews/session/${id}/end`, { method: 'POST', token: tok });
  assert.equal(ended.status, 200);
  assert.ok(ended.json.interview.report.overall >= 0);
  assert.ok(ended.json.interview.report.answers.length >= 1, 'per-answer evaluation exists');

  const listed = await api('/interviews/sessions', { token: tok });
  assert.equal(listed.json.stats.completed, 1);

  // privacy: another student sees nothing
  const b = await api('/auth/register', { method: 'POST', body: { email: `other${Date.now()}@t.dev`, password: 'secret1', confirm: 'secret1' } });
  const bl = await api('/interviews/sessions', { token: b.json.token });
  assert.equal(bl.json.sessions.length, 0, 'B sees none of A sessions');
  const gone = await api(`/interviews/session/${id}`, { token: b.json.token });
  assert.equal(gone.status, 404);
  const del = await api(`/interviews/session/${id}`, { method: 'DELETE', token: tok });
  assert.equal(del.status, 200);
});
