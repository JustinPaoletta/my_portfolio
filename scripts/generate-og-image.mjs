#!/usr/bin/env node
// Capture the editable HTML with the repository's bundled font and vector logo.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const browser = await chromium.launch(
  existsSync(chromium.executablePath()) ? {} : { channel: 'chrome' }
);
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
    reducedMotion: 'reduce',
  });
  await page.goto(
    pathToFileURL(path.join(root, 'assets/branding/og-image.html')).href
  );
  await page.evaluate(async () => {
    await globalThis.document.fonts.ready;
    await Promise.all(
      Array.from(globalThis.document.images, (image) => image.decode())
    );
    if (!globalThis.document.fonts.check('650 72px Inter'))
      throw new Error('Inter failed to load');
    const title = globalThis.document
      .querySelector('h1')
      .getBoundingClientRect();
    if (title.right > 755) throw new Error('OG name overlaps the logo column');
  });
  const out = path.join(root, 'public/og');
  await mkdir(out, { recursive: true });
  await page.screenshot({ path: path.join(out, 'jp-engineering.png') });
  // Old sharing links should display the current identity too.
  await copyFile(
    path.join(out, 'jp-engineering.png'),
    path.join(out, 'og-image.png')
  );
  globalThis.console.log(
    'Generated matching 1200×630 JP Engineering sharing image.'
  );
} finally {
  await browser.close();
}
