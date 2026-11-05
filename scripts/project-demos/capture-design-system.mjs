#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const sourceRoot = path.resolve(
  process.argv[2] ?? path.join(root, '../jp-design-system')
);
const origin = new URL(process.argv[3] ?? 'http://localhost:4400');
if (!['localhost', '127.0.0.1', '[::1]'].includes(origin.hostname)) {
  throw new Error('Use a local Storybook server for these example captures.');
}
const cli =
  process.env.PLAYWRIGHT_CLI ??
  path.join(os.homedir(), '.codex/skills/playwright/scripts/playwright_cli.sh');
const session = 'portfolio-design-system-capture';
const output = path.join(root, 'output/playwright/design-system-refresh');
const sourceOutput = path.join(root, 'assets/source/project-demos');
const definitions = [
  {
    name: 'dashboard',
    story: 'compositions-app-shell-dashboard--dashboard',
    heading: 'American League champions',
    width: 1440,
    height: 960,
  },
  {
    name: 'forms',
    story: 'compositions-controls-form--default',
    heading: 'Lineup form',
    width: 960,
    height: 900,
  },
  {
    name: 'data',
    story: 'compositions-data-display--default',
    heading: 'Game 6 roster',
    width: 960,
    height: 640,
  },
  {
    name: 'assistant',
    story: 'compositions-assistant-system--default',
    heading: 'Game 6 companion',
    width: 960,
    height: 640,
  },
];

function command(binary, args, options = {}) {
  const result = spawnSync(binary, args, {
    cwd: root,
    encoding: 'utf8',
    timeout: 90_000,
    maxBuffer: 8 * 1024 * 1024,
    ...options,
  });
  if (result.status !== 0) {
    throw new Error(
      result.stderr ||
        result.stdout ||
        result.error?.message ||
        `${binary} failed.`
    );
  }
  return result.stdout.trim();
}

function browser(...args) {
  if (args[0] === 'run-code') args[1] = `async (page) => { ${args[1]} }`;
  return command(cli, [`--session=${session}`, ...args]);
}

await fs.mkdir(output, { recursive: true });
await fs.mkdir(sourceOutput, { recursive: true });
const response = await globalThis.fetch(new URL('/index.json', origin));
if (!response.ok)
  throw new Error('Start the current ui:storybook server before capturing.');
const index = await response.json();
for (const { story } of definitions) {
  if (!index.entries?.[story])
    throw new Error(`Missing current story: ${story}`);
}

const metadata = {
  captured: new Date().toISOString(),
  sourceRevision: command('git', ['-C', sourceRoot, 'rev-parse', 'HEAD']),
  sourceBranch: command('git', ['-C', sourceRoot, 'branch', '--show-current']),
  sourceWorkingTree: command('git', ['-C', sourceRoot, 'status', '--porcelain'])
    .split('\n')
    .filter(Boolean),
  accent: 'gold',
  mode: 'Actual local Storybook compositions. Game 6 example data, fictional contact details, local form state, deterministic archive replies. No AI provider or backend persistence.',
  captures: [],
  sha256: {},
  sourceFilesSha256: {},
};

try {
  browser('open', origin.href);
  for (const capture of definitions) {
    const url = new URL('/iframe.html', origin);
    url.searchParams.set('id', capture.story);
    url.searchParams.set('viewMode', 'story');
    url.searchParams.set('globals', 'accent:gold');
    browser('resize', String(capture.width), String(capture.height));
    browser('goto', url.href);
    browser(
      'run-code',
      `await page.getByRole('heading', { name: ${JSON.stringify(capture.heading)}, level: 1, exact: true }).waitFor(); await page.evaluate(() => document.fonts.ready);`
    );
    browser('snapshot');
    if (capture.name === 'forms') {
      browser(
        'fill',
        'jp-textarea textarea',
        'Record the late-inning home runs and final out.'
      );
      browser('click', 'jp-button[type="submit"] button');
      browser(
        'run-code',
        `await page.getByRole('status').filter({ hasText: 'Game notes saved in this preview.' }).waitFor();`
      );
    }
    if (capture.name === 'assistant') {
      browser(
        'run-code',
        `await page.getByRole('textbox', { name: 'Message the assistant' }).waitFor();`
      );
      browser('fill', 'jp-assistant-panel textarea', 'Who hit home runs?');
      browser('press', 'Enter');
      browser(
        'run-code',
        `await page.getByRole('log', { name: 'Conversation' }).getByText('Richie Palacios opened the scoring', { exact: false }).waitFor();`
      );
    }
    const filename = `design-system-${capture.name}.png`;
    const artifact = path.join(output, filename);
    browser('screenshot', `--filename=${artifact}`);
    const png = await fs.readFile(artifact);
    await fs.writeFile(path.join(sourceOutput, filename), png);
    metadata.captures.push({
      file: filename,
      story: capture.story,
      viewport: { width: capture.width, height: capture.height },
    });
    metadata.sha256[`assets/source/project-demos/${filename}`] = createHash(
      'sha256'
    )
      .update(png)
      .digest('hex');
  }
  for (const filename of [
    'app-shell-dashboard.stories.ts',
    'controls-form.stories.ts',
    'data-display.stories.ts',
    'assistant-system.stories.ts',
    'game-six.example.ts',
  ]) {
    const relative = `libs/ui/src/lib/primitives/${filename}`;
    metadata.sourceFilesSha256[relative] = createHash('sha256')
      .update(await fs.readFile(path.join(sourceRoot, relative)))
      .digest('hex');
  }
  metadata.sourceFilesSha256['libs/ui/.storybook/preview.ts'] = createHash(
    'sha256'
  )
    .update(
      await fs.readFile(path.join(sourceRoot, 'libs/ui/.storybook/preview.ts'))
    )
    .digest('hex');
  await fs.writeFile(
    path.join(output, 'capture.json'),
    `${JSON.stringify(metadata, null, 2)}\n`
  );
  globalThis.console.log(
    `Captured four current Storybook compositions. Evidence: ${path.relative(root, output)}/capture.json`
  );
} finally {
  browser('close');
}
