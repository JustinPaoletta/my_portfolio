import { readFile } from 'node:fs/promises';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

const hiringDestinations = [
  'Projects',
  'Experience',
  'About',
  'Articles',
  'Contact',
] as const;

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const scroller = document.scrollingElement ?? document.documentElement;
    return scroller.scrollWidth - scroller.clientWidth;
  });
  const offenders =
    overflow > 1
      ? await page.evaluate(() =>
          Array.from(document.querySelectorAll('body *'))
            .flatMap((element) => {
              const rect = element.getBoundingClientRect();
              return rect.width > 0 &&
                rect.right > document.documentElement.clientWidth + 1 &&
                rect.left >= 0
                ? [
                    {
                      tag: element.tagName,
                      className: element.className,
                      right: rect.right,
                      width: rect.width,
                    },
                  ]
                : [];
            })
            .slice(0, 12)
        )
      : [];
  expect(overflow, JSON.stringify(offenders)).toBeLessThanOrEqual(1);
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

for (const width of [320, 390, 768, 1280]) {
  test(`hiring navigation stays usable at ${width}px`, async ({ page }) => {
    test.setTimeout(60_000);
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await expectNoHorizontalOverflow(page);

    for (const destination of hiringDestinations) {
      const isMobile = width <= 980;
      const menu = isMobile
        ? page.getByRole('dialog', { name: 'Main menu' })
        : page.getByRole('navigation', {
            name: 'Main navigation',
            exact: true,
          });

      if (isMobile) {
        await page.getByRole('button', { name: 'Open menu' }).click();
      }
      await expect(menu).toBeVisible();
      const link = menu.getByRole('link', {
        name: destination,
        exact: true,
      });
      const href = await link.getAttribute('href');
      expect(href).toMatch(/^#[a-z-]+$/);
      await link.click();

      if (isMobile) {
        await expect(menu).not.toBeVisible();
      }
      await expect(page).toHaveURL(new URL(href!, page.url()).href);
      const section = page.locator(`section${href}`);
      await expect(section).toBeFocused();
      await expectSettledHeading(
        page,
        section.getByRole('heading', {
          level: 2,
          name: destination,
          exact: true,
        })
      );
      await expectNoHorizontalOverflow(page);
    }
  });
}

for (const width of [390, 1280]) {
  test(`hero Contact reaches the matching section at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/');
    await page
      .locator('.hero-cta')
      .getByRole('link', { name: 'Contact', exact: true })
      .click();
    await expectSettledHeading(
      page,
      page.getByRole('heading', { name: 'Contact', exact: true })
    );
    await expect(page).toHaveURL(/#contact$/);
    await expectNoHorizontalOverflow(page);
  });
}

for (const entry of ['desktop navigation', 'mobile navigation'] as const) {
  test(`resume downloads a real PDF from ${entry}`, async ({ page }) => {
    await page.setViewportSize({
      width: entry === 'mobile navigation' ? 390 : 1280,
      height: 844,
    });
    await page.goto('/');

    let resumeLink: Locator;
    if (entry === 'mobile navigation') {
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
      name: 'Projects',
      exact: true,
    });
    await expectReadable(
      work.getByRole('heading', { name: 'BitStockerz', exact: true })
    );
    const experience = page.getByRole('region', {
      name: 'Experience',
      exact: true,
    });
    await expectReadable(
      experience.getByRole('link', { name: 'accesso', exact: true })
    );
    const contact = page.getByRole('region', {
      name: 'Contact',
      exact: true,
    });
    const emailLink = contact.getByRole('link', { name: /^Email / });
    await expectReadable(emailLink);
    await expect(emailLink).toHaveAttribute('href', /^mailto:[^\s@]+@[^\s@]+$/);
    await expectPdfDownload(
      page,
      experience.getByRole('link', {
        name: 'Download resume as PDF',
        exact: true,
      })
    );
  });
});

for (const width of [320, 390, 1280]) {
  test(`About copy, emphasis, and viewable resume remain usable at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/?theme=minimal&mode=dark#about');
    const about = page.getByRole('region', { name: 'About', exact: true });
    await expect(about).toBeVisible();
    await expect(about.locator('.about-text > p')).toHaveCount(3);
    await expect(about.locator('strong')).toHaveText([
      'frontend architecture',
      'full-stack development',
      '3–4 hour process to about 25 minutes.',
      'mentor engineers',
    ]);
    const resume = about.getByRole('link', {
      name: 'View résumé',
      exact: true,
    });
    await resume.scrollIntoViewIfNeeded();
    await expectReadable(resume);
    await expect(resume).toHaveAttribute('target', '_blank');
    await expect(resume).toHaveAttribute('rel', /noopener/);
    const box = await resume.boundingBox();
    expect(box!.height).toBeGreaterThanOrEqual(44);
    const response = await page.request.get(
      (await resume.getAttribute('href'))!
    );
    expect(response.status()).toBe(200);
    expect(response.headers()['content-type']).toMatch(/^application\/pdf/);
    expect((await response.body()).subarray(0, 5).toString()).toBe('%PDF-');
    await expectNoHorizontalOverflow(page);
  });
}
