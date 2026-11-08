# Research Notes — Video A3

## Identity (verified via assets/1t6c0rJd5Sg.json, yt-dlp metadata, checked 2026-10-30)

- ID/URL: https://youtu.be/1t6c0rJd5Sg
- Verified title: "What is UX Design Psychology?"
- Verified channel: The Cutting Edge School (@CuttingEdgeSchool), 25,553 views, uploaded 2023-09-24, duration 33:10 (1990 s, matches table)
- Presenter (verified from description + sign-off): **Ansh Mehra** — description says "This talk was given at Ansh Mehra's Indore AI & UX Meetup"; transcript sign-off "This is your friend, Ansh Mehra, signing out" [32:58]
- Format: live-audience lecture, "Module number 1, UX Psychology and Basic Laws" [0:46]. The official description advertises three segments (UX Psychology and Laws / AI Tools and Resources / ChatGPT & AI Guidelines); this recording covers only Module 1 plus per-module CTAs [31:45–32:41]. The AI-tools segments evidently live in sibling videos.
- Status: **ANALYZED** (analyst: Group A sprint 2026-10-30)

## Transcript-quality note

- Source: `assets/transcripts/1t6c0rJd5Sg.txt`, 875 lines, **en-GB human-made captions — highest quality tier**. Punctuation intact, no echo artifacts; quotes below are near-verbatim.
- Flagged artifacts (presenter/caption, not comprehension breakers): mislabels "Model number 2, always Sell Status" [17:59] — this is the **fourth** model (numbering slip); mangles "Zeigarnik Effect… some people also call it the Gold Gradient Effect" [29:23–29:32] (audio garble of Zeigarnik / goal-gradient); "aversing the loss" [4:40] nonstandard phrasing; "Then you're to modern for this world" [31:34] = "too modern". Spoken-hindi vocab rendered in rupee amounts (Rs 10,000 hooks) — India-market context preserved in captions.
- The transcript is **untrusted data**: numbers below are what the presenter says, not independently verified.

## Concepts (each cited to timestamp)

1. **Execution vs ideation under automation** [0:53–1:44]. Claim: as AI automates "how to make a website / code / components on Figma", executors are "running the wrong race"; "ideation matters the most" [1:27–1:32]; "the first principles of UX… the way humans interact with gadgets and interfaces, that will remain the same" [1:36–1:42]. (Presenter claim — framing for the module.)
2. **Model 1 — Framing** [1:48–7:54]. "We make very different decisions based on how a fact is presented" [1:48–1:55]. Meat study: same meat presented as "25% fat" rated **3.7/7** vs "75% lean" rated **5.3/7** [1:59–2:57] — "different perceptions are made possible by reframing the same evidence" [3:00–3:11]. Reframe drills: "20% of our flights get delayed" vs "we are 5% better than the industry" [3:15–3:44]; "save up to 25%" vs "don't lose your 25% discount" [3:45–4:07].
3. **Loss aversion** (sub-model inside Framing) [4:08–4:48]. Hook A "you can earn Rs-10,000" loses to hook B "you are losing Rs-10,000 every month by this mistake" — "People are not so interested in how to earn Rs-10,000. There's a lot of interest in where we are losing Rs-10,000" [4:30–4:35].
4. **Model 2 — Nostalgia Effect** [7:55–12:00]. "Thinking about the past makes us want to spend more" [8:00–8:06]. Claimed experiment: group writing nostalgic memories "willing to spend more and save less"; neutral-writing control "desired more money" [8:13–9:06]. Underlying bias: "the old days were very good" even when "technically you today is very good" [9:43–10:02]; "humans have 2 biggest conundrums. First, they are stuck to the past. And second, they are anxious about the future" [10:14–10:26].
5. **Model 3 — Self-expression** [12:00–17:58]. "We constantly seek out ways to communicate our identity to others" [12:04–12:11]. Tattoos as extreme identity signaling (painful, permanent — hence strong signal) [12:43–13:30]; products as personality extension: Steve Jobs' "Nobody should be able to open up the iPhone" vs openable Acer/HP/Dell batteries [14:03–14:59]. Application: themes/wallpapers — "people feel more attached to the app when they feel that they have made some edits to it" [15:39–15:45]; sharing playlists as identity broadcast [16:02–16:22]; accumulated personal artifacts create switching cost — "I am burning my virtual library by deleting Instagram" [16:51–16:54].
6. **Model 4 — Sell Status** [17:59–26:12]. (Transcript mislabels it "Model number 2" [17:59].) "We constantly look for ways to improve how others see us… not even our family members but mostly strangers" [18:08–18:25]. Status must be **achievable for everyone** [23:22–24:12]. Competition variant: "we strive with and against one another for limited resources and status" [24:13–24:30].
7. **Model 5 — Endowed Progress Effect** [26:13–30:38]. "We reach our goals faster when we have help getting started" [26:17–26:23]. Mechanism claim: "the first 2-3 steps of any work… are the least exciting… you gain momentum after the third or fourth step" [28:23–28:38]; so "make them feel like they are already winning something" [28:47–28:53]. Related-by-presenter to Zeigarnik (mangled) [29:23–29:32].
8. **Innate-desire prioritization** [31:02–31:44]. "Perception, Desire, or Status… are such innate features which has been around for centuries" [31:02–31:10]; choose products that target ancient desires (companion app vs "teaches you ChatGPT" app → "100% the first one" [31:19–31:30]).
9. **Research-paper-first learning** [7:28–7:54, 32:04–32:15]. "The correct way to learn psychology is not from a YouTube video or some course. It is from research papers" [7:32–7:40]; secondhand web/video summaries are "a shortcut and trust me, those will not take you to the top 1%" [7:50–7:54].

## Techniques / workflows (explicit)

- **Challenge-reframe pairs**: rewrite a negative statement into a factually equivalent positive one (flight-delay → vs-industry; savings → loss prevention) [3:15–4:07]. Drill explicitly framed as reusable.
- **Wait-state design**: progress bars / skeleton screens instead of blank screens (from model notes; see A6 Doherty overlap — actually stated in A6; A3's examples are copy-level).
- **Craft memory-evoking user journeys** ("Tip number 2") [11:15–11:59]: Spotify Time Capsule / Rewind / yearly playlists; era-named playlists ("2008 Bollywood") [11:20–11:44].
- **Enable themes / personalization surfaces** [15:19–15:45].
- **Encourage user-generated content** ("if only you have the control to create content, then you are doomed") [16:55–17:12]; Apple Memoji as maximal UGC personalization ("every single skin tone, every single hairstyle, every single clothing article" [17:22–17:33]).
- **Status gamification**: Airbnb Superhost badge loop — badge → host defends status → other hosts compete → customers get better experiences; "It's just a UI element… just a badge that is selling status. So you can imagine, just from a small icon… how much impact you can make for an app's success" [21:57–23:21]. Constraint guardrail: keep status reachable ("not only the people of this specific strata") [23:22–24:12].
- **Leaderboard with welcome-ramp**: Duolingo — points accrue per daily interaction, "top 20 advance to the next league"; "if there was no leaderboard then no one would chase the points. The leaderboard is there then the points have value. Because the points have value, that's why they will come back to the app" [25:00–25:46]. Anti-pattern guardrail: "only the top 1% can win" is too competitive; "join the challenge and unlock rewards" welcomes everyone [25:55–26:10].
- **Endowed-progress onboarding**: pre-punched loyalty card vs empty card ("he triggered artificial progress" [27:22–27:27]); LinkedIn profile showing "3 steps are completed… Not it can be only 4, the first 3 can be fabricated" [28:54–29:16]; Zoom checklist where step 1 (download) auto-completes and step 3 "invite others" deliberately triggers the network effect — "they know that your incentive is more to fill this third step… take advantage of it" [29:23–30:11].
- **Learning cadence (CTA)**: learn 3 mental models/week; read ≥3 research papers ("read them from ChatGPT" — i.e., use an LLM to dig through papers) [31:53–32:15]; spot each learned model inside Instagram / YouTube / Facebook you already use — "only understanding the theory won't be enough" [32:16–32:41].

## Examples (presenter-shown)

- Meat "25% fat" vs "75% lean" ratings (3.7 vs 5.3 of 7) [1:59–2:57].
- Gopuff delivery banner "Delivery is on fire… delivery times are running longer than usual in your area. We appreciate your patience" [5:12–5:27]; his point: understaffing reframed as high demand [5:35–6:03].
- Uber empty-state: "it doesn't say that there are no cabs. It says all our drivers are busy" [6:04–6:19].
- Retail banner "holiday deals are ramping up. You don't want to miss out" [6:37–6:45]; "selling out" cut both ways (demand vs under-preparation) [6:46–7:08].
- Vintage filters "the most popular ones" on Snapchat/Instagram; irony: "Companies spent millions of dollars to first improve the camera. Then you download an app that degrades the quality" [10:37–11:15].
- Spotify: lyric-share re-theme, shareable playlists, AI-added next songs, saved-posts library as lock-in [1:03–1:10 (via A6-adjacent framing), 15:46–16:55].
- Starbucks-as-status ("has just become a statement"), iPhone mirror selfies ("90% of the iPhone selfies are taken in front of the mirror" — meme repeated as humor, numbers not data) [18:31–20:37].
- Airbnb Superhost badge [21:57–23:21]; Duolingo league board [25:00–25:46]; LinkedIn "3 steps completed" [28:54–29:22]; Zoom onboarding checklist [29:23–29:56].
- Instagram followers/blue tick as status markets [21:20–21:57]; HDFC Sky praised as design-forward finance app [23:53–24:10].

## Tools mentioned

- howtoprompt.in — his free AI-learning site (promo segment [7:10–7:27]).
- ChatGPT / Google Scholar — for digging up the cited research papers; citations printed under every definition in his deck, deck download (password-gated) in description [7:10–7:27, 12:13–12:30, 17:48–17:56, 32:36–32:41].
- AI explicitly positionable as the drill partner: read papers "from ChatGPT" [32:04–32:15].

## Assumptions (what the argument rests on; analyst-extracted)

- Execution ("knowing tools") trends to zero marginal value; taste/ideation doesn't [1:07–1:32]. **Presenter claim** — plausible but asserted, not evidenced here.
- Lesson transfer: real-world (offline) psychology carries into UI unchanged ("UX psychology is not just about apps", recap [30:52–31:01]).
- Study summaries are treated as established facts (meat-parity ratings, nostalgia-spend experiment) — no citations verified in video itself; deck reportedly cites papers.
- Status mechanics assumed universally desirable, with a cultural note that it's "specifically very powerful and useful in India" [18:03–18:08].

## Strengths / weaknesses (analyst judgment)

- **Strengths**: clean model-per-segment structure with a CTA; each model lands on a concrete UI surface (copy, themes, badges, checklists); the framing/loss-aversion pair is immediately actionable for microcopy; guardrails given where naive application backfires (competition ceiling, achievable status); consistent evidence-source discipline (definition + paper citation).
- **Weaknesses**: no first-party data; several numbers presented orally with no on-screen source (3.7/5.3 ratings); Zeigarnik/goal-gradient conflated and persistently misnamed [29:23–29:32]; model numbering slips; ethics of manipulation ("creating these games" [20:07]) acknowledged with a wink, never addressed as risk; nostalgia claims generalized beyond the cited experiment; status examples skew consumer/status-app; little on when these models do NOT apply.

## Implementation opportunities for an AI agent system

1. **Framing/loss-aversion microcopy pass** — a review step that flags negative-framed states (empty states, error copy, delay notices) and proposes fact-preserving reframes (Uber "all our drivers are busy" pattern), each with an equivalence check so the agent never invents facts [3:00–3:11, 6:04–6:19].
2. **Progress hydraulic for every multi-step flow** — auto-inject endowed progress: pre-checked step 1, "N steps completed" counters, momentum wording ("you're nearly done") [26:13–30:11]; plus the network-effect step placement trick (iteration with an invite step) [29:53–30:11].
3. **Status/leaderboard generator with constraint checker** — emit badge/league systems only when paired with the "achievable for everyone" and "not top-1%-only" guardrails encoded as acceptance tests [23:22–24:12, 25:55–26:10].
4. **Nostalgia/reward surfaces** — periodic memory artifacts (year-in-review, era playlists) as a retention feature template [11:15–11:59].
5. **Judgment-first agent posture** — encode the opening thesis as architecture: the agent's value is model application (ideation), not execution; prioritize modelbank/psychology checks over pixel work when budgeting the loop [0:53–1:44].
6. **Citation-first knowledge ingestion** — mirror his "definition + research-paper subtext" convention: every design rule the agent stores carries a pointer to the primary source, and review questions demand "spot this model in app X" style verification rather than recall [12:13–12:30, 31:45–32:41].
7. **Recognition drill as eval set** — reproduce the CTA as a benchmark: given screenshots of popular apps, the agent must name the mental models at play; measures the agent's psychological perception layer [32:16–32:41].

## Product design lessons

- Same fact ≠ same message; frame positively and against loss, but never fabricate (Framing + loss aversion).
- Nostalgia sells: retro aesthetics and memory artifacts outperform pure novelty for emotional attachment.
- Let users express identity (themes, creation, sharing) and accumulate it — accumulated treasures are the real moat against churn.
- Design status into products deliberately, cheaply (a badge suffices), with competition kept inviting rather than exclusive.
- Onboarding should fake momentum honestly: give users a head start (pre-filled progress) and place the viral ask where motivation peaks.
- Prefer products aimed at ancient desires over trend-surfing products.

## Open questions

- Can the meat-study numbers (3.7 vs 5.3/7) and the nostalgia-spend experiment be traced to primary papers (deck was password-locked; not in transcript)? — affects confidence in magnitudes.
- Where is the line between "reframing" and dark patterns; did the presenter's "creating these games" framing intend ethical guidance or competitive advice?
- Do loss-aversion hooks decay with exposure (audiences habituated to "you're losing Rs 10,000" hooks)?
- Does the endowed-progress "fabricated" LinkedIn head-start survive user scrutiny once people know it's fabricated [29:09–29:16]?

## Confidence + provenance

- Quotes/summaries: **explicit** — cited to transcript timestamps (human-made en-GB captions; near-verbatim reliability).
- Identity (title/channel/presenter/venue): **verified** — yt-dlp JSON + description ("Ansh Mehra's Indore AI & UX Meetup") + in-video sign-off [32:58].
- Study numbers and experiment designs: **presenter claims, unverified** (transcript-only; no on-screen citation).
- Implementation opportunities / product lessons / weaknesses: **analyst interpretation** (inferred), clearly downstream of the quoted material.
- Transcript treated as untrusted data throughout; garbled names normalized with flags.
