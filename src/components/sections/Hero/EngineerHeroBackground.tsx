import {
  Component,
  lazy,
  Suspense,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
import EngineerCircuitBoard from '@/components/sections/Hero/EngineerCircuitBoard/EngineerCircuitBoard';
import HeroStillImage from '@/components/sections/Hero/HeroStillImage';
import { useSequentialSceneReveal } from '@/components/sections/Hero/useSequentialSceneReveal';

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

type EngineerSceneErrorBoundaryProps = {
  children: ReactNode;
  fallback: ReactNode;
  onSceneError: () => void;
};

type EngineerSceneErrorBoundaryState = {
  hasError: boolean;
};

class EngineerSceneErrorBoundary extends Component<
  EngineerSceneErrorBoundaryProps,
  EngineerSceneErrorBoundaryState
> {
  state: EngineerSceneErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): EngineerSceneErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) {
      console.error(
        '[EngineerHeroBackground] Failed to load interactive scene:',
        error,
        errorInfo
      );
    }

    this.props.onSceneError();
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

type EngineerInteractiveBackgroundProps = Omit<
  EngineerHeroBackgroundProps,
  'isVisualTest' | 'shouldLoadScene'
> & {
  fallback: ReactNode;
  onSceneError: () => void;
};

function EngineerInteractiveBackground({
  isActive,
  reducedMotion,
  calmMotion,
  mode,
  fallback,
  onSceneError,
}: EngineerInteractiveBackgroundProps): React.ReactElement {
  const { isSceneReady, isPosterHidden, transitionPhase, handleSceneReady } =
    useSequentialSceneReveal();

  return (
    <div
      className="hero-engineer-visual"
      aria-hidden="true"
      data-engineer-circuit-active={isActive ? 'true' : 'false'}
      data-engineer-circuit-motion={calmMotion ? 'calm' : 'normal'}
      data-engineer-circuit-scene={isSceneReady ? '3d' : 'poster'}
      data-engineer-circuit-poster={isPosterHidden ? 'hidden' : 'visible'}
      data-engineer-circuit-transition={transitionPhase}
    >
      <div className="hero-engineer-stage">
        <HeroStillImage
          theme="engineer"
          mode={mode}
          className="hero-engineer-still"
          hidden={isPosterHidden}
        />
        <EngineerSceneErrorBoundary
          fallback={fallback}
          onSceneError={onSceneError}
        >
          <Suspense fallback={null}>
            <EngineerCircuit3D
              isActive={isActive}
              reducedMotion={reducedMotion}
              calmMotion={calmMotion}
              mode={mode}
              onSceneReady={handleSceneReady}
            />
          </Suspense>
        </EngineerSceneErrorBoundary>
      </div>
    </div>
  );
}

function EngineerHeroBackground({
  isActive,
  reducedMotion,
  isVisualTest,
  shouldLoadScene,
  calmMotion,
  mode,
}: EngineerHeroBackgroundProps): React.ReactElement {
  const [hasSceneError, setHasSceneError] = useState(false);
  const showInteractiveScene =
    shouldLoadScene && !isVisualTest && !reducedMotion && !hasSceneError;
  const svgFallback = (
    <EngineerCircuitBoard
      isActive={isActive}
      frozen={reducedMotion || isVisualTest}
      calmMotion={calmMotion}
    />
  );

  if (showInteractiveScene) {
    return (
      <EngineerInteractiveBackground
        isActive={isActive}
        reducedMotion={reducedMotion}
        calmMotion={calmMotion}
        mode={mode}
        fallback={svgFallback}
        onSceneError={() => setHasSceneError(true)}
      />
    );
  }

  return (
    <div
      className="hero-engineer-visual"
      aria-hidden="true"
      data-engineer-circuit-active={isActive ? 'true' : 'false'}
      data-engineer-circuit-motion={calmMotion ? 'calm' : 'normal'}
      data-engineer-circuit-scene="svg"
      data-engineer-circuit-poster="hidden"
    >
      <div className="hero-engineer-stage">{svgFallback}</div>
    </div>
  );
}

export default EngineerHeroBackground;
