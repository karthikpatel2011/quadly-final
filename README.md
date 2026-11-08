# Quadly

A web app split into two completely independent applications:

| App      | Stack                                        | Folder     | Dev URL                  |
| -------- | -------------------------------------------- | ---------- | ------------------------ |
| Frontend | React 19 (JavaScript, no TypeScript) + Vite  | `frontend/`| http://localhost:5173    |
| Backend  | Node.js ≥ 20 + Express 5 (JavaScript, ESM)   | `backend/` | http://localhost:4000    |

The two apps never share code or configs — they only talk over HTTP. The frontend calls `/api/...` and the Vite dev proxy forwards those to the backend on port 4000. Health check: `GET /api/health`.

## Run it

```bash
# terminal 1 — backend
cd backend && npm install && npm run dev

# terminal 2 — frontend
cd frontend && npm install && npm run dev
```

## Docs

- `AGENTS.md` — operating rules + tech stack contract. Read first (humans and agents).
- `DESIGN.md` — design tokens and UI rules for the frontend.

## Landing page toolkit (`frontend/`)

- QA one section at a time: run `npm run dev`, open `http://localhost:5173/?section=<name>` (hero, workflow, narrative, save-hours, backed-cta, footer).
- `node scripts/shot.mjs "<url>" out.png [full=1|0] [width]` — Playwright screenshot.
- `node scripts/crop.mjs` / `node scripts/slice.mjs` — rebuild reference crops and strips; `node scripts/extract.mjs` / `extract2.mjs` — re-sample source colors.
- The reference design (`scripts/source.jpeg`) plus crops/strips live under `frontend/scripts/` for visual comparison only — it never ships in the app.
