import { act, render, screen, waitFor } from '@/test/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from '.';

type ThemeName = 'minimal' | 'engineer' | 'cosmic' | 'cli';

let themeName: ThemeName = 'minimal';
let heroInView = true;
let prefersReducedMotion = false;
const defaultUserAgent = navigator.userAgent;

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ themeName }),
}));

vi.mock('@/hooks/useIntersectionObserver', () => ({
  __esModule: true,
  default: () => heroInView,
}));

vi.mock('./CliTerminal', () => ({
  __esModule: true,
  default: () => <div data-testid="cli-terminal">CLI TERMINAL</div>,
}));

vi.mock('@/hooks/useReducedMotion', () => ({
  useReducedMotion: () => prefersReducedMotion,
}));

function installEngineerMatchMediaMock(
  initial: { compact?: boolean; reduced?: boolean; standalone?: boolean } = {}
): {
  setCompact: (value: boolean) => void;
  setReduced: (value: boolean) => void;
  setStandalone: (value: boolean) => void;
} {
  type ChangeListener = (event: MediaQueryListEvent) => void;
  const toChangeListener = (
    listener: EventListenerOrEventListenerObject | null
  ): ChangeListener | null => {
    if (!listener) {
      return null;
    }
    if (typeof listener === 'function') {
      return listener as unknown as ChangeListener;
    }
    return (event: MediaQueryListEvent) => listener.handleEvent(event);
  };

  let compact = Boolean(initial.compact);
  let reduced = Boolean(initial.reduced);
  let standalone = Boolean(initial.standalone);
  const compactListeners = new Set<ChangeListener>();
  const reducedListeners = new Set<ChangeListener>();
  const standaloneListeners = new Set<ChangeListener>();

  const compactMql: MediaQueryList = {
    get matches() {
      return compact;
    },
    media: '(max-width: 768px)',
    onchange: null,
    addListener: (listener) => {
      if (listener) {
        compactListeners.add(listener as ChangeListener);
      }
    },
    removeListener: (listener) => {
      if (listener) {
        compactListeners.delete(listener as ChangeListener);
      }
    },
    addEventListener: (
      _event: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      const changeListener = toChangeListener(listener);
      if (changeListener) {
        compactListeners.add(changeListener);
      }
    },
    removeEventListener: (
      _event: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      const changeListener = toChangeListener(listener);
      if (changeListener) {
        compactListeners.delete(changeListener);
      }
    },
    dispatchEvent: () => true,
  };

  const reducedMql: MediaQueryList = {
    get matches() {
      return reduced;
    },
    media: '(prefers-reduced-motion: reduce)',
    onchange: null,
    addListener: (listener) => {
      if (listener) {
        reducedListeners.add(listener as ChangeListener);
      }
    },
    removeListener: (listener) => {
      if (listener) {
        reducedListeners.delete(listener as ChangeListener);
      }
    },
    addEventListener: (
      _event: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      const changeListener = toChangeListener(listener);
      if (changeListener) {
        reducedListeners.add(changeListener);
      }
    },
    removeEventListener: (
      _event: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      const changeListener = toChangeListener(listener);
      if (changeListener) {
        reducedListeners.delete(changeListener);
      }
    },
    dispatchEvent: () => true,
  };

  const standaloneMql: MediaQueryList = {
    get matches() {
      return standalone;
    },
    media: '(display-mode: standalone)',
    onchange: null,
    addListener: (listener) => {
      if (listener) {
        standaloneListeners.add(listener as ChangeListener);
      }
    },
    removeListener: (listener) => {
      if (listener) {
        standaloneListeners.delete(listener as ChangeListener);
      }
    },
    addEventListener: (
      _event: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      const changeListener = toChangeListener(listener);
      if (changeListener) {
        standaloneListeners.add(changeListener);
      }
    },
    removeEventListener: (
      _event: string,
      listener: EventListenerOrEventListenerObject | null
    ) => {
      const changeListener = toChangeListener(listener);
      if (changeListener) {
        standaloneListeners.delete(changeListener);
      }
    },
    dispatchEvent: () => true,
  };

  window.matchMedia = vi.fn((query: string) => {
    if (query === '(max-width: 768px)') {
      return compactMql;
    }
    if (query === '(prefers-reduced-motion: reduce)') {
      return reducedMql;
    }
    if (query === '(display-mode: standalone)') {
      return standaloneMql;
    }
    if (
      query === '(display-mode: fullscreen)' ||
      query === '(display-mode: minimal-ui)' ||
      query === '(display-mode: window-controls-overlay)'
    ) {
      return {
        ...standaloneMql,
        matches: false,
        media: query,
      } as MediaQueryList;
    }

    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: (_listener) => {},
      removeListener: (_listener) => {},
      addEventListener: (
        _event: string,
        _listener: EventListenerOrEventListenerObject | null
      ) => {},
      removeEventListener: (
        _event: string,
        _listener: EventListenerOrEventListenerObject | null
      ) => {},
      dispatchEvent: () => true,
    } as MediaQueryList;
  });

  return {
    setCompact: (value: boolean) => {
      compact = value;
      const event = {
        matches: value,
        media: '(max-width: 768px)',
      } as MediaQueryListEvent;
      compactListeners.forEach((listener) => listener(event));
    },
    setReduced: (value: boolean) => {
      reduced = value;
      const event = {
        matches: value,
        media: '(prefers-reduced-motion: reduce)',
      } as MediaQueryListEvent;
      reducedListeners.forEach((listener) => listener(event));
    },
    setStandalone: (value: boolean) => {
      standalone = value;
      const event = {
        matches: value,
        media: '(display-mode: standalone)',
      } as MediaQueryListEvent;
      standaloneListeners.forEach((listener) => listener(event));
    },
  };
}

describe('Hero section', () => {
  beforeEach(() => {
    themeName = 'minimal';
    heroInView = true;
    prefersReducedMotion = false;
    vi.clearAllMocks();
    vi.stubGlobal(
      'requestIdleCallback',
      (callback: IdleRequestCallback): number =>
        window.setTimeout(
          () =>
            callback({
              didTimeout: false,
              timeRemaining: () => 50,
            } as IdleDeadline),
          0
        )
    );
    vi.stubGlobal('cancelIdleCallback', (handle: number): void => {
      window.clearTimeout(handle);
    });
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false },
    });
  });

  afterEach(() => {
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: defaultUserAgent,
    });
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('renders static hero content before deferred enhancement is activated', async () => {
    installEngineerMatchMediaMock();
    themeName = 'minimal';

    const idleCallbacks: IdleRequestCallback[] = [];

    vi.useFakeTimers();
    Object.defineProperty(navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 Chrome/122.0.0.0 Safari/537.36',
    });
    vi.stubGlobal('requestIdleCallback', (callback: IdleRequestCallback) => {
      idleCallbacks.push(callback);
      return idleCallbacks.length;
    });

    const view = render(<Hero />);
    const heroContent = view.container.querySelector('.hero-content');
    expect(heroContent).toHaveAttribute('data-parallax-enabled', 'false');
    expect(screen.getByText("Hello, I'm")).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Justin Paoletta'
    );

    act(() => {
      vi.advanceTimersByTime(40);
    });

    expect(idleCallbacks).toHaveLength(1);

    act(() => {
      idleCallbacks[0]({
        didTimeout: false,
        timeRemaining: () => 50,
      } as IdleDeadline);
      vi.advanceTimersByTime(200);
    });

    expect(heroContent).toHaveAttribute('data-parallax-enabled', 'true');
  });

  it('renders non-CLI copy for minimal theme and CLI terminal for CLI theme', async () => {
    themeName = 'minimal';
    const minimal = render(<Hero />);
    expect(screen.getByText("Hello, I'm")).toBeInTheDocument();
    expect(screen.getByText('View My Work')).toBeInTheDocument();
    expect(screen.queryByTestId('cli-terminal')).not.toBeInTheDocument();
    expect(minimal.container.querySelector('.hero-cosmic-video')).toBeNull();
    expect(minimal.container.querySelector('.hero-circuit')).toBeNull();

    themeName = 'cli';
    minimal.rerender(<Hero />);
    expect(await screen.findByTestId('cli-terminal')).toBeInTheDocument();
    expect(screen.queryByText('View My Work')).not.toBeInTheDocument();
  });

  it('handles engineer animation profile and intersection-driven svg pause behavior', async () => {
    const media = installEngineerMatchMediaMock({
      compact: false,
      reduced: false,
    });
    const pauseSpy = vi.fn();
    const unpauseSpy = vi.fn();
    Object.defineProperty(SVGSVGElement.prototype, 'pauseAnimations', {
      configurable: true,
      value: pauseSpy,
    });
    Object.defineProperty(SVGSVGElement.prototype, 'unpauseAnimations', {
      configurable: true,
      value: unpauseSpy,
    });

    themeName = 'engineer';
    heroInView = false;
    const view = render(<Hero />);

    await waitFor(() => {
      expect(view.container.querySelector('.hero-circuit')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(pauseSpy).toHaveBeenCalled();
    });
    expect(view.container.querySelector('animateMotion')).toHaveAttribute(
      'dur',
      '5.8s'
    );

    act(() => {
      media.setCompact(true);
    });
    await waitFor(() => {
      expect(view.container.querySelector('animateMotion')).toHaveAttribute(
        'dur',
        '8.8s'
      );
    });

    act(() => {
      media.setCompact(false);
      media.setReduced(true);
    });
    await waitFor(() => {
      expect(view.container.querySelector('animateMotion')).toHaveAttribute(
        'dur',
        '8.8s'
      );
    });

    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });
    act(() => {
      media.setReduced(false);
    });
    await waitFor(() => {
      expect(view.container.querySelector('animateMotion')).toHaveAttribute(
        'dur',
        '8.8s'
      );
    });

    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false },
    });
    act(() => {
      media.setReduced(false);
    });
    await waitFor(() => {
      expect(view.container.querySelector('animateMotion')).toHaveAttribute(
        'dur',
        '5.8s'
      );
    });

    heroInView = true;
    view.rerender(<Hero />);
    expect(unpauseSpy).toHaveBeenCalled();
  });

  it('handles cosmic video autoplay, interaction retry, and ready state', async () => {
    installEngineerMatchMediaMock();
    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);
    themeName = 'cosmic';

    const view = render(<Hero />);
    expect(view.container.querySelector('.hero-background')).toHaveAttribute(
      'data-cosmic-theme',
      'true'
    );
    expect(
      view.container.querySelector('.hero-cosmic-still')
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(view.container.querySelector('video')).toBeInTheDocument();
    });
    const video = view.container.querySelector('video');
    if (!video) throw new Error('expected cosmic video');
    expect(video).toHaveAttribute(
      'poster',
      '/images/hero/cosmic/cosmos-first-frame.webp'
    );
    expect(video).toHaveAttribute('autoplay');
    expect(video).toHaveAttribute('preload', 'auto');
    expect(video).toHaveAttribute('webkit-playsinline', '');
    const source = video.querySelector('source');
    expect(source).toHaveAttribute('src', '/video/cosmos.mp4');

    await waitFor(() => {
      expect(playSpy).toHaveBeenCalled();
    });

    const callsAfterMount = playSpy.mock.calls.length;
    act(() => {
      video.dispatchEvent(new Event('loadeddata'));
    });
    expect(playSpy.mock.calls.length).toBeGreaterThan(callsAfterMount);
    const callsAfterLoadedData = playSpy.mock.calls.length;
    act(() => {
      video.dispatchEvent(new Event('loadedmetadata'));
    });
    expect(playSpy.mock.calls.length).toBeGreaterThan(callsAfterLoadedData);
    const callsAfterLoadedMetadata = playSpy.mock.calls.length;
    act(() => {
      video.dispatchEvent(new Event('canplay'));
    });
    expect(playSpy.mock.calls.length).toBeGreaterThan(callsAfterLoadedMetadata);

    act(() => {
      video.dispatchEvent(new Event('playing'));
    });
    await waitFor(() => {
      expect(view.container.querySelector('.hero-background')).toHaveAttribute(
        'data-cosmic-video-ready',
        'true'
      );
    });

    act(() => {
      video.dispatchEvent(new Event('pause'));
    });
    expect(view.container.querySelector('.hero-background')).toHaveAttribute(
      'data-cosmic-video-ready',
      'false'
    );
    expect(playSpy.mock.calls.length).toBeGreaterThan(callsAfterLoadedMetadata);

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(view.container.querySelector('.hero-background')).toHaveAttribute(
      'data-cosmic-video-ready',
      'false'
    );

    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });

    const callsAfterFirstInteraction = playSpy.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(playSpy.mock.calls.length).toBe(callsAfterFirstInteraction);
  });

  it('mounts the cosmic video without the idle delay in standalone mode', async () => {
    installEngineerMatchMediaMock({ standalone: true });
    themeName = 'cosmic';
    vi.useFakeTimers();

    const requestIdleCallbackSpy = vi.fn();
    vi.stubGlobal('requestIdleCallback', requestIdleCallbackSpy);
    vi.stubGlobal('cancelIdleCallback', vi.fn());

    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    const view = render(<Hero />);

    act(() => {
      vi.advanceTimersByTime(140);
    });

    expect(requestIdleCallbackSpy).not.toHaveBeenCalled();
    expect(
      view.container.querySelector('.hero-cosmic-video')
    ).toBeInTheDocument();
    expect(playSpy).toHaveBeenCalled();
  });

  it('loads the cosmic video after idle even when save-data is enabled', async () => {
    installEngineerMatchMediaMock();
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true, effectiveType: '3g' },
    });

    const playSpy = vi
      .spyOn(HTMLMediaElement.prototype, 'play')
      .mockResolvedValue(undefined);

    themeName = 'cosmic';

    const view = render(<Hero />);
    await waitFor(() => {
      expect(
        view.container.querySelector('.hero-cosmic-video')
      ).toBeInTheDocument();
    });
    const video = view.container.querySelector('.hero-cosmic-video');
    expect(video).toHaveAttribute('preload', 'auto');

    await waitFor(() => {
      expect(playSpy).toHaveBeenCalled();
    });
  });
});
