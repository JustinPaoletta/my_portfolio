# PWA Guide

The app uses `vite-plugin-pwa` with the configuration in `src/pwa-config.ts`.

## What the Current Setup Does

- generates `manifest.webmanifest` during production builds
- generates `sw.js` and Workbox runtime files during production builds
- precaches the built app shell and local assets
- shows an in-app update prompt through `src/components/pwa-update-prompt`
- keeps PWA features disabled in normal dev mode (`devOptions.enabled = false`)

## Key Files

- `src/pwa-config.ts`
- `src/hooks/usePWA.ts`
- `src/components/pwa-update-prompt/index.tsx`
- `vercel.json`

## Manifest Assets

The manifest and included assets currently reference:

- `branding/JP-no-cursor.svg`
- `favicons/favicon-48x48.png`
- `favicons/apple-touch-icon.png`
- `favicons/pwa-192x192.png`
- `favicons/pwa-512x512.png`
- `og/og-image.png`
- `robots.txt`
- `sitemap.xml`

Generate the PNG icon set from the SVG source with:

```bash
npm run generate:icons
```

## Runtime Caching Rules

| Pattern             | Strategy               | Notes                                                                   |
| ------------------- | ---------------------- | ----------------------------------------------------------------------- |
| Remote images       | `CacheFirst`           | 30-day cache                                                            |
| Remote JS and CSS   | `StaleWhileRevalidate` | 7-day cache                                                             |
| Google Fonts URLs   | `CacheFirst`           | Configured, but the current app ships fonts locally from `public/fonts` |
| `/api/*` over HTTPS | `NetworkFirst`         | 5-minute cache with 10-second timeout                                   |

Most local assets are handled by the precache, not those runtime rules.

## Build and Preview

```bash
npm run build
npm run start:prod
```

Use the production preview when testing service workers. Plain `npm run start:dev` does not enable the PWA.

## Testing Checklist

1. Open the production preview.
2. In DevTools, check `Application -> Manifest`.
3. Confirm `sw.js` is registered under `Application -> Service Workers`.
4. Reload once while online so the cache is populated.
5. Switch DevTools to offline mode and verify the app shell still loads.
6. Deploy a change and confirm the in-app update prompt appears.

## Common Issues

### Service worker never registers

- Test a production build, not the dev server
- Make sure the site is served over HTTPS or `localhost`
- Confirm `dist/sw.js` exists after `npm run build`

### Manifest does not load

- Check `vercel.json` for the explicit manifest headers
- Confirm `dist/manifest.webmanifest` exists
- Verify the CSP still includes `manifest-src 'self'`

### Old content sticks after deploy

- The project uses `registerType: 'autoUpdate'`
- The prompt component can trigger an immediate reload
- If needed, clear site data in DevTools and reload once

## Deployment Notes

- `VITE_SITE_URL` affects generated `sitemap.xml` and `robots.txt`
- `VITE_SITE_URL` does not change the manifest asset paths
- `vercel.json` sets headers for `manifest.webmanifest` and `sw.js`

## Related Docs

- [Vercel deployment](VERCEL_DEPLOYMENT.md)
- [Content Security Policy](CSP.md)
- [SEO architecture](SEO.md)
