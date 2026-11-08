// Five-layer memory (mission §5.F). All layers are honest file-backed stores:
// nothing here pretends that conversation context is persistent memory.
//
//   working  — per-run scratch (NOT persisted; lives in the orchestrator)
//   episodic — prior runs: task, steps, outcome, timestamps
//   semantic — verified knowledge (backed by knowledge graph, see graph.js)
//   procedural — reusable workflow instructions (bounded, human-reviewable JSON)
//   project  — requirements/decisions/conventions snapshot for the active repo

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const DIR = () => process.env.INTEL_DATA_DIR
  ? path.resolve(process.env.INTEL_DATA_DIR, 'memory')
  : path.resolve(import.meta.dirname, '../data/memory');

function file(layer) {
  return path.join(DIR(), `${layer}.json`);
}

function readLayer(layer, fallback) {
  const f = file(layer);
  if (!existsSync(f)) return fallback;
  try {
    return JSON.parse(readFileSync(f, 'utf8'));
  } catch {
    return fallback; // corrupt → honest empty, never invented recovery
  }
}

function writeLayer(layer, value) {
  mkdirSync(DIR(), { recursive: true });
  writeFileSync(file(layer), JSON.stringify(value, null, 2));
  return value;
}

/* ---------- episodic ---------- */

export function recordRun({ taskId, intent, steps, outcome, at = new Date().toISOString() }) {
  const log = readLayer('episodic', { runs: [] });
  log.runs.push({ taskId, intent, steps, outcome, at });
  log.runs = log.runs.slice(-200); // bounded history
  writeLayer('episodic', log);
  return log.runs[log.runs.length - 1];
}

export function recentRuns(limit = 10) {
  const log = readLayer('episodic', { runs: [] });
  return log.runs.slice(-limit).reverse();
}

/* ---------- semantic ---------- */

export function recordSemanticFact({ id, text, provenance }) {
  const store = readLayer('semantic', { facts: [] });
  if (store.facts.some((f) => f.id === id)) return store; // idempotent
  if (!provenance || provenance.length === 0) {
    throw new Error(`semantic fact ${id} requires provenance`);
  }
  store.facts.push({ id, text, provenance, at: new Date().toISOString() });
  store.facts = store.facts.slice(-500);
  writeLayer('semantic', store);
  return store;
}

export function semanticFacts() {
  return readLayer('semantic', { facts: [] }).facts;
}

/* ---------- procedural (workflows) ---------- */

export function getWorkflow(name) {
  const store = readLayer('procedural', { workflows: {} });
  return store.workflows[name] ?? null; // { steps: [...], retries, acceptance }
}

export function putWorkflow(name, workflow) {
  const store = readLayer('procedural', { workflows: {} });
  store.workflows[name] = { ...workflow, updatedAt: new Date().toISOString() };
  writeLayer('procedural', store);
  return store.workflows[name];
}

/** Workflows survive restarts; updates are additive + timestamped, never silent. */
export function learnWorkflow(name, patch) {
  const current = getWorkflow(name) || { steps: [], retries: 1 };
  return putWorkflow(name, { ...current, ...patch, learned: true });
}

/* ---------- project ---------- */

export function projectSnapshot() {
  return readLayer('project', { notes: [], decisions: [] });
}

export function recordProjectDecision({ id, decision, reason, at = new Date().toISOString() }) {
  const p = projectSnapshot();
  p.decisions.push({ id, decision, reason, at });
  p.decisions = p.decisions.slice(-100);
  writeLayer('project', p);
  return p;
}

export function workingMemoryEnvelope(runState) {
  // Explicit boundary: working memory is run-scoped and never persisted here.
  return { layers: ['working(free)', 'episodic', 'semantic', 'procedural', 'project'], runState };
}
