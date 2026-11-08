# Home Reference — V1 ("What should I do today, and what is new for me?")

Home is a calm personal page over data Quadly already has. There is **no
posting and no free-form feed** anywhere in this version. Design values come
from docs/DESIGN-SYSTEM.md; the day rolls at 4 am IST (lib/streaks.js).

## Columns

- Wide screens: a centered main column (about 680px) + a right column (320px).
- Tablet/mobile: one column in this order: Today, Today's challenge, Your
  college this week, Your wins, then the squad card.

## Main column (in order; any section with nothing real is hidden)

1. **Today** — greeting with first name and picture; one progress line
   ("1 of 3 done, about 35 minutes left"); the streak with the weekly freeze
   ("7-day streak · 1 freeze left"); then the day's three tasks: topic label,
   title, minutes, and a **Start** button that opens the real activity.
   Finished tasks are muted and show their verified result ("Passed 4/5").
   There is no checkbox anywhere — a task completes only when its activity
   records a verified result (Daily 15 → learn, interview attempt → interview,
   project saved → ship). All done: "You are done for today", one optional
   bonus (a mistake replay), and a line about tomorrow. No plan yet: one card,
   "Build your plan in 90 seconds". Three or more genuine missed days: a calm
   rescue line.
2. **Today's challenge** — the day's question drill with Play (or the result
   after playing), how many classmates played today, and top scorers who
   opted in ("Show my name on leaderboards" on the Profile page). Minors never
   appear, with or without consent (server rule).
3. **Your college this week** — the next Mock Drive (seats, countdown inside
   48h, Register/Enter) and admin-scheduled official items (placement-cell
   notices, ambassador events, deadlines) with a small "New" mark on items
   since your last visit. Items scoped to your college or all colleges.
4. **Your wins** — private to the student, generated only from verified data:
   streak milestones, interview self-score improvement, project doctor scores.
   Nothing is shared; the section is hidden when there is nothing.

## Right column

- **Your squad** — when in one: "N of M finished today" with a Nudge button
  per member who has not finished. When not: create (name optional) or join
  with a code, right there.
- **Openings for you** — typed adapter ready in the API; hidden until real
  matched openings exist in Launchpad. (Never job-board filler.)

## End of the page

"You're caught up" plus the next scheduled item ("Next: Mock drive · Sat,
3:00 pm IST.").

## Data rules

- Read-only adapters into Plan, Practice, drive and Squad; Home never writes
  another feature's tables. Writes on Home: the student's own avatar, the
  leaderboard-name consent, and the admin's official items (audit-logged).
- Official items live in official-items.json (college or all-colleges,
  startsAt/endsAt window, audit log in official-audit.json). "New" marking is
  per student in home-views.json (the home_item_views equivalent).
- Every section loads and fails on its own; a broken section shows its own
  error card with Retry and never blanks the page.

## Verified completion (no checkbox rule)

- Daily 15 finished → that day's learn task completes with "Passed X/5".
- A graded interview attempt → interview task ("Self-graded N/5").
- A saved project with its doctor score → ship task.
- The dashboard toggle endpoint remains for tools/tests only; no UI exposes a
  bare checkbox.
