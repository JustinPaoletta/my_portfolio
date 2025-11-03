import { useEffect, useState } from 'react';
import { useRegisterSW as useRegisterSWHook } from './pwa-register-wrapper';

/**
 * Hook for managing PWA updates and installation
 */
export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  // Always call the same hook (required by React rules of hooks)
  // The hook itself handles whether to actually register based on CI and availability
  const registerResult = useRegisterSWHook({
    onRegistered(registration) {
      console.log('✅ Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration error:', error);
    },
  });

  const needRefreshState = registerResult.needRefresh[0];
  const setNeedRefreshState = registerResult.needRefresh[1];
  const offlineReadyState = registerResult.offlineReady[0];
  const setOfflineReadyState = registerResult.offlineReady[1];
  const updateServiceWorker = registerResult.updateServiceWorker;

  useEffect(() => {
    setNeedRefresh(needRefreshState);
  }, [needRefreshState]);

  useEffect(() => {
    setOfflineReady(offlineReadyState);
  }, [offlineReadyState]);

  const closePrompt = () => {
    setOfflineReadyState(false);
    setNeedRefreshState(false);
  };

  return {
    needRefresh,
    offlineReady,
    updateServiceWorker,
    closePrompt,
  };
}

/**
 * Hook for detecting if app is running as PWA
 */
export function useIsStandalone(): boolean {
  // Initialize state directly instead of in an effect
  const [isStandalone] = useState(() => {
    // Check if app is running in standalone mode (installed PWA)
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone ||
      document.referrer.includes('android-app://')
    );
  });

  return isStandalone;
}
