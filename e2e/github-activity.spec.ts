import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

for (const width of [320, 390, 768, 1440]) {
  test(`full contribution year remains accessible at ${width}px`, async ({
    page,
  }) => {
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
      await expect(
        page.getByText('Scroll horizontally to see the full year.')
      ).toBeVisible();
      await calendar.focus();
      await calendar.press('ArrowRight');
      await expect
        .poll(() => calendar.evaluate((el) => el.scrollLeft))
        .toBeGreaterThan(0);
      // Reach both ends of the native scroll area and confirm no weeks are lost.
      await calendar.evaluate((el) => {
        el.scrollLeft = el.scrollWidth;
      });
      await expect(calendar.getByRole('img').last()).toBeInViewport();
      await calendar.evaluate((el) => {
        el.scrollLeft = 0;
      });
      await expect(calendar.getByRole('img').first()).toBeInViewport();
    } else {
      expect(
        await calendar.evaluate((el) => el.scrollWidth <= el.clientWidth + 1)
      ).toBe(true);
      await expect(
        page.getByText('Scroll horizontally to see the full year.')
      ).toHaveCount(0);
    }
  });
}
