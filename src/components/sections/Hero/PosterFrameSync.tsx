import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';

type PosterFrameSyncProps = {
  enabled: boolean;
  onCanvasFrame: (canvas: HTMLCanvasElement) => void;
};

/**
 * Notifies the parent after each rendered frame while poster sync is active.
 * Captures are throttled to canvas dimension changes (see useCanvasPosterSync).
 */
function PosterFrameSync({
  enabled,
  onCanvasFrame,
}: PosterFrameSyncProps): null {
  const gl = useThree((state) => state.gl);
  const onCanvasFrameRef = useRef(onCanvasFrame);

  useEffect(() => {
    onCanvasFrameRef.current = onCanvasFrame;
  }, [onCanvasFrame]);

  useFrame(() => {
    if (!enabled) {
      return;
    }

    onCanvasFrameRef.current(gl.domElement);
  });

  return null;
}

export default PosterFrameSync;
