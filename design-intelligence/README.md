# Design Intelligence System

Evidence-based UI/UX design knowledge extracted from a verified library of 12 YouTube
videos (4 creators), organized for retrieval and application in future projects.

**Built:** 2026-10-24 · **Workspace:** this directory · **Status:** see `processing-status.md`

## Directory map

| Path | Contents |
|---|---|
| `source-registry.md` | Verified inventory of all 12 source videos (title, channel, duration, access status) |
| `processing-status.md` | Live tracker: what is analyzed, partial, or blocked — update after every segment |
| `research/video-NN.md` | Deep per-video notes: lesson log with problem → decision → reasoning → evidence → timestamp → applicability |
| `creators/creator-profiles.md` | Per-creator design tendencies with evidence |
| `design-systems/` | Cross-source synthesis: shared principles, creator comparison, decision framework |
| `principles/` | Domain knowledge files (typography, spacing, color, hierarchy, components, motion, responsive, accessibility) |
| `patterns/` | Page-pattern playbooks (landing pages, navigation, forms, dashboards) |
| `evaluations/` | Evaluation checklists and design-test results from practice exercises |
| `../sandbox/` | Practice exercises as a separate Vite/React app (port 5174) — rebuilt from the evaluated designs; run `npm run dev` inside it |
| `projects/` | Design decision records for real projects |
| `media/` | Metadata JSON, captions, transcripts, video segments, extracted frames (evidence store) |

## Data provenance rules

- Every lesson cites its source video number and timestamp.
- `transcript:` prefix = creator said it explicitly. `frame:` prefix = verified visually by
  extracting and viewing that timestamp. `interp:` = analyst interpretation — may be wrong.
- Video 12 was vetted from Hindi auto-captions; its quotes are translated by the analyst
  and marked `translated-from-hi`.
- Nothing is claimed about a video that wasn't actually accessed.

## How to use this system in a future session

1. **Read `INDEX.md` first** — the retrieval map (task type → files → gold sources, plus the
   fast decision-question lookup and open-hypotheses list).
2. Read `processing-status.md` (what is verified) and `design-systems/decision-framework.md`.
3. Look up the interface type in `patterns/` and the disciplines in `principles/`.
4. Check `creator-profiles.md` when a specific aesthetic is wanted.
5. Follow the workflow in `design-systems/workflow.md`: brief → direction → implement →
   render → evaluate with `evaluations/checklist.md` → revise → record. Every repo's own
   rules (AGENTS.md, DESIGN.md, existing tokens) override this system's defaults.
