# Research Notes — Video 04

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/EOcY3hPMQkk
- Title: "The 7 Color Mistakes that RUIN your UI Designs"
- Creator: Kole Jain (individual product designer; same creator as video-01/video-05)
- Duration: 7:17 · Published: 2025-09-14 · Views: ~90.7k
- Classification: standalone listicle + live-redesign tutorial (not the course)
- Access: transcript (En auto-captions) + 20 frames viewed at 720p from full video
- Subject: recolors an "Open Cloud" file-management mobile app (storage dashboard, file
  cards, detail-record screen, delete dialog) from a saturated rainbow state to a
  purple-brand palette in light mode, then builds dark mode deliberately

## Structure (chapters verified in metadata)

0:00 Intro → 0:16 Too many colors → 1:27 Bad neutral balance → 2:36 Misusing brand colors →
3:34 (sponsor: Final Round AI, ends 4:06 — not mined) → 4:07 Pure white & black →
4:54 Frankenstein dark mode → 5:39 Ignoring semantic colors → 6:13 Element states →
6:54 recap/outro. Sponsor re-mentioned at 7:04.

## Teaching format

Talking-head framing plus a phone-frame Figma mockup on a light-gray studio backdrop. Each
chapter = one named mistake, fixed live with visible before/after recolor steps. Concept
title cards ("neutral balance"), an annotated color wheel, contrast-ratio pills
("2.34:1 Fail" / "4.05:1 Pass"), and named real-brand proof slides (Lemon Squeezy,
Headspace, Mailchimp, Airbnb) are used as teaching devices. Ends with side-by-side
before/after of both light and dark modes.

## Lesson log

### L04-1 Cap accents at the 60/30/10 split; a dominant brand color on unimportant elements is still wrong
- Problem [transcript 0:19–0:50]: the file cards each carry a different saturated fill
  (cyan, green, crimson, orange in `t00m0m21`) plus a rainbow storage bar and colored nav
  icons — "at least five different accent colors on these cards, all competing for
  attention". White text on these fills "almost all fail the WCAG contrast checks".
- Decision: two-step. (a) He first shows the naive fix — swapping all card fills to the
  brand purple (`t00m0m53`) — and critiques it: it "somewhat hit the 603010 rule", but
  "the bright purple dominates the page for an element that really isn't that important
  and creates obvious accessibility issues" (0:56–1:03). (b) Final fix: lighten the fill
  and set text to black (`t00m1m04` — pale-lavender cards, black titles).
- Reasoning (explicit 0:17): "Less is almost always more with color." The 60/30/10 rule is
  demonstrated with Lemon Squeezy: 60% purple, 30% yellow, 10% white accent
  (`t00m0m39`, annotated swatches over the live site).
- Implementation: dominant neutral carries 60% of pixels; brand as secondary, not on every
  card; accent share reserved for genuinely interactive/at-a-glance elements; light tint of
  brand + dark text when a large area must reference the brand.
- Effect: attention re-goes to content; contrast becomes compliant.
- Fails: brands that are intentionally loud (he concedes exceptions exist: "notable
  exceptions to every rule", 1:45).
- Transfer: before adding any new hue, ask which slot of 60/30/10 it occupies; a big area
  of brand color is a hierarchy claim — only make it for the page's hero element.

### L04-2 Icons need no color; color on icons is reserved for status
- Problem [transcript 1:07–1:09]: the original bottom nav colors each icon differently
  (blue/green/red/purple in `t00m0m21`).
- Decision: all nav icons black; only the active/status tab gets color (`t00m1m15`: Move/
  Files/Profile black, "Shared" tinted red as the highlighted tab he is pointing at).
- Reasoning (explicit 1:09–1:17): "icons need no color. Their job is to be recognizable
  symbols. Color should be reserved for communicating status, like highlighting this as an
  active tab."
- Implementation: monochrome icon set; one status color applied only to the active/modified
  item.
- Effect: color regains meaning; nav reads as structure, not decoration.
- Transfer: audit every colored glyph — if removing the hue loses no information, desaturate it.

### L04-3 "Neutral balance" — treat background color like white space
- Problem [transcript 1:28–1:40]: colors used "just for the sake of using color"; a sandy
  yellow gradient background that "is not really" staying in the background.
- Decision (explicit analogy 1:27–1:33): "You know how we use white space to create
  hierarchy and let the elements breathe? Well, it's the same idea with color, and it's
  called neutral balance." Backgrounds first: "Almost never will you want bright colors for
  your background" (1:42); start from neutral gray background + light/white foreground
  (`t00m1m50`); dark mode is the same idea with darker backgrounds and lighter foregrounds.
- Decision 2 (2:00–2:12): reintroduce brand by tinting the neutral — "taking our neutral
  gray and adding a hint of purple" (`t00m2m04`, tint is subtle); cites Headspace tinting
  cards with a hint of orange.
- Decision 3 (2:13–2:35): in light mode you can reverse fg/bg for small UI like a search
  bar for accessibility — "like Dribble search bar" (transcript-only; the app's tinted
  search input is visible in `t00m2m04`); and "maintaining neutral balance sometimes means
  removing the backgrounds altogether" — card fills replaced with a simple border
  (`t00m2m30`), because an extra filled layer is "a lot of clutter".
- Evidence: `t00m1m34` (title card "neutral balance"), `t00m1m50`, `t00m2m04`, `t00m2m30`.
- Effect: page calms down; hierarchy via tint depth instead of hue count.
- Fails: pure-neutral b2c brands; adds flatness if border/typography hierarchy is weak.
- Transfer: one palette question per surface: is this color background or foreground?
  Backgrounds may be neutral or a tint of brand at very low saturation, never a second hue.

### L04-4 Adapt brand colors with analogous + complementary rotations when the palette is too thin
- Problem [transcript 2:36–2:49]: the provided brand kit is just purple + white/black
  (`t00m2m44`); "we don't really have much else to work with"; plain opacity on the storage
  bar "feels a little bland".
- Decision: "rotate our purple slightly on the color wheel to pick a blue and pinkish
  color" and pick "a complimentary color across the color wheel, like a bright yellow"
  (2:52–3:00). Storage bar and legend resolved as purple + gold + neutral
  (`t00m2m55`, `t00m3m03`: wheel annotated "analogous"/"complementary", bar now
  purple/gold, legend dot for Video becomes gold). "These colors all work well on our UI
  because they're analogous and complimentary colors" (3:02–3:05).
- Decision 2 (3:07–3:16): a brand orange that fails contrast with white text (2.34:1
  "Fail" pill in `t00m3m12`) can be darkened (4.05:1 "Pass") or swapped for a complementary
  blue that also passes — the two-pass contrast decision shown as buttons side by side.
- Proof brands (transcript 3:17–3:30): Mailchimp = bright yellow primary + complementary
  turquoise secondary; Airbnb = bright pink paired with a much deeper pink.
- Reasoning (explicit 3:30): "don't be afraid to adapt brand colors in order to
  accommodate good design."
- Implementation: hue-rotate the brand ±30–60° for series variation; cross the wheel for a
  highlight/secondary; when text-on-color fails, first darken (same hue), then complement.
- Effect: data visualizations and CTAs get working pairs without breaking brand.
- Fails: regulated brand systems where hue is contractual; complementary yellow is easy to
  overuse (his own fix uses it only in small segments).
- Transfer: any data-viz surface: build series colors from one brand hue via analogous
  rotation, plus exactly one complementary for emphasis; keep a contrast-check step in the
  palette workflow.

### L04-5 Reserve pure white and black; grays carry hierarchy (and you into "professional")
- Problem [transcript 4:08–4:25]: pure black/white everywhere flattens hierarchy.
- Decision: file meta (size, type) → dark gray "because this isn't super important
  information" (4:19–4:25); labels and borders lighten because the elements are already
  grouped; he states the end state: "most of the text is light gray or dark purple, not
  even black" (4:32–4:35). Dark mode goes further: "because of the distinct focus on eye
  strain, we can be even more aggressive with lowering the brightness of our grays.
  Reserving white only for the most important actions" (4:37–4:46).
- Evidence: `t00m4m26` (zoomed detail card: light borders, grays in labels; mid-zoom, only
  partial view), `t00m4m36` (dark-mode grays hierarchy: dim labels vs bright values).
- Reasoning (explicit 4:47–4:53): "Getting comfortable with using more gray and less black
  and white is really what differentiates mediocre designers from professional ones."
- Effect: an implicit type hierarchy for free; less glare; pure white kept as a "loudest
  element" token.
- Transfer: define a gray ramp as the palette's real workhorse; black and white become
  semantic extremes, not defaults.

### L04-6 Dark mode is not an inversion — rebuild the palette with dark-mode goals
- Problem [transcript 4:55–5:05]: "dark mode is not just the inverse of light mode"; naive
  inversion lands on true black with cards barely separated (`t00m5m10` — pure-black page,
  near-black cards, dim borders).
- Decision: brighten borders and the main card because "dark colors need to be more
  different than light colors to see the difference" (5:07–5:11) → visible elevation in
  `t00m5m14`; text set from light purple to light grays ("light grays work best on dark
  mode... easier on the eyes than white", 5:16–5:20); then brighten only the most important
  text (logo, storage-used number) to pure white (5:22–5:26); logo desaturated "a touch"
  (5:29, transcript-only, not verifiable in frames).
- Reasoning (explicit 5:33–5:37): "a palette should be built with the goals of dark mode in
  mind" — not mechanically mapped.
- Effect: surface layering reads, text doesn't glare, brand survives.
- Fails: copying a light theme's tokens verbatim; also usually fails when brand purple is
  used at full saturation for body-size elements.
- Transfer: dark palettes need (a) bigger lightness steps between layers, (b) desaturated
  text ramp, (c) white as a privilege for top-priority content.

### L04-7 Semantic colors outrank brand colors: destructive actions are red
- Problem [transcript 5:39–5:55]: the Remove action in the file action sheet — purple is
  "undeniably more on brand", but "that draws attention to the button and doesn't
  illustrate its destructive nature".
- Decision: use red for destructive actions; keep purple for the warning affordance
  elsewhere. Side-by-side in `t00m5m46`: left sheet Remove in saturated brand purple, right
  sheet Remove in light red/pink — plus his expanded palette pill showing green and red
  added to the brand swatches. He explains why red AND green live in nearly every brand
  palette: "a pop-up like this just simply wouldn't fly from a usability point of view"
  (5:59–6:05).
- Decision 2 (6:06–6:13): red notifications are the flexible case — they "could be swapped
  with purple"; destructive red is not negotiable.
- Evidence: `t00m5m46`, `t00m6m20` (delete dialog keeps a purple-tinted warning icon while
  destructive color decisions sit on the buttons — [interp] his compromise: illustration in
  brand, action in semantic).
- Effect: danger is recognizable without reading labels; brand stays present.
- Transfer: every product palette ships with success/danger/info slots even when they
  contradict brand guidelines; brand color may decorate, semantics may not.

### L04-8 Element states are one-dimension color moves
- Decision (explicit 6:14–6:40): disabled = desaturated/light-gray fill with white text —
  "obviously disabled without any other visual cues" (`t00m6m20`, gray "Yes" pill in the
  delete dialog), and this is "pretty bulletproof for a dark mode too"; hover = slightly
  lighter/brighter version of base; press = slightly darker; disabled = desaturate.
- Decision 2 (6:42–6:52): mobile has no hover — compensate with a press state; "adding a
  slightly darker gray on press makes it feel like you're actually pressing into
  something."
- Evidence: `t00m6m31` — delete dialog with the two round swatches beside it (lighter
  purple hover above, darker purple press below) and the enabled purple "Yes" under the
  cursor.
- Effect: state communication without extra UI (no borders/icons/copy needed).
- Fails: relying on hover-only affordances on touch devices.
- Transfer: define all four states per interactive token in the design system (base, hover
  +light, press −light, disabled desaturated); they cost almost nothing to maintain.

## Creator tendencies observed (feeds creator-profiles.md)

- Same "mistake listicle + live fix" format as video-01, but this one stays on ONE app and
  ONE quality (color) — depth over breadth; numbered chapters mirror the title's "7".
- Color philosophy consistent with L01-2 ("never let AI choose colors"): here it becomes a
  formal system — 60/30/10, neutral balance, semantic slots, state ramps.
- Teaches with named proof brands (Lemon Squeezy, Headspace, Mailchimp, Airbnb) and tool
  artifacts (contrast-ratio pills, annotated color wheel).
- Light-mode-native design sensibility in this episode (previous video's app was
  dark/green): neutral gray + white surfaces, purple brand, tint-instead-of-fill cards.
- Presentation: rounded phone-frame mockups on plain gray backdrop; cursor-driven Figma
  edits; concept title cards; giant end-of-video before/after pair in both modes.
- CTA at end: Figma files in the description (not accessed).

## Unverified / transcript-only observations

- Headspace orange-tinted card backgrounds (2:05–2:12): described but never framed by me;
  `t00m2m04` shows only his own purple tint result.
- Dribbble search bar reference screen (2:19–2:22): not framed; only the tinted search
  input in his app is visible in `t00m2m04`.
- Mailchimp / Airbnb palette slides (3:17–3:30): transcript-only.
- The complementary-blue CTA variant (3:15–3:17): not framed (only the orange fail/darken
  pair in `t00m3m12`).
- The storage-bar opacity variant ("feels a little bland", 2:49–2:52): not framed.
- "Red and green pop-up wouldn't fly" bad example (5:55–6:03): the specific bad pop-up was
  not framed; his fixed dialog is in `t00m6m20`/`t00m6m31`.
- Exact dark-mode grays for logo desaturation (5:29): too small to verify.
- Sponsor segment (Final Round AI, 3:34–4:06): job-application tool; treated as sponsor,
  no design lessons mined; no frame analysis.
- Frames at 4:12 and 4:57 caught talking-head shots (creator between demos) and were
  replaced; format note: he does speak to camera between sections.

## Quotable diagnostics (explicit)

- "Less is almost always more with color." (0:17)
- "These cards are burning a hole in my eye." (0:22)
- "For the most part, icons need no color... Color should be reserved for communicating
  status." (1:09–1:17)
- "It's the same idea with color, and it's called neutral balance." (1:31)
- "Almost never will you want bright colors for your background." (1:42)
- "Don't be afraid to adapt brand colors in order to accommodate good design." (3:30)
- "Getting comfortable with using more gray and less black and white is really what
  differentiates mediocre designers from professional ones." (4:46–4:53)
- "No, you shouldn't just inverse your colors from light to dark. Instead, a palette should
  be built with the goals of dark mode in mind." (5:30–5:37)
- "The purple background is undeniably more on brand. However, that draws attention to the
  button and doesn't illustrate its destructive nature. Instead, we use red." (5:48–5:55)
