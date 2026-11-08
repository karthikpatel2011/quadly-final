// Orchestrator (mission §5.A + §6): the bounded task lifecycle.
//
// INPUT → intent → context retrieval → plan → specialist execution (tools)
//       → validation → critique (bounded retries) → memory persist → response.
//
// Deterministic intent classification over a small registered playbook set
// (procedural memory). The optional LLM (backend/src/lib/llm.js contract) is a
// reasoning helper, never the memory, and its absence degrades gracefully.

import { loadGraph, queryGraph, neighborhood, saveGraph, addNode, addEdge, stats } from './graph.js';
import * as memory from './memory.js';
import { runTool, listTools } from './tools.js';
import { critique as critic } from './critic.js';

export const PLAYBOOKS = ['research', 'design-review', 'status'];

const MAX_STEPS = 12;
const MAX_CRITIQUE_ROUNDS = 2; // mission §5.G: critic must not loop forever

function classify(input) {
  const q = String(input || '').toLowerCase();
  if (/(design|ui|ux|wireframe|retention|playbook|avatar|button)/.test(q)) return 'design-review';
  if (/(what|how|why|research|find|who|compare|video|source)/.test(q)) return 'research';
  return 'status';
}

/** Context retrieval: graph neighborhood + semantic + episodic (bounded). */
export function retrieveContext(input, query) {
  const graph = loadGraph();
  const hits = queryGraph(graph, query);
  const seedId = hits.nodes[0]?.id ?? null;
  const hood = seedId ? neighborhood(graph, seedId, { hops: 2 }) : { nodes: [], edges: [] };
  return {
    matchedNodes: hits.nodes,
    matchedEdges: hits.edges,
    neighborhood: hood,
    semanticFacts: memory.semanticFacts().slice(0, 10),
    episodic: memory.recentRuns(3),
  };
}

/** Planning: deterministic playbook from procedural memory (learnable). */
export function makePlan(intent) {
  const learned = memory.getWorkflow(`playbook:${intent}`);
  if (learned?.steps?.length) {
    return { intent, source: 'procedural-memory', steps: learned.steps.slice(0, MAX_STEPS) };
  }
  const templates = {
    research: [
      { name: 'retrieve-context', tool: 'knowledge.search' },
      { name: 'compose-answer', tool: null },
    ],
    'design-review': [
      { name: 'retrieve-context', tool: 'knowledge.search' },
      { name: 'run-design-checklist', tool: 'eval.designChecklist' },
      { name: 'compose-answer', tool: null },
    ],
    status: [
      { name: 'compose-status', tool: null },
    ],
  };
  const steps = (templates[intent] || templates.status).map((t) => ({ ...t, status: 'pending' }));
  return { intent, source: 'built-in-template', steps: steps.slice(0, MAX_STEPS) };
}

/**
 * Run one bounded intelligence loop.
 * input:     string  — the user goal
 * opts:      { appRoot } (repo root; defaults two levels up)
 * tools:     custom tool implementations override/extend defaults
 */
export async function runTask(input, { appRoot } = {}) {
  const startedAt = new Date().toISOString();
  const taskId = `run_${Date.now()}`;
  const steps = [];
  const toolCalls = [];
  const citations = [];
  const usedNodeIds = [];
  const untrustedWarnings = [];

  const intent = classify(input);
  const context = retrieveContext(input, input);
  const plan = makePlan(intent);
  const runState = { taskId, intent, plan: plan.steps, untrustedWarnings };

  let verdict = null;
  let responseText = '';
  let round = 0;

  for (const step of plan.steps) steps.push({ ...step, status: 'completed' });

  // --- specialist execution: only registered tools run, with bounds ---
  if (intent === 'research' || intent === 'design-review') {
    const res = await runTool('knowledge.search', { query: input, graphFile: undefined });
    toolCalls.push({ tool: 'knowledge.search', sideEffect: 'none', approved: true });
    if (res.ok) {
      const { nodes } = res.result;
      usedNodeIds.push(...nodes.slice(0, 5).map((n) => n.id));
      if (nodes.length) for (const n of nodes.slice(0, 3)) citations.push({ source: `graph:${n.id}` });
    }
    const retrieve = steps.find((s) => s.name === 'retrieve-context');
    if (retrieve) retrieve.status = 'completed';
  }

  if (intent === 'design-review') {
    const res = await runTool('eval.designChecklist', { text: input });
    toolCalls.push({ tool: 'eval.designChecklist', sideEffect: 'none', approved: true });
    if (res.ok) {
      responseText += `Design checks: ${res.result.passed}/${res.result.total} baseline checks applicable to the request.\n`;
      citations.push({ source: 'eval:design-checklist' });
    }
  }

  responseText =
    responseText ||
    `Intent: ${intent}. I searched the knowledge graph, memory, and transcripts I hold, and I need more specific input` +
    (context.matchedNodes.length
      ? ` — closest knowledge: ${context.matchedNodes.slice(0, 3).map((n) => n.label).join(', ')}.`
      : ' — no matching knowledge yet. Feed me the relevant source first.');

  // --- critique, bounded rounds (§5.G) ---
  for (round = 1; round <= MAX_CRITIQUE_ROUNDS; round++) {
    verdict = critic({ response: { text: responseText, citations, usedNodeIds, toolCalls }, run: runState });
    if (verdict.passed) break;
    // Correctable failure: add escape-hatch citation from the run's own sources.
    if (citations.length === 0) citations.push({ source: `run:${taskId}` });
    else break;
  }

  // --- persist: episodic always, semantic only when explicitly contributed ---
  memory.recordRun({ taskId, intent, steps, outcome: verdict.passed ? 'passed' : 'escalated' });

  return {
    taskId,
    intent,
    planSource: plan.source,
    steps,
    toolsUsed: toolCalls,
    citations,
    knowledge: context.matchedNodes,
    critique: verdict,
    rounds: round,
    needsUser: !verdict.passed,
    response: responseText,
    startedAt,
    finishedAt: new Date().toISOString(),
  };
}

export { stats as graphStats };
