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
  await expect(
    page.getByRole('heading', { name: 'Justin Paoletta', exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('Terminal command input')).toBeVisible();
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
  await expect(page.locator('#hero video')).toHaveCount(0);

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
  await expect(page.locator('#hero video')).toHaveCount(0);

  const startupState = await page.evaluate(() => {
    const still =
      document.querySelector<HTMLImageElement>('.hero-cosmic-still');
    if (!still) {
      return null;
    }
    const stillStyle = getComputedStyle(still);
    return {
      posterSrc: still.currentSrc || still.getAttribute('src') || '',
      stillOpacity: Number.parseFloat(stillStyle.opacity),
    };
  });

  expect(startupState).not.toBeNull();
  expect(startupState?.posterSrc).toContain('cosmos-poster');
  expect(startupState?.stillOpacity).toBeGreaterThan(0);
});

test('engineer poster load shows a single visual layer before 3D is ready', async ({
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

  await page.goto('/?theme=engineer&mode=dark', {
    waitUntil: 'domcontentloaded',
  });

  const visual = page.locator('.hero-engineer-visual');
  await expect(visual).toHaveAttribute(
    'data-engineer-circuit-scene',
    'poster',
    {
      timeout: 5_000,
    }
  );
  await expect(page.locator('.engineer-circuit')).toHaveCount(0);
  await expect(page.locator('.hero-engineer-still')).toHaveCount(1);
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
    'still'
  );
  await expect(page.locator('.hero-engineer-still')).toBeVisible();
  await expect(page.locator('.engineer-circuit3d-stage canvas')).toHaveCount(0);
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
    page.locator('section[aria-label="Portfolio terminal"]')
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
  await expect(page.locator('#hero video')).toHaveCount(0);

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.hero-background');
        const stage = document.querySelector<HTMLElement>('.hero-cosmic-stage');
        const content = document.querySelector<HTMLElement>('.hero-content');
        const name = document.querySelector<HTMLElement>('.hero-name-text');
        const greeting = document.querySelector<HTMLElement>('.hero-greeting');
        const nameHeading = document.querySelector<HTMLElement>('.hero-name');
        const navLogo = document.querySelector<SVGElement>(
          '.nav-logo .jp-logo-svg'
        );
        const navLink = document.querySelector<HTMLElement>('.nav-link');

        if (
          !hero ||
          !stage ||
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
          stillOpacity: Number.parseFloat(getComputedStyle(stage).opacity),
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
      navLinkColor: 'rgb(92, 31, 153)',
      navLogoPrimary: '#5c1f99',
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
  await expect(
    page.getByRole('dialog', { name: /theme settings/i })
  ).toHaveCount(0);

  await expect(
    page.locator('section[aria-label="Portfolio terminal"]')
  ).toBeVisible();
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toHaveCount(0);
  await waitForCliBootComplete(page);
  await expect(page.locator('main')).not.toHaveAttribute('inert', '');

  const commandInput = page.getByLabel(/terminal command input/i);
  await expect(commandInput).toBeFocused();
  await commandInput.fill('help');
  await commandInput.press('Enter');
  await expect(page.getByText('[HELP]')).toBeVisible();

  await commandInput.fill('dog nala treat');
  await commandInput.press('Enter');
  await expect.poll(async () => nalaTreatPosts).toBeGreaterThan(0);
  await expect(page.getByText(/Nala got a treat\./i)).toBeVisible();

  await commandInput.fill('exit');
  await commandInput.press('Enter');

  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toBeVisible();
  await expect(
    page.locator('section[aria-label="Portfolio terminal"]')
  ).toHaveCount(0);
});

test('CLI commands control appearance and return to the main site', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.goto('/?theme=cli&mode=dark');
  await waitForCliBootComplete(page);
  const commandInput = page.getByLabel('Terminal command input');
  await expect(
    page.getByRole('button', { name: /toggle theme switcher/i })
  ).toHaveCount(0);

  await commandInput.fill('mode light');
  await commandInput.press('Enter');
  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem('portfolio-color-mode'))
    )
    .toBe('light');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute(
    'data-color-mode',
    'light'
  );

  await commandInput.fill('theme engineer');
  await commandInput.press('Enter');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'engineer');
  await expect(
    page.getByRole('navigation', { name: /main navigation/i })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /toggle theme switcher/i })
  ).toBeVisible();
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('portfolio-theme')))
    .toBe('engineer');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'engineer');
});

test('software graphics keeps a rendered room without continuously redrawing', async ({
  page,
}) => {
  await mockPortfolioApis(page);
  await page.addInitScript(() => {
    const target = window as typeof window & { roomRenderCount: number };
    target.roomRenderCount = 0;
    for (const prototype of [
      WebGLRenderingContext.prototype,
      WebGL2RenderingContext.prototype,
    ]) {
      const getParameter = prototype.getParameter;
      prototype.getParameter = function (parameter: number) {
        return parameter === 0x9246 || parameter === this.RENDERER
          ? 'ANGLE (Google, SwiftShader Device)'
          : getParameter.call(this, parameter);
      };
      const clear = prototype.clear;
      prototype.clear = function (mask: number) {
        target.roomRenderCount += 1;
        return clear.call(this, mask);
      };
    }
  });
  await page.goto('/?theme=engineer&mode=dark', {
    waitUntil: 'domcontentloaded',
  });
  await expect(page.locator('.engineer-circuit3d-stage')).toHaveAttribute(
    'data-room-renderer',
    'software'
  );
  await expect(page.locator('.hero-engineer-visual')).toHaveAttribute(
    'data-engineer-circuit-poster',
    'hidden',
    { timeout: 20000 }
  );
  await expect(page.locator('.engineer-circuit3d-stage canvas')).toHaveCount(1);
  const countFrames = () =>
    page.evaluate(
      () =>
        (window as typeof window & { roomRenderCount: number }).roomRenderCount
    );
  await page.waitForTimeout(100);
  const frames = await countFrames();
  expect(frames).toBeGreaterThan(0);
  await page.waitForTimeout(350);
  expect(await countFrames()).toBe(frames);
  await page.setViewportSize({ width: 900, height: 700 });
  await expect.poll(countFrames).toBeGreaterThan(frames);
});
