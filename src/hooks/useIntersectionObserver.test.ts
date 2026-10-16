import { createRef } from 'react';
import { act, renderHook } from '@/test/test-utils';
import { describe, expect, it, vi } from 'vitest';
import { useIntersectionObserver } from './useIntersectionObserver';

interface ObserverInstance {
  callback: IntersectionObserverCallback;
  observe: ReturnType<typeof vi.fn>;
  disconnect: ReturnType<typeof vi.fn>;
}

const observerInstances: ObserverInstance[] = [];

class TestIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  readonly callback: IntersectionObserverCallback;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();

  constructor(callback: IntersectionObserverCallback) {
    this.callback = callback;
    observerInstances.push(this);
  }

  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

describe('useIntersectionObserver', () => {
  it('debounces resize/orientation reconnects and cancels pending work on unmount', () => {
    vi.useFakeTimers();
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    observerInstances.length = 0;
    const ref = { current: document.createElement('div') };
    const hook = renderHook(() => useIntersectionObserver(ref));
    const send = (name: string) =>
      act(() => window.dispatchEvent(new Event(name)));
    send('resize');
    send('resize');
    send('orientationchange');
    send('orientationchange');
    act(() => vi.advanceTimersByTime(149));
    expect(observerInstances).toHaveLength(1);
    act(() => vi.advanceTimersByTime(1));
    expect(observerInstances).toHaveLength(2);
    act(() => vi.advanceTimersByTime(150));
    expect(observerInstances).toHaveLength(3);
    expect(observerInstances[0].disconnect).toHaveBeenCalled();
    expect(observerInstances[2].observe).toHaveBeenCalledWith(ref.current);
    send('resize');
    send('orientationchange');
    hook.unmount();
    act(() => vi.runAllTimers());
    expect(observerInstances).toHaveLength(3);
    vi.useRealTimers();
  });

  it('returns false when ref has no current element', () => {
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    observerInstances.length = 0;
    const ref = createRef<HTMLDivElement>();

    const { result } = renderHook(() => useIntersectionObserver(ref));

    expect(result.current).toBe(false);
    expect(observerInstances).toHaveLength(0);
  });

  it('sets visible true on intersection and disconnects when triggerOnce is true', () => {
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    observerInstances.length = 0;
    const ref = { current: document.createElement('div') };

    const { result } = renderHook(() =>
      useIntersectionObserver(ref, { triggerOnce: true, threshold: 0.5 })
    );

    expect(observerInstances).toHaveLength(1);
    const instance = observerInstances[0];
    expect(instance.observe).toHaveBeenCalledWith(ref.current);

    act(() => {
      instance.callback(
        [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });

    expect(result.current).toBe(true);
    expect(instance.disconnect).toHaveBeenCalled();
  });

  it('toggles back to false when triggerOnce is false', () => {
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    observerInstances.length = 0;
    const ref = { current: document.createElement('div') };

    const { result } = renderHook(() =>
      useIntersectionObserver(ref, { triggerOnce: false })
    );

    const instance = observerInstances[0];

    act(() => {
      instance.callback(
        [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });
    expect(result.current).toBe(true);

    act(() => {
      instance.callback(
        [{ isIntersecting: false } as unknown as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });
    expect(result.current).toBe(false);
  });

  it('does not create a second observer after becoming visible when triggerOnce is true', () => {
    vi.stubGlobal('IntersectionObserver', TestIntersectionObserver);
    observerInstances.length = 0;
    const ref = { current: document.createElement('div') };

    const { rerender } = renderHook(
      ({ triggerOnce }) => useIntersectionObserver(ref, { triggerOnce }),
      { initialProps: { triggerOnce: true } }
    );

    const instance = observerInstances[0];
    act(() => {
      instance.callback(
        [{ isIntersecting: true } as unknown as IntersectionObserverEntry],
        instance as unknown as IntersectionObserver
      );
    });

    rerender({ triggerOnce: true });
    expect(observerInstances).toHaveLength(1);
  });
});
