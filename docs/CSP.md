# Content Security Policy (CSP) Configuration

This project uses Content Security Policy to enhance security by restricting what resources can be loaded and executed.

## Overview

CSP headers are set via `vercel.json` and ensure that:

- Only trusted scripts from whitelisted domains can execute
- External resources are restricted to approved sources
- Data exfiltration is limited through controlled `connect-src`
- Clickjacking is prevented via `frame-ancestors`

## Current CSP Policy

The CSP is defined in `vercel.json` and applies to all Vercel deployments.

```
default-src 'self';
script-src 'self' 'unsafe-inline' https://cloud.umami.is https://vercel.live;
script-src-attr 'none';
object-src 'none';
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
img-src 'self' data: https:;
font-src 'self' data: https://fonts.gstatic.com;
connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live https://bam.nr-data.net https://api.github.com;
frame-src 'self' https://vercel.live;
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
manifest-src 'self';
upgrade-insecure-requests;
```

## Directive Explanations

### `default-src 'self'`

- Default fallback for all resource types
- Only allows resources from the same origin

### `script-src 'self' 'unsafe-inline' https://cloud.umami.is https://vercel.live`

- Allows scripts from same origin, Umami analytics, and Vercel live preview
- `'unsafe-inline'` is required because Vite may inject inline scripts
- `vercel.live` for Vercel's live preview functionality (preview toolbar, comments)

### `script-src-attr 'none'`

- Blocks inline event handlers like `onclick="..."` in HTML attributes
- These are a common XSS vector and should use addEventListener instead

### `object-src 'none'`

- Blocks `<object>`, `<embed>`, and `<applet>` elements
- Prevents Flash and other plugin-based attacks

### `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`

- Allows stylesheets from same origin and Google Fonts
- `'unsafe-inline'` allows inline styles (Vite may inject these, React style props)

### `img-src 'self' data: https:`

- Allows images from same origin, data URIs, and any HTTPS URL
- Necessary for external images (GitHub avatars, project screenshots, etc.)

### `font-src 'self' data: https://fonts.gstatic.com`

- Allows fonts from same origin, data URIs, and Google Fonts CDN
- `fonts.gstatic.com` serves the actual font files (while `fonts.googleapis.com` serves the CSS)

### `connect-src 'self' ...`

- Controls AJAX, WebSocket, and fetch requests
- Whitelisted domains:
  - `cloud.umami.is` & `api-gateway.umami.dev` - Umami analytics
  - `vercel.live` - Vercel live preview
  - `bam.nr-data.net` - New Relic error monitoring
  - `api.github.com` - GitHub API for fetching profile and repository data

### `frame-src 'self' https://vercel.live`

- Controls what can be loaded in `<iframe>` elements
- `vercel.live` is needed for Vercel's preview toolbar iframe

### `frame-ancestors 'self'`

- Only allows the site to be embedded in iframes on the same origin
- Protects against clickjacking attacks from external sites
- Use `'none'` instead if you never need iframes

### `base-uri 'self'`

- Restricts `<base>` tag URLs to same origin
- Prevents base tag hijacking

### `form-action 'self'`

- Restricts form submissions to same origin
- Prevents form data exfiltration

### `manifest-src 'self'`

- Allows PWA manifest from same origin
- Required for PWA installability

### `upgrade-insecure-requests`

- Automatically upgrades HTTP requests to HTTPS
- Ensures all resources are loaded securely

## Why `'unsafe-inline'` Instead of Nonces?

This project uses `'unsafe-inline'` instead of CSP nonces because:

1. **Vercel injects scripts** - Vercel's preview toolbar injects scripts without nonces, which would be blocked by a strict nonce-based CSP
2. **Simpler configuration** - One CSP in `vercel.json`, no build-time nonce generation needed
3. **`script-src-attr 'none'` still protects** - Inline event handlers (`onclick="..."`) are still blocked, which is a major XSS vector

**Trade-off:** `'unsafe-inline'` is less secure than nonces because it allows any inline script. However:

- Your main scripts are external (bundled by Vite)
- Inline event handlers are still blocked
- XSS via injected `<script>` tags would need to bypass other protections first

**To use nonces instead:** You'd need to generate nonces at build time, add them to all script tags, and ensure Vercel's scripts have nonces (which isn't possible for preview deployments).

## Adding New External Services

When adding new third-party scripts or services, update `vercel.json`:

1. **External Scripts**: Add the domain to `script-src`

   ```
   script-src 'self' 'unsafe-inline' https://cloud.umami.is https://vercel.live https://new-service.com
   ```

2. **API/Fetch Requests**: Add the domain to `connect-src`

   ```
   connect-src 'self' ... https://api.newservice.com
   ```

3. **Fonts**: Add CSS source to `style-src`, font files to `font-src`
   ```
   style-src 'self' 'unsafe-inline' https://fonts.googleapis.com
   font-src 'self' data: https://fonts.gstatic.com
   ```

## Files Involved

### `vercel.json`

- Sets CSP header on all responses for Vercel deployments
- Located at project root
- Applied via Vercel's header configuration

## Testing CSP

### Browser DevTools

1. Open DevTools → Network tab
2. Check response headers for `Content-Security-Policy`
3. Open Console tab - check for CSP violation warnings

### Common Violations

**Blocked Script:**

```
Refused to load the script 'https://example.com/script.js' because it violates
the following Content Security Policy directive: "script-src 'self' ..."
```

**Solution**: Add domain to `script-src` in `vercel.json`

**Blocked Fetch:**

```
Refused to connect to 'https://api.example.com' because it violates
the following Content Security Policy directive: "connect-src 'self' ..."
```

**Solution**: Add domain to `connect-src` in `vercel.json`

### CSP Report-Only Mode

To test CSP without blocking resources, temporarily change the header key in `vercel.json`:

```json
{
  "key": "Content-Security-Policy-Report-Only",
  "value": "..."
}
```

This reports violations without blocking them. Check browser console for reports.

## Security Benefits

- ✅ **XSS Protection** - Inline event handlers blocked (`script-src-attr 'none'`)
- ✅ **Plugin Attacks Blocked** - `object-src 'none'` blocks Flash/plugins
- ✅ **Data Exfiltration Prevention** - Limited external connections via `connect-src`
- ✅ **Clickjacking Protection** - `frame-ancestors 'self'`
- ✅ **Base Tag Protection** - `base-uri 'self'`
- ✅ **Form Protection** - `form-action 'self'`
- ✅ **HTTPS Enforced** - `upgrade-insecure-requests`

## Troubleshooting

### Scripts Not Loading

- Check browser console for CSP violation messages
- Verify domain is whitelisted in `script-src`
- Ensure script uses `src` attribute (not inline code)

### Styles Not Applying

- React inline styles (via `style` prop) work fine
- External CSS must be from `'self'` or `fonts.googleapis.com`
- Inline `<style>` tags are allowed (we use `'unsafe-inline'`)

### API Calls Failing

- Check `connect-src` directive includes the API domain
- Verify network requests in DevTools → Network tab

### Service Worker Issues

- Ensure `manifest-src 'self'` is present
- Service worker registration doesn't need nonces
- Check that service worker file is served from same origin

## Additional Resources

- [MDN: Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Test your CSP policy
- [CSP Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
