import { expect, test } from '@playwright/test';
import {
  DESKTOP_SECTION_VIEWPORT,
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

  test('captures github section', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'minimal',
      mode: 'light',
      viewport: DESKTOP_SECTION_VIEWPORT,
    });

    const github = page.locator('section#github');
    await waitForSectionToSettle(page, github);

    await expect(github).toHaveScreenshot('github-section.png', {
      caret: 'hide',
    });
  });

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
