import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import sharp from 'sharp';
import { render, screen } from '@/test/test-utils';
import { describe, expect, it } from 'vitest';
import Footer from '@/components/Footer';
import { pwaConfig } from './pwa-config';

const asset = (path: string) =>
  readFileSync(resolve('public', path.replace(/^\//, '').split('?')[0]));

describe('published branding and dog assets', () => {
  it('ships a consistent 1200×630 OG image and compatibility URL', async () => {
    const html = readFileSync('index.html', 'utf8');
    const doc = new DOMParser().parseFromString(html, 'text/html');
    for (const selector of [
      'meta[property="og:image"]',
      'meta[name="twitter:image"]',
    ]) {
      const url = new URL(
        doc.querySelector(selector)!.getAttribute('content')!
      );
      const image = asset(url.pathname);
      expect(await sharp(image).metadata()).toMatchObject({
        format: 'png',
        width: 1200,
        height: 630,
      });
      expect(image.equals(asset('/og/jp-engineering.png'))).toBe(true);
    }
    expect(
      asset('/og/og-image.png').equals(asset('/og/jp-engineering.png'))
    ).toBe(true);
  });

  it('provides decodable manifest icons at their declared sizes and a real multi-size ICO', async () => {
    for (const icon of (
      pwaConfig.manifest as { icons: { src: string; sizes: string }[] }
    ).icons) {
      const image = asset(icon.src);
      if (icon.sizes === 'any') {
        expect(image.toString()).toContain('<svg');
      } else {
        const [width, height] = icon.sizes.split('x').map(Number);
        expect(await sharp(image).metadata()).toMatchObject({ width, height });
      }
    }
    const ico = asset('/favicon.ico');
    expect(ico.readUInt16LE(0)).toBe(0);
    expect(ico.readUInt16LE(2)).toBe(1);
    expect(ico.readUInt16LE(4)).toBe(3);
    for (let i = 0; i < 3; i++) {
      const offset = 6 + i * 16;
      const size = ico.readUInt32LE(offset + 8);
      const start = ico.readUInt32LE(offset + 12);
      const image = await sharp(ico.subarray(start, start + size)).metadata();
      expect(image.width).toBe(ico[offset]);
      expect(image.height).toBe(ico[offset + 1]);
    }
  });

  it.each(['nala', 'rosie', 'tito'])(
    'publishes a transparent, nonempty %s cutout',
    async (name) => {
      const image = sharp(asset(`/images/pets/${name}-cutout.webp`));
      expect(await image.metadata()).toMatchObject({
        format: 'webp',
        width: 360,
        height: 360,
        hasAlpha: true,
      });
      const { data, info } = await image
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let transparent = 0;
      let opaque = 0;
      for (let i = 3; i < data.length; i += info.channels) {
        if (data[i] === 0) transparent++;
        if (data[i] === 255) opaque++;
      }
      expect(transparent).toBeGreaterThan(100);
      expect(opaque).toBeGreaterThan(100);
    }
  );

  it('keeps the footer identity and return-to-top action accessible', () => {
    render(<Footer />);
    expect(screen.getByText('Design - Develop - Deliver')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Go to top/ })).toHaveAttribute(
      'href',
      '#hero'
    );
    expect(screen.getByText(/All rights reserved/)).toHaveTextContent(
      String(new Date().getFullYear())
    );
  });
});
