# My Portfolio

A React 19 portfolio site with multiple presentation modes, prerendered landing content, strong SEO defaults, and optional Vercel-backed integrations for contact, GitHub data, and pet stats.

## Status

- Type: public web app
- Current version: `1.1.14`
- Hosting model: Vercel-friendly frontend with optional `/api/*` functions
- Release model: manual changelog + release branch flow documented in [RELEASE.md](./RELEASE.md)

## Quick Links

- Live site: [jpengineering.dev](https://jpengineering.dev/)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
- Release process: [RELEASE.md](./RELEASE.md)
- Contributor workflow: [docs/DEVELOPMENT_WORKFLOW.md](./docs/DEVELOPMENT_WORKFLOW.md)
- Environment reference: [docs/ENV.md](./docs/ENV.md)
- Deployment notes: [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md)

## What The Project Does

- Ships four presentation modes: `engineer`, `cosmic`, `cli`, and `minimal`.
- Prerenders the homepage during production builds so crawlers receive meaningful HTML.
- Generates SEO artifacts such as `sitemap.xml`, `robots.txt`, and structured metadata.
- Supports PWA install and offline flows plus optional analytics, GitHub, contact, and pet stats integrations.

## Tech Stack

- React 19
- TypeScript 5.9
- rolldown-backed Vite
- Vercel serverless functions for optional `/api/*` routes
- Vitest, Testing Library, Playwright, and Lighthouse CI
- `vite-plugin-pwa` and Workbox

## Repository Layout

- `src/` application UI, config, hooks, and theme logic
- `api/` optional Vercel functions
- `public/` static assets
- `scripts/` build and maintenance helpers
- `e2e/` Playwright coverage
- `docs/` operational and contributor docs

## Prerequisites

- Node.js 20 or newer
- npm

## Local Setup

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env`.
3. Fill in the `VITE_*` values you need locally.
4. Run `npm run start:dev` for the frontend-only dev server.
5. Use `npm run start:vercel` instead when you need local `/api/*` functions.

## Common Commands

- `npm run start:dev` starts the Vite frontend locally.
- `npm run start:vercel` runs the app through `vercel dev`.
- `npm run build` type-checks, validates contrast, builds the app, and prerenders the homepage.
- `npm run start:prod` builds and previews the production output.
- `npm run lint` runs the CI lint and Prettier checks.
- `npm run lint:fix` applies eslint and Prettier fixes where possible.
- `npm run test:unit` runs the Vitest suite once.
- `npm run test:e2e` runs the Playwright suite excluding visual snapshots.
- `npm run test:visual` runs the committed visual regression suite.
- `npm run lighthouse` runs the checked-in Lighthouse CI config.

## Environment & Configuration

- Client-side configuration is normalized in [`src/config/app-config.ts`](./src/config/app-config.ts) and exposed through [`src/config/env.ts`](./src/config/env.ts).
- Server-only Vercel functions use unprefixed secrets such as `GITHUB_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `RESEND_API_KEY`, `CONTACT_EMAIL`, and `RESEND_FROM_EMAIL`.
- The full variable matrix lives in [docs/ENV.md](./docs/ENV.md).

## Testing & Quality Gates

- Local baseline: `npm run lint`, `npm run test:unit`, and `npm run build`.
- Release candidates should also pass `npm run test:e2e`.
- User-facing releases with major visual or performance impact should also run `npm run test:visual` and `npm run lighthouse`.

## Deployment & Operations

- The site is designed for Vercel deployment and local Vercel emulation.
- Generated production output lives in `dist/`.
- See [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md), [docs/OBSERVABILITY.md](./docs/OBSERVABILITY.md), and [docs/PWA.md](./docs/PWA.md) for operating details.

## Release Process

- This repo now uses the same manual release model as the other application repos.
- Keep `CHANGELOG.md` updated under `## [Unreleased]` as work lands.
- Cut release branches as `release/vX.Y.Z` from the protected default branch.
- Follow the full checklist in [RELEASE.md](./RELEASE.md).

## Additional Docs

- [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)
- [docs/PERFORMANCE_QUALITY.md](./docs/PERFORMANCE_QUALITY.md)
- [docs/SEO.md](./docs/SEO.md)
- [docs/VISUAL_REGRESSION.md](./docs/VISUAL_REGRESSION.md)
- [docs/JP_CLI.md](./docs/JP_CLI.md)

## License

Private portfolio source.
