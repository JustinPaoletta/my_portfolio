import { act, render, screen, waitFor } from '@/test/test-utils';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Hero from '.';

type ThemeName = 'minimal' | 'engineer' | 'cosmic' | 'cli';

let themeName: ThemeName = 'minimal';
let heroInView = true;
let prefersReducedMotion = false;
let engineerCircuit3DShouldThrow = false;
const resolvedMode: 'dark' | 'light' = 'dark';
const defaultUserAgent = navigator.userAgent;

vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({ themeName, resolvedMode }),
}));

vi.mock('@/components/sections/Hero/EngineerCircuit3D', () => ({
  __esModule: true,
  default: ({
    isActive,
    mode,
    calmMotion,
  }: {
    isActive: boolean;
    mode: string;
    calmMotion: boolean;
  }) => {
    if (engineerCircuit3DShouldThrow) {
      throw new Error('Mock engineer 3D load failed');
    }

    return (
      <div
        data-testid="engineer-circuit-3d"
        data-active={isActive ? 'true' : 'false'}
        data-mode={mode}
        data-calm={calmMotion ? 'true' : 'false'}
      />
    );
  },
}));

vi.mock('@/components/sections/Hero/CosmicScene3D', async () => {
  const React = await import('react');

  const MockCosmicScene3D = ({
    isActive,
    mode,
    calmMotion,
    onSceneReady,
  }: {
    isActive: boolean;
    mode: string;
    calmMotion: boolean;
    onSceneReady?: () => void;
  }): React.ReactElement => {
    React.useLayoutEffect(() => {
      onSceneReady?.();
    }, [onSceneReady]);

    return (
      <div
        data-testid="cosmic-scene-3d"
        data-active={isActive ? 'true' : 'false'}
        data-mode={mode}
        data-calm={calmMotion ? 'true' : 'false'}
      />
    );
  };

  return {
    __esModule: true,
    default: MockCosmicScene3D,
  };
});

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
    engineerCircuit3DShouldThrow = false;
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
    expect(minimal.container.querySelector('.hero-engineer-visual')).toBeNull();

    themeName = 'cli';
    minimal.rerender(<Hero />);
    expect(await screen.findByTestId('cli-terminal')).toBeInTheDocument();
    expect(screen.queryByText('View My Work')).not.toBeInTheDocument();
  });

  it('handles engineer chip visual profile and viewport activation', async () => {
    const media = installEngineerMatchMediaMock({
      compact: false,
      reduced: false,
    });

    themeName = 'engineer';
    heroInView = false;
    const view = render(<Hero />);

    await waitFor(() => {
      expect(
        view.container.querySelector('.hero-engineer-visual')
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(screen.getByTestId('engineer-circuit-3d')).toBeInTheDocument();
    });

    const visual = view.container.querySelector('.hero-engineer-visual');
    expect(visual).toHaveAttribute('data-engineer-circuit-active', 'false');
    expect(visual).toHaveAttribute('data-engineer-circuit-motion', 'normal');
    expect(visual).toHaveAttribute('data-engineer-circuit-scene', '3d');

    act(() => {
      media.setCompact(true);
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-motion', 'calm');
    });

    act(() => {
      media.setCompact(false);
      media.setReduced(true);
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-motion', 'calm');
    });

    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });
    act(() => {
      media.setReduced(false);
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-motion', 'calm');
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-scene', 'svg');
    });
    expect(screen.queryByTestId('engineer-circuit-3d')).not.toBeInTheDocument();

    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false },
    });
    act(() => {
      media.setReduced(false);
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-motion', 'normal');
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-scene', '3d');
    });

    heroInView = true;
    view.rerender(<Hero />);
    expect(visual).toHaveAttribute('data-engineer-circuit-active', 'true');
    await waitFor(() => {
      expect(screen.getByTestId('engineer-circuit-3d')).toHaveAttribute(
        'data-active',
        'true'
      );
    });
  });

  it('keeps the engineer SVG fallback for slow data connections', async () => {
    installEngineerMatchMediaMock();
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: false, effectiveType: '3g' },
    });
    themeName = 'engineer';

    const view = render(<Hero />);
    const visual = view.container.querySelector('.hero-engineer-visual');

    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-motion', 'calm');
    });
    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-scene', 'svg');
    });
    expect(screen.queryByTestId('engineer-circuit-3d')).not.toBeInTheDocument();
    expect(
      view.container.querySelector('.engineer-circuit')
    ).toBeInTheDocument();
  });

  it('keeps the engineer SVG fallback if the 3D scene fails to load', async () => {
    installEngineerMatchMediaMock();
    themeName = 'engineer';
    engineerCircuit3DShouldThrow = true;
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    const view = render(<Hero />);
    const visual = view.container.querySelector('.hero-engineer-visual');

    await waitFor(() => {
      expect(visual).toHaveAttribute('data-engineer-circuit-scene', 'svg');
    });
    expect(screen.queryByTestId('engineer-circuit-3d')).not.toBeInTheDocument();
    expect(
      view.container.querySelector('.engineer-circuit')
    ).toBeInTheDocument();

    consoleError.mockRestore();
  });

  it('renders the cosmic poster and mounts the 3D scene after enhancement', async () => {
    installEngineerMatchMediaMock();
    themeName = 'cosmic';

    const view = render(<Hero />);
    const background = view.container.querySelector('.hero-background');
    expect(background).toHaveAttribute('data-cosmic-theme', 'true');
    expect(
      view.container.querySelector('.hero-cosmic-still')
    ).toBeInTheDocument();
    expect(view.container.querySelector('video')).toBeNull();

    await waitFor(() => {
      expect(screen.getByTestId('cosmic-scene-3d')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(view.container.querySelector('.hero-background')).toHaveAttribute(
        'data-cosmic-scene',
        '3d'
      );
    });
    expect(screen.getByTestId('cosmic-scene-3d')).toHaveAttribute(
      'data-active',
      'true'
    );
    expect(screen.getByTestId('cosmic-scene-3d')).toHaveAttribute(
      'data-mode',
      'dark'
    );
  });

  it('keeps the cosmic poster fallback and skips the canvas under reduced motion', async () => {
    installEngineerMatchMediaMock({ reduced: true });
    prefersReducedMotion = true;
    themeName = 'cosmic';

    const view = render(<Hero />);
    const background = view.container.querySelector('.hero-background');
    expect(background).toHaveAttribute('data-cosmic-theme', 'true');
    expect(background).toHaveAttribute('data-cosmic-scene', 'poster');
    expect(
      view.container.querySelector('.hero-cosmic-still')
    ).toBeInTheDocument();

    await waitFor(() => {
      const heroContent = view.container.querySelector('.hero-content');
      expect(heroContent).toBeInTheDocument();
    });
    expect(screen.queryByTestId('cosmic-scene-3d')).not.toBeInTheDocument();
    expect(view.container.querySelector('video')).toBeNull();
  });

  it('keeps the cosmic poster fallback for Save-Data connections', async () => {
    installEngineerMatchMediaMock();
    Object.defineProperty(navigator, 'connection', {
      configurable: true,
      value: { saveData: true },
    });
    themeName = 'cosmic';

    const view = render(<Hero />);
    const background = view.container.querySelector('.hero-background');
    expect(background).toHaveAttribute('data-cosmic-theme', 'true');
    expect(background).toHaveAttribute('data-cosmic-scene', 'poster');
    expect(
      view.container.querySelector('.hero-cosmic-still')
    ).toBeInTheDocument();

    await waitFor(() => {
      const heroContent = view.container.querySelector('.hero-content');
      expect(heroContent).toBeInTheDocument();
    });
    expect(screen.queryByTestId('cosmic-scene-3d')).not.toBeInTheDocument();
  });

  it('applies calmer cosmic motion on compact viewports', async () => {
    installEngineerMatchMediaMock({ compact: true });
    themeName = 'cosmic';

    const view = render(<Hero />);
    await waitFor(() => {
      expect(screen.getByTestId('cosmic-scene-3d')).toBeInTheDocument();
    });
    await waitFor(() => {
      expect(view.container.querySelector('.hero-background')).toHaveAttribute(
        'data-cosmic-scene',
        '3d'
      );
    });
    expect(screen.getByTestId('cosmic-scene-3d')).toHaveAttribute(
      'data-calm',
      'true'
    );
  });
});
