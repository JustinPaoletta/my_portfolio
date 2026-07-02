import { chromium, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

type Theme = 'engineer' | 'cosmic';
type Mode = 'dark' | 'light';
type Variant = 'desktop' | 'mobile';

const BASE_URL = process.env.HERO_CAPTURE_BASE_URL ?? 'http://localhost:4173';

/**
 * Poster framing must match the live canvas exactly. Both scenes use a
 * perspective camera with a fixed *vertical* FOV, so a render at a wider
 * aspect ratio center-cropped horizontally (which is what `object-fit: cover`
 * does) is pixel-identical to rendering at the narrower aspect directly.
 *
 * That equivalence only holds while the poster is at least as wide (in aspect)
 * as the box it covers, so each variant is captured at the widest aspect it
 * has to serve:
 * - desktop: 1920x900 (~2.13) covers maximized browsers on 16:9 displays
 *   (viewport ~2.0 once browser chrome is subtracted) and everything narrower.
 * - mobile: 768x1024 (3:4) covers tablet portrait and all phone portraits.
 *
 * The variant cutoff lives in src/utils/heroPoster.ts and index.html as
 * `(max-aspect-ratio: 3/4)`.
 */
const viewports = {
  desktop: {
    css: { width: 1920, height: 900 },
    outputWidth: 1920,
    deviceScaleFactor: 2,
  },
  mobile: {
    css: { width: 768, height: 1024 },
    outputWidth: 1152,
    deviceScaleFactor: 2,
  },
} as const;

const captures: Array<{
  theme: Theme;
  mode: Mode;
  variant: Variant;
  out: string;
}> = [
  {
    theme: 'engineer',
    mode: 'dark',
    variant: 'desktop',
    out: 'public/images/hero/engineer/engineer-poster-dark-desktop.webp',
  },
  {
    theme: 'engineer',
    mode: 'light',
    variant: 'desktop',
    out: 'public/images/hero/engineer/engineer-poster-light-desktop.webp',
  },
  {
    theme: 'engineer',
    mode: 'dark',
    variant: 'mobile',
    out: 'public/images/hero/engineer/engineer-poster-dark-mobile.webp',
  },
  {
    theme: 'engineer',
    mode: 'light',
    variant: 'mobile',
    out: 'public/images/hero/engineer/engineer-poster-light-mobile.webp',
  },
  {
    theme: 'cosmic',
    mode: 'dark',
    variant: 'desktop',
    out: 'public/images/hero/cosmic/cosmos-poster-dark-desktop.webp',
  },
  {
    theme: 'cosmic',
    mode: 'light',
    variant: 'desktop',
    out: 'public/images/hero/cosmic/cosmos-poster-light-desktop.webp',
  },
  {
    theme: 'cosmic',
    mode: 'dark',
    variant: 'mobile',
    out: 'public/images/hero/cosmic/cosmos-poster-dark-mobile.webp',
  },
  {
    theme: 'cosmic',
    mode: 'light',
    variant: 'mobile',
    out: 'public/images/hero/cosmic/cosmos-poster-light-mobile.webp',
  },
];

function canvasSelector(theme: Theme): string {
  return theme === 'cosmic'
    ? '.cosmic-scene3d-stage canvas'
    : '.engineer-circuit3d-stage canvas';
}

function readySelector(theme: Theme): string {
  return theme === 'cosmic'
    ? '.hero-background[data-cosmic-scene="3d"]'
    : '.hero-engineer-visual[data-engineer-circuit-scene="3d"]';
}

async function preparePage(page: Page): Promise<void> {
  await page.addInitScript(() => {
    document.documentElement.dataset.posterCapture = 'true';

    let seed = 123456789;
    Math.random = () => {
      seed = (1664525 * seed + 1013904223) >>> 0;
      return seed / 4294967296;
    };
  });

  await page.route('**/api/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: '{}',
    })
  );
}

const browser = await chromium.launch();

for (const capture of captures) {
  const viewport = viewports[capture.variant];
  const page = await browser.newPage({
    viewport: viewport.css,
    deviceScaleFactor: viewport.deviceScaleFactor,
  });

  await preparePage(page);
  await page.emulateMedia({
    colorScheme: capture.mode,
    reducedMotion: 'no-preference',
  });

  await page.goto(
    `${BASE_URL}/?theme=${capture.theme}&mode=${capture.mode}&capture-posters=1`,
    {
      waitUntil: 'domcontentloaded',
    }
  );

  await page.waitForSelector(readySelector(capture.theme), {
    timeout: 20_000,
  });
  await page.waitForSelector(canvasSelector(capture.theme), {
    timeout: 20_000,
  });
  await page.waitForTimeout(500);
  await page.evaluate(async () => {
    await document.fonts.ready;
  });

  // Read the WebGL drawing buffer directly (preserveDrawingBuffer is enabled
  // in capture mode) instead of screenshotting the element. The canvas bleeds
  // 8% past the viewport (`.hero-engineer-visual { inset: -8% }`), and element
  // screenshots cannot capture pixels at negative page coordinates, which
  // previously produced posters that were cropped and padded with white.
  // The buffer also keeps its transparent background, so the poster composites
  // over the hero gradient exactly like the live canvas does.
  const dataUrl = await page
    .locator(canvasSelector(capture.theme))
    .evaluate((element) => (element as HTMLCanvasElement).toDataURL());
  const pngBuffer = Buffer.from(
    dataUrl.slice('data:image/png;base64,'.length),
    'base64'
  );

  await mkdir(path.dirname(capture.out), { recursive: true });
  await sharp(pngBuffer)
    .resize({ width: viewport.outputWidth })
    .webp({ quality: 82, effort: 5 })
    .toFile(capture.out);

  await page.close();
}

await browser.close();
