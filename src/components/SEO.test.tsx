import { render, waitFor } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import { DEFAULT_ROBOTS_CONTENT, SITE_NAME, SITE_URL } from '@/config/seo';
import SEO from './SEO';

function getMeta(name: string): HTMLMetaElement | null {
  return document.head.querySelector(`meta[name="${name}"]`);
}

function getMetaProperty(property: string): HTMLMetaElement | null {
  return document.head.querySelector(`meta[property="${property}"]`);
}

describe('SEO component', () => {
  it('renders default-style tags for relative image and index/follow robots', async () => {
    render(
      <SEO
        title="About"
        image="/og/custom.png"
        twitterHandle={undefined}
        noindex={false}
        nofollow={false}
      />
    );

    await waitFor(() => {
      expect(document.title).toBe('About');
      expect(getMeta('robots')?.getAttribute('content')).toBe(
        DEFAULT_ROBOTS_CONTENT
      );
      expect(
        document.head
          .querySelector('link[rel="canonical"]')
          ?.getAttribute('href')
      ).toBe(SITE_URL);
      expect(getMetaProperty('og:title')?.getAttribute('content')).toBe(
        `About | ${SITE_NAME}`
      );
      expect(getMetaProperty('og:site_name')?.getAttribute('content')).toBe(
        SITE_NAME
      );
      expect(getMetaProperty('og:image')?.getAttribute('content')).toContain(
        '/og/custom.png'
      );
      expect(getMeta('twitter:creator')).toBeNull();
      expect(getMeta('twitter:site')).toBeNull();
    });
  });

  it('supports absolute image URLs, custom canonical, and noindex/nofollow', async () => {
    render(
      <SEO
        title="Projects"
        image="https://cdn.example.com/og.png"
        canonical="https://example.com/projects"
        twitterHandle="@jp"
        noindex
        nofollow
      />
    );

    await waitFor(() => {
      const canonical = document.head.querySelector('link[rel="canonical"]');
      expect(canonical).toHaveAttribute('href', 'https://example.com/projects');
      expect(getMeta('robots')?.getAttribute('content')).toBe(
        'noindex, nofollow'
      );
      expect(getMetaProperty('og:image')).toHaveAttribute(
        'content',
        'https://cdn.example.com/og.png'
      );
      expect(getMeta('twitter:creator')).toHaveAttribute('content', '@jp');
      expect(getMeta('twitter:site')).toHaveAttribute('content', '@jp');
    });
  });
});
