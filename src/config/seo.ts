/**
 * SEO configuration
 * Default values for meta tags, Open Graph, and Twitter Cards
 */

import { SEO_DESCRIPTION } from '@/content/site';

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  siteUrl?: string;
  image?: string;
  twitterHandle?: string;
  locale?: string;
  type?: string;
}

export const SITE_NAME = 'JP Engineering';
export const SITE_ALTERNATE_NAME = 'JPEngineering';
export const SITE_AUTHOR = 'Justin Paoletta';
export const SITE_ORIGIN = 'https://jpengineering.dev';
export const SITE_URL = `${SITE_ORIGIN}/`;
export const SITE_LOCALE = 'en_US';
export const DEFAULT_OG_IMAGE = '/og/og-image.png';
export const DEFAULT_OG_IMAGE_ALT =
  'Preview image for the JP Engineering software engineering portfolio';
export const DEFAULT_ROBOTS_CONTENT =
  'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
export const DEFAULT_LANGUAGE = 'en-US';

/**
 * Default SEO configuration
 * Can be overridden on a per-page basis
 *
 * SEO Best Practices:
 * - Keywords: Use 5-10 relevant, specific terms (avoid redundancy)
 * - Description: 150-160 characters for optimal search result display
 * - Include your primary skills, technologies, and job titles
 * - Avoid keyword stuffing - focus on relevance and quality
 */
export const defaultSEO: SEOConfig = {
  title: SITE_NAME,
  description: SEO_DESCRIPTION,
  keywords: [
    'Justin Paoletta',
    // Primary role/job titles
    'software engineer',
    'UI engineer',
    'web developer',
    'frontend developer',
    'full stack developer',
    // Core technologies (add/remove based on your stack)
    'React',
    'TypeScript',
    'JavaScript',
    'HTML5',
    'CSS3',
    // Professional focus
    'portfolio',
    'personal website',
    'developer portfolio',
    'software engineering',
    'web development',
    // Additional relevant terms
    'UI/UX',
    'responsive design',
    'progressive web app',
  ],
  author: SITE_AUTHOR,
  siteUrl: SITE_ORIGIN,
  image: DEFAULT_OG_IMAGE,
  locale: SITE_LOCALE,
  type: 'website',
};

export const getPageTitle = (pageTitle?: string): string => {
  if (!pageTitle) return defaultSEO.title;
  return `${pageTitle} | ${defaultSEO.title}`;
};

export const getBrowserTabTitle = (pageTitle?: string): string => {
  if (pageTitle) return pageTitle;
  return defaultSEO.title;
};

export const getFullUrl = (path: string = ''): string => {
  if (!path) {
    return defaultSEO.siteUrl || SITE_ORIGIN;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${defaultSEO.siteUrl}${normalizedPath}`;
};

export const getDefaultCanonicalUrl = (): string => SITE_URL;

export const getRobotsContent = (noindex = false, nofollow = false): string => {
  const directives = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow',
  ];

  if (!noindex && !nofollow) {
    directives.push(
      'max-image-preview:large',
      'max-snippet:-1',
      'max-video-preview:-1'
    );
  }

  return directives.join(', ');
};
