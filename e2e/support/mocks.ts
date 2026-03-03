import type { Page, Route } from '@playwright/test';

interface DogStats {
  treats: number;
  scritches: number;
}

interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

interface PetDogsPostPayload {
  dogName: 'Nala' | 'Rosie' | 'Tito';
  action: 'treat' | 'scritch';
}

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

interface MockPortfolioApisOptions {
  githubRestError?: boolean;
  githubProxyError?: boolean;
  contactError?: boolean;
  petDogsStats?: Record<'Nala' | 'Rosie' | 'Tito', DogStats>;
  onContactRequest?: (payload: ContactPayload) => void;
  onPetDogsPost?: (payload: PetDogsPostPayload) => void;
}

const GITHUB_USER = {
  login: 'JustinPaoletta',
  id: 1,
  avatar_url: 'https://avatars.githubusercontent.com/u/1?v=4',
  html_url: 'https://github.com/JustinPaoletta',
  name: 'Justin Paoletta',
  company: null,
  blog: '',
  location: null,
  email: null,
  bio: null,
  public_repos: 42,
  public_gists: 0,
  followers: 23,
  following: 1,
  created_at: '2020-01-01T00:00:00Z',
  updated_at: '2026-03-01T00:00:00Z',
};

const GITHUB_REPOS = [
  {
    id: 101,
    name: 'my-portfolio',
    full_name: 'JustinPaoletta/my-portfolio',
    html_url: 'https://github.com/JustinPaoletta/my-portfolio',
    description: 'Portfolio app',
    fork: false,
    created_at: '2020-01-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    pushed_at: '2026-03-01T00:00:00Z',
    homepage: null,
    stargazers_count: 20,
    watchers_count: 20,
    forks_count: 4,
    language: 'TypeScript',
    topics: [],
    default_branch: 'main',
  },
  {
    id: 102,
    name: 'godot_practice',
    full_name: 'JustinPaoletta/godot_practice',
    html_url: 'https://github.com/JustinPaoletta/godot_practice',
    description: 'Godot experiments',
    fork: false,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2026-02-15T00:00:00Z',
    pushed_at: '2026-02-15T00:00:00Z',
    homepage: null,
    stargazers_count: 12,
    watchers_count: 12,
    forks_count: 1,
    language: 'GDScript',
    topics: [],
    default_branch: 'main',
  },
];

const DEFAULT_PET_DOG_STATS: Record<'Nala' | 'Rosie' | 'Tito', DogStats> = {
  Nala: { treats: 0, scritches: 0 },
  Rosie: { treats: 0, scritches: 0 },
  Tito: { treats: 0, scritches: 0 },
};

const CONTRIBUTION_LEVELS: ContributionDay['contributionLevel'][] = [
  'NONE',
  'FIRST_QUARTILE',
  'SECOND_QUARTILE',
  'THIRD_QUARTILE',
  'FOURTH_QUARTILE',
];

const CONTRIBUTION_COLORS = [
  '#161b22',
  '#0e4429',
  '#006d32',
  '#26a641',
  '#39d353',
];

function cloneDogStats(
  stats: Record<'Nala' | 'Rosie' | 'Tito', DogStats>
): Record<'Nala' | 'Rosie' | 'Tito', DogStats> {
  return {
    Nala: { ...stats.Nala },
    Rosie: { ...stats.Rosie },
    Tito: { ...stats.Tito },
  };
}

function buildContributionCalendar(weeks = 8): ContributionCalendar {
  const baseDate = new Date('2026-03-02T00:00:00Z');
  const resultWeeks: ContributionWeek[] = [];
  let totalContributions = 0;

  for (let weekIndex = 0; weekIndex < weeks; weekIndex += 1) {
    const contributionDays: ContributionDay[] = [];

    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      const date = new Date(baseDate);
      date.setUTCDate(
        baseDate.getUTCDate() - (weeks - weekIndex) * 7 + dayIndex
      );

      const contributionCount = (weekIndex + dayIndex) % 5;
      totalContributions += contributionCount;

      contributionDays.push({
        contributionCount,
        date: date.toISOString().split('T')[0],
        color: CONTRIBUTION_COLORS[contributionCount],
        contributionLevel: CONTRIBUTION_LEVELS[contributionCount],
      });
    }

    resultWeeks.push({ contributionDays });
  }

  return {
    totalContributions,
    weeks: resultWeeks,
  };
}

function json(route: Route, status: number, payload: unknown): Promise<void> {
  return route.fulfill({
    status,
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
}

export async function mockPortfolioApis(
  page: Page,
  options: MockPortfolioApisOptions = {}
): Promise<void> {
  const stats = cloneDogStats(options.petDogsStats ?? DEFAULT_PET_DOG_STATS);
  const contributions = buildContributionCalendar();

  await page.route('https://api.github.com/users/**', async (route) => {
    if (options.githubRestError) {
      await json(route, 500, { message: 'GitHub API unavailable' });
      return;
    }

    const requestUrl = route.request().url();
    if (requestUrl.includes('/repos')) {
      await json(route, 200, GITHUB_REPOS);
      return;
    }

    await json(route, 200, GITHUB_USER);
  });

  await page.route('**/api/github?**', async (route) => {
    if (options.githubProxyError) {
      await json(route, 500, { error: 'GitHub GraphQL proxy unavailable' });
      return;
    }

    await json(route, 200, {
      contributions,
      pinnedRepos: [
        {
          name: 'my-portfolio',
          description: 'Portfolio app',
          url: 'https://github.com/JustinPaoletta/my-portfolio',
          primaryLanguage: { name: 'TypeScript', color: '#3178c6' },
          stargazerCount: 20,
          forkCount: 4,
        },
      ],
    });
  });

  await page.route('**/api/pet-dogs', async (route) => {
    if (route.request().method() === 'GET') {
      await json(route, 200, { stats });
      return;
    }

    const payload = route.request().postDataJSON() as PetDogsPostPayload;
    options.onPetDogsPost?.(payload);

    const key = payload.action === 'treat' ? 'treats' : 'scritches';
    stats[payload.dogName][key] += 1;

    await json(route, 200, {
      success: true,
      stats: stats[payload.dogName],
    });
  });

  await page.route('**/api/contact', async (route) => {
    const payload = route.request().postDataJSON() as ContactPayload;
    options.onContactRequest?.(payload);

    if (options.contactError) {
      await json(route, 500, { error: 'Failed to send message' });
      return;
    }

    await json(route, 200, {
      success: true,
      message: 'Message sent successfully',
    });
  });
}
