# My Portfolio

A React 19 portfolio with four presentation modes, prerendered landing content, and static SEO metadata.
Optional Vercel functions support contact, GitHub data, and shared pet counts.

## Status

- Type: public web app
- Current version: `1.2.1`
- Hosting model: Vercel-friendly frontend with optional `/api/*` functions
- Release model: manual changelog and release branches, documented in [RELEASE.md](./RELEASE.md)
- Remaining work: owner-approved case studies, manual acceptance, and optional reliability work in [ROADMAP.md](./ROADMAP.md).

## Quick Links

- Live site: [jpengineering.dev](https://jpengineering.dev/)
- Changelog: [CHANGELOG.md](./CHANGELOG.md)
- Roadmap: [ROADMAP.md](./ROADMAP.md)
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
- three.js and `@react-three/fiber` for the engineer room and cosmic nebula/starfield
- A Blender-rendered WebP for the cosmic astronaut, with editable source and a reusable GLB
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

- Node.js 22.12 or newer within the Node 22 release line, matching the Node 22 CI jobs
- npm 11.6.4, pinned by `packageManager`
- Playwright Chromium for prerendering; Chromium, Firefox, and WebKit for the full browser suite

## Local Setup

1. Install the lockfile dependencies with `npx --yes npm@11.6.4 ci`.
2. Copy `.env.example` to `.env`.
3. Fill in the `VITE_*` values you need locally.
4. Run `npx playwright install chromium firefox webkit` for prerendering and the full browser suite.
5. Run `npm run start:dev` for the frontend-only dev server (`http://localhost:5173`).
6. Use `npm run start:vercel` instead when you need local `/api/*` functions (`http://localhost:6173`).

## Common Commands

- `npm run start:dev` starts the Vite frontend locally at `http://localhost:5173`.
- `npm run start:vercel` runs the app through `vercel dev` at `http://localhost:6173`.
- `npm run build` type-checks, validates contrast, builds the app, and prerenders the homepage.
- `npm run start:prod` builds and previews the production output at `http://localhost:4173`.
- `npm run lint` runs the CI lint and Prettier checks.
- `npm run lint:fix` applies eslint and Prettier fixes where possible.
- `npm run test:unit` runs the frontend and server Vitest suites once.
- `npm run test:e2e` runs the Playwright suite excluding visual snapshots.
- `npm run test:visual` runs the committed visual regression suite.
- `npm run test:visual:update:linux` refreshes CI snapshot baselines (requires Docker). See [Design changes](#design-changes).
- `npm run lighthouse` runs the checked-in Lighthouse CI config.

## Environment & Configuration

- Client-side configuration is normalized in [`src/config/app-config.ts`](./src/config/app-config.ts) and exposed through [`src/config/env.ts`](./src/config/env.ts).
- Server-only Vercel functions use unprefixed secrets such as `GITHUB_TOKEN`, `KV_REST_API_URL`, `KV_REST_API_TOKEN`, `RESEND_API_KEY`, `CONTACT_EMAIL`, and `RESEND_FROM_EMAIL`.
- The full variable matrix lives in [docs/ENV.md](./docs/ENV.md).

## Testing & Quality Gates

- Local baseline: `npm run lint`, `npm run test:unit`, and `npm run build`.
- Release candidates should also pass `npm run test:e2e`.
- User-facing releases with major visual or performance impact should also run `npm run test:visual` and `npm run lighthouse`.

### Design changes

If you change CSS, layout, markup, fonts, icons, images, or themes:

1. `npm run test:visual` — review failures in `playwright-report/`.
2. `npm run test:visual:update:linux` — update CI baselines (Docker required).
3. `npm run test:visual:update` — update macOS baselines (run on a Mac).
4. Commit the changed files under `e2e/visual/**/*-snapshots/`.

No Docker? Run the **Update Visual Snapshots** GitHub Actions workflow for Linux baselines only.

Details: [docs/VISUAL_REGRESSION.md](./docs/VISUAL_REGRESSION.md).

## Deployment & Operations

- The site is designed for Vercel deployment and local Vercel emulation.
- Generated production output lives in `dist/`.
- See [docs/VERCEL_DEPLOYMENT.md](./docs/VERCEL_DEPLOYMENT.md), [docs/OBSERVABILITY.md](./docs/OBSERVABILITY.md), and [docs/PWA.md](./docs/PWA.md) for operating details.

## Release Process

- Releases follow the manual process in this repository.
- Keep `CHANGELOG.md` updated under `## [Unreleased]` as work lands.
- Cut release branches as `release/vX.Y.Z` from the protected default branch.
- Follow the full checklist in [RELEASE.md](./RELEASE.md).

## Additional Docs

See the [documentation index](./docs/README.md) for maintained guides, dated records, and verification limits.

- [docs/ACCESSIBILITY.md](./docs/ACCESSIBILITY.md)
- [docs/PERFORMANCE_QUALITY.md](./docs/PERFORMANCE_QUALITY.md)
- [docs/SEO.md](./docs/SEO.md)
- [docs/OFFLINE_RELIABILITY_PLAN.md](./docs/OFFLINE_RELIABILITY_PLAN.md)
- [docs/VISUAL_REGRESSION.md](./docs/VISUAL_REGRESSION.md)
- [docs/JP_CLI.md](./docs/JP_CLI.md)
- [ROADMAP.md](./ROADMAP.md)

## License

Private portfolio source.
