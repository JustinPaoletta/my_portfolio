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

function getPosterVariantFromViewport(): HeroPosterVariant {
  if (typeof window === 'undefined') {
    return 'desktop';
  }

  return window.matchMedia('(orientation: portrait)').matches
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

    const mediaQuery = window.matchMedia('(orientation: portrait)');

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
