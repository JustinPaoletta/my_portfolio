// @vitest-environment node
import { expect, it } from 'vitest';
import { resolveConfig } from 'vite';

it('keeps sensitive-file protections after resolving the real Vite config', async () => {
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
