import { useCallback } from 'react';
import {
  useHeroPosterPath,
  type HeroPosterMode,
  type HeroPosterTheme,
} from '@/utils/heroPoster';

export type HeroStillImageProps = {
  theme: HeroPosterTheme;
  mode: HeroPosterMode;
  className: string;
  hidden?: boolean;
  fadeRequested?: boolean;
  onFadeComplete?: () => void;
};

function HeroStillImage({
  theme,
  mode,
  className,
  hidden = false,
  fadeRequested = false,
  onFadeComplete,
}: HeroStillImageProps): React.ReactElement | null {
  const staticSrc = useHeroPosterPath(theme, mode);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLDivElement>): void => {
      if (event.animationName !== 'hero-poster-fade-out' || !fadeRequested) {
        return;
      }

      onFadeComplete?.();
    },
    [fadeRequested, onFadeComplete]
  );

  if (hidden) {
    return null;
  }

  return (
    <div
      className="hero-poster-overlay"
      data-poster-fading={fadeRequested ? 'true' : 'false'}
      onAnimationEnd={handleAnimationEnd}
    >
      <img
        className={className}
        src={staticSrc}
        alt=""
        aria-hidden="true"
        decoding="async"
        fetchPriority="high"
        data-poster-source="static"
      />
    </div>
  );
}

export default HeroStillImage;
