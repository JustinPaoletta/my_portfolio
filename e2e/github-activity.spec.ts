import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

for (const width of [320, 390, 768, 1440]) {
  test(`full contribution year remains accessible at ${width}px`, async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width, height: 1000 });
    await mockPortfolioApis(page, { githubContributionWeeks: 53 });
    await page.goto('/?theme=minimal&mode=light#github');
    const calendar = page.getByRole('region', {
      name: 'GitHub contribution calendar',
      exact: true,
    });
    await expect(calendar).toBeVisible();
    await expect(calendar.locator('.contribution-week')).toHaveCount(53);
    await expect(calendar.getByRole('img')).toHaveCount(371);
    await expect(page.locator('.graph-title')).toContainText(
      'the last 12 months'
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);

    if (width < 1000) {
      await expect(calendar).toHaveAttribute('tabindex', '0');
      const earlier = page.getByRole('button', {
        name: 'Scroll to earlier contributions',
      });
      const later = page.getByRole('button', {
        name: 'Scroll to later contributions',
      });
      await expect(earlier).toBeHidden();
      await later.click();
      await expect(earlier).toBeVisible();
      await expect
        .poll(() => calendar.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
      await earlier.click();
      await expect(earlier).toBeHidden();
      await calendar.scrollIntoViewIfNeeded();
      await calendar.focus();
      await calendar.press('ArrowRight');
      await expect
        .poll(() => calendar.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
      let previousLeft = -1;
      let stableSamples = 0;
      await expect
        .poll(
          async () => {
            const left = await calendar.evaluate((el) => el.scrollLeft);
            stableSamples =
              Math.abs(left - previousLeft) < 0.1 ? stableSamples + 1 : 0;
            previousLeft = left;
            return stableSamples;
          },
          { intervals: [100, 150, 250] }
        )
        .toBeGreaterThanOrEqual(3);
      // Reach both ends of the native scroll area and confirm no weeks are lost.
      await calendar.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      await calendar.scrollIntoViewIfNeeded();
      await expect(calendar.getByRole('img').last()).toBeInViewport();
      await expect(later).toBeHidden();
      await expect(earlier).toBeVisible();
      await calendar.evaluate((el) => {
        el.scrollLeft = 0;
      });
      await calendar.scrollIntoViewIfNeeded();
      await expect(calendar.getByRole('img').first()).toBeInViewport();
      await expect(earlier).toBeHidden();
      await expect(later).toBeVisible();
      await page.setViewportSize({ width: 1440, height: 1000 });
      await expect(later).toBeHidden();
      await expect(earlier).toBeHidden();
    } else {
      expect(
        await calendar.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)
      ).toBe(true);
      await expect(
        page.getByRole('button', {
          name: /Scroll to (earlier|later) contributions/,
        })
      ).toHaveCount(0);
    }
  });
}
