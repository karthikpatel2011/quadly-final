# Project Design Records

Each project/request gets an entry: brief → direction chosen → token/direction deviations →
loop history → lessons fed back. Newest last.

---

## PRACTICE-01 "Ledgerline" — premium landing (freelance invoicing)
- Date: 2026-10-24 · Artifacts: `sandbox/src/practices/p01-ledgerline/` (3 versions, 6 screenshots)
- Brief: high-trust SaaS landing, convert to 30-day trial.
- Direction: light editorial premium; warm paper ground; Fraunces (character display) +
  Public Sans (utility); ember accent; dark product mocks as hero/feature graphics.
- Personality dial: 2/5 playful (calm premium); motion: static-first (verified statically).
- Deviations from defaults & why: skew amplitude reduced vs S01 hero (calm dial); brand logo
  wall replaced by trust-line stat copy (avoid fake logos in a practice brief).
- Loop: 6 issues → 3 revisions (see evaluations/design-test-results.md §01); v3 = ship state.
- IP note: invoicing domain converges with a reference shown in source video 03 (Acctual);
  design is original (split-hero structure, own palette/type/copy).
- Lessons fed back: P-1 caption contrast, P-2 delta-placement, P-3 mobile topbar plan.

## PRACTICE-02 "Relay" — releases & incidents dashboard (dev teams)
- Date: 2026-10-24 · Artifacts: `sandbox/src/practices/p02-relay/` (3 versions, 5 screenshots)
- Brief: daily-driver dark dashboard; density serves decisions (S07), zero marketing.
- Direction: cool near-black surfaces, ONE green accent (Deploy), semantic colors reserved,
  Inter as legitimate utility choice (clarity product), mono for version/sha data.
- Loop: 4 issues → 2 revisions (v3 = ship state; mobile topbar verified programmatically).
- Lessons fed back: P-4 topbar-plan scope, P-5 KPI population context.

## Standing rule
Real frontend projects (e.g. the `frontend/` app in this repo) additionally obey
AGENTS.md: React 19 JSX only, tokens in `frontend/src/styles/tokens.css`, GSAP-only motion.
These practice artifacts are standalone design sandboxes and do not enter the app tree.

## PRACTICE-03 "Stridebook" — onboarding + activation flow
- Date: 2026-10-24 · Artifacts: sandbox/src/practices/p03-stridebook/ (React sandbox app)
- Brief: exercise the phase-2 measured lessons (Mobbin onboarding/dashboard studies) + the
  Gabe level ladder on a light activation surface.
- Direction: cool-mint light theme, teal single-hue data ramp, warm orange CTA (only accent),
  progress-ring as the one visual device, 4-sizes/2-weights type diet.
- Applied: multi-select setup + counted CTA (S20 measured +10%), 3-step progress bar,
  seeded demo empty state (S13 Mercury pattern), insight-beside-chart, exports on every card,
  mono numerals (S24 senior).
- Loop: flex-percentage chart collapse fixed & programmatically verified; P-6 lesson recorded
  ("a fix that isn't re-rendered is not a fix").

## PRACTICE-04 "Fieldgrid" — sidebar fleet dashboard (interactive)
- Date: 2026-10-25 · Artifacts: sandbox/src/practices/p04-fieldgrid/ (React, port 5174)
- Brief (user): "make a dashboard with sidebar" — first practice driving real state
  (filters, selection, popover, mobile drawer) with Playwright-asserted behaviors.
- Direction: light cool utility theme, blue data ramp, single amber CTA, Inter at 4 sizes/2
  weights, mono numerals for all measures/IDs.
- Loop: 4 issues (data-math mismatch, blank-render key bug, drawer trap, data typo) → all
  fixed with served-render verification. See evaluations/design-test-results.md §04.
- Lessons fed back: P-7 single-source data story; P-8 overlay dismissal test rule.

## PROJECT /app — Quadly student dashboard graduates to sidebar app shell
- Date: 2026-10-25 · Files: frontend/src/components/dashboard/Dashboard.jsx (rewritten shell),
  frontend/src/components/dashboard/dashboard.css (shell + sidebar + drawer styles)
- Request: "make a dashboard with sidebar" → "yes build" (into the real frontend/ app).
- Applied from the intelligence system: S01 sidebar anatomy (grouped rail: TODAY→Overview /
  Circle-to-Ask, YOUR CIRCLE→Ambassadors; no stat tiles; ONE account card with popover →
  logout; counts/status stay in the cards); S07+S20 counted progress in card head (n/3);
  P-8 drawer pattern (backdrop + Escape + close-on-nav); Ambassadors link = a real product
  surface instead of a decorative item ("sidebars are task-relevant destinations").
- Preserved behavior (verified e2e through the REAL UI): register /join → onboarding flow
  (welcome → name → college → role buttons + company → GitHub → done) → /app; mission toggle
  with optimistic flip + server truth (score tweened 48→54 via GSAP); Circle-to-Ask sends and
  receives the deterministic-mentor reply; auth redirects (401→/join, no-profile→/onboarding).
- New: view state (Overview/Coach), account popover, mobile drawer; GSAP entrance replays per
  view; zero JS errors in the session; `npm run build` clean.
- Verification: Playwright against dev servers (backend :4000 + frontend :5173), full user
  journey asserted + screenshots checked at 1440 and 390.
- Notes for future sessions: backend accounts are in-memory (restart = re-register, documented
  in auth.js); a ＋ future "Syllabus/Squads" nav items must link real surfaces (no dead controls).

## PROJECT /app v2 — Dashboard Home rebuild per user spec (Downloads/Quadly_Dashboard_Home_Prompt.md)
- Date: 2026-10-25 · Replaced the earlier sidebar build entirely (spec: build from scratch).
- Files: Dashboard.jsx (full rewrite), dashboard.css (full rewrite), dashboardConfig.js (NEW —
  single nav config), homeData.js (NEW — typed section loaders + pure utils), tokens.css
  (+ --qd-* theme mapping incl. light), backend dashboard.js (+history payload, +/ask daily cap
  30, persisted), App.jsx (app/* subpath routing).
- Spec compliance highlights: Amazon-style icon rail default → overlay full sidebar (0.25s slide,
  dimmed backdrop, close via backdrop/Esc/item/swipe-left) → Pin mode (pushes content, remembered
  per user); ≤960px drawer (85vw/max 320) + 5-item bottom bar; Practice expands (chevron +
  height animation, auto-open on practice routes) and pops from the rail; keyboard contract
  (focus wrap, Esc, arrows, [ toggle); reduced-motion honored; Coming-soon pages with Notify me
  (persisted per user); free-plan Upgrade card dismissible for 14 days; notifications bell hidden
  (source not built); theme toggle dark/light persisted.
- Data rules honored: real payload numbers only; Missions map to Today's tasks (no manual
  checkbox — Start shows an honest "activity module isn't connected" note); Activity heatmap
  renders only from verified history (12-week grid + summary); Squad/Mistakes/Drive = typed
  loaders returning 'unavailable' → honest empty states; Ask usage counter real (0/30).
- Tests: vitest 32/32 (streak incl. 4am-IST roll, greeting, heatmap, compact/short-name, drive
  gating, task mapping, sidebar contract, theme toggle, no-fabrication assertions);
  backend node:test 2/2 (cross-student isolation incl. private history, 401 for garbage tokens,
  ask cap 429 with friendly message + per-student counters). Test-caught bugs fixed:
  taskDayKey timezone double-shift; RTL selector ambiguities; a wrong test assumption
  (per-user hash-seeded plans are by design).
- Visual self-check: 8 screenshots reviewed (1280 dark closed/overlay/light, coming-soon,
  768 drawer/closed, 360 closed/drawer) — layout, contrast, labels, and honest states confirmed.

## PROJECT /app v2.1 — palette re-derived from the color-theory video (video 21)
- Date: 2026-10-25 · User request: "use that videos" while watching College Wallah's color
  theory lecture (video 21 — the Hindi one analyzed from transcript).
- Applied L21-2/L21-3 (the video's central lessons) to the live product:
  1. Frozen-hue ramp: brand #2078ff ≈ HSL(216,100%,56%) → 11-step ramp (L 8→93, ±10/±5
     arithmetic) committed as --qd-ramp-* tokens in styles/tokens.css with the method
     documented in-file. Opacity-tint fills removed — rgba(32,120,255,x) was doing duty as a
     "lighter color", the exact anti-pattern both S09 and this video prohibit.
  2. Selected states now consume ramp solids: dark = L700 fill + L150 text (≈7:1), light =
     L050 fill + L500 text (≈7:1); topic chips and msg--user (→ L500, white ≈7:1) follow.
  3. L21-1 semantic contract: Sign out (irreversible) now renders semantic red in the account
     menu; logout keeps its red hover.
  4. L21-4 one-glance audit: brand + primary action identifiable in one glance; hue count on
     Home = blue ramp + semantic red/green reserve + chip-gradient brand moments (all <10%).
- Verification: vitest 32/32, build clean, screenshots (dark/Light/danger popover) reviewed;
  theme toggle flips the ramp selection correctly through the --qd-* mapping.

## PROJECT /app fix — Practice submenu is click-controlled
- Date: 2026-10-25 · Files: Dashboard.jsx, tests/dashboard.sidebar.test.jsx
- User-reported: the Practice panel could not be closed by clicking its header. Cause: the
  expanded state was derived as `open || route.startsWith('practice')`, which force-opened it
  on every practice route, so user clicks were no-ops.
- Fix: explicit state wins after interaction; auto-open now happens only on ARRIVAL at a
  practice page (route-change effect) — so a manual collapse sticks until navigation.
- Verified: vitest 33/33 (new test lands on a practice page, asserts aria-expanded
  true → click → false → click → true) and live Playwright run (auto-open true → close → open,
  zero errors).

## PROJECT /app v2.2 — Plan page in main (user: "build in main, not practice")
- Date: 2026-10-25 · Standing directive: new builds go to the MAIN frontend app; the sandbox
  (port 5174) is experiments-only.
- Built /app/plan as a real surface (no more Coming-soon for Plan): plan summary pills
  (today n/3, total logged, streak), Today's three missions (read-only recap; completion
  happens on Home per the verified-results rule), Focus areas = real readiness domains with
  notes + levels, Last-7-days strip from verified history with honest empty text.
- Ops discovery en route: the :4000 backend process was STALE (an earlier restart silently
  failed — pkill pattern didn't match `node server.js`), so the API had been serving the OLD
  payload without `history`/cap fields. Fixed by killing the port owner (ss -ltnp) and
  restarting; verified `/api/dashboard` now returns history + asksToday + askCap. Added a
  defensive read for history in the client.
- Verified: vitest 33/33, build + e2e Plan navigation live (focus rows 5, today rows 3,
  week tiles 7, zero JS errors).

## PROJECT /app v3 — full dashboard build sprint (6 sub-agents, 2026-10-28 morning)
- Built by parallel sub-agents under design-intelligence/feature-protocol.md (strict file
  ownership + tokens + per-student isolation): Practice/Daily15 (28-question real bank,
  first-try scoring, atomic persists) · Skills tree + Mistake replay (36-skill sequential
  unlock tree; reviews feed the sidebar badge) · Interview Prep (21-question timed trainer,
  cheat-resistant reveal, self-grade 1–5, review queue) · Squad (codes, capacity 4, done-today
  ticks, nudge caps + 22:00–06:00 IST quiet hours server-enforced) · Mock Drive (weekly Saturday
  15:00 IST anchor, capacity 50, live countdown in server time) · Projects ("Project Doctor"
  deterministic 5-point intake review) · Syllabus semesters + Launchpad (12 real curated
  resources) + Help/What's-new. Integrated: 12 real dashboard routes, badges live
  (reviewsDue/Live-countdown), zero Coming-soons left except Profile/Settings/Pricing
  (intentional).
- Ops: backend restarted to load all routes; verified /api/* 11/11 → 200 for a fresh student.
- QA: e2e screenshot sweep 12 desktop pages + 2 mobile (all rendered, no skeletons stuck,
  zero JS errors); vitest 33/33; backend 2/2; production build clean.

## PROJECT landing /app-hero hotfix — video-only rectangle (user request)
- Date: 2026-10-28 · User: "I just want the full video inside the rectangle, only video."
- Removed the browser-chrome bar, floating Today/Squad cards, timeline clips + weekday labels,
  the overlay headline/CTA chip, and the modal player. The hero rectangle is now ONLY the demo
  video (16/9, rounded, edge-to-edge). Silent ambient loop; click = restart with sound in place
  (second click pauses); keyboard Enter/Space works. Verified live: chrome/floats/timeline = 0,
  click → muted false + t≈0, no JS errors, vitest 33/33.

## PROJECT /app v2.3 — greeting/score upgrade + the real pfp set (user-supplied)
- Date: 2026-10-29 · User: the greeting was too generic → "Good morning, Kartik" with India
  time; make the readiness score big in the hero section; use the pfp set at frontend/public/avatars.
- The user PROVIDES the avatar set themselves (40 files: NN.webp + SVG symlinks to public/pfps/).
  System mapped to it: onboarding picker shows 40 options (webp), payload stores NN, backend
  auto-assigns by email hash when unselected (avatarFor in dashboard.js), dashboard renders
  /avatars/NN.webp everywhere (sidebar, topbar, greeting).
- Home greeting upgraded: big IST clock line (Asia/Kolkata), 30px greeting, score RING
  (172px ring, 58px number, ramp glow) as the central motif, pills row (progress/streak/total).
- Verified live end-to-end: register → onboarding with avatar pick → /app; avatar images load
  (naturalWidth > 0) in sidebar + topbar + greeting; greeting/score rendered; vitest 33/33.
- Ops lesson: stale long-running dev processes bit three times this sprint (backend AND vite);
  the rule is now "kill by PORT OWNER (ss -ltnp) and verify the SERVED artifact after every
  backend change" (extends P-6 in evaluations/checklist.md).

## PROJECT /app fix — onboarding avatar tiles were broken
- User screenshot showed all 40 picker tiles with broken-image icons. Root cause: the picker
  img src used /avatars/NN.jpg while the actual provided set is NN.webp — a stale-hybrid line
  from the multi-round revert/re-apply churn (the reverse of the earlier morning issue).
- Fixed the extension, verified live: 40/40 <img>s naturalWidth > 0; picker grid renders all
  avatars; selection ring works. Also diagnosed en route: vite served stale transforms twice
  this sprint — after any backend/frontend file change, verify the SERVED artifact
  (curl the module URL), not just the disk (now rule P-6b in checklist practice).

## PROJECT /app v2.4 — Home fills the width (user: no big empty sides)
- Date: 2026-10-28 evening · User: fill the left/right empty space on the dashboard.
- Before: content capped at 1060px inside a ~1216-1400px frame → dead margins + an empty grid
  cell under Squad (5-card 7/5 grid left col4 of row3 empty).
- After (S17 column-taxonomy applied): container widened to 1480px max; 6-col grid —
  Tasks span 4 (row1) · Ask span 2 tall side panel (rows 1-2, sticky-log) · Activity span 4 ·
  Squad 3 + Reviews 3 fill the bottom row completely. Phone collapses to 1 col (span resets).
- Verified by measurement, not eyeball: content width == frame width (1376 == 1376, gap 0) at
  1440; 360 stays 1-column; full-page screenshots reviewed.

## PROJECT /app v2.5 — "Command Center" Home rebuild (approved plan-mode design)
- Date: 2026-11-01 · Verdict: live, verified (screenshot + measured layout).
- Home rebuilt on a 6-col command-center grid, every number real:
  greeting + 48 readiness ring · Tasks + Ask panel · Readiness breakdown
  (5 domain bars from payload.map, notes + Plan link) · Daily-15 stats
  (real summary endpoint) · Interview stats (real summary endpoint) ·
  Activity heatmap · Squad live preview (real /squad/state ticks) ·
  Reviews (real dueCount → Replay) · Launchpad preview (real 12 resources,
  top-3 portals + Open ↗) · Mock Drive mini (real countdown/seats/live state) ·
  Syllabus progress (real tree counts) · Projects (real tracked count).
- Plan page: 7-day height-driven bars from verified history (chart kit).
- Landing nav: auth-state aware — signed-in users see "Open Dashboard →".
- Ops: vite/browser mismatch diagnosed via served-module curl (stale transform
  = old .jpg src) — served-artifact checking caught it (P-6b).
- Gaps: practice 7-day trend chart needs a per-day history endpoint for daily15
  (today's summary only); queue for the Supabase migration work.

## PROJECT /app v2.6 — Home cards pruned + ask fill (user feedback)
- Date: 2026-11-01 · User: Syllabus/Projects home cards added clutter; dead space under Ask.
- Changes: Syllabus + Projects cards REMOVED from Home (pages remain in the sidebar nav —
  1-line config revert if wanted); Ask card = flex column with the log stretching into the
  leftover space (no dead zone below the input). Grid rebalanced: Practice/Drive/Interview row,
  Squad/Activity row, Reviews + Launchpad (tall) final row.
- Verified: build clean, 33/33 tests, live screenshot reviewed — all remaining cards real-data.

## PROJECT /app v2.7 — icons + avatar pass (user: images where needed)
- Date: 2026-11-01 · Shared icon module extracted (dashboard/icons.jsx — stroke family +
  CATEGORY_ICON/DOMAIN_ICON maps; Dashboard imports it).
- Applied: Plan screen (domain icons on focus rows, task icons on today rows, DayN meter),
  Home (iconized task topic chips), plan summary + topbar show the user's pfp webp.
- Verified live: plan page — 5 focus icons, 3 today-row icons, 1 meter; avatar webp loads.
