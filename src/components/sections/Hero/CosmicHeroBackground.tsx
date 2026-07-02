import { lazy, Suspense, useRef } from 'react';
import HeroStillImage from '@/components/sections/Hero/HeroStillImage';
import { useSequentialSceneReveal } from '@/components/sections/Hero/useSequentialSceneReveal';
import { useCanvasPosterSync } from '@/hooks/useCanvasPosterSync';

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

type CosmicPosterBackgroundProps = {
  mode: 'dark' | 'light';
};

function CosmicPosterBackground({
  mode,
}: CosmicPosterBackgroundProps): React.ReactElement {
  return (
    <div
      className="hero-background"
      data-cosmic-theme="true"
      data-cosmic-scene="poster"
      data-cosmic-poster="visible"
      aria-hidden="true"
    >
      <div className="hero-cosmic-stage">
        <HeroStillImage
          theme="cosmic"
          mode={mode}
          className="hero-cosmic-still"
        />
      </div>
    </div>
  );
}

type CosmicInteractiveBackgroundProps = Omit<
  CosmicHeroBackgroundProps,
  'isVisualTest' | 'shouldLoadScene'
>;

function CosmicInteractiveBackground({
  isActive,
  reducedMotion,
  calmMotion,
  mode,
}: CosmicInteractiveBackgroundProps): React.ReactElement {
  const isLivePosterReadyRef = useRef(false);
  const {
    isSceneReady,
    isPosterHidden,
    isPosterFadeRequested,
    transitionPhase,
    handleSceneReady,
    handlePosterFadeComplete,
  } = useSequentialSceneReveal({ reducedMotion, isLivePosterReadyRef });
  const { livePosterSrc, handleCanvasFrame } = useCanvasPosterSync(
    isPosterHidden,
    {
      onLivePosterReady: (ready) => {
        isLivePosterReadyRef.current = ready;
      },
    }
  );

  return (
    <div
      className="hero-background"
      data-cosmic-theme="true"
      data-cosmic-scene={isSceneReady ? '3d' : 'poster'}
      data-cosmic-poster={isPosterHidden ? 'hidden' : 'visible'}
      data-cosmic-transition={transitionPhase}
      aria-hidden="true"
    >
      <div className="hero-cosmic-stage">
        <HeroStillImage
          theme="cosmic"
          mode={mode}
          className="hero-cosmic-still"
          hidden={isPosterHidden}
          fadeRequested={isPosterFadeRequested}
          liveSrc={isPosterHidden ? undefined : livePosterSrc}
          onFadeComplete={handlePosterFadeComplete}
        />
        <Suspense fallback={null}>
          <CosmicScene3D
            isActive={isActive}
            reducedMotion={reducedMotion}
            calmMotion={calmMotion}
            mode={mode}
            onSceneReady={handleSceneReady}
            onCanvasFrame={handleCanvasFrame}
            syncPoster={!isPosterHidden}
          />
        </Suspense>
      </div>
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
    return <CosmicPosterBackground mode={mode} />;
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
