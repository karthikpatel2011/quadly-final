# Components & Design Systems — consolidated principles

Sources: S01 (dashboard components), S02 (states matrix), S04 (state ramps), S05 (radius tokens,
tightened shadows), S09 (state ladder), S12B/C (button anatomy, component properties, variables).
Class key: **[G]** · **[R]** · **[C]**.

## Component rules
- **State-complete before ship**: default/hover/active/focus/disabled/loading (+empty/error per
  surface). Missing states = the amateur tell. [G]
- **State ladder tokens**: brand colors ship as 50–900 scales; map 600 default / 700 hover /
  800 press / 200 disabled / 300 focus-ring. [G]
- **Geometry tokens**: one radius family (Kole 10px small class); buttons follow padding ratio
  recipes; same radius buttons-inputs-cards unless scale demands variants. [R]
- **Shadows**: soft, low-opacity, tinted toward surface hue; dark surfaces use borders and
  elevation-by-lightness instead of hard shadows; "no full black — use dark gray". [R]
- **Buttons**: verb+outcome labels ("Generate Secure Link", "Show 41 homes"); computed totals
  inside the CTA when known; destructive = semantic red + consequence text + confirm; never
  brand-colored destructive actions. [G]
- **Rows**: collapse rare/destructive actions into ⋮ overflow; chips→icons when repeated;
  monospace identifiers. [C: S01]
- **Dead modules banned**: a card that does nothing goes. Every component earns interactivity
  or critical information. [G]
- **Progressive disclosure**: advanced options collapsed with one-line hint + escape ("Configure");
  feature-chips for exclusive add-ons. [G]

## System rules
- **Design-system sheet first** (course flow): named color roles (Primary/Secondary/Accent/Gray),
  named type styles, icon set, before screens. [C→R: S12C]
- **Figma→code token mapping**: components+variants+properties = the design twin of design
  tokens; variables bound to fills/gaps; modes = theme variants; "100 screens change from one
  place" (40-button recolor verified). [C: S12C]
- **Token admission test**: every new token solves a problem the set can't. [G]
- **Icon system**: single family (Phosphor/Lucide class), uniform stroke, tinted via tokens,
  no emoji in product UI; brand icons only for external entities (sources, browsers). [G]
