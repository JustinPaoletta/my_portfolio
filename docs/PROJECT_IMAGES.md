# Project logo images

Project logo variants are generated from PNG masters in
`assets/source/project-logos/`. The masters retain their original bytes. They
are outside `public/` so the production build does not deploy them.

The generator uses the existing pinned `sharp` dependency. It resizes the
original artwork with Lanczos3 and does not crop, recolor, flatten, or enlarge
it. SideQuest keeps its opaque black background. The Wild Apricot logo keeps
its opaque background. Plexarr keeps its transparency.

## Regenerate

From the repository root, run:

```sh
npm ci
npm run optimize:project-logos
```

The script resolves source and output paths relative to its own file, so it
also works when called by an absolute path from another directory. It writes
only the fourteen configured WebP variants into `public/images/projects/`.

The script checks each output's format, dimensions, and alpha-channel
presence. For the six lossless icon variants, it also compares every decoded
pixel byte with the resized source before writing the file. `exact: true`
preserves color data in fully transparent pixels as well.

## Current SideQuest app branding (October 18, 2026)

The portfolio now uses `sidequest-sq-logo.png`, copied byte-for-byte from
`SideQuest-Pittsburgh/mobile/assets/branding/sq-pittsburgh-logo.png`. This is
the current 1254 × 1254 opaque logo master documented by that app's branding
README: a flat gold SQ monogram and Roberto Clemente Bridge with white
PITTSBURGH lettering. It is the same design as the app's 1024px icon; no
artwork was recreated or recolored.

The source was taken from the local app checkout at `a3e1704` with its
existing local branding changes. Its SHA-256 is
`e188a77e7e43687f4858dc8871ccd2e4f40518a035fa8eec95417fbb1e3ef567`.
The original app files were not changed. The older skyline master and its
variants remain as historical assets; the portfolio references the new
`sidequest-sq-logo-*` filenames to avoid stale cached artwork.

The generator creates 60, 120, 180, 240, 480, 720, 960, and 1254px variants
using WebP quality 90. The card uses the 60/120/180px candidates at 60 CSS
pixels. Their file sizes are 1,512 / 3,526 / 5,748 bytes, respectively.

## Original source masters (historical)

| Source                 | Dimensions  | Original bytes | Alpha channel |
| ---------------------- | ----------- | -------------: | ------------- |
| `sidequest-logo.png`   | 1254 × 1254 |      1,243,205 | No            |
| `wae-exports-logo.png` | 1254 × 1254 |      1,842,634 | No            |
| `plexarr_icon.png`     | 192 × 192   |         46,204 | Yes           |

The source SHA-256 hashes, verified before and after moving the files, are:

| Source                 | SHA-256                                                            |
| ---------------------- | ------------------------------------------------------------------ |
| `sidequest-logo.png`   | `303bb384d208a4439b9ec2817dfcc76f40fff1c88f28f273e1d37ea34c11d5b8` |
| `wae-exports-logo.png` | `28454588a9bcfd46d30b019cf31178688d695abc4fd616b621081dc0d8e843b2` |
| `plexarr_icon.png`     | `0d7d647dfc74e08640f16ded8b69a957f08aa12d8d0b9222499a3bebc4d48f2c` |

## Generated variants

Sizes below were measured with `sharp` 0.35.5. All outputs are square.

### SideQuest featured artwork

SideQuest uses WebP quality 90 with encoder effort 6. This is lossy encoding:
it slightly smooths subtle background texture and is not pixel-identical to
the resized PNG. The same-size 640px and 960px comparisons were visually
reviewed; the lettering, skyline, bridge, and artwork boundaries remain
clear. There is no crop or artwork redesign.

| Public file                |  Width |  Bytes |
| -------------------------- | -----: | -----: |
| `sidequest-logo-240.webp`  |  240px |  9,418 |
| `sidequest-logo-480.webp`  |  480px | 20,056 |
| `sidequest-logo-720.webp`  |  720px | 32,428 |
| `sidequest-logo-960.webp`  |  960px | 44,718 |
| `sidequest-logo-1254.webp` | 1254px | 60,962 |

Even the largest variant is 95.1% smaller than the original PNG. The 480px
variant is 98.4% smaller. The width candidates cover the small mobile artwork,
larger desktop artwork, and higher pixel densities without upscaling the
1254px master.

### Card header icons

The icons use lossless WebP with encoder effort 6 and `exact: true`. The
60px, 120px, and 180px outputs cover 1×, 2×, and 3× density at the existing
60 CSS pixel display size. Their decoded pixels match the source after the
requested resize, including the Plexarr alpha channel.

| Public file                 | Width |  Bytes |
| --------------------------- | ----: | -----: |
| `wae-exports-logo-60.webp`  |  60px |  4,878 |
| `wae-exports-logo-120.webp` | 120px | 15,184 |
| `wae-exports-logo-180.webp` | 180px | 29,804 |
| `plexarr-icon-60.webp`      |  60px |  4,966 |
| `plexarr-icon-120.webp`     | 120px | 15,674 |
| `plexarr-icon-180.webp`     | 180px | 31,724 |

## Browser checks when changing the layout

The Projects component owns the responsive image references. Keep its
`srcset` and `sizes` values aligned with the rendered artwork. SideQuest uses
contain sizing inside a 4:3 frame, so the painted square can be narrower than
the image element's full box. The header icons remain 60 CSS pixels wide.

At mobile and desktop widths, check the image's selected `currentSrc`, its
painted dimensions, and `devicePixelRatio`. Confirm the browser requests an
appropriate generated variant and no longer requests a PNG master. Check
that Plexarr's transparent edges remain clean against both light and dark
card backgrounds. A production build should contain the WebP variants and
no copies of these three PNG masters.

Favicons, Open Graph artwork, article images, and other project images are
outside this generator's scope.

## Professional presentation revision — 2026-10-11

Featured work now uses inspectable evidence. `design-system-showcase.webp` is a
1280×851 browser capture of the existing local Angular showcase's `/controls`
view (served from `jp-design-system/dist/apps/showcase/browser`; checkout HEAD
`b31915546a98f8ccd2cfeb85219b2030a1c995a5`). It contains demo form controls, no
customer data, and is labeled as a local prerelease showcase. The build was
already present; this capture does not assert a fresh upstream build or public
release. BitStockerz and Wild Apricot use semantic HTML workflow diagrams based
on their described implementations, not fabricated screenshots.

SideQuest is now a supporting card with a 60px icon. The optimizer also produces
60/120/180px candidates for this slot. The real-response image tests retain
320/390/1024/1440px and DPR 1/2 coverage; previous featured-image measurements
above are historical and no longer describe the new card layout. Wild Apricot
and Plexarr keep their 60/120/180px lossless icon variants.

The existing Open Graph image is retained unchanged from the PR base. The
replacement design is deferred at the owner’s request.

## Featured browser demos (2026-10-15)

The design-system dashboard and BitStockerz workspace stills are real Chrome
captures. Their PNG masters, raw walkthrough and capture manifest live in
`assets/source/project-demos/`. Run `npm run optimize:project-demos` to rebuild
640/960/1440px WebPs; no image is enlarged.

The BitStockerz player uses local synthetic data, not a live trading account.
It offers WebM and H.264 playback, a poster, timed descriptions and an HTML
transcript. `preload="none"` keeps the recording unloaded until playback is
requested. See the [capture notes](../assets/source/project-demos/README.md)
for the workflow, source boundaries and MP4 encoding command.

The design-system card also offers fresh form, roster-table, and assistant-panel
captures at 960 × 640. The assistant uses the Storybook example's fixed reply.
The gallery requests only its selected image and links to the original-size
WebP. No public Storybook deployment is implied.

Wild Apricot's diagram is replaced by inspectable output from its actual CLI:
events and contacts in CSV/JSON, original files, and a cached re-run. All data
comes from fictional local fixtures. The downloadable ZIP and the generator's
checks are documented in the same capture notes. The portfolio does not request
account credentials or execute exports in visitors' browsers.

Plexarr is the fourth featured project. A manually controlled screenshot carousel
shows Discover, personalized picks, and title details with community ratings.
The owner approved reuse of the authenticated October 15 captures. Every crop
excludes Request controls and availability messaging. The title-details slide
stacks two separate metadata excerpts. No new sign-in or Library capture is claimed.
Arrows, direct slide buttons, keyboard controls, touch swipes, and full-size links
support narrow screens. The carousel does not auto-advance or load video.
The private repository badge and header logo remain. Capture notes and hashes
record the exact source frames and crops.

The BitStockerz demo was refreshed on 2026-10-18 from the current local UI. It shows the revised dashboard, strategy library, rules, settings, and results. New `bitstockerz-workspace-*` media and poster URLs replace the old capture. Capture notes and hashes identify the dirty source tree and disposable seed API.
