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
 */
function generateCSP(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://cloud.umami.is https://vercel.live`,
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
 */
export default async function middleware(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Generate nonce for this request
  const nonce = generateNonce();

  // Only process HTML responses (root path, .html files, or paths without extensions)
  const isHTMLRequest =
    pathname === '/' ||
    pathname.endsWith('.html') ||
    (!pathname.includes('.') &&
      !pathname.startsWith('/assets') &&
      !pathname.startsWith('/_next'));

  if (!isHTMLRequest) {
    // For non-HTML requests, just return with CSP header
    // Let Vercel serve the static file normally, but we'll set CSP via headers
    // Note: We can't modify static file responses in edge middleware
    // So we'll handle CSP via vercel.json for non-HTML files
    return new Response(null, {
      status: 200,
      headers: {
        'Content-Security-Policy': generateCSP(nonce),
      },
    });
  }

  // For HTML files, fetch the static file, modify it, and return
  try {
    // In Vercel Edge Middleware, we need to fetch from the origin
    // The origin would be your static files
    const origin =
      request.headers.get('x-vercel-deployment-url') ||
      request.headers.get('host') ||
      url.hostname;

    // Construct the origin URL
    const originUrl = `${url.protocol}//${origin}${pathname === '/' ? '/index.html' : pathname}`;

    // Fetch the original HTML
    const response = await fetch(originUrl, {
      headers: {
        // Forward important headers
        'user-agent': request.headers.get('user-agent') || '',
      },
    });

    if (!response.ok) {
      // If fetch fails, return the response as-is
      return response;
    }

    // Read HTML content
    const html = await response.text();

    // Inject nonces into HTML
    const modifiedHtml = injectNonce(html, nonce);

    // Create new response with modified HTML and CSP header
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
    // If there's an error, return a basic response
    console.error('Middleware error:', error);
    return new Response(null, {
      status: 500,
      headers: {
        'Content-Security-Policy': generateCSP(nonce),
      },
    });
  }
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
     * - assets (static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|assets|.*\\..*).*)',
  ],
};
