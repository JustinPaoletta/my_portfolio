# Project demo sources

Updated November 5, 2026. Each project has its own capture date and verification
scope in `capture-manifest.json`. Public derivatives use responsive WebP images.
The manifest records source revisions, dimensions, data modes, and hashes.

## Capture prerequisites

Install the portfolio's Node dependencies and the relevant source project's
dependencies before starting its documented local server.
The capture helpers also require a compatible Playwright CLI launcher.
They default to the installed Codex wrapper at
`~/.codex/skills/playwright/scripts/playwright_cli.sh`.
Set `PLAYWRIGHT_CLI=/absolute/path/to/launcher` when using another compatible
launcher. These helpers do not install that external tool or source projects.

## Design system — November 5, 2026

Four current Storybook compositions were captured from source revision `61660e5`.
The local preview used `accent:gold`.

| View      | Story                                         | Viewport   |
| --------- | --------------------------------------------- | ---------- |
| Dashboard | `compositions-app-shell-dashboard--dashboard` | 1440 × 960 |
| Forms     | `compositions-controls-form--default`         | 960 × 900  |
| Data      | `compositions-data-display--default`          | 960 × 640  |
| Assistant | `compositions-assistant-system--default`      | 960 × 640  |

The Game 6 compositions use example archive data and fictional contact details.
Form Save feedback changes local preview state; it does not persist account data.
The assistant returns a deterministic local reply without an AI provider call.
These are screenshots of real components, not an embedded Angular application.

The [public Storybook](https://justinpaoletta.github.io/jp-design-system/)
loaded anonymously during this review. Its successful Pages deployment matches
`61660e5`. This does not establish package publication or manual accessibility
acceptance. The library remains pre-release.

Start Storybook from the sibling design-system checkout:

```sh
NG_BUILD_CACHE_STORE=sqlite NX_DAEMON=false npm exec -- nx run ui:storybook --ci --port=4400
```

Then capture from the portfolio root:

```sh
node scripts/project-demos/capture-design-system.mjs ../jp-design-system http://localhost:4400
npm run optimize:project-demos
```

The gallery mounts only the selected capture. Keyboard navigation and full-size
links support inspecting each view. November URLs include a capture version to
avoid reusing older screenshots. October provenance remains in the manifest.

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

## Plexarr — November 5, 2026

The carousel shows the current Library, personalized picks, and title details.
It displays **Current interface · sample library** beside the captures.
Images come from the actual v3.3.2 React interface in an isolated local checkout.
API fixtures provide sample account, library, recommendation, and preference data.
Poster artwork comes from the retained authentic October 15 capture.

No fresh passkey sign-in, live provider result, preference write, or media request
is claimed. All capture API calls are intercepted; unknown and external requests
are aborted. The source revision is `9c9c0e0`, whose runtime files match `316e20f`.
Those revisions differ only in five Markdown documents.

Public crops exclude Request navigation, actions, forms, and status messages.
The carousel supports arrows, direct selection, keyboard navigation, and swipes.
It does not rotate automatically, offer a Plexarr video, or mount inactive slides.

| Source                        | Dimensions |
| ----------------------------- | ---------- |
| `plexarr-current-library.png` | 1392 × 783 |
| `plexarr-current-picks.png`   | 878 × 364  |
| `plexarr-current-details.png` | 576 × 576  |

The capture helper requires an isolated current-source server on a non-production
loopback port. Start that validation checkout using its documented Next.js
workflow. Do not use the household production port or production credentials.
From the portfolio root, run:

```sh
node scripts/project-demos/capture-plexarr-demo.mjs /path/to/isolated/plex-request-app http://localhost:3183
npm run optimize:project-demos
```

The helper records provenance under ignored `output/playwright/plexarr-current/`.
Update the maintained manifest after intentionally replacing source images.
The older live recordings and crops remain historical source evidence.
They are not the current public demo. October provenance remains in the manifest.

## SQUARK — mountain scene refreshed November 5, 2026

`squark-mountain-flight.png` is the November 4 source-project gameplay capture.
It shows the connected mountain ranges in browser release `84cbd0b974f82efbc046`.
The runtime source revision is `22588e6`; the source record is at `8386ec3`.
PR #4 was observed merged during this review.

The existing anonymous public URL returned HTTP 200 on November 5.
Its HTML references that same mountain release. This repeated check covers the
hosted shell only. The retained source receipt records local browser courses
and provider deployment checks; it does not claim a hosted gameplay rerun.
Phone gameplay and GPU acceptance remain separate work.

The portfolio displays a lightweight image and opens the game in another tab.
It does not download or embed the engine before the visitor follows the action.
Regenerate its 640/800/1280px derivatives with `npm run optimize:project-demos`.

The original October `squark-gameplay.png`, `squark-browser-gameplay.webm`,
`squark-public-release.json`, and `squark-portfolio-production-acceptance.json`
remain archived source evidence. The raw video is not served by the portfolio.
The newer summarized receipt is `squark-mountain-release.json`.

## SideQuest: Pittsburgh — November 5, 2026

Three unmodified native screenshots show discovery, eleven regional guides,
and the Steel City collection. They were captured on the existing iPhone 15 Pro
simulator running iOS 27.2, at 1179 × 2556 pixels.
The gallery mounts only the selected image and offers full-size derivatives.

The reviewed source is `a4382f2` on `codex/add-bloomfield-benny`; PR #85 remains
open. The existing source-project installation receipt identifies `b41a6b6`.
This capture pass did not independently reverify the installed JavaScript bundle.
It demonstrates the observed simulator UI, not physical-device acceptance.

The app uses React Native, native SQLite, MapLibre, Fastify, and Postgres/PostGIS.
The welcome coin is implemented. Additional coin earning and current device,
offline recovery, performance, accessibility, and Android acceptance remain open.
The captures do not establish those gates or publish the app.

To refresh, use the source project's current simulator workflow. Navigate through
the app normally, preserve the user's guide and saved state, and capture with:

```sh
xcrun simctl io <booted-simulator-uuid> screenshot /tmp/sidequest-screen.png
```

Preserve the source PNG under `assets/source/project-demos/`, record the source
and installation scope, then run `npm run optimize:project-demos`.
Current derivative filenames include `20261105` to separate capture generations.
