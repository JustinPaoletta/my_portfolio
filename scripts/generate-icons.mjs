#!/usr/bin/env node
/** All logo/icon exports share the outlined master in assets/branding/jp-mark.svg. */
import sharp from 'sharp';
import { Buffer } from 'node:buffer';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const master = await readFile(
  path.join(root, 'assets/branding/jp-mark.svg'),
  'utf8'
);
const body = master.replace(/<svg[^>]*>/, '').replace('</svg>', '');
const background = '#101216';
const icon = (maskable = false) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><rect width="512" height="512" rx="${maskable ? 0 : 88}" fill="${background}"/><g transform="translate(${maskable ? '83 144' : '77 140'}) scale(${maskable ? 1.06 : 1.1})">${body}</g></svg>`;
const out = path.join(root, 'public/favicons');
await mkdir(out, { recursive: true });
await writeFile(path.join(out, 'jp-monogram.svg'), icon());

// Keep historical logo URLs and the React import in sync; no redrawing of the mark.
for (const folder of ['public/branding', 'src/assets']) {
  await writeFile(path.join(root, folder, 'JP.svg'), master);
  await writeFile(
    path.join(root, folder, 'JP-no-cursor.svg'),
    master.replace(/^[ \t]*<rect class="jp-logo-cursor"[^>]*\/>\n?/m, '')
  );
}

for (const [name, size, maskable] of [
  ['favicon-16x16.png', 16, false],
  ['favicon-32x32.png', 32, false],
  ['favicon-48x48.png', 48, false],
  ['apple-touch-icon.png', 180, true],
  ['pwa-192x192.png', 192, false],
  ['pwa-512x512.png', 512, false],
  ['pwa-maskable-512x512.png', 512, true],
]) {
  await sharp(Buffer.from(icon(maskable)))
    .resize(size, size)
    .png()
    .toFile(path.join(out, name));
}

// ICO directory with actual 16/32/48px PNG payloads (not a renamed PNG).
const sizes = [16, 32, 48];
const images = await Promise.all(
  sizes.map((size) => readFile(path.join(out, `favicon-${size}x${size}.png`)))
);
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
images.forEach((data, index) => {
  const entry = 6 + index * 16;
  header[entry] = sizes[index];
  header[entry + 1] = sizes[index];
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(data.length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += data.length;
});
await writeFile(
  path.join(root, 'public/favicon.ico'),
  Buffer.concat([header, ...images])
);
globalThis.console.log(
  'Generated matching SVG, ICO, PNG, Apple and maskable JP icons.'
);
