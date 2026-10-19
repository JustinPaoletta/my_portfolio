# SQUARK browser demo

The portfolio introduces SQUARK under More Projects, preserving the featured order of the design system, BitStockerz, Wild Apricot, and Plexarr. A 61 KB real gameplay capture is shown beneath the browser-preview action. The card header has no icon. The game opens on its own origin; portfolio browsing loads no engine, pack, iframe, or game canvas. SQUARK replaces Godot Playground in the visual list and occupies CLI project 3. Both presentations share its description and public demo link.

[Play the public browser demo](https://squark-demo-justin-paolettas-projects.vercel.app). No account or Vercel sign-in is required. The portfolio keeps the **Preview In Browser** action. Desktop browsers are recommended; physical phone acceptance remains open.

## Public release

The owner approved anonymous publication on October 18, 2026. Production deployment `dpl_6jH7FniY2SCY9NPrKxjFnr7doTPE` serves reviewed release `6e6d40291ad12ce9831f` on the existing Hobby project.

Standard Vercel protection keeps preview and generated deployment URLs protected. The stable production domain above is public. The previous review URL remains protected.

The isolated upload contains only the receipt-listed static files. Explicit empty build/install commands prevent unrelated package installation. Game binaries, HTML, artwork, audio, and shell files remain unchanged.

Anonymous acceptance verified:

- HTTP 200 without redirects or credentials for all 11 public game files, with exact SHA-256 matches against the reviewed receipt.
- Correct WebAssembly MIME type, gzip encoding, immutable release caching, HTML revalidation, and the game-specific Content Security Policy.
- A fresh Chrome 155 session with zero cookies and no engine requests before Play.
- Successful startup, the normal flight countdown and keyboard input, running audio, and no page errors.
- Repeat startup without authentication. Repeat engine downloads still transferred the full files; browser-cache savings remain unverified.
- Six portfolio navigation checks across Chromium, Firefox, and WebKit at 320px and 1280px. These checks stub the destination; live game acceptance is recorded separately above.

Machine-readable HTTP and browser observations are in `assets/source/project-demos/squark-public-release.json`. Local screenshots are in `output/playwright/squark-public-release/`. This release check did not repeat full-course, physical-phone, or Edge acceptance.

## Game implementation

The game source lives in the adjacent `conure-flight` checkout. Its `BROWSER_DEMO_IMPLEMENTATION.md` and `web/README.md` record commands, evidence, remaining gates, and source preservation. The game checkout already had extensive native/art/rig edits; those changes were preserved and are not included in this portfolio PR.

The Godot 4.5.1 single-thread Compatibility export retains Jolt and the existing 60 Hz physics, flight, collision, collection, timer, pause, retry, and results logic. Isolated packaging resolves imported and dynamic dependencies, limits Web texture sizes, and derives compact raw geometry with verified identical positions, normals, and UVs. Original assets and native import settings remain intact.

The shell provides click-to-download, real or indeterminate progress, errors/retry, input choice, optional fullscreen, storage-denied session play, context-loss recovery, and safe-area-aware touch layout. Audio starts after a game gesture. Focus/visibility changes use the existing pause/input-clear path. The normal export excludes private diagnostics.

The final release artifact is release `6e6d40291ad12ce9831f`: **51,446,887 bytes / 49.06 MiB** core gzip transfer and **58,070,569 bytes** for the full static site, including an H.264 gameplay fallback. The unoptimized baseline was approximately 230 MiB gzip-equivalent. Receipts hash source/tool/template inputs and enforce a 50 MiB transfer and 100,000,000-byte upload gate.

## Acceptance evidence

- Twelve packaging/HTTP contracts and the isolated runtime pack audit pass; all 117 declared dependencies and 7 rings are present.
- Twelve relevant native regression fixtures pass; intro, mobile layout, and pause scrolling pass again after browser layout work.
- Installed Chrome completes the course, results tally, three fresh retries, real WebAudio starts, and the shell/recovery checks. Initial M4 flight measurements were p50 16.7 ms and p95 18.7 ms.
- Actual macOS Safari completes the course, reaches the perch/results, and retries after a crash. Automated WebKit remains a separate check.
- Playwright Firefox 148.0.2 passes all 13 checks on QA v4, including full-course and retry acceptance. Cold startup is slower, with an approximately 15-second preparation hitch. The final full-course report retains all active frames: p50 17 ms / p95 32 ms, with a 15,397 ms maximum during startup. This is not a worst-case frame guarantee.
- Automated WebKit passes all 13 browser checks. Final audio/course checks pass in Chrome and Firefox; final audio/retry checks pass in WebKit. Fullscreen with reachable exit controls and natural fallback-video completion pass in all three browser engines (six checks).
- Physical iPhone Safari, Android Chrome, and Microsoft Edge have not been accepted. An isolated vendor-verified Edge build could not render reliably under this Mac automation; it was not installed. Mobile support is not advertised.
- Browser ambience reuses immutable loop resources across attempts. Chrome backing-store growth over three retries fell from 20.7 MB to 0.9 MB; a 2 MiB regression guard now covers this counter. The native audio fixture passes after this change.
- Total browser/GPU peak memory is not established. The engine static counter is unavailable in this Web build; it is reported as unknown, never zero. Retained-memory sampling is separate from total process memory.

Protected HTTPS checks on the first preview confirm correct MIME types, gzip encoding, immutable versioned assets, revalidated HTML, scoped CSP, and pack bytes matching the exported SHA-256. The final preview passes hosted gameplay/audio smoke with no page errors and no engine requests before Play. Cold and repeat WASM/pack transfers were measured: the protected repeat load still transferred the full files despite immutable headers, so warm-cache savings remain unverified and must be checked anonymously at public launch. Previous immutable previews and local receipts remain available for rollback.

Vercel attempted to make the new project's first deployment production without a production flag. It was canceled before completion. Review deployments explicitly target preview. The approved public release explicitly targets production.

## Remaining release decisions

1. Complete physical iPhone/Android acceptance before claiming phone support. Check simultaneous steering/boost/action touches, browser chrome and safe areas, orientation, audio interruption, app switching, and the complete course/retries.
2. Run Microsoft Edge before adding it to the accepted browser matrix. Further Firefox startup tuning remains a useful improvement.
3. Investigate repeat engine transfers before claiming browser-cache savings.

The browser project stays on the existing Hobby plan. This publication requires no paid upgrade or custom-domain purchase. The portfolio link change follows its normal PR checks.
