// Tool registry (mission §5.H). Every tool has: validated input schema,
// timeout, bounded retries, and an explicit side-effect classification.
// Untrusted content (transcripts, memories) is DATA — a tool never evaluates
// or executes strings that came from it.

import { loadGraph, queryGraph as graphQuery, defaultStore } from './graph.js';

const registry = new Map();

class ValidationFailure extends Error {}

function validate(schema, input) {
  for (const [key, kind] of Object.entries(schema)) {
    const v = input?.[key];
    if (kind === 'string' && typeof v !== 'string') throw new ValidationFailure(`tool input '${key}' must be a string`);
    if (kind === 'number' && typeof v !== 'number') throw new ValidationFailure(`tool input '${key}' must be a number`);
    if (kind === 'object' && (typeof v !== 'object' || v === null)) throw new ValidationFailure(`tool input '${key}' must be an object`);
  }
  return { ...input };
}

export function registerTool(tool) {
  const required = ['name', 'description', 'sideEffect', 'schema', 'run'];
  for (const k of required) {
    if (!(k in tool)) throw new Error(`tool ${tool.name || '?'} missing ${k}`);
  }
  if (!['none', 'local-file', 'external'].includes(tool.sideEffect)) {
    throw new Error(`tool ${tool.name}: bad sideEffect class`);
  }
  registry.set(tool.name, { timeoutMs: 10_000, retries: 1, ...tool });
}

export function listTools() {
  return [...registry.values()].map(({ name, description, sideEffect, schema }) => ({
    name, description, sideEffect, schema,
  }));
}

export function getTool(name) {
  return registry.get(name) ?? null;
}

/** Bounded execution: validate → timeout → retry (at most tool.retries). */
export async function runTool(name, input = {}, { timeoutMs, retries } = {}) {
  const tool = registry.get(name);
  if (!tool) throw new Error(`no such tool: ${name}`);
  let validated;
  try {
    validated = validate(tool.schema ?? {}, input);
  } catch (err) {
    // Input errors: retrying cannot help — return as a failed bounded result.
    return { ok: false, tool: name, error: String(err?.message || err) };
  }
  const limit = timeoutMs ?? tool.timeoutMs;
  const attempts = 1 + Math.max(0, (retries ?? tool.retries) ?? 0);
  let lastErr;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const result = await Promise.race([
        Promise.resolve(tool.run(validated)),
        new Promise((_, rej) => setTimeout(() => rej(new Error(`${name} timed out after ${limit}ms`)), limit)),
      ]);
      return { ok: true, tool: name, result };
    } catch (err) {
      if (err && err.name === 'ValidationFailure') break;
      lastErr = err;
      if (attempt < attempts) continue;
    }
  }
  return { ok: false, tool: name, error: String(lastErr?.message || lastErr) };
}

// ---------- default tools (self-registered; the orchestrator depends on these) ----------

const GRAPH_FILE = () => process.env.INTEL_GRAPH_FILE || defaultStore();

const DESIGN_BASELINE = [
  'One unmistakable primary action per screen',
  'Reading order is explicit (what matters first)',
  'Spacing encodes relationships (gap hierarchy)',
  'Color = meaning only (accent rationed, semantics reserved)',
  'All interaction states designed (hover/focus/disabled/loading/empty/error)',
  'Contrast floors met (4.5:1 text, 3:1 UI) on the real surface',
  'No dead modules; destructive actions confirmed + semantic red',
  'Empty/loading/error states designed, not just the happy path',
  'Type: single family, capped scale, measure 45-75ch, leading ramp',
  'Responsive collapse verified at narrow + wide',
];

registerTool({
  name: 'knowledge.search',
  description: 'Keyword search over the knowledge graph; returns matching nodes + edges.',
  sideEffect: 'none',
  schema: { query: 'string' },
  run: ({ query }) => graphQuery(loadGraph(GRAPH_FILE()), query),
});

registerTool({
  name: 'eval.designChecklist',
  description: 'Returns the baseline design-evaluation floor (from the design-intelligence checklist).',
  sideEffect: 'none',
  schema: { text: 'string' },
  run: () => ({ total: DESIGN_BASELINE.length, items: DESIGN_BASELINE }),
});

export { DESIGN_BASELINE };
