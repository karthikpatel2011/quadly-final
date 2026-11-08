# Research Notes — Video 15

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/6SClbxo1cfo
- Title: "Give Me 11 Minutes I'll Show You How to Design $10k Sites"
- Creator: Self-Made Web Designer (same talking-head as video-14: camo cap, glasses,
  mustache, white tee, purple/orange home studio — verified in frames)
- Duration: 11:00 · Published: 2026-05-07 · Views: ~30.8k
- Classification: creator-process/education video with two self-promo segments for his own
  course ("The High-Profit Process") — first 2:51–3:27, second 10:17–10:56
- Access: transcript (En) + 19 frames viewed at 720p from full download
  (`media/segments/video-15.mp4`)
- Subject: his per-project system — mood board → stylescape → build straight in the builder
  → fast first pass → two-round limited revisions → component reuse — narrated over his real
  "$10,000 project" (a nonprofit site; Showit pages "The n50 Project", Initiatives, Get
  Involved — `t00m05m40`)

## Structure (chapters verified in metadata)

0:00 Intro → 0:29 Mood Board Basics → 1:40 Stylescapes → 2:51 The $10K System (course pitch)
→ 3:27 The Build → 4:50 How to Build Fast → 6:21 Revisions → 9:16 The Rest of the Pages →
10:17 The Missing Piece (course pitch)

## Teaching format

Talking head + three visual layers: (1) Figma screen-recordings of his real mood board and
stylescape, (2) signature slide cards (black band + yellow chips; numbered process lists;
"REVISION RULES"), (3) Showit builder footage of the actual client build. Story-driven: each
rule is introduced by a failure story (client rejections, 20-email threads, 3-month wait).

## Lesson log

### L15-1 Start every project with a mood board — and go for quantity, not polish
- Problem [transcript 0:29–0:37]: without one you risk "build[ing] something that the client
  doesn't actually even like."
- Decision: a mood board is "just a big file where you're throwing a bunch of ideas" —
  inspiration, fonts, font combos, colors, palettes (0:39–0:50). "The goal here is quantity…
  Let it be messy" so you can "stir up as many ideas as you can" and cut what doesn't fit
  (1:05–1:25).
- Evidence: `t00m01m31` — his Figma board of abstract gradient-shape explorations (circles,
  chevrons, triangles in grays/blacks) beside a photo, layers panel full of "image" slots;
  `t00m01m47` — a fully composed black/white/yellow editorial mood board ("Subculture April
  2022", "WHERE DIGITAL MEETS FASHION" spread) shown on the white textured card.
- Effect: divergence before convergence; the client-relevant directions get found cheaply.
  Specific win (1:27–1:39): "these really simple designs with basic shapes… reminded me of
  the shapes in their logo and what looks like network connections. These shapes actually
  ended up being all over the website" (visible later in `t00m02m15`).
- Fails: presenting the raw board to clients as a deliverable (that's what caused his old
  problem — see L15-2).
- Transfer: separate "idea collection" artifact from "client decision" artifact.

### L15-2 Mood boards get misread — close the gap with a stylescape before building
- Problem [transcript 1:44–2:13]: "I would create these beautiful looking mood boards. The
  client would love it… But when I went to go on to build that site based on that mood
  board, they'd come back to me and tell me that it just wasn't working… a client can't read
  your mind, and they might have a totally different interpretation."
- Decision: the **stylescape** — "take the elements that you're leaning toward from your
  mood board, and you put them together just to see if they're cohesive" (2:15–2:24). It
  gives client and designer "a way clearer picture of what you're thinking… before you open
  the web builder" (2:25–2:32).
- Proof of value (explicit 2:33–2:50): on this stylescape "I built this, showed it to the
  client, and they didn't like it. So this helped me know that I was going in the wrong
  direction, which saved me tons of time before I even started building."
- Evidence: `t00m02m15` — the actual $10K stylescape in Figma: headline "Sometimes Hope
  Looks like a laptop" (green accent word), "Tech should be a connecting point. Not a
  dividing line.", "3.7 million workers" circle annotation, "GET INVOLVED" chip, deep-green
  color block, and the dotted/connected-line motif carried as columns of dots and a dot-trail
  over the photo — exactly the "little dots connected with lines" he describes (2:36–2:43).
- Implementation: static composed page-like collage in Figma (not a wireframe; no structure
  commitment) — type, color, motif, imagery together.
- Effect: kills wrong directions for the cost of one artifact.
- Fails: clients who approve stylescapes emotionally but judge the build differently;
  [interp] he mitigates by treating a rejection as a data point, not a failure.
- Transfer: insert a cohesion-check artifact between research and build on any stack
  (Figma, CSS mock, etc.).

### L15-3 Skip wireframes and mockups; build directly in a drag-and-drop builder
- Problem [transcript 3:27–4:50]: the standard chain "mood board → wireframes → approval →
  high-fidelity mockups → approval → build" is wasted motion for him: "in my 10 years… I've
  never once had a wireframe that actually ended up being the layout of the website"
  (3:58–4:09); wireframes become "tiny little prisons" because "they set a client
  expectation that's gonna be tough to change" (4:14–4:20).
- Decision: "I skip all of that… and go straight to the builder" (3:50–3:54) — viable
  because his builder (named: **Showit**) "feels more like a design tool… Everything is drag
  and drop, so if something's not working, you just pick it up and move it without having to
  fight it" (4:33–4:44).
- Evidence: `t00m02m43` and `t00m04m05` — the conventional-process card he tears down
  (numbered chips 1 Moodboard, 2 Wireframes —Approval, 3 Mockups —Approval, 4 Builder);
  `t00m05m40` — real Showit UI ("The n50 Project Copy", page tree: Home, Initiatives, Get
  Involved, Contact, Solutions Contact, Blog Templates; blank page canvas; #F5F5F5 page
  background fill; PREVIEW/PUBLISH buttons) = the "builder as design tool" claim.
- Reasoning (explicit): skipping works only when layout changes in the builder are as cheap
  as in a mockup — otherwise keep the mockup stage ("if you want to make a change to
  something like the layout, it takes more work", 4:21–4:32).
- Effect: entire approval chain replaced by one stylescape checkpoint (L15-2).
- Fails: code-heavy or component-coded stacks where layout recall is expensive — he says so.
- Transfer: match process weight to cost-of-change in the actual medium.

### L15-4 First pass = speed over quality ("shitty first draft"), then refine in later passes
- Problem [transcript 4:50–5:09]: designers "spend days, maybe even weeks, on just the
  homepage… trying to make it perfect until they hate the website," because they try to
  perfect on the first try — "that's just not how creativity works."
- Decision: "really, your main goal on your first pass is just speed" (5:34–5:39). Get all
  sections in place top-to-bottom (hero first, then down), first idea per section even if it
  doesn't work well, then move on. Cites the book *Bird by Bird* (5:09–5:30): write a
  terrible first draft; "your first draft isn't something that you're gonna show to the
  client. You're just trying to go from nothing to something."
- Cross-pollination argument (explicit 5:56–6:11): "if you just keep going… you start to
  come up with ideas for your hero when you're working on the call to action. That's because
  creativity is not linear."
- Refinement loop: "After you've made your first pass, come back a few times to try to
  refine it, and then you show it to the client" (6:14–6:20).
- Evidence: `t00m05m00` — pixel laptop + "1 DAY / 2 DAYS / 3 DAYS / 4 DAYS / 5D…" strip card
  illustrating time lost to perfectionism.
- Effect: full page exists early; later passes edit with context instead of inventing.
- Fails: one-shot handoffs where no revision passes are contracted.
- Transfer: timebox pass 1; forbid polishing one section to completion before the page runs
  bottom-out.

### L15-5 Revision rule 1: exactly two rounds — one for the homepage, one for the rest
- Problem [transcript 6:21–7:12]: revision nightmares — "the email thread that just never
  ends", "the client who sends you a bullet-pointed list of 47 changes in a Word doc",
  "revision limbo, where you keep going back and forth… never ends"; when clients feel
  edits are unlimited, "they're actually never going to really engage and think about what
  they actually want" (7:38–7:47) — you end up moving "images from one spot to two pixels
  over and then back again endlessly" (7:48–7:57).
- Decision: "I give my clients limited rounds of revisions, just two, one for their homepage
  and one for the rest of the pages" (7:13–7:22); claiming it is "actually better for you
  and your client" (7:31) because the limit forces seriousness; "the project just gets done
  faster" (8:03).
- Evidence: `t00m07m15` — "REVISION RULES" card, rule 1 chip filled: **Limited Revisions**
  (rule 2 chip still blank mid-reveal); `t00m08m26` — completed card (rule 2 see L15-6).
- Effect: batches feedback; protects schedule; sets scope expectation at the start.
- Fails: very large org clients with formal sign-off chains; [interp] scope the contract
  accordingly.
- Transfer: any design service — count the rounds in the contract and say why out loud.

### L15-6 Revision rule 2: 48-hour feedback window or the round closes
- Problem [transcript 8:06–8:56]: "Clients are notorious for just not getting back to you",
  and the project can't move. "I once had to wait three months for a client to get back to
  me" (8:17–8:21). "People will take the time that you give them to do a task… If you don't
  give them any deadline, good luck ever hearing from your client again" (8:39–8:50).
- Decision: "I was only gonna give clients 48 hours to submit revisions during any round.
  If they don't request anything in that window, the round is done… and if they want to make
  changes to something after that, they're gonna have to pay extra" (8:21–8:39). Framing for
  the client (8:56–9:16): "Everyone in this scenario wants the project to be done yesterday…
  my job is not just to build the website, it's to keep things moving smoothly."
- Evidence: `t00m08m26` — "REVISION RULES" card complete: **1 Limited Revisions / 2 48 hour
  time limit**, rule 2 circled by hand.
- Effect: bounded project length; no idle waiting; change-fee pressure keeps rounds lean.
- Fails: clients who are structurally slow (committees, legal review) — window must be
  negotiated up front.
- Transfer: clock-based feedback windows work for any deliverable review loop.

### L15-7 Don't redesign every page — the homepage is a component factory ("Legos")
- Problem [transcript 9:16–9:40]: treating each page "like a completely new design… gonna
  kill your time, and it's honestly worse for the users," because "visitors are looking for
  patterns in your design so that they know how to navigate… if there's a different pattern
  for everything they look at, it's gonna be way tougher."
- Decision: while building the homepage, "you're not just designing a page. You're building
  components that you can use everywhere on the site, kind of like Legos. Every section,
  button, layout becomes a building block" (9:42–9:55). New sections only "every once in a
  while" when the existing pattern genuinely fails — then "go back to your mood board… and
  keep going" (9:56–10:07). Summary: "the homepage… is not just the most important page.
  It's actually a blueprint for the rest of the site" (10:11–10:17).
- Evidence: `t00m10m00` — "NEW SECTION" card with "Repeated Pattern" chip crossed out by
  hand (the exception moment he names); `t00m05m40` — Showit page tree where sub-pages
  (Initiatives, Get Involved, Contact) sit as siblings of the finished Home.
- Effect: consistency for users, speed for the builder; forces component thinking during the
  highest-stakes page.
- Fails: sites where secondary pages have genuinely different jobs (his own concession).
- Transfer: budget the largest share of design effort to the page that seeds the components;
  treat repetition as a feature until proven wrong.

## Creator tendencies observed (feeds creator-profiles.md)

- Business process rules sit beside design taste: limits (2 rounds, 48h, quantity mood
boards) recur as his signature mechanism for both clients and creativity.
- Builds everything in **Showit** (his builder of choice); Figma only for mood
boards/stylescapes — never mockups.
- Signature slide system spans all his videos: black band + yellow chips, numbered process
lists, hand-drawn circles/underlines/cross-outs over chips.
- Real-artifact teaching: uses the actual $10K client project (nonprofit "n50" — Green/laptop
stylescape, Initiatives/Get Involved pages) rather than demos.
- Self-deprecating origin story framing ("washed-up worship pastor with zero design
background", 0:00–0:04) to make the system feel attainable.
- Two dedicated course promos ("The High-Profit Process") bracket the teaching at 2:51–3:27
and 10:17–10:56; visual = SYSTEM pixel badge + calendar strip, later the HPP card with
SOPs/Templates/Scripts/Entire System chips (`t00m03m35`, `t00m10m39`).
- Catchphrase sign-off (also video-14/16): "If you don't quit, you win." (10:57)

## Unverified / not analyzed

- Course pitch segments (2:51–3:27, 10:17–10:56) treated as self-promo; not mined for design
  lessons beyond noting the artifacts (`t00m03m35`, `t00m10m39`).
- The $10K price point, contract wording, and onboarding flow he references are asserted but
  never shown (no invoice/proposal visuals) — transcript-only.
- Showit pricing/plan or licensing not discussed in this video.
- "Bird by Bird" (Anne Lamott) is cited by title/author-anecdote only; the profanity she
  actually uses for "shitty first draft" is deliberately censored in the video (5:17–5:26).
- Which client rejected the stylescape (2:40) is not identified; only that it saved the
  rebuild.

## Quotable diagnostics (explicit)

- "If you're not starting every project with a mood board, you gotta start now." (0:29)
- "A client can't read your mind." (2:03)
- "I've never once had a wireframe that actually ended up being the layout of the website."
  (4:05)
- "Wireframes can become these tiny little prisons." (4:14)
- "Your main goal on your first pass is just speed." (5:34)
- "Creativity is not linear. So don't try to force it, just keep moving." (6:08–6:11)
- "People will take the time that you give them to do a task." (8:39)
- "My job is not just to build the website, it's to keep things moving smoothly." (9:12)
- "You're not just designing a page. You're building components… kind of like Legos."
  (9:46–9:51)
- "If you don't quit, you win." (10:57)
