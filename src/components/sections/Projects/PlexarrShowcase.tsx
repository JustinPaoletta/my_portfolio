import { useId, useRef, useState, type KeyboardEvent } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons';
import './PlexarrShowcase.css';

const slides = [
  {
    title: 'Library browsing',
    caption:
      'Search the household library, browse movie artwork and genres, and keep favorites close at hand.',
    images: [
      {
        name: 'current-library',
        width: 1392,
        height: 783,
        sizes: [320, 480, 640, 960, 1392],
        alt: 'Current Plexarr Library interface with a sample movie library, search field, filters, favorites, and pagination',
      },
    ],
  },
  {
    title: 'Personalized picks',
    caption:
      'Your Next Watch explains a recommendation and offers favorite, Not interested, and More picks for you controls.',
    images: [
      {
        name: 'current-picks',
        width: 878,
        height: 364,
        sizes: [320, 480, 640, 878],
        alt: 'Plexarr sample recommendation for Resident Evil with a Horror favorites explanation and feedback controls',
      },
    ],
  },
  {
    title: 'Title details',
    caption:
      'Open library title details for an overview, genre, library availability, and favorite controls.',
    images: [
      {
        name: 'current-details',
        width: 576,
        height: 576,
        sizes: [320, 480, 576],
        alt: 'Plexarr details for The Odyssey in Sample Movies, showing overview, Adventure genre, library information, and preference controls',
      },
    ],
  },
] as const;

/** Current application UI captured locally with isolated sample-library fixtures. */
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
      <p className="plexarr-carousel__source">
        Current interface · sample library
      </p>
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
          className="plexarr-carousel__media"
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
