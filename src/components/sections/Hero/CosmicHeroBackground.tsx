import { lazy, Suspense, useCallback, useState } from 'react';

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

type CosmicInteractiveBackgroundProps = Omit<
  CosmicHeroBackgroundProps,
  'isVisualTest' | 'shouldLoadScene'
>;

function CosmicPosterBackground(): React.ReactElement {
  return (
    <div
      className="hero-background"
      data-cosmic-theme="true"
      data-cosmic-scene="poster"
      aria-hidden="true"
    >
      <span className="hero-cosmic-still" />
    </div>
  );
}

function CosmicInteractiveBackground({
  isActive,
  reducedMotion,
  calmMotion,
  mode,
}: CosmicInteractiveBackgroundProps): React.ReactElement {
  const [isSceneReady, setIsSceneReady] = useState(false);
  const handleSceneReady = useCallback((): void => {
    setIsSceneReady(true);
  }, []);

  return (
    <div
      className="hero-background"
      data-cosmic-theme="true"
      data-cosmic-scene={isSceneReady ? '3d' : 'poster'}
      aria-hidden="true"
    >
      <span className="hero-cosmic-still" />
      <Suspense fallback={null}>
        <CosmicScene3D
          isActive={isActive}
          reducedMotion={reducedMotion}
          calmMotion={calmMotion}
          mode={mode}
          onSceneReady={handleSceneReady}
        />
      </Suspense>
    </div>
  );
}

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

  if (!showInteractiveScene) {
    return <CosmicPosterBackground />;
  }

  return (
    <CosmicInteractiveBackground
      isActive={isActive}
      reducedMotion={reducedMotion}
      calmMotion={calmMotion}
      mode={mode}
    />
  );
}

export default CosmicHeroBackground;
