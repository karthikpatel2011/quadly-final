# Responsive Design — consolidated principles

Sources: S10 (measure-first), S06 (mobile buy patterns), S02 (grid discipline), S12B
(fill/hug + individual paddings + constraints responsive card build). Classes: **[G]**, **[R]**,
**[C]**, plus our own practice-verified items marked **[P]** (from practice/01).

## Rules
- **Lock the measure, flex margins**: set max-widths by characters; breakpoints serve the
  measure, not device lists. [G]
- **Mobile commerce**: sticky title + sticky buy bar; primary action always reachable; quantity
  presets derived from data. [C: S06, generalizable to action bars]
- **Nav simplification plan** at ≤960px: links collapse, ONE compact CTA survives; grid columns
  will wrap a button into a 3-line block otherwise. [P]
- **Overlay drawers** need a backdrop click-to-close plus close-on-navigate, never only an X
  that the panel itself may cover; assert all close paths. [P]
- **Headline rescaling**: display size steps down on narrow viewports (54→40px verified);
  two-line target preserved. [P]
- **Table de-gridding on mobile**: hide secondary columns (keep identity + status), keep pills
  readable; don't shrink all columns. [P, consistent w/ S01 rows]
- **Figma implementation**: fill-container widths, individual opposing paddings, absolute +
  pin constraints for floating art; hug vs fill chosen per element intent. [C]
- **Test at both extremes** (390 + 1440 at minimum) before shipping any claim of "responsive". [P]

## Unresolved from sources
- The videos demonstrate desktop and mobile END STATES but don't teach a breakpoint system —
  treat concrete breakpoints as project decisions [`outside-source` best practice: content-driven].
