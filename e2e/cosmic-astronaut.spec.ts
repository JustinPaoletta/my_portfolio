import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expect, test, type Page } from '@playwright/test';
import {
  COSMIC_ASTRONAUT_ANIMATION,
  COSMIC_ASTRONAUT_POSTER,
} from '../src/config/cosmicAstronautAssets';
import { mockPortfolioApis } from './support/mocks';

async function expectLoadedAstronaut(
  page: Page,
  source: string
): Promise<void> {
  const image = page.locator('.hero-astronaut');
  await expect(image).toHaveAttribute('src', source);
  await expect(image).toBeVisible();
  await expect
    .poll(() =>
      image.evaluate(
        (node: HTMLImageElement) => node.complete && node.naturalWidth > 0
      )
    )
    .toBe(true);
}

for (const [label, viewport, mode] of [
  ['desktop', { width: 1440, height: 1000 }, 'dark'],
  ['phone', { width: 390, height: 844 }, 'light'],
] as const) {
  test(`Blender astronaut loads its delivered animation on ${label}`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await mockPortfolioApis(page);
    const errors: string[] = [];
    const models: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('request', (request) => {
      if (request.url().includes('cosmic-astronaut.glb'))
        models.push(request.url());
    });
    await page.goto(`/?theme=cosmic&mode=${mode}`);
    await expectLoadedAstronaut(page, COSMIC_ASTRONAUT_ANIMATION);
    const response = await page.request.get(COSMIC_ASTRONAUT_ANIMATION);
    expect(response.ok()).toBe(true);
    const bytes = await response.body();
    const source = await readFile(
      'public/images/hero/cosmic/astronaut-wave.webp'
    );
    expect(bytes.equals(source)).toBe(true);
    expect(COSMIC_ASTRONAUT_ANIMATION).toContain(
      createHash('sha256').update(bytes).digest('hex').slice(0, 16)
    );
    await expect(page.locator('.hero-astronaut-rig')).toHaveAttribute(
      'data-astronaut-motion',
      'wave'
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - innerWidth
      )
    ).toBeLessThanOrEqual(1);
    expect(models).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('changing to reduced motion replaces the animated astronaut with the still', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await mockPortfolioApis(page);
  await page.goto('/?theme=cosmic&mode=dark');
  await expectLoadedAstronaut(page, COSMIC_ASTRONAUT_ANIMATION);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expectLoadedAstronaut(page, COSMIC_ASTRONAUT_POSTER);
  await expect
    .poll(() =>
      page
        .locator('.hero-astronaut-rig')
        .evaluate((node) => getComputedStyle(node).animationName)
    )
    .toBe('none');
});

for (const [label, saveData, effectiveType] of [
  ['Save-Data', true, '4g'],
  ['slow connection', false, '3g'],
] as const) {
  test(`Blender astronaut avoids the animation download on ${label}`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ saveData, effectiveType }) => {
        const connection = Object.assign(new EventTarget(), {
          saveData,
          effectiveType,
        });
        Object.defineProperty(navigator, 'connection', {
          configurable: true,
          value: connection,
        });
      },
      { saveData, effectiveType }
    );
    await mockPortfolioApis(page);
    const animations: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('astronaut-wave.webp'))
        animations.push(request.url());
    });
    await page.goto('/?theme=cosmic&mode=dark');
    await expectLoadedAstronaut(page, COSMIC_ASTRONAUT_POSTER);
    await page.waitForLoadState('networkidle');
    await expect(page.locator('.hero-background')).toHaveAttribute(
      'data-cosmic-scene',
      'poster'
    );
    expect(animations).toEqual([]);
  });
}

test('a failed animation request recovers to the delivered still', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await mockPortfolioApis(page);
  await page.route('**/astronaut-wave.webp*', (route) => route.abort());
  const failedRequest = page.waitForEvent('requestfailed', {
    predicate: (request) => request.url().includes('astronaut-wave.webp'),
  });
  await page.goto('/?theme=cosmic&mode=dark');
  await failedRequest;
  await expectLoadedAstronaut(page, COSMIC_ASTRONAUT_POSTER);
  await expect(page.locator('.hero-astronaut-rig')).toHaveAttribute(
    'data-astronaut-motion',
    'still'
  );
});
