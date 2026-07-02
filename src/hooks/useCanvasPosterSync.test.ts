import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCanvasPosterSync } from '@/hooks/useCanvasPosterSync';

describe('useCanvasPosterSync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(HTMLImageElement.prototype, 'decode', {
      configurable: true,
      value: vi.fn().mockResolvedValue(undefined),
    });
  });

  it('captures a poster when canvas dimensions change', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/webp;base64,live'
    );

    const { result } = renderHook(() => useCanvasPosterSync(false));
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    await act(async () => {
      result.current.handleCanvasFrame(canvas);
    });

    await waitFor(() => {
      expect(result.current.livePosterSrc).toBe('data:image/webp;base64,live');
    });
    expect(result.current.isLivePosterReady).toBe(true);
  });

  it('skips duplicate captures for the same canvas size', async () => {
    const toDataUrl = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/webp;base64,live');

    const { result } = renderHook(() => useCanvasPosterSync(false));
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    await act(async () => {
      result.current.handleCanvasFrame(canvas);
      result.current.handleCanvasFrame(canvas);
    });

    expect(toDataUrl).toHaveBeenCalledTimes(1);
  });

  it('ignores canvas frames after the poster is hidden', async () => {
    const toDataUrl = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/webp;base64,live');

    const { result, rerender } = renderHook(
      ({ hidden }) => useCanvasPosterSync(hidden),
      { initialProps: { hidden: false } }
    );
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    await act(async () => {
      result.current.handleCanvasFrame(canvas);
    });

    await waitFor(() => {
      expect(result.current.livePosterSrc).toBe('data:image/webp;base64,live');
    });

    rerender({ hidden: true });

    await act(async () => {
      result.current.handleCanvasFrame(canvas);
    });

    expect(toDataUrl).toHaveBeenCalledTimes(1);
  });

  it('notifies when the live poster finishes preloading', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/webp;base64,live'
    );
    const onLivePosterReady = vi.fn();

    const { result } = renderHook(() =>
      useCanvasPosterSync(false, { onLivePosterReady })
    );
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    await act(async () => {
      result.current.handleCanvasFrame(canvas);
    });

    await waitFor(() => {
      expect(onLivePosterReady).toHaveBeenCalledWith(true);
    });
  });
});
