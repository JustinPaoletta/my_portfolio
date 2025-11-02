/**
 * SEO configuration
 * Default values for meta tags, Open Graph, and Twitter Cards
 */

import { env } from './env';

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

/**
 * Default SEO configuration
 * Can be overridden on a per-page basis
 */
export const defaultSEO: SEOConfig = {
  title: env.app.title,
  description: env.app.description,
  keywords: [
    'portfolio',
    'web developer',
    'software engineer',
    'React',
    'TypeScript',
    'frontend',
    'developer',
    'engineer',
    'software',
    'engineering',
    'dev',
  ],
  author: 'Justin Paoletta',
  siteUrl: env.site.url || 'https://jpengineering.dev',
  image: '/og-image.png',
  locale: 'en_US',
  type: 'website',
};

/**
 * Generate full page title
 */
export const getPageTitle = (pageTitle?: string): string => {
  if (!pageTitle) return defaultSEO.title;
  return `${pageTitle} | ${defaultSEO.title}`;
};

/**
 * Generate full URL from path
 */
export const getFullUrl = (path: string = ''): string => {
  return `${defaultSEO.siteUrl}${path}`;
};
