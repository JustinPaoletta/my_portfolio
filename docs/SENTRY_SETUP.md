# Sentry Integration Guide

This guide covers the Sentry error monitoring integration for production error tracking in your portfolio project.

## Table of Contents

- [Overview](#overview)
- [Why Sentry?](#why-sentry)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage](#usage)
- [Testing](#testing)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Sentry is integrated into this project to provide:

- **Real-time error tracking** in production
- **Performance monitoring** for slow page loads
- **Session replay** to see what users experienced
- **Email alerts** when errors occur
- **Stack traces** with source maps for debugging

### What's Included

✅ Automatic error capture
✅ React Error Boundaries
✅ Performance monitoring
✅ Session replay (with privacy controls)
✅ Error filtering (browser extensions, known issues)
✅ Source map support
✅ Custom error context

## Why Sentry?

### Free Tier Benefits

The **Sentry Developer (free) plan** includes:

- Error monitoring and tracking
- Performance tracing
- Session replay
- Email alerts
- 1 user (perfect for personal projects)
- Sufficient error/event quotas for portfolio sites

### When to Use

✅ **Production monitoring** - Catch errors users experience
✅ **Performance tracking** - Monitor page load times
✅ **User feedback** - Understand what went wrong
✅ **Debugging** - Get full stack traces with context

## Setup Instructions

### 1. Create a Sentry Account

1. Go to [sentry.io](https://sentry.io/signup/)
2. Sign up for a **free Developer account**
3. Create a new project:
   - **Platform:** React
   - **Alert frequency:** Your preference
   - **Project name:** my-portfolio (or your choice)

### 2. Get Your DSN

After creating the project:

1. Navigate to **Settings** → **Projects** → **[Your Project]**
2. Click **Client Keys (DSN)**
3. Copy the **DSN** (looks like: `https://abc123@o123.ingest.sentry.io/456`)

### 3. Configure Environment Variable

Add your Sentry DSN to your environment configuration:

**For local development (`.env`):**

```bash
VITE_SENTRY_DSN=https://your-dsn@o123.ingest.sentry.io/456
```

**For production deployment:**

Configure the `VITE_SENTRY_DSN` environment variable in Vercel:

- **Vercel:** Project settings → Environment Variables
- Add `VITE_SENTRY_DSN` with your DSN value
- Redeploy to apply changes

### 4. Verify Installation

The integration is already set up in the codebase. Verify by running:

```bash
npm run start:dev
```

Check the console for:

```
Sentry initialized for environment: development
```

Or if no DSN is configured:

```
Sentry: No DSN configured, skipping initialization
```

## Configuration

### Sentry Configuration File

The main configuration is in `src/config/sentry.ts`:

```typescript
import { initSentry } from '@/config/sentry';

// Initialize Sentry (called in main.tsx)
initSentry();
```

### Key Settings

#### Sample Rates

**Production (10%):**

```typescript
tracesSampleRate: 0.1; // 10% of performance traces
replaysSessionSampleRate: 0.1; // 10% of normal sessions
replaysOnErrorSampleRate: 1.0; // 100% of error sessions
```

**Development (100%):**

```typescript
tracesSampleRate: 1.0; // All performance traces
replaysSessionSampleRate: 1.0; // All sessions
```

> **Why lower rates in production?** To stay within free tier limits and reduce noise.

#### Error Filtering

The configuration automatically filters out:

- Browser extension errors
- Known third-party script issues
- Network errors from ad blockers
- Facebook/social media widget errors

#### Privacy Controls

Session replays are configured with privacy by default:

```typescript
maskAllText: true,      // Masks all text content
blockAllMedia: true,    // Blocks images and videos
```

## Usage

### Automatic Error Capture

Most errors are captured automatically:

```typescript
// This error will be sent to Sentry automatically
throw new Error('Something went wrong!');

// Async errors too
async function fetchData() {
  throw new Error('API request failed');
}
```

### Manual Error Capture

For custom error handling:

```typescript
import { captureException } from '@/config/sentry';

try {
  riskyOperation();
} catch (error) {
  // Send to Sentry with custom context
  captureException(error as Error, {
    userId: user.id,
    action: 'checkout',
    amount: 99.99,
  });
}
```

### Capture Messages

Log important events:

```typescript
import { captureMessage } from '@/config/sentry';

// Info level
captureMessage('User completed onboarding', 'info');

// Warning level
captureMessage('Payment method expired', 'warning');

// Error level
captureMessage('Critical service unavailable', 'error');
```

### User Context

Associate errors with users:

```typescript
import { setUser, clearUser } from '@/config/sentry';

// Set user info (after login)
setUser({
  id: 'user-123',
  email: 'user@example.com',
  username: 'johndoe',
});

// Clear user info (after logout)
clearUser();
```

### Breadcrumbs

Add debugging context:

```typescript
import { addBreadcrumb } from '@/config/sentry';

addBreadcrumb({
  category: 'navigation',
  message: 'User navigated to checkout',
  level: 'info',
  data: {
    from: '/cart',
    to: '/checkout',
  },
});
```

### React Error Boundaries

The app is wrapped with an Error Boundary that:

- Catches React component errors
- Sends errors to Sentry
- Shows a friendly error UI
- Allows users to retry or reload

**In production:**

- Shows user-friendly error message
- Automatically reports to Sentry

**In development:**

- Shows error details
- Includes stack trace
- Still reports to Sentry (if configured)

## Testing

### Test Error Tracking

Add a test button to verify Sentry is working:

```typescript
<button
  onClick={() => {
    throw new Error('Test Sentry Error!');
  }}
>
  Test Error Tracking
</button>
```

Click the button, then:

1. Check the browser console for Sentry logs
2. Go to your Sentry dashboard
3. Verify the error appears in the Issues list

### Test Error Boundary

Test the error boundary fallback UI:

```typescript
const BrokenComponent = () => {
  throw new Error('Test Error Boundary!');
  return <div>This won't render</div>;
};

// Use in App:
<BrokenComponent />
```

### Test in Production

After deploying:

1. Visit your production site
2. Trigger an error (use a test button)
3. Check Sentry dashboard for the error
4. Verify source maps show original TypeScript code

## Best Practices

### 1. Don't Over-Report

❌ **Don't capture everything:**

```typescript
// Bad - Too noisy
console.log = (msg) => captureMessage(msg);
```

✅ **Capture important errors:**

```typescript
// Good - Critical errors only
if (paymentFailed) {
  captureException(new Error('Payment processing failed'));
}
```

### 2. Add Context

❌ **No context:**

```typescript
captureException(error);
```

✅ **Rich context:**

```typescript
captureException(error, {
  feature: 'checkout',
  userId: user.id,
  cartTotal: 99.99,
  timestamp: Date.now(),
});
```

### 3. Set User Info

Always set user context after authentication:

```typescript
// After successful login
setUser({
  id: user.id,
  email: user.email,
  username: user.username,
});
```

### 4. Use Breadcrumbs

Add breadcrumbs for important user actions:

```typescript
addBreadcrumb({
  category: 'user-action',
  message: 'User added item to cart',
  level: 'info',
  data: { itemId: '123', price: 29.99 },
});
```

### 5. Monitor Performance

Sentry automatically tracks:

- Page load times
- Component render times
- API request durations
- User interactions

Review the **Performance** tab in Sentry to identify bottlenecks.

### 6. Review Regularly

Check your Sentry dashboard:

- **Daily:** For critical errors
- **Weekly:** For trends and patterns
- **After deploys:** For new issues

### 7. Create Releases

Tag errors with release versions:

```bash
# During build/deploy
SENTRY_RELEASE=$(git rev-parse --short HEAD)
VITE_SENTRY_RELEASE=$SENTRY_RELEASE npm run build
```

Update `sentry.ts`:

```typescript
Sentry.init({
  dsn: env.services.sentryDsn,
  release: import.meta.env.VITE_SENTRY_RELEASE,
  // ... other config
});
```

## Troubleshooting

### Issue: "Sentry: No DSN configured"

**Solution:**

1. Verify `VITE_SENTRY_DSN` is set in your `.env` file
2. Restart the dev server
3. Check for typos in the variable name

### Issue: Errors not appearing in Sentry

**Possible causes:**

1. **DSN not configured in production**
   - Check environment variables in your hosting platform

2. **Error is filtered out**
   - Check `beforeSend` filter in `sentry.ts`
   - Check `ignoreErrors` and `denyUrls` lists

3. **Browser extensions blocking**
   - Try in incognito mode
   - Check browser console for Sentry errors

4. **Sample rate too low**
   - Temporarily set `tracesSampleRate: 1.0` for testing

### Issue: Source maps not working

**Solution:**

1. Verify source maps are generated:

   ```typescript
   // vite.config.ts
   export default defineConfig({
     build: {
       sourcemap: true, // Enable source maps
     },
   });
   ```

2. Upload source maps to Sentry (advanced):
   - Install `@sentry/vite-plugin`
   - Configure automatic upload

### Issue: Too many errors/quota exceeded

**Solutions:**

1. **Increase sample rates** (if on paid plan)
2. **Filter more aggressively:**

   ```typescript
   beforeSend(event) {
     // Only send errors from your domain
     if (!event.request?.url?.includes('your-domain.com')) {
       return null;
     }
     return event;
   }
   ```

3. **Fix the bugs!** 😄

### Issue: Privacy concerns with session replay

**Solutions:**

1. **Disable session replay entirely:**

   ```typescript
   // Remove replayIntegration() from integrations
   ```

2. **Increase masking:**

   ```typescript
   replayIntegration({
     maskAllText: true,
     blockAllMedia: true,
     maskAllInputs: true, // Also mask form inputs
   });
   ```

3. **Lower sample rate:**
   ```typescript
   replaysSessionSampleRate: 0.01, // Only 1% of sessions
   ```

## Advanced Features

### Performance Monitoring

Track custom performance metrics:

```typescript
import * as Sentry from '@sentry/react';

// Start a transaction
const transaction = Sentry.startTransaction({
  name: 'Checkout Process',
  op: 'user-flow',
});

// Create spans for operations
const span = transaction.startChild({
  op: 'payment-processing',
  description: 'Process credit card',
});

// ... do work ...
span.finish();
transaction.finish();
```

### Custom Tags

Organize errors with tags:

```typescript
Sentry.setTag('page_locale', 'en-US');
Sentry.setTag('feature_flag', 'new-checkout');
```

### Alerts

Configure alerts in Sentry dashboard:

1. Go to **Alerts** → **Create Alert**
2. Choose conditions (e.g., "Error count > 10 in 1 hour")
3. Set notification channels (email, Slack, etc.)

## Files Reference

### Key Files

- **`src/config/sentry.ts`** - Sentry configuration and helper functions
- **`src/components/ErrorBoundary.tsx`** - React error boundary component
- **`src/main.tsx`** - Sentry initialization
- **`src/config/env.ts`** - Environment variable handling

### Environment Variables

- **`VITE_SENTRY_DSN`** - Your Sentry project DSN (required)
- **`VITE_SENTRY_RELEASE`** - Release version (optional)

## Resources

- [Sentry Documentation](https://docs.sentry.io/)
- [Sentry React SDK](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Error Boundaries in React](https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary)
- [Sentry Pricing](https://sentry.io/pricing/)

## Need Help?

- **Sentry Support:** [support@sentry.io](mailto:support@sentry.io)
- **Documentation:** [docs.sentry.io](https://docs.sentry.io/)
- **Community:** [Discord](https://discord.gg/sentry)

---

**Pro tip:** Start with Sentry configured but with lower sample rates. As you gain confidence and your traffic grows, adjust the rates to balance visibility with quota usage.
