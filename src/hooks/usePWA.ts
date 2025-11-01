import { useEffect, useState } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

/**
 * Hook for managing PWA updates and installation
 */
export function usePWA() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);

  const {
    needRefresh: [needRefreshState, setNeedRefreshState],
    offlineReady: [offlineReadyState, setOfflineReadyState],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(registration) {
      console.log('✅ Service Worker registered:', registration);
    },
    onRegisterError(error) {
      console.error('❌ Service Worker registration error:', error);
    },
  });

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
