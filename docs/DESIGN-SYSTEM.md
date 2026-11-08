# Quadly Dashboard Design System

Derived from the finished screens (Plan, Interview Prep, Projects, Practice) and the
design tokens. The source of truth for every value is `frontend/src/styles/tokens.css`
(`--qd-*` theme mapping); this file only says how to use it. Landing-page rules live in
`DESIGN.md` and do not apply inside the app.

## 1. Surfaces and cards

- Page background: `var(--qd-bg)`. Cards sit directly on it.
- A card is always: `background: var(--qd-surface)`, `border: 1px solid var(--qd-border)`,
  `border-radius: var(--radius-panel)` (28px; inner nested panels use `var(--radius-card)` 20px),
  `padding: var(--space-lg)` (24px), `box-shadow: var(--qd-shadow)`.
- No gradients, no glow, no blur, no colored card fills, no neon — anywhere inside the app.
  The `--chip-*` gradient tokens are **landing-page only**; app cards must never use them.
- Nested surfaces (inputs, wells, code blocks): `var(--qd-surface-2)` with a hairline border.

## 2. Color usage

- Accent (`--qd-primary`, family `--qd-ramp-*`): primary button, links, selected state fill
  (`--qd-primary-soft` + `--qd-primary-on-soft` real solids), focus rings. Sparingly — one
  primary action per view region.
- Success green (`--color-success` #22c55e): **only** for verified labels/marks and success
  states. A verified label is green text with a small check icon and no fill.
- Danger (`--color-danger` #f87171): errors and destructive actions (Delete hover) only.
- Status colors never decorate; cards stay neutral. Muted text `var(--qd-muted)`.
- No raw hex in components: every value comes from a token. Light theme values come from the
  `[data-qd-theme='light']` block — components never branch on theme.

## 3. Type

- Body: `--font-body` (Inter). Sizes: 16 page intro / 14.5–15 body / 13.5 secondary / 12–13 meta.
- Display: `--font-display` (Poppins) for the greeting and page titles only.
- Pills and numeric counters: `--font-mono` (fallback ui-monospace), 12px, weight 600.
- Line-height 1.5 body, 1.2–1.35 headings. Title case for headings, sentence case elsewhere.

## 4. Spacing and radii

- 4px grid: 4, 8, 12, 16, 24, 32. Cards pad 24. Gap between cards 16.
- Radii: panel 28, card 20, pill 999, inputs/nested 10–12.

## 5. Icons

- One set only: `frontend/src/components/dashboard/icons.jsx` — 1.7-stroke, round caps,
  24-viewBox paths. Sizes: 20 in navigation, 16 inline with text. `aria-hidden` (text carries
  meaning); every icon-only control gets `aria-label` + `title`.
- No decorative icons, no icons inside section headings (headings are text), no emoji anywhere
  in the app. The only icon allowed on a Verified label is a small check.

## 6. Controls

- `.qd-btn` base; `.qd-btn--primary` (accent, white text, disabled at 0.45); `.qd-btn--ghost`
  (transparent + hairline); `.qd-btn--block`. One primary button per region.
- `.qd-linkbtn` quiet text button for secondary actions (Comment, Report, links).
- `.qd-input` — surface-2 fill, hairline border, focus border accent.
- `.qd-chip` — toggle/segmented selection; `.is-on` uses soft accent fill.
- `.qd-pill` — mono meta chips (counts, dates); `.qd-pill--tiny` inside cards.
- `.skeleton` for loading; every async section fails independently with an inline notice.

## 7. Wording

- Plain English only. No invented terms, no hype, no exclamation marks. Short, calm sentences.
- Buttons: Post, Cancel, Continue, Register, Play, Read, Answer, Apply, Nudge, Report.
- Audience choice: "Who can see this" → "My college" / "Everyone on Quadly".
- Labels: **Verified** (green + check) for server-verified facts; neutral chips Senior /
  Ambassador / Mentor; "Self-reported" (neutral) for everything unverified.
- Never address the audience as "circle" or any invented community name.

## 8. Accessibility

- Contrast floors 4.5:1 text / 3:1 UI; visible focus rings (never `outline: none` plain).
- `prefers-reduced-motion` kills all GSAP entrances; animation is enhancement only.
- Dialogs: role="dialog" + aria-modal, labelled, Esc closes, focus moves in on open and back
  on close. Live regions (`role="status"`) for toasts and async messages.

## 9. Data honesty

- Real data only: empty states state the truth; no sample posts, users, or numbers.
- Unverified = labeled "Self-reported". The server is the only source of the Verified label.
