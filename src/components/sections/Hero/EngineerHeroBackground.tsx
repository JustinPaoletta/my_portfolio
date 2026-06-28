import { lazy, Suspense } from 'react';
import EngineerCircuitBoard from '@/components/sections/Hero/EngineerCircuitBoard/EngineerCircuitBoard';

const EngineerCircuit3D = lazy(
  () => import('@/components/sections/Hero/EngineerCircuit3D')
);

export type EngineerHeroBackgroundProps = {
  isActive: boolean;
  reducedMotion: boolean;
  isVisualTest: boolean;
  shouldLoadScene: boolean;
  calmMotion: boolean;
  mode: 'dark' | 'light';
};

function EngineerHeroBackground({
  isActive,
  reducedMotion,
  isVisualTest,
  shouldLoadScene,
  calmMotion,
  mode,
}: EngineerHeroBackgroundProps): React.ReactElement {
  const showInteractiveScene =
    shouldLoadScene && !isVisualTest && !reducedMotion;

  return (
    <div
      className="hero-engineer-visual"
      aria-hidden="true"
      data-engineer-circuit-active={isActive ? 'true' : 'false'}
      data-engineer-circuit-motion={calmMotion ? 'calm' : 'normal'}
      data-engineer-circuit-scene={showInteractiveScene ? '3d' : 'svg'}
    >
      {showInteractiveScene ? (
        <Suspense fallback={null}>
          <EngineerCircuit3D
            isActive={isActive}
            reducedMotion={reducedMotion}
            calmMotion={calmMotion}
            mode={mode}
          />
        </Suspense>
      ) : (
        <EngineerCircuitBoard
          isActive={isActive}
          frozen={reducedMotion || isVisualTest}
          calmMotion={calmMotion}
        />
      )}
    </div>
  );
}

export default EngineerHeroBackground;
