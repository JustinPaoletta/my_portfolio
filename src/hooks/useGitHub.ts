/**
 * useGitHub Hook
 * Fetches and caches GitHub data for the portfolio
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  ContributionCalendar,
  GitHubStats,
  PinnedRepository,
} from '@/types/github';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  fetchGitHubGraphQLData,
  createPinnedFromRepos,
} from '@/services/github';
import { normalizeContributionCalendar } from '@/utils/contributions';

const CACHE_KEY = 'github_stats_cache';
const CACHE_VERSION = 2;
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedData {
  version: typeof CACHE_VERSION;
  data: GitHubStats;
  timestamp: number;
}

function getCachedData(): GitHubStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as CachedData | null;
    // Unversioned entries may contain the old synthetic contribution fallback.
    if (
      parsed?.version !== CACHE_VERSION ||
      !Number.isFinite(parsed.timestamp) ||
      Date.now() - parsed.timestamp > CACHE_DURATION ||
      !parsed.data.user ||
      !parsed.data.contributions ||
      parsed.data.error !== null
    ) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return {
      ...parsed.data,
      contributions: normalizeContributionCalendar(parsed.data.contributions),
    };
  } catch {
    return null;
  }
}

function setCachedData(data: GitHubStats): void {
  try {
    const cacheData: CachedData = {
      version: CACHE_VERSION,
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
  } catch {
    // Ignore storage errors
  }
}

function getInitialState(): GitHubStats {
  // Check cache on initial load (synchronous)
  const cached = getCachedData();
  if (cached) {
    return { ...cached, loading: false };
  }
  return {
    user: null,
    repos: [],
    pinnedRepos: [],
    contributions: null,
    loading: true,
    error: null,
  };
}

export function useGitHub(): GitHubStats & { refetch: () => Promise<void> } {
  const [stats, setStats] = useState<GitHubStats>(getInitialState);
  const needsInitialFetch = useRef(stats.loading);
  const requestIdRef = useRef(0);

  const fetchData = useCallback(async (): Promise<void> => {
    const requestId = ++requestIdRef.current;
    // A manual refresh must reach the API and must not leave a failed result
    // masked by an older cache entry on the next visit.
    try {
      localStorage.removeItem(CACHE_KEY);
    } catch {
      // Continue fetching when browser storage is unavailable.
    }

    setStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch user and repos from REST API (public, no auth needed)
      const [user, repos] = await Promise.all([
        fetchGitHubUser(),
        fetchGitHubRepos(),
      ]);

      let contributions: ContributionCalendar | null = null;
      let pinnedRepos: PinnedRepository[];

      try {
        const graphqlData = await fetchGitHubGraphQLData();
        contributions = graphqlData.contributions;
        // Use real pinned repos if available, otherwise fall back to top starred
        pinnedRepos =
          graphqlData.pinnedRepos.length > 0
            ? graphqlData.pinnedRepos
            : createPinnedFromRepos(repos);
      } catch (graphqlError) {
        contributions = null;
        if (import.meta.env.DEV) {
          console.warn(
            '[GitHub] Contribution data unavailable; retaining public profile and repos:',
            graphqlError
          );
        }
        pinnedRepos = createPinnedFromRepos(repos);
      }

      const normalizedContributions = contributions
        ? normalizeContributionCalendar(contributions)
        : null;

      const newStats: GitHubStats = {
        user,
        repos,
        pinnedRepos,
        contributions: normalizedContributions,
        loading: false,
        error: null,
      };

      if (requestId !== requestIdRef.current) return;

      setStats(newStats);
      // Do not cache an outage for an hour. A new visit can retry immediately.
      if (normalizedContributions) {
        setCachedData(newStats);
      }
    } catch (error) {
      if (requestId !== requestIdRef.current) return;

      const message =
        error instanceof Error ? error.message : 'Failed to fetch GitHub data';
      setStats((prev) => ({
        ...prev,
        loading: false,
        error: message,
      }));
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    // Use queueMicrotask to defer fetchData call, avoiding synchronous
    // setState within the effect body (required by react-hooks/set-state-in-effect)
    queueMicrotask(() => {
      if (!cancelled && needsInitialFetch.current) {
        void fetchData();
      }
    });

    return () => {
      cancelled = true;
      requestIdRef.current += 1;
    };
  }, [fetchData]);

  return { ...stats, refetch: fetchData };
}
