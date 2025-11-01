import fs from 'fs';
import path from 'path';

/**
 * Configuration for sitemap generation
 */
interface SitemapConfig {
  baseUrl: string;
  routes: RouteConfig[];
  outputPath: string;
}

interface RouteConfig {
  path: string;
  changefreq?:
    | 'always'
    | 'hourly'
    | 'daily'
    | 'weekly'
    | 'monthly'
    | 'yearly'
    | 'never';
  priority?: number;
  lastmod?: string;
}

/**
 * Default routes for the portfolio
 * Add new routes here as you expand your site
 */
const routes: RouteConfig[] = [
  {
    path: '/',
    changefreq: 'monthly',
    priority: 1.0,
  },
  // Add more routes as you create them:
  // {
  //   path: '/about',
  //   changefreq: 'monthly',
  //   priority: 0.8,
  // },
  // {
  //   path: '/projects',
  //   changefreq: 'weekly',
  //   priority: 0.9,
  // },
  // {
  //   path: '/contact',
  //   changefreq: 'monthly',
  //   priority: 0.7,
  // },
];

/**
 * Get the base URL from environment variables or use default
 */
function getBaseUrl(): string {
  // Check for common environment variables
  const envUrl =
    process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.VITE_APP_URL;

  if (envUrl) {
    // Remove trailing slash
    return envUrl.replace(/\/$/, '');
  }

  // Default fallback (will need to be updated)
  console.warn(
    '⚠️  No site URL found in environment variables. Using default placeholder.'
  );
  console.warn('   Set VITE_SITE_URL in your .env file or deployment config.');
  return 'https://yourportfolio.com';
}

/**
 * Generate XML sitemap content
 */
function generateSitemapXML(config: SitemapConfig): string {
  const { baseUrl, routes } = config;
  const currentDate = new Date().toISOString().split('T')[0];

  const urlEntries = routes
    .map((route) => {
      const url = `${baseUrl}${route.path}`;
      const lastmod = route.lastmod || currentDate;
      const changefreq = route.changefreq || 'monthly';
      const priority = route.priority?.toFixed(1) || '0.5';

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

/**
 * Main function to generate and write sitemap
 */
export function generateSitemap(outputDir?: string): void {
  const baseUrl = getBaseUrl();
  const output = outputDir || path.resolve(process.cwd(), 'dist');
  const outputPath = path.join(output, 'sitemap.xml');

  const config: SitemapConfig = {
    baseUrl,
    routes,
    outputPath,
  };

  // Generate sitemap XML
  const sitemapXML = generateSitemapXML(config);

  // Ensure output directory exists
  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // Write sitemap file
  fs.writeFileSync(outputPath, sitemapXML, 'utf-8');

  console.log('✅ Sitemap generated successfully!');
  console.log(`   Location: ${outputPath}`);
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Routes: ${routes.length}`);
}

/**
 * Allow running as a standalone script
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  generateSitemap();
}
