import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';

export type HeroPosterTransitionPhase = 'idle' | 'ready' | 'fading' | 'done';

export const HERO_POSTER_FADE_MS = 400;
export const HERO_POSTER_SYNC_TIMEOUT_MS = 500;
export const HERO_SCENE_STABLE_FRAMES = 2;

type UseSequentialSceneRevealOptions = {
  reducedMotion: boolean;
  isLivePosterReadyRef: RefObject<boolean>;
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
 * Reveals the WebGL canvas underneath the poster, then fades the poster out
 * so identical pixels stay visible until the opacity transition completes.
 */
export function useSequentialSceneReveal({
  reducedMotion,
  isLivePosterReadyRef,
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
    let syncTimedOut = false;

    const startFade = (): void => {
      if (cancelled || fadeStartedRef.current) {
        return;
      }

      fadeStartedRef.current = true;
      setTransitionPhase('fading');
    };

    const attemptFade = (): void => {
      if (cancelled || fadeStartedRef.current) {
        return;
      }

      const syncReady = isLivePosterReadyRef.current === true || syncTimedOut;
      if (stableFrames >= HERO_SCENE_STABLE_FRAMES && syncReady) {
        startFade();
      }
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

      attemptFade();
    };

    if (typeof window === 'undefined') {
      startFade();
      return undefined;
    }

    window.requestAnimationFrame(tickStable);

    const timeoutId = window.setTimeout(() => {
      syncTimedOut = true;
      attemptFade();
    }, HERO_POSTER_SYNC_TIMEOUT_MS);

    const pollId = window.setInterval(() => {
      attemptFade();
    }, 50);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
      window.clearInterval(pollId);
    };
  }, [isLivePosterReadyRef, transitionPhase]);

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
