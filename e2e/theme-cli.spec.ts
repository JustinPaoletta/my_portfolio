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

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
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

test('cosmic theme restores the 3D nebula hero from localStorage', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'cosmic');
  });
  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(0);

  // The interactive 3D scene is mounted after the deferred hero enhancement.
  await expect(page.locator('.hero-background')).toHaveAttribute(
    'data-cosmic-scene',
    '3d'
  );
  await expect(page.locator('.cosmic-scene3d-canvas canvas')).toHaveCount(1);
});

test('cosmic restore shows the static poster fallback immediately', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.addInitScript(() => {
    localStorage.setItem('portfolio-theme', 'cosmic');
  });

  await page.goto('/', { waitUntil: 'domcontentloaded' });

  await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
  await expect(
    page.getByRole('heading', { name: 'Justin Paoletta' })
  ).toBeVisible();
  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(0);

  const startupState = await page.evaluate(() => {
    const still = document.querySelector<HTMLElement>('.hero-cosmic-still');
    if (!still) {
      return null;
    }
    const stillStyle = getComputedStyle(still);
    return {
      backgroundImage: stillStyle.backgroundImage,
      stillOpacity: Number.parseFloat(stillStyle.opacity),
    };
  });

  expect(startupState).not.toBeNull();
  expect(startupState?.backgroundImage).toContain('cosmos-poster');
  expect(startupState?.stillOpacity).toBeGreaterThan(0);
});

test('engineer poster stays visible while rich scene assets are delayed', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.route(
    /\/assets\/(?:vendor-three|EngineerCircuit3D).*\.js$/,
    async (route) => {
      await delay(1_200);
      await route.continue();
    }
  );
  await page.route('**/models/hero/circuit-board.glb', async (route) => {
    await delay(1_200);
    await route.continue();
  });

  await page.goto('/?theme=engineer&mode=dark', {
    waitUntil: 'domcontentloaded',
  });

  const visual = page.locator('.hero-engineer-visual');
  await expect(page.locator('.hero-engineer-still')).toHaveCount(1);
  await expect(visual).toHaveAttribute(
    'data-engineer-circuit-scene',
    'poster',
    { timeout: 5_000 }
  );

  const loadingState = await page.evaluate(() => {
    const still = document.querySelector<HTMLElement>('.hero-engineer-still');
    const stage = document.querySelector<HTMLElement>(
      '.engineer-circuit3d-stage'
    );

    return {
      stillOpacity: still
        ? Number.parseFloat(getComputedStyle(still).opacity)
        : 0,
      stageVisibility: stage ? getComputedStyle(stage).visibility : 'absent',
      canvasCount: document.querySelectorAll('.engineer-circuit3d-stage canvas')
        .length,
    };
  });

  expect(loadingState.stillOpacity).toBeGreaterThan(0.95);
  expect(['hidden', 'absent']).toContain(loadingState.stageVisibility);
  expect(loadingState.canvasCount).toBe(0);
});

test('cosmic poster stays visible while rich scene assets are delayed', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.route(
    /\/assets\/(?:vendor-three|CosmicScene3D).*\.js$/,
    async (route) => {
      await delay(1_200);
      await route.continue();
    }
  );
  await page.route('**/models/hero/cosmic-scene.glb', async (route) => {
    await delay(1_200);
    await route.continue();
  });

  await page.goto('/?theme=cosmic&mode=dark', {
    waitUntil: 'domcontentloaded',
  });

  const background = page.locator('.hero-background');
  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(background).toHaveAttribute('data-cosmic-scene', 'poster');
  await page.waitForTimeout(600);

  const loadingState = await page.evaluate(() => {
    const still = document.querySelector<HTMLElement>('.hero-cosmic-still');
    const stage = document.querySelector<HTMLElement>('.cosmic-scene3d-stage');

    return {
      stillOpacity: still
        ? Number.parseFloat(getComputedStyle(still).opacity)
        : 0,
      stageVisibility: stage ? getComputedStyle(stage).visibility : 'absent',
      canvasCount: document.querySelectorAll('.cosmic-scene3d-stage canvas')
        .length,
    };
  });

  expect(loadingState.stillOpacity).toBeGreaterThan(0.95);
  expect(['hidden', 'absent']).toContain(loadingState.stageVisibility);
  expect(loadingState.canvasCount).toBe(0);
});

test('reduced motion and Save-Data skip hero GLB requests', async ({
  page,
}) => {
  let glbRequests = 0;
  await page.route('**/models/hero/*.glb', async (route) => {
    glbRequests += 1;
    await route.abort();
  });

  await mockPortfolioApis(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?theme=engineer&mode=dark', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('.hero-engineer-visual')).toHaveAttribute(
    'data-engineer-circuit-scene',
    'svg'
  );
  await page.waitForTimeout(1_000);
  expect(glbRequests).toBe(0);

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: {
        saveData: true,
        effectiveType: '4g',
        addEventListener: () => {},
        removeEventListener: () => {},
      },
    });
  });
  await page.goto('/?theme=cosmic&mode=dark', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('.hero-background')).toHaveAttribute(
    'data-cosmic-scene',
    'poster'
  );
  await page.waitForTimeout(1_000);
  expect(glbRequests).toBe(0);
});

test('active hero poster is preloaded with high priority', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await mockPortfolioApis(page);
  await page.goto('/?theme=engineer&mode=light', {
    waitUntil: 'domcontentloaded',
  });

  const posterPreload = page.locator(
    'link[rel="preload"][as="image"][fetchpriority="high"]'
  );
  await expect(posterPreload).toHaveAttribute(
    'href',
    '/images/hero/engineer/engineer-poster-light-mobile.webp'
  );
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
  await expect(page.locator('.hero-cosmic-still')).toHaveCount(1);
  await expect(page.locator('video')).toHaveCount(0);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.hero-background');
        const still = document.querySelector<HTMLElement>('.hero-cosmic-still');
        const content = document.querySelector<HTMLElement>('.hero-content');
        const name = document.querySelector<HTMLElement>('.hero-name-text');
        const greeting = document.querySelector<HTMLElement>('.hero-greeting');
        const nameHeading = document.querySelector<HTMLElement>('.hero-name');
        const navLogo = document.querySelector<HTMLElement>('.nav-logo');
        const navLink = document.querySelector<HTMLElement>('.nav-link');

        if (
          !hero ||
          !still ||
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
