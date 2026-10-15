# Project browser captures

Captured on 2026-10-15 in Chrome. These are actual local interfaces, not
illustrative mockups. The manifest records source revisions, dimensions, and
asset hashes.

## Design system

The running Storybook at port 4400 displayed four stories with `accent:gold`:

| View      | Story                                         | Viewport   |
| --------- | --------------------------------------------- | ---------- |
| Dashboard | `compositions-app-shell-dashboard--dashboard` | 1440 × 960 |
| Forms     | `compositions-controls-form--default`         | 960 × 640  |
| Data      | `compositions-data-display--default`          | 960 × 640  |
| Assistant | `compositions-assistant-system--default`      | 960 × 640  |

The form contains a fictional coach email and notes, with Coach selected. The
roster shows three sample players. The assistant shows a submitted question and
the story's fixed response; it makes no model or provider call. These are
captured states, not interactive Angular components embedded in the portfolio.
The gallery offers keyboard selection and full-size images. Inactive captures
are not requested. The library remains pre-release.

## Wild Apricot exports

`wild-apricot/` contains fictional REST fixtures, complete CLI output, and files
produced by the unmodified CLI. The generator compiles the clean sibling checkout
in a temporary folder. It intercepts REST requests with fixed responses and uses
a loopback WebDAV fixture. It runs events, contacts, and files, then repeats the
file export. Assertions verify the serialized contacts, byte-for-byte original
files, and zero additional downloads on the second run.

Regenerate from the portfolio root:

```sh
node scripts/project-demos/generate-wae-demo.mjs ../wild-apricot-exports
npx prettier --write src/content/generated/wild-apricot-demo.json
```

The source checkout must be clean and have its dependencies installed. The script
does not load its `.env` or inherit account credentials. Unknown REST requests
fail. The WebDAV fixture is local and does not verify real account authentication.
This demonstrates local exports and cached-file handling, not live service
acceptance, large-account performance, or recovery from changed remote files.

The portfolio displays verbatim log excerpts, the first JSON record, six of the
24 CSV columns, and the actual output file list. The ZIP includes complete CSV
and JSON, original fictional files, the manifest, a README, and the full log.
Only the temporary folder and loopback port are normalized in that log.

## BitStockerz

The current Angular development server used a disposable seed-mode API with
`BITSTOCKERZ_SKIP_ENV_FILE=true`, an empty `DATABASE_URL`, and ingestion, live
market data, private beta and AI disabled. The API used its existing local
compiled build. Another task was updating the web working tree during this
session; the revision is a reference, not a claim of a clean release build.
No provider credentials or real account data were used.

The recording edits a sample SMA strategy's period and risk exit, validates and
saves it, configures 75% allocation with 5 bps commission and 5 bps slippage, runs
a backtest, and scrolls to its benchmark comparison and equity curve. Demo prices
and results are synthetic. The run is not evidence of investment performance,
live-provider acceptance, or production availability.

The original WebM is retained outside the public directory. Its 15.6-second H.264
export has no audio, uses yuv420p and faststart, and loads only after playback is
requested. The VTT provides timed descriptions of the visible workflow; an HTML
transcript provides the same context without playback.

Re-encode the recording from the repository root with:

```sh
ffmpeg -i assets/source/project-demos/bitstockerz-walkthrough.webm \
  -an -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -movflags +faststart public/media/bitstockerz-demo.mp4
```

Run `npm run optimize:project-demos` to regenerate 640/960/1440px WebP stills
from the PNG masters, up to each capture's original width. The generator does not
enlarge them. Review refreshed
captures before replacing these assets and update the manifest hashes.
