# PWA (Progressive Web App) Setup Guide

Your portfolio is now configured as a Progressive Web App with offline support, caching strategies, and installability features.

## 🎯 What's Included

### Core Features

- ✅ **Offline Support** - Works without internet connection
- ✅ **Installable** - Can be added to home screen on mobile/desktop
- ✅ **Auto-Updates** - Automatically checks for and prompts updates
- ✅ **Service Worker** - Handles caching and offline functionality
- ✅ **Web App Manifest** - Defines app metadata and appearance
- ✅ **Cache Strategies** - Optimized caching for different resource types

### Caching Strategies

| Resource Type  | Strategy               | Cache Duration |
| -------------- | ---------------------- | -------------- |
| Images (local) | Cache First            | 30 days        |
| CSS/JS files   | Stale While Revalidate | 7 days         |
| Google Fonts   | Cache First            | 1 year         |
| API calls      | Network First          | 5 minutes      |

## 🚀 Quick Start

### Build Your PWA

```bash
# Build for production (includes PWA generation)
npm run build

# Preview the PWA locally
npm run start:prod
```

The PWA assets are automatically generated during build:

- Service Worker (`sw.js`)
- Web App Manifest (`manifest.webmanifest`)
- Workbox runtime files

## 🎨 Generating PWA Icons

You need to create two PWA icons and place them in the `public/` folder:

### Required Icons

- `public/pwa-192x192.png` (192x192 pixels)
- `public/pwa-512x512.png` (512x512 pixels)

### Quick Generation Methods

#### Option 1: Use PWA Asset Generator (Recommended)

```bash
# Install globally
npm install -g pwa-asset-generator

# Generate from a single source image (1024x1024 recommended)
pwa-asset-generator path/to/logo.png public/ \
  --icon-only \
  --favicon \
  --type png
```

#### Option 2: Online Tools

Use these free online tools:

- **[Favicon.io PWA Generator](https://favicon.io/)** - Simple and fast
- **[RealFaviconGenerator](https://realfavicongenerator.net/)** - Comprehensive
- **[PWA Builder](https://www.pwabuilder.com/imageGenerator)** - Microsoft tool

#### Option 3: Manual Creation

Use any image editor (Photoshop, GIMP, Figma, etc.):

1. Start with a square logo (1024x1024px minimum)
2. Export as PNG at 512x512px → save as `pwa-512x512.png`
3. Export as PNG at 192x192px → save as `pwa-192x192.png`
4. Place both files in the `public/` folder

### Icon Guidelines

- **Format**: PNG with transparent background
- **Safe Zone**: Keep important content in the center 80% of the image
- **Simple Design**: Icons should be recognizable at small sizes
- **No Text**: Avoid small text that won't be readable
- **Padding**: Add some padding around the main graphic

## ⚙️ Configuration

### Manifest Settings

Edit `src/pwa-config.ts` to customize your PWA:

```typescript
manifest: {
  name: 'My Portfolio',           // Full app name
  short_name: 'Portfolio',        // Short name for home screen
  description: '...',              // App description
  theme_color: '#242424',         // Browser theme color
  background_color: '#242424',    // Splash screen background
  display: 'standalone',          // Display mode
  // ... more options
}
```

### Cache Configuration

Customize caching in `src/pwa-config.ts`:

```typescript
workbox: {
  runtimeCaching: [
    {
      urlPattern: /your-pattern/,
      handler: 'CacheFirst', // or NetworkFirst, StaleWhileRevalidate
      options: {
        cacheName: 'your-cache-name',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 30 * 24 * 60 * 60,
        },
      },
    },
  ],
}
```

### Available Cache Strategies

| Strategy                 | When to Use                | Behavior                               |
| ------------------------ | -------------------------- | -------------------------------------- |
| **CacheFirst**           | Static assets, images      | Check cache first, fallback to network |
| **NetworkFirst**         | API calls, dynamic content | Try network first, fallback to cache   |
| **StaleWhileRevalidate** | CSS, JS files              | Serve from cache, update in background |
| **NetworkOnly**          | Always fresh data          | Never cache, always network            |
| **CacheOnly**            | Offline-only content       | Never use network, only cache          |

## 🧪 Testing Your PWA

### Local Testing

1. **Build the production version:**

   ```bash
   npm run build
   npm run start:prod
   ```

2. **Open Chrome DevTools:**
   - Go to `Application` tab
   - Check `Manifest` section
   - Check `Service Workers` section
   - Test offline in `Network` tab

3. **Lighthouse Audit:**
   - Open Chrome DevTools
   - Go to `Lighthouse` tab
   - Run PWA audit
   - Aim for 100% PWA score

### Testing Checklist

- [ ] Icons load correctly in manifest
- [ ] Service worker registers successfully
- [ ] App works offline (disconnect network)
- [ ] Update prompt appears when changes are made
- [ ] App can be installed (look for install prompt)
- [ ] Cache sizes are reasonable
- [ ] Lighthouse PWA score is 90+

### Testing Offline Mode

1. Build and serve your app
2. Open DevTools → Network tab
3. Select "Offline" from throttling dropdown
4. Reload the page
5. App should still work! ✅

## 📱 Installation

### Desktop (Chrome/Edge)

Users will see an install button in the address bar:

- Click the install icon (+) in the address bar
- Or: Settings menu → "Install [App Name]"

### Mobile (Android/iOS)

**Android (Chrome):**

- Tap menu (⋮) → "Add to Home Screen"
- Or automatic install prompt

**iOS (Safari):**

- Tap share button (↑)
- Scroll down and tap "Add to Home Screen"

## 🔄 Update Flow

When you deploy a new version:

1. Service worker detects the update
2. Update prompt appears to users
3. User clicks "Reload"
4. New version activates immediately

### Force Update (Development)

```bash
# Unregister service worker in DevTools
# Application → Service Workers → Unregister

# Or use Skip Waiting
# Application → Service Workers → Click "skipWaiting"
```

## 🛠️ Troubleshooting

### Service Worker Not Registering

**Issue:** Service worker doesn't register in production

**Solutions:**

- Ensure site is served over HTTPS (or localhost)
- Check browser console for errors
- Verify `sw.js` exists in `dist/` after build
- Clear browser cache and reload

### Icons Not Showing

**Issue:** PWA icons don't appear in manifest

**Solutions:**

- Verify icon files exist in `public/` folder
- Check file names match exactly: `pwa-192x192.png`, `pwa-512x512.png`
- Rebuild the project: `npm run build`
- Clear manifest cache in DevTools

### Offline Mode Not Working

**Issue:** App doesn't work offline

**Solutions:**

- Check service worker status in DevTools
- Verify caching strategies in `src/pwa-config.ts`
- Test after visiting the site at least once while online
- Check Network tab for cached requests

### Old Content After Update

**Issue:** Users see old content after deployment

**Solutions:**

- Ensure `updateServiceWorker(true)` is called on update
- Set `skipWaiting: true` in workbox config
- Clear all caches: DevTools → Application → Clear Storage

## 📊 Monitoring PWA Performance

### Key Metrics to Track

- **Install Rate:** How many users install your PWA
- **Offline Usage:** How often users access offline
- **Cache Hit Rate:** Percentage of requests served from cache
- **Update Adoption:** How quickly users update to new versions

### Using Chrome DevTools

```
DevTools → Application Tab:
- Manifest: Check metadata and icons
- Service Workers: Monitor status and updates
- Cache Storage: View cached resources
- Storage: Check storage usage
```

## 🚀 Production Deployment

### Environment Variables

Add to your Vercel deployment (Settings → Environment Variables):

```env
VITE_SITE_URL=https://yourdomain.com
```

This ensures the manifest uses the correct URLs.

### Deployment Checklist

- [ ] PWA icons generated and in `public/`
- [ ] `VITE_SITE_URL` environment variable set
- [ ] Build succeeds without errors
- [ ] Service worker generates correctly
- [ ] Manifest contains correct URLs
- [ ] HTTPS enabled (required for PWA)
- [ ] Test PWA score with Lighthouse

## 🔒 Security Considerations

### HTTPS Required

PWAs **require HTTPS** to work (except on localhost for development).

### Content Security Policy (CSP)

If you add CSP headers, allow service worker scripts:

```
Content-Security-Policy: script-src 'self' 'unsafe-inline'
```

### Cache Security

- Don't cache sensitive user data
- Use secure cache names
- Clear caches on logout (if you have auth)

## 📚 Additional Resources

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [vite-plugin-pwa Docs](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

## 💡 Pro Tips

1. **Start Simple:** Begin with basic caching, optimize later
2. **Test Offline:** Always test offline functionality before deploying
3. **Monitor Size:** Keep service worker bundle size small
4. **Update Frequently:** Don't let caches become stale
5. **User Choice:** Always give users control over updates
6. **Analytics:** Track PWA installation and usage metrics
