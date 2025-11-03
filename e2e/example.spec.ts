import { test, expect } from '@playwright/test';

test('homepage loads successfully', async ({ page }) => {
  await page.goto('/');

  // Check that the page loaded
  await expect(page).toHaveURL('/');

  // Example: Check for a heading or element
  // await expect(page.locator('h1')).toBeVisible();
});

test('has page title', async ({ page }) => {
  await page.goto('/');

  // Update this with your actual page title
  await expect(page).toHaveTitle(/JP Engineering/i);
});
