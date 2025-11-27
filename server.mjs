import express from 'express';
import compression from 'compression';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import helmet from 'helmet';

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT ? Number(process.env.PORT) : 4174;
const host = process.env.HOST || '127.0.0.1';
const distPath = path.join(__dirname, 'dist');
const lhciDir = path.join(__dirname, '.lighthouseci');
const cspHeaderPath = path.join(lhciDir, 'csp-header.json');

/**
 * Load CSP header from build-generated JSON file if it exists.
 * This ensures the server uses the same nonce that was injected into the HTML.
 * @returns {string | null} The CSP header string or null if not found
 */
function loadCspHeader() {
  try {
    if (fs.existsSync(cspHeaderPath)) {
      const data = JSON.parse(fs.readFileSync(cspHeaderPath, 'utf-8'));
      if (data && typeof data.header === 'string' && data.header.length) {
        return data.header;
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load CSP header from build file:', error);
  }
  return null;
}

// 1) Enable gzip/deflate/br compression (based on Accept-Encoding)
app.use(
  compression({
    // Keep defaults; can tune thresholds if needed
  })
);

// 2) Set a strong Content-Security-Policy via HTTP headers (preferred by Lighthouse)
// If the build generated a CSP header with nonce, use that; otherwise fall back to helmet
const buildCspHeader = loadCspHeader();
if (buildCspHeader) {
  console.log('✅ Using build-generated CSP header with nonce');
  // Use the build-generated CSP header (includes nonce for Lighthouse compliance)
  app.use((_req, res, next) => {
    res.setHeader('Content-Security-Policy', buildCspHeader);
    next();
  });
  // Still use other helmet protections
  app.use(
    helmet({
      contentSecurityPolicy: false, // Disable helmet's CSP since we're using the build-generated one
    })
  );
} else {
  console.warn('⚠️  Build CSP header not found, using helmet fallback');
  // Fallback to helmet CSP if build file doesn't exist (e.g., during development)
  app.use(
    helmet.contentSecurityPolicy({
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'script-src': [
          "'self'",
          // Allow analytics script domain explicitly
          'https://cloud.umami.is',
        ],
        // Disallow inline event handlers
        'script-src-attr': ["'none'"],
        // Inline styles are often needed due to bundlers/CSS-in-JS; keep it scoped to styles only
        'style-src': [
          "'self'",
          "'unsafe-inline'",
          'https://fonts.googleapis.com',
        ],
        'img-src': ["'self'", 'data:', 'https:'],
        'font-src': ["'self'", 'data:', 'https://fonts.gstatic.com'],
        'connect-src': [
          "'self'",
          'https://cloud.umami.is',
          'https://api-gateway.umami.dev',
          'https://bam.nr-data.net',
        ],
        // PWA/service worker compatibility
        'worker-src': ["'self'"],
        // Explicitly disallow frames if you don't embed any
        'frame-src': ["'none'"],
        'object-src': ["'none'"],
        'base-uri': ["'self'"],
        'form-action': ["'self'"],
        'frame-ancestors': ["'self'"],
        'manifest-src': ["'self'"],
        // upgrade-insecure-requests is a boolean directive; helmet sets it via "upgradeInsecureRequests: true"
      },
      reportOnly: false,
    })
  );
}

// 2) Serve static assets from dist
app.use(
  express.static(distPath, {
    immutable: true,
    maxAge: '1y',
    extensions: ['html'],
  })
);

// 3) SPA fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, host, () => {
  // IMPORTANT: This exact format is required by LHCI's startServerReadyPattern
  // The pattern expects "localhost" specifically for reliable detection
  // We print the ready message after a small delay to ensure the server is fully ready
  setTimeout(() => {
    console.log(`Serving app on http://localhost:${port}`);
    // Also log the actual binding for debugging
    if (host !== 'localhost' && host !== '127.0.0.1') {
      console.log(`  (bound to ${host})`);
    }
  }, 100); // Small delay to ensure server is fully initialized
});
