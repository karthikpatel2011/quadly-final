# KNOWLEDGE GRAPH — schema, provenance, and current state

Store: `intel/data/graph.json` (seed: `intel/scripts/seed-graph.mjs`).
Runtime: `intel/src/graph.js` + `/api/intel/graph/query` (read-only API surface).

```
node { id, type, label, data, provenance[] }
edge { from, to, type, data, provenance[] }
```

Types: concept | technique | decision | tool | design-principle | component | task | source | gap
Edges: DEPENDS_ON | SUPPORTS | CONTRADICTS | IMPLEMENTS | IMPROVES | DERIVED_FROM | APPLIES_TO | REQUIRES_VALIDATION

Every node and edge must carry provenance: `[{ source, kind: explicit|inferred|verified, at }]`.
No provenance = rejected at write time (enforced in graph.js). This is the
mission §4 rule: "important knowledge items retain the source, timestamp, and
claim kind."

## Current state

26 nodes / 11 edges. Composition by node type: source 11, design-principle 9,
component 6. By edge type: IMPLEMENTS 4, SUPPORTS 3, DEPENDS_ON 3, DERIVED_FROM 1.

The seed was generated from VERIFIED prior-sprint research, not from arbitrary
extraction. Node sources:

- sources 01–11       ← per-video research files from the first mission (videos 01–11)
- design-principles   ← rules extracted in sprints 1–2 (60-30-10, WCAG floors,
                        state ladder, typography-as-layout, prod-graphics,
                        dark-relight, decision-density, dead-modules)
- components          ← implemented modules of the intel core + dashboard

## Initial findings (what the graph says so far)

1. The critic component IMPLEMENTS the two strongest cross-video principles
   (60-30-10, WCAG floors) — the enforcement point for product quality.
2. The orchestrator DEPENDS_ON graph + memory + tools: the bounded loop is the
   composition point; removing any breaks the loop.
3. Dark-mode principles DERIVE_FROM 60-30-10: the family structure is already
   visible (the rule family is independent of individual creators).
4. The dashboard SUPPORTS the graph: it's both a consumer and a source of
   design-principle evidence.

## Growth protocol (what to add next)

1. When new research files are written by agents, the results feed in as:
   - new `source` nodes (one per research file)
   - new `design-principle` / `concept` / `gap` nodes with provenance
   - edges: APPLIES_TO (a principle in a component), CONTRADICTS (conflicting
     advice from different videos), REQUIRES_VALIDATION (a hypothesis that
     hasn't been tested).
2. No bulk sentence extraction: only items that answer "which rule should a
   design evaluator check?" or "which module does this depend on?"

## Initial graph (rendered as text)

```
src.01 → src.10 : { type: source } (research provenance)
dp.603010    ← IMPLEMENTED ← comp.critic
dp.contrast-floors ← IMPLEMENTED ← comp.critic
dp.state-ladder    ← IMPLEMENTED ← comp.dashboard
dp.prod-graphics   ← IMPLEMENTED ← comp.dashboard
dp.dark-relight  — DERIVED_FROM → dp.603010
comp.orchestrator — DEPENDS_ON → comp.tools, comp.memory, comp.graph
comp.graph — SUPPORTS → comp.memory
comp.dashboard — SUPPORTS → comp.graph
```

## Known gaps (from the mission)

- The new-video research (docs/video-research/video-A1-A7, B1–B5) is ANALYZED
  but not yet fully integrated as graph nodes — the research agents' outputs
  land as markdown; the graph seed script will need to be extended to parse or
  manually register the new findings in a second pass.
- Contradiction edges (CONTRADICTS) are known from the design-intelligence
  comparison (e.g., F-pattern debunked by Jesse Showalter vs assumed by generic
  advice; price placement split between Saptarshi and Kole) — these will be
  added in the next seed pass with evidence pointers.
