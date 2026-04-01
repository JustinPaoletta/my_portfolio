import { useEffect, useState } from 'react';

interface UseIdleActivationOptions {
  enabled?: boolean;
  timeout?: number;
}

export default function useIdleActivation(
  options: UseIdleActivationOptions = {}
): boolean {
  const { enabled = true, timeout = 1500 } = options;
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!enabled || isActive) {
      return;
    }

    let timeoutId: number | undefined;
    let idleHandle: number | undefined;
    let cancelled = false;

    const activate = (): void => {
      if (!cancelled) {
        setIsActive(true);
      }
    };

    const scheduleActivation = (): void => {
      if (typeof window.requestIdleCallback === 'function') {
        idleHandle = window.requestIdleCallback(activate, { timeout });
        return;
      }

      timeoutId = window.setTimeout(activate, 1);
    };

    if (document.readyState === 'complete') {
      scheduleActivation();
    } else {
      const handleLoad = (): void => {
        scheduleActivation();
      };

      window.addEventListener('load', handleLoad, { once: true });

      return () => {
        cancelled = true;
        window.removeEventListener('load', handleLoad);
        if (timeoutId !== undefined) {
          window.clearTimeout(timeoutId);
        }
        if (
          idleHandle !== undefined &&
          typeof window.cancelIdleCallback === 'function'
        ) {
          window.cancelIdleCallback(idleHandle);
        }
      };
    }

    return () => {
      cancelled = true;
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
      if (
        idleHandle !== undefined &&
        typeof window.cancelIdleCallback === 'function'
      ) {
        window.cancelIdleCallback(idleHandle);
      }
    };
  }, [enabled, isActive, timeout]);

  return isActive;
}
