/**
 * useGitHub Hook
 * Fetches and caches GitHub data for the portfolio
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { GitHubStats } from '@/types/github';
import {
  fetchGitHubUser,
  fetchGitHubRepos,
  generateMockContributions,
  createPinnedFromRepos,
} from '@/services/github';

const CACHE_KEY = 'github_stats_cache';
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

interface CachedData {
  data: GitHubStats;
  timestamp: number;
}

function getCachedData(): GitHubStats | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const parsed = JSON.parse(cached) as CachedData;
    const isExpired = Date.now() - parsed.timestamp > CACHE_DURATION;

    if (isExpired) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

function setCachedData(data: GitHubStats): void {
  try {
    const cacheData: CachedData = {
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
  const hasFetched = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (): Promise<void> => {
    // Check cache first
    const cached = getCachedData();
    if (cached) {
      setStats({ ...cached, loading: false });
      return;
    }

    setStats((prev) => ({ ...prev, loading: true, error: null }));

    try {
      // Fetch user and repos in parallel
      const [user, repos] = await Promise.all([
        fetchGitHubUser(),
        fetchGitHubRepos(),
      ]);

      // Generate mock contributions (would need GraphQL API for real data)
      const contributions = generateMockContributions();

      // Create pinned repos from top starred repos
      const pinnedRepos = createPinnedFromRepos(repos);

      const newStats: GitHubStats = {
        user,
        repos,
        pinnedRepos,
        contributions,
        loading: false,
        error: null,
      };

      setStats(newStats);
      setCachedData(newStats);
    } catch (error) {
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
    // Only fetch if not already cached and not already fetched
    if (hasFetched.current) return;
    if (!stats.loading) return; // Already have cached data

    hasFetched.current = true;
    abortControllerRef.current = new AbortController();

    // Use queueMicrotask to defer fetchData call, avoiding synchronous
    // setState within the effect body (required by react-hooks/set-state-in-effect)
    queueMicrotask(() => {
      void fetchData();
    });

    return () => {
      abortControllerRef.current?.abort();
      // Reset hasFetched on cleanup so re-mounting can trigger fetch again
      // This handles React StrictMode double-mounting in development
      hasFetched.current = false;
    };
  }, [stats.loading, fetchData]);

  return { ...stats, refetch: fetchData };
}
