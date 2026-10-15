#!/usr/bin/env node
import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
for (const name of ['design-system-dashboard', 'bitstockerz-research']) {
  for (const width of [640, 960, 1440]) {
    await sharp(path.join(root, `assets/source/project-demos/${name}.png`))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 })
      .toFile(path.join(root, `public/images/projects/${name}-${width}.webp`));
  }
}
globalThis.console.log(
  'Generated six WebP variants from real project browser captures.'
);
