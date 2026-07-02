import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCanvasPosterSync } from '@/hooks/useCanvasPosterSync';

describe('useCanvasPosterSync', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('captures a poster when canvas dimensions change', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue(
      'data:image/webp;base64,live'
    );

    const { result } = renderHook(() => useCanvasPosterSync(false));
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    act(() => {
      result.current.handleCanvasFrame(canvas);
    });

    expect(result.current.livePosterSrc).toBe('data:image/webp;base64,live');
  });

  it('skips duplicate captures for the same canvas size', () => {
    const toDataUrl = vi
      .spyOn(HTMLCanvasElement.prototype, 'toDataURL')
      .mockReturnValue('data:image/webp;base64,live');

    const { result } = renderHook(() => useCanvasPosterSync(false));
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;

    act(() => {
      result.current.handleCanvasFrame(canvas);
      result.current.handleCanvasFrame(canvas);
    });

    expect(toDataUrl).toHaveBeenCalledTimes(1);
  });

  it('ignores canvas frames after the poster is hidden', () => {
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

    act(() => {
      result.current.handleCanvasFrame(canvas);
    });

    expect(result.current.livePosterSrc).toBe('data:image/webp;base64,live');

    rerender({ hidden: true });

    act(() => {
      result.current.handleCanvasFrame(canvas);
    });

    expect(toDataUrl).toHaveBeenCalledTimes(1);
  });
});
