# PRODUCT_DESIGN_PLAYBOOK — evidence-linked workflow, rubric, and checklist

Merged from the five Product Design Groups (B1–B5), cross-validated against the
prior design-intelligence corpus (24 videos from earlier missions, see
`design-intelligence/`). Every rule carries provenance. This is a working
document: extend it only with evidence-backed findings.

## 1. What product design IS (verified anchor)

> "Blend user needs with business goals to help brands make consistently
> successful products." — Interaction Design Foundation (independently
> verified from the B2 frame at 2:12; B1 paraphrases: business strategy +
> visual + UX design).

A product designer is NOT a project manager or analyst. Their role = design
execution of the above blend (B1). The boundary matters for agent design:
outputs should be tagged design-execution vs strategy (B1 opérationnalisation).

## 2. Workflow (from B1 + B2 + A sources)

Define user needs + business goals visual design system (tokens, type, color) —
  cross-references: `design-intelligence/principles/typography.md`,
  `color-and-contrast.md`, `design-systems/decision-framework.md`
Build the design
Verify with real user data
Iterate (from B3: cohort curves, from B4: retention mechanisms).

### The workflow's evaluation rubric

| Check | How | Source |
|---|---|---|
| Affordance audit | look contradicts behavior? | B2 (Norman door) |
| Dual-objective gate | user win + business cost stated? | B1 (B2 blend definition) |
| Funnel drop-off | per-step % and worst-step identified? | B1 |
| Rationale-first | every element has a machine-readable "why"? | B2 |
| 60-30-10 proportion | surface counted, accent rationed? | video-21/24/09 |
| Contrast floors | 4.5:1 text, 3:1 UI, real surface? | video-09/10 |
| Hierarchy | one primary action, explicit reading order? | video-10/01 |
| States complete | hover/focus/disabled/loading/empty/error? | video-02/09 |
| Retention loop | daily task → streak → squad cycle? | B3/B4/B5 |
| Density | every pixel changes a decision? | video-07 |

## 3. Retention playbook (Group B's strongest contribution )

### B3 (YC, David Lieb): the measurement system
- Retention = cohort × action × time-period (all three must be stated).
- **Flatness** of daily cohort curves is the ONLY thing that matters — it
  determines whether users can accumulate.
- Four self-fooling modes: too-wide period, too-easy "active" action,
  single-point claims, blind trust in analytics tools.
- Five levers: product, better-fit users, slicing, onboarding, network effects.

### B4 (Wyatt Feaster): the mechanisms (presenter claims, unverified method)
1. Extreme personalization
2. Aha-moment compression
3. Habit loops (daily rituals, streaks, share loops)
4. Community (leaderboards, feeling heard)
5. Switching costs (highest-leverage claim)

### B5 (Hormozi): the milestone map + anti-overwhelm
- Churn is highest in months 1–3: month 1 = activation, day 90 = outcome,
  month 6 = peer connections.
- Overwhelm = #1 churn driver: cut content, not features ("value per second,
  not seconds of value").
- Community seeds from "10 true regulars" plus the "one real friend" hack.

### The design hook (mission §5.D, operative)

Quadly's mapping (APPLIES_TO verified):
- Daily tasks → habit loop + activation milestone
- Streaks → loss-framing + switching cost (audit: is the action definition honest?)
- Squads → community + peer pressure (nudges are capped and quiet-hours safe)
- Dashboard → the flat cohort curve is the product's success metric

## 4. The design-evaluation floor (baseline, implemented)

Same items as `intel/src/tools.js` DESIGN_BASELINE — the critic can check
them mechanically. The full extended checklist is in
`design-intelligence/evaluations/checklist.md` (33 items from 24 videos).

## 5. Ethics guard (from the prior-sprint ethics rules)

A1 celebrates compulsion loops; A4 uses fake-urgency framing. The rules
above set a policy gate: dark-pattern mechanisms (variable-reward without
value, fake progress, false scarcity) are NEVER implemented as agent rules
— they are recorded as `ethics.*` nodes with a REQUIRES_VALIDATION edge for
a user decision.
