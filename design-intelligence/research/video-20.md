# Research Notes — Video 20

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/Qsq-Sj_rojU
- Title: "I Studied 1,460 Onboarding Flows. Here's What I Found."
- Creator: Mobbin (same presenter/format as video 13 — the onboarding study that video 13 teased)
- Duration: 10:06 (606s) · Published: 2026-04-16 · Views: ~388k
- Classification: data-backed pattern study over Mobbin's own corpus; same template as video 13
- Access: transcript (En) + 20 frames viewed at 720p from full video (22 extracted/viewed; 2
  superseded frames pruned after review)
- Subject: what good onboarding looks like when you measure it — length stats, the
  signup→aha framework, eight named patterns, a dozen named apps, and five quantified A/B wins

## Structure (chapters verified in metadata)

0:00 What makes good onboarding? → 0:43 The framework → 1:05 Showing the outcome → 1:52
Onboarding that feels human → 2:32 Personalization → 3:46 Personalized Outcomes → 4:47
Paywalls → 5:31 Making long flows feel short → 6:45 Teaching in context → 7:54 Asking at the
right moment → 8:53 So… what does it come down to? → 9:18 Do we even need onboarding? → 9:44
Teaser

## Dataset (as shown on slides)

Counted corpus (dataset rail, `t00m0m22` and `t00m8m18`): "Mobbin.com — **1,460 onboarding
flows — 986 apps & websites — Snapshot: April 2026**." Slide nav names the published cuts:
Onboarding Length (By Category / By Platform / Top 20 Shortest / Top 10 Longest) and Patterns
(Pattern Prevalence / Paywall By Category / Personalization / Tutorial By Category).

## Teaching format

Same engine as video 13, amplified: stat slides (white card on black, left dataset rail) +
real flows shown in Mobbin's viewer with Screens/Prototype/Video toggles and A/B split cards
(labeled circles A/B) for before/after experiments, plus a Sensor Tower data card on one
example, presenter cam bottom-right, text-overlay chapter cards ("Onboarding flows that feel
human" 1:56).

## Lesson log

### L20-1 The length premise is wrong: long onboarding isn't the problem
- Problem [transcript 0:02–0:45]: "A lot of what I've read says keep it short, but based on
  what I found, the **average app has 25 onboarding screens**."
- Decision: interrogate length instead ofassuming it. Findings: longest categories are
  **finance, health & fitness, education**; "seven out of 10 of these longest apps are actually
  finance apps"; "some of the apps with the longest onboarding flows are also one of the most
  successful ones"; and "apps with the shortest onboarding flows — **three of them are AI
  products**." Conclusion (explicit 0:40): "Maybe keeping our onboarding flows short was never
  the point."
- Evidence: `t00m0m10` (presenter framed by a quoted `"keep it short"` overlay — the premise
  being tested); `t00m0m22` — master slide "Top 10 Longest Onboarding Flows" ("Total screens
  including nested flows"): Hyundai Card, Lemonade Insurance, Monzo, Noom (only health &
  fitness entry, green), Neo Financial, Kit, Philips Hue, Chase UK, Upwork, Mercury — bars to
  a 200-screen axis, legend Finance / Health & Fitness / Other, callout "**7 of 10 longest
  onboarding flows are Finance apps**."
- Effect: reframes the design question from "how few screens?" to "does each screen earn its place?"
- Transfer: treat off-the-shelf heuristics ("keep it short") as hypotheses to test against data.
- Note: the "average 25 screens" figure is spoken only; no slide with that number was captured.

### L20-2 The framework: onboarding exists to reach the Aha Moment, then build a Habit
- Problem: no shared definition of what onboarding is for.
- Decision [0:46–1:04]: map the journey as a loop — **Signup → Setup → Aha Moment → Habit**.
  "You hit the aha moment. That's where you actually feel the product's value. For Airbnb,
  it's making your first booking. For Netflix, it's finding and watching a show. For Mobbin,
  it's finding a screen… and saving it to your collection."
- Evidence: `t00m0m52` — the diagram itself: dashed circle with the four labeled nodes.
- Implementation: name your product's concrete first-value action, then design onboarding
  stages to route users to it as fast as the domain allows.
- Effect: length decisions become subordinate to "did we reach the aha moment?"
- Transfer: write the aha moment as a user-completed action (verb + object) before designing screens.

### L20-3 Sell the outcome, not the features
- Problem [1:06–1:52]: feature-listing welcome screens communicate nothing felt.
- Decision: "The best onboarding screens I've kept seeing had one thing in common. They're not
  listing features, they're selling the outcome." Four graded tactics: **Timehop** — welcome
  screen that just shows the product in action (mobile + desktop); **Runkeeper** — conveys
  what the app does "without reading a single word" via animation; **Alma** (transcript spells
  "Elma") — "lets you try the core experience before you sign up," which she flags as rare for
  AI-featured apps; **Superhuman** — "turn a boring sign up screen into a pitch with logos on
  the side as social proof."
- Evidence: `t00m1m18` (the mobile welcome screen she shows in the Timehop beat: purple
  illustrated phone in action over doodle art, headline "All-in-one planning and productivity,"
  Sign in with Apple / Continue with email / Log in here); `t00m1m34` ("Onboarding in Alma,"
  video tab: serif headline "Track nutrients towards the goals *you care about*," floating
  goal chips "Gain weight," green Continue — an interactive taste of the product pre-signup);
  `t00m1m46` (Mobbin page "Superhuman Mail — AI-native email for high-performing teams,"
  Flows tab: splash "Save 4 hours per person every single week" and the sign-up card "Trusted
  by teams at…" listing **OpenAI, Airtable, Cursor, Brex** logos; flow list shows 191-screen
  onboarding).
- Effect: users arrive pre-convinced; the sign-up wall becomes a closer, not a barrier.
- When appropriate: outcome is demonstrable visually. Fails: infra products whose value needs
  configuration first (setup-led onboarding).
- Transfer: replace "welcome to X, it has features A/B/C" with either the product in motion,
  a try-it-now surface, or proof others trust it.

### L20-4 Humanizing touches: founders' notes, signatures, unaware delights
- Problem [1:52–2:31]: onboarding reads like machinery.
- Decision: small human artifacts — the **One Year** app includes "a founder's note, which had
  a handwritten signature and a hand-drawn flower in it"; **Tinder** "acknowledge[s] when your
  birthday is around the corner"; **Airbnb** shows "a video from their CEO" when you
  successfully list your first space ("not even in the onboarding flow… a founder's touch at
  the aha moment"); **Basecamp** puts "a personal note from the CEO after you've created an
  account."
- Evidence: `t00m2m01` (One Year onboarding: typewriter-style mono type, hand-drawn blue
  watering-can illustration, instruction "add a widget to see your year grow, touch & hold an
  empty area, then tap edit" with an iOS widget context-menu mock and a purple "add widget"
  CTA — the same crafted, human register as the founder's note); a text-overlay chapter card
  reading "Onboarding flows that feel human" introduces this section on screen (~1:56).
- Reasoning (explicit 2:31): "It feels like the product was made with intention."
- Effect: trust and warmth at near-zero build cost.
- Transfer: one place in onboarding where a person (signature, photo, note) is visible beats
  any amount of polished gradient.
- Gap: the founder's note itself, Tinder's birthday card, Airbnb CEO video, Basecamp note —
  spoken examples without captured frames (see Unverified).

### L20-5 Personalization is worth your time — and AI apps barely do it
- Problem [2:33–2:51]: generic first-run experiences despite available intent data.
- Decision: quantify rather than assume: "**23% of apps personalize during onboarding, with AI
  apps at only 7%**." Her reading: "it seems like AI tools don't ask questions about your users
  up front. They let the product learn from us instead."
- Evidence: `t00m2m41` — slide "Apps That Personalize During Onboarding — Out of 986 apps
  analyzed": **23% of apps personalize = 230 out of 985 apps**; donut with legend "Personalize
  (230 apps) / Don't personalize (755 apps)"; bonus card not spoken in full: "Of those that
  personalize, **only 27% also show a paywall** — the quiz-then-paywall combo is rarer than
  you think."
- Effect: personalization is a differentiator precisely because adoption is low; and the
  personalization+paywall combo is under-used, not standard.
- Transfer: if your category's personalization rate ≈ AI apps' 7%, a two-question quiz is a
  moat.
- [interp] The 230/985 vs "986 analyzed" off-by-one is the slide's own arithmetic (a likely
  dedup); record as printed.

### L20-6 Small persuasion mechanics, measured: multi-select goals, conversational copy, map choice
- Problem [3:04–3:45]: single-pitch onboarding misses users with multiple intents; stiff quiz
  copy suppresses completion.
- Decision + numbers: **Headspace** "found out that their users come to their app with more
  than one pain point… instead of asking users to pick just one goal… they let them pick more
  than one. It's only like a very simple tweak, but it led to a **10% increase in free trial
  conversion**." **Dollar Shave Club** "tweaked the quiz copy to be more conversational. This
  alone led to a **5% increase in subscriptions**." **FocusFlight** ("Focus Flight" in
  transcript) "lets you choose your map style during onboarding. It makes the app feel like
  yours before you even started using it."
- Evidence: `t00m3m13` (Headspace "What's on your mind? I want to…" list — "Be present and
  mindful" checked with a blue check alongside Reduce stress / Manage anxiety / Sleep soundly /
  Feel calm and relaxed / Something else — i.e., explicit multi-select); `t00m3m40` (A/B card:
  A = Dollar Shave Club "Let's help you Get Ready. Which of the following things do you do?
  (We hope you're doing all three.)" with checked Ultimate Shave / Shower / Oral Care rows and
  a bright CONTINUE button; B panel still loading); FocusFlight's screens bank at `t00m5m11`
  (flight-map onboarding screens).
- Effect: tiny copy/interaction changes with measurable conversion deltas — persuasion is a
  feature you can A/B.
- Transfer: allow multi-intent selection at goal collection; humanize quiz copy by one
  register; let users style something early (ownership transfer).
- Fails: personalization questions that delay the aha moment without feeding the experience.

### L20-7 Show what the answers unlock: value previews before first use
- Problem [3:48–4:46]: quizzes feel like a tax unless the payoff is visible immediately.
- Decision: "Some apps don't just collect answers during the quiz. They actually show you what
  those answers unlocked." **Endel** (spelled on screen; transcript says "Endless") — six
  questions then a reveal screen: "You haven't even used the product yet, but it already feels
  like it's going to work." **BytePal** — "they build your personal plan and then tell you
  exactly when you'll hit your goal." **Brilliant** — "shows you courses that are personalized
  to your responses… as soon as you finish your onboarding flow, your home page is already
  populated with only the content that you want to see." **Speak** — asks language + goals,
  then one screen states "In 2 months, you'll be able to communicate while traveling in
  France," with "a simple graph showing that speaking helps you reach your goals faster than
  reading" — and its earlier steps "already had you speaking instead of typing."
- Evidence: `t00m3m56` ("Onboarding in Endel," prototype, screen "19 of 33": dark quiz card
  "Are you able to read a book without constantly checking your phone?" Yes/No — one of the
  six questions inside a 33-screen prototype); `t00m4m28` ("Onboarding in Speak," video tab:
  chat-bubble question "What language do you want to learn?" with English/Spanish/French/
  Korean/Japanese/Italian rows; Mobbin's **Sensor Tower card**: "Speak: Language Learning —
  Speakasy Labs — Downloads by Sensor Tower, Worldwide, last month: **300K** — Revenue: **$3M**
  — Source: Sensor Tower, US Only, March 2026").
- Effect: the quiz's value is cashed on the very next screen — commitment backed by proof.
- Fails: revealed plans that are obviously template text (fake personalization reads as scam).
- Transfer: after every intake question, budget at least one screen that reflects the answers
  back with specifics (numbers, names, dates).
- Gap: Endel's reveal screen, BytePal's plan, Brilliant's course screen — spoken examples
  without captured frames.

### L20-8 Paywalls during onboarding: 22% do it; delight and tailoring beat hard gates
- Problem [4:47–5:30]: how, when, and how harshly to monetize mid-onboarding.
- Decision: quantify the norm, then show three differentiated executions: (a) an unnamed site
  pairs "a quiz with a one-time offer to drive urgency"; (b) **Timely** pairs personalization
  "with a full page of social proof before showing the paywall"; (c) **FocusFlight** "makes
  the paywall itself fun — the one-time offer… is shaped like a flight ticket, and your phone
  vibrates as it gets printed out. It's a paywall that actually feels delightful." Then the
  strongest data point: **Grammarly** — "based on your quiz answers, they recommend tailored
  pricing plans. This alone led to **almost a 20% increase in plan upgrades**."
- Evidence: `t00m4m51` — slide "What Patterns Appear in Onboarding? — % of apps that include
  each pattern • 986 apps": **Verification 43.9% · Personalization 23.4% · Paywall 22%
  (spotlighted) · Social seeding 9.4% · Tutorial 7.9% · Connecting accounts 6.9%** (this is
  the "22% of them throws a paywall during onboarding" claim, made precise); `t00m5m11`
  (FocusFlight screens: boarding-pass motif "LHR → CDG," "Choose Your Focus Scenario" chips,
  and a paperback-ticket screen "Congratulations! You've unlocked a limited lifetime discount
  **-58%**"); `t00m5m24` (A/B card: A = Grammarly "I want help with — Select all that apply"
  chip cloud (Feeling confident, Brainstorming ideas or creating an outline, Stuck with
  brevity, Comparing vocabulary, …, Improving writing quality, Generating captions, Generating
  a first draft, Sounding fluent in English, Multitask-free writing, Other) with "Skip
  personalization" link; B = quiz answers concretizing into a plan comparison "Win With
  Effective Communication" — Free/Starter vs Business with feature checklists).
- Effect: the paywall's conversion follows how much bespoke value preceded it; format and
  tone (ticket, vibration, urgency, social proof) can carry a price that a bare plan list cannot.
- Fails: paywall before any value demonstrated; fake urgency.
- Transfer: order = personalize → show tailored outcome → show tailored price; make the offer
  a physical metaphor when it fits the product's world.
- Gap: the one-time-offer site (never named), Timely's social-proof page, and the vibration —
  transcript-only.

### L20-9 Long flows don't feel long when they're entertainment: the Duolingo path
- Problem [5:31–6:05]: 25-screen averages exist because attention is earned, never assumed.
- Decision: "Out of 986 apps, Duolingo has one of the longest onboarding flows… You get
  started, choose the language…, it learns about you, you start your first lesson, get the
  satisfaction of completing it, and then you create an account. By that point, you've already
  gone through **60 screens before you even sign up**. And the crazy part is it doesn't even
  feel long." Two more named fix-packs: **Bump** — "even the loading states are wild… smooth
  animations on things like verification that rarely get special treatment"; **Bipul**
  (spelling per transcript; on-screen name not captured) — 61 screens, "really amazing
  animations," "you even get to name your virtual pet raccoon," value emphasized throughout
  ("your personal plan is ready and you'll lose weight by an exact date. And then bam, a
  paywall").
- Evidence: `t00m6m00` (Duolingo account-creation screen reached late in the flow: green
  progress bar ~40%, "What is your name?" First/Last name inputs, disabled NEXT, and social
  sign-up options Google/Facebook/Apple below — the *last* step, i.e., account creation is
  deferred to the end as narrated).
- Effect: entertainment density converts a chore into content; sign-up friction lands after
  investment, not before.
- Fails: motion on load-bearing steps that need patience limits (accessibility, slow networks).
- Transfer: audit where your flow asks for commitment vs gives delight; put the ask last.
- Gap: Bump's loading states and Bipul's raccoon screens — transcript-only.

### L20-10 Teach in context: reassurance, tooltips, real-time validation — not tours
- Problem [6:45–7:35]: front-loading education after signup wastes it; blank states strand users.
- Decision: distribute teaching into the moment of need. **Cake Equity** — "dealing with dry
  concepts like company equity and vesting schedules, and turns it into something approachable
  with copy that reassures users from time to time, and tooltips that explain the impact of
  each step so that users feel like someone's guiding them along the way." Even micro-moves:
  "a password field that checks off requirements in real time as you type, removes a reason to
  get stuck. Maybe it's a progress indicator, maybe it's microcopy. None of this is flashy,
  but it makes the experience feel effortless." To-do apps — "instead of giving users a blank
  empty state… no guided tours, no pop-ups, just a little nudge in the right place" (a
  populated example state). And the measured replacement: **Mural** — "when Mural replaced
  pop-ups and banners with a clear six-step checklist, it drove a **10% relative increase in
  one-week retention**. Checklists stick around even after the user dismisses the initial
  flow." (She then demos Mobbin's AI search: "if you go on Mobbin and do an AI search for
  onboarding checklist, you will find more ideas.")
- Evidence: `t00m7m39` (A/B card; B = Mural canvas with the persistent "Mural basics" panel —
  6 items, first checked: "✓ Build a space to collaborate / Create a mural," then "Make it
  your own," "Write down some thoughts," "Make it visual," "Move around," "Invite friends to
  the party!" — avatar badge "1 of 6 Complete").
- Effect: contextual guidance compounds into retention; checklists outlive tours because they
  persist as UI, not as interruptions.
- Fails: checklists that nag (celebrate completion and disappear); tooltips on every element
  (re-creates the pop-up problem).
- Transfer: replace "welcome tour" pop-ups with a dismissible-but-persistent progress list of
  5–7 concrete actions.
- Gap: Cake Equity screens, the real-time password field, and the to-do apps' populated empty
  state — transcript-only.

### L20-11 Ask at the right moment: pre-permission prompts and platform asymmetry
- Problem [7:54–8:25]: OS permission pop-ups get denied when cold; platform differences are
  invisible in cross-platform plans.
- Decision: "A lot of apps show a custom screen before the notification pop-up. Apparently, it
  improves accept rates significantly" — with **Brilliant** as the example ("I'll remind you to
  learn so it becomes a long-term habit") and **Center** going further: "It also teases you the
  notification that you'll receive if you allow it." Structural stat: "**Web onboarding is 21%
  shorter than iOS.** Mobile just has more permission and paywall screens baked in."
- Evidence: `t00m8m18` — slide "Onboarding Length by Platform — Average total screens
  including nested flows": headline "**Web onboarding is 21% shorter than iOS on average**";
  bars Web ≈14 / Android ≈17 / iOS ≈18.5 average screens; dataset rail repeats 1,460 flows /
  986 apps & websites / Snapshot April 2026.
- Effect: earn the OS prompt with a value-stating pre-screen; expect and budget mobile's extra
  gates when planning flows cross-platform.
- Transfer: never fire a permission dialog from contextless UI; show the notification's actual
  content first.
- Gap: Brilliant's and Center's pre-prompt screens — transcript-only.

### L20-12 Friction is conserved-then-redirected: the Houzz split form (+15%)
- Problem [8:25–8:52]: conventional wisdom says shorter forms convert better.
- Decision: the surprise result — "**House** [Houzz] split their sign-up form into multiple
  screens and they see a **15% increase in conversions**. Maybe the friction we add in one
  place removes friction in another." Cultural boundary on copying: "Users in Eastern markets
  tend to be more comfortable with information-heavy interfaces. So, what feels like clutter to
  one audience feels efficient to another, which is partly why we can't just copy what worked."
  And the honest meta: "I don't think there's one right or wrong way to design an onboarding
  flow that's best in class."
- Evidence: `t00m8m31` (A/B card: A = Houzz single-page "Welcome to Houzz! Tell us a little
  about yourself" — name/email/password + a long "What projects are you working on or planning
  to start? (Select all that apply)" photo-category checklist; B = the split path — "houzz ·
  **We found matching pros!** See results for 94053. Tell us your Name" [name] → "Enter your
  preferred email address:" [email], with Prev/Next — note the value teaser ("matching pros",
  localized zip 94053) precedes each ask).
- Effect: questions feel cheaper when preceded by proof of payoff; density tolerance is a
  cultural variable, so pattern imports need audience testing.
- Transfer: reveal-then-ask sequencing; segment onboarding density by market.
- [interp] The transcript's "House" is Houzz — confirmed visually by logo and copy in `t00m8m31`.

### L20-13 The synthesis: bring users to value quickly — or don't onboard at all
- Problem [8:53–9:57]: is onboarding always needed?
- Decision: "The ones that stuck with me didn't feel like onboarding. What I saw in common in
  these apps is that they **brought users to value quickly**. Sometimes it's adding delight to
  a very long onboarding flow. Sometimes it's letting users personalize their app experience…
  And sometimes it's getting out of the way." For certain products the answer is no onboarding:
  "Mobbin is a place to find design inspiration. The product speaks for itself. Same with AI
  chat apps. The first prompt is where users find value. For products like these, maybe the
  best experience is just to let users get in fast… Maybe it all boils down to the product."
- Evidence: `t00m2m55` — **Tide** as the minimalist personalization counter-example
  ("download the app, answer two questions, watch it customize your recommendations, and it'll
  prompt you to sign up. That's it, very simple," 2:52–3:03): dark audio-wave-themed screen
  "What is your current primary goal?" with four visual cards (Improve sleep — selected /
  Improve focus / Regulate emotions / Enhance Energy) and one Next button.
- Effect: a decision rule — onboarding budget scales with the distance between signup and
  felt value.
- Transfer: for prompt-first products, empty state + first prompt IS the onboarding.
- Meta stat (explicit 9:46): "onboarding flows are the **second most searched** [thing] on
  Mobbin."

## Creator tendencies observed (feeds creator-profiles.md)

- Stat slides always carry the dataset rail (corpus size, app count, snapshot date) and a
  section nav revealing the full published study (Top 20 Shortest, Paywall By Category,
  Tutorial By Category…).
- Examples are shown inside Mobbin's own viewer with A/B split cards for experiment evidence;
  third-party app-store data (Sensor Tower downloads/revenue) is overlaid to establish
  example credibility.
- Argument shape: quoted conventional wisdom (as text overlay) → data that contradicts it →
  named examples → measured wins → cultural/epistemic caveats ("we can't just copy what
  worked").
- Transcript vs screen naming drift: "Elma"→**Alma**, "Endless"→**Endel**, "House"→**Houzz**,
  "Runner"→**Runna** (video 13) — always verify names on frames.
- Cross-video continuity: this video ends by teasing "the next video… dive really deep into
  dashboards" — which is video 13; both end promoting the next study and subscriptions.

## Unverified / not analyzed (transcript-only: mentioned, no frame captured)

- "Average app has 25 onboarding screens" (0:13) — no slide captured with this figure.
- Runkeeper's animation-led welcome (1:23–1:30); One Year's founder's note with handwritten
  signature + hand-drawn flower (the captured 2:01 frame shows sibling screens in the same
  style); Tinder's birthday acknowledgment (2:08); Airbnb CEO video post-listing (2:11);
  Basecamp CEO note (2:24).
- Endel's six-answers-reveal screen, BytePal's dated plan, Brilliant's personalized courses
  home (3:48–4:23) — only a mid-quiz Endel screen captured.
- The unnamed quiz+one-time-offer site (4:58), Timely's social-proof page before its paywall
  (5:04), the paywall-by-category cut of the data (nav item only).
- FocusFlight's haptic "ticket printing" (5:15) — motion/sound, unverifiable in stills; the
  -58% ticket screen IS captured.
- Bump's wild loading states (6:06–6:24); "Bipul" 61-screen raccoon flow (6:26–6:44; name
  could not be verified on screen — transcript-only spelling).
- Cake Equity's reassuring copy/tooltips (6:45–7:07); real-time password-requirement checkoff
  (7:08); to-do apps' populated empty state (7:22–7:34); Brilliant's and Center's
  notification pre-prompt screens (8:04–8:16).
- The AI-search demo of Mobbin (7:48–7:54) and the closing subscription tease (9:54–10:06).

## Quotable diagnostics (explicit)

- "Maybe keeping our onboarding flows short was never the point." (0:40)
- "They're not listing features, they're selling the outcome." (1:12)
- "It feels like the product was made with intention." (2:31)
- "You haven't even used the product yet, but it already feels like it's going to work." (3:58)
- "It's a paywall that actually feels delightful." (5:19)
- "It doesn't even feel long." (6:06)
- "Maybe the friction we add in one place removes friction in another." (8:36)
- "What feels like clutter to one audience feels efficient to another." (8:49)
- "Maybe the best experience is just to let users get in fast and not have an onboarding
  experience that gets in their way." (9:35–9:39)
