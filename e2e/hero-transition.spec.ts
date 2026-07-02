import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

type HeroTheme = 'engineer' | 'cosmic';

function sceneRootSelector(theme: HeroTheme): string {
  return theme === 'engineer' ? '.hero-engineer-visual' : '.hero-background';
}

function stillSelector(theme: HeroTheme): string {
  return theme === 'engineer' ? '.hero-engineer-still' : '.hero-cosmic-still';
}

async function waitForPosterSwap(page: Page, theme: HeroTheme): Promise<void> {
  const rootSelector = sceneRootSelector(theme);
  const sceneAttribute =
    theme === 'engineer' ? 'data-engineer-circuit-scene' : 'data-cosmic-scene';
  const posterAttribute =
    theme === 'engineer'
      ? 'data-engineer-circuit-poster'
      : 'data-cosmic-poster';
  const transitionAttribute =
    theme === 'engineer'
      ? 'data-engineer-circuit-transition'
      : 'data-cosmic-transition';

  await page.waitForFunction(
    ({
      rootSelector: rootQuery,
      sceneAttribute,
      posterAttribute,
      transitionAttribute,
    }) => {
      const root = document.querySelector<HTMLElement>(rootQuery);
      if (!root) {
        return false;
      }

      return (
        root.getAttribute(transitionAttribute) === 'swapping' &&
        root.getAttribute(sceneAttribute) === '3d' &&
        root.getAttribute(posterAttribute) === 'visible' &&
        root.querySelector('canvas') !== null
      );
    },
    { rootSelector, sceneAttribute, posterAttribute, transitionAttribute },
    { timeout: 20_000 }
  );
}

test.describe('Hero poster transition parity', () => {
  for (const theme of ['engineer', 'cosmic'] as const) {
    test(`${theme} reveals the canvas before hiding the poster`, async ({
      page,
    }) => {
      await mockPortfolioApis(page);
      await page.goto(`/?theme=${theme}&mode=dark`, {
        waitUntil: 'domcontentloaded',
      });

      const root = page.locator(sceneRootSelector(theme));
      const posterAttribute =
        theme === 'engineer'
          ? 'data-engineer-circuit-poster'
          : 'data-cosmic-poster';

      await waitForPosterSwap(page, theme);

      const stillLoaded = await page.evaluate((selector) => {
        const still = document.querySelector<HTMLImageElement>(selector);
        return Boolean(still && still.complete && still.naturalWidth > 0);
      }, stillSelector(theme));
      expect(stillLoaded).toBe(true);

      await expect(root).toHaveAttribute(posterAttribute, 'hidden', {
        timeout: 5_000,
      });
      await expect(page.locator('canvas')).toHaveCount(1);
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
