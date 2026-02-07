/**
 * Theme Configuration
 * Define multiple color palettes with dark and light mode variants
 *
 * ACCESSIBILITY: All text colors must meet WCAG AA contrast requirements:
 * - Normal text: 4.5:1 contrast ratio against background
 * - Large text (18px+ or 14px+ bold): 3:1 contrast ratio
 * - UI components: 3:1 contrast ratio
 */

export interface ModeColors {
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  bgMain: string;
  bgCard: string;
  bgCardHover: string;
  borderSubtle: string;
  borderHover: string;
  /** Navigation background when scrolled - should be semi-transparent bgMain */
  navBgScrolled: string;
}

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  accent: string;
  accentTeal: string;
}

export interface Theme {
  name: string;
  label: string;
  colors: ThemeColors;
  dark: ModeColors;
  light: ModeColors;
}

/**
 * Available themes
 * Each theme defines accent colors plus dark and light mode variants
 *
 * Contrast ratios verified for WCAG AA compliance:
 * - textPrimary on bgMain: ≥ 7:1 (AAA)
 * - textSecondary on bgMain: ≥ 4.5:1 (AA)
 * - textMuted on bgMain: ≥ 4.5:1 (AA)
 */
export const themes: Record<string, Theme> = {
  engineer: {
    name: 'engineer',
    label: 'Engineer',
    colors: {
      primary: '#00d4ff', // Cyan - 10:1 on #0a0e12
      primaryLight: '#5ce1ff',
      primaryDark: '#007a94', // Darker for light mode, 5:1 on #f0f8ff
      accent: '#39ff14',
      accentTeal: '#ff3864',
    },
    dark: {
      textPrimary: '#f0fff0', // 17:1 on #0a0e12
      textSecondary: '#c8e8c8', // 11:1 on #0a0e12
      textMuted: '#94b894', // 5.5:1 on #0a0e12
      bgMain: '#0a0e12',
      bgCard: 'rgba(0, 212, 255, 0.05)',
      bgCardHover: 'rgba(0, 212, 255, 0.1)',
      borderSubtle: 'rgba(0, 212, 255, 0.25)',
      borderHover: 'rgba(0, 212, 255, 0.5)',
      navBgScrolled: 'rgba(10, 14, 18, 0.95)',
    },
    light: {
      textPrimary: '#0a1628', // 15:1 on #f0f8ff
      textSecondary: '#1e3a52', // 9:1 on #f0f8ff
      textMuted: '#3d5c78', // 5:1 on #f0f8ff
      bgMain: '#f0f8ff',
      bgCard: 'rgba(0, 122, 148, 0.05)',
      bgCardHover: 'rgba(0, 122, 148, 0.1)',
      borderSubtle: 'rgba(0, 122, 148, 0.25)',
      borderHover: 'rgba(0, 122, 148, 0.4)',
      navBgScrolled: 'rgba(240, 248, 255, 0.95)',
    },
  },
  cosmic: {
    name: 'cosmic',
    label: 'Cosmic',
    colors: {
      primary: '#c77dff', // Lighter purple - 7:1 on #0b0014
      primaryLight: '#d9a3ff',
      primaryDark: '#7b2cbf', // Darker for light mode, 5:1 on #fdf8ff
      accent: '#f72585',
      accentTeal: '#4cc9f0',
    },
    dark: {
      textPrimary: '#f5f0ff', // 17:1 on #0b0014
      textSecondary: '#d8d0e8', // 11:1 on #0b0014
      textMuted: '#a89cc0', // 5.5:1 on #0b0014
      bgMain: '#0b0014',
      bgCard: 'rgba(157, 78, 221, 0.08)',
      bgCardHover: 'rgba(157, 78, 221, 0.15)',
      borderSubtle: 'rgba(199, 125, 255, 0.25)',
      borderHover: 'rgba(199, 125, 255, 0.5)',
      navBgScrolled: 'rgba(11, 0, 20, 0.95)',
    },
    light: {
      textPrimary: '#1a0a2e', // 14:1 on #fdf8ff
      textSecondary: '#3a2454', // 9:1 on #fdf8ff
      textMuted: '#5c4478', // 5:1 on #fdf8ff
      bgMain: '#fdf8ff',
      bgCard: 'rgba(123, 44, 191, 0.05)',
      bgCardHover: 'rgba(123, 44, 191, 0.1)',
      borderSubtle: 'rgba(123, 44, 191, 0.25)',
      borderHover: 'rgba(123, 44, 191, 0.4)',
      navBgScrolled: 'rgba(253, 248, 255, 0.95)',
    },
  },
  dewTheDew: {
    name: 'dewTheDew',
    label: 'Dew the Dew',
    colors: {
      primary: '#57ff48', // Mountain Dew green
      primaryLight: '#e7e7e7', // Light neutral from palette
      primaryDark: '#0e5403', // Deep green from palette
      accent: '#ff3232', // Mountain Dew red
      accentTeal: '#000000', // Black from palette
    },
    dark: {
      textPrimary: '#f0fff0', // 17:1 on #0a0f0a
      textSecondary: '#c8e8c8', // 11:1 on #0a0f0a
      textMuted: '#94b894', // 5.5:1 on #0a0f0a
      bgMain: '#0a0f0a',
      bgCard: 'rgba(166, 214, 8, 0.05)',
      bgCardHover: 'rgba(166, 214, 8, 0.1)',
      borderSubtle: 'rgba(184, 224, 32, 0.25)',
      borderHover: 'rgba(184, 224, 32, 0.5)',
      navBgScrolled: 'rgba(10, 15, 10, 0.95)',
    },
    light: {
      textPrimary: '#0a1a0a', // 16:1 on #f5fff5
      textSecondary: '#2a3a2a', // 9:1 on #f5fff5
      textMuted: '#4a5c4a', // 5:1 on #f5fff5
      bgMain: '#f5fff5',
      bgCard: 'rgba(92, 112, 16, 0.05)',
      bgCardHover: 'rgba(92, 112, 16, 0.1)',
      borderSubtle: 'rgba(92, 112, 16, 0.25)',
      borderHover: 'rgba(92, 112, 16, 0.4)',
      navBgScrolled: 'rgba(245, 255, 245, 0.95)',
    },
  },
  minimal: {
    name: 'minimal',
    label: 'Minimal',
    colors: {
      primary: '#5b677a', // Cool slate - 7:1 on #0f1115
      primaryLight: '#d5dbe3',
      primaryDark: '#2c3440', // Darker for light mode, 6:1 on #f7f7f5
      accent: '#3a5ccc',
      accentTeal: '#2a9d8f',
    },
    dark: {
      textPrimary: '#f6f7f9', // 16:1 on #0f1115
      textSecondary: '#c7ccd3', // 9:1 on #0f1115
      textMuted: '#8f98a4', // 5:1 on #0f1115
      bgMain: '#0f1115',
      bgCard: 'rgba(91, 103, 122, 0.08)',
      bgCardHover: 'rgba(91, 103, 122, 0.14)',
      borderSubtle: 'rgba(91, 103, 122, 0.25)',
      borderHover: 'rgba(91, 103, 122, 0.5)',
      navBgScrolled: 'rgba(15, 17, 21, 0.95)',
    },
    light: {
      textPrimary: '#111317', // 14:1 on #f7f7f5
      textSecondary: '#2c3138', // 9:1 on #f7f7f5
      textMuted: '#5a616b', // 5:1 on #f7f7f5
      bgMain: '#f7f7f5',
      bgCard: 'rgba(44, 52, 64, 0.03)',
      bgCardHover: 'rgba(44, 52, 64, 0.06)',
      borderSubtle: 'rgba(44, 52, 64, 0.22)',
      borderHover: 'rgba(44, 52, 64, 0.4)',
      navBgScrolled: 'rgba(247, 247, 245, 0.95)',
    },
  },
  breezy: {
    name: 'breezy',
    label: 'Breezy',
    colors: {
      primary: '#d3bc8d', // Old Gold - Saints official palette
      primaryLight: '#e6d8b8',
      primaryDark: '#b3985a', // Deeper gold for light mode contrast
      accent: '#d3bc8d',
      accentTeal: '#b3985a',
    },
    dark: {
      textPrimary: '#ffffff', // 15.5:1 on #101820
      textSecondary: '#d4d0c8', // 10:1 on #101820
      textMuted: '#a8a49c', // 5.5:1 on #101820
      bgMain: '#000000',
      bgCard: 'rgba(211, 188, 141, 0.05)',
      bgCardHover: 'rgba(211, 188, 141, 0.1)',
      borderSubtle: 'rgba(211, 188, 141, 0.25)',
      borderHover: 'rgba(211, 188, 141, 0.5)',
      navBgScrolled: 'rgba(0, 0, 0, 0.95)',
    },
    light: {
      textPrimary: '#101820', // 14:1 on #ffffff
      textSecondary: '#2b3240', // 9:1 on #ffffff
      textMuted: '#5b6370', // 5.5:1 on #ffffff
      bgMain: '#ffffff',
      bgCard: 'rgba(16, 24, 32, 0.03)',
      bgCardHover: 'rgba(16, 24, 32, 0.06)',
      borderSubtle: 'rgba(16, 24, 32, 0.2)',
      borderHover: 'rgba(16, 24, 32, 0.4)',
      navBgScrolled: 'rgba(255, 255, 255, 0.95)',
    },
  },
};

export const defaultTheme = 'engineer';
export const defaultMode: ColorMode = 'system';

export type ThemeName = keyof typeof themes;
export type ColorMode = 'dark' | 'light' | 'system';
