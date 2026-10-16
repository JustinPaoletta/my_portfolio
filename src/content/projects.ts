import { env } from '@/config/env';

/** Project lifecycle, separate from the maturity of individual features. */
export type ProjectStatus =
  | 'planning'
  | 'design'
  | 'development'
  | 'testing'
  | 'prerelease'
  | 'beta'
  | 'live';

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning',
  design: 'Design',
  development: 'In Development',
  testing: 'Testing',
  prerelease: 'Pre-release',
  beta: 'Beta',
  live: 'Live',
};

/** Factual project content shared by card and CLI presentations. */
export interface ProjectSummary {
  title: string;
  description: string;
  techStack: string[];
  status?: ProjectStatus;
  featured: boolean;
  githubUrl?: string;
  liveUrl?: string;
  packageUrl?: string;
  private?: boolean;
}

const githubProfileUrl = env.social.github.replace(/\/+$/, '');

// Reviewed against source and current-commit CI on 2026-10-07.
// Keep capabilities, lifecycle, and provider limits together when updating
// either presentation. Evidence and remaining release gates: docs/PROJECT_CLAIMS.md.
export const BITSTOCKERZ_PROJECT: ProjectSummary = {
  title: 'BitStockerz',
  description:
    'A prelaunch application for researching stock and cryptocurrency strategies, with a visual strategy builder, historical backtests, result comparisons, and paper trading. Paper market orders fill from recent stored bar closes; local seed mode uses synthetic data. The NestJS API uses Prisma with MySQL/MariaDB for persistence. An Alpaca historical-data adapter is implemented but disabled by default and requires credentials and feed permissions. Live-provider verification and production launch remain pending.',
  techStack: ['Angular', 'TypeScript', 'NestJS', 'Prisma', 'MySQL/MariaDB'],
  status: 'development',
  featured: true,
  githubUrl: `${githubProfileUrl}/BitStockerz`,
};

export const JP_DESIGN_SYSTEM_PROJECT: ProjectSummary = {
  title: '@jp-design-system',
  description:
    'An Angular component library with semantic design tokens, form controls, navigation, data tables, and workflow components. Components have Storybook examples and automated interaction and accessibility checks; installable UI and token packages are tested in a separate application. This prerelease includes stable and preview APIs. Manual accessibility review and the first public release remain in progress.',
  techStack: ['Angular', 'TypeScript', 'RxJS', 'SCSS', 'Storybook'],
  status: 'prerelease',
  featured: true,
  githubUrl: `${githubProfileUrl}/jp-design-system`,
};
