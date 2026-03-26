import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).analyze();
  expect(
    results.violations,
    results.violations.map((violation) => violation.id).join(', ')
  ).toEqual([]);
}

test('@a11y default shell supports skip link focus and has no axe violations', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: /skip to main content/i })
  ).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(page.locator('main')).toBeFocused();

  await expectNoAxeViolations(page);
});

test('@a11y mobile menu acts as a keyboard-managed dialog', async ({
  page,
}) => {
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

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Projects' })).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(menuButton).toBeFocused();
});

test('@a11y theme switcher dialog has no violations and restores focus', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  const toggle = page.getByRole('button', { name: /toggle theme switcher/i });
  await toggle.click();

  const dialog = page.getByRole('dialog', { name: /theme settings/i });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole('radio', { name: 'System' })).toBeFocused();

  await expectNoAxeViolations(page);

  await page.keyboard.press('Escape');
  await expect(toggle).toBeFocused();
});

test('@a11y contact form surfaces field-level errors to assistive tech', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.goto('/');
  await page.locator('section#contact').scrollIntoViewIfNeeded();

  await page.getByLabel('Email Address').fill('bad-email');
  await page.getByLabel('Message').fill('short');
  await page.getByRole('button', { name: /send message/i }).click();

  await expect(page.getByLabel('Your Name')).toBeFocused();
  await expect(page.getByLabel('Your Name')).toHaveAttribute(
    'aria-invalid',
    'true'
  );
  await expect(page.getByText(/Enter a valid email address./i)).toBeVisible();
});

test('@a11y cosmic theme respects reduced motion', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?theme=cosmic&mode=light');

  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(page.locator('.hero-cosmic-video')).toHaveCount(0);
});
