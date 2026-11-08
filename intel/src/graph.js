// Knowledge-graph store for the Quadly intelligence system.
// File-backed JSON; provenance is mandatory on every edge. Optimized for a
// few hundred useful nodes, not bulk sentences (mission §4: optimize for
// relationships + retrieval).

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';

const DATA_DIR = path.resolve(import.meta.dirname, '../data');
const STORE = path.join(DATA_DIR, 'graph.json');
export const defaultStore = () =>
  process.env.INTEL_GRAPH_FILE
    ? path.resolve(process.env.INTEL_GRAPH_FILE)
    : STORE;

export const EDGE_TYPES = [
  'DEPENDS_ON', 'SUPPORTS', 'CONTRADICTS', 'IMPLEMENTS',
  'IMPROVES', 'DERIVED_FROM', 'APPLIES_TO', 'REQUIRES_VALIDATION',
];

export const NODE_TYPES = [
  'concept', 'technique', 'decision', 'tool', 'design-principle',
  'component', 'task', 'source', 'gap',
];

function emptyGraph() {
  return { version: 1, nodes: [], edges: [] };
}

export function loadGraph(file = defaultStore()) {
  if (!existsSync(file)) return emptyGraph();
  try {
    const g = JSON.parse(readFileSync(file, 'utf8'));
    return { version: 1, nodes: g.nodes ?? [], edges: g.edges ?? [] };
  } catch {
    return emptyGraph(); // corrupt store degrades to empty — caller re-populates
  }
}

export function saveGraph(graph, file = defaultStore()) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify(graph, null, 2));
  return graph;
}

/** provenance: [{ source, timestamp, kind: 'explicit'|'inferred'|'verified' }] — required ≥1. */
export function addNode(graph, { id, type, label, data = {}, provenance }) {
  if (!id || !label) throw new Error('node requires id and label');
  if (!NODE_TYPES.includes(type)) throw new Error(`unknown node type: ${type}`);
  if (!Array.isArray(provenance) || provenance.length === 0) {
    throw new Error(`node ${id} requires provenance (mission §4)`);
  }
  if (graph.nodes.some((n) => n.id === id)) return graph; // idempotent
  graph.nodes.push({ id, type, label, data, provenance });
  return graph;
}

/** type must be one of EDGE_TYPES; both endpoints must exist. */
export function addEdge(graph, { from, to, type, data = {}, provenance }) {
  if (!EDGE_TYPES.includes(type)) throw new Error(`unknown edge type: ${type}`);
  const fromOk = graph.nodes.some((n) => n.id === from);
  const toOk = graph.nodes.some((n) => n.id === to);
  if (!fromOk || !toOk) throw new Error(`edge endpoint missing: ${from} → ${to}`);
  if (!Array.isArray(provenance) || provenance.length === 0) {
    throw new Error(`edge ${from}→${to} requires provenance (mission §4)`);
  }
  const dup = graph.edges.some((e) => e.from === from && e.to === to && e.type === type);
  if (dup) return graph; // idempotent
  graph.edges.push({ from, to, type, data, provenance });
  return graph;
}

/** Keyword query across label/data text (no embeddings needed at this corpus size). */
export function queryGraph(graph, query, { type } = {}) {
  const q = String(query || '').toLowerCase().split(/\s+/).filter(Boolean);
  const nodes = graph.nodes.filter((n) => {
    if (type && n.type !== type) return false;
    const hay = `${n.id} ${n.label} ${JSON.stringify(n.data)}`.toLowerCase();
    return q.length === 0 || q.some((w) => hay.includes(w));
  });
  const ids = new Set(nodes.map((n) => n.id));
  const edges = graph.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
  return { nodes, edges };
}

/** Bounded 2-hop traversal from a node along one or more edge types. */
export function neighborhood(graph, id, { types = [], hops = 2 } = {}) {
  const visited = new Set([id]);
  let frontier = [id];
  const edges = [];
  for (let h = 0; h < hops; h++) {
    const next = [];
    for (const e of graph.edges) {
      const hits = (types.length === 0 || types.includes(e.type));
      if (!hits) continue;
      if (frontier.includes(e.from) && !visited.has(e.to)) {
        edges.push(e); visited.add(e.to); next.push(e.to);
      } else if (frontier.includes(e.to) && !visited.has(e.from)) {
        edges.push(e); visited.add(e.from); next.push(e.from);
      }
    }
    frontier = next;
    if (frontier.length === 0) break;
  }
  const nodes = graph.nodes.filter((n) => visited.has(n.id));
  return { nodes, edges };
}

export function stats(graph) {
  const byType = {};
  for (const n of graph.nodes) byType[n.type] = (byType[n.type] || 0) + 1;
  const byEdge = {};
  for (const e of graph.edges) byEdge[e.type] = (byEdge[e.type] || 0) + 1;
  return { nodes: graph.nodes.length, edges: graph.edges.length, byType, byEdge };
}
