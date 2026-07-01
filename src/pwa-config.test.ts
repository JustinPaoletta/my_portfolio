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

  it('keeps large documents out of precache while explicitly shipping the cosmic hero poster', () => {
    expect(pwaConfig.includeAssets).not.toContain(
      'resume/Justin-Paoletta_Software-Engineer.pdf'
    );
    expect(pwaConfig.includeAssets).toContain(
      'images/hero/cosmic/cosmos-poster.webp'
    );
    expect(pwaConfig.workbox?.globPatterns).toContain(
      '**/*.{js,css,html,ico,png,svg,woff2}'
    );
  });
});
