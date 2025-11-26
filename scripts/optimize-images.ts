import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

const publicDir = path.join(process.cwd(), 'public');
const inputFile = path.join(publicDir, 'jp.webp');

const sizes = [100, 200, 400];

async function optimizeImages() {
  if (!fs.existsSync(inputFile)) {
    console.error('Input file not found:', inputFile);
    process.exit(1);
  }

  console.log('Optimizing images...');

  for (const size of sizes) {
    const outputFile = path.join(publicDir, `jp-${size}.webp`);
    console.log(`Generating ${outputFile}...`);

    await sharp(inputFile)
      .resize(size)
      .webp({ quality: 80 })
      .toFile(outputFile);
  }

  console.log('Done!');
}

optimizeImages().catch(console.error);
