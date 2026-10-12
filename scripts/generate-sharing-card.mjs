import { fileURLToPath, URL } from 'node:url';
import sharp from 'sharp';

const source = fileURLToPath(
  new URL('../assets/source/social/portfolio-card.svg', import.meta.url)
);
const outputs = [
  '../public/og/justin-paoletta-software-engineer.png',
  '../public/og/og-image.png',
];
const image = await sharp(source).png().toBuffer();
for (const output of outputs) {
  await sharp(image).toFile(fileURLToPath(new URL(output, import.meta.url)));
}
globalThis.console.log(
  'Generated 1200×630 portfolio sharing card and legacy alias'
);
