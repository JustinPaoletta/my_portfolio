// Fictional responses for the actual Plexarr UI. No service request leaves Chrome.
import { URL } from 'node:url';

export async function installPlexarrDemo(page, origin) {
  const calls = [];
  const adds = [];
  const actor = { id: 'demo-user', username: 'demo', displayName: 'Demo User' };
  const titles = [
    ['Orbit Nine', 'Science Fiction', '#23364e', '#9ec7d8'],
    ['Glass Harbor', 'Mystery', '#164c52', '#cae0bd'],
    ['Signal Lost', 'Thriller', '#56242d', '#f5b57a'],
    ['Midnight Atlas', 'Adventure', '#342951', '#c9b6eb'],
    ['Paper Satellites', 'Drama', '#40534a', '#e8d9a2'],
    ['After the Tide', 'Drama', '#1e435c', '#9bd0d0'],
    ['Northbound', 'Adventure', '#4e4434', '#d9c69c'],
    ['Wild Light', 'Fantasy', '#4d3054', '#f0bbd8'],
  ];
  const records = titles.map(([title, genre, background, accent], index) => {
    const art = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="720" viewBox="0 0 480 720"><defs><linearGradient id="sky" x2="1" y2="1"><stop stop-color="${background}"/><stop offset="1" stop-color="#0c1018"/></linearGradient></defs><rect width="480" height="720" fill="url(#sky)"/><circle cx="310" cy="220" r="125" fill="${accent}" opacity=".7"/><circle cx="310" cy="220" r="100" fill="${background}"/><path d="M0 530 210 260 480 575V720H0Z" fill="#080d16"/><path d="m20 700 220-330 220 330" fill="none" stroke="${accent}" stroke-width="2" opacity=".65"/><text x="32" y="52" fill="${accent}" font-family="sans-serif" font-size="14" letter-spacing="5">FICTIONAL FILM</text><text x="32" y="610" fill="#f5f5ef" font-family="sans-serif" font-weight="700" font-size="34">${title.toUpperCase()}</text><text x="34" y="650" fill="${accent}" font-family="sans-serif" font-size="16" letter-spacing="4">${genre.toUpperCase()} · 2026</text></svg>`;
    return {
      source: 'tmdb',
      type: 'movie',
      tmdbId: 9001 + index,
      tvdbId: null,
      imdbId: null,
      title,
      originalTitle: title,
      year: 2026,
      releaseDate: '2026-10-01',
      overview: `${title} is a fictional ${genre.toLowerCase()} film used to demonstrate Plexarr. A small team follows an unexpected discovery and must decide what to do next.`,
      posterUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(art)}`,
      backdropUrl: null,
      originalLanguage: 'en',
      voteAverage: 7.8 + (index % 3) * 0.2,
      voteCount: 1200,
      popularity: 100 - index,
      genres: [genre],
      availability: {
        onPlex: false,
        plexMatches: [],
        onRequestService: false,
        requestService: null,
        existingItemId: null,
        existingItemUrl: null,
        existingItemTitle: null,
        matchedBy: null,
      },
    };
  });
  await page.context().addCookies([
    {
      name: 'plex_request_session',
      value: 'offline-demo-session',
      url: origin,
      httpOnly: true,
      sameSite: 'Strict',
      secure: false,
    },
  ]);
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin !== origin) {
      if (url.protocol === 'data:') return route.continue();
      calls.push({ blocked: url.origin + url.pathname });
      return route.abort();
    }
    if (!url.pathname.startsWith('/api/')) return route.continue();
    calls.push({ method: request.method(), path: url.pathname });
    const json = (body, status = 200) =>
      route.fulfill({
        status,
        contentType: 'application/json',
        body: JSON.stringify(body),
      });
    switch (url.pathname) {
      case '/api/me':
        return json({
          authenticated: true,
          user: actor,
          session: {
            id: 'demo-session',
            expiresAt: '2030-01-01T00:00:00.000Z',
            lastSeenAt: '2026-10-15T12:00:00.000Z',
          },
        });
      case '/api/auth/login-users':
        return json({ users: [] });
      case '/api/health/servarr':
        return json({
          status: 'ok',
          checkedAt: '2026-10-15T12:00:00.000Z',
          services: [],
        });
      case '/api/recommendations/preferences':
        return json(
          request.method() === 'POST' ? { ok: true } : { preferences: [] }
        );
      case '/api/recommendations/events':
        return json({ ok: true });
      case '/api/recommendations':
        return json({
          type: 'movie',
          results: records.slice(0, 3).map((record, index) => ({
            ...record,
            recommendation: {
              rank: index + 1,
              score: 0.88,
              reason: 'Because you like science fiction and adventure',
              source: 'model',
              modelVersion: 'demo-fixture',
            },
          })),
          metadata: {
            mode: 'personalized',
            modelVersion: 'demo-fixture',
            generatedAt: '2026-10-15T12:00:00.000Z',
            candidateCount: 8,
            fallbackReason: null,
          },
        });
      case '/api/discovery':
        return json({
          groups: [],
          results: records,
          filters: { categoryKeys: [], sort: 'popularity:desc' },
          pagination: {
            page: 1,
            pageSize: 200,
            totalResults: records.length,
            totalPages: 1,
            hasMore: false,
            pagesPerRequest: 10,
          },
        });
      case '/api/discovery/trailer':
        return json({ youtubeVideoId: null });
      case '/api/discovery/enrich':
        return json({ record: request.postDataJSON().record });
      case '/api/quality-profiles':
        return json({
          type: 'movie',
          service: 'radarr',
          options: [
            { id: 7, label: 'HD-1080p' },
            { id: 11, label: 'Ultra-HD' },
          ],
          defaultOption: { id: 7, label: 'HD-1080p' },
        });
      case '/api/search': {
        const query = url.searchParams.get('q') ?? '';
        const results = records.filter((record) =>
          record.title.toLowerCase().includes(query.toLowerCase())
        );
        return json({
          query,
          type: 'movie',
          results,
          resultCount: results.length,
          pagination: {
            page: 1,
            totalPages: 1,
            totalResults: results.length,
            hasMore: false,
          },
        });
      }
      case '/api/add': {
        const payload = request.postDataJSON();
        adds.push(payload);
        return json({
          ok: true,
          type: 'movie',
          service: 'radarr',
          item: { id: 101, title: 'Glass Harbor', year: 2026, tmdbId: 9002 },
          search: { requested: true, mode: 'immediate' },
        });
      }
      case '/api/activity':
        return json({
          entries: adds.map((_, index) => ({
            id: `demo-activity-${index}`,
            actor,
            action: 'add',
            target: {
              type: 'movie',
              service: 'radarr',
              title: 'Glass Harbor',
              itemId: 101,
              canonicalId: 9002,
            },
            status: 'success',
            progress: { state: 'added', updatedAt: '2026-10-15T12:00:00.000Z' },
            createdAt: '2026-10-15T12:00:00.000Z',
          })),
          pagination: {
            offset: 0,
            limit: 20,
            total: adds.length,
            hasMore: false,
          },
        });
      default:
        return json({ error: 'No fixture for this route.' }, 501);
    }
  });
  await page.exposeFunction('readPortfolioDemoEvidence', () => ({
    calls,
    adds,
    titles: titles.map(([title]) => title),
  }));
}
