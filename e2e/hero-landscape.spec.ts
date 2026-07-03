import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

const MOBILE_LANDSCAPE_VIEWPORT = { width: 844, height: 390 } as const;
const MOBILE_LANDSCAPE_SHORT_VIEWPORT = { width: 667, height: 375 } as const;

const HERO_SOCIAL_LABELS = [
  'GitHub Profile',
  'LinkedIn Profile',
  'Send Email',
] as const;

async function expectHeroSocialLinksInViewport(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  expect(viewport).not.toBeNull();

  for (const label of HERO_SOCIAL_LABELS) {
    const link = page.getByRole('link', { name: label });
    await expect(link).toBeVisible();

    const box = await link.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.y).toBeGreaterThanOrEqual(0);
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.y + box!.height).toBeLessThanOrEqual(viewport!.height);
    expect(box!.x + box!.width).toBeLessThanOrEqual(viewport!.width);
  }
}

test.describe('hero social links in mobile landscape @mobile', () => {
  for (const theme of ['engineer', 'minimal', 'cosmic'] as const) {
    test(`${theme} theme keeps social links fully visible`, async ({
      page,
    }) => {
      await mockPortfolioApis(page);
      await page.setViewportSize(MOBILE_LANDSCAPE_VIEWPORT);
      await page.goto(`/?theme=${theme}&mode=light`, {
        waitUntil: 'domcontentloaded',
      });

      await expect(
        page.getByRole('heading', { name: /Justin Paoletta/i })
      ).toBeVisible();

      const landscape = await page.evaluate(() => ({
        width: window.innerWidth,
        height: window.innerHeight,
      }));
      expect(landscape.width).toBeGreaterThan(landscape.height);

      await expectHeroSocialLinksInViewport(page);
    });
  }

  test('engineer theme keeps social links visible on shorter landscape viewports', async ({
    page,
  }) => {
    await mockPortfolioApis(page);
    await page.setViewportSize(MOBILE_LANDSCAPE_SHORT_VIEWPORT);
    await page.goto('/?theme=engineer&mode=light', {
      waitUntil: 'domcontentloaded',
    });

    await expect(
      page.getByRole('heading', { name: /Justin Paoletta/i })
    ).toBeVisible();

    await expectHeroSocialLinksInViewport(page);
  });
});
