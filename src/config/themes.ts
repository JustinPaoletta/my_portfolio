/**
 * Theme Configuration
 * Define multiple color palettes with dark and light mode variants
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
 */
export const themes: Record<string, Theme> = {
  breezy: {
    name: 'breezy',
    label: 'Breezy',
    colors: {
      primary: '#d3bc8d',
      primaryLight: '#e5d4a8',
      primaryDark: '#b39b6d',
      accent: '#c9b037',
      accentTeal: '#9a8a5a',
    },
    dark: {
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textMuted: 'rgba(255, 255, 255, 0.5)',
      bgMain: '#101820',
      bgCard: 'rgba(211, 188, 141, 0.05)',
      bgCardHover: 'rgba(211, 188, 141, 0.1)',
      borderSubtle: 'rgba(211, 188, 141, 0.2)',
      borderHover: 'rgba(211, 188, 141, 0.5)',
    },
    light: {
      textPrimary: '#101820',
      textSecondary: '#2a3040',
      textMuted: '#5a6070',
      bgMain: '#fdfcf8',
      bgCard: 'rgba(16, 24, 32, 0.03)',
      bgCardHover: 'rgba(16, 24, 32, 0.06)',
      borderSubtle: 'rgba(211, 188, 141, 0.3)',
      borderHover: 'rgba(211, 188, 141, 0.5)',
    },
  },
  engineer: {
    name: 'engineer',
    label: 'Engineer',
    colors: {
      primary: '#00d4ff',
      primaryLight: '#5ce1ff',
      primaryDark: '#00a8cc',
      accent: '#39ff14',
      accentTeal: '#ff3864',
    },
    dark: {
      textPrimary: '#e0ffe0',
      textSecondary: 'rgba(224, 255, 224, 0.75)',
      textMuted: 'rgba(224, 255, 224, 0.5)',
      bgMain: '#0a0e12',
      bgCard: 'rgba(0, 212, 255, 0.05)',
      bgCardHover: 'rgba(0, 212, 255, 0.1)',
      borderSubtle: 'rgba(0, 212, 255, 0.2)',
      borderHover: 'rgba(0, 212, 255, 0.5)',
    },
    light: {
      textPrimary: '#0a1628',
      textSecondary: '#1a3a5c',
      textMuted: '#4a6a8c',
      bgMain: '#f0f8ff',
      bgCard: 'rgba(0, 212, 255, 0.05)',
      bgCardHover: 'rgba(0, 212, 255, 0.1)',
      borderSubtle: 'rgba(0, 168, 204, 0.2)',
      borderHover: 'rgba(0, 168, 204, 0.4)',
    },
  },
  cosmic: {
    name: 'cosmic',
    label: 'Cosmic',
    colors: {
      primary: '#9d4edd',
      primaryLight: '#c77dff',
      primaryDark: '#7b2cbf',
      accent: '#f72585',
      accentTeal: '#4cc9f0',
    },
    dark: {
      textPrimary: '#e8e8ff',
      textSecondary: 'rgba(232, 232, 255, 0.75)',
      textMuted: 'rgba(232, 232, 255, 0.5)',
      bgMain: '#0b0014',
      bgCard: 'rgba(157, 78, 221, 0.08)',
      bgCardHover: 'rgba(157, 78, 221, 0.15)',
      borderSubtle: 'rgba(157, 78, 221, 0.25)',
      borderHover: 'rgba(199, 125, 255, 0.5)',
    },
    light: {
      textPrimary: '#1a0a2e',
      textSecondary: '#3a2a5e',
      textMuted: '#6a5a8e',
      bgMain: '#fdf8ff',
      bgCard: 'rgba(157, 78, 221, 0.05)',
      bgCardHover: 'rgba(157, 78, 221, 0.1)',
      borderSubtle: 'rgba(157, 78, 221, 0.2)',
      borderHover: 'rgba(157, 78, 221, 0.4)',
    },
  },
  dewMe: {
    name: 'dewMe',
    label: 'Dew Me',
    colors: {
      primary: '#a6d608',
      primaryLight: '#c4f018',
      primaryDark: '#7ba306',
      accent: '#e63946',
      accentTeal: '#00b4d8',
    },
    dark: {
      textPrimary: '#f0fff0',
      textSecondary: 'rgba(240, 255, 240, 0.75)',
      textMuted: 'rgba(240, 255, 240, 0.5)',
      bgMain: '#0a0f0a',
      bgCard: 'rgba(166, 214, 8, 0.05)',
      bgCardHover: 'rgba(166, 214, 8, 0.1)',
      borderSubtle: 'rgba(166, 214, 8, 0.2)',
      borderHover: 'rgba(166, 214, 8, 0.5)',
    },
    light: {
      textPrimary: '#0a1a0a',
      textSecondary: '#2a4a2a',
      textMuted: '#5a7a5a',
      bgMain: '#f5fff5',
      bgCard: 'rgba(166, 214, 8, 0.05)',
      bgCardHover: 'rgba(166, 214, 8, 0.1)',
      borderSubtle: 'rgba(166, 214, 8, 0.2)',
      borderHover: 'rgba(166, 214, 8, 0.4)',
    },
  },
  boSox: {
    name: 'boSox',
    label: 'BoSox',
    colors: {
      primary: '#bd3039',
      primaryLight: '#d94a52',
      primaryDark: '#8b1a22',
      accent: '#0c2340',
      accentTeal: '#c8102e',
    },
    dark: {
      textPrimary: '#ffffff',
      textSecondary: 'rgba(255, 255, 255, 0.75)',
      textMuted: 'rgba(255, 255, 255, 0.5)',
      bgMain: '#0c2340',
      bgCard: 'rgba(189, 48, 57, 0.08)',
      bgCardHover: 'rgba(189, 48, 57, 0.15)',
      borderSubtle: 'rgba(189, 48, 57, 0.25)',
      borderHover: 'rgba(189, 48, 57, 0.5)',
    },
    light: {
      textPrimary: '#0c2340',
      textSecondary: '#1a3a5c',
      textMuted: '#4a6a8c',
      bgMain: '#fafcff',
      bgCard: 'rgba(12, 35, 64, 0.03)',
      bgCardHover: 'rgba(12, 35, 64, 0.06)',
      borderSubtle: 'rgba(189, 48, 57, 0.2)',
      borderHover: 'rgba(189, 48, 57, 0.4)',
    },
  },
};

export const defaultTheme = 'breezy';
export const defaultMode: ColorMode = 'system';

export type ThemeName = keyof typeof themes;
export type ColorMode = 'dark' | 'light' | 'system';
