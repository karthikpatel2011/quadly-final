# Research Notes — Video 11

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/tQ9u4evCvZw
- Title: "7 Skills To Get Ahead of 99% UI/UX Designers | Saptarshi Prakash"
- Creator: Saptarshi Prakash (solo host; same channel as video 08)
- Duration: 17:07 · Published: 2026-03-16 · Views: ~32.5k
- Classification: standalone listicle essay ("skills to focus on in 2026"); not a course promo
- Access: transcript (En auto-captions) + full 720p download (media/segments/video-11.mp4)
- Frames: 26 candidate timestamps extracted and viewed (media/frames/video-11/); 13 contain
  actual on-screen design material (example sites, Figma canvases, diagrams, prompt demos,
  title cards); 13 are plain talking heads (verified but not cited as design evidence).
- Thesis [transcript 0:02–0:12]: "AI did not kill design. It just exposed who was only
  pushing pixels… making things look good is honestly the easy part… Can you think? Can you
  judge? Can you make something feel intentional instead of AI generated and forgettable?"

## Structure (chapters verified in metadata)

0:00 Intro → 1:17 Skill 1 (taste) → 3:17 Skill 2 (storytelling) → 4:34 Skill 3
(typography) → 6:02 Skill 4 (design fundamentals + AI-friendliness) → 8:43 Skill 5 ("the
new Figma" / MCP) → 11:23 Skill 6 (writing better prompts) → 14:07 Skill 7 (AI image &
video generation) → 16:33 Outro ("build something"). The chapter titles are only "Skill N"
; the named skills come from the narration.

## Teaching format

Single-host talking head with occasional designed cutaways (example websites, product
screens, kinetic type). Argument arc is explicit and self-referential: execution is
commoditized by AI → judgment/taste is the scarce asset → each skill is one investment that
compounds judgment. Two skills (5 and 7) get styled title cards; the other five open on the
host talking (verified frames: `t00m03m22`, `t00m04m40`, `t00m06m12`, `t00m11m25` are
talking heads at skill boundaries; `t00m08m45` and `t00m14m10` are styled title cards).

## Lesson log

### L11-1 Taste is the bottleneck of the AI era — and it is trainable exposure, not talent
- Problem [transcript 1:22–1:46]: AI output makes "everything… look the same"; "the problem
  is because people lack taste, and hence they're not able to utilize AI to achieve
  extraordinary results because they can't imagine something tasteful and extraordinary in
  the first place." Same for copy ("em dashes… identity of AI generated texts," 1:47–1:54).
- Decision: define taste operationally and train it deliberately (2:06–2:57): you open a
  site and "immediately feel something is off. Maybe the typography feels wrong… spacing…
  colors." Instinct is built by observing great designs constantly — "look at their spacing
  systems… pay attention to motion and hierarchy. Ask questions… Reverse engineer what you
  see." Over time "your brain starts building a library of good decisions," so "you start
  making better choices automatically."
- Reasoning (explicit 2:54–3:04): "It's not talent. It's exposure, observation, and
  deliberate practice. Good designers are not defined by the tools they use. They're
  defined by their judgment."
- Evidence: frame `t00m02m10` — his anti-example shown on screen: "BizWeb Solutions," a
  dated template site (serif display, gold CLICK HERE button, lorem ipsum) standing in for
  "you feel something is off."
- Implementation: a standing habit — collect and dissect 2–3 excellent apps/sites per day,
  naming the type/spacing/color/motion decision that makes them work.
- Expected effect: faster, calmer rejection of generic AI output; your first drafts stop at
  a higher floor.
- When it fails: taste without shipped artifacts becomes opinion (he closes the video on
  "keep building things").

### L11-2 Storytelling = one vibe, unfolded in the right order — content can shape the layout
- Problem [3:17–3:46]: without it, "a generic page assembled from templates."
- Decision [3:17–4:26]: make the design "feel like a journey." The product's vibe
  ("playful… premium… calm and trustworthy") "should be reflected everywhere, not just in
  the visuals, but also in the copy, the structure, the pacing, and the way information
  unfolds." Then the inversion that matters: "Sometimes the content itself shapes the
  design. A strong line of copy might deserve its own section. A powerful idea might need
  more breathing space. Sometimes a layout exists only to support a single message."
- Reasoning: stated payoff is double — perceived personalization (3:41–3:45) and clearer
  articulation of your own decisions (4:14–4:25: "You can talk about them clearly… teach
  what worked and what didn't").
- Evidence: frame `t00m04m02` — full-screen editorial example: deep indigo page, oversized
  cream serif headline "'The Blue Light Will Be The New Midnight Sun'", one ornamental sun
  illustration, "THE NOTE" chrome trimmed to a corner. One message, one screen — the
  "layout exists only to support a single message" case, shown exactly where he says it.
- Transfer: before adding a section, ask which single sentence it exists to carry; if none,
  cut it.

### L11-3 Typography is 60% of a good web design — and it is the cheapest skill that teaches all others
- Problem [4:34–4:57]: "most people still treat typography like a supporting skill, when in
  reality it is often the thing carrying the entire design… good websites, typography is
  60% of it… if your typography is weak, the design feels weak. It does not matter how
  nice the colors or [how] modern the layout looks."
- Decision [4:59–5:57]: treat it as a full discipline — "not just about choice of fonts…
  font sizes, the weight, pairing, kerning, tracking, variation of font sizes, and a ton of
  other stuff." Study typography because it "teaches you hierarchy, spacing, rhythm,
  balance, contrast, color, layouts, grids… if you get really good at typography, you
  automatically get better at a lot of other things." Current edge: "dynamic typography is
  one of the biggest differentiators. Typography is not just supporting the design, it is
  the design."
- Evidence: frame `t00m05m52` — his own kinetic-type gag card ("IF A SQUIRREL TELLS YOU TO
  SHIP IT / YOU MUST SHIP IT", holographic GitHub icon) playing exactly at "a new way to
  make text feel expressive" (5:47) — i.e., he demonstrates expressive type in the video's
  own editing while claiming it.
- Transfer: when a layout feels unpolished, spend the next hour on type scale/tracking
  before touching color or structure.

### L11-4 "Feel the laws": learn UX fundamentals by deliberately breaking them in Figma
- Problem [6:02–6:26]: laws are memorized as definitions, not felt: "You need to feel each
  and every law."
- Decision [6:27–7:01]: hands-on protocol — "when I'm learning some of these laws, I always
  learn them hands-on… actually using some dummy UI elements, and trying out what happens
  when I stick to this law, when I start slowly deviating from the law, and what happens
  when I completely break it… I actually keep moving elements around." Worked example named:
  the law of common fate (elements moving together are perceived as a group).
- Reasoning (explicit 7:01–7:08): "when you learn it that way, no definition can ever
  change your mind because it is ingrained in you. You don't need to memorize anything."
- Evidence: frame `t00m06m45` — Figma canvas of a personal portfolio "Case study" page with
  text layers visibly dragged out of alignment over "Large and Impactful Title Text" — the
  element-shuffling experiment in progress.
- Transfer: any principle on the team's wall (contrast, proximity, common fate) should have
  a 10-minute Figma drill: obey → nudge → break, and name what perceptually changes.

### L11-5 Re-run fundamentals with a second audience in mind: AI agents read interfaces too
- Problem [7:09–7:23]: "It is not just about whether an interface is human-friendly, it is
  also about whether it is AI-friendly. More and more products are now being used with
  automations, AI workflows, AI agents, browser agents, and systems that interact with
  interfaces very differently from humans."
- Decision [7:25–7:58]: relearn the laws asking the new question; but scope it — "this does
  not mean every website needs to become fully AI agent-friendly. That could be an overkill,
  at least in 2026." The trade he names: "Humans can understand personality, irregularity,
  and creative friction. AI systems usually prefer structure, predictability, and clarity."
  And the bonus: "making a design AI agent-friendly automatically makes your design more
  accessible to humans as well." He offers a free "agent-ready UI checklist" via the
  description (7:52–7:58).
- Evidence: transcript; frames `t00m07m25`, `t00m07m52`, `t00m07m55` show this passage
  delivered as talking head — **the checklist itself is never shown on screen** (listed
  below under Unverified).
- Transfer: semantic structure (real landmarks, labels, states, no meaning-by-color-only)
  now serves three readers at once: humans, screen readers, and agents.

### L11-6 Designing AI products is its own craft — and there are no references yet
- What he said [8:02–8:36]: "no one is actually talking about how do you design an AI
  product itself? How do you integrate AI into your existing apps? E-commerce, payments,
  finance, social media — it's way more complicated than just adding a stupid AI chatbot.
  There are no references in the world because it's all new, and the only way you can
  design effective AI products [is to] stick to some of the fundamentals."
- Transfer: pick portfolio/work projects where AI decisions matter (not template work);
  the fundamentals from L11-4 are the only stable playbook while the pattern library is
  unwritten.

### L11-7 The "new Figma": MCP + Code Connect turns designers into committers
- Problem [8:43–9:00]: not the obvious Figma uses ("brainstorm, design, prototype, present,
  publish") — "what I'm really talking about is Figma's MCP server."
- Decision [9:00–9:48]: the MCP server "connects Figma to AI coding environments like VS
  Code and Claude Code [captions render 'Cloud Code']… those tools can pull in actual
  design context… frames, components, variables, layout information, and… links between
  design components and real coded components through Code Connect." Consequence: "you can
  make modifications in real coded components of your design system directly without having
  to go to your developer… by simply chatting using AI, and then send a pull request to
  your developers. They will review it and merge it."
- Reasoning (honest limits, 9:49–10:02): "the output is still not perfect… you will still
  need a lot of iteration and a lot of corrections, and usually a lot more prompting than
  people on Twitter would like to admit."
- The stronger loop he actually recommends [10:04–10:48]: "You use AI to get a strong first
  version much faster… prompt to a tool like Claude Code using Figma context, generate a
  rough but usable implementation, and then bring back that live UI into Figma as editable
  layers. From there, you can refine it properly inside your design workflow… Figma
  officially supports this code-to-design flow." Conclusion: "You're no longer choosing
  between prompting and designing by hand, you're doing both… your design judgment takes it
  from acceptable to excellent," and energy shifts to "judgment, refinement, and making the
  product actually feel right" (10:49–11:06).
- Evidence: frames `t00m08m45` (styled title card "the new figma") and `t00m09m05` (his
  diagram: Code base → AI Agent inside "Code Editor", connected via "MCP Server" to the
  "Figma" platform box containing Figma Design, Figma Make, Dev Mode, FigJam); frame
  `t00m10m35` shows a four-variant app board ("TapToTable – Recipe Detail": Table View /
  Realistic images & freshness / Recipe Offset / Condensed Grid, collaborator cursors
  visible) exactly where he describes the refine-in-Figma step [interp: this looks like
  Figma's own demo/marketing asset rather than his personal file — treat as illustrative].
- Implementation: set up Figma MCP + Code Connect on a real design system; practice the
  bidirectional loop once on a small component before trusting it on a page.
- When it fails: teams without a coded design system, or designers who ship generated code
  unreviewed — he explicitly keeps developers in the PR loop.

### L11-8 Prompting is "giving directions": sharpness = narrowness of output distribution
- Problem [11:23–11:57]: vague prompts — "make [it] look modern… expecting the AI to
  suddenly develop taste, product sense, and a clean visual hierarchy." Diagnosis: "A vague
  prompt gives you broad output, which can have many possibilities. You give the same vague
  prompt 10 times, and you will see 10 very different results. A sharp prompt gives you a
  much narrower output, which is a much better starting point."
- Decision [11:57–12:09]: prompting = "knowing what you want, what matters, what to ignore,
  and how to describe quality"; "the real advantage is knowing what to ask for, how to
  break the problem down, and how to refine the output until it feels right."

### L11-9 Prompt anatomy, taught with a full worked example
- Decision [12:09–12:35]: four moves — (1) "be specific about the goal… what is this thing
  supposed to help the user do"; (2) "add context. Who will be using it? What kind of
  product…? What matters most in that moment?"; (3) "mention constraints… platform, tone,
  hierarchy, density, brand personality, or what to avoid"; (4) "do not prompt for the
  entire product once. Break the problem down. Go one layer at a time."
- Worked example [12:35–13:20, quoted at length]: instead of "design a food delivery app
  home screen," prompt for "the restaurant listing card… The user should be able to quickly
  decide where to order from in under a few seconds. Prioritize the information that
  affects decision making most. Restaurant name, cuisine, rating, delivery time, price
  relevance, offer if any, and a big food image thumbnail that increases appetite… Keep the
  layout easy to scan… optimized for comparison across multiple cards. Avoid unnecessary
  clutter or decorative elements that do not help the user choose faster."
- Reasoning (explicit 13:12–13:20): "now you are not asking the AI to invent the whole
  product. You're telling it exactly which part of the problem to solve."
- Evidence: frames `t00m12m45` and `t00m13m35` — screen-recorded ChatGPT window (header
  "ChatGPT 5.3 Instant", "What's on your mind today?") with each of his example prompts
  being typed live.
- Transfer: his card-brief doubles as a generic component spec — reuse it for any list card
  (candidates, files, products): one decision + ranked information + comparison constraint.

### L11-10 Negative constraints and output shape make copy prompts professional
- What he said [13:24–14:05]: portfolio example — "Write the hero section copy for a senior
  product designer's portfolio. The goal is to make recruiters… understand that this person
  thinks strategically, cares about craft, and has experience building real product impact.
  Keep the tone thoughtful, sharp, and credible. Avoid generic words like passionate,
  creative, or user-centric… Give me five headline options and three subheading options."
  Then: "this works better because you are narrowing the scope, defining the audience,
  defining the tone, and explaining what success looks like."
- Transfer: always include an avoid-list and an explicit deliverable count; "prompting is…
  a design skill. Actually… a life skill" (14:00–14:04).

### L11-11 AI image/video: you are directing a visual system, not generating an image
- Problem [14:07–14:32]: "Take a prompt, make a Jubilee style image, feel briefly powerful,
  and move on. That part is easy… The real challenge is… defining a style clear enough that
  AI can help you generate that same style again and again with consistency. Same visual
  language, same color logic, same angle, same lighting, same level of detail, same mood —
  across not one image, but maybe 50, 100, or even 500 assets with minimal error."
- Reasoning (explicit 14:49–14:56, 15:58–16:02): "at that point you are no longer just
  generating images, you are directing a visual system"; "professional design work is not
  about getting lucky once, it's about getting repeatable quality… in design, consistency
  is not a bonus, it is the work."
- Decision [15:06–16:00]: know "which tool is good for what" and organize by use case, not
  category — ChatGPT for concept exploration, abstract visual thinking, posters,
  screen-based compositions, early directions; Adobe Firefly as a broadening integrated
  platform (images, video, audio, vector, moodboards); Google's Veo for stronger control
  (text/image prompts, reference images, first-and-last-frame generation); platforms
  surface[ing] models like "Kling and Vanna [caption spelling; vendor name unverified]"
  for multi-shot generation, synchronized audio, lip sync, production consistency.
- Evidence: frames `t00m14m10` (styled title card "AI images and videos") and `t00m14m45`
  (the AI-generated "Jubilee style" family-dinner photo he references at 14:17–14:21, shown
  full-screen on white).
- Transfer: before any AI asset run, write the style contract (palette, angle, lighting,
  mood) and test it across 10+ generations before producing the real batch.

### L11-12 The closer: skills exist to build real products — and honesty about gaps
- What he said [16:18–16:59]: "The goal of all these skills is not learning tools, it is to
  build real products… take everything together and try to build something. A small
  product, maybe an AI tool, a workflow app, a to-do app, anything at all." And: "I'm not
  perfect at all of these. Some of these I'm actively figuring out right now, same as you…
  It's not about mastering everything at once, it's about being honest with yourself about
  where the gaps are… The designers who will do well… are not going to be the ones who know
  the most tools, they are going to be the ones who think clearly, have a point of view,
  and keep building things."
- Evidence: frame `t00m16m20` — the closing overlay "build something" in his kinetic
  yellow type over the talking head.

## Creator tendencies observed (feeds creator-profiles.md)

- Same host as video 08; video persona: contrarian-opener line ("AI did not kill design…"),
  numbered listicle, self-inclusion ("skills I'm focusing on in 2026"), honesty beats ("I'm
  not perfect at all of these").
- Teaches by sharpening distributions: vague vs sharp prompt, luck vs repeatable quality,
  memorize vs feel.
- Visual language: bold condensed uppercase kinetic type with offset shadows and occasional
  script accents (`t00m00m30`, `t00m05m52`, `t00m08m45`, `t00m14m10`, `t00m16m20`);
  neubrutalism-flavored title cards; warm home-studio talking head; only ~6 designed
  cutaways in 17 minutes — he trusts narration, illustrates only pivotal concepts.
- Names tools and specific capabilities (Figma MCP, Code Connect, Dev Mode, Veo, Kling,
  Firefly) but never shows a step-by-step tool tutorial — this is an advisory video, not a
  walkthrough.
- Lead magnet referenced verbally only (free agent-ready UI checklist, 7:52–7:58).

## Unverified / not analyzed

- The free "agent-ready UI checklist" (7:52–7:58) never appears on screen in the sampled
  frames (t00m07m52/t00m07m55 = talking heads); its content is transcript-only and lives in
  the description link (not accessed).
- "Kling and Vanna" (15:51–15:55): caption spelling of the second video platform/model name
  is uncertain — Kling is clearly named, the partner name could not be verified from
  captions alone.
- No frames were sampled between 16:35 and 17:07 (final CTA) beyond t00m16m35 (talking
  head); chapters verified only via metadata + transcript there.
- Skill title cards exist (verified) only for Skill 5 and Skill 7; for Skills 1–4 and 6 the
  on-screen skill transitions are plain talking heads, so chapter boundaries are taken from
  metadata + narration, not from visible cards.
- The "TapToTable" board (t00m10m35) shows two collaborator cursors and a call PiP —
  [interp] it appears to be Figma's own demo material; ownership not stated in the transcript.
- No sponsor segment detected in the transcript; the video's CTA (community, checklist) was
  not treated as design teaching.

## Quotable diagnostics (explicit)

- "AI did not kill design. It just exposed who was only pushing pixels." (0:02)
- "If your superpower is writing prompts… very soon you'll be classified as an average."
  (0:49–0:53)
- "It's not talent. It's exposure, observation, and deliberate practice." (2:54–2:56)
- "Typography is not just supporting the design, it is the design." (5:54–5:57)
- "Humans can understand personality, irregularity, and creative friction. AI systems
  usually prefer structure, predictability, and clarity." (7:36–7:42)
- "Way more complicated than just adding a stupid AI chatbot." (8:18–8:20)
- "You're no longer choosing between prompting and designing by hand, you're doing both."
  (10:38–10:40)
- "A vague prompt gives you broad output… A sharp prompt gives you a much narrower output."
  (11:45–11:57)
- "Consistency is not a bonus, it is the work." (16:15–16:18)
