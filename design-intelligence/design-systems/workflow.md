# Workflow — repeatable process for any new interface request

Sources: synthesis of all analyzed creators' demonstrated workflows (Kole's diagnose-then-fix
order, uxpeak's decision-first ladders, Saptarshi's rules-as-checklists). This file is the
operating procedure the mission's Phase Nine requires.

## The 10-step procedure (run on every new request)

1. **Read the intelligence index**: `processing-status.md` → `decision-framework.md` → relevant
   `patterns/*.md` + `principles/*.md`. Check existing project rules (e.g. repo AGENTS.md,
   DESIGN.md, tokens.css) FIRST and respect them.
2. **Retrieve matched lessons**: pull every `[V]` rule that applies to the surface type + brief.
   Note `[CS]` techniques only when they fit the personality dial.
3. **Understand the brief**: product, audience, data shapes, constraints, existing system. Write
   a 5-line brief summary into the project record.
4. **Propose a direction**: personality dial position, surface strategy (dark/light), type
   strategy (neutral vs character face), accent plan. Get user sign-off only when the direction
   is a real fork (per AGENTS.md norms: reversible defaults proceed without asking).
5. **Tokens first**: derive palette (with state ladder 50–900), type ramp (size+leading pairs),
   spacing tiers, radius family, shadow recipe — before components.
6. **Implement**: semantic HTML, tokens-driven CSS, state-complete components (empty/loading/
   error/success included from the start).
7. **Render**: build + serve or static open; screenshot desktop (1440/1280) AND mobile (390)
   with Playwright; capture interaction states where feasible.
8. **Evaluate**: apply `evaluations/checklist.md` top-to-bottom; record pass/fail per item in
   `evaluations/design-test-results.md`.
9. **Revise by impact order**: hierarchy → layout/spacing → color → typography → components →
   motion. Re-render, re-evaluate. Loop until no high-impact failures.
10. **Record**: append what worked/failed + new verified lessons to the project record and, if
    genuinely new knowledge, to the relevant principle file with source `practice`.

## Iteration loop (per design iteration)

OBSERVE (screenshots) → ANALYZE (checklist + failures list) → PLAN (ordered fixes) → IMPLEMENT →
RENDER → EVALUATE → REVISE → RECORD. Never modify project files repeatedly without re-rendering.

## Anti-goals (mission-mandated)

- No generic AI SaaS look (the "average"): no default blue/purple-gradient-on-slate without a
  reason, no repetitive card grids, no glassmorphism or trendy fonts without justification.
- No pixel-perfect claims without actual side-by-side comparison.
- Never force one house style onto all projects; the framework defaults adjust per brief.
