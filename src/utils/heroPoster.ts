import { useEffect, useState } from 'react';

export type HeroPosterTheme = 'engineer' | 'cosmic';
export type HeroPosterMode = 'dark' | 'light';
export type HeroPosterVariant = 'desktop' | 'mobile';

const POSTER_PATHS: Record<
  HeroPosterTheme,
  Record<HeroPosterMode, Record<HeroPosterVariant, string>>
> = {
  engineer: {
    dark: {
      desktop: '/images/hero/engineer/engineer-poster-dark-desktop.webp',
      mobile: '/images/hero/engineer/engineer-poster-dark-mobile.webp',
    },
    light: {
      desktop: '/images/hero/engineer/engineer-poster-light-desktop.webp',
      mobile: '/images/hero/engineer/engineer-poster-light-mobile.webp',
    },
  },
  cosmic: {
    dark: {
      desktop: '/images/hero/cosmic/cosmos-poster-dark-desktop.webp',
      mobile: '/images/hero/cosmic/cosmos-poster-dark-mobile.webp',
    },
    light: {
      desktop: '/images/hero/cosmic/cosmos-poster-light-desktop.webp',
      mobile: '/images/hero/cosmic/cosmos-poster-light-mobile.webp',
    },
  },
};

export function isPosterCaptureMode(): boolean {
  if (typeof document !== 'undefined') {
    if (document.documentElement.dataset.posterCapture === 'true') {
      return true;
    }
  }

  if (typeof window !== 'undefined') {
    return (
      new URLSearchParams(window.location.search).get('capture-posters') === '1'
    );
  }

  return false;
}

export function getHeroPosterPath(
  theme: HeroPosterTheme,
  mode: HeroPosterMode,
  variant: HeroPosterVariant
): string {
  return POSTER_PATHS[theme][mode][variant];
}

/**
 * The hero scenes use perspective cameras with a fixed vertical FOV, so a
 * poster `object-fit: cover`s to a pixel-exact match of the live canvas only
 * when the poster's aspect ratio is at least as wide as the viewport's.
 * The mobile poster is captured at 3:4 (see scripts/capture-hero-posters.ts),
 * so it is only used for viewports at or below that ratio; anything wider
 * (including squarish and landscape windows) gets the wide desktop poster.
 * Must stay in sync with the preload logic in index.html.
 */
export const HERO_POSTER_MOBILE_MEDIA_QUERY = '(max-aspect-ratio: 3/4)';

function getPosterVariantFromViewport(): HeroPosterVariant {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  return window.matchMedia(HERO_POSTER_MOBILE_MEDIA_QUERY).matches
    ? 'mobile'
    : 'desktop';
}

export function useHeroPosterPath(
  theme: HeroPosterTheme,
  mode: HeroPosterMode
): string {
  const [path, setPath] = useState(() =>
    getHeroPosterPath(theme, mode, getPosterVariantFromViewport())
  );

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const mediaQuery = window.matchMedia(HERO_POSTER_MOBILE_MEDIA_QUERY);

    const updatePath = (): void => {
      setPath(
        getHeroPosterPath(
          theme,
          mode,
          mediaQuery.matches ? 'mobile' : 'desktop'
        )
      );
    };

    updatePath();
    mediaQuery.addEventListener('change', updatePath);

    return () => {
      mediaQuery.removeEventListener('change', updatePath);
    };
  }, [theme, mode]);

  return path;
}
