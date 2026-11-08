# Research Notes — Video 06

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/GGg61sdEjeI
- Title: "This UI/UX Redesign Will Teach You More Than 100 Tutorials Combined"
- Creator: uxpeak (design-teaching channel)
- Duration: 13:32 · Published: 2026-08-27 · Views: ~520k · Likes: ~14.1k
- Classification: standalone mobile e-commerce redesign critique (not the course)
- Access: transcript (En auto-captions) + 28 frames viewed at 720p from full video
- Subject: full teardown → rebuild of one mobile product page ("Organic Strawberries - 1 kg",
  organic food shop). 15 numbered mistakes fixed, then 3 advanced improvements layered on top.

## Structure (chapters verified in metadata)

0:00 Identifying UX problems → 0:37 Fixing icons and images → 2:00 Visual design principles →
3:34 Color and typography → 4:51 Text and content refinement → 6:51 Trust signals and layout →
8:21 Simplifying UI elements → 10:16 Optimizing purchase actions → 11:33 Advanced UX improvements

Sponsor/self-promo segments: Mobbin pitch ≈1:28–2:00 (not frame-analyzed); uxpeak+ platform
pitch ≈7:48–8:19 (frame `t00802m` verified — website examples + "Website" pill; treated as ad,
not mined for lessons).

## Teaching format

Quiz-first redesign. Opens with the broken page: "pause and count the mistakes" (creator claims
15, "some are obvious, some are much easier to miss"). Then one mistake at a time — each gets a
name, a diagnosis on the live mock, and an immediate fix. Figma-like workspace: phone mockup with
9:41 status bar, floating purple tool rail, annotation callouts ("largest element", "Section
Spacing", "Primary", "Contrast ratio: 1.60 : 1", red X marks) and teaching diagrams (wireframe
reference layout, type specimen) between UI states. The last third goes "beyond fixing what is
broken" into scroll/sticky/preset interaction improvements.

## Lesson log

### L06-1 Overlays on media must survive every image, not the one you designed with
- Problem: back + menu icons sit directly on the full-bleed product photo; readable only because
  that photo is dark. Swap to a bright pineapple and "the icons almost disappear" (0:55).
- Decision [transcript 1:09–1:21]: subtle background container behind the icons + enough contrast
  + thin outline, so they stay readable on any asset.
- Evidence: `t00045m` (yellow icons on dark strawberries) → `t00057m` (same icons on bright
  pineapple, nearly invisible) → `t00117m` (fix: dark glyphs in white circular scrims working on
  the same bright image).
- Reasoning (explicit 1:22–1:28): "This is the difference between designing for one screen and
  designing for a real product system."
- Implementation: circular white scrim + subtle shadow + dark glyph; color carried by the scrim,
  not the icon.
- Fails: intentionally edge-to-edge cinematic imagery with its own baked-in scrim.
- Transfer: any content-over-media pattern (carousel arrows, video controls, favorite/save) must
  be tested against the brightest, busiest, and cleanest asset the system allows.

### L06-2 Pick product imagery for the catalog, not for the hero shot
- Problem [2:00–3:32]: six candidate strawberry images (A–F). A too busy (no focal point), B
  focuses hands not product, C shows one strawberry while product is sold by weight (mental
  mismatch), D's pink bg feels artificial for organic food, E is beautiful but won't composite
  into a grid of assortedly-styled shots.
- Decision: F wins — natural subject, clean neutral background, repeatable as a system.
- Evidence: `t00212m` (image annotated "largest element" on the page via measurement rail),
  `t00320m` (F in a wicker basket on clean bg, "F" badge + approval stamp).
- Reasoning (explicit 3:26–3:31): "A good product image is not just beautiful by itself. It also
  has to work inside the full shopping experience."
- Effect: consistent tile grid possible; product is the focus.
- Transfer: listing/product imagery needs a style rule (background, lighting, framing) so many
  tiles read as one shelf; judge candidates in the grid context, never solo.
- [interp] The catalog-grid context is argued verbally; the video never renders the multi-product
  grid at this point (see Unverified).

### L06-3 Snap everything to one alignment grid — margins consistent (24px example given)
- Problem [3:34–3:56]: elements drift slightly left/right; spacing inconsistent.
- Decision: define consistent margins ("if the content starts 24 pixels from the left, it should
  follow the same structure across the screen") and snap text/icons/prices/buttons/sections.
- Evidence: `t00344m` — "Reference Layout" wireframe diagram labeling the page anatomy: CATEGORY
  LABEL, PROMOTION BADGE, PRODUCT TITLE, description paragraph, SOCIAL PROOF, PRODUCT ATTRIBUTES
  row, PRICE: TOTAL + stepper, ADD TO CART; "Section Spacing" callout.
- Reasoning (explicit 3:53–3:57): misalignment isn't consciously noticed, but the screen "feels
  less calm, less structured, less trustworthy."
- Effect: page "instantly feels more balanced, more intentional, more professional" (4:11).
- Transfer: before restyling anything, fix the grid; alignment is the cheapest trust win.

### L06-4 Color supports the product, never overpowers it
- Problem [4:17–4:30]: colors "too bright, too saturated, emphasize the wrong things" → harder to
  read + weak hierarchy (everything competing).
- Decision: softer, natural palette. Neon-green FRUITS label and bright-green ADD TO CART become
  muted olive; feature icons lose their rainbow.
- Evidence: `t00427m` (before — callout tooltip "Contrast ratio: 1.60 : 1" with red X on the
  green label; all-caps neon CTA), `t00444m` (after — olive CTA, calm label, 5-swatch muted
  palette popover).
- Reasoning (explicit 4:33–4:49): "the color should support the product. They should not overpower
  it… good color sets the mood, supports the product, and helps users focus on what matters."
- Accessibility angle: the 1.60:1 contrast readout frames saturation as a legibility failure, not
  just taste.
- Fails: brands whose identity is deliberately loud; the hue logic must be re-derived per brand.
- Transfer: reserve high-chroma for one primary action per screen; category labels/decorative
  text go muted and dark enough to read.

### L06-5 One font family; hierarchy from size, weight, color, line-height
- Problem [4:51–4:59]: too many font styles, inconsistent type.
- Decision: simplify to a single family — **Lato** (named at 5:12) — hierarchy built from scale/
  weight/color/line-height instead of more fonts.
- Evidence: `t00508m` — type-specimen diagram ("Heading & / Subheading" + paragraph, horizontal
  metric lines showing size steps and baseline rhythm).
- Reasoning (explicit 5:02–5:07): "In most cases, one strong font family is enough."
- Transfer: audit font-count first; extra families almost never buy hierarchy you can't get from
  size/weight/color.

### L06-6 Small caps labels: letterspace; badges must scan in one glance
- Problem [5:20–5:39]: "FRUITS" cramped; discount badge says "20% OFF DISCOUNT" plus an icon —
  "too much for a small label."
- Decision: add letter-spacing to small uppercase labels; badge trimmed to "20% off" (icon
  dropped).
- Evidence: `t00531m` (before: cramped label, long badge with icon), `t00556m` (after: tiny red
  "20% off" pill, letterspaced FRUITS).
- Reasoning (explicit 5:39–5:47): badges "should be quick to scan… no longer stealing too much
  attention from the product itself."
- Transfer: labels are interfaces, not sentences — a badge that needs reading twice has failed.

### L06-7 Title: stand out without shouting
- Problem [5:50–6:08]: title bold but wrong size/weight "do not create the right hierarchy."
- Decision: adjust size and weight so the title reads as a primary element "more natural inside
  the layout."
- Evidence: `t00556m` — purple "Primary" tags mapped to exactly three primaries on the page:
  product image, product title, ADD TO CART (title highlighted with bounding box + leader line).
- Effect: "easier to read, easier to scan, and much better balanced."
- Transfer: define the 2–3 primary elements per screen and spend type scale only on them.

### L06-8 Paragraph text: raise line-height, lower contrast; bodies support, headlines sell
- Problem [6:18–6:31]: lines too tight, description fights for attention.
- Decision: increased line-height, slightly reduced contrast (gray body text).
- Evidence: `t00628m` — line-height guide lines drawn between paragraph rows + side diagram
  ("easy to read" = spaced thick bars).
- Reasoning (explicit 6:41–6:45): "headlines attract attention, paragraphs support understanding."
- Fails: legal/critical text that must be read word-for-word (keep full contrast there).
- Transfer: any secondary text block gets the 3-tuple: more leading, softer color, shorter copy.

### L06-9 Put the strongest trust signal next to the identity: rating directly under title
- Problem [6:51–7:08]: rating too far from product title; "when users see the product name, they
  should also quickly see how well it's rated. What is it and can I trust it?"
- Decision: move star rating + "4.8 (89 reviews)" to sit immediately under the title.
- Evidence: `t00705m` (before: rating below a divider under the paragraph) → `t00720m` (after:
  stars + 4.8 (89 reviews) as the line directly under "Organic Strawberries - 1 kg").
- Reasoning (explicit 7:20–7:25): "Good UI is not just about arranging elements. It's about
  placing information where the user needs it most."
- Effect: user grasp three facts in one fixation — what it is, how it's rated, whether others
  trust it → buying decision feels easier.
- Transfer: cluster identity + social proof + (for commerce) price into the first screenful.

### L06-10 Feature icons: one style, few colors, tight spacing
- Problem [8:21–8:40]: benefit row mixes heavy/light, filled/outlined, multi-colored icons.
- Decision: simplify colors, make style consistent (one outline style, olive family), tighten
  spacing; restyle from captioned 2×2 icon-text grid to a 4-column icon strip (Organic / Fresh /
  Free delivery / Mexico).
- Evidence: `t00831m` (inconsistent icons crossed out with red X), `t00904m` (after: uniform
  outline icons with labels beneath in one tint).
- Reasoning (explicit 8:40–8:56): "icons should share the same visual logic… different colors can
  be used, but they need to be used intentionally."
- Transfer: before adding sections, normalize iconography; mixed icon styles read as multiple
  authors, i.e. untrustworthy.

### L06-11 Quiet the dividers; make spacing express relationships
- Problem [8:58–9:21]: dividers "extremely dark and heavy… page starts to feel divided into harsh
  blocks instead of one smooth experience." Then [9:22–9:40] some section gaps too large — layout
  disconnected.
- Decision: soften dividers to hairlines; tighten spacing so related sections sit closer.
- Evidence: `t00904m` (dark rules around icon row) → `t00916m` (softened hairlines, tinted icon
  band) → `t00929m` (side diagram: sections-as-blocks pulled together with weight lines).
- Reasoning (explicit 9:17–9:21 and 9:41–9:46): "small details are often what make an interface
  feel premium"; "Good spacing is not just about adding more empty space. It's about creating the
  right relationship between elements."
- Transfer: proximity + hairlines > boxes + heavy rules, for sequential content.

### L06-12 Delete redundant labels — label only what's ambiguous
- Problem [9:47–10:08]: literal "Price:" label before the number; currency symbol already says
  it. Consistency argument (explicit 10:01–10:08): "if you want to be super accessible and label
  the price, then logically we should also label the quantity selector next to it. Otherwise the
  interface becomes inconsistent."
- Decision: remove the label; "let the price speak for itself."
- Evidence: `t00955m` (label flagged in red on the mock) → `t001022m` (price row now just
  "$6.2  $7.2  – 1 +").
- Transfer: audit every label: if the datum self-identifies (currency, date, units), the label is
  noise.

### L06-13 Never bake mutable state into the title; surface the price early
- Problem [10:16–10:47]: title says "1 kg" but the quantity selector can change it → misleading;
  and price sits far down the screen.
- Decision: title describes the product only ("Organic Strawberries"); quantity lives in the
  buying area; price moves up under the rating, with unit made explicit ("per kg") and cents
  formatted ($6.20 vs $6.2).
- Evidence: `t001022m` ("1 kg" selected for deletion in title), `t001110m` (price block now
  "$6.20 $7.20 per kg" directly above description, stepper top-right).
- Effect (explicit 10:50–10:56): user sees "what it is, how good it is, and how much it costs"
  immediately.
- Fails: fixed-bundle products where size truly is part of the identity.
- Transfer: titles = identity, selectors = state, price = its own first-class element near the
  identity cluster.

### L06-14 Purchase cluster: refined CTA + adjacency + unit in the selector + total in the button
- Problem [10:57–11:28]: ADD TO CART all-caps and huge — "feels like it's shouting"; selector far
  from the button; no unit; no total.
- Decision: sentence-case refined "Add to cart"; quantity selector placed beside it ("they choose
  how much they want, then they add it"); unit "kg" inside the selector; computed total inside the
  CTA.
- Evidence: `t001110m` (softened button), `t001127m` (side-by-side "– 1 kg +" + "Add to cart · $"
  as the total loads).
- Reasoning (explicit 11:27–11:32): "the user knows what they're about to pay before they click.
  That removes uncertainty."
- Transfer: commitment removal = show the exact consequence on the action itself; group controls
  in operation order.

### L06-15 Content as scrollable card over media + sticky product title in nav
- Problem: after repairs the page is flat scroll that loses context.
- Decision [11:46–12:15]: content becomes a soft rounded card ("subtle shadow") that slides up
  over the product image; when scrolled past the image the product title transitions into the top
  nav and stays sticky.
- Evidence: `t001205m` (rounded card overlapping the strawberry photo), `t001220m` (deep in the
  related-products grid, top nav shows "← Organic Strawberries ♡").
- Effect: "even when the user scrolls deeper into the page, they never lose context" (12:12).
- Fails: very short pages where sticky chrome costs more than it saves.
- Transfer: persistent identity + persistent primary action are the two things a long commerce
  page must never lose.

### L06-16 Sticky bottom purchase bar — buy wherever the decision happens
- Decision [12:16–12:42]: quantity selector + add-to-cart docked to the bottom, always visible.
- Explicit reasoning: "users don't always decide to buy at the top of the page. Sometimes they
  scroll, read more details, look at related products. And when they finally feel ready, they can
  act immediately."
- Evidence: `t001300m` (docked stepper "– 3 kg +" + "Add to cart · $18.60").
- Transfer: the action bar should follow the user's decision point, not the author's layout.

### L06-17 Predefined quantity presets derived from purchase data
- Decision [12:43–13:08]: "Choose weight" chips — 0.5 kg Snack $3.10 / 1 kg Regular $6.20 /
  2 kg Family $12.40 / 3 kg Party $18.60 — one tap for common amounts, keyed to what most
  customers buy; custom stepper kept for flexibility.
- Evidence: `t001245m` (title card "Improvement 3 — Predefined quantity"), `t001300m` (preset
  cards with per-size prices and Cartoon-names; 3 kg selected drives CTA total).
- Effect (explicit): "a small UX improvement with a real business impact."
- Fails: datasets without meaningful modal quantities.
- Transfer: replace multi-tap steppers with data-backed presets + custom fallback; presets can
  carry persona labels and per-unit pricing.

## Frame-verified changes the narration does not call out (for completeness)

- Paragraph copy is rewritten between 6:28 and 7:05 from a technical description ("Grown without
  the use of synthetic pesticides and fertilizers…") to a short friendly one ("Grown without pesky
  synthetic pesticides and fertilizers. These fresh strawberries are packed with natural nutrients
  and a delicious taste.") — no spoken mention. Frames `t00628m` vs `t00705m`.
- Feature benefits are restyled a second time from the 4-column icon strip (`t00904m`) into rounded
  chips ("Free delivery / Organic / Fresh / Produced in Mexico") in the final state (`t001300m`) —
  un-narrated.
- An "Often bought with" related-products grid is added in the improvements phase with catalog-
  consistent basket photography (`t001205m`, `t001220m`) — narrated only in passing ("look at
  related products", 12:31).

## Creator tendencies observed (feeds creator-profiles.md)

- Quiz hooks + comment CTAs at open and close ("how many of the 15 mistakes did you spot?").
- Numbered mistake list as spine; each mistake = name → diagnosis on live mock → fix, with
  annotation callouts (contrast ratios, selection boxes, red X, "Primary" tags) as proof devices.
- Teaching diagrams (wireframe reference layout, type specimen, bar/spacing charts) inserted
  between UI states to convert a tweak into a principle.
- Light lilac Figma-like workspace, 9:41 iPhone mockups; motivational gags (approval emoji,
  eyeballs) as pacing.
- Sells in two self-placed ad breaks (Mobbin, uxpeak+) with explicit codes; both clearly signed.
- Final claim ties design to business outcomes ("design that scales beautifully across different
  products", 13:09).

## Unverified / not analyzed

- Mobbin sponsor segment ≈1:28–2:00: transcript-only, no frames extracted (sponsor rule).
- The "at least 15 mistakes" count slide (0:13–0:18) not verified frame-by-frame (frame `t00008m`
  catches the paused intro overlay only).
- The "six restaurants/products in a grid" catalog argument (3:06–3:24) is verbal; the video shows
  no multi-product grid at that moment to verify the claim visually.
- Exact Figma/video editing technique for the mock swaps not shown; only resulting states verified.
- The intro mock (0:00–0:08) shows the pre-redesign page blurred behind a pause glyph; its fine
  detail was taken from later close-ups instead.

## Quotable diagnostics (explicit)

- "If you found at least 10 mistakes, congratulations, you are a great designer." (0:13)
- "This is the difference between designing for one screen and designing for a real product
  system." (1:22)
- "A good product image is not just beautiful by itself. It also has to work inside the full
  shopping experience." (3:26)
- "When alignment is off, users may not consciously notice it, but they feel it." (3:53)
- "This is what good color does. It sets the mood, supports the product, and helps users focus on
  what matters." (4:42)
- "Headlines attract attention, paragraphs support understanding." (6:43)
- "Good UI is not just about arranging elements. It's about placing information where the user
  needs it most." (7:22)
- "Small details are often what make an interface feel premium." (9:17)
- "Good spacing is not just about adding more empty space. It's about creating the right
  relationship between elements." (9:41)
- "This is where many redesigns stop… strong product design is not just about fixing what is
  broken. It's about making the whole experience feel easier." (11:33–11:41)
