import { act, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from '.';

type ThemeName = 'minimal' | 'engineer' | 'cosmic' | 'cli';

let themeName: ThemeName = 'minimal';
let heroInView = true;
let prefersReducedMotion = false;

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

vi.mock('framer-motion', async () => {
  const React = await import('react');
  const motionDiv = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
  >(({ children, ...props }, ref) =>
    React.createElement('div', { ref, ...props }, children)
  );

  return {
    motion: {
      div: motionDiv,
    },
    useReducedMotion: () => prefersReducedMotion,
    useScroll: () => ({ scrollYProgress: 0 }),
    useSpring: (value: unknown) => value,
    useTransform: (_source: unknown, _input: unknown, output: unknown) =>
      Array.isArray(output) ? output[0] : 0,
  };
});

function installEngineerMatchMediaMock(
  initial: { compact?: boolean; reduced?: boolean } = {}
): {
  setCompact: (value: boolean) => void;
  setReduced: (value: boolean) => void;
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
  const compactListeners = new Set<ChangeListener>();
  const reducedListeners = new Set<ChangeListener>();

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

  window.matchMedia = vi.fn((query: string) => {
    if (query === '(max-width: 768px)') {
      return compactMql;
    }
    if (query === '(prefers-reduced-motion: reduce)') {
      return reducedMql;
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
  };
}

describe('Hero section', () => {
  beforeEach(() => {
    themeName = 'minimal';
    heroInView = true;
    prefersReducedMotion = false;
    vi.clearAllMocks();
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false },
    });
  });

  it('renders non-CLI copy for minimal theme and CLI terminal for CLI theme', () => {
    themeName = 'minimal';
    const minimal = render(<Hero />);
    expect(screen.getByText("Hello, I'm")).toBeInTheDocument();
    expect(screen.getByText('View My Work')).toBeInTheDocument();
    expect(screen.queryByTestId('cli-terminal')).not.toBeInTheDocument();
    expect(minimal.container.querySelector('.hero-cosmic-video')).toBeNull();
    expect(minimal.container.querySelector('.hero-circuit')).toBeNull();

    themeName = 'cli';
    minimal.rerender(<Hero />);
    expect(screen.getByTestId('cli-terminal')).toBeInTheDocument();
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
    expect(pauseSpy).toHaveBeenCalled();
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
      view.container.querySelector('.hero-cosmic-fallback')
    ).toBeInTheDocument();
    expect(view.container.querySelector('.hero-cosmic-still')).toHaveAttribute(
      'src',
      '/images/hero/cosmic/cosmos-first-frame.webp'
    );
    expect(view.container.querySelector('.nebula-layer-1')).toBeInTheDocument();
    const video = view.container.querySelector('video');
    if (!video) throw new Error('expected cosmic video');
    expect(video).toHaveAttribute('src', '/video/cosmos.mp4');
    expect(video).not.toHaveAttribute('poster');

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

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    });
    const callsBeforeVisibilityEvent = playSpy.mock.calls.length;
    act(() => {
      document.dispatchEvent(new Event('visibilitychange'));
    });
    expect(playSpy.mock.calls.length).toBeGreaterThan(
      callsBeforeVisibilityEvent
    );

    const callsBeforeInteraction = playSpy.mock.calls.length;
    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    const callsAfterFirstInteraction = playSpy.mock.calls.length;
    expect(callsAfterFirstInteraction).toBeGreaterThan(callsBeforeInteraction);

    act(() => {
      window.dispatchEvent(new Event('pointerdown'));
    });
    expect(playSpy.mock.calls.length).toBe(callsAfterFirstInteraction);
  });
});
