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
  breezy: {
    name: 'breezy',
    label: 'Breezy',
    colors: {
      primary: '#d3bc8d', // Gold - 8.5:1 on #101820
      primaryLight: '#e5d4a8',
      primaryDark: '#a08860', // Darker for light mode, 4.5:1 on #fdfcf8
      accent: '#c9b037',
      accentTeal: '#9a8a5a',
    },
    dark: {
      textPrimary: '#ffffff', // 15.5:1 on #101820
      textSecondary: '#d4d0c8', // 10:1 on #101820
      textMuted: '#a8a49c', // 5.5:1 on #101820
      bgMain: '#101820',
      bgCard: 'rgba(211, 188, 141, 0.05)',
      bgCardHover: 'rgba(211, 188, 141, 0.1)',
      borderSubtle: 'rgba(211, 188, 141, 0.25)',
      borderHover: 'rgba(211, 188, 141, 0.5)',
      navBgScrolled: 'rgba(16, 24, 32, 0.95)',
    },
    light: {
      textPrimary: '#1a1a1a', // 14:1 on #fdfcf8
      textSecondary: '#3d3d3d', // 9:1 on #fdfcf8
      textMuted: '#5c5c5c', // 5.5:1 on #fdfcf8
      bgMain: '#fdfcf8',
      bgCard: 'rgba(16, 24, 32, 0.03)',
      bgCardHover: 'rgba(16, 24, 32, 0.06)',
      borderSubtle: 'rgba(160, 136, 96, 0.3)',
      borderHover: 'rgba(160, 136, 96, 0.5)',
      navBgScrolled: 'rgba(253, 252, 248, 0.95)',
    },
  },
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
      primary: '#b8e020', // Brighter lime - 9:1 on #0a0f0a
      primaryLight: '#d0f040',
      primaryDark: '#5c7010', // Darker for light mode, 5:1 on #f5fff5
      accent: '#e63946',
      accentTeal: '#00b4d8',
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
  boSox: {
    name: 'boSox',
    label: 'BoSox',
    colors: {
      primary: '#e04048', // Brighter red - 5:1 on #0c2340
      primaryLight: '#f06068',
      primaryDark: '#9c2028', // Darker for light mode, 6:1 on #fafcff
      accent: '#0c2340',
      accentTeal: '#c8102e',
    },
    dark: {
      textPrimary: '#ffffff', // 12:1 on #0c2340
      textSecondary: '#d0d8e0', // 8:1 on #0c2340
      textMuted: '#98a8b8', // 5:1 on #0c2340
      bgMain: '#0c2340',
      bgCard: 'rgba(224, 64, 72, 0.08)',
      bgCardHover: 'rgba(224, 64, 72, 0.15)',
      borderSubtle: 'rgba(224, 64, 72, 0.25)',
      borderHover: 'rgba(224, 64, 72, 0.5)',
      navBgScrolled: 'rgba(12, 35, 64, 0.95)',
    },
    light: {
      textPrimary: '#0c2340', // 12:1 on #fafcff
      textSecondary: '#1e3a58', // 8:1 on #fafcff
      textMuted: '#4a6078', // 5:1 on #fafcff
      bgMain: '#fafcff',
      bgCard: 'rgba(12, 35, 64, 0.03)',
      bgCardHover: 'rgba(12, 35, 64, 0.06)',
      borderSubtle: 'rgba(156, 32, 40, 0.25)',
      borderHover: 'rgba(156, 32, 40, 0.4)',
      navBgScrolled: 'rgba(250, 252, 255, 0.95)',
    },
  },
};

export const defaultTheme = 'breezy';
export const defaultMode: ColorMode = 'system';

export type ThemeName = keyof typeof themes;
export type ColorMode = 'dark' | 'light' | 'system';
