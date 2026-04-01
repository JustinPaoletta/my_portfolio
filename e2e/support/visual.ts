import { expect, type Locator, type Page } from '@playwright/test';
import { mockPortfolioApis } from './mocks';

type VisualTheme = 'minimal' | 'engineer' | 'cosmic' | 'cli';
type VisualMode = 'light' | 'dark';

export const DESKTOP_HERO_VIEWPORT = { width: 1440, height: 1100 } as const;
export const DESKTOP_SECTION_VIEWPORT = { width: 1440, height: 1600 } as const;
export const MOBILE_VIEWPORT = { width: 390, height: 844 } as const;
export const FULL_PAGE_VIEWPORT = { width: 1440, height: 2600 } as const;

const FIXED_TIME_ISO = '2026-03-01T12:00:00.000Z';
export async function gotoVisualState(
  page: Page,
  options: {
    theme: VisualTheme;
    mode: VisualMode;
    viewport: { width: number; height: number };
  }
): Promise<void> {
  await page.setViewportSize(options.viewport);
  await page.emulateMedia({
    colorScheme: options.mode,
    reducedMotion: 'reduce',
  });
  await page.addInitScript((fixedTimeIso) => {
    const fixedTime = new Date(fixedTimeIso).valueOf();
    const RealDate = Date;

    class MockDate extends RealDate {
      constructor(...args: ConstructorParameters<DateConstructor>) {
        if (args.length === 0) {
          super(fixedTime);
          return;
        }

        super(...args);
      }

      static now(): number {
        return fixedTime;
      }

      static parse = RealDate.parse;
      static UTC = RealDate.UTC;
    }

    Object.defineProperty(window, 'Date', {
      configurable: true,
      writable: true,
      value: MockDate,
    });
  }, FIXED_TIME_ISO);
  await page.addInitScript(() => {
    try {
      localStorage.removeItem('github_stats_cache');
      sessionStorage.clear();
    } catch {
      // Ignore storage access errors in locked-down contexts.
    }
  });

  await mockPortfolioApis(page);
  await page.goto(
    `/?theme=${options.theme}&mode=${options.mode}&visual-test=1`,
    {
      waitUntil: 'domcontentloaded',
    }
  );
  await waitForPageToSettle(page);
}

export async function waitForPageToSettle(page: Page): Promise<void> {
  await expect(page.locator('body')).toBeVisible();
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => {
    return !document.querySelector('[aria-label="Loading GitHub data"]');
  });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await waitForVisiblePageImages(page);
  await resetTransientInteractionState(page);
  await page.waitForTimeout(750);
}

export async function waitForSectionToSettle(
  page: Page,
  locator: Locator
): Promise<void> {
  await enableSectionCaptureMode(page);
  await revealSectionIfDeferred(page, locator);
  await locator.scrollIntoViewIfNeeded();
  await page.waitForLoadState('networkidle');
  await waitForImages(locator);
  await resetTransientInteractionState(page);
  await page.waitForTimeout(500);
}

async function revealSectionIfDeferred(
  page: Page,
  locator: Locator
): Promise<void> {
  const alreadyExists = (await locator.count()) > 0;
  if (alreadyExists) {
    return;
  }

  await expect
    .poll(
      async () => {
        await page.evaluate(() =>
          window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'auto',
          })
        );
        return locator.count();
      },
      { timeout: 15_000, intervals: [250, 500, 1_000] }
    )
    .toBeGreaterThan(0);

  await expect(locator).toBeVisible({ timeout: 10_000 });
}

async function enableSectionCaptureMode(page: Page): Promise<void> {
  await page.evaluate(() => {
    const styleId = 'visual-section-capture-style';
    if (document.getElementById(styleId)) {
      return;
    }

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .navigation {
        opacity: 0 !important;
        visibility: hidden !important;
      }
    `;
    document.head.append(style);
  });
}

async function resetTransientInteractionState(page: Page): Promise<void> {
  await page.evaluate(() => {
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement) {
      activeElement.blur();
    }
  });

  const viewport = page.viewportSize();
  if (viewport) {
    await page.mouse.move(8, Math.max(8, viewport.height - 8));
  }
}

async function waitForImages(locator: Locator): Promise<void> {
  await locator.evaluateAll(async (elements) => {
    const imageElements = elements.flatMap((element) =>
      Array.from(element.querySelectorAll('img'))
    );

    await Promise.all(
      imageElements.map((image) => {
        if (image.complete) {
          return image.decode?.().catch(() => undefined) ?? Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        });
      })
    );
  });
}

async function waitForVisiblePageImages(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const imageElements = Array.from(document.images).filter((image) => {
      const rect = image.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    });

    await Promise.all(
      imageElements.map((image) => {
        if (image.complete) {
          return image.decode?.().catch(() => undefined) ?? Promise.resolve();
        }

        return new Promise<void>((resolve) => {
          image.addEventListener('load', () => resolve(), { once: true });
          image.addEventListener('error', () => resolve(), { once: true });
        });
      })
    );
  });
}
