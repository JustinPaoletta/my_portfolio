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

## Scripts

### Dev and Build

- `npm run start:dev` - start the Vite dev server for the frontend only
- `npm run start:vercel` - run the app through `vercel dev` when you need local `/api/*` functions
- `npm run build` - type-check, run contrast checks, build, generate sitemap/robots, and prerender the homepage
- `npm run build:analyze` - run the production build with bundle analysis output
- `npm run start:prod` - build and preview the production output on port `4173`
- `npm run type-check` - run the TypeScript project build in no-emit mode
- `npm run type-check:watch` - keep the TypeScript project build running in watch mode
- `npm run contrast:check` - run the custom contrast audit in `scripts/contrast-check.ts`
- `npm run prerender` - prerender the built homepage with `scripts/prerender.ts`; usually run via `npm run build`
- `npm run generate:icons` - regenerate the PNG icon set from the source SVG for favicons and PWA assets

### Linting and Formatting

- `npm run lint` - alias for `npm run lint:ci`
- `npm run lint:ci` - type-check, run ESLint, and verify formatting with Prettier
- `npm run lint:fix` - type-check, then auto-fix ESLint and Prettier issues where possible

### Tests and Audits

- `npm test` - run Vitest in watch mode
- `npm run test:unit` - run the Vitest suite once
- `npm run test:ui` - open the Vitest UI
- `npm run test:coverage` - run Vitest once with coverage output
- `npm run test:coverage:ui` - open the Vitest UI with coverage enabled
- `npm run test:a11y` - run the accessibility unit and Chromium E2E checks together
- `npm run test:a11y:unit` - run axe-backed Vitest accessibility coverage for the app shell and custom UI
- `npm run test:a11y:e2e` - run the tagged accessibility Playwright flows in Chromium
- `npm run test:e2e` - run Playwright E2E tests locally
- `npm run test:e2e:debug` - run Playwright in debug mode
- `npm run test:e2e:ui` - open the Playwright UI runner
- `npm run test:visual` - run the Chromium-only visual regression suite against committed baselines
- `npm run test:visual:update` - accept intentional screenshot changes on the current platform
- `npm run test:visual:update:linux` - refresh the Linux baselines in the pinned Playwright Docker image
- `npm run lighthouse` - run Lighthouse CI locally with the checked-in config

### Release and Maintenance

- `npm run prepare` - install or reinstall Husky git hooks after dependency setup
- `npm run changeset` - create a `.changeset/*.md` file describing the next patch, minor, or major release
- `npm run version-packages` - apply pending changesets locally by updating package versions and changelog entries
- `npm run clean:cache` - remove generated build, coverage, Lighthouse, and Playwright cache/output folders
- `npm run nuke` - remove dependencies, build artifacts, caches, reports, and local Vercel state for a full reset

Every normal PR into `master` should include a changeset file. PRs with a real `patch`, `minor`, or `major` changeset update the release PR, and merging that release PR creates the bare semver tag and GitHub Release automatically. PRs that carry only empty changesets are allowed for workflow, docs, or maintenance work, but they do not open a new release PR or publish a new version. The release workflow mints a short-lived GitHub App installation token from the repository variable `CHANGESETS_APP_ID` and repository secret `CHANGESETS_APP_PRIVATE_KEY` so bot-created release PRs still trigger the required PR checks. Release details and hook behavior are documented in [docs/DEVELOPMENT_WORKFLOW.md](docs/DEVELOPMENT_WORKFLOW.md).

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
- CI runs accessibility unit tests, Chromium-only E2E tests, Linux Chromium visual regression, Lighthouse audits, and bundle-size checks
- Visual regression usage, baseline policy, and contributor workflow are documented in [docs/VISUAL_REGRESSION.md](docs/VISUAL_REGRESSION.md)

## Documentation

- [Accessibility contract](docs/ACCESSIBILITY.md)
- [Accessibility manual testing](docs/ACCESSIBILITY_MANUAL_TEST.md)
- [Environment variables](docs/ENV.md)
- [Vercel deployment](docs/VERCEL_DEPLOYMENT.md)
- [SEO architecture](docs/SEO.md)
- [PWA guide](docs/PWA.md)
- [Observability](docs/OBSERVABILITY.md)
- [Content Security Policy](docs/CSP.md)
- [Performance & quality gates](docs/PERFORMANCE_QUALITY.md)
- [Visual regression testing](docs/VISUAL_REGRESSION.md)
- [Development workflow](docs/DEVELOPMENT_WORKFLOW.md)
- [Dependabot](docs/DEPENDABOT.md)
- [JP_CLI theme](docs/JP_CLI.md)
- [Workspace & debugging](docs/WORKSPACE_DEBUGGING.md)
- [Pet Dogs API](docs/PET_DOGS_API.md)

## License

Private project.
