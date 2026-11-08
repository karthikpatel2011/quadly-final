# Research Notes — Video 09

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/l6LqaAs4hWs
- Title: "UI/UX Design Color Theory CRASH COURSE | Color Theory For Beginners | Saptarshi Prakash"
- Creator: Saptarshi Prakash (individual creator/educator; talks to camera in a home studio)
- Duration: 25:59 · Published: 2026-08-05 · Views: ~11.6k
- Classification: structured mini-course — "Rule 1 … Rule 8" ladder + theory basics + conclusion; sibling of video 10
  (the typography crash course; cross-referenced at 14:09: "You heard this in the typography video")
- Access: transcript (En auto-captions) + 35 frames viewed at 720p from full download (26 min, whole-file, ~56MB)
- Subject: color theory for UI/UX — proportion, color mechanics, harmonies, semantic meaning, contrast,
  perceptual context, palette limits, warm/cool depth, dark-mode color, and color-state systems

## Structure (chapters verified in metadata, converted to M:SS)

0:00 Rule 1 + Intro → 2:36 Color Theory Basics (wheel → 4 controls → color modes → harmonies) →
11:04 Rule 2 → 12:27 Rule 3 → 14:07 Rule 4 → 16:44 Rule 5 → 18:26 Rule 6 → 20:18 Rule 7 →
22:27 Rule 8 → 24:54 Conclusion → 25:51 Outro

8 rules: (1) 60-30-10, (2) every color needs a job, (3) don't fight meaning, (4) contrast is not
optional, (5) context changes everything, (6) limit your palette, (7) warm and cool create depth
(with dark-mode/von Restorff extension), (8) design for color states, not static color.

## Teaching format

Slide-based lecture with talking-head inset (two studio setups: desk with a round warm lamp, and a
sofa wall with framed prints). Explainer slides (cream cards on a gray grid-paper backdrop, chunky
dark display type) alternate with fictional-product demo UIs built by the creator as counterexamples
and examples: "Pulse" (deliberately oversaturated dashboard), "LinkShort" (generic AI-looking landing),
"Ember" (red-brand app with an error banner), "Meridian" (dark fintech dashboard), "Nadia" (light blue
dashboard), "Atlas" (AI chat). Most rules are anchored to a named perception/psychology effect.

## Lesson log

### L09-1 Rule 1 — 60-30-10: dominant / secondary / accent, grounded in figure-ground
- Problem: undifferentiated color use — accent shouting, no stable ground [transcript 0:49–1:02:
  if the accent takes 40% of the screen it "stops being the figure and starts competing with your
  ground"].
- Decision: 60% dominant (usually the background/neutral), 30% secondary (nav, cards, sections —
  "gives your design personality"), 10% accent (CTAs, notifications, active states — "the thing you
  want the user to notice") [0:03–0:26].
- Reasoning (explicit 0:27–1:09): it maps onto the Gestalt figure-ground principle — 60% is the
  "stage", 30% the "set design", 10% the "figure"; breaking the ratio collapses the layering.
- Evidence: `t00m00m20` (0:20) — phone mockup of a fitness app (purple header band, lavender
  surface, single orange CTA) beside three vertical proportion bars labeled 60% (lavender),
  30% (purple), 10% (orange).
- Implementation: pick the neutral base first; secondary = brand-adjacent surfaces; accent strictly
  rationed to the one action family.
- Effect: clear figure-ground hierarchy "works because it gives your brain a clear stage, a clear
  performer, and a clear supporting cast" (1:06–1:09).
- Fails: deliberately maximalist/art-directed surfaces (fashion, entertainment heroes).
- Transfer: any product UI or landing; treat accent as a currency spent on the primary action.

### L09-2 The "AI palette crisis" — AI picks average colors, and average is the failure mode
- Problem [1:37–2:00]: "Tools like Claude, V0, Lovable… produce the same handful of palettes, that
  blue to purple gradient, slate gray neutrals, Tailwind's default color scheme… fine is the
  problem… AI doesn't pick bad colors. It picks average colors because it was trained on the
  average of the web."
- Decision: treat generated palettes as a starting draft for deliberate replacement, not a choice to
  keep; the human edge over generators is knowing WHY a color works (conclusion 25:27–25:50).
- Evidence: `t00m01m47` (1:47) — the "LinkShort" landing shown while naming AI palette output: white
  hero, generic blue "Shorten" button, blue full-bleed section, gray logo wall — competent,
  inoffensive, forgettable.
- Reasoning (explicit 2:02–2:14): color, unlike typography, carries cultural meaning and contextual
  baggage; that is why the rules that follow target what holds up across contexts.
- Effect: reframes the skill as judgment over generation.
- Transfer: in AI-assisted projects, run a "who chose this color and why" audit on every hue before
  implementation.

### L09-3 Speak color precisely: hue / saturation / lightness(-brightness) / opacity have distinct jobs
- Problem: random tweaking; designers manipulating numbers without a mental model (3:28–3:43).
- Decision: separate the four controls — hue = color family; saturation = vivid-vs-muted ("as you
  reduce saturation the color moves closer to gray… softer, calmer, more restrained" 4:06–4:10);
  lightness/brightness = light/dark versions of one hue (a light blue as background, medium as
  button, dark as text — 4:51–4:56); opacity = blend-through, NOT a lighter color ("blue at 50%
  opacity will look different over white, black, yellow, or an image" 5:20–5:24).
- Evidence: `t00m04m25` (4:25) — the "Pulse" dashboard counterexample: saturated magenta/green/
  orange/purple KPI cards and nav chips, saturated 3-color bar chart — the visual for the rule that
  professional UIs use high saturation only for primary actions/alerts (4:12–4:21) and the
  "group chat where everyone has marked their messages urgent" analogy (4:25–4:27);
  `t00m05m10` (5:10) — the "opacity" slide: blue swatch row 100%→0% on checkerboard, axis
  "More Solid ↔ More Transparent", definition text stating opacity blends with whatever is behind it.
- Effect: saturation becomes a budget (vivid = attention) and opacity becomes a tool for overlays,
  disabled elements, separators (5:05–5:08).
- Fails: treating opacity as "the same color but lighter" in token systems — it changes with context.
- Transfer: define tokens with explicit saturation budget + true-alpha vs true-tint decisions.

### L09-4 Use the right color MODE for each task: HSB to choose, HEX to share, RGB is the machine's view
- Problem: designers dragging hex digits or RGB channels when exploring; "RGB explains how the screen
  constructs the color. It does not necessarily match how a designer thinks" (7:15–7:20).
- Decision: iterate in HSB (and know HSL's difference); communicate in hex. HSB is "sequential":
  pick hue → decide saturation character → adjust brightness; you can keep hue fixed and vary S/B to
  build related shades of one color (7:29–7:57). HSL's third axis behaves differently (0% lightness =
  black, 100% = white, strongest mid-way, 8:11–8:19). Hex = "an excellent address for a color. It's
  not particularly a good steering wheel" (8:58–9:02).
- Evidence: `t00m07m35` (7:35) — picker UI with H:240 / S:50 / B:78, #6363c7, S-field being edited —
  one-axis-at-a-time editing; `t00m08m20` (8:20) — picker at H:300 with S:0 showing #777777 and
  L:50 highlighted (saturation dropped → gray, lightness axis mid); `t00m06m10` (6:10) — thermometer
  showing 86.0°F, the slide's analogy for equivalent representations (30°C = 86°F = same temperature,
  6:05–6:10).
- Effect: palette exploration becomes parametric (fix hue, sweep S/B) instead of guesswork.
- Fails: perceptual extremes — even HSB sliders don't guarantee uniform lightness (no OKLCH here).
- Transfer: build tints/shades by locking H and stepping B/L; share exact values as hex.

### L09-5 Harmonies are starting points, not prescriptions — and one harmony member usually dominates
- Problem: combining colors by taste alone; or using a full harmony at equal weight (10:05–10:11).
- Decision: five wheel-based starting recipes — monochromatic ("almost impossible to mess up… sense
  of consistency and calm" 9:27–9:30, common in minimal SaaS), analogous (shared undertone, "Nature
  uses analogous colors all the time" 9:48–9:52), complementary (high contrast/energy; "you
  typically let one dominate and use the other as an accent" 10:07–10:11), triadic (bold, vibrant;
  "one color dominates and the other two play supporting roles" 10:22–10:25), split complementary
  ("a safer version… still get contrast, but it's less aggressive" 10:30–10:45).
- Evidence: `t00m09m40` (9:40) — wheel diagrams: monochromatic (single highlighted arc) and
  analogous (adjacent 3-arc span); `t00m10m20` (10:20) — the full harmony grid: mono + analogous
  variants + three complementary wheels with diametral lines + two triadic wheels with triangle
  overlays; `t00m10m50` (10:50) — the "color theory basics" recap card listing wheel / parts of color /
  color modes / harmonies (note: slide spells "complimentary").
- Reasoning (explicit 10:47–10:59): "these harmonies are starting points and not prescriptions… your
  job is to adjust the hue, saturation and brightness of those harmonies until they feel right."
- Effect: a defensible palette skeleton; restraint still application (see L09-10).
- Transfer: pick harmony by the energy the product needs (calm → mono/analogous; punch →
  complementary as dominant+accent; playful → triadic with a clear leader).

### L09-6 Rule 2 — Every color needs a job; audit by function, not aesthetics
- Problem: one color doing multiple semantic jobs — "if your primary button is blue, your links are
  blue, but then your info banners are also blue, and your selected tab is blue, and your chart bars
  are blue, the user can't distinguish 'click me', 'this information', 'this is selected'. Same
  color, three different meanings. That's a usability failure disguised as visual consistency"
  (11:48–12:06).
- Decision: roles — primary = brand/identity; secondary = support; neutrals = backgrounds, text,
  borders ("the quiet structural work" 11:16); semantic = red error / green success / yellow warning /
  blue info. Then audit: "List every color in your interface and write down what job it does. If two
  colors are doing the same job, cut one. If one color is doing three jobs, break it into variants
  with different shades or swap one role into a different hue entirely" (12:09–12:22).
- Reasoning (explicit 11:29–11:46): Gestalt similarity — same-colored interactive elements group in
  the brain; "every interactive element uses the same blue → users learn blue = tappable" is "a
  teachable pattern", not just branding.
- Evidence: `t00m11m40` (11:40) — blue square #2563E0 over a faded settings screen whose chrome is
  uniformly bluish (the over-used-blue state being diagnosed).
- Effect: color becomes an information layer users can learn; ambiguous affordances disappear.
- Fails: brand-first marketing pages where one hue legitimately repeats; fix by differentiating the
  interactive family, not decorating.
- Transfer: any design system — write the color-to-role table before visual polish.

### L09-7 Rule 3 — Don't fight meaning (Stroop); brand red ≠ error red
- Problem: colors contradicting learned meaning creates measurable friction — "If you make a delete
  button green, users hesitate. Green means go, safe, success, but the action is destructive"
  (12:56–13:00); Stroop effect cited (word RED printed in blue ink slows naming, 12:37–12:52).
- Decision: keep the universal semantic map intact (red = errors/destructive/critical; green =
  success/confirmation; yellow/amber = warnings; blue = information/links — 13:03–13:19, "reinforced
  by decades of software, traffic systems, and physical signage"); customize the SHADE, never the
  meaning; if your brand IS red, differentiate error from brand: darker red + icon, or "shift errors
  to a distant warm tone" (13:41–13:49).
- Evidence: `t00m13m00` (13:00) — side-by-side delete dialogs, identical copy ("Delete 'Q3 Product
  Roadmap'? This removes 12 files and revokes access for 4 collaborators."): left with a GREEN
  Delete button (wrong), right with a RED Delete button (correct; matching page glows); `t00m13m45`
  (13:45) — "Ember" app before/after pair: maroon brand shell with a buried "Payment failed — update
  your billing details" banner vs bright-red version where the alert is a distinct tinted card —
  brand red and error red separated by tint/saturation.
- Reasoning (explicit 13:51–13:55): "a color is a language. The user already speaks it. Your job is to
  speak it back, not invent new grammar."
- Effect: zero cognitive friction on destructive/confirmatory flows.
- Transfer: any alert, badge, or destructive control; auditable against a semantic-token sheet.

### L09-8 Rule 4 — Contrast is not optional: WCAG floors, Helmholtz–Kohlrausch, and never color alone
- Problem: passing a checker while still unreadable; saturated brand text "glowing and vibrating"
  (15:08–15:12); light blue button on slightly lighter blue background (15:29–15:41, ratio 1.8:1
  example); color-blind users excluded (~8% of men, ~0.5% of women — one in 12 male users,
  15:44–15:50).
- Decision: WCAG minimums 4.5:1 for normal text, 3:1 for large text AND UI components like buttons/
  icons (14:23–14:32) — "These are minimums, not targets" (14:33); desaturate readable content and
  keep accents vivid ("Desaturate your colors a bit. Let your accents be vivid, but your readable
  content needs to be calm" 15:19–15:24); never communicate by color alone — pair with icon, label,
  border change, or pattern (15:58–16:06); never set text on backgrounds of similar brightness AND
  saturation; never use complementary colors at matching brightness for text/background
  (purple-on-red, green-on-blue "vibrate… genuinely painful to read" 16:17–16:27); check with Stark,
  WebAIM, or Figma's built-in inspector (16:29–16:34).
- Reasoning (explicit 14:41–15:18): the Helmholtz–Kohlrausch effect — highly saturated colors appear
  brighter than desaturated colors at the same measured luminance; "a vivid saturated red text on a
  dark background can feel harder to read than a muted gray text at the exact same contrast ratio."
- Evidence: `t00m14m26` (14:26) — contrast-checker graphic: #321e48 on #00c6c8, ratio 7.01, four Pass
  chips (AA Large / AAA Large / AA Normal / AAA Normal), RGB+HSL sliders per color; `t00m14m48`
  (14:48) — five hue chips (H 0/66/159/200/294) all at S 100 / L 53 on the same gray — equal measured
  luminance, unequal perceived brightness (the H-K demo); `t00m15m04` (15:04) — dark skeleton UI with
  glowing saturated red placeholder bars and CTA (the "vibrating" text-on-dark case); `t00m16m30`
  (16:30) — Stark plugin page ("The #1 accessibility plugin on Figma", 586k users).
- Effect: accessible-by-default text and components; fewer "passed the checker, painful in practice"
  regressions.
- Fails: over-desaturating brand moments — the rule targets readability layers, not hero art.
- Transfer: add a "perceived contrast" eyeball pass (saturate → glow?) after the numeric check;
  always duplicate meaning in icon/label.

### L09-9 Rule 5 — Context changes everything: simultaneous contrast; test in the real surface; dark mode ≠ inversion
- Problem: the same gray looks bluish on navy, cool/purple next to orange (16:51–17:03); card borders
  designed on an artboard vanish on the tinted product background (17:26–17:38); brand colors go
  "electric and harsh" when copied into dark mode (17:58–18:05).
- Decision: never evaluate a color in isolation — "Always test it in the actual context where it will
  live. Your artboard background is not your product background. Your Figma canvas is not a user
  screen. If a color looks right on your canvas but wrong on the product, the product is telling you
  the truth" (17:40–17:54). For dark mode: "You don't just invert your colors for dark mode, you
  adjust saturation, brightness, and sometimes even hue" (18:07–18:13).
- Reasoning (explicit 17:05–17:22): simultaneous contrast, first documented by Michel Eugène
  Chevreul in the 1800s; "adjacent colors push each other towards a complement."
- Evidence: `t00m17m10` (17:10) — Chevreul portrait engraving slide; `t00m17m38` (17:38) — two
  identical white cards, one on a warm beige page, one on a cool blue-gray page, each with a magnifier
  loupe on the bottom-left corner showing the border reading differently; `t00m18m04` (18:04) —
  light-mode skeleton: blue logo, blue accents, blue CTA on white; `t00m18m10` (18:10) — same skeleton
  in dark mode: near-black panel, blue shifted lighter/softer, text bars inverted — the adjusted, not
  flipped, palette.
- Effect: colors stop "mysteriously" changing between canvas and product; dark themes get their own
  palette pass.
- Fails: isolated swatch-only token reviews; automated dark mode via CSS invert.
- Transfer: review every component on the actual page background; run a dedicated dark-mode
  saturation/brightness pass per token.

### L09-10 Rule 6 — Limit the palette: 3–5 core colors + neutral scale; every new color must earn its place
- Problem: palette sprawl — "What does this purple mean? Is this teal interactive or decorative? Why
  is this section green? … Collectively, they make your interface feel slower and confusing even if
  the actual performance is fast" (19:00–19:14).
- Decision: "Most well-designed interfaces run on three to five core colors — one primary, one or two
  secondaries, and a neutral palette with maybe five to seven shades from near white to near black.
  That's it. Everything else is a tint, shade, or opacity variation" (18:33–18:47). Named exemplars
  (19:16–19:34): Stripe (small core + intentional marketing gradients), Linear ("basically two
  colors" — purple-blue + grays), Notion (almost no color, making the red delete suddenly meaningful).
- Reasoning (explicit 18:51–19:00): Hick's Law — each extra color is another option the user's brain
  must decode. Closing heuristic (19:54–19:58): "Every new color should earn its place by solving a
  problem that your existing palette can't" — and "If you're adding color because a section feels
  boring, the problem is usually layout or typography and not color" (20:03–20:07).
- Evidence: `t00m19m00` (19:00) — music-player skeleton with scattered one-off accents (purple play,
  pink heart, teal tabs, orange scrubber) — visual for "each of those questions adds processing";
  `t00m19m35` (19:35) — five loose color chips over a blurred wireframe (mid-animation of cutting
  colors); `t00m19m45` (19:45) — the same player rebuilt as a "complementary" two-hue system (purple
  + orange swatches beside it, progress slider and one icon in the accent hue) — restraint demonstrated.
- Effect: fewer decisions per glance; rare colors regain signal value.
- Fails: data-viz-heavy products needing categorical scales — extend systematically, not ad hoc.
- Transfer: enforce a token budget (e.g., brand accent + semantic set + neutral scale) before adding
  a new hue; boredom is a layout problem.

### L09-11 Rule 7a — Warm advances, cool recedes: CTA warm, background cool; a natural z-axis on flat screens
- Problem: flat interfaces with no depth cue; CTAs competing with their surroundings (20:15–20:50).
- Decision: "Your call to action button should typically be warm or at least warmer than your
  surroundings… Your background should lean cool or neutral" (20:51–20:59); not "make everything
  orange and blue" but use the warm–cool relationship "where the warm-cool relationship creates a
  natural z-axis in a flat interface" (21:09–21:12).
- Evidence: `t00m20m45` (20:45) — "Upgrade to Pro" membership page: all-gray left column and order
  summary card with the single saturated warm-red/orange gradient "Upgrade now" button — the warm
  figure popping from the cool ground.
- Effect: primary actions feel "'close, grabbable, immediate'" (20:58–20:59) without size inflation.
- Fails: brands whose identity is a cool accent (invert the relationships deliberately, e.g. cool CTA
  on warm ground — the zoning logic still holds).
- Transfer: temperature-check every screen: the warmest element should be the one you want clicked.

### L09-12 Rule 7b — Dark mode: color becomes the isolation tool (von Restorff); desaturate the warmth
- Problem: "In light mode, you have lots of visual tools… bold text, borders, shadows… In dark mode,
  most of that subtlety gets swallowed by the darkness" (21:25–21:35); "you will find it harder to
  distinguish a bold text from a regular one on dark mode than on light mode" (21:38–21:42).
- Decision: in dark products "color becomes the primary way to create isolation" (21:44) — the warm
  CTA on a cool dark background "is the only warm thing on the entire screen. It is isolated by
  temperature and not just by hue" (21:48–21:54); expect the accent "doing double duty… creating
  depth and memorability" (22:01–22:04); compensate for H-K-style aggression — "dark mode palettes
  often desaturate warm colors slightly and shift cool colors to be a little more muted… you're
  preserving the spatial relationship between foreground and background" (22:07–22:21). Context:
  "Most AI and developer-facing products ship dark mode now as the default" (21:18–21:21).
- Evidence: `t00m21m50` (21:50) — "Meridian" dark fintech dashboard: near-black layout, desaturated
  serif numerals and holdings list, muted bar chart — and exactly one saturated element, the orange
  "Add funds" button.
- Effect: single-glance salience in dark UIs; the CTA is remembered (von Restorff: isolated elements
  are remembered, 21:57–22:00).
- Fails: dark mode with many warm accents (dilutes the single figure); reusing the light-mode palette
  verbatim.
- Transfer: for every dark theme, list warm elements and ration to one; darken/desaturate everything
  else a step.

### L09-13 Rule 8 — Design color STATES up front: a 50–900 scale instead of ad-hoc lightening; extend semantics to AI confidence
- Problem: mockups ship with hero blue only; "engineering asks, 'What's the hover state? What's the
  press state? What does disabled look like?' And then the designer scrambles to darken or lighten
  the blue by arbitrary amounts" (22:53–23:04).
- Decision: build each brand color as a numeric scale from day one (50, 100, 200… 900, 23:07–23:15)
  and map states to steps — "default might use 600. Hover 700. Pressed 800. Disabled 200. Focus ring
  300" (23:15–23:25); "Every state is accounted before you even start designing" (23:25–23:27).
  Extension to AI products (23:30–24:23): traditional semantics are binary (green success / red
  error), but AI output is "a spectrum of confidence"; candidate conventions: high saturation =
  confident vs desaturated = guessing; solid/opaque = confirmed vs semi-transparent = suggested; add
  an amber intermediate "this might be right, but check it" (24:09–24:16); "There's no industry
  standard yet… whoever nails the first visual language for AI confidence first gets to define the
  convention. And that's an opportunity" (24:17–24:23).
- Evidence: `t00m23m30` (23:30) — the state table: five "Continue" buttons — default 600 · #2563E0;
  hover 700; press 800 · #1D449E; disable 200 · #BFD5FD; focus 300 · #93B8FA with ring — beside the
  full 50→900 blue ramp with faint role labels at 200/300/600/700/800 (zoomed crop verified the hex
  labels; note the slide prints hover's hex as "#1DF4C4", a cyan value inconsistent with the blue
  hover swatch — evidently a slide typo, plausibly meant #1D4FC4); `t00m22m50` (22:50) — "Nadia"
  dashboard: blue "New project" button and blue "Shipped 118" KPI card on otherwise neutral chrome
  (one color family carrying the interactive roles); `t00m24m08` (24:08) — "Atlas" AI chat: assistant
  reply where the first sentence is solid black ("Confirmed") and the remaining lines are faded gray
  ("Suggested"), with a legend "■ Confirmed ■ Suggested" — the opacity-as-confidence pattern shown.
- Reasoning (explicit 24:26–24:47): aesthetic-usability effect — "A button with five well-defined
  states feels responsive and intentional… Users may not be able to articulate why your product feels
  better, but they feel it."
- Effect: no handoff guessing; states communicated pre-development; AI outputs get glanceable trust
  levels.
- Fails: single-state prototypes (fine, but the debt returns at engineering); confidence coloring
  without a legend.
- Transfer: every token ships with a state ladder; for AI-era UIs, define a confidence axis on top of
  existing semantics.

### L09-14 Closing meta — color rules are measurable, not taste; that's the designer's edge over generators
- Problem: "Designers often treat color as a matter of taste, but the rules we just covered aren't
  about taste… They're about proportion, contrast, function, perception, meaning, depth, and systems.
  Those are measurable. Those are learnable." (25:09–25:21.)
- Decision: understand WHY a color works rather than how to pick one — "Palette generator doesn't
  know about simultaneous contrast… It doesn't know that your accent color is fighting your
  background for figure-ground dominance… You do, and that's what makes you the designer"
  (25:27–25:50).
- Note: earlier citational claim — "Research suggests that 62 to 90% of a user's first impression of
  a product is based on color alone" (1:19–1:22) — presented without a source; not verified.
- Transfer: keep the effect names (figure-ground, similarity, Stroop, H-K, simultaneous contrast,
  Hick, von Restorff, aesthetic usability) as the mental checklist per design review.

## Creator tendencies observed (feeds creator-profiles.md)

- Structured "N rules" mini-courses; each rule couples a design rule + a named psychology/Gestalt
  effect + one product-picture; reuses the same effect names across his typography video (von
  Restorff, aesthetic-usability).
- Establishes an "AI outputs the average" thesis in both videos; positions craft knowledge as the
  human differentiator.
- Fictional demo brands as teaching props: Pulse, LinkShort, Ember, Meridian, Nadia, Atlas ("Meridian"
  name reused in his typography video for a coffee brand).
- Slide craft: cream cards, chunky dark display face for headers, gray grid-paper backdrop; presenter
  inset in a warm-lamp home studio; occasional second setup (sofa wall).
- Comfortable with history/science anchors (Newton 1666 wheel, Goethe-style hand-painted wheel frame
  at 2:45 `t00m02m45`, Chevreul portrait, HSL chips) — the course style is "theory → tool → product
  rule."
- Recommends concrete tools by name: Stark, WebAIM contrast checker, Figma's built-in accessibility
  inspector.

## Unverified / transcript-only observations

- Stripe/Linear/Notion exemplars (19:16–19:34): named in transcript; frames around the moment show
  color-restriction animation (`t00m19m35`) and talking head (`t00m19m55`, `t00m20m00`) — the actual
  product screenshots were not captured/verified frame-by-frame.
- Split-complementary wheel diagram (10:30–10:44): described; the captured harmony frames show mono/
  analogous (`t00m09m40`) and complementary/triadic (`t00m10m20`); a dedicated split-complementary
  wheel frame was not captured.
- "62–90% of first impression based on color" (1:19): no source given; not verified.
- Newton 1666 origin of the color wheel (2:41–2:45): asserted; the 2:45 frame shows a Goethe-style
  1809 hand-painted wheel, not Newton's — historical attribution taken on transcript authority only.
- Slide typo noted but not voiced by the creator: hover-state hex printed as "#1DF4C4" on the state
  table (`t00m23m30`), inconsistent with the blue hover swatch; also "complimentary" spelling on the
  basics recap card (`t00m10m50`).
- Full-screen WCAG numeric breakdown (4.5:1/3:1) seen only inside the checker graphic
  (`t00m14m26`); no separate spec-page screenshot verified (unlike video 10, which shows the WCAG
  document itself).

## Quotable diagnostics (explicit)

- "AI doesn't pick bad colors. It picks average colors." (1:58–2:00)
- "If every color is shouting, the screen begins to resemble a group chat where everyone has marked
  their messages urgent." (4:23–4:27)
- "Hex code is an excellent address for a color. It's not particularly a good steering wheel." (8:58–9:02)
- "Same color, three different meanings. That's a usability failure disguised as visual consistency." (11:58–12:06)
- "If two colors are doing the same job, cut one. If one color is doing three jobs, break it into
  variants." (12:14–12:20)
- "A color is a language. The user already speaks it. Your job is to speak it back, not invent new
  grammar." (13:51–13:55)
- "These are minimums, not targets." (14:33)
- "Your artboard background is not your product background. Your Figma canvas is not a user screen." (17:42–17:48)
- "If a color looks right on your canvas but wrong on the product, the product is telling you the
  truth." (17:51–17:54)
- "The harmonies give you options, restraint gives you impact." (19:50–19:52)
- "If you're adding color because a section feels boring, the problem is usually layout or typography
  and not color." (20:03–20:07)
- "You don't just invert your colors for dark mode." (18:07–18:09)
- "There's no industry standard yet… whoever nails the first visual language for AI confidence first
  gets to define the convention." (24:17–24:21)
- "You do, and that's what makes you the designer." (25:49–25:50)
