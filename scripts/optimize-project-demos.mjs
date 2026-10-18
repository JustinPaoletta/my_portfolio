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
];
let count = 0;
for (const name of captures) {
  const source = path.join(root, `assets/source/project-demos/${name}.png`);
  const { width: sourceWidth } = await sharp(source).metadata();
  const widths = [
    ...new Set(
      sourceWidth < 640
        ? [320, 480, sourceWidth]
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
globalThis.console.log(
  `Generated ${count} WebP variants from real project browser captures.`
);
