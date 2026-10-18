import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import {
  DESKTOP_SECTION_VIEWPORT,
  MOBILE_VIEWPORT,
  gotoVisualState,
  waitForSectionToSettle,
} from '../support/visual';

test.describe('@visual section states', () => {
  test.describe.configure({ mode: 'parallel' });

  for (const [label, viewport] of [
    ['desktop', DESKTOP_SECTION_VIEWPORT],
    ['mobile', MOBILE_VIEWPORT],
  ] as const) {
    test(`captures About on ${label}`, async ({ page }) => {
      await gotoVisualState(page, { theme: 'minimal', mode: 'dark', viewport });
      const about = page.locator('section#about');
      await waitForSectionToSettle(page, about);
      await expect(about).toHaveScreenshot(`about-${label}.png`, {
        caret: 'hide',
      });
    });
  }

  for (const [label, viewport] of [
    ['desktop', DESKTOP_SECTION_VIEWPORT],
    ['mobile', { width: 390, height: 1600 }],
  ] as const) {
    test(`section captures are independent of fractional preceding layout on ${label}`, async ({
      page,
    }, testInfo) => {
      await gotoVisualState(page, {
        theme: 'minimal',
        mode: 'light',
        viewport,
      });
      const skills = page.locator('#skills');
      await waitForSectionToSettle(page, skills);
      const original = await skills.screenshot({ animations: 'disabled' });
      // A copy edit earlier in the document can move this section by a fraction
      // of a pixel without changing any of its own content or layout.
      await page.locator('#about').evaluate((section) => {
        section.style.marginBottom = '0.375px';
      });
      await waitForSectionToSettle(page, skills);
      const after = await skills.screenshot({ animations: 'disabled' });
      if (!after.equals(original)) {
        await writeFile(testInfo.outputPath('before.png'), original);
        await writeFile(testInfo.outputPath('after.png'), after);
        await testInfo.attach('before', {
          body: original,
          contentType: 'image/png',
        });
        await testInfo.attach('after', {
          body: after,
          contentType: 'image/png',
        });
      }
      expect(after.equals(original)).toBe(true);
    });
  }

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

  for (const [label, viewport] of [
    ['desktop', DESKTOP_SECTION_VIEWPORT],
    ['mobile', { width: 390, height: 1000 }],
  ] as const) {
    test(`captures Plexarr screenshots on ${label}`, async ({ page }) => {
      await gotoVisualState(page, {
        theme: label === 'mobile' ? 'cosmic' : 'minimal',
        mode: label === 'mobile' ? 'dark' : 'light',
        viewport,
      });
      const carousel = page.getByRole('region', {
        name: 'Plexarr feature screenshots',
      });
      for (const name of ['discover', 'picks', 'ratings']) {
        await waitForSectionToSettle(page, carousel);
        await expect(carousel).toHaveScreenshot(
          `plexarr-${label}-${name}.png`,
          {
            caret: 'hide',
            // Hide unrelated text behind the fixed card's rounded corners.
            style: `body * { visibility: hidden !important; }
              .plexarr-carousel, .plexarr-carousel * { visibility: visible !important; }`,
          }
        );
        if (name !== 'ratings')
          await carousel
            .getByRole('button', { name: 'Next Plexarr screenshot' })
            .click();
      }
    });
  }

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
      await gotoVisualState(page, {
        theme: 'cosmic',
        mode: 'dark',
        // Fit the tall component without screenshot-time viewport resizing.
        viewport: label === 'mobile' ? { ...viewport, height: 1600 } : viewport,
      });
      const skills = page.locator('section#skills');
      await waitForSectionToSettle(page, skills);
      const icons = skills.locator('.skill-icon img');
      await expect(icons).toHaveCount(16);
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

  for (const [label, viewport] of [
    ['desktop', DESKTOP_SECTION_VIEWPORT],
    ['mobile', MOBILE_VIEWPORT],
  ] as const) {
    test(`captures github section on ${label}`, async ({ page }) => {
      await gotoVisualState(page, {
        theme: 'minimal',
        mode: 'light',
        viewport,
        githubContributionWeeks: 53,
      });
      const github = page.locator('section#github');
      await waitForSectionToSettle(page, github);
      await expect(github).toHaveScreenshot(
        label === 'desktop' ? 'github-section.png' : 'github-mobile.png',
        { caret: 'hide' }
      );
    });
  }

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
