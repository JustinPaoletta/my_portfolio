#!/usr/bin/env node
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const captures = [
  'design-system-dashboard',
  'design-system-forms',
  'design-system-data',
  'design-system-assistant',
  'bitstockerz-workspace',
  'plexarr-catalog',
  'plexarr-picks',
  'plexarr-overview',
  'plexarr-rating',
  'plexarr-current-library',
  'plexarr-current-picks',
  'plexarr-current-details',
];
const additionalCaptures = [
  { name: 'squark-mountain-flight', widths: [640, 800, 1280], quality: 88 },
  ...['discovery', 'guides', 'collection'].map((screen) => ({
    name: `sidequest-${screen}-20261105`,
    widths: [320, 480, 720, 945],
    quality: 85,
  })),
];
let count = 0;
for (const name of captures) {
  const source = path.join(root, `assets/source/project-demos/${name}.png`);
  const { width: sourceWidth } = await sharp(source).metadata();
  const widths = [
    ...new Set(
      sourceWidth < 640
        ? [320, 480, sourceWidth]
        : name.startsWith('plexarr-current-')
          ? [320, 480, 640, 960, 1440, sourceWidth]
          : [640, 960, 1440, sourceWidth]
    ),
  ];
  for (const width of widths.filter((width) => width <= sourceWidth)) {
    await sharp(path.join(root, `assets/source/project-demos/${name}.png`))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(root, `public/images/projects/${name}-${width}.webp`));
    count++;
  }
}
for (const { name, widths, quality } of additionalCaptures) {
  for (const width of widths) {
    await sharp(path.join(root, `assets/source/project-demos/${name}.png`))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality, effort: 6 })
      .toFile(path.join(root, `public/images/projects/${name}-${width}.webp`));
    count++;
  }
}
globalThis.console.log(
  `Generated ${count} WebP variants from project browser and simulator captures.`
);
