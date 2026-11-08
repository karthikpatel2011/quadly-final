# Color & Contrast — consolidated principles

Sources: video-09 (Saptarshi color theory crash course, 35 frames), video-04 (Kole 7 color
mistakes, 20 frames), video-01 (26 frames), video-02 (34 frames).
Full evidence: `research/video-09.md`, `research/video-04.md`, Kole's files.
Class key: **[G]** general (multi-source) · **[R]** recurring pattern · **[C]** creator-specific ·
**[H]** hypothesis · `outside` = external baseline.

## Foundation

- AI picks AVERAGE colors, not bad ones — "the average of the web is not a design masterpiece"
  (09 L09-2, 01 L01-2 concur). Treat generated palettes as drafts to replace with reasoned choices.
- Color rules are measurable, not taste: proportion, function, perception, meaning (09 L09-14).

## Decision rules

| Decision | Rule | Class | Source |
|---|---|---|---|
| Proportion | 60% dominant neutral / 30% secondary (surfaces, personality) / 10% accent (only the action family). Figure-ground logic. | G | 09 L09-1 + 04 (60/30/10 cap) |
| Accent budget | Accent = currency for the primary action. If accent >~10% of screen, it stops being the figure. | G | 09 L09-1 |
| Saturation | Vividness = attention. High saturation reserved for primary actions/alerts; readable content desaturated. | G | 09 L09-3/L09-8 + 01 |
| Opacity ≠ lighter | Opacity blends with whatever is behind; use for overlays/disabled/separators, not as a tint substitute in tokens. | R | 09 L09-3 |
| Palette size | 3–5 core colors + neutral scale (5–7 steps white↔black). Everything else = tint/shade derived. Hick's law: each hue is another decode. | G | 09 L09-10 + 01 L01-2 |
| Roles | Every color has ONE job (primary/secondary/neutral/semantic). Audit: two colors same job → cut one; one color 3 jobs → split. | G | 09 L09-6 |
| Semantics | Don't fight learned meaning (Stroop): red=error/destructive, green=success, amber=warn, blue=info. Customize SHADE never meaning; brand-red products shift error red further/deeper + icon. | G | 09 L09-7 |
| Data semantics | Chart series get semantic/categorical colors (2XX blue / 3XX amber / 4XX red pattern); part-to-whole via gauge/doughnut. | R | 01 L01-2/L01-9 |
| Contrast floors | WCAG 4.5:1 body, 3:1 large text + UI components/buttons/icons — minimums, never targets. | G | 09 L09-8 + 10 L10-10 |
| Perceived contrast | Helmholtz–Kohlrausch: saturated colors LOOK brighter at same luminance → saturated text on dark "vibrates". Desaturate text, keep accents vivid. | G | 09 L09-8 |
| Vibration ban | Never text/background with similar brightness AND saturation; no complementary pair at matched brightness for text. | R | 09 L09-8 |
| Never color alone | Pair color with icon/label/border/pattern (~1 in 12 men color-blind). | G | 09 L09-8 |
| Context test | Simultaneous contrast (Chevreul): adjacent colors push toward complement. Judge colors ONLY on the real surface — "Your Figma canvas is not a user screen." | G | 09 L09-9 |
| Dark mode | Re-light, never invert: adjust saturation/brightness (sometimes hue); desaturate warm accents; keep spatial fg/bg relationship. | G | 09 L09-9/L09-12 + 04 + 01 |
| Dark isolation | In dark UIs color is the isolation tool: ration warm accents to ONE (the CTA); everything else desaturates a step. Von Restorff. | G | 09 L09-12 + 01 t00m1m10 |
| Temperature z-axis | Warm advances, cool recedes: CTA warmer than surroundings; background cool/neutral → natural z-axis on flat screens. Invert deliberately for cool-accent brands. | G | 09 L09-11 |
| State ladder | Ship every brand color as a 50–900 scale; map states: default 600 / hover 700 / press 800 / disabled 200 / focus 300. | G | 09 L09-13 + 04 (state ramps: hover lighter, press darker, disabled desaturate) |
| Neutrals | Prefer grays over pure black/white; dark surfaces get a subtle hue tint (dark green not dark blue in 01). | R | 04 + 01 |
| New color test | "Every new color should earn its place by solving a problem your existing palette can't." Boredom = layout/typography problem, not a color problem. | G | 09 L09-10 |
| Ramp arithmetic | Shades by frozen hue + lightness steps (±10 major, ±5 subtle); "this is how you build color systems." Translated-from-hi source, transcript-verified. | G | 21 L21-3 |
| Dominant ≠ primary | The 60% is the dominant SURFACE, never the brand primary; accent stands out "in very small quantity." | G | 21 L21-2 |
| Harmonies | Monochromatic (calm, safe), analogous (natural undertones), complementary (dominant+accent), triadic (playful, clear leader), split-complementary (safer contrast). Starting points, then adjust S/B until right. | R | 09 L09-5 |
| AI-confidence UI | [H] No standard exists; candidate: solid/opaque = confirmed, faded = suggested, amber = verify. Opportunity flagged by creator. | H | 09 L09-13 |

## Numerical reference (verified on slides)
- State ladder hexes (blue example, 09 `t00m23m30`): #2563E0 default / #1D449E press / #BFD5FD
  disabled / #93B8FA focus-ring. (Slide's hover hex "#1DF4C4" is a typo; hover 700 per the ramp.)
- Example pass: #321e48 on #00c6c8 = 7.01:1 (AA+AAA normal & large).
- Bad example from 09: light-blue button on slightly lighter blue = 1.8:1.

## Failure gallery (verified frames)
- Rainbow icon-tinted KPI cards, clashing bright surfaces (01 t00m0m47 "before").
- "Group chat where everyone marked their messages urgent": all-saturated dashboard (09 t00m4m25).
- Delete button in green (09 t00m13m00 left) — Stroop friction.
- Dark dashboard with saturated red placeholder bars "vibrating" (09 t00m15m04).
- Same white card borders vanish on tinted page vs canvas (09 t00m17m38).

## Tooling (named by creators, `outside` verification of the tools themselves)
Stark, WebAIM contrast checker, Figma built-in accessibility inspector (09 16:29, 10 13:20).


## Applied record
Video 21's method is live in the Quadly product: the primary ramp in frontend
`styles/tokens.css` (frozen H216 ramp, L8→L93, rgba-as-tint removed) and the semantic-red
Sign out (2026-10-25, see `projects/project-design-records.md` /app v2.1).
