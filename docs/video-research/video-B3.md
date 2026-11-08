# Video Research — B3: How To Keep Your Users

Status: **ANALYZED** (analyst review 2026-10-30; transcript-only analysis, no frames viewed)

## Identity (verified via assets/VNxBZ7ka5J0.json)

- ID / URL: `VNxBZ7ka5J0` — https://youtu.be/VNxBZ7ka5J0
- Title (verified in metadata): "How To Keep Your Users | Startup School"
- Channel (verified): **Y Combinator** (`@ycombinator`, channel ID `UCcefcZRL2oaA_uBNeo5UOWg`)
- Speaker: YC Group Partner **David Lieb** (named in the verified metadata description at
  [0:00] context; the auto-captions render his self-intro at [0:09–0:10] as "David Lee" —
  caption misspelling). His bio as told in-video [1:43–2:29]: Bump (YC S09), 100M+ users,
  pivots, acquired by Google; last app formed the basis of Google Photos.
- Duration: 29:23 (metadata 1763 s) · Published 2024-08-29 · ~61,987 views / 1,929 likes at
  retrieval (2026-10-30)
- Classification: measurement/strategy lecture (retention analytics), not a UI tutorial.
- Access: auto-English captions only (805 transcript lines; the task brief said 806 —
  off-by-one from a trailing-newline count).

## Transcript quality note

Readability is good; speaker-name garbling ("David Lee" → David Lieb) and a few TY words
("Seriesa" [1:23], "typ right corner" [16:45], "cohor retention" [15:47], "attracked"
[22:02], "exact" ~"exec" [22:58]). All spoken numbers captured cleanly (12, 6, 4, 5, 27;
75%, 80%, 20–40%; 100 million; 1–2 billion). No speaker labels needed (single speaker).
Chapters disclosed in the verified metadata description corroborate the transcript flow.

## Structure (chapters verified in metadata; confirmed against transcript)

0:00 Intro → 0:43 Cohort Retention → 2:31 Key Insight → 5:21 Best action to pick →
10:29 What is good? → 14:49 Ways to fool yourself → 21:27 Ways to improve the curve →
26:43 Conclusion

## Concepts (presenter claims; timestamps from transcript)

1. **Cohort retention** = tracking what fraction of *new users* keep using the product over
   time [0:41–0:53]. The quantitative answer to "did we make something people want?" [0:18–0:38].
2. **Cohorts, not blended user base**: track individual groups of new users over time rather
   than all customers mixed; gives a real read on how individual users behave [2:33–2:53].
3. **Three definitions required** before measurement [2:53–3:12]: (a) how cohorts are
   isolated, (b) the "action" that counts a user as active, (c) the time period for
   subsequent usage.
4. **Flatness is the only thing that matters** [11:53–12:56]: "the only thing that matters… is
   whether your cohort curves get flat. The shape of the curve is what matters, not the
   absolute number" [11:56–12:16]. A higher flat is nicer but flatness dominates [12:06–12:16].
   Flat curves let you *accumulate* users; non-flat curves put you on a treadmill of
   replacing churned users with new ones [12:18–12:48]. "If your curves don't flatten out…
   you haven't yet made something people want" [12:50–12:56].
5. **Fool-yourself failure modes** (all four self-confessed [14:05–14:15]): too-large time
   period [14:15–15:46]; too-easy action [15:47–18:14]; reading single points instead of the
   whole curve [18:42–19:44]; trusting analytics-tool definitions blindly [19:45–21:00].
6. **Payment is a lagging retention signal** (counterintuitive claim): "users first stop
   using your product and then they stop paying" [17:35–17:43]; Netflix example — last watch
   >1 month ago, subscription not canceled [17:45–17:59]. Rec: pair "is paying **and** is an
   active user" [18:01–18:11].
7. **Retention vs qualitative feedback division of labor**: talking to users tells you
   *what to change*; cohort curves tell you *whether you're on the right track* [28:32–28:50].
   Non-flat curves ⇒ one sure thing: get out and talk to customers [28:52–29:04].

## Techniques & workflows (as presented)

- **Define cohorts** [3:15–3:57]: group by first-use period — weekly or monthly cohorts are
  the default starting point ("all new users in January = one cohort, February = another"
  [3:33–3:40]). Advanced slices: country/region, acquisition channel, device, customer
  attributes [3:43–3:56].
- **Define the action** [3:58–5:34]: simplest = opened app / visited site, but pick a
  specific feature-level action correlated with *real value*. Examples: Instagram →
  "viewed 3 or more posts" (threshold filters open-and-leave sessions [4:43–4:54]); Uber →
  "completed a ride" [4:55–5:00]; Google Photos → "tapped in and viewed a photo full
  screen" [5:02–5:13].
- **Sit-next-to-the-user rubric** for choosing the action [18:18–18:40]: imagine watching a
  customer use the product; whatever goes through your head that answers "are they using it
  the way I intend?" is the action to track.
- **Define the time period** [5:35–6:45]: match intended usage frequency — daily for
  social/entertainment (Instagram, TikTok, YouTube) [5:55–6:09]; weekly for utilities
  (Google Photos, Uber) [6:10–6:19]; quarterly/semiannual/annual for infrequent categories
  (Airbnb — "people don't travel more than three or four times a year") [6:20–6:45].
- **Triangle chart build** [6:48–9:13]: rows = monthly cohorts; columns = subsequent months;
  count each user **once per period** regardless of 1× or 10× usage [7:35–7:43]; a cell can
  rise or fall month-over-month but never exceed the initial cohort size [7:45–7:59]. The
  **diagonal = one calendar month** (deck's yellow diagonal = December); summing it gives
  total active users that month [8:41–9:07].
- **Normalize** by initial cohort size → percentages; read across rows (per-cohort decay),
  down columns (are successive cohorts improving?) [9:13–9:54]; then plot as a **cohort line
  graph**, one line per cohort [9:56–10:28].
- **Build it yourself first** [20:26–20:47]: compute cohort curves from your own logs via a
  script or Google Sheets to build intuition; only trust the analytics suite after your own
  numbers match its. Watch for tools reporting **rolling retention** or "returned at all by
  date X" instead of "returned *during* the period" [19:59–20:24].
- **Review cadence** [21:00–21:17]: refresh weekly or every two weeks; "far more likely"
  scenario is that retention is bad from day one and needs improving.
- **Layer cake chart** (conclusion) [27:02–28:21]: align cohort rows into absolute calendar
  time; each layer = one cohort's surviving actives; a growing top line composed of *thick
  old-cohort layers* is "the most beautiful chart that you'll ever see in your startup" [28:14–28:17].

## Claimed numbers inventory (all presenter claims)

- Bump: one of the first mobile apps past **100 million users** [1:56–1:58]; failed as a
  business [2:01–2:03]; acquired by Google [2:08–2:11].
- Google Photos: **>1 billion** users today; Lieb worked on it ~a decade [2:15–2:22];
  weekly cohort curves flattened at **20–40%** depending on country/device [13:03–13:10];
  confidence **6 weeks after launch** that 20% of all humans would eventually use it
  [13:35–13:43]; "four years later… well north of a billion, probably closing in on two
  billion" [13:46–13:52].
- Triangle demo: **12** January new users → 6 back in Feb, 4 in Mar, 5 in Apr [7:16–7:49];
  February cohort = **27** [8:00–8:03].
- Product A/B thought experiment: A holds **>50%** early but trends to zero [11:03–11:50];
  B loses **more than half** in the first couple months, flatlines near **~20%** [11:09–11:36].
- Coached-founder anecdote: "we have 80% week-over-week retention" — but can't say which
  week / numerator / denominator [19:00–19:17]; "75% week three retention" example hiding a
  non-flat trend [19:19–19:41].
- Layer-cake demo ends at "almost 600 users" in December [27:55–27:59].
- Google+ anecdote: active-user count inflated by any click on the red G+ notification bell
  across Google products; "if you looked at the cohort retention, it was a lie" [16:30–17:17].

## Examples named

Instagram, Uber, Google Photos, Airbnb, TikTok, YouTube (period/action examples) [4:35–6:45];
Bump (self-fooling via period widening) [15:00–15:44]; Google+ (gamed action definition)
[16:30–17:17]; Netflix (payment ≠ usage) [17:45–17:59]; Google Photos Gen-Z marketing push
(acquisition/retention mismatch: "young people… don't have that many life memories yet")
[22:54–23:39].

## Tools mentioned

- Analytics suites generally, with cohort graphs "built into most analytics tools" [0:57–1:01]
  — and the warning that their cohort definitions often differ from what founders assume
  [19:45–20:24].
- DIY recommendation: compute from logs "via a script or in Google Sheets" [20:28–20:33].
- No named vendors anywhere in the talk.

## Assumptions

- Presenter assumptions (explicit/implicit): the product has an *intended* usage frequency
  that the analyst can state honestly; growth follows from accumulated retained users
  [12:18–12:48]; B2B teams under-invest in teaching users the workflow [25:01–25:16];
  network-effect products see cohort improvement as the network densifies [25:48–25:54].
- Analyst-inferred (not stated): the triangle-chart counts are for an illustrative deck, not
  real data; "flat" is asserted visually with no statistical criterion (slope window,
  significance) anywhere in the talk.

## Strengths (analyst assessment)

- A complete, internally consistent **measurement methodology** — the only video in the
  mission set that defines retention mathematically (cohort × action × period) rather than
  naming engagement gimmicks.
- The fool-yourself section [14:49–21:17] is a ready-made audit checklist with vivid,
  cited-failure stories (Bump, Google+).
- Strong transferable abstractions: value-correlated action [5:20–5:34], period matching
  intent [6:37–6:41], shape-over-height [12:04], "80% week-over-week — which week?"
  [19:00–19:11].

## Weaknesses (analyst assessment)

- No quantitative bar for "flat" or for "good" flat levels by category (the only real-world
  level given is Google Photos' 20–40% weekly [13:03–13:10]); nothing on small-n cohort
  noise, reactivations, or how returning churned users are counted.
- Improvement levers [21:27–26:07] stay at strategy altitude — no tactic-level UI/gamification
  advice (it is a metrics talk, not a feature talk).
- Slightly contradictory emphasis on which lever is "easiest": acquisition mismatch is
  "often the easiest way to improve the performance of your cohorts" [23:44–23:48], while
  onboarding investment is "the cheapest and easiest way" [25:19–25:23].
- Visuals (chart specifics) are unverifiable from the transcript alone.

## Implementation opportunities for an AI agent system

For an LLM "Product-Design Intelligence" agent; Quadly = placement-prep app with streaks,
squads, and daily tasks (Supabase backend holds the usage logs).

1. **Retention-definition agent** — APPLIES_TO Quadly (yes, core): propose and pin the
   triple (cohort = weekly signups; period = daily, since Quadly's design intent is daily
   use via daily tasks/streaks [5:55–6:09]; action = "completed a practice set / daily
   task," a value-correlated action per [5:20–5:34], instead of the shallow "opened app"
   [15:55–16:02]).
2. **Cohort-chart generator** — APPLIES_TO (directly implementable): cron job recomputing the
   triangle, normalized-% triangle, per-cohort line graph, and layer cake from Supabase logs
   on a weekly cadence [7:48–20:33, 21:10–21:12], exactly per Lieb's build-it-yourself advice.
3. **Flatness detector** — APPLIES_TO: fit the tail of each cohort curve; flag cohorts
   still trending to zero; announce "flat at N% after K days" as the headline product-health
   metric [11:53–12:16]. Open issue from this talk: no threshold given — agent must pick and
   defend one (see Open questions).
4. **Fool-yourself auditor** — APPLIES_TO as automated checks: reject period inflation
   (Bump pattern [15:00–15:44]); reject notification-driven open-and-leave sessions polluting
   reject notification-driven open-and-leave sessions polluting
   the action count [16:12–16:28, 16:30–17:17]; require period+action metadata on any
   retention number quoted (the "which week / numerator / denominator" gate [19:00–19:17]);
   diff the tool's cohort definition against the DIY computation [20:26–20:47].
5. **Cohort slicing advisor** — APPLIES_TO: auto-slice curves by signup source, device,
   target exam/experience level when curves don't flatten; surface the best/worst segments as
   improvement candidates [23:51–24:38].
6. **Onboarding/activation coach** — APPLIES_TO: measure first-session activation (time to
   first completed practice) and treat onboarding work as "the cheapest and easiest way to
   improve" [24:41–25:23].
7. **Acquisition-fit analyst** — APPLIES_TO (partially): Quadly's fits-who question ("people
   actively preparing for placement exams") is checkable against actual retained segments,
   mirroring the Google Photos Gen-Z mismatch [22:54–23:39].
8. **Network-effect evaluation** — PARTIAL for Quadly: squads are the candidate network;
   agent can test whether denser squads show rising/flatter cohort curves [25:26–26:07].
9. **Rising-curve tracker (holy grail)** — APPLIES_TO as a target state: retention that
   climbs as users get closer to exams (engagement should *increase* pre-exam); flag if it
   doesn't [26:09–26:43].

## Lessons (distilled, transferable)

- L-B3-1: Retention is not one number; it is cohort × action × period, and all three
  definitions are choices that can be gamed [2:53–3:12, 14:49–21:00].
- L-B3-2: Define "active" by value received, not contact made; build the definition by
  asking what you'd look for watching one real user [5:20–5:34, 18:18–18:40].
- L-B3-3: Match the measurement window to the honest intended usage frequency, and beware
  your own incentive to widen it [5:35–6:45, 14:49–15:46].
- L-B3-4: Flatness (shape) beats height; without it, growth is a treadmill [11:53–12:48].
- L-B3-5: Single-point retention claims are meaningless without their numerator, denominator
  and surrounding trend [18:42–19:44].
- L-B3-6: Revenue is a lagging signal of usage; measure "paying AND active" [17:22–18:11].
- L-B3-7: Improve retention in five ways: product, audience, segmentation insight,
  onboarding/activation, network density — then push flat lines upward [21:27–26:43].
- L-B3-8: Cohort curves say *whether* you're on track; user conversations say *what* to
  change — use both [28:32–29:04].

## Open questions

- What quantitative criterion defines "flat" (slope tolerance, window, confidence)? Not stated.
- How are reactivated churned users and multi-period gaps counted in the triangle? Not stated.
- Do analytics tools' "rolling retention" variants map onto the triangle model exactly? Only
  hinted [19:59–20:15].
- Deck-dependent claims (Product A/B shapes, slice-by-country visuals) unverified without frames.
- Does the ~20% flat level of Google Photos generalize to consumer utility apps generally,
  or is it category-specific? Only one data point given.

## Confidence & provenance

| Item | Confidence | Provenance |
|---|---|---|
| Title/channel/speaker/duration | high | verified (assets JSON description names "YC Group Partner David Lieb") |
| All quoted concepts/findings | high | explicit (direct transcript quotes, timestamped) |
| Speaker identity "David Lieb" | high | verified via metadata + in-video bio; caption says "David Lee" (spelling error) |
| Chart visual details (triangle/layer-cake rendering, A/B shapes) | medium | inferred (described in audio; frames not viewed) |
| "Flat" criterion absence | high | verified (absent from full transcript) |
| Quadly implementation notes 1–9 | medium | analyst interpretation (my mapping, not presenter's) |
| Upload/views/likes | high | verified (metadata JSON, retrieval 2026-10-30) |

## Retention mechanism list

- Cohort isolation by first-use period (weekly/monthly) — [3:15–3:40]
- Value-correlated "active" action with a minimum-engagement threshold (e.g., 3+ posts) — [3:58–5:34]
- Measurement window matched to intended usage frequency (daily/weekly/quarterly) — [5:35–6:45]
- Triangle chart: per-cohort counts, one count per user per period — [6:48–9:13]
- Normalized % triangle; cross-cohort column comparison — [9:13–9:54]
- Per-cohort retention line graph; flatness as the success criterion — [9:56–12:16]
- Trend-of-the-whole-curve reading (not single points) — [18:42–19:44]
- Self-built retention computation before trusting tool dashboards — [19:45–20:47]
- Weekly/biweekly retention review cadence — [21:00–21:17]
- Improvement lever: product changes (new use cases, latency, simpler flows) — [21:28–22:28]
- Improvement lever: acquiring better-fit users (acquisition/product match) — [22:30–23:49]
- Improvement lever: slicing cohorts by dimension to find strong/weak segments — [23:51–24:40]
- Improvement lever: onboarding/activation investment — [24:41–25:24]
- Improvement lever: network effects / denser networks — [25:26–26:07]
- Holy grail: cohort curves that flatten then rise — [26:09–26:43]
- Layer-cake chart as the accumulation-of-users end-state visual — [27:02–28:21]
- Coupling qualitative user interviews with retention measurement — [28:32–29:04]
