/**
 * ContributionGraph Component
 * Visual representation of GitHub contributions
 */

import { useRef, useEffect, useState } from 'react';
import type { ContributionCalendar } from '@/types/github';
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
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function ContributionGraph({
  contributions,
  loading,
  isVisible,
}: ContributionGraphProps): React.ReactElement {
  const graphContentRef = useRef<HTMLDivElement>(null);
  const [weekWidth, setWeekWidth] = useState<number>(13); // Default 13px (11px + 2px gap)
  const totalWeeks = contributions.weeks.length;

  // Calculate dynamic week width based on container width
  useEffect(() => {
    const updateWeekWidth = (): void => {
      if (!graphContentRef.current) return;

      const containerWidth = graphContentRef.current.offsetWidth;
      // Calculate width per week: (container width - gaps) / number of weeks
      // Each gap is 2px, and there are (totalWeeks - 1) gaps
      const totalGapWidth = (totalWeeks - 1) * 2;
      const availableWidth = containerWidth - totalGapWidth;
      const calculatedWeekWidth = availableWidth / totalWeeks;

      // Ensure minimum width (at least 11px for the day square)
      setWeekWidth(Math.max(calculatedWeekWidth, 11));
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

  // Calculate which day labels to show and their row positions
  // We show Mon, Wed, Fri (day indices 1, 3, 5)
  // The grid rows are indexed by day of week (0-6), so we need to map
  // the desired days to their actual row positions
  const dayLabelIndices = [1, 3, 5]; // Mon, Wed, Fri
  const dayLabelsWithPosition = dayLabelIndices
    .map((targetDayIndex) => {
      // Find which row (dayIndex within week) corresponds to this day of week
      // We need to check the first week to see the mapping
      const firstWeek = contributions.weeks[0];
      if (!firstWeek) return null;

      const rowIndex = firstWeek.contributionDays.findIndex(
        (day) => new Date(day.date).getDay() === targetDayIndex
      );

      if (rowIndex === -1) return null;

      return { day: DAYS[targetDayIndex], rowIndex };
    })
    .filter((item): item is { day: string; rowIndex: number } => item !== null);

  // Get unique months with accurate positioning
  // Show month label at the start of the week that contains the 1st of the month
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  contributions.weeks.forEach((week, weekIndex) => {
    // Check if this week contains the 1st of a new month
    const hasFirstOfMonth = week.contributionDays.some((day) => {
      const date = new Date(day.date);
      return date.getDate() === 1;
    });

    if (hasFirstOfMonth) {
      // Find the first day of the month in this week
      const firstDayOfMonth = week.contributionDays.find((day) => {
        const date = new Date(day.date);
        return date.getDate() === 1;
      });

      if (firstDayOfMonth) {
        const date = new Date(firstDayOfMonth.date);
        const month = date.getMonth();
        if (month !== lastMonth) {
          monthLabels.push({
            month: MONTHS[month],
            weekIndex,
          });
          lastMonth = month;
        }
      }
    }
  });

  return (
    <div
      className={`contribution-graph ${isVisible ? 'visible' : ''} ${loading ? 'loading' : ''}`}
      aria-label={`GitHub contribution graph showing ${contributions.totalContributions} contributions in the last year`}
    >
      <div className="graph-header">
        <h3 className="graph-title">
          {contributions.totalContributions.toLocaleString()} contributions in
          the last year
        </h3>
      </div>

      <div className="graph-container">
        {/* Day labels */}
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
              key={day}
              className="day-label"
              style={{ gridRow: rowIndex + 1 }}
            >
              {day}
            </span>
          ))}
        </div>

        <div className="graph-content" ref={graphContentRef}>
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
            {contributions.weeks.map((week, weekIndex) => (
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
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export default ContributionGraph;
