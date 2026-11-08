# Research Notes — Video 07

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/U7jTCgIWS4w
- Title: "Bad vs Great UX/UI Design, It's Not Even Close"
- Creator: uxpeak (design-teaching channel)
- Duration: 15:32 · Published: 2026-10-08 · Views: ~95k · Likes: ~2.2k
- Classification: comparative teardown — the same screen designed at four skill levels
- Access: transcript (En auto-captions) + 30 frames viewed at 720p from full video
- Subject: two case studies, each with four versions of one screen: (1) food-delivery
  restaurant-list (app "Verde") — junior = C, mid = A, senior = D, staff = B; (2) a real-estate
  filter dialog (Portland, 1,557 homes) — junior = A, mid = B, senior = C, staff = D.
  Core thesis (video description): "Less UI doesn't always mean better UX… Great UX is knowing
  what actually helps the user make a decision."

## Structure (chapters verified in metadata)

0:00 Designing food delivery apps → 5:08 The challenge of filters → 6:37 Using design research
tools (Mobbin MCP — sponsor) → 7:44 Iterative filter design

Sponsor/self-promo segments: uxpeak+ pitch woven at ≈4:20–5:08 and again at the food-app close
(caveat "none of these is finished… in our UX Peak Plus platform…"); Mobbin/Mobbin-MCP sponsor
≈6:23–7:44 (frame `t0655m` = Mobbin logo). Treated as ads, not mined for lessons. Outro
15:09–15:32 (cold apology) is not design content.

## Teaching format

Grade-comparison game. Four variants of the same screen (same photos, same data) labeled A/B/C/D;
viewer is asked to pick the best before the reveal; then each level is critiqued in sequence
(junior → mid → senior → staff), each level fixing the previous one's core failure. Real shipped
apps (Zomato, Uber Eats) used as pattern witnesses. Second half is a pure before→after ladder of
the same filter dialog at four capability levels, ending with the staff version that turns
controls into decision-support. Dense on-screen callouts ("Radius 4", "3 taps", masked-text
hierarchy demos).

## Lesson log

### L07-1 Proposal: show food, not logos — the photo answers "what am I eating"
- Context: critiquing the junior screen (C). "There is one decision here they got right" (0:39).
- Decision: restaurant cards use food photos. Explicit 0:48–0:53: "A logo tells you who is
  selling. A photo tells you what you are eating and that is what you came for."
- Evidence: `t0050m` (side-by-side same card with placeholder logo tile vs real food photo),
  `t0012m` (all four versions use food photos).
- Fails: marketplaces where the seller brand IS the product (fashion, electronics).
- Transfer: list-row identity media should depict the thing the user is choosing, not the entity
  supplying it.

### L07-2 Appetite needs pixels — and the above-the-fold metric is a dead heuristic
- Decision: 56px thumbnails → large rectangle photos (mid version makes them "three times wider…
  the biggest thing on the card"); later full-width (senior).
- Reasoning (explicit 0:58–1:29): "An image in a list can identify or it can create appetite.
  Appetite takes real space. At 56 pixels… it doesn't make you want to eat it. And why is it so
  small? Because six restaurants fit above the fold… That is the first mistake, and it's still
  being taught as a good thing. Everybody scrolls now. What matters is whether the first thing
  somebody sees is worth continuing for, not how much you fit before the cut."
- Evidence: `t0012m` (C: tiny 2×2 photo grid) vs `t0235m` (A: large rounded photos, dish-driven
  cards) and `t0310m` (D: full-width photo takes over the card).
- Fails: utility lists where recognition speed beats desire (contacts, settings).
- Transfer: hero-media scale should serve the emotional job of the list; density is not a goal.

### L07-3 Don't bury high-frequency controls — surface them as tapables
- Problem (junior C): filters/sort hidden "inside two drop-downs with 17 options behind them you
  would never know about" (1:38–1:44).
- Decision (mid A, kept by senior D): quick-filter chips on screen + visible filter/sort buttons —
  "What the junior buried is now something you can find" (2:43).
- Evidence: `t0139m` (C: purple "Filters ⌄" + "Sort ⌄" dropdowns), `t0310m`/`t0356m` (D: circular
  filter + sort icon buttons beside "Under 30 min"/"Free delivery" chips), `t0320m` (Zomato real
  app showing the same chips row — placement witness).
- Transfer: inventory the 5 controls users touch every session; none of them may live behind a
  disclosure.

### L07-4 Hierarchy is naming the reading order — name steps up, meta steps down
- Problem (C): "If you cannot say which element somebody should read first, they will not be able
  to either" (1:54) — name 13px, everything else 11.5px on one gray line.
- Decision (A): name enlarges to the visual top, rating "takes the star and the weight," supporting
  meta drops to gray — "That is what lets you scan a list instead of reading it" (2:37).
- Evidence: `t0152m` (diagnosis visual: card with all secondary text masked into equal gray blocks
  = no hierarchy), `t0235m` (A: "Dolce Bar ★ 4.7 (612)" dominant, "Cakes and pastries · 0.6 km /
  20 min · €0.99" recessive).
- Transfer: for any row/card, force yourself to say the reading order aloud; if you can't, the
  type system has none.

### L07-5 One shape language per screen
- Problem (C): "every corner here is four pixels while the category images are circles. Two
  different shape languages on the same screen" (1:58–2:04).
- Decision (A/D): rounder corners applied universally — "the same rounding runs across the whole
  screen" (2:18).
- Evidence: `t0203m` ("Radius 4" callouts on search field, buttons, and card while category images
  are ringed as circles = mismatch made visible), `t0310m` (D: one corner system throughout).
- Transfer: radius scale is a token like color; components may vary within it, never across it.

### L07-6 Replace category photos with owned iconography — identity + de-duplication
- Decision (senior D at 2:52–3:08): category row of food photos becomes a custom icon set. Stated
  benefits: "It gives the app a personality that the stock photos do not. And it stops six food
  photos competing with the six food photos directly underneath them, so the actual meals stand
  out more."
- Evidence: `t0310m` (D's icon row above full-width meal photos), `t0304m` (comic b-roll: six
  category dishes stacked on a pole, "How is this fair?" — visualizing the competition problem),
  `t0356m` (staff B: quieter 3D-style icons on beige tiles "so the row stays out of the way of the
  food," 4:01).
- Transfer: navigation imagery competes with content imagery; own the first (icons/illustration),
  reserve photography for the content.

### L07-7 Copy known patterns: put controls where giants put them; show counts; offer layout choice
- Decision (senior D): filter button + sort beside quick chips — "that's exactly where Zomato,
  Swiggy, and Glovo put theirs" (3:18–3:22); result count "640 places" ("You know how much you are
  looking through, which changes how you approach it," 3:25); layout switch cards/compact-list —
  "When there is no correct default for everybody, give people the control" (3:45).
- Evidence: `t0320m` (Zomato's live filter chips row), `t0356m` (D: icon buttons, "Open near you
  640 places", segmented card/list toggle).
- Fails: pattern-copying without the "why" is called out by the creator himself ("copying a screen
  you like gets you that one screen," 4:47).
- Transfer: before inventing placement, screenshot 3 market leaders; converge on their pattern
  unless you have a tested reason not to.

### L07-8 Staff-level cards are asset-proof: text leaves the photo; copy enumerates the domain
- Decision (staff B): "the name and the numbers come off the photo, which means the card looks the
  same whatever the restaurant uploads as its photo" (4:11–4:16) — photo on top, details
  underneath, "Uber Eats builds its cards the same way"; search placeholder says "what you can
  actually search for — places, dishes or cuisines" (3:54); personalized "BEST MATCH" label on the
  top card (4:04).
- Evidence: `t0356m` (B top: "Search places, dishes or cuisines"), `t0410m` (transition:
  overlay text on photo mid-animation), `t0414m` (final: clean photo, "Salt & Lime / 20 min /
  ★ 4.8 (3,201) · Tacos and ceviche · 0.8 km / Free" beneath), `t0416m` (Uber Eats live card:
  photo on top, "Domino's / Uber One benefits apply · 14 min / 4.3★ (340+)" beneath).
- Transfer: any card that hosts user-supplied media must keep its text layer outside the media or
  it inherits every asset's failure modes (light, busy, empty).

### L07-9 Filters: user criteria are soft constraints, not hard values
- Setup [5:36–6:22]: buyers say "3 bedrooms, 2 baths, budget" but "those requirements usually
  aren't as fixed as they sound" — if 3 bedrooms leaves almost nothing, 2 works; +$50k might open
  better options. Explicit: "the job of a filter isn't just to ask the user for a bunch of values
  and hide everything that doesn't match. It has to help them narrow down a huge set of options
  while they're still figuring out what they actually want."
- Evidence: scenario is animated (not frame-verified in detail; the numbers only reappear later —
  see Unverified). The consequence shows up in staff UI: `t01314m` ("459 of 1,557", median line),
  `t01425m` (per-option counts).
- Transfer: design every filter control for revision and trade-off discovery, not single-shot
  form-filling.

### L07-10 Simplicity that relocates work is not simplicity (junior filter)
- Problem (A): each filter gets its own page. Setting 2 filters = 7 taps; on each page the other
  choices are invisible ("I'm making each decision separately, even though those decisions are
  actually connected," 9:08); opening the filter hides the homes ("the homes I was just looking at
  disappear completely," 9:27); no outcome feedback — the button "just says show homes… I could
  have 41 matches. I could have four. I could have none. I only find out after I tap it" (9:33).
- Explicit verdict 9:48–9:54: "there's an important difference between making the interface look
  simpler and making the decision easier."
- Evidence: `t0752m` (A: full-page takeover modal, no results visible), `t0825m` (four sequential
  sub-pages: price / bedrooms list / bathrooms list / home-type list), `t0844m` ("3 taps" callout
  after Bedrooms=3+ set), `t0936m` (filter page sliding over the vanishing home results).
- Fails: genuinely rarely-changed settings (a full-page editor is fine there).
- Transfer: audit any "clean" minimal flow with three numbers: taps to task, visibility of
  connected choices, feedback before commit.

### L07-11 Sheet over results + one scroll + dual price inputs + a CTA that states the outcome
- Decisions (mid B): filter opens as a sheet so "you still have some sense of the page you came
  from" (10:07); all filters in one scroll to balance choices against each other; price = slider
  for exploration + manual inputs for precision ("quick exploration with the slider and precision
  when you need it," 10:45); button states the count — "Instead of just saying show homes, it
  tells me exactly what my current filters will return. Show 41 homes" (11:12–11:20).
- Self-critique kept in: steppers for bedrooms/bathrooms rejected by the author — minus/plus "works
  when you're nudging a number you already have, like the quantity in your basket or the
  temperature on a thermostat. But if I already know I want three bedrooms, making me tap my way
  up to three is slower and it hides the other options" (10:52–11:09).
- Evidence: `t01006m` (sheet over dimmed Portland results), `t01035m` (slider focus + min/max +
  "− 2+ +" stepper), `t01119m` ("Show homes" pre-count state), `t01122m` ("Show 41 homes" with
  House chip being tapped), `t0752m` (B sheet in overview: "Show 638 homes").
- Transfer: container = keep context; controls = fast path + precise path; commit = state the
  consequence before it happens.

### L07-12 Put the market inside the control: histogram, "3+" semantics, exact-number escape
- Decisions (senior C): histogram behind the price slider shows the distribution of available
  homes — "before, $700,000 and $750,000 were just two numbers on a range. Now I can actually see
  whether… stretching my budget a little would suddenly open up a lot more options… The control
  isn't just asking me for a price anymore. It's showing me what's actually available" (11:38–12:15).
  Steppers replaced by all-visible option chips (Studio/1+/2+/3+/4+); the "+" matters — "choosing
  three shouldn't accidentally remove every four-bedroom home"; an "Exact number of bedrooms"
  checkbox preserves exact-match (12:27–12:46). Home-type options get icons "making the choices
  easier to recognize and scan" (12:49).
- Evidence: `t0752m` (C overview: "Any home · median $532K" + histogram), `t01142m` (histogram
  bars literally morphing from home thumbnails — the mechanism visualized; caption reads "3+ bed
  homes · median $568K" with filters applied), `t01224m` (bedroom/bathroom chip rows + "Exact
  number of…" checkboxes), `t01253m` (icon tiles for House/Townhouse/Condo/Multi-family/Mobile/Land
  + live count "Show 359 homes").
- Transfer: any range control over real inventory should carry its distribution; option sets
  should default to inclusive semantics with an exact-match escape hatch.

### L07-13 Staff: connect the market to the user's own constraints — counts, medians, affordability
- Decisions (staff D): price header gains "459 of 1,557" (how much market fits current filters)
  and "3+ bed homes · median $568K" (median for the filtered subset), so "I'm not looking at price
  in isolation anymore" (13:23). Mortgage calculator: user enters deposit ($65,000), comfortable
  monthly ($5,000/mo), interest rate (6.4%, 30-year fixed) — "instead of forcing me to somehow turn
  those numbers into a house price myself, the product does that work for me" (13:49) — output
  "Up to $10,550 a month" then "places that limit directly onto the histogram" (14:00). Bedroom
  options each show the count they return: "Studio 11 / 1+ 628 / 2+ 589 / 3+ 459 / 4+ 229" — "I
  can see what making the filter stricter will cost me before I make the decision" (14:30) — plus
  range selection (tap 2 then 4 → range) for "somewhere between two and four bedrooms" (14:52).
- Evidence: `t01314m` ("459 of 1,557", median caption, histogram, mortgage callout), `t01355m`
  (calculator inputs + helper "Add both and I'll work out the price you can shop at"), `t01425m`
  (per-option counts, 3+ selected in purple), `t01456m` (2–4 range band across the segmented
  control, per-option counts "10/37/131/231/229", bathrooms "89/71/157/43/2", "Clear" link).
- Reasoning (explicit 13:37–13:48): users "may not actually know" their max price; what they know
  is deposit and monthly comfort.
- Fails: datasets too small/sparse for meaningful distributions; extra context that cannot update
  live becomes noise.
- Transfer: the highest level of filter design converts "controls" into "decision support": show
  inventory size per option, convert human-readable resources into the query parameter, project
  the constraint back onto the data view.

### L07-14 The density trade-off is the final skill gate
- Explicit (15:00–15:09): "the trade-off is that all this extra content makes the interface busier.
  So, the challenge is knowing what information genuinely helps the decision and what just adds
  noise."
- Transfer: every added signal must change a decision the user can act on in place; otherwise cut.
  This is the video's stated boundary between senior and staff work.

## Creator tendencies observed (feeds creator-profiles.md)

- A/B/C/D quiz framing with comment CTA ("write in the comments which one you picked") at both
  case-study openings and the close; engagement mechanics mirror video-06.
- Skill-level ladder (junior → mid → senior → staff) as a teaching scaffold; each level's verdict
  is one crisp sentence, its flaws enumerated as numbered "mistakes."
- Real shipped apps deployed as pattern witnesses (Zomato/Swiggy/Glovo placement, Uber Eats card
  anatomy); named brands carry the credibility.
- Diagnosis visual languages: masked-text blocks for hierarchy, round-corner callouts ("Radius
  4"), tap-count badges ("3 taps"), house-thumbnails-morphing-into-histogram-bars animations.
- Two signed sponsor/self-promo plugs (uxpeak+ platform, Mobbin MCP) per video, both with discount
  codes; framing is always "the why behind decisions, not just the what."
- Closing humility move: staff screen declared unfinished; disagreement invited ("anything you
  completely disagree with — we want to hear it all").

## Unverified / not analyzed

- Scenario scene 5:08–6:23 (Portland, "more than 1,500 homes," narrowing to 41): visuals not
  frame-verified (no frame extracted); numbers only verified later inside filter UI
  (`t01314m` "459 of 1,557", `t01122m` "Show 41 homes").
- Mobbin sponsor block 6:23–7:44: only the logo frame (`t0655m`) viewed; the described MCP/
  Claude workflow (prompt example at 7:10) is transcript-only and treated as sponsor content.
- uxpeak+ pitch visuals 4:20–5:08: not frame-extracted (self-promo).
- The four intro phones at 0:00–0:33 verified via `t0012m` single frame; micro-differences between
  A and C photo sizes (56px numeric claims) taken from transcript, not measured off frames.
- Senior version's initial price caption "Any home · median $532K" verified only in the 7:52
  overview frame; its walkthrough state (`t01142m`) shows a filtered variant instead.
- Frame `t0304m` is comedy b-roll ("How is this fair?") between sections — context, not UI evidence.

## Quotable diagnostics (explicit)

- "A logo tells you who is selling. A photo tells you what you are eating." (0:48)
- "Everybody scrolls now. What matters is whether the first thing somebody sees is worth
  continuing for, not how much you fit before the cut." (1:23)
- "If you cannot say which element somebody should read first, they will not be able to either."
  (1:54)
- "That is what lets you scan a list instead of reading it." (2:37)
- "When there is no correct default for everybody, give people the control." (3:45)
- "Copying a screen you like gets you that one screen. Understanding why a senior or a staff
  designer chose what they chose is what you can use everywhere else." (4:47)
- "The job of a filter isn't just to ask the user for a bunch of values and hide everything that
  doesn't match." (5:56)
- "There's an important difference between making the interface look simpler and making the
  decision easier." (9:49)
- "The control isn't just asking me for a price anymore. It's showing me what's actually
  available." (12:11)
- "The challenge is knowing what information genuinely helps the decision and what just adds
  noise." (15:05)
