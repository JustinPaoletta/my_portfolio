import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import './PlexarrShowcase.css';

const slides = [
  {
    title: 'Discover',
    caption:
      'Browse movies and series with artwork, genres, community ratings, and paginated results.',
    images: [
      {
        name: 'catalog',
        width: 1440,
        height: 592,
        sizes: [640, 960, 1440],
        alt: 'Live Plexarr Discover catalog with movie artwork, genres, ratings, and pagination',
        link: 'View full-size capture',
      },
    ],
  },
  {
    title: 'Personalized picks',
    caption:
      'A next-watch recommendation explains why it was selected, with favorite and Not interested controls to refine future suggestions.',
    images: [
      {
        name: 'picks',
        width: 700,
        height: 252,
        sizes: [640, 700],
        alt: 'Plexarr recommends Avengers: Infinity War based on Science Fiction favorites, with heart and thumbs-down controls',
        link: 'View full-size capture',
      },
    ],
  },
  {
    title: 'Title details & ratings',
    caption:
      'Read a title overview and compare its genres and community rating before choosing what to watch.',
    images: [
      {
        name: 'overview',
        width: 576,
        height: 267,
        sizes: [320, 480, 576],
        alt: 'Plexarr title overview for Avengers: Infinity War (2018)',
        link: 'View full-size overview',
      },
      {
        name: 'rating',
        width: 522,
        height: 47,
        sizes: [320, 480, 522],
        alt: 'Adventure, Action, and Science Fiction genres with an 8.0 out of 10 community rating from 33,148 votes',
        link: 'View full-size rating',
      },
    ],
  },
] as const;

/** Owner-authenticated captures, cropped to catalog and recommendation features. */
export function PlexarrShowcase(): React.ReactElement {
  const id = useId();
  const [active, setActive] = useState(0);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const slide = slides[active];
  const move = (step: number) => {
    setActive((current) => (current + step + slides.length) % slides.length);
  };
  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') move(-1);
    else if (event.key === 'ArrowRight') move(1);
    else if (event.key === 'Home') setActive(0);
    else if (event.key === 'End') setActive(slides.length - 1);
    else return;
    event.preventDefault();
  };

  return (
    <div
      className="project-showcase plexarr-carousel"
      role="region"
      aria-roledescription="carousel"
      aria-label="Plexarr feature screenshots"
    >
      <div className="plexarr-carousel__controls">
        <button
          type="button"
          aria-label="Previous Plexarr screenshot"
          aria-controls={`${id}-slide`}
          onClick={() => move(-1)}
          onKeyDown={handleKeyDown}
        >
          <ChevronLeftIcon size={20} aria-hidden="true" />
        </button>
        <p aria-live="polite" aria-atomic="true">
          {active + 1} of {slides.length}
        </p>
        <button
          type="button"
          aria-label="Next Plexarr screenshot"
          aria-controls={`${id}-slide`}
          onClick={() => move(1)}
          onKeyDown={handleKeyDown}
        >
          <ChevronRightIcon size={20} aria-hidden="true" />
        </button>
      </div>
      <figure
        id={`${id}-slide`}
        role="group"
        aria-roledescription="slide"
        aria-label={`${slide.title}, ${active + 1} of ${slides.length}`}
      >
        <div
          className={`plexarr-carousel__media${slide.images.length > 1 ? ' plexarr-carousel__media--details' : ''}`}
          onTouchStart={(event) => {
            const touch = event.touches.length === 1 ? event.touches[0] : null;
            touchStart.current = touch
              ? { x: touch.clientX, y: touch.clientY }
              : null;
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            touchStart.current = null;
            const touch = event.changedTouches[0];
            if (!start || !touch) return;
            const dx = touch.clientX - start.x;
            const dy = touch.clientY - start.y;
            if (Math.abs(dx) >= 48 && Math.abs(dx) > Math.abs(dy) * 1.5)
              move(dx < 0 ? 1 : -1);
          }}
          onTouchCancel={() => {
            touchStart.current = null;
          }}
        >
          {slide.images.map((capture) => (
            <img
              key={capture.name}
              src={`/images/projects/plexarr-${capture.name}-${capture.width}.webp`}
              srcSet={capture.sizes
                .map(
                  (width) =>
                    `/images/projects/plexarr-${capture.name}-${width}.webp ${width}w`
                )
                .join(', ')}
              sizes="(max-width: 1024px) calc(100vw - 3rem), 630px"
              width={capture.width}
              height={capture.height}
              alt={capture.alt}
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
        <figcaption>
          <h4>{slide.title}</h4>
          <p>{slide.caption}</p>
          {slide.images.map((capture) => (
            <a
              key={capture.name}
              className="project-capture-link"
              href={`/images/projects/plexarr-${capture.name}-${capture.width}.webp`}
              target="_blank"
              rel="noopener noreferrer"
            >
              {capture.link} ↗
            </a>
          ))}
        </figcaption>
      </figure>
      <div
        className="plexarr-carousel__dots"
        role="group"
        aria-label="Choose Plexarr screenshot"
      >
        {slides.map((item, index) => (
          <button
            key={item.title}
            type="button"
            aria-label={`Show ${item.title}`}
            aria-pressed={active === index}
            aria-controls={`${id}-slide`}
            onClick={() => setActive(index)}
            onKeyDown={handleKeyDown}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </div>
    </div>
  );
}
