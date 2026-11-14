// Workplace deterministic evaluator — the engine where CODE decides every
// outcome. The LLM may voice the characters and polish nothing else: pass or
// fail, rubric scores, STAR stories, and weekly gaps all come from the pure
// functions below, against declarative rules declared in content.js.
//
// Anti-cheat model: every student gets seeded parameters (their own shipment
// id, city, customer, function names) derived from a hash of their email, so
// a friend's answer literally does not fit their ticket; the defend step
// requires the student's own spoken reasoning to cover key concepts, and all
// student text is treated as untrusted input (sanitized before anything else
// sees it).

import { EPISODES, SEED_VOCAB } from './content.js';

// ---------------------------------------------------------------- seed ----

function hash32(str) {
  let h = 2166136261;
  for (let i = 0; i < String(str).length; i++) {
    h ^= String(str).charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pick(list, seedStr) {
  return list[hash32(seedStr) % list.length];
}

/** Stable per-student parameters — the ticket names THEIR shipment, THEIR
 *  city, THEIR function; the checks require those exact values back. */
export function seedFor(email) {
  const base = String(email || '').trim().toLowerCase();
  return {
    shipId: `SFT-${1000 + (hash32(base + ':ship') % 9000)}`,
    city: pick(SEED_VOCAB.cities, base + ':city'),
    customer: pick(SEED_VOCAB.customers, base + ':customer'),
    fn: pick(SEED_VOCAB.fns, base + ':fn'),
    hour: 18 + (hash32(base + ':hour') % 4), // 18:00–21:00 IST booking
    metric: SEED_VOCAB.metric,
  };
}

// ------------------------------------------------------------ sanitize ----

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** All student text is untrusted: strip control characters, collapse the
 *  absurd, cap length. Returns a safe string for storage and prompting. */
export function sanitizeInput(value, max = 4000) {
  const raw = String(value ?? '');
  const cleaned = raw.replace(/\r\n/g, '\n').replace(CONTROL_CHARS, '');
  return cleaned.trim().slice(0, max);
}

function normalize(text) {
  return String(text ?? '').toLowerCase().replace(/\s+/g, ' ');
}

// -------------------------------------------------------------- checks ----

const TIERS = ['guided', 'standard', 'expert'];

export function cleanTier(value) {
  return TIERS.includes(value) ? value : 'guided';
}

function defendSpec(base, tier) {
  const covers = base.covers || [];
  if (tier === 'guided') {
    return { covers, k: 1, minWords: Math.max(10, (base.minWords || 20) - 10) };
  }
  if (tier === 'expert') {
    return { covers, k: Math.min(covers.length, (base.k || 1) + 1), minWords: (base.minWords || 20) + 15 };
  }
  return { covers, k: base.k || 1, minWords: base.minWords || 20 };
}

/** Evaluate one declarative check against the student's normalized input. */
function runCheck(check, { workText, choiceId, seed }) {
  switch (check.op) {
    case 'includesAny':
      return check.values.some((v) => workText.includes(String(v).toLowerCase()));
    case 'includesAll':
      return check.values.every((v) => workText.includes(String(v).toLowerCase()));
    case 'excludesAny':
      return !check.values.some((v) => workText.includes(String(v).toLowerCase()));
    case 'regex':
      return check.pattern.test(workText);
    case 'minWords':
      return workText.split(' ').filter(Boolean).length >= check.n;
    case 'choiceEquals':
      return choiceId === check.choice;
    case 'seedRef':
      return Boolean(seed[check.field]) && workText.includes(String(seed[check.field]).toLowerCase());
    default:
      return false; // an unknown op never silently passes — code decides
  }
}

// ------------------------------------------------------------- rubric -----

const AXES = ['impact', 'ownership', 'communication', 'prioritization', 'ai_collaboration', 'teamwork'];

const GAP_TEMPLATES = {
  impact: {
    gap: 'Name the blast radius first — who is affected, and what breaks while this waits.',
    plan: 'Before starting any task, write one sentence: who is impacted if this slips? Then act on the answer.',
  },
  ownership: {
    gap: 'Say where the truth lives — the file, the constant, the source you verified against.',
    plan: 'End every fix with one line: "verified against <file/doc>" — make it a reflex.',
  },
  communication: {
    gap: 'Keep updates to the four beats: what happened, who is affected, what we are doing, when you will write next.',
    plan: 'Run the four-beat check before sending anything customer-facing this week.',
  },
  prioritization: {
    gap: 'Order work by blast radius and compounding damage, not by who asked loudest.',
    plan: 'When three things land at once, rank them in one written line before starting any of them.',
  },
  ai_collaboration: {
    gap: 'Treat AI output as a draft: verify the edges (empty, zero, one, huge) before trusting it.',
    plan: 'For the next generated function, write the edge-case list before reading the implementation.',
  },
  teamwork: {
    gap: 'Propose, do not command — line, consequence, direction.',
    plan: 'Rewrite one command-shaped review comment as a suggestion this week; notice the difference in the reply.',
  },
};

function rubricScores(episode, results) {
  const weights = episode.rubric || {};
  const byAxis = {};
  for (const axis of AXES) {
    const total = results.filter((r) => r.axis === axis);
    const weightSum = total.reduce((n, r) => n + (r.weight || 0), 0);
    if (!weightSum) continue;
    const passedWeight = total.filter((r) => r.pass).reduce((n, r) => n + (r.weight || 0), 0);
    byAxis[axis] = Math.round((passedWeight / weightSum) * 100);
  }
  // Overall averages over the axes actually in play this episode — an axis
  // with no checks must never drag the score down (or hold it up).
  const playedWeight = AXES.reduce((n, a) => n + ((byAxis[a] !== undefined) ? (weights[a] || 0) : 0), 0) || 1;
  const overall = Math.round(
    AXES.reduce((n, a) => n + (byAxis[a] ?? 0) * (weights[a] || 0), 0) / playedWeight,
  );
  return { byAxis, overall };
}

// ---------------------------------------------------------- star + gaps ---

function firstSentence(text) {
  const s = String(text || '').replace(/\n+/g, ' ').split(/(?<=[.!?])\s/)[0] || '';
  return s.slice(0, 220);
}

const KIND_SITUATION = {
  fix: (e) => `A ticket on day ${e.day} of the Setu Freight simulation: ${firstSentence(e.managerLine)}`,
  communicate: (e) => `A customer-facing situation on day ${e.day} at Setu Freight: ${firstSentence(e.managerLine)}`,
  review: (e) => `A code review of AI-drafted code on day ${e.day} at Setu Freight: ${firstSentence(e.managerLine)}`,
  prioritize: (e) => `A triage call on day ${e.day} at Setu Freight: ${firstSentence(e.managerLine)}`,
};

function buildStar(episode, seed, workText, overall) {
  const situation = (KIND_SITUATION[episode.kind] || KIND_SITUATION.fix)(episode, seed);
  const action = sanitizeInput(workText, 280);
  return {
    episodeId: episode.id,
    title: episode.title,
    situation,
    action,
    result: `Verified by the engine — the work passed every deterministic check (overall ${overall}/100). Part of the Setu Freight job simulation, not work experience.`,
    at: new Date().toISOString(),
  };
}

// -------------------------------------------------------- episode eval ----

/**
 * The one evaluator. Everything is computed here; nothing is delegated to
 * the LLM. Returns the full deterministic verdict for a submission.
 */
export function evaluateEpisode({ episode, tier = 'standard', work = '', choiceId = null, defend = '', email }) {
  const seed = seedFor(email);
  const workText = normalize(sanitizeInput(work, 4000));
  const defendText = normalize(sanitizeInput(defend, 2000));

  // Work checks — every rule declared for the episode, with weights from the
  // episode's rubric so an axis only scores when it is actually in play.
  const weightMap = episode.rubric || {};
  const results = (episode.rules?.work || []).map((check) => {
    const pass = runCheck(check, { workText, choiceId, seed });
    return { kind: 'work', axis: check.axis, note: check.note, pass, weight: weightMap[check.axis] || 0 };
  });

  // Defend check — the spoken (or typed) reasoning must cover the episode's
  // key concepts at the tier's strictness. This is the anti-copy step: pasted
  // text alone can never pass, because defend is evaluated separately.
  const defendSpecForTier = defendSpec(episode.rules?.defend || {}, tier);
  const covered = defendSpecForTier.covers.filter((v) => defendText.includes(String(v).toLowerCase()));
  const defendWords = defendText.split(' ').filter(Boolean).length;
  const defendPass = covered.length >= defendSpecForTier.k && defendWords >= defendSpecForTier.minWords;
  results.push({
    kind: 'defend',
    axis: 'communication',
    note: `Defend: covered ${covered.length}/${defendSpecForTier.k} key ideas in ${defendWords} words`,
    pass: defendPass,
    weight: 0, // the defend gates the pass; rubric comes from the work checks
  });

  const workResults = results.filter((r) => r.kind === 'work');
  const workPass = workResults.every((r) => r.pass);
  const { byAxis, overall } = rubricScores(episode, workResults);
  const pass = workPass && defendPass;

  // Manager feedback — deterministic, cites what actually happened. The LLM
  // may reword this later; it may never change the verdict or the numbers.
  const missed = workResults.filter((r) => !r.pass).map((r) => r.note);
  const hit = workResults.filter((r) => r.pass).map((r) => r.note);
  const feedback = pass
    ? {
        verdict: 'verified',
        manager: `Verified. ${hit.slice(0, 2).join('; ')}. Logged to your work record — and to the skills passport if this one earns a story.`,
        missed: [],
        retry: false,
      }
    : {
        verdict: 'retry',
        manager: missed.length
          ? `Not yet — the engine is specific, like production: ${missed.join('; ')}. Fix that and defend again.`
          : 'The work reads right, but the defend did not cover the key ideas yet — say the WHY out loud, in your own words.',
        missed,
        retry: true,
      };

  return {
    pass,
    seed,
    tier,
    checks: results,
    rubric: byAxis,
    overall,
    feedback,
    star: pass && episode.kind !== 'prioritize' ? buildStar(episode, seed, work, overall) : null,
  };
}

// ------------------------------------------------------ weekly gaps -------

/** 1–2 specific gaps + a micro-plan, deterministic from the weakest verified
 *  rubric axes across the story so far. Real progress only — gaps need at
 *  least one verified submission to speak from. */
export function weeklyGaps(submissions) {
  const verified = submissions.filter((s) => s.pass);
  if (verified.length === 0) return [];
  const tally = {};
  for (const sub of verified) {
    for (const [axis, score] of Object.entries(sub.rubric || {})) {
      tally[axis] = tally[axis] || { total: 0, n: 0 };
      tally[axis].total += score;
      tally[axis].n += 1;
    }
  }
  const weakest = Object.entries(tally)
    .map(([axis, { total, n }]) => ({ axis, avg: Math.round(total / n) }))
    .filter((a) => a.avg < 85)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 2);
  return weakest.map(({ axis, avg }) => ({
    axis,
    avg,
    gap: GAP_TEMPLATES[axis]?.gap || `Strengthen ${axis}.`,
    plan: GAP_TEMPLATES[axis]?.plan || 'Pick one deliberate rep this week and do it on purpose.',
  }));
}

/** Deterministic fallback persona reply — used when no LLM is keyed. The
 *  persona never reveals checks, scores, or answers; hints are tier-gated. */
export function personaReply({ episode, message, turn = 0, tier = 'standard' }) {
  const text = normalize(sanitizeInput(message, 500));
  const asksHelp = /hint|stuck|help|don't know|dont know|no idea|lost|where do i|what should/i.test(text);
  const persona = episode.ticket?.from || 'priya';
  const fallback = episode.chatFallback || {};

  if (asksHelp) {
    if (tier === 'expert') {
      return 'You took expert — less scaffolding is the deal. Walk me through what you have ruled out so far, and why.';
    }
    const hints = episode.hints || [];
    if (hints.length === 0) return fallback.chase || 'What have you tried, and what did you expect instead?';
    return hints[Math.min(turn, hints.length - 1)];
  }
  if (turn <= 0 && fallback.greet) return fallback.greet(seedFor(''));
  return fallback.chase || 'Noted. Anything you want to check with me before you defend?';
}

export { AXES, EPISODES };
