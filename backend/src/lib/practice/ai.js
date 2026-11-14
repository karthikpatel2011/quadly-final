// Practice AI wrapper — four tightly-bounded roles and nothing else:
//   hint      rephrase a scripted hint (never name the root cause)
//   critique  annotate the postmortem rubric with notes (booleans only)
//   defend    suggest follow-up questions
//   draft     draft a scenario for the human review queue
// The engine never lets the AI invent evidence: every AI answer is parsed
// against a zod schema, and any failure (no key, quota, timeout, bad JSON,
// guard trip) falls back to the deterministic answer the caller supplies.
// Usage logs hold counters only — no prompts, no student text, no ids.

import { llmAvailable } from '../llm.js';
import { aiQuota } from './store.js';
import { istDayKey } from '../streaks.js';

const TIMEOUT_MS = 20_000;
const ATTEMPTS = 2;
const PER_STUDENT_DAILY = 20;
const GLOBAL_DAILY = 300;

/** Pull the first balanced JSON object out of a model reply. */
function extractJson(text) {
  if (typeof text !== 'string') return null;
  const start = text.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  for (let i = start; i < text.length; i += 1) {
    if (text[i] === '{') depth += 1;
    if (text[i] === '}') {
      depth -= 1;
      if (depth === 0) {
        try {
          return JSON.parse(text.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

async function callProvider(prompt, maxTokens) {
  const url = process.env.LLM_API_URL || 'https://api.openai.com/v1/chat/completions';
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.LLM_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.LLM_MODEL || 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are part of an educational incident-practice tool. Reply with ONE JSON object and nothing else. Never invent facts.' },
          { role: 'user', content: prompt },
        ],
        max_tokens: maxTokens,
        temperature: 0,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null; // timeout, network, provider error — the caller falls back
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Run one AI role. Returns { ok, data, reason } where data is schema-validated
 * AI output on success, or the caller's fallback data with ok:false.
 * guard(data) may veto an AI answer after validation (e.g. a hint naming the
 * root cause) — a veto is a fallback, recorded as a rejected use.
 */
export async function aiPractice({ role, email, prompt, schema, fallback, maxTokens = 700, guard }) {
  if (!llmAvailable()) {
    return { ok: false, data: fallback(), reason: 'no-key' };
  }
  const quota = await aiQuota(email, role, {
    perStudent: PER_STUDENT_DAILY,
    global: GLOBAL_DAILY,
    dayKey: istDayKey(),
  });
  if (!quota.allowed) {
    return { ok: false, data: fallback(), reason: 'quota' };
  }

  let lastText = 'unset';
  for (let attempt = 0; attempt < ATTEMPTS; attempt += 1) {
    const text = await callProvider(attempt === 0 ? `${prompt}\n\nReply with ONE JSON object only.` : `${prompt}\n\nYour previous reply was not one JSON object. Reply with ONE JSON object only, no prose, no code fences.`, maxTokens);
    lastText = text || 'null';
    const obj = extractJson(text);
    if (!obj) continue;
    const parsed = schema.safeParse(obj);
    if (!parsed.success) continue;
    if (guard && !guard(parsed.data)) {
      return { ok: false, data: fallback(), reason: 'guard' };
    }
    return { ok: true, data: parsed.data, reason: null };
  }
  return { ok: false, data: fallback(), reason: `unparseable (${lastText === 'null' ? 'no reply' : 'bad JSON'})` };
}

/** True when the string leaks any defining keyword of the true root cause. */
export function leaksRootCause(text, trueRoot) {
  if (typeof text !== 'string' || !trueRoot) return false;
  const lower = text.toLowerCase();
  return (trueRoot.keywords || []).some((k) => lower.includes(k.toLowerCase()));
}
