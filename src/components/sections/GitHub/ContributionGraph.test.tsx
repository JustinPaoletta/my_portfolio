import { render, screen } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import ContributionGraph from './ContributionGraph';
import type { ContributionCalendar, ContributionDay } from '@/types/github';

let breakpoint: 'xs' | 'sm' | 'md' | 'lg' | 'xl' = 'md';

vi.mock('@/hooks/useBreakpoint', () => ({
  useBreakpoint: () => breakpoint,
  CONTRIBUTION_WEEKS_CONFIG: {
    xs: 2,
    sm: 4,
    md: 6,
    lg: 8,
    xl: 10,
  },
  SHOW_DAY_LABELS: {
    xs: false,
    sm: true,
    md: true,
    lg: true,
    xl: true,
  },
  SHOW_FULL_DAY_LABELS: {
    xs: false,
    sm: false,
    md: false,
    lg: true,
    xl: true,
  },
}));

function createWeeks(count: number): ContributionCalendar['weeks'] {
  const start = new Date('2026-01-25T00:00:00.000Z'); // Sunday
  const levels: ContributionDay['contributionLevel'][] = [
    'NONE',
    'FIRST_QUARTILE',
    'SECOND_QUARTILE',
    'THIRD_QUARTILE',
    'FOURTH_QUARTILE',
  ];

  return Array.from({ length: count }, (_, weekIndex) => ({
    contributionDays: Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(start);
      date.setUTCDate(start.getUTCDate() + weekIndex * 7 + dayIndex);
      return {
        contributionCount: dayIndex + 1,
        date: date.toISOString().slice(0, 10),
        color: '#26a641',
        contributionLevel: levels[(weekIndex + dayIndex) % levels.length],
      } as ContributionDay;
    }),
  }));
}

describe('ContributionGraph', () => {
  it('renders visible weeks, month labels, day labels and level classes', () => {
    breakpoint = 'md';
    const contributions: ContributionCalendar = {
      totalContributions: 999,
      weeks: createWeeks(8),
    };

    render(
      <ContributionGraph
        contributions={contributions}
        loading={false}
        isVisible
      />
    );

    expect(
      screen.getByRole('heading', { name: /contributions in the last/i })
    ).toBeInTheDocument();
    expect(screen.getByText('M')).toBeInTheDocument();
    expect(document.querySelector('.month-label')).toBeInTheDocument();
    expect(
      document.querySelector('.contribution-day.level-4')
    ).toBeInTheDocument();
    expect(
      document.querySelector('.contribution-graph.visible')
    ).toBeInTheDocument();
  });

  it('hides day labels for xs breakpoint and uses no-data description for empty weeks', () => {
    breakpoint = 'xs';
    const contributions: ContributionCalendar = {
      totalContributions: 0,
      weeks: [],
    };

    render(
      <ContributionGraph
        contributions={contributions}
        loading={true}
        isVisible={false}
      />
    );

    expect(
      screen.getByLabelText(
        /GitHub contribution graph showing 0 contributions in no data/i
      )
    ).toBeInTheDocument();
    expect(document.querySelector('.day-labels')).not.toBeInTheDocument();
    expect(
      document.querySelector('.contribution-graph.loading')
    ).toBeInTheDocument();
  });

  it('uses recent activity description when first/last day cannot be derived', () => {
    breakpoint = 'sm';
    const contributions: ContributionCalendar = {
      totalContributions: 0,
      weeks: [{ contributionDays: [] }, { contributionDays: [] }],
    };

    render(
      <ContributionGraph
        contributions={contributions}
        loading={false}
        isVisible
      />
    );

    expect(
      screen.getByText(/0 contributions in recent activity/i)
    ).toBeInTheDocument();
  });
});
