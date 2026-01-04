import { useCallback, useEffect, useRef, useState } from 'react';
import { useRegisterSW as useRegisterSWHook } from './pwa-register-wrapper';

/**
 * BeforeInstallPromptEvent interface for PWA install prompt
 * @see https://developer.mozilla.org/en-US/docs/Web/API/BeforeInstallPromptEvent
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Return type for usePWA hook
 */
export interface UsePWAReturn {
  needRefresh: boolean;
  offlineReady: boolean;
  canInstall: boolean;
  isInstalling: boolean;
  updateServiceWorker: (reloadPage?: boolean) => Promise<void>;
  promptInstall: () => Promise<boolean>;
  dismissInstall: () => void;
  closePrompt: () => void;
}

/**
 * Hook for managing PWA updates and installation
 */
export function usePWA(): UsePWAReturn {
  const [needRefresh, setNeedRefresh] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [canInstall, setCanInstall] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // Store the deferred prompt event
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  // Always call the same hook (required by React rules of hooks)
  // The hook itself handles whether to actually register based on CI and availability
  const registerResult = useRegisterSWHook({
    onRegistered(registration) {
      if (import.meta.env.DEV) {
        console.log('✅ Service Worker registered:', registration);
      }
    },
    onRegisterError(error) {
      // Only log errors in development - in production, errors should be silent
      if (import.meta.env.DEV) {
        console.error('❌ Service Worker registration error:', error);
      }
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

  // Handle beforeinstallprompt event
  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event): void => {
      // Prevent the mini-infobar from appearing on mobile
      event.preventDefault();
      // Store the event for later use
      deferredPromptRef.current = event as BeforeInstallPromptEvent;
      // Show install button
      setCanInstall(true);

      if (import.meta.env.DEV) {
        console.log('📱 PWA install prompt available');
      }
    };

    // Handle when the app is installed
    const handleAppInstalled = (): void => {
      // Clear the deferred prompt
      deferredPromptRef.current = null;
      setCanInstall(false);
      setIsInstalling(false);

      if (import.meta.env.DEV) {
        console.log('✅ PWA was installed');
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Prompt the user to install the PWA
   * @returns Promise<boolean> - true if accepted, false if dismissed
   */
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPromptRef.current) {
      if (import.meta.env.DEV) {
        console.warn('📱 Install prompt not available');
      }
      return false;
    }

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPromptRef.current.prompt();

      // Wait for the user's response
      const { outcome } = await deferredPromptRef.current.userChoice;

      if (import.meta.env.DEV) {
        console.log(`📱 User ${outcome} the install prompt`);
      }

      // Clear the deferred prompt regardless of outcome
      deferredPromptRef.current = null;
      setCanInstall(false);

      return outcome === 'accepted';
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('❌ Error showing install prompt:', error);
      }
      return false;
    } finally {
      setIsInstalling(false);
    }
  }, []);

  /**
   * Dismiss the install prompt without showing it
   */
  const dismissInstall = useCallback((): void => {
    deferredPromptRef.current = null;
    setCanInstall(false);
  }, []);

  /**
   * Close all prompts (update, offline ready, and install)
   */
  const closePrompt = useCallback((): void => {
    setOfflineReadyState(false);
    setNeedRefreshState(false);
    dismissInstall();
  }, [setOfflineReadyState, setNeedRefreshState, dismissInstall]);

  return {
    needRefresh,
    offlineReady,
    canInstall,
    isInstalling,
    updateServiceWorker,
    promptInstall,
    dismissInstall,
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
