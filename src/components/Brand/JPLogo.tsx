import jpLogoSvg from '@/assets/JP.svg?raw';

interface JPLogoProps {
  className?: string;
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

function JPLogo({ className }: JPLogoProps): React.ReactElement {
  return (
    <span
      className={className}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: THEMED_JP_SVG }}
    />
  );
}

export default JPLogo;
