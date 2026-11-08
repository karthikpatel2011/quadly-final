import { Router } from 'express';
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolveSession } from './auth.js';
import { llmAvailable, llmComplete } from '../lib/llm.js';
import { ensurePlan, getPlan } from '../lib/plangenerator.js';
import { streakSummary, istDayKey } from '../lib/streaks.js';

// Student dashboard tier: readiness score, readiness map, the Daily 3
// mission plan, streak, and the Circle-to-Ask companion. Per-user state is
// persisted to backend/data/dashboard-state.json (in-memory accounts die on
// restart — that is the documented pre-beta behaviour in auth.js — while the
// mission/chat log survives).
const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const STATE_FILE = DATA_DIR + 'dashboard-state.json';
const CHAT_LIMIT = 30;
const ASK_DAILY_CAP = 30;

async function readState() {
  try {
    return JSON.parse(await readFile(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeState(state) {
  await writeFile(STATE_FILE, JSON.stringify(state, null, 2));
}

const router = Router();

function bearer(req) {
  const header = req.get('authorization') || '';
  return header.startsWith('Bearer ') ? header.slice(7) : '';
}

function requireUser(req, res) {
  const session = resolveSession(bearer(req));
  if (!session) {
    res.status(401).json({ error: 'Not signed in.' });
    return null;
  }
  return session;
}

const todayISO = () => new Date().toISOString().slice(0, 10);

// Deterministic string hash — "random-looking" mission picks stay stable
// for a given (user, date) and reproducible across restarts.
function hash(strVal) {
  let h = 2166136261;
  for (let i = 0; i < strVal.length; i++) {
    h ^= strVal.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const MISSION_POOL = [
  {
    category: 'ship',
    title: (p) => (p.github ? `Ship one meaningful commit to ${p.github}'s GitHub today` : 'Set up or polish your GitHub — pin the two repos you want recruiters to see'),
    detail: (p) => (p.github ? 'One pushed commit counts. Your contribution graph is the first thing a {role} hiring manager checks.'.replace('{role}', p.target?.role || 'target') : 'A live GitHub turns your resume claims into proof.'),
  },
  {
    category: 'apply',
    title: (p) => `Save 3 open ${p.target?.role || 'target-role'} roles at ${p.target?.company || 'dream'}-tier companies`,
    detail: () => 'Save them somewhere you will actually reopen. Applications compound when the list is in one place.',
  },
  {
    category: 'network',
    title: (p) => (p.ambassador ? `Send ${p.ambassador.name} one specific question about recruiting at your circle companies` : 'Reach out to one senior from your college who works where you want to work'),
    detail: () => 'One specific question beats "can you refer me". Referrals follow conversations, not cold asks.',
  },
  {
    category: 'interview',
    title: (p) => (p.target?.role ? `Do 1 timed mock question for ${p.target.role} interviews` : 'Do 1 timed mock interview question and grade yourself honestly'),
    detail: () => 'Timed reps are the only thing that installs answers. Write down the part that tripped you.',
  },
  {
    category: 'learn',
    title: (p) => (p.target?.company ? `Read one engineering blog post from ${p.target.company} and note one takeaway` : 'Read one engineering blog post from a company you admire and note one takeaway'),
    detail: () => 'Interviewers can tell who reads how the product is actually built.',
  },
];

function missionsFor(email, profile, date) {
  const seed = hash(email + '::' + date);
  const order = [0, 1, 2, 3, 4].map((i) => ({ i, r: hash(String(seed + i * 7919)) % 10007 }))
    .sort((a, b) => a.r - b.r)
    .map((x) => x.i)
    .slice(0, 3);
  return order.map((poolIdx, slot) => {
    const def = MISSION_POOL[poolIdx];
    return {
      id: `${date}:${def.category}:${slot}`,
      category: def.category,
      title: def.title(profile),
      detail: def.detail(profile),
      done: false,
    };
  });
}

function streakFrom(done /* {date: [ids]} */) {
  // The IST-day streak rule lives in lib/streaks.js (one verified result per
  // day counts; one automatic freeze a week covers a single missed day).
  return streakSummary(done, istDayKey());
}

// 0–97 (97 kept "illustrative", matching the landing-page promise: the last
// 3 points belong to the interview itself).
function readinessFor(profile, missions, streak, totalDone) {
  const p = profile || {};
  let score = 30;
  if (p.github) score += 14;
  if (p.target?.role) score += 12;
  if (p.target?.company) score += 6;
  if (p.ambassador?.id) score += 8;
  const doneToday = missions.filter((m) => m.done).length;
  score += doneToday * 5;
  score += Math.min(streak, 5) * 1; // up to +5 for momentum
  score += Math.min(Math.floor(totalDone / 6), 3) * 2; // long-haul bonus
  return Math.max(8, Math.min(97, Math.round(score)));
}

function readinessMapFor(profile, missions, streak, totalDone, doneToday) {
  const p = profile || {};
  const doneTodayCount = missions.filter((m) => m.done).length;
  return [
    {
      label: 'Ship Proof',
      level: p.github ? 72 : 28,
      note: p.github ? `${p.github} is live — keep the graph green.` : 'Connect GitHub in onboarding to turn claims into proof.',
    },
    {
      label: 'Role Clarity',
      level: (p.target?.role ? 60 : 25) + (p.target?.company ? 25 : 0),
      note: p.target?.role ? `Locked on ${p.target.role}${p.target?.company ? ' at ' + p.target.company : ''}.` : 'Pick a target role — everything else sharpens after it.',
    },
    {
      label: 'Campus Circle',
      level: p.ambassador?.id ? 78 : 30,
      note: p.ambassador?.name ? `${p.ambassador.name} is your campus link.` : 'No campus ambassador linked yet — start one conversation.',
    },
    {
      label: 'Interview Reps',
      level: Math.min(90, 25 + totalDone * 8 + doneTodayCount * 6),
      note: totalDone > 0 ? `${totalDone} missions logged — reps are stacking.` : 'Your first logged mission starts the reps.',
    },
    {
      label: 'Momentum',
      level: Math.min(95, 20 + streak * 14),
      note: streak > 0 ? `${streak}-day streak. Protect it tonight.` : 'One mission today starts the streak.',
    },
  ];
}

// Map whatever onboarding stored onto the pfp set: "03".."40" (01-40 padded).
// Auto-assign per student (email hash) so every student gets a real picture.
function avatarFor(email, stored) {
  const m = String(stored || '').match(/(\d{1,2})\s*$/);
  if (m) {
    const n = Math.min(40, Math.max(1, parseInt(m[1], 10)));
    return String(n).padStart(2, '0');
  }
  const seed = Math.abs(hash('avatar::' + String(email || '')));
  return String(1 + (seed % 40)).padStart(2, '0');
}

// Exported for sibling routes (home.js) so the front page wraps the same
// dashboard facts instead of recomputing them.
export function buildPayload(email, session) {
  const profile = session.account.profile || {};
  const date = todayISO();
  const state = session.account.dashboard || { done: {}, chat: [] };
  const doneToday = state.done[date] || [];

  // Plan-first: tasks come from the student's generated 90-day plan; legacy
  // hash-picked missions remain the fallback for accounts without one. Done
  // flags match by full task id (plan days can repeat categories).
  const plan = session.account.onboarded ? ensurePlan(email, profile, session.account.createdAt?.slice(0, 10) || date) : null;
  let missions;
  if (plan) {
    const day = plan.days.find((d) => d.date === date) || plan.days[0];
    // Plan tasks match by full task id only — a legacy category key ('ship')
    // must never mark a different, not-yet-done plan task as done.
    missions = day.tasks.map((t) => ({
      id: t.id,
      category: t.category,
      title: t.title,
      detail: t.detail,
      minutes: t.minutes || null,
      fromPlan: true,
      done: doneToday.includes(t.id),
    }));
  } else {
    missions = missionsFor(email, { ...profile, target: profile.target || {} }, date).map((m) => ({
      ...m,
      done: doneToday.includes(m.id) || doneToday.includes(m.category),
    }));
  }
  const dayRow = plan ? plan.days.find((d) => d.date === date) : null;
  const planMeta = plan
    ? {
        startedAt: plan.startedAt,
        totalDays: plan.totalDays,
        dayNumber: dayRow?.day ?? 1,
        weekNumber: dayRow?.week ?? 1,
        theme: dayRow?.theme ?? '',
      }
    : null;
  let totalDone = 0;
  for (const day of Object.keys(state.done || {})) totalDone += (state.done[day] || []).length;
  const streaks = streakSummary(state.done || {}, istDayKey());
  const results = state.results || {};
  const todayResults = results[date] || {};
  return {
    email,
    date,
    name: profile.name || null,
    college: profile.college || null,
    // Phase-1 onboarding answers — the rebuilt Home/Plan surfaces read these.
    track: profile.track || null,
    year: profile.year || null,
    dailyTime: profile.dailyTime || null,
    practiceTime: profile.practiceTime || null,
    targetDate: profile.targetDate || null,
    selfRating: profile.selfRating || null,
    target: profile.target || { role: null, company: null },
    github: profile.github || null,
    avatar: avatarFor(email, profile.avatar),
    ambassador: profile.ambassador || null,
    plan: planMeta,
    missions: missions.map((m) => ({ ...m, result: todayResults[m.id] || null })),
    streak: streaks.streak,
    freezesLeft: streaks.freezesLeft,
    missedDays: streaks.missedDays,
    streakFresh: streaks.fresh,
    totalDone,
    score: readinessFor(profile, missions, streaks.streak, totalDone),
    map: readinessMapFor(profile, missions, streaks.streak, totalDone, doneToday.length),
    chat: (state.chat || []).slice(-CHAT_LIMIT),
    // Real day → completed-category list; the client renders the activity
    // heatmap only from these verified days, never from sample data.
    history: state.done || {},
    asksToday: state.askCount?.date === date ? state.askCount.n : 0,
    askCap: ASK_DAILY_CAP,
    aiOnline: llmAvailable(),
  };
}

router.get('/', (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  res.json({ ok: true, ...buildPayload(session.email, session) });
});

// Toggle one of today's missions. The :id carries the date + category so a
// stale client can never mark a mission from another day.
router.post('/missions/:id', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const [date, category, slot] = String(req.params.id || '').split(':');
  if (date !== todayISO() || !category || slot === undefined) {
    return res.status(400).json({ error: 'That mission is not on today’s plan.' });
  }

  // JSON persist happens without blocking the reply; in-memory stays the
  // source of truth for the running process (same pattern as auth.js).
  session.account.dashboard = session.account.dashboard || { done: {}, chat: [] };
  const dash = session.account.dashboard;
  dash.done[date] = dash.done[date] || [];
  const list = dash.done[date];
  const key = String(req.params.id || ''); // full task id — unique per day even when categories repeat
  const has = list.includes(key) || list.includes(category);
  const next = has ? list.filter((c) => c !== key && c !== category) : [...list, key];
  if (next.length > 0) {
    dash.done[date] = next;
  } else {
    delete dash.done[date]; // don't persist empty days
  }

  const state = await readState();
  state[session.email] = { done: dash.done, chat: dash.chat.slice(-CHAT_LIMIT), askCount: dash.askCount, results: dash.results, updatedAt: new Date().toISOString() };
  writeState(state).catch(() => {});

  res.json({ ok: true, ...buildPayload(session.email, session) });
});

/** Verified completion — the only written path to a done task. Activities
 *  call this when they record a real result (Daily 15 finished, interview
 *  attempted, project saved); there is no checkbox anywhere on Home or Plan.
 *  Idempotent: the first result for the day's task of that category sticks. */
export function markTodayMission(session, category, resultText) {
  const email = session.email;
  const account = session.account;
  const date = todayISO();
  account.dashboard = account.dashboard || { done: {}, chat: [] };
  const dash = account.dashboard;
  dash.done[date] = dash.done[date] || [];

  const plan = account.onboarded
    ? ensurePlan(email, account.profile || {}, account.createdAt?.slice(0, 10) || date)
    : null;
  const day = plan ? (plan.days.find((d) => d.date === date) || plan.days[0]) : null;
  const doneToday = dash.done[date];
  let target = null;
  if (day) {
    target = (day.tasks || []).find((t) => t.category === category && !doneToday.includes(t.id));
  }
  const id = target ? target.id : `${date}:${category}:0`;
  if (!doneToday.includes(id)) doneToday.push(id);
  dash.results = dash.results || {};
  dash.results[date] = dash.results[date] || {};
  if (!dash.results[date][id]) dash.results[date][id] = String(resultText || 'Completed');

  // The in-memory account stays the source of truth; the file catches up.
  readState().then((state) => {
    state[email] = {
      done: dash.done,
      chat: (dash.chat || []).slice(-CHAT_LIMIT),
      askCount: dash.askCount,
      results: dash.results,
      updatedAt: new Date().toISOString(),
    };
    writeState(state).catch(() => {});
  });
  return { id, date };
}

// Circle-to-Ask: the LLM answers with the student's profile + today's plan
// in context; without an LLM key a deterministic mentor answers instead —
// the companion is never a dead end.
router.post('/ask', async (req, res) => {
  const session = requireUser(req, res);
  if (!session) return;
  const message = String(req.body?.message || '').trim().slice(0, 500);
  if (!message) {
    return res.status(400).json({ error: 'Type a question first.' });
  }

  session.account.dashboard = session.account.dashboard || { done: {}, chat: [] };
  const dash = session.account.dashboard;

  // Daily ask cap, per student, tracked beside the plan state.
  const today = todayISO();
  if (!dash.askCount || dash.askCount.date !== today) {
    dash.askCount = { date: today, n: 0 };
  }
  if (dash.askCount.n >= ASK_DAILY_CAP) {
    return res.status(429).json({
      error: 'You have used all of today’s asks — the counter resets tomorrow. Missions and the plan still work as usual.',
    });
  }
  dash.askCount.n += 1;

  dash.chat = dash.chat || [];
  dash.chat.push({ role: 'user', text: message, at: new Date().toISOString() });

  const profile = session.account.profile || {};
  const context = {
    name: profile.name,
    college: profile.college,
    targetRole: profile.target?.role,
    targetCompany: profile.target?.company,
    github: profile.github,
    ambassador: profile.ambassador?.name,
  };

  let reply = null;
  let mode = 'advisor';
  if (llmAvailable()) {
    reply = await llmComplete(
      'You are Quadly, a direct, warm career mentor for a college student. ' +
        `Student context: ${JSON.stringify(context)}. ` +
        'Answer in at most 3 short sentences, concrete and specific, no filler. ' +
        `Question: ${message}`,
    );
    if (reply) mode = 'llm';
  }
  if (!reply) {
    reply = mentorReply(message, context);
    mode = 'advisor';
  }

  dash.chat.push({ role: 'quadly', text: reply, at: new Date().toISOString() });
  dash.chat = dash.chat.slice(-CHAT_LIMIT);

  const state = await readState();
  state[session.email] = { done: dash.done, chat: dash.chat, askCount: dash.askCount, results: dash.results, updatedAt: new Date().toISOString() };
  writeState(state).catch(() => {});

  res.json({ ok: true, reply, mode, chat: dash.chat, ...buildPayloadLite(session) });
});

// Light payload for the ask route — the client already holds score/map.
function buildPayloadLite(session) {
  return { aiOnline: llmAvailable() };
}

function mentorReply(msg, c) {
  const name = c.name ? c.name.split(' ')[0] : 'there';
  const q = msg.toLowerCase();
  if (/\b(hi|hello|hey)\b/.test(q) && q.length < 24) {
    return `Hey ${name} — want to work on shipping, applying, or interview reps today?`;
  }
  if (q.includes('refer') || q.includes('network') || q.includes('ambassador') || q.includes('reach out')) {
    const link = c.ambassador ? ` You already have ${c.ambassador} on campus — start there.` : ' Your first campus conversation matters more than any cold message.';
    return `Ask one senior one specific question about how hiring really runs there.${link}`;
  }
  if (q.includes('resume') || q.includes('cv')) {
    return c.github
      ? `Lead your resume with shipped work — ${c.github} is proof. One bullet per project: what it does, scale, and the part you built.`
      : 'Connect GitHub in onboarding, then lead with projects. A resume without proof is a list of promises.';
  }
  if (q.includes('interview')) {
    const role = c.targetRole ? ` for ${c.targetRole}` : '';
    return `One timed question a day${role} beats a weekend binge. Say the answer aloud, grade it, and fix the sentence that broke.`;
  }
  if (q.includes('score') || q.includes('readiness')) {
    return 'Your score moves on proof: shipping, applications, campus conversations, and streaks. Finish today’s three — that is the fastest jump.';
  }
  if (q.includes('project') || q.includes('github') || q.includes('build')) {
    const role = c.targetRole ? ` Build the version a ${c.targetRole} hiring manager could run in one command.` : ' Build the smallest version a hiring manager could run in one command.';
    return `Skip the tutorial clone.${role}`;
  }
  if (q.includes('company') || q.includes('apply') || q.includes('application')) {
    return c.targetCompany
      ? `Three saved ${c.targetCompany}-tier openings today, two real applications this week. Tailored first lines beat volume.`
      : 'Save three target companies today. A short list you actually work beats a 200-row spreadsheet.';
  }
  const role = c.targetRole ? `the ${c.targetRole} track` : 'your track';
  return `Keep it simple, ${name}: finish today’s three on ${role}. Readiness compounds one logged day at a time.`;
}

export default router;
