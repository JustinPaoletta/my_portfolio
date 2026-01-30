import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  themes,
  defaultTheme,
  defaultMode,
  type Theme,
  type ThemeName,
  type ColorMode,
  type ModeColors,
} from '@/config/themes';

const THEME_STORAGE_KEY = 'portfolio-theme';
const MODE_STORAGE_KEY = 'portfolio-color-mode';

interface ThemeContextValue {
  theme: Theme;
  themeName: ThemeName;
  colorMode: ColorMode;
  resolvedMode: 'dark' | 'light';
  setTheme: (name: ThemeName) => void;
  setColorMode: (mode: ColorMode) => void;
  themes: typeof themes;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Get system color scheme preference
 */
function getSystemPreference(): 'dark' | 'light' {
  if (typeof window === 'undefined') {
    return 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

/**
 * Apply theme colors to CSS custom properties on :root
 */
function applyThemeToDocument(
  theme: Theme,
  resolvedMode: 'dark' | 'light'
): void {
  const root = document.documentElement;
  const { colors } = theme;
  const modeColors: ModeColors = theme[resolvedMode];

  // Apply accent colors
  root.style.setProperty('--color-primary', colors.primary);
  root.style.setProperty('--color-primary-light', colors.primaryLight);
  root.style.setProperty('--color-primary-dark', colors.primaryDark);
  root.style.setProperty('--color-accent', colors.accent);
  root.style.setProperty('--color-accent-teal', colors.accentTeal);

  // Apply mode-specific colors
  root.style.setProperty('--text-primary', modeColors.textPrimary);
  root.style.setProperty('--text-secondary', modeColors.textSecondary);
  root.style.setProperty('--text-muted', modeColors.textMuted);
  root.style.setProperty('--bg-main', modeColors.bgMain);
  root.style.setProperty('--bg-card', modeColors.bgCard);
  root.style.setProperty('--bg-card-hover', modeColors.bgCardHover);
  root.style.setProperty('--border-subtle', modeColors.borderSubtle);
  root.style.setProperty('--border-hover', modeColors.borderHover);

  // Set data attribute for CSS fallbacks
  root.dataset.theme = theme.name;
  root.dataset.colorMode = resolvedMode;
}

/**
 * Get the initial theme from localStorage or default
 */
function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored && stored in themes) {
    return stored as ThemeName;
  }

  return defaultTheme;
}

/**
 * Get the initial color mode from localStorage or default
 */
function getInitialMode(): ColorMode {
  if (typeof window === 'undefined') {
    return defaultMode;
  }

  const stored = localStorage.getItem(MODE_STORAGE_KEY);
  if (stored === 'dark' || stored === 'light' || stored === 'system') {
    return stored;
  }

  return defaultMode;
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 * Wraps the application and provides theme and color mode context
 */
export function ThemeProvider({
  children,
}: ThemeProviderProps): React.ReactElement {
  const [themeName, setThemeName] = useState<ThemeName>(getInitialTheme);
  const [colorMode, setColorModeState] = useState<ColorMode>(getInitialMode);
  const [systemPreference, setSystemPreference] = useState<'dark' | 'light'>(
    getSystemPreference
  );

  const theme = useMemo(() => themes[themeName], [themeName]);

  // Resolve the actual mode based on colorMode setting
  const resolvedMode = useMemo<'dark' | 'light'>(() => {
    if (colorMode === 'system') {
      return systemPreference;
    }
    return colorMode;
  }, [colorMode, systemPreference]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent): void => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document when it changes
  useEffect(() => {
    applyThemeToDocument(theme, resolvedMode);
    localStorage.setItem(THEME_STORAGE_KEY, themeName);
    localStorage.setItem(MODE_STORAGE_KEY, colorMode);
  }, [theme, themeName, colorMode, resolvedMode]);

  const setTheme = useCallback((name: ThemeName) => {
    if (name in themes) {
      setThemeName(name);
    } else if (import.meta.env.DEV) {
      console.warn(`[Theme] Unknown theme: ${name}`);
    }
  }, []);

  const setColorMode = useCallback((mode: ColorMode) => {
    if (mode === 'dark' || mode === 'light' || mode === 'system') {
      setColorModeState(mode);
    } else if (import.meta.env.DEV) {
      console.warn(`[Theme] Unknown color mode: ${mode}`);
    }
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      themeName,
      colorMode,
      resolvedMode,
      setTheme,
      setColorMode,
      themes,
    }),
    [theme, themeName, colorMode, resolvedMode, setTheme, setColorMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

/**
 * useTheme Hook
 * Access the current theme, color mode, and switching functionality
 *
 * @example
 * const { theme, setTheme, colorMode, setColorMode } = useTheme();
 * setTheme('darkNeon');
 * setColorMode('light');
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
