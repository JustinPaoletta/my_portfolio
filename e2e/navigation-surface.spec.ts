import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function expectDividerOpacity(navigation: Locator, opacity: string) {
  await expect
    .poll(() =>
      navigation.evaluate(
        (element) => getComputedStyle(element, '::after').opacity
      )
    )
    .toBe(opacity);
}

for (const theme of ['minimal', 'engineer', 'cosmic'] as const) {
  for (const mode of ['light', 'dark'] as const) {
    test(`${theme} ${mode} navigation stays opaque and only shows its divider after scrolling`, async ({
      page,
    }, testInfo) => {
      await page.emulateMedia({ colorScheme: mode, reducedMotion: 'reduce' });
      await mockPortfolioApis(page);

      for (const width of [390, 1280]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(`/?theme=${theme}&mode=${mode}`);
        const navigation = page.getByRole('navigation', {
          name: 'Main navigation',
          exact: true,
        });
        await expect(navigation).toBeVisible();
        await expect(navigation).not.toHaveClass(/scrolled/);
        await expectDividerOpacity(navigation, '0');
        // Keep the desktop resume action in the mobile menu on narrow screens.
        if (width === 390) {
          await expect(navigation.locator('.nav-resume')).not.toBeVisible();
        } else {
          await expect(navigation.locator('.nav-resume')).toBeVisible();
        }
        const background = await navigation.evaluate((element) => {
          const color = getComputedStyle(element).backgroundColor;
          const canvas = document.createElement('canvas');
          canvas.width = canvas.height = 1;
          const context = canvas.getContext('2d')!;
          context.fillStyle = color;
          context.fillRect(0, 0, 1, 1);
          return { color, alpha: context.getImageData(0, 0, 1, 1).data[3] };
        });
        // Verify actual opacity, independent of which theme token provides it.
        expect(background.alpha).toBe(255);
        const accessibility = await new AxeBuilder({ page })
          .include('.navigation')
          .analyze();
        expect(accessibility.violations).toEqual([]);
        await testInfo.attach(`${theme}-${mode}-${width}-initial-banner`, {
          body: await navigation.screenshot(),
          contentType: 'image/png',
        });

        await page.evaluate(() =>
          window.scrollTo({ top: 1, behavior: 'instant' })
        );
        await expectDividerOpacity(navigation, '1');

        await page.evaluate(() =>
          window.scrollTo({ top: 350, behavior: 'instant' })
        );
        await expect(navigation).toHaveClass(/scrolled/);
        await expectDividerOpacity(navigation, '1');
        await testInfo.attach(`${theme}-${mode}-${width}-scrolled-banner`, {
          body: await navigation.screenshot(),
          contentType: 'image/png',
        });
        await expect(navigation).toHaveCSS(
          'background-color',
          background.color
        );

        if (width === 390) {
          await page
            .getByRole('button', { name: 'Open menu', exact: true })
            .click();
          await expect(page.getByRole('dialog')).toBeVisible();
          await expect(navigation).toHaveCSS(
            'background-color',
            background.color
          );
          await page.keyboard.press('Escape');
          await expect(page.getByRole('dialog')).not.toBeVisible();
        }

        await page.evaluate(() =>
          window.scrollTo({ top: 0, behavior: 'instant' })
        );
        await expect(navigation).not.toHaveClass(/scrolled/);
        await expectDividerOpacity(navigation, '0');
        await expect(navigation).toHaveCSS(
          'background-color',
          background.color
        );
      }
    });
  }
}
