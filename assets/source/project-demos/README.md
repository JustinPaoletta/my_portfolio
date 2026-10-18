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

The card uses a three-slide screenshot carousel with arrows, direct slide buttons,
keyboard navigation, and touch swipes. It does not rotate automatically or load video.
Only the selected slide's images mount. Full-size links keep small text accessible.

The owner approved reuse of the October 15 authenticated live-app captures on
October 18. No new sign-in, Library capture, or preference mutation is claimed.
The slides show Discover, personalized picks, and title metadata.

| Output PNG             | Source                             | Frame (seconds) | Crop: x, y, width, height |
| ---------------------- | ---------------------------------- | --------------- | ------------------------- |
| `plexarr-catalog.png`  | `plexarr-live-discover.png`        | —               | 0, 193, 1440, 592         |
| `plexarr-picks.png`    | `plexarr-live-catalog-capture.mp4` | 20.3            | 18, 273, 700, 252         |
| `plexarr-overview.png` | `plexarr-live-catalog-capture.mp4` | 23              | 434, 117, 576, 267        |
| `plexarr-rating.png`   | `plexarr-live-catalog-capture.mp4` | 23              | 459, 486, 522, 47         |

The third slide stacks two separate metadata excerpts. It does not reproduce a
complete dialog. Every public crop excludes Request navigation, buttons, forms,
and availability messaging. No catalog data or displayed rating was changed.
The manifest records the source crops and output hashes.

To extract a source frame, run this command from the repository root:

```sh
ffmpeg -ss 20.3 -i assets/source/project-demos/plexarr-live-catalog-capture.mp4 \
  -frames:v 1 /tmp/plexarr-picks-frame.png
```

Use Sharp's `extract({ left, top, width, height })` with the table's crop coordinates.
Save the resulting PNG under `assets/source/project-demos/`.
Run `npm run optimize:project-demos` to reproduce the responsive WebP variants.
The optimizer retains small metadata crops at their native maximum width.

The previous request-focused video, captions, and full-navigation public poster
were removed on October 18. The two original recordings remain historical source
evidence. They are not served by the portfolio. Their original provenance remains
in `plexarrArchivedOctober15` in the capture manifest.
