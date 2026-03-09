import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium } from '@playwright/test';

const DIST_DIR = path.resolve(process.cwd(), 'dist');

const CONTENT_TYPES: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.mp4': 'video/mp4',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.xml': 'application/xml; charset=utf-8',
};

function getContentType(filePath: string): string {
  return CONTENT_TYPES[path.extname(filePath)] || 'application/octet-stream';
}

function resolveRequestPath(urlPath: string): string {
  const pathname = decodeURIComponent(urlPath);
  const relativePath =
    pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  return path.join(DIST_DIR, relativePath);
}

async function readFileFromDist(urlPath: string): Promise<Buffer> {
  const filePath = resolveRequestPath(urlPath);
  return fs.readFile(filePath);
}

async function startStaticServer(): Promise<{
  close: () => Promise<void>;
  url: string;
}> {
  const server = http.createServer(async (request, response) => {
    const requestUrl = new URL(request.url || '/', 'http://127.0.0.1');
    const filePath = resolveRequestPath(requestUrl.pathname);

    try {
      const stats = await fs.stat(filePath);

      if (!stats.isFile()) {
        throw new Error('Not a file');
      }

      const fileBuffer = await readFileFromDist(requestUrl.pathname);
      response.writeHead(200, {
        'Content-Type': getContentType(filePath),
        'Cache-Control': 'no-store',
      });
      response.end(fileBuffer);
      return;
    } catch {
      const hasFileExtension = path.extname(requestUrl.pathname) !== '';

      if (hasFileExtension) {
        response.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
        });
        response.end('Not found');
        return;
      }

      const htmlBuffer = await readFileFromDist('/');
      response.writeHead(200, {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      });
      response.end(htmlBuffer);
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolve());
  });

  const address = server.address();
  if (!address || typeof address === 'string') {
    throw new Error('Failed to determine prerender server address');
  }

  return {
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve();
        });
      }),
    url: `http://127.0.0.1:${address.port}`,
  };
}

async function prerenderHomepage(): Promise<void> {
  const server = await startStaticServer();
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 2200 },
    });

    await page.route('https://cloud.umami.is/**', (route) => route.abort());
    await page.route('https://bam.nr-data.net/**', (route) => route.abort());
    await page.route('https://js-agent.newrelic.com/**', (route) =>
      route.abort()
    );

    await page.goto(server.url, { waitUntil: 'load' });
    await page.waitForSelector('main#main');
    await page.waitForSelector('h1');
    await page.waitForSelector('section#contact');
    await page.waitForTimeout(1500);
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));

    const prerenderedHtml = await page.evaluate(() => {
      return `<!doctype html>\n${document.documentElement.outerHTML}`;
    });

    await fs.writeFile(
      path.join(DIST_DIR, 'index.html'),
      prerenderedHtml,
      'utf8'
    );
  } finally {
    await browser.close();
    await server.close();
  }
}

void prerenderHomepage()
  .then(() => {
    console.log('Prerendered dist/index.html');
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown prerender failure';
    console.error(`❌ Failed to prerender homepage: ${message}`);
    process.exitCode = 1;
  });
