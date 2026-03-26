import jpLogoSvg from '@/assets/JP.svg?raw';
import jpNoCursorSvg from '@/assets/JP-no-cursor.svg?raw';

interface JPLogoProps {
  className?: string;
  /** When true, uses the no-cursor asset (e.g. for footer/static contexts) */
  hideCursor?: boolean;
}

// Keep this source in sync with public/JP.svg (favicon and PWA icon asset).
const THEMED_JP_SVG = jpLogoSvg
  .replace('<svg ', '<svg class="jp-logo-svg" ')
  .replaceAll(
    'fill="#7ed957"',
    'fill="var(--jp-logo-primary, var(--color-primary-ink, #7ed957))"'
  )
  .replace(
    'fill="#ffffff"',
    'class="jp-logo-cursor" fill="var(--jp-logo-cursor, var(--text-primary, #ffffff))"'
  );

// Themed version of JP-no-cursor.svg (no cursor element). Keep in sync with public/branding/JP-no-cursor.svg
const THEMED_JP_NO_CURSOR_SVG = jpNoCursorSvg
  .replace('<svg ', '<svg class="jp-logo-svg" ')
  .replaceAll(
    'fill="#7ed957"',
    'fill="var(--jp-logo-primary, var(--color-primary-ink, #7ed957))"'
  );

function JPLogo({
  className,
  hideCursor = false,
}: JPLogoProps): React.ReactElement {
  const svgHtml = hideCursor ? THEMED_JP_NO_CURSOR_SVG : THEMED_JP_SVG;
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgHtml }}
    />
  );
}

export default JPLogo;
