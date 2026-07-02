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
};

function HeroStillImage({
  theme,
  mode,
  className,
  hidden = false,
}: HeroStillImageProps): React.ReactElement {
  const src = useHeroPosterPath(theme, mode);

  return (
    <img
      className={className}
      src={src}
      alt=""
      aria-hidden="true"
      decoding="async"
      fetchPriority="high"
      data-poster-hidden={hidden ? 'true' : 'false'}
    />
  );
}

export default HeroStillImage;
