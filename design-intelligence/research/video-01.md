# Research Notes — Video 01

## Identity (verified via yt-dlp metadata + viewed content)

- URL: https://youtu.be/PDcQJOPby1k
- Title: "5 SaaS UI/UX mistakes that SCREAM you Vibe Code"
- Creator: Kole Jain (individual product designer)
- Duration: 6:32 · Published: 2026-02-12 · Views: ~202k
- Classification: standalone redesign tutorial (not the course)
- Access: transcript (En auto-captions) + 26 frames viewed at 720p from full video
- Subject: redesigns "LinkGuard", an AI-vibe-coded URL shortener (dashboard, billing, analytics, landing)

## Structure (chapters verified in metadata)

0:00 Redesigning a URL shortener → 0:18 UI & styling → 0:42 layout → 2:00 link creation →
2:24 (sponsor break) → 3:24 billing & plans → 4:49 analytics → 5:36 landing pages

## Teaching format

Fast-cut before/after Figma rebuild narrated as a list of "AI tells". The five titled
mistakes: (1) emoji icons, (2) AI-chosen colors, (3) duplicated KPIs, (4) AI-chosen/inserted
layout patterns, (5) vibe-coded landing page quality. The video walks all product surfaces.

## Lesson log

### L01-1 Emoji icons read as amateur; use one professional icon family
- Problem: Vibe-coded apps decorate cards with emoji → toy-like.
- Decision [transcript 0:27–0:39]: Replace with a professional interface icon set. Prefers
  **Phosphor**; says Lucide or any consistent library works. Accepts Notion as an emoji exception.
- Evidence: frame `t00m0m33` — card header link icon + "Verified Safe" pill with check icon =
  post-swap state.
- Implementation: single family, uniform stroke/weight, tinted via CSS (color from theme).
- Effect: immediate credibility lift at near-zero cost.
- Appropriate: product UI, dashboards, marketing. Fails: intentionally playful consumer brands.
- Transfer: any project — one icon family everywhere; no mixed emoji/favicon-style glyphs.

### L01-2 Never let AI pick colors; dark surface + one accent, color belongs to data
- Problem [transcript 0:40–0:47]: "AI always go[es] for bright colors that don't really work
  well together"; pastel icon-tinted KPI cards everywhere.
- Decision: dark blue → **dark green** surface tint; remove rainbow icon colors; recolor KPI
  tiles; add micro sparkline charts.
- Evidence: `t00m0m47` (before: 4 pastel-icon KPI cards) → dashboard after: near-black surfaces,
  green accent reserved for CTAs/brand, charts carry the color. `t00m1m10` shows his
  "BASIC vs PRODUCT" slide: basic = purple bar chart on a white card with random swatches;
  product = dark panel, multi-series line chart with **semantic series colors** (2XX blue,
  3XX amber, 4XX red).
- Implementation: neutral surface scale (bg → card → border), one brand accent for actions,
  data series get semantic/categorical colors.
- Effect: chrome recedes, data stands out, "beginnings of a professional dashboard" (1:05).
- Fails: light-theme products (hue logic must be translated, not copied); brands whose identity is colorful.
- Transfer: default to "color = meaning", never "color = decoration".

### L01-3 Duplication is the AI tell — show data once, in the right place
- Problem [transcript 1:13–1:24]: the same 4 KPIs appear "not once, not twice, but three times
  in a small app" (dashboard, billing, analytics).
- Decision: each surface shows only what is relevant to it; delete repeated KPI strips.
- Evidence: frames `t00m3m30` (billing before: KPI tiles strip) → `t00m3m47` (after: usage rows
  instead); `t00m4m55` analytics before → "toss these KPIs" (4:51).
- Effect: shorter pages, faster scanning, name-value communication replaces decoration.
- Transfer: audit every screen for repeated modules; a stat belongs to the decision it serves.

### L01-4 Sidebar must be task-relevant navigation, not a stats dump
- Problem [transcript 1:24–1:51]: global stat tiles at the top of the sidebar are useless on
  pages like Teams/Custom Domains; nav cluttered; AI-typical "gradient profile circle with a
  letter"occupying the corner.
- Decision: left-align + tighten nav; group labels; **add the missing Analytics item**;
  remove stat tiles; replace gradient avatar with a functional account card; tuck account
  links into a click-popover; collapse Settings/Billing/Usage together.
- Evidence: `t00m1m17` (before: LINKS/CLICKS tiles + purple gradient circle "J" in a full-screen
  dashboard) vs `t00m1m40` (after: Platform group with Analytics added, no tiles) and `t00m1m45`
  (after: bottom "My Account" card with icon + chevron).
- Implementation: uppercase group micro-labels; icon+label rows; single account affordance that
  opens a popover with the secondary links.
- Effect: nav communicates IA; vertical budget goes to content.
- Fails: products where per-user status in the rail is genuinely task-critical.
- Transfer: on every page ask "does each rail element help THIS task?"

### L01-5 Collapse complexity in data rows: overflow menu, icon chips, aligned meta
- Problem [transcript 1:53–2:02]: link cards "feeling busy" — 3 always-visible buttons
  (Analytics/QR Code/Delete), text chips, date, clicks all competing.
- Decision: name in **monospace** + status pill + copy chip; secondary info as small icon+text
  lines; actions collapsed into a "⋮" overflow; date centered; clicks right-aligned.
- Evidence: `t00m1m57` (after rows, count "2 Active Links" right-aligned in header) vs
  `t00m0m47`/`t00m1m17` (before, 3 buttons per row).
- Effect: scannable list; destructive actions de-emphasized; visual reading line left→right
  (identity → status → meta → actions).
- Transfer: list rows are a hierarchy problem: primary = identity, secondary = meta, tertiary = actions.

### L01-6 Container should match content volume: sparse page → modal with progressive disclosure
- Problem [transcript 2:04–2:16]: create-link page "pretty sparse with fields even though we
  have a ton of space"; advanced options always open.
- Decision: move the flow into a **panel/modal**; collapse Advanced Options by default with a
  one-line hint row ("Want branded links? Add a custom domain. — Configure"); add missing
  fields (custom-domain switcher, description); later versions use segmented chips
  (Password / Targeting / Expiration).
- Evidence: `t00m2m10` (slide-over panel version) and `t00m2m22` (centered modal: 2-col grid —
  Destination URL + Title, Short Link + Description; password chip; green primary CTA).
- Reasoning (explicit 2:25–2:33): this layout "allows for more features to easily slot in"; and
  the largest gains come from layouts/cards because "AI is generally pretty bad at putting
  together complex layouts".
- Fails: forms whose "advanced" fields are actually always needed.
- Transfer: pick form container by field count × frequency; disclose advanced settings, don't hide essentials.

### L01-7 Delete dead modules; organize settings pages by tabs per concern
- Problem [transcript 3:27–3:43]: "this card doesn't do anything. And that's a pattern you're
  going to see a lot with AI" (Current Plan card); plus a decorative "Choosing the Right Plan"
  explainer and vibe-KPI tiles.
- Decision: retitle page to Settings; tabs **Usage / Billing / Account**; Usage tab = two-column
  layout (message + Upgrade left; metric rows with small progress rings right); later add
  billing email + payment method; explicit: design so "as things scale... easy to add another
  tab" (documents, integrations, AI).
- Evidence: `t00m3m30` (before with dead card + 5-plan row) vs `t00m3m47` (after tabs + rings).
- Effect: every module earns its place; page scales.
- Transfer: a card with no interactivity or critical info should not exist; tabs per concern beat one long scroll.

### L01-8 Pricing cards: cut plans, shrink name, enlarge price, surface discounts and deltas
- Problem [transcript 3:49–4:12]: five plans; Standard $2 < Hobby $3 explained only by an
  unlabeled discount; plan NAME was the biggest text; "no one cares about that".
- Decision: drop Hobby (→4 plans); rename top tier Business→**Enterprise** with Custom price
  (explicit 4:21–4:25: "if you need 50,000 links/month, you probably need more"); plan name
  small (centered), **price huge**; show the actual discount; show what the NEXT plan includes
  that current lacks ("Upgrade to Standard" buttons with delta lists).
- Evidence: `t00m3m58` (zoomed mid-edit: Team $10 Early Adopter + arrow annotations), `t00m4m20`
  (after: 4 cards, big prices, disabled Current Plan), `t00m4m33` (reference slide: Resend-style
  "Predictable pricing, designed to scale" — FREE/PRO/TEAM/ENTERPRISE, "From $25/month", overage
  lines "then $0.00325 per MAU", "Everything in the Pro Plan, plus:" checklists).
- Effect: comprehension + upgrade motivation; pattern credibility from named products (Resend, Supabase).
- Transfer: price is the hero; overage transparency earns trust; deltas sell the next tier.
- [interp] His plan-card anatomy mirrors Dub.co/Resend conventions (centered micro-name, XL price,
  feature checklist, single CTA) — he names Resend/Supabase but not Dub.

### L01-9 Analytics is the "wow surface": richness + structure, low-hanging-fruit features
- Problem [transcript 4:49–5:34]: boring single bar chart; repeated KPIs + tabs; missing
  obvious, genuinely useful features.
- Decision: area chart with gradient fill; per-link comparison via a "split into individual
  links" toggle (color-coded series + legend: apple.com blue / linear.app magenta / kolejain.com
  amber); device gauge (arc, 1735 clicks, Monitor/Laptop/Mobile/Tablet); source & browser tables
  with **brand icons** + clicks + % columns; demographics: dot-matrix world map + country table
  with flags; date-range + export in card header; "Create Report" action.
- Evidence: `t00m4m55`/`t00m5m05` (before/after chart), `t00m5m15` (multi-series + locations rows
  + devices doughnut), `t00m5m24` (gauge, source/browser tables, dot-map).
- Implementation: categorical colors per series; icon libraries for brands; part-to-whole as
  gauge/doughnut, ranking as table+bar hybrid.
- Effect (explicit 5:28–5:34): "such a big change just by changing a few charts and adding in
  some icons" — perceived product depth.
- Fails: data-density without real functionality; decorative charts that answer no question.
- Transfer: pick chart type by question (trend→line/area, share→doughnut/gauge, compare→colored
  series, geography→map); iconography adds scannability + color without noise.

### L01-10 Landing pages: presentation over complexity — use the real product as the graphics
- Problem [transcript 5:36–5:52]: "standard of quality on SaaS landing pages that establishes
  trust, even subconsciously"; icon-card template sections lose customers.
- Decision: hero with kinetic **skewed/flying link-row cards** built from the actual dashboard
  row design; feature sections replace icon cards with **real app UI screenshots** (the
  password-protection create-flow, the analytics page) beside benefit copy.
- Evidence: `t00m5m55` (hero: "Shorten links. Expand your reach.", large two-line headline,
  inline URL input + "Shorten It →" button, tilted link cards with motion blur, strikethrough
  limited-time pricing), `t00m6m05` (feature split: real form UI left, "Password Protection"
  headline + Learn more right), `t00m5m40` (generic icon-card section pre-revamp).
- Reasoning (explicit 6:07–6:12): "Landing pages aren't about complexity, they're about
  presentation. And generally, the better the presentation, the better the conversion."
- Effect: trust + conversion.
- Fails: product screenshots that expose unfinished UI; motion that obscures the offer.
- Transfer: marketing assets should be derived FROM the product (export real screens, restyle
  them); headlines short; hero offers one input action when the product is input-driven.

### L01-11 Ship the cheap, high-value feature (meta)
- Problem [4:57–5:12]: obvious features missing entirely.
- Decision: add "split into individual links" toggle — "something super easy to implement and
  genuinely useful."
- Effect: perceived sophistication via usefulness, not decoration.
- Transfer: before adding visual flourish, list 3 "easy + useful" features the UI should expose.

## Creator tendencies observed (feeds creator-profiles.md)

- Dark, near-black surfaces with a single green accent; color reserved for data/brand.
- Monospace type for URLs/identifiers; sans for everything else.
- Phosphor icon set; brand icons for sources/browsers.
- Resend/Dub/Supabase-style pattern vocabulary, cited by name when teaching.
- Presentation: browser-window mockups with rounded corners on a textured wallpaper backdrop; heavy use of before/after wipes.
- Teaches by "mistake lists" with sharp, quotable diagnostics ("this card doesn't do anything").

## Unverified / not analyzed

- Sponsor segment (Builder.io) not treated as design teaching: transcript-only note that its
  message is Figma→code workflow; no frame analysis performed.
- Exact Figma technique (frames, component setup) not shown in speech; only result screens verified.

## Quotable diagnostics (explicit)

- "Never let an AI choose any of your colors." (0:41)
- "Never let an AI choose your layout either." (1:24)
- "This card doesn't do anything." (3:29)
- "Drop the size of the name since no one cares about that. Increase the size of the cost per
  month since people do care about that." (4:14–4:19)
- "Landing pages aren't about complexity, they're about presentation." (6:07)
