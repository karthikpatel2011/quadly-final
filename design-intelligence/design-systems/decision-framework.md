# UI/UX Decision Framework (v1 — knowledge-based defaults, not universal laws)

How to use: for each axis, start from the default, then adjust by the stated triggers. Every rule
carries its evidence class: **[V]** verified in sources · **[RP]** recurring pattern · **[CS]**
creator-specific · **[PD]** project-specific decision (must be justified per brief) · **[H]**
hypothesis. Sources abbreviated S01–S12 = research/video-NN.md.

## 0. Before any pixels
1. Read the brief: product, audience, surface list, data shapes. (workflow)
2. Set the **personality dial** (corporate ↔ playful) explicitly — Kole's pre-decision (S03). [CS]
3. List the decisions users must make per page; every element either serves one or dies. [V: S07/S01]

## 1. Typography
- Default: ONE sans family; weights+sizes carry hierarchy; measure 60–65ch; leading ramp
  1.5→1.3→1.1 as size rises; display tracking −2/−3%. [V: S10, S02]
- Identity trigger: product sells taste/personality → add ONE contrast face (x-height match);
  data-tool → Inter-class neutrality is correct, distinguish by rhythm not novelty. [CS: S10]
- Data values/IDs → monospace. [V: S01]

## 2. Color
- Default: neutral-dominant surface + ONE accent + semantic set; 60/30/10; state ladder 50–900
  (600/700/800/200/300). [V: S09, S04, S01]
- Dark theme default: re-light (new palette pass), desaturate warm accents, ONE warm figure (the
  CTA). [V: S09, S04, S01]
- Triggers: brand IS semantic-adjacent (red brand) → shift error hue deeper + icon [V: S09];
  data-heavy → categorical series colors named by meaning (2XX/3XX/4XX style) [RP: S01].
- Never: color-only encoding; text/surface same brightness+saturation; color to fix boredom. [V: S09]

## 3. Spacing & layout grid
- Default: 4/8-pt base; three tiers (section > component > intra); Kole cadence 32px sections /
  24px dashboard rows, 2:1 button padding as starting recipes. [RP: S02] [PD: adapt to existing
  design system if present]
- Proximity law: gap sizes must encode relationships (heading↔paragraph, label↔input). [V: S10]
- Rule for "AI mush" layouts: rebuild around the reading order, not the component count. [V: S01/S10]

## 4. Component geometry
- One radius family (Kole: 10px small-component + tokens). [CS: S05]
- Soft low-opacity shadows only; dark surfaces get borders, not hard shadows. [RP: S02, S09]
- Buttons: state-complete (default/hover/active/focus/disabled/loading) BEFORE ship. [V: S02]
- Rows: ⋮ overflow for rare/destructive actions; counts right-aligned. [V: S01]

## 5. Motion
- One job per surface; direction matches content meaning; delight ∝ personality dial. [V: S03]
- Marketing hero may animate product graphics (skewed real cards) if it stays legible. [V: S01][H2]
- Always: reduced-motion fallback. [`outside`]

## 6. Responsive
- Lock measure, flex margins (S10); mobile commerce: sticky title + buy bar (S06); breakpoints
  are project-specific [PD]; test ≥ 1 narrow + 1 wide before calling done (checklist).

## 7. Interaction states & system completeness
- Empty, loading, error, success designed per surface; destructive confirmations with consequence
  text + semantic red; filters give counted feedback; success gets a dedicated moment. [V: S02, S09, S07]

## 8. Accessibility
- Floors: WCAG AA 4.5:1 / 3:1 incl. UI components; multi-dial emphasis; keyboard focus visible;
  contrast checked on the real surface. [V: S09, S10] Perfect AAA everywhere is NOT the goal.
  [V: S09 "minimums, not targets"]

## 9. Design-system consistency
- Tokens for color (with state ladders), type ramp, spacing, radius, shadows, z-index. Every new
  token earns admission by solving an unsolved problem. [V: S09]
- Page-level dedup rule: a module may exist once per surface and once per system per concern. [V: S01]

## 10. Content, landing conversion & page structure
- Page skeleton: pick column count ALIGNED to content quantity (1=one message/CTA, 2=message+evidence,
  3=co-equal ideas, 4=catalogs, 5–6=utility; ceiling ~6). Columns are defined by alignment, not
  boxes. [V: S17/S23]
- Landing = ONE job one action; a landing page is not a homepage. [V: S22 + S01 hero rule]
- Gridded dynamic content: design for the longest entry; collapse 4→2 on mobile only when
  images are decorative. [V: S17]
- Presentation > complexity; real product imagery; trust adjacent to claim; price = serial anchor;
  discount/delta transparency; ≤2-line headlines; one primary action. [V: S01, S06, S10]

## 11. Onboarding & activation (measured defaults, S20)
- Defer verification; multi-select setup questions; quiz-tailored pricing when data exists;
  split forms at commitment boundaries; skip tutorials unless Setup data demands one; empty
  states seeded, not blank. [V: S20 measured]
- Dashboards need actions (export/save), not just display. [V: S13]

## Conflict resolution order (when rules collide)
product constraints > decision-impact > creator-technique fit > aesthetic preference.
Record the override in `projects/project-design-records.md`.
