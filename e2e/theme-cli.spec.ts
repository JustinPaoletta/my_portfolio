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
  await page.getByRole('radio', { name: 'Cosmic' }).click();
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
  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(page.locator('.hero-cosmic-video')).toHaveAttribute(
    'poster',
    '/images/hero/cosmic/cosmos-first-frame.webp'
  );
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
        // Video must have been accepted for playback and have data available.
        // Firefox headless may not advance readyState past HAVE_METADATA
        // even when fully buffered, so we also accept buffered data.
        const hasDecodedFrames =
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
        const hasBufferedData =
          video.buffered.length > 0 && video.buffered.end(0) > 0;
        return !video.paused && (hasDecodedFrames || hasBufferedData);
      });
    })
    .toBe(true);
});

test('cosmic restore keeps a visible fallback while video is delayed', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.route('**/video/cosmos.mp4', async (route) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    await route.continue();
  });
  await page.route(
    '**/images/hero/cosmic/cosmos-first-frame.webp',
    async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await route.continue();
    }
  );
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'cosmic');
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect(
    page.getByRole('heading', { name: 'Justin Paoletta' })
  ).toBeVisible();
  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(page.locator('.hero-cosmic-video')).toHaveCount(1);
  await expect(page.locator('.hero-background')).toHaveAttribute(
    'data-cosmic-video-ready',
    'false'
  );

  const startupState = await page.evaluate(() => {
    const heroBackground =
      document.querySelector<HTMLElement>('.hero-background');
    const still = document.querySelector<HTMLElement>('.hero-cosmic-still');
    const video =
      document.querySelector<HTMLVideoElement>('.hero-cosmic-video');

    if (!heroBackground || !still || !video) {
      return null;
    }

    const heroStyle = getComputedStyle(heroBackground);
    const stillStyle = getComputedStyle(still);

    return {
      backgroundImage: heroStyle.backgroundImage,
      stillOpacity: Number.parseFloat(stillStyle.opacity),
      videoPoster: video.getAttribute('poster'),
      videoHasCurrentData:
        video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA,
      videoCurrentTime: video.currentTime,
    };
  });

  expect(startupState).not.toBeNull();
  expect(startupState?.backgroundImage).not.toBe('none');
  expect(startupState?.stillOpacity).toBeGreaterThan(0);
  expect(startupState?.videoPoster).toBe(
    '/images/hero/cosmic/cosmos-first-frame.webp'
  );
  expect(startupState?.videoHasCurrentData).toBe(false);
  expect(startupState?.videoCurrentTime).toBe(0);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const heroBackground =
          document.querySelector<HTMLElement>('.hero-background');
        const video =
          document.querySelector<HTMLVideoElement>('.hero-cosmic-video');
        if (!heroBackground || !video) {
          return false;
        }

        const hasDecodedFrames =
          video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA;
        const hasBufferedData =
          video.buffered.length > 0 && video.buffered.end(0) > 0;

        return (
          heroBackground.getAttribute('data-cosmic-video-ready') === 'true' &&
          !video.paused &&
          (hasDecodedFrames || hasBufferedData)
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
  await page.route('**/video/cosmos.mp4', async (route) => {
    await route.abort();
  });
  await page.goto('/?theme=cosmic&mode=light');

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );
  await expect(page.locator('.hero-background')).toHaveAttribute(
    'data-cosmic-video-ready',
    'false'
  );

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.hero-background');
        const still = document.querySelector<HTMLElement>('.hero-cosmic-still');
        const video =
          document.querySelector<HTMLVideoElement>('.hero-cosmic-video');
        const content = document.querySelector<HTMLElement>('.hero-content');
        const name = document.querySelector<HTMLElement>('.hero-name-text');
        const greeting = document.querySelector<HTMLElement>('.hero-greeting');
        const nameHeading = document.querySelector<HTMLElement>('.hero-name');
        const navLogo = document.querySelector<HTMLElement>('.nav-logo');
        const navLink = document.querySelector<HTMLElement>('.nav-link');

        if (
          !hero ||
          !still ||
          !video ||
          !content ||
          !name ||
          !greeting ||
          !nameHeading ||
          !navLogo ||
          !navLink
        ) {
          return null;
        }

        const heroStyles = getComputedStyle(hero);
        const contentStyles = getComputedStyle(content);
        const beforeStyles = getComputedStyle(hero, '::before');

        return {
          heroBackground: heroStyles.backgroundImage,
          beforeBackground: beforeStyles.backgroundColor,
          contentBackground: contentStyles.backgroundImage,
          stillOpacity: Number.parseFloat(getComputedStyle(still).opacity),
          videoOpacity: Number.parseFloat(getComputedStyle(video).opacity),
          nameColor: getComputedStyle(name).color,
          greetingColor: getComputedStyle(greeting).color,
          contentFontFamily: getComputedStyle(content).fontFamily,
          greetingFontFamily: getComputedStyle(greeting).fontFamily,
          nameFontFamily: getComputedStyle(nameHeading).fontFamily,
          navLinkColor: getComputedStyle(navLink).color,
          navLogoPrimary: getComputedStyle(navLogo)
            .getPropertyValue('--jp-logo-primary')
            .trim(),
        };
      });
    })
    .toEqual({
      heroBackground: expect.stringContaining('rgb(159, 131, 190)'),
      beforeBackground: 'rgba(0, 0, 0, 0)',
      contentBackground: 'none',
      stillOpacity: 0.4,
      videoOpacity: 0,
      nameColor: 'rgb(20, 5, 31)',
      greetingColor: 'rgb(255, 255, 255)',
      contentFontFamily: expect.stringContaining('Space Grotesk'),
      greetingFontFamily: expect.stringContaining('Space Grotesk'),
      nameFontFamily: expect.stringContaining('Inter'),
      navLinkColor: 'rgb(248, 241, 255)',
      navLogoPrimary: '#f8f1ff',
    });

  await page.evaluate(() => {
    window.scrollTo({ top: 160, behavior: 'instant' });
  });

  await expect(page.locator('.navigation')).toHaveClass(/scrolled/);
  await expect
    .poll(async () =>
      page.evaluate(() => {
        const navLink = document.querySelector<HTMLElement>('.nav-link');
        return navLink ? getComputedStyle(navLink).color : null;
      })
    )
    .toBe('rgb(92, 31, 153)');
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
  await page
    .getByRole('dialog', { name: /theme settings/i })
    .getByRole('radio', { name: 'CLI' })
    .click();
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
  await page
    .getByRole('dialog', { name: /theme settings/i })
    .getByRole('radio', { name: 'CLI' })
    .click();
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
