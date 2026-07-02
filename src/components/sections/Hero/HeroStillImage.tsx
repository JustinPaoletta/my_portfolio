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
  /** When set, replaces the static poster with a live canvas snapshot. */
  liveSrc?: string;
};

function HeroStillImage({
  theme,
  mode,
  className,
  hidden = false,
  liveSrc,
}: HeroStillImageProps): React.ReactElement {
  const staticSrc = useHeroPosterPath(theme, mode);

  return (
    <img
      className={className}
      src={liveSrc ?? staticSrc}
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchPriority="high"
      data-poster-hidden={hidden ? 'true' : 'false'}
      data-poster-source={liveSrc ? 'canvas' : 'static'}
    />
  );
}

export default HeroStillImage;
