# Quadly — setup & operations

Everything the app needs beyond `npm install` is configuration in `backend/.env`.
Copy `backend/.env.example` → `backend/.env` and fill it in (the real values are
already in the project's `backend/.env` on this machine).

## Run it

```bash
# backend (auto-reloads on file changes)
cd backend && npm run dev        # → http://localhost:4000

# frontend
cd frontend && npm run dev       # → http://localhost:5173
```

Production build: `cd frontend && npm run build` + serve `dist/` with the
standard SPA fallback (all paths → index.html). The backend serves `/api/*`.

## Routes (frontend — clean paths, no hashtags)

/ (landing) · /join (Try Now / login) · /onboarding · /ambassadors ·
/careers · /privacy · /terms · /admin (not linked from any public page)

## Admin panel

Open `http://localhost:5173/admin` and sign in with the credentials in
`backend/.env` (`ADMIN_EMAIL` / `ADMIN_PASSWORD`). From there you control:

- **Applications** — ambassador applications (approve / reject / promote to roster)
- **Profiles** — finished onboarding profiles (read-only)
- **Roster** — ambassadors whose colleges are matched by the onboarding lookup (remove)
- **Careers** — publish / close / edit roles for the public /careers page
- **Mail** — compose and send mail, see delivery status and history

## Mail delivery (the one thing you must configure)

The admin mail center works immediately, but mail is stored as **queued**
until real SMTP credentials exist. To switch on delivery, add to
`backend/.env`:

```
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your-login
SMTP_PASS=your-password
MAIL_FROM="Quadly <hello@quadly.in>"
```

Save and restart the backend — queued mail delivers the moment SMTP works.
With SMTP_HOST etc. left empty, nothing is sent to any third-party mail service.

## Supabase (database + auth, provisioned)

Credentials are in `backend/.env` (`DATABASE_URL`, `SUPABASE_URL`,
`SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`, `SUPABASE_JWKS_URL`).
Current state: the beta stores accounts/applications/profiles in
`backend/data/*.json`; the Supabase connection is verified and ready for the
table migration. See AGENTS.md for the full contract.

## Ambassador matching (LLM plug point)

The onboarding flow matches colleges to ambassadors even without an LLM
(exact + name-variant matching). To enable LLM matching for messier inputs,
add to `backend/.env`:

```
LLM_API_KEY=...
LLM_API_URL=https://api.openai.com/v1/chat/completions   # or any compatible endpoint
LLM_MODEL=gpt-4o-mini
```

## Where data lives (beta)

| Data | File |
| --- | --- |
| Registered accounts (email, password, onboarding flag) | in-memory (resets on backend restart) |
| Ambassador applications | `backend/data/ambassador-applications.json` |
| Finished onboarding profiles | `backend/data/onboarding-profiles.json` |
| Ambassador roster (used by the onboarding lookup) | `backend/data/ambassadors.json` |
| Careers | `backend/data/careers.json` |
| Mail center outbox | `backend/data/mail.json` |

All of this is slated to move onto Supabase — see AGENTS.md.

## Legal pages

`/privacy` and `/terms` are complete (GDPR + India DPDP Act 2023). Every
fact that still needs your confirmation is rendered as an amber placeholder
chip on the page — search `LegalPage.jsx` for remaining ones. Facts already
filled in: legal entity **Quadly**, contacts **privacy@quadly.in** (data
protection) and **hello@quadly.in** (general), hosting **AWS Mumbai
(ap-south-1), India**, minimum age **18**, technical-log retention **90 days**.

## Verification shortcuts

```bash
curl http://localhost:4000/api/health            # backend up
curl http://localhost:4000/api/careers           # open roles (public)
node frontend/scripts/e2e-onboarding.mjs         # full onboarding e2e
node frontend/scripts/e2e-email-roundtrip.mjs    # register → onboarding → document
```
