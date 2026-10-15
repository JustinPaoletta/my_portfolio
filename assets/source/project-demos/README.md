# Project browser captures

Captured on 2026-10-15 at 1440 × 960 in Chrome. These are actual local interfaces,
not illustrative mockups. The manifest records source revisions and asset hashes.

## Design system

The running Storybook at port 4400 displayed
`compositions-app-shell-dashboard--dashboard` with `accent:gold`.
The capture shows the current navigation, metrics, chart, activity and insights.
It uses sample baseball content; the library remains pre-release.

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
from the PNG masters. The generator does not enlarge them. Review refreshed
captures before replacing these assets and update the manifest hashes.
