import { expect, test } from '@playwright/test';
import {
  DESKTOP_HERO_VIEWPORT,
  MOBILE_VIEWPORT,
  gotoVisualState,
} from '../support/visual';

test.describe('@visual CLI terminal', () => {
  for (const mode of ['light', 'dark'] as const) {
    test(`captures ${mode} mobile command guide`, async ({ page }) => {
      await gotoVisualState(page, {
        theme: 'cli',
        mode,
        viewport: MOBILE_VIEWPORT,
      });
      await expect(page).toHaveScreenshot(`cli-${mode}-mobile.png`);
    });
  }

  test('captures a desktop session with project evidence', async ({ page }) => {
    await gotoVisualState(page, {
      theme: 'cli',
      mode: 'dark',
      viewport: DESKTOP_HERO_VIEWPORT,
    });
    const prompt = page.getByLabel('Terminal command input');
    for (const command of ['ls', 'cd projects', 'cd 2']) {
      await prompt.fill(command);
      await prompt.press('Enter');
    }
    await expect(
      page.getByText('[PROJECT 2] @jp-design-system', { exact: true })
    ).toBeVisible();
    await prompt.blur();
    await expect(page).toHaveScreenshot('cli-project-session-desktop.png');
  });
});
