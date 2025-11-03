# Content Security Policy (CSP) Configuration

This project uses Content Security Policy to enhance security by restricting what resources can be loaded and executed.

## Overview

CSP headers are set via `vercel.json` and ensure that:

- Only trusted scripts from whitelisted domains can execute
- Inline scripts are blocked (improving XSS protection)
- External resources are restricted to approved sources
- Data exfiltration is limited

## Current CSP Policy

The CSP is defined in `vercel.json` and applies to all requests:

```
default-src 'self';
script-src 'self' https://cloud.umami.is https://vercel.live;
style-src 'self';
img-src 'self' data: https:;
font-src 'self' data:;
connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live https://bam.nr-data.net;
frame-ancestors 'none';
base-uri 'self';
form-action 'self';
manifest-src 'self';
```

## Directive Explanations

### `default-src 'self'`

- Default fallback for all resource types
- Only allows resources from the same origin

### `script-src 'self' https://cloud.umami.is https://vercel.live`

- Allows scripts from same origin and Umami analytics
- **No inline scripts allowed** - all scripts must be external with `src` attribute
- `vercel.live` for Vercel's live preview functionality

### `style-src 'self'`

- Allows stylesheets from same origin only
- Inline `style` attributes are allowed (different from `<style>` tags)
- React's inline styles work fine

### `img-src 'self' data: https:`

- Allows images from same origin, data URIs, and any HTTPS URL
- Necessary for external images (GitHub avatars, project screenshots, etc.)

### `font-src 'self' data:`

- Allows fonts from same origin and data URIs
- Sufficient for most use cases

### `connect-src 'self' ...`

- Controls AJAX, WebSocket, and fetch requests
- Whitelisted domains:
  - `cloud.umami.is` & `api-gateway.umami.dev` - Umami analytics
  - `vercel.live` - Vercel live preview
  - `bam.nr-data.net` - New Relic error monitoring

### `frame-ancestors 'none'`

- Prevents the site from being embedded in frames/iframes
- Protects against clickjacking attacks

### `base-uri 'self'`

- Restricts `<base>` tag URLs to same origin
- Prevents base tag hijacking

### `form-action 'self'`

- Restricts form submissions to same origin
- Prevents form data exfiltration

### `manifest-src 'self'`

- Allows PWA manifest from same origin
- Required for service worker registration

## Why No Nonces?

This project **does not use CSP nonces** because:

1. ✅ **All scripts are external** - Vite bundles scripts with `src` attributes, no inline code
2. ✅ **All dynamically injected scripts** come from whitelisted domains (Umami)
3. ✅ **No inline `<style>` tags** - all styles are external CSS files
4. ✅ **React inline styles** use `style` attributes (not `<style>` tags) - CSP allows these
5. ✅ **Modern dependencies** - New Relic is imported as ES module, not injected

Nonces are only needed for inline scripts/styles. Since we don't have any, nonces are unnecessary.

## Adding New External Services

When adding new third-party scripts or services:

1. **External Scripts**: Add the domain to `script-src`

   ```json
   "script-src 'self' https://cloud.umami.is https://new-service.com"
   ```

2. **API/Fetch Requests**: Add the domain to `connect-src`

   ```json
   "connect-src 'self' ... https://api.newservice.com"
   ```

3. **Fonts**: If using external fonts, update `font-src`
   ```json
   "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com"
   ```

## Files Involved

### `vercel.json`

- Sets CSP header on all responses
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

- ✅ **XSS Protection** - Inline scripts blocked
- ✅ **Data Exfiltration Prevention** - Limited external connections
- ✅ **Clickjacking Protection** - `frame-ancestors 'none'`
- ✅ **Base Tag Protection** - `base-uri 'self'`
- ✅ **Form Protection** - `form-action 'self'`

## Troubleshooting

### Scripts Not Loading

- Check browser console for CSP violation messages
- Verify domain is whitelisted in `script-src`
- Ensure script uses `src` attribute (not inline code)

### Styles Not Applying

- React inline styles (via `style` prop) work fine
- External CSS must be from `'self'`
- Check if you're trying to use `<style>` tags (not allowed without nonces)

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
