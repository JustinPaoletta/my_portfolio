import { themes } from '../src/config/themes';

type Rgb = { r: number; g: number; b: number };

type ContrastFailure = {
  theme: string;
  check: string;
  ratio: number;
  foreground: string;
  background: string;
};

const MIN_RATIO = 4.5;

function hexToRgb(hex: string): Rgb | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(rgb: Rgb): string {
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

function relativeLuminance(rgb: Rgb): number {
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
  return rgbToHex({
    r: fg.r * alpha + bg.r * (1 - alpha),
    g: fg.g * alpha + bg.g * (1 - alpha),
    b: fg.b * alpha + bg.b * (1 - alpha),
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
  const light = theme.light;
  const bgMain = light.bgMain;
  const accentSurface = mixColors(bgMain, theme.colors.accent, 0.15);
  const accentInk = ensureContrast(theme.colors.accent, accentSurface);
  const primaryInk = ensureContrast(theme.colors.primaryDark, bgMain);
  const onPrimary = pickOnColor(theme.colors.primary);

  const checks = [
    {
      name: 'textPrimary on bgMain',
      foreground: light.textPrimary,
      background: bgMain,
    },
    {
      name: 'textSecondary on bgMain',
      foreground: light.textSecondary,
      background: bgMain,
    },
    {
      name: 'textMuted on bgMain',
      foreground: light.textMuted,
      background: bgMain,
    },
    {
      name: 'primaryInk on bgMain',
      foreground: primaryInk,
      background: bgMain,
    },
    {
      name: 'accentInk on accentSurface',
      foreground: accentInk,
      background: accentSurface,
    },
    {
      name: 'onPrimary on primary',
      foreground: onPrimary,
      background: theme.colors.primary,
    },
  ];

  for (const check of checks) {
    const ratio = contrastRatio(check.foreground, check.background);
    if (ratio < MIN_RATIO) {
      failures.push({
        theme: theme.name,
        check: check.name,
        ratio,
        foreground: check.foreground,
        background: check.background,
      });
    }
  }
}

if (failures.length > 0) {
  console.error('Contrast check failed:');
  for (const failure of failures) {
    console.error(
      `- ${failure.theme}: ${failure.check} (${failure.ratio.toFixed(2)}:1)`
    );
    console.error(
      `  foreground ${failure.foreground} on background ${failure.background}`
    );
  }
  process.exit(1);
}

console.log('Contrast check passed for all light-mode themes.');
