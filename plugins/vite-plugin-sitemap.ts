import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// load environment variables from .env file
config();

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

const routes: RouteConfig[] = [
  {
    path: '/',
    changefreq: 'monthly',
    priority: 1.0,
  },
  // Example: Add more routes as needed:
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

function getBaseUrl(): string {
  const envUrl =
    process.env.VITE_SITE_URL ||
    process.env.SITE_URL ||
    process.env.URL ||
    process.env.VITE_APP_URL;

  if (envUrl) {
    return envUrl.replace(/\/$/, '');
  }

  console.warn('   Set VITE_SITE_URL in your .env file or deployment config.');
  return 'https://jpengineering.dev';
}

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

function updateRobotsTxt(
  baseUrl: string,
  outputDir: string,
  publicDir: string
): void {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const publicRobotsPath = path.join(publicDir, 'robots.txt');
  const distRobotsPath = path.join(outputDir, 'robots.txt');

  let robotsContent = '';
  if (fs.existsSync(publicRobotsPath)) {
    robotsContent = fs.readFileSync(publicRobotsPath, 'utf-8');
  } else {
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

  const sitemapRegex = /^Sitemap:\s*.+$/m;
  if (sitemapRegex.test(robotsContent)) {
    robotsContent = robotsContent.replace(
      sitemapRegex,
      `Sitemap: ${sitemapUrl}`
    );
  } else {
    if (!robotsContent.endsWith('\n')) {
      robotsContent += '\n';
    }
    robotsContent += `\n# Sitemap location\nSitemap: ${sitemapUrl}\n`;
  }

  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(publicRobotsPath, robotsContent, 'utf-8');
  fs.writeFileSync(distRobotsPath, robotsContent, 'utf-8');

  console.log(`   Sitemap URL: ${sitemapUrl}`);
}

export function generateSitemap(outputDir?: string): void {
  const baseUrl = getBaseUrl();
  const output = outputDir || path.resolve(process.cwd(), 'dist');
  const outputPath = path.join(output, 'sitemap.xml');

  const config: SitemapConfig = {
    baseUrl,
    routes,
    outputPath,
  };

  const sitemapXML = generateSitemapXML(config);

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // write sitemap to dist (for prod builds)
  fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
  console.log(` Sitemap written to: ${outputPath}`);

  // write to public directory (for dev)
  const publicDir = path.resolve(process.cwd(), 'public');
  const publicPath = path.join(publicDir, 'sitemap.xml');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }
  fs.writeFileSync(publicPath, sitemapXML, 'utf-8');
  console.log(`Sitemap written to: ${publicPath}`);

  updateRobotsTxt(baseUrl, output, publicDir);

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Total Routes: ${routes.length}`);
  routes.forEach((route) => {
    console.log(
      `   - ${route.path} (priority: ${route.priority || 0.5}, changefreq: ${route.changefreq || 'monthly'})`
    );
  });
}

/**
 * Vite plugin to automatically generate sitemap during build
 */
export function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap-generator',
    apply: 'build',
    closeBundle() {
      try {
        generateSitemap();
      } catch (error) {
        console.error('❌ Failed to generate sitemap:', error);
      }
    },
  };
}

/**
 * allow running as a standalone script
 */
const isMainModule =
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith('vite-plugin-sitemap.ts') ||
  process.argv[1]?.endsWith('vite-plugin-sitemap.js');

if (isMainModule) {
  generateSitemap();
}
