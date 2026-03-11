# Content Security Policy

The production CSP is defined in `vercel.json`. This document summarizes the current policy and what each directive is protecting.

## Current Policy

```text
default-src 'self';
script-src 'self' 'unsafe-inline' https://cloud.umami.is https://vercel.live;
script-src-attr 'none';
object-src 'none';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live https://bam.nr-data.net https://api.github.com;
frame-src 'self' https://vercel.live;
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
manifest-src 'self';
upgrade-insecure-requests;
```

## What Changed Recently

- Fonts are served locally from `public/fonts`, so the policy no longer needs `fonts.googleapis.com` or `fonts.gstatic.com`.
- The `style-src` directive is now same-origin only plus inline styles.
- `connect-src` is limited to Umami, Vercel Live preview tooling, New Relic, and the public GitHub API.

## Directive Notes

- `default-src 'self'`
  Only same-origin resources are allowed unless a more specific directive overrides it.
- `script-src 'self' 'unsafe-inline' https://cloud.umami.is https://vercel.live`
  Allows the app bundle, Umami, and Vercel preview tooling. Inline scripts are still allowed because Vite and preview tooling can inject them.
- `script-src-attr 'none'`
  Blocks inline event-handler attributes such as `onclick`.
- `object-src 'none'`
  Disables legacy plugin content.
- `style-src 'self' 'unsafe-inline'`
  Allows same-origin stylesheets plus inline styles.
- `img-src 'self' data: https:`
  Allows local images, data URLs, and remote HTTPS images such as GitHub avatars.
- `font-src 'self' data:`
  Allows locally hosted fonts and data URLs.
- `connect-src ...`
  Allows fetch/XHR/WebSocket style connections only to explicitly approved origins.
- `frame-src 'self' https://vercel.live`
  Required for Vercel preview overlays.
- `frame-ancestors 'self'`
  Prevents third-party sites from embedding the app.
- `manifest-src 'self'`
  Allows the generated `manifest.webmanifest`.
- `upgrade-insecure-requests`
  Forces insecure requests to upgrade to HTTPS where possible.

## Source Files

- `vercel.json` - CSP and related security headers
- `docs/PWA.md` - manifest and service worker behavior
- `docs/OBSERVABILITY.md` - Umami and New Relic integration

## When You Add a New External Service

Update `vercel.json` based on what the service actually needs:

- Add script origins to `script-src`
- Add API origins to `connect-src`
- Add image/CDN origins to `img-src`
- Add iframe origins to `frame-src`

Do not widen directives casually. Prefer adding the smallest possible origin set.

## Testing

1. Deploy or run through `vercel dev`.
2. Open DevTools.
3. Check the response headers for `Content-Security-Policy`.
4. Watch the console for CSP violations while exercising the app.

If a resource is blocked, fix `vercel.json` and redeploy. Lighthouse CI does not validate the production CSP because its static server does not send these headers.
