import { describe, expect, it } from 'vitest';
import { pwaConfig } from './pwa-config';

describe('pwaConfig', () => {
  it('keeps static file requests out of the SPA navigation fallback', () => {
    const denylist = pwaConfig.workbox?.navigateFallbackDenylist;

    expect(denylist).toBeDefined();
    expect(
      denylist?.some((pattern) =>
        pattern.test('/resume/Justin-Paoletta_Software-Engineer.pdf')
      )
    ).toBe(true);
    expect(
      denylist?.some((pattern) => pattern.test('/assets/index-12345.js'))
    ).toBe(true);
    expect(denylist?.some((pattern) => pattern.test('/experience'))).toBe(
      false
    );
  });

  it('keeps large media and documents out of precache', () => {
    expect(pwaConfig.includeAssets).not.toContain(
      'resume/Justin-Paoletta_Software-Engineer.pdf'
    );
    expect(pwaConfig.includeAssets).not.toContain('video/cosmos.mp4');
    expect(pwaConfig.workbox?.globPatterns).toContain(
      '**/*.{js,css,html,ico,png,svg,woff2}'
    );
  });
});
