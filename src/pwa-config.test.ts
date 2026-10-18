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

  it('keeps large documents, GLBs, and poster variants out of precache', () => {
    expect(pwaConfig.includeAssets).not.toContain(
      'resume/Justin-Paoletta_Software-Engineer.pdf'
    );
    expect(pwaConfig.includeAssets).not.toContain(
      'models/hero/circuit-board.glb'
    );
    expect(pwaConfig.includeAssets).not.toContain(
      'models/hero/cosmic-scene.glb'
    );
    expect(pwaConfig.includeAssets).not.toContain(
      'images/hero/cosmic/cosmos-poster-dark-desktop.webp'
    );
    expect(pwaConfig.workbox?.globPatterns).toContain(
      '**/*.{js,css,html,ico,png,svg,woff2}'
    );
    expect(pwaConfig.workbox?.globPatterns?.join(',')).not.toContain('glb');
    expect(pwaConfig.workbox?.globPatterns?.join(',')).not.toContain('webp');
  });

  it('caches hero GLB models at runtime', () => {
    const heroModelRoute = pwaConfig.workbox?.runtimeCaching?.find(
      (route) => route.options?.cacheName === 'hero-models-cache'
    );

    expect(heroModelRoute).toBeDefined();
    expect(heroModelRoute?.handler).toBe('CacheFirst');
    expect(heroModelRoute?.options?.expiration).toMatchObject({
      maxEntries: 4,
      maxAgeSeconds: 30 * 24 * 60 * 60,
    });
    expect(heroModelRoute?.options?.cacheableResponse).toMatchObject({
      statuses: [0, 200],
    });

    const matches = heroModelRoute?.urlPattern as (input: {
      url: URL;
    }) => boolean;
    expect(
      matches({
        url: new URL('/models/hero/circuit-board.glb', self.location.origin),
      })
    ).toBe(true);
    expect(
      matches({
        url: new URL(
          '/images/hero/cosmic/cosmos-poster-dark-desktop.webp',
          self.location.origin
        ),
      })
    ).toBe(false);
  });
});

// Cache boundaries matter when the same filename exists on an external origin.
describe('runtime cache isolation', () => {
  it.each([
    ['images-cache', '/images/pets/nala-cutout.webp', 'image'],
    ['media-cache', '/media/bitstockerz-workspace-demo.mp4', 'video'],
    ['hero-models-cache', '/models/hero/cosmic-astronaut.glb', ''],
    ['static-resources', '/assets/app.js', 'script'],
    ['static-resources', '/assets/app.css', 'style'],
    ['api-cache', '/api/github', ''],
  ])(
    'matches only appropriate same-origin requests for %s',
    (cacheName, pathname, destination) => {
      const rule = pwaConfig.workbox!.runtimeCaching!.find(
        (route) => route.options?.cacheName === cacheName
      )!;
      const matches = rule.urlPattern as (input: {
        url: URL;
        request: { destination: string };
      }) => boolean;
      const request = { destination };
      expect(
        matches({ url: new URL(pathname, self.location.origin), request })
      ).toBe(true);
      expect(
        matches({ url: new URL(pathname, 'https://external.example'), request })
      ).toBe(false);
      expect(
        matches({
          url: new URL('/unrelated.txt', self.location.origin),
          request: { destination: 'document' },
        })
      ).toBe(false);
    }
  );
});
