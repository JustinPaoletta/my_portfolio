import { lazy, Suspense } from 'react';

const CosmicScene3D = lazy(
  () => import('@/components/sections/Hero/CosmicScene3D')
);

export type CosmicHeroBackgroundProps = {
  isActive: boolean;
  reducedMotion: boolean;
  isVisualTest: boolean;
  shouldLoadScene: boolean;
  calmMotion: boolean;
  mode: 'dark' | 'light';
};

function CosmicHeroBackground({
  isActive,
  reducedMotion,
  isVisualTest,
  shouldLoadScene,
  calmMotion,
  mode,
}: CosmicHeroBackgroundProps): React.ReactElement {
  const showInteractiveScene =
    shouldLoadScene && !isVisualTest && !reducedMotion;

  return (
    <div
      className="hero-background"
      data-cosmic-theme="true"
      data-cosmic-scene={showInteractiveScene ? '3d' : 'poster'}
      aria-hidden="true"
    >
      <span className="hero-cosmic-still" />
      {showInteractiveScene ? (
        <Suspense fallback={null}>
          <CosmicScene3D
            isActive={isActive}
            reducedMotion={reducedMotion}
            calmMotion={calmMotion}
            mode={mode}
          />
        </Suspense>
      ) : null}
    </div>
  );
}

export default CosmicHeroBackground;
