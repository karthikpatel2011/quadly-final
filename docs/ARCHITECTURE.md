# ARCHITECTURE — Quadly Intelligence System

Implemented per the mission's evidence bar: simplest reliable version of the
loop, file-backed persistence, bounded execution, no speculative infrastructure.

## Module map (all paths relative to repo root)

```
intel/
  src/graph.js          knowledge-graph store (JSON file, provenance required)
  src/memory.js         5-layer memory (working=run-scoped, episodic, semantic,
                        procedural, project) — file-backed under intel/data/memory/
  src/tools.js          tool registry: validate → timeout → bounded retries;
                        side-effect classes: none / local-file / external
  src/critic.js         mechanical evidence checks (citations, node ids, step
                        completeness, untrusted-injection guard)
  src/orchestrator.js   bounded lifecycle: classify → retrieve → plan → execute
                        → validate → critique (≤2 rounds) → persist → respond
  src/index.js          public surface + default tools
  scripts/seed-graph.mjs  seeds the graph from verified research files
  tests/core.test.mjs   node --test suite (16 cases)
backend/src/routes/intel.js   read-only API: /api/intel/status, /api/intel/graph/query
design-intelligence/          prior design-intelligence corpus (33 videos of
                              research across two missions) — the semantic layer's
                              largest verified source
docs/                         this mission's documentation set
```

## Data flow

```
user goal
  → orchestrator.classify()         (deterministic playbook taxonomy: research,
                                     design-review, status)
  → retrieveContext()               (graph keyword query + 2-hop neighborhood,
                                     semantic facts, recent episodic runs)
  → makePlan()                      (procedural memory first, else built-in
                                     template; ready-only steps; ≤12 steps)
  → runTool(...)                    (registry: validate → timeout → retries;
                                     side-effect classes enforced)
  → critic.critique()               (≤2 rounds: citations required, node ids
                                     must exist, steps complete, injection guard)
  → memory.recordRun()              (episodic; never rewrites playbooks silently)
  → response { steps, toolsUsed, citations, knowledge, critique, needsUser }
```

## Persistence

Everything survives restarts by design: `intel/data/graph.json`,
`intel/data/memory/*.json` (episodic/semantic/procedural), and the research
corpus itself as markdown with provenance. Working memory is run-scoped and
honestly ephemeral. The backend's student accounts are in-memory (pre-beta,
documented in backend/src/routes/auth.js) — intellectual data does NOT depend
on that weakness.

## Model integration

The LLM is optional and configurable (`LLM_API_KEY`, `LLM_API_URL`,
`LLM_MODEL` in backend/.env via backend/src/lib/llm.js). Without a key, every
component degrades to deterministic behavior (heuristic mentor, template
plans). The intelligence core deliberately has NO LLM in its loop: intent
classification is a 3-line taxonomy, plans come from learned playbooks, and
the critic is mechanical — the LLM is used where generative text is required,
never for memory or verification.

## Trade-offs (decisions, not oversights)

1. **No vector database.** ~40 documents with curated summaries: keyword +
   graph traversal wins on cost, determinism, and debuggability. Revisit when
   retrieval misses are demonstrated.
2. **JSON files, not SQLite/Postgres.** Data volumes are small; restart-safe
   format is plain JSON. The product's student data migrates to Supabase
   separately (AGENTS.md) — the intel layer's own stores are independent.
3. **No fine-tuning, no weight updates.** The system "learns" by writing
   provenance-carrying artifacts (episodic runs → procedural playbook
   patches → semantic facts + graph nodes). Documented, reviewable, reversible.
4. **Design intelligence is data, not code.** Design rules live as evaluated
   checklist items and graph nodes sourced from research — the same rules the
   critic enforces, so product quality and agent behavior share one source.
```
