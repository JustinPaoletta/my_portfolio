import { describe, expect, it } from 'vitest';
import { normalizeContributionCalendar } from './contributions';
import type { ContributionCalendar } from '@/types/github';

describe('normalizeContributionCalendar', () => {
  it('returns original calendar when weeks are empty', () => {
    const calendar: ContributionCalendar = {
      totalContributions: 0,
      weeks: [],
    };

    const normalized = normalizeContributionCalendar(calendar);

    expect(normalized).toBe(calendar);
  });

  it('keeps a full 7-day week unchanged', () => {
    const week = {
      contributionDays: [
        {
          contributionCount: 0,
          date: '2026-03-01',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-03-02',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-03-03',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-03-04',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-03-05',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-03-06',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
        {
          contributionCount: 0,
          date: '2026-03-07',
          color: '#1',
          contributionLevel: 'NONE' as const,
        },
      ],
    };
    const calendar: ContributionCalendar = {
      totalContributions: 0,
      weeks: [week],
    };

    const normalized = normalizeContributionCalendar(calendar);

    expect(normalized.weeks[0]).toBe(week);
  });

  it('fills missing dates in partial weeks using UTC week boundaries', () => {
    const calendar: ContributionCalendar = {
      totalContributions: 4,
      weeks: [
        {
          contributionDays: [
            {
              contributionCount: 1,
              date: '2026-03-03',
              color: '#0e4429',
              contributionLevel: 'FIRST_QUARTILE',
            },
            {
              contributionCount: 3,
              date: '2026-03-05',
              color: '#26a641',
              contributionLevel: 'THIRD_QUARTILE',
            },
          ],
        },
      ],
    };

    const normalized = normalizeContributionCalendar(calendar);
    const [week] = normalized.weeks;

    expect(week.contributionDays).toHaveLength(7);
    expect(week.contributionDays.map((d) => d.date)).toEqual([
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
      '2026-03-04',
      '2026-03-05',
      '2026-03-06',
      '2026-03-07',
    ]);
    expect(week.contributionDays[2].contributionCount).toBe(1);
    expect(week.contributionDays[4].contributionCount).toBe(3);
    expect(week.contributionDays[0]).toMatchObject({
      contributionCount: 0,
      color: '#161b22',
      contributionLevel: 'NONE',
    });
  });

  it('normalizes unsorted partial days and preserves existing entries', () => {
    const calendar: ContributionCalendar = {
      totalContributions: 6,
      weeks: [
        {
          contributionDays: [
            {
              contributionCount: 2,
              date: '2026-03-07',
              color: '#006d32',
              contributionLevel: 'SECOND_QUARTILE',
            },
            {
              contributionCount: 4,
              date: '2026-03-01',
              color: '#39d353',
              contributionLevel: 'FOURTH_QUARTILE',
            },
          ],
        },
      ],
    };

    const normalized = normalizeContributionCalendar(calendar);
    const [week] = normalized.weeks;

    expect(week.contributionDays.map((d) => d.date)).toEqual([
      '2026-03-01',
      '2026-03-02',
      '2026-03-03',
      '2026-03-04',
      '2026-03-05',
      '2026-03-06',
      '2026-03-07',
    ]);
    expect(week.contributionDays[0]).toMatchObject({
      contributionCount: 4,
      color: '#39d353',
      contributionLevel: 'FOURTH_QUARTILE',
    });
    expect(week.contributionDays[6]).toMatchObject({
      contributionCount: 2,
      color: '#006d32',
      contributionLevel: 'SECOND_QUARTILE',
    });
  });
});
