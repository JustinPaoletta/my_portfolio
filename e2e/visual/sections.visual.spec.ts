import { expect, test } from '@playwright/test';
import {
  DESKTOP_SECTION_VIEWPORT,
  MOBILE_VIEWPORT,
  gotoVisualState,
  waitForSectionToSettle,
} from '../support/visual';

test.describe('@visual section states', () => {
  test.describe.configure({ mode: 'parallel' });

  test('captures projects section', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const projects = page.locator('section#projects');
    await waitForSectionToSettle(page, projects);

    await expect(projects).toHaveScreenshot('projects-section.png', {
      caret: 'hide',
    });
  });

  test('captures articles section', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const articles = page.locator('section#articles');
    await waitForSectionToSettle(page, articles);

    await expect(articles).toHaveScreenshot('articles-section.png', {
      caret: 'hide',
    });
  });

  test('captures articles section on second slide', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const articles = page.locator('section#articles');
    await waitForSectionToSettle(page, articles);
    await page.getByRole('button', { name: 'Next article' }).click();
    await waitForSectionToSettle(page, articles);

    await expect(articles).toHaveScreenshot('articles-section-slide-2.png', {
      caret: 'hide',
    });
  });

  for (const [label, viewport] of [
    ['desktop', DESKTOP_SECTION_VIEWPORT],
    ['mobile', MOBILE_VIEWPORT],
  ] as const) {
    test(`captures skill icons on ${label}`, async ({ page }) => {
      await gotoVisualState(page, { theme: 'cosmic', mode: 'dark', viewport });
      const skills = page.locator('section#skills');
      await waitForSectionToSettle(page, skills);
      const icons = skills.locator('.skill-icon img');
      await expect(icons).toHaveCount(13);
      const loaded = await icons.evaluateAll((images) =>
        images.every(
          (image) =>
            image instanceof HTMLImageElement &&
            image.complete &&
            image.naturalWidth > 0
        )
      );
      expect(loaded).toBe(true);
      await expect(skills).toHaveScreenshot(`skills-${label}.png`, {
        caret: 'hide',
      });
    });
  }

  test('captures github section', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const github = page.locator('section#github');
    await waitForSectionToSettle(page, github);
    // Fractional document positions can add a pixel to element screenshots
    // when a preceding section changes height. Keep this crop on pixel boundaries.
    await github.evaluate((section) => {
      const rect = section.getBoundingClientRect();
      section.style.translate = `${Math.round(rect.x) - rect.x}px ${Math.round(rect.y) - rect.y}px`;
    });

    await expect(github).toHaveScreenshot('github-section.png', {
      caret: 'hide',
    });
  });

  for (const [label, viewport] of [
    ['desktop', DESKTOP_SECTION_VIEWPORT],
    ['mobile', MOBILE_VIEWPORT],
  ] as const) {
    test(`captures professional experience on ${label}`, async ({ page }) => {
      await gotoVisualState(page, {
        theme: 'minimal',
        mode: 'light',
        viewport,
      });

      const experience = page.locator('section#experience');
      await waitForSectionToSettle(page, experience);

      await expect(experience).toHaveScreenshot(`experience-${label}.png`, {
        caret: 'hide',
      });
    });
  }

  test('captures contact section', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const contact = page.locator('section#contact');
    await waitForSectionToSettle(page, contact);

    await expect(contact).toHaveScreenshot('contact-section.png', {
      caret: 'hide',
    });
  });

  test('captures expanded pet dogs section', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const petDogs = page.locator('section#pet-dogs');
    await waitForSectionToSettle(page, petDogs);
    await page.getByRole('button', { name: /show dogs/i }).click();
    await waitForSectionToSettle(page, petDogs);

    await expect(petDogs).toHaveScreenshot('pet-dogs-expanded-section.png', {
      caret: 'hide',
    });
  });
});
