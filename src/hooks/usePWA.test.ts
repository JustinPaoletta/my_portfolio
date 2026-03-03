import { act, renderHook, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const updateServiceWorkerMock = vi.hoisted(() =>
  vi.fn().mockResolvedValue(undefined)
);
const setNeedRefreshStateMock = vi.hoisted(() => vi.fn());
const setOfflineReadyStateMock = vi.hoisted(() => vi.fn());
const useRegisterSWMock = vi.hoisted(() => vi.fn());

vi.mock('./pwa-register-wrapper', () => ({
  useRegisterSW: useRegisterSWMock,
}));

import { useIsStandalone, usePWA } from './usePWA';

function createPromptEvent(
  outcome: 'accepted' | 'dismissed' = 'accepted'
): Event & {
  prompt: ReturnType<typeof vi.fn>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
} {
  const event = new Event('beforeinstallprompt') as Event & {
    prompt: ReturnType<typeof vi.fn>;
    userChoice: Promise<{
      outcome: 'accepted' | 'dismissed';
      platform: string;
    }>;
  };
  event.prompt = vi.fn().mockResolvedValue(undefined);
  event.userChoice = Promise.resolve({ outcome, platform: 'web' });
  return event;
}

describe('usePWA', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRegisterSWMock.mockReturnValue({
      needRefresh: [false, setNeedRefreshStateMock],
      offlineReady: [false, setOfflineReadyStateMock],
      updateServiceWorker: updateServiceWorkerMock,
    });
  });

  it('mirrors SW registration state and exposes update handler', () => {
    useRegisterSWMock.mockReturnValue({
      needRefresh: [true, setNeedRefreshStateMock],
      offlineReady: [true, setOfflineReadyStateMock],
      updateServiceWorker: updateServiceWorkerMock,
    });

    const { result } = renderHook(() => usePWA());

    expect(result.current.needRefresh).toBe(true);
    expect(result.current.offlineReady).toBe(true);
    expect(result.current.updateServiceWorker).toBe(updateServiceWorkerMock);
  });

  it('returns false when install prompt is unavailable', async () => {
    const { result } = renderHook(() => usePWA());

    await act(async () => {
      const accepted = await result.current.promptInstall();
      expect(accepted).toBe(false);
    });
    expect(result.current.canInstall).toBe(false);
  });

  it('handles install prompt accepted flow', async () => {
    const { result } = renderHook(() => usePWA());
    const event = createPromptEvent('accepted');

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    await act(async () => {
      const accepted = await result.current.promptInstall();
      expect(accepted).toBe(true);
    });

    expect(event.prompt).toHaveBeenCalled();
    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalling).toBe(false);
  });

  it('handles install prompt dismissed flow', async () => {
    const { result } = renderHook(() => usePWA());
    const event = createPromptEvent('dismissed');

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      const accepted = await result.current.promptInstall();
      expect(accepted).toBe(false);
    });

    expect(result.current.canInstall).toBe(false);
    expect(result.current.isInstalling).toBe(false);
  });

  it('handles install prompt errors and resets installing state', async () => {
    const { result } = renderHook(() => usePWA());
    const event = createPromptEvent('accepted');
    event.prompt.mockRejectedValueOnce(new Error('blocked'));

    act(() => {
      window.dispatchEvent(event);
    });

    await act(async () => {
      const accepted = await result.current.promptInstall();
      expect(accepted).toBe(false);
    });

    expect(result.current.isInstalling).toBe(false);
  });

  it('dismissInstall clears install availability', () => {
    const { result } = renderHook(() => usePWA());
    const event = createPromptEvent('accepted');

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    act(() => {
      result.current.dismissInstall();
    });

    expect(result.current.canInstall).toBe(false);
  });

  it('closePrompt clears offline/update/install states', () => {
    const { result } = renderHook(() => usePWA());
    const event = createPromptEvent('accepted');
    act(() => {
      window.dispatchEvent(event);
    });

    act(() => {
      result.current.closePrompt();
    });

    expect(setOfflineReadyStateMock).toHaveBeenCalledWith(false);
    expect(setNeedRefreshStateMock).toHaveBeenCalledWith(false);
    expect(result.current.canInstall).toBe(false);
  });

  it('appinstalled event resets install flags', async () => {
    const { result } = renderHook(() => usePWA());
    const event = createPromptEvent('accepted');

    act(() => {
      window.dispatchEvent(event);
    });
    expect(result.current.canInstall).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
    });

    await waitFor(() => {
      expect(result.current.canInstall).toBe(false);
      expect(result.current.isInstalling).toBe(false);
    });
  });
});

describe('useIsStandalone', () => {
  function mockMatchMedia(
    options: {
      standalone?: boolean;
      fullscreen?: boolean;
      minimal?: boolean;
      overlay?: boolean;
      withLegacyListeners?: boolean;
    } = {}
  ): void {
    const listeners = new Map<string, Set<(ev: MediaQueryListEvent) => void>>();
    const lookup: Record<string, boolean> = {
      '(display-mode: standalone)': Boolean(options.standalone),
      '(display-mode: fullscreen)': Boolean(options.fullscreen),
      '(display-mode: minimal-ui)': Boolean(options.minimal),
      '(display-mode: window-controls-overlay)': Boolean(options.overlay),
    };

    window.matchMedia = vi.fn((query: string) => {
      const bucket = listeners.get(query) ?? new Set();
      listeners.set(query, bucket);

      const api = {
        matches: Boolean(lookup[query]),
        media: query,
        onchange: null,
        addEventListener: options.withLegacyListeners
          ? undefined
          : (_: string, cb: (ev: MediaQueryListEvent) => void) =>
              bucket.add(cb),
        removeEventListener: options.withLegacyListeners
          ? undefined
          : (_: string, cb: (ev: MediaQueryListEvent) => void) =>
              bucket.delete(cb),
        addListener: (cb: (ev: MediaQueryListEvent) => void) => bucket.add(cb),
        removeListener: (cb: (ev: MediaQueryListEvent) => void) =>
          bucket.delete(cb),
        dispatchEvent: (ev: Event) => {
          const mediaEvent = ev as MediaQueryListEvent;
          bucket.forEach((cb) => cb(mediaEvent));
          return true;
        },
      } as MediaQueryList;
      return api;
    });
  }

  beforeEach(() => {
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: '',
    });
  });

  it('detects display-mode standalone and updates on appinstalled/pageshow', () => {
    mockMatchMedia({ standalone: true });
    const { result } = renderHook(() => useIsStandalone());

    expect(result.current).toBe(true);

    act(() => {
      window.dispatchEvent(new Event('appinstalled'));
      window.dispatchEvent(new Event('pageshow'));
    });
    expect(result.current).toBe(true);
  });

  it('detects iOS navigator.standalone and Android TWA referrer', () => {
    mockMatchMedia();
    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: true,
    });
    const ios = renderHook(() => useIsStandalone());
    expect(ios.result.current).toBe(true);
    ios.unmount();

    Object.defineProperty(window.navigator, 'standalone', {
      configurable: true,
      value: false,
    });
    Object.defineProperty(document, 'referrer', {
      configurable: true,
      value: 'android-app://com.example',
    });

    const twa = renderHook(() => useIsStandalone());
    expect(twa.result.current).toBe(true);
  });

  it('supports legacy addListener/removeListener media query APIs', () => {
    mockMatchMedia({ withLegacyListeners: true });
    const { result } = renderHook(() => useIsStandalone());

    expect(result.current).toBe(false);
  });
});
