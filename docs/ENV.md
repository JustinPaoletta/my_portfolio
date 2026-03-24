# Environment Variables Guide

This project validates client-side environment variables at startup with Valibot in `src/config/env.ts`. If a required value is missing or malformed, the app fails fast with a descriptive error.

## Files

- `.env.example` - committed template
- `.env` - local defaults for your machine
- `.env.local` - optional machine-specific overrides
- Vercel project settings - production and preview environment variables

Vite loads `.env` and `.env.local` automatically. The checked-in source of truth for validation is `src/config/env.ts`.

## Quick Start

```bash
cp .env.example .env
```

Then fill in the required values and restart the dev server.

## Client Variables

All browser-visible variables must start with `VITE_`.

### Required

| Variable               | Notes                                                     |
| ---------------------- | --------------------------------------------------------- |
| `VITE_APP_TITLE`       | 1-100 characters                                          |
| `VITE_APP_DESCRIPTION` | 1-500 characters                                          |
| `VITE_API_URL`         | Must be a valid `http://` or `https://` URL               |
| `VITE_GITHUB_URL`      | Must be a `github.com` URL                                |
| `VITE_LINKEDIN_URL`    | Must be a `linkedin.com` URL                              |
| `VITE_EMAIL`           | Must be a valid email address                             |
| `VITE_GITHUB_USERNAME` | GitHub login used by the GitHub section and `/api/github` |

### Optional with defaults

| Variable                       | Default                            | Notes                                                    |
| ------------------------------ | ---------------------------------- | -------------------------------------------------------- |
| `VITE_API_TIMEOUT`             | `5000`                             | Parsed as a number, must stay between `1000` and `60000` |
| `VITE_ENABLE_ANALYTICS`        | `false`                            | Accepts `true` / `false` / `1` / `0`                     |
| `VITE_ENABLE_DEBUG`            | `false`                            | Enables extra local debug logging                        |
| `VITE_ENABLE_ERROR_MONITORING` | `false`                            | Enables New Relic when credentials are present           |
| `VITE_UMAMI_SRC`               | `https://cloud.umami.is/script.js` | Custom Umami script URL if self-hosted                   |
| `VITE_GITHUB_API_ENABLED`      | `false`                            | Enable only where `/api/github` is available             |

### Optional service configuration

| Variable                       | When to use it                                                                 |
| ------------------------------ | ------------------------------------------------------------------------------ |
| `VITE_SITE_URL`                | Override the canonical production origin used by sitemap and robots generation |
| `VITE_UMAMI_WEBSITE_ID`        | Required only when analytics is enabled                                        |
| `VITE_GOOGLE_ANALYTICS_ID`     | Optional legacy/alternate analytics identifier                                 |
| `VITE_MAPBOX_TOKEN`            | Optional Mapbox token                                                          |
| `VITE_NEWRELIC_ACCOUNT_ID`     | Required only when New Relic is enabled                                        |
| `VITE_NEWRELIC_TRUST_KEY`      | Required only when New Relic is enabled                                        |
| `VITE_NEWRELIC_AGENT_ID`       | Required only when New Relic is enabled                                        |
| `VITE_NEWRELIC_LICENSE_KEY`    | Required only when New Relic is enabled                                        |
| `VITE_NEWRELIC_APPLICATION_ID` | Required only when New Relic is enabled                                        |
| `VITE_NEWRELIC_AJAX_DENY_LIST` | Optional comma-separated deny list for New Relic AJAX monitoring               |

## Server-Only Variables

These variables are used by Vercel functions and must not be prefixed with `VITE_`.

| Variable            | Used by                                |
| ------------------- | -------------------------------------- |
| `GITHUB_TOKEN`      | `/api/github` GraphQL proxy            |
| `KV_REST_API_URL`   | `/api/pet-dogs` Upstash Redis client   |
| `KV_REST_API_TOKEN` | `/api/pet-dogs` Upstash Redis client   |
| `RESEND_API_KEY`    | `/api/contact` email delivery          |
| `CONTACT_EMAIL`     | `/api/contact` recipient address       |
| `RESEND_FROM_EMAIL` | `/api/contact` sender address override |

## Practical Rules

- Keep `VITE_GITHUB_API_ENABLED=false` for plain Vite dev and CI runs. The GitHub proxy only exists when the app runs through Vercel functions.
- Keep `VITE_ENABLE_ANALYTICS=false` until `VITE_UMAMI_WEBSITE_ID` is set.
- Keep `VITE_ENABLE_ERROR_MONITORING=false` until all required New Relic values are present.
- Set `VITE_SITE_URL` in Vercel so the generated `dist/sitemap.xml` and `dist/robots.txt` point at the correct live origin.

## Validation Behavior

Validation happens when `src/config/env.ts` is imported. The module:

- parses booleans and numbers from strings
- validates URLs, email addresses, UUIDs, and New Relic key formats
- exposes the normalized result through the exported `env` object

Example:

```ts
import { env } from '@/config/env';

console.log(env.app.title);
console.log(env.features.analytics);
console.log(env.github.username);
```

## Local Testing Notes

- `npm run start:dev` uses your local `.env*` files
- `npm run start:vercel` is the local option when you also need `/api/*`
- GitHub Actions workflows export the required variables explicitly in workflow `env`

Useful commands:

```bash
npm test
npm test -- src/App.test.tsx
npm run test:coverage
```

## Troubleshooting

### Variable is missing or undefined

- Check the name and `VITE_` prefix
- Restart the dev server after editing `.env*`
- Make sure the value also satisfies the schema in `src/config/env.ts`

### GitHub section fails locally

- Confirm `VITE_GITHUB_USERNAME` is set
- Keep `VITE_GITHUB_API_ENABLED=false` unless you are running through `vercel dev`

### Analytics or New Relic do not initialize

- Confirm the feature flag is `true`
- Confirm the related credentials are present
- Remember both integrations skip automated clients and CI-style environments

## Source of Truth

- `src/config/env.ts` - validation schema and normalized `env` object
- `src/vite-env.d.ts` - `import.meta.env` typing
- `.env.example` - working starter template
- `docs/OBSERVABILITY.md` - analytics and monitoring behavior
