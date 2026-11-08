# Design Evaluation Checklist (v1 — extends as more sources are verified)

Sources feeding v1: video-01 (26 frames), video-02 (34 frames), video-03 (27 frames) — all Kole Jain.
Apply to every rendered page during practice/review. Score each item pass/fail/n-a; fix failures
by impact order before re-rendering. `policy` = product-type decision, not absolute law.

## 1. Visual hierarchy
- [ ] One unmistakable primary action per screen (`transcript 2:22` — single green CTA)
- [ ] Reading line in rows/lists runs identity → status → meta → actions (`t00m1m57`)
- [ ] Emphasis by contrast in ≥2 dimensions (size + weight/color), not size alone (video-02 hierarchy-by-contrast)
- [ ] No repeated identical modules across screens; each surface shows only its relevant data (L01-3)
- [ ] Radial/layered emphasis for showcases: hero item visibly louder than peers (video-03 radial hierarchy)

## 2. Typography
- [ ] One sans-serif family across the product (video-02; Kole's rotation: DM Sans, Plus Jakarta Sans, Axiforma, Montserrat, SF Pro, Unbounded, Geist — pick ONE)
- [ ] Display/headline sizes tracked tighter (−2% to −3% letter-spacing) `transcript video-02`
- [ ] Type scale capped (≈6–8 sizes), not per-element invention (video-02 capped scales)
- [ ] Monospace for identifiers/URLs/data strings (video-01 link rows) `policy`
- [ ] Line-height consistent with icon sizing when icons sit inline (video-02 icon=line-height)
- [ ] Contrast ratio of body text vs surface ≥ 4.5:1 (to be re-verified against Saptarshi video-10 when done)

## 3. Spacing & rhythm
- [ ] Uniform spacing unit (4/8-pt base; Kole: 32px section rhythm, 24px dashboard cadence — video-02)
- [ ] Consistent paddings per component class (Kole 2:1 button padding rule, video-02)
- [ ] Section spacing > component spacing > intra-component spacing (three clear tiers)
- [ ] No orphaned/cramped edges; gutters aligned to grid columns (video-02 grids-as-guidelines)

## 4. Color & surfaces
- [ ] Color = meaning (brand accent for actions, semantic series for data), never decoration (L01-2, video-02 primary ramp)
- [ ] Single accent family + neutrals scale (bg → card → border); semantic colors reserved (2XX/3XX/4XX pattern, `t00m1m10`)
- [ ] Dark mode re-lights the palette (does not invert at equal luminance) (video-02) `policy`
- [ ] Soft, low-opacity shadows; no hard shadows on dark surfaces (video-02)
- [ ] Contrast for all text and icon glyphs vs their surface (video-04/09 checks pending)

## 5. Components & consistency
- [ ] Icon family single (Phosphor/Lucide class), no emoji in product UI (L01-1)
- [ ] Same radius family across cards/buttons/inputs (measure, don't eyeball)
- [ ] Buttons have visible states: default/hover/active/focus/disabled/loading (video-02 state matrix minimums)
- [ ] Destructive/outlier actions tucked in overflow menus, not in-line (L01-5)
- [ ] Dead cards removed — every module is interactive or carries critical info (L01-7)
- [ ] Empty/loading/error states designed, not just the happy path (video-02 state-first thinking)
- [ ] Confirmation for destructive actions (video-02 confirmation micro-interaction)

## 6. Forms & flows
- [ ] Container matches content volume; sparse forms live in modal/panel (L01-6)
- [ ] Advanced options collapsed behind progressive disclosure, with hint lines (L01-6)
- [ ] Field count = minimum needed for the task; missing essential fields = failure (L01-6 added domain/description)
- [ ] Inline validation + clear primary CTA verb describing the outcome ("Generate Secure Link")

## 7. Landing pages
- [ ] Presentation over complexity: real product graphics (screenshots derived from app) instead of icon-card filler (L01-10)
- [ ] Hero: short headline (≤2 lines), one input or CTA action, product visuals in motion or context (video-01 hero, video-03 word-widgets)
- [ ] Trust signals above the fold (quality standard "even subconsciously", L01-10)
- [ ] Pricing: fewer plans, price as hero text, discount + next-tier deltas visible (L01-8) `policy`

## 8. Motion & personality
- [ ] Motion has one job per surface (entrance/feedback/delight — never stacking all three) (video-03 one-effect rule)
- [ ] Delight only where suits the "playfulness dial" position set for the product (video-03)
- [ ] Character-true transitions (motion direction matches content meaning) (video-03)
- [ ] Respects reduced-motion (accessibility baseline; external knowledge, marked `outside-source`)

## 9. Accessibility & states (baseline; extend after video-09/10/12)
- [ ] Keyboard focus visible on all interactive elements (external baseline)
- [ ] 404/error pages themed but still functional (video-03 404 rule)
- [ ] Success moments acknowledged with dedicated micro-interaction (video-02)

## 10. Coherence
- [ ] Design passes the "AI-mush" smell test: no duplicated modules, no rainbow accents, no dead cards (L01-2/3/7)
- [ ] Every page answers: what decision does a user make here, and is that path the shortest?

## Scoring & revision rule
Count failures, fix in impact order (hierarchy → layout → color → type → components → micro),
re-render, re-check. Record before/after screenshots + what changed in
`evaluations/design-test-results.md`.
