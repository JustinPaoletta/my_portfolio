/**
 * Vercel Serverless Function: GitHub GraphQL API Proxy
 *
 * Fetches contribution data and pinned repositories from GitHub's GraphQL API.
 * The GITHUB_TOKEN is stored server-side and never exposed to the client.
 *
 * Endpoint: GET /api/github?username=<username>
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

const GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql';

/**
 * GraphQL query to fetch contribution calendar and pinned repositories
 */
const GITHUB_QUERY = `
  query($username: String!) {
    user(login: $username) {
      contributionsCollection {
        contributionCalendar {
          totalContributions
          weeks {
            contributionDays {
              contributionCount
              date
              color
              contributionLevel
            }
          }
        }
      }
      pinnedItems(first: 6, types: REPOSITORY) {
        nodes {
          ... on Repository {
            name
            description
            url
            primaryLanguage {
              name
              color
            }
            stargazerCount
            forkCount
          }
        }
      }
    }
  }
`;

interface ContributionDay {
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

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

interface PinnedRepository {
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

interface GitHubGraphQLResponse {
  data?: {
    user: {
      contributionsCollection: {
        contributionCalendar: ContributionCalendar;
      };
      pinnedItems: {
        nodes: PinnedRepository[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

export interface GitHubApiResponse {
  contributions: ContributionCalendar;
  pinnedRepos: PinnedRepository[];
}

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Only allow GET requests
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Get username from query params
  const { username } = req.query;
  if (!username || typeof username !== 'string') {
    res.status(400).json({ error: 'Username is required' });
    return;
  }

  // Check for GitHub token
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error('GITHUB_TOKEN environment variable is not set');
    res.status(500).json({ error: 'Server configuration error' });
    return;
  }

  try {
    const response = await fetch(GITHUB_GRAPHQL_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'Portfolio-App',
      },
      body: JSON.stringify({
        query: GITHUB_QUERY,
        variables: { username },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GitHub API error:', response.status, errorText);
      res.status(response.status).json({
        error: `GitHub API error: ${response.status}`,
      });
      return;
    }

    const data = (await response.json()) as GitHubGraphQLResponse;

    if (data.errors) {
      console.error('GraphQL errors:', data.errors);
      res.status(400).json({
        error: data.errors[0]?.message || 'GraphQL query error',
      });
      return;
    }

    if (!data.data?.user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const result: GitHubApiResponse = {
      contributions:
        data.data.user.contributionsCollection.contributionCalendar,
      pinnedRepos: data.data.user.pinnedItems.nodes,
    };

    // Cache the response for 1 hour
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching GitHub data:', error);
    res.status(500).json({ error: 'Failed to fetch GitHub data' });
  }
}
