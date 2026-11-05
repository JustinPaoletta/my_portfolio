import { DemoTabs } from './DemoTabs';

const captures = [
  {
    label: 'Discovery',
    name: 'discovery',
    alt: 'SideQuest Pittsburgh restaurant discovery with search, cuisine filters, saved places, and Dahntahn Donnie',
    caption:
      'Search a local restaurant catalog, browse nearby places, and save a find for later.',
  },
  {
    label: 'Guides',
    name: 'guides',
    alt: 'SideQuest regional guide picker showing Dahntahn Donnie and eleven available Pittsburgh guides',
    caption:
      'Eleven illustrated regional guides give the discovery experience a Pittsburgh identity.',
  },
  {
    label: 'Collection',
    name: 'collection',
    alt: 'SideQuest Steel City Coin Collection with the welcome coin, locked future slots, and 0.1 percent progress',
    caption:
      'The welcome coin starts the Steel City collection. Additional coin earning is still in development.',
  },
];

export function SideQuestShowcase(): React.ReactElement {
  return (
    <DemoTabs
      label="SideQuest app screens"
      items={captures.map((capture) => ({
        label: capture.label,
        content: (
          <figure className="sidequest-capture">
            <img
              src={`/images/projects/sidequest-${capture.name}-20261105-480.webp`}
              srcSet={[320, 480, 720, 945]
                .map(
                  (width) =>
                    `/images/projects/sidequest-${capture.name}-20261105-${width}.webp ${width}w`
                )
                .join(', ')}
              sizes="(max-width: 440px) calc(100vw - 6rem), 194px"
              width={1179}
              height={2556}
              alt={capture.alt}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <p>{capture.caption}</p>
              <span className="demo-context">
                iOS simulator capture · Private app in testing
              </span>
              <a
                className="project-capture-link"
                href={`/images/projects/sidequest-${capture.name}-20261105-945.webp`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Open SideQuest ${capture.label.toLowerCase()} full-size screenshot`}
              >
                View full-size screenshot ↗
              </a>
            </figcaption>
          </figure>
        ),
      }))}
    />
  );
}
