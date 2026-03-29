import fs from 'node:fs/promises';
import path from 'node:path';
import http from 'node:http';
import { chromium, type Browser } from '@playwright/test';

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

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function isSkippableBrowserLaunchError(message: string): boolean {
  const normalizedMessage = message.toLowerCase();

  return [
    'error while loading shared libraries',
    "executable doesn't exist",
    'host system is missing dependencies',
  ].some((fragment) => normalizedMessage.includes(fragment));
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

async function prerenderHomepage(): Promise<boolean> {
  if (process.env.SKIP_PLAYWRIGHT_PRERENDER === '1') {
    console.warn(
      '⚠️ Skipping browser prerender via SKIP_PLAYWRIGHT_PRERENDER=1'
    );
    return false;
  }

  const server = await startStaticServer();

  try {
    let browser: Browser | undefined;

    try {
      browser = await chromium.launch({ headless: true });
    } catch (error) {
      const message = getErrorMessage(error);

      if (isSkippableBrowserLaunchError(message)) {
        console.warn(`⚠️ Skipping browser prerender: ${message}`);
        return false;
      }

      throw error;
    }

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
      await page.waitForTimeout(1800);
      const didRevealContact = await page.evaluate(async () => {
        for (let step = 0; step < 18; step += 1) {
          if (document.getElementById('contact')) {
            return true;
          }

          const maxScroll = Math.max(
            document.documentElement.scrollHeight,
            document.body.scrollHeight
          );
          const nextTop = Math.min(
            window.scrollY + Math.max(window.innerHeight * 0.85, 480),
            maxScroll
          );

          window.scrollTo({ top: nextTop, behavior: 'auto' });
          await new Promise((resolve) => window.setTimeout(resolve, 220));
        }

        return Boolean(document.getElementById('contact'));
      });

      if (!didRevealContact) {
        throw new Error('Timed out revealing deferred contact section');
      }

      await page.waitForSelector('section#contact');
      await page.waitForTimeout(1500);
      await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'auto' }));
      await page.waitForTimeout(180);
      await page.evaluate(async () => {
        window.scrollTo({ top: 0, behavior: 'auto' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;

        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => {
            requestAnimationFrame(() => resolve());
          });
        });

        const navigation = document.querySelector('.navigation');
        navigation?.classList.remove('scrolled');

        const heroContent =
          document.querySelector<HTMLElement>('.hero-content');
        if (heroContent) {
          heroContent.dataset.parallaxEnabled = 'false';
          heroContent.style.removeProperty('--hero-parallax-y');
          heroContent.style.removeProperty('--hero-parallax-opacity');
        }
      });

      const prerenderedHtml = await page.evaluate(() => {
        return `<!doctype html>\n${document.documentElement.outerHTML}`;
      });

      await fs.writeFile(
        path.join(DIST_DIR, 'index.html'),
        prerenderedHtml,
        'utf8'
      );

      return true;
    } finally {
      await browser.close();
    }
  } finally {
    await server.close();
  }
}

void prerenderHomepage()
  .then((didPrerender) => {
    if (didPrerender) {
      console.log('Prerendered dist/index.html');
      return;
    }

    console.log(
      'Skipped browser prerender; keeping Vite-generated dist/index.html'
    );
  })
  .catch((error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'Unknown prerender failure';
    console.error(`❌ Failed to prerender homepage: ${message}`);
    process.exitCode = 1;
  });
