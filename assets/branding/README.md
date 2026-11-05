# JP Engineering identity

Documentation inspected against generation scripts, theme code, and delivered assets on 2026-11-05.
This inspection does not establish external social-cache refresh or native home-screen acceptance.

The identity follows the owner's JP-and-cursor reference: charcoal `#101216`,
slate `#8e99a8`, and white `#f5f7fa`. The slanted JP lettering uses clean vector
curves; the upright cursor is part of the mark and stays visible.

- `jp-mark.svg` is the master geometry for the website, favicon and sharing card.
- `og-image.html` is the editable 1200 × 630 sharing-card layout. It uses the
  repository's local Inter variable font and the master SVG, with no remote assets.
- Minimal uses the neutral mark, reversed on light surfaces. Engineer uses cyan
  and Cosmic uses purple in the header and footer, with contrast-safe light-mode
  variants. The SVG browser favicon uses the active theme accent on a dark tile, including green for CLI.
  Returning to Minimal restores the neutral favicon. ICO and PNG fallbacks retain the neutral export.
  All themes share the same geometry; the sharing card retains its neutral palette.

Install repository dependencies and run `npm run generate:branding` from the repository root after changing a source.
The icon generator uses Sharp. The sharing-card generator uses Playwright's
Chromium installation, or installed Google Chrome if Chromium is absent. It renders
the local HTML, waits for fonts and images, and writes the PNG without a dev server.

Exports include an SVG favicon, a 16/32/48px ICO, individual PNGs, an Apple touch icon, and an opaque maskable PWA icon.
The maskable icon keeps the complete mark within the central safe circle.
Historical logo and OG paths are also regenerated to avoid conflicting branding.
The `JP-no-cursor.svg` compatibility exports intentionally omit the cursor.
The public `/og/og-image.png` compatibility file is copied from `/og/jp-engineering.png`.

The active OG URL is `/og/jp-engineering.png`; `index.html` and
`src/config/seo.ts` agree on it. Updated icon links include a version parameter
where their filenames are retained, so existing browser caches can refresh them.
Social networks can retain older unfurls until the page is published and recrawled.
