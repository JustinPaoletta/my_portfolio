#!/usr/bin/env node
/**
 * Generates PWA and favicon assets from the no-cursor SVG logo.
 * Run when JP-no-cursor.svg is updated.
 *
 * Generates:
 * - favicon-48x48.png (Google search, browser)
 * - apple-touch-icon.png (180x180, iOS home screen)
 * - pwa-192x192.png (Android/Chrome PWA, Windows tile)
 * - pwa-512x512.png (PWA splash, app stores)
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '..');
const publicDir = join(projectRoot, 'public');
const sourceSvg = join(publicDir, 'JP-no-cursor.svg');

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
  const outPath = join(publicDir, name);
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

  // Rounded-rect mask: opaque inside, transparent at corners.
  const radius = Math.round(size * CORNER_RADIUS);
  const maskSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}" fill="white"/></svg>`;

  await sharp(iconWithAlpha)
    .composite([{ input: Buffer.from(maskSvg), blend: 'dest-in' }])
    .png()
    .toFile(outPath);
  console.log(`Generated ${name}`);

  // Circle preview (e.g. for Google search)—helps decide if LOGO_SCALE needs adjustment.
  const circleMaskSvg = `<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="white"/></svg>`;
  const circlePath = outPath.replace('.png', '-circle.png');
  await sharp(iconWithAlpha)
    .composite([{ input: Buffer.from(circleMaskSvg), blend: 'dest-in' }])
    .png()
    .toFile(circlePath);
  console.log(`Generated ${circlePath.split('/').pop()}`);
}

// Transparent PNG (no-cursor logo, no background)—uses original SVG.
const transparentSvg = readFileSync(sourceSvg, 'utf8').replace(
  /viewBox="0 0 330 ([^"]+)"/,
  'viewBox="-4 0 354 $1"'
);
const transparentSize = 512;
const transparentInnerSize = Math.round(transparentSize * LOGO_SCALE);
const transparentLogo = await sharp(Buffer.from(transparentSvg))
  .resize(transparentInnerSize, transparentInnerSize, {
    fit: 'contain',
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  })
  .png()
  .toBuffer();

const transparentLeft = Math.round(
  (transparentSize - transparentInnerSize) / 2 + transparentSize * LOGO_X_OFFSET_RATIO
);
const transparentTop = Math.round((transparentSize - transparentInnerSize) / 2);

await sharp({
  create: {
    width: transparentSize,
    height: transparentSize,
    channels: 4,
    background: { r: 0, g: 0, b: 0, alpha: 0 },
  },
})
  .composite([{ input: transparentLogo, left: transparentLeft, top: transparentTop }])
  .png()
  .toFile(join(publicDir, 'JP-transparent.png'));
console.log('Generated JP-transparent.png');
