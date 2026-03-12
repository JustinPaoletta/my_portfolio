# My Portfolio

A React 19 portfolio site with multiple visual themes, homepage prerendering, strong SEO defaults, PWA support, and optional Vercel-backed integrations for contact, GitHub data, and pet stats.

## Live Site

[jpengineering.dev](https://jpengineering.dev/)

## Highlights

- Four presentation modes: `engineer`, `cosmic`, `cli`, and `minimal`
- Keyboard-first JP_CLI theme with command aliases and drill-in menus
- Homepage prerendering during `npm run build` for crawler-visible HTML
- Generated `sitemap.xml` and `robots.txt`
- Installable PWA with update prompts and offline asset caching
- Optional Umami analytics and New Relic browser monitoring
- Optional GitHub GraphQL proxy and Upstash-backed pet stats APIs on Vercel
- Unit tests, Playwright E2E coverage, Lighthouse CI, and bundle-size budgets

## Prerequisites

- Node.js 20 recommended
- npm

## Local Setup

1. Clone the repo.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local env file:

   ```bash
   cp .env.example .env
   ```

4. Update the required `VITE_*` values in `.env`.
5. Start the frontend dev server:

   ```bash
   npm run start:dev
   ```

6. Open `http://localhost:5173`.

`npm run start:dev` serves the frontend only. If you need the local Vercel functions under `/api/*`, run `npm run start:vercel` instead.

## Common Scripts

- `npm run start:dev` - start the Vite dev server
- `npm run start:vercel` - run the app through `vercel dev` with local serverless functions
- `npm run build` - type-check, run contrast checks, build, generate sitemap/robots, and prerender the homepage
- `npm run start:prod` - build and preview the production output on port `4173`
- `npm test` - run Vitest in watch mode
- `npm run test:unit` - run unit tests once
- `npm run test:coverage` - run unit tests with coverage output
- `npm run test:e2e` - run Playwright E2E tests locally across Chromium, Firefox, and WebKit
- `npm run lighthouse` - run Lighthouse CI locally with the checked-in config
- `npm run build:analyze` - build with bundle analysis output
- `npm run lint:ci` - type-check, eslint, and prettier in check mode
- `npm run lint:fix` - type-check, then fix lint and formatting issues

## Environment Overview

Client-side configuration lives in `VITE_*` variables and is validated in [`src/config/env.ts`](src/config/env.ts).

Server-only Vercel functions use unprefixed environment variables:

- `GITHUB_TOKEN` for `/api/github`
- `KV_REST_API_URL` and `KV_REST_API_TOKEN` for `/api/pet-dogs`
- `RESEND_API_KEY`, `CONTACT_EMAIL`, and `RESEND_FROM_EMAIL` for `/api/contact`

See [docs/ENV.md](docs/ENV.md) for the full matrix.

## Tech Stack

- React 19
- TypeScript 5.9
- rolldown-backed Vite
- Valibot for runtime env validation
- Vitest, Testing Library, and Playwright
- `vite-plugin-pwa` and Workbox
- `react-helmet-async` for runtime metadata
- Umami, New Relic Browser Agent, and Upstash Redis

## Quality Gates

- `npm run build` enforces bundle-size limits from [`vite.config.ts`](vite.config.ts) and rewrites the production homepage with prerendered HTML
- Vitest coverage thresholds are `90%` for lines, functions, branches, and statements
- Playwright can target a custom preview URL with `PLAYWRIGHT_BASE_URL`
- CI runs Chromium-only E2E tests, Lighthouse audits, and bundle-size checks

## Documentation

- [Environment variables](docs/ENV.md)
- [Vercel deployment](docs/VERCEL_DEPLOYMENT.md)
- [SEO architecture](docs/SEO.md)
- [PWA guide](docs/PWA.md)
- [Observability](docs/OBSERVABILITY.md)
- [Content Security Policy](docs/CSP.md)
- [Performance & quality gates](docs/PERFORMANCE_QUALITY.md)
- [Development workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Dependabot](docs/DEPENDABOT.md)
- [JP_CLI theme](docs/JP_CLI.md)
- [Workspace & debugging](docs/WORKSPACE_DEBUGGING.md)
- [Pet Dogs API](docs/PET_DOGS_API.md)

## License

Private project.
