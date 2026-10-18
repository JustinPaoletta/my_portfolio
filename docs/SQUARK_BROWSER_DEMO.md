# SQUARK browser demo review

The portfolio introduces SQUARK under More Projects, preserving the featured order of the design system, BitStockerz, Wild Apricot, and Plexarr. A 61 KB real gameplay capture is shown beneath the browser-preview action. The card header has no icon. The game opens on its own origin; portfolio browsing loads no engine, pack, iframe, or game canvas. SQUARK replaces Godot Playground in the visual list and occupies CLI project 3. Both presentations share its description and review link.

[Review the separate game preview](https://squark-demo-mztzrjrps-justin-paolettas-projects.vercel.app). Vercel sign-in is currently required. The portfolio explicitly says **Preview In Browser** and explains this access requirement. This is not yet an anonymous public demo.

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

Vercel attempted to make the new project's first deployment production without a production flag. It was canceled before completion. Subsequent review deployments explicitly target preview; future deploy commands must include `--target preview`.

## Remaining release decisions

1. Review the game preview and approve an anonymous public launch separately. Keep preview protection intact during review. After public launch, replace `SQUARK_PROJECT.liveUrl` with the verified public URL and remove the sign-in sentence.
2. Complete physical iPhone/Android acceptance before claiming phone support. Check simultaneous steering/boost/action touches, browser chrome and safe areas, orientation, audio interruption, app switching, and the complete course/retries.
3. Run Microsoft Edge before adding it to the accepted browser matrix. Further Firefox startup tuning remains a useful improvement.

The browser project stays on the existing Hobby plan. No paid upgrade, custom-domain purchase, portfolio production deployment, or PR merge is part of this implementation.
