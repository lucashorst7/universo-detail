# PR-032 — Production Deployment Readiness

## Objective

Prepare the current Vite SPA for a production deployment on Vercel backed by Supabase.

## Changes

- Added `vercel.json` with explicit Vite build/output settings.
- Added filesystem-first SPA fallback so deep routes resolve to `index.html`.
- Added long-lived immutable cache headers for hashed assets.
- Added no-cache behavior for `index.html`.
- Added baseline security headers.
- Added `.vercelignore` to avoid uploading local and generated files.
- Added `npm run deploy:check` to validate production variables and migration inventory.
- Added a production publication runbook in `DEPLOYMENT.md`.

## Required production variables

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL`

## Validation

```bash
npm ci
npm run check
VITE_SUPABASE_URL=... \
VITE_SUPABASE_ANON_KEY=... \
VITE_SITE_URL=... \
npm run deploy:check
```
