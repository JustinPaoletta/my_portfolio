# 📊 Umami Analytics Guide

This portfolio uses [Umami Analytics](https://umami.is/) - a privacy-friendly, GDPR-compliant, open-source analytics solution that requires no cookies or consent banners.

## 🚀 Configuration

### Environment Variables

In your `.env` file:

```bash
# Enable Analytics
VITE_ENABLE_ANALYTICS=true
# Umami Configuration
VITE_UMAMI_WEBSITE_ID=your-website-id-here
VITE_UMAMI_SRC=https://cloud.umami.is/script.js
```

## 🔧 How It Works

### Project Structure

- **`src/utils/analytics.ts`** - Core analytics utility with Umami initialization
- **`src/hooks/useAnalytics.ts`** - React hook for easy event tracking
- **`src/main.tsx`** - Analytics initialized at app startup
- **`src/config/env.ts`** - Environment variable validation with Valibot

### Initialization

Analytics is automatically initialized when the app starts:

```typescript
// src/main.tsx
if (__ENABLE_ANALYTICS__) {
  void import('@/utils/analytics')
    .then(({ initializeAnalytics }) => initializeAnalytics())
    .catch((error) => {
      if (import.meta.env.DEV) {
        console.error('[Analytics] Failed to initialize', error);
      }
    });
}
```

The initialization:

- ✅ Checks if analytics is enabled
- ✅ Verifies website ID is configured
- ✅ Injects Umami script dynamically
- ✅ Compatible with strict CSP (external script from whitelisted domain)
- ✅ Loads asynchronously to avoid blocking page load

## 📈 What's Being Tracked

### Automatic Tracking

These are tracked automatically without any code:

- ✅ **Page Views** - Every route/page visit
- ✅ **Referrers** - Where visitors come from
- ✅ **Devices** - Desktop, mobile, tablet
- ✅ **Browsers** - Chrome, Firefox, Safari, etc.
- ✅ **Operating Systems** - Windows, macOS, Linux, iOS, Android
- ✅ **Countries** - Geographic location (country level only)

### Pre-configured Custom Events

| Event Name        | When It Fires           | Data Captured                         |
| ----------------- | ----------------------- | ------------------------------------- |
| `external_link`   | Clicking external links | URL, label                            |
| `project_click`   | Clicking project links  | Project name, link type (demo/github) |
| `resume_download` | Downloading resume/CV   | None                                  |
| `contact`         | Contact interactions    | Method (email/form/linkedin)          |
| `social_click`    | Social media links      | Platform name                         |
| `navigation`      | Section navigation      | Section name                          |
| `search`          | Search/filter usage     | Query, category                       |
| `error`           | Client-side errors      | Error type, message                   |

## 💻 How to Use

### In React Components

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function MyComponent() {
  const {
    trackProjectClick,
    trackResumeDownload,
    trackContact,
    trackExternalLink,
  } = useAnalytics();

  return (
    <>
      {/* Track project clicks */}
      <a
        href="https://github.com/yourname/project"
        onClick={() => trackProjectClick('My Project', 'github')}
      >
        View on GitHub
      </a>

      {/* Track resume downloads */}
      <a href="/resume.pdf" download onClick={trackResumeDownload}>
        Download Resume
      </a>

      {/* Track contact methods */}
      <button onClick={() => trackContact('email')}>Email Me</button>

      {/* Track external links */}
      <a
        href="https://example.com"
        onClick={() => trackExternalLink('https://example.com', 'Example')}
      >
        Visit Example
      </a>
    </>
  );
}
```

### Custom Events

Track any custom event with additional data:

```tsx
import { useAnalytics } from '@/hooks/useAnalytics';

function AdvancedComponent() {
  const { trackCustomEvent } = useAnalytics();

  const handleSpecialAction = () => {
    trackCustomEvent('special_action', {
      category: 'engagement',
      value: 'high',
      timestamp: new Date().toISOString(),
    });
  };

  return <button onClick={handleSpecialAction}>Special Action</button>;
}
```

### Direct Import (Outside React)

```typescript
import { analytics } from '@/utils/analytics';

// In a utility function or service
export function downloadFile(fileName: string) {
  analytics.trackResumeDownload();
  // ... download logic
}
```

### Available Functions

The `useAnalytics()` hook provides:

- `trackProjectClick(projectName, linkType)` - Track project link clicks
- `trackResumeDownload()` - Track resume/CV downloads
- `trackContact(method)` - Track contact interactions
- `trackSocialClick(platform)` - Track social media clicks
- `trackNavigation(section)` - Track section navigation
- `trackExternalLink(url, label?)` - Track external link clicks
- `trackSearch(query, category?)` - Track search/filter usage
- `trackError(errorType, errorMessage?)` - Track errors
- `trackCustomEvent(eventName, eventData?)` - Track custom events

## 🔒 Privacy & Compliance

### Why Umami is Privacy-Friendly

✅ **No Cookies** - Doesn't use cookies, no consent banner needed
✅ **No Personal Data** - Doesn't collect IP addresses or personal information
✅ **GDPR Compliant** - Follows EU privacy regulations
✅ **No Cross-Site Tracking** - Only tracks on your domain
✅ **Anonymous** - All data is anonymized

### Compliance Checklist

- ✅ No cookie consent required (no cookies used)
- ✅ GDPR compliant
- ✅ CCPA compliant
- ✅ PECR compliant
- ✅ Can be used for EU visitors without consent

## ⚙️ Configuration Options

### Advanced Script Options

The Umami script in `src/utils/analytics.ts` supports additional options:

```typescript
// Auto-track page views (enabled by default)
script.setAttribute('data-auto-track', 'true');

// Cache the tracking script (enabled by default)
script.setAttribute('data-cache', 'true');

// Only track on specific domains (optional)
// script.setAttribute('data-domains', 'yourportfolio.com,www.yourportfolio.com');

// Disable automatic tracking (if you want manual control)
// script.setAttribute('data-auto-track', 'false');
```

### Self-Hosted Option

If you prefer to self-host Umami:

1. Follow the [self-hosting guide](https://umami.is/docs/install)
2. Deploy to Railway, Vercel, DigitalOcean, or your own server
3. Update `VITE_UMAMI_SRC` to your custom domain:

```bash
VITE_UMAMI_SRC=https://your-umami-domain.com/script.js
```

## 📊 Analytics Dashboard

Access your analytics at:

- **Umami Cloud**: [https://cloud.umami.is](https://cloud.umami.is)
- **Self-hosted**: Your custom domain

### Key Metrics to Monitor

1. **Total Visitors** - Unique visitors to your portfolio
2. **Page Views** - Most popular pages/sections
3. **Bounce Rate** - % of single-page sessions
4. **Top Referrers** - Where visitors come from (LinkedIn, GitHub, etc.)
5. **Custom Events**:
   - Which projects get the most clicks?
   - How many resume downloads?
   - Which contact methods are preferred?

## 🧪 Testing

### Development Mode

In development, analytics events are logged to the console:

```bash
[Analytics] Umami initialized
[Analytics] Event tracked: external_link { url: "https://vite.dev", label: "Vite Logo" }
```

### Production Testing

1. Build and preview:

   ```bash
   npm run build
   npm run start:prod
   ```

2. Open browser DevTools → Network tab
3. Look for requests to your Umami script URL
4. Navigate and interact with your site
5. Check Umami dashboard for real-time events

### Disable Analytics Temporarily

Set in your `.env`:

```bash
VITE_ENABLE_ANALYTICS=false
```

## 🎯 Best Practices

### 1. Track Meaningful Interactions

Focus on events that help you understand:

- Which projects interest visitors most
- How visitors contact you
- What content gets the most engagement

### 2. Use Descriptive Event Names

```typescript
// ✅ Good
trackCustomEvent('portfolio_filter', { category: 'web' });

// ❌ Bad
trackCustomEvent('click', { thing: 'button' });
```

### 3. Don't Over-Track

Avoid tracking:

- Every button click
- Mouse movements
- Scroll depth (unless specifically needed)
- Form input values (privacy concern)

### 4. Monitor Performance

- Umami script is only ~2KB
- Loads asynchronously (doesn't block page load)
- Check bundle size with: `npm run build:analyze`

### 5. Regular Review

- Check dashboard weekly
- Look for traffic patterns
- Identify popular projects
- Optimize based on data

## 🚨 Troubleshooting

### Analytics Not Working

1. **Check Environment Variables**

   ```bash
   # Verify in your .env file
   VITE_ENABLE_ANALYTICS=true
   VITE_UMAMI_WEBSITE_ID=your-website-id
   ```

2. **Check Browser Console**
   - Look for `[Analytics] Umami initialized` message
   - Check for JavaScript errors
   - Ensure no ad blockers are active

3. **Verify Script Loading**
   - Open DevTools → Network tab
   - Look for request to Umami script
   - Should see 200 OK status

4. **Check Umami Dashboard**
   - Verify website ID matches
   - Check if website is active
   - Look at real-time visitors

### Events Not Tracking

1. **Check if Umami is loaded:**

   ```javascript
   console.log(window.umami); // Should not be undefined
   ```

2. **Verify analytics is enabled:**

   ```javascript
   console.log(import.meta.env.VITE_ENABLE_ANALYTICS);
   ```

3. **Check for typos in event names**

### Common Issues

| Issue                        | Solution                                  |
| ---------------------------- | ----------------------------------------- |
| Script blocked by ad blocker | Disable ad blocker or use first-party URL |
| CORS errors                  | Verify Umami src URL is correct           |
| No data in dashboard         | Wait 5-10 minutes, data isn't instant     |
| Wrong website ID             | Double-check ID in Umami dashboard        |

## 💡 Tips for Portfolio Sites

### Showcase Your Data

Consider adding an analytics section to your portfolio:

```tsx
// Show visitor count, popular projects, etc.
<Stats totalVisitors={12500} topProject="Project X" />
```

### UTM Parameters

Share your portfolio with UTM parameters:

```
https://yourportfolio.com/?utm_source=linkedin&utm_medium=social&utm_campaign=job_search
```

Track which platforms drive the most traffic!

### A/B Testing

Test different approaches:

- Project descriptions
- CTA button text
- Portfolio layout
- Contact methods

Use event data to see what works best.

## 📚 Additional Resources

- [Umami Documentation](https://umami.is/docs)
- [Umami Cloud](https://cloud.umami.is)
- [Umami GitHub](https://github.com/umami-software/umami)
- [Self-Hosting Guide](https://umami.is/docs/install)
- [API Reference](https://umami.is/docs/api)

---

**Questions or Issues?**
Check the [Umami Discussions](https://github.com/umami-software/umami/discussions) or open an issue in this repository.
