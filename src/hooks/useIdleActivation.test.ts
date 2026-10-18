import { act, renderHook } from '@/test/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import useIdleActivation from './useIdleActivation';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe('idle section activation', () => {
  it.each(['complete', 'loading'] as const)(
    'waits for idle after document state %s and cancels stale callbacks',
    (readyState) => {
      vi.spyOn(document, 'readyState', 'get').mockReturnValue(readyState);
      let callback: IdleRequestCallback | undefined;
      const cancel = vi.fn();
      vi.stubGlobal(
        'requestIdleCallback',
        vi.fn((next: IdleRequestCallback) => {
          callback = next;
          return 7;
        })
      );
      vi.stubGlobal('cancelIdleCallback', cancel);
      const { result, unmount } = renderHook(() =>
        useIdleActivation({ timeout: 2000 })
      );
      expect(result.current).toBe(false);
      if (readyState === 'loading') {
        expect(callback).toBeUndefined();
        act(() => window.dispatchEvent(new Event('load')));
      }
      expect(window.requestIdleCallback).toHaveBeenCalledWith(
        expect.any(Function),
        { timeout: 2000 }
      );
      act(() => callback!({} as IdleDeadline));
      expect(result.current).toBe(true);
      unmount();
      expect(cancel).toHaveBeenCalledWith(7);
    }
  );
  it.each(['complete', 'loading'] as const)(
    'uses a cancellable timeout without idle support (%s)',
    (readyState) => {
      vi.useFakeTimers();
      vi.spyOn(document, 'readyState', 'get').mockReturnValue(readyState);
      vi.stubGlobal('requestIdleCallback', undefined);
      const { result, unmount } = renderHook(() => useIdleActivation());
      if (readyState === 'loading')
        act(() => window.dispatchEvent(new Event('load')));
      expect(result.current).toBe(false);
      unmount();
      act(() => vi.runAllTimers());
      expect(result.current).toBe(false);
      const next = renderHook(() => useIdleActivation());
      if (readyState === 'loading')
        act(() => window.dispatchEvent(new Event('load')));
      act(() => vi.runAllTimers());
      expect(next.result.current).toBe(true);
    }
  );
  it('ignores idle callbacks after unmount and does not schedule when disabled', () => {
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete');
    let callback: IdleRequestCallback | undefined;
    const schedule = vi.fn((next: IdleRequestCallback) => {
      callback = next;
      return 1;
    });
    vi.stubGlobal('requestIdleCallback', schedule);
    const disabled = renderHook(() => useIdleActivation({ enabled: false }));
    expect(schedule).not.toHaveBeenCalled();
    disabled.unmount();
    const active = renderHook(() => useIdleActivation());
    active.unmount();
    act(() => callback!({} as IdleDeadline));
    expect(active.result.current).toBe(false);
  });
});
