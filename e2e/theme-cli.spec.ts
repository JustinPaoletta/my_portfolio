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

async function waitForCliBootComplete(page: Page): Promise<void> {
  await expect(page.locator('.cli-history .cli-line').first()).toHaveText(
    /Use panel options or type a number\/command\./i
  );
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

test('cosmic theme hero video autoplays when restored from localStorage', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'cosmic');
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect(page.locator('.hero-cosmic-video')).toHaveCount(1);
  await expect(page.locator('.hero-background')).toHaveAttribute(
    'data-cosmic-video-ready',
    'true'
  );

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const video =
          document.querySelector<HTMLVideoElement>('.hero-cosmic-video');
        if (!video) {
          return false;
        }
        return (
          !video.paused &&
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA &&
          video.currentTime > 0
        );
      });
    })
    .toBe(true);
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

test('cosmic light mode applies light hero styling', async ({ page }) => {
  await mockPortfolioApis(page);
  await page.goto('/?theme=cosmic&mode=light');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.hero-background');
        const still = document.querySelector<HTMLElement>('.hero-cosmic-still');
        const name = document.querySelector<HTMLElement>('.hero-name-text');
        const greeting = document.querySelector<HTMLElement>('.hero-greeting');

        if (!hero || !still || !name || !greeting) {
          return null;
        }

        const heroStyles = getComputedStyle(hero);
        const beforeStyles = getComputedStyle(hero, '::before');

        return {
          heroBackground: heroStyles.backgroundImage,
          beforeBackground: beforeStyles.backgroundColor,
          stillOpacity: Number.parseFloat(getComputedStyle(still).opacity),
          nameColor: getComputedStyle(name).color,
          greetingColor: getComputedStyle(greeting).color,
        };
      });
    })
    .toEqual({
      heroBackground: expect.stringContaining('rgb(253, 248, 255)'),
      beforeBackground: 'rgba(0, 0, 0, 0)',
      stillOpacity: 0.2,
      nameColor: 'rgb(26, 10, 46)',
      greetingColor: 'rgb(123, 44, 191)',
    });
});

test('CLI theme supports command execution and exit', async ({ page }) => {
  let nalaTreatPosts = 0;
  await mockPortfolioApis(page, {
    onPetDogsPost: ({ dogName, action }) => {
      if (dogName === 'Nala' && action === 'treat') {
        nalaTreatPosts += 1;
      }
    },
  });
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
  await waitForCliBootComplete(page);

  const commandInput = page.getByLabel(/terminal command input/i);
  await commandInput.fill('9');
  await commandInput.press('Enter');
  await expect(page.getByText('[HELP]')).toBeVisible();

  await commandInput.fill('dog 1 treat');
  await commandInput.press('Enter');
  await expect.poll(async () => nalaTreatPosts).toBeGreaterThan(0);
  await expect(page.getByText(/Nala got a treat\./i)).toBeVisible();

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
