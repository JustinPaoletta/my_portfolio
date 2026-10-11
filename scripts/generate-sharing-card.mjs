import { fileURLToPath, URL } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(
  new URL('../assets/source/social/portfolio-card.svg', import.meta.url)
);
const output = fileURLToPath(
  new URL('../public/og/og-image.png', import.meta.url)
);
await sharp(source).png().toFile(output);
globalThis.console.log('Generated 1200×630 portfolio sharing card');
