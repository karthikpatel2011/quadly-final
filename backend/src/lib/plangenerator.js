// 90-day placement plan generator. Onboarding provides the profile; this
// generates the student's real plan: 13 weeks × 7 days, 3 tasks/day, themed
// to the target role. Deterministic, saved per student (backend/data/plans.json).

import { readFileSync, writeFileSync, mkdirSync, renameSync, existsSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(import.meta.dirname, '../../data/');
const PLANS_FILE = path.join(DATA_DIR, 'plans.json');

const TOTAL_DAYS = 90;

// 13-week arc for a placement season: foundations → CS core → build → rep → apply.
const WEEK_THEMES = [
  { theme: 'DSA foundations', cats: ['learn', 'interview', 'interview'] },
  { theme: 'Aptitude + CS core', cats: ['learn', 'learn', 'interview'] },
  { theme: 'Web fundamentals', cats: ['learn', 'ship', 'interview'] },
  { theme: 'DBMS + OS depth', cats: ['learn', 'interview', 'interview'] },
  { theme: 'Build week — your first project', cats: ['ship', 'ship', 'learn'] },
  { theme: 'Project polish + README', cats: ['ship', 'ship', 'network'] },
  { theme: 'Resume + LinkedIn', cats: ['apply', 'apply', 'network'] },
  { theme: 'Apply sprint I', cats: ['apply', 'apply', 'network'] },
  { theme: 'Interview reps I', cats: ['interview', 'interview', 'learn'] },
  { theme: 'Apply sprint II', cats: ['apply', 'apply', 'ship'] },
  { theme: 'Interview reps II', cats: ['interview', 'interview', 'learn'] },
  { theme: 'Mock drives + review', cats: ['interview', 'network', 'learn'] },
  { theme: 'Final sprint + capstone', cats: ['ship', 'apply', 'interview'] },
];

const TASK_TEMPLATES = {
  learn: (p) => [
    { title: `Study one ${p.target?.role || 'SDE'} core topic and write summary notes`, detail: 'Notes beat re-watching. One page: what, why, where it fails.' },
    { title: 'Read one engineering blog post from a company you admire and note one takeaway', detail: 'Interviewers can tell who reads how the product is actually built.' },
    { title: "Revise yesterday's topic and solve 3 practice problems", detail: 'Repetition installs recall.' },
    { title: 'Learn one concept from the weekly theme and teach it back in writing', detail: 'If you cannot explain it simply, you have not learned it yet.' },
  ],
  interview: (p) => [
    { title: `Do 1 timed mock question for ${p.target?.role || 'SDE'} interviews`, detail: 'Timed reps are the only thing that installs answers. Write down the part that tripped you.' },
    { title: 'Solve 2 timed problems out loud, then check the editorial', detail: 'Talking through the solution is the interview skill. Grade yourself honestly.' },
    { title: 'Record yourself answering one behavioral question and rewatch it', detail: 'Structure: situation → action → result.' },
    { title: 'Sketch one system-design-lite question: components, bottleneck, what scales first', detail: 'Trade-offs on paper beat buzzwords.' },
  ],
  ship: (p) => [
    { title: `Ship one meaningful commit to ${p.github ? p.github + '`s GitHub' : 'your GitHub'} today`, detail: 'One pushed commit counts. The graph is the first thing a hiring manager checks.' },
    { title: `Build the smallest version a ${p.target?.role || 'SDE'} hiring manager could run in one command`, detail: 'Skip the tutorial clone. README with a screenshot and a run command.' },
    { title: 'Polish an old repo: README, screenshot, deploy link', detail: 'Recruiters skim. Make every pinned repo presentable in 30 seconds.' },
    { title: 'Refactor the ugliest module in your current project', detail: 'Clean code on a small project beats messy ambition on a big one.' },
  ],
  apply: (p) => [
    { title: `Save 3 open roles at ${p.target?.company || 'your dream'}-tier companies`, detail: 'Keep the list somewhere you will actually reopen.' },
    { title: 'Send 2 tailored applications — first line customized', detail: 'Tailored first lines beat volume. Reference one real thing about the company.' },
    { title: 'Update one resume bullet for what you shipped this week', detail: 'Numbers and outcomes, not responsibilities.' },
    { title: 'Follow up on one pending application, politely', detail: 'One nudge at seven days. Then move on.' },
  ],
  network: (p) => [
    { title: p.ambassador?.name ? `Send ${p.ambassador?.name || 'one senior from your college'} one specific question about recruiting at your circle companies` : 'Reach out to one senior from your college who works where you want to work', detail: 'One specific question beats "can you refer me".' },
    { title: 'Comment meaningfully on 3 posts from people in your target domain', detail: 'Visibility compounds. Add something, do not just react.' },
    { title: 'Reconnect with one batchmate who is also preparing', detail: 'Squads beat solo grinding. Compare notes, not scores.' },
    { title: 'Ask one alumnus for a 15-minute chat about their first year on the job', detail: 'People love talking about their work. Bring two real questions.' },
  ],
};


/** Profile: { name, college, target:{role,company}, github, ambassador } */
export function generatePlan(profile, startDateISO = new Date().toISOString().slice(0, 10)) {
  const p = profile || {};
  const role = p.target?.role || 'SDE';
  const company = p.target?.company || '';
  const github = p.github || '';
  const amb = p.ambassador?.name || '';

  const start = new Date(startDateISO + 'T00:00:00Z');
  const days = [];
  for (let day = 0; day < TOTAL_DAYS; day++) {
    const date = new Date(start.getTime() + day * 864e5).toISOString().slice(0, 10);
    const week = Math.floor(day / 7);
    const wk = WEEK_THEMES[week];
    const tasks = wk.cats.map((cat, slot) => {
      const pool = (TASK_TEMPLATES[cat] || TASK_TEMPLATES.learn)(p);
      const variant = (day * 3 + slot) % pool.length;
      const t = pool[variant];
      return {
        id: `${date}:${cat}:${slot}`,
        category: cat,
        title: t.title,
        detail: t.detail,
        minutes: [20, 30, 45][slot % 3],
      };
    });
    days.push({ day: day + 1, date, week: week + 1, theme: wk.theme, tasks });
  }
  return {
    startedAt: startDateISO,
    totalDays: TOTAL_DAYS,
    target: { role, company },
    days,
  };
}

function readPlans() {
  if (!existsSync(PLANS_FILE)) return {};
  try {
    return JSON.parse(readFileSync(PLANS_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writePlans(plans) {
  mkdirSync(DATA_DIR, { recursive: true });
  const tmp = PLANS_FILE + '.tmp';
  writeFileSync(tmp, JSON.stringify(plans, null, 2));
  renameSync(tmp, PLANS_FILE);
}

/** Idempotent: an existing plan is never regenerated (history hooks into it). */
export function ensurePlan(email, profile, startDateISO) {
  const plans = readPlans();
  if (plans[email]) return plans[email];
  const plan = generatePlan(profile || {}, startDateISO);
  plans[email] = plan;
  writePlans(plans);
  return plan;
}

export function getPlan(email) {
  const plans = readPlans();
  return plans[email] ?? null;
}
