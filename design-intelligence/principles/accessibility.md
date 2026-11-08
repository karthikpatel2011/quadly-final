# Accessibility — consolidated principles

Sources: S09 (contrast, H-K, color-blindness, WCAG), S10 (contrast laws, real-conditions
framing), S01/S02 (states, focus). Classes: **[G]** verified multi-source · **[P]** practice-verified ·
**`outside-source`** standard baselines added by us (labeled).

## Rules
- **WCAG floors as minimums**: 4.5:1 normal text, 3:1 large text (≥18px bold / 24px regular)
  AND 3:1 for UI components (buttons, icons, borders of inputs). Never targets, floors. [G]
- **Perceived ≠ measured**: Helmholtz–Kohlrausch — saturated colors LOOK brighter at the same
  luminance; desaturate readable content, keep accents vivid; check "does it vibrate" on dark
  surfaces. [G]
- **Never color alone**: pair every semantic color with icon/label/border/pattern (~8% of men,
  ~0.5% of women color-blind). [G]
- **Judged on the real surface**: artboard colors lie (simultaneous contrast); check tokens on
  the actual background, incl. dark-mode cousins. [G]
- **Caption grays**: tertiary/dark-mode caption tokens are the classic silent failures —
  verify ≤13px grays numerically (practice: #8A8069 on paper = 3.7:1 FAIL → #6E6553 = 5.4:1). [P]
- **Focus visibility**: 3px accent outline + offset on every interactive element; focus ring
  token (300 step) distinct from disabled (200). [G + `outside-source` keyboard baseline]
- **State completeness is accessibility**: loading, disabled, empty and error states carry
  meaning for assistive tech too; label them semantically. [G + `outside-source` ARIA practice]
- **Tooling named by creators**: Stark, WebAIM, Figma inspector — verify in-product, not in
  swatches. [R]
- Beyond-AA over-engineering is NOT the goal ("minimums, not targets"). [G]
