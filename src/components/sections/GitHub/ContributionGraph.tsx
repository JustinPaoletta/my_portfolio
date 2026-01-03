/**
 * ContributionGraph Component
 * Visual representation of GitHub contributions
 */

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
  // Get unique months from weeks for labels
  const monthLabels: { month: string; weekIndex: number }[] = [];
  let lastMonth = -1;

  contributions.weeks.forEach((week, weekIndex) => {
    const firstDay = week.contributionDays[0];
    if (firstDay) {
      const date = new Date(firstDay.date);
      const month = date.getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ month: MONTHS[month], weekIndex });
        lastMonth = month;
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
        <div className="day-labels" aria-hidden="true">
          {DAYS.filter((_, i) => i % 2 === 1).map((day) => (
            <span key={day} className="day-label">
              {day}
            </span>
          ))}
        </div>

        <div className="graph-content">
          {/* Month labels */}
          <div className="month-labels" aria-hidden="true">
            {monthLabels.map(({ month, weekIndex }) => (
              <span
                key={`${month}-${weekIndex}`}
                className="month-label"
                style={{ gridColumn: weekIndex + 1 }}
              >
                {month}
              </span>
            ))}
          </div>

          {/* Contribution grid */}
          <div className="contribution-grid" role="img">
            {contributions.weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="contribution-week">
                {week.contributionDays.map((day, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`contribution-day level-${getLevelClass(day.contributionLevel)}`}
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
