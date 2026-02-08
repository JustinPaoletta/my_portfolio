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
 * Parse a hex color to RGB components
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(rgb: { r: number; g: number; b: number }): string {
  const toHex = (value: number): string =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

function srgbToLinear(channel: number): number {
  const value = channel / 255;
  return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

function relativeLuminance(rgb: { r: number; g: number; b: number }): number {
  return (
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b)
  );
}

function contrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) {
    return 1;
  }
  const fgLum = relativeLuminance(fg);
  const bgLum = relativeLuminance(bg);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

function mixColors(bgHex: string, fgHex: string, alpha: number): string {
  const bg = hexToRgb(bgHex);
  const fg = hexToRgb(fgHex);
  if (!bg || !fg) {
    return fgHex;
  }
  const mixed = {
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
  };
  return rgbToHex(mixed);
}

function ensureContrast(
  foreground: string,
  background: string,
  minRatio = 4.5
): string {
  if (contrastRatio(foreground, background) >= minRatio) {
    return foreground;
  }
  const bg = hexToRgb(background);
  if (!bg) {
    return foreground;
  }
  const target = relativeLuminance(bg) > 0.5 ? '#000000' : '#ffffff';
  let low = 0;
  let high = 1;
  let best = foreground;
  for (let i = 0; i < 24; i += 1) {
    const mid = (low + high) / 2;
    const candidate = mixColors(foreground, target, mid);
    if (contrastRatio(candidate, background) >= minRatio) {
      best = candidate;
      high = mid;
    } else {
      low = mid;
    }
  }
  return best;
}

function pickOnColor(background: string, minRatio = 4.5): string {
  const white = contrastRatio('#ffffff', background);
  const black = contrastRatio('#000000', background);
  if (white >= minRatio && white >= black) {
    return '#ffffff';
  }
  if (black >= minRatio && black >= white) {
    return '#000000';
  }
  return white >= black ? '#ffffff' : '#000000';
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

  // Generate RGB values for the primary color to enable rgba() usage in CSS
  const primaryRgb = hexToRgb(colors.primary);
  const primaryDarkRgb = hexToRgb(colors.primaryDark);
  const accentRgb = hexToRgb(colors.accent);

  if (primaryRgb) {
    root.style.setProperty(
      '--color-primary-rgb',
      `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`
    );
  }

  if (primaryDarkRgb) {
    root.style.setProperty(
      '--color-primary-dark-rgb',
      `${primaryDarkRgb.r}, ${primaryDarkRgb.g}, ${primaryDarkRgb.b}`
    );
  }

  if (accentRgb) {
    root.style.setProperty(
      '--color-accent-rgb',
      `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`
    );
  }

  const accentSurface = mixColors(
    modeColors.bgMain,
    colors.accent,
    resolvedMode === 'light' ? 0.15 : 0.1
  );
  const accentInk = ensureContrast(colors.accent, accentSurface, 4.5);
  const primaryInkBase =
    resolvedMode === 'dark' ? colors.primary : colors.primaryDark;
  const primaryInk = ensureContrast(primaryInkBase, modeColors.bgMain, 4.5);
  const onPrimary = pickOnColor(colors.primary, 4.5);

  // Set contrast-safe text color for elements on primary-colored backgrounds
  // In dark mode, use lighter text; in light mode, use darker text
  root.style.setProperty(
    '--color-primary-contrast',
    resolvedMode === 'dark' ? colors.primaryLight : colors.primaryDark
  );

  // Accent ink color for text and outlines (preserve dark mode, darken in light mode)
  root.style.setProperty('--color-primary-ink', primaryInk);
  root.style.setProperty('--color-accent-ink', accentInk);
  root.style.setProperty('--color-on-primary', onPrimary);

  // Apply mode-specific colors
  root.style.setProperty('--text-primary', modeColors.textPrimary);
  root.style.setProperty('--text-secondary', modeColors.textSecondary);
  root.style.setProperty('--text-muted', modeColors.textMuted);
  root.style.setProperty('--bg-main', modeColors.bgMain);
  root.style.setProperty('--bg-card', modeColors.bgCard);
  root.style.setProperty('--bg-card-hover', modeColors.bgCardHover);
  root.style.setProperty('--border-subtle', modeColors.borderSubtle);
  root.style.setProperty('--border-hover', modeColors.borderHover);
  root.style.setProperty('--nav-bg-scrolled', modeColors.navBgScrolled);

  // Set data attribute for CSS fallbacks
  root.dataset.theme = theme.name;
  root.dataset.colorMode = resolvedMode;
}

/**
 * Get the initial theme from localStorage or default
 */
function getThemeFromQuery(): ThemeName | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const themeParam = params.get('theme');
  if (!themeParam) {
    return null;
  }
  if (themeParam === 'boSox') {
    return 'minimal';
  }
  if (themeParam in themes) {
    return themeParam as ThemeName;
  }
  return null;
}

function getInitialTheme(): ThemeName {
  if (typeof window === 'undefined') {
    return defaultTheme;
  }

  const queryTheme = getThemeFromQuery();
  if (queryTheme) {
    localStorage.setItem(THEME_STORAGE_KEY, queryTheme);
    return queryTheme;
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === 'boSox') {
    return 'minimal';
  }
  if (stored && stored in themes) {
    return stored as ThemeName;
  }

  return defaultTheme;
}

/**
 * Get the initial color mode from localStorage or default
 */
function getModeFromQuery(): ColorMode | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const params = new URLSearchParams(window.location.search);
  const modeParam = params.get('mode');
  if (modeParam === 'dark' || modeParam === 'light' || modeParam === 'system') {
    return modeParam;
  }
  return null;
}

function getInitialMode(): ColorMode {
  if (typeof window === 'undefined') {
    return defaultMode;
  }

  const queryMode = getModeFromQuery();
  if (queryMode) {
    localStorage.setItem(MODE_STORAGE_KEY, queryMode);
    return queryMode;
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
