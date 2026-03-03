import { beforeEach, describe, expect, it, vi } from 'vitest';

const envMock = vi.hoisted(() => ({
  github: {
    username: 'test-user',
    apiEnabled: true,
  },
}));

vi.mock('@/config/env', () => ({
  env: envMock,
}));

import {
  fetchGitHubUser,
  fetchGitHubRepos,
  fetchGitHubGraphQLData,
  generateMockContributions,
  createPinnedFromRepos,
} from './github';
import type { GitHubRepo } from '@/types/github';

describe('github service', () => {
  beforeEach(() => {
    envMock.github.apiEnabled = true;
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('fetchGitHubUser returns parsed user payload', async () => {
    const user = { login: 'test-user', public_repos: 2 };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(user), { status: 200 }))
    );

    const result = await fetchGitHubUser();

    expect(result).toMatchObject(user);
    expect(fetch).toHaveBeenCalledWith(
      'https://api.github.com/users/test-user',
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/vnd.github+json',
        }),
      })
    );
  });

  it('fetchGitHubUser throws with status info when request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('nope', {
          status: 503,
          statusText: 'Service Unavailable',
        })
      )
    );

    await expect(fetchGitHubUser()).rejects.toThrow(
      'Failed to fetch GitHub user: 503 Service Unavailable'
    );
  });

  it('fetchGitHubRepos filters forks and sorts by stars descending', async () => {
    const repos: GitHubRepo[] = [
      {
        id: 1,
        name: 'forked-repo',
        full_name: 'test/forked-repo',
        html_url: 'https://example.com/forked',
        description: null,
        fork: true,
        created_at: '',
        updated_at: '',
        pushed_at: '',
        homepage: null,
        stargazers_count: 999,
        watchers_count: 999,
        forks_count: 1,
        language: 'TypeScript',
        topics: [],
        default_branch: 'main',
      },
      {
        id: 2,
        name: 'repo-b',
        full_name: 'test/repo-b',
        html_url: 'https://example.com/repo-b',
        description: null,
        fork: false,
        created_at: '',
        updated_at: '',
        pushed_at: '',
        homepage: null,
        stargazers_count: 5,
        watchers_count: 5,
        forks_count: 0,
        language: 'JavaScript',
        topics: [],
        default_branch: 'main',
      },
      {
        id: 3,
        name: 'repo-a',
        full_name: 'test/repo-a',
        html_url: 'https://example.com/repo-a',
        description: null,
        fork: false,
        created_at: '',
        updated_at: '',
        pushed_at: '',
        homepage: null,
        stargazers_count: 42,
        watchers_count: 42,
        forks_count: 2,
        language: 'TypeScript',
        topics: [],
        default_branch: 'main',
      },
    ];

    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(new Response(JSON.stringify(repos), { status: 200 }))
    );

    const result = await fetchGitHubRepos();

    expect(result.map((repo) => repo.name)).toEqual(['repo-a', 'repo-b']);
  });

  it('fetchGitHubRepos throws when request fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response('fail', { status: 401, statusText: 'Unauthorized' })
        )
    );

    await expect(fetchGitHubRepos()).rejects.toThrow(
      'Failed to fetch GitHub repos: 401 Unauthorized'
    );
  });

  it('fetchGitHubGraphQLData throws immediately when API proxy is disabled', async () => {
    envMock.github.apiEnabled = false;
    vi.stubGlobal('fetch', vi.fn());

    await expect(fetchGitHubGraphQLData()).rejects.toThrow(
      'GitHub API proxy not available (VITE_GITHUB_API_ENABLED=false)'
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it('fetchGitHubGraphQLData returns parsed data when request succeeds', async () => {
    const payload = {
      contributions: { totalContributions: 1, weeks: [] },
      pinnedRepos: [],
    };
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify(payload), { status: 200 })
        )
    );

    const result = await fetchGitHubGraphQLData();

    expect(fetch).toHaveBeenCalledWith('/api/github?username=test-user');
    expect(result).toEqual(payload);
  });

  it('fetchGitHubGraphQLData throws API error payload when available', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: 'rate limited' }), {
          status: 429,
        })
      )
    );

    await expect(fetchGitHubGraphQLData()).rejects.toThrow('rate limited');
  });

  it('fetchGitHubGraphQLData falls back to status text when error body is invalid JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response('plain text', {
          status: 500,
          statusText: 'Server Error',
        })
      )
    );

    await expect(fetchGitHubGraphQLData()).rejects.toThrow(
      'Failed to fetch GitHub data: 500 Server Error'
    );
  });

  it('generateMockContributions creates one year of valid week/day data', () => {
    const randomSpy = vi.spyOn(Math, 'random').mockReturnValue(0.1);

    const calendar = generateMockContributions();

    expect(randomSpy).toHaveBeenCalled();
    expect(calendar.weeks).toHaveLength(52);
    expect(
      calendar.weeks.every((week) => week.contributionDays.length === 7)
    ).toBe(true);
    expect(calendar.totalContributions).toBeGreaterThan(0);
  });

  it('createPinnedFromRepos maps top six repos and assigns language colors', () => {
    const repos: GitHubRepo[] = Array.from({ length: 7 }, (_, index) => ({
      id: index + 1,
      name: `repo-${index + 1}`,
      full_name: `test/repo-${index + 1}`,
      html_url: `https://example.com/repo-${index + 1}`,
      description: `Repo ${index + 1}`,
      fork: false,
      created_at: '',
      updated_at: '',
      pushed_at: '',
      homepage: null,
      stargazers_count: index + 1,
      watchers_count: index + 1,
      forks_count: index,
      language: index === 0 ? 'TypeScript' : index === 1 ? null : 'UnknownLang',
      topics: [],
      default_branch: 'main',
    }));

    const pinned = createPinnedFromRepos(repos);

    expect(pinned).toHaveLength(6);
    expect(pinned[0].primaryLanguage).toEqual({
      name: 'TypeScript',
      color: '#3178c6',
    });
    expect(pinned[1].primaryLanguage).toBeNull();
    expect(pinned[2].primaryLanguage).toEqual({
      name: 'UnknownLang',
      color: '#8b949e',
    });
  });
});
