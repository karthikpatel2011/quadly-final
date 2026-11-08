# Research Notes — Video 12, Part C (2:08:00 → 3:08:14 end)

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/truRwcI7-kg
- Title: "UI/UX Design Full Course for Beginners 2025 | Lets Uncover"
- Creator: Lets Uncover (channel); screen-recording narrator says "Ali Hasan UX — my YouTube
  channel name" [2:10:12, translated-from-hi]; on-camera outro speaker signs off "my name is
  Subhan Tarek" [3:08:10, translated-from-hi — ASR spelling, not verified visually]
- Duration: 3:08:14 (11,294 s) · Published: 2025-05-06 · Views: ~511k · Hindi (auto-captions)
- Classification: full Figma UI course; THIS PART C covers only 2:08:00–3:08:14 (60 min 14 s)
- Access: transcript `media/transcripts/video-12.hi-raw.txt` (Hindi auto-captions; lines read
  3488–5050) + 43 frames viewed at 720p. Metadata JSON has NO chapter list — the segment map
  below was verified from content, not from metadata.
- Quality caveat: 3-chunk `--download-sections` downloads (with and without
  `--force-keyframes-at-cuts`) crashed ffmpeg with exit -11 on this host, so the full 720p
  video-only stream (`media/segments/video-12-full.mp4`, 195 MB) was downloaded once and
  frames were extracted at absolute timestamps instead. Coverage result is identical.
- Range note: the range opens MID-DEMO — the absolute-position exercise starts before 2:08:00
  (transcript [2:07:48] shows the tail of Part B's icon/auto-layout demo). Lessons below only
  use content inside the range.

## Segment map (verified from frames + transcript; no metadata chapters exist)

2:08:00–2:09:28 Absolute position + constraints: pinning a floating icon (right+top
  constraint) to an auto-layout card, responsive movement (continuation of Part B topic)
2:09:29–2:11:09 Building a CTA button from scratch (auto layout, padding, radius, color)
2:11:11–2:21:07 Components & Variants: 4-diamond icon, Assets panel, and all 4 component
  property types — variant, text, boolean, instance swap
2:21:08–2:30:53 UI Variables: color/number/string (+boolean) types, scoping (web/Android/
  iOS), grouping, Mode 1/Mode 2 theming, variable-bound fills and gaps, mass update demo
2:30:53–2:32:16 Design-system sheet walkthrough (icons, logo, review widget, barcode,
  typographic scale, CTAs) — file "8- Real Estate", page structure Thumbnail + Real Estate
2:32:16–2:40:40 Landing rebuild part 1: 4-color palette reveal, decorative line lattice
  (pen tool), desktop frame + 12-column grid, nav bar (logoframe, active/inactive states),
  CTA instance reuse
2:40:42–3:03:00 Landing rebuild body: hero (heading, paragraph, review + avatars, 500K/100K
  stats), dark "MEET US FOR CRAFTING DREAMS" expo-card section, TRUSTED BY LOCAL photo
  strip, footer/nav reuse, LUXURY FINDS A HOME, REACH NOW — all imagery via the Unsplash
  plugin
3:03:00–3:07:20 Prototyping: home component with 2 variants, elements parked off-canvas,
  mouse-enter + mouse-leave dissolve animation, 1920×1080 presentation, live demo
3:07:20–3:08:14 Outro: practice advice, 8-hour free graphic-design course plug (self-promo),
  subscribe CTA, sign-off

IMPORTANT negative finding: the final hour of this course contains NO portfolio, Behance,
career, freelancing, client-sourcing, or pricing content. The course ends with the Figma
clone + prototype exercise and a short "go practice" pep talk. Anyone expecting a
portfolio/career module in this course will not find it here.

## Teaching format

Single screen-recording of Figma, narrated in Hindi with heavy English Hinglish jargon
("component", "variant", "auto layout", "absolute position", "clone"). Two exercises in this
range: (1) a toy CTA button on an empty canvas for components/variables, (2) a full 1:1 clone
of a real-estate landing design ("METRO LIVING") placed side-by-side with the reference
image/frame on canvas — the instructor measures against the reference the whole way.
Sections end with "Congratulations" repeats [2:40:42, 2:47:28, 3:01:43]; he states the device:
"I say congratulations again and again so that you do not get bored and learn well"
[2:47:28–2:47:36] (translated-from-hi). An on-camera presenter appears only for the sign-off.

## Lesson log

### L12C-1 Absolute position + constraints: pin floating elements, keep them responsive
- Problem [transcript 2:08:09–2:08:47]: a badge icon pasted over an auto-layout card "does
  not move properly with the design" when the card resizes.
- Decision: enable absolute position on the icon, then set constraints to **Right + Top** so
  it "stays right and stays top — fixed on right and top" [2:08:29–2:08:34,
  translated-from-hi]. He then demonstrates the other constraint choices (both edges, center
  only) so the icon tracks left–right movement or stays centered.
- Evidence: frame `t02h08m10.jpg` — pickup card demo ("Best Ford Cars", $199, Buy Now) with
  the floating bell icon selected and the Position panel showing constraint dropdowns (X
  1242, Y 86); `t02h08m20.jpg` — same card mid-constraint-edit, layers tree open.
- Implementation: Figma → Position → Absolute position; constraints widget set per axis.
- Effect: the icon keeps its corner offset while the card's auto layout reflows.
- Appropriate: notification dots, badges, hero labels over cards. Fails: elements that must
  reflow with content (that is the default auto-layout behavior).
- Transfer: any project — "floating" UI = absolute position + a deliberate constraint pair
  per axis; never let a floating element default to both-center.

### L12C-2 Buttons are built as auto-layout pills, not baked shapes
- Problem: hand-drawn buttons (shape + circle + text) don't hug their text and can't be
  reused. He explicitly warns: a button "should be made like this" (the demo) — "you don't
  apply the circle that is underneath" [2:11:00–2:11:09, translated-from-hi].
- Decision [2:10:03–2:10:58]: text layer → Shift+A auto layout → pick fill → name **BTN-CTA**
  ("CTA means call to action… a button is also called a CTA" [2:10:34–2:10:40,
  translated-from-hi]) → corner radius fully rounded → padding L/R **25**, T/B **15**.
- Evidence: `t02h10m45.jpg` (teal pill "AliHassanUX", 144 Hug × 43 Hug, BTN-CTA label);
  `t02h11m25.jpg` (panel: W 174 Hug, padding 25/15, radius 50, fill 07FFE6).
- Implementation: Hug sizing both axes so the button grows with its label.
- Effect: every future button resizes and restyles in one place.
- Fails: icon-only buttons may need different padding tokens.
- Transfer: pattern, not numbers — buttons = text + auto layout + hug + name by role (CTA),
  in any tool.

### L12C-3 Component + variant: model the hover state as a color/darken variant
- Problem: interactive states duplicated ad hoc drift out of sync.
- Decision [2:11:11–2:13:20]: create component (the "four diamonds" icon), then Add property →
  Variant; duplicate as **hover** state; hover = same button with a darker/desaturated tone
  ("as soon as someone brings the mouse over, change its color, or take it into a slightly
  darker tone" [2:12:39–2:12:46], translated-from-hi).
- Evidence: `t02h12m25.jpg` (dashed purple variant frame, two pill buttons, right panel
  "Current variant / Property 1 = Variant"); `t02h13m45.jpg` (layers renamed `Hover` and
  `Default-Stae` [sic]; default teal fill vs lime/yellow-green hover fill; typography Clash
  Display Semibold 20, -2% tracking).
- Implementation: duplicate component into the variant frame; adjust fill only; rename layers
  to state names.
- Effect: one draggable component exposes default/hover via a dropdown in every instance.
- Fails: hover changes that involve layout shift — a variant that changes size re-triggers
  auto layout and complicates prototyping.
- Transfer: every interactive element in a design system ships with at least default and
  hover variants; the difference should be tone, not geometry.

### L12C-4 Parent→child inheritance is the whole maintenance argument for components
- Reasoning (explicit [2:14:44–2:14:57], translated-from-hi): "whatever changes you make in
  the child will NOT apply to the parent… if you change the parent, all your children change."
- Decision: pair that rule with the **text property** — expose the button's label as a
  component property so instances rename from one inspector field ("instead of changing it
  separately everywhere, change the text in one place" [2:15:15–2:15:30,
  translated-from-hi]).
- Evidence: `t02h13m45.jpg` (main + variant set with child diamond markers);
  `t02h15m20.jpg` (instance retitled "Sign-In" next to the main set; right panel showing
  pre-existing local text styles Heading/Heading 2/BTN-20 and color styles).
- Effect: single-point edits propagate to every instance on every page.
- Fails: overrides on children survive parent updates and can silently diverge; he never
  mentions reset-to-main, which is the standard guardrail.
- Transfer: teach juniors parent/child direction BEFORE overrides; label text, state, and
  icon should all be properties, not manual edits.

### L12C-5 One button component covers text-or-not and any icon via boolean + instance swap
- Problem: "icon button" / "text button" / "icon+text button" are usually two or three
  separate components.
- Decision [2:15:57–2:19:26]: add a **boolean property "Show Text"** (toggle visibility of
  the label), add icon instances to the main component + a **boolean "Show Icon"**, then a
  **create instance property** ("Instance") whose preferred values are the whole
  `icon-park:message` icon list — "mark all" to expose every icon, select-all nested
  instances [2:18:47–2:18:57].
- Evidence: `t02h16m30.jpg` (Show Text OFF → empty teal pill, 174×55); `t02h17m55.jpg`
  (Sign-In + message icon instance with Show Text ON / Show Icon ON in inspector; Assets
  panel showing BTN-CTA + 4 icon components); `t02h19m00.jpg` ("Create component property"
  dialog: Name=Instance, Value=icon-park:mes…, preferred values list; "Nested instances"
  dialog with 4 icons and Select-all-instances checkbox); `t02h20m35.jpg` (placed instance:
  inspector shows Text=AliHassanUX, Show Text, Show Icon toggles, Instance=icon picker;
  210 Hug × 56 Hug).
- Effect: swapping a sign-in button to a check-button is a dropdown click, not a rebuid.
- Reasoning (explicit [2:19:20–2:19:26], translated-from-hi): "the second time we didn't
  have to work hard at all, just because we created the instance property."
- Fails: over-property-ing — every combination a designer never uses is noise.
- Transfer: model optional parts of a component as booleans and swappable parts as instance
  swaps; this is the base vocabulary of any Figma design system.

### L12C-6 UI variables = the design token layer: 4 types, scoped, grouped
- Framing [2:21:09–2:21:18, translated-from-hi]: variables are "also a backbone" (baqbone/
  backup) "of Figma" — "when we design a website we create different variables."
- Decision [2:22:20–2:26:00]: open Local variables → create a collection → create **Color**
  (Yellow), **Number** (Num 1 = 32 for gap, Num 2 = 16), **String**; then group them
  ("Color", "Number", "String" bins) — "rather than you getting confused with everything in
  one place, you can separate them" [2:25:28–2:25:34, translated-from-hi]. Each variable has
  a scope dialog limited to Web / Android / iOS surfaces ([2:23:46–2:23:54]; transcript-only,
  dialog not captured in a frame).
- Evidence: `t02h22m10.jpg` (empty Local-variables panel with Figma's own copy "Create
  reusable numbers, text, and colors that can be applied across your files and
  prototypes."); `t02h23m35.jpg` (collection "Variables-Collection", row Yellow = FFFFFF mid-
  edit); `t02h25m25.jpg` (4 variables; left rail groups Color/Number/String; Num 1 = 32,
  Num 2 = 16).
- Effect: repeated values (spacing, colors) get one home per file.
- Fails: toy exercises with "Num 1 / Num 2" names teach mechanics but exactly the naming
  discipline real tokens need (space-32, gap-md) is not demonstrated.
- Transfer: on any project, tokenize colors before components; group the panel by token type.

### L12C-7 Modes turn one variable set into theming + one-commit mass restyles
- Decision [2:26:25–2:30:53]: add **Mode 2** next to the default column; in Mode 2 push the
  Yellow toward a dark tone and BLK toward a whitish tone for hover/theme; bind the button
  fill to the variable (fill row shows `Color/Yellow`); bind gap/padding to number
  variables; then switch the whole selection between modes from the Appearance icon.
- Evidence: `t02h26m45.jpg` (columns Mode 1 / Mode 2: Yellow AFFF47 vs 47C8FF cyan being
  picked; BLK 222222; Num 1 32); `t02h27m45.jpg` (Fill row shows **Color/Yellow**; Mode 2 BLK
  = E6EBEB light — his "whiteish text tone" [2:26:51–2:26:55, translated-from-hi]);
  `t02h29m40.jpg` (≈40 duplicated button instances in a grid while he recolors them all with
  the variable picker open).
- Reasoning (explicit [2:28:15–2:28:23] and [2:29:19–2:30:00], translated-from-hi): "if you
  have 100 screens, change it from here only — it gets implemented across all your screens";
  doing it manually "would spend and waste a lot of time… within seconds" every button's
  text color updated.
- Effect (explicit [2:30:29–2:30:53]): "this is actually very useful… whenever we design or
  develop a website, you must consider and use these" (translated-from-hi).
- Fails: mode-swaps recolor everything bound to that variable — unscoped variables make
  partial theming impossible; he doesn't demo per-section mode overrides.
- Transfer: hover/dark themes should be *modes of the same tokens*, not second palettes;
  bind spacing tokens to padding/gap fields, not just fills.

### L12C-8 Start every page from a design-system sheet: named color roles + type scale + CTA parts
- Problem: rebuilding a reference ad hoc re-derives every value by eye.
- Decision [2:30:53–2:32:54]: the course's file opens a prepared "Design System" sheet —
  Icons (arrow, logo mark, ★★★★★ review stars), logo, barcode, text samples ("this is
  actually our text… throughout the website we have the same-size headings running"
  [2:31:10–2:31:15, translated-from-hi]) with type entries written as
  **Heading/118px**, **Paragraph/20px** and pre-made CTA buttons; plus the palette in 4
  named swatches: "secondary, primary, accent and gray color… which we will use throughout
  the website" [2:32:47–2:32:54, translated-from-hi].
- Evidence: `t02h31m00.jpg` (Design System card: Icons / METRO LIVING / review stars / QR
  circle / CTA with orange circle-arrow + "Get In Touch" pill; Preview strip with 4 swatches
  beside a rendered landing preview); `t02h32m40.jpg` (4 swatch rectangles W 230 × H 63,
  radius 12 — dark, white FFFF F7, orange, gray — above the landing nav Home/Expo/About/
  Services). Later `t02h50m55.jpg` confirms the color styles list: Secondary, Primary,
  Accent, Gray, Dark Gray.
- Implementation: swatch row → convert to color styles; write type name/size into the sample
  text; keep CTAs as components (see L12C-10 for reuse in the nav).
- Effect: the whole page build below becomes lookup, not invention; the reference is checked
  against 4 known roles instead of 20 hexes.
- Fails: sheets copied between projects import stale names; "Heading/118px" naming embeds
  one page's size into the token name.
- Transfer: for any clone or greenfield UI, freeze palette roles + type scale + CTA anatomy
  on one sheet before laying out a single section.

### L12C-9 Draw the decorative line system first, on a 12-column grid, before content
- Problem: this reference uses a lattice of thin rules (menu frame lines, page borders);
  borders on containers would multiply.
- Decision [2:32:56–2:36:08]: pen-tool lines, stroke **2, outside, gray**; duplicate and
  rotate 90°/180° for the cross axes; group lines (Ctrl+G) and center them to the frame.
  Explicit trade-off [2:33:39–2:33:58, translated-from-hi]: "when I made this entire menu I
  could have applied top and bottom borders on it, but the lines are quite many… that's why
  I am creating the lines first." Then "as always, we'll go to grids, create our grid
  system, apply a 12-column grid" [2:35:44–2:35:50, translated-from-hi] — count 12, gutter
  ~30 ("30 is more than enough" [2:36:00–2:36:08]) — and **lock** the line layer so it
  stops interfering [2:36:28–2:36:34].
- Evidence: `t02h35m50.jpg` (Desktop-1 frame W 1440 × H 6293; pink 12-column overlay across
  the whole page; layout-grid panel open (preset "Grid 12px"); reference design on the
  left with METRO LIVING hero + dark expo section); `t02h38m10.jpg` (nav row and CTA
  instance placed on the column overlay).
- Effect: alignment targets exist before any component lands; lines behave as one locked
  system instead of N borders.
- Fails: baked pixel line systems don't translate to CSS (score as borders); grids at 30px
  gutters on denser UIs over-space.
- Transfer: when a design leans on rules/hairlines as decoration, decide once — lines as
  objects (art-directable) vs borders (structural); set the grid before content either way.

### L12C-10 Nav hierarchy is color semantics: one active (dark), the rest (gray); CTA is an instance
- Decision [2:37:45–2:40:40]: menu items in one auto layout; active item keeps primary dark
  text, "the rest are not active… so we'll dull the colors of the rest — dark gray"
  [2:40:00–2:40:11, translated-from-hi]; item spacing tuned 48 → "48 is more than enough"
  [2:37:36–2:37:45] → 32 ("32 actually looks better" [2:40:18–2:40:21]); menu text 20 with a
  compact 18 alternative discussed; the Contact CTA is dropped in from Assets as an
  instance, fill detached, tinted to the theme with an accent arrow [2:37:45–2:38:21]; logo
  centered exactly between the two rule lines and equal-spaced [2:38:30–2:39:11].
- Evidence: `t02h38m10.jpg` (purple-outline instance 160 Hug × 47 Hug, fill FF6048, radius 50
  on the grid); `t02h40m15.jpg` (nav bar 1308 Hug × 47 Hug: "Home" dark vs Expo/About/
  Sevices gray; auto-layout panel with center/top constraints).
- Effect: state, spacing and CTA all read as hierarchy, not decoration; nav edits happen in
  one place.
- Fails: a "dark-gray" inactive from one palette will fail contrast on another background —
  he never checks it.
- Transfer: nav = active/inactive token pair + one reusable CTA; tune spacing to eye, then
  fix the value — don't leave magic numbers.

### L12C-11 Type scale reuse, social-proof surgery, and depth via measured shadows
- Problem: the reference mixes a 118px display heading, 90px section heading, 48px row
  titles, 38px stats and 20px body; rebuilding by eye drifts, and paid fonts aren't
  available.
- Decision: re-apply saved text styles where the structure repeats (Heading style on later
  headings; per-block adjustments like 500K stat in **Clash Display Medium 38** with an
  orange accent superscript "+" [2:44:31–2:45:20]); shrink a **bold arrow** so it doesn't
  overpower its row — "the arrow is bold, that's why we'll make it a bit smaller so it does
  not become too prominent… otherwise we would have kept a really big arrow" [2:50:16–
  2:50:40, translated-from-hi]; review widget = 5 accent stars + name + quote + avatar
  circles 43×43 with **primary stroke, outside, weight 2** [2:46:12–2:46:51]; shadows tuned
  numerically (card shadow: position 0/12→, blur upped, full black — panel reads Y 12, blur
  37.3 at [2:51:15]) with the stated aim of a soft ambient lift.
- Evidence: `t02h41m20.jpg` (layers: "Metro living" selected; Typography field literally
  "Heading-118px"; Fill = Secondary; METRO LIVING + orange Get In Touch pill); `t02h44m50.jpg`
  (rebuilt hero with teal arch image, orange circle-arrow, "500K" + "45" mid-edit, Clash
  Display Medium 38 in panel); `t02h46m40.jpg` (4 selected, W 43 H 43, stroke Primary/
  Outside/2, avatar circles on white card); `t02h49m45.jpg` (expo row "01 Epic Home Expo"
  pill over an image, Clash Display Regular 48); `t02h51m15.jpg` (Drop shadow dialog 0/12/
  blur 37.3/black; auto layout 1139×181); `t03h01m10.jpg` (Heading/118px style + Fill
  Secondary applied to "LUXURY FINDS A HOME").
- Reasoning (explicit [2:52:07–2:52:13], translated-from-hi): "this font is a different one…
  it is paid — that's why I did not use it; I used the one that is free." Free substitution
  over piracy or purchase.
- Effect: pages keep the reference's rhythm while remaining legally shippable; depth reads
  as light direction, not gray glow.
- Fails: style-name reuse breaks when a section intentionally deviates (he re-sizes manually,
  leaving the style detached); big blurs on small radii look wet.
- Transfer: hierarchy = scale steps you can name; decorative glyphs shrink when their weight
  outshouts their row; shadows are numbers (dy, blur, alpha), not presets.

### L12C-12 Clone with judgment: match measurements, allow deliberate improvements
- Problem: a 1:1 clone still meets sections where the reference's spacing is arbitrary or
  cramped.
- Decision: pull out the **ruler and measurement guides** against the reference, sync keynote
  spacings across sections (top spacing 70 "as always we keep" [2:54:18–2:54:26]; repeat a
  section's 116 top spacing on its sibling [2:58:59–2:59:19]; bottom pad 50 after measuring
  150/103 and rejecting "random" spacing [2:57:46–2:58:08]); but explicitly allow deviation —
  "obviously we cannot follow it same-to-same; if any small change needs improvement, we
  will definitely make it" [2:56:26–2:56:34, translated-from-hi]. Full-bleed photo strips get
  **zero** auto-layout gap [2:57:03–2:57:05]; all imagery comes from the **Unsplash plugin**
  (search grid with per-image lock/unlock and credits visible).
- Evidence: `t02h54m00.jpg` (Line 978×0, stroke Primary, Outside 2, drawn between expo rows);
  `t02h56m50.jpg` (TRUSTED BY LOCAL: reference strip of 3 flatiron photos vs rebuilt 319×618
  placeholder being placed, grid overlay visible); `t02h57m45.jpg` (rebuilt strip complete,
  ELEVATE YOUR LIVING block with red measurement labels 40 / 750 / 2146, auto layout W 583
  Hug, padding 73, gap 0); `t02h59m35.jpg` (Unsplash plugin result grid over the LUXURY/
  REACH NOW sections); `t03h02m50.jpg` (full-page reference vs rebuild side-by-side at the
  final check).
- Effect: consistent vertical rhythm across hand-built sections; deviations stay conscious
  instead of sloppy.
- Fails: pure clone fidelity can import the reference's own mistakes — the reference's nav
  typo "Sevices" (missing 'r') is copied into the rebuild and survives in the final render
  (`t02h40m15.jpg`, `t03h06m10.jpg`); he never flags it.
- Transfer: copy structure and rhythm, not defects; measure before "fixing," announce every
  deviation, and run a spelling pass on nav/footer before calling a clone done.

### L12C-13 Prototype motion as two variants: everything enters on mouse-enter, exits on mouse-leave
- Problem: scroll/hover choreography can't be prototyped from a single static frame.
- Decision [3:03:00–3:07:20]: wrap the finished home in a **component with two variants**;
  in the "enter" variant, push every animated element off-canvas (nav up, circles right,
  text left/right, bottom bars down) — "I will take all these things outside the canvas so
  I can play a proper animation on them" [3:04:45–3:04:55, translated-from-hi]; leave extra
  vertical space between variants "because I have to play a proper interaction between them"
  [3:03:48–3:03:53]; prototype: **on mouse enter → dissolve-in**, on mouse leave → the same
  animation [3:04:55–3:05:16]; present at **1920×1080, fit width**.
- Evidence: `t03h03m45.jpg` (component Frame-1000002452, layers Variant2/Default, two hero
  variants stacked 1377×893, arch image visibly slid upward in one); `t03h04m45.jpg` (the
  emptied enter-variant: only stray nav slashes, an arch tip and review stars remain inside;
  "Scrubbing at 1x" tooltip); `t03h06m10.jpg` (presentation view: fully rendered white hero —
  METRO LIVING, Get In Touch, teal arch with houses, orange circle-arrow, ★★★★★ review with
  avatar, +500K Happy User / +100K Our Partners, QR circle — clean nav with the reference's
  "Sevices" typo).
- Reasoning (explicit [3:07:01–3:07:07], translated-from-hi): "because of this your
  design's look and feel feels next level."
- Effect: enter/leave symmetry makes the prototype feel alive with two variants and no
  timeline work.
- Fails: off-canvas staging breaks when frames clip content (needs Clip content off or
  oversized frames); dissolve + direction parking is cruder than smart-animate springs and
  he does not demo the interplay.
- Transfer: for any hover/scroll reveal, model enter and leave as two states of one
  component; stage exiting elements wholly outside and give the variant room; present at
  the real viewport size before judging the motion.

## Creator tendencies observed (feeds creator-profiles.md)

- Teaches Figma as "power + backbone" vocabulary: components, variant, boolean, instance
  swap, variables, modes — each introduced as capability ("ye power hoti hai…") before
  mechanics. Numbers-first teaching: every padding/spacing/radius is spoken aloud (25/15,
  48→32, 30 gutter, 118/90/48/38/20 type steps).
- Builds a real clone start-to-finish instead of isolated widgets, side-by-side with the
  reference; measures with rulers and repeats fixed top spacing (70) as an "always" rule.
- Engagement drumbeat: repeated "Congratulations" [2:40:42, 2:47:28, 3:01:43], explicitly
  designed "so you don't get bored" [2:47:28–2:47:36].
- Free-tool ethics: refuses a paid font seen in the reference and substitutes a free one
  [2:52:07–2:52:13]; all imagery sourced via the Unsplash plugin with creator credits
  visible (`t02h59m35.jpg`).
- Colors from role names (Primary/Secondary/Accent/Gray/Dark Gray), typography from named
  styles (Heading/118px, Paragraph/20px, BTN-20) — systems language consistent across the
  whole hour.
- Close: practice-more sermon plus a self-promo plug for the channel's 8-hour free graphic
  design course [3:07:53–3:08:05] — course funnel for the channel, not a design lesson.

## Unverified / transcript-only observations

- Variable **scope dialog** (Web / Android / iOS checkboxes) at [2:23:46–2:23:54]: narrated,
  not captured in the extracted frames.
- The transition label: transcript at [3:05:04] renders as "डिॉल्व्स सी एनिमेशन" (likely
  "dissolve-in/down animation"); the exact easing/curve cannot be verified from stills.
- The promo graphic for the 8-hour free graphic-design course + on-screen link card at the
  outro [3:07:53–3:08:05]: transcript says the link "is coming on your screen"; the sampled
  outro frame (`t03h07m50.jpg`) shows only the talking head, card not captured.
- Sign-off name vs channel name: outro speaker says "Subhan Tarek" [3:08:10] while the
  in-course narrator claims "Ali Hasan UX" as "my YouTube channel" [2:10:12]. Whether these
  are two people (channel brand vs presenter) or an ASR mishearing is not resolvable from
  available evidence; both are recorded as heard.
- Exact final background tone of the dark "MEET US FOR CRAFTING DREAMS" section: editing
  frames show it under the pink 12-column layout-grid overlay (reads maroon) while the grid
  is on; the presentation frame sampled does not include that section — final true tone
  unverified.

## Quotable diagnostics (explicit, translated-from-hi)

- "Whatever changes you make in the child will not go onto the parent — but changes in the
  parent apply to all children." (2:14:44–2:14:57)
- "If you have 100 screens, change it from here only — it's implemented across all your
  screens." (2:28:17–2:28:23)
- "Doing it manually on every button would waste a lot of time — within seconds, every
  button updates." (2:29:19–2:29:37)
- "Second time we didn't have to do the hard work at all, just because we created the
  property." (2:19:20–2:19:26)
- "Secondary, primary, accent and gray — this is our proper system; we'll use these
  throughout the website." (2:32:47–2:32:54)
- "This font is paid, that's why I didn't use it — I used the one that is free."
  (2:52:07–2:52:13)
- "Obviously we can't follow same-to-same; if any improvement is needed, we'll definitely
  make it." (2:56:26–2:56:34)
- "Because of this, your design's look and feel feels next level." (3:07:01–3:07:07)
- "Now you have to use this knowledge. Practice it — the more you practice, the more of an
  expert you become inside it." (3:07:44–3:07:51)
- "I say congratulations again and again so you don't get bored." (2:47:28–2:47:36)
