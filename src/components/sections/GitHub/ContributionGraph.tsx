/**
 * ContributionGraph Component
 * Visual representation of GitHub contributions
 * Shows the complete contribution year, scrolling within narrow viewports.
 */

import { useRef, useEffect, useState, useMemo, useId } from 'react';
import type { ContributionCalendar } from '@/types/github';
import {
  useBreakpoint,
  SHOW_DAY_LABELS,
  SHOW_FULL_DAY_LABELS,
} from '@/hooks/useBreakpoint';
import './ContributionGraph.css';

interface ContributionGraphProps {
  contributions: ContributionCalendar;
  loading: boolean;
  isVisible: boolean;
}

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

// Full and abbreviated day names
const DAYS_FULL = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const DAYS_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const DAY_LABEL_INDICES = [1, 3, 5] as const; // Mon, Wed, Fri

function ContributionGraph({
  contributions,
  loading,
  isVisible,
}: ContributionGraphProps): React.ReactElement {
  const graphContentRef = useRef<HTMLDivElement>(null);
  const earlierButtonRef = useRef<HTMLButtonElement>(null);
  const laterButtonRef = useRef<HTMLButtonElement>(null);
  const calendarId = useId();
  const [weekWidth, setWeekWidth] = useState<number>(11);
  const breakpoint = useBreakpoint();

  const calendarWeeks = contributions.weeks;
  const totalWeeks = calendarWeeks.length;
  const [scrollEdges, setScrollEdges] = useState({
    earlier: false,
    later: false,
  });
  const isScrollable = scrollEdges.earlier || scrollEdges.later;

  // Include every day returned for the contribution year on every device.
  const yearContributions = useMemo(() => {
    return calendarWeeks.reduce((total, week) => {
      return (
        total +
        week.contributionDays.reduce(
          (weekTotal, day) => weekTotal + day.contributionCount,
          0
        )
      );
    }, 0);
  }, [calendarWeeks]);

  // Determine which day labels to use
  const showDayLabels = SHOW_DAY_LABELS[breakpoint];
  const useFullDayLabels = SHOW_FULL_DAY_LABELS[breakpoint];
  const DAYS = useFullDayLabels ? DAYS_FULL : DAYS_ABBR;

  // Calculate dynamic week width based on container width
  useEffect(() => {
    const updateWeekWidth = (): void => {
      if (!graphContentRef.current) return;

      const containerWidth = graphContentRef.current.offsetWidth;
      // Calculate width per week: (container width - gaps) / number of weeks
      // Each gap is 2px, and there are (totalWeeks - 1) gaps
      const totalGapWidth = (totalWeeks - 1) * 2;
      const availableWidth = containerWidth - totalGapWidth;
      const calculatedWeekWidth =
        totalWeeks > 0 ? availableWidth / totalWeeks : 11;

      // Keep short histories compact while fitting the available viewport.
      setWeekWidth(Math.min(24, Math.max(calculatedWeekWidth, 11)));
    };

    updateWeekWidth();

    const resizeObserver = new ResizeObserver(updateWeekWidth);
    if (graphContentRef.current) {
      resizeObserver.observe(graphContentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [totalWeeks, isVisible]);

  // Read actual overflow after column widths settle, and follow native scrolling.
  useEffect(() => {
    const content = graphContentRef.current;
    if (!content) return;
    const updateEdges = (): void => {
      const earlier = content.scrollLeft > 1;
      const later =
        content.scrollWidth - content.clientWidth - content.scrollLeft > 1;
      // Keep keyboard focus in the calendar if its focused arrow reaches an end.
      if (
        (!earlier && document.activeElement === earlierButtonRef.current) ||
        (!later && document.activeElement === laterButtonRef.current)
      ) {
        content.focus({ preventScroll: true });
      }
      setScrollEdges((previous) =>
        previous.earlier === earlier && previous.later === later
          ? previous
          : { earlier, later }
      );
    };
    updateEdges();
    content.addEventListener('scroll', updateEdges, { passive: true });
    const observer = new ResizeObserver(updateEdges);
    observer.observe(content);
    return () => {
      content.removeEventListener('scroll', updateEdges);
      observer.disconnect();
    };
  }, [weekWidth, totalWeeks]);

  const scrollCalendar = (direction: number): void => {
    const content = graphContentRef.current;
    if (!content) return;
    content.scrollBy({
      left: direction * content.clientWidth * 0.75,
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ? 'instant'
        : 'smooth',
    });
  };

  // Calculate which day labels to show and their row positions
  const dayLabelsWithPosition = useMemo(() => {
    return DAY_LABEL_INDICES.map((targetDayIndex) => {
      // Find which row (dayIndex within week) corresponds to this day of week
      // We need to check the first week to see the mapping
      const firstWeek = calendarWeeks[0];
      if (!firstWeek) return null;

      const rowIndex = firstWeek.contributionDays.findIndex(
        (day) => new Date(day.date).getUTCDay() === targetDayIndex
      );

      if (rowIndex === -1) return null;

      return { day: DAYS[targetDayIndex], rowIndex };
    }).filter(
      (item): item is { day: string; rowIndex: number } => item !== null
    );
  }, [calendarWeeks, DAYS]);

  // Get unique months with accurate positioning for the full calendar
  const monthLabels = useMemo(() => {
    const labels: { month: string; weekIndex: number }[] = [];
    let lastMonth = -1;

    calendarWeeks.forEach((week, weekIndex) => {
      // Check if this week contains the 1st of a new month
      const hasFirstOfMonth = week.contributionDays.some((day) => {
        const date = new Date(day.date);
        return date.getUTCDate() === 1;
      });

      if (hasFirstOfMonth) {
        // Find the first day of the month in this week
        const firstDayOfMonth = week.contributionDays.find((day) => {
          const date = new Date(day.date);
          return date.getUTCDate() === 1;
        });

        if (firstDayOfMonth) {
          const date = new Date(firstDayOfMonth.date);
          const month = date.getUTCMonth();
          if (month !== lastMonth) {
            labels.push({
              month: MONTHS[month],
              weekIndex,
            });
            lastMonth = month;
          }
        }
      }
    });

    return labels;
  }, [calendarWeeks]);

  // Generate time period description for accessibility
  const timePeriodDescription = useMemo(() => {
    if (calendarWeeks.length === 0) return 'no data';

    const firstDay = calendarWeeks[0]?.contributionDays[0];
    const lastWeek = calendarWeeks[calendarWeeks.length - 1];
    const lastDay =
      lastWeek?.contributionDays[lastWeek.contributionDays.length - 1];

    if (!firstDay || !lastDay) return 'recent activity';

    const months = Math.round(calendarWeeks.length / 4.33);
    return `the last ${months} month${months !== 1 ? 's' : ''}`;
  }, [calendarWeeks]);

  return (
    <div
      className={`contribution-graph ${isVisible ? 'visible' : ''} ${loading ? 'loading' : ''}`}
      aria-label={`GitHub contribution graph showing ${yearContributions.toLocaleString()} contributions in ${timePeriodDescription}`}
    >
      <div className="graph-header">
        <h3 className="graph-title">
          {yearContributions.toLocaleString()} contributions in{' '}
          {timePeriodDescription}
        </h3>
      </div>

      <div className="graph-container">
        {/* Day labels - conditionally rendered based on breakpoint */}
        {showDayLabels && (
          <div
            className="day-labels"
            aria-hidden="true"
            style={
              {
                '--day-size': `${weekWidth}px`,
              } as React.CSSProperties
            }
          >
            {dayLabelsWithPosition.map(({ day, rowIndex }) => (
              <span
                key={`${day}-${rowIndex}`}
                className="day-label"
                style={{ gridRow: rowIndex + 1 }}
              >
                {day}
              </span>
            ))}
          </div>
        )}

        <div className="graph-scroll-shell">
          <div
            id={calendarId}
            className="graph-content"
            ref={graphContentRef}
            role="region"
            aria-label="GitHub contribution calendar"
            // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- Native overflow regions need focus for keyboard scrolling.
            tabIndex={isScrollable ? 0 : undefined}
            style={
              {
                '--calendar-width': `${totalWeeks * (weekWidth + 2) - (totalWeeks > 0 ? 2 : 0)}px`,
              } as React.CSSProperties
            }
          >
            {/* Month labels */}
            <div className="month-labels" aria-hidden="true">
              {monthLabels.map(({ month, weekIndex }) => {
                // Calculate left position: each week column width + gap
                // Position at the start of the week where the month begins
                const leftPosition = weekIndex * (weekWidth + 2); // weekWidth + 2px gap
                return (
                  <span
                    key={`${month}-${weekIndex}`}
                    className="month-label"
                    style={{ left: `${leftPosition}px` }}
                  >
                    {month}
                  </span>
                );
              })}
            </div>

            {/* Contribution grid */}
            <div
              className="contribution-grid"
              style={
                {
                  '--week-width': `${weekWidth}px`,
                } as React.CSSProperties
              }
            >
              {calendarWeeks.map((week, weekIndex) => (
                <div key={weekIndex} className="contribution-week">
                  {week.contributionDays.map((day, dayIndex) => (
                    <div
                      key={`${weekIndex}-${dayIndex}`}
                      className={`contribution-day level-${getLevelClass(day.contributionLevel)}`}
                      role="img"
                      style={
                        {
                          '--delay': `${(weekIndex * 7 + dayIndex) * 0.002}s`,
                        } as React.CSSProperties
                      }
                      title={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
                      aria-label={`${day.contributionCount} contributions on ${formatDate(day.date)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          {(['earlier', 'later'] as const).map((edge) => (
            <div
              key={edge}
              className={`graph-scroll-cue graph-scroll-cue--${edge}`}
              hidden={!scrollEdges[edge]}
            >
              <button
                ref={edge === 'earlier' ? earlierButtonRef : laterButtonRef}
                type="button"
                className="graph-scroll-button"
                aria-label={`Scroll to ${edge} contributions`}
                aria-controls={calendarId}
                onClick={() => scrollCalendar(edge === 'earlier' ? -1 : 1)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    d={edge === 'earlier' ? 'M14 6l-6 6 6 6' : 'M10 6l6 6-6 6'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="graph-legend" aria-hidden="true">
        <span className="legend-label">Less</span>
        <div className="legend-levels">
          <div className="legend-level level-0" title="No contributions" />
          <div className="legend-level level-1" title="1-2 contributions" />
          <div className="legend-level level-2" title="3-4 contributions" />
          <div className="legend-level level-3" title="5-7 contributions" />
          <div className="legend-level level-4" title="8+ contributions" />
        </div>
        <span className="legend-label">More</span>
      </div>
    </div>
  );
}

function getLevelClass(level: string): number {
  switch (level) {
    case 'FIRST_QUARTILE':
      return 1;
    case 'SECOND_QUARTILE':
      return 2;
    case 'THIRD_QUARTILE':
      return 3;
    case 'FOURTH_QUARTILE':
      return 4;
    default:
      return 0;
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default ContributionGraph;
