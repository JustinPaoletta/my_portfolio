import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEFAULT_HOME_TITLE,
  DEFAULT_ROBOTS_CONTENT,
  SITE_ALTERNATE_NAME,
  SITE_NAME,
  SITE_PERSON_NAME,
  SITE_URL,
} from '@/config/seo';

const indexHtmlPath = resolve(process.cwd(), 'index.html');
const indexHtml = readFileSync(indexHtmlPath, 'utf8');
const documentNode = new DOMParser().parseFromString(indexHtml, 'text/html');

describe('static crawler-facing SEO markup', () => {
  it('includes canonical, robots, hreflang, and identity links', () => {
    expect(documentNode.querySelector('title')?.textContent).toBe(
      DEFAULT_HOME_TITLE
    );
    expect(
      documentNode.querySelector('link[rel="canonical"]')?.getAttribute('href')
    ).toBe(SITE_URL);
    expect(
      documentNode.querySelector('meta[name="robots"]')?.getAttribute('content')
    ).toBe(DEFAULT_ROBOTS_CONTENT);

    const alternateLinks = Array.from(
      documentNode.querySelectorAll('link[rel="alternate"][hreflang]')
    ).map((link) => link.getAttribute('hreflang'));
    expect(alternateLinks).toEqual(
      expect.arrayContaining(['en-US', 'x-default'])
    );

    const identityLinks = Array.from(
      documentNode.querySelectorAll('link[rel="me"]')
    ).map((link) => link.getAttribute('href'));
    expect(identityLinks).toEqual(
      expect.arrayContaining([
        'https://github.com/JustinPaoletta/',
        'https://www.linkedin.com/in/justin-paoletta/',
      ])
    );
  });

  it('ships valid structured data for the person, website, and webpage entities', () => {
    const jsonLdText = documentNode.querySelector(
      'script[type="application/ld+json"]'
    )?.textContent;

    expect(jsonLdText).toBeTruthy();

    const structuredData = JSON.parse(jsonLdText ?? '{}') as {
      '@graph'?: Array<Record<string, unknown>>;
    };
    const graphTypes =
      structuredData['@graph']?.flatMap((entry) => {
        const type = entry['@type'];
        return Array.isArray(type) ? type : [type];
      }) ?? [];

    expect(graphTypes).toEqual(
      expect.arrayContaining(['Person', 'WebSite', 'WebPage', 'ProfilePage'])
    );

    const websiteEntry = structuredData['@graph']?.find(
      (entry) => entry['@type'] === 'WebSite'
    );
    expect(websiteEntry?.name).toBe(SITE_NAME);
    expect(websiteEntry?.alternateName).toBe(SITE_ALTERNATE_NAME);

    const personEntry = structuredData['@graph']?.find(
      (entry) => entry['@type'] === 'Person'
    );
    expect(personEntry?.name).toBe(SITE_PERSON_NAME);

    const webpageEntry = structuredData['@graph']?.find((entry) => {
      const type = entry['@type'];
      return Array.isArray(type) && type.includes('ProfilePage');
    });
    expect(webpageEntry?.name).toBe(DEFAULT_HOME_TITLE);
  });

  it('provides a no-JavaScript fallback summary for non-interactive crawls', () => {
    const noScript = documentNode.querySelector('noscript');
    const noScriptText = noScript?.textContent?.replace(/\s+/g, ' ') ?? '';

    expect(noScriptText).toContain('Justin Paoletta');
    expect(noScriptText).toContain(
      'software engineer focused on frontend platform architecture'
    );
    expect(noScript?.innerHTML).toContain(
      '/resume/Justin-Paoletta_Software-Engineer.pdf'
    );
  });
});
