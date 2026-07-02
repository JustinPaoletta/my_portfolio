import { useCallback, useState } from 'react';

type SequentialSceneReveal = {
  isSceneReady: boolean;
  isPosterHidden: boolean;
  transitionPhase: 'idle' | 'swapping' | 'done';
  handleSceneReady: () => void;
};

/**
 * Reveals the WebGL canvas first, then hides the poster on the next frame so
 * identical pixels stay visible during the swap.
 */
export function useSequentialSceneReveal(): SequentialSceneReveal {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const [isPosterHidden, setIsPosterHidden] = useState(false);
  const [transitionPhase, setTransitionPhase] = useState<
    'idle' | 'swapping' | 'done'
  >('idle');

  const handleSceneReady = useCallback((): void => {
    setIsSceneReady(true);
    setTransitionPhase('swapping');

    if (typeof window === 'undefined') {
      setIsPosterHidden(true);
      setTransitionPhase('done');
      return;
    }

    window.requestAnimationFrame(() => {
      setIsPosterHidden(true);
      setTransitionPhase('done');
    });
  }, []);

  return {
    isSceneReady,
    isPosterHidden,
    transitionPhase,
    handleSceneReady,
  };
}
