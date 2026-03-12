/**
 * SEO Component
 * Manages meta tags for SEO, Open Graph, and Twitter Cards
 *
 * IMPORTANT: This component uses react-helmet-async which injects meta tags
 * via JavaScript at runtime. This works for:
 * - Google (which executes JavaScript when crawling)
 * - Browser tab titles
 * - Dynamic page updates during client-side navigation
 *
 * However, social media crawlers (Facebook, Twitter/X, LinkedIn, etc.) and
 * tools like opengraph.xyz do NOT execute JavaScript. They only read the
 * raw HTML served by the server.
 *
 * For this reason, Open Graph and Twitter Card meta tags are ALSO defined
 * statically in index.html to ensure social sharing previews work correctly.
 *
 * If you need to update OG/Twitter meta tags, update BOTH:
 * 1. index.html (for social media crawlers)
 * 2. src/content/site.ts and src/config/seo.ts (for runtime SEO defaults)
 */

import { Helmet } from 'react-helmet-async';
import {
  DEFAULT_LANGUAGE,
  DEFAULT_OG_IMAGE_ALT,
  defaultSEO,
  getPageTitle,
  getBrowserTabTitle,
  getFullUrl,
  getRobotsContent,
} from '@/config/seo';
import type { SEOConfig } from '@/config/seo';

interface SEOProps extends Partial<SEOConfig> {
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
  imageAlt?: string;
}

export const SEO: React.FC<SEOProps> = ({
  title,
  description = defaultSEO.description,
  keywords = defaultSEO.keywords,
  author = defaultSEO.author,
  image = defaultSEO.image,
  twitterHandle = defaultSEO.twitterHandle,
  siteUrl = defaultSEO.siteUrl,
  locale = defaultSEO.locale,
  type = defaultSEO.type,
  canonical,
  noindex = false,
  nofollow = false,
  imageAlt = DEFAULT_OG_IMAGE_ALT,
}) => {
  const seoTitle = getPageTitle(title);
  const browserTabTitle = getBrowserTabTitle(title);
  const fullImageUrl = image?.startsWith('http') ? image : getFullUrl(image);
  const canonicalBaseUrl = (siteUrl || defaultSEO.siteUrl || '').replace(
    /\/$/,
    ''
  );
  const canonicalUrl = canonical || `${canonicalBaseUrl}/`;
  const robotsContent = getRobotsContent(noindex, nofollow);

  return (
    <Helmet>
      {/* primary meta tags */}
      <title>{browserTabTitle}</title>
      <meta name="title" content={seoTitle} />
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />

      {/* canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* open graph / facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={seoTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={fullImageUrl} />}
      {image && <meta property="og:image:alt" content={imageAlt} />}
      {locale && <meta property="og:locale" content={locale} />}
      <meta property="og:site_name" content={defaultSEO.title} />

      {/* twitter/x */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={seoTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={fullImageUrl} />}
      {image && <meta name="twitter:image:alt" content={imageAlt} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* additional SEO tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content={DEFAULT_LANGUAGE} />
    </Helmet>
  );
};

export default SEO;
