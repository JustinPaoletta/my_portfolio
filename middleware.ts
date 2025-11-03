/**
 * Vercel Edge Middleware
 * Pass-through middleware that forwards requests unchanged
 *
 * This runs on Vercel's Edge Network before your site is served.
 * Place this file at the root of your project.
 *
 * Note: CSP headers are set in vercel.json, not here.
 */
export default async function middleware(request: Request): Promise<Response> {
  // Pass through all requests without modification
  // CSP headers are set in vercel.json
  return await fetch(request);
}

/**
 * Middleware configuration
 * This tells Vercel which paths to run the middleware on
 */
export const config = {
  matcher: [
    /*
     * Match HTML requests:
     * - Root path
     * - index.html
     * - Any path that doesn't start with /assets, /api, /_next
     */
    '/',
    '/index.html',
  ],
};
