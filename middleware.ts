/**
 * Vercel Edge Middleware
 * Generates CSP nonces per request and injects them into HTML responses
 *
 * This runs on Vercel's Edge Network before your site is served.
 * Place this file at the root of your project.
 */

/**
 * Generate a cryptographically secure random nonce
 */
function generateNonce(): string {
  // Use crypto.getRandomValues for secure random generation
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join(
    ''
  );
}

/**
 * Inject nonce into script and style tags in HTML
 */
function injectNonce(html: string, nonce: string): string {
  // Inject nonce into existing script tags (from Vite build)
  let modified = html.replace(
    /<script([^>]*?)(?:\s+nonce="[^"]*")?([^>]*?)>/gi,
    (match, before, after) => {
      // Skip if already has nonce
      if (match.includes('nonce=')) {
        return match.replace(/nonce="[^"]*"/, `nonce="${nonce}"`);
      }
      // Add nonce attribute
      return `<script${before} nonce="${nonce}"${after}>`;
    }
  );

  // Inject nonce into style tags
  modified = modified.replace(
    /<style([^>]*?)(?:\s+nonce="[^"]*")?([^>]*?)>/gi,
    (match, before, after) => {
      // Skip if already has nonce
      if (match.includes('nonce=')) {
        return match.replace(/nonce="[^"]*"/, `nonce="${nonce}"`);
      }
      // Add nonce attribute
      return `<style${before} nonce="${nonce}"${after}>`;
    }
  );

  // Inject nonce into link tags with rel="stylesheet" or modulepreload
  modified = modified.replace(
    /<link([^>]*?(?:rel=["'](?:stylesheet|modulepreload)["'])[^>]*?)(?:\s+nonce="[^"]*")?([^>]*?)>/gi,
    (match, before, after) => {
      if (match.includes('nonce=')) {
        return match.replace(/nonce="[^"]*"/, `nonce="${nonce}"`);
      }
      // Insert nonce before closing of attributes
      return `<link${before} nonce="${nonce}"${after}>`;
    }
  );

  // Add nonce to meta tag in head (for client-side access)
  const metaTag = `<meta name="csp-nonce" content="${nonce}">`;
  if (!modified.includes('name="csp-nonce"')) {
    modified = modified.replace(/(<head[^>]*>)/i, `$1\n    ${metaTag}`);
  }

  return modified;
}

/**
 * Generate CSP header value with nonce
 *
 * Using nonces with host allowlists (without 'strict-dynamic' for now)
 * This ensures scripts from allowed hosts work, and nonces work for inline scripts.
 * We can add 'strict-dynamic' later once the middleware is confirmed working.
 */
function generateCSP(nonce: string): string {
  return [
    "default-src 'self'",
    // Allow 'self', nonces for inline scripts, and specific external hosts
    // Note: Without 'strict-dynamic', host allowlists work normally
    `script-src 'self' 'nonce-${nonce}' https://cloud.umami.is https://vercel.live`,
    `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://cloud.umami.is https://api-gateway.umami.dev https://vercel.live https://bam.nr-data.net",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "manifest-src 'self'",
  ].join('; ');
}

/**
 * Vercel Edge Middleware
 * This runs on every request before your site is served
 *
 * For static sites on Vercel, the middleware can intercept requests and modify responses.
 * However, fetching the HTML from the same origin can be tricky. We'll use a different approach:
 * Pass through the request and let Vercel serve it, but we'll modify it via rewrites if needed.
 *
 * Actually, Edge Middleware in Vercel can't easily modify static file responses.
 * For now, we'll just set the CSP header. The HTML modification needs to happen at build time
 * or via a different mechanism.
 */
export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Generate nonce for this request
  const nonce = generateNonce();

  // Only process HTML responses (root path, .html files)
  const isHTMLRequest =
    pathname === '/' ||
    pathname.endsWith('.html') ||
    (!pathname.includes('.') &&
      !pathname.startsWith('/assets') &&
      !pathname.startsWith('/_next') &&
      pathname !== '/favicon.ico');

  // For all requests, set CSP header
  // Note: The middleware can't easily modify static file responses on Vercel
  // So we'll set headers and rely on the fact that 'self' allows scripts from the same origin
  // Nonces will work for any inline scripts we add

  // Create a response that continues to the origin
  // We'll modify this to add CSP headers
  const response = await fetch(request);

  // For HTML responses, try to modify the body
  if (isHTMLRequest && response.ok) {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text/html')) {
      try {
        const html = await response.text();
        const modifiedHtml = injectNonce(html, nonce);

        return new Response(modifiedHtml, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'Content-Security-Policy': generateCSP(nonce),
            'Content-Type': 'text/html; charset=utf-8',
          },
        });
      } catch (error) {
        // If modification fails, return with just CSP header
        console.error('Failed to inject nonces:', error);
        return new Response(response.body, {
          status: response.status,
          statusText: response.statusText,
          headers: {
            ...Object.fromEntries(response.headers.entries()),
            'Content-Security-Policy': generateCSP(nonce),
          },
        });
      }
    }
  }

  // For non-HTML or if HTML modification fails, just add CSP header
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'Content-Security-Policy': generateCSP(nonce),
    },
  });
}

/**
 * Middleware configuration
 * This tells Vercel which paths to run the middleware on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (static assets - but we DO want to match root HTML)
     */
    '/',
    '/index.html',
    // Match other HTML pages if you have them
    '/*.html',
  ],
};
