import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
// This allows the script to read VITE_SITE_URL when running standalone
config();

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
  return 'https://jpengineering.dev';
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
 * Update robots.txt with the correct sitemap URL
 */
function updateRobotsTxt(
  baseUrl: string,
  outputDir: string,
  publicDir: string
): void {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const publicRobotsPath = path.join(publicDir, 'robots.txt');
  const distRobotsPath = path.join(outputDir, 'robots.txt');

  // Read existing robots.txt from public directory (or create default)
  let robotsContent = '';
  if (fs.existsSync(publicRobotsPath)) {
    robotsContent = fs.readFileSync(publicRobotsPath, 'utf-8');
  } else {
    // Default robots.txt content if file doesn't exist
    robotsContent = `# Allow all crawlers
    User-agent: *
    Allow: /

    # Disallow admin or draft pages (add as needed)
    # Disallow: /admin/
    # Disallow: /drafts/

    # Sitemap location
    Sitemap: ${sitemapUrl}
    `;
  }

  // Update or add the Sitemap line
  const sitemapRegex = /^Sitemap:\s*.+$/m;
  if (sitemapRegex.test(robotsContent)) {
    // Replace existing Sitemap line
    robotsContent = robotsContent.replace(
      sitemapRegex,
      `Sitemap: ${sitemapUrl}`
    );
  } else {
    // Add Sitemap line if it doesn't exist
    // Add a newline if the file doesn't end with one
    if (!robotsContent.endsWith('\n')) {
      robotsContent += '\n';
    }
    robotsContent += `\n# Sitemap location\nSitemap: ${sitemapUrl}\n`;
  }

  // Ensure directories exist
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Write to both locations
  fs.writeFileSync(publicRobotsPath, robotsContent, 'utf-8');
  fs.writeFileSync(distRobotsPath, robotsContent, 'utf-8');

  console.log(`✅ robots.txt updated: ${publicRobotsPath}`);
  console.log(`✅ robots.txt updated: ${distRobotsPath}`);
  console.log(`   Sitemap URL: ${sitemapUrl}`);
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

  // Write sitemap file to dist (for production builds)
  fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
  console.log(`✅ Sitemap written to: ${outputPath}`);

  // Also write to public directory (for development and static serving)
  const publicDir = path.resolve(process.cwd(), 'public');
  const publicPath = path.join(publicDir, 'sitemap.xml');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicPath, sitemapXML, 'utf-8');
  console.log(`✅ Sitemap written to: ${publicPath}`);

  // Update robots.txt with the correct sitemap URL
  updateRobotsTxt(baseUrl, output, publicDir);

  console.log('\n📋 Sitemap Summary:');
  console.log(`   Base URL: ${baseUrl}`);
  console.log(`   Total Routes: ${routes.length}`);
  routes.forEach((route) => {
    console.log(
      `   - ${route.path} (priority: ${route.priority || 0.5}, changefreq: ${route.changefreq || 'monthly'})`
    );
  });
}

/**
 * Allow running as a standalone script
 * Check if this file is being executed directly (not imported)
 */
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('generate-sitemap.ts') ||
  process.argv[1]?.endsWith('generate-sitemap.js');

if (isMainModule) {
  generateSitemap();
}
