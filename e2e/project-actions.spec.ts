import { expect, test, type Locator } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mockPortfolioApis } from './support/mocks';
import { revealDeferredSection } from './support/sections';

// Playwright's visibility assertion allows opacity: 0. Check ancestors too so
// a focusable link inside an invisible hover overlay cannot pass this check.
async function expectPaintedAction(locator: Locator): Promise<void> {
  await expect(locator).toBeVisible();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        let current: Element | null = element;

        while (current) {
          if (Number(getComputedStyle(current).opacity) === 0) return false;
          current = current.parentElement;
        }

        return true;
      })
    )
    .toBe(true);
}

for (const theme of ['minimal', 'engineer', 'cosmic']) {
  for (const mode of ['light', 'dark']) {
    test(`project actions stay visible with keyboard focus in ${theme} ${mode}`, async ({
      page,
    }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockPortfolioApis(page);
      await page.goto(`/?theme=${theme}&mode=${mode}`);

      const projects = await revealDeferredSection(page, 'projects');
      const source = projects.getByRole('link', {
        name: 'View @jp-design-system source code',
      });

      await source.scrollIntoViewIfNeeded();
      await page.mouse.move(0, 0);
      await expectPaintedAction(source);
      await expectPaintedAction(projects.getByLabel('Project in development'));

      await source.focus();
      await page.keyboard.press('Shift+Tab');
      await page.keyboard.press('Tab');
      await expect(source).toBeFocused();
      await expectPaintedAction(source);
      await expect
        .poll(() =>
          source.evaluate((element) => {
            const style = getComputedStyle(element);
            return (
              element.matches(':focus-visible') &&
              style.outlineStyle !== 'none' &&
              Number.parseFloat(style.outlineWidth) > 0
            );
          })
        )
        .toBe(true);

      await page.keyboard.press('Tab');
      const nextSource = projects.getByRole('link', {
        name: 'View BitStockerz source code',
      });
      // Native video controls and the transcript are reachable before the next source link.
      for (let step = 0; step < 16; step += 1) {
        if (
          await nextSource.evaluate((link) => document.activeElement === link)
        )
          break;
        await page.keyboard.press('Tab');
      }
      await expect(nextSource).toBeFocused();
      await expectPaintedAction(nextSource);
      await expectPaintedAction(
        projects.getByLabel('SideQuest: Pittsburgh repository is private')
      );
    });
  }
}

test.describe('touch project actions', () => {
  test.use({ hasTouch: true });

  for (const width of [320, 390]) {
    test(`project source opens with one tap at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await mockPortfolioApis(page);
      await page.context().route('https://github.com/**', (route) =>
        route.fulfill({
          contentType: 'text/html',
          body: '<h1>Project source</h1>',
        })
      );
      await page.goto('/?theme=minimal&mode=light');

      const projects = await revealDeferredSection(page, 'projects');
      const source = projects.getByRole('link', {
        name: 'View BitStockerz source code',
      });
      await source.scrollIntoViewIfNeeded();
      await expectPaintedAction(source);
      await expectPaintedAction(projects.getByLabel('Project in development'));

      const sourceUrl = await source.getAttribute('href');
      expect(sourceUrl).toBeTruthy();
      expect(new URL(sourceUrl!).pathname).not.toContain('//');
      const bounds = await source.boundingBox();
      expect(bounds?.height).toBeGreaterThanOrEqual(44);
      expect(bounds?.width).toBeGreaterThanOrEqual(44);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )
      ).toBe(true);

      const [destination] = await Promise.all([
        page.waitForEvent('popup'),
        source.tap(),
      ]);
      await expect(destination).toHaveURL(sourceUrl!);
      await destination.close();
    });
  }
});

for (const width of [390, 1440]) {
  test(`featured demos load on demand and play at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await mockPortfolioApis(page);
    const mediaRequests: string[] = [];
    page.on('request', (request) => {
      if (/\/media\/bitstockerz-demo\.(mp4|webm)/.test(request.url())) {
        mediaRequests.push(request.url());
      }
    });
    await page.goto('/?theme=minimal&mode=light');
    const projects = await revealDeferredSection(page, 'projects');
    const headings = projects.locator('.featured-project h3');
    await expect(headings.nth(0)).toHaveText('@jp-design-system');
    await expect(headings.nth(1)).toHaveText('BitStockerz');
    const video = projects.locator('video');
    await video.scrollIntoViewIfNeeded();
    const accessibility = await new AxeBuilder({ page })
      .include('#projects')
      .analyze();
    expect(accessibility.violations).toEqual([]);
    expect(mediaRequests).toHaveLength(0);
    expect(
      await video.evaluate((element: HTMLVideoElement) => element.paused)
    ).toBe(true);
    await video.evaluate((element: HTMLVideoElement) => element.play());
    await expect
      .poll(() =>
        video.evaluate((element: HTMLVideoElement) => element.currentTime)
      )
      .toBeGreaterThan(0.2);
    expect(mediaRequests.length).toBeGreaterThan(0);
    expect(
      await video.evaluate((element: HTMLVideoElement) => element.videoWidth)
    ).toBe(1440);
    await video.evaluate((element: HTMLVideoElement) => {
      element.pause();
      element.currentTime = element.duration - 0.5;
    });
    await video.evaluate((element: HTMLVideoElement) => element.play());
    await expect
      .poll(() => video.evaluate((element: HTMLVideoElement) => element.ended))
      .toBe(true);
    const transcript = projects.getByText('Read the walkthrough', {
      exact: true,
    });
    await transcript.click();
    await expect(
      projects.getByText(/In a disposable local account/)
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    ).toBe(true);
  });
}
