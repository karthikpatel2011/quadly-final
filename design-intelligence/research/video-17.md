# Research Notes — Video 17

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/nZ2BJt9PgKE
- Title: "33 UNIQUE Website Layouts with Real World Project Examples"
- Creator: Self-Made Web Designer (Chris Misterek — on camera, IG handle in description)
- Duration: 34:40 · Published: 2025-05-08 · Views: 72,426 · Likes: 2,575
- Classification: episode 3 of a 3-part layout series (EP1 https://youtu.be/EF_ucfA3CJs, EP2 = video 23) + free
  downloadable Figma layout library (selfmadewebdesigner.com/layouts)
- Access: transcript (En auto-captions) + 28 frames viewed at 720p from full video
- Note: `--download-sections/-force-keyframes` failed for this ffmpeg build (repeated `ffmpeg exited with code -11`),
  so the whole 34:40 video was downloaded at 720p (107 MB) and frames were cut by exact timestamp instead.
- Description-vs-file discrepancy: the printed chapter list in the description ends "36:11 Conclusion: Tools for
  Standout Websites", but the actual file is 34:40; the video's own outro runs 33:24–34:40.

## Structure (chapters verified in metadata JSON — 8 chapters)

0:00 Introduction: Unique Layout Ideas for Your Next Project → 0:27 Series Recap and Design Theory →
1:03 Behind the Scenes: Nonprofit Project → 2:21 Finding and Using Inspiration → 4:58 Building a Layout
Library → 5:42 Three Column Layouts → 17:26 Four Column Layouts → 26:35 Five Column Layouts
(outro at ~33:24 per transcript)

## Teaching format

Walk-through of his own downloadable Figma file "SMWD - Layout Library" (`frame t00m4m22`): a canvas of labeled
wireframe cards, each paired with a screenshot of the real website it came from and a mobile re-layout, organized
in layer groups "Three Columns (V1–V9 + Mobile)", "Four Columns", "Five Columns", "Five Plus Columns V1–V6"
(visible in `t00m4m22`, `t00m5m52`). The screencast alternates between wireframe → live website → mobile wireframe.
Preceded by a behind-the-scenes of a nonprofit project (N50 Branding Figma file) and a numbered B-roll sequence
("1 ) Looking at websites", `t00m2m25`). Presenter cam bottom-right throughout.

## Lesson log

### L17-1 Collect layout inspiration daily; keep it in a permanent library
- Problem: when a project starts, people scramble for ideas instead of being able to pull from a stockpile.
- Decision [transcript 2:13–2:47, 33:46–34:08]: "My search for inspiration didn't start when I started the
  project. Now I am always looking for website layout inspiration every single day... taking screenshots...
  putting in my notes app, adding a link." Tells viewers to download the Figma file and add their own finds so
  "when you do have a project, you're not having to really rush".
- Evidence: `t00m2m25` — cinematic B-roll card "1 ) Looking at websites" (the habits sequence); `t00m1m32` —
  Figma file "N50 Branding" with one frame holding ~20 downloaded website screenshots (other sites' heroes,
  labeled font names "Apercu Font", "Mind Palace", "Judge").
- Implementation: a permanent Figma (or notes) library — every interesting site screenshotted + linked; on a new
  project, copy candidates into a project inspiration frame.
- Effect: project starts from a menu of proven patterns, not a blank page.
- Transfer: any project type — this library is the whole premise of the video series.

### L17-2 Before building, compress inspiration into a stylescape proof-of-concept
- Problem [transcript 1:46–2:09]: going straight to full pages means core color/type/image decisions are
  untested.
- Decision: assemble a stylescape (a single board mixing type, colors, imagery, shapes from the collected
  inspiration) as "a proof of concept without having to go and build out a full website".
- Evidence: `t00m1m55` — Figma "Slide 11": board with green highlight-word headline "Sometimes Hope Looks like
  a laptop", B&W photo with a circled stat annotation "3.7 million workers", solid color-block swatches (dark
  green, lime), dotted patterns, micro-copy "Tech should be a connecting point. Not a dividing line."
- Reasoning: it answers "how are these colors feeling... How is the typography looking?" (1:52–2:01) at low cost.
- Fails: if mistaken for a design deliverable — it is an internal proof-of-concept, not the site.
- Transfer: run the stylescape step before any multi-page build; it de-risks direction commits.

### L17-3 Column-count taxonomy: 3 columns = three distinct ideas side by side; every extra column raises mess risk
- Problem [transcript 2:59–3:20, 3:43–4:10]: "at this level of columns, things can start to get really, really
  messy" — density kills engagement.
- Decision: reserve 3 columns for comparing/choosing (features, testimonials, service options, subscription
  tiers) and for breaking up over-long sections; "give each column breathing room... so it doesn't become
  intimidating"; treat 4-column as e-commerce/blog/portfolio density and 5-column as structure/utility
  (navigation, footers, link sections); "hardly ever do you get above a six column layout" (33:34).
- Evidence: the library is physically grouped this way — layer groups "Three Columns / Four Columns / Five
  Columns / Five Plus Columns V1–V6" visible in `t00m4m22`; recap slide `t00m3m05` shows the series' "1&2 COLUMN
  LAYOUTS" wireframe cards before moving to "the big guys, the three, four, and five" (3:00–3:07).
- Effect: a decision heuristic — content intent (compare / list / directory) picks the column count, not
  aesthetics.
- Fails: 5-column grids used on single-message sections turn into "visual noise" (24:07–24:17).
- Transfer: default scale — 1–2 cols for statements, 3 for comparison, 4 for catalogs, 5+ for directories/footers.

### L17-4 Square Banking: diagonal composition with one "main character" and staged animation
- Problem [transcript 4:25–5:31]: flat three-across image rows divide attention equally and feel static.
- Decision: header with CTA, images spaced diagonally ("remember, we use these diagonal lines to balance the
  section"), an oversized central card as the focal point, side images as "supporting characters", plus scroll
  animation on those elements "to really help focus people's attention" (5:10–5:15).
- Evidence: wireframe `t00m4m22` (gray placeholders: small block top-right, large center card, lower-left block,
  black CTA pill top-left); live Square Banking hero `t00m5m15` ("Square Banking — Put your money to work.",
  Learn more → link, big tilted debit card center, two smaller photos lower-left "Tokyo Lamington, Newtown, AU"
  and upper-right "La Pupusa Urban Eatery, Los Angeles, USA").
- Effect: "the very first thing that your eye is naturally drawn to is this center image" (4:44–4:52).
- Appropriate: fintech/product heroes with one hero asset. Fails: when all three items are co-equal choices —
  then L17-3's comparison pattern is right.
- Transfer: in any 3-item row, deliberately rank the items (size/position/attention) instead of letting the DOM
  order rank them.

### L17-5 Symmetric three-card team grid: oversized initial letters create the hierarchy
- Problem [transcript 6:11–6:36]: three identical person cards can read as undifferentiated blobs.
- Decision: keep the cards strictly symmetric "one by one by one" and let one giant letter (the person's initial)
  plus image weight pull the eye down each card in sequence.
- Evidence: `t00m5m52` — library wireframe "Three Columns V2" (three identical cards, image top + text lines +
  small button) beside the source screenshot "We Are 38" with its big monogram "R" card visible on the canvas
  edge; transcript 6:21–6:33: "they've used size and contrast to kind of bring your eyes to different sections...
  the first big letter R, which is supposed to represent this person's first name."
- Effect: repeats a comparison pattern but with a per-card reading order.
- Transfer: oversized typographic glyphs (initials, numbers) as hierarchy scaffolding inside identical cards.

### L17-6 Rotate cards for visual interest; on mobile make card rows swipeable
- Problem [transcript 6:44–6:52, 7:08–7:53]: perfectly aligned card rows feel rigid; stacked full-width cards on
  mobile balloon the scroll distance to every future section.
- Decision: apply slight rotation to the cards ("adding a little bit of rotation to our cards to kind of peak
  some visual interest") on a GSAP-powered pattern; on mobile lay the cards side-by-side and let a middle-column
  scroll/swipe happen — "a great option if you're trying to limit the amount of space a user has to scroll";"
  weigh "how much do I want people to have to work to keep going down" (7:42–7:47).
- Evidence: `t00m6m47` — wireframe "Three Columns 3": three cards each tilted at different small angles (middle
  more), layer child "Made with GSAP"; `t00m7m20` — "Three Columns 3 Mobile" wireframe: one card centered with
  the next card peeking at the right edge of a 432px frame (= swipe affordance).
- Effect: retained visual energy in stillness; capped vertical scroll on mobile.
- Fails: rotation on text-dense or form-adjacent cards (legibility cost); he measures the tradeoff by content
  type/goal, not trend (7:47–7:57).
- Transfer: any horizontally-parallel content set (cards, steps) has a mobile "swipe lane" option before it has
  to stack.

### L17-7 Bento grids: the brightest box is a statement — and mix row rhythms across the same section
- Problem: bentos "can really quickly confuse the visitor" if emphasis is accidental [8:06–8:19].
- Decision: read your own grid "as a user": the eye goes to the saturated tile first, so put there what deserves
  focus ("my hope would be... that would be their intent", 8:31–8:36) and use the rest as supporting characters.
  Reuse the trick of different row spacings inside one section: "You don't necessarily have to stick with one
  type of layout on each section. You can mix and match according to what the content needs." (8:57–9:07).
- Evidence: `t00m8m25` — zeroG (aviation-data agency) bento: lime-green statement card "We believe airlines need
  to instrumentalize their data as a force for good..." directly adjacent to photo cards and a dark CTA tile;
  the lime box visibly outranks every neighbor.
- Effect: a grid can both organize and editorialize.
- Fails: multiple saturated tiles competing; bento for bentos' sake ("all the rage right now", 8:04).
- Transfer: run a "squint test" on any tile grid — one tile must win, and it must be the one you meant.

### L17-8 Flip the card anatomy (text-top / image-bottom) to make a familiar pattern look new
- Problem [transcript 9:15–9:34]: reusing the same card pattern everywhere makes sections blur together.
- Decision: same 3-card pattern with image/text positions swapped; "the same type of layout done slightly
  differently... looks incredibly different from the other layout that was maybe right above it that used the
  exact same pattern."
- Evidence: `t00m9m25` — library screenshot "Localyzer": three rounded cards with headline on TOP ("SAVE TIME" /
  "CHANNEL FLEXIBILITY" / "DEDICATED SUPPORT") and colorful illustration blocks below — inverted vs the V2
  image-top pattern in `t00m5m52`.
- Effect: variety without inventing a new component.
- Transfer: keep a "flip duality" option for every card component (media/text, icon/text, top/bottom).

### L17-9 Whitespace-heavy asymmetric sections trade density for calm — earn it back with type discipline and solid CTAs
- Problem [transcript 9:49–11:19]: a layout can look beautiful yet quietly sabotage comprehension (tiny text,
  illegible font, outline-only buttons).
- Decision: keep the airy asymmetric grid ("a lot of information here, but it doesn't feel intimidating because
  of all of this white space", 10:10–10:24) but then: bigger header, a more legible font, bigger paragraph text,
  and replace ghost buttons — "I'm not a real big fan of ghost buttons... it's just been proven over and over
  again that ghost buttons get ignored... fill in the background of that button with a solid color."
- Evidence: `t00m10m15` — live Enlighten page: beige seriffed "Candles Crafted for a Deeper Experience" block set
  in huge whitespace, images parked right; its CTA is a pure outline "Learn More →" pill (the exact target of the
  10:54–11:19 critique).
- Effect: whitespace keeps the section scannable; the edits make the scarce words actually land.
- Fails: whitespace as an excuse never to edit copy.
- Transfer: any minimal/luxury aesthetic still owes the user legible sizes and a filled CTA.

### L17-10 Give reassurance copy a spotlight card; treat it as the section's focal point
- Problem: benefit lists bury the risk-killers (guarantees, flexibility, no-obligation) that people actually
  need to see before converting.
- Decision: spot single-column praise on a section that puts ONE black card ("No obligation") between an image
  card and a light card; repurpose it as "your money back guarantee... you're trying to soothe anxieties"
  (12:04–12:11); source is a Webflow template ("Ridecar Webflow Template" — the title is on-canvas).
- Evidence: `t00m11m35` — library screenshot: "FEATURES / An all-inclusive subscription" heading above, then
  photo card of a driver, black card "No obligation — You can reserve a car for a short time and pause it
  whenever you like", white card "Flexible — change car according to your needs and desires..."; transcript
  11:40–11:51: "immediately my eyes go to this black card right here".
- Effect: the trust message out-ranks the feature message visually; anxiety is addressed where the eye lands.
- Transfer: identify the single most conversion-soothing sentence on any pricing/plans section and give it the
  highest-contrast card, not just a bullet.

### L17-11 Encode before/after with icon polarity and value degradation — and only stack many ideas in one section on purpose
- Problem [transcript 12:15–13:55]: sections usually carry "a handful of ideas" — stacking features + pricing +
  testimonials in one section "becomes super overwhelming" (13:29–13:36).
- Decision: when you genuinely must convey many ideas at once (e.g. Product A vs Product B), use the structure of
  the grid to carry the judgment: icons graded red/minus for "before", green/check for "after", and after-column
  text darkened while before-text is graded out — "they've done a good job of using icons to say, this is bad and
  this is good... they even grade out the before and darkened the text for the after" (12:45–12:58).
- Evidence: `t00m12m45` — "Acceleration" section: BEFORE pill vs AFTER pill, paired mini-cards ("Manual
  bottlenecks for essays & synthesis" ✕ / "Automated, rules-based decision making" ✓ ...), right green panel with
  product card "RSNC-VC-266 SYNTHESIZED" + "REQUEST POTENCY ASSAY" chip.
- Effect: a dense section reads as a verdict instead of a wall.
- Fails: icon polarity with no real value change behind it.
- Transfer: any competitive-comparison, migration, or before/after section — encode direction INTO the styling.

### L17-12 People in photos should look at the thing you want clicked
- Problem: photography can actively pull attention away from the focal element.
- Decision: when text/CTA sits inside a layout, cast images so subjects "are actually looking at the thing that
  you're wanting the users to look at. People are naturally going to look at what other people are looking at"
  (14:38–14:43) — and note you can make users miss things with averted gazes (15:02–15:07).
- Evidence: `t00m14m10` — Resync Bio section "Enabling AI adoption + untangling AI-native workflows" with the
  copy dead-center and lab photos bookending it; the right-hand photo's scientist is angled toward the center
  text; transcript equivalent 13:55–14:43 uses the same section ("book ended some text with some really nice
  images").
- Effect: free attention-steering using social cueing; pairs with his sports-crowd analogy (14:48–14:55).
- Transfer: audit every people-photo's gaze/pose direction next to any headline or CTA.

### L17-13 Four columns: reserve for catalogs; keep spacing + typography doing the heavy lifting; drop to ~2 on mobile
- Problem [transcript 15:09–15:58]: "four columns can get real cluttered really quickly, especially on smaller
  screens... there aren't a lot of scenarios where using four columns or more on mobile make a lot of sense."
- Decision: use 4-column grids for blog posts, portfolio items, product cards ("perfect for things like blog post
  or portfolio items or even product cards... You'll see these types of layouts on a lot of e-commerce shops");
  on desktop, spacing + typography carry it; don't force it on mobile.
- Evidence: `t00m21m00` — library Ridecar 4-column feature row (Maintenance / Insurance / Tires image+text
  columns, next photo row visibly tight underneath); layer groups "Four Columns V3 (Gilion), V4 (Techto), V5"
  visible in `t00m22m50`.
- Effect: a repeatable grid for content volume without shop-page chaos.
- Transfer: any catalog face — 4 columns is the ceiling for digestible product grids on desktop.

### L17-14 An unfilled 4-column grid is a valid tool: white space as a mental breather
- Problem: designers fill every available cell, making "one of the best" pages feel heavy for no gain.
- Decision: "even if you have four columns, you don't have to fill out those four columns with everything. Use
  white space to your advantage to allow users to kind of take a mental breather" (16:42–16:55).
- Evidence: `t00m16m15` — the sparse Localyzer "TRUSTED BY LEADING BUSINESSES" grid: big all-caps headline, a few
  saturated tiles (teal / dark green / yellow) and several empty/gray placeholder cells — a 4-column footprint
  running at maybe 50% payload.
- Reasoning (transcript 16:11–16:38): "There's actually not a lot of information... this could have been done on
  a smaller or less column layout, but they wanted to use this to add some white space."
- Fails: when filler cells read as broken/loading instead of intentional (needs solid grid alignment).
- Transfer: treat column count as a frame, not a quota; empty cells are a pacing tool.

### L17-15 Numbers magnetize attention: number your offer cards when outlining a package
- Problem [transcript 17:48–18:12]: people won't read dense course/offer descriptions.
- Decision: put explicit numbers on each card ("People are naturally drawn to numbers on a website — anytime
  you've got a step process, step one, step two... or you're trying to outline everything that somebody's gonna
  get in a package") so scanning carries the message.
- Evidence: `t00m17m45` — VW Lab course section: four staggered peach cards labeled 001 ADVANCED TIMELINE / 002
  SMOOTH TRANSITION / 003 PARALLAX ANIMATIONS / 004 MOUSE INTERACTIONS, each with one-line description and an
  illustration; sub-nav pill row (Overview/Description/Features/Content/Instructor/GET STARTED $85).
- Effect: the package contents communicate without paragraph reading; the stagger plus numbering guides order.
- Transfer: any curriculum/features/deliverables section gets visible ordinals, not just bullets.

### L17-16 Lot of info + reluctant scrollers? Make the cards draggable/pullable
- Problem [transcript 18:27–18:56]: long stacks of big cards force "scroll all the way through it from top to
  bottom".
- Decision: a pull/drag horizontal card deck ("if somebody wants to dig in a little bit deeper, they can, and
  they'd be willing to kind of interact with it in order to do that") — on the Gilion site, sector cards with
  prev/next controls.
- Evidence: `t00m18m40` — live Gilion: three gradient cards ("The gold standard in growth metrics", "See into the
  future with forecasting", edge-cut "Benchmark your per... peers") with black round prev/next arrows below-left;
  the right card is deliberately half-out of frame to afford the drag.
- Effect: depth on demand; page stays vertical-budget lean.
- Fails: hiding primary navigation or the only CTA inside a drag deck (kill the main path).
- Transfer: interactions used as content-density valves, not decoration.

### L17-17 Event/list rows: exactly two focal points — a highlighted name and the CTA
- Problem: list-of-events/blog layouts usually light up everything, so nothing wins.
- Decision: highlight the event name with a marker so "my eyes immediately go here, and then my eyes immediately
  go to this button" (19:31–19:39); remainder (time, address, price) as small icon rows; keep breathing room.
- Evidence: `t00m19m40` — live TechTO: rows with date tiles (2025 05 May), lime-highlighted titles "Together
  Toronto / Sales Toronto / Travel Toronto", icon meta (clock, map pin, ticket price), right-aligned "Event
  Details" buttons.
- Reasoning (19:53–20:13): the title answers "what type of meetup is it" and the CTA answers "where are the event
  details" — designer sequenced the two questions a visitor actually asks.
- Transfer: every repeating row should declare exactly one highlight + one action; everything else demotes.

### L17-18 Static vs dynamic content: design for the longest version, and protect text-image association
- Problem [transcript 20:53–22:28]: CMS-driven card grids (blog/product) receive unpredictable text lengths, and
  tight rows make captions ambiguous ("is this text for this image or is this text for this image?", 21:04–21:09).
- Decision: "you've got to think about the lowest common denominator... what's the most amount of text that this
  section is going to have? And then I've gotta lay this out in such a way that it looks good, even if it's
  completely full or if it's completely empty" (22:00–22:18); plus add space between a text block and the next
  image row so groupings are unambiguous.
- Evidence: `t00m21m00` shows the defect (feature captions sitting directly on top of the next row of photos) —
  the section where he issues the fix [transcript 20:53–21:14].
- Effect: layout survives CMS reality — worst-case text, newest editor, no orphaned captions.
- Transfer: before shipping any CMS grid, paste your longest realistic entry and your emptiest state into the
  wireframe.

### L17-19 Four narrow desktop columns can legitimately collapse to two on mobile when images are decor only
- Problem [transcript 22:34–23:09]: multi-column desktop content usually stacks to 1 on mobile; this example
  "split the difference" into 2 — is that safe?
- Decision: yes, when the images are "not really something that we're going to be engaging with a ton" and only
  support the text (22:31–22:51) — otherwise don't; keep the layout's purpose matched to the content's purpose.
- Evidence: `t00m22m50` — "Four Columns 5 Mobile" wireframe (432px, pink columns) beside the source screenshot
  Appcore: "Impress investors or kickstart your app in just 7 days with 5 custom screens." + pricing chip
  "$1,490" + Getting Started/What's Included lists.
- Note: he also edits the copy — "that's a powerful statement. It's kind of a lot. I would probably shorten it"
  (23:26–23:38).
- Transfer: media that is decoration can survive compression; media that carries meaning cannot.

### L17-20 Five columns are for structure and utility; ungrouped they're noise
- Problem [transcript 23:49–24:21]: extra columns tempt you to dump unsorted links.
- Decision: 5–6 column grids belong in navigation, footers, "sections with just a whole bunch of links and
  information"; the price of them is grouping: "If you don't group content clearly, five columns can turn into
  visual noise that people just glance over. So keep things grouped, lined and really focused."
- Evidence: `t00m32m50` — library wireframe "5 Columns 5": a footer grid where each link group sits in a visible
  bordered cell (group pills + social circle cluster top-right, hairline column rules); transcript 32:38–33:16 —
  the live e-commerce footer keeps "grids... to help users know exactly where to look", even invisible ones
  ("ethereally... You just can't see 'em").
- Effect: high-density link surfaces stay navigable.
- Transfer: footer/nav column count should be set by your link taxonomy, not by aesthetics.

### L17-21 Image-column grids (services): don't cram copy; make overlaid words survive the photo
- Problem [transcript 24:23–25:57]: the temptation with 5 image tiles is "to take as much information and just
  cram it into these sections"; and words set straight on busy photos disappear ("I've got a lot of visual
  information going on... underneath these words").
- Decision: praise the spa example for calling "what's important and... throwing away the rest" (5 single-idea
  service tiles); then upgrade legibility: bring image opacity down, or "a color overlay on top of the images,
  and then turn the images black and white. And then once somebody scrolls over them... the color changes [or it]
  turns into a fully colored image. And then there's a little bit of a background underneath the word so that it
  becomes legible."
- Evidence: `t00m24m40` + `t00m25m30` — SpaDerma "OUR SERVICES / Compliments, incoming." on a lime band with five
  arched photo columns (Facials / Laser & Light Treatments / Injectables / Micro-needling / Weight Management),
  labels in black directly on photos, no scrim — exactly the state he critiques.
- Fails: the hover-color fix on touch-only devices (the label chip must carry it there). [interp]
- Transfer: for every word-on-image tile, assume the photo fights the text and pay one of the three scrim prices.

### L17-22 Accordions let users self-prioritize — but never make the labels cost reading effort
- Problem [transcript 26:08–27:21]: accordion sections can hide all information behind unreadable affordances.
- Decision: adopt the accordion "good example of how you can take different information and allow users to
  interact with it according to what they feel like is important"; leave the primary item open by default
  ("I'm going to assume that they left this first tab open because it's the most important"); fix rotated
  (90°-vertical) labels — "at minimum, once these are clicked on, make the text rotate and be horizontally
  oriented."
- Evidence: `t00m26m35` — Resync Bio "Use Cases": one expanded panel (photo + caption "Coordinate preclinical
  requests and data across multiple CROs...") beside four closed slats with rotated titles (Preclinical Science /
  Academic Research / Finance / Biotech Management / Informatics & Engineering) and colored arrow buttons — the
  rotated type he calls "really tough to even read".
- Transfer: collapsed content is fine; collapsed EXPERIENCE (having to decode the affordance) is not.

### L17-23 Nested column systems can run 12 columns deep if scale and contrast police it
- Problem [transcript 27:25–28:51]: a parent 4-column grid whose children each subdivide multiplies visual noise.
- Decision: keep it readable via "scale and sizing" and "color contrast" (darker sub-headers, lighter parent), cut
  redundant copy ("I am not a hundred percent sure that this text is actually necessary because it seems like
  they're kind of saying the same thing. So... I would actually get rid of this"), and enlarge under-sized
  interaction targets ("I would probably make this arrow a little bit bigger because... that's gonna be tough to
  click on or I'm going to miss it all together").
- Evidence: `t00m28m05` — Ramp "Get to know Ramp" product-suite screenshot in the library: two rows of icon+label
  product tiles (Scale Intelligence, Corporate Cards, Expense Management, Travel, Physical factories,
  Procurement, Accounting Automation, Ramp Treasury) between headers; his 4-columns × 3 = 12 count is transcript
  27:35–28:05 (the arithmetic is his on-screen trace, the tile grid is verified in frame).
- Transfer: hierarchical grids need a readability budget: each nesting level decreases type size and increases
  contrast discipline.

### L17-24 Pretty isn't done: when a layout is "almost like artwork" but undersized, restructure the section
- Problem [transcript 28:56–30:31]: an asymmetric coach portfolio (Ariel Childs) is "stunning... it just kind of
  flows" yet "the layout looks beautiful, but it's probably a little bit too much information in just one
  section" with "really small" text.
- Decision: enlarge the section, or break it out — his concrete re-plan: pull the icon-label column up top as one
  column, move the copy block over, "scale up the text and make these images a little bit bigger and bring them
  more towards the center."
- Evidence: `t00m29m10` — Ariel Childs: staggered serif headline "Our inner world creates / our outer world.",
  three small paragraphs left, five tiny icon+principle rows center (CLARITY OVER CHAOS, MINDSET MEETS
  EMBODIMENT, RADICAL HONESTY + REAL SUPPORT, RESPONSIBILITY IS FREEDOM, INNER AUTHORITY > OUTER NOISE), B&W
  portraits right — five parallel content types in one viewport.
- Effect: guards against art direction converting into a reading problem.
- Transfer: when admiring a creative layout, still run his micro-audit: can a motivated stranger actually read
  it?

### L17-25 Dense editorial grids serve multi-goal sites only — pick grids by what the site wants clicks to be
- Problem [transcript 30:37–32:38]: news-style 5+ column masonry looks chaotic next to conversion design.
- Decision: that's correct behavior for the goal: Huffington Post "doesn't care if you click on one article or
  another. They just want you to find the thing that looks most enticing... it's like shooting birdshot —
  you're spraying stuff on a wall and seeing what sticks"; a lead-magnet/product/service site has ONE goal and
  shouldn't borrow the pattern. If you do run it, images do the sorting ("people are probably gonna be more
  motivated by the images"), and headlines stay short and clickbait-shaped (his example: "Lil Nas X hospitalized
  for mysterious reason"), while he distances himself: "I'm not encouraging you to put clickbait on your
  websites."
- Evidence: `t00m31m00` — library screenshot "Huffington Post": 4+ story columns with a lead cruise-ship story,
  mid-size story cells, and a thumbnail rail of commerce items including a "FROM OUR PARTNER" sponsored unit.
- Transfer: column density is a business-model signal — masonry = destination browsing, single column = funnel.

### L17-26 Footer as the place 5–6 columns always work (with visible grids)
- Decision [transcript 32:38–33:23]: the final example is an e-commerce footer; "they've done a good job of
  grouping the information and then they've used grids to kind of help users know exactly where to look" — even
  better if, as in the wireframe, one draws them. Count on-canvas: "I think they have 1, 2, 3, 4, 5, 6 — six
  different columns."
- Evidence: `t00m32m50` — wireframe "5 Columns 5" with bordered link-group cells; layer children Line 4–10 under
  "5 Columns 5".
- Transfer: footers are the safest place to exercise dense grids because intent there is search, not persuasion.

### L17-27 (meta) Column ceilings and library growth
- Decision [transcript 33:24–34:23]: "Hardly ever do you get above a six column layout" — so a layout library of
  1→5+ patterns covers "most of the scenarios that you would use for any project"; keep growing the file with
  your own finds; reuse it so "you don't have to start from scratch."
- Evidence: layer-tree naming scheme (V1–V9 per column family) in `t00m4m22`; closing B-roll call to download the
  free file.

## Creator tendencies observed (feeds creator-profiles.md)

- Sells a repeatable pipeline, not just patterns: capture daily → stylescape → library → per-project mix.
- Names heroes/villains per section: "main character vs supporting characters" framing recurs (Square img,
  bento lime box, TechTO title+CTA, No-obligation card).
- Strong opinionated defaults: anti-ghost-button ("proven over and over"), anti-rotated-label, pro-solid-CTA,
  column ceiling at ~6.
- Every wireframe ships with a mobile counterpart in the same layer group — mobile is a first-class variant,
  including a swipe-lane alternative to stacking.
- Rewrites source copy inline ("I would probably shorten it down") — treats copy length as a layout parameter.
- Deliverables are free-forever artifacts (Figma file) with a soft membership upsell at the end (34:23–34:31).

## Unverified / transcript-only observations

- The title's "33 unique layouts" is never itemized on-screen; the library's layer tree names versions
  (Three Columns V1–V9, Five Plus Columns V1–V6, etc.) whose contents I only sampled at the frame budget.
- Not frame-verified (named in transcript only): Square's scroll/parallax animation behavior (5:02–5:15 — live
  hero verified at rest in `t00m5m15`, motion not verifiable in stills); the We Are 38 site's full team-section
  styling (only canvas edges seen, `t00m4m22`/`t00m5m52`); zeroG/mobile variants beyond `t00m7m20`; VW Lab
  "one of those... you can actually move cards along as you would want to interact with them" (18:12–18:27 —
  drag/hover interaction); Gillion drags beyond the resting carousel (`t00m18m40`); SpaDerma mobile layout
  "text... left aligned, but then you've got two columns for the images" (25:58–26:08); exact live footer of the
  e-commerce example (frame shows the wireframe `t00m32m50`, not the source site); Ariel Childs live scroll
  behavior.
- Transcript-only drawing of his Arial-Childs fix (29:40–29:55: "take these columns... bring it all the way up
  top, make it one column") — instructions audiable, no frame of the prototyped fix.
- The on-screen wireframe at `t00m16m15` pairs with the localyzer title; the transcript's first-four-column
  example is described 15:58–17:03 but never shown as its own live website — identity of that site is
  [interp] from canvas position.
- Sponsor-adjacent but non-mineable: closing membership pitch (34:23); recurring Showit affiliate links in the
  video description.

## Quotable diagnostics (explicit)

- "You have to become a student of good web design if your websites are going to stand out." (2:32–2:38)
- "Three column layouts are great for showing three distinct ideas side by side." (3:25–3:31)
- "You want to give each column breathing room." (4:00–4:05)
- "Bento boxes are all the rage right now... they can really quickly confuse the visitor." (7:59–8:20)
- "You don't necessarily have to stick with one type of layout on each section. You can mix and match according
  to what the content needs." (8:57–9:07)
- "It's just been proven over and over again that ghost buttons get ignored... make sure you're filling in the
  background of that button with a solid color." (11:10–11:19)
- "People are naturally going to look at what other people are looking at." (14:43–14:48)
- "Even if you have four columns, you don't have to fill out those four columns with everything." (16:42–16:47)
- "What's the most amount of text that this section is going to have? And then I've gotta lay this out in such a
  way that it looks good, even if it's completely full or if it's completely empty." (22:04–22:18)
- "If you don't group content clearly, five columns can turn into visual noise that people just glance over."
  (24:07–24:15)
- "Hardly ever do you get above a six column layout." (33:34–33:39)
