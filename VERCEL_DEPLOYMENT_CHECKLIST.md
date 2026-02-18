# Vercel Deployment Checklist (Monorepo)

Use this checklist when you see `NOT_FOUND` or when the UI is not loading after deploy.

## 1) Create two separate Vercel projects

- `secure-tx-web` (for UI)
- `secure-tx-api` (for backend)

Do **not** deploy both apps as a single project root unless you intentionally built a single combined app.

Keep root `vercel.json` neutral (no app-specific build/install/output settings). Put app-specific settings in:

- `apps/web/vercel.json`
- `apps/api/vercel.json`

## 2) Configure Web project (UI)

- Project root directory: `apps/web`
- Framework preset: `Next.js`
- Build command: leave default
- Install command: leave default (or `pnpm install --frozen-lockfile`)
- Keep `apps/web/vercel.json` as the web config

Environment variables:

- `NEXT_PUBLIC_API_URL=https://<your-api-domain>`

Expected result:

- Opening the web deployment URL should render the UI (not `NOT_FOUND`).

## 3) Configure API project

- Project root directory: `apps/api`
- Keep `apps/api/vercel.json` as the API routing config

Environment variables:

- `CORS_ORIGIN=https://<your-web-domain>`

Expected result:

- `GET /health` returns `{ "status": "ok" }`
- `POST /tx/encrypt` returns `{ id, encrypted }`

## 4) Remove stale command overrides

In each Vercel project, go to **Settings → Build & Development Settings** and clear old custom commands like:

- `cd ../.. && pnpm install`
- `cd ../.. && pnpm build ...`

These commands are the common cause of monorepo path failures and `No package.json found in /`.

## 5) Validate before shipping

- Run `pnpm check:vercel` from repo root.
- Confirm deployed commit is the latest commit.
- Web URL opens UI.
- API URL `/health` responds `200`.
- UI can run Encrypt → Fetch → Decrypt against API.

## Quick diagnosis map

- `NOT_FOUND` on web root URL: web project points to wrong root directory.
- Build log shows `cd ../..`: stale Vercel override commands still active.
- UI loads but API calls fail: `NEXT_PUBLIC_API_URL` not set to API deployment URL.
- API works locally but fails from UI: `CORS_ORIGIN` missing/incorrect.
- `No Output Directory named "dist"`: web project has Output Directory override set to `dist` (clear it, or set to `.next`).
- Logs show `@repo/api:build` but no `@repo/web:build` in web deploy: web Build Command is wrong/overridden.
- API deployment URL returns `NOT_FOUND` on `/tx/...`: try `/api/tx/...` (or deploy latest code with dual route support).

## If you see "No Output Directory named dist"

1. Open **Web project → Settings → Build & Development Settings**.
2. In **Output Directory**, remove `dist`.
3. Leave it blank (recommended for Next.js) or set `.next`.
4. Confirm **Root Directory** is `apps/web`.
5. Redeploy latest commit.
