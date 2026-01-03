/**
 * GitHub API Types
 * Type definitions for GitHub API responses
 */

export interface GitHubUser {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  name: string | null;
  company: string | null;
  blog: string;
  location: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  public_gists: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  homepage: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string | null;
  topics: string[];
  default_branch: string;
}

export interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
  contributionLevel:
    | 'NONE'
    | 'FIRST_QUARTILE'
    | 'SECOND_QUARTILE'
    | 'THIRD_QUARTILE'
    | 'FOURTH_QUARTILE';
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface GitHubContributions {
  contributionCalendar: ContributionCalendar;
}

export interface PinnedRepository {
  name: string;
  description: string | null;
  url: string;
  primaryLanguage: {
    name: string;
    color: string;
  } | null;
  stargazerCount: number;
  forkCount: number;
}

export interface GitHubGraphQLResponse {
  data: {
    user: {
      pinnedItems: {
        nodes: PinnedRepository[];
      };
      contributionsCollection: GitHubContributions;
    };
  };
}

export interface GitHubStats {
  user: GitHubUser | null;
  repos: GitHubRepo[];
  pinnedRepos: PinnedRepository[];
  contributions: ContributionCalendar | null;
  loading: boolean;
  error: string | null;
}
