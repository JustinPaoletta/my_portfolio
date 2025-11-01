# New Relic Quick Start

Get up and running with New Relic error monitoring in 5 minutes.

## 1. Get Your New Relic Credentials

1. Sign up at [https://newrelic.com/signup](https://newrelic.com/signup) (free, no credit card)
2. Create a Browser app: **Browser** → **Add data** → **Browser monitoring** → **Pro + SPA**
3. Copy your configuration values from the settings page

## 2. Add to Your .env File

Create or update your `.env` file with these values:

```bash
# ==================================
# New Relic Configuration
# ==================================

# Enable error monitoring
VITE_ENABLE_ERROR_MONITORING=true

# New Relic credentials (get from New Relic dashboard)
VITE_NEWRELIC_ACCOUNT_ID=YOUR_ACCOUNT_ID
VITE_NEWRELIC_TRUST_KEY=YOUR_TRUST_KEY
VITE_NEWRELIC_AGENT_ID=YOUR_AGENT_ID
VITE_NEWRELIC_LICENSE_KEY=YOUR_LICENSE_KEY
VITE_NEWRELIC_APPLICATION_ID=YOUR_APPLICATION_ID

# Optional: Exclude URLs from tracking (comma-separated)
VITE_NEWRELIC_AJAX_DENY_LIST=

# ==================================
# Also add app version (required)
# ==================================
VITE_APP_VERSION=1.0.0
```

**Replace** `YOUR_*` with your actual values from New Relic.

## 3. Restart Dev Server

```bash
npm run start:dev
```

## 4. Verify It Works

Check the browser console for:

```
[New Relic] Successfully initialized
```

## 5. Test Error Tracking

Generate a test error:

```typescript
// Add this temporarily to your App.tsx
throw new Error('Test error for New Relic');
```

Wait 1-2 minutes, then check your New Relic dashboard for the error.

## 6. Production Setup

For production (e.g., Vercel):

1. Go to your project settings → **Environment Variables**
2. Add all the `VITE_*` variables above
3. Redeploy

## Example Values

Here's what the values look like (these are examples, use your own):

```bash
VITE_NEWRELIC_ACCOUNT_ID=1234567
VITE_NEWRELIC_TRUST_KEY=1234567
VITE_NEWRELIC_AGENT_ID=1234567890
VITE_NEWRELIC_LICENSE_KEY=NRJS-abc123def456ghi789
VITE_NEWRELIC_APPLICATION_ID=1234567890
```

## Where to Find Your Values

In New Relic:

1. Go to: **Browser** → **(Your App Name)** → **Application settings**
2. Scroll to **Browser monitoring** section
3. Click **Show JavaScript snippet**
4. Copy the values from the snippet:

```javascript
NREUM.init = {
  accountID: '1234567', // ← Use this for VITE_NEWRELIC_ACCOUNT_ID
  trustKey: '1234567', // ← Use this for VITE_NEWRELIC_TRUST_KEY
  agentID: '1234567890', // ← Use this for VITE_NEWRELIC_AGENT_ID
  licenseKey: 'NRJS-abc123', // ← Use this for VITE_NEWRELIC_LICENSE_KEY
  applicationID: '1234567890', // ← Use this for VITE_NEWRELIC_APPLICATION_ID
};
```

## Complete .env Template

Copy this entire template for your `.env` file:

```bash
# ==================================
# My Portfolio - Environment Variables
# ==================================

# ----------------------------------
# App Configuration (Required)
# ----------------------------------
VITE_APP_TITLE=My Portfolio
VITE_APP_DESCRIPTION=A modern portfolio showcasing my work and skills
VITE_APP_VERSION=1.0.0

# ----------------------------------
# API Configuration (Required)
# ----------------------------------
VITE_API_URL=https://api.example.com
VITE_API_TIMEOUT=5000

# ----------------------------------
# Feature Flags (Optional)
# ----------------------------------
VITE_ENABLE_ANALYTICS=false
VITE_ENABLE_DEBUG=false
VITE_ENABLE_ERROR_MONITORING=true

# ----------------------------------
# Third-party Services (Optional)
# ----------------------------------
VITE_GOOGLE_ANALYTICS_ID=
VITE_MAPBOX_TOKEN=

# ----------------------------------
# Umami Analytics (Optional)
# ----------------------------------
VITE_UMAMI_WEBSITE_ID=
VITE_UMAMI_SRC=https://cloud.umami.is/script.js

# ----------------------------------
# New Relic Error Monitoring
# ----------------------------------
VITE_NEWRELIC_ACCOUNT_ID=YOUR_ACCOUNT_ID
VITE_NEWRELIC_TRUST_KEY=YOUR_TRUST_KEY
VITE_NEWRELIC_AGENT_ID=YOUR_AGENT_ID
VITE_NEWRELIC_LICENSE_KEY=YOUR_LICENSE_KEY
VITE_NEWRELIC_APPLICATION_ID=YOUR_APPLICATION_ID
VITE_NEWRELIC_AJAX_DENY_LIST=

# ----------------------------------
# Social Links (Required)
# ----------------------------------
VITE_GITHUB_URL=https://github.com/yourusername
VITE_LINKEDIN_URL=https://linkedin.com/in/yourprofile
VITE_EMAIL=your.email@example.com
```

## Need More Help?

- **Full Guide:** [NEWRELIC.md](./NEWRELIC.md)
- **Environment Vars:** [ENV.md](./ENV.md)
- **Troubleshooting:** See [NEWRELIC.md - Troubleshooting](./NEWRELIC.md#troubleshooting)

## What's Next?

Once set up, New Relic will automatically:

- ✅ Track all JavaScript errors
- ✅ Monitor page performance
- ✅ Capture AJAX requests
- ✅ Track Core Web Vitals
- ✅ Record user sessions

Check your dashboard at [https://one.newrelic.com](https://one.newrelic.com)
