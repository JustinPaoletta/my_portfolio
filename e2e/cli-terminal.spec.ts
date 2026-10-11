import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function openTerminal(page: Page, mode = 'dark'): Promise<void> {
  await mockPortfolioApis(page);
  await page.goto(`/?theme=cli&mode=${mode}`);
  await expect(
    page.getByRole('region', { name: 'Portfolio terminal', exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('Terminal command input')).toBeVisible();
}

async function runCommand(page: Page, command: string): Promise<void> {
  const prompt = page.getByLabel('Terminal command input');
  await prompt.fill(command);
  await prompt.press('Enter');
  await expect(prompt).toHaveValue('');
}

test('terminal keyboard editing, completion and history preserve the draft', async ({
  page,
}) => {
  await openTerminal(page);
  const terminal = page.getByRole('region', {
    name: 'Portfolio terminal',
    exact: true,
  });
  const prompt = page.getByLabel('Terminal command input');
  await expect(terminal.getByRole('button')).toHaveCount(0);
  await expect(
    page.getByRole('button', { name: /toggle theme switcher/i })
  ).toHaveCount(0);
  await runCommand(page, 'projects');
  await runCommand(page, 'project 1');
  await expect(
    page.getByText('[PROJECT 1] BitStockerz', { exact: true })
  ).toBeVisible();
  await prompt.fill('unfinished draft');
  await prompt.press('ArrowUp');
  await expect(prompt).toHaveValue('project 1');
  await prompt.press('ArrowUp');
  await expect(prompt).toHaveValue('projects');
  await prompt.press('ArrowDown');
  await prompt.press('ArrowDown');
  await expect(prompt).toHaveValue('unfinished draft');

  await prompt.fill('res');
  await prompt.press('Control+Space');
  await expect(prompt).toHaveValue('resume ');
  await prompt.fill('resume');
  await prompt.press('Home');
  await prompt.press('ArrowRight');
  await expect(prompt).toHaveValue('resume');
  await prompt.press('ControlOrMeta+A');
  await prompt.press('Control+c');
  await expect(prompt).toHaveValue('resume');
  await prompt.press('ArrowRight');
  await prompt.press('Control+c');
  await expect(prompt).toHaveValue('');

  await runCommand(page, 'resume');
  const resume = terminal.getByRole('link', { name: 'Download resume as PDF' });
  await expect(resume).toHaveAttribute(
    'href',
    '/resume/Justin-Paoletta_Software-Engineer.pdf'
  );
  await prompt.focus();
  await prompt.press('Shift+Tab');
  await expect(resume).toBeFocused();
  await resume.press('Tab');
  await expect(prompt).toBeFocused();
  await prompt.press('Tab');
  await expect(prompt).not.toBeFocused();
});

for (const mode of ['light', 'dark']) {
  test(`@a11y terminal output, guidance and recovery work in ${mode} mode`, async ({
    page,
  }) => {
    await openTerminal(page, mode);
    await runCommand(page, 'help');
    await expect(page.getByText('[HELP]', { exact: true })).toBeVisible();
    await runCommand(page, 'project invalid');
    await expect(
      page.getByText('Usage: project <number>', { exact: true })
    ).toBeVisible();
    await runCommand(page, 'project 1');
    await expect(page.getByRole('link', { name: /^GitHub:/ })).toBeVisible();
    await runCommand(page, 'back');
    await expect(page.getByText('[PROJECTS]', { exact: true })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations,
      JSON.stringify(results.violations, null, 2)
    ).toEqual([]);
    const prompt = page.getByLabel('Terminal command input');
    await prompt.press('Control+l');
    await expect(page.getByText('[PROJECTS]', { exact: true })).toHaveCount(0);
    await expect(prompt).toBeFocused();
    await expect(
      page.getByRole('heading', { name: 'Justin Paoletta', exact: true })
    ).toBeVisible();
  });
}

for (const width of [320, 390]) {
  test(`terminal stays usable at ${width}px and with reduced keyboard space`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await openTerminal(page);
    const prompt = page.getByLabel('Terminal command input');
    await expect(prompt).not.toBeFocused();
    await runCommand(page, 'help');
    await runCommand(page, 'exp 1');
    await page.setViewportSize({ width, height: 440 });
    await runCommand(page, 'contact');
    await expect(page.getByText('[CONTACT]', { exact: true })).toBeVisible();
    await expect(prompt).toBeInViewport();
    const overflow = await page.evaluate(() => ({
      document:
        document.documentElement.scrollWidth -
        document.documentElement.clientWidth,
      transcript: (() => {
        const el = document.querySelector('.cli-session');
        return el ? el.scrollWidth - el.clientWidth : 0;
      })(),
    }));
    expect(overflow.document).toBeLessThanOrEqual(1);
    expect(overflow.transcript).toBeLessThanOrEqual(1);
    await prompt.fill('exit');
    await prompt.press('Enter');
    await expect(
      page.getByRole('navigation', { name: /main navigation/i })
    ).toBeVisible();
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'minimal');
  });
}
