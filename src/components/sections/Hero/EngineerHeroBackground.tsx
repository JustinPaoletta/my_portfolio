import {
  Component,
  lazy,
  Suspense,
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

  return (
    <div
      className="hero-engineer-visual"
      aria-hidden="true"
      data-engineer-circuit-active={isActive ? 'true' : 'false'}
      data-engineer-circuit-motion={calmMotion ? 'calm' : 'normal'}
      data-engineer-circuit-scene={showInteractiveScene ? '3d' : 'svg'}
    >
      {showInteractiveScene ? (
        <EngineerSceneErrorBoundary
          fallback={svgFallback}
          onSceneError={() => setHasSceneError(true)}
        >
          <Suspense fallback={svgFallback}>
            <EngineerCircuit3D
              isActive={isActive}
              reducedMotion={reducedMotion}
              calmMotion={calmMotion}
              mode={mode}
            />
          </Suspense>
        </EngineerSceneErrorBoundary>
      ) : (
        svgFallback
      )}
    </div>
  );
}

export default EngineerHeroBackground;
