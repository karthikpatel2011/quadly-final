# Research Notes — Video 13

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/kdRkuqu8apE
- Title: "I Studied 2,108 Dashboards To See What Sticks"
- Creator: Mobbin (the design-reference platform; unnamed female presenter filming at a desk
  with a Mobbin-stickered MacBook and a Mobbin t-shirt, Shure mic)
- Duration: 5:07 (307s) · Published: 2026-05-05 · Views: ~87k
- Classification: data-backed pattern study built on Mobbin's own reference corpus; precedes
  and teases the onboarding study (video 20) and a paywalls video
- Access: transcript (En) + 16 frames viewed at 720p from full video
- Subject: why competent dashboards are forgettable and what the sticky ones do — with three
  published stat slides from Mobbin's dashboard corpus

## Structure (chapters verified in metadata)

0:00 Signals → 0:46 Anticipation → 1:15 Breaking the mold → 2:08 The pitch → 3:21 Coining
metrics → 3:44 Where dashboards are heading (ends 5:07 with the onboarding teaser)

## Dataset (as shown on slides)

Counted corpus: 2,108 dashboards (stated in title + 0:30–0:33; the 4:20 slide's partially
legible left rail reads "…in.com / dashboard screens / 536 apps & websites / …notes (≤30
screens) / …t April 2026" — consistent with 2,108 dashboard screens across 536 apps/websites,
snapshot April 2026). The 2:40 "Dashboard Composition" slide states its own basis: "of 536
apps with dashboards."

## Teaching format

Fast-cut EXPLAINER: stat slides (light card on black, bar/donut charts, a left rail naming the
dataset) intercut with real product screens navigated inside Mobbin's own viewer (Save / Copy
buttons, "Found in X" tags, Screens/Prototype/Video toggles), plus presenter cam bottom-right.
Every claim is either a number or a named example; no talking-head-only stretches.

## Lesson log

### L13-1 The gut check for dashboards: would you screenshot this, and why?
- Problem [transcript 0:00–0:45]: "Most dashboards look identical. They work, but they don't
  stick. Templates are everywhere. AI can generate one in seconds." She studied 2,108 of them —
  "the obvious stuff is all there. Clear hierarchy, good spacing, useful charts. These are
  perfectly fine dashboards. But, if I close this right now, would you remember any of them?"
- Decision: judge dashboards by memorability and intent, not correctness. The 2,108-data-point
  conclusion: "the dashboards that I would screenshot weren't the prettiest ones. They were the
  ones that knew what to leave out, and they just happened to look good doing it" (4:36–4:43).
- Evidence: `t00m0m31` (presenter introducing the study); `t00m4m20` (closing stat slide);
  `t00m1m36` (the stripped-clean analytics screen that opens the "clean stands out" beat).
- Reasoning (explicit 4:28–4:36): "Thousands of dashboards later, I keep going back to that one
  simple gut check. Would I screenshot this, and why?"
- Effect: a portable evaluation heuristic that survives trend churn.
- Fails: internal tools where memorability is irrelevant (screenshot-worthiness is a
  product-growth lens).
- Transfer: audit any screen with "would a user share/screenshots this, and why?" before
  adding more modules.
- [interp] "Knew what to leave out" reads as subtraction being the differentiator, since all
  2,108 already clear the baseline hierarchy/spacing/charts bar.

### L13-2 Be one step ahead: put interpretation beside the data
- Problem [transcript 0:48–0:59]: a raw line chart leaves the user asking "what happened?"
- Decision: Faith (the stock screen she names) "puts the key insights next to it. It doesn't
  just show you what happened. It shows you what to do about it."
- Evidence: `t00m0m54` — dark-maroon trading dashboard: large minimalist line chart left;
  floating "Key Indicators" card right with three plain-language rows carrying status dots —
  red: "Underperforming S&P 500 by **20.47%** YTD" · red: "Trading at **4.73%** below
  estimates" · green: "Earnings are forecast to grow **19.58%** per year" — plus footnote
  "Metrics analyzed at 6:00 AM, Feb 25"; below, a metric strip (FY Revenue $97.69B, EPS $2.21,
  Gross Margin 16.26%, Profit Margin 9.01%, Beta 2.33, Div yield N/A, Sector Cons Cyc) and a
  top "Analyze" action.
- Implementation: insight rows = signed comparison vs a benchmark + tense (already / forecast)
  + timestamp of analysis, color-coded good/bad.
- Effect: chart becomes a verdict; scanning replaces analysis.
- When appropriate: any KPI surface. Fails: when generated insights are wrong (trust collapse).
- Transfer: every primary chart deserves one sentence of interpretation with a number in it.

### L13-3 Package data as narrative artifacts: recaps, briefs, highlights
- Problem [1:02–1:14]: raw stats don't produce a feeling of accomplishment.
- Decision: Origin "shows you your weekly recap in a way that's easy to understand, along with
  a daily market brief"; Runna (screen-spelled; transcript says "Runner") "packages your stats
  into highlights that give you a sense of accomplishment."
- Evidence: `t00m1m03` — Origin desktop dashboard: greeting "Good morning, Sam", net worth
  $2,072 (+$1,072.39 107.24%), spending calendar, right rail with a story-format modal "Your
  weekly recap — February 21-27" (green gradient, story progress dashes), "PERSONAL RECAP"
  cards ("Your weekly recap February 21st to February 27th", "Daily market brief — US PPI data
  looms…"), an onboarding-progress card ("Make the most of Origin — 33% complete"), and an
  "Ask anything" input bottom-left. `t00m1m10` — "Workout highlight in Runna" inside Mobbin's
  prototype view: 5 phone screens (run map "Easy run in the morning!", "How did you find this
  workout?", "My First Run — Congrats on your Walk/Run session!", "Laps — You completed 15
  laps" green bar list, "Elevation 193m").
- Implementation: wrap data in named recurring artifacts (recap/brief/highlight), story-like
  presentation, congratulatory microcopy.
- Effect: dashboards produce an ending ("accomplishment") instead of an open ledger.
- Transfer: give analytics a cadence (weekly/daily/post-session) and a name; closure is a feature.

### L13-4 Dare to be the outlier: one deliberate visual idea beats template polish
- Problem [1:15–1:41]: "Most dashboards look the same… being this clean stands out."
- Decision (four named examples): Shopify **Live View** — real-time dotted globe, "every dot is
  a real person browsing your store somewhere right now"; **Visitors** (web analytics) — wins
  by being radically clean; **Front** — a heatmap where "darker squares just mean busier
  hours"; **Cake** — "put a literal birthday cake inside their ownership donut chart."
- Evidence: `t00m1m24` (Shopify Live View: pale dotted 3D globe with a location pin beside a
  stat column — Total sessions 6, Total orders 2, Top locations Singapore 4 / Boardman 2,
  First-time customers 2, Top products, a 3-step "Customer behavior" funnel odds — Active
  carts 1 / Checking out 1 / Purchased 1); `t00m1m36` (the near-empty white analytics
  dashboard — funnel selector, People/Conversion Rate columns, Referrers + Countries tables)
  shown while she names the clean one; `t00m1m42` (Front: "Busiest times" Mon–Sun × 9AM–5PM
  grid, values 0–8 with purple intensity, peak cells Thu 1PM = 8 / Fri 1PM = 7; a ring gauge
  "Efficiency — Reply time (avg) 7m 4s"; a date-range menu where "Last year" is diamond-gated
  behind "Upgrade to the latest Professional plan"); `t00m1m48` (Cake Equity dashboard:
  ownership donut with a lit birthday-cake glyph inside, Top Stakeholders rows Jon Smith
  68.42% / Jane Smith 10.52% / Unallocated Options 21.05%, stat rail 2 stakeholders / 30
  shares / 38 securities / $100 valuation, funding-round progress "Bootstrapped $30.00
  committed of $110.00, 23 days left").
- Reasoning (explicit 1:59–2:06): "You can tell these weren't templates. Someone sat down and
  thought, 'How do I actually make this data make sense to my users so they get it instantly?'"
- Effect: instant-get + memorability; each idea maps to the data's real meaning (liveness →
  globe; workload → heatmap; celebration → cake).
- Fails: decoration that doesn't carry meaning; gimmicks on core workflows.
- Transfer: pick ONE distinctive visual device per dashboard that encodes the data's essence.

### L13-5 Empty states are product moments (Mercury's game)
- Problem [transcript 1:52–1:58]: an empty table after all bills are paid is a dead end (and,
  arguably, a missed delight opportunity).
- Decision: Mercury "lets you play a game" instead.
- Evidence: `t00m1m55` — Mobbin screen "Playing zero inbox in Mercury": the Bill Pay empty
  state is a full retro-arcade panel on a starfield: "HOW TO PLAY — ARROW KEYS TO MOVE LEFT
  AND RIGHT. SPACE BLASTS BILLS." with a "START" button, sitting inside the otherwise-standard
  banking app (Inbox / Needs Approval / Scheduled / Paid tabs; sidebar Home/Tasks/Transactions/
  Payments/Cards/Capital/Accounts, Workflows: Bill Pay, Invoicing, Reimbursements, Accounting).
- Effect: state of completion = reward; users can enjoy having finished.
- Transfer: design for the rarest emotional states (all-done, zero, first arrival), not just
  the busy default.

### L13-6 The quantified baseline: what dashboards are made of
- Problem: "why do people keep coming back?" to dashboard references at all (0:19–0:30) —
  plus the sales role of the dashboard.
- Decision: publish the composition data. "Nearly one in five products on Mobbin have their
  dashboard as the home screen" (2:36); "when we're choosing between Shopify and 10 other
  platforms that do roughly the same thing, the dashboard does a lot of the convincing. One
  screenshot that tells you exactly what this product does, how you're doing, and what to do
  next" (2:42–2:55).
- Evidence: `t00m2m40` — "Dashboard Composition" slide, "Patterns that co-occur with the
  Dashboard tag, by unique app (of 536 apps with dashboards)": **Charts 266 apps · 45.6%** ·
  **Home (highlighted blue) = 1 in 5 apps (19%)** · My Account & Profile 77 · 14.4% · Date &
  Time 76 · 14.2% · Progress 75 · 14% · Timeline & History 39 · 7.3% · Wallet & Balance 34 ·
  6.3% · User/Group Profile 26 · 4.9% · Map 25 · 4.7% · Achievements & Awards 20 · 3.7%.
- Effect: a reference baseline to compare your own dashboard against; hard proof that
  dashboards are marketing surfaces.
- Transfer: the "one screenshot pitch" test — a dashboard should answer what-the-product-does,
  how-you're-doing, what-next in a single frame.
- [interp] The etymology digression (dashboard = mud-deflector board on horse carriages → car
  instrument panel → "place for signals"; "The form keeps changing. The job never changed,"
  2:33) is transcript-only (no frame captured) and functions as rhetoric for this lesson.

### L13-7 Make the data itself shareable: mobile-native data-as-content
- Problem [2:56–3:15]: dashboards on desktop rarely leave the app.
- Decision: bring dashboards to mobile formats people already consume. Opal "turns screen time
  insights into a format like Instagram story. You swipe through your own data like it's
  content." Orbit (subscription manager) "makes tracking subscriptions weirdly enjoyable."
- Evidence: `t00m3m05` — Opal story screen: dark teal mobile card "Your most productive day
  was **Thursday** with **29m** of screen time" atop a Tue–Mon bar chart (45m/59m/20m/44m/45m),
  "Your most distracting day was **Wednesday** with **59m**" in pink, a "Did you know — You
  can create additional schedules to automatically block apps during your most distracting
  days" tip card, and a **"Share this story"** CTA at the bottom; story-progress dashes up
  top. `t00m3m18` — Mobbin app page "Orbit — Subscription manager" (iOS, 5.0, Finance): dark
  cosmic screens ("Welcome to Orbit" with orbiting service icons, highlight card "Orbit
  customers save **$300 a year on average**", onboarding screens).
- Reasoning (explicit 3:10–3:12): "When something looks this good, people are bound to share
  it" — the share loop is the growth mechanism.
- Transfer: if your data says something flattering or interesting about the user, format it
  for one-tap sharing (vertical, story-sized, named insight, single CTA).

### L13-8 Coin your own metric — vocabulary is switching cost
- Problem [3:21–3:46]: generic metrics have no loyalty; owning a metric concept does.
- Decision: "Duolingo made streaks a thing. Oura gives you a readiness score." And Apple's
  rings: "an Apple user might just say, 'I closed my rings.' Once that happens, it's very
  unlikely that this person would change to another fitness tracker."
- Evidence: `t00m3m27` — Duolingo full-bleed orange celebration screen with a burning Duo owl
  and a large "4" (day-4 streak), shown inside Mobbin ("Found in: Completing…"); the Oura and
  Apple moments were not captured on frames (see Unverified).
- Effect: a named, ownable unit of progress becomes the word users use — and abandoning the
  product means abandoning their vocabulary and history.
- Transfer: name the aggregate that matters for your domain (score/streak/rings) and make the
  name enter users' everyday speech.

### L13-9 The AI layer is where dashboards are heading — and the data says designers want it
- Problem [3:47–3:56]: the universal dashboard failure moment — "We've all had a moment staring
  at a dashboard asking, 'Why? What changed? What caused this spike?'"
- Decision: fill the gap with AI at two depths: "Sometimes as subtle as a single prompt right
  below your chart, or a full AI layer you can talk to right alongside your data."
- Evidence: `t00m4m10` — Evernote desktop home (1920×1200, in Mobbin): rainbow-gradient hero,
  an AI question popover with **Standard / AI-Powered** toggle, "Type a question" input and
  suggested prompts ("What's the flight number for my trip to Paris?", "Show me my notes with
  Attachments", "Notes that I created last week?") over a dashboard of Notes / My Tasks /
  Scratch Pad / Calendar / Pinned/Filtered Notes; and the AI section's stat slide.
- Stat (the video's headline number) [transcript 4:17–4:24 + slide `t00m4m20`]: "On Mobbin, AI
  dashboards get about **twice the saves and exports** of the average dashboard screen." Slide
  text: "The most saved & exported dashboards are **AI, Business & CRM** — ~2× the average
  dashboard — Overall avg: **293**" with a per-category bar chart (x-axis 0–700): top tier
  (blue) AI, Business, CRM, Finance, Crypto/Web3, Developer Tools; middle (green) Health &
  Fitness, Travel & Transportation, Education, Entertainment, Productivity; bottom (red) Social
  Networking, Lifestyle, Food & Drink, Shopping, Photo & Video, Maps & Navigation, News, Sports.
- Interpretation (explicit 4:24–4:28): "It reveals that designers are actively collecting these
  as references" — i.e., the demand signal is measured by Mobbin's own save/export telemetry.
- Transfer: when you can't explain a variance deterministically, put an ask-the-data affordance
  adjacent to the anomaly; measure which reference patterns people save, not just which look good.

## Creator tendencies observed (feeds creator-profiles.md; shared with video 20)

- Publishes self-studies as stat slides with a dataset footer rail (corpus, app count, snapshot
  date) — research-as-content marketing for Mobbin.
- Examples are navigated live inside Mobbin's viewer (Save/Copy, "Found in X" tags, Screens /
  Prototype / Video toggles) — every lesson doubles as a product demo.
- Presenter cam pinned bottom-right during product footage; full frame for stat slides.
- Rhetorical engine: open with a paradox ("templates everywhere… so why do people keep
  coming back?"), answer with named examples, close with a gut-check heuristic.
- Name attribution is loose in captions vs screens ("Runner" spoken vs "Runna" on screen) —
  verify names on frames, not just audio.
- Ends by teasing the next dataset study (onboarding → then paywalls video).

## Unverified / not analyzed

- The word-origin/history segment (2:12–2:33, wooden board → carriage → car dashboard): no
  frame extracted; transcript-only.
- "Some of the apps with the longest onboarding flows are also one of the most successful ones"
  + "three of them are AI products" claims — these belong to the video-20 dataset teaser
  (4:45–5:07); not dated/quantified in this video.
- Oura readiness-score screen and Apple rings visuals (3:29–3:42) not captured at 720p frames
  I extracted (3:33 sampled the presenter instead); transcript-only.
- Per-category exact save/export counts on the 4:20 chart (bar values are unlabeled except the
  "Overall avg: 293" reference line and the 0–700 axis).
- The exact product behind the 1:33–1:39 minimal analytics screen is named "Visitors" in the
  transcript; the frame's logo is too small to confirm visually.
- Transcription artifact: transcript spells the running app "Runner"; its Mobbin page title
  reads "Runna" (`t00m1m10`).

## Quotable diagnostics (explicit)

- "Most dashboards look identical. They work, but they don't stick." (0:00)
- "Dashboards are the designer's dream selfie." (0:22)
- "If I close this right now, would you remember any of them?" (0:42)
- "It doesn't just show you what happened. It shows you what to do about it." (0:57)
- "You can tell these weren't templates." (1:59)
- "The form keeps changing. The job never changed." (2:33)
- "Would I screenshot this, and why?" (4:33)
- "They were the ones that knew what to leave out, and they just happened to look good doing
  it." (4:39)
