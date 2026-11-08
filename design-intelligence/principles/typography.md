# Typography — consolidated principles

Sources: video-10 (Saptarshi "9 Typography Laws", 37 frames), video-09 (state/type interactions,
35 frames), video-02 + video-03 (Kole, 61 frames combined), video-01 (26 frames).
Full evidence in `research/video-09.md`, `research/video-10.md`, and Kole's files.
Classification key: **[G]** general principle (multiple sources) · **[R]** recurring pattern ·
**[C]** creator-specific · **[H]** hypothesis/untested · `outside-source` = not from videos.

## The core reframe

Typography IS the layout — its job is controlling reading order, not decoration
(video-10 L10-1/L10-2: "Typography is not the thing you deal with after the layout is done.
Typography is the layout"). Applied after layout, it produces the "AI average" feel: weak
hierarchy, generic spacing, unchecked contrast.

## Decision rules

| Decision | Rule | Class | Source |
|---|---|---|---|
| Reading order | Pick the ONE element that must win (title, price, or badge); exaggerate via size/style/color; demote the rest. Von Restorff. | G | 10 L10-1 |
| Hierarchy depth | Build contrast in ≥2 dimensions (size + weight + color), never size alone | R | 10 L10-10 + 01 L01-5 |
| Spacing semantics | Gap size declares relationships: heading→its paragraph, label→input. "If your spacing does not reflect relationships, your layout is lying to the user." | G | 10 L10-3 |
| Line height ramp | body 1.4–1.5× → subhead ≈1.3× → display ≈1.1–1.2×. Bigger text = tighter leading. | G | 10 L10-4 + 02 (agent A) |
| Tracking | Tighten display sizes slightly (−2% to −3%); body untouched; never tighten small text. | R | 10 L10-4 + 02 |
| Chunking | Break walls of text into headed blocks; "chunking is spacing at a macro level" (Miller). Each block must pass the "title it in <6 words" test. | G | 10 L10-5 |
| Sequencing | Serial position: context first, support in the middle, decision/price/action last. | R | 10 L10-6 |
| Font count | One strong family first (weights/sizes carry hierarchy). Two max for contrast; three only with defined roles: utility font vs personality font. | G | 10 L10-7 + 02 |
| Pairing | Choose by CONTRAST with shared DNA (similar x-height/proportions), not by category. Two geometric sans = failure. | C→R | 10 L10-7 |
| Identity fonts | Inter = "the plain gray t-shirt": safe default, zero identity. Use when clarity is the product (data tools); pick character when personality is the product. | C | 10 L10-7 |
| Kole's rotation | DM Sans, Plus Jakarta Sans, Axiforma, Montserrat, SF Pro, Unbounded, Geist — one per product. | C | 02 (agent A) |
| Measure | 45–75 chars/line; sweet spot 60–65 ≈ 600–700px @16px body. "Lock the measure, let the margins flex." Set by characters, not % width. | G | 10 L10-8 |
| Alignment | Left-align body always (predictable line starts); center only short ceremonial text (hero line, earned quote); per-grid consistency else "micro friction". | G | 10 L10-9 |
| Contrast floors | WCAG 4.5:1 normal text / 3:1 large text (≥18px bold or 24px regular) AND UI components — floors, not targets. Light-gray-on-white = classic offense. | G | 10 L10-10 + 09 L09-8 |
| Contrast dials | Color is only one dial: combine size, weight, style; never color alone (color-blindness ~1 in 12 men). | G | 09 L09-8 + 10 L10-10 |
| Type for data | Monospace for identifiers/URLs; sans for prose; numerals may de-saturate in dark dashboards. | C | 01 L01-5 + 09 Meridian frame |
| Icon/text coupling | Icon optical size matches text line-height when inline. | R | 02 (agent A) |

## Cached failure modes
- 1.5× leading applied to a 64px headline → "floating apart like they had a fight" (10).
- Center-aligned multi-line paragraphs → eye searches for every line start (10).
- ~140-char lines on a 1440px screen → "cardio for your eyeballs" (10).
- Two fonts that are near-identical: brain sees difference but can't parse why (10).
- Emphasis on many elements at once → emphasis effect divides (10 L10-1).

## Application recipe (derived, `interp` synthesis of 9+10)
1. Write the reading order as a numbered list (what matters first / what's last).
2. Set the type ramp (size+leading pairs), one family + optional contrast face.
3. Set container max-widths by measure; then layout, then color.
4. Run the 9 closing questions as review (video-10 L10-11): what matters / belongs together /
   comfort to move / where to pause / what to remember / voice / rhythm / path / visible.
5. Check contrast on the real surface (not canvas), including disabled/secondary tokens.
