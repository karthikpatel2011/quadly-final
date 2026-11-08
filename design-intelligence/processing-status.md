# Processing Status — FINAL (2026-10-24)

## Pipeline summary — 12/12 sources analyzed and verified

| # | Video | ID | Frames viewed | Notes file | Status |
|---|---|---|---|---|---|
| 01 | 5 SaaS UI/UX mistakes… Vibe Code (Kole Jain) | PDcQJOPby1k | 26 (analyst) | research/video-01.md | **done** |
| 02 | Every UI/UX Concept <10min (Kole Jain) | EcbgbKtOELY | 34 (agent A) | research/video-02.md | **done** |
| 03 | 4 UI Design Hacks (Kole Jain) | SfX43uIubj4 | 27 (agent A) | research/video-03.md | **done** |
| 04 | The 7 Color Mistakes (Kole Jain) | EOcY3hPMQkk | 20 (agent B) | research/video-04.md | **done** |
| 05 | 7 UI/UX beginner mistakes (Kole Jain) | AH_ugxmLeUM | 20 (agent B) | research/video-05.md | **done** |
| 06 | Redesign > 100 tutorials (uxpeak) | GGg61sdEjeI | 28 (agent C) | research/video-06.md | **done** |
| 07 | Bad vs Great UX (uxpeak) | U7jTCgIWS4w | 30 (agent C) | research/video-07.md | **done** |
| 08 | Skills ft. Logitech design lead (Saptarshi) | KZk5gEOUMgc | 26 (agent E, 10 design-material) | research/video-08.md | **done** |
| 09 | Color Theory CRASH COURSE (Saptarshi) | l6LqaAs4hWs | 35 (agent D) | research/video-09.md | **done** |
| 10 | 9 Typography Laws (Saptarshi) | PLrmd7_AsEI | 37 (agent D) | research/video-10.md | **done** |
| 11 | 7 Skills (Saptarshi) | tQ9u4evCvZw | 26 (agent E, 13 design-material) | research/video-11.md | **done** |
| 12 | **FULL COURSE** 3h08m, Hindi (Lets Uncover) | truRwcI7-kg | A:36, B:30, C:43 (agents 12A/B/C) | research/video-12-part-{A,B,C}.md | **done** (3 parts, 53 lessons) |

Totals: **~219 lessons**, **~368 frames individually viewed**, all 5 delegated analysts
spot-verified by frame re-inspection (7/7 sampled claims matched raw frames, including two
slide typos they caught).

## Access notes (verified, for reuse)
- Captions: yt-dlp timedtext 429-rate-limits under load → `youtube-transcript-api` fallback worked.
- Video 12: Hindi-only auto captions (`hi`, generated); translation endpoint NotTranslatable →
  raw Hindi stored; analyst translations marked `translated-from-hi` in all three parts.
- yt-dlp `--download-sections` SIGSEGV'd ffmpeg on long DASH files → full-file 720p downloads +
  absolute-timestamp frame cuts (one 195 MB course file retained at media/segments/).
- Nothing was inaccessible; no video skipped. Sponsor/self-promo segments excluded from lessons.

## Deliverables (all complete)
- [x] source-registry.md — verified 12-video inventory + course identification (video 12, 3h08m)
- [x] research/video-01..11.md + video-12-part-A/B/C.md (14 research files)
- [x] creators/creator-profiles.md — all four creators, evidence-cited
- [x] design-systems/: shared-principles.md · creator-comparison.md · decision-framework.md ·
      workflow.md (+ INDEX.md at root)
- [x] principles/: typography · color-and-contrast · spacing-and-layout · visual-hierarchy ·
      components · motion-and-interaction · responsive-design · accessibility
- [x] patterns/: landing-pages · dashboards · navigation · forms-and-tables
- [x] evaluations/: checklist.md · design-test-results.md (2 practice loops, 10 recorded failures)
- [x] practice/: 01-ledgerline (light premium landing), 02-relay-dashboard (dark dev dashboard)
- [x] projects/project-design-records.md
- [x] INDEX.md — retrieval map; README.md — usage + provenance rules

## Unresolved / for future work
- 5 open hypotheses (design-systems/creator-comparison.md §5) — validate via practice briefs.
- Interaction states beyond hover/focus (loading flows, keyboard walkthrough) not yet practiced.
- Gemini-engine watching (video 12 at higher fidelity) available if a key is ever provided —
  current analysis stands on Hindi captions + 109 frames, honestly labeled.


---

# PHASE 2 — expanded library (user-supplied batch) + sandbox relocation

## Sandbox (user directive: practice lives in a dedicated app, not inside design-intelligence/)
- [done] `../sandbox/` — separate Vite 7 + React 19 app (JSX only), port 5174 (frontend 5173 / backend 4000 untouched)
- [done] P01 Ledgerline + P02 Relay ported as React components with scoped CSS (p01.css/p02.css)
- [done] parity verified: `npm run build` clean; Playwright screenshots of home/p01/p02 from the preview server identify to the evaluated v3 designs, zero page errors
- [done] old design-intelligence/practice/ DELETED; all references redirected to the sandbox
- Run: `cd sandbox && npm install && npm run dev` → http://localhost:5174

## Phase 2 videos (registry: source-registry.md Phase 2 table)

| # | Video | Transcript | Notes | Status |
|---|---|---|---|---|
| 13 | 2,108 Dashboards (Mobbin, 5:07) | video-13.txt | 16 viewed | research/video-13.md | **done** (agent H, 9 L, quantified) |
| 14 | 11 years knowledge (SMWD, 7:14) | video-14.txt | 36 viewed | research/video-14.md | **done** (agent F, 11 L) |
| 15 | Design $10k Sites (SMWD, 11:00) | video-15.txt | 19 viewed | research/video-15.md | **done** (agent F, 7 L) |
| 16 | 6 Web Design Styles (SMWD, 13:25) | video-16.txt | 48 viewed | research/video-16.md | **done** (agent F, 8 L) |
| 17 | 33 UNIQUE Layouts (SMWD, 34:40) | video-17.txt | 28 viewed | research/video-17.md | **done** (agent G, 27 L) |
| 18 | 4 Steps Improve Skills (SMWD, 7:07) | video-18.txt | 12 viewed | research/video-18.md | **done** (agent G, 5 L) |
| 19 | Complete Web Design Process (SMWD, 12:13) | video-19.txt | 16 viewed | research/video-19.md | **done** (agent H, 10 L) |
| 20 | 1,460 Onboarding Flows (Mobbin, 10:06) | video-20.txt | 20 viewed | research/video-20.md | **done** (agent H, 13 L, quantified) |
| 21 | Color Theory (College Wallah, 11:34) | video-21.hi-raw.txt (translated) | video BLOCKED (bot-wall, 11 attempts logged) | research/video-21.md | **partial**: transcript complete, frames = cover only | (unchanged) |
| 22 | Claude Design Skills (AI LABS, 12:55) | video-22.txt | 29 viewed | research/video-22.md | **done** (agent I, 14 L) |
| 23 | 17 Layout Examples (SMWD, 23:52) | video-23.txt | 27 viewed | research/video-23.md | **done** (agent G, 28 L) |
| 24 | 4 levels UI/UX (Tim Gabe, 15:34) | video-24.txt | 26 viewed | research/video-24.md | **done** (agent I, 18 L) |

Pending after wave: spot-verify frames; creator profiles (Mobbin, Self-Made Web Designer,
College Wallah, AI LABS, Tim Gabe); synthesis updates (INDEX, comparison); a NEW practice
exercise in the sandbox applying phase-2 lessons (onboarding/dashboard patterns are direct
inputs); final report.

## Phase 2 — FINAL (2026-10-24)

- 12/12 videos processed: agents F/G/H/I complete — 155 lessons, ~277 frames viewed.
  Spot-verification: 2 more frame re-checks passed (S24 senior scorecard, S17 Enlighten layout) —
  9/9 analyst outputs across both phases evidence-checked.
- One accepted partial: video 21 (College Wallah) — Hindi transcript fully analyzed and
  translated; the video file itself is behind YouTube's bot-wall (attempts logged in
  research/video-21.md). Its claims are marked transcript-only in the notes.
- Synthesis: creator profiles now cover 9 creators (5 new); patterns/page-structures.md (column
  taxonomy) and patterns/onboarding.md (measured A/B numbers) added; shared-principles v2 (4 new
  corroborations, 2 new conflicts incl. F-pattern debunk, H6/H7), decision-framework §10/§11,
  INDEX updated.
- Practice: exercise 03 "Stridebook" built in the sandbox (React), 2-issue loop, VERIFIED render.
- Totals: 24 videos · 9 creators · ~374 lessons · ~645 viewed frames · **4 practice exercises**.
