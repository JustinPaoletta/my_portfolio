import { test, expect } from '@playwright/test';

/**
 * Visual regression tests for the portfolio website.
 * These tests capture screenshots and compare them against baseline images.
 *
 * To update baselines after intentional visual changes:
 * npm run test:visual:update
 */
test.describe('Visual Regression Tests', () => {
  test.describe('Desktop Viewport', () => {
    test('homepage visual appearance', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');

      // Wait for any animations to complete
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-desktop.png', {
        fullPage: true,
        maxDiffPixels: 100, // Allow small differences (antialiasing, etc.)
      });
    });

    test('homepage header section', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const header = page.locator('header').first();
      if ((await header.count()) > 0) {
        await expect(header).toHaveScreenshot('homepage-header-desktop.png', {
          maxDiffPixels: 50,
        });
      }
    });

    test('homepage main content', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const main = page.locator('main').first();
      if ((await main.count()) > 0) {
        await expect(main).toHaveScreenshot('homepage-main-desktop.png', {
          maxDiffPixels: 100,
        });
      }
    });
  });

  test.describe('Mobile Viewport', () => {
    test.use({
      viewport: { width: 375, height: 667 }, // iPhone SE size
    });

    test('homepage visual appearance on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-mobile.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });

    test('homepage header on mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      const header = page.locator('header').first();
      if ((await header.count()) > 0) {
        await expect(header).toHaveScreenshot('homepage-header-mobile.png', {
          maxDiffPixels: 50,
        });
      }
    });
  });

  test.describe('Tablet Viewport', () => {
    test.use({
      viewport: { width: 768, height: 1024 }, // iPad size
    });

    test('homepage visual appearance on tablet', async ({ page }) => {
      await page.goto('/');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(500);

      await expect(page).toHaveScreenshot('homepage-tablet.png', {
        fullPage: true,
        maxDiffPixels: 100,
      });
    });
  });
});
