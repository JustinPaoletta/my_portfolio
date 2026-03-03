import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

test('renders core portfolio sections in default theme', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await expect(page).toHaveTitle(/.+/);
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Justin Paoletta/i })
  ).toBeVisible();
  await expect(page.getByRole('heading', { name: /My Career/i })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /My Projects/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Experience & Education/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /GitHub Activity/i })
  ).toBeVisible();
  await expect(
    page.getByRole('heading', { name: /Get In Touch/i })
  ).toBeVisible();
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('desktop navigation scrolls to Contact section', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await page.getByRole('menuitem', { name: 'Contact' }).click();

  await expect(page.locator('section#contact')).toBeInViewport();
  await expect
    .poll(async () => page.evaluate(() => window.scrollY))
    .toBeGreaterThan(300);
});

test('mobile navigation opens, navigates, and closes', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');

  const menuButton = page.getByRole('button', { name: /open menu/i });
  await menuButton.click();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'false'
  );

  await page.getByRole('menuitem', { name: 'Contact' }).click();

  await expect(page.locator('section#contact')).toBeInViewport();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'true'
  );
});
