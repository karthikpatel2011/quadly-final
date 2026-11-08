# Research Notes — Video 23

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/s2DVOZ62F8w
- Title: "Ultimate Website Layout Guide: 17 Swipeable Examples (Video 2)"
- Creator: Self-Made Web Designer (Chris Misterek — on camera)
- Duration: 23:52 · Published: 2025-05-01 · Views: 97,714 · Likes: 3,341
- Classification: episode 2 of the 3-part layout series (EP1 https://youtu.be/EF_ucfA3CJs, EP3 = video 17);
  theory section + walk-through of the same free Figma layout library (one- and two-column halves)
- Access: transcript (En auto-captions) + 27 frames viewed at 720p from full video
- Note: chunked `--download-sections` downloads failed for this ffmpeg build (`ffmpeg exited with code -11`),
  so the whole 23:52 video was captured at 720p (72 MB) and frames cut by exact timestamp.

## Structure (chapters verified in metadata JSON — 11 chapters)

0:00 Introduction: Mastering Website Layouts → 0:27 The Real Job of a Layout → 1:02 Visual Hierarchy:
Guiding User Attention → 1:32 Using Contrast, Size, and Color → 3:17 The Power of White Space →
3:54 Analyzing a Real-World Example → 4:53 Variation: Keeping Users Engaged → 6:07 Balance: Creating
Stable Layouts → 7:49 Real-World Examples: One Column Layouts → 13:53 Real-World Examples: Two Column
Layouts → 22:40 Conclusion and Next Steps

## Teaching format

Two-part: (1) a motion-graphics theory block — paper-texture slide cards titled in monospace lowercase
("contrast", "size", "color", "white space", "diagonal", "asymmetrical") each holding a screenshot example with
hand-drawn circle annotations, presenter inset bottom-right (`t00m1m45`–`t00m7m00`); (2) a Figma library
walk-through titled "Layouts" with wireframe cards labeled after their source sites (Finta, Paper Design,
Family Style, Nick Tarasov, State of Create, Gilion, Techto, Arch Agency, Clade Template, Perplexity AI, etc.),
each with a mobile variant. Every pattern is "swipeable" in the sense of one-example-per-card in the file.

## Lesson log

### L23-1 A layout's job is attention guidance, and confusion is exit
- Problem: sites treat layout as decoration; users who are confused for a second leave.
- Decision [transcript 0:27–0:51]: "What's the real job of a layout? It's not just to look good. The real goal
  is to guide a user's attention and keep them interested... if your layout confuses them for even a second,
  their brain checks out and they are gone."
- Evidence: the rest of the video operationalizes this claim (every pattern judged by where the eye goes).
- Effect: layout decisions get an acceptance test — where does the eye land, and is that where I want it?
- Transfer: universal; each section should pass a "first-thing-you-see" check.

### L23-2 Only three tools steer attention: hierarchy, variation, balance
- Decision [transcript 0:51–1:01]: "you've really got three tools in your tool belt to focus attention and keep
  users engaged, and that's visual hierarchy, variation, and balance." Hierarchy sets the focal point and leads
  the eye ("think of your layout as a stage... main characters... minor characters in the back", 1:12–1:28).
- Evidence: the video's own chaptering — contrast/size/color/white space (1:32–3:53) under hierarchy; 4:53–6:07
  variation; 6:07–7:49 balance.
- Transfer: audit any page by the trio rather than by component.

### L23-3 Hierarchy tool 1 — contrast: light-on-dark forces attention onto the marker
- Decision [transcript 1:32–1:52]: use light-against-dark (and big-against-small) so "important really stand[s]
  out".
- Evidence: `t00m1m45` — slide "contrast": Female Talent Agency site, black hero with huge yellow display type
  "WE SPEAK ... MUSIC & BRAND" hand-circled on the slide, tiny micro-caps elsewhere; the circled headline is the
  only high-luminance object.
- Fails: contrast that shouts on secondary elements (then the hierarchy inverts by accident).
- Transfer: reserve maximal luminance contrast for the one element that must be seen first.

### L23-4 Hierarchy tool 2 — size: bigger = assumed more important (even for products)
- Decision [transcript 1:53–2:25]: size alone ranks items — "things that are bigger naturally grab users'
  attention"; his read of a furniture grid: the large photo "is actually more expensive than this" small one.
- Evidence: `t00m2m12` — slide "size": product page ("003 / M_005 Bench" large left, "004 / M_007 Lounge_Chair"
  small right, "See All Monoliths ↗" oversized footer type), big item circled.
- Effect: silent value signaling; users infer price/priority from scale before reading a word.
- Transfer: never set two co-equal items at different scales; never set the highest-priority item small.

### L23-5 Hierarchy tool 3 — color: bold accents in a sea of neutrals, placed as reading aids
- Decision [transcript 2:26–3:16]: bold color among neutrals creates "instant focus"; best practice shown is
  using colored icons INSIDE a long headline to keep skimmers going — "this is a lot of text. People are
  probably going to skim it, so let's give them something that's going to help them finish the story in their
  mind" — each icon completes the sentence it punctuates.
- Evidence: `t00m2m42` — slide "color": giant black type "Your favorite (music icon) songs. That (clapper) 
  must-see movie. Your top (ghost) interests and all your shopping (bag/shirt) habits.", micro-copy "Here's a
  fun fact: Today, you are the product", icons circled by annotation.
- Effect: skimmable text that still communicates; color served parsing, not decoration.
- Fails: the anti-case follows at 3:54 — colorful elements that don't advance the story (Goodreads banner
  characters) get "I'm not sure that they're really doing much to share the story".
- Transfer: before adding a colored accent, ask what sentence it completes for a skimmer.

### L23-6 Hierarchy tool 4 — white space: whitespace is a promise of easy understanding
- Decision [transcript 3:17–3:53]: breathing room reads as "I can look at this and get a pretty clear
  understanding... without having to work extra hard"; adding elements/text "makes it much more difficult...
  we're naturally going to say, I don't know if I have time for this."
- Evidence: `t00m3m25` — slide "white space": Balky/Studio hero — giant condensed "INNOVATING WITH HEART", mostly
  empty canvas, one small right-aligned paragraph, hairline nav.
- Fails: whitespace without type discipline (see video 17's Enlighten critique for the paired failure).
- Transfer: treat empty regions as an involuntarily-communicated difficulty rating.

### L23-7 Anti-case: Goodreads — color, contrast and density unfocused means the user must be "super motivated"
- Problem [transcript 3:54–4:50]: "it's not a bad website, but... they haven't really thought about making
  things super clear."
- Decision: diagnose it against the toolkit — the most colorful elements (illustrated characters) don't tell the
  story; the book covers are tiny and dense ("super close to one another and they're very small, very hard to
  read") so the desired action ("I'm assuming they want us to click on these books") costs too much.
- Evidence: `t00m4m15` — Goodreads home: "2025 Reading Challenge" illustration band, sign-in card, dense
  book-arrow-recommendation rows.
- Effect: a reusable diagnostic — point at the page's loudest element and ask if it advances the goal.
- Transfer: run the toolkit as an audit checklist on competitor/legacy pages before redesigns.

### L23-8 Variation keeps the scroll alive — variation with a purpose
- Problem [transcript 4:53–6:07]: one repeated layout down a long page loses engagement; a single-column page
  that "shifts to a two column layout" tells a story; "the longer they are on a website, the more likely... to
  check out or buy".
- Decision: change layout rhythm section by section (features → testimonials with different column counts), but
  always meaningful: "you don't wanna just have variation for variation's sake... have meaning behind why you're
  doing things. So it lines up with what the user is thinking."
- Evidence: whole library section (7:49–22:40) demonstrates near-identical patterns diverging by small variation
  (e.g., centered vs left one-column hero, flopped bentos `t00m18m30` vs flopped variant).
- Fails: random reshuffling that breaks the user's mental model.
- Transfer: at section boundaries, alternate the previous layout's axis (columns→full width, centered→left).
- [interp] The framing implies a scrolling-engagement metric in his head (dwell → conversion), stated explicitly
  at 4:57–5:09.

### L23-9 Balance is stability, not symmetry — diagonal and asymmetric both count
- Decision [transcript 6:07–7:21]: "balance doesn't necessarily mean symmetry. It means the layout feels stable,
  like nothing's tipping over." Two demonstrated recipes: diagonal balance (heavy headline top-left vs heavy
  image bottom-right) and asymmetric balance (weight on one side).
- Evidence: `t00m6m25` — slide "diagonal": Era dark fintech hero, lavender-highlighted "Make more of your money"
  top-left vs teal/white spending-calendar card cluster bottom-right; `t00m6m40` — slide "asymmetrical": "A
  collection of JS effects Made With Gsap", text mass left, small copy right.
- Fails: unbalanced weight "throws the whole design off" — shown next.
- Transfer: place the second-heaviest element opposite the first before adding anything else.

### L23-10 Anti-case: Yale School of Art — off-weight layouts read as broken even when "on purpose"
- Problem [transcript 6:50–7:47]: everything crammed to the left, right half blank.
- Decision: use it as the negative archetype: "Everything is off to this left hand side, and so we've got all of
  this wasted space over here that we could be laying out to make it more understandable"; he grants it may be
  deliberate ("punk... we're gonna show you we don't have to do good website layout") — but for clients it's the
  what-not-to-do.
- Evidence: `t00m7m00` — Yale SOA page: tiled "YALE SCHOOL OF ART" banner text, overlapping label blocks left,
  scribble annotation across the middle, right side occupied only by repeated chair photos.
- Transfer: when a client asks for "edgy", differ intentional-punk from accidental imbalance with this example.

### L23-11 Layout literacy is trained by consuming design: find → evaluate → emulate
- Decision [transcript 7:21–7:48]: "there are all types of grids and systems... but this is gonna be something
  that needs to come naturally over time. And the only way that that happens is by consuming a lot of design.
  You gotta become a student of it. So go out there, find examples, evaluate them, and then try to emulate what
  you find in your own projects."
- Evidence: is the bridge into the examples section; mirrored in video 17's daily-inspiration habit (L17-1).
- Transfer: process advice — schedule consumption before production; the Figma file is the "evaluate" artifact.

### L23-12 One column = command attention with ONE message; sequence headline → subhead → CTA
- Decision [transcript 7:57–8:43]: one column is for hero sections and calls to action — "You're not trying to
  explain a whole bunch of information... you've got one message"; order the few allowed elements "big
  headline or maybe a call to action, maybe a subheading... and supporting images as well, not too much."
- Evidence: `t00m9m05` — library: "One Column" wireframe (text lines, black CTA pill, gray image block, centered)
  beside Finta's centered hero "Magically simplify accounting and taxes" with app screenshot; his read of the
  Finta page (9:08–9:20): heading → grayed subheading → CTA, "naturally one by one going to where they want us
  to go."
- Effect: a single unambiguous attention funnel.
- Fails: adding "one more thing" to a one-column hero; the column count is a discipline, not just geometry.
- Transfer: hero/CTA sections default to one column until proven insufficient.

### L23-13 Same hero, left-aligned: alignment is a variation axis
- Decision [transcript 9:23–9:42]: "the same type of layout, but everything is left aligned instead of center
  aligned. So still very powerful."
- Evidence: `t00m9m30` — library: "Paper Design" screenshot (left-aligned designer-homepage hero) next to the
  centered Finta example and the "One Column 2" wireframe; the canvas pairs them to show alignment-only
  divergence.
- Transfer: when a centered layout feels generic, first try re-aligning before changing structure.

### L23-14 Text-over-image competes for attention — whitelist it by site type, and fix contrast first
- Problem [transcript 9:43–11:41]: "Anytime you have an image that's underneath text, the text and the image are
  going to be competing for attention, and especially... accessibility... If there's not a lot of contrast...
  it's going to be tough to read."
- Decision: it works for creative brands where the art IS the message (spray-painted flower behind bold type,
  Family Style); for wordier cases, repair: darken the backing (make the image "much more opaque, almost putting
  a... really dark colored background underneath... turning down the opacity of the image") AND cut length
  ("shortening the words... We're asking the user to actually read a lot right here").
- Evidence: `t00m10m20` — Family Style hero: "We create & grow brands made to share." over a red spray rose +
  green stem, SCROLL chip, underline "Become dinner conversation."; `t00m11m00` — RAAD drone-network hero, white
  staggered display caps over busy aerial footage with small sub-caps — the "you've got this white text that's
  really small and... clouds floating underneath it" case.
- Fails: small light-on-noisy text for sight-impaired users; long paragraphs over imagery.
- Transfer: text-over-image requires a scrim strategy AND a copy-length audit, or it's out.

### L23-15 Compose a visual funnel: wide nav → narrower headline → smallest object = scroll pull
- Problem: heroes don't tell the eye to go down.
- Decision [transcript 11:41–12:30]: Nick's portfolio loads as a triangle — nav items at far left/right, headline
  narrower, image smallest and centered: "It's almost like a funnel, like even in the navigation... it looks like
  a triangle. It's just pointing us down... he wants us to keep scrolling."
- Evidence: `t00m12m00` — Nick Tarasov: warm-glow black hero, 2-line white headline above a small rounded
  gradient portrait card.
- Effect: geometry alone produces downward motion; his note: same one-column layout as Finta, "just a variation
  that makes it much more powerful to keep people engaged" (12:14–12:20).
- Transfer: nest the width of the top three elements decreasingly to imply descent.

### L23-16 Text-only pages: typography IS the imagery
- Problem: "You might think that that would be boring" (12:30–12:36).
- Decision: one column of pure type scaled to display artwork — "really bold copy, a really bold headline...
  I kind of instantly know what that is"; keep an oversized subhead carrying the deck.
- Evidence: `t00m12m40` — State of Create: stacked "STATE OF CREATE" 3-line block on black, colorful badge stack
  on the right edge, serif deck "What's here, what's coming, and what's possible for creators in 2025 and
  beyond."
- Transfer: when no usable imagery exists, budget display type + one accent graphic instead of a stock photo.

### L23-17 Add scroll-triggered pop-in to still pages: anticipation is variation
- Decision [transcript 13:07–13:44]: as you scroll "these images just pop into place. This is a great job of
  getting variation to keep people interested... As soon as I start scrolling, I know something's about to
  happen."
- Evidence: `t00m13m20` — Portrait profile community card (Rowan Blake, photo collage) captured mid/pop-in state
  with ghosted cards pre-render.
- Fails: animations that entrance without moving the message; motion on text that users are actively reading.
- Transfer: reserve one scroll moment per page where structure appears — enough, not everywhere.

### L23-18 Two columns = one idea with a support; give each column a clear role
- Decision [transcript 13:46–14:24]: two columns fit "feature descriptions that have some icons with them... or
  a testimonial... an image of the person next to the text they have given... more room to play with without
  having to overcomplicate the design."
- Evidence: `t00m14m35` — library "Two Columns" section header page: wireframe with text-list + black CTA on one
  side and two large image blocks below; component list Two Columns / Two Columns 1 / Mobile.
- Transfer: two columns should never host two unrelated arguments — pair message + evidence.

### L23-19 Mobile caps: 1 max 2 maybe 3 columns, ever
- Decision [transcript 14:36–14:55]: "on mobile I've simplified things quite a bit... it's gonna be really tough
  to have more than one or two columns on the mobile side of things... in most scenarios mobile is going to be
  one max — two, maybe three columns."
- Evidence: every library card ships a mobile variant (e.g., One Column 5 Mobile, Two Columns Mobile, Two
  Columns 4 Mobile layer names in `t00m14m35`/`t00m16m45`).
- Transfer: refresh this cap against data punches — but as a default CSS starting point it's safe.

### L23-20 Two-column headlines can be dual-tone: darken the lead phrase, mute the tail
- Decision [transcript 14:59–15:25]: apply hierarchy INSIDE the heading: "they've even made growth funding the
  thing that is standing out more with that contrast... a darker header next to a more opaque header."
- Evidence: `t00m15m10` — live Gilion Growth Funding: black "Growth Funding" followed by gray "Custom terms
  rooted in deep understanding of startups", supported by a 2-paragraph/2-CTA right column (Get started pill +
  Book an intro outline) — the copy/CTA split mirrors the type hierarchy.
- Effect: a heading communicates which words are the noun of the sentence.
- Transfer: split every long headline into primary (black) + secondary (muted) segments.

### L23-21 Turn two columns into cards when both units are self-contained
- Decision [transcript 15:26–15:58]: same content as playing-card components ("headers, subheaders, and image.
  And a call to action... they kind of look like playing cards"), which then stack to a single column on mobile.
- Evidence: `t00m15m35` — library wireframe: two identical rounded cards (header lines, image block, black
  button) selected inside the "Two Columns" group.
- Transfer: cards are the mobile-collapse form of paired columns; design the collapse, not just the desktop.

### L23-22 The workhorse split (image one side / text the other) is necessary but must not be a crutch
- Problem [transcript 15:58–16:31]: "this is kind of where web designers live all the time... don't let this be
  the only go-to move that you have... use this purposefully, but don't lean on it as a crutch."
- Evidence: the library shows it as one variant among a dozen (`t00m16m10` — text lines + pill left, tall gray
  image right, neighbors show flipped and stacked variants).
- Effect: the explicit cure is his variation axis (alignment, flipped sides, whitespace splits, stacked media).
- Transfer: if more than ~2 sections of a page use the identical split, force at least one structural variation.

### L23-23 Vary the split: stack the media, or widen the whitespace gap between heading and paraph
- Decision [transcript 16:32–17:21]: "we've got an image that's underneath an[other] image, and... some really
  cool white space spacing between the header here and the text here... They've made a variation just enough.
  To where it's really, really interesting." Generic advice to match: "take these normal or menial or average
  layouts that everybody uses and you can add your own sauce in them."
- Evidence: `t00m16m45` — TechTO example: laptop + overlapping audience photo on the left, big serif "Stay Ahead"
  well above its paragraph + outline CTA on the right; lime divider below.
- Effect: recognizably "the same" pattern survives as fresh sections.
- Transfer: spacing asymmetries (lag between heading and body) are cheap "sauce" that don't change structure.

### L23-24 Count columns by alignment, not by visible rectangles
- Problem [transcript 17:22–18:07]: a layout with three visible objects gets misread as three columns.
- Decision: his working definition — a column is an aligned vertical stack; turning on the grid shows the left
  stack and the right-aligned image sharing the same two column rails ("if I bring up the columns... what I've
  done is I've just right aligned this image and left aligned this image, but they're still in the same column...
  stretched across these 1,2,3,4,5 columns").
- Evidence: `t00m17m50` — wireframe with a 12-column grid overlay in pink; one large block spanning left rails,
  one small square right-aligned at the outer rail (selection size 239×239 visible), text + pill mid-right.
- Effect: consistent counting makes the 17-example taxonomy internally consistent (also reused at 20:21–20:49
  "it looks like it might be three columns. It's actually just two").
- Transfer: turn the grid ON to call a layout's true column count; keep negative space inside a column.
- [interp] This is why the same file's examples can be re-bucketed (V-numbers) without contradictions.

### L23-25 Bentos: give the priority element the attention budget, then flop the composition for variation
- Problem [transcript 18:08–18:51]: a grid with a video and text invites attention bankruptcy ("Where are my
  eyes supposed to go?... I've got this video that's really commanding my attention, but... we want people to
  read this text").
- Decision: "make sure that whatever has the most priority in the layout is getting the most attention with
  things like contrast or color or size or white space"; then vary by swapping box sizes: "you've got a smaller
  box on the right and a bigger box on the left, and then we just flopped it on this guy."
- Evidence: `t00m18m30` — Arch Agency hero: giant navy display block "LEADING INFLUENCER MARKETING AGENCY FOR
  GAMES & APPS" on a white card (the oversized box) with phone-screens montage right and lime PLAY VIDEO disc —
  type out-weights media here; `t00m18m58` — library shows the Arch wireframes (Left Column / Right Column
  component split) beside the next example.
- Transfer: bento variants differ by (a) which cell is biggest, (b) which cell is loudest; vary exactly one.

### L23-26 Dense stacked text becomes scannable with hairlines + leading icons
- Problem [transcript 19:18–19:52]: "a lot of text... stacked up one right after the other" is a wall: "Without
  them, it'd be pretty tough to know where one sentence ends and another one begins."
- Decision: separate each line with a rule and a leading icon ("they've done that specifically with these lines
  and these icons... layout to make it easy to just scan through and read parts of this").
- Evidence: `t00m19m40` — Perplexity AI "THE EXPERIENCE" list: nine hairline-separated rows, pictogram column at
  left (calendar, pen, smiley, arrows, PRO chip, shirt, chat, plane) with short monospace lines.
- Transfer: any 6+ item promise list gets table treatment (rule + glyph + one line), not paragraphs.

### L23-27 Mix-and-match sections (1 col over 2): set type calipers deliberately
- Problem [transcript 20:50–22:40]: mixed-rhythm sections easily get scrunchy; he names the two failure modes —
  line-height too tight ("this line and this line come together... tougher to read") and too loose ("their eyes
  have to be up here and then bounce to the bottom").
- Decision: on Seed Design's black section — high contrast font on black, "an appropriate amount of line height
  between each of the lines", a size variation (bigger header next to "a darker and smaller line of paragraph")
  so the eye path is "here, then here, then here"; the payoff line ("look sharp. Convert faster and grow
  bigger.") is the section's retained hook, with visuals deliberately de-emphasized.
- Evidence: `t00m20m35` — the "looks-like-3-is-actually-2" wireframe; `t00m21m15` — live Seed Design: "Let's make
  your brand recognizable" (orange scribble underline) + trophy rows Premium Designs / Deep Expertise left,
  laptop mockup right, pixel-art cards below.
- Transfer: mixed sections need explicit leading + size values, not vibes; check the bounce distance.

### L23-28 Give the file away (free Figma library), keep improving it publicly
- Decision [transcript 23:05–23:33]: "you can have this very Figma file... 100% for free. There is a link
  [below]... I'm gonna be adding different ideas as time goes on... take this file, use it, tweak it, and really
  make it your own."
- Effect: generosity as audience engine for the series (EP3 uses the same file — cross-video lock-in).
- Transfer: ship reusable artifacts with ongoing updates rather than one-off inspiration posts.

## Creator tendencies observed (feeds creator-profiles.md)

- The "stage/characters" metaphor: main character vs supporting characters recurs in both series episodes.
- Always frames tools as a small fixed trio (hierarchy/variation/balance; capture/evaluate/emulate) —
  teachable checklists over encyclopedias.
- Anti-example discipline: for every rule there's a named real site that fails it (Goodreads, Yale School of
  Art), examined without mockery.
- The Figma library is the series' spine: same file across EP2/EP3, mobile variants always beside desktop.
- Prefers real-source labels (Finta, Paper, RAAD, Arch, Perplexity, TechTO, Gilion, Clade, State of Create,
  Nick Tarasov, Family Style, Portrait, Era, Balky/Studio, Female Talent Agency, Seed Design) over abstract
  mockups — attribution is part of teaching.
- Type-forward taste: display serif/slab heroes, dual-tone headlines, bold color in neutral seas; accessibility
  mentions appear when images sit under text.

## Unverified / transcript-only observations

- The title's "17 swipeable examples" is never shown as a numbered manifest; I directly verified 14 distinct
  source-site examples on frames (Finta, Paper Design, Family Style, RAAD, Nick Tarasov, State of Create,
  Portrait, Gilion, TechTO, Arch Agency, Perplexity AI, Clade Template, Seed Design, plus theory slides Female
  Talent Agency/Balky/Era/Made With Gsap/Goodreads). The remaining example slots (library holds versions V1–V9
  per layout family) were not individually screen-verified within the frame budget.
- Motion claims not verifiable in stills: Nick site's load/funnel animation (11:45–12:10), Portrait's pop-in
  (verified mid-state in `t00m13m20` but not the motion), State of Create collage behavior (13:10–13:44),
  any hover states.
- Transcript-only: the exact mobile variant of each of the 17 examples beyond the wireframes captured in
  `t00m9m05`, `t00m14m35`, `t00m17m50`; Gilion's pre-scroll "vermed." ghost text (`t00m18m40` in video 17's
  file, not here); the second Seed Design screen with "look sharp. Convert faster and grow bigger." (22:25)
  was described but not frame-verified here.
- Sponsor/ad: none in this video; description contains Showit affiliate links (not mined).

## Quotable diagnostics (explicit)

- "If your layout confuses them for even a second, their brain checks out and they are gone." (0:37–0:43)
- "Think of your layout as a stage. You've got the main characters... minor characters in the back." (1:12–1:21)
- "Bold colors in a sea of neutrals will create instant focus." (2:28–2:33)
- "Balance doesn't necessarily mean symmetry. It means that the layout feels stable, like nothing's tipping
  over." (6:07–6:18)
- "Don't let this be the only go-to move that you have... use this purposefully, but don't lean on it as a
  crutch." (16:16–16:31)
- "It's almost like a funnel... it looks like a triangle. It's just pointing us down." (11:52–12:04)
- "You can take these normal or menial or average layouts that everybody uses and you can add your own sauce in
  them a little bit." (16:58–17:08)
- "Oh, don't forget, if you don't quit, you win." (23:45 — series sign-off)
