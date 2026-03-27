import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:4173';
const reuseExistingServer =
  !process.env.CI && process.env.PLAYWRIGHT_REUSE_SERVER === 'true';
const isExternalBaseUrl = (() => {
  try {
    const parsedUrl = new URL(baseURL);
    return !['localhost', '127.0.0.1'].includes(parsedUrl.hostname);
  } catch {
    return false;
  }
})();

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL,
    serviceWorkers: 'block',
    navigationTimeout: 30_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  expect: {
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
      animations: 'disabled',
    },
  },
  projects: [
    {
      name: 'chromium',
      grepInvert: /@visual|@mobile/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      grepInvert: /@visual|@mobile/,
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      grepInvert: /@visual|@mobile/,
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'visual-chromium',
      grep: /@visual/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'mobile-chromium',
      grep: /@mobile/,
      use: { ...devices['Pixel 7'] },
    },
  ],
  webServer: isExternalBaseUrl
    ? undefined
    : {
        command: 'npm run start:prod',
        url: baseURL,
        reuseExistingServer,
        timeout: 120_000,
        stdout: process.env.CI ? 'ignore' : 'pipe',
      },
});
