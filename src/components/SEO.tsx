/**
 * SEO Component
 * Manages meta tags for SEO, Open Graph, and Twitter Cards
 */

import { Helmet } from 'react-helmet-async';
import { defaultSEO, getPageTitle, getFullUrl } from '@/config/seo';
import type { SEOConfig } from '@/config/seo';

interface SEOProps extends Partial<SEOConfig> {
  // Additional props
  canonical?: string;
  noindex?: boolean;
  nofollow?: boolean;
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
}) => {
  const pageTitle = getPageTitle(title);
  const fullImageUrl = image?.startsWith('http') ? image : getFullUrl(image);
  const canonicalUrl = canonical || siteUrl;

  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ].join(', ');

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="title" content={pageTitle} />
      <meta name="description" content={description} />
      {keywords && keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      {author && <meta name="author" content={author} />}
      <meta name="robots" content={robotsContent} />

      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={fullImageUrl} />}
      {locale && <meta property="og:locale" content={locale} />}
      <meta property="og:site_name" content={defaultSEO.title} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={fullImageUrl} />}
      {twitterHandle && <meta name="twitter:creator" content={twitterHandle} />}
      {twitterHandle && <meta name="twitter:site" content={twitterHandle} />}

      {/* Additional SEO Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
    </Helmet>
  );
};

export default SEO;
