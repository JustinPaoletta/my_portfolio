# New Relic Error Monitoring Guide

This guide will help you set up New Relic Browser monitoring for your portfolio to track errors, performance metrics, and user interactions.

## 📋 Table of Contents

- [Overview](#overview)
- [Why New Relic?](#why-new-relic)
- [Setup Instructions](#setup-instructions)
- [Configuration](#configuration)
- [Usage](#usage)
- [Features](#features)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## 🔍 Overview

New Relic Browser provides real-time error monitoring and performance tracking for your React application. It automatically captures:

- **JavaScript errors** with full stack traces
- **Page load performance** metrics
- **Core Web Vitals** (LCP, FID, CLS)
- **AJAX requests** and their performance
- **User sessions** and interactions
- **Custom events** and attributes

## 🎯 Why New Relic?

- **Free tier**: 100GB of data per month (generous for portfolio sites)
- **Real-time monitoring**: See errors as they happen
- **Session replay**: Understand user context when errors occur
- **Performance insights**: Track Core Web Vitals and page performance
- **Custom attributes**: Add context to errors (environment, user ID, etc.)
- **Alerting**: Get notified when error rates spike
- **Source maps support**: See original TypeScript code in stack traces

## 🚀 Setup Instructions

### Step 1: Create a New Relic Account

1. Go to [https://newrelic.com/signup](https://newrelic.com/signup)
2. Sign up for a free account (no credit card required)
3. Choose your region (US or EU)

### Step 2: Create a Browser Application

1. After logging in, navigate to: **Browser** → **Add data**
2. Click **Browser monitoring**
3. Select **Copy/paste JavaScript code** (not npm package method)
4. Choose **Pro + SPA** (for React single-page application support)
5. Enter your application name (e.g., "My Portfolio")
6. Click **Enable**

### Step 3: Get Configuration Values

After creating the app, you'll see a JavaScript snippet. Extract these values from it:

```javascript
// Example New Relic snippet (yours will have actual values)
window.NREUM || (NREUM = {});
NREUM.init = {
  accountID: '1234567', // ← VITE_NEWRELIC_ACCOUNT_ID
  trustKey: '1234567', // ← VITE_NEWRELIC_TRUST_KEY
  agentID: '1234567890', // ← VITE_NEWRELIC_AGENT_ID
  licenseKey: 'NRJS-abc123', // ← VITE_NEWRELIC_LICENSE_KEY
  applicationID: '1234567890', // ← VITE_NEWRELIC_APPLICATION_ID
};
```

Alternatively, find these in: **Browser** → **(Your App)** → **Application settings** → **Browser monitoring** section.

### Step 4: Configure Environment Variables

Add these to your `.env` file:

```bash
# Enable error monitoring
VITE_ENABLE_ERROR_MONITORING=true

# New Relic Configuration
VITE_NEWRELIC_ACCOUNT_ID=1234567
VITE_NEWRELIC_TRUST_KEY=1234567
VITE_NEWRELIC_AGENT_ID=1234567890
VITE_NEWRELIC_LICENSE_KEY=NRJS-abc123def456
VITE_NEWRELIC_APPLICATION_ID=1234567890

# Optional: URLs to exclude from AJAX tracking
VITE_NEWRELIC_AJAX_DENY_LIST=/api/internal,/health
```

### Step 5: Deploy and Verify

1. **Development**: Restart your dev server

   ```bash
   npm run start:dev
   ```

2. **Production**: Set environment variables in your hosting platform (e.g., Vercel)
   - Go to your project settings → Environment Variables
   - Add all `VITE_NEWRELIC_*` variables
   - Redeploy your application

3. **Verify**: Check the browser console for:

   ```
   [New Relic] Successfully initialized
   ```

4. **Test**: Generate a test error and check New Relic dashboard (may take 1-2 minutes to appear)

## ⚙️ Configuration

### Environment Variables

| Variable                       | Required | Format          | Description                      |
| ------------------------------ | -------- | --------------- | -------------------------------- |
| `VITE_ENABLE_ERROR_MONITORING` | Yes      | boolean         | Enable/disable New Relic         |
| `VITE_NEWRELIC_ACCOUNT_ID`     | Yes      | numeric         | Your New Relic account ID        |
| `VITE_NEWRELIC_TRUST_KEY`      | Yes      | numeric         | Trust key from app settings      |
| `VITE_NEWRELIC_AGENT_ID`       | Yes      | numeric         | Agent ID from app settings       |
| `VITE_NEWRELIC_LICENSE_KEY`    | Yes      | string          | License key from app settings    |
| `VITE_NEWRELIC_APPLICATION_ID` | Yes      | numeric         | Application ID from app settings |
| `VITE_NEWRELIC_AJAX_DENY_LIST` | No       | comma-separated | URLs to exclude from tracking    |

### AJAX Deny List

Exclude certain URLs from being tracked (e.g., health checks, internal APIs):

```bash
# Single URL pattern
VITE_NEWRELIC_AJAX_DENY_LIST=/health

# Multiple patterns
VITE_NEWRELIC_AJAX_DENY_LIST=/api/internal,/health,/metrics
```

## 💻 Usage

### Automatic Error Tracking

Errors are automatically tracked via the ErrorBoundary component. No additional code needed!

```typescript
// Errors caught here are automatically reported to New Relic
throw new Error('Something went wrong!');
```

### Manual Error Reporting

Report errors manually with custom context:

```typescript
import { reportError } from '@/utils/newrelic';

try {
  // Your code
} catch (error) {
  if (error instanceof Error) {
    reportError(error, {
      context: 'payment-processing',
      userId: user.id,
      amount: 100,
    });
  }
}
```

### Custom Attributes

Add global attributes that appear on all events:

```typescript
import { setGlobalAttributes } from '@/utils/newrelic';

// Set once during app initialization or login
setGlobalAttributes({
  userId: '12345',
  userPlan: 'premium',
  environment: 'production',
});
```

### Track User Sessions

Identify users for better debugging:

```typescript
import { setUser } from '@/utils/newrelic';

// After user logs in
setUser(
  user.id, // Required: user ID
  user.name, // Optional: user name
  user.email // Optional: user email
);
```

### Custom Events

Track custom interactions:

```typescript
import { trackPageAction } from '@/utils/newrelic';

// Track a custom event
trackPageAction('button_click', {
  buttonName: 'subscribe',
  page: 'homepage',
});

// Track form submissions
trackPageAction('form_submit', {
  formName: 'contact',
  success: true,
});
```

### Performance Timing

Measure custom performance metrics:

```typescript
import { addTiming } from '@/utils/newrelic';

const startTime = performance.now();

// Your expensive operation
await fetchData();
await processData();

// Log the timing
addTiming('data_processing', startTime);
```

### Error Wrapper for Async Functions

Automatically wrap async functions with error reporting:

```typescript
import { withErrorReporting } from '@/utils/newrelic';

const fetchUserData = withErrorReporting(
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`);
    return response.json();
  },
  'fetchUserData' // Optional context
);

// Errors in this function are automatically reported
const data = await fetchUserData('123');
```

## ✨ Features

### What's Tracked Automatically

✅ **React errors** via ErrorBoundary
✅ **Unhandled exceptions** (global error handler)
✅ **Promise rejections** (unhandled rejections)
✅ **AJAX/Fetch requests** (performance and errors)
✅ **Page load metrics** (timing, resources)
✅ **Core Web Vitals** (LCP, FID, CLS)
✅ **Route changes** (SPA navigation)

### Custom Tracking

✅ **Manual error reporting** with context
✅ **User identification** for session tracking
✅ **Custom events** for business metrics
✅ **Performance timing** for critical operations
✅ **Global attributes** for all events

### New Relic Dashboard

What you can see in your dashboard:

- **Error rate** and trends over time
- **JavaScript errors** with full stack traces
- **Page views** and performance metrics
- **AJAX requests** and their response times
- **Browser types** and versions
- **Geographic distribution** of users
- **Session traces** to replay user interactions
- **Custom attributes** on all events

## 📊 Best Practices

### 1. Add Context to Errors

Always include relevant context when reporting errors:

```typescript
reportError(error, {
  userId: user?.id,
  feature: 'checkout',
  step: 'payment',
  amount: orderTotal,
});
```

### 2. Set Global Attributes Early

Set common attributes once during app initialization:

```typescript
// In main.tsx or App.tsx
initializeNewRelic();

setGlobalAttributes({
  environment: env.app.mode,
  appVersion: env.app.version,
  deployDate: new Date().toISOString(),
});
```

### 3. Identify Users After Authentication

```typescript
// After successful login
if (user) {
  setUser(user.id, user.name, user.email);
}
```

### 4. Use AJAX Deny List Wisely

Exclude noisy endpoints that don't provide value:

```bash
# Health checks, analytics, polling endpoints
VITE_NEWRELIC_AJAX_DENY_LIST=/health,/ping,/analytics,/poll
```

### 5. Enable Source Maps for Production

Ensure source maps are generated for production builds (already configured in this project) so you can see original TypeScript code in error stack traces.

### 6. Monitor in Development

Keep error monitoring enabled in development to catch issues early:

```bash
# .env.development
VITE_ENABLE_ERROR_MONITORING=true
```

### 7. Set Up Alerts

Configure alerts in New Relic for:

- Error rate spikes
- Slow page loads
- Poor Core Web Vitals
- Specific error patterns

## 🐛 Troubleshooting

### New Relic not initializing

**Check console for errors:**

```
[New Relic] Skipped - disabled or not configured
```

**Solution:**

1. Verify `VITE_ENABLE_ERROR_MONITORING=true`
2. Verify all 5 New Relic variables are set
3. Restart dev server

### Errors not appearing in dashboard

**Possible causes:**

1. **Delay**: New Relic has 1-2 minute delay. Wait and refresh.

2. **Configuration**: Verify environment variables are correct:

   ```bash
   # Check in browser console
   console.log(import.meta.env.VITE_NEWRELIC_ACCOUNT_ID);
   ```

3. **Initialization**: Check browser console for:

   ```
   [New Relic] Successfully initialized
   ```

4. **Application settings**: Verify your New Relic app is configured for "Pro + SPA" mode

### TypeScript errors

If you see TypeScript errors, ensure proper imports:

```typescript
// ✅ Correct
import { reportError } from '@/utils/newrelic';

// ❌ Wrong
import newrelic from '@/utils/newrelic';
```

### Environment variables not working

1. **Restart dev server** after changing `.env`
2. **Check prefix**: Must start with `VITE_`
3. **Check validation**: Run app and check console for validation errors
4. **Clear cache**: Clear browser cache and rebuild

### Build errors

If you get build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist .vite
npm run build
```

### Performance impact

New Relic has minimal performance impact (<1% overhead). If you notice issues:

1. **Exclude noisy endpoints** via AJAX deny list
2. **Reduce custom events** if tracking many
3. **Check browser console** for errors or warnings

## 📈 Monitoring Tips

### View Errors

1. Go to: **Browser** → **(Your App)** → **Errors**
2. Filter by error type, browser, date
3. Click on error to see:
   - Stack trace
   - User session
   - Browser info
   - Custom attributes

### View Performance

1. Go to: **Browser** → **(Your App)** → **Page views**
2. See:
   - Page load times
   - Core Web Vitals
   - Slowest pages
   - Browser breakdown

### Create Alerts

1. Go to: **Alerts** → **Alert policies**
2. Create policy → Add condition
3. Example alert: "Notify when error rate > 1% for 5 minutes"

### Custom Dashboards

1. Go to: **Dashboards** → **Create dashboard**
2. Add widgets with NRQL queries:

   ```sql
   -- Error rate over time
   SELECT count(*) FROM JavaScriptError
   WHERE appName = 'My Portfolio'
   SINCE 1 day ago TIMESERIES

   -- Top errors
   SELECT count(*) FROM JavaScriptError
   WHERE appName = 'My Portfolio'
   FACET errorMessage
   SINCE 1 day ago
   ```

## 🔒 Security & Privacy

- ✅ **No PII by default**: New Relic doesn't capture personal data unless you explicitly add it
- ✅ **User opt-out**: Respect user preferences (e.g., DNT headers)
- ✅ **Data retention**: Free tier: 8 days, paid: configurable
- ✅ **GDPR compliant**: New Relic is GDPR/CCPA compliant
- ⚠️ **Be careful with attributes**: Don't log passwords, credit cards, or sensitive data

## 📚 Resources

- [New Relic Browser Docs](https://docs.newrelic.com/docs/browser/)
- [New Relic Browser Agent API](https://docs.newrelic.com/docs/browser/new-relic-browser/browser-apis/)
- [NRQL Query Language](https://docs.newrelic.com/docs/query-your-data/nrql-new-relic-query-language/)
- [Browser Agent Config](https://docs.newrelic.com/docs/browser/new-relic-browser/configuration/browser-agent-configuration/)

## 🎓 Next Steps

1. ✅ Complete setup (you're done!)
2. 📊 Explore the New Relic dashboard
3. 🚨 Set up alerts for critical errors
4. 📈 Create custom dashboards
5. 🔍 Monitor Core Web Vitals
6. 🎯 Add custom attributes for your use case
7. 📱 Test on different devices/browsers

---

**Need help?** Check the [troubleshooting section](#troubleshooting) or open an issue on GitHub.
