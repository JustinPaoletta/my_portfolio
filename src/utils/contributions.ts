/**
 * Contribution calendar normalization utilities
 */

import type {
  ContributionCalendar,
  ContributionDay,
  ContributionWeek,
} from '@/types/github';

const EMPTY_DAY_COLOR = '#161b22';
const EMPTY_DAY_LEVEL: ContributionDay['contributionLevel'] = 'NONE';

function toUtcDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function formatUtcDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDaysUtc(dateString: string, days: number): string {
  const date = toUtcDate(dateString);
  date.setUTCDate(date.getUTCDate() + days);
  return formatUtcDate(date);
}

function startOfWeekUtc(dateString: string): string {
  const date = toUtcDate(dateString);
  const dayOfWeek = date.getUTCDay();
  date.setUTCDate(date.getUTCDate() - dayOfWeek);
  return formatUtcDate(date);
}

function normalizeWeek(week: ContributionWeek): ContributionWeek {
  const days = week.contributionDays;
  if (days.length === 0 || days.length === 7) {
    return week;
  }

  const sortedDays = [...days].sort((a, b) => a.date.localeCompare(b.date));
  const startDate = startOfWeekUtc(sortedDays[0].date);
  const dayMap = new Map(sortedDays.map((day) => [day.date, day]));

  const normalizedDays: ContributionDay[] = [];
  for (let i = 0; i < 7; i += 1) {
    const date = addDaysUtc(startDate, i);
    const existing = dayMap.get(date);
    normalizedDays.push(
      existing ?? {
        contributionCount: 0,
        date,
        color: EMPTY_DAY_COLOR,
        contributionLevel: EMPTY_DAY_LEVEL,
      }
    );
  }

  return { contributionDays: normalizedDays };
}

export function normalizeContributionCalendar(
  calendar: ContributionCalendar
): ContributionCalendar {
  if (calendar.weeks.length === 0) {
    return calendar;
  }

  const normalizedWeeks = calendar.weeks.map(normalizeWeek);
  return {
    ...calendar,
    weeks: normalizedWeeks,
  };
}
