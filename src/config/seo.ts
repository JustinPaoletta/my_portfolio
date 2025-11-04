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
 *
 * SEO Best Practices:
 * - Keywords: Use 5-10 relevant, specific terms (avoid redundancy)
 * - Description: 150-160 characters for optimal search result display
 * - Include your primary skills, technologies, and job titles
 * - Avoid keyword stuffing - focus on relevance and quality
 */
export const defaultSEO: SEOConfig = {
  title: env.app.title,
  description: env.app.description,
  keywords: [
    // Primary role/job titles
    'software engineer',
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
