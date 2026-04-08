# Vercel Deployment

This repo is already configured for Vercel. The source of truth is `vercel.json`.

## Current Vercel Configuration

- Build command: `npm run build`
- Build output lands in `dist/`
- Root `api/*.ts` files are Vercel Functions
- Asset rewrites and explicit manifest handling live in `vercel.json`
- CSP, caching, and security headers are defined in `vercel.json`

`npm run build` includes the prerender step from `scripts/prerender.ts`. That script attempts to launch Chromium and will keep the Vite-generated `dist/index.html` if the browser cannot start because of missing system dependencies. Set `SKIP_PLAYWRIGHT_PRERENDER=1` if you want to skip prerendering intentionally.

## Required Environment Variables

### Client-side `VITE_*`

At minimum, set:

- `VITE_APP_TITLE`
- `VITE_APP_DESCRIPTION`
- `VITE_API_URL`
- `VITE_GITHUB_URL`
- `VITE_LINKEDIN_URL`
- `VITE_EMAIL`
- `VITE_GITHUB_USERNAME`

Optional client-side integrations:

- `VITE_SITE_URL`
- `VITE_ENABLE_ANALYTICS`
- `VITE_UMAMI_WEBSITE_ID`
- `VITE_ENABLE_ERROR_MONITORING`
- `VITE_NEWRELIC_*`
- `VITE_GITHUB_API_ENABLED`

### Server-only variables for Vercel functions

Set these only if you use the related endpoint:

- `GITHUB_TOKEN` for `/api/github`
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` for `/api/pet-dogs`
- `RESEND_API_KEY`, `CONTACT_EMAIL`, and `RESEND_FROM_EMAIL` for `/api/contact`

## Branch Deployment Rules

`vercel.json` does not override `git.deploymentEnabled`, so Vercel’s default applies: **preview deployments run for all connected Git branches** ([Git configuration](https://vercel.com/docs/project-configuration/git-configuration)).

To limit deployments to specific branch patterns, add a `git.deploymentEnabled` object to `vercel.json`.

## Recommended Deploy Flow

1. Make sure the app builds locally:

   ```bash
   npm run build
   npm run start:prod
   ```

2. Import the repo into Vercel.
3. Confirm the Vercel project uses the checked-in `vercel.json`.
4. Add the required environment variables.
5. Trigger a deployment.

## Local Parity

To test the Vercel functions locally, use:

```bash
npm run start:vercel
```

That is the closest local equivalent to the deployed environment.

## Domain Changes

If the production origin changes:

1. update `VITE_SITE_URL`
2. redeploy so `sitemap.xml` and `robots.txt` are regenerated
3. update the hard-coded SEO origin values in:
   - `index.html`
   - `src/config/seo.ts`

## Related Files

- `vercel.json`
- `docs/ENV.md`
- `docs/CSP.md`
- `docs/PWA.md`
- `docs/SEO.md`
