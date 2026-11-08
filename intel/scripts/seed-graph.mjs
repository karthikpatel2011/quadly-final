#!/usr/bin/env node
// Seeds the knowledge graph from VERIFIED research (both research sprints).
// Every node/edge carries provenance pointing at the research file that
// backs it — mission rule: no invented knowledge.
import { loadGraph, saveGraph, addNode, addEdge, stats } from '../src/graph.js';

const g = { version: 1, nodes: [], edges: [] };
const P = (file) => [{ source: file, kind: 'verified' }];

// ---- sources ----
const SOURCES = [
  ['src.01', 'video-01.md'], ['src.02', 'video-02.md'], ['src.03', 'video-03.md'],
  ['src.04', 'video-04.md'], ['src.05', 'video-05.md'], ['src.06', 'video-06.md'],
  ['src.07', 'video-07.md'], ['src.08', 'video-08.md'], ['src.09', 'video-09.md'],
  ['src.10', 'video-10.md'], ['src.11', 'video-11.md'],
];
for (const [id, f] of SOURCES) addNode(g, { id, type: 'source', label: f, data: { path: `research/${f}` }, provenance: P(f) });

// ---- design principles (verified across multiple research files) ----
const designNodes = [
  ['dp.603010', '60-30-10 proportion', ['research/video-09.md', 'research/video-24.md', 'research/video-21.md (translated)']],
  ['dp.contrast-floors', 'WCAG contrast floors (4.5:1 / 3:1)', ['research/video-09.md', 'research/video-10.md']],
  ['dp.state-ladder', 'Color state ladder 50-900 (600/700/800/200/300)', ['research/video-09.md', 'research/video-04.md']],
  ['dp.typography-is-layout', 'Typography is the layout (traffic control)', ['research/video-10.md']],
  ['dp.prod-graphics', 'Real product graphics beat icon filler', ['research/video-01.md', 'research/video-06.md']],
  ['dp.dark-relight', 'Dark mode = re-light, single warm figure', ['research/video-09.md', 'research/video-04.md']],
  ['dp.decision-density', 'Density only where it changes a decision', ['research/video-07.md', 'research/video-01.md']],
  ['dp.dead-modules', 'Delete dead modules', ['research/video-01.md']],
  ['dp.badges.reviews', 'Mistake-replay due badge', ['docs/video-research/video-B4.md']],
];
for (const [id, label, files] of designNodes) {
  addNode(g, { id, type: 'design-principle', label, provenance: files.map((f) => ({ source: f, kind: 'explicit' })) });
}

// ---- components (implemented) ----
const compNodes = [
  ['comp.orchestrator', 'Bounded orchestrator loop', 'intel/src/orchestrator.js'],
  ['comp.graph', 'Knowledge-graph store', 'intel/src/graph.js'],
  ['comp.memory', '5-layer memory (working/episodic/semantic/procedural/project)', 'intel/src/memory.js'],
  ['comp.tools', 'Tool registry (validate/timeout/retry)', 'intel/src/tools.js'],
  ['comp.critic', 'Evaluation + critic checklist', 'intel/src/critic.js'],
  ['comp.dashboard', 'Quadly dashboard shell (12 pages)', 'frontend/src/components/dashboard/'],
];
for (const [id, label, path] of compNodes) {
  addNode(g, { id, type: 'component', label, data: { path }, provenance: [{ source: path, kind: 'verified' }] });
}

// ---- edges ----
const E = [
  ['comp.critic', 'dp.contrast-floors', 'IMPLEMENTS'],
  ['comp.critic', 'dp.603010', 'IMPLEMENTS'],
  ['comp.dashboard', 'dp.prod-graphics', 'IMPLEMENTS'],
  ['comp.dashboard', 'dp.state-ladder', 'IMPLEMENTS'],
  ['comp.graph', 'comp.memory', 'SUPPORTS'],
  ['comp.orchestrator', 'comp.tools', 'DEPENDS_ON'],
  ['comp.orchestrator', 'comp.memory', 'DEPENDS_ON'],
  ['comp.orchestrator', 'comp.graph', 'DEPENDS_ON'],
  ['comp.critic', 'comp.orchestrator', 'SUPPORTS'],
  ['comp.dashboard', 'comp.graph', 'SUPPORTS'],
  ['dp.dark-relight', 'dp.603010', 'DERIVED_FROM'],
];
for (const [from, to, type] of E) {
  addEdge(g, { from, to, type, provenance: P('design-intelligence synthesis + docs/video-research') });
}

saveGraph(g);
console.log('seeded:', JSON.stringify(stats(g)));
