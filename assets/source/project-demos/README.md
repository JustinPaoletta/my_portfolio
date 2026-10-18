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

## Plexarr

The 18-second edited recording comes directly from the owner's authenticated live
Plexarr deployment in Chrome. Movie posters, recommendations, availability and
quality profiles are real app responses. There is no API interception, fictional
catalog, seeded Activity entry or authentication bypass. The owner completed the
normal passkey sign-in before capture. No credentials, sign-in ceremony or other
users' Activity are included.

The flow browses the movie grid, opens Avengers: Infinity War (2018), reviews its
metadata and availability, inspects the request form with HD-1080p selected, and
cancels back to Discover. Confirm was never clicked. The recording does not claim
a successful add or download. The selection change occurs between the retained
segments; the clip shows the selected profile, not an uninterrupted selection
interaction. It has no audio or trailer playback.

Native window capture excludes other desktop overlays. The two retained source
MP4s are cropped to the app's 1440 × 808 content area, excluding browser toolbars,
bookmarks and the address bar. They preserve the captured UI at 15fps. The PNG
poster comes from the same live movie grid. The manifest records the crop and
edit ranges; the deployed app revision was not independently verified. No private
source, environment values or operational runbooks are copied into this repo.

The public edit joins seconds 17–26 of `plexarr-live-catalog-capture.mp4` to seconds
2–11 of `plexarr-live-request-capture.mp4`. This removes idle capture time and the
gap between recordings without changing the UI content. Reproduce it with:

```sh
ffmpeg -i assets/source/project-demos/plexarr-live-catalog-capture.mp4 \
  -i assets/source/project-demos/plexarr-live-request-capture.mp4 \
  -filter_complex '[0:v]trim=start=17:end=26,setpts=PTS-STARTPTS[a];[1:v]trim=start=2:end=11,setpts=PTS-STARTPTS[b];[a][b]concat=n=2:v=1:a=0[v]' \
  -map '[v]' -an -map_metadata -1 -c:v libx264 -preset slow -crf 21 \
  -pix_fmt yuv420p -movflags +faststart public/media/plexarr-live-demo.mp4
```

The WebM uses the same edit with VP9, CRF 30, zero target bitrate, and encoder
speed 3. Both formats load only on playback and include timed descriptions plus
an HTML transcript. New `plexarr-live-*` URLs prevent the previous sample clip
from being reused by the browser's media or image cache. The fictional capture,
fixture tool, and public media are removed from the current branch.
