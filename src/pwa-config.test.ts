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

  it('includes the resume PDF in the service worker asset list', () => {
    expect(pwaConfig.includeAssets).toContain(
      'resume/Justin-Paoletta_Software-Engineer.pdf'
    );
    expect(pwaConfig.workbox?.globPatterns).toContain(
      '**/*.{js,css,html,ico,pdf,png,svg,webp,woff,woff2}'
    );
  });
});
