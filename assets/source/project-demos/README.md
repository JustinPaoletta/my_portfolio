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

## BitStockerz — refreshed 2026-10-18

The refreshed recording uses the current Angular working tree, including revised copy and approved branding.
The API runs from its existing compiled build in disposable seed mode.
`BITSTOCKERZ_SKIP_ENV_FILE=true` prevents loading project credentials. The database URL is empty.
Ingestion, live market data, private beta, and AI calls are disabled.

The recording opens the dashboard, strategy library, and saved `SMA momentum study` rules.
It configures 75% allocation, 5 bps commission, and 5 bps slippage, then runs the actual local backtester.
It displays assumptions, metrics, the buy-and-hold comparison, and the equity curve.
Prices and results are synthetic. No provider calls, real account access, or real-money orders are demonstrated.
No browser API responses or visible copy were replaced for this capture.

The continuous raw capture is `bitstockerz-workspace-walkthrough.webm`: 21.2 seconds, 1440 × 960, 25 fps, silent.
`bitstockerz-workspace.png` is a separate screenshot of the same result, framed to show metrics and the benchmark chart.
The previous October 15 sources remain archived here; the portfolio uses the new workspace filenames.
The manifest records source hashes, the dirty working-tree status, and capture details.

Re-encode from the portfolio root:

```sh
ffmpeg -i assets/source/project-demos/bitstockerz-workspace-walkthrough.webm \
  -an -map_metadata -1 -c:v libx264 -profile:v baseline -bf 0 -g 25 \
  -preset slow -crf 22 -pix_fmt yuv420p -movflags +faststart \
  public/media/bitstockerz-workspace-demo.mp4
ffmpeg -i assets/source/project-demos/bitstockerz-workspace-walkthrough.webm \
  -an -map_metadata -1 -c:v libvpx-vp9 -crf 31 -b:v 0 -row-mt 1 -cpu-used 3 \
  public/media/bitstockerz-workspace-demo.webm
```

Run `npm run optimize:project-demos` to generate the 640/960/1440px WebP posters.
The new media URLs prevent browsers from reusing the previous recording.
The VTT and HTML transcript describe this workflow. Both video formats remain unloaded until playback is requested.

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

### Plexarr presentation refresh — October 18, 2026

The card and CLI share the household-library dashboard description in
`src/content/projects.ts`. The public description covers catalog search, library
availability, request review, activity history, allowlisted passkey access, and
server-side integrations. It does not claim public streaming or hosting.

The existing 18-second recording is retained with task-focused captions at
`public/media/plexarr-product-walkthrough.vtt`: catalog browsing, title details
and availability, request review, and cancellation back to Discover. The video
still dates from October 15; this presentation update is not a new capture.
