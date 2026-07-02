import { useCallback, useEffect, useRef, useState } from 'react';
import { captureCanvasPoster } from '@/utils/captureCanvasPoster';

type CanvasPosterSync = {
  livePosterSrc: string | undefined;
  handleCanvasFrame: (canvas: HTMLCanvasElement) => void;
};

/**
 * Replaces the static hero poster with a snapshot of the live WebGL canvas
 * once the scene is rendering. Because the capture comes from the same canvas
 * at the same display size, framing matches every viewport and survives resize
 * until the poster is hidden.
 */
export function useCanvasPosterSync(isPosterHidden: boolean): CanvasPosterSync {
  const [livePosterSrc, setLivePosterSrc] = useState<string | undefined>();
  const lastCaptureRef = useRef({ width: 0, height: 0 });

  const handleCanvasFrame = useCallback(
    (canvas: HTMLCanvasElement): void => {
      if (isPosterHidden) {
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
      setLivePosterSrc(dataUrl);
    },
    [isPosterHidden]
  );

  useEffect(() => {
    if (isPosterHidden) {
      return undefined;
    }

    const resetCapture = (): void => {
      lastCaptureRef.current = { width: 0, height: 0 };
    };

    window.addEventListener('resize', resetCapture);

    return () => {
      window.removeEventListener('resize', resetCapture);
    };
  }, [isPosterHidden]);

  return { livePosterSrc, handleCanvasFrame };
}
