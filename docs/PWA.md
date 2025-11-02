# 📱 Progressive Web App (PWA) Guide

Your portfolio is configured as a Progressive Web App with offline support, caching strategies, and installability features.

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

### 1. Generate PWA Icons

You need two icon files in your `public/` folder:

- `pwa-192x192.png` (192 × 192 pixels)
- `pwa-512x512.png` (512 × 512 pixels)

#### Fastest Method: Online Generator

**Option 1: Favicon.io (Easiest)**

1. Go to [https://favicon.io/favicon-converter/](https://favicon.io/favicon-converter/)
2. Upload your logo (PNG or JPG)
3. Click "Download"
4. Extract the zip file
5. Copy `android-chrome-192x192.png` → Rename to `pwa-192x192.png`
6. Copy `android-chrome-512x512.png` → Rename to `pwa-512x512.png`
7. Move both files to your `public/` folder

**Option 2: PWA Builder (Recommended)**

1. Go to [https://www.pwabuilder.com/imageGenerator](https://www.pwabuilder.com/imageGenerator)
2. Upload your logo (1024×1024 recommended)
3. Adjust padding if needed
4. Click "Download"
5. Extract and rename:
   - `android-chrome-192.png` → `pwa-192x192.png`
   - `android-chrome-512.png` → `pwa-512x512.png`
6. Move to `public/` folder

**Option 3: Command Line**

```bash
# Install globally
npm install -g pwa-asset-generator

# Generate from a single source image (1024x1024 recommended)
pwa-asset-generator path/to/logo.png public/ \
  --icon-only \
  --type png \
  --background "#242424" \
  --padding "10%"
```

### 2. Build Your PWA

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

### 3. Test Your PWA

1. **Open Chrome DevTools:**
   - Go to `Application` tab
   - Check `Manifest` section (icons should be listed)
   - Check `Service Workers` section (should be active)
   - Test offline in `Network` tab

2. **Lighthouse Audit:**
   - Open Chrome DevTools
   - Go to `Lighthouse` tab
   - Run PWA audit
   - Aim for 100% PWA score

## 🔧 How It's Configured

### Project Structure

- **`src/pwa-config.ts`** - PWA configuration (manifest, workbox, etc.)
- **`vite.config.ts`** - Includes `VitePWA` plugin
- **`public/pwa-*.png`** - PWA icons (192x192 and 512x512)

### Configuration Files

The PWA is configured via `src/pwa-config.ts`. Key settings:

```typescript
export const pwaConfig = {
  manifest: {
    name: 'JP - Engineering', // Full app name
    short_name: 'Portfolio', // Short name for home screen
    description: '...', // App description
    theme_color: '#242424', // Browser theme color
    background_color: '#242424', // Splash screen background
    display: 'standalone', // Display mode
    icons: [
      {
        src: '/pwa-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  },
  workbox: {
    // Caching strategies
    runtimeCaching: [
      /* ... */
    ],
  },
};
```

## ⚙️ Customization

### Manifest Settings

Edit `src/pwa-config.ts` to customize your PWA:

```typescript
manifest: {
  name: 'JP - Engineering',
  short_name: 'Portfolio',
  description: 'My personal portfolio website',
  theme_color: '#242424',
  background_color: '#242424',
  display: 'standalone', // or 'fullscreen', 'minimal-ui', 'browser'
  start_url: '/',
  scope: '/',
}
```

### Cache Configuration

Customize caching strategies in `src/pwa-config.ts`:

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
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
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

## 🧪 Testing

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

### Check Icons in Browser

1. Build your project: `npm run build`
2. Open DevTools (F12)
3. Go to **Application** tab
4. Click **Manifest** in the sidebar
5. Verify icons are listed and load correctly

## 🎨 Icon Guidelines

### Source Image Guidelines

| Aspect      | Recommendation                        |
| ----------- | ------------------------------------- |
| **Size**    | 1024×1024 pixels (or larger)          |
| **Format**  | PNG with transparent background       |
| **Content** | Keep important elements in center 80% |
| **Design**  | Simple, recognizable at small sizes   |
| **Text**    | Avoid (or use large, bold text only)  |
| **Colors**  | High contrast, 2-3 colors max         |

### What Makes a Good PWA Icon?

✅ **Good:**

- Simple geometric shapes
- Single letter/monogram
- Iconic symbol
- Bold colors
- Transparent background

❌ **Avoid:**

- Complex illustrations
- Small text
- Detailed photos
- Thin lines
- Gradients (use sparingly)

### Manual Creation (Photoshop/GIMP)

1. **Open your logo** (high resolution)
2. **Canvas size:** Make it square (e.g., 1024×1024)
3. **Center your logo**
4. **Add padding:** Keep logo in center ~80% area
5. **Export 512×512:**
   - File → Export → PNG
   - Width: 512, Height: 512
   - Name: `pwa-512x512.png`
6. **Export 192×192:**
   - Resize to 192×192
   - Export as `pwa-192x192.png`
7. **Move to `public/` folder**

## 🚨 Troubleshooting

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

**If icons look blurry:**

- Use a higher resolution source image
- Export at exact sizes (don't let browser scale)
- Use PNG format, not JPG

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

### Manifest 401 Unauthorized Error

**Issue:** Console error: "GET /manifest.webmanifest 401 (Unauthorized)"

**Solutions:**

1. **Add explicit manifest configuration in `vercel.json`:**

```json
{
  "rewrites": [
    {
      "source": "/manifest.webmanifest",
      "destination": "/manifest.webmanifest"
    }
  ],
  "headers": [
    {
      "source": "/manifest.webmanifest",
      "headers": [
        {
          "key": "Content-Type",
          "value": "application/manifest+json"
        },
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    }
  ]
}
```

2. **Add `manifest-src` to CSP:**

```
Content-Security-Policy: manifest-src 'self';
```

3. **Verify manifest is generated:**

```bash
npm run build
ls -la dist/manifest.webmanifest
```

### CSP Violation for Vercel Live Scripts

**Issue:** Console error: "Refused to load the script 'https://vercel.live/_next-live/feedback/feedback.js'"

**Solution:**

Add `https://vercel.live` to your CSP in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "script-src 'self' 'unsafe-inline' https://cloud.umami.is https://vercel.live; connect-src 'self' https://vercel.live;"
        }
      ]
    }
  ]
}
```

**Note:** This only affects Vercel preview deployments, not production.

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

## 💡 Pro Tips

1. **Start Simple:** Begin with basic caching, optimize later
2. **Test Offline:** Always test offline functionality before deploying
3. **Monitor Size:** Keep service worker bundle size small
4. **Update Frequently:** Don't let caches become stale
5. **User Choice:** Always give users control over updates
6. **Analytics:** Track PWA installation and usage metrics

## 📚 Additional Resources

### Documentation

- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [vite-plugin-pwa Docs](https://vite-pwa-org.netlify.app/)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

### Icon Tools

- [PWA Icons Guidelines](https://web.dev/add-manifest/#icons)
- [Maskable Icons Editor](https://maskable.app/)
- [Android Adaptive Icons](https://developer.android.com/develop/ui/views/launch/icon_design_adaptive)

---

**Remember**: PWAs require HTTPS (except localhost). Always test offline functionality before deploying to production.
