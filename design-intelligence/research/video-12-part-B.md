# Research Notes — Video 12, Part B (of 3)

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/truRwcI7-kg
- Title: "UI/UX Design Full Course for Beginners 2025 | Lets Uncover"
- Creator: Lets Uncover (channel). Screencast narration in this range is Ali Hassan (@alihassanux, established by part A transcript 2:38–3:14 and part C transcript 2:10:12 "Ali Hasan UX — my YouTube channel name"). Classroom student voices answer quiz questions audibly in the 1:24–1:25 stretch (audio evidence only; no classroom visuals).
- Duration: 3:08:14 (11,294 s) · Published: 2025-05-06 · Views: ~511k · Hindi/Urdu narration (auto-captions), slides are in English
- Classification: full beginner course. **This file covers Part B only: 1:04:00–2:08:00 (64 min).** Part A = 0:00–1:04 (UX laws through Hick's Law); Part B opens exactly at the next law (Jakob's Law) and ends mid auto-layout demo, inside the absolute-position/ignore-auto-layout moment that Part C completes at 2:08+
- Access: transcript `media/transcripts/video-12.hi-raw.txt` lines 1742–3494 (Hindi machine captions; all Hindi quotes below are `translated-from-hi` unless marked "slide") + 30 frames viewed at 720p from `media/segments/partBvideo12src-rm.mp4` (720p video-only stream, remuxed). Metadata JSON has **no chapters** (`chapters` empty) — the map below is built from transcript + verified frames, not from metadata
- Tooling caveats (recorded for reproducibility): (1) `yt-dlp --download-sections` crashed the host ffmpeg (exit code -11 / SIGSEGV) with and without `--force-keyframes-at-cuts` — same failure other parts recorded — so the full 720p video-only stream (format 136, 113 MB) was downloaded instead; (2) that DASH file had a broken seek index (all `-ss` seeks returned the same early frame) and was fixed with `ffmpeg -c copy` remux; (3) frames were then extracted with absolute `-ss` timestamps from the remuxed file. Section-cut vs whole-file frame content is identical.
- Subject of range: last 6 UX laws (Jakob, Similarity, Miller, Pareto, Proximity, Tesler) → the 7-stage UI design process lecture → grid systems (theory + Figma practical) → color theory (embedded English presentation) → auto layout fundamentals (hug/fill/fixed, wrap, negative spacing, canvas stacking, baseline) → guided build of a responsive product card (buttons, typography, paddings, shadows, fill-container, absolute position, icon plugins)

## Structure of 1:04:00–2:08:00 (map built from transcript + viewed frames)

1:04:00–1:06:15 Jakob's Law + YouTube redesign case → 1:06:16–1:07:56 Law of Similarity → 1:07:56–1:09:19 Miller's Law → 1:09:19–1:10:43 Pareto Principle → 1:10:43–1:11:58 Law of Proximity → 1:11:58–1:13:51 Tesler's Law + credit-card-form example → 1:13:51–1:20:03 UI design process lecture (Understand → Explore → Visual Design → Documentation → Prototyping → Reviews & Testing → Iteration → Deliver; Spotify/Google Maps/Instagram close-out) → 1:20:03–1:21:44 meta transition + "Why do we use Grid?" → 1:21:44–1:23:00 grid anatomy (row/column, gutter, margin) → 1:23:00–1:25:17 grid types + live quiz → 1:25:18–1:30:20 Figma layout-grid practical (12-column, stretch, margin, gutter, rows, saved grid style) → 1:30:21–1:31:49 real-site example (grid on/off) → 1:31:49–1:38:23 color theory presentation (wheel, primary/secondary/tertiary, RGB vs CMYK, warm/cool, complementary, split-complementary, analogous, triadic, square, monochromatic) → 1:38:23–1:41:00 auto layout basics (Shift+A, fixed vs hug, min/max, lock aspect) → 1:41:45–1:44:15 wrap + gap + individual padding → 1:44:24–1:47:37 Sign In button craft (eyedropper fill, paddings 40/32, radius, tinted drop shadow, "no full black" rule) → 1:47:37–1:49:12 ellipse/arc → loading-spinner analogy → 1:49:13–1:52:55 alignment, stroke add/include/exclude, canvas stacking via negative spacing, baseline alignment → 1:52:56–2:08:06 responsive card build (picture via Unsplash, frame section, New badge, Clash Display typography, Title Case, Buy Now, hug-vs-fill, individual paddings, fill-container image, icon plugins + absolute position) — continues into Part C.

## Teaching format

Unchanged from Part A: instructor-led screencast alternating three visual modes — (1) English slides on a white card over a dark textured backdrop, read aloud and re-explained in Hindi; (2) live Figma in the course file "UIUX Design Long Course" (tab titles visible: "— Gird Syst", "— Colors Th"); (3) a pre-produced English color-theory video played inside the lecture (1:31:49–1:38:23, different visual style, dark slides with teal accents — cited directly as slide evidence). New in this range: live quiz cadence — the instructor pauses on examples and makes unseen students answer ("tell me quickly… exactly — gutter", 1:24:01–1:24:15, translated-from-hi), drilling vocabulary (margin/gutter/column) before each Figma move. Every Figma demo is duplicated: first explain what will be done, then do it, then re-do at zoom or with alt-drag.

## Lesson log

### L12B-1 Jakob's Law: build new products on patterns users already know
- Problem: new products ask users to learn unfamiliar interaction models.
- Decision [slide, verified `t01m04m30`]: "Users spend most of their time on other websites, so they want your site to work like the ones they already know." Three supporting points on the same slide: people assume a new product will work like a similar one they know; using what people already know makes products easier to use so "people can focus on what they want to do, not how to use the product"; when you change something, let people use the old version for a while.
- Reasoning [transcript 1:04:01–1:05:18, translated-from-hi]: if the user "doesn't know your product, they do know products like yours — so build your product like [competing products], because of which the user easily navigates it." Examples: people already work on YouTube; TikTok and Instagram didn't need to invent engagement patterns, they borrowed them from where attention already lived.
- Evidence: slide frame `t01m04m30`; verbal Uber vs in-drive analogy (1:04:46–1:04:58).
- Implementation: pattern audit of the category before designing; reuse placement/motion/naming conventions that category leaders established.
- Effect: zero learning cost at first use; user effort stays on the task.
- Fails: products whose value is deliberately novel (novel games, expressive tools) — sameness removes the differentiation.
- Transfer: before inventing any navigation or flow, list where the user already does this task and copy its skeleton.

### L12B-2 Redesign incrementally — never swap a whole UI at once
- Problem [transcript 1:05:18–1:05:34, translated-from-hi]: "if you want to make changes inside your own app, make them little by little. Don't change your app's design all at once, which makes the user confused about where each thing was."
- Decision: staged rollout of UI changes; each change small enough that users keep their mental map.
- Reasoning: explicit — abrupt redesigns destroy learned location memory (his "which thing sat where" phrasing).
- Evidence: YouTube case [transcript 1:05:36–1:06:14]: old YouTube had "lots of different options" and a "bento-grid system" with many colors; Google saw managing the gaps/colors was hard for users, "wiped all the color white" and removed excess gaps so users "focus and streamlined watch videos." Frame `t01m05m50` shows the before/after pair: 2017-era YouTube (red sidebar blocks, dense menus) vs cleaner Material-era layout (same skeleton, red reduced to accents, flatter grouping) — same IA, calmer surfaces.
- Implementation: keep IA stable, restyle first; ship one surface at a time; preserve anchor elements (logo position, primary nav order).
- Effect: users keep orientation across versions; complaint volume stays low.
- Fails: true re-architectures where the old model is the problem — then guided migration (tours, old-version toggle) is required, which is exactly his "let people use the old version for a while" slide point 3 (`t01m04m30`).
- Transfer: applies to any product churn — feature moves, design-system overhauls, information reorderings: stage them.

### L12B-3 Law of Similarity: same look = same behavior; never style links like text
- Problem: users can't tell what is clickable or which controls behave the same.
- Decision [transcript 1:06:44–1:07:49, mixing read-off-English + Hindi explanation]: "use color, shape and size to show that things are related" · "buttons of the same color might do the same thing" · "make sure link and navigation buttons look different from normal text so people can easily see what they can click on" · don't change everything at once (color + shape + size all different = hard to choose); keep consistent size/stroke across email/password/name fields and the cancel/sign-in buttons.
- Reasoning: not stated in these words beyond the slide's grouping logic ("we like to group things that work similar together"); conveyed by worked examples.
- Evidence: `t01m07m10` (Gestalt similarity dot-matrix demo: columns group by color; a square converts two dots into a self-grouping sub-block) and `t01m07m42` ("Law of Similarity" slide: bad phone whose button pair is one filled + one dashed-outline vs good phone with a uniform pair; drawer-card with uniform dot/shape grid; slide text: "The human eye tends to perceive similar elements in a design as a complete picture, shape, or group, even if those elements are separated.").
- Implementation: one visual token per one behavior class (all destructive = one color; all links = underline/color distinct from body); uniform control dimensions inside a form.
- Effect: the interface explains its own interaction rules; scanning cost drops.
- Fails: token reuse as decoration (two different actions sharing one accent color) — similarity then lies to the user.
- Transfer: any component library work: define behavior classes before styling, then bind style tokens to classes, not to screens.

### L12B-4 Miller's Law: chunk information — and don't panic about the 7±2 cap if organized
- Problem: interfaces dump large information sets at the user.
- Decision [transcript 1:07:56–1:08:30, translated-from-hi + slide]: slide (`t01m08m55`): "The average person can only keep 7 (plus or minus 2) items in their working memory." His gloss: "don't limit your design just because people can only remember a few things at one time — sometimes more-in can be good if it's organized well… break information into smaller pieces that are easy to make and easy to understand for the user." Then the arithmetic drill: 7+2=9, 7−2=5, "everything beyond that you will neglect" (1:08:55–1:09:17).
- Reasoning: chunking works because organization, not raw count, drives recall.
- Evidence: `t01m08m55` (two phone grids of uniform tiles — dense but ordered; 7±2 formula card).
- Implementation: group long lists into named clusters of ≤9; hierarchy labels; progressive disclosure for the tail.
- Effect: dense screens stay learnable; lists stay scannable.
- Fails: chunking as an excuse to hide everything (buried navigation); miscounting "7" as a hard layout limit for recognition tasks (he himself warns).
- Transfer: menus, settings, forms, onboarding copy — any surface where options exceed a handful: organize first, cut second.

### L12B-5 Pareto Principle: spend design effort on the 20% of features that carry 80% of value
- Problem: effort gets spread evenly across features users barely touch.
- Decision [transcript 1:09:44–1:10:03, translated-from-hi]: "put most of your effort into the area that… the most people [use and] bring the biggest result… you have to focus on the things people actually require, rather than the things people won't actually use."
- Reasoning: explicit cause/effort asymmetry — with the flag parable: "nobody will look at your house, but they will definitely look at the flag on top of it — that's how your 80% of results come from your 20%" (1:10:07–1:10:24).
- Evidence: `t01m10m15` (outlined illustration: climber, mountain with flag; labels "20 Percent Causes" at the peak, "80 Percent Causes" at the base, "80 Percent Effective" near the top, "20 Percent Effective" at the bottom — the 80/20 crossing figure).
- Implementation: rank features by real usage; give the top ones the layout prime positions and the polish budget; starve the tail.
- Effect: perceived quality rises where eyes actually go; less rework on dead features.
- Fails: products where the "20%" is unstable — nascent usage data misleads; compliance-critical but rarely-used flows still need rigor.
- Transfer: any roadmap or screen: name the single 20% that earns the page, design it first.
- [interp] The flag parable is the same argument video-01's creator makes with "the highest-gains surfaces" — different phrasing, shared industry heuristic.

### L12B-6 Law of Proximity: space encodes relationships — and dense nav needs one container with a selected state
- Problem [transcript 1:10:43–1:11:56, translated-from-hi]: equidistant menu items build "no relationship with each other"; important info doesn't stand out.
- Decision: group related items by closeness ("objects close to each other are usually seen as a group… proximity helps users understand and organize information fast"); bold what is important, un-bold what isn't (1:11:43–1:11:56).
- Reasoning: slide-level grouping theory read off the deck and restated.
- Evidence: `t01m11m15` — the before/after nav demo: X-marked version = five separate blue button-boxes floating apart (Features/Solutions/Resources/Enterprise/Pricing); green-check version = the same five labels inside one continuous blue bar with the active item ("Features") underlined. This is the "selected area … the rest unhighlighted" moment he narrates at 1:11:26–1:11:41.
- Implementation: gap = grouping signal (item-gap < group-gap); current state marked inside the group rather than by isolating the item in its own box; typographic weight reserved for the key datum.
- Effect: relationships become pre-attentive; nav reads as one system with a position indicator.
- Fails: over-grouping — when everything is crowded together, everything relates to nothing; proximity cannot fix wrong IA.
- Transfer: every list/table/dashboard: audit gaps before adding borders — most "cards" only need whitespace.

### L12B-7 Tesler's Law: absorb the system's complexity in design; the credit-card form as canonical fix
- Problem: unremovable system complexity gets pushed onto users (forms ask what the system can infer).
- Decision [transcript 1:12:16–1:12:35, translated-from-hi, slide text read off]: "Take on as much complexity as possible during design and development so the user has less to deal with… Don't design products and services for a perfect-logic user because people don't always act that way." Plus: make help easy to find and relevant; provide tooltips with useful info (1:12:38–1:13:03).
- Worked example [1:13:05–1:13:48]: old pattern = "Select Card Type" dropdown + cardholder name + card number + expiry + code; new pattern = user types the card number and "the MasterCard or Visa or American Express automatically updates — complexity for the user went down," so the dropdown dies. One reminder field instead of a selector.
- Reasoning: complexity is a conserved quantity; the only choice is who carries it.
- Evidence: `t01m13m22` — top row: wrong form (Select Card Type → Cardholder Name → Card Number → Expiry/Sec.) vs right compact form (Card Number, Expiry MM/YY, Security Code only); bottom zoom: wrong "Card Type: Select One / Master Crad / VISA / American Express" dropdown (slide's own typo verbatim) vs right "Card Number: 6321 7346 •••• ••••" with auto-detected brand logos (Mastercard, VISA, American Express).
- Implementation: enumerate user inputs; delete every field the system can infer; keep inference visible (brand icon) for trust.
- Effect: shorter forms, fewer state errors; the product feels smart.
- Fails: inference you can't guarantee (unknown BINs) needs a graceful fallback — visible inference plus an escape hatch, not a silent guess.
- Transfer: any onboarding/checkout: first draft every form as "what can we detect instead of ask", then decide what must remain manual.

### L12B-8 The 7-stage design process — and when to graduate from style guide to design system
- Problem: beginners deliver pretty screens with no requirement work, and they build heavyweight systems for tiny projects (or none for big ones).
- Decision [transcript 1:13:51–1:20:01, translated-from-hi]: pipeline = Understand (client requirements → project goals → user needs → constraints) → Explore (competitor teardown, e.g. "Uber vs Careem — what does in-drive have that Careem doesn't"; design trends of the vertical's top brands; visual inspiration from Dribbble etc.) → Visual Design (wireframing/low-fi → client approval → high-fi → mockups on device frames "so the presentation is good") → Documentation (style & UI components) → Prototyping (interactive links, animation & transitions, flow & journey) → Reviews & Testing (test with users, gather feedback, analyze insights) → Iteration ("revise based on feedback — fix the button/color/animation — then deliver") → Complete & deliver.
- Sizing rule, explicit [1:16:24–1:17:32]: big project → "you must build a proper design system" with colors, typography, grid "all defined beforehand"; the payoff is stated with math: "if you have 100 screens and you need to change one button, you simply change it in your design system and it changes across all 100 screens." Simpler project — "a roughly 10-to-20-page site" → a style guide: "you do the company's branding — define its colors, its buttons."
- Reasoning: explicit (change-once-propagates-everywhere; presentation quality affects perceived quality).
- Evidence: `t01m15m45` (slide "3 Visual Design: 1. Wireframing 2. High-Fidelity Design 3. Mockups" over lo-fi/hi-fi mockup art), `t01m16m56` (slide "4 Documentation: 1. Style & UI components 2. Design system for complex projects 3. Style guide for simpler projects" over design-system sheets: type scale, color swatches, button states, grid, cards), `t01m19m19` (Spotify close-out: desktop library + mobile context menu used as the "everything follows the system" proof).
- Implementation: attach a deliverable per stage (requirement notes, moodboard/competitor sheet, wireframes, hi-fi, component sheet, prototype, test notes); pick documentation weight by screen count.
- Effect: reviewable checkpoints (client approves lo-fi before hi-fi — money saved on wrong directions); system consistency at scale.
- Fails: process theater on tiny projects; skipping Explore makes the design blind to the category's learned patterns (ties back to L12B-1).
- Transfer: this is a client-work SOP as much as a course outline — the stage list maps 1:1 to a freelance quote's milestones.

### L12B-9 Grids: the four-part pitch, the anatomy vocabulary, and "stay inside the grid"
- Problem: unaligned layouts and guesswork placement.
- Decision [transcript 1:20:51–1:31:49, translated-from-hi + slides]: why grids — slide `t01m21m00` verbatim: "1. A grid is like a plan for arranging things neatly. 2. It helps make designs look organized and clear. 3. Grids make some things stand out more than others. 4. They stop you from just guessing where things should go." Anatomy: rows vs columns; the gap between tracks = **gutter**; left/right outer space = **margin** (drilled twice, quiz-verified with students at 1:24:01–1:25:17). Types — slide `t01m23m05` verbatim: Manuscript (text-heavy documents), Column (organizing content into columns), Baseline (consistent typography alignment), Modular (objects in specified rows & columns), Hierarchical (organizing by importance, often on websites). Practice rule for web: 12-column grid; content lives inside it: "when you design a website you put your design inside this grid. You cannot go outside this grid… it's not a hard-and-fast rule [that you can never exit], but you keep your design properly aligned" (1:28:06–1:30:47).
- Reasoning: alignment discipline replaces per-element guessing; the "design leaving the grid even 1% means my design isn't good" (1:30:33–1:30:38) is immediately softened to a guideline, not law.
- Evidence: `t01m22m07` (Figma course file, "Anatomy of Grid" frame: Row Grid / Column Grid blocks with callouts "gutter or alley" and "margin"; next frame's type list visible), `t01m23m05`, `t01m27m50` (layout-grid settings: Columns, Count 12, Color 0026FF 10%, Type Stretch, Margin 100, Gutter 20), `t01m30m45` + `t01m31m25` (real desktop+tablet site with 12-column overlay on, then hidden — same design, visibly organized).
- Implementation: Slides/manuscript → single text block; product/web → 12 columns; editorial typography → baseline; card matrices → modular; dashboards → hierarchical. Then translate to Figma per L12B-10.
- Effect: consistent margins/gutters across breakpoints; hierarchy from placement instead of decoration.
- Fails: treating the grid as a cage for hero/full-bleed moments; grid without hierarchy (columns ≠ importance).
- Transfer: any design tool, any medium — name margins/gutters once, then never adjust per-element again.

### L12B-10 Save the grid as a reusable Figma style; set Stretch so it survives resizing
- Problem: rebuilding layout grids frame-by-frame (100 screens) is wasted motion; grids anchored left break when frames move.
- Decision [transcript 1:25:18–1:30:16, translated-from-hi]: press F → new frame → Layout grid → choose **Columns**, set Count (demoed 2/3/4/5… "it's up to you", landing on 12 for web), Color (any — "no hard and fast rule", frame `t01m27m50` shows blue at 10%), Type = **Stretch** "so if we move [the frame] it moves with our canvas properly", Margin (demoed 100 / 200 / 50, then "%"), Gutter (demoed 20/30). Add a second grid of Rows for vertical rhythm; combine both ("rows and columns together… this becomes an actual system", 1:29:21–1:29:21). Then open the layout-grid panel's options → **Create style** (1:29:37–1:29:52): "if you have 100 screens… you can use it like this on any page" (1:30:12–1:30:16).
- Reasoning: not stated beyond efficiency ("auto layout is used to fast/boost our work" is its sibling claim — same logic applies to grid styles).
- Evidence: `t01m27m50` (settings popover mid-demo: Count 12, Stretch, Margin 100, Gutter 20; frame showing the column overlay), `t01m30m45` (`AliTheDesigner` site: right panel lists **1 row (100px)** + **2 columns (32px)** + **12 columns** — three saved grids applied to one desktop frame; pink column overlay visible), `t01m31m25` (same frame, grids hidden).
- Implementation: one grid style per breakpoint (desktop 12-col, tablet fewer — he shows the tablet variant of the same site), name it, apply set-wise; keep a row-grid for baseline spacing.
- Effect: file-wide consistency; onboarding new screens takes one click.
- Fails: styling the grid color at 100% opacity ("color is just for you, change it as you like" — keep it ≈10% or it pollutes presentation exports).
- Transfer: any Figma file — the first setup step is grid styles + text/color styles before screen one.

### L12B-11 Color theory as a pick-a-relationship system: wheel position defines the palette
- Problem: beginners pick colors by taste and end up with incoherent sets.
- Decision [transcript 1:31:49–1:38:23, mostly the embedded English presentation; slides cited directly]: color theory = "a practical combination of art and science used to determine what colors look good together" — "It is the study of colors' similarity and relationship"; the color wheel "is the basis of color theory because it shows the relationship between colors", mapped by Newton (`t01m33m30`, with Primary/Secondary/Tertiary wheels). Models: additive RGB (light) vs subtractive CMYK (ink). Temperature: cool = blue/green/purple, warm = red/orange/yellow. Then the harmony menu: **complementary** (opposite pairs — "red and green create a very good impact… a creative look"), **split-complementary** (one color + the two neighbors of its opposite), **analogous** (three adjacent hues, `t01m36m57`), **triadic** (three evenly spaced), **square** (four evenly spaced), **monochromatic** — `t01m37m58` formula slide: HUE; TINT = hue + white; TONE = hue + gray; SHADE = hue + black.
- Reasoning: not argued — presented as vocabulary; his Hindi gloss emphasizes impact ("good impact… separate creativity comes out from these") rather than technique.
- Evidence: `t01m33m30`, `t01m36m57`, `t01m37m58` as above.
- Implementation: start from one base hue; get its partners from wheel relationships (complement for accents/CTA, analogous for ambient surfaces, monochromatic ramp for states); mind medium (screen RGB vs print CMYK).
- Effect: instant internal consistency; a shared language for review ("that's a split-complementary accent").
- Fails: harmony math without contrast/quantity control — complementary pairs at equal weight vibrate; slide typos ("Isaa Newton", "Teritary") signal the deck is stock, so verify ratios elsewhere.
- Transfer: any palette task — name the wheel relationship before opening a color picker.

### L12B-12 Auto layout is the responsiveness engine: Shift+A, hug vs fill vs fixed, wrap, negative spacing, stacking
- Problem: static Figma frames break at every resize; manual spacing never stays equal.
- Decision [transcript 1:38:23–1:52:55, translated-from-hi]: purpose first: "auto layout is used to make our work fast, to boost our work" (1:38:30–1:38:35). Mechanics: select children → **Shift+A** (repeated as a drumbeat through the whole build); width/height = **Fixed vs Hug** (hug wraps the frame around content) vs **Fill** — "we'll learn with Fill, we'll need it later" (1:40:50); min/max constraints ("not used much, so I remove them", 1:41:18); lock aspect ratio for equal W/H moves; **Wrap** = no space → item drops to the next line (1:41:54–1:42:22); gap = manual number or **Auto** (auto redistributes when the frame resizes, 1:42:52–1:43:07); padding via the four-individual-values toggle (zero out three sides); alignment top/center/bottom. Special moves: **negative gap** for overlap → "canvas stacking" (three circles at −58 gap, `t01m51m54`; "last on top / first on top" picks which layer leads, 1:51:44–1:52:09); **baseline alignment** snaps text to its baseline vs center (1:52:23–1:52:52); ellipse **arc** sweep + stroke = a loading spinner (1:47:44–1:49:12).
- Reasoning: explicit — predictability under content change; "if the content on the website is more, this adjusts it properly" (1:42:17–1:42:25).
- Evidence: `t01m40m03` (Heading 1+Heading 2 just wrapped by Shift+A; badge "779 Hug × 86 Hug"; auto-layout panel values live), `t01m42m04` (wrap: a duplicate Heading 2 pushed below; selection "779 × 86"), `t01m46m45` (Sign In buttons; auto-layout panel W/H both **Hug**, gap 10, individual padding 40/32), `t01m51m54` (negative-gap circles, panel gap −58).
- Implementation: build every repeating element as an auto-layout frame from its first iteration; hug by default, fill the axis that must stretch; never hand-place siblings.
- Effect: components resize like real UI; spacing equality is guaranteed, not eyeballed.
- Fails: absolute artwork (icons, badges) inside auto-layout frames needs the escape hatch — see L12B-15; deep nesting with mixed hug/fill gets hard to reason about without naming layers.
- Transfer: this whole skill block is tool-specific Figma practice, but the model (container → content relationship) maps to flexbox/CSS the course's audience will meet later.

### L12B-13 Small-component craft: match a reference's paddings, tint the shadow to the fill — and never use full black
- Problem: default text-on-rectangle buttons look dead ("proper look-and-feel is not coming… because we didn't give it proper space on the left and right", 1:45:24–1:45:30, translated-from-hi).
- Decision [transcript 1:44:24–1:47:33]: T → type "Sign in" → Shift+A → **eyedropper (I)** to lift the exact fill from a reference button → set matching paddings "40 left/right and 32 top/bottom" (`t01m46m45` panel confirms 40/32), matching corner radius (reference 30, copy 30, 1:45:53–1:45:59) → add **drop shadow inside the button's own hue** ("what color was the shadow on theirs? green — we also keep green", 1:46:28–1:46:34): raise blur/opacity (~80–90%) so it reads as glow (`t01m46m45` shows the teal Sign In gaining a green 07FF01 90% shadow vs the flat original). And the color rule: **"if you're going to use a color in your website, don't use full black — use dark gray"** (1:47:23–1:47:33, translated-from-hi); explanation: the darker button looked worse partly because its text sat at "exact black" (1:47:21–1:47:25).
- Reasoning: explicit — "the bottom button looks more attractive than the top… because we played with the same color combination" (1:47:15–1:47:19); consistent hue in fill + shadow = cohesive glow; pure black is harsher than needed on screens.
- Evidence: `t01m46m45` (before/after Sign In pair; drop-shadow popover X 14 Y 12 Blur 7 Spread 0 Color 07FF01 90%; panel paddings/radius live).
- Implementation: build one reference "golden" component; copy paddings/radius/shadow-tint from it to every sibling; replace #000 with a dark-gray token for text and even for near-black surfaces (he uses #222222 on the card, verified in `t02m04m35` fill).
- Effect: buttons stop looking pasted-on; the glow trick adds perceived interactivity at zero layout cost.
- Fails: tinted shadows on neutral-gray UIs (tint noise); copying a reference's exact 40/32 when your button is a different size — proportions, not absolutes, once you outgrow the exercise.
- Transfer: any design system: define shadow tokens in brand hue variants, and a "black substitute" gray token on day one.

### L12B-14 Assemble the responsive card: Fill on the stretchy axis, Hug elsewhere, individual padding to pin, and the "hug is best practice" default
- Problem: the rebuilt card doesn't move when the frame resizes (2:00:13–2:03:05, translated-from-hi: "if I move this… nothing happens") because the image and containers were **Fixed**.
- Decision [transcript 1:52:56–2:06:12]: rebuild the reference card (`t01m53m05`: photo + bell icon + teal "New" pill + "Best Ford Car" + "$199" + teal "Buy now") with: picture dragged in or pulled via the **Unsplash plugin** (1:53:26–1:53:40); right-click → **Frame selection**; rectangle beneath → eyedropper to lift colors → move layers into the frame and color the content wrapper's fill instead of a separate rectangle (2:01:03–2:01:20); badge button with pill radius 40–50, font Clash Display 30 (1:55:43–1:56:00); heading via **Title Case** toggle "rather than capitalizing each one by hand" (1:56:43–1:57:01) at Clash Display SemiBold 90 (1:57:03–1:57:14); Auto-width text where the canvas should follow content (1:57:40–1:57:51). Spacing discipline: after any fixed-size mistake, **"we leave this on Hug — this is a best practice" rather than fixing sizes and nudging manually** (1:59:10–1:59:24). Then the responsiveness fix: select the image → width/height = **Fill container** (2:03:23–2:03:53); align content top-left and pin the free edge with **individual padding** (left 80, adjust top — `t02m04m35` shows the Content frame's left padding 71 being tuned, Fill-width); Buy Now: remove its inner auto layout, set **Fill container** + right padding 80 so it pins to the card's right edge (2:05:25–2:05:57). Result: "now our design is responsive, you can resize it however you like — your design will not get disturbed" (2:06:00–2:06:12).
- Reasoning: explicit for hug ("best practice"); for fill the reasoning is structural — fill ties the child's size to the parent, so one resize propagates.
- Evidence: `t01m53m05` (reference Card, 1024×1204, radius 30, clip content), `t01m57m02` (mid-build: teal New pill above; "Best Ford Cars" text selected showing Clash Display Medium 30 at 218×37 — caught just before the 90px SemiBold upgrade two seconds later), `t02m03m35` (rebuild Frame 427318271 vs reference; layer tree Big Image + Content; panel W1262 H "172… Hug"; dragging width), `t02m04m35` (Content auto-layout: W Fill(1529) × H 633; individual paddings 10/71/10/10; card fill #222222).
- Implementation: choose per-axis: hug (wrap content), fill (span parent), fixed (rare, by intention); nest auto layouts (text→button→row→card) instead of grouping; color the wrapper, not overlay rectangles.
- Effect: one card component that survives any width; edits stay visual because structure carries the spacing.
- Fails: fill on both axes of nested frames can fight (max-height leaks) — that's why min/max got a mention and quick dismissal; hand-tuned values not stored as styles don't scale past one card.
- Transfer: the fill/hug/pin trio is the Figma dialect of flexbox — the same decisions (flex-grow, padding one-side, sticky CTA) govern real front-end work.

### L12B-15 Floating elements break auto layout on purpose: absolute position ("ignore auto layout") + constraints; source icons from plugins/libraries
- Problem: a notification bell belongs at the photo's top-right corner, but auto-layout frames force every child into the flow ("if auto layout is on your frame, it never lets you paste this design anywhere you like", 2:07:16–2:07:26, translated-from-hi).
- Decision [transcript 2:06:12–2:08:06]: icons come from the **Flat Icon plugin** or Figma's **asset libraries** ("iPhone, iPad libraries are already here — click, add to your library, then use", 2:06:37–2:06:56); paste the icon in → in the Position controls click **Absolute position / ignore auto layout** ("whatever you want, you can now move it freely", 2:07:33–2:07:38) → then set **constraints Right + Top** so it hugs that corner when the card resizes ("fixed on right and top… so it moves with the right, not toward the left", 2:08:27–2:08:46, tail continues in Part C).
- Reasoning: stated functionally — auto layout owns normal children; absolute position is the sanctioned exception for overlays; constraints answer "what happens on resize", which auto layout alone doesn't.
- Evidence: `t02m07m40` (bell icon "Example 4" selected on the rebuilt card at 147×147, panel: auto layout with padding 10, corner 107, fill #151515; positioned top-right of the photo — directly beside the reference card; the layers tree shows Example 4 as a sibling of the flow children), and `t02m04m35` showing the card's cleaned in-flow structure (Big Image + Content) before the icon layer was added.
- Implementation: overlay = absolute position + anchoring constraints; everything else stays in flow. Sources for icons: plugin search or bundled device libraries; wrap imported icons in their own auto layout (147×147, padding 10) to standardize touch size.
- Effect: badges/avatars/floating CTAs work without breaking the responsiveness built in L12B-14.
- Fails: absolute-positioning everything (loses the whole point); forgetting constraints — the icon stays glued to the left on resize.
- Transfer: same pattern in CSS — absolutely positioned badge with top/right anchors inside a relatively positioned parent; "don't fight the layout engine, exempt the overlay" is the transferable rule.

## Creator tendencies observed in this range (feeds creator-profiles.md)

- Vocabulary-then-practice rhythm: every law/type/property gets a definition slide, a Hindi re-explanation, a product example, and only then a hands-on drill — the quiz pauses (1:24–1:25) make the classroom lecture-style explicit.
- English slide, Hindi voice: slides stay in English (career-relevant vocabulary), spoken teaching lands in Hindi/Urdu code-switching ("hug kar dete hain", "fill container pe click karo").
- Numbered-pipeline obsession: UI process (1→7 stages), grid types (1→5), color harmonies (1→7) — courses-of-tools taught as lists with a worked example each.
- Real-product induction unchanged: YouTube (redesign), Spotify (system proof), Uber/Careem/in-drive (competitor analysis), Mastercard/VISA/Amex (form inference).
- Tool pedagogy = shortcut first: Shift+A, T, R, I, F, Alt-drag duplicates are named and drilled; every panel value typed live (paddings 40/32, gap −58, radius 30/50).
- Rules stated then softened by himself: "can't leave the grid" → "not a hard-and-fast rule"; hug as "best practice" — a teaching pattern of absolutist hook + honest caveat.
- Recycled course infrastructure: the same Figma file "UIUX Design Long Course" (tab "— Gird Syst" [sic]) carries slide frames and exercises; the color-theory video is a stock deck with typos ("Isaa Newton", "Master Crad", "Teritary"), not author-made.

## Unverified / not analyzed (transcript-only in this range)

- Understand (#1) and Explore (#2) process slides (1:14:16–1:15:30): content conveyed in speech only; frames extracted for stages 3 (1:15:45) and 4 (1:16:56) — stage 1/2 screens never framed.
- Process intro visual (1:13:51–1:14:15, "a picture… a group stuck in a difficult situation" = the rope/tangle metaphor): transcript-only.
- Prototyping (#5) and Reviews & Testing (#6) slides (1:17:34–1:19:17): audio walkthrough verified; their slide layouts never framed (Spotify slide at 1:19:19 is framed instead).
- Color theory: complementary, split-complementary, triadic, square, and warm/cool moments (1:34:46–1:37:25) replayed from the embedded presentation; verified the presentation's style + three of its slides (wheel, analogous, monochromatic) — the five other harmony slides are transcript-only in this part.
- The 1% margin claim (1:27:42–1:27:45, "I give it 1% margin") — percent margin mentioned verbally; the framed settings show margin 100 (pixels), so the % variant is transcript-only.
- Grid-line exercise ("I want nothing to go past this line", 1:21:35–1:21:42): speech over the slide, no frame.
- Unsplash plugin window (1:53:26–1:53:40) and the Figma assets/iPhone/iPad library picker (2:06:37–2:06:56): described in speech; the framed moments show the card and the pasted icon, not the plugin/library windows.
- Classroom students: quiz voices only; never on camera, never counted — "students answer gutter/margin" is audio evidence.
- Spotify claims ("one color", "the song name you played stays prominent" 1:19:20–1:19:36): his interpretation of a screenshot; the frame verifies the screenshot, not his reading of it as a design fact.
- Performance/speed claims ("auto layout boosts our work") are pedagogical assertions without measurement.

## Quotable diagnostics (translated-from-hi unless marked "slide")

- Slide: "Users spend most of their time on other websites, so they want your site to work like the ones they already know." (1:04+)
- "Don't change your app's design all at once — the user gets confused about which thing sat where." (1:05:30)
- Slide: "The human eye tends to perceive similar elements in a design as a complete picture, shape, or group, even if those elements are separated." (1:07:42)
- Slide: "The average person can only keep 7 (plus or minus 2) items in their working memory." (1:08:55)
- "Put most of your effort into the area that brings the most people the biggest result." (1:09:44)
- "Nobody will look at your house — but they will definitely look at the flag on top of it." (1:10:16)
- "Try to take on as much complexity as possible during design and development, so the user has less to deal with." (slide read-off, 1:12:16)
- "As soon as a number is entered, the MasterCard or Visa or American Express automatically updates — complexity for the user went down." (1:13:26)
- "If you have 100 screens and you change one button once in your design system, it changes across all 100 screens." (1:17:03)
- Slide: "They stop you from just guessing where things should go." (1:21:00)
- "You cannot go outside this grid… but it's not a hard-and-fast rule — you keep your design properly aligned." (1:28:06 → 1:30:38)
- "If you want to use any color in your website, don't use full black — use dark gray." (1:47:29)
- "We leave this on Hug. This is a best practice." (1:59:13)
- "My card is fully responsive only by using auto layout. It's not rocket science — it's very easy." (1:53:10)
- "Auto layout never lets you paste [an element] anywhere you like — so you click Position: ignore auto layout, and now you can move it wherever you want." (2:07:18–2:07:38)
