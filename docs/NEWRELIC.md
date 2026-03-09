# New Relic Guide

This project supports optional browser-side error monitoring with New Relic.

## What The Current Setup Does

- uses `@newrelic/browser-agent` via the smaller `MicroAgent` loader
- loads New Relic only when monitoring is enabled and fully configured
- defers initialization until after the page is interactive to reduce Lighthouse impact
- reports React render errors through `ErrorBoundary`
- exposes helpers for manual error reporting, page actions, timings, and custom attributes

## Files Involved

- `src/main.tsx`
  - lazy-loads the New Relic module after `DOMContentLoaded`
  - prefers `requestIdleCallback` and falls back to `setTimeout`
- `src/utils/newrelic.ts`
  - initializes the `MicroAgent`
  - exports helper utilities
- `src/components/ErrorBoundary.tsx`
  - reports caught React errors through `reportError`
- `src/config/env.ts`
  - validates all `VITE_NEWRELIC_*` variables

## Initialization Rules

New Relic initializes only if all of the following are true:

- `__ENABLE_ERROR_MONITORING__` is enabled at build time
- `VITE_ENABLE_ERROR_MONITORING=true`
- all required `VITE_NEWRELIC_*` variables are present
- the visitor is not detected as an automated client

If any of those checks fail, the app skips New Relic cleanly.

## Why It Loads Lazily

The app does not initialize New Relic before the first render.

Instead, `src/main.tsx` waits until the page is interactive and then schedules loading during idle time. That tradeoff is intentional:

- the page becomes interactive sooner
- Lighthouse is less affected by monitoring overhead
- monitoring stays out of the critical rendering path

## What You Can Track

The current helper layer supports:

- React errors caught by `ErrorBoundary`
- manual `reportError(...)` calls
- custom page actions via `trackPageAction(...)`
- custom attributes via `setGlobalAttributes(...)`
- user context via `setUser(...)`
- custom timings via `addTiming(...)`
- wrapped async functions via `withErrorReporting(...)`

The module also sets default attributes for:

- app environment
- app version
- development mode

## Production Setup

Add these Vercel environment variables:

```env
VITE_ENABLE_ERROR_MONITORING=true
VITE_NEWRELIC_ACCOUNT_ID=...
VITE_NEWRELIC_TRUST_KEY=...
VITE_NEWRELIC_AGENT_ID=...
VITE_NEWRELIC_LICENSE_KEY=...
VITE_NEWRELIC_APPLICATION_ID=...
VITE_NEWRELIC_AJAX_DENY_LIST=/api/internal,/health
```

Then redeploy the app.

## Manual Usage

### Report an error

```ts
import { reportError } from '@/utils/newrelic';

try {
  // your code
} catch (error) {
  if (error instanceof Error) {
    reportError(error, { context: 'contact-form-submit' });
  }
}
```

### Track a custom action

```ts
import { trackPageAction } from '@/utils/newrelic';

trackPageAction('resume_download', {
  source: 'hero',
});
```

### Attach persistent attributes

```ts
import { setGlobalAttributes } from '@/utils/newrelic';

setGlobalAttributes({
  portfolioTheme: 'cosmic',
  deployChannel: 'production',
});
```

## Testing

### Local smoke test

1. set the required `VITE_NEWRELIC_*` variables locally
2. set `VITE_ENABLE_ERROR_MONITORING=true`
3. run `npm run start:dev`
4. trigger a handled error or call `reportError(...)`

### Safe test idea

Temporarily add a button that throws inside an event handler and verify the error reaches New Relic. Remove the test code afterward.

## Operational Notes

- this setup is optional and should stay disabled in environments where the credentials are not present
- automated clients are skipped to avoid polluting telemetry during tests and audits
- the New Relic code path is lazy-loaded, so it should not be treated as critical-path application logic

## Related Docs

- [Environment Variables](/Users/justinpaoletta/Desktop/PROJECTS/APPS/my_portfolio/docs/ENV.md)
- [Lighthouse CI](/Users/justinpaoletta/Desktop/PROJECTS/APPS/my_portfolio/docs/LIGHTHOUSE_CI.md)
- [Vercel Deployment](/Users/justinpaoletta/Desktop/PROJECTS/APPS/my_portfolio/docs/VERCEL_DEPLOYMENT.md)
