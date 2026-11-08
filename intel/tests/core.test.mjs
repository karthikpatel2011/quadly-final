// Intel core tests — run: npm test (in intel/)
import { test, describe, beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import {
  loadGraph, saveGraph, addNode, addEdge, queryGraph, neighborhood,
} from '../src/graph.js';
import * as memory from '../src/memory.js';
import { registerTool, runTool } from '../src/tools.js';
import { critique } from '../src/critic.js';
import { runTask, makePlan } from '../src/orchestrator.js';

const PROV = [{ source: 'test', at: '2026-01-01', kind: 'verified' }];

let SANDBOX;
beforeEach(() => {
  SANDBOX = mkdtempSync(path.join(tmpdir(), 'intel-test-'));
  process.env.INTEL_DATA_DIR = SANDBOX;
  process.env.INTEL_GRAPH_FILE = path.join(SANDBOX, 'graph.json');
});
after(() => {
  try { delete process.env.INTEL_DATA_DIR; delete process.env.INTEL_GRAPH_FILE; } catch { /* ignore */ }
});

describe('graph store', () => {
  let g;
  beforeEach(() => {
    g = { version: 1, nodes: [], edges: [] };
    addNode(g, { id: 'src1', type: 'source', label: 'Video A1', provenance: PROV });
    addNode(g, { id: 'crap', type: 'design-principle', label: 'C.R.A.P.', provenance: PROV });
    addNode(g, { id: 'evaluator', type: 'component', label: 'Critic agent', provenance: PROV });
    addEdge(g, { from: 'crap', to: 'evaluator', type: 'APPLIES_TO', provenance: PROV });
  });

  test('rejects nodes without provenance (mission §4)', () => {
    assert.throws(() => addNode(g, { id: 'x', type: 'tool', label: 'X', provenance: [] }));
  });

  test('rejects unknown edge types and dangling endpoints', () => {
    assert.throws(() => addEdge(g, { from: 'src1', to: 'crap', type: 'LOVES', provenance: PROV }));
    assert.throws(() => addEdge(g, { from: 'ghost', to: 'crap', type: 'SUPPORTS', provenance: PROV }));
  });

  test('queries by keyword and traverses neighborhoods', () => {
    const q = queryGraph(g, 'crap');
    assert.equal(q.nodes.length, 1);
    const hood = neighborhood(g, 'crap');
    assert.ok(hood.nodes.some((n) => n.id === 'crap'));
  });

  test('idempotent node inserts', () => {
    addNode(g, { id: 'crap', type: 'design-principle', label: 'C.R.A.P.', provenance: PROV });
    assert.equal(g.nodes.length, 3);
  });
});

describe('memory layers', () => {
  test('episodic records runs', () => {
    memory.recordRun({ taskId: 't1', intent: 'research', steps: [], outcome: 'passed' });
    memory.recordRun({ taskId: 't2', intent: 'status', steps: [], outcome: 'passed' });
    assert.ok(memory.recentRuns(10).some((x) => x.taskId === 't2'));
  });
  test('semantic facts require provenance', () => {
    assert.throws(() => memory.recordSemanticFact({ id: 'f1', text: 'x', provenance: [] }));
    memory.recordSemanticFact({ id: 'f1', text: 'x', provenance: PROV });
    assert.ok(memory.semanticFacts().some((f) => f.id === 'f1'));
  });
  test('procedural workflows are learnable + timestamped', () => {
    memory.putWorkflow('playbook:research', { steps: [{ name: 'a' }], retries: 2 });
    const learned = memory.learnWorkflow('playbook:research', { retries: 3 });
    assert.equal(learned.retries, 3);
    assert.equal(learned.learned, true);
  });
});

describe('tool registry bounds', () => {
  test('validation rejects wrong input types', async () => {
    registerTool({ name: 't.stringy', description: '', sideEffect: 'none', schema: { q: 'string' }, run: () => 1 });
    const r = await runTool('t.stringy', { q: 42 });
    assert.equal(r.ok, false);
  });
  test('timeouts are enforced and bounded', async () => {
    registerTool({ name: 't.slow', description: '', sideEffect: 'none', schema: {}, timeoutMs: 40, retries: 0, run: () => new Promise(() => {}) });
    const r = await runTool('t.slow', {});
    assert.equal(r.ok, false);
    assert.match(r.error, /timed out/);
  });
  test('sideEffect classification is enforced', () => {
    assert.throws(() => registerTool({ name: 't.bad', description: '', sideEffect: 'galaxy', schema: {}, run: () => {} }));
  });
});

describe('critic', () => {
  test('fails responses citing unknown knowledge nodes', () => {
    const res = critique({
      response: { usedNodeIds: ['ghost'], citations: [{ source: 'x' }] },
      run: { steps: [] },
      opts: { requireCitations: false },
    });
    assert.equal(res.passed, false);
  });
  test('requires citations by default', () => {
    const res = critique({ response: { usedNodeIds: [], citations: [] }, run: { steps: [{ name: 's', status: 'completed' }] } });
    assert.equal(res.passed, false);
    assert.match(res.failures.join(' '), /citation/);
  });
  test('flags executed untrusted instructions', () => {
    const res = critique({
      response: { usedNodeIds: [], citations: [{ source: 'ok' }] },
      run: { steps: [], untrustedWarnings: [{ source: 'transcript', executed: true }] },
    });
    assert.equal(res.passed, false);
  });
});

describe('orchestrator (bounded loop)', () => {
  test('research intent: full lifecycle on a seeded graph', async () => {
    const g = { version: 1, nodes: [], edges: [] };
    addNode(g, { id: 'concept.crap', type: 'design-principle', label: 'C.R.A.P. design principles', provenance: PROV });
    saveGraph(g, process.env.INTEL_GRAPH_FILE);
    const run = await runTask('how do design principles like C.R.A.P. apply to the dashboard?');
    assert.equal(run.intent, 'design-review');
    assert.ok(run.steps.length >= 2);
    assert.equal(typeof run.needsUser, 'boolean');
  });
  test('status intent runs the minimal playbook', async () => {
    const run = await runTask('status');
    assert.equal(run.intent, 'status');
    assert.equal(run.planSource, 'built-in-template');
  });
  test('plan falls back to template, never exceeds MAX_STEPS', () => {
    const p = makePlan('research');
    assert.ok(p.steps.length <= 12);
    assert.ok(p.steps.every((s) => s.status === 'pending'));
  });
});
