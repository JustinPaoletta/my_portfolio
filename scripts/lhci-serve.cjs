/**
 * Lightweight static file server for LHCI runs.
 * Serves files from dist/ and injects the build CSP as an HTTP header.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const url = require('node:url');

const ROOT_DIR = path.resolve(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const LHCI_DIR = path.join(ROOT_DIR, '.lighthouseci');
const PORT = Number(process.env.LHCI_PORT || 4173);
const HOST = process.env.LHCI_HOST || '127.0.0.1';

function loadCspHeader() {
  const cspFile = path.join(LHCI_DIR, 'csp-header.json');
  try {
    const data = JSON.parse(fs.readFileSync(cspFile, 'utf-8'));
    if (data && typeof data.header === 'string' && data.header.length) {
      return data.header;
    }
  } catch {
    // ignore and use fallback
  }

  return "default-src 'self'; script-src 'self'; script-src-attr 'none'; object-src 'none'; style-src 'self'; img-src 'self' data:; font-src 'self' data:; connect-src 'self'; base-uri 'self'; form-action 'self'; manifest-src 'self'; upgrade-insecure-requests;";
}

const CSP_HEADER_VALUE = loadCspHeader();

const MIME_TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.htm', 'text/html; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.mjs', 'application/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.webmanifest', 'application/manifest+json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.gif', 'image/gif'],
  ['.ico', 'image/x-icon'],
  ['.txt', 'text/plain; charset=utf-8'],
]);

function getMimeType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return MIME_TYPES.get(ext) || 'application/octet-stream';
}

function sendNotFound(res) {
  res.statusCode = 404;
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.end('404 Not Found');
}

function ensureWithinDist(resolvedPath) {
  const normalized = path.normalize(resolvedPath);
  return normalized.startsWith(DIST_DIR);
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url || '/');
  let pathname = decodeURIComponent(parsedUrl.pathname || '/');

  if (pathname.endsWith('/')) {
    pathname += 'index.html';
  }

  let filePath = path.join(DIST_DIR, pathname);

  if (!ensureWithinDist(filePath)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      // Fallback to index.html for SPA routes
      filePath = path.join(DIST_DIR, 'index.html');
    }

    fs.readFile(filePath, (error, data) => {
      if (error) {
        sendNotFound(res);
        return;
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', getMimeType(filePath));
      res.setHeader('Content-Security-Policy', CSP_HEADER_VALUE);
      res.setHeader('Cache-Control', 'no-store');
      res.end(data);
    });
  });
});

server.listen(PORT, HOST, () => {
  // IMPORTANT: Output format must match LHCI's startServerReadyPattern
  // Pattern expects "Serving app on http://localhost" for reliable detection
  console.log(`Serving app on http://localhost:${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});

process.on('SIGINT', () => {
  server.close(() => process.exit(0));
});
