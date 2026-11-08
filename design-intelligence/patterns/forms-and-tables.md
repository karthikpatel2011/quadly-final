# Pattern: Forms, rows & tables

Evidence: video-01 L01-5/L01-6 (frames t00m2m10, t00m2m22, t00m1m57), video-10 L10-3 (label/field
proximity, frames t00m3m31), video-02 (state matrix), video-07 (steppers, "3+" semantics,
exact escape).

## Container selection
- Fields few + space abundant → sparse page is WRONG; move to **modal/panel** (01: "a modal is
  probably more fitting" — 2:11–2:13). The container should match content volume.
- Advanced options collapsed by default, with a one-line hint + "Configure" affordance
  ("Want branded links? Add a custom domain." — t00m2m10).
- Feature-chips for mutually exclusive add-ons (Password / Targeting / Expiration, t00m2m22).

## Field design
- Label tight ABOVE its input (proximity law, 10 t00m3m31 — label belongs to its field visibly).
- Required marker (+) separate from placeholder; placeholder shows format example
  ("https://example.com/your-long-url"), never the label duplicated.
- Add the fields the task assumes (custom-domain switcher, description) — "missing options" is
  a design failure (01 2:18–2:25).
- Numeric/quantity controls (07): steppers ("− 2+ +") PLUS exact-number entry; presets from
  data (0.5/1/2/3 kg); "3+" semantics when categories exceed the scale; "No max" state instead
  of empty maximum.

## Rows & tables
- Column order = identity → status → meta → actions; numbers right-aligned; dates centered if
  comparative (01 t00m1m57).
- Chips → icons when repeated (status pills stay text + icon); actions collapse to "⋮".
- Brand/source columns use real brand icons + counts + % (01 t00m5m24).

## States (the amateur tell, 02/05)
- Validate inline, on blur if possible; loading ON the button (not a global spinner); success
  micro-interaction (02 confirmation pattern); destructive → confirm dialog with consequence
  text ("This removes 12 files and revokes access for 4 collaborators", 09 t00m13m00) and
  semantic red button (never green).
- Disabled = 200-desaturated token, never opacity-on-text (09 L09-3/L09-13).

## CTA copy
- Verb + outcome ("Generate Secure Link", "Show 41 homes", "Upgrade now"); computed totals
  live INSIDE the CTA when known (06: "adds the computed total into the CTA").
