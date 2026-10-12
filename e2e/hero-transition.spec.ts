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

// Sample the real CSS animation at its midpoint when it starts. A short fade
// can elapse between Playwright polls on software-rendered CI, even when the
// handoff is correct. Install before navigation so this also covers a warm cache.
async function installFadeSampler(page: Page, theme: HeroTheme): Promise<void> {
  await page.addInitScript(
    ({ rootQuery, stillQuery, sceneAttr, posterAttr, transitionAttr }) => {
      const observer = new MutationObserver(() => {
        const root = document.querySelector<HTMLElement>(rootQuery);
        const still = document.querySelector<HTMLImageElement>(stillQuery);
        const overlay = still?.closest<HTMLElement>('.hero-poster-overlay');
        if (!root || !still || !overlay) return;
        const isFading =
          root.getAttribute(transitionAttr) === 'fading' &&
          root.getAttribute(sceneAttr) === '3d' &&
          root.getAttribute(posterAttr) === 'visible' &&
          overlay.getAttribute('data-poster-fading') === 'true' &&
          still.getAttribute('data-poster-source') === 'static' &&
          still.src.length > 0 &&
          root.querySelector('canvas') !== null;
        if (!isFading) return;
        const animation = overlay
          .getAnimations()
          .find(
            (item) =>
              item instanceof CSSAnimation &&
              item.animationName === 'hero-poster-fade-out'
          );
        const duration = Number(animation?.effect?.getTiming().duration);
        if (!animation || !Number.isFinite(duration) || duration <= 0) return;
        animation.currentTime = duration / 2;
        const sample = Number.parseFloat(getComputedStyle(overlay).opacity);
        (
          window as typeof window & { heroPosterFadeSample?: number }
        ).heroPosterFadeSample = sample;
        observer.disconnect();
      });
      observer.observe(document, {
        subtree: true,
        childList: true,
        attributes: true,
      });
    },
    {
      rootQuery: sceneRootSelector(theme),
      stillQuery: stillSelector(theme),
      sceneAttr: sceneAttribute(theme),
      posterAttr: posterAttribute(theme),
      transitionAttr: transitionAttribute(theme),
    }
  );
}
async function waitForMidFadeOpacity(page: Page): Promise<number> {
  const handle = await page.waitForFunction(
    () => {
      const sample = (
        window as typeof window & { heroPosterFadeSample?: number }
      ).heroPosterFadeSample;
      return typeof sample === 'number' && Number.isFinite(sample)
        ? { opacity: sample }
        : false;
    },
    undefined,
    { timeout: 20_000 }
  );
  const sample = await handle.jsonValue();
  if (!sample) throw new Error('Poster fade was not sampled');
  return sample.opacity;
}

test.describe('Hero poster transition parity', () => {
  for (const theme of ['engineer', 'cosmic'] as const) {
    test(`${theme} fades the static poster overlay over the live canvas`, async ({
      page,
    }) => {
      await mockPortfolioApis(page);
      await installFadeSampler(page, theme);
      await page.goto(`/?theme=${theme}&mode=dark`, {
        waitUntil: 'domcontentloaded',
      });

      const root = page.locator(sceneRootSelector(theme));

      const midFadeOpacity = await waitForMidFadeOpacity(page);
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
