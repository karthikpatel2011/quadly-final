// Practice content schemas — the single contract for scenarios, drills, and
// seasons, plus the AI output shapes the practice feature is allowed to trust.
// Every scenario (seeded or AI-drafted) must parse against scenarioSchema
// before it can be published; every AI response must parse against its own
// schema before code uses it, otherwise the deterministic fallback answers.

import { z } from 'zod';

export const TRACKS = ['Software Engineering', 'AI & ML', 'Cyber Security', 'Not sure'];

// Skill levels. 1-5 with tiers: 1-2 guided, 3-4 standard, 5 expert. The labels
// are skills, never student labels — a student is "at Level 3", not a "beginner".
export const LEVEL_LABELS = {
  1: 'First response',
  2: 'Reading dashboards',
  3: 'Reading logs',
  4: 'Correlating signals',
  5: 'Under pressure',
};

export function tierForLevel(level) {
  const n = Math.max(1, Math.min(5, Number(level) || 1));
  return n >= 5 ? 'expert' : n >= 3 ? 'standard' : 'guided';
}

const httpUrl = z.string().trim().url().max(400).refine((u) => /^https?:\/\//.test(u), {
  message: 'Source links must be http(s) URLs.',
});

// ---- evidence an action can reveal ---------------------------------------

const revealSchema = z.object({
  kind: z.enum(['log', 'metrics', 'change-list', 'output', 'dashboard']),
  title: z.string().trim().min(3).max(80),
  // free-form, student-readable payload: log lines, a described chart, a diff…
  lines: z.array(z.string().trim().min(1).max(400)).max(24),
  // Which hypothetical root cause this evidence supports or refutes. The
  // review check uses these tags to prove the evidence singles out one cause.
  supports: z.string().trim().max(60).optional(),
  refutes: z.array(z.string().trim().max(60)).max(10).optional(),
});

export const revealSchemaForChecks = revealSchema;

const actionSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/, 'Action ids are kebab-case.').max(40),
  label: z.string().trim().min(3).max(80),
  group: z.enum(['evidence', 'change', 'escalate', 'check']),
  costMinutes: z.number().int().min(1).max(30),
  once: z.boolean().optional().default(true),
  reveal: revealSchema.optional(), // change/escalate actions may reveal nothing
});

const rootCauseSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/, 'Root-cause ids are kebab-case.').max(40),
  label: z.string().trim().min(4).max(220),
  correct: z.boolean().optional().default(false),
  keywords: z.array(z.string().trim().min(2).max(40)).min(1).max(8),
});

const fixSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/, 'Fix ids are kebab-case.').max(40),
  label: z.string().trim().min(4).max(220),
  safety: z.enum(['safe', 'noop', 'harmful']),
  note: z.string().trim().min(3).max(300),
});

const defendQuestionSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/, 'Question ids are kebab-case.').max(40),
  question: z.string().trim().min(10).max(300),
  // each key point = list of accepted keyword spellings/aliases
  keyPoints: z.array(z.array(z.string().trim().min(2).max(30)).min(1).max(6)).min(1).max(6),
});

export const scenarioSchema = z.object({
  id: z.string().trim().regex(/^inc-[a-z0-9-]+$/, 'Scenario ids start with inc-.').max(40),
  title: z.string().trim().min(6).max(140),
  track: z.enum(['Software Engineering', 'AI & ML', 'Cyber Security']),
  shared: z.boolean().optional().default(false), // appears for every track
  level: z.number().int().min(1).max(5),
  minutes: z.number().int().min(3).max(20), // the honest par duration
  parActions: z.number().int().min(2).max(10),
  timeLimitMinutes: z.number().int().min(5).max(60).optional(), // expert pressure
  expectedEscalate: z.boolean().optional().default(false),
  story: z.string().trim().min(20).max(600),
  services: z.array(z.object({
    id: z.string().trim().regex(/^[a-z0-9-]+$/).max(30),
    name: z.string().trim().min(2).max(40),
    role: z.string().trim().min(2).max(80),
  })).min(2).max(6),
  // scripted backbone every student sees: the alert line and its aftermath
  timeline: z.array(z.object({
    atMin: z.number().int().min(0).max(120),
    text: z.string().trim().min(3).max(200),
  })).min(1).max(8),
  // cascade events that surface themselves once the sim clock passes atMin
  events: z.array(z.object({
    atMin: z.number().int().min(1).max(120),
    text: z.string().trim().min(3).max(200),
  })).max(6).optional().default([]),
  actions: z.array(actionSchema).min(4).max(14),
  rootCauses: z.array(rootCauseSchema).min(3).max(5),
  fixes: z.array(fixSchema).min(3).max(5),
  hintLadder: z.array(z.string().trim().min(10).max(300)).min(2).max(3),
  // guided-only step prompts, surfaced as the investigation unfolds
  guidance: z.array(z.object({
    afterActions: z.number().int().min(0).max(10),
    text: z.string().trim().min(8).max(220),
  })).optional().default([]),
  defendQuestions: z.array(defendQuestionSchema).min(2).max(5),
  lesson: z.string().trim().min(20).max(600),
  realAction: z.string().trim().min(20).max(600),
  source: z.object({
    company: z.string().trim().min(2).max(60),
    url: httpUrl,
    title: z.string().trim().min(4).max(140),
  }),
  // Content contract: every scenario carries the honest provenance line, e.g.
  // "Inspired by <company>'s public postmortem, simplified — all data synthetic."
  inspiredByNote: z.string().trim().min(20).max(300).refine((s) => s.startsWith('Inspired by'), {
    message: 'The provenance note must start with "Inspired by".',
  }),
  status: z.enum(['draft', 'published']).optional().default('published'),
  reviewedBy: z.string().trim().max(80).optional(),
  createdAt: z.string().trim().max(40).optional(),
});

// ---- daily drills ----------------------------------------------------------

const optionSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).max(30),
  label: z.string().trim().min(2).max(160),
});

export const drillSchema = z.object({
  id: z.string().trim().regex(/^drill-[a-z0-9-]+$/, 'Drill ids start with drill-.').max(40),
  scenarioId: z.string().trim().min(3).max(40),
  seasonId: z.string().trim().regex(/^[a-z0-9-]+$/).max(40),
  track: z.enum(['Software Engineering', 'AI & ML', 'Cyber Security']).nullable(), // null = shared
  level: z.number().int().min(1).max(5),
  moment: z.object({
    kind: z.enum(['log', 'metric', 'error', 'config', 'change-list']),
    title: z.string().trim().min(4).max(120),
    // log/config moments: plain lines; metric moments: label/value pairs
    lines: z.array(z.string().trim().min(1).max(300)).max(14).optional(),
    data: z.array(z.object({
      label: z.string().trim().min(1).max(60),
      value: z.string().trim().min(1).max(40),
    })).max(10).optional(),
    question: z.string().trim().min(10).max(300),
    options: z.array(optionSchema).min(3).max(5),
    answerIndex: z.number().int().min(0),
    why: z.string().trim().min(10).max(400),
  }),
  takeaway: z.string().trim().min(10).max(200),
  teaser: z.string().trim().min(4).max(160), // tomorrow's hook, same season
});

export const seasonSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]+$/).max(40),
  name: z.string().trim().min(3).max(80),
  blurb: z.string().trim().min(10).max(300),
});

// ---- request bodies --------------------------------------------------------

export const actionCallSchema = z.object({ actionId: z.string().trim().min(1).max(40) });

export const hypothesisSchema = z.object({
  text: z.string().trim().min(3, 'Write at least a sentence of hypothesis.').max(1000),
});

export const resolveSchema = z.object({
  rootCauseId: z.string().trim().min(1).max(40),
  fixId: z.string().trim().min(1).max(40),
});

export const drillAnswerSchema = z.object({
  optionIndex: z.number().int().min(0).max(4),
});

export const postmortemBodySchema = z.object({
  happened: z.string().trim().min(30).max(2000),
  impact: z.string().trim().min(20).max(1000),
  rootCause: z.string().trim().min(10).max(1000),
  fix: z.string().trim().min(10).max(1000),
  prevention: z.string().trim().min(20).max(2000),
});

export const defendAnswerSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().trim().min(1).max(40),
    text: z.string().trim().min(10, 'Give a real answer — at least a sentence.').max(2000),
  })).min(1).max(5),
});

export const shareSchema = z.object({ share: z.boolean() });

// ---- validated AI outputs ---------------------------------------------------
// The AI never invents evidence while the student plays; these schemas bound
// the only places it is allowed to speak: hints (no root cause), the
// postmortem critique, defend questions, and scenario drafts for review.

export const aiHintSchema = z.object({
  text: z.string().trim().min(10).max(400),
});

export const aiCritiqueSchema = z.object({
  specific: z.object({ met: z.boolean(), note: z.string().trim().max(300) }),
  blameless: z.object({ met: z.boolean(), note: z.string().trim().max(300) }),
  actionable: z.object({ met: z.boolean(), note: z.string().trim().max(300) }),
  summary: z.string().trim().max(400),
});

export const aiDefendSchema = z.object({
  questions: z.array(z.object({
    question: z.string().trim().min(10).max(300),
  })).min(2).max(3),
});

export const aiDraftSchema = z.object({
  scenario: scenarioSchema,
  notes: z.string().trim().max(400),
});

// Shared pivot helper: first zod issue message, or a calm default.
export function firstIssue(parsed, fallback = 'That request is not valid.') {
  return parsed.error?.issues?.[0]?.message || fallback;
}
