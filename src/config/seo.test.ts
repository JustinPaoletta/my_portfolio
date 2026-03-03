import { describe, expect, it, vi } from 'vitest';

describe('seo config helpers', () => {
  it('formats page and tab titles and builds full URLs', async () => {
    const seo = await import('./seo');

    expect(seo.getPageTitle()).toBe(seo.defaultSEO.title);
    expect(seo.getPageTitle('About')).toBe(`About | ${seo.defaultSEO.title}`);

    expect(seo.getBrowserTabTitle()).toBe(seo.defaultSEO.title);
    expect(seo.getBrowserTabTitle('Contact')).toBe('Contact');

    expect(seo.getFullUrl()).toBe(`${seo.defaultSEO.siteUrl}`);
    expect(seo.getFullUrl('/projects')).toBe(
      `${seo.defaultSEO.siteUrl}/projects`
    );
  });

  it('falls back to default production URL when env site URL is empty', async () => {
    vi.resetModules();
    vi.doMock('./env', () => ({
      env: {
        app: {
          title: 'Test App',
          description: 'desc',
        },
        site: {
          url: '',
        },
      },
    }));

    const mockedSeo = await import('./seo');
    expect(mockedSeo.defaultSEO.siteUrl).toBe('https://jpengineering.dev');

    vi.resetModules();
    vi.doUnmock('./env');
  });
});
