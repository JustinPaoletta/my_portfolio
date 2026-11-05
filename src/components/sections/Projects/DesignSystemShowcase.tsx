import { DemoTabs } from './DemoTabs';

const captureVersion = '2026-11-05';

const captures = [
  {
    label: 'Dashboard',
    name: 'dashboard',
    width: 1440,
    height: 960,
    alt: 'JP Design System Game 6 dashboard with sidebar navigation, score metrics, cumulative-runs chart, turning points, and game notes',
    caption:
      'A Game 6 dashboard combines the app shell, navigation, metrics, chart, and activity using shared Angular components and semantic tokens.',
  },
  {
    label: 'Forms',
    name: 'forms',
    width: 960,
    height: 900,
    alt: 'JP Design System lineup form with labeled contact fields, archive role, game notes, update checkbox, and local save confirmation',
    caption:
      'A filled lineup form shows labeled inputs, helper text, role selection, and save feedback. Changes stay in the Storybook preview.',
  },
  {
    label: 'Data',
    name: 'data',
    width: 960,
    height: 640,
    alt: 'JP Design System Game 6 roster table with four player roles, contribution badges, and a Show starters filter',
    caption:
      'A four-player roster combines a semantic table, contribution badges, and a starter filter with shared type, spacing, and surfaces.',
  },
  {
    label: 'Assistant',
    name: 'assistant',
    width: 960,
    height: 640,
    alt: 'JP Design System Game 6 companion with game context, a question about home runs, a local sample reply, and a message composer',
    caption:
      'Context, message history, and a composer in one assistant panel. This example returns a fixed sample response from local archive data, without an AI call.',
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
              src={`/images/projects/design-system-${capture.name}-960.webp?v=${captureVersion}`}
              srcSet={[640, 960, 1440]
                .filter((width) => width <= capture.width)
                .map(
                  (width) =>
                    `/images/projects/design-system-${capture.name}-${width}.webp?v=${captureVersion} ${width}w`
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
                Real Storybook capture · Game 6 examples · Pre-release
              </span>
              <a
                className="project-capture-link"
                href={`/images/projects/design-system-${capture.name}-${capture.width}.webp?v=${captureVersion}`}
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
