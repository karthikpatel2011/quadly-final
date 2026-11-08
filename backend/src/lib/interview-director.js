// Interview director — conducts the conversation when no AI provider is
// configured, and structures the LLM prompt when one is. Deterministic mode
// is stage-driven and resume-aware (it quotes real resume skills), with
// follow-ups on thin answers. It never invents company facts: company
// questions come only from words found in the uploaded documents / resume.

import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const DATA_DIR = fileURLToPath(new URL('../../data/', import.meta.url));

export const PERSONAS = {
  friendly: { name: 'Priya', role: 'Friendly HR Recruiter', tone: 'warm, encouraging, plain English' },
  manager: { name: 'Alex', role: 'Professional Hiring Manager', tone: 'structured, outcome-focused' },
  strict: { name: 'Rao', role: 'Strict Technical Interviewer', tone: 'precise, probes depth, no small talk' },
  senior: { name: 'Meera', role: 'Senior Software Engineer', tone: 'practical, architecture-first' },
  analytical: { name: 'Vikram', role: 'Analytical Interviewer', tone: 'asks why twice, quantifies everything' },
};

export const SKILLS = ['React', 'Node.js', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL', 'Python', 'Django', 'Flask',
  'Java', 'Spring', 'C++', 'JavaScript', 'TypeScript', 'HTML', 'CSS', 'Tailwind', 'AWS', 'Docker', 'Kubernetes',
  'Git', 'REST', 'GraphQL', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Pandas', 'NumPy', 'SQL', 'Redis',
  'Kafka', 'Figma', 'Linux', 'Jest', 'Firebase', 'Supabase', 'Networking', 'Testing', 'Cybersecurity', 'Excel'];

export const FILLERS = /\b(um+|uh+|erm|basically|actually|literally|you know|i mean|sort of|kind of)\b/gi;

const STAGES = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'resume', label: 'Resume deep-dive' },
  { id: 'technical', label: 'Technical assessment' },
  { id: 'problem', label: 'Problem solving' },
  { id: 'behavioral', label: 'Behavioral (STAR)' },
  { id: 'company', label: 'Company & role fit' },
  { id: 'candidate', label: 'Candidate questions' },
  { id: 'closing', label: 'Closing' },
];

const RESUME_BANK = (skill) => ([
  `I noticed your resume mentions ${skill}. Walk me through exactly how you used it.`,
  `For the ${skill} work on your resume — what was your individual contribution?`,
  `What was the hardest problem you solved with ${skill}, and how did you measure the result?`,
]);

const TYPE_QUESTIONS = {
  technical: [
    'Walk me through the architecture of a system you built end to end.',
    'How do you design the API for a feature before writing any code?',
    'Tell me how you debug something that only breaks in production.',
    'How do you decide what to test, and what do you skip?',
    'Where do you look first when an app is slow?',
  ],
  behavioral: [
    'Tell me about a disagreement in a team and how you handled it.',
    'Describe a failure that cost you something. What changed afterwards?',
    'Give an example of taking ownership without being asked.',
    'Tell me about a deadline you almost missed. What did you do?',
    'When did you last change your mind based on data?',
  ],
  hr: [
    'Why do you want to work here, specifically?',
    'What are your strengths — with proof, not adjectives?',
    'What is a real weakness, and what are you doing about it?',
    'Where do you see yourself in three years?',
    'What are your salary expectations, and on what basis?',
  ],
  managerial: [
    'How do you split work in a small team under time pressure?',
    'Tell me about delivering bad news to a teammate.',
    'How do you keep stakeholders updated without meetings?',
    'A teammate is blocked and silent. What do you do?',
  ],
  system: [
    'Design a URL shortener for 10 million links. Start with the data model.',
    'How would you make a slow dashboard load under one second?',
    'How do you design notifications for a million users without spam?',
  ],
};

const STAGE_TO_TYPE = {
  resume: 'resume', technical: 'technical', problem: 'system', behavioral: 'behavioral', company: 'hr', managerial: ' managerial',
};

export function stageList() { return STAGES; }

export function extractSkills(text) {
  const t = String(text || '');
  const found = SKILLS.filter((s) => t.toLowerCase().includes(s.toLowerCase()));
  return { skills: found.slice(0, 8), foundMentions: found.length };
}

export function extractCompanyLines(docs) {
  // Honest company context: only literal sentences from the uploaded text.
  const lines = [];
  for (const d of docs || []) {
    for (const raw of String(d.text || '').split(/\n+/)) {
      const line = raw.trim();
      if (line.length > 24 && line.length < 220 && /[a-z]/i.test(line)) lines.push(line);
    }
  }
  return lines.slice(0, 12);
}

export function greetingTurn(session) {
  const p = PERSONAS[session.persona] ?? PERSONAS.manager;
  const lang = session.language || 'en';
  const hello = {
    en: `Hello, and welcome. I'm ${p.name}, ${p.role.toLowerCase()} — I'll be running your interview today for the ${session.role} position${session.company ? ` at ${session.company}` : ''}. Can you hear me clearly? Reply yes and we'll begin.`,
    'hi-en': `Hello, welcome. Main ${p.name} hoon — aaj ka ${session.role} interview main conduct karungi. Aapko meri awaaz clearly sunai de rahi hai? Reply kijiye aur hum shuru karte hain.`,
    hi: `नमस्ते और स्वागत है। मैं ${p.name} हूँ, और आज मैं आपका ${session.role} इंटरव्यू लूँगी। क्या आप मुझे साफ़ सुन पा रहे हैं? हाँ कहिए, फिर हम शुरू करते हैं।`,
    te: 'నమస్కారం, స్వాగతం. నేను ఈ రోజు మీ ఇంటర్వ్యూ నిర్వహిస్తాను. నన్ను స్పష్టంగా వినగలిగారా? అవును అని చెప్పండి, మనం ప్రారంభిద్దాం.',
  }[lang] ?? 'Hello, and welcome. Can you hear me clearly? Reply yes and we will begin.';
  return {
    role: 'interviewer',
    text: hello,
    stage: 'greeting',
    at: new Date().toISOString(),
  };
}

export function directorTurn(session) {
  const transcript = session.transcript || [];
  const stages = [...STAGES];
  const covered = new Set(transcript.filter((t) => t.role === 'interviewer').map((t) => t.stage));
  const askedIds = new Set((session.askedIds || []));
  const lastCandidate = [...transcript].reverse().find((t) => t.role === 'candidate');
  const stage = stages.find((st) => !covered.has(st.id));
  if (!stage || !lastCandidate) {
    return { role: 'interviewer', text: 'Thank you for your time — that concludes today’s interview. Your performance report is being prepared.', stage: 'closing', at: new Date().toISOString(), done: true };
  }

  // Stage 0: language confirmation right after the greeting.
  if (covered.has('greeting') && !covered.has('intro-check')) {
    const lang = session.language || 'en';
    const ask = {
      en: 'Great. Are you comfortable continuing in English, or would you prefer Hindi or Telugu? Just say the word — we can switch anytime.',
      'hi-en': 'Great. English mein continue karein, ya Hindi/Telugu? Jaise chahein switch kar sakte hain.',
      hi: 'ठीक है। क्या हम अंग्रेज़ी में चलें, या हिंदी/तेलुगु में? आप कभी भी भाषा बदल सकते हैं।',
      te: 'బాగుంది. English-లో కొనసాగిద్దామా, లేదా హిందీ/తెలుగు? మీకు ఇష్టమైనది చెప్పండి.',
    }[lang] ?? 'Great. English, Hindi or Telugu — your choice, switchable anytime.';
    return { role: 'interviewer', text: ask, stage: 'intro-check', at: new Date().toISOString() };
  }

  // Thin answers earn ONE follow-up before we move on.
  const words = (lastCandidate.text || '').trim().split(/\s+/).filter(Boolean).length;
  const followsUsed = transcript.filter((t) => t.stage === 'introduction' && t.kind === 'follow-up').length;
  if (words < 14 && followsUsed < 2 && transcript.length > 2 && covered.size <= 3) {
    return { role: 'interviewer', text: 'Could you expand on that with a specific example?', stage: stage.id, kind: 'follow-up', at: new Date().toISOString() };
  }

  const askedNow = { askedIds: [...askedIds] };
  if (stage.id === 'introduction') {
    const q = askedIds.has('q-intro')
      ? 'What are you most proud of in the last year, and why?'
      : 'Let’s begin. Could you introduce yourself — background, what you build, and what you’re aiming for?';
    askedNow.askedIds.push('q-intro');
    return { role: 'interviewer', text: q, stage: stage.id, at: new Date().toISOString(), meta: askedNow };
  }
  if (stage.id === 'resume') {
    const skills = session.context?.skills || [];
    const skill = skills.find((x) => !askedIds.has(`sk-${x}`));
    if (skill) {
      askedNow.askedIds.push(`sk-${skill}`);
      const bank = RESUME_BANK(skill);
      const idx = askedIds.size % bank.length;
      return { role: 'interviewer', text: bank[idx], stage: stage.id, at: new Date().toISOString(), meta: askedNow };
    }
    return { role: 'interviewer', text: 'Take me through the project you are proudest of — your exact role and the outcome.', stage: stage.id, at: new Date().toISOString(), meta: askedNow };
  }
  if (stage.id === 'candidate') {
    return { role: 'interviewer', text: 'Do you have any questions for me about the role, the team, or the process? Ask anything.', stage: stage.id, at: new Date().toISOString() };
  }
  const type = stage.id === 'company' ? 'hr' : (STAGE_TO_TYPE[stage.id] || 'technical').trim();
  const bank = (TYPE_QUESTIONS[type] || TYPE_QUESTIONS.technical).filter((q) => !askedIds.has(q));
  const q = bank[0] || 'What else should I know about you as an engineer?';
  askedNow.askedIds.push(q);
  const companyLine = stage.id === 'company' && session.company
    ? ` Let’s talk about the ${session.company} fit — `
    : '';
  return { role: 'interviewer', text: companyLine + q, stage: stage.id, at: new Date().toISOString(), meta: askedNow };
}

export function llmInterviewerPrompt(session, candidateText) {
  const p = PERSONAS[session.persona] ?? PERSONAS.manager;
  const companyLines = (session.context?.companyLines || []).slice(0, 6);
  return 'You are ' + p.name + ', a ' + p.role + ' conducting a REAL spoken interview. '
    + 'Persona tone: ' + p.tone + '. Role: ' + session.role + (session.company ? ' at ' + session.company : '') + '. '
    + 'Level: ' + (session.level || 'fresher') + '. Interview type: ' + (session.interviewTypes || []).join(', ') + '. '
    + 'Conversation language: ' + (session.language || 'en') + ' — mirror the candidate mixing languages if they do. '
    + 'Candidate resume context (only facts from this may be referenced): '
    + JSON.stringify((session.context?.skills || []).slice(0, 8)) + ' '
    + (session.context?.resumeText || '').slice(0, 2500) + ' '
    + (companyLines.length ? 'Uploaded company documents say (never invent beyond this): ' + JSON.stringify(companyLines) : 'No company documents were uploaded; do not invent company facts. ')
    + 'Transcript so far: ' + JSON.stringify(session.transcript.slice(-10).map((t) => ({ r: t.role, t: t.text }))) + ' '
    + 'The candidate just said: "' + String(candidateText || '').slice(0, 1200) + '". '
    + 'Respond as the interviewer: acknowledge briefly, then ask EXACTLY ONE next question (or one natural follow-up if the answer was vague or shallow). '
    + 'Adapt difficulty to their level: dig deeper when strong, simplify when stuck, never humiliate, never reveal ideal answers. '
    + 'Maximum 60 words. Plain speech (it will be spoken aloud). If the interview has covered most stages, you may close.';
}

export function llmReportPrompt(session) {
  return 'You are an interview coach. Evaluate this mock interview transcript honestly. '
    + 'Return ONLY minified JSON: {"overall": 0-100, "verdict": string, "skills": [{"name": string, "score": 0-100}], '
    + '"answers": [{"question": string, "answer": string(≤240 chars), "score": 0-100, "good": string, "missing": string, "improve": string}], '
    + '"strengths": [string], "gaps": [string], "nextSteps": [string]}. '
    + 'Scores are transparent coaching estimates, not hiring predictions. '
    + 'Role: ' + session.role + '. Level: ' + session.level + '. Language: ' + session.language + '. '
    + 'Transcript: ' + JSON.stringify(session.transcript.map((t) => ({ r: t.role, t: t.text }))).slice(0, 6000);
}

export async function readQuestions() {
  try {
    const parsed = JSON.parse(await readFile(DATA_DIR + 'interview-questions.json', 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
