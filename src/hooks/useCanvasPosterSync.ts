import { useCallback, useEffect, useRef, useState } from 'react';
import { captureCanvasPoster } from '@/utils/captureCanvasPoster';

type CanvasPosterSyncOptions = {
  onLivePosterReady?: (ready: boolean) => void;
};

type CanvasPosterSync = {
  livePosterSrc: string | undefined;
  isLivePosterReady: boolean;
  handleCanvasFrame: (canvas: HTMLCanvasElement) => void;
};

async function preloadPosterDataUrl(dataUrl: string): Promise<boolean> {
  const image = new Image();
  image.src = dataUrl;

  try {
    if (typeof image.decode === 'function') {
      await image.decode();
    } else {
      await new Promise<void>((resolve, reject) => {
        image.onload = (): void => resolve();
        image.onerror = (): void => reject(new Error('Poster preload failed'));
      });
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Replaces the static hero poster with a snapshot of the live WebGL canvas
 * once the scene is rendering. Because the capture comes from the same canvas
 * at the same display size, framing matches every viewport and survives resize
 * until the poster is hidden.
 */
export function useCanvasPosterSync(
  isPosterHidden: boolean,
  options: CanvasPosterSyncOptions = {}
): CanvasPosterSync {
  const { onLivePosterReady } = options;
  const [livePosterSrc, setLivePosterSrc] = useState<string | undefined>();
  const [isLivePosterReady, setIsLivePosterReady] = useState(false);
  const lastCaptureRef = useRef({ width: 0, height: 0 });
  const isPosterHiddenRef = useRef(isPosterHidden);
  const preloadGenerationRef = useRef(0);
  const onLivePosterReadyRef = useRef(onLivePosterReady);

  useEffect(() => {
    isPosterHiddenRef.current = isPosterHidden;
  }, [isPosterHidden]);

  useEffect(() => {
    onLivePosterReadyRef.current = onLivePosterReady;
  }, [onLivePosterReady]);

  const markLivePosterReady = useCallback((ready: boolean): void => {
    setIsLivePosterReady(ready);
    onLivePosterReadyRef.current?.(ready);
  }, []);

  const handleCanvasFrame = useCallback(
    (canvas: HTMLCanvasElement): void => {
      if (isPosterHiddenRef.current) {
        return;
      }

      const { width, height } = canvas;
      if (width === 0 || height === 0) {
        return;
      }

      if (
        width === lastCaptureRef.current.width &&
        height === lastCaptureRef.current.height
      ) {
        return;
      }

      const dataUrl = captureCanvasPoster(canvas);
      if (!dataUrl) {
        return;
      }

      lastCaptureRef.current = { width, height };
      const generation = preloadGenerationRef.current + 1;
      preloadGenerationRef.current = generation;

      void preloadPosterDataUrl(dataUrl).then((loaded) => {
        if (
          isPosterHiddenRef.current ||
          preloadGenerationRef.current !== generation
        ) {
          return;
        }

        setLivePosterSrc(dataUrl);
        markLivePosterReady(loaded);
      });
    },
    [markLivePosterReady]
  );

  useEffect(() => {
    if (isPosterHidden) {
      return undefined;
    }

    const resetCapture = (): void => {
      lastCaptureRef.current = { width: 0, height: 0 };
      preloadGenerationRef.current += 1;
      markLivePosterReady(false);
    };

    window.addEventListener('resize', resetCapture);

    return () => {
      window.removeEventListener('resize', resetCapture);
    };
  }, [isPosterHidden, markLivePosterReady]);

  return { livePosterSrc, isLivePosterReady, handleCanvasFrame };
}
