import { act, renderHook, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type {
  ContributionCalendar,
  GitHubRepo,
  GitHubUser,
} from '@/types/github';

const fetchGitHubUserMock = vi.hoisted(() => vi.fn());
const fetchGitHubReposMock = vi.hoisted(() => vi.fn());
const fetchGitHubGraphQLDataMock = vi.hoisted(() => vi.fn());
const createPinnedFromReposMock = vi.hoisted(() => vi.fn());
const normalizeContributionCalendarMock = vi.hoisted(() => vi.fn());

vi.mock('@/services/github', () => ({
  fetchGitHubUser: fetchGitHubUserMock,
  fetchGitHubRepos: fetchGitHubReposMock,
  fetchGitHubGraphQLData: fetchGitHubGraphQLDataMock,
  createPinnedFromRepos: createPinnedFromReposMock,
}));

vi.mock('@/utils/contributions', () => ({
  normalizeContributionCalendar: normalizeContributionCalendarMock,
}));

import { useGitHub } from '@/hooks/useGitHub';

const mockUser: GitHubUser = {
  login: 'justin',
  id: 1,
  avatar_url: '',
  html_url: '',
  name: 'Justin',
  company: null,
  blog: '',
  location: null,
  email: null,
  bio: null,
  public_repos: 2,
  public_gists: 0,
  followers: 10,
  following: 1,
  created_at: '',
  updated_at: '',
};

const mockRepos: GitHubRepo[] = [
  {
    id: 10,
    name: 'repo-1',
    full_name: 'u/repo-1',
    html_url: '',
    description: null,
    fork: false,
    created_at: '',
    updated_at: '',
    pushed_at: '',
    homepage: null,
    stargazers_count: 5,
    watchers_count: 5,
    forks_count: 1,
    language: 'TypeScript',
    topics: [],
    default_branch: 'main',
  },
];

const contributions: ContributionCalendar = {
  totalContributions: 7,
  weeks: [{ contributionDays: [] }],
};

describe('useGitHub', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    normalizeContributionCalendarMock.mockImplementation((value) => value);
    fetchGitHubUserMock.mockResolvedValue(mockUser);
    fetchGitHubReposMock.mockResolvedValue(mockRepos);
    fetchGitHubGraphQLDataMock.mockResolvedValue({
      contributions,
      pinnedRepos: [],
    });
    createPinnedFromReposMock.mockReturnValue([
      {
        name: 'repo-1',
        description: null,
        url: 'https://example.com/repo-1',
        primaryLanguage: null,
        stargazerCount: 5,
        forkCount: 1,
      },
    ]);
  });

  it('hydrates from fresh cache and skips initial fetch', () => {
    localStorage.setItem(
      'github_stats_cache',
      JSON.stringify({
        version: 2,
        timestamp: Date.now(),
        data: {
          user: mockUser,
          repos: mockRepos,
          pinnedRepos: [],
          contributions,
          loading: false,
          error: null,
        },
      })
    );

    const { result } = renderHook(() => useGitHub());

    expect(result.current.loading).toBe(false);
    expect(result.current.user?.login).toBe('justin');
    expect(fetchGitHubUserMock).not.toHaveBeenCalled();
    expect(normalizeContributionCalendarMock).toHaveBeenCalled();
  });

  it('ignores malformed cache JSON and fetches fresh data', async () => {
    localStorage.setItem('github_stats_cache', '{bad-json');

    const { result } = renderHook(() => useGitHub());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(fetchGitHubUserMock).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBeNull();
  });

  it('removes expired cache and fetches new data', async () => {
    localStorage.setItem(
      'github_stats_cache',
      JSON.stringify({
        version: 2,
        timestamp: Date.now() - 1000 * 60 * 60 - 1,
        data: {
          user: mockUser,
          repos: mockRepos,
          pinnedRepos: [],
          contributions,
          loading: false,
          error: null,
        },
      })
    );

    renderHook(() => useGitHub());

    await waitFor(() => {
      expect(fetchGitHubUserMock).toHaveBeenCalled();
    });
    expect(localStorage.getItem('github_stats_cache')).toContain('"justin"');
  });

  it('uses GraphQL pinned repos when available', async () => {
    fetchGitHubGraphQLDataMock.mockResolvedValue({
      contributions,
      pinnedRepos: [
        {
          name: 'pinned',
          description: null,
          url: 'https://example.com/pinned',
          primaryLanguage: null,
          stargazerCount: 9,
          forkCount: 0,
        },
      ],
    });

    const { result } = renderHook(() => useGitHub());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.pinnedRepos[0]?.name).toBe('pinned');
    expect(createPinnedFromReposMock).not.toHaveBeenCalled();
  });

  it('preserves real public data without inventing or caching contributions during a proxy outage', async () => {
    fetchGitHubGraphQLDataMock.mockRejectedValue(new Error('no token'));

    const { result } = renderHook(() => useGitHub());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.repos).toEqual(mockRepos);
    expect(result.current.pinnedRepos[0]?.name).toBe('repo-1');
    expect(result.current.contributions).toBeNull();
    expect(normalizeContributionCalendarMock).not.toHaveBeenCalled();
    expect(createPinnedFromReposMock).toHaveBeenCalledWith(mockRepos);
    expect(result.current.error).toBeNull();
    expect(localStorage.getItem('github_stats_cache')).toBeNull();
  });

  it('discards a fresh legacy cache that could contain synthetic contributions', async () => {
    localStorage.setItem(
      'github_stats_cache',
      JSON.stringify({
        timestamp: Date.now(),
        data: {
          user: mockUser,
          repos: mockRepos,
          pinnedRepos: [],
          contributions: { totalContributions: 99999, weeks: [] },
          loading: false,
          error: null,
        },
      })
    );
    fetchGitHubGraphQLDataMock.mockRejectedValue(new Error('rate limited'));

    const { result } = renderHook(() => useGitHub());

    expect(result.current.loading).toBe(true);
    expect(result.current.contributions).toBeNull();
    expect(localStorage.getItem('github_stats_cache')).toBeNull();
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.contributions).toBeNull();
    expect(localStorage.getItem('github_stats_cache')).toBeNull();
  });

  it('keeps genuine zero contributions distinct from unavailable data', async () => {
    const zeroContributions: ContributionCalendar = {
      totalContributions: 0,
      weeks: [],
    };
    fetchGitHubGraphQLDataMock.mockResolvedValue({
      contributions: zeroContributions,
      pinnedRepos: [],
    });

    const { result } = renderHook(() => useGitHub());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.contributions).toEqual(zeroContributions);
    expect(localStorage.getItem('github_stats_cache')).toContain(
      '"totalContributions":0'
    );
    expect(localStorage.getItem('github_stats_cache')).toContain('"version":2');
  });

  it('sets error state when REST fetch fails', async () => {
    fetchGitHubUserMock.mockRejectedValue(new Error('REST unavailable'));

    const { result } = renderHook(() => useGitHub());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('REST unavailable');
    expect(result.current.user).toBeNull();
    expect(result.current.contributions).toBeNull();
    expect(localStorage.getItem('github_stats_cache')).toBeNull();
  });

  it('manual refetch bypasses a fresh cache and does not duplicate API requests', async () => {
    const { result } = renderHook(() => useGitHub());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    fetchGitHubUserMock.mockClear();
    fetchGitHubGraphQLDataMock.mockClear();
    fetchGitHubGraphQLDataMock.mockRejectedValue(new Error('unavailable'));

    await act(async () => {
      await result.current.refetch();
    });

    expect(fetchGitHubUserMock).toHaveBeenCalledTimes(1);
    expect(fetchGitHubGraphQLDataMock).toHaveBeenCalledTimes(1);
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.contributions).toBeNull();
    expect(localStorage.getItem('github_stats_cache')).toBeNull();
  });

  it('recovers on the next visit without waiting for a failed cache to expire', async () => {
    fetchGitHubGraphQLDataMock.mockRejectedValueOnce(new Error('unavailable'));
    const firstVisit = renderHook(() => useGitHub());
    await waitFor(() => expect(firstVisit.result.current.loading).toBe(false));
    firstVisit.unmount();

    const secondVisit = renderHook(() => useGitHub());
    await waitFor(() => expect(secondVisit.result.current.loading).toBe(false));

    expect(secondVisit.result.current.contributions).toEqual(contributions);
    expect(fetchGitHubGraphQLDataMock).toHaveBeenCalledTimes(2);
    expect(localStorage.getItem('github_stats_cache')).toContain('"version":2');
  });

  it('does not let an older in-flight result overwrite a later refresh', async () => {
    let resolveFirstRequest!: (data: {
      contributions: ContributionCalendar;
      pinnedRepos: [];
    }) => void;
    fetchGitHubGraphQLDataMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          resolveFirstRequest = resolve;
        })
    );
    const { result } = renderHook(() => useGitHub());
    await waitFor(() =>
      expect(fetchGitHubGraphQLDataMock).toHaveBeenCalledTimes(1)
    );
    fetchGitHubGraphQLDataMock.mockRejectedValueOnce(new Error('unavailable'));

    await act(async () => {
      await result.current.refetch();
      resolveFirstRequest({ contributions, pinnedRepos: [] });
    });

    expect(result.current.contributions).toBeNull();
    expect(result.current.user).toEqual(mockUser);
    expect(localStorage.getItem('github_stats_cache')).toBeNull();
  });
});
