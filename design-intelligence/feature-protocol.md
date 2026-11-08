# Quadly feature-build protocol (sub-agent contract) — 2026-10-28 sprint

You are building ONE feature of the signed-in Quadly dashboard (student product).
Time-boxed sprint: correctness first, no broken shells. Work autonomously; do not ask questions;
record assumptions in your final message.

## File ownership (STRICT — edit ONLY these)

- Frontend page: `frontend/src/components/pages/<Feature>Page.jsx` (+ `<feature>.css`)
- Backend route: `backend/src/routes/<feature>.js` (stub exists; replace its content in place)
- Backend data: `backend/data/<feature>.json` (seed exists)

NEVER edit: `app.js`, `Dashboard.jsx`, `dashboardConfig.js`, `tokens.css`, `lib/api.js`, any
other agent's files, or anything in `design-intelligence/`. If you believe another file needs a
change, note it in your final message instead.

## Backend rules

- `backend/src/routes/dashboard.js` is the pattern reference (resolveSession via Bearer token,
  per-student file persistence to backend/data/*.json, JSON everywhere).
- Every endpoint requires the session token (401 otherwise). All per-student state lives under
  the student's email: `{ [email]: {...} }` inside your data file. Two students must never see
  each other's data.
- Routes are already mounted at `/api/<feature>` from `app.js` — do not change app.js.
- Keep responses fast (file I/O fine). Deterministic seeds (hash like dashboard.js) over randomness.

## Frontend rules

- Page component signature: `export default function XPage({ payload, onNavigate })` — payload is
  the /api/dashboard payload (email, name, college, target, github, avatar, missions, streak,
  totalDone, score, map, history, chat, aiOnline, asksToday, askCap); onNavigate(routeId) switches
  dashboard routes. Render inside the shell — do NOT add your own page chrome (sidebar/topbar).
- Auth header helper (copy this into your page file):
  `const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('quadly:token') || '') });`
- GET data on mount per section with loading skeleton, error state + Retry, and an honest empty
  state when there is no data yet (NEVER fabricate numbers; dashes/null are fine).
- Styling: consume ONLY design tokens from styles/tokens.css (`--qd-*`, `--color-*`, `--chip-*`,
  spacing/radius tokens). Class prefix `qd-<feature>-`. 4/8 spacing; 4 text sizes; ≤2 font
  weights; mono (ui-monospace) for numerics/IDs. Semantic colors rationed (red only for
  destructive/errors). Dark theme is default (tokens); never hardcode raw hex except via tokens.
- Accessibility: labelled controls, focus-visible works via app root, aria-current on lists,
  roles for interactive lists. Keyboard first.

## Bars of quality

- The 33 existing frontend tests + backend tests must stay green (run `npm test` in frontend and
  `node --test tests/` in backend — if YOUR files break them, fix YOUR files).
- `npm run build` in frontend must pass with your page included (page compiles standalone).

## Deliver

Write the two/three files, run the builds/tests, and reply with: endpoints added, page
behavior, storage shape, assumptions, anything you could not finish.
