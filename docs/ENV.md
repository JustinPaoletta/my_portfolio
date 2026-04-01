# Environment Variables Guide

This project resolves browser-visible configuration at build time. `vite.config.ts` loads raw environment variables, passes them through `createAppConfig()` in `src/config/app-config.ts`, and injects the normalized result into the client bundle as `__APP_CONFIG__`. `src/config/env.ts` is the runtime accessor for that injected object.

## Files

- `.env.example` - committed template
- `.env` - local defaults for your machine
- `.env.local` - optional machine-specific overrides
- Vercel project settings - production and preview environment variables for deployed builds

Vite loads `.env` and `.env.local` automatically. The checked-in source of truth for parsing and validation is `src/config/app-config.ts`.

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
| `VITE_APP_TITLE`       | Required non-empty string                                 |
| `VITE_APP_DESCRIPTION` | Required non-empty string                                 |
| `VITE_API_URL`         | Must be a valid `http://` or `https://` URL               |
| `VITE_GITHUB_URL`      | Must be a valid `http://` or `https://` URL               |
| `VITE_LINKEDIN_URL`    | Must be a valid `http://` or `https://` URL               |
| `VITE_EMAIL`           | Must be a valid email address                             |
| `VITE_GITHUB_USERNAME` | GitHub login used by the GitHub section and `/api/github` |

### Optional with defaults

| Variable                       | Default                            | Notes                                        |
| ------------------------------ | ---------------------------------- | -------------------------------------------- |
| `VITE_API_TIMEOUT`             | `5000`                             | Parsed as a positive integer                 |
| `VITE_ENABLE_ANALYTICS`        | `false`                            | Only `true` or `1` enable it                 |
| `VITE_ENABLE_DEBUG`            | `false`                            | Only `true` or `1` enable it                 |
| `VITE_ENABLE_ERROR_MONITORING` | `false`                            | Only `true` or `1` enable it                 |
| `VITE_UMAMI_SRC`               | `https://cloud.umami.is/script.js` | Custom Umami script URL if self-hosted       |
| `VITE_GITHUB_API_ENABLED`      | `false`                            | Enable only where `/api/github` is available |

### Optional service configuration

| Variable                       | When to use it                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `VITE_SITE_URL`                | Recommended in deployments so generated `sitemap.xml` and `robots.txt` use the correct origin |
| `VITE_UMAMI_WEBSITE_ID`        | Needed only if you want Umami enabled                                                         |
| `VITE_GOOGLE_ANALYTICS_ID`     | Reserved for a future GA integration; stored in config but not used by the UI today           |
| `VITE_MAPBOX_TOKEN`            | Reserved for a future Mapbox integration; stored in config but not used by the UI today       |
| `VITE_NEWRELIC_ACCOUNT_ID`     | Needed only if you want New Relic enabled                                                     |
| `VITE_NEWRELIC_TRUST_KEY`      | Needed only if you want New Relic enabled                                                     |
| `VITE_NEWRELIC_AGENT_ID`       | Needed only if you want New Relic enabled                                                     |
| `VITE_NEWRELIC_LICENSE_KEY`    | Needed only if you want New Relic enabled                                                     |
| `VITE_NEWRELIC_APPLICATION_ID` | Needed only if you want New Relic enabled                                                     |
| `VITE_NEWRELIC_AJAX_DENY_LIST` | Optional comma-separated deny list for New Relic AJAX monitoring                              |

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
- Keep `VITE_ENABLE_ANALYTICS=false` until `VITE_UMAMI_WEBSITE_ID` is set. If the ID is missing, analytics stays disabled even when the flag is on.
- Keep `VITE_ENABLE_ERROR_MONITORING=false` until all required New Relic values are present. If values are missing, the app builds but New Relic initialization no-ops at runtime.
- Set `VITE_SITE_URL` in Vercel so the generated `dist/sitemap.xml` and `dist/robots.txt` point at the correct live origin.

## Validation Behavior

Validation happens when `vite.config.ts` calls `createAppConfig()`. That step:

- requires non-empty app title and description strings
- validates HTTP(S) URLs, email addresses, and GitHub usernames
- parses `VITE_API_TIMEOUT` as a positive integer
- parses `VITE_NEWRELIC_AJAX_DENY_LIST` as a comma-separated list
- derives feature flags for analytics, debug mode, and error monitoring
- serializes the normalized result into `__APP_CONFIG__`, which `src/config/env.ts` re-exports as `env`

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
- Make sure the value also satisfies the checks in `src/config/app-config.ts`

### GitHub section fails locally

- Confirm `VITE_GITHUB_USERNAME` is set
- Keep `VITE_GITHUB_API_ENABLED=false` unless you are running through `vercel dev`

### Analytics or New Relic do not initialize

- Confirm the feature flag is `true`
- Confirm the related credentials are present
- Remember both integrations skip automated clients and CI-style environments

## Source of Truth

- `src/config/app-config.ts` - parsing, validation, and normalization rules
- `vite.config.ts` - env loading and `__APP_CONFIG__` injection
- `src/config/env.ts` - runtime accessor for the normalized config
- `src/vite-env.d.ts` - `import.meta.env` typing
- `.env.example` - working starter template
- `docs/OBSERVABILITY.md` - analytics and monitoring behavior
