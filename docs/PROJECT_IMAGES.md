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
only the eleven listed WebP variants into `public/images/projects/`.

The script checks each output's format, dimensions, and alpha-channel
presence. For the six lossless icon variants, it also compares every decoded
pixel byte with the resized source before writing the file. `exact: true`
preserves color data in fully transparent pixels as well.

## Source masters

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
