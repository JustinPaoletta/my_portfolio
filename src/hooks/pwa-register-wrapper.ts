/**
 * Wrapper for PWA register hook that handles CI environment
 * In CI builds, the PWA plugin is disabled, so the virtual module doesn't exist.
 * This wrapper provides a fallback stub when the module is unavailable.
 */

// Type definition for the useRegisterSW hook
type UseRegisterSW = (options?: {
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: Error) => void;
}) => {
  needRefresh: [boolean, (value: boolean) => void];
  offlineReady: [boolean, (value: boolean) => void];
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
};

// Check if we're in CI environment (PWA plugin is disabled in CI)
const isCI = import.meta.env.CI === 'true';

// Stub hook that returns the same interface as useRegisterSW but does nothing
function useRegisterSWStub(): ReturnType<UseRegisterSW> {
  return {
    needRefresh: [false, () => {}] as [boolean, (value: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (value: boolean) => void],
    updateServiceWorker: () => Promise.resolve(),
  };
}

// Try to import the real hook
// In CI builds, skip the require attempt since the virtual module doesn't exist
let useRegisterSW: UseRegisterSW;

if (isCI) {
  // In CI, use stub immediately (PWA plugin is disabled)
  useRegisterSW = useRegisterSWStub;
} else {
  // In non-CI, try to import the real hook
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pwaModule = require('virtual:pwa-register/react') as {
      useRegisterSW: UseRegisterSW;
    };
    useRegisterSW = pwaModule.useRegisterSW;
  } catch (error: unknown) {
    // Virtual module doesn't exist (fallback to stub)
    // Error is intentionally ignored as we fall back to stub
    if (import.meta.env.DEV && error instanceof Error) {
      console.warn('[PWA] Failed to load virtual module:', error.message);
    }
    useRegisterSW = useRegisterSWStub;
  }
}

export { useRegisterSW };
