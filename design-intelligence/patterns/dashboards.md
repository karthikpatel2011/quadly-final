# Pattern: Dashboards & analytics

Evidence: video-01 (dashboard redesign, frames t00m0m47→t00m1m57, t00m4m55→t00m5m24),
video-09 (dark fintech "Meridian", state ladder), video-07 (filters-as-decision-support),
video-02 (state matrices). 

## Layout rules (verified before/after pairs)

1. **Kill the repeated KPI row** — same stats never appear on multiple pages; each surface shows
   only the data that drives ITS decision (01 L01-3; billing/analytics "toss these KPIs").
2. **Sidebar**: grouped left rail (uppercase micro-labels), task-relevant items only, NO global
   stat tiles, max ONE account element (card → popover), add missing destinations (Analytics)
   (01 t00m1m17→t00m1m40/t00m1m45).
3. **Rows**: identity (name, monospace for IDs/URLs) + status pill + one copy chip; meta as small
   icon+text; ALL row actions in a "⋮" overflow; counts right-aligned (01 t00m1m57).
4. **Charts by question** (01 L01-9): trend→area/line with gradient fill; compare links→
   multi-series with toggle ("split into individual links") + legend; share→doughnut/gauge;
   geography→dot-matrix map + ranked table with flags; sources/browsers→table with brand icons +
   counts + %.
5. **Card headers carry controls**: date-range picker + export icon live in the chart card
   header (01 t00m5m05), not the page header.
6. **Filters = decision support** (07 staff level): live result counts on CTAs ("Show 41 homes"),
   per-option counts, exact-number escape hatch, histogram inside the price control, median
   marker, budget→price-limit projection ("Up to $10,550 a month" placed ON the histogram).
   Density only when it changes a decision in place.
7. **Color discipline** (01/09): near-black surface scale; ONE warm accent = the CTA; semantic
   series colors; desaturated content, vivid accents (H-K effect); 50–900 state ladder
   (600/700/800/200/300).

## Settings/billing (01)
- Tabs per concern (Usage/Billing/Account); usage as two-column (message+CTA left, metric rows
  with progress rings right); plans per patterns/landing-pages.md §3; dead cards deleted.

## Metrics that make it "pro" (01 5:28)
Small additions, big perceived depth: progress rings, sparklines in KPI tiles, brand icons in
tables, country flags, "Create Report". Each addition must map to a real question a user asks.

## Failure modes (from sources)
- KPI strips repeated 3× (AI tell) · rainbow pastel tiles · full-width bar chart with no
  controls · filters with no feedback (7 taps, no counts — 07 junior level).
