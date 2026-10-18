import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';
import { revealDeferredSection } from './support/sections';

for (const width of [320, 1280]) {
  test(`SQUARK stays lightweight and opens its separate preview at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockPortfolioApis(page);
    const gameRequests: string[] = [];
    page.on('request', (request) => {
      if (/squark-demo.*\.vercel\.app|\.(wasm|pck)(?:\?|$)/.test(request.url()))
        gameRequests.push(request.url());
    });
    await page.goto('/?theme=minimal&mode=dark');
    const projects = await revealDeferredSection(page, 'projects');
    const card = projects.locator('article').filter({
      has: page.getByRole('heading', { name: 'SQUARK', exact: true }),
    });
    const action = card.getByRole('link', { name: 'Play preview: SQUARK' });
    await action.scrollIntoViewIfNeeded();
    await expect(action).toBeVisible();
    await expect(
      card.getByText(/preview requires Vercel sign-in/)
    ).toBeVisible();
    await expect(
      card.getByRole('img', { name: /Actual SQUARK browser gameplay/ })
    ).toBeVisible();
    await test.info().attach(`squark-card-${width}`, {
      body: await card.screenshot(),
      contentType: 'image/png',
    });
    expect(gameRequests).toEqual([]);
    await expect(card.locator('iframe,canvas,video')).toHaveCount(0);
    const box = await action.boundingBox();
    // Firefox can lose a few millionths when subtracting large page offsets.
    // Compare CSS-pixel dimensions at 0.001px precision, preserving the 44px gate.
    expect(Math.round(box!.height * 1000) / 1000).toBeGreaterThanOrEqual(44);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
    const destination = await action.getAttribute('href');
    // Check the portfolio navigation independently of Vercel sign-in and game acceptance.
    await page.context().route(`${destination}/**`, (route) =>
      route.fulfill({
        contentType: 'text/html',
        body: '<h1>SQUARK preview destination</h1>',
      })
    );
    const popupPromise = page.waitForEvent('popup');
    await action.click();
    const popup = await popupPromise;
    await expect(popup).toHaveURL(`${destination}/`);
    await expect(
      popup.getByRole('heading', { name: 'SQUARK preview destination' })
    ).toBeVisible();
    await popup.close();
  });
}
