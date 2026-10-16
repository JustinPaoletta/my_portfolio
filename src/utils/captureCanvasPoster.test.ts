import { describe, expect, it, vi } from 'vitest';
import { captureCanvasPoster } from '@/utils/captureCanvasPoster';

describe('captureCanvasPoster', () => {
  it.each(['width', 'height'] as const)(
    'returns null for a zero-%s canvas',
    (dimension) => {
      const canvas = document.createElement('canvas');
      canvas[dimension] = 0;
      expect(captureCanvasPoster(canvas)).toBeNull();
    }
  );

  it('returns null when both supported capture formats fail', () => {
    const canvas = document.createElement('canvas');
    vi.spyOn(canvas, 'toDataURL').mockImplementation(() => {
      throw new Error('Canvas unavailable');
    });
    expect(captureCanvasPoster(canvas)).toBeNull();
  });

  it('returns a data URL when toDataURL succeeds', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'width', { value: 100 });
    Object.defineProperty(canvas, 'height', { value: 50 });
    vi.spyOn(canvas, 'toDataURL').mockReturnValue('data:image/webp;base64,abc');

    expect(captureCanvasPoster(canvas)).toBe('data:image/webp;base64,abc');
  });

  it('falls back to png when webp capture fails', () => {
    const canvas = document.createElement('canvas');
    Object.defineProperty(canvas, 'width', { value: 100 });
    Object.defineProperty(canvas, 'height', { value: 50 });
    vi.spyOn(canvas, 'toDataURL')
      .mockImplementationOnce(() => {
        throw new Error('webp unsupported');
      })
      .mockReturnValueOnce('data:image/png;base64,abc');

    expect(captureCanvasPoster(canvas)).toBe('data:image/png;base64,abc');
  });
});
