import { vi } from 'vitest';

/**
 * Mock for virtual:pwa-register/react module
 * Used in tests to avoid dependency on actual PWA plugin
 * Matches the signature from pwa-register-wrapper.ts
 */
export function useRegisterSW(options?: {
  onRegistered?: (registration: ServiceWorkerRegistration | undefined) => void;
  onRegisterError?: (error: Error) => void;
}) {
  // Call callbacks if provided (for testing callback behavior)
  if (options?.onRegistered) {
    // Simulate successful registration in tests
    options.onRegistered(undefined);
  }

  return {
    needRefresh: [false, vi.fn() as (value: boolean) => void] as [
      boolean,
      (value: boolean) => void,
    ],
    offlineReady: [false, vi.fn() as (value: boolean) => void] as [
      boolean,
      (value: boolean) => void,
    ],
    updateServiceWorker: vi
      .fn()
      .mockImplementation(() => Promise.resolve()) as (
      reloadPage?: boolean
    ) => Promise<void>,
  };
}
