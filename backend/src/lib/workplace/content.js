// Workplace starter story content — "Setu Freight", a 2-week simulated first
// job on the Backend Engineering track. Everything the AI characters say and
// every outcome is bounded by this file: the LLM only voices the personas;
// this content + lib/workplace/evaluator.js decide what is true.
//
// Episode shape (mirrors the workplace_episodes table in migrations/workplace.sql):
//   academy   — the 2-minute Company Academy lesson that unlocks the day's ticket
//   ticket    — the work itself: intro message, optional seeded code, the ask
//   rules     — declarative deterministic checks (see evaluator.js interpret())
//   rubric    — axis weights (impact, ownership, communication, prioritization,
//               ai_collaboration, teamwork — must sum to 100)
//   defend    — what the voice-defend step must cover (anti-copy-paste)
//   hints     — tier-gated manager hints revealed through chat
//   chat      — deterministic persona fallback replies when no LLM is keyed

export const STORY = {
  slug: 'backend-starter',
  role_track: 'backend',
  title: 'Your first two weeks on the Platform team',
  company_name: 'Setu Freight',
  company_brief:
    'Setu Freight is a fictional B2B freight-tracking company: warehouses scan parcels, ' +
    'our dashboards tell operations teams where every shipment is. Fifty engineers, one ' +
    'platform team, and you — starting this week. Everything here is a job simulation: ' +
    'real work-shaped practice, clearly labelled as training, never work experience.',
  total_weeks: 8,
  active_weeks: 2,
};

export const PERSONAS = {
  priya: {
    name: 'Priya Menon',
    role: 'Engineering Manager',
    voice: 'Direct, warm, allergic to busywork. Praises specifics, names gaps plainly, never shames.',
  },
  arjun: {
    name: 'Arjun Rao',
    role: 'Senior Engineer, your buddy',
    voice: 'Pragmatic reviewer. Explains the why, shares checklists, admits his own old mistakes.',
  },
  meera: {
    name: 'Meera Kulkarni',
    role: 'Customer Operations lead',
    voice: 'Polite, rushed, thinks in SLAs. Asks for commitments, not explanations.',
  },
  vikram: {
    name: 'Vikram Shah',
    role: 'Founder',
    voice: 'Curious, fast. Asks the interview-shaped questions: what did you catch, what did you own.',
  },
};

// Stable per-student seed fields — derived from the email hash so a friend's
// answer cannot be copy-pasted: the ticket text names THEIR shipment, THEIR
// city, THEIR function, and the deterministic checks require those values.
export const SEED_VOCAB = {
  cities: ['Nagpur', 'Kochi', 'Indore', 'Guwahati', 'Patna'],
  customers: ['Annapurna Foods', 'Kanchan Textiles', 'Deccan Spares', 'Lotus Pharma'],
  fns: ['summariseRoute', 'buildManifest', 'syncScanEvents'],
  metric: 'on-time percentage',
};

// ---------------------------------------------------------------------------
// Deterministic rule vocabulary — interpreted by evaluator.js interpret().
// Every check: { op, ...params, axis, note }. Episode passes only when every
// work check passes AND the defend check passes at the tier's strictness.
// ---------------------------------------------------------------------------

export const EPISODES = [
  // ------------------------------------------------------------------ Week 1
  {
    id: 'w1d1', week: 1, day: 1, weekday: 'Monday', kind: 'fix', minutes: 8,
    title: 'The label that lies',
    managerLine: 'Welcome to Setu Freight. First ticket is small on purpose — I want to see how you work, not how much you know.',
    academy: {
      title: 'How we use AI here',
      minutes: 2,
      body: [
        'AI tools are allowed at Setu Freight — with three house rules.',
        'One: give context. An assistant that cannot see your code, your constraints, or your customer will invent plausible nonsense. Paste the relevant snippet and say what "good" looks like.',
        'Two: verify everything. AI output is a draft from something that has never shipped anything. Read it like a junior engineer\'s pull request: correct? complete? does it even compile against OUR constants?',
        'Three: you own the result. "The AI wrote it" has never been an acceptable answer in a review, an incident, or an interview. If your name is on it, you can explain it.',
      ],
      quiz: [{
        q: 'An AI tool rewrites your customer update and appends "guaranteed fixed by Friday". What do you do?',
        options: [
          'Send it — the tool is tuned for professional tone',
          'Check what we actually know about the fix, then send only what is true',
          'Delete the tool\'s draft and write nothing — silence is safer',
        ],
        answer: 1,
        why: 'Verification is the job. "Guaranteed" is a promise only the fix can keep — and silence helps nobody.',
      }],
    },
    ticket: {
      from: 'priya', channel: 'chat',
      intro: (s) =>
        `Morning. Small first one so you can learn our rails: the shipments dashboard card labels every booking "Dispatched" — even bookings that are only confirmed, not yet handed to the courier. Ops noticed when ${s.customer} in ${s.city} called asking where shipment ${s.shipId} physically was. The labels live in one place: the STATUS_LABELS constant. Find it in the snippet, fix the wrong mapping, and tell me exactly where you verified it.`,
      code: (s) => ({
        file: 'dashboard/labels.js',
        language: 'js',
        lines: [
          '// Single source of truth for shipment status labels (dashboard card).',
          '// Contracts: "booked" = customer booked, nothing picked up yet.',
          '//            "dispatched" = handed to the courier, in motion.',
          'export const STATUS_LABELS = {',
          '  booked: "Dispatched",',
          '  dispatched: "In transit",',
          '  delivered: "Delivered",',
          '  failed: "Needs attention",',
          '};',
        ],
      }),
      ask: 'Reply in the thread with (1) the corrected line for "booked", and (2) where you verified what it should say.',
      inputKind: 'text',
    },
    rules: {
      work: [
        { op: 'regex', pattern: /booked['"]?\s*:\s*["']?confirmed/i, axis: 'impact', note: 'Sets booked → "Confirmed"' },
        { op: 'includesAny', values: ['constants', 'config', 'comment', 'contract', 'source of truth', 'labels.js'], axis: 'ownership', note: 'Names where the truth lives' },
        { op: 'minWords', n: 12, axis: 'communication', note: 'Explains, not just pastes' },
        { op: 'excludesAny', values: ['guaranteed'], axis: 'communication', note: 'No invented promises' },
      ],
      defend: { covers: ['constant', 'config', 'comment', 'truth', 'file', 'dashboard'], k: 1, minWords: 20 },
    },
    rubric: { impact: 30, ownership: 30, communication: 20, prioritization: 0, ai_collaboration: 10, teamwork: 10 },
    hints: [
      'Read the comments above the constant — the contract for "booked" is written there.',
      'The fix is one mapping. The part I grade harder is whether you say where you verified it.',
    ],
    chatFallback: {
      greet: (s) => `The ticket is all yours. When you think you have it, defend it out loud — that habit is the whole game here.`,
      hint: 'Look at the contract comment directly above STATUS_LABELS. What does "booked" mean in OUR domain?',
      chase: 'No rush — but tell me what you have checked so far, even if it is just "I read the constants file".',
    },
  },

  {
    id: 'w1d2', week: 1, day: 2, weekday: 'Tuesday', kind: 'fix', minutes: 8,
    title: 'The clock that is five and a half hours off',
    managerLine: 'Ticket two. Same dashboard, new symptom — and this one is a classic. Read the bug report first.',
    academy: {
      title: 'Read the bug report before the code',
      minutes: 2,
      body: [
        'Every bug report has three facts worth underlining before you open an editor: the symptom (what is wrong, as the user sees it), the scope (who sees it — one user or everyone?), and the when (only at certain times? certain days?).',
        'Symptom tells you what to reproduce. Scope tells you how loudly to panic. When is usually the bug itself — a date bug that only shows "sometimes" is a timezone bug wearing a costume.',
        'Write the three facts in your own words first. If you cannot, you do not understand the report yet — and no AI assistant can fix code against a bug you cannot state.',
      ],
      quiz: [{
        q: 'A date label is wrong "sometimes, for evening bookings only". First instinct?',
        options: [
          'Rewrite the date library call with an AI suggestion',
          'Suspect a timezone boundary — the "sometimes" is the tell',
          'Ask the customer to reinstall the app',
        ],
        answer: 1,
        why: 'Time-dependent bugs that come and go almost always straddle a timezone or a midnight boundary.',
      }],
    },
    ticket: {
      from: 'arjun', channel: 'chat',
      intro: (s) =>
        `Hey — bug report from ops, triaged to you: booking ${s.shipId} was created at ${s.hour}:40 in the evening IST, and the dashboard shows its booking DAY as the previous day. Only evening bookings, only since launch. I stripped it to the offending line:\n\nconst day = new Date(booking.createdAt).toISOString().slice(0, 10)\n\nTell me which fix is right and why the others are traps.`,
      code: (s) => ({
        file: 'dashboard/bookingDay.js',
        language: 'js',
        lines: [
          `// booking.createdAt is a UTC instant — e.g. ${s.hour}:40 IST evening`,
          '// Bug: label shows the previous day for evening bookings.',
          'export function bookingDayLabel(booking) {',
          '  const day = new Date(booking.createdAt).toISOString().slice(0, 10);',
          '  return day;',
          '}',
        ],
      }),
      ask: 'Pick the correct fix and defend the choice.',
      inputKind: 'choice',
      choices: [
        { id: 'a', label: 'Convert the instant to Asia/Kolkata, then take the calendar date' },
        { id: 'b', label: 'Always add 5 hours 30 minutes to the timestamp before slicing' },
        { id: 'c', label: 'Trust the customer\'s device timezone — the browser knows best' },
      ],
    },
    rules: {
      work: [
        { op: 'choiceEquals', choice: 'a', axis: 'impact', note: 'Picks the real timezone conversion' },
        { op: 'includesAny', values: ['utc', 'ist', 'timezone', 'time zone', 'midnight', '+05:30', '5:30'], axis: 'ownership', note: 'Explains the boundary' },
        { op: 'minWords', n: 15, axis: 'communication', note: 'Says why the others are traps' },
      ],
      defend: { covers: ['utc', 'ist', 'timezone', 'time zone', '5:30', 'midnight', 'evening'], k: 2, minWords: 25 },
    },
    rubric: { impact: 30, ownership: 25, communication: 20, prioritization: 0, ai_collaboration: 10, teamwork: 15 },
    hints: [
      'toISOString always prints the UTC calendar date. Where is "midnight" for IST?',
      'Option B "works" until DST-style rule changes or a 00:10 IST booking. Why do zone-aware conversions beat fixed offsets?',
    ],
    chatFallback: {
      greet: (s) => `I hit this exact bug in my first year — shipped it on a Friday, pager went off on Sunday. Take your time.`,
      hint: 'What calendar date does toISOString give you for 2026-11-13T18:40+05:30?',
      chase: 'Try stating the bug in one sentence first: "evening IST bookings X because Y".',
    },
  },

  {
    id: 'w1d3', week: 1, day: 3, weekday: 'Wednesday', kind: 'communicate', minutes: 10,
    title: 'Meera needs an answer, not a maybe',
    managerLine: 'Different muscle today: writing to a human who is having a bad day. Meera runs customer ops.',
    academy: {
      title: 'Bad news travels with a plan',
      minutes: 2,
      body: [
        'Customer-facing updates have four beats, in order: what happened (plain words, no jargon), who is affected (scope again), what we are doing about it right now, and when they will hear from us next.',
        'Two honesty rules. Never promise a fix time you do not control — "guaranteed" is a word for after, not before. And never bury the problem under an apology; the reader should know the state in ten seconds.',
        'Short beats impressive. A update that fits on a phone screen gets read; a careful essay gets skimmed by someone already annoyed.',
      ],
      quiz: [{
        q: 'The sync is stalled, you do not know why yet. Best next update?',
        options: [
          'Say nothing until you fully understand the cause',
          'Say what customers are seeing, what the team is doing now, and when the next update lands',
          'Promise it will be fixed within the hour to stop the escalations',
        ],
        answer: 1,
        why: 'You can always be honest about impact and next-contact time, even when the root cause is still unknown.',
      }],
    },
    ticket: {
      from: 'meera', channel: 'email',
      intro: (s) =>
        `From: Meera Kulkarni <ops@setufreight.example>\nSubject: ${s.customer} asking about live tracking — URGENT\n\nHi — ${s.customer}'s ops team (the ${s.city} warehouse) says their tracking dashboard has been stale for about 3 hours and shipment ${s.shipId} shows no scan events since morning. They're escalating to their COO. I need to send them something in the next 20 minutes. What do I tell them?`,
      ask: 'Draft the reply Meera can send to the customer. Four beats: what happened, who is affected, what we are doing, when they hear from us next.',
      inputKind: 'text',
    },
    rules: {
      work: [
        { op: 'includesAny', values: ['stalled', 'delay', 'delayed', 'stale', 'behind', 'not updating', 'issue'], axis: 'communication', note: 'Names the problem plainly' },
        { op: 'includesAny', values: ['next update', 'hear from', 'by ', 'within', 'update at', 'every hour'], axis: 'ownership', note: 'Commits to a next-contact time' },
        { op: 'excludesAny', values: ['guaranteed', '100%', 'definitely fixed'], axis: 'communication', note: 'No promises we do not control' },
        { op: 'minWords', n: 30, axis: 'impact', note: 'Covers all four beats' },
      ],
      defend: { covers: ['customer', 'update', 'impact', 'affect', 'next', 'plan'], k: 2, minWords: 25 },
    },
    rubric: { impact: 20, ownership: 25, communication: 35, prioritization: 0, ai_collaboration: 5, teamwork: 15 },
    hints: [
      'Four beats, ten seconds: what happened, who is hit, what we are doing, when I will write again.',
      'A time commitment you control ("next update by 4 pm") beats a fix time you do not.',
    ],
    chatFallback: {
      greet: (s) => `For scale: ${s.customer} ships ${s.metric === 'on-time percentage' ? 'perishables' : 'high-value freight'} — silence costs more than bad news. Draft it, I'll tell you what I'd cut.`,
      hint: 'If your draft is longer than six lines, Meera will rewrite it. Cut every sentence without a fact in it.',
      chase: 'Read your draft as Meera: is the state clear in ten seconds? Is there a next-contact time?',
    },
  },

  {
    id: 'w1d4', week: 1, day: 4, weekday: 'Thursday', kind: 'prioritize', minutes: 8,
    title: 'Three fires, one afternoon',
    managerLine: 'No code today. I am in a leadership sync and something has to give — you triage.',
    academy: {
      title: 'Triage by blast radius',
      minutes: 2,
      body: [
        'When everything is urgent, order by three questions. How many users are hit right now? Is the damage growing while you wait? Is the task reversible if done later?',
        'Production pain wins almost every tie: it grows while you sit in meetings, and every minute is measured in other people\'s workarounds.',
        'A deadline that belongs to someone else\'s convenience ("whenever you get a chance, EOD?") is not the same as a deadline that belongs to a commitment. Learn to tell them apart — politely.',
      ],
      quiz: [{
        q: 'A live sync job is failing for one warehouse while a stakeholder pings about a report due "EOD-ish". First move?',
        options: [
          'The report — a named person is waiting',
          'The failing job — it is breaking now and the damage compounds',
          'Flip a coin, both are urgent',
        ],
        answer: 1,
        why: 'Blast radius: the failing job affects every shipment through that warehouse and gets worse with time.',
      }],
    },
    ticket: {
      from: 'priya', channel: 'chat',
      intro: (s) =>
        `Quick triage call — I'm pinned in the leadership sync for two hours. On your plate, in arrival order:\n\n1. Arjun's PR review ("whenever you get to it today").\n2. The ${s.city} warehouse sync job — failing since 11:50, ops is manually re-scanning parcels.\n3. Meera wants a one-off ${s.metric} report "EOD-ish" for ${s.customer}.\n\nOrder them, and tell me the one thing you'd say to whoever waits longest.`,
      ask: 'Pick the order, then defend it in two sentences.',
      inputKind: 'choice',
      choices: [
        { id: 'a', label: 'Sync job first → Meera\'s report → Arjun\'s review' },
        { id: 'b', label: 'Meera\'s report → sync job → Arjun\'s review' },
        { id: 'c', label: 'Arjun\'s review → sync job → Meera\'s report' },
      ],
    },
    rules: {
      work: [
        { op: 'choiceEquals', choice: 'a', axis: 'prioritization', note: 'Production first' },
        { op: 'includesAny', values: ['production', 'failing', 'users', 'customers', 'ops', 'manual', 'growing', 'live'], axis: 'impact', note: 'Reasons from blast radius' },
        { op: 'minWords', n: 18, axis: 'communication', note: 'Says something to whoever waits' },
      ],
      defend: { covers: ['production', 'first', 'failing', 'sync', 'customers', 'manual'], k: 2, minWords: 25 },
    },
    rubric: { impact: 25, ownership: 15, communication: 25, prioritization: 30, ai_collaboration: 0, teamwork: 5 },
    hints: [
      'Which item gets worse every minute you wait? Start there.',
      'Arjun asked for "whenever" — the message to him costs one sentence and he will respect the honesty.',
    ],
    chatFallback: {
      greet: (s) => `For the record: I'd order them the same way every week. The test is not who asked loudest — it's what breaks while you wait.`,
      hint: 'Two of these have deadlines-of-convenience. One has a warehouse printing stickers by hand right now.',
      chase: 'Whatever order you pick, the telling part is the sentence for the person who waits.',
    },
  },

  {
    id: 'w1d5', week: 1, day: 5, weekday: 'Friday', kind: 'one-one', minutes: 10,
    title: 'Your first week, in Priya\'s words',
    managerLine: 'Friday 1:1. Come with one thing you did well and one thing to work on — both in your words.',
    academy: {
      title: 'Feedback is data',
      minutes: 2,
      body: [
        'A good 1:1 is not a verdict; it is calibration. Three moves: say what you did well in your own words (so it is repeatable), name your own gap before your manager does (so it is yours to fix), and agree one concrete next step (so it becomes a habit, not a guilt item).',
        'Vague self-praise ("I worked hard") and vague self-blame ("I should do better") are both useless. Point at specific moments: the ticket, the message, the call you made.',
        'This is also interview practice. "Tell me about your first two weeks" is a real question — the answer you build today is the story you will tell for years.',
      ],
      quiz: [{
        q: 'Which self-assessment is actually usable in a 1:1?',
        options: [
          '"I think I did pretty well overall."',
          '"The Wednesday customer update — I led with impact and gave a next-update time."',
          '"I need to improve my communication skills."',
        ],
        answer: 1,
        why: 'Specific moments are repeatable and reviewable. Vague praise and vague blame both evaporate.',
      }],
    },
    ticket: {
      from: 'priya', channel: 'chat',
      intro: () =>
        `Two questions, take your time:\n\n1. Which moment from this week are you proudest of — and what exactly made it good?\n2. What is your one gap, and what will you do about it next week?\n\nWrite both, then defend the gap answer out loud — saying it aloud is how it survives Monday.`,
      ask: 'Answer both questions in one message, then defend out loud.',
      inputKind: 'text',
    },
    rules: {
      work: [
        { op: 'includesAny', values: ['i ', 'my '], axis: 'ownership', note: 'Speaks in first person, owns it' },
        { op: 'includesAny', values: ['i will', 'next week', 'practice', 'habit', 'checklist', 'before i '], axis: 'prioritization', note: 'Names a concrete next step' },
        { op: 'minWords', n: 35, axis: 'communication', note: 'Both answers, specifically' },
      ],
      defend: { covers: ['gap', 'improve', 'next', 'week', 'practice'], k: 1, minWords: 20 },
    },
    rubric: { impact: 10, ownership: 30, communication: 30, prioritization: 15, ai_collaboration: 0, teamwork: 15 },
    hints: [
      'Point at a moment: the timezone fix, the Meera draft, the triage call — not a feeling.',
      'A gap with a next step ("before I send customer words, I run the four-beat check") beats a virtue ("be more proactive").',
    ],
    chatFallback: {
      greet: () => `No script for this one — it is your week. I will push back only if you stay vague.`,
      hint: 'Try the sentence: "The moment I am proudest of is ___, because ___." Fill it honestly.',
      chase: 'If your gap would fit on a horoscope, it is too vague. Name the moment you got it wrong.',
    },
  },

  // ------------------------------------------------------------------ Week 2
  {
    id: 'w2d1', week: 2, day: 1, weekday: 'Monday', kind: 'review', minutes: 12,
    title: 'Read before you comment',
    managerLine: 'Week two: code review. This week you read other people\'s code more than you write your own.',
    academy: {
      title: 'What to look for, including in AI-written code',
      minutes: 2,
      body: [
        'A review has one job: will this code do what it claims, for every input we actually receive? Check in order: correctness at the edges (empty, zero, one, huge), failure paths (what happens when the API is down?), and only then style.',
        'AI-written code fails differently than human code. It is fluent — naming is clean, comments are confident — which makes it read better than it behaves. The fluency is exactly why it deserves MORE suspicion, not less: nobody skims code that looks tired, everybody skims code that looks polished.',
        'The classic catch: work that loops when it could batch — a database query inside a for-loop. Ten rows, ten queries, a hundred rows, a hundred queries. It passes every small test and dies on the first real day.',
      ],
      quiz: [{
        q: 'A PR is beautifully written, comments and all. What does that change about your review?',
        options: [
          'Polished code needs only a skim — the effort shows',
          'Nothing changes: edges and failure paths get checked either way, maybe harder',
          'Reject it — AI wrote it (you can tell)',
        ],
        answer: 1,
        why: 'Fluency is not correctness. If anything, polish earns suspicion: it reads fast precisely so you will skim.',
      }],
    },
    ticket: {
      from: 'arjun', channel: 'chat',
      intro: (s) =>
        `Review request: ${s.fn} pulls every shipment for a city and builds a summary card. It passed staging. Something in here will fall over on the first busy day — find the real problem, not the cosmetic one.`,
      code: (s) => ({
        file: `platform/${s.fn}.js`,
        language: 'js',
        lines: [
          `// Builds the city summary card for the ops dashboard.`,
          `import { db } from '../db';`,
          '',
          `export async function ${s.fn}(city) {`,
          '  const warehouses = await db.warehouses.byCity(city);',
          '  const cards = [];',
          '  for (const wh of warehouses) {',
          '    const scans = await db.scans.latestFor(wh.id);',
          '    const shipments = await db.shipments.countOpen(wh.id);',
          '    cards.push({ warehouse: wh.name, scans, shipments });',
          '  }',
          '  return cards;',
          '}',
        ],
      }),
      ask: 'Pick the issue that matters most, then write why in your own words.',
      inputKind: 'choice',
      choices: [
        { id: 'a', label: 'It queries the database inside a loop — one round-trip per warehouse' },
        { id: 'b', label: 'The function name is too long' },
        { id: 'c', label: 'Missing JSDoc comments on the exported function' },
        { id: 'd', label: 'cards should be a Map, not an array' },
      ],
    },
    rules: {
      work: [
        { op: 'choiceEquals', choice: 'a', axis: 'impact', note: 'Finds the N+1, not the cosmetics' },
        { op: 'includesAny', values: ['loop', 'per warehouse', 'per item', 'each warehouse', 'round-trip', 'query', 'n+1', 'scale'], axis: 'ownership', note: 'Explains the failure mode' },
        { op: 'minWords', n: 15, axis: 'communication', note: 'Says why it breaks in production' },
      ],
      defend: { covers: ['loop', 'query', 'wait', 'slow', 'per', 'batch', 'scale'], k: 2, minWords: 25 },
    },
    rubric: { impact: 35, ownership: 20, communication: 20, prioritization: 0, ai_collaboration: 10, teamwork: 15 },
    hints: [
      'Count how many times the database is hit for a city with 40 warehouses.',
      'Staging has 3 warehouses. Production has 400. What grows linearly?',
    ],
    chatFallback: {
      greet: (s) => `FYI this PR is AI-assisted — cleanest-looking diff of the week. That is exactly why I want your eyes, not a skim.`,
      hint: 'For each iteration of that for-loop, how many awaits run? Multiply by a busy city.',
      chase: 'Forget the fix for now — just state the failure you would expect on Monday morning.',
    },
  },

  {
    id: 'w2d2', week: 2, day: 2, weekday: 'Tuesday', kind: 'review', minutes: 12,
    title: 'The AI function that passes every happy test',
    managerLine: 'Today is the most important lesson of your first month. AI wrote a helper. It is wrong in a way no happy test catches.',
    academy: {
      title: 'AI code is a draft',
      minutes: 2,
      body: [
        'Generated code is trained on the average of the internet — and the average example shows the happy path, because happy paths make tidy tutorials.',
        'So generated code is confident at exactly the wrong place: the edges. Empty input. Zero. One item. A list so large it exhausts memory. The tests that ship with a generated function usually test the same happy path it was drafted on — agreement is not verification.',
        'Your professional edge as a human reviewer: ask "what input makes this wrong?" before "is this clean?". One deliberate edge-case question beats ten style comments, and it is the part no autocomplete does for you.',
      ],
      quiz: [{
        q: 'An AI-generated "average" helper passes tests on sample data. Which test is missing?',
        options: [
          'A test with a bigger sample',
          'A test with an empty list — and one where every value is zero',
          'A test that renames the variables',
        ],
        answer: 1,
        why: 'Averages die on empty input (0 ÷ 0) and mislead on all-zeros. Edges first, always.',
      }],
    },
    ticket: {
      from: 'arjun', channel: 'chat',
      intro: (s) =>
        `Follow-up to yesterday: I asked our AI tool to write ${s.fn} — "average dock dwell time per warehouse". It passes the sample fixtures. I do not trust it, and I cannot articulate why faster than you can find it. Name the input class that breaks it.`,
      code: (s) => ({
        file: `platform/${s.fn}.js`,
        language: 'js',
        lines: [
          `// Average dock dwell (minutes) across a warehouse's shipments.`,
          `// Used on the ops dashboard and in the ${s.metric} report.`,
          `export function ${s.fn}(shipments) {`,
          '  let total = 0;',
          '  for (const shipment of shipments) {',
          '    total += shipment.dwellMinutes;',
          '  }',
          '  return total / shipments.length;',
          '}',
        ],
      }),
      ask: 'Name every input class where this returns something wrong or useless.',
      inputKind: 'text',
    },
    rules: {
      work: [
        { op: 'includesAny', values: ['empty', 'no shipment', 'zero', 'length 0', 'length === 0', '0 items', 'nothing'], axis: 'impact', note: 'Catches the empty-list divide' },
        { op: 'includesAny', values: ['nan', 'divide', 'infinity', 'undefined', '0 /', 'zero'], axis: 'ownership', note: 'Says what it returns, not just that it breaks' },
        { op: 'minWords', n: 15, axis: 'communication', note: 'Names the class, not one example' },
      ],
      defend: { covers: ['empty', 'zero', 'edge', 'divide', 'nan', 'input'], k: 2, minWords: 25 },
    },
    rubric: { impact: 35, ownership: 25, communication: 15, prioritization: 0, ai_collaboration: 20, teamwork: 5 },
    hints: [
      'What does the function return for shipments = []? Say the literal value.',
      'Now the nastier one: every shipment with dwellMinutes = 0. Is that "fast docks" or a sensor bug? What would the dashboard show?',
    ],
    chatFallback: {
      greet: (s) => `The tool even wrote a docstring: "Returns the average dock dwell time." Confident, wrong sometimes — like most of us before coffee.`,
      hint: 'Run the function in your head with an empty array. What is 0 divided by 0?',
      chase: 'Name the CLASS of input, not one array — an interview answer that names a class generalises.',
    },
  },

  {
    id: 'w2d3', week: 2, day: 3, weekday: 'Wednesday', kind: 'communicate', minutes: 10,
    title: 'Write the review you would want to receive',
    managerLine: 'Yesterday you found the problem. Today you say it to a human — in writing, on the record.',
    academy: {
      title: 'Review the code, not the person',
      minutes: 2,
      body: [
        'A review comment has three parts: point at the exact line, explain the consequence in terms of users or cost (not taste), and propose or offer a direction ("suggest:", "what if we…"). Commands invite resistance; specifics invite collaboration.',
        'Never grade the author. "This is sloppy" is unfalsifiable and unactionable. "This divides by zero when the list is empty" is checkable and fixable — by anyone, including the AI tool that wrote it.',
        'Assume the author used AI to draft it — because at Setu Freight they did. The review is how the draft becomes engineering.',
      ],
      quiz: [{
        q: 'Which review comment will actually improve the code?',
        options: [
          '"This is obviously wrong, please fix."',
          '"Line 8 divides by zero for an empty shipment list — suggest returning null and letting the card render \'no data\'."',
          '"Works for me, ship it."',
        ],
        answer: 1,
        why: 'Line, consequence, proposal. The third option is how the empty-list bug reaches a customer dashboard.',
      }],
    },
    ticket: {
      from: 'arjun', channel: 'chat',
      intro: (s) =>
        `Go: write the actual review comment for the ${s.fn} line. I will paste it verbatim (with your name on it) and we will see if the author — a teammate, not the AI — can act on it without asking a single follow-up.`,
      ask: 'Write the review comment: line, consequence, proposed direction.',
      inputKind: 'text',
    },
    rules: {
      work: [
        { op: 'seedRef', field: 'fn', axis: 'ownership', note: 'References the actual function under review' },
        { op: 'includesAny', values: ['suggest', 'consider', 'what if', 'could', 'proposal', 'option'], axis: 'teamwork', note: 'Proposes, does not command' },
        { op: 'includesAny', values: ['empty', 'zero', 'divide', 'nan', 'edge', 'no shipment'], axis: 'impact', note: 'States the concrete consequence' },
        { op: 'excludesAny', values: ['stupid', 'sloppy', 'careless', 'obviously', 'terrible'], axis: 'teamwork', note: 'Reviews code, not the person' },
        { op: 'minWords', n: 30, axis: 'communication', note: 'Complete enough to act on' },
      ],
      defend: { covers: ['line', 'empty', 'suggest', 'fix', 'edge', 'review'], k: 2, minWords: 25 },
    },
    rubric: { impact: 20, ownership: 20, communication: 30, prioritization: 0, ai_collaboration: 10, teamwork: 20 },
    hints: [
      'Template that never fails: "Line N: <what breaks> for <which input>. Suggest <direction>."',
      'Read your draft once with the author\'s feelings in one hand and Monday\'s dashboard in the other.',
    ],
    chatFallback: {
      greet: (s) => `Real bar: the author acts without replying "what do you mean?". If they would have to ask, the comment is not done.`,
      hint: 'Point at the line NUMBER. "Somewhere in there" is how bugs survive reviews.',
      chase: 'Would you say that sentence to Arjun\'s face at his desk? Ship that version.',
    },
  },

  {
    id: 'w2d4', week: 2, day: 4, weekday: 'Thursday', kind: 'fix', minutes: 10,
    title: 'Apply the feedback to your own branch',
    managerLine: 'Plot twist: the AI tool accepted your review and rewrote the helper. Now it is on YOUR branch to land. Pick the patch.',
    academy: {
      title: 'Small diffs ship',
      minutes: 2,
      body: [
        'The fix for an edge case is a guard, not a cathedral: check the impossible-or-empty input, return something explicit, let the caller decide what "no data" looks like.',
        'Two anti-patterns to refuse. The try/catch that swallows the error and returns a fake average — the dashboard then shows a confident, wrong number, which is worse than no number. And the magic default ("assume 1 shipment") that launders a bug into a wrong-but-plausible stat.',
        'An explicit "null — render no data" is honest. A fabricated number is a small lie with a chart attached.',
      ],
      quiz: [{
        q: 'The empty-list crash needs a fix. Which patch would you approve?',
        options: [
          'Wrap in try/catch and return 0 — the dashboard needs a number',
          'Return null for an empty list; the card renders "No data yet"',
          'Default the list to one fake shipment so the math never breaks',
        ],
        answer: 1,
        why: 'Explicit honesty scales. Fake numbers and fake defaults are how dashboards start lying politely.',
      }],
    },
    ticket: {
      from: 'arjun', channel: 'chat',
      intro: (s) =>
        `Your review landed. ${s.fn} needs the guard now — three candidate patches below. Pick the one you would approve, and say the one-line reason you refuse the others.`,
      code: (s) => ({
        file: `platform/${s.fn}.js`,
        language: 'js',
        lines: [
          '// Patch candidates for the empty-list edge.',
          '// A:', 'if (!shipments || shipments.length === 0) return null;',
          '',
          '// B:', 'try { return total / shipments.length; } catch { return 0; }',
          '',
          '// C:', 'const list = shipments.length ? shipments : [DEFAULT_SHIPMENT];',
        ],
      }),
      ask: 'Pick the patch, refuse the others in one line each.',
      inputKind: 'choice',
      choices: [
        { id: 'a', label: 'Patch A — explicit null for empty input' },
        { id: 'b', label: 'Patch B — catch and return 0' },
        { id: 'c', label: 'Patch C — substitute a default shipment' },
      ],
    },
    rules: {
      work: [
        { op: 'choiceEquals', choice: 'a', axis: 'impact', note: 'Picks the honest guard' },
        { op: 'includesAny', values: ['b', 'catch', 'swallow', 'fake', 'wrong number', 'c', 'default', 'lie', 'mask'], axis: 'ownership', note: 'Refuses the anti-patterns explicitly' },
        { op: 'minWords', n: 18, axis: 'communication', note: 'Says why, not just which' },
      ],
      defend: { covers: ['null', 'guard', 'empty', 'honest', 'fake', 'catch', 'return'], k: 2, minWords: 25 },
    },
    rubric: { impact: 30, ownership: 30, communication: 15, prioritization: 0, ai_collaboration: 15, teamwork: 10 },
    hints: [
      'Which patch leaves the dashboard showing a number that was never measured?',
      '"No data yet" is a true sentence. Patch C makes the function lie so the chart stays pretty.',
    ],
    chatFallback: {
      greet: (s) => `For the record, Patch B is what the AI tool suggested first when I asked it to "just make the tests pass". Now you see why verification is rule two.`,
      hint: 'Trace patch B with a warehouse whose scan reader was down all day. What number does the dashboard show, and is it true?',
      chase: 'One line per refusal is enough — reviewers respect brevity more than essays.',
    },
  },

  {
    id: 'w2d5', week: 2, day: 5, weekday: 'Friday', kind: 'one-one', minutes: 12,
    title: 'Two weeks in: what you can now claim',
    managerLine: 'Vikram sits in on this one. He asks one question. It is the interview question.',
    academy: {
      title: 'Claim honestly',
      minutes: 2,
      body: [
        'What you finished these two weeks is real: simulated, real-shaped work with verified outcomes. In an interview you say: "in a job simulation at Setu Freight" — training, practice, a work record. Never "work experience"; the honest framing is also the confident one, because you can defend every word of it.',
        'The strongest story shape is STAR: Situation (the stale dashboard), Task (what you owned), Action (what YOU did — not the team, not the tool), Result (what changed, with the number if you have one).',
        'You have two catches worth telling: the label that lied, and the average that lied. Pick one and tell it properly today — out loud.',
      ],
      quiz: [{
        q: 'An interviewer asks about the dashboard work. The honest, strong framing is:',
        options: [
          '"At my last job at Setu Freight, I fixed our dashboards."',
          '"In a two-week job simulation at a freight company, I found and fixed two data-integrity bugs and wrote the reviews."',
          '"I did some practice tasks online."',
        ],
        answer: 1,
        why: 'Named simulation, named your actions, named the outcome. Honest AND strong — that is the whole trick.',
      }],
    },
    ticket: {
      from: 'vikram', channel: 'chat',
      intro: (s) =>
        `Vikram here. Priya says you caught something our AI tooling wrote that everyone else skimmed. Good. One question, the same one I ask every hire: "Tell me about a time you caught what everyone missed." Write it the way you would say it in a real interview — and remember what we are and are not allowed to call this.`,
      ask: 'Write your interview answer (STAR), then deliver it out loud.',
      inputKind: 'text',
    },
    rules: {
      work: [
        { op: 'includesAny', values: ['i noticed', 'i found', 'i caught', 'i checked', 'i asked', 'i ran', 'i tested'], axis: 'ownership', note: 'STAR action is yours, specifically' },
        { op: 'includesAny', values: ['because', 'so that', 'as a result', 'which meant', 'result'], axis: 'impact', note: 'Names the consequence' },
        { op: 'excludesAny', values: ['work experience', 'at my job'], axis: 'communication', note: 'Calls it a simulation, honestly' },
        { op: 'minWords', n: 40, axis: 'communication', note: 'A real interview answer, not a fragment' },
      ],
      defend: { covers: ['caught', 'found', 'noticed', 'checked', 'missed', 'empty', 'loop'], k: 2, minWords: 35 },
    },
    rubric: { impact: 20, ownership: 30, communication: 25, prioritization: 0, ai_collaboration: 10, teamwork: 15 },
    hints: [
      'Situation in one sentence. The rest is what YOU did — the tool did not catch it, you did.',
      'End on the result: "the review was rewritten, the guard landed, the dashboard cannot lie that way again."',
    ],
    chatFallback: {
      greet: () => `Take the question seriously — this exact answer opens doors. I will read it the way an interviewer would.`,
      hint: 'If a sentence does not start with "I", it probably belongs to the situation, not the action.',
      chase: 'Practice the 60-second version. Interviewers cut you off at 90 — put the result early.',
    },
  },
];

export function episodeById(id) {
  return EPISODES.find((e) => e.id === id) || null;
}

export function episodeAt(week, day) {
  return EPISODES.find((e) => e.week === week && e.day === day) || null;
}
