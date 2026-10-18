import jpLogoSvg from '@/assets/JP.svg?raw';
import './JPLogo.css';

interface JPLogoProps {
  className?: string;
}

// Generated from assets/branding/jp-mark.svg by npm run generate:icons.
const THEMED_JP_SVG = jpLogoSvg
  .replace('<svg ', '<svg class="jp-logo-svg" ')
  .replaceAll('fill="#8e99a8"', 'fill="var(--jp-logo-primary, #8e99a8)"')
  .replace('fill="#f5f7fa"', 'fill="var(--jp-logo-cursor, #f5f7fa)"');

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
