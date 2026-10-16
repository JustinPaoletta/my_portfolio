import { act, renderHook } from '@/test/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useReducedMotion } from './useReducedMotion';
import { useBreakpoint } from './useBreakpoint';
import { useHeroPosterPath } from '@/utils/heroPoster';

afterEach(() => vi.restoreAllMocks());

describe('responsive preferences', () => {
  it('updates breakpoints at the actual layout boundaries and unsubscribes on unmount', () => {
    const remove = vi.spyOn(window, 'removeEventListener');
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(320);
    const hook = renderHook(() => useBreakpoint());
    expect(hook.result.current).toBe('xs');
    for (const [width, name] of [
      [481, 'sm'],
      [641, 'md'],
      [769, 'lg'],
      [1025, 'xl'],
    ] as const) {
      vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(width);
      act(() => window.dispatchEvent(new Event('resize')));
      expect(hook.result.current).toBe(name);
    }
    hook.unmount();
    expect(remove).toHaveBeenCalledWith('resize', expect.any(Function));
  });
  it.each([false, true])(
    'subscribes to motion preference changes with legacy support (%s)',
    (legacy) => {
      let matches = false;
      let listener: (() => void) | undefined;
      const remove = vi.fn();
      vi.spyOn(window, 'matchMedia').mockReturnValue({
        get matches() {
          return matches;
        },
        ...(legacy
          ? {
              addListener: (next: () => void) => {
                listener = next;
              },
              removeListener: remove,
            }
          : {
              addEventListener: (_name: string, next: () => void) => {
                listener = next;
              },
              removeEventListener: remove,
            }),
      } as unknown as MediaQueryList);
      const hook = renderHook(() => useReducedMotion());
      expect(hook.result.current).toBe(false);
      matches = true;
      act(() => listener!());
      expect(hook.result.current).toBe(true);
      hook.unmount();
      expect(remove).toHaveBeenCalled();
    }
  );
  it('updates poster variants and theme/mode while preserving a single listener', () => {
    let matches = false;
    let listener: (() => void) | undefined;
    const remove = vi.fn();
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      get matches() {
        return matches;
      },
      addEventListener: (_name: string, next: () => void) => {
        listener = next;
      },
      removeEventListener: remove,
    } as unknown as MediaQueryList);
    const hook = renderHook(
      ({
        theme,
        mode,
      }: {
        theme: 'engineer' | 'cosmic';
        mode: 'light' | 'dark';
      }) => useHeroPosterPath(theme, mode),
      { initialProps: { theme: 'engineer', mode: 'dark' } }
    );
    expect(hook.result.current).toContain('engineer-poster-dark-desktop');
    matches = true;
    act(() => listener!());
    expect(hook.result.current).toContain('engineer-poster-dark-mobile');
    hook.rerender({ theme: 'cosmic', mode: 'light' });
    expect(hook.result.current).toContain('cosmos-poster-light-mobile');
    hook.unmount();
    expect(remove).toHaveBeenCalledTimes(2);
  });
});
