import { DemoTabs } from './DemoTabs';

const captures = [
  {
    label: 'Dashboard',
    name: 'dashboard',
    width: 1440,
    height: 960,
    alt: 'Current JP Design System dashboard with sidebar navigation, score metrics, line chart, activity feed, and insights',
    caption:
      'App shell, navigation, metrics, charts, and activity—composed from the same Angular library and semantic tokens.',
  },
  {
    label: 'Forms',
    name: 'forms',
    width: 960,
    height: 640,
    alt: 'JP Design System lineup form with labeled email and notes fields, role selector, checkbox, switch, and action buttons',
    caption:
      'Labeled inputs, helper text, a select, checkbox, switch, and button variants in a filled form composition.',
  },
  {
    label: 'Data',
    name: 'data',
    width: 960,
    height: 640,
    alt: 'JP Design System roster table with player positions, availability badges, and an empty-state control',
    caption:
      'Tables, status badges, and empty-state controls share the same type, spacing, and surface system.',
  },
  {
    label: 'Assistant',
    name: 'assistant',
    width: 960,
    height: 640,
    alt: 'JP Design System assistant panel with game context, a user question, a sample response, and a message composer',
    caption:
      'A contextual assistant panel with message history and a composer. This Storybook example uses a fixed sample response.',
  },
];

export function DesignSystemShowcase(): React.ReactElement {
  return (
    <DemoTabs
      label="Design system examples"
      items={captures.map((capture) => ({
        label: capture.label,
        content: (
          <figure className="design-system-capture">
            <img
              src={`/images/projects/design-system-${capture.name}-960.webp`}
              srcSet={[640, 960, 1440]
                .filter((width) => width <= capture.width)
                .map(
                  (width) =>
                    `/images/projects/design-system-${capture.name}-${width}.webp ${width}w`
                )
                .join(', ')}
              sizes="(max-width: 1024px) calc(100vw - 3rem), 630px"
              width={capture.width}
              height={capture.height}
              alt={capture.alt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <p>{capture.caption}</p>
              <span className="demo-context">
                Real Storybook capture · Fictional club data · Pre-release
              </span>
              <a
                className="project-capture-link"
                href={`/images/projects/design-system-${capture.name}-${capture.width}.webp`}
                target="_blank"
                rel="noopener noreferrer"
              >
                View full-size capture ↗
              </a>
            </figcaption>
          </figure>
        ),
      }))}
    />
  );
}
