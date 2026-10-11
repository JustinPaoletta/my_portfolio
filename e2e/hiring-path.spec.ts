import { readFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

const hiringDestinations = [
  { label: 'Work', heading: 'Selected Work' },
  { label: 'Experience', heading: 'Professional Experience' },
  { label: 'About', heading: 'How I Work' },
  { label: 'Writing', heading: 'LinkedIn Articles' },
  { label: 'Contact', heading: 'Get In Touch' },
] as const;

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const scroller = document.scrollingElement ?? document.documentElement;
    return scroller.scrollWidth - scroller.clientWidth;
  });
  expect(overflow).toBeLessThanOrEqual(1);
}

async function expectSettledHeading(
  page: Page,
  heading: Locator
): Promise<void> {
  const navigation = page.getByRole('navigation', {
    name: 'Main navigation',
    exact: true,
  });
  let previousTop: number | undefined;
  let stableSamples = 0;

  await expect(heading).toBeVisible();
  await expect
    .poll(
      async () => {
        const [headingBox, navigationBox] = await Promise.all([
          heading.boundingBox(),
          navigation.boundingBox(),
        ]);
        if (!headingBox || !navigationBox) return false;

        stableSamples =
          previousTop !== undefined && Math.abs(headingBox.y - previousTop) < 1
            ? stableSamples + 1
            : 0;
        previousTop = headingBox.y;
        const viewportHeight = await page.evaluate(() => window.innerHeight);

        return (
          stableSamples >= 3 &&
          headingBox.y >= navigationBox.y + navigationBox.height - 1 &&
          headingBox.y + headingBox.height <= viewportHeight
        );
      },
      {
        message:
          'The destination heading should settle below the fixed navigation',
        timeout: 10_000,
        intervals: [100, 150, 250],
      }
    )
    .toBe(true);
}

async function expectReadable(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        let current: Element | null = element;
        while (current) {
          const style = getComputedStyle(current);
          if (
            style.display === 'none' ||
            style.visibility !== 'visible' ||
            Number.parseFloat(style.opacity) < 0.95
          ) {
            return false;
          }
          current = current.parentElement;
        }
        return true;
      })
    )
    .toBe(true);
}

async function expectPdfDownload(page: Page, link: Locator): Promise<void> {
  await expectReadable(link);
  const href = await link.getAttribute('href');
  expect(href).toBeTruthy();
  const url = new URL(href!, page.url());
  expect(url.origin).toBe(new URL(page.url()).origin);

  // Exercise the real asset; API mocks do not replace this response.
  const response = await page.request.get(url.href, { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toMatch(/^application\/pdf\b/i);
  expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');

  const downloadPromise = page.waitForEvent('download');
  await link.click();
  const download = await downloadPromise;
  expect(await download.failure()).toBeNull();
  expect(download.suggestedFilename()).toMatch(/resume.*\.pdf$/i);
  const downloadedPath = await download.path();
  expect(downloadedPath).not.toBeNull();
  const downloadedFile = await readFile(downloadedPath!);
  expect(downloadedFile.subarray(0, 5).toString()).toBe('%PDF-');
}

test.beforeEach(async ({ page, baseURL }) => {
  const localOrigin = new URL(baseURL ?? 'http://localhost:4173').origin;
  await page
    .context()
    .route('**/*', (route) =>
      new URL(route.request().url()).origin === localOrigin
        ? route.continue()
        : route.abort()
    );
  await mockPortfolioApis(page);
});

for (const width of [320, 390, 768]) {
  test(`hiring navigation stays usable at ${width}px`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expectNoHorizontalOverflow(page);

    for (const destination of hiringDestinations) {
      await page.getByRole('button', { name: 'Open menu' }).click();
      const dialog = page.getByRole('dialog', { name: 'Main menu' });
      await expect(dialog).toBeVisible();
      const link = dialog.getByRole('link', {
        name: destination.label,
        exact: true,
      });
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#[a-z-]+$/);
      await link.click();

      await expect(dialog).not.toBeVisible();
      await expect(page).toHaveURL(new URL(href!, page.url()).href);
      await expectSettledHeading(
        page,
        page.getByRole('heading', { name: destination.heading, exact: true })
      );
      await expectNoHorizontalOverflow(page);
    }
  });
}

for (const entry of [
  'hero',
  'desktop navigation',
  'mobile navigation',
] as const) {
  test(`resume downloads a real PDF from ${entry}`, async ({ page }) => {
    await page.setViewportSize({
      width: entry === 'mobile navigation' ? 390 : 1280,
      height: 844,
    });
    await page.goto('/');

    let resumeLink: Locator;
    if (entry === 'hero') {
      resumeLink = page.getByRole('link', {
        name: 'Download Resume PDF',
        exact: true,
      });
    } else if (entry === 'mobile navigation') {
      await page.getByRole('button', { name: 'Open menu' }).click();
      resumeLink = page
        .getByRole('dialog', { name: 'Main menu' })
        .getByRole('link', {
          name: 'Resume PDF',
          exact: true,
        });
    } else {
      resumeLink = page
        .getByRole('navigation', { name: 'Main navigation', exact: true })
        .getByRole('link', {
          name: 'Resume PDF',
          exact: true,
        });
    }

    await expectPdfDownload(page, resumeLink);
    if (entry === 'mobile navigation') {
      await expect(
        page.getByRole('dialog', { name: 'Main menu' })
      ).not.toBeVisible();
    }
  });
}

test.describe('production portfolio without JavaScript', () => {
  test.use({
    javaScriptEnabled: false,
    viewport: { width: 1280, height: 900 },
  });

  test('keeps the profile, work, experience, contact, and resume readable', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('main')).toHaveCount(1);
    await expectReadable(
      page
        .getByRole('heading', { name: 'Justin Paoletta', exact: true })
        .first()
    );
    await expectReadable(
      page.getByText('Software Engineer', { exact: true }).first()
    );

    const work = page.getByRole('region', {
      name: 'Selected Work',
      exact: true,
    });
    await expectReadable(
      work.getByRole('heading', { name: 'BitStockerz', exact: true })
    );
    const experience = page.getByRole('region', {
      name: 'Professional Experience',
      exact: true,
    });
    await expectReadable(
      experience.getByRole('link', { name: 'accesso', exact: true })
    );
    const contact = page.getByRole('region', {
      name: 'Get In Touch',
      exact: true,
    });
    const emailLink = contact.getByRole('link', { name: /^Email / });
    await expectReadable(emailLink);
    await expect(emailLink).toHaveAttribute('href', /^mailto:[^\s@]+@[^\s@]+$/);
    await expectPdfDownload(
      page,
      page.getByRole('link', { name: 'Download Resume PDF', exact: true })
    );
  });
});
