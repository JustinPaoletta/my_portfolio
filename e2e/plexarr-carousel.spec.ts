import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';
import { revealDeferredSection } from './support/sections';

for (const width of [320, 390, 1440]) {
  test(`Plexarr screenshot carousel works without request media at ${width}px`, async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockPortfolioApis(page);
    const theme =
      width === 390 ? 'cosmic' : width === 1440 ? 'engineer' : 'minimal';
    await page.goto(
      `/?theme=${theme}&mode=${width === 1440 ? 'light' : 'dark'}&visual-test=1`
    );
    const projects = await revealDeferredSection(page, 'projects');
    const card = projects.locator('article.featured-project').filter({
      has: page.getByRole('heading', { name: 'Plexarr', exact: true }),
    });
    const carousel = card.getByRole('region', {
      name: 'Plexarr feature screenshots',
    });
    await carousel.scrollIntoViewIfNeeded();
    await expect(carousel).toHaveAttribute('aria-roledescription', 'carousel');
    await expect(card.locator('video, iframe')).toHaveCount(0);
    await expect(card).not.toContainText(/request/i);
    const next = carousel.getByRole('button', {
      name: 'Next Plexarr screenshot',
    });
    const previous = carousel.getByRole('button', {
      name: 'Previous Plexarr screenshot',
    });
    const media = carousel.locator('.plexarr-carousel__media');
    const initialBounds = await media.boundingBox();
    for (const title of [
      'Discover',
      'Personalized picks',
      'Title details & ratings',
    ]) {
      await expect(
        carousel.getByRole('heading', { name: title, exact: true })
      ).toBeVisible();
      await expect
        .poll(() =>
          carousel
            .getByRole('img')
            .evaluateAll((images) =>
              images.every(
                (image) =>
                  image instanceof HTMLImageElement &&
                  image.complete &&
                  image.naturalWidth > 0
              )
            )
        )
        .toBe(true);
      for (const image of await carousel.getByRole('img').all()) {
        const imageBounds = await image.boundingBox();
        const bounds = await media.boundingBox();
        expect(imageBounds!.y).toBeGreaterThanOrEqual(bounds!.y - 1);
        expect(imageBounds!.y + imageBounds!.height).toBeLessThanOrEqual(
          bounds!.y + bounds!.height + 1
        );
        expect(bounds!.height).toBeCloseTo(initialBounds!.height, 0);
        expect(await image.getAttribute('src')).toMatch(
          /\/plexarr-(catalog|picks|overview|rating)-\d+\.webp$/
        );
      }
      await expect(carousel.getByRole('link')).toHaveCount(0);
      expect(
        (await new AxeBuilder({ page }).include('.plexarr-carousel').analyze())
          .violations
      ).toEqual([]);
      if (browserName === 'chromium' && width >= 390) {
        await carousel.screenshot({
          path: test
            .info()
            .outputPath(
              `plexarr-${width}-${title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`
            ),
          animations: 'disabled',
        });
      }
      await next.click();
    }
    await expect(carousel.getByText('1 of 3', { exact: true })).toBeVisible();
    await next.focus();
    await page.keyboard.press('End');
    await expect(carousel.getByText('3 of 3', { exact: true })).toBeVisible();
    await page.keyboard.press('Home');
    await expect(next).toBeFocused();
    await previous.click();
    await expect(carousel.getByText('3 of 3', { exact: true })).toBeVisible();
    await carousel
      .getByRole('button', { name: 'Show Personalized picks' })
      .click();
    await expect(carousel.getByText('2 of 3', { exact: true })).toBeVisible();
    if (width < 500) {
      // Desktop Firefox has no Touch constructor. Chromium and WebKit exercise
      // touch gestures; every browser still exercises the same buttons and keys.
      if (browserName !== 'firefox') {
        await media.dispatchEvent('touchstart', {
          touches: [{ identifier: 0, clientX: 240, clientY: 100 }],
        });
        await media.dispatchEvent('touchend', {
          changedTouches: [{ identifier: 0, clientX: 80, clientY: 105 }],
        });
        await expect(
          carousel.getByText('3 of 3', { exact: true })
        ).toBeVisible();
      }
      const info = await card.locator('.project-content').boundingBox();
      const demo = await carousel.boundingBox();
      expect(demo!.y).toBeGreaterThanOrEqual(info!.y + info!.height - 1);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  });
}
