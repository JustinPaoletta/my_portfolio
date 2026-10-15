# JP Engineering identity

The identity follows the owner's JP-and-cursor reference: charcoal `#101216`,
slate `#8e99a8`, and white `#f5f7fa`. The slanted JP lettering uses clean vector
curves; the upright cursor is part of the mark and stays visible.

- `jp-mark.svg` is the master geometry for the website, favicon and sharing card.
- `og-image.html` is the editable 1200 × 630 sharing-card layout. It uses the
  repository's local Inter variable font and the master SVG, with no remote assets.
- The website reverses the neutral mark on light surfaces for legibility. Its
  geometry stays the same across themes; favicon and sharing-card colors stay fixed.

Run `npm run generate:branding` from the repository root after changing a source.
The icon generator uses Sharp. The sharing-card generator uses Playwright's
Chromium installation, or installed Google Chrome if Chromium is absent. It renders
the local HTML, waits for fonts and images, and writes the PNG without a dev server.

Exports include a scalable SVG favicon, an ICO containing 16/32/48px images,
individual PNGs, an Apple touch icon, and a dedicated opaque maskable PWA icon.
The maskable icon keeps the complete mark within the central safe circle.
Historical logo and OG paths are also regenerated to avoid conflicting branding.

The active OG URL is `/og/jp-engineering.png`; `index.html` and
`src/config/seo.ts` agree on it. Updated icon links include a version parameter
where their filenames are retained, so existing browser caches can refresh them.
Social networks can retain older unfurls until the page is published and recrawled.
