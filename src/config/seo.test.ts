import { describe, expect, it } from 'vitest';
import { SEO_DESCRIPTION } from '@/content/site';

describe('seo config helpers', () => {
  it('formats page and tab titles and builds full URLs', async () => {
    const seo = await import('./seo');

    expect(seo.defaultSEO.title).toBe(seo.DEFAULT_HOME_TITLE);
    expect(seo.getPageTitle()).toBe(seo.DEFAULT_HOME_TITLE);
    expect(seo.getPageTitle('About')).toBe(
      `About | ${seo.SITE_PERSON_NAME} | ${seo.SITE_NAME}`
    );

    expect(seo.getBrowserTabTitle()).toBe(seo.DEFAULT_HOME_TITLE);
    expect(seo.getBrowserTabTitle('Contact')).toBe('Contact');
    expect(seo.defaultSEO.description).toBe(SEO_DESCRIPTION);
    expect(seo.defaultSEO.siteUrl).toBe(seo.SITE_ORIGIN);

    expect(seo.getFullUrl()).toBe(seo.SITE_ORIGIN);
    expect(seo.getFullUrl('/projects')).toBe(`${seo.SITE_ORIGIN}/projects`);
    expect(seo.getRobotsContent()).toBe(seo.DEFAULT_ROBOTS_CONTENT);
    expect(seo.getRobotsContent(true, true)).toBe('noindex, nofollow');
  });
});
