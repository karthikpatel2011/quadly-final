// Central personalization service — the brief's "one central intelligence
// layer". Deterministic rule engine always works; when an LLM key is
// configured AND the student keeps personalization on, the LLM refines the
// result against a strict schema. Neither path invents facts: recommendations
// derive from the student's own onboarding answers and Quadly activity only.

import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { llmAvailable, llmComplete } from './llm.js';
import { getPlan } from './plangenerator.js';

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));
const FILE = DATA_DIR + 'ai-profile.json';

// The exact onboarding option lists (frontend mirrors these).
export const INTEREST_OPTIONS = [
  'Frontend development', 'Backend development', 'Full-stack development',
  'Artificial intelligence', 'Machine learning', 'Data science',
  'Cybersecurity', 'Cloud engineering', 'DevOps / Platform engineering',
  'Mobile development', 'Game development', 'Blockchain / Web3',
  'UI/UX and product design', 'Open source', 'Research',
  'Startups / entrepreneurship', 'Competitive programming / problem solving',
  'Not sure yet',
];
export const GOAL_OPTIONS = [
  'Figure out what I want to pursue', 'Learn practical skills', 'Build real projects',
  'Create a strong portfolio', 'Find project teammates', 'Find a mentor',
  'Prepare for interviews', 'Find an internship', 'Find a job',
  'Explore hackathons and opportunities', 'Start something of my own',
];
export const STAGE_OPTIONS = [
  'Exploring', 'Learning fundamentals', 'Building projects',
  'Preparing for opportunities', 'Already working / interning',
];
export const TIME_OPTIONS = [
  '15 minutes a day', '30 minutes a day', 'Around 1 hour a day',
  'A few hours each week', 'My schedule changes',
];

const INTEREST_SET = new Set(INTEREST_OPTIONS);
const GOAL_SET = new Set(GOAL_OPTIONS);
const STAGE_SET = new Set(STAGE_OPTIONS);
const TIME_SET = new Set(TIME_OPTIONS);

export function cleanList(value, set, max = 6) {
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map((v) => String(v).trim()).filter((v) => set.has(v)))].slice(0, max);
}

export function cleanStage(value, fallback = 'Exploring') {
  return STAGE_SET.has(value) ? value : fallback;
}

export function cleanTime(value, fallback = '30 minutes a day') {
  return TIME_SET.has(value) ? value : fallback;
}

// Interest → the opportunity categories it maps to (for the opportunities
// matcher and the roadmap explainer). Kept small and legible.
const CATEGORY_BY_INTEREST = {
  'Frontend development': ['job', 'internship', 'hackathon'],
  'Backend development': ['job', 'internship', 'open-source'],
  'Full-stack development': ['job', 'internship', 'hackathon', 'open-source'],
  'Artificial intelligence': ['internship', 'research', 'hackathon'],
  'Machine learning': ['internship', 'research', 'competition'],
  'Data science': ['internship', 'competition', 'research'],
  Cybersecurity: ['internship', 'competition', 'workshop'],
  'Cloud engineering': ['job', 'internship', 'workshop'],
  'DevOps / Platform engineering': ['job', 'internship', 'workshop'],
  'Mobile development': ['job', 'internship', 'hackathon'],
  'Game development': ['internship', 'hackathon', 'competition'],
  'Blockchain / Web3': ['internship', 'hackathon'],
  'UI/UX and product design': ['internship', 'workshop'],
  'Open source': ['open-source', 'fellowship'],
  Research: ['research', 'fellowship'],
  'Startups / entrepreneurship': ['startup', 'fellowship', 'hackathon'],
  'Competitive programming / problem solving': ['competition', 'internship'],
  'Not sure yet': ['hackathon', 'workshop', 'open-source'],
};

const FIRST_ACTION_BY_STAGE = {
  'Exploring': { label: 'Skim three roadmap paths and mark the one that pulls you', href: 'plan' },
  'Learning fundamentals': { label: 'Do today’s Daily 15 drill', href: 'practice/daily-15' },
  'Building projects': { label: 'Ship one commit to your project', href: 'projects' },
  'Preparing for opportunities': { label: 'One timed interview question, self-graded', href: 'practice/interviews' },
  'Already working / interning': { label: 'Log one win from today’s work', href: 'projects' },
};

/** Deterministic personalization — no model, no outside data, no invented facts. */
export function deterministicProfile(profile = {}, activity = {}) {
  const interests = (profile.interests || []).filter((i) => i !== 'Not sure yet');
  const primary = interests[0] || null;
  const stage = profile.stage || 'Exploring';
  const goals = profile.goals || [];
  const direction = primary
    ? `Leaning ${primary}${interests[1] ? `, exploring ${interests[1]}` : ''} — currently ${stage.toLowerCase()}.`
    : `Exploring directions — currently ${stage.toLowerCase()}.`;

  const plan = activity.plan || null;
  const week = plan && plan.weekNumber ? plan.weekNumber : null;

  const missing = [];
  if (!primary) missing.push('Pick at least one interest so recommendations can sharpen.');
  if (!(profile.target && profile.target.role)) missing.push('Add a target role for sharper interviews and opportunities.');
  const projectsN = Number(activity.projects ?? 0);
  if (projectsN === 0) missing.push('Start one project — evidence beats claims.');

  const result = {
    directionSummary: direction,
    interestClusters: [primary, interests[1]].filter(Boolean),
    stage,
    nearTermGoals: goals.slice(0, 3),
    recommendedRoadmap: plan ? { startedAt: plan.startedAt, totalDays: plan.totalDays, weekNumber: plan.weekNumber, theme: plan.days?.[0]?.theme ?? null } : null,
    firstAction: { ...FIRST_ACTION_BY_STAGE[stage], why: week ? `You are on week ${week} of the 90-day plan.` : 'It is the smallest useful step for your stage.' },
    opportunityCategories: primary ? (CATEGORY_BY_INTEREST[primary] || []).slice(0, 3) : ['hackathon', 'internship'],
    suggestedProjects: [],
    missingInfo: missing,
    confidence: primary && goals.length ? 'medium' : 'low',
    confidenceNote: 'Derived from your onboarding answers and Quadly activity only.',
  };
  return result;
}

async function readStore() {
  try {
    return JSON.parse(await readFile(FILE, 'utf8'));
  } catch {
    return {};
  }
}

async function writeStore(doc) {
  await writeFile(FILE, JSON.stringify(doc, null, 2));
}

/** Compact, consented context object — small on purpose. */
function compactContext(profile = {}, activity = {}) {
  return {
    interests: profile.interests || [],
    goals: profile.goals || [],
    stage: profile.stage || null,
    timeCommitment: profile.timeCommitment || null,
    note: profile.note || null,
    target: profile.target || null,
    planWeek: activity.plan?.weekNumber ?? null,
    planTheme: activity.plan?.days?.[0]?.theme ?? null,
    projectsCount: Number(activity.projects ?? 0),
    interviewAttempts: Number(activity.interviewAttempts ?? 0),
    drillDays: Number(activity.drillDays ?? 0),
  };
}

/**
 * Compute (and cache) one student's personalization.
 * consentOn: profile.aiPersonalization must be true (default) for the LLM path.
 */
export async function computePersonalization(session) {
  const profile = session.account.profile || {};
  const plan = session.account.onboarded
    ? await (async () => { try { return getPlan(session.email); } catch { return null; } })()
    : null;

  // Small real activity reads — counts only.
  const attempts = await readFileSafe(DATA_DIR + 'attempts.json', {});
  const drills = Object.keys(attempts[session.email] || {}).length;
  const iview = await readFileSafe(DATA_DIR + 'interview-attempts.json', {});
  const iviewMine = iview[session.email] || {};
  const projectsRaw = await readFileSafe(DATA_DIR + 'projects.json', []);
  const projectsMine = Array.isArray(projectsRaw) ? projectsRaw.filter((p) => p.email === session.email) : [];

  const activity = {
    plan,
    drillDays: drills,
    interviewAttempts: Object.keys(iviewMine).length,
    projects: projectsMine.length,
  };

  let result = deterministicProfile(profile, activity);
  let meta = { source: 'quadly-rules', usedLlm: false, at: new Date().toISOString() };

  const consentOn = profile.aiPersonalization !== false;
  if (consentOn && llmAvailable()) {
    try {
      const prompt =
        'You personalize a study plan for an Indian CSE student. Use ONLY the JSON facts given. ' +
        'Reply with ONLY minified JSON matching: {"directionSummary": string, "nearTermGoals": string[3], ' +
        '"firstAction": {"label": string, "why": string}, "missingInfo": string[], "confidenceNote": string}. ' +
        'Calm plain English. Never promise jobs or placements. Facts: ' +
        JSON.stringify(compactContext(profile, activity));
      const raw = await llmComplete(prompt);
      const parsed = JSON.parse(String(raw).replace(/^```json\s*|```$/g, '').trim());
      if (parsed && typeof parsed.directionSummary === 'string' && Array.isArray(parsed.nearTermGoals)) {
        // Merge over the deterministic base: model refines wording, rules keep
        // the factual skeleton (stage, plan, categories).
        result = {
          ...result,
          directionSummary: String(parsed.directionSummary).slice(0, 220),
          nearTermGoals: parsed.nearTermGoals.map((g) => String(g).slice(0, 80)).slice(0, 3),
          firstAction: {
            label: String(parsed.firstAction?.label || result.firstAction.label).slice(0, 120),
            why: String(parsed.firstAction?.why || result.firstAction.why).slice(0, 200),
            href: result.firstAction.href,
          },
          missingInfo: (Array.isArray(parsed.missingInfo) ? parsed.missingInfo : result.missingInfo).map((x) => String(x).slice(0, 140)).slice(0, 3),
          confidenceNote: String(parsed.confidenceNote || result.confidenceNote).slice(0, 200),
        };
        meta = { source: 'llm', usedLlm: true, at: new Date().toISOString() };
      }
    } catch {
      /* keep the deterministic result — never a dead end */
    }
  }

  // Roadmap object is stored compactly (no full plan dump).
  if (result.recommendedRoadmap === null && plan) {
    result.recommendedRoadmap = { startedAt: plan.startedAt, totalDays: plan.totalDays, weekNumber: plan.weekNumber, theme: plan.days?.[0]?.theme ?? null };
  }

  const doc = await readStore();
  doc[session.email] = { result, meta, profileUpdatedAt: profile.updatedAt || null, planUpdatedAt: plan?.startedAt ?? null };
  await writeStore(doc);
  return { ...doc[session.email] };
}

export async function storedPersonalization(email) {
  const doc = await readStore();
  return doc[email] || null;
}

async function readFileSafe(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    return fallback;
  }
}
