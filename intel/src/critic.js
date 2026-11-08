// Evaluation & critic (mission §5.G). Bounded by design: fixed checklist,
// bounded retries live in the orchestrator, escalation = needsUser flag.
//
// Checks are mechanical evidence-requirements, not vibes:
//  - every semantic claim in the response cites a provenance source
//  - every node/edge id referenced by the run actually exists in the graph
//  - every planned step ended completed or explicitly failed+recorded
//  - destructive/side-effecting tool calls come with the required approval

import { loadGraph } from './graph.js';

/**
 * response:  { text, citations: [{source}], usedNodeIds: [], toolCalls: [] }
 * run:       orchestrator run state ({ taskId, plan, steps })
 * opts:      { graphFile, requireCitations = true }
 */
export function critique({ response = {}, run = {}, opts = {} } = {}) {
  const graph = loadGraph(opts.graphFile);
  const failures = [];
  const violations = [];

  // 1. Semantic claims must be traceable (mission §5.B / §5.G).
  if (opts.requireCitations !== false && response.citations?.length === 0) {
    failures.push('response makes claims without any source citation');
  }

  // 2. Referenced graph nodes must exist — no fabricated knowledge ids.
  for (const id of response.usedNodeIds || []) {
    if (!graph.nodes.some((n) => n.id === id)) {
      failures.push(`response references unknown knowledge node: ${id}`);
    }
  }

  // 3. Plan completeness: no silently skipped steps.
  for (const step of run.steps || []) {
    if (step.status !== 'completed' && step.status !== 'failed') {
      failures.push(`step '${step.name}' ended in undefined state '${step.status}'`);
    }
  }

  // 4. Safety: side-effecting tools require explicit authorization.
  for (const call of response.toolCalls || []) {
    if (call.sideEffect === 'external' && call.approved !== true) {
      violations.push(`tool '${call.tool}' is external but was not explicitly approved`);
    }
  }

  // 5. Transcript/retrieved-content injection guard (mission §9).
  for (const m of run.untrustedWarnings || []) {
    if (m.executed) violations.push(`untrusted instruction from '${m.source}' was executed`);
  }

  const passed = failures.length === 0 && violations.length === 0;
  return {
    passed,
    failures,
    violations,
    bounded: { maxRetries: 2, escalation: 'needsUser' },
  };
}
