import { act, fireEvent, render, screen, waitFor } from '@/test/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ReactElement } from 'react';
import {
  ThemeProvider,
  contrastRatio,
  ensureContrast,
  getInitialMode,
  getInitialTheme,
  getModeFromQuery,
  getSystemPreference,
  getThemeFromQuery,
  hexToRgb,
  mixColors,
  pickOnColor,
  useTheme,
} from './useTheme';
import { defaultMode, defaultTheme, themes } from '@/config/themes';

type ChangeListener = (event: MediaQueryListEvent) => void;

function toChangeListener(
  listener: EventListenerOrEventListenerObject | null
): ChangeListener | null {
  if (!listener) {
    return null;
  }

  if (typeof listener === 'function') {
    return listener as unknown as ChangeListener;
  }

  return (event: MediaQueryListEvent) => listener.handleEvent(event);
}

function installMatchMediaMock(initialDark = false): {
  setDark: (dark: boolean) => void;
} {
  let isDark = initialDark;
  const listeners = new Set<ChangeListener>();

  window.matchMedia = vi.fn((query: string): MediaQueryList => {
    const isSystemDarkQuery = query === '(prefers-color-scheme: dark)';
    const matches = isSystemDarkQuery ? isDark : false;

    return {
      matches,
      media: query,
      onchange: null,
      addListener: (listener: ChangeListener | null) => {
        if (listener) {
          listeners.add(listener);
        }
      },
      removeListener: (listener: ChangeListener | null) => {
        if (listener) {
          listeners.delete(listener);
        }
      },
      addEventListener: (
        _event: string,
        listener: EventListenerOrEventListenerObject | null
      ) => {
        const changeListener = toChangeListener(listener);
        if (changeListener) {
          listeners.add(changeListener);
        }
      },
      removeEventListener: (
        _event: string,
        listener: EventListenerOrEventListenerObject | null
      ) => {
        const changeListener = toChangeListener(listener);
        if (changeListener) {
          listeners.delete(changeListener);
        }
      },
      dispatchEvent: () => true,
    };
  });

  return {
    setDark: (dark: boolean) => {
      isDark = dark;
      const event = {
        matches: dark,
        media: '(prefers-color-scheme: dark)',
      } as MediaQueryListEvent;
      listeners.forEach((listener) => listener(event));
    },
  };
}

function ThemeProbe(): ReactElement {
  const { themeName, colorMode, resolvedMode, setTheme, setColorMode } =
    useTheme();
  return (
    <div>
      <p data-testid="theme">{themeName}</p>
      <p data-testid="mode">{colorMode}</p>
      <p data-testid="resolved">{resolvedMode}</p>
      <button type="button" onClick={() => setTheme('engineer')}>
        set-engineer
      </button>
      <button
        type="button"
        onClick={() => setTheme('not-a-theme' as unknown as 'engineer')}
      >
        set-invalid-theme
      </button>
      <button type="button" onClick={() => setColorMode('light')}>
        set-light
      </button>
      <button
        type="button"
        onClick={() =>
          setColorMode('invalid-mode' as unknown as 'dark' | 'light' | 'system')
        }
      >
        set-invalid-mode
      </button>
    </div>
  );
}

function renderWithThemeProvider(): void {
  render(
    <ThemeProvider>
      <ThemeProbe />
    </ThemeProvider>
  );
}

describe('useTheme', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    document.documentElement.removeAttribute('data-color-mode');
    document.documentElement.setAttribute('style', '');
    window.history.pushState({}, '', '/');
    vi.restoreAllMocks();
    installMatchMediaMock(false);
  });

  it('throws when useTheme is called outside ThemeProvider', () => {
    expect(() => render(<ThemeProbe />)).toThrow(
      'useTheme must be used within a ThemeProvider'
    );
  });

  it('initializes theme and mode from query params and persists them', async () => {
    window.history.pushState({}, '', '/?theme=cosmic&mode=light');

    renderWithThemeProvider();

    expect(screen.getByTestId('theme')).toHaveTextContent('cosmic');
    expect(screen.getByTestId('mode')).toHaveTextContent('light');
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');
    expect(localStorage.getItem('portfolio-theme')).toBe('cosmic');
    expect(localStorage.getItem('portfolio-color-mode')).toBe('light');

    await waitFor(() => {
      expect(document.documentElement.dataset.theme).toBe('cosmic');
      expect(document.documentElement.dataset.colorMode).toBe('light');
    });
  });

  it('normalizes deprecated theme aliases from localStorage', () => {
    localStorage.setItem('portfolio-theme', 'dewTheDew');
    localStorage.setItem('portfolio-color-mode', 'system');

    renderWithThemeProvider();

    expect(screen.getByTestId('theme')).toHaveTextContent('cli');
    expect(localStorage.getItem('portfolio-theme')).toBe('cli');
  });

  it('falls back to defaults for invalid stored values', () => {
    localStorage.setItem('portfolio-theme', 'invalid-theme');
    localStorage.setItem('portfolio-color-mode', 'invalid-mode');

    renderWithThemeProvider();

    expect(screen.getByTestId('theme')).toHaveTextContent('minimal');
    expect(screen.getByTestId('mode')).toHaveTextContent('system');
  });

  it('supports valid theme/mode updates and ignores invalid values with warnings', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithThemeProvider();

    fireEvent.click(screen.getByRole('button', { name: 'set-engineer' }));
    expect(screen.getByTestId('theme')).toHaveTextContent('engineer');

    fireEvent.click(screen.getByRole('button', { name: 'set-light' }));
    expect(screen.getByTestId('mode')).toHaveTextContent('light');

    fireEvent.click(screen.getByRole('button', { name: 'set-invalid-theme' }));
    fireEvent.click(screen.getByRole('button', { name: 'set-invalid-mode' }));

    expect(warnSpy).toHaveBeenCalledWith('[Theme] Unknown theme: not-a-theme');
    expect(warnSpy).toHaveBeenCalledWith(
      '[Theme] Unknown color mode: invalid-mode'
    );
  });

  it('applies CSS variables, meta colors, and themed favicon', async () => {
    const fetchSpy = vi
      .spyOn(window, 'fetch')
      .mockResolvedValue(
        new Response(
          '<svg><path fill="#7ed957"/><path fill="#ffffff"/></svg>',
          { status: 200 }
        )
      );

    document.head.innerHTML = `
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <link rel="icon" type="image/svg+xml" href="/JP-no-cursor.svg" />
      <link rel="shortcut icon" type="image/svg+xml" href="/JP-no-cursor.svg" />
    `;

    vi.resetModules();
    const themeModule = await import('./useTheme');

    function FreshProbe(): ReactElement {
      const { themeName, colorMode, resolvedMode } = themeModule.useTheme();
      return (
        <div>
          <p data-testid="theme">{themeName}</p>
          <p data-testid="mode">{colorMode}</p>
          <p data-testid="resolved">{resolvedMode}</p>
        </div>
      );
    }

    render(
      <themeModule.ThemeProvider>
        <FreshProbe />
      </themeModule.ThemeProvider>
    );

    await waitFor(() => {
      expect(
        document.documentElement.style.getPropertyValue('--color-primary')
      ).not.toBe('');
      expect(
        document.documentElement.style.getPropertyValue('--text-primary')
      ).not.toBe('');
      expect(
        document
          .querySelector('meta[name="theme-color"]')
          ?.getAttribute('content')
      ).not.toBe('#000000');
    });

    await waitFor(() => {
      const icon = document.querySelector(
        'link[rel="icon"][type="image/svg+xml"]'
      );
      expect(icon?.getAttribute('href')).toContain('data:image/svg+xml');
    });

    expect(fetchSpy).toHaveBeenCalledWith('/JP-no-cursor.svg');
  });

  it('updates resolved mode when system preference changes', async () => {
    const media = installMatchMediaMock(false);
    localStorage.setItem('portfolio-color-mode', 'system');

    renderWithThemeProvider();
    expect(screen.getByTestId('resolved')).toHaveTextContent('light');

    act(() => {
      media.setDark(true);
    });

    await waitFor(() => {
      expect(screen.getByTestId('resolved')).toHaveTextContent('dark');
      expect(document.documentElement.dataset.colorMode).toBe('dark');
    });

    act(() => {
      media.setDark(false);
    });
    await waitFor(() => {
      expect(screen.getByTestId('resolved')).toHaveTextContent('light');
      expect(document.documentElement.dataset.colorMode).toBe('light');
    });
  });

  it('covers color helper fallback and contrast utility branches', () => {
    expect(hexToRgb('not-a-hex')).toBeNull();
    expect(contrastRatio('bad-color', '#000000')).toBe(1);
    expect(mixColors('bad-color', '#ffffff', 0.5)).toBe('#ffffff');
    expect(ensureContrast('#777777', 'bad-color')).toBe('#777777');
    expect(ensureContrast('#000000', '#ffffff')).toBe('#000000');

    expect(pickOnColor('#111111')).toBe('#ffffff');
    expect(pickOnColor('#f7f7f7')).toBe('#000000');
    expect(pickOnColor('#555555', 10)).toBe('#ffffff');
    expect(pickOnColor('#999999', 10)).toBe('#000000');
  });

  it('covers SSR-oriented query/theme/mode fallback guards', () => {
    const originalWindow = globalThis.window;

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
    });
    expect(getSystemPreference()).toBe('dark');
    expect(getThemeFromQuery()).toBeNull();
    expect(getInitialTheme()).toBe(defaultTheme);
    expect(getModeFromQuery()).toBeNull();
    expect(getInitialMode()).toBe(defaultMode);

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    });
  });

  it('covers favicon update branch for dark mode', async () => {
    document.head.innerHTML = `
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
      <link rel="icon" type="image/svg+xml" href="/JP-no-cursor.svg" />
    `;
    localStorage.setItem('portfolio-color-mode', 'dark');

    const fetchSpy = vi.spyOn(window, 'fetch').mockResolvedValue(
      new Response('<svg><path fill="#7ed957"/><path fill="#ffffff"/></svg>', {
        status: 200,
      })
    );

    vi.resetModules();
    const themeModule = await import('./useTheme');

    function DarkModeProbe(): ReactElement {
      const { resolvedMode } = themeModule.useTheme();
      return <p data-testid="resolved-dark">{resolvedMode}</p>;
    }

    render(
      <themeModule.ThemeProvider>
        <DarkModeProbe />
      </themeModule.ThemeProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('resolved-dark')).toHaveTextContent('dark');
      expect(
        document.querySelector('link[rel="icon"][type="image/svg+xml"]')
      ).toHaveAttribute('href', expect.stringContaining('data:image/svg+xml'));
    });
    expect(fetchSpy).toHaveBeenCalled();
    expect(themes.minimal.colors.primary).toBeTruthy();
  });
});
