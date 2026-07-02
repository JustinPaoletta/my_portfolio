import { chromium, type Page } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

type Theme = 'engineer' | 'cosmic';
type Mode = 'dark' | 'light';
type Variant = 'desktop' | 'mobile';

const BASE_URL = process.env.HERO_CAPTURE_BASE_URL ?? 'http://localhost:4173';

const viewports = {
  desktop: {
    css: { width: 1440, height: 900 },
    output: { width: 1920, height: 1200 },
    deviceScaleFactor: 1,
  },
  mobile: {
    css: { width: 390, height: 844 },
    output: { width: 1080, height: 2338 },
    deviceScaleFactor: 3,
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

async function isolateHeroBackground(page: Page): Promise<void> {
  await page.addStyleTag({
    content: `
      .navigation,
      .hero-content,
      .theme-switcher {
        opacity: 0 !important;
        visibility: hidden !important;
      }

      .hero-engineer-still,
      .hero-cosmic-still {
        display: none !important;
      }
    `,
  });
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
  await isolateHeroBackground(page);

  const canvas = page.locator(canvasSelector(capture.theme));
  const screenshot = await canvas.screenshot({
    type: 'png',
  });

  await mkdir(path.dirname(capture.out), { recursive: true });
  await sharp(screenshot)
    .resize(viewport.output.width, viewport.output.height, { fit: 'cover' })
    .webp({ quality: 82, effort: 5 })
    .toFile(capture.out);

  await page.close();
}

await browser.close();
