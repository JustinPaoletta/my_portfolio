import {
  Component,
  lazy,
  Suspense,
  useCallback,
  useState,
  type ErrorInfo,
  type ReactNode,
} from 'react';
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
  const [isSceneReady, setIsSceneReady] = useState(false);
  const handleSceneReady = useCallback((): void => {
    setIsSceneReady(true);
  }, []);

  return (
    <div
      className="hero-engineer-visual"
      aria-hidden="true"
      data-engineer-circuit-active={isActive ? 'true' : 'false'}
      data-engineer-circuit-motion={calmMotion ? 'calm' : 'normal'}
      data-engineer-circuit-scene={isSceneReady ? '3d' : 'poster'}
    >
      <span className="hero-engineer-still" />
      <EngineerSceneErrorBoundary
        fallback={fallback}
        onSceneError={onSceneError}
      >
        <Suspense fallback={fallback}>
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
    >
      <span className="hero-engineer-still" />
      {svgFallback}
    </div>
  );
}

export default EngineerHeroBackground;
