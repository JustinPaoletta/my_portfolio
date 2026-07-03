import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

type HeroTheme = 'engineer' | 'cosmic';

function sceneRootSelector(theme: HeroTheme): string {
  return theme === 'engineer' ? '.hero-engineer-visual' : '.hero-background';
}

function stillSelector(theme: HeroTheme): string {
  return theme === 'engineer' ? '.hero-engineer-still' : '.hero-cosmic-still';
}

function posterAttribute(theme: HeroTheme): string {
  return theme === 'engineer'
    ? 'data-engineer-circuit-poster'
    : 'data-cosmic-poster';
}

function sceneAttribute(theme: HeroTheme): string {
  return theme === 'engineer'
    ? 'data-engineer-circuit-scene'
    : 'data-cosmic-scene';
}

function transitionAttribute(theme: HeroTheme): string {
  return theme === 'engineer'
    ? 'data-engineer-circuit-transition'
    : 'data-cosmic-transition';
}

async function waitForMidFadeOpacity(
  page: Page,
  theme: HeroTheme
): Promise<number> {
  const rootSelector = sceneRootSelector(theme);
  const stillQuery = stillSelector(theme);

  const handle = await page.waitForFunction(
    ({
      rootSelector: rootQuery,
      stillQuery,
      sceneAttribute: sceneAttr,
      posterAttribute: posterAttr,
      transitionAttribute: transitionAttr,
    }) => {
      const root = document.querySelector<HTMLElement>(rootQuery);
      const still = document.querySelector<HTMLImageElement>(stillQuery);
      const overlay = still?.closest<HTMLElement>('.hero-poster-overlay');
      if (!root || !still || !overlay) {
        return false;
      }

      const isFading =
        root.getAttribute(transitionAttr) === 'fading' &&
        root.getAttribute(sceneAttr) === '3d' &&
        root.getAttribute(posterAttr) === 'visible' &&
        overlay.getAttribute('data-poster-fading') === 'true' &&
        still.getAttribute('data-poster-source') === 'static' &&
        still.src.length > 0 &&
        root.querySelector('canvas') !== null;

      if (!isFading) {
        return false;
      }

      const opacity = Number.parseFloat(getComputedStyle(overlay).opacity);
      if (!Number.isFinite(opacity) || opacity <= 0 || opacity >= 1) {
        return false;
      }

      return opacity;
    },
    {
      rootSelector,
      stillQuery,
      sceneAttribute: sceneAttribute(theme),
      posterAttribute: posterAttribute(theme),
      transitionAttribute: transitionAttribute(theme),
    },
    { timeout: 20_000, polling: 16 }
  );

  return handle.jsonValue() as Promise<number>;
}

test.describe('Hero poster transition parity', () => {
  for (const theme of ['engineer', 'cosmic'] as const) {
    test(`${theme} fades the static poster overlay over the live canvas`, async ({
      page,
    }) => {
      await mockPortfolioApis(page);
      await page.goto(`/?theme=${theme}&mode=dark`, {
        waitUntil: 'domcontentloaded',
      });

      const root = page.locator(sceneRootSelector(theme));

      const midFadeOpacity = await waitForMidFadeOpacity(page, theme);
      expect(midFadeOpacity).toBeLessThan(1);
      expect(midFadeOpacity).toBeGreaterThan(0);

      await expect(root).toHaveAttribute(posterAttribute(theme), 'hidden', {
        timeout: 5_000,
      });
      await expect(page.locator('canvas')).toHaveCount(1);
      await expect(page.locator('.hero-poster-overlay')).toHaveCount(0);
    });
  }

  test('cosmic dark hero overlays stay stable across poster and 3D states', async ({
    page,
  }) => {
    await mockPortfolioApis(page);
    await page.goto('/?theme=cosmic&mode=dark', {
      waitUntil: 'domcontentloaded',
    });

    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cosmic');
    await expect(page.locator('html')).toHaveAttribute(
      'data-color-mode',
      'dark'
    );

    const readOverlayState = async (): Promise<{
      background: string;
      beforeOpacity: number;
    }> =>
      page.evaluate(() => {
        const hero = document.querySelector<HTMLElement>('.hero-background');
        if (!hero) {
          return { background: '', beforeOpacity: 0 };
        }

        return {
          background: getComputedStyle(hero).backgroundImage,
          beforeOpacity: Number.parseFloat(
            getComputedStyle(hero, '::before').opacity
          ),
        };
      });

    await page.waitForFunction(() => {
      const hero = document.querySelector<HTMLElement>('.hero-background');
      if (!hero) {
        return false;
      }

      return getComputedStyle(hero).backgroundImage.includes('900px');
    });

    await expect(page.locator('.hero-background')).toHaveAttribute(
      'data-cosmic-scene',
      'poster',
      { timeout: 5_000 }
    );
    const posterState = await readOverlayState();

    await expect(page.locator('.hero-background')).toHaveAttribute(
      'data-cosmic-scene',
      '3d',
      { timeout: 20_000 }
    );
    const sceneState = await readOverlayState();

    expect(sceneState.background).toBe(posterState.background);
    expect(sceneState.beforeOpacity).toBeCloseTo(posterState.beforeOpacity, 2);
  });
});
