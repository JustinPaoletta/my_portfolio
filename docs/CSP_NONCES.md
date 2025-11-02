# CSP Nonces Implementation Guide

## Overview

This document explains the CSP (Content Security Policy) nonce implementation for removing `'unsafe-inline'` and `'unsafe-eval'` directives. Nonces provide a more secure approach to CSP by allowing only scripts/styles with matching nonces to execute.

## Important Limitations

### ⚠️ `'unsafe-eval'` Still Required

**You still need `'unsafe-eval'` in your CSP** because:

- Zod v4 uses `new Function()` internally for dynamic schema compilation
- **Nonces cannot replace `'unsafe-eval'`** - nonces only work for inline scripts/styles, not for `eval()` or `new Function()`
- To remove `'unsafe-eval'`, you would need to:
  - Downgrade Zod to v3.x (which doesn't use `new Function()`)
  - Or replace Zod with an alternative validation library
  - Or accept that `'unsafe-eval'` is needed for your use case

### What Nonces Solve

- ✅ **Remove `'unsafe-inline'` from `script-src`** - All inline scripts must have a matching nonce
- ✅ **Remove `'unsafe-inline'` from `style-src`** - All inline styles must have a matching nonce
- ✅ **Better security** - Only scripts/styles with valid nonces can execute

## Implementation Details

### 1. Vercel Edge Middleware (`middleware.ts`)

The middleware:

- Generates a unique, cryptographically secure nonce for each request
- Injects nonces into HTML `<script>` and `<style>` tags
- Adds a `<meta name="csp-nonce">` tag for client-side access
- Sets the CSP header with the nonce

**Note**: The middleware may need adjustment based on how Vercel serves your static files. Test thoroughly after deployment.

### 2. Nonce Utility (`src/utils/nonce.ts`)

Provides client-side utilities to:

- Get the current nonce from the meta tag
- Apply nonces to dynamically created script/style elements

### 3. Analytics Integration

The analytics script (`src/utils/analytics.ts`) has been updated to:

- Apply nonces to dynamically injected Umami analytics script
- Use `'strict-dynamic'` to allow scripts loaded by nonced scripts

### 4. CSP Policy Updates

The CSP policy in `vercel.json` has been updated to:

- Use `'strict-dynamic'` instead of `'unsafe-inline'` for scripts
- Remove `'unsafe-inline'` from styles (nonces handle this)
- **Still includes `'unsafe-eval'`** (required for Zod)

**Current CSP** (in `vercel.json` - fallback, middleware will override):

```
script-src 'self' 'strict-dynamic' https://cloud.umami.is https://vercel.live
style-src 'self'
```

**Middleware CSP** (with nonces):

```
script-src 'self' 'nonce-{nonce}' 'strict-dynamic' https://cloud.umami.is https://vercel.live
style-src 'self' 'nonce-{nonce}'
```

## How It Works

1. **Request comes in** → Vercel Edge Middleware intercepts it
2. **Nonce generated** → Cryptographically secure random nonce created
3. **HTML modified** → Nonces injected into all script/style tags
4. **Meta tag added** → Nonce added to `<meta>` tag for client access
5. **CSP header set** → Response includes CSP with nonce
6. **Client-side scripts** → Can read nonce from meta tag and apply to dynamic elements

## `'strict-dynamic'` Explained

The `'strict-dynamic'` directive means:

- Scripts loaded by nonced scripts are automatically trusted
- This allows your main bundle (with nonce) to load other scripts
- Eliminates the need to whitelist every external domain
- Provides better security than `'unsafe-inline'`

## Testing

After deployment, verify:

1. **Check CSP header** in browser DevTools → Network tab
2. **Verify nonces** in HTML source - all scripts/styles should have `nonce="..."` attributes
3. **Check console** - No CSP violations should appear
4. **Test analytics** - Umami should load correctly
5. **Test dynamic content** - Any React-generated inline styles should work

## Troubleshooting

### Scripts Not Loading

- Check that scripts have nonce attributes
- Verify middleware is running (check response headers)
- Ensure `'strict-dynamic'` is in CSP

### Styles Not Applying

- Check that `<style>` tags have nonce attributes
- For React inline styles, you may need to extract them to external CSS files

### Middleware Not Running

- Ensure `middleware.ts` is at the project root
- Check Vercel deployment logs
- Verify middleware config matcher paths

### Zod Errors

- If you get CSP errors about `new Function()`, add `'unsafe-eval'` back to `script-src`
- This is expected until Zod v4 changes or you switch validation libraries

## Removing `'unsafe-eval'` Completely

To fully remove `'unsafe-eval'`, you have these options:

### Option 1: Downgrade Zod (Recommended if possible)

```bash
npm install zod@^3.23.8
```

Zod v3 doesn't use `new Function()`, so it works without `'unsafe-eval'`.

### Option 2: Replace Zod

Consider alternatives like:

- `yup` - Similar API, doesn't use `new Function()`
- `io-ts` - Type-safe runtime validation
- `ajv` - JSON Schema validator

### Option 3: Accept `'unsafe-eval'`

If Zod v4 is required, you may need to accept `'unsafe-eval'` for now. This is less ideal security-wise but:

- The code is from your own bundle (`'self'`)
- Zod is a trusted, widely-used library
- Many production sites use `'unsafe-eval'` for similar reasons

## Next Steps

1. **Deploy and test** - Verify the middleware works correctly
2. **Monitor CSP violations** - Check browser console for any issues
3. **Consider Zod downgrade** - If removing `'unsafe-eval'` is a priority
4. **Extract inline styles** - Move React inline styles to CSS files for better CSP compliance

## References

- [MDN: CSP nonces](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/script-src#unsafe_inline_script)
- [Vercel Edge Middleware](https://vercel.com/docs/functions/edge-middleware)
- [CSP `strict-dynamic`](https://w3c.github.io/webappsec-csp/#strict-dynamic-usage)
