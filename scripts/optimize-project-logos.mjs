#!/usr/bin/env node
/** Generate project logo variants from the preserved PNG masters. */

import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = join(dirname(fileURLToPath(import.meta.url)), '..');
const sourceDirectory = join(projectRoot, 'assets/source/project-logos');
const outputDirectory = join(projectRoot, 'public/images/projects');

const logos = [
  {
    source: 'sidequest-logo.png',
    output: 'sidequest-logo',
    widths: [240, 480, 720, 960, 1254],
    hasAlpha: false,
    webp: { quality: 90, effort: 6 },
  },
  {
    source: 'wae-exports-logo.png',
    output: 'wae-exports-logo',
    widths: [60, 120, 180],
    hasAlpha: false,
    webp: { lossless: true, exact: true, effort: 6 },
  },
  {
    source: 'plexarr_icon.png',
    output: 'plexarr-icon',
    widths: [60, 120, 180],
    hasAlpha: true,
    webp: { lossless: true, exact: true, effort: 6 },
  },
];

await mkdir(outputDirectory, { recursive: true });

for (const logo of logos) {
  const input = await readFile(join(sourceDirectory, logo.source));
  const source = await sharp(input).metadata();
  assert.equal(source.format, 'png', `${logo.source}: expected a PNG master`);
  assert.equal(
    source.width,
    source.height,
    `${logo.source}: expected square artwork`
  );
  assert.equal(
    source.hasAlpha,
    logo.hasAlpha,
    `${logo.source}: unexpected alpha channel`
  );

  for (const width of logo.widths) {
    assert.ok(
      width <= source.width,
      `${logo.source}: enlargement is not allowed`
    );
    const resized = sharp(input).resize({
      width,
      kernel: 'lanczos3',
      withoutEnlargement: true,
    });
    const encoded = await resized.clone().webp(logo.webp).toBuffer();
    const output = await sharp(encoded).metadata();
    assert.equal(output.format, 'webp');
    assert.equal(output.width, width);
    assert.equal(output.height, width);
    assert.equal(output.hasAlpha, source.hasAlpha);

    if (logo.webp.lossless) {
      const expected = await resized.clone().raw().toBuffer();
      const decoded = await sharp(encoded).raw().toBuffer();
      assert.ok(
        expected.equals(decoded),
        `${logo.source} at ${width}px: lossless pixels changed`
      );
    }

    const name = `${logo.output}-${width}.webp`;
    await writeFile(join(outputDirectory, name), encoded);
    globalThis.console.log(
      `${name}: ${width}x${width}, ${encoded.length} bytes, ${
        logo.webp.lossless ? 'lossless pixels verified' : 'quality 90'
      }, alpha=${output.hasAlpha}`
    );
  }
}
