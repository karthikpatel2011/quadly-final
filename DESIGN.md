---
version: alpha
name: Quadly
description: Design language for the Quadly web app (dark landing theme). All values are defined once as CSS custom properties in frontend/src/styles/tokens.css and govern every piece of frontend styling.
colors:
  page: "#000000"
  surface: "#0a0a0b"
  border: "#1f1f22"
  editor-panel: "#121315"
  editor-canvas: "#010101"
  backed-top: "#191919"
  backed-low: "#0e0e0e"
  primary: "#2078ff"
  primary-deep: "#1d76f6"
  hero-blue: "#4328f8"
  indigo-deep: "#251877"
  streak-blue: "#2378f5"
  streak-cyan: "#48a5e0"
  badge: "#ec685c"
  3d-face: "#4e90fe"
  3d-dark: "#0251d2"
  text: "#ffffff"
  text-muted: "#a1a1aa"
  success: "#22c55e"
  danger: "#f87171"
  chip-amber-a: "#ffce3c"
  chip-amber-b: "#ff8a00"
  chip-orange-a: "#ff9840"
  chip-orange-b: "#ff7312"
  chip-green-a: "#8dffa4"
  chip-green-b: "#4ce873"
  chip-mint-a: "#5fd89b"
  chip-mint-b: "#3bb078"
  chip-lime-a: "#ecff7a"
  chip-lime-b: "#d4f528"
  chip-blue-a: "#4d97ff"
  chip-blue-b: "#0f66f0"
  chip-purple-a: "#9a6bff"
  chip-purple-b: "#6a3bec"
  chip-sky-a: "#d6efff"
  chip-sky-b: "#9ed2f9"
  chip-pink-a: "#ffa4e6"
  chip-pink-b: "#e873c8"
typography:
  display:
    fontFamily: "Poppins, Inter, system-ui, sans-serif"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: 16px
    lineHeight: 24px
rounded:
  panel: 28px
  card: 20px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 64px
  3xl: 120px
---

## Overview

Quadly is a web app with a React front end and a Node/Express API; the landing page is a dark, high-contrast composition — black canvas, one vivid blue hero panel, colorful gradient "chips", white display type. Every normative value lives as a CSS custom property in `frontend/src/styles/tokens.css` (extracted from the reference design); this document records the intent behind those tokens and how they may be used.

## Colors

Components never hardcode hex values; they reference the custom properties in `tokens.css` (rgba black/white overlays are the only exception). `page` is the canvas; `surface` and `editor-panel` sit on it for cards and mock panels, separated by `border` hairlines. `primary` is reserved for interactive emphasis — buttons, active pills, progress fills — one primary action per view. `hero-blue` belongs to the hero panel and only the hero panel; `indigo-deep` is the mid stop of the onboarding page's full-bleed blue-to-dark gradient (hero-blue band → indigo-deep → page black). `streak-blue`/`streak-cyan` render decorative streaks and glows; `backed-top`/`backed-low` gradient the investor wall; `3d-face`/`3d-dark` are reserved for wordmark-extrusion moments — the canonical brand lockup is the shipped asset `/art/quadly-logo.png` (script wordmark + diamond mark), rendered by `components/Logo.jsx` in every header and footer; `badge` is the accent for the trust badge only. Chip gradients (`chip-*-a` → `chip-*-b`, top to bottom) are used exclusively for the tilted feature chips, mock tiles, avatars, and timeline clips. `success` and `danger` are status-only colors for form feedback on the join flow.

## Typography

Two scales: `display` (Poppins 500/600) for headlines, wordmarks, chips, and big numeric moments; `body` (Inter) for everything else. Fonts are self-hosted via @fontsource imports in `src/main.jsx` (Poppins 500/600, Inter 400–700) — no CDN webfont loading.

## Layout

All spacing comes from the `spacing` scale on a 4px base grid. Content sits in a 1180px container; the hero panel insets 16px from the page edges. Sections are separated by generous black gaps rather than separators.

## Shapes

`rounded.panel` is for the hero panel, the giant CTA pill's field walls, and the tilted chips; `rounded.card` for cards, mock windows, and badges; `rounded.pill` for buttons, avatar circles, toggles, and progress fills.

## Do's and Don'ts

- Do reference every color, spacing step, radius, and font through `frontend/src/styles/tokens.css`.
- Don't hardcode hex values, ad-hoc pixel spacing, or font names inside component CSS (rgba white/black overlays and UI-mock hairlines are the allowed exceptions).
- Don't apply `primary` to more than one action per view.
- Don't fake `text-muted` with reduced-opacity `text`; use the token.
- Don't use chip gradients as decoration outside the chip field and the in-product mock moments; dark chip text is `#0b0b0b` on bright gradients.
- Don't add image assets outside `frontend/public/art/`; the reference screenshot itself must never ship in the app.
