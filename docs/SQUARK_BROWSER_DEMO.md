# SQUARK browser demo

Reviewed November 5, 2026. The portfolio shows a lightweight gameplay capture
under Games and opens the game through **Preview In Browser**.
SQUARK is the only game in this section. SideQuest uses the main project layout.
The portfolio does not embed a canvas or request game-engine files before that action.

The [public browser demo](https://squark-demo-justin-paolettas-projects.vercel.app)
requires no account. Desktop browsers are recommended.
Physical-phone support remains in testing.

## Current mountain release

The source-project publication record identifies release `84cbd0b974f82efbc046`,
with runtime source `22588e6` and source documentation revision `8386ec3`.
PR #4 was observed merged during this review.
The record identifies existing production deployment
`dpl_5pPrmXW9o7teQPjER3NGtSomrGVk`.

A fresh anonymous HTTP check returned 200 on November 5.
Its HTML references that mountain release without an authentication redirect.
This repeated check covers the hosted shell, not hosted gameplay.

The current card uses `squark-mountain-flight-800.webp`.
Its source is the November 4 browser capture from the game checkout.
It shows the connected mountain ranges, river, rings, and native HUD.
The original PNG and release evidence are retained under
[`assets/source/project-demos/`](../assets/source/project-demos/README.md).

## Source-project acceptance scope

The retained release record reports 51 unique local browser cases across
Chromium, Firefox, and WebKit, including three completed courses.
It records 52 executions because one Firefox test-budget failure needed a rerun.
The normal production pack and private QA export have separate identities.
The record reports matching common source hashes and provider deployment checks.
It explicitly does not claim a hosted gameplay rerun.

The core release receipt records 48,198,679 gzip-equivalent bytes.
This is the source project's transfer-budget measurement, not a fresh hosted
cold-cache or repeat-download measurement from this portfolio update.

Physical iPhone installation, phone gameplay, GPU/memory/thermal measurements,
actual Safari acceptance for this revision, and advertised mobile-browser
acceptance remain separate work. Viewport emulation and automated WebKit do not
replace those sessions.

## Maintained implementation

Game source lives in the adjacent `conure-flight` repository.
Its `README.md`, `BROWSER_DEMO_IMPLEMENTATION.md`, `web/README.md`, and dated
publication receipts describe the current game, packaging, and release workflow.
The Godot browser export shares its flight, collision, collectibles, audio,
and results implementation with the native game.

The shell separates engine download from the initial page load.
The portfolio remains an image and external action; it performs no export,
deployment, catalog mutation, or account setup.

## Historical evidence

October's `squark-public-release.json` records anonymous HTTP and browser checks
for release `6e6d40291ad12ce9831f`. It is not the current game release.
`squark-portfolio-production-acceptance.json` records the earlier portfolio
link and Mode-label checks. The original PNG and raw WebM are archived sources.
They are not the current public card or a newly recorded video.

Local screenshots under ignored `output/playwright/squark-public-release/`
remain historical evidence. The maintained capture manifest records both the
November update and those older sources.
