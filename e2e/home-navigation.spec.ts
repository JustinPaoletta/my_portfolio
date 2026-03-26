import { expect, test } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function expectHeadingInViewport(
  page: import('@playwright/test').Page,
  name: RegExp
): Promise<void> {
  const heading = page.getByRole('heading', { name });
  await heading.scrollIntoViewIfNeeded();
  await expect(heading).toBeVisible();
}

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
  await expectHeadingInViewport(page, /My Projects/i);
  await expectHeadingInViewport(page, /Experience & Education/i);
  await expectHeadingInViewport(page, /LinkedIn Articles/i);
  await expectHeadingInViewport(page, /GitHub Activity/i);
  await expectHeadingInViewport(page, /Get In Touch/i);
  await expect(page.getByRole('contentinfo')).toBeVisible();
});

test('desktop navigation scrolls to Contact section', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await page.getByRole('link', { name: 'Contact' }).click();

  await expect(page.locator('section#contact')).toBeInViewport();
  await expect(page.locator('section#contact')).toBeFocused();
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
  await expect(page.getByRole('dialog', { name: 'Main menu' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'About' })).toBeFocused();

  await page.getByRole('link', { name: 'Contact' }).click();

  await expect(page.locator('section#contact')).toBeInViewport();
  await expect(page.locator('section#contact')).toBeFocused();
  await expect(page.locator('#mobile-menu')).toHaveAttribute(
    'aria-hidden',
    'true'
  );
});
