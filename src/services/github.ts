/**
 * GitHub API Service
 * Fetches user data, repos, and contribution data from GitHub
 */

import { env } from '@/config/env';
import type {
  GitHubUser,
  GitHubRepo,
  PinnedRepository,
  ContributionCalendar,
} from '@/types/github';

const GITHUB_API_BASE = 'https://api.github.com';

/** Response type from our serverless API */
interface GitHubApiResponse {
  contributions: ContributionCalendar;
  pinnedRepos: PinnedRepository[];
}

/**
 * Fetch GitHub user profile
 */
export async function fetchGitHubUser(): Promise<GitHubUser> {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${env.github.username}`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub user: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<GitHubUser>;
}

/**
 * Fetch user's public repositories sorted by stars
 */
export async function fetchGitHubRepos(): Promise<GitHubRepo[]> {
  const response = await fetch(
    `${GITHUB_API_BASE}/users/${env.github.username}/repos?sort=stars&per_page=100`,
    {
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `Failed to fetch GitHub repos: ${response.status} ${response.statusText}`
    );
  }

  const repos = (await response.json()) as GitHubRepo[];

  // Filter out forks and sort by stars
  return repos
    .filter((repo) => !repo.fork)
    .sort((a, b) => b.stargazers_count - a.stargazers_count);
}

/**
 * Fetch GitHub data from our serverless API proxy
 * This fetches real contribution data and pinned repos via the GraphQL API
 *
 * Note: The API proxy only works on Vercel (serverless functions).
 * In local dev or Lighthouse CI (static server), this will throw immediately
 * to avoid browser console 404 errors.
 */
export async function fetchGitHubGraphQLData(): Promise<GitHubApiResponse> {
  // Skip API call if proxy is not available (CI, local dev)
  // This prevents browser console 404 errors during Lighthouse CI testing
  if (!env.github.apiEnabled) {
    throw new Error(
      'GitHub API proxy not available (VITE_GITHUB_API_ENABLED=false)'
    );
  }

  const response = await fetch(`/api/github?username=${env.github.username}`);

  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({}))) as {
      error?: string;
    };
    throw new Error(
      errorData.error ||
        `Failed to fetch GitHub data: ${response.status} ${response.statusText}`
    );
  }

  return response.json() as Promise<GitHubApiResponse>;
}

/**
 * Create pinned repos from top starred repos
 * Since pinned repos require GraphQL API with auth, we use top starred as fallback
 */
export function createPinnedFromRepos(repos: GitHubRepo[]): PinnedRepository[] {
  // Get top 6 repos by stars
  const topRepos = repos.slice(0, 6);

  return topRepos.map((repo) => ({
    name: repo.name,
    description: repo.description,
    url: repo.html_url,
    primaryLanguage: repo.language
      ? {
          name: repo.language,
          color: getLanguageColor(repo.language),
        }
      : null,
    stargazerCount: repo.stargazers_count,
    forkCount: repo.forks_count,
  }));
}

/**
 * Get color for programming language
 */
function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    TypeScript: '#3178c6',
    JavaScript: '#f1e05a',
    Python: '#3572A5',
    Rust: '#dea584',
    Go: '#00ADD8',
    Java: '#b07219',
    'C++': '#f34b7d',
    C: '#555555',
    'C#': '#178600',
    Ruby: '#701516',
    PHP: '#4F5D95',
    Swift: '#F05138',
    Kotlin: '#A97BFF',
    Dart: '#00B4AB',
    Shell: '#89e051',
    HTML: '#e34c26',
    CSS: '#563d7c',
    SCSS: '#c6538c',
    Vue: '#41b883',
    Svelte: '#ff3e00',
  };

  return colors[language] || '#8b949e';
}
