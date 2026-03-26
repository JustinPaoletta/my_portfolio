import { themes } from '../src/config/themes';

type Rgba = { r: number; g: number; b: number; a: number };

type ContrastFailure = {
  theme: string;
  mode: 'light' | 'dark';
  check: string;
  ratio: number;
  foreground: string;
  background: string;
};

const MIN_RATIO = 4.5;

function parseColor(color: string): Rgba | null {
  const normalized = color.trim().toLowerCase();

  if (normalized.startsWith('#')) {
    return hexToRgb(normalized);
  }

  const rgbaMatch =
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*([\d.]+))?\s*\)$/.exec(
      normalized
    );

  if (!rgbaMatch) {
    return null;
  }

  return {
    r: Number(rgbaMatch[1]),
    g: Number(rgbaMatch[2]),
    b: Number(rgbaMatch[3]),
    a: rgbaMatch[4] ? Number(rgbaMatch[4]) : 1,
  };
}

function hexToRgb(hex: string): Rgba | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1,
      }
    : null;
}

function rgbToHex(rgb: Rgba): string {
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

function relativeLuminance(rgb: Rgba): number {
  return (
    0.2126 * srgbToLinear(rgb.r) +
    0.7152 * srgbToLinear(rgb.g) +
    0.0722 * srgbToLinear(rgb.b)
  );
}

function compositeColors(foreground: string, background: string): string {
  const fg = parseColor(foreground);
  const bg = parseColor(background);

  if (!fg || !bg) {
    return foreground;
  }

  if (fg.a >= 1) {
    return rgbToHex({ ...fg, a: 1 });
  }

  const alpha = fg.a;

  return rgbToHex({
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
    a: 1,
  });
}

function contrastRatio(foreground: string, background: string): number {
  const fg = parseColor(compositeColors(foreground, background));
  const bg = parseColor(compositeColors(background, '#ffffff'));
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
  const bg = parseColor(bgHex);
  const fg = parseColor(fgHex);
  if (!bg || !fg) {
    return fgHex;
  }
  return rgbToHex({
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
    a: 1,
  });
}

function ensureContrast(
  foreground: string,
  background: string,
  minRatio = MIN_RATIO
): string {
  if (contrastRatio(foreground, background) >= minRatio) {
    return foreground;
  }
  const bg = parseColor(compositeColors(background, '#ffffff'));
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

function pickOnColor(background: string, minRatio = MIN_RATIO): string {
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

const failures: ContrastFailure[] = [];

for (const theme of Object.values(themes)) {
  for (const mode of ['light', 'dark'] as const) {
    const palette = theme[mode];
    const bgMain = palette.bgMain;
    const bgCard = compositeColors(palette.bgCard, bgMain);
    const bgCardHover = compositeColors(palette.bgCardHover, bgMain);
    const navBgScrolled = compositeColors(palette.navBgScrolled, bgMain);
    const accentSurface = mixColors(bgMain, theme.colors.accent, 0.15);
    const accentInk = ensureContrast(theme.colors.accent, accentSurface);
    const primaryInk = ensureContrast(
      mode === 'light' ? theme.colors.primaryDark : theme.colors.primary,
      bgMain
    );
    const focusRing =
      mode === 'light' ? theme.colors.primaryDark : theme.colors.primary;
    const onPrimary = pickOnColor(theme.colors.primary);

    const checks = [
      {
        name: 'textPrimary on bgMain',
        foreground: palette.textPrimary,
        background: bgMain,
        minRatio: MIN_RATIO,
      },
      {
        name: 'textSecondary on bgMain',
        foreground: palette.textSecondary,
        background: bgMain,
        minRatio: MIN_RATIO,
      },
      {
        name: 'textMuted on bgMain',
        foreground: palette.textMuted,
        background: bgMain,
        minRatio: MIN_RATIO,
      },
      {
        name: 'textPrimary on bgCard',
        foreground: palette.textPrimary,
        background: bgCard,
        minRatio: MIN_RATIO,
      },
      {
        name: 'textPrimary on bgCardHover',
        foreground: palette.textPrimary,
        background: bgCardHover,
        minRatio: MIN_RATIO,
      },
      {
        name: 'textPrimary on navBgScrolled',
        foreground: palette.textPrimary,
        background: navBgScrolled,
        minRatio: MIN_RATIO,
      },
      {
        name: 'primaryInk on bgMain',
        foreground: primaryInk,
        background: bgMain,
        minRatio: MIN_RATIO,
      },
      {
        name: 'accentInk on accentSurface',
        foreground: accentInk,
        background: accentSurface,
        minRatio: MIN_RATIO,
      },
      {
        name: 'focusRing on bgMain',
        foreground: focusRing,
        background: bgMain,
        minRatio: 3,
      },
      {
        name: 'onPrimary on primary',
        foreground: onPrimary,
        background: theme.colors.primary,
        minRatio: MIN_RATIO,
      },
    ];

    for (const check of checks) {
      const ratio = contrastRatio(check.foreground, check.background);
      if (ratio < check.minRatio) {
        failures.push({
          theme: theme.name,
          mode,
          check: check.name,
          ratio,
          foreground: check.foreground,
          background: check.background,
        });
      }
    }
  }
}

if (failures.length > 0) {
  console.error('Contrast check failed:');
  for (const failure of failures) {
    console.error(
      `- ${failure.theme}/${failure.mode}: ${failure.check} (${failure.ratio.toFixed(2)}:1)`
    );
    console.error(
      `  foreground ${failure.foreground} on background ${failure.background}`
    );
  }
  process.exit(1);
}

console.log('Contrast check passed for all light and dark theme pairs.');
