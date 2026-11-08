# Research Notes — Video 22

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/Ysr7oNDajJI
- Title: "Insane Claude Design Skills You Need To Actually Build Beautiful Sites"
- Creator: AI LABS (self-described in transcript 0:43 as "a software company"; channel, not individual)
- Duration: 12:55 · Published: 2026-08-24 · Views: ~362k
- Classification: skill/tooling review roundup for AI design workflows (Claude Design / Claude Code / Codex), not a Figma or visual-redesign tutorial
- Access: transcript (En auto-captions) + 29 frames viewed at 720p from full video
- Subject: six skill collections that steer AI away from its generic design defaults — Emil Kowalski (9 skills), Connard Lee "Garden" (5), Elia "landing-page-design" (1), Meng To (system incl. build-awwwards-quality-sites), Jakub Krehel (better-* suite), Tastemaker, and an unnamed "designer-skills" collection (screen-critique / perception-laws)

## Core thesis (opening, 0:00–0:40)

Skills exist because "no matter how powerful a model is, each model follows its own pattern when it
designs and that pattern is easy to spot" (0:22–0:27) — skills "steer them away from that pattern".
Skills are "developed by people who have extensive experience in design… repackaged… the workflow
they tested… into a reusable form" (0:32–0:39). [interp] The whole video is an argument that taste
is injected via curated context files (SKILL.md), not via model capability.

## Structure (chapters verified in metadata)

0:00 Intro → 1:10 Emil Kowalski's skills → 3:49 Garden skill → 5:24 Landing page skill →
6:43 (sponsor: Make/Maya) → 7:27 Meng To's skills → 8:55 Jakub Krehel's skills → 10:14 Tastemaker →
11:23 designer-skills → 12:18 self-promo (AI Labs Pro) + outro

## Teaching format

Narrated tour over three visual layers: (a) house-style dark wireframe slides illustrating the
concept (skeleton browser windows, checklists), (b) real screenshots of skill source material —
GitHub repos, SKILL.md files in an editor, Claude Design chat panels, (c) real output-site
screenshots (Salt & Ember restaurant, The Alden cinema, Understory nursery, Michi Japan guide,
Pulp & Parsec sci-fi shop, Cortile restaurant). Each skill gets: who made it → what's inside →
how you invoke it → what changed in the output. No step-by-step Figma/teardown teaching; lessons
live in the named skills, their invocation prompts, and their scoring mechanics.

## Lesson log

### L22-1 Install-once portability: skills live in Claude settings and invoke by slash command
- Problem: reviewers might think skills are Claude-Design-only or re-setup per tool.
- Decision [transcript 0:51–1:07]: "you don't need to add skills to Claude design itself. The ones
  you add in your Claude setup are the same ones you can use in Claude design" — installed via
  Claude settings, "would work with Claude code, Codex, or any other agent… and give the same
  result."
- Invocation technique [2:12–2:16 confirmed on screen]: type `{slash}` + the skill's name in the
  prompt, then describe the site.
- Evidence: frame `t00m1m05` — dark UI with a chip-like popover labeled "skill" (the slash
  invocation affordance); `t00m2m22` — Claude Design chat: `/emil-design-eng` highlighted in-prompt
  + "I want to create a website for a restaurant's landing page." + chip `emil-design-eng`.
- Implementation: SKILL.md files under a skills folder; slash name = folder name.
- Effect: one skill library amortized across every agent in the workflow.
- Transfer: treat design skills as portable prompt-compiled assets, not IDE plugins.

### L22-2 Every serious skill asks clarifying questions BEFORE building
- Problem [transcript 2:23–2:30, 6:27–6:30]: naive prompting goes straight to generation.
- Decision: skills front-load an interview: "before it builds anything, it asks you questions
  about the app"; for the landing skill: "it also asks you questions first and once you've
  answered them, it starts designing."
- Evidence: `t00m2m22` — agent replies "I'm ready to help you build interfaces that feel right, my
  knowledge comes from Emil Kowalski's design engineering philosophy… check out Emil's course:
  animations.dev." followed by "Ask user" panel; `t00m6m25` — "Waiting on your answers — the
  nursery type, primary action, and where you want the creative swing will shape the whole page."
- Effect: requirements ("primary action", "creative swing") get locked before pixels exist.
- Transfer: build an intake step (questions → answers → design) into any AI design prompt; the
  questions themselves encode what a senior designer would ask first.

### L22-3 Two-pass motion pipeline: build visuals first, animate second (Emil Kowalski set)
- Problem [2:31–2:44]: the first generated site "looks minimal with a monotone style, but the
  animations… didn't look as polished and were out of sync in some places."
- Decision: run Emil's **Animate** skill on the already-built site as a second pass — it "contains
  a complete workflow for adding animations to an already built website" (2:00–2:06) and
  "understands how the site works and determines what needs movement and what doesn't" (2:44–2:49).
- Result [2:50–2:57]: "The motion was in sync with the scroll… the whole thing looked more
  intentional."
- Evidence: `t00m1m40`/`t00m2m05` — house slide: site mockup beside a panel titled "Animate" with
  a 5-step vertical checklist
  timeline (steps 1–3 checked green, step 4 active/orange, step 5
  pending); `t00m2m48` — real `animate/SKILL.md`: "A construction skill. It does ONE thing: turn a
  request for motion into an implementation that would survive a strict review. It does not audit
  a codebase (that's `improve-animations`), critique a diff (that's `review-animations`), hunt for
  places that could animate (that's `find-animation-opportunities`)…" + "## Operating Posture —
  You are a senior design engineer building the animation yourself. The bar is Emil Kowalski's
  animation philosophy."
- Reasoning (explicit 2:59–3:20): on landing pages the payoff is subtle; "the main animation style
  that looks good on landing pages are those scroll-based animations… But the place where the
  skill really works well is in the small elements of the functional side of the apps."
- Expected effect: micro-interaction polish (form submit feedback, hover popups) compounds into
  "the site feel a lot more interactive" (3:36–3:40).
- When appropriate: functional app surfaces; fails on sites needing big scroll choreography
  (different skill). Transfer: separate the "make it move" pass from the "make it look right"
  pass; one construction skill, one review skill — never one skill doing both.

### L22-4 apple-design & animation-vocabulary: named vocabularies replace vague prompts
- Problem [1:35–1:41]: vague animation descriptions ("make it feel alive") under-specify for the
  model.
- Decision: two vocabulary/leverage skills — **animation-vocabulary** "turns your vague animation
  description into exact words that a model can understand" (1:36–1:41); **apple-design**
  "contains all the design principles Apple uses in its own products and makes them available for
  use in other websites" (1:27–1:34).
- Evidence: `t00m1m25` — real README lines: "animation-vocabulary - Get better animations from an
  AI by telling it exactly what you want by using the right words." · "apple-design - Apple's
  principles for interface design and fluid motion, distilled from their WWDC design talks and
  translated for the web." · "find-animation-opportunities - Search your UI for places that would
  genuinely benefit from motion, while also telling you what not to animate." · "prototype - Build
  several genuinely different versions of a UI piece and flip through them live behind a visual
  picker to pick a winner." · "pick-ui-library - Have your agent pick the right library for the
  task based on libraries I use and trust."
- Effect: prompt vocabulary becomes a shared contract between human intent and model output.
- Transfer: keep a private glossary of motion/type words (ease-out, stagger, offset…) and distill
  platform principles into reusable context files.

### L22-5 Good design never starts from thin air — ground AI in proven references (Garden skill)
- Problem [4:51–5:01]: "the site we got out of it was a lot more interesting than what Claude
  design puts out on its own" — default output is the generic baseline.
- Decision: Connard Lee's **Garden** collection (5 skills; repo card meta: license MIT, stars 10k,
  skills 5): its core **web-design-engineer** skill "contains instructions on how to design like a
  top-tier design engineer" (4:03–4:06), "solely focused on making the visual stunning, not
  functional" (4:09–4:11). Working principle (4:16–4:30): it "works through [requirements] with
  you until it's clear what you want. And then it looks for real designs to work from… good
  design never starts from thin air… It also grounds itself with the designs that have worked
  previously."
- Evidence: `t00m3m55` — GitHub repo grid: `web-video-presentation` (Web video / presentation),
  `web-design-engineer` (Design / frontend), `gpt-image-2` (Image generation / prompting),
  `beautiful-article` (Any source → beautiful article) with hand-drawn infographic covers;
  `t00m4m45` — repo tree `web-design-engineer/references/style-r…` containing
  `headspace-me…`, `INDEX.md`, `linear.md` (highlighted), `mailchimp-fre…`, `mid-century-m…`,
  `monocle-magaz…`; editor pane shows `## Workflow → 162 ### Step 5: Full Build → 168
  ### Step 6: Verification → 170 Always run the lightwei[ght]… **Pre-delivery Checklis[t]**…
  code/design self-check. → 172 Run an executable brows[er] acceptance harness… user explicitly
  asks fo[r]…` — i.e., style recipes for named sites + mandatory verification steps inside the
  skill.
- Reasoning (explicit 4:31–4:44): the skill "contains a set of references… how to judge a design,
  the ways designs usually go wrong, and style recipes for well-known sites like Apple and
  Linear. So it can look at how those sites actually work while it builds yours."
- Expected effect: output "more thorough and better from a design perspective than the version
  Claude design would have made by itself" (4:55–5:01).
- Transfer: never prompt a design cold; supply curated reference files (recipes) + a checklist the
  agent must pass before delivery.

### L22-6 Score-and-refine loop: run a design critique that returns a number per dimension
- Problem [5:03–5:14]: how do you know when a generated design is done?
- Decision (Garden skill behavior): "if you already have a design and then run the skill, it goes
  through that design and scores it in different areas. You can keep refining the design and
  running it again and again until it reaches a perfect score."
- Evidence: `t00m5m05` — Claude Design chat: `/web-design-engineer` chip; agent text "Running the
  skill's Step 7 critique on v2 rather than rebuilding. — Overall 7.6 / 10" with table:
  Philosophy alignment 8.5 · Visual hierarchy 8 · Craft quality 8 · Functionality 7.5 ·
  Originality 6 [frame cut before remaining rows]; right panel shows the critiqued site: "THE
  ALDEN est. 1938" cinema page with giant striped display type "SIT DOWN SHUT UP WATCH" and
  vertical "REEL 01 / 05" rail — the reference to score against v2.
- Implementation: named scoring dimensions prompt; iterate-build-score until threshold.
- Effect: converts taste into a measurable gate; "Originality 6" is the lowest score, flagging the
  generic-output risk directly.
- Transfer: any AI design session should end with a rated critique over fixed dimensions, not a
  freeform "looks good".

### L22-7 A landing page is not a homepage: single-action structure via /landing-page-design
- Problem (explicit 5:47–6:03): "a landing page isn't a homepage. A homepage is trying to serve a
  lot of different people at once, but a landing page has one job and that's getting people to
  actually take action… Models tend to generate homepages that work, but they aren't specialized
  in designing landing pages."
- Decision: Elia Design's single-file skill (presented as "AI design skill by Elia Design"; the
  actual slash command shown is **/landing-page-design**). Its first job is "to take your idea and
  turn it into a visual system, which is basically the set of rules everything on the page then
  follows… colors, type, and spacing" (5:31–5:41); then "it structures the page around that one
  action… so that it draws focus towards that action by structuring your site around it"
  (6:04–6:11); also "keeps the design to a consistent visual style" and covers what "most models
  overlook, including making sure the website can be easily found through search" (6:12–6:23).
- Evidence: `t00m5m40` — house slide: prompt pill "a coffee subscription landing page" above a
  three-segment "visual system" bar: **Colour** (4 swatches: red, salmon, white, dark), **Type**
  (serif Aa + sans Aa), **Spacing** (indenter + bars); below, the generated cream mockup (serif
  headline "Coffee, monthly", red Subscribe button, salmon hero block, 3 cards). `t00m6m25` —
  Claude Design: "/landing-page-design i want you to create a landing page for a plant nursery.
  it should be really creative" + agent question (see L22-2) + preview "Understory Landing" with
  variable controls `stockUrgency` (toggle) and `catalogSize` (6).
- Expected effect [6:32–6:43]: "came out feeling like a real brand and matched the exact vibe… the
  way each element was structured made it much more likely that whoever entered the site would
  actually make a purchase."
- Transfer: for conversion pages, generate/lock a visual system spec first, then layout sections
  so every section points at one CTA.

### L22-8 Storytelling beat list: Meng To's build-awwwards-quality-sites (acceptance-bar framing)
- Problem (explicit 8:19–8:25): "Claude doesn't build a design at that level on its own" —
  Awwwards-level detail is missing from default output.
- Decision: Meng To's system — "known for his immersive scroll-based storytelling designs" (7:31),
  packaged skills (repo tree `t00m7m45`: `build-daily-inspiration-sites/`, `daily-ui-inspiration-
  capture/`, a `game-development/` arm — `build-isometric-arpg/`, `author-game-levels/`,
  `design-action-combat/`, `build-threejs-enemy-systems/`… — plus `media/aura-asset-images/`).
  The key skill **Awards quality sites** (build-awwwards-quality-sites) "lists the principles and
  design details that Awards level sites contain" (8:13–8:17) and "alongside the principles, the
  set carries the actual techniques and the specific effects that make a site look expensive,
  which is the part a model won't produce by itself" (8:29–8:35).
- Named rule (verbatim from `build-awwwards-quality-sites/SKILL.md`, frame `t00m8m15`): "Build a
  cohesive, memorable site whose visual idea, media, typography, and motion tell the same story.
  Treat 'Awwwards quality' as an acceptance bar, never as an award or recognition claim." —
  followed by "## 1. Set the art direction". Sidebar also shows sibling skills (`threejs-scroll-…`,
  `…gsap-leni…`, `container-lines`, `background`, `design-eng`).
- Expected effect [8:40–8:53]: output "structured and designed in the same way as the winning
  sites… a subtle animated background… the thing that stood out was the scroll. It used that
  scroll-based storytelling approach, just like the websites you see featured on Awards."
- Transfer: encode award-level output as an explicit acceptance bar (cohesive story across
  visual idea/media/typography/motion) rather than a style adjective.

### L22-9 One skill per concern beats one mega-skill (Jakub Krehel suite)
- Problem (explicit 8:55–9:16): "unlike the others where one skill handles every part of the site
  at once, this splits it into multiple skills so each area gets its own skill… typography,
  color, accessibility, and more, each get a separate skill."
- Decision/named skills (from real README, frame `t00m9m00`): **better-interface** "A
  cross-discipline interface review that coordinates every skill below." · **interface-review** "A
  user-invoked review of your uncommitted changes, current branch or a pull request against every
  skill below. Run it by name; it never starts on its own." · **variant** "Builds several genuinely
  different versions of one piece of UI behind a picker, so you can flip between them in the real
  page and promote the one that wins." · **explain-interface** "Ask how something was built. Point
  it at a URL or a screenshot… it finds the layers behind the effect and explains what each one
  does." · **better-ui** "Design engineering details that make interfaces feel polished: border
  radius, shadows, animations and micro-interactions." · **better-typography** "Choosing and
  pairing typefaces, type scales, spacing, wrapping and truncation." · **better-colors** "Color
  systems: building and naming palettes…" (frame cut). Sibling names visible earlier in the
  skills sidebar (`t00m2m48`): better-accessibility, better-layout, better-writing; plus
  `better-hairlines`-style entries cut by frame edge [interp: hairline-related].
- Effect: composition — invoke exactly the review the current problem needs.
- Transfer: keep design rules modular per discipline (type/color/layout/accessibility) so review
  passes stay cheap and targeted.

### L22-10 Regression-aware review: connect the reviewer to version control
- Problem (explicit 9:26–9:38): "This review skill works better if you connect it to GitHub
  because it checks what the design looked like before and after the changes you made. If
  something worked before your last change and doesn't anymore, it flags that."
- Decision: run the **review** skill with repo access; it reviews animations, accessibility, and
  behavior across screen sizes, then "lists out everything it found so you can fix it."
- Evidence: `t00m9m30` — house slide: app skeleton with `design | review` tab buttons and a
  "GitHub •" connect row; right table with GitHub-marked **before** vs **now** columns:
  animations ✓/✓ · accessibility ✗/✗ · small screens ✓(dimmed)/✗ — small screens regressed after
  the change, exactly the transcript's flag mechanism. `t00m8m55` — repo front page
  `jakubkrehel/skills` (Public, MIT, latest commit "refactor: clean up /explain-interface").
- Reasoning (explicit 10:07–10:12): running fixes "won't make the site look dramatically
  different, but what it will do is make it correct against the design principles people actually
  work to."
- Transfer: design review should be a diff, not a snapshot: score or flag per discipline per
  commit.

### L22-11 Pixel-precision pass: better-layout reports exact deficits
- Problem (explicit 9:48–10:03): "this is where Claude Design actually struggles… This one deals
  with the spacing, the positioning, and how things line up… it caught that a date on the page
  needed more room than it was given and even told us how many extra pixels it needed."
- Decision: run **better-layout**; "you just tell it to fix all its flags" (10:05–10:06).
- Evidence: `t00m10m05` — Claude Design chat on the "Cortile" restaurant preview: critique text
  referencing "…it the one place a future RTL pass would silently fail. **Block** on the clipped
  date select. Want me to apply all of these?" → user "yeah" → "Shelling…" agent spinner; right
  panel: cream preview "Cortile", letterspaced eyebrow "MILANO · CONTINENTAL CUISINE · S…", giant
  black grotesk display "A quiet room off the Via B…".
- Expected effect: layout correctness (clipping, alignment, spacing debt) resolved without
  restyle.
- Transfer: separate "layout accuracy" from "style" review; demand pixel-numbered findings ("needs
  12 more px") so fixes are mechanical.

### L22-12 Clone from pixels, not prose: Tastemaker's script-extracted token file
- Problem (explicit 10:28–10:45): "When you give the model a reference image, it usually turns it
  into a text-based summary… This skill actually uses scripts to extract the exact design details
  and saves them in a structured format… This preserves the design details that would otherwise
  get lost in the text-based summary."
- Decision: **Tastemaker** — repo About (frame `t00m10m20`): "A Claude Code skill that grounds
  AI-generated UI in real reference images and a persistent per-developer taste profile, instead
  of generic AI-slop defaults." (site tastemaker-skill.online; tags claude-skills, codex-skill,
  kimi-skill, ui-skill). "It relies on scripts first to handle a lot of the things that can be
  done without the agent" (10:47–10:51), pushes variations in different directions (10:52–10:55),
  and "the decisions it makes carry across the whole project rather than stopping at one screen"
  (10:55–10:59).
- Evidence: `t00m10m35` — house slide: cream UI card (ink text, orange accent button, blue media
  block, swatch chips) beside a "design.json" panel with keys **page / ink / accent / radius /
  gap** — the structured token format. `t00m11m20` — output: "MICHI 道" cream editorial Japan
  guide (mono letterspaced nav SHRINES/SEASONS/CULTURE/REGIONS/PLAN, serif body "A country of
  bullet trains and hand-planed cedar…", right stat rail 47 PREFECTURES / 80,000 SHINTO SHRINES /
  73% MOUNTAIN & FOREST / 4 MAIN ISLANDS, hairline dividers, thin red scroll-progress bar at
  top) — the "impressive… none of that generic style" result (11:15–11:21).
- Effect: taste transfer with fidelity + project-wide consistency ("gives models taste to design
  with so that they don't default to the same generic patterns", 11:01–11:03).
- Transfer: when cloning a look, measure it (extract tokens to JSON) instead of describing it;
  persist the profile across screens.

### L22-13 Evidence-based critique skills: screen-critique's seven dimensions + perception laws
- Problem (explicit 11:23–11:44): last collection is "grounded in actual research in the named
  laws that designers really work from with a separate skill for one each", incl. "why people
  leave your website halfway through and how behavior shows up as someone moves through the site."
- Decision: install only what fits — for this team, **screen-critique** ("takes a screen and
  reviews it across a lot of different angles… working from proper guidelines for judging design
  quality", 11:45–11:55) and **perception-laws** ("instructions on how the human eye actually sees
  and comprehends the design", 11:56–12:03).
- Named rule (verbatim screen-critique SKILL.md, frame `t00m11m50`, repo `claude-design-skills`):
  "Diagnose a rendered screen or artboard across seven dimensions — hierarchy, composition,
  typography, colour, density, affordance, brand — and return a rated, prioritised fix list. Use
  after producing a design, or when reviewing an existing UI, or when a layout is wrong but you
  can't name why."
- Companion README map (frame `t00m11m40`) matches need → skill: `design-brief`,
  `/design-research:discover`, `north-star-vision`, `summarize-interview`, `affinity-diagram`,
  `jobs-to-be-done`, `/visual-critique:critique-screen`, `interfaces-that-feel`, `form-design`,
  `onboarding-design`, `error-handling-ux`, `hicks-law`, `millers-law`, `color-system`,
  `dark-mode-design`, `data-visualization`, `theming-system`, `accessibility-audit`,
  `accessibility-test-plan`, `critique-color`.
- Expected effect (12:04–12:16): review returns "what's wrong in things like what stands out
  first, the type and the spacing… and once the perception laws are applied to the site, the
  whole thing feels more refined." Result visible on the Pulp & Parsec newsprint sci-fi shop
  (`t00m12m05`): serif+script mixed display "EVERY possible FUTURE, ALPHABETISED", label chip
  "SCIENCE FICTION & THE ADJACENT UNLIKELY", variable controls `accentColor` (+ `paperTone:
  Newsprint`), agent summary naming "two-ink pulp-paperback palette, Instrument Serif display
  cramped against Archivo grotesk, letterpress-style hero reveal, marquee ticker…".
- Transfer: critique against a fixed seven-dimension rubric; keep a perception/psychology law
  file (Hick, Miller, visual-path) in the agent's context.

### L22-14 Minimum viable prompt pattern used across all six collections (synthesis)
- Technique (repeat on-screen pattern): `/skill-name` + one-sentence site description, optionally
  plus style requirements; the skill then interrogates you, designs, and optionally scores itself
  (`/emil-design-eng` → questions → build → `/animate`; `/web-design-engineer` → questions →
  build → Step 7 critique; `/landing-page-design` → questions → visual system → page).
- Evidence frames: `t00m2m22`, `t00m6m25`, `t00m5m05`.
- `[interp]` The recurring loop is: clarify → ground in references → generate → score → fix flags.
  No skill in the video skips the question step; none shows a final "perfect score" state.
- Transfer: adopt as a default session script for AI-designed pages; budget two prompts (build
  skill + polish/critique skill), not one.

## Sponsor block (do not mine)

6:43–7:27 Make/Maya sponsor (verified visually `t00m6m55`: "AI builder" window, prompt "Message my
team on Slack whenever a new lead comes in." → "Automation created"). Also 0:00 channel intro and
12:18–12:53 self-promo for "AI Labs Pro" private skills + Super Thanks outro — treated as promo,
not teaching; no lessons extracted from these ranges.

## Creator tendencies observed (feeds creator-profiles.md)

- House style: near-black slides, skeleton browser mockups with one orange accent, checklists with
  green/orange step dots; real screenshots for repos, editors, and site outputs.
- Teaches by collecting and classifying named tools with author credit (Emil Kowalski, Connard
  Lee, Meng To, Jakub Krehel) — a "which tool + when" reviewer posture rather than first-principles
  teaching.
- Values: non-generic output ("pattern is easy to spot"), polish micro-interactions, measurable
  critique scores, references as grounding.
- Their own recommendations ("the two we use the most") = Emil's design-engineering + Animate;
  Krehel review + better-layout; tastemaker; screen-critique + perception-laws.
- [interp] Titles skew hype ("Insane…") but demonstrated mechanics are concrete (SKILL.md text,
  scoring tables, GitHub diffs).

## Unverified / not analyzed

- The actual before/after of the Emil-skill landing build: transcript 2:31–2:57 describes "first
  version… minimal with a monotone style" and the improved post-Animate state; frames 2:05/2:48
  show only the workflow slide and SKILL.md — no before/after site pair was identified in the
  video for this specific build (timestamps checked: no site screens at 2:00–3:10 other than
  `t00m3m07` abstract hero wireframe). Listed as transcript-only.
- Restaurant micro-animation details "animation on when we submit the form and… graphics popping
  up on hover" (3:29–3:35): `t00m3m30` shows the Salt & Ember site hero only (static at 720p);
  the form-submit and hover animations themselves were not capturable in stills.
- Video-to-super-prompt mechanics (7:52–8:01) and the tastemaker "variations" (10:52–10:55) shown
  only in speech; no dedicated frames identified at 8:00–8:10 / 10:45–11:00 beyond the slides
  already logged.
- Whether the actual prompt answers sent back to the skills (the "we answered those" step) are
  ever shown — not verified; the video cuts from question to result.
- 12:25–12:53 promo portion: glimpses of AI Labs' private skill files (frame `t00m12m25`:
  "marketing-ui" SKILL.md — "Fonts carry the page…", "design.md comes after the landing is
  generated, not before…", "Use GSAP (timelines, ScrollTrigger: scrub, pin, sequence)", "One
  signature moment per page…"; sidebar `slop-detector`) are visible but sit inside the self-promo
  segment; noted here factually, not mined as lessons, per protocol.

## Quotable diagnostics (explicit)

- "No matter how powerful a model is, each model follows its own pattern when it designs, and that
  pattern is easy to spot." (0:22–0:27)
- "Good design never starts from thin air." (4:22–4:25, said of the Garden skill's principle)
- "A landing page isn't a homepage. A homepage is trying to serve a lot of different people at
  once, but a landing page has one job and that's getting people to actually take action."
  (5:47–5:55)
- "The way each element was structured made it much more likely that whoever entered the site
  would actually make a purchase." (6:36–6:43)
- "These designs… the way that they go wrong…" (4:36–4:38, references topic)
- "It won't make the site look dramatically different, but what it will do is make it correct
  against the design principles people actually work to." (10:07–10:13)
- "This skill actually gives models taste to design with so that they don't default to the same
  generic patterns." (11:01–11:04)
