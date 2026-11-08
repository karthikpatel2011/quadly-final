# Spacing & Layout — consolidated principles

Sources: S10 (proximity law), S02/S05 (Kole rhythm/auto-layout), S12A/B (course: grids, 12-col,
auto layout, constraints). Class key: **[G]** general · **[R]** recurring · **[C]** creator-specific.

## Rules
- **Proximity declares relationships**: heading→its paragraph, label→input, price→CTA. Wrong gaps
  "lie to the user". Define paired tokens (heading-in-gap < heading-out-gap). [G]
- **Three spacing tiers**: section > component > intra-component; keep each tier consistent
  across screens. Kole recipes: 32px section cadence, 24px dashboard rows, 2:1 button padding. [R]
- **8-pt base grid** as default; course teaches 12-column Figma grid styles with gutters and
  on/off verification on real sites. [G]
- **Measure-locked layout**: set prose width 60–65ch (~640px @16), let margins flex. [G]
- **Auto layout discipline**: hug for content-shaped elements ("hug is a best practice"), fill
  for stretchers, fixed only for pixel intents; wrap for chip rows; negative-gap stacks for
  overlapping canvas collages; baseline align for mixed-type rows. [C→R: S12B]
- **Floating/overlapping art**: absolute position + pin constraints, never inside hug parents. [C: S12B/C]
- **Canvas stacking depth**: overlapping cards need explicit elevation system (borders on dark,
  soft tinted shadows on light). [R]
- Empty space is a component: Kole "we have a ton of space" → wrong-container signal (form
  moves to modal). [G]

## Cached failure modes
- Equidistant heading between paragraphs (S10 t00m3m18).
- Full-bleed 140ch paragraphs (S10 t00m10m02).
- Stat tiles living in the sidebar rail (S01 t00m1m17).
- Cards with 3+ always-visible actions (S01 t00m0m47).
