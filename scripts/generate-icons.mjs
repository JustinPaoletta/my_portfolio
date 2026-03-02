#!/usr/bin/env node
/**
 * Generates PWA and favicon assets from the no-cursor SVG logo.
 * Source: public/branding/JP-no-cursor.svg
 * Output: public/favicons/
 *
 * Generates:
 * - favicons/favicon-48x48.png (Google search, browser)
 * - favicons/apple-touch-icon.png (180x180, iOS home screen)
 * - favicons/pwa-192x192.png (Android/Chrome PWA, Windows tile)
 * - favicons/pwa-512x512.png (PWA splash, app stores)
 */

import sharp from 'sharp';
import { Buffer } from 'node:buffer';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const sourceSvg = join(publicDir, 'branding', 'JP-no-cursor.svg');
const faviconsDir = join(publicDir, 'favicons');

const sizes = [
  { name: 'favicon-48x48.png', size: 48 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192x192.png', size: 192 },
  { name: 'pwa-512x512.png', size: 512 },
];

// Inject background rect and fix horizontal centering.
// SVG viewBox 0-330 has content 0-326 (J+cursor); 4px more padding on right.
// Shift viewBox left by 4 so left/right padding are equal.
const BACKGROUND = '#242424';
let svgContent = readFileSync(sourceSvg, 'utf8');
svgContent = svgContent
  .replace(/viewBox="0 0 330 ([^"]+)"/, 'viewBox="-4 0 354 $1"')
  .replace(
    /<svg([^>]*)>/,
    `<svg$1><rect width="100%" height="100%" fill="${BACKGROUND}"/>`
  );
const svgBuffer = Buffer.from(svgContent);

// Logo scale: 0.85 = fits in 85% of canvas, more padding (zoom out).
const LOGO_SCALE = 0.85;
// Optical horizontal adjustment: source glyph mass sits right of geometric center.
// Negative shifts logo left across all generated sizes.
const LOGO_X_OFFSET_RATIO = -0.05;

// Corner radius as fraction of size (0.22 = iOS-style squircle-ish rounding).
const CORNER_RADIUS = 0.22;

for (const { name, size } of sizes) {
  const outPath = join(faviconsDir, name);
  const innerSize = Math.round(size * LOGO_SCALE);

  const resizedLogo = await sharp(svgBuffer)
    .resize(innerSize, innerSize, { fit: 'contain', background: BACKGROUND })
    .flatten({ background: BACKGROUND })
    .toBuffer();

  const left = Math.round((size - innerSize) / 2 + size * LOGO_X_OFFSET_RATIO);
  const top = Math.round((size - innerSize) / 2);

  const iconWithAlpha = await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 36, g: 36, b: 36, alpha: 1 },
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png()
    .toBuffer();

  const radius = Math.round(size * CORNER_RADIUS);
  const maskSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`;

  await sharp(iconWithAlpha)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toFile(outPath);
  globalThis.console.log(`Generated favicons/${name}`);
}
