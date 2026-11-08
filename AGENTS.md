# AGENTS.md — operating rules for Quadly

Read this before touching code. These rules are the contract for any agent (ZCode, Codex, Cursor, Claude, …) or human working in this repo. If your change conflicts with a rule here, either follow the rule or ask the user first. Keep this file updated when the stack changes.

## 1. Tech stack

| App      | Stack                                                         | Where      |
| -------- | ------------------------------------------------------------- | ---------- |
| Frontend | React 19, **JavaScript only** (JSX), Vite 7, plain CSS + tokens, GSAP (motion) | `frontend/` |
| Backend  | Node.js ≥ 20 (ESM), Express 5, JavaScript only                 | `backend/`  |

Package manager: **npm**, with dependencies installed separately inside each app. No monorepo tooling, no workspaces, no shared `package.json`.

## Supabase project (backend database + auth)

A Supabase project is provisioned and is the intended long-term store (the PRD's "Supabase or Postgres"; the in-memory stores and `backend/data/*.json` documents migrate onto it).

- Project ref: `chdlixefpfzgfgwsonee` — URL `https://chdlixefpfzgfgwsonee.supabase.co`, database host `db.chdlixefpfzgfgwsonee.supabase.co:5432`
- Credentials live **only** in `backend/.env` (gitignored): `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`, `DATABASE_URL`. Never paste them into any tracked file, doc, or source — not even here.
- The **publishable** key is safe for browser/public use; the **secret** key and database password are server-only (`backend/`) and must never ship to the client.
- `server.js` already loads `backend/.env` via dotenv, so `process.env.DATABASE_URL` / `process.env.SUPABASE_URL` are available to all backend code.

## 2. Hard rules

1. **JavaScript only — no TypeScript anywhere, ever.** Never create `.ts`/`.tsx` files; never add `typescript`, `tsconfig.json`, `@types/*`, or type-checking setups; never rename `.js`/`.jsx` to `.ts`/`.tsx`.
2. **Frontend and backend are completely separate apps.** No imports across the two, no shared configs, no build-step coupling. They communicate only over HTTP.
3. **API contract:** the backend owns the `/api` prefix and always answers JSON. The frontend always calls relative `/api/...` paths (the Vite dev proxy forwards them to port 4000). Health check: `GET /api/health`.
4. **Ports are fixed:** frontend `5173`, backend `4000` (backend port configured via `backend/.env`, see `.env.example`). Don't hardcode other ports or hosts anywhere else.
5. **Styling:** plain CSS driven by the design tokens in `frontend/src/styles/tokens.css`. No Tailwind, no CSS-in-JS, no component libraries unless the user explicitly asks. Colors, spacing, radii, and fonts always come from tokens — see `DESIGN.md`. **GSAP is the single approved animation library** (user-approved for page motion); don't add others.
6. **These are the only rule files.** `AGENTS.md` + `DESIGN.md` + `README.md` are the complete set. Don't create competing convention files (`.cursorrules`, `CLAUDE.md`, `.windsurfrules`, …); if a tool insists on one, make it point back here.
7. **Don't restructure the two apps** (merging folders, moving `src/`, renaming `frontend/`/`backend/`) without the user's explicit go-ahead.
8. **No dead controls.** Every button, link, and control must be connected to a real action — navigation, form submit, or a state change. If something has no behavior, don't render it. This includes the join flow: **no social login providers**; login is email + password, and registration ("Try Now") is the same email + password with an added confirm-password field.

## 3. Conventions

Frontend (`frontend/`):

- `src/components/` — React components, one per file, `PascalCase.jsx`
- `src/hooks/` — hooks named `use*.js`
- `src/lib/` — helpers, e.g. `api.js` (all HTTP goes through it)
- `src/styles/tokens.css` — design tokens, single source of truth for styling
- App entry: `src/main.jsx` renders `src/App.jsx`

Backend (`backend/`):

- `server.js` — entry point, starts the server
- `src/app.js` — builds the Express app: middleware + route mounting
- `src/routes/<name>.js` — one Express `Router` per resource, mounted under `/api` in `src/app.js`
- `backend/data/*.json` — runtime documents: `ambassadors.json` (placeholder ambassador roster) and `onboarding-profiles.json` (saved onboarding records)
- LLM plug point: the onboarding ambassador lookup calls any OpenAI-compatible endpoint when `LLM_API_KEY` (plus optional `LLM_API_URL`, `LLM_MODEL`) is set in `backend/.env`; without a key it falls back to the deterministic matcher built into the route.

## 4. Working with provided material

- Anything the user provides (a reference video, screenshots, code copied from another project) gets **rebuilt in React + plain JavaScript** inside `frontend/`. If the source is TypeScript, convert it — no `.ts`/`.tsx` files may end up in the repo.
- New work goes to the app that owns it: UI concerns → `frontend/`, data/API concerns → `backend/`.

## 5. Running and checking your work

```bash
# terminal 1
cd backend && npm install && npm run dev    # → http://localhost:4000
# terminal 2
cd frontend && npm install && npm run dev   # → http://localhost:5173
```

- `GET http://localhost:4000/api/health` (or through the proxy: `http://localhost:5173/api/health`) must return `{"status":"ok",...}`.
- Before handing work back: run `npm run build` in `frontend/` and `npm start` in `backend/` to confirm nothing is broken.
