import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { execFileSync } from 'node:child_process';
import { config } from 'dotenv';

// load environment variables from .env file
config();

interface SitemapConfig {
  baseUrl: string;
  routes: RouteConfig[];
}

interface RouteConfig {
  path: string;
  lastmod?: string;
  contentPaths?: string[];
}

const routes: RouteConfig[] = [
  {
    path: '/',
    contentPaths: ['index.html', 'src', 'public'],
  },
  // Example: Add more routes as needed:
  // {
  //   path: '/about',
  //   contentPaths: ['index.html', 'src'],
  // },
  // {
  //   path: '/projects',
  //   contentPaths: ['index.html', 'src'],
  // },
  // {
  //   path: '/contact',
  //   contentPaths: ['index.html', 'src'],
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

function getRouteLastModified(contentPaths: string[]): string {
  const gitLastModified = getGitLastModified(contentPaths);

  if (gitLastModified) {
    return gitLastModified;
  }

  const fileSystemLastModified = getLatestFileSystemModifiedDate(contentPaths);

  if (fileSystemLastModified) {
    return fileSystemLastModified;
  }

  return new Date().toISOString().split('T')[0];
}

function getGitLastModified(contentPaths: string[]): string | null {
  if (!contentPaths.length) {
    return null;
  }

  try {
    const output = execFileSync(
      'git',
      ['log', '-1', '--format=%cs', '--', ...contentPaths],
      {
        cwd: process.cwd(),
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
      }
    ).trim();

    return output || null;
  } catch {
    return null;
  }
}

function getLatestFileSystemModifiedDate(
  contentPaths: string[]
): string | null {
  let latestModifiedTime = 0;

  for (const contentPath of contentPaths) {
    const absolutePath = path.resolve(process.cwd(), contentPath);
    const modifiedTime = getLatestModifiedTime(absolutePath);
    latestModifiedTime = Math.max(latestModifiedTime, modifiedTime);
  }

  if (!latestModifiedTime) {
    return null;
  }

  return new Date(latestModifiedTime).toISOString().split('T')[0];
}

function getLatestModifiedTime(targetPath: string): number {
  if (!fs.existsSync(targetPath)) {
    return 0;
  }

  const stats = fs.statSync(targetPath);

  if (stats.isFile()) {
    return stats.mtimeMs;
  }

  if (!stats.isDirectory()) {
    return 0;
  }

  return fs.readdirSync(targetPath).reduce((latestModifiedTime, entryName) => {
    const entryPath = path.join(targetPath, entryName);
    return Math.max(latestModifiedTime, getLatestModifiedTime(entryPath));
  }, stats.mtimeMs);
}

function generateSitemapXML(config: SitemapConfig): string {
  const { baseUrl, routes } = config;

  const urlEntries = routes
    .map((route) => {
      const url = `${baseUrl}${route.path}`;
      const lastmod =
        route.lastmod || getRouteLastModified(route.contentPaths || []);

      return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
}

function updateRobotsTxt(baseUrl: string, outputDir: string): void {
  const sitemapUrl = `${baseUrl}/sitemap.xml`;
  const publicDir = path.resolve(process.cwd(), 'public');
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

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(distRobotsPath, robotsContent, 'utf-8');

  console.log(`   Sitemap URL: ${sitemapUrl}`);
}

function generateSitemap(outputDir?: string): void {
  const baseUrl = getBaseUrl();
  const output = outputDir || path.resolve(process.cwd(), 'dist');
  const outputPath = path.join(output, 'sitemap.xml');

  const config: SitemapConfig = {
    baseUrl,
    routes,
  };

  const sitemapXML = generateSitemapXML(config);

  if (!fs.existsSync(output)) {
    fs.mkdirSync(output, { recursive: true });
  }

  // write sitemap to dist (for prod builds)
  fs.writeFileSync(outputPath, sitemapXML, 'utf-8');
  console.log(` Sitemap written to: ${outputPath}`);

  updateRobotsTxt(baseUrl, output);

  console.log(`Base URL: ${baseUrl}`);
  console.log(`Total Routes: ${routes.length}`);
  routes.forEach((route) => {
    console.log(`   - ${route.path}`);
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
        throw error;
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
