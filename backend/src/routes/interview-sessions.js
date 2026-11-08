import { Router } from 'express';
import { readFile, writeFile, rename } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';
import { markTodayMission } from './dashboard.js';
import { llmAvailable, llmComplete } from '../lib/llm.js';
import {
  PERSONAS, extractSkills, extractCompanyLines, greetingTurn,
  directorTurn, llmInterviewerPrompt, llmReportPrompt, FILLERS,
} from '../lib/interview-director.js';

// Interview sessions — the persistent state behind the AI interview simulator:
// setup context (company / role / uploads), the full transcript, and the
// final report. Sessions survive refreshes and backend restarts (JSON doc).
// The interviewer brain has two honest modes: LLM conversation when a
// provider key is configured in backend/.env, and a clearly-labelled
// scripted director otherwise. It never fakes AI.

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const FILE = DATA_DIR + 'interview-sessions.json';

async function readStore() {
  try {
    const doc = JSON.parse(await readFile(FILE, 'utf8'));
    return doc && typeof doc === 'object' ? doc : {};
  } catch {
    return {};
  }
}

async function writeStore(doc) {
  const tmp = `${FILE}.tmp`;
  await writeFile(tmp, JSON.stringify(doc, null, 2));
  await rename(tmp, FILE);
}

const router = Router();

function requireUser(req, res) {
  const header = req.get('authorization') || '';
  return resolveSession(header.startsWith('Bearer ') ? header.slice(7) : '');
}

function ownSession(store, email, id) {
  return store[email]?.sessions?.[id] ?? null;
}

const stripSession = (s) => ({
  id: s.id,
  company: s.company,
  companyDocs: (s.companyDocs || []).map((d) => d.name),
  role: s.role,
  interviewTypes: s.interviewTypes,
  level: s.level,
  language: s.language,
  persona: s.persona,
  personaName: (PERSONAS[s.persona] ?? PERSONAS.manager).name,
  status: s.status,
  startedAt: s.startedAt,
  endedAt: s.endedAt ?? null,
  context: { skills: s.context?.skills ?? [], companyLines: s.context?.companyLines ?? [], resumeChars: (s.context?.resumeText || '').length },
  transcript: s.transcript,
  report: s.report ?? null,
  turnCount: (s.transcript || []).filter((t) => t.role === 'candidate').length,
});

// Capabilities the room and setup screens should honestly display.
router.get('/capabilities', (req, res) => {
  res.json({
    ok: true,
    ai: llmAvailable(), // false ⇒ scripted interviewer (clearly labelled in the room)
    interviewer: llmAvailable() ? 'AI conversational (configured provider)' : 'Scripted interviewer — set LLM_API_KEY in backend/.env for full AI conversation',
    voice: {
      output: 'browser text-to-speech (en/hi/te voices where the OS provides them)',
      input: 'browser speech recognition (Chrome/Edge best; typed fallback always available)',
    },
  });
});

router.post('/extract', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const name = String(req.body?.name || 'document');
  const kind = String(req.body?.kind || '').toLowerCase();
  const dataB64 = String(req.body?.dataB64 || '');
  if (!dataB64) return res.status(400).json({ error: 'No file content received.' });
  let buffer;
  try {
    buffer = Buffer.from(dataB64, 'base64');
  } catch {
    return res.status(400).json({ error: 'The file could not be decoded.' });
  }
  if (buffer.length > 8 * 1024 * 1024) {
    return res.status(413).json({ error: 'That file is over 8 MB — try a smaller version.' });
  }
  let text = '';
  try {
    if (kind === 'pdf' || name.toLowerCase().endsWith('.pdf')) {
      const pdfParse = (await import('pdf-parse/lib/pdf-parse.js')).default;
      const out = await pdfParse(buffer);
      text = out.text || '';
    } else if (kind === 'docx' || name.toLowerCase().endsWith('.docx')) {
      const mammoth = (await import('mammoth')).default ?? await import('mammoth');
      const out = await mammoth.extractRawText({ buffer });
      text = out.value || '';
    } else {
      text = buffer.toString('utf8');
      // eslint-disable-next-line no-control-regex
      text = text.replace(/[^\P{C}\n\t]/gu, ' ');
    }
  } catch (err) {
    return res.status(422).json({ error: `Could not read that file (${err.message || 'unsupported'}). Try PDF, DOCX or TXT.` });
  }
  text = text.replace(/\s{3,}/g, '\n').trim();
  res.json({ ok: true, name, chars: text.length, text: text.slice(0, 40000) });
});

router.post('/session', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const b = req.body || {};
  const company = String(b.company || '').trim().slice(0, 80);
  const role = String(b.role || '').trim().slice(0, 80);
  if (!company || !role) return res.status(400).json({ error: 'Company and role are both required.' });
  const language = ['en', 'hi', 'te', 'hi-en', 'te-en', 'auto'].includes(b.language) ? b.language : 'en';
  const persona = ['friendly', 'manager', 'strict', 'senior', 'analytical'].includes(b.persona) ? b.persona : 'manager';
  const level = String(b.level || 'Fresher').slice(0, 30);
  const interviewTypes = Array.isArray(b.interviewTypes) ? b.interviewTypes.map((t) => String(t).slice(0, 30)).slice(0, 4) : ['Technical'];
  const resumeText = String(b.resumeText || '').slice(0, 14000);
  const companyDocs = (Array.isArray(b.companyDocs) ? b.companyDocs : []).slice(0, 5).map((d) => ({ name: String(d.name || '').slice(0, 80), text: String(d.text || '').slice(0, 8000) }));

  const resumeInfo = extractSkills(resumeText);
  const store = await readStore();
  store[session.email] = store[session.email] || { sessions: {} };
  const id = randomUUID();
  const doc = {
    id,
    company,
    role,
    interviewTypes: interviewTypes.length ? interviewTypes : ['Technical'],
    level,
    language,
    persona,
    status: 'active',
    startedAt: new Date().toISOString(),
    context: {
      skills: resumeInfo.skills,
      resumeText,
      companyDocs,
      companyLines: extractCompanyLines(companyDocs),
    },
    transcript: [],
    askedIds: [],
  };
  doc.transcript.push(greetingTurn(doc));
  store[session.email].sessions[id] = doc;
  await writeStore(store);
  res.status(201).json({ ok: true, id, interview: stripSession(doc), ai: llmAvailable() });
});

router.get('/sessions', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const store = await readStore();
  const mine = store[session.email]?.sessions ?? {};
  const list = Object.values(mine)
    .sort((x, y) => (x.startedAt < y.startedAt ? 1 : -1))
    .map((s) => ({
      id: s.id,
      company: s.company,
      role: s.role,
      language: s.language,
      persona: (PERSONAS[s.persona] ?? PERSONAS.manager).name,
      status: s.status,
      startedAt: s.startedAt,
      endedAt: s.endedAt ?? null,
      answers: (s.transcript || []).filter((t) => t.role === 'candidate').length,
      score: s.report?.overall ?? null,
    }));
  const completed = list.filter((s) => s.status === 'completed' && s.score != null);
  res.json({
    ok: true,
    capabilities: { ai: llmAvailable() },
    sessions: list.slice(0, 20),
    stats: {
      total: list.length,
      completed: completed.length,
      avgScore: completed.length ? Math.round(completed.reduce((n, s) => n + s.score, 0) / completed.length) : null,
      bestScore: completed.length ? Math.max(...completed.map((s) => s.score)) : null,
    },
  });
});

router.get('/session/:id', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const store = await readStore();
  const doc = ownSession(store, session.email, req.params.id);
  if (!doc) return res.status(404).json({ error: 'No such interview session.' });
  res.json({ ok: true, interview: stripSession(doc), ai: llmAvailable() });
});

router.post('/session/:id/turn', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const store = await readStore();
  const doc = ownSession(store, session.email, req.params.id);
  if (!doc) return res.status(404).json({ error: 'No such interview session.' });
  if (doc.status !== 'active') return res.status(409).json({ error: 'This interview has ended.' });

  const text = String(req.body?.text || '').trim().slice(0, 2000);
  if (text) doc.transcript.push({ role: 'candidate', text, stage: doc.transcript.at(-1)?.stage ?? '', at: new Date().toISOString() });

  let turn;
  if (llmAvailable()) {
    const reply = await llmComplete(llmInterviewerPrompt(doc, text));
    if (reply && reply.trim()) {
      turn = { role: 'interviewer', text: reply.trim().slice(0, 900), stage: doc.transcript.at(-1)?.stage ?? 'introduction', at: new Date().toISOString() };
    }
  }
  if (!turn) {
    turn = directorTurn(doc);
    if (turn.meta?.askedIds) doc.askedIds = turn.meta.askedIds;
  }
  doc.transcript.push({ role: 'interviewer', text: turn.text, stage: turn.stage, kind: turn.kind, at: turn.at });
  await writeStore(store);
  res.json({ ok: true, turn, done: Boolean(turn.done), session: stripSession(doc) });
});

router.post('/session/:id/end', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const store = await readStore();
  const doc = ownSession(store, session.email, req.params.id);
  if (!doc) return res.status(404).json({ error: 'No such interview session.' });
  if (doc.status === 'completed') {
    return res.json({ ok: true, interview: stripSession(doc) });
  }

  const answers = doc.transcript.filter((t) => t.role === 'candidate');
  const perAnswer = [];
  for (const a of answers) {
    const words = a.text.trim().split(/\s+/).filter(Boolean).length;
    const fillers = (a.text.match(FILLERS) || []).length;
    perAnswer.push({
      at: a.at,
      words,
      fillers,
      score: Math.max(5, Math.min(95, Math.round(30 + Math.min(1, words / 70) * 55 - fillers * 4))),
    });
  }
  const wordTotal = perAnswer.reduce((n, p) => n + p.words, 0);
  const fillerTotal = perAnswer.reduce((n, p) => n + p.fillers, 0);
  const overall = perAnswer.length
    ? Math.round(perAnswer.reduce((n, p) => n + p.score, 0) / perAnswer.length)
    : 0;

  let report = {
    mode: 'scripted',
    overall,
    verdict: overall >= 75 ? 'Leaning hire — keep sharpening depth.' : overall >= 55 ? 'Borderline — structure and depth are the gaps.' : 'Not there yet — go back to fundamentals and re-attempt.',
    summary: `${answers.length} answers, ${wordTotal} words spoken, ${fillerTotal} filler words across the session.`,
    skills: [
      { name: 'Communication (length & tightness)', score: perAnswer.length ? Math.round(perAnswer.reduce((n, p) => n + p.score, 0) / perAnswer.length) : 0 },
      { name: 'Depth per answer', score: perAnswer.length ? Math.round((perAnswer.filter((p) => p.words >= 50).length / perAnswer.length) * 100) : 0 },
      { name: 'Clarity (few fillers)', score: Math.max(0, 100 - fillerTotal * 6) },
    ],
    answers: doc.transcript
      .filter((t) => t.role === 'interviewer' && [ 'introduction', 'resume', 'technical', 'problem', 'behavioral', 'company', 'candidate' ].includes(t.stage))
      .map((q) => {
        const idx = doc.transcript.indexOf(q);
        const cand = doc.transcript.slice(idx + 1).find((t) => t.role === 'candidate');
        const w = cand ? cand.text.trim().split(/\s+/).filter(Boolean).length : 0;
        const f = cand ? (cand.text.match(FILLERS) || []).length : 0;
        return {
          question: q.text,
          answer: (cand?.text || '(no answer recorded)').slice(0, 500),
          score: Math.max(5, Math.min(95, Math.round(30 + Math.min(1, w / 70) * 55 - f * 4))),
          good: w >= 50 ? 'Answered at real length with specifics.' : 'Attempted an answer.',
          missing: w < 50 ? 'Too short — aim for 60–120 spoken words with one concrete example.' : 'Push one level deeper: numbers, trade-offs, outcome.',
          improve: 'Use the STAR pattern: situation → task → action → result.',
        };
      }),
    strengths: ['Showed up and completed a full mock round', ...(perAnswer.some((p) => p.words >= 60) ? ['Some answers had real depth'] : [])],
    gaps: perAnswer.filter((p) => p.words < 50).length ? ['Several answers were too short — speak longer, with examples'] : ['Punch up the specifics in every answer'],
    nextSteps: ['Redo this interview type after revising the missed key points', 'Answer out loud once per day — pace improves fast'],
  };

  if (llmAvailable()) {
    try {
      const raw = await llmComplete(llmReportPrompt(doc));
      const parsed = JSON.parse(String(raw || '').replace(/^```json\s*|```$/g, '').trim());
      if (parsed && Number.isFinite(parsed.overall)) {
        report = { ...parsed, mode: 'ai' };
      }
    } catch {
      /* keep the scripted report — never a dead end */
    }
  }

  doc.endedAt = new Date().toISOString();
  doc.status = 'completed';
  doc.report = report;
  if (answers.length > 0) markTodayMission(session, 'interview', `Mock ${doc.role} — ${report.overall}/100`);
  await writeStore(store);
  res.json({ ok: true, interview: stripSession(doc) });
});

router.delete('/session/:id', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const store = await readStore();
  const mine = store[session.email];
  if (mine?.sessions?.[req.params.id]) {
    delete mine.sessions[req.params.id];
    await writeStore(store);
  }
  res.json({ ok: true });
});

export default router;
