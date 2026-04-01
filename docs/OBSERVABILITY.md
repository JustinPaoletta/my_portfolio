# Observability

This project has two optional browser-side observability integrations:

- Umami for privacy-friendly analytics
- New Relic Browser for client-side monitoring

Both are loaded lazily and both can be disabled completely through environment configuration.

## Source Files

### Umami

- `src/main.tsx`
- `src/utils/analytics.ts`
- `src/utils/userAgent.ts`

### New Relic

- `src/main.tsx`
- `src/utils/newrelic.ts`
- `src/components/ErrorBoundary.tsx`
- `src/utils/userAgent.ts`

## Umami Analytics

### Initialization Rules

Umami initializes only when all of these are true:

- `__ENABLE_ANALYTICS__` is enabled at build time
- `env.features.analytics` is `true` after config normalization
- `VITE_UMAMI_WEBSITE_ID` is present
- the visitor is not detected as an automated client
- the app is not running in the test environment

### Required Variables

```env
VITE_ENABLE_ANALYTICS=true
VITE_UMAMI_WEBSITE_ID=00000000-0000-0000-0000-000000000000
VITE_UMAMI_SRC=https://cloud.umami.is/script.js
```

If you do not have a valid Umami site ID yet, keep `VITE_ENABLE_ANALYTICS=false`.

The app currently relies on Umami auto-tracking after the script loads. There is no app-specific analytics hook or custom event wiring in the live UI today.

### Debug Logging

Umami logs appear only when:

- the app is running in development
- `VITE_ENABLE_DEBUG=true`

## New Relic Monitoring

### What The Current Setup Does

- uses `@newrelic/browser-agent` via the smaller `MicroAgent` loader
- lazy-loads after the page becomes interactive
- reports React render errors through `ErrorBoundary`
- keeps manual helper exports available in `src/utils/newrelic.ts` if future features need them

### Initialization Rules

New Relic initializes only when all of these are true:

- `__ENABLE_ERROR_MONITORING__` is enabled at build time
- `VITE_ENABLE_ERROR_MONITORING=true`
- all required `VITE_NEWRELIC_*` variables are present
- the visitor is not detected as an automated client

If any of those checks fail, the app skips New Relic cleanly.

### Required Variables

```env
VITE_ENABLE_ERROR_MONITORING=true
VITE_NEWRELIC_ACCOUNT_ID=...
VITE_NEWRELIC_TRUST_KEY=...
VITE_NEWRELIC_AGENT_ID=...
VITE_NEWRELIC_LICENSE_KEY=...
VITE_NEWRELIC_APPLICATION_ID=...
VITE_NEWRELIC_AJAX_DENY_LIST=/api/internal,/health
```

### Available Helpers

The New Relic module supports:

- `reportError(...)`
- `trackPageAction(...)`
- `setGlobalAttributes(...)`
- `setUser(...)`
- `addTiming(...)`
- `withErrorReporting(...)`

Example:

```ts
import { reportError, trackPageAction } from '@/utils/newrelic';

try {
  // your code
} catch (error) {
  if (error instanceof Error) {
    reportError(error, { context: 'contact-form-submit' });
  }
}

trackPageAction('resume_download', { source: 'hero' });
```

## How Both Integrations Behave

- both are optional
- both skip automated clients to reduce noise in tests and audits
- both are kept out of the critical rendering path
- both rely on environment flags plus valid configuration

## Testing

### Local smoke test

```bash
npm run build
npm run start:prod
```

Then:

1. open DevTools
2. verify the Umami script request succeeds when enabled
3. trigger a handled error or manual New Relic action when enabled
4. confirm the data appears in the respective dashboard

For New Relic-specific local testing, you can also run `npm run start:dev` with the required `VITE_NEWRELIC_*` values and trigger a handled error.

## Related Docs

- [Environment Variables](ENV.md)
- [Content Security Policy](CSP.md)
- [Vercel Deployment](VERCEL_DEPLOYMENT.md)
