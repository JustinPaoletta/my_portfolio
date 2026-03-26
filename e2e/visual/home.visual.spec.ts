import { expect, test } from '@playwright/test';
import {
  DESKTOP_HERO_VIEWPORT,
  FULL_PAGE_VIEWPORT,
  MOBILE_VIEWPORT,
  gotoVisualState,
  primeFullPage,
  waitForPageToSettle,
} from '../support/visual';

const themeMatrix = [
  { theme: 'minimal', mode: 'light' },
  { theme: 'minimal', mode: 'dark' },
  { theme: 'engineer', mode: 'light' },
  { theme: 'engineer', mode: 'dark' },
  { theme: 'cosmic', mode: 'light' },
  { theme: 'cosmic', mode: 'dark' },
  { theme: 'cli', mode: 'light' },
  { theme: 'cli', mode: 'dark' },
] as const;

test.describe('@visual home states', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const { theme, mode } of themeMatrix) {
    test(`captures ${theme} ${mode} desktop hero viewport`, async ({
      page,
    }) => {
      await gotoVisualState(page, {
        theme,
        mode,
        viewport: DESKTOP_HERO_VIEWPORT,
      });

      await expect(page).toHaveScreenshot(`home-${theme}-${mode}-desktop.png`, {
        caret: 'hide',
      });
    });
  }

  test('captures minimal light mobile viewport', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: MOBILE_VIEWPORT,
    });

    await expect(page).toHaveScreenshot('home-minimal-light-mobile.png', {
      caret: 'hide',
    });
  });

  test('captures minimal light mobile navigation open state', async ({
    page,
  }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: MOBILE_VIEWPORT,
    });

    await page.getByRole('button', { name: /open menu/i }).click();
    await expect(page.locator('#mobile-menu')).toHaveAttribute(
      'aria-hidden',
      'false'
    );
    await waitForPageToSettle(page);

    await expect(page).toHaveScreenshot('navigation-mobile-open.png', {
      caret: 'hide',
    });
  });

  test('captures minimal light full-page smoke state', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: FULL_PAGE_VIEWPORT,
    });
    await primeFullPage(page);

    await expect(page).toHaveScreenshot('home-minimal-light-fullpage.png', {
      caret: 'hide',
      fullPage: true,
      maxDiffPixels: 200,
      mask: [page.locator('.copyright')],
    });
  });
});
