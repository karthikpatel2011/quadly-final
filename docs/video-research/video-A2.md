# Research Notes — A2 (uwNClNmekGU)

Status: **ANALYZED** (2026-10-30)

## Identity (verified via assets/uwNClNmekGU.json)

- URL: https://www.youtube.com/watch?v=uwNClNmekGU
- Title: "4 Foundational UI Design Principles | C.R.A.P."
- Channel: Jesse Showalter (individual designer/educator)
- Duration: 9:15 (555s) · Published: 2022-04-13 · Views: ~311,629
- Captions: auto-en only (`subtitles: []`; ASR source).
- Chapters (description, verified): 0:00 Intro · 0:25 CRAP · 0:40 Contrast · 3:16
  Repetition · 4:48 Alignment · 6:56 Proximity
- Access: transcript only (no frames). All before/after demos are from narration; the
  demo artifact is a bike-shop marketing layout ("Go outside" headline, bike imagery,
  nav, Black Friday offer) in his "training file".

## Transcript-quality note

259 lines, `[M:SS]`, unpunctuated all-lowercase classic ASR style — readable but
compounded. Known mishearings: "invisible accesses" (5:47–5:56, 6:45–6:49) = **invisible
axes** (he says "axis"/"axes"); "go out sewed" (2:10) = the headline text "go outside"
being fixed live; "some rhyme or reason some meeting some order" (4:39–4:41) — "meeting"
is likely "meaning". Chapter timestamps in the description match the transcript flow, so
position claims are reliable. Quotes below are lightly punctuation-normalized with the
original [sic] flagged where it changes the reading.

## Concept log (timestamps per claim)

1. **C.R.A.P. = Contrast, Repetition, Alignment, Proximity** [explicit 0:25–0:45] — the
   four foundational principles of the title; "if you can master these four foundational
   design principles your designs will go from meh to wow" (0:02–0:12).
2. **Contrast** [explicit 0:48–3:14] — contrast "organizes your design, establishes
   hierarchy, emphasizes a focal point and adds visual interest" (0:48–0:55); achievable
   "with color, with weight, with size in typography, with imagery" (0:58–1:05).
   Demo moves: headline 24px → 54px, weight medium → semibold, plus color, so headline
   and body finally separate (1:42–2:07); hero image enlarged, color-filled, pushed
   partially off-canvas as the focal point (2:36–2:47). Important honesty marker: "it's
   not an exact formula, it's just bigger" (1:51–1:54) — directional, not numeric.
   Verdict on the result: "this layout just looks about 100 times better" (2:59–3:02).
3. **Repetition** [explicit 3:16–4:45] — repetition "increas[es] consistency and user's
   ability to learn your interface or your layout, it reduces confusion" (3:19–3:27).
   Unrepeated content "looks like a yard sale… really messy" (3:40–3:44). Demo: product
   cards normalize to one pattern — bikes facing the same direction, cards aligned and
   distributed with even spacing (3:58–4:26). Axis-agnostic: "you can repeat things
   horizontally or vertically diagonally, it doesn't matter. Repetition is adding some
   rhyme or reason, some [meaning], some order, some structure to your layouts"
   (4:31–4:41). [sic] "meeting".
4. **Alignment** [explicit 4:48–6:54] — alignment "organizes and groups elements
   together, it creates rhythm, it brings order to chaos" (4:50–4:56). Demo: left-edge
   align all card text (5:23–5:30), center text to its image (5:33–5:38), distribute
   evenly. Key concept: repeated alignment generates "a series of invisible axes — these
   are invisible lines that are running horizontally and vertically in our layout"
   (5:47–5:56) [sic "accesses"]. Strong claim: even a deliberately chaotic/experimental
   layout (rotated, diagonal, off-canvas) stays legible as ordered "as long as they are
   aligned on one invisible axis, there's still order and reason" (6:11–6:22, and
   6:45–6:54 "creating a sense of alignment will organize even the messiest or
   experimental layout").
5. **Proximity** [explicit 6:56–8:39] — proximity "makes elements seem related, like
   they belong together; it brings understanding and meaning to multiple elements by
   grouping them together" (7:00–7:09). Diagnostic trio a viewer should be able to
   answer: "does this headline belong to this text? do these buttons belong together?
   and where the heck does this Black Friday 50% off deal… live?" (7:19–7:30). Moves:
   nav items clustered and evenly distributed as a group (7:31–7:52); body copy pulled
   toward its headline — "it looks like a distant relative. Let's make it part of the
   family" (7:54–8:03); offer text placed directly under the button it belongs to,
   group moved into the layout (8:03–8:21). Finishing touches: white space for visual
   interest, keyword "bikes" recolored for contrast (8:21–8:36).
6. **Compound effect** [explicit 8:36–8:44] — the layout is "about a hundred times
   better than it was previously because we've applied contrast, repetition, alignment
   and now proximity". The four principles are additive, not alternatives.
7. Meta: the whole video is one continuous before/after on a single layout — the
   principles are demonstrated as successive edits, not four separate examples
   [analyst-inferred from narration flow].

## Techniques / workflows

- **Successive-repair workflow** [presenter workflow]: take a flat "yard sale" layout and
  apply C.R.A.P. in order (C → R → A → P), each pass a small set of moves:
  1. Contrast pass — pick the focal element, exaggerate it (size, weight, color,
     scale-up, bleed off-canvas); differentiate headline from body.
  2. Repetition pass — choose one canonical pattern per component class, normalize all
     instances to it (orientation, distribution, spacing).
  3. Alignment pass — snap elements to shared edges; then check the emergent "invisible
     axes" and keep every element on at least one.
  4. Proximity pass — move each element toward what it belongs to; the gap difference
     itself becomes the grouping signal.
- **Belonging questionnaire** (proximity QA): for every cluster answer headline↔text,
  button↔button, promotion↔owner; anything unanswerable is a defect (7:19–7:30).
- **Axis test** (alignment QA): draw the implied horizontal/vertical lines; a layout
  with fewer shared axes than elements has alignment debt (5:47–6:22).

## Examples shown

Bike-shop hero ("Go outside" headline 24→54px, semibold, focal bike enlarged/colored/
bled, nav line-up) 1:11–3:14; three bike product cards normalized from scattered to
evenly distributed 3:33–4:41; card text left-aligned then centered per-card, rotated
experiment proving axes survive rotation 4:59–6:54; nav cluster, headline/copy/button
family, Black Friday offer placement 7:00–8:41.

## Tools mentioned

- His design "training file" — a design-tool document reused as teaching material
  (3:15, 7:16). Description links the start/end files via designchamps.io; the tool
  itself (Figma-family) is implied, not stated in the transcript [verified via
  description, tool identity inferred].

## Presenter assumptions & simplifications

- "Contrast" here is **compositional contrast** (differentiation, hierarchy, focal
  point) — not WCAG luminance/contrast ratio; the talk never touches accessibility
  [explicit scope, analyst-flagged collision with the same word's other meaning].
- "100 times better" is rhetoric, not a measure; there is no user testing or data.
- Ideal hierarchy is assumed (everyone can see the headline should win); the talk does
  not teach how to DECIDE what the focal point is.
- Repetition and alignment pass through each other's territory (the repetition demo is
  largely alignment work); the principles overlap and he does not separate them.

## Strengths / weaknesses as a source

Strengths:
- The most mechanically operationalizable source in Group A: four named principles, each
  with visible failure cases ("yard sale", "distant relative", unanswerable
  "where does this deal live?") and demo-able repair moves — the failure similes are
  essentially checker names.
- Explicitly scoped to UI and reusable "for any visual design but especially important
  for UI designers" (0:02–0:07 + description).
- Honest about the absence of magic numbers ("it's not an exact formula"), which keeps
  the derived rules qualitative/threshold-based rather than fake-precise.

Weaknesses:
- No accessibility contrast (WCAG) — must be sourced elsewhere before any
  contrast-rule ships to an evaluator.
- Descriptive, not prescriptive on hierarchy choice; no data or audience claims
  beyond rhetoric.
- Video is tool-demo only; transcript lacks the visuals, so judgments about the demo's
  final quality ("100 times better") are taken on narration [access limitation].
- ASR punctuation loss adds cleanup cost (see note above).

## Operationalizable rules for an evaluator agent

The four principles map almost 1:1 to checkable layout rules:

| # | Rule name | Check | Fires when | Source |
|---|---|---|---|---|
| R-A2-01 | `layout.contrast.focal-point` | Each screen has exactly one visually dominant focal element (the intended subject), emphasized via at least one of size/weight/color/scale | All elements render at similar visual weight; or two or more elements compete as equally dominant | 0:48–0:55, 2:36–2:47 |
| R-A2-02 | `layout.contrast.type-hierarchy` | Headline vs body distinguishable by ≥1 differentiating axis (size, weight, color) — directionally larger/bolder, no exact formula | Headline and body in the same size band and weight | 1:42–2:07 |
| R-A2-03 | `layout.repetition.pattern-consistency` | Repeating component instances normalize to one pattern: same image orientation, same anchor edge, equal distribution/spacing | Component instances vary in orientation, alignment anchor, or spacing ("yard sale") | 3:19–3:27, 3:58–4:26 |
| R-A2-04 | `layout.alignment.shared-axes` | Elements snap to shared horizontal/vertical axes; every element participates in ≥1 axis; flag near-miss offsets on an implied axis | Floating x/y positions with near-but-not-equal edges (alignment debt) | 4:50–4:56, 5:47–6:22 |
| R-A2-05 | `layout.proximity.gap-test` | For each cluster, intra-group spacing < inter-group spacing; the gap difference alone must encode grouping | Gap between related elements ≥ gap to unrelated neighbors | 7:00–7:09, 7:54–8:03 |
| R-A2-06 | `layout.proximity.owner-attachment` | Decorations/badges/offers must be unambiguously attached (by proximity) to the element they modify; every element must be answerable to "what do you belong to?" | Standalone badge/discount/rule with no nearest owner ("where does this Black Friday 50% off deal live?") | 7:19–7:30, 8:03–8:17 |
| R-A2-07 | `layout.grouping.family-test` | Headline, supporting copy and its action button form one visually grouped family | Call-to-action floats away from the content it acts on | 7:54–8:21 |
| R-A2-08 | `layout.whitespace.balance` | Grouping via proximity must preserve white space as a deliberate device (respiration between groups) | Cramped clusters with no separation margin after grouping passes | 8:21–8:28 |

Naming note: keep A2's rules under `layout.*` to avoid collision with A4's pricing
"contrast effect" (`pricing.anchor-context`, R-A4-08) — same English word, two unrelated
checks. A5's L02-2 (hierarchy = contrast in size/position/color) is the same principle
and can share R-A2-01/02 evidence.

## Product design lessons (Quadly-relevant)

- Lobby/join screens: one focal element (primary CTA); headline size/weight
  differentiated from body; secondary navigation recessed (R-A2-01/02, R-A1-05).
- Ambassador roster or FAQ cards: enforce R-A2-03 — same orientation, same anchor,
  equal spacing between cards; a "yard sale" card grid is an automatic fail.
- Forms: labels/inputs/help/actions must pass R-A2-05's gap test — a field's helper text
  must sit closer to its field than to the next field; submit button belongs to the form
  family (R-A2-07), not the page footer family.
- Offer/discount banners (R-A2-06): any promo must be visually owned by the thing it
  discounts; unowned promos are a defect, not a style choice.
- Cheap pre-ship audit: render page, draw implied axes (R-A2-04), count clusters and
  gaps (R-A2-05) — all automatable from computed styles without any ML.

## Open questions

- Where do compositional-contrast thresholds come from if "it's not an exact formula"?
  Rule R-A2-02 needs a defensible floor (e.g., A5's type-ramp deltas) — no numeric floor
  exists in this video.
- How many shared axes are enough? A rotated-class layout stays valid per A2, so the
  checker must accept transformed axis systems, not just axis-aligned grids — nontrivial
  to implement.
- Does proximity-grouping survive responsive reflow? Gap relationships may invert at
  breakpoints; the evaluator needs per-breakpoint snapshots.
- WCAG contrast ratio checking should be layered on top of compositional contrast —
  source still needed (none of A1/A2/A4 covers ratio values).

## Confidence & provenance summary

- Verified: identity/metadata via assets/uwNClNmekGU.json; chapter timestamps against
  description.
- Explicit: all principle definitions and demo moves quoted with timestamps (ASR
  punctuation caveat).
- Presenter-claim: quality deltas ("100 times better") and the reordered layouts'
  final appearance — narration only, no frames.
- Analyst-inferred: the four-pass repair workflow ordering as a canonical sequence (the
  video runs it in order but never mandates it as a process); all rule operational-
  izations and the `layout.*/*` namespace; the axis-test/gap-test mechanics.
- Overall confidence: high for principle substance (canon design principles, reinforced
  by A5's overlapping L02 lessons); medium for demo specifics (transcript-only).

## Cross-references

- A5 (design-intelligence/research/video-02.md): L02-2 hierarchy-via-contrast and
  L02-4 spacing/grouping are numeric restatements of A2's C and P; A5 supplies the
  thresholds A2 deliberately lacks.
- A1: R-A1-05 (`content.hierarchy.primary-obvious`) is the semantic twin of R-A2-01;
  careful not to double-fire.
- A4: "contrast effect" in A4 is anchoring in pricing — different concept; namespace
  separation keeps the evaluator's rulebook clean.
