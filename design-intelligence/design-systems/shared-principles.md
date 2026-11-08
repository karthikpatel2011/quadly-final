# Shared design principles (cross-creator synthesis)

Status: v2 — 24 videos across 9 creators analyzed (phase 1: 12 videos; phase 2: 12 more). Classification: **[S1]** supported by 2+ independent creators ·
**[S2]** single-creator strong claim · **[CF]** conflict to resolve per project · **[H]** needs testing.

## Tier 1 — asserted independently by 3 of 4 creators (strongest)

1. **AI output is the average; craft judgment is the designer's job** — Kole: "never let an AI
   choose your colors/layout" (01); Saptarshi: "AI doesn't pick bad colors. It picks average
   colors" (09), "AI gives you the average" (10); uxpeak's whole format is instrumented judgment
   over templates. → In practice: audit every generated choice for a REASON, replace the
   unreasoned ones.
2. **Color = meaning, rationed** — Kole 60/30/10 + semantic slots + "never decoration" (04/01);
   Saptarshi 60-30-10 + role audit + "every new color must earn its place" (09).
   Convergent to: neutral-dominant surface, one rationed accent, semantic colors reserved.
3. **Hierarchy is explicit, not decorative** — Saptarshi "typography is traffic control" (10);
   uxpeak annotation-verified hierarchy ladders (06/07); Kole's price-vs-name swap (01).
4. **States are part of the design, not follow-up** — Kole state-first matrix + "missing states
   are the amateur tell" (02/05); Saptarshi 50–900 state ladder (09); uxpeak counted feedback
   CTAs (07).

## Tier 2 — supported by 2 creators

5. **Density must serve decisions** — uxpeak "extra density justified only when it changes a
   decision in place" (07); Kole's delete-dead-modules and KPI-dedup (01).
6. **Feedback immediacy** — uxpeak counted CTAs (07); Kole interactive feedback contract
   (press/badge/loading, 05); Saptarshi aesthetic-usability framing of stateful buttons (09).
7. **Dark mode = re-light, not invert** — Kole (04) + Saptarshi (09) with near-identical recipes
   (desaturate warm, adjust S/B, single warm figure).
8. **Real-product graphics beat icons in marketing** — Kole (01); uxpeak trust-adjacency/real
   imagery in product pages (06).
9. **Show data once, where the decision happens** — Kole KPI dedup (01); Saptarshi role audit
   "one color doing three jobs = failure" (09) — same principle applied to color and modules.
10. **Proximity/spacing declares relationships** — Saptarshi "layout is lying to the user" (10);
    Kole spacing rhythm + auto-layout discipline (02/05).

## Tier 3 — single-creator signatures (use deliberately, not universally)

- **uxpeak decision-support depth**: histograms inside controls, median markers, budget→limit
  projection (07). Highest-craft filter patterns in the library.
- **Kole personality dial**: corporate↔playful pre-decision, word-widgets, themed 404 (03).
- **Saptarshi psychology anchoring**: named effect per rule (von Restorff, Stroop, H-K, M… );
  AI-confidence color semantics proposal (09) [H].

## Tier 1 additions from phase 2 (now 3+ independent sources each)

11. **60-30-10 proportion** — now asserted by Kole (04), Saptarshi (09), Tim Gabe (24, as a
    named graded rule), College Wallah (21, with the dominant≠primary caveat), SMWD (14). The
    library's most corroborated single rule.
12. **Semantic red only for irreversible/error + never decoration** — S01/S04, S09, S21
    (translated), S24 (red rationed away from CTAs by seniors).
13. **Anti ghost-buttons / one clear CTA contrast** — S14, S17 (Enlighten case), S01.
14. **Grounding before generation + score→fix loops for AI output** — S09/S10 ("AI gives the
    average"), S22 (score 7.6/10 → fix flags), S24 (grading ladders).

## Conflicts & tensions found (preserve, don't average)

- **Price placement**: Saptarshi's screen shows price as bottom anchor while speech says
  "visible early" (10 L10-6 tension logged); Kole enlarges price mid-card (01). Resolution:
  price must be the serial-position anchor (first OR last, never middle); exact spot = brief's
  decision point.
- **Complexity posture**: Kole simplifies rows aggressively (01) vs uxpeak ADDS density at staff
  level (07). Resolution: density follows decision impact, not minimalism dogma — start at Kole's
  baseline, add uxpeak's instruments when decisions are data-dependent.
- **Center alignment**: banned for body (10) but required for ceremonial moments; also Saptarshi's
  own pricing cards center text (09/10 slides) — alignment rule is per-element-type, not global.

- **NEW (24 vs 10) type-scale diet**: Tim Gabe's senior rule = 4 sizes / 2 weights while
  Saptarshi allows a 6–8 size capped scale. Resolution: 4/2 floor for product UI density,
  6–8 ceiling for marketing/editorial surfaces; measure the surface, pick the diet.
- **NEW (14 vs convention) F-pattern**: SMWD debunks F-pattern reading as "bogus"; nothing in
  the library asserts it. Treat F-pattern claims as `outside-source` folklore unless measured.

## Untested hypotheses to validate in practice phase

- H1: AI-confidence opacity semantics read correctly without a legend (09 L09-13).
- H2: skewed-motion product cards improve measured trust vs static screenshots (01 hero claim).
- H3: Kole's 32px section / 24px dashboard cadence generalizes beyond his demo products (02).

- H6 (from S20, measured elsewhere but ours to apply): multi-select setup questions beat
  free-text; quiz-tailored pricing is the biggest single onboarding lever in the library.
- H7 (S22): rubric-scored self-critique (score → fix flags) beats unbounded iteration.
