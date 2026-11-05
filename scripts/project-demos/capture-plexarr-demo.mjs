#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, URL } from 'node:url';
import process from 'node:process';
import { Buffer } from 'node:buffer';
import sharp from 'sharp';

const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..'
);
const source = path.resolve(process.argv[2] ?? '../plex-request-app');
const base = new URL(process.argv[3] ?? 'http://localhost:3183');
if (
  !['localhost', '127.0.0.1'].includes(base.hostname) ||
  base.port === '3000'
) {
  throw new Error(
    'Use an isolated local Plexarr checkout and a non-production port.'
  );
}
const cli =
  process.env.PLAYWRIGHT_CLI ??
  path.join(
    process.env.HOME,
    '.codex/skills/playwright/scripts/playwright_cli.sh'
  );
const scratch = path.join(root, 'output/playwright/plexarr-current');
const out = path.join(root, 'assets/source/project-demos');
await mkdir(scratch, { recursive: true });
const git = (...args) =>
  execFileSync('git', ['-C', source, ...args], { encoding: 'utf8' }).trim();
const sourceRevision = git('rev-parse', 'HEAD');
const sourceStatus = git('status', '--porcelain');
const oldCapture = await readFile(path.join(out, 'plexarr-live-discover.png'));
const titles = [
  'Resident Evil',
  'Insidious: Out of the Further',
  'Matchbox the Movie',
  'The Odyssey',
  'Fall 2: Deadpoint',
  'Animals',
];
const genres = [
  'Horror',
  'Horror',
  'Action',
  'Adventure',
  'Thriller',
  'Thriller',
];
const posters = await Promise.all(
  [19, 255, 492, 729, 966, 1203].map(async (left) =>
    (
      await sharp(oldCapture)
        .extract({ left, top: 272, width: 219, height: 322 })
        .png()
        .toBuffer()
    ).toString('base64')
  )
);
const settings = { base: base.origin, out, titles, genres, posters };
const capture = async (page, settings) => {
  const { base, out, titles, genres, posters } = settings;
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const availability = {
    onPlex: false,
    plexMatches: [],
    onRequestService: false,
    requestService: null,
    existingItemId: null,
    existingItemUrl: null,
    existingItemTitle: null,
    matchedBy: null,
  };
  const records = titles.map((title, index) => ({
    source: 'tmdb',
    type: 'movie',
    tmdbId: 900001 + index,
    tvdbId: null,
    imdbId: null,
    title,
    originalTitle: title,
    year: 2026,
    releaseDate: '2026-01-01',
    originalLanguage: 'en',
    overview:
      'Sample catalog entry for the portfolio demonstration. Browse title information, explore similar genres, and save favorites for your next watch.',
    posterUrl: `data:image/png;base64,${posters[index]}`,
    backdropUrl: null,
    voteAverage: 7 + index / 10,
    voteCount: 1000,
    popularity: 100 - index,
    genres: [genres[index]],
    availability,
  }));
  const library = records
    .map((item, index) => ({
      source: 'plex',
      type: 'movie',
      ratingKey: `sample-${index}`,
      key: `/library/metadata/sample-${index}`,
      title: item.title,
      year: item.year,
      overview: item.overview,
      genres: item.genres,
      posterPath: `/sample-poster-${index}`,
      artPath: null,
      contentRating: 'Sample',
      studio: 'Sample library',
      addedAt: '2026-11-05T12:00:00.000Z',
      identifiers: { tmdbId: item.tmdbId, tvdbId: null, imdbId: null },
      librarySection: {
        key: 'sample-movies',
        title: 'Sample Movies',
        type: 'movie',
      },
    }))
    .sort((a, b) => a.title.localeCompare(b.title));
  const recommendations = records.map((item, index) => ({
    ...item,
    recommendation: {
      rank: index + 1,
      score: 0.88 - index / 20,
      reason: `Because you enjoy ${genres[index]} favorites`,
      source: 'baseline',
      modelVersion: null,
    },
  }));
  await page.context().addCookies([
    {
      name: 'plex_request_session',
      value: 'isolated-portfolio-fixture',
      url: base,
      httpOnly: true,
      sameSite: 'Strict',
    },
  ]);
  const unexpected = [];
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== base) {
      unexpected.push(`${request.method()} external ${url.hostname}`);
      return route.abort();
    }
    const json = (body) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    if (url.pathname === '/api/me')
      return json({
        authenticated: true,
        user: { id: 'sample-user', username: 'demo', displayName: 'Demo' },
        session: {
          id: 'sample-session',
          expiresAt: '2030-01-01T00:00:00Z',
          lastSeenAt: '2026-11-05T12:00:00Z',
        },
      });
    if (url.pathname === '/api/recommendations/preferences')
      return json(
        request.method() === 'POST' ? { ok: true } : { preferences: [] }
      );
    if (url.pathname === '/api/recommendations/events')
      return json({ ok: true });
    if (url.pathname === '/api/activity')
      return json({
        entries: [],
        pagination: { offset: 0, limit: 20, total: 0, hasMore: false },
      });
    if (url.pathname === '/api/health/servarr')
      return json({
        status: 'ok',
        checkedAt: '2026-11-05T12:00:00Z',
        services: [],
      });
    if (url.pathname === '/api/available-media/poster') {
      const index = Number(
        (url.searchParams.get('path') ?? '').split('-').at(-1)
      );
      return route.fulfill({
        status: 200,
        contentType: 'image/png',
        body: Buffer.from(posters[index], 'base64'),
      });
    }
    if (url.pathname === '/api/available-media') {
      const q = (url.searchParams.get('q') ?? '').toLowerCase();
      const results = library.filter((item) =>
        item.title.toLowerCase().includes(q)
      );
      return json({
        sections: [
          {
            source: 'plex',
            key: 'sample-movies',
            title: 'Sample Movies',
            type: 'movie',
          },
        ],
        results,
        pagination: {
          offset: 0,
          limit: 200,
          total: results.length,
          hasMore: false,
        },
      });
    }
    if (url.pathname === '/api/discovery')
      return json({
        groups: [],
        results: records,
        filters: { categoryKeys: [], sort: 'popularity:desc' },
        pagination: {
          page: 1,
          pageSize: 200,
          totalResults: 6,
          totalPages: 1,
          hasMore: false,
        },
      });
    if (url.pathname === '/api/recommendations')
      return json({
        type: 'movie',
        results: recommendations,
        metadata: {
          mode: 'baseline',
          generatedAt: '2026-11-05T12:00:00Z',
          candidateCount: 6,
          fallbackReason: 'Sample data',
        },
      });
    if (url.pathname === '/api/discovery/trailer')
      return json({ youtubeVideoId: null });
    if (url.pathname === '/api/discovery/enrich')
      return json({ record: request.postDataJSON().record });
    if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/')) {
      unexpected.push(`${request.method()} ${url.pathname}`);
      return route.abort();
    }
    return route.continue();
  });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.emulateMedia({ colorScheme: 'dark', reducedMotion: 'reduce' });
  await page.goto(`${base}/?view=available`, { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page
    .getByRole('heading', { name: 'Resident Evil (2026)', exact: true })
    .waitFor();
  const imagesReady = () =>
    page
      .locator('.browse-panel:visible img')
      .evaluateAll((images) =>
        images.every((image) => image.complete && image.naturalWidth > 0)
      );
  await page.waitForFunction(() =>
    [
      ...globalThis.document.querySelectorAll(
        '.browse-panel:not([hidden]) img'
      ),
    ].every((image) => image.complete && image.naturalWidth > 0)
  );
  if (!(await imagesReady()))
    throw new Error('Library artwork did not finish loading.');
  const panel = page.locator('.browse-panel:visible');
  await panel.screenshot({
    path: `${out}/plexarr-current-library.png`,
    animations: 'disabled',
  });
  await page
    .getByRole('button', {
      name: 'View details for The Odyssey (2026)',
      exact: true,
    })
    .click();
  await page.getByTestId('available-media-detail').screenshot({
    path: `${out}/plexarr-current-details.png`,
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 960, height: 900 });
  await page.getByRole('button', { name: 'Discover', exact: true }).click();
  const rail = page.getByTestId('recommendation-rail');
  await rail
    .getByRole('heading', { name: 'Resident Evil (2026)', exact: true })
    .waitFor();
  await rail.locator('img').evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode()));
  });
  await rail.screenshot({
    path: `${out}/plexarr-current-picks.png`,
    animations: 'disabled',
  });
  if (unexpected.length || errors.length)
    throw new Error(JSON.stringify({ unexpected, errors }));
};
const codePath = path.join(scratch, 'capture.js');
await writeFile(
  codePath,
  `async (page) => { const capture = ${capture.toString()}; await capture(page, ${JSON.stringify(settings)}); }\n`
);
execFileSync(
  cli,
  [
    '--session',
    'plexarr-portfolio',
    'open',
    base.origin,
    '--browser',
    'chrome',
  ],
  { cwd: root, stdio: 'inherit' }
);
const captureLog = execFileSync(
  cli,
  ['--session', 'plexarr-portfolio', 'run-code', '--filename', codePath],
  { cwd: root, encoding: 'utf8', maxBuffer: 8 * 1024 * 1024 }
);
await writeFile(path.join(scratch, 'capture.log'), captureLog);
if (captureLog.includes('### Error'))
  throw new Error(
    captureLog.slice(
      captureLog.indexOf('### Error'),
      captureLog.indexOf('### Error') + 1500
    )
  );
const captures = [];
for (const name of ['library', 'picks', 'details']) {
  const filename = `plexarr-current-${name}.png`;
  const bytes = await readFile(path.join(out, filename));
  const { width, height } = await sharp(bytes).metadata();
  const widths = [...new Set([320, 480, 640, 960, 1440, width])].filter(
    (value) => value <= width
  );
  for (const variant of widths) {
    await sharp(bytes)
      .resize({ width: variant, withoutEnlargement: true })
      .webp({ quality: 90, effort: 6 })
      .toFile(
        path.join(
          root,
          `public/images/projects/plexarr-current-${name}-${variant}.webp`
        )
      );
  }
  captures.push({
    file: filename,
    width,
    height,
    sha256: createHash('sha256').update(bytes).digest('hex'),
    responsiveWidths: widths,
  });
}
await writeFile(
  path.join(scratch, 'provenance.json'),
  `${JSON.stringify({ captured: '2026-11-05', sourceRevision, sourceStatus, mode: 'Current Plexarr interface with isolated sample library/API fixtures. No real authentication, provider calls, preference writes or media requests. Poster artwork cropped from the retained authentic October 15 capture.', sourceCapture: 'plexarr-live-discover.png', posterSourceSha256: createHash('sha256').update(oldCapture).digest('hex'), captures }, null, 2)}\n`
);
