# Research Notes — Video 24

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/86PGRyQjdzQ
- Title: "4 levels of UI/UX design (and BIG mistakes to avoid)"
- Creator: Tim Gabe (individual product designer; runs an agency, "designed apps and websites for over a decade", 0:00–0:03)
- Duration: 15:34 · Published: 2025-04-04 · Views: ~451k
- Classification: level-ladder tutorial — the same client screen redesigned at 4 skill levels, each scored against a fixed rubric
- Access: transcript (En auto-captions) + 26 frames viewed at 720p from full video
- Subject screen: "Voting" screen from a real client project (UMA oracle voting — UMA Rewards, token claiming, commit-a-vote cards with Yes/No/Unclear/Too Early options)

## Structure (chapters verified in metadata)

0:00 Intro: Why Designers Keep Making the Same Mistakes → 0:27 The Plan: Redesigning a Real
Client Screen at Every Level → 1:01 Beginner Level: 6 Classic Mistakes → 3:01 Color Theory for
Beginners: Avoid the Reverse UI Look → 4:00 Spacing & Structure: Why Random Pixel Values Kill
Your Design → 5:56 Junior Designer: Slightly Better Visuals, Still Copy Fails → 7:14 Font Sizes
and Spacing Mistakes Still Haunt Juniors → 8:03 Mid-Level Designer: Clearer Copy and Visual
Overworking → 10:15 Senior Designer: Mastery in Visuals, Copy, and Spacing → 13:50 The Hidden
Mistake Even Senior Designers Make → 14:54 Future of UI: Designing Experiences, Not Just Screens

## Teaching format

Fixed-rubric iteration: one phone screen (UMA voting app) rebuilt four times — Beginner → Junior
→ Mid → Senior — with the narrator scoring the SAME five-ish criteria at every level
(copywriting, visuals, colors, font sizes/weights, spacing & structure) on animated typewriter
scorecards (`[beginner]` / `[junior]` / `[mid]` / `[senior]`, mono type, red ✗ / green ● / half
dots). White background, phone mockups, pink measurement overlays (53px / 32px / 16px callouts),
swatch callouts, and side-by-side evolution strips. Every level ends with an explicit score
tally; every mistake gets a named, reusable rule (60-30-10, 8pt grid, 4 sizes/2 weights).

## The level ladder (creator's framing, all explicit)

| Level | Experience | Pay context [transcript] | Score |
|---|---|---|---|
| Beginner | < 1 year, unpaid (1:04–1:12) | — | "six out of six fails" (4:28) |
| Junior | 1–3 years (4:57–5:00) | in-house, or $100–500 freelance gigs (5:02–5:10) | "two out of five half passes" (7:46) |
| Mid | 3–6 years (8:16–8:22) | "8 to 10k USD per month, projects ranging 3 to 6K" (8:22–8:31; slide `t00m8m25`: "[mid] · 3-6 years of experience · $8-…") | "five out of five half passes" (10:39) |
| Senior | 7+ years (10:44–10:52) | "deals all the way from 20K to over 100K" because you are "a safe bet for clients that want both beautiful design, but also design that actually drives business metrics" (10:52–11:08) | "five out of five full score" (13:44) |

## Lesson log

### L24-1 The rubric itself: score every design on the same fixed criteria
- Problem: designers repeat "patterns of mistakes… at every level" without a checklist (0:08–0:14).
- Decision: fixed scorecard — copywriting, visuals, colors, font sizes & weights, spacing &
  structure (verbally graded in that order at every level; scorecard slides show the first items:
  "copywriting ✗ visuals ✗ colors ✗…" for beginner, green dots for senior).
- Evidence: `t00m3m08` ([beginner] card: copywriting ✗, visuals ✗, colors ✗, list continues below
  frame), `t00m13m00` ([senior]: copywriting ●, visuals ●, colors ●).
- Implementation: grade fail / half pass / full pass per criterion per level.
- Effect: progress becomes measurable — 6/6 fails → 2/5 half → 5/5 half → 5/5 full.
- [Note, honesty] The spoken counts are internally inconsistent: beginner says "six out of six
  fails" while only five criteria are narrated; junior says "two out of five half passes". The
  criterion list is clear from narration (copy, visuals, colors, fonts, spacing); the "six" is
  the creator's own tally and could not be reconciled with any sixth named criterion.

### L24-2 Beginner mistake 1 — copy that needs rewriting, not styling
- Problem (explicit 1:15–1:40): "do we really need four words to communicate a user's rewards?
  And does it make sense for the button to be about earning tokens when the action is actually
  about claiming voting rewards? Clarity is key in copywriting… it's a fail on the first
  principle."
- Evidence: `t00m1m25` — beginner screen: "My total tokens earned", red "Earn my tokens" button,
  "12.65 tokens not claimed yet", "Please commit this vote now", chips "Vote: Yes / Vote: No /
  Vote: Unclear / Vote: Too Early".
- Effect when fixed (across levels, verified in frames): "My total tokens earned" → "Total
  rewards earned" (9:00, `t00m9m00`) → "UMA Rewards" (12:10, `t00m12m10`); "Earn my tokens" →
  "Claim UMA" (9:00) → "Claim" (12:10); "Please commit this vote now" → "Uncommitted vote" (9:00)
  → "Uncommitted" (12:10); "Time to commit 14 hours 41 minutes 21 seconds remaining" → "Commit
  14h 41m 21s" (12:10).
- Transfer: rewrite copy before touching style; the button answers "what did claiming do", not
  "what do I earn".

### L24-3 Beginner mistake 2 — flashy visuals you can't pull off; simple-clear beats fancy-hard
- Problem (explicit 1:42–2:20): beginners "overuse flashy gradients, blur effects, and other cool
  visual techniques… we went for fancy and we couldn't pull it off, it's a fail."
- Named rule (2:00–2:15): "if you're unsure, opt for simplicity instead of flashiness. A simple
  but clear graph will help a user much more than a fancy graph that is hard to understand."
- Evidence: `t00m1m25` — pink-gradient chart card with glossy bars and a big black dot; junior
  version keeps one clear red-dot cue instead (`t00m6m20` — gray neumorphic bars, single red radio
  dot reading as "focus here").
- Transfer: default to the readable chart/text; earn the right to "cool" later.

### L24-4 The 60-30-10 approach (and its violation: the "reverse UI")
- Problem (explicit 2:22–3:07): "too much of a very strong red color, which makes the UI straight
  up stressful to look at. Everything here is screaming for attention and therefore nothing gets
  attention."
- Named rule (2:40–3:01): "60% of the UI is a neutral color like white or light gray. 30%… a
  complimentary color like black and 10%… the main brand color, in this case red. This UI feels
  more like a reverse at the moment."
- Evidence: `t00m2m35` — the beginner screen zoomed: red/pink covers tab pill, entire chart card
  background, bars, button, label highlight (the literal reverse); `t00m2m55`/`t00m3m08` era
  slide `t00m3m08` shows colors ✗; the correct-ratio slide caught mid-animation `t00m3m08` area
  (60% white/light-gray squares + 30% black square labeled, slide `t00m2m55`).
- Expected effect: brand color regains attention value; the red dot in the junior/mid designs
  works precisely because red got scarce (see `t00m6m20`, `t00m9m40`).
- Transfer: count your color proportions, not just your palette; reserve the loudest color for
  the 10% that must win attention.

### L24-5 The font diet: 6 sizes / 4 weights → at least −2 each → 4 sizes / 2 weights
- Problem (explicit 3:10–3:41): "Six different font sizes… and four different font weights. It's
  impossible to create a great looking UI with this much variety in the text department."
- Named rule (3:30–3:41): "reduce those numbers… by at least two. So four sizes and two weights.
  That will take you really far."
- Evidence: type slide `t00m3m42` — "Size 1 / Size 2 / Size 3 / Size 4" descending + weights
  "Semibold" / "Regular"; senior screen `t00m12m10` realizes it (heading, number, label, meta).
- Transfer: audit type by counting, not feeling; the count is the fix.

### L24-6 The 8-point grid: every number divisible by 8 or 4
- Problem (explicit 3:46–4:00): "things aren't really aligned… and the things that are aligned
  are spaced out randomly. 11 pixels here, 25 pixels here, just random numbers."
- Named rule (4:02–4:19): "anytime you use a number in your design, make it divisible by 8 or 4.
  Instead of 25 pixels, use 24. Instead of 11, use 12." (Also flags his own deeper video on the
  topic, 4:19–4:25.)
- Evidence: slide `t00m4m17` — decision tree: "11 → not divisible by 8 or 4 → [don't use]" (red)
  vs "→ divisible by 8 or 4 → [use]" (green); junior measurement callout `t00m7m35` — "53px"
  (random, the failing gap); mid-level callouts `t00m10m30` — "32px" (chart card → Total rewards
  earned) and "16px" (Commit votes → Uncommitted vote card), both on-grid.
- Expected effect (explicit 10:26–10:36): "Related elements are grouped nicely. We've started to
  use a spacing system like the 8-point grid. And as a result, the UI feels more professional."
- Transfer: run a "random number sweep" on every spacing value; 8/4 multiples only.

### L24-7 Junior copy fix technique: LLM-assisted rewrite with explicit constraints
- Problem (explicit 5:13–5:33): "copywriting is still a big issue… We still add unnecessary words
  and write labels that don't really make sense. For example, commit time sounds like we're
  committing time instead of votes."
- Decision (5:35–5:48): "take a screenshot of your UI, pop it into ChatGPT, and then feed it some
  more context on the project, emphasizing that you want copy that is clear but short."
- Evidence: junior screen `t00m5m15` — copy improved but still wordy ("This vote is not committed
  yet", "Commit time 14 hours 41 minutes 21 seconds"); the method is the lesson (junior copy
  still scored fail at 5:48–5:51).
- Transfer: screenshot + project context + "clear but short" as a copy prompt; still requires
  human judgment (junior still failed).

### L24-8 Junior visuals: communication-safe but skeuomorphic ("45 layers of shadows")
- Decision/explicit (5:56–6:24): "visuals primarily serve a communication purpose… The red dot in
  contrast to the gray bars communicates to the user, this is a thing we want you to focus on.
  Sadly though, we still think visuals absolutely need a trendy s[k]euomorphic effect with 45
  layers of shadows."
- Evidence: `t00m6m20` — zoomed junior chart: gray 3D-ish bars + one red-ring dot on the right
  rail; red UMA logo chip; the shiny raised chart card.
- Effect: half pass, not full — the cue works, the treatment dates the work.
- Transfer: a single hue-contrast dot is a legitimate emphasis device; but cast shadows/deco
  layers are the tell of an early-stage designer.

### L24-9 Junior colors: the swing-past — passive color is right, colorless is dull
- Reasoning (explicit 6:28–7:10): "mixing colors too freely easily turns into a disaster. We also
  understand that overusing a color could work against you if you want to assign meaning to
  colors. So we're generally more passive… which actually is a very good thing. And one of the
  most important learnings for creating clean, professional interfaces, but it's a balance. Here,
  we went from a UI that overused our red main color to a UI that now barely uses any of it,
  which makes it a bit dull."
- Evidence: `t00m7m00` — crossfade: beginner screen (all pink) dissolving to junior (near-all
  gray with only faint red chips: "Claim UMA" button grayed, tabs neutral).
- Transfer: after fixing over-use, deliberately reinvest the 10%; don't ship a colorless UI.

### L24-10 Mid visuals: the overworking relapse — trained eye makes "more" work
- Explicit (8:54–9:22): "They look good, maybe a bit overworked, which is something we usually
  see with mid-level designers. Just like beginners would add and add and add… designers at the
  mid level can sometimes gravitate back towards that same behavior. At this point of their
  career though, they have a much more trained design eye, which allows them to make it work."
  Scored half pass.
- Evidence: `t00m9m00` — mid screen: gradient chart card, red accents, bolder labels; still busier
  than senior.
- Transfer: over-decoration is a relapse risk at every level; the difference is control, not
  absence.

### L24-11 Mid colors: shades/tints of ONE color (with named source)
- Explicit (9:26–9:50): "UIs don't need all the colors of the rainbow to look good. We know how
  to balance the UI by using different shades or tints of one color instead of multiple different
  colors. If you want pro tips on shading and tinting, check out Eric D. Kennedy's article."
- Evidence: `t00m9m40` — mid screen with four callout swatches on the right linked to the design:
  white / pale pink / mid pink / strong red — a single-hue ramp carrying surfaces, chart, and
  accents.
- Transfer: build a 3–4 step tint ramp of the brand color and fill the hierarchy from it before
  reaching for a second hue.

### L24-12 Mid spacing: measured, grouped, and the numbers prove it
- Explicit (10:19–10:36): "Related elements are grouped nicely. We've started to use a spacing
  system like the 8-point grid… the UI feels more professional."
- Evidence: `t00m10m30` — pink measurement overlays: 32px (related elements: chart card → rewards
  block) and 16px (inner offset: commit row → vote card), i.e., grouping via spacing scale, not
  random values. Senior raises this to a full pass: "Elements are grouped logically. Spacing is
  deliberate between elements, inside elements, everywhere" (13:25–13:41).
- Transfer: outer gaps (between groups) > inner gaps (within a group), both from the 8/4 scale.

### L24-13 Senior copy: communicate with less; delete words the layout already says
- Problem/solution (explicit 11:11–11:58): "as a senior, we find ways to communicate better with
  less. We know that we don't need to write last 10 votes when we have a big label right above
  saying voting / claim… if we have a heading saying rewards. And by not repeating the same
  words, we reduce cognitive load and visual clutter without sacrificing clarity… when you scale
  this across a full app [it] is a massive difference."
- Evidence: `t00m12m10` — senior detail: tabs "Last 10 / Last 30 / All time" (redundant "votes"
  cut — "Voting" is the page title), button "Claim" (black, not red), "12.65 unclaimed" (unit
  dropped; number remains), "Commit 14h 41m 21s", card "Uncommitted". Compare ladder: "My last 10
  votes" → "Last 10 votes" (5:15) → "Last 10" (12:10).
- Transfer: every word must add information that the label/context above doesn't already give.

### L24-14 Senior visuals: emphasis only on what matters + reused visual patterns as connectors
- Explicit (12:00–12:31): "They are now clearly made with careful thought. We add emphasis only
  to what matters and we help the user make immediate connections between different parts of the
  UI by reusing visual patterns. For example, here the commit part of the UI gets connected to
  the current voting period in the graph because we're using the same pulsing circle. We're
  achieving more with less."
- Evidence: `t00m12m10`/`t00m13m35` — red graph bars + red end-dot in the chart, red dot next to
  "Commit" row, red UMA logo — the same signal vocabulary in three places (the still shows the
  shared red-dot motif; the "pulsing" is motion, transcript-only).
- Transfer: define one emphasis form (e.g., colored dot) and reuse it to bind related concepts
  across the screen; cut every other decoration.

### L24-15 Senior colors: flat colors + red rationed to three semantic spots
- Explicit (12:33–12:57): "we basically just simplified what the mid-level designer did. Instead
  of gradients, just simple flat colors. Instead of a button that screams error states, we're
  saving the red color for the graph, the rewards icon and the commit indicator. It's nicer on
  the eyes while calling attention to the right things even more effectively."
- Evidence: `t00m12m10` — Claim button flipped to black; graph red; UMA Rewards icon red; Commit
  dot red. `t00m13m35` — annotation pass underlining exactly those three red spots while the
  button stays black.
- Transfer: a hue used for meaning (signal) should be banned from decoration (CTAs) or it stops
  signaling; the error/destructive color must not be the CTA color.
- Cross-link: this is the same "color = meaning, never decoration" logic observed in video-01.

### L24-16 Senior type: 4 sizes / 2 weights + monospace numbers + size reuse for decimals
- Explicit (12:57–13:22): "We're finally down to only four font sizes and two font weights… we
  introduced a monospace version of the font for big numbers. And to avoid collision when this
  reward number grows, we reuse the heading size from the voting label for our decimal
  fractions."
- Evidence: `t00m12m10` — "1,412" huge black; ".51" smaller, lighter gray (reused heading-size
  relationship); "14h 41m 21s" in a tabular/mono cut;Compare with `t00m1m25` (beginner: number,
  button, labels all fighting).
- Transfer: numbers deserve their own family (tabular/mono) and a pre-planned overflow behavior
  for long values — design for growth, not the mock value.

### L24-17 Hidden mistake (all levels): designing static screens instead of experiences
- Problem (explicit 13:54–14:33): "This mistake doesn't have anything to do with static UI or UX
  skills… senior designers are capable of creating great looking, well functioning interfaces.
  But thanks to AI, in the coming years, we're going to see an exponential increase in the amount
  of apps… which means that designing memorable experiences that connect us with technology is
  going to be the easiest way to stand out… the mistake most designers make, again, seniors
  included, is that we get stuck just focusing on static images."
- Named rule (14:37–14:58): "to create a true experience, we need to treat UI design more like a
  movie. We need to piece static screens together in a way that makes the app a pleasure to
  use. That's how we create truly delightful apps and as a result also drastically increase our
  price tags as designers."
- Cited exemplars (14:58–15:07): Phantom Wallet, Airbnb, Duolingo — "apps that have gone that
  extra mile."
- Evidence: `t00m15m00` — Phantom Wallet onboarding completion screen (ghost logo, "You're all
  done! / You can now fully enjoy your wallet.", purple Get Started pill, confetti) as the named
  example of experience design.
- Boundary (explicit 15:10–15:27): HOW to do this is "out of scope for this video"; he points to a
  separate future video. So the video diagnoses the gap without teaching the technique.
- Transfer: after the pixels pass, storyboard the flow (state → state transition), because
  static-only portfolios will be commoditized by AI.

### L24-18 Copy ladder as a single artifact (synthesis across frames)
- [interp from viewed frames, corroborated by narration]: the ONLY string that survives all four
  levels unchanged is the question "Will Francis Ngannou get another shot in a major MMA
  organization?" — user-authored content is never "designed copy". Most edited strings: tab set,
  button label, status line, commit countdown. The ladder edits each of those 3–4 times, each
  time removing a redundancy rather than adding personality.
- Evidence: `t00m1m25` → `t00m5m15` → `t00m9m00` → `t00m12m10`.
- Transfer: design copy by repeatedly deleting; the question text stays, the chrome text shrinks.

## Sponsor/plug segments (do not mine)

- 4:41–4:53 — agency case-study plug ("SIPAP" per transcript; frame `t00m4m45` shows four crypto
  app covers — "A Smart Transactions application" ×2, "Vibe", "All of Ethereum" — agency
  portfolio), sketchy audio spelling; treated as promo.
- 8:04–8:14 — comment-bait engagement question ("How would you score your own design skills?" 8:04–8:14).
- 15:27–15:34 — outgoing pointer to his experience-design video. No third-party sponsor spot in
  this video.

## Creator tendencies observed (feeds creator-profiles.md)

- Teaches by rationed remakes of ONE screen with a fixed rubric + explicit scores; typewriter
  mono slide cards `[beginner]…[senior]`; measurement overlays (px callouts) as proof.
- Cites external sources by name when giving a rule: Eric D. Kennedy (shading/tinting), his own
  8pt-grid video, Phantom/Airbnb/Duolingo (experience design).
- Ties skill levels to concrete money (gig fees → monthly retainers → 5-figure deals) and to
  business outcomes ("design that actually drives business metrics").
- Editorial voice: banter ("It's not entirely cooked like the young crowd might say", 10:31–10:36,
  when awarding the mid-level spacing half pass).
- White/light UI with one red brand color is his house palette across examples.

## Unverified / not analyzed

- The "pulsing circle" connection device (12:18–12:27) is motion and cannot be verified from
  stills; frames `t00m12m10`/`t00m13m35` only confirm the static red-dot motif. Listed as
  transcript-verified-time, frame-unverified for the animation itself.
- Beginner "six out of six fails" vs five narrated criteria (4:28): unreconciled; the sixth item,
  if any, was never named on screen (`t00m3m08` card cut below "colors").
- The mid-level screen's top section (status bar/title area) is cropped in `t00m9m00`; only
  lower two-thirds verified. Senior equivalent verified full via `t00m0m30` (which shows the
  finished senior screen as a 0:27–0:46 "plan" teaser — same design as `t00m12m10`).
- The JFK/duolingo/airbnb named exemplars beyond Phantom: not shown on screen in the frames I
  extracted (only Phantom appears at `t00m15m00`); Airbnb/Duolingo mentions are transcript-only.
- The floating webcam bubble and stock interior b-roll (2:00, 11:10) carry no design teaching and
  were not analyzed.

## Quotable diagnostics (explicit)

- "Everything here is screaming for attention and therefore nothing gets attention." (2:31–2:36)
- "A simple but clear graph will help a user much more than a fancy graph that is hard to
  understand." (2:09–2:15)
- "It's impossible to create a great looking UI with this much variety in the text department."
  (3:23–3:28)
- "Anytime you use a number in your design, make it divisible by 8 or 4." (4:07–4:11)
- "Commit time sounds like we're committing time instead of votes." (5:24–5:27)
- "Trendy s[k]euomorphic effect with 45 layers of shadows." (6:17–6:21)
- "We find ways to communicate better with less." (11:25–11:27)
- "By not repeating the same words, we reduce cognitive load and visual clutter without
  sacrificing clarity." (11:42–11:48)
- "Instead of a button that screams error states, we're saving the red color for the graph, the
  rewards icon and the commit indicator." (12:41–12:48)
- "We need to treat UI design more like a movie." (14:41–14:43)
