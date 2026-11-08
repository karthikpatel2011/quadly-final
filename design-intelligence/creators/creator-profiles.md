# Creator Design Profiles

Evidence-based profiles. Each claim cites its research file; frame counts as noted in
`processing-status.md`. Profiles updated incrementally: Kole Jain and uxpeak complete
(videos 01–07 analyzed). Saptarshi Prakash (08–11) and Lets Uncover (12) pending —
their sections below are placeholders until their analyses land.

---

## Kole Jain — videos 01, 02, 03, 04, 05 (individual product designer)

**Teaching format.** Numbered "mistake lists" applied as live redemptions of one real
interface, held across several videos (demo product "Breakout" spans 02+03; LinkGuard in 01).
Quotable sharp diagnostics are the brand ("This card doesn't do anything", 01:3:29; "no one
cares about that", 01:4:16).

### Recurring visual characteristics
- Dark, near-black surfaces with a single brand accent; color reserved for data & actions
  (01 L01-2; 04: 60/30/10 accent caps, "neutral balance").
- State colors as one-dimensional ramps: hover = lighter, press = darker, disabled =
  desaturated (video-04 L04-8); dark mode is a re-light, not an inversion (01 L01-2; 04).
- Monospace for identifiers/URLs; sans elsewhere (01 L01-5); one sans-serif family per
  product, display sizes tightened −2/−3% (02 L02-5).
- Phosphor-class icons; icons need no color (04); icon line-height matched to text (02).
- Slides teach with exact tool artifacts: Figma shadow values (X0 Y3 Blur30 #D3D3D3, 05),
  contrast pills (2.34:1 Fail / 4.05:1 Pass, 04), annotated color wheels (04).

### Preferred layout patterns
- Dashboard architecture: grouped left sidebar (Platform/Organization/Account), one account
  card, overflow menus in rows (01 L01-4/5). Sidebar is task-relevant; global stats never
  live in the rail (01).
- Settings pages tabbed per concern (Usage/Billing/Account) with room to grow (01 L01-7).
- Pricing: 3–4 plans max, price as hero, discount + next-tier deltas explicit (01 L01-8).
- 4/8-pt rhythm; 32px section cadence, 24px dashboard cap, 2:1 button paddings (02).

### Workflow / decision patterns
- Diagnosis before pixels: lists failures against a named "AI tell" antipattern, then fixes in
  impact order: icons → color → layout/IA → components → flows → marketing (01 chapter order).
- Plan flows before drawing (05: "flow planning before pixels"); design state matrices first
  (02/05: state-first thinking, missing states = amateur tell).
- Quantified rules over vibes: tracking −2/−3%, scale caps, radius tokens (10px small
  components), grid+auto-layout spacing (02/05).

### Strongest distinctive techniques
- "BASIC vs PRODUCT" reformulation: same chart, semantic series colors, dark surface (01 t00m1m10).
- Skewed real-product cards as hero graphics; feature sections built from actual app screens (01 L01-10).
- Playfulness as an explicit pre-decision dial with named anchors (corporate ↔ playful) before
  restyling (video-03); one motion effect per surface (03).
- Word-widgets inside headlines (03), themed 404s (03), delight-only motion (03).

### Recurring principles (explicit)
1. Never let AI choose colors or layout (01).
2. One icon family, professional only (01; 05 icon audit: presence/family/labeling/zoning).
3. Show data once, where the decision happens (01).
4. Color has to mean something; neutral balance wins (01/04).
5. Design every state before shipping (02/05).
6. Density from context, not clutter (03); delete redundant elements (05).

### Where his advice is bounded (fail modes he names / we mark)
- Dark-surface recipes don't transfer 1:1 to light themes (04 says adapt, not copy).
- Playful motion breaks corporate contexts (03's dial is the guardrail).
- [interp] His SaaS vocabulary is the Dub/Resend/Linear school; he names Resend/Supabase as
  pricing references (01) but not Dub.

---

## uxpeak — videos 06, 07 (critique/redesign channel)

**Teaching format.** Real-app teardown → rebuild, with A/B/C/D comment-bait quizzes and
junior→staff proficiency ladders as the framing device. Proof is carried by annotation
callouts (contrast ratios, "Radius 4", masked-text hierarchy) and named witnesses
(Zomato, Uber Eats as pattern sources).

### Recurring visual characteristics
- Product-page realism over hero glamour: pick imagery for the catalog grid, not the hero (06).
- Trust adjacency: rating directly under title; computed total inside the CTA (06).
- Filter UI as progressive depth: sheet-over-results with live count ("Show 41 homes") →
  histogram inside the price control → per-option counts, median line, budget→price-limit
  projection (07's junior→staff ladder).

### Preferred layout patterns
- Mobile product pages: sticky title + sticky buy bar; data-derived quantity presets (0.5/1/2/3
  kg with per-size prices) (06).
- Decorative overlays must survive the worst asset — the "icon-scrim test with a bright
  pineapple" (06).
- Density rule: extra information justified only if it changes a decision in place (07).

### Workflow / decision patterns
- Ladder thinking: same component designed at junior/mid/senior/staff level to show what
  mastery adds (07).
- Strip mutable state out of titles ("1 kg" doesn't belong in a product title) (06).
- Capture un-narrated micro-refinements on the timeline (they verified copy rewrites and
  restyles the narrator never mentions — 06 gap log).

### Strongest distinctive techniques
- Quantified "decision-support" additions: "459 of 1,557", median markers, mortgage calculator
  converting deposit → monthly budget → price ceiling (07).
- Before/after as instrumented pairs, not vibes (annotation callouts with real numbers).

### Recurring principles (explicit)
1. Every added pixel must change a user decision (07).
2. Feedback must be immediate and counted (filter CTA shows result count) (07).
3. Resilience: design for your worst content, not your best (06 scrim test).
4. Hierarchy = adjacency of trust elements (06).

### Where the advice is bounded
- E-commerce/marketplace specific (mobile buy-flows, filters with big result sets).
- Ladder framing Risks implying senior = more density; their own rule says density ∝ decision impact.

---

## Saptarshi Prakash — videos 08, 09, 10, 11 (design educator; "Sapta")

**Teaching format.** Numbered rules/laws as structured mini-courses; every rule anchored to a
named psychology/Gestalt effect and demonstrated on a fictional product he designs for the
video (Pulse, LinkShort, Ember, Meridian, Nadia, Atlas, Forma, Wayfare, FlowDesk…). Warm
cream/brown editorial brand, mono-font annotation chips over mocks. Recurring thesis: "AI
gives you the average of what already exists" — craft judgment is the differentiator (09, 10).

### Recurring visual characteristics
- Editorial slide craft distinct from his demo products; talking-head insets in warm-lamp
  home-studio setups.
- Demos span light editorial (Wayfare serif hero, 10) to dark fintech dashboards (Meridian,
  09) and AI chat (Atlas, 09) — deliberately multi-pole, so rules transfer across themes.
- Annotation chips name fonts/values directly on mocks ("~650px", "~140 characters per line",
  "utility · readability", "personality + emphasis") — measurement as a teaching device.

### Preferred patterns / positions
- Color: 60-30-10 + figure-ground; role audit ("same color, three meanings = usability failure
  dressed as consistency"); 50–900 state ladder (600/700/800/200/300); dark mode as re-light
  with ONE warm figure; warm-advances z-axis. (09)
- Type: traffic-control framing; leading ramp 1.5→1.3→1.1; measure 45–75 (60–65 sweet);
  left-align body; pairing = contrast + shared DNA; "Inter is the plain gray t-shirt". (10)
- Layout laws applied to settings/pricing/instruction pages: chunking, serial positioning
  (context first, decision last), proximity. (10)
- AI-era positioning: agent-friendly UI (second reader = AI agents prefer structure), Figma
  MCP + Code Connect code↔design loop, prompt-writing as distribution-narrowing, AI asset
  consistency ("consistency is not a bonus, it is the work"). (11)

### Collaboration / product thinking (video 08, with Xinyue Zhou, Head of Design, Logitech MX)
- Hardware discipline transferred to digital: no tooling = no second draft → move validation
  earlier; decompose "point of no return" per layer (ID/CMF/firmware); design 3–5 years ahead
  of the advanced user's workflow without breaking familiarity; ship-fast lives on top of the
  shipped thing (free updates); telemetry refused on principle → community testing;
  "too many tooltips means you didn't design it well"; "good design becomes invisible";
  physical input/output (sound, haptics, force) treated as a user flow.
- ~100 failed physical prototypes per shipped form — iteration volume as the real method.

### Strongest distinctive techniques
- Effect-anchored review checklist (von Restorff, Stroop, H-K, simultaneous contrast, Hick,
  Miller, serial position, aesthetic-usability) usable verbatim in design review. (09/10)
- Learn-by-breaking: deliberately breaking UX laws in Figma to internalize them. (11)
- Honest hedging on science (Miller 7-vs-4 debate presented as debated, 10); shows the real
  WCAG spec page instead of paraphrasing (10).

### Where his advice is bounded
- Mini-course rules target beginners→intermediate; the "law" artifacts contain slide typos
  (e.g., "#1DF4C4" hover hex, 09; "percieve", 10) — values should be re-derived, not copied.
- Video 08 is advice/interview, not visual teaching; enforce its lessons as product strategy,
  not patterns.

## Lets Uncover (instructor: Ali Hassan) — video 12, the 3h08m full course (Hindi)

**Teaching format.** Strict vocabulary-first ladder: definitions → tool → principles → laws →
process → craft → systems → full clone. Hindi lecture over ENGLISH slides (slides citable
directly), constant classroom-style check-ins ("gutter — exactly, bravo"), famous-product
induction for every law (Google 1998-vs-2020 for Hick's Law), analogy-first (wireframe = house
map, signals = feedback). Verified course map: hour 1 = UI/UX definitions, Figma walkthrough,
10 UI principles + 5 UX laws; hour 2 = 6 more UX laws (Jakob, Similarity, Miller, Pareto,
Proximity, Tesler), 7-stage UI process, grid systems, color deck, auto layout, button/card
craft, responsive build; hour 3 = components/variants/properties, variables+modes as tokens,
design-system sheet, 1:1 landing clone, prototype dissolves. **No portfolio/career/freelance
content anywhere** (negative finding verified).

### Recurring characteristics
- Teach the math, not the taste: "100 screens change from one place" design-system sizing rule;
  named type styles (Heading/118px, Paragraph/20px); 4 named color roles (Primary/Secondary/
  Accent/Gray) before any screen work.
- Craft rules with exact values: tinted drop shadows, "no full black — use dark gray" (1:47:29),
  "hug is a best practice" (1:59:13), fixed 70px top spacing in the clone, negative-gap canvas
  stacking, absolute-position + constraints for floating icons.
- Free-tool ethics: refuses the reference's paid font; all imagery via credited Unsplash plugin.
- Ends on a practice sermon (skill = deliberate repetition), then self-promo for a separate
  course (excluded from lessons).

### Strongest distinctive techniques
- Variables/modes taught as tokens-in-practice: variable-bound fills/gaps, scoping, Mode 1/2
  theming, 40-button mass recolor verified on frame.
- Clone-with-judgment: measure with rulers but "we can't follow same-to-same" — and the
  documented fail case: it imported the reference's "Sevices" typo unflagged.
- Wireframe-to-UI discipline: 12-col grid + line lattice before styling; on/off grid checks
  on real sites.

### Where the course is bounded
- Beginner-calibrated: fixes values (118px heading) that are product-specific, not laws.
- Slides contain typos/uncertain attributions (speaker name discrepancy noted in part C gaps).



---

# Phase 2 creators (videos 13–24)

## Self-Made Web Designer — videos 14, 15, 16, 17, 18, 19, 23 (web designer; 7 videos)

**Teaching format.** Yellow/black chip slide grammar; fundamentals nuggets (14), client-process
(15, 19: mood board → stylescape → skip wireframes when builder makes layout cheap → shitty
first draft → 2 revision rounds × 48h feedback), and two dense layout libraries (17, 23) built
on a free Figma " Layout Library" organized by COLUMN COUNT.

- **Style taxonomy** (16): six named archetypes — Jobs (subtraction = future), Huang (boxed
  function-over-form grids), Barrymore (rounded + warm palette subsidizing weak photography),
  Zendaya (Swiss/modular editorial), Abloh ("the point is contrast, not bigness"), Nolan
  (wow via WebGL/Spline). Style selection is client-signal matching. (16: 48 frames)
- **Layout taxonomy** (17/23): 1 col (one message/CTA variants) → 2 col (message+evidence;
  "looks like 3 but is 2" — alignment defines columns) → 3 col (co-equal ideas; diagonal
  main-character, oversized-initial cards, one saturated focal tile in bento) → 4 col
  (catalogs; unfilled grids as whitespace; design for the longest entry; 4→2 mobile collapse
  when images decorative) → 5–6 col (utility only; scrims on image tiles; nested 4×3 grids;
  ceiling: "hardly ever above six columns").
- **Skepticism**: explicitly debunks the F-pattern as "bogus" (14). Conversion-over-pretty
  ("sales plummeted" story, transcript-only).
- Distinctive: hard limits everywhere (2 typefaces, 2 revision rounds, 48h windows, 6 styles).

## Mobbin — videos 13, 20 (pattern-research channel; quantified)

**Format.** "I studied N screens" data-backed pattern reports with stat slides (verified on
frame). First MEASURED source in this library.
- Dashboards (2,108 screens / 536 apps): charts in 45.6% of dashboard apps; 19% make the
  dashboard the home screen; AI/Business/CRM get ~2× saves+exports (avg 293); named winners:
  insights-beside-charts (Faith), recaps/briefs (Origin, Runna), one deliberate visual device
  (Shopify globe, Front heatmap, Cake cake-donut), game empty-state (Mercury), coined metrics
  (Duolingo streaks, Oura, Apple rings), story-format data (Opal). (research/video-13.md)
- Onboarding (1,460 flows / 986 apps): avg 25 screens; 7 of 10 longest are finance;
  Verification 43.9% · Personalization 23.4% (AI apps 7%) · Paywall 22% · Tutorial 7.9%;
  web onboarding 21% shorter than iOS; A/B wins: Headspace multi-select goals +10% trials,
  Dollar Shave Club conversational copy +5% subs, Grammarly quiz-tailored pricing ~+20%
  upgrades, Mural 6-step checklist +10% 1-wk retention, Houzz split form +15%;
  Duolingo ≈ 60 screens before sign-up. Framework: Signup → Setup → Aha → Habit. (video-20.md)

## Tim Gabe — video 24 (design educator; level ladder)

4 levels with concrete deltas: Beginner (6/6 fails: wordy copy, inverted 60-30-10, 6 sizes/4
weights, off-grid 11/25px) → Junior (ChatGPT copy rewrite technique; over-correction: "45
layers of shadows", dulled color) → Mid (single-hue tint/shade ramps; measured 32px/16px
on-grid) → Senior ("communicate with less" — delete words the layout already says; ONE reused
emphasis motif binding related parts; red rationed away from the CTA; mono numerals). Named
rules: 60-30-10, 8pt grid (25→24, 11→12), font diet 4 sizes/2 weights — conflicts with
Saptarshi's 6–8 size cap (logged in comparison). Hidden mistake: static-image fixation ("treat
UI more like a movie").

## AI LABS — video 22 (AI-design tooling reviews)

Reviews six Claude-skill collections. The transferable pattern: clarify → ground in references
→ generate → score → fix flags. Includes scoring rubrics (Overall 7.6/10 across named
dimensions), style-recipe files (linear.md, headspace…), pre-delivery checklists, regression
-review vs git (caught a clipped date select), pixel-extracted design.json (colors/radius/gap
instead of prose summaries), and "a landing page isn't a homepage — one job, one action."

## College Wallah — video 21 (Hindi educator) — PARTIAL (video blocked; transcript verified)

60-30-10 with terminology warning (dominant ≠ primary color) + surface-color-count caveat;
HSL shade arithmetic (freeze hue, lightness ±10 units, 5-unit subtle steps; flagged "not the
professional way"); color psychology as feedback contract (green success / yellow warning /
red irreversible). Video itself: YouTube bot blocked all download attempts (log in
research/video-21.md) — transcript-only evidence.
