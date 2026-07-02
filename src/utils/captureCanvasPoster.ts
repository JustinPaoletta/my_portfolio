/**
 * Snapshot the WebGL canvas for use as the hero poster. Requires
 * `preserveDrawingBuffer: true` on the canvas GL context.
 */
export function captureCanvasPoster(canvas: HTMLCanvasElement): string | null {
  if (canvas.width === 0 || canvas.height === 0) {
    return null;
  }

  try {
    return canvas.toDataURL('image/webp', 0.82);
  } catch {
    try {
      return canvas.toDataURL('image/png');
    } catch {
      return null;
    }
  }
}
