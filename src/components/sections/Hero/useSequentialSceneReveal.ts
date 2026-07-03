import { useCallback, useEffect, useRef, useState } from 'react';

export type HeroPosterTransitionPhase = 'idle' | 'ready' | 'fading' | 'done';

export const HERO_POSTER_FADE_MS = 400;
export const HERO_SCENE_STABLE_FRAMES = 2;

type UseSequentialSceneRevealOptions = {
  reducedMotion: boolean;
};

type SequentialSceneReveal = {
  isSceneReady: boolean;
  isPosterHidden: boolean;
  isPosterFadeRequested: boolean;
  transitionPhase: HeroPosterTransitionPhase;
  handleSceneReady: () => void;
  handlePosterFadeComplete: () => void;
};

/**
 * Keeps the static poster overlay on top of the live WebGL canvas, then fades
 * the overlay out so both layers are visible during the handoff.
 */
export function useSequentialSceneReveal({
  reducedMotion,
}: UseSequentialSceneRevealOptions): SequentialSceneReveal {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isPosterHidden, setIsPosterHidden] = useState(false);
  const [transitionPhase, setTransitionPhase] =
    useState<HeroPosterTransitionPhase>('idle');

  const fadeStartedRef = useRef(false);
  const fadeCompletedRef = useRef(false);

  const handlePosterFadeComplete = useCallback((): void => {
    if (fadeCompletedRef.current) {
      return;
    }

    fadeCompletedRef.current = true;
    setIsPosterHidden(true);
    setTransitionPhase('done');
  }, []);

  const handleSceneReady = useCallback((): void => {
    setIsSceneReady(true);

    if (reducedMotion) {
      setIsPosterHidden(true);
      setTransitionPhase('done');
      return;
    }

    setTransitionPhase('ready');
  }, [reducedMotion]);

  useEffect(() => {
    if (transitionPhase !== 'ready' || fadeStartedRef.current) {
      return undefined;
    }

    let cancelled = false;
    let stableFrames = 0;

    const startFade = (): void => {
      if (cancelled || fadeStartedRef.current) {
        return;
      }

      fadeStartedRef.current = true;
      setTransitionPhase('fading');
    };

    const tickStable = (): void => {
      if (cancelled) {
        return;
      }

      stableFrames += 1;
      if (stableFrames < HERO_SCENE_STABLE_FRAMES) {
        window.requestAnimationFrame(tickStable);
        return;
      }

      startFade();
    };

    if (typeof window === 'undefined') {
      startFade();
      return undefined;
    }

    window.requestAnimationFrame(tickStable);

    return () => {
      cancelled = true;
    };
  }, [transitionPhase]);

  useEffect(() => {
    if (transitionPhase !== 'fading') {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      handlePosterFadeComplete();
    }, HERO_POSTER_FADE_MS + 100);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [handlePosterFadeComplete, transitionPhase]);

  return {
    isSceneReady,
    isPosterHidden,
    isPosterFadeRequested: transitionPhase === 'fading',
    transitionPhase,
    handleSceneReady,
    handlePosterFadeComplete,
  };
}
