# Quadly Workspace Plan — LeetCode-style shell, banks, contests, track scaling

## The idea in one line
Turn the logged-in app into LeetCode's chrome: **no top navbar**, one persistent left sidebar, and a **workspace per section** — when you open Practice you see Daily 15, the full problem bank, interviews, contests and your streak calendar right there. Underneath: a track/pack system so ECE and Cybersecurity are just content packs, and a files→Supabase scaling path.

**Adopting from the screenshots:** sidebar-driven chrome, section-named workspaces, everything-of-a-kind-in-one-place (bank + filters + counts right inside Practice), topic chips with counts, difficulty colors, solved progress ("42/80 solved"), monthly calendar, company tags, recurring contests.
**Not adopting:** premium paywall, 4000-problem sprawl (we stay curated), global public leaderboards (college-scoped only), unmoderated discuss.

---

## Phase 1 — The shell (the look you asked for)
- **Remove the top navbar** (`qd-topbar`). Upgrade, theme, account menu, notifications move into the sidebar's existing bottom account block — nothing becomes a dead control.
- The icon rail + sidebar become the only persistent chrome. The active workspace names the app: sidebar highlight + workspace heading + `document.title` change per section ("Practice — Quadly" etc.).
- **Practice workspace** (new IA): internal tabs — **Bank | Daily 15 | Interviews | Contests**. Interview Prep and Mock Drive move *inside* Practice (sidebar group collapses accordingly; nav config updated). Skills and Syllabus stay separate workspaces. Home stays the front page.
- Every workspace gets a consistent header row (title, one-line description) and a contextual right rail filled with that section's cards.

## Phase 2 — Problem bank (the Library)
- Question schema upgrade: `difficulty` (easy/med/hard), `companies[]`, `explanation`. First batch: **curated ~60–80 real placement questions** across DSA/DBMS/OS/Networks/OOP/AI (hand-authored seeds — real-data rule).
- Bank view in Practice: topic chips **with counts**, difficulty dots (token green/amber/red), search, solved/first-try marks (attempts.json already stores first-try), filters (unsolved, difficulty, topic), global "X/Y solved · Z% first-try".
- Daily 15 becomes topic-balanced and weak-topic-weighted (feeds from Mistake Replay).
- **Trending companies** card computed from `companies[]` counts.

## Phase 3 — Contests (upgrade Mock Drive)
- The Saturday 15:00 IST drive becomes the **Weekly Contest**: join → 10-question timed set (topic-balanced, per-student seeded) → auto-submit.
- Real **college-scoped leaderboard** (score, tie-break by time), contest history, personal best. Attempts stored like practice attempts.
- Pinned contest band on Home (ranking lib already supports `drive`/`challenge` pinned types) + contest card in the Practice rail with countdown + Join.

## Phase 4 — Calendar + progress
- LeetCode-style **month calendar** of practice/contest days (built from real attempts history) in the Practice rail and Profile. Solved counters surface in Profile stats too.

## Phase 5 — Track foundation → ECE + Cybersecurity packs
- **Onboarding adds:** branch (CSE/IT/ECE/EEE/Mech/Civil/Other), prep track (Software, Core ECE, Cybersecurity, Data & AI), year. Profile carries `pack`.
- **Pack system:** `backend/data/packs/<packId>/` holding bank, interview questions, syllabus tree + content, plan template, launchpad resources; a registry maps `branch:track → pack`. One engine, `profile.pack` decides content everywhere (plan generator, practice, interview, syllabus, launchpad). Shared core pack for aptitude/resume/HR for all tracks.
- Ships in two milestones per your ordering: **(a)** CSE content reorganized into the pack + bank growth; **(b)** ECE pack (EDC, Digital, Signals, Communication, Embedded, ECE-networks) and **Cybersecurity pack** (Network security, OWASP/Web security, Linux, Crypto basics, SOC/blue-team ops) with their own curated starter questions, interview banks, syllabus trees, projects and Launchpad resources (TryHackMe-style links, core-company portals).

## Phase 6 — Scaling: how it's possible
- **Content scale (ECE, cyber, any branch):** packs are data, not code — a new branch costs content authoring + a registry row, zero engine changes, zero deploys.
- **Data scale:** Supabase is provisioned and `pg` is already in deps (unused). Add `backend/src/lib/store.js` — an adapter with the exact `readJSON/writeJSON` signatures backed by Postgres when `DATABASE_URL` is set (JSON fallback in dev). Tables: profiles, questions(+pack), attempts, plans, posts/reactions/comments/reports, squads, contests, jobs. Migration script moves existing JSON documents. No API contract changes — routes keep their shapes.
- **Then:** ranking as a SQL/materialized query at thousands of users, avatars to Supabase Storage (private bucket), nightly cron for digests/contests, indexes per college. Redis only if rate limits ever outgrow Postgres.

---

## Files touched
`Dashboard.jsx` + `dashboard.css` (chrome removal, workspace header), `dashboardConfig.js` (new IA), new `BankView/ContestView/CalendarCard`, `PracticePage/InterviewPrepPage` (fold into workspace tabs), `practice.js` (+bank schema), `drive.js` → `contest.js` upgrade, `plangenerator.js` (pack-aware templates), `onboarding.js`/`auth.js` (branch/track/year), `packs/` data directory, later `store.js` Supabase adapter. Tests for every new route behavior + pack resolution.

## Verification (per phase, house standard)
vitest + `node --test` green, `npm run build` clean, served-artifact checks, screenshots at 360/768/1280 in dark + light for each workspace (composer/sheet states included), interaction checks (filters, contest join, calendar, pack switch), `docs/IMPLEMENTATION_PLAN.md` updated with evidence.

## Explicitly not in this plan
WhatsApp/IPC digests, payments/premium, mobile app, global public leaderboards.

Phases ship one at a time — after each, you review screenshots before the next starts.