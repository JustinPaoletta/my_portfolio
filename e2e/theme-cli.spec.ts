import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function openThemeSwitcher(page: Page): Promise<void> {
  await page.getByRole('button', { name: /toggle theme switcher/i }).click();
  await expect(
    page.getByRole('dialog', { name: /theme settings/i })
  ).toBeVisible();
}

async function closeThemeSwitcher(page: Page): Promise<void> {
  await page.getByRole('button', { name: /toggle theme switcher/i }).click();
  await expect(
    page.getByRole('dialog', { name: /theme settings/i })
  ).toHaveCount(0);
}

test('theme selection persists after reload', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await openThemeSwitcher(page);
  await page.getByRole('option', { name: 'Cosmic' }).click();
  await closeThemeSwitcher(page);

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect
    .poll(async () =>
      page.evaluate(() => localStorage.getItem('portfolio-theme'))
    )
    .toBe('cosmic');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
});

test('color mode selection persists after reload', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await openThemeSwitcher(page);
  await page.getByRole('radio', { name: 'Light' }).click();
  await closeThemeSwitcher(page);

  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );
  await expect
    .poll(async () =>
      page.evaluate(() => localStorage.getItem('portfolio-color-mode'))
    )
    .toBe('light');

  await page.reload({ waitUntil: 'domcontentloaded' });
  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );
});

test('query params apply theme and mode overrides', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/?theme=cli&mode=light');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cli');
  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );
  await expect(
    page.locator('section[aria-label="Interactive portfolio terminal"]')
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toHaveCount(0);
});

test('CLI theme supports command execution and exit', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await openThemeSwitcher(page);
  await page.getByRole('option', { name: 'CLI' }).click();
  await closeThemeSwitcher(page);

  await expect(
    page.locator('section[aria-label="Interactive portfolio terminal"]')
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toHaveCount(0);

  const commandInput = page.getByLabel(/terminal command input/i);
  await commandInput.fill('9');
  await commandInput.press('Enter');
  await expect(page.getByText('[HELP]')).toBeVisible();

  await commandInput.fill('dog 1 treat');
  await commandInput.press('Enter');
  await expect(
    page.getByText(/Nala got a treat\. New treats count: 1/i)
  ).toBeVisible();

  await commandInput.fill('exit');
  await commandInput.press('Enter');

  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toBeVisible();
  await expect(
    page.locator('section[aria-label="Interactive portfolio terminal"]')
  ).toHaveCount(0);
});

test('CLI close control switches back to default theme', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/');

  await openThemeSwitcher(page);
  await page.getByRole('option', { name: 'CLI' }).click();
  await closeThemeSwitcher(page);

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cli');
  await page
    .getByRole('button', { name: /exit cli and switch to minimal theme/i })
    .click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'minimal');
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toBeVisible();
});
