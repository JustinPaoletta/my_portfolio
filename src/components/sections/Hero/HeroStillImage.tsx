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
  /** When set, replaces the static poster with a live canvas snapshot. */
  liveSrc?: string;
  onFadeComplete?: () => void;
};

function HeroStillImage({
  theme,
  mode,
  className,
  hidden = false,
  fadeRequested = false,
  liveSrc,
  onFadeComplete,
}: HeroStillImageProps): React.ReactElement {
  const staticSrc = useHeroPosterPath(theme, mode);

  const handleAnimationEnd = useCallback(
    (event: React.AnimationEvent<HTMLImageElement>): void => {
      if (event.animationName !== 'hero-poster-fade-out' || !fadeRequested) {
        return;
      }

      onFadeComplete?.();
    },
    [fadeRequested, onFadeComplete]
  );

  return (
    <img
      className={className}
      src={liveSrc ?? staticSrc}
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchPriority="high"
      data-poster-hidden={hidden ? 'true' : 'false'}
      data-poster-fading={fadeRequested ? 'true' : 'false'}
      data-poster-source={liveSrc ? 'canvas' : 'static'}
      onAnimationEnd={handleAnimationEnd}
    />
  );
}

export default HeroStillImage;
