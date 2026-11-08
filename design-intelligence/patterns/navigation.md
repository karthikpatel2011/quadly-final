# Pattern: Navigation & information architecture

Evidence: video-01 L01-4/5 (sidebar rebuild, frames t00m1m17/t00m1m40/t00m1m45), video-07
(junior→staff filter ladders), video-06 (mobile sticky bars), video-10 (serial positioning).

## Rules

1. **Sidebar shows task-relevant destinations only.** Stat tiles in the rail fail: they're
   irrelevant on half the pages (Teams/Settings) and duplicate the dashboard (01).
   Left-align items, tighten spacing, group under uppercase micro-labels.
2. **One account element.** Replace avatar-circle + link stack with a single account card that
   opens a popover (billing/usage/settings tucked inside) (01 t00m1m45).
3. **Group semantics**: platform vs organization vs account are different sections; a missing
   destination (Analytics) is an IA bug, not a feature gap (01 1:35).
4. **Destructive & rare actions collapse** into overflow menus — in lists ("⋮" per row) and
   in chrome (popover) (01 L01-5, grouped with L01-4).
5. **Feedback-first controls** (07): every filtering/nav control must answer "what will this
   return?" — counts on the CTA, per-option counts, exact escape hatches; full-page filter
   takeover = junior (7 taps, zero feedback).
6. **Mobile** (06): sticky title + sticky buy bar; primary action always reachable; quantity
   presets derive from data (0.5/1/2/3 kg with per-size prices).
7. **Reading order** (10 serial positioning): context first, decision last — nav labels follow
   the user's task order, not org-chart order.

## States to design (02)
- Active (filled/accent), hover, focus-visible (ring token), disabled, loading; missing states
  are treated across sources as the amateur tell.
