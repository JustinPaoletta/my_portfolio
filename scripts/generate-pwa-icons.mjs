/**
 * Generate PWA icons from existing Vite SVG logo
 * Creates properly sized PNG icons for PWA installation
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const sizes = [192, 512];
const inputSvg = join(process.cwd(), 'public', 'vite.svg');

console.log('🎨 Generating PWA icons...\n');

// Read the SVG file
const svgBuffer = readFileSync(inputSvg);

// Generate PNG for each size
async function generateIcons() {
  for (const size of sizes) {
    try {
      const outputPath = join(process.cwd(), 'public', `pwa-${size}x${size}.png`);
      
      await sharp(svgBuffer)
        .resize(size, size, {
          fit: 'contain',
          background: { r: 36, g: 36, b: 36, alpha: 1 }, // #242424 from your theme
        })
        .png()
        .toFile(outputPath);
      
      console.log(`✅ Generated: pwa-${size}x${size}.png`);
    } catch (error) {
      console.error(`❌ Failed to generate ${size}x${size}:`, error.message);
    }
  }
  
  console.log('\n✨ PWA icons generated successfully!');
  console.log('\n📋 Next steps:');
  console.log('   1. Check public/ folder for pwa-192x192.png and pwa-512x512.png');
  console.log('   2. Build your project: npm run build');
  console.log('   3. Test in browser DevTools → Application → Manifest');
  console.log('\n💡 Tip: Replace with custom icons later if desired!\n');
}

generateIcons().catch(console.error);

