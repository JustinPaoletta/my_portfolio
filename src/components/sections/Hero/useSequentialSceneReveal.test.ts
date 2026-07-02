import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  HERO_POSTER_FADE_MS,
  HERO_POSTER_SYNC_TIMEOUT_MS,
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
    const isLivePosterReadyRef = { current: false };
    const { result } = renderHook(() =>
      useSequentialSceneReveal({
        reducedMotion: true,
        isLivePosterReadyRef,
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

  it('enters fading after stable frames and the live poster sync timeout', () => {
    const isLivePosterReadyRef = { current: false };
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
        isLivePosterReadyRef,
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

    act(() => {
      vi.advanceTimersByTime(HERO_POSTER_SYNC_TIMEOUT_MS);
    });

    act(() => {
      rafCallbacks.splice(0).forEach((callback) => {
        callback(32);
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

  it('starts fading before the sync timeout when the live poster is ready', () => {
    const isLivePosterReadyRef = { current: true };
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
        isLivePosterReadyRef,
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
      rafCallbacks.splice(0).forEach((callback) => {
        callback(32);
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
    const isLivePosterReadyRef = { current: false };
    const { result } = renderHook(() =>
      useSequentialSceneReveal({
        reducedMotion: false,
        isLivePosterReadyRef,
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
