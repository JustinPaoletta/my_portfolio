import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HERO_POSTER_FADE_MS,
  useSequentialSceneReveal,
} from '@/components/sections/Hero/useSequentialSceneReveal';

describe('useSequentialSceneReveal', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('skips the fade and hides the poster immediately when reduced motion is enabled', () => {
    const { result } = renderHook(() =>
      useSequentialSceneReveal({
        reducedMotion: true,
      })
    );

    act(() => {
      result.current.handleSceneReady();
    });

    expect(result.current.isSceneReady).toBe(true);
    expect(result.current.isPosterHidden).toBe(true);
    expect(result.current.transitionPhase).toBe('done');
    expect(result.current.isPosterFadeRequested).toBe(false);
  });

  it('enters fading after the canvas has rendered stable frames', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      });

    const { result } = renderHook(() =>
      useSequentialSceneReveal({
        reducedMotion: false,
      })
    );

    act(() => {
      result.current.handleSceneReady();
    });

    expect(result.current.transitionPhase).toBe('ready');
    expect(result.current.isSceneReady).toBe(true);

    act(() => {
      rafCallbacks.splice(0).forEach((callback) => {
        callback(0);
      });
      rafCallbacks.splice(0).forEach((callback) => {
        callback(16);
      });
    });

    expect(result.current.transitionPhase).toBe('fading');

    act(() => {
      result.current.handlePosterFadeComplete();
    });

    expect(result.current.transitionPhase).toBe('done');
    expect(result.current.isPosterHidden).toBe(true);
    expect(result.current.isPosterFadeRequested).toBe(false);

    rafSpy.mockRestore();
  });

  it('completes the fade via fallback timeout', () => {
    const rafCallbacks: FrameRequestCallback[] = [];
    const rafSpy = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((callback) => {
        rafCallbacks.push(callback);
        return rafCallbacks.length;
      });

    const { result } = renderHook(() =>
      useSequentialSceneReveal({
        reducedMotion: false,
      })
    );

    act(() => {
      result.current.handleSceneReady();
    });

    act(() => {
      rafCallbacks.splice(0).forEach((callback) => {
        callback(0);
      });
      rafCallbacks.splice(0).forEach((callback) => {
        callback(16);
      });
    });

    expect(result.current.transitionPhase).toBe('fading');

    act(() => {
      vi.advanceTimersByTime(HERO_POSTER_FADE_MS + 100);
    });

    expect(result.current.transitionPhase).toBe('done');
    expect(result.current.isPosterHidden).toBe(true);

    rafSpy.mockRestore();
  });

  it('ignores duplicate fade completion callbacks', () => {
    const { result } = renderHook(() =>
      useSequentialSceneReveal({
        reducedMotion: false,
      })
    );

    act(() => {
      result.current.handleSceneReady();
      result.current.handlePosterFadeComplete();
      result.current.handlePosterFadeComplete();
    });

    expect(result.current.transitionPhase).toBe('done');
  });
});
