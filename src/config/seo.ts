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
  ],
  author: 'Your Name',
  siteUrl: 'https://yourportfolio.com', // Update with your actual URL
  image: '/og-image.png', // Create an Open Graph image (1200x630px recommended)
  twitterHandle: '@yourusername', // Update with your Twitter handle
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
