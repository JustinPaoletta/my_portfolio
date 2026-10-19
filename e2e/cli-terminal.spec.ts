import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Locator, type Page } from '@playwright/test';
import { mockPortfolioApis } from './support/mocks';

async function openTerminal(page: Page, mode = 'dark'): Promise<void> {
  await mockPortfolioApis(page);
  await page.goto(`/?theme=cli&mode=${mode}`);
  await expect(
    page.getByRole('region', { name: 'Portfolio terminal', exact: true })
  ).toBeVisible();
  await expect(page.getByLabel('Terminal command input')).toBeVisible();
  await expect(page.getByText(/^ls to list directories/)).toBeVisible();
}

async function runCommand(page: Page, command: string): Promise<void> {
  const prompt = page.getByLabel('Terminal command input');
  await prompt.fill(command);
  await prompt.press('Enter');
  await expect(prompt).toHaveValue('');
}

test('terminal uses ls and cd and restores the macOS close control', async ({
  page,
}) => {
  await openTerminal(page);
  const toolbar = page.locator('.cli-terminal-toolbar');
  await expect(
    toolbar.getByRole('heading', { name: 'Justin Paoletta' })
  ).toBeVisible();
  await expect(toolbar.getByText('Software Engineer')).toBeVisible();
  await expect(toolbar.getByText('Angular · React · TypeScript')).toBeVisible();
  await runCommand(page, 'ls');
  await expect(page.getByText('projects/', { exact: true })).toBeVisible();
  await runCommand(page, 'cd projects');
  await runCommand(page, 'cd 2');
  await expect(page.locator('.cli-prompt-prefix')).toHaveText('~/projects/2 $');
  await runCommand(page, 'ls /experience');
  await expect(page.locator('.cli-prompt-prefix')).toHaveText('~/projects/2 $');
  await runCommand(page, 'cd ..');
  await runCommand(page, 'cd ../contact');
  await expect(page.locator('.cli-prompt-prefix')).toHaveText('~/contact $');
  await runCommand(page, 'cd /not-a-directory');
  await expect(page.locator('.cli-prompt-prefix')).toHaveText('~/contact $');
  await runCommand(page, 'cd /');
  for (const color of ['yellow', 'green']) {
    const dot = toolbar.locator(`.cli-window-dot--${color}`);
    await expect(dot).not.toHaveAttribute('tabindex');
    await dot.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'cli');
  }
  const close = toolbar.getByRole('button', { name: 'Exit terminal' });
  await page.mouse.move(1000, 700);
  await expect(close.locator('.cli-window-close-icon')).toHaveCSS(
    'opacity',
    '0'
  );
  await close.hover();
  await expect(close.locator('.cli-window-close-icon')).toHaveCSS(
    'opacity',
    '1'
  );
  await close.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'minimal');
  await page.reload();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'minimal');
});

test('terminal prompt follows the output and scrolls with the transcript', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 1000 });
  await openTerminal(page);
  const transcript = page.getByRole('region', { name: 'Terminal transcript' });
  const intro = transcript.locator('.cli-intro');
  const history = transcript.locator('.cli-history');
  const form = transcript.locator('form');
  const prompt = page.getByLabel('Terminal command input');

  const expectPromptFollows = async (preceding: Locator): Promise<void> => {
    await expect(form).toHaveCount(1);
    await expect
      .poll(async () => {
        const [previousBox, formBox] = await Promise.all([
          preceding.boundingBox(),
          form.boundingBox(),
        ]);
        if (!previousBox || !formBox) return false;
        const gap = formBox.y - (previousBox.y + previousBox.height);
        return gap >= -1 && gap <= 48;
      })
      .toBe(true);
  };

  await expectPromptFollows(intro);
  const initialForm = await form.boundingBox();
  expect(initialForm).not.toBeNull();
  // A short session leaves unused space below the prompt rather than pinning it.
  expect(initialForm!.y + initialForm!.height).toBeLessThan(800);

  await runCommand(page, 'pwd');
  await expectPromptFollows(history.locator('.cli-line').last());
  await expect
    .poll(async () => (await form.boundingBox())?.y ?? 0)
    .toBeGreaterThan(initialForm!.y + 24);

  for (const command of ['help', 'exp 1', 'project 1']) {
    await runCommand(page, command);
  }
  await expect(prompt).toBeFocused();
  await expect(prompt).toBeInViewport({ ratio: 1 });
  await expectPromptFollows(history.locator('.cli-line').last());
  const bottomScroll = await transcript.evaluate(
    (element) => element.scrollTop
  );
  expect(bottomScroll).toBeGreaterThan(200);
  const scrolledForm = await form.boundingBox();
  expect(scrolledForm).not.toBeNull();

  await transcript.evaluate((element) => {
    element.scrollTop = 0;
  });
  await expect
    .poll(() => transcript.evaluate((element) => element.scrollTop))
    .toBe(0);
  await expect(prompt).not.toBeInViewport();
  const movedForm = await form.boundingBox();
  expect(movedForm).not.toBeNull();
  expect(
    Math.abs(movedForm!.y - scrolledForm!.y - bottomScroll)
  ).toBeLessThanOrEqual(2);

  await runCommand(page, 'clear');
  await expect(history).toBeEmpty();
  await expectPromptFollows(intro);
  await expect(prompt).toBeFocused();
  await expect(prompt).toBeInViewport({ ratio: 1 });
  await expect
    .poll(() => transcript.evaluate((element) => element.scrollTop))
    .toBe(0);
});

test('terminal keyboard editing, completion and history preserve the draft', async ({
  page,
  browserName,
}) => {
  await openTerminal(page);
  const terminal = page.getByRole('region', {
    name: 'Portfolio terminal',
    exact: true,
  });
  const prompt = page.getByLabel('Terminal command input');
  await expect(terminal.getByRole('button')).toHaveCount(1);
  await expect(
    terminal.getByRole('button', { name: 'Exit terminal' })
  ).toBeVisible();
  await expect(
    page.getByRole('button', { name: /toggle theme switcher/i })
  ).toHaveCount(0);
  await runCommand(page, 'projects');
  await runCommand(page, 'project 1');
  await expect(
    page.getByText('[PROJECT 1] @jp-design-system', { exact: true })
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
  await prompt.press(browserName === 'webkit' ? 'Alt+Shift+Tab' : 'Shift+Tab');
  await expect(resume).toBeFocused();
  await resume.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  await expect(prompt).toBeFocused();
  // At the final page control, headless browsers differ in whether DOM focus
  // remains on the input while browser chrome receives the next Tab. Assert
  // the terminal leaves native navigation uncancelled instead.
  const tabAllowed = page.evaluate(
    () =>
      new Promise<boolean>((resolve) => {
        document.addEventListener(
          'keydown',
          (event) => resolve(!event.defaultPrevented),
          { once: true }
        );
      })
  );
  await prompt.press(browserName === 'webkit' ? 'Alt+Tab' : 'Tab');
  expect(await tabAllowed).toBe(true);
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
    const toolbar = page.locator('.cli-terminal-toolbar');
    await expect(
      toolbar.getByRole('heading', { name: 'Justin Paoletta' })
    ).toBeInViewport({ ratio: 1 });
    await expect(toolbar.locator('.cli-terminal-role')).toBeHidden();
    await expect(toolbar.locator('.cli-terminal-technologies')).toBeHidden();
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
