// @vitest-environment node
import { afterEach, expect, it, vi } from 'vitest';

afterEach(() => vi.unstubAllEnvs());
import { resolveConfig } from 'vite';

it('keeps sensitive-file protections after resolving the real Vite config', async () => {
  for (const [key, value] of Object.entries({
    VITE_APP_TITLE: 'Security test',
    VITE_APP_DESCRIPTION: 'Security config regression test',
    VITE_API_URL: 'https://api.example.com',
    VITE_GITHUB_URL: 'https://github.com/example',
    VITE_LINKEDIN_URL: 'https://linkedin.com/in/example',
    VITE_EMAIL: 'test@example.com',
    VITE_GITHUB_USERNAME: 'example',
  }))
    vi.stubEnv(key, value);
  const config = await resolveConfig({}, 'serve', 'test');
  expect(config.server.fs.strict).toBe(true);
  expect(config.server.fs.deny).toEqual(
    expect.arrayContaining(['.env', '.env.*', '**/.git/**', '.npmrc'])
  );
  expect(
    config.server.fs.deny.some((pattern) => pattern.endsWith('/api/**'))
  ).toBe(true);
  expect(
    config.server.fs.deny.some((pattern) => pattern.endsWith('/server/**'))
  ).toBe(true);
});
