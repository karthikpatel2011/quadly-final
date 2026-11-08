// Quadly intelligence core — public surface.
// Minimal, file-backed, bounded. No embeddings: the corpus is small and
// keyword + graph retrieval is measurably sufficient (documented in ARCHITECTURE.md).

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadGraph, saveGraph, addNode, addEdge, queryGraph,
  neighborhood, stats, EDGE_TYPES, NODE_TYPES,
} from './graph.js';
import * as memory from './memory.js';
import { registerTool, runTool, listTools } from './tools.js';
import { critique } from './critic.js';
import { runTask, retrieveContext, makePlan, PLAYBOOKS } from './orchestrator.js';

// ---------- default tools (registered on import; extend via registerTool) ----------

const GRAPH_FILE = () => process.env.INTEL_GRAPH_FILE
  ? path.resolve(process.env.INTEL_GRAPH_FILE)
  : fileURLToPath(new URL('../data/graph.json', import.meta.url));

registerTool({
  name: 'knowledge.search',
  description: 'Keyword search over the knowledge graph; returns matching nodes + edges.',
  sideEffect: 'none',
  schema: { query: 'string' },
  run: ({ query }) => {
    const g = loadGraph(GRAPH_FILE());
    return queryGraph(g, query);
  },
});

registerTool({
  name: 'knowledge.add',
  description: 'Add a provenance-carrying node to the knowledge graph.',
  sideEffect: 'local-file',
  schema: { node: 'object' },
  run: ({ node }) => {
    const g = loadGraph(GRAPH_FILE());
    addNode(g, { ...node });
    saveGraph(g, GRAPH_FILE());
    return { added: node.id };
  },
});

// Baseline design checklist — the deterministic floor from
// design-intelligence/evaluations/checklist.md; deeper rules live in the graph.
const DESIGN_BASELINE = [
  'One unmistakable primary action per screen',
  'Reading order is explicit (what matters first)',
  'Spacing encodes relationships (gap hierarchy)',
  'Color = meaning only (accent rationed, semantics reserved)',
  'All interaction states designed (hover/focus/disabled/loading/empty/error)',
  'Contrast floors met (4.5:1 text, 3:1 UI) on the real surface',
  'No dead modules; destructive actions confirmed + semantic red',
  'Empty/loading/error states designed, not just the happy path',
  'Type: single family, capped scale, measure 45–75ch, leading ramp',
  'Responsive collapse verified at narrow + wide',
];
registerTool({
  name: 'eval.designChecklist',
  description: 'Returns the baseline design-evaluation floor; each item maps to a checkable rule.',
  sideEffect: 'none',
  schema: { text: 'string' },
  run: () => ({ total: DESIGN_BASELINE.length, passed: null, items: DESIGN_BASELINE }),
});

// ---------- exports ----------

export {
  loadGraph, saveGraph, addNode, addEdge, queryGraph, neighborhood, stats,
  EDGE_TYPES, NODE_TYPES,
  memory,
  registerTool, runTool, listTools,
  critique,
  runTask, retrieveContext, makePlan, PLAYBOOKS,
  DESIGN_BASELINE,
};

export const intelStatus = () => {
  const g = loadGraph(GRAPH_FILE());
  return { graph: stats(g), tools: listTools(), playbooks: PLAYBOOKS, memory: memory.workingMemoryEnvelope({}) };
};
