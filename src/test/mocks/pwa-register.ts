import { vi } from 'vitest';

/**
 * Mock for virtual:pwa-register/react module
 * Used in tests to avoid dependency on actual PWA plugin
 */
export function useRegisterSW() {
  return {
    needRefresh: [false, vi.fn()] as [boolean, (value: boolean) => void],
    offlineReady: [false, vi.fn()] as [boolean, (value: boolean) => void],
    updateServiceWorker: vi.fn(),
  };
}
