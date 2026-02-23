import { useEffect, useState } from 'react';
import { useIsStandalone, usePWA } from '@/hooks/usePWA';
import './PWAUpdatePrompt.css';

const OFFLINE_READY_ACK_KEY = 'pwa-offline-ready-ack-v1';

/**
 * Component to prompt user when a PWA update is available,
 * when the app is ready for offline use, or when the app can be installed
 */
export default function PWAUpdatePrompt(): React.ReactElement | null {
  const {
    needRefresh,
    canInstall,
    isInstalling,
    updateServiceWorker,
    promptInstall,
    dismissInstall,
    closePrompt,
  } = usePWA();
  const isStandalone = useIsStandalone();
  const [showPostInstallHint, setShowPostInstallHint] = useState(false);
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine
  );
  const [hasServiceWorkerController, setHasServiceWorkerController] = useState(
    typeof navigator !== 'undefined' && 'serviceWorker' in navigator
      ? Boolean(navigator.serviceWorker.controller)
      : false
  );
  const [offlineReadyAcknowledged, setOfflineReadyAcknowledged] = useState(
    () => {
      if (typeof window === 'undefined') {
        return false;
      }
      try {
        return window.localStorage.getItem(OFFLINE_READY_ACK_KEY) === 'true';
      } catch {
        return false;
      }
    }
  );

  const showOfflineReadyConfirmation =
    !needRefresh &&
    !canInstall &&
    !showPostInstallHint &&
    isStandalone &&
    isOnline &&
    hasServiceWorkerController &&
    !offlineReadyAcknowledged;

  useEffect(() => {
    if (
      typeof window === 'undefined' ||
      typeof navigator === 'undefined' ||
      !('serviceWorker' in navigator)
    ) {
      return;
    }

    const handleOnline = (): void => setIsOnline(true);
    const handleOffline = (): void => setIsOnline(false);
    const syncController = (): void => {
      setHasServiceWorkerController(
        Boolean(navigator.serviceWorker.controller)
      );
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      syncController
    );

    syncController();
    void navigator.serviceWorker.ready.then(syncController).catch(() => {
      // Ignore readiness errors silently.
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        syncController
      );
    };
  }, []);

  // Don't render anything if no prompt state is active
  if (
    !needRefresh &&
    !canInstall &&
    !showPostInstallHint &&
    !showOfflineReadyConfirmation
  ) {
    return null;
  }

  const handleInstall = (): void => {
    void promptInstall().then((accepted) => {
      if (accepted) {
        setShowPostInstallHint(true);
      }
    });
  };

  const handleSecondaryAction = (): void => {
    if (canInstall && !needRefresh) {
      dismissInstall();
      return;
    }
    if (showPostInstallHint) {
      setShowPostInstallHint(false);
      return;
    }
    if (showOfflineReadyConfirmation) {
      try {
        window.localStorage.setItem(OFFLINE_READY_ACK_KEY, 'true');
      } catch {
        // Ignore localStorage errors silently.
      }
      setOfflineReadyAcknowledged(true);
      return;
    }
    closePrompt();
  };

  return (
    <div className="pwa-toast" role="alert" aria-live="polite">
      <div className="pwa-toast-content">
        {/* Install prompt - highest priority */}
        {canInstall && !needRefresh && !showPostInstallHint && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon" aria-hidden="true">
              📲
            </span>
            <div>
              <p className="pwa-toast-title">Install App</p>
              <p className="pwa-toast-description">
                Install this app for faster access and offline support
              </p>
            </div>
          </div>
        )}

        {/* Update available */}
        {needRefresh && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon" aria-hidden="true">
              🔄
            </span>
            <div>
              <p className="pwa-toast-title">Update Available</p>
              <p className="pwa-toast-description">
                A new version of this app is available
              </p>
            </div>
          </div>
        )}

        {/* Post-install guidance */}
        {showPostInstallHint && !needRefresh && !canInstall && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon" aria-hidden="true">
              ✅
            </span>
            <div>
              <p className="pwa-toast-title">Finish Offline Setup</p>
              <p className="pwa-toast-description">
                Open the installed app once while online on this device, then it
                can work offline here.
              </p>
            </div>
          </div>
        )}

        {/* Offline-ready confirmation (installed app context) */}
        {showOfflineReadyConfirmation && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon" aria-hidden="true">
              ✅
            </span>
            <div>
              <p className="pwa-toast-title">Ready for Offline Use</p>
              <p className="pwa-toast-description">
                Offline setup is complete on this device. You can now open this
                installed app without internet.
              </p>
            </div>
          </div>
        )}

        <div className="pwa-toast-actions">
          {/* Install button */}
          {canInstall && !needRefresh && !showPostInstallHint && (
            <button
              className="pwa-toast-button pwa-toast-button-install"
              onClick={handleInstall}
              disabled={isInstalling}
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          )}

          {/* Reload button for updates */}
          {needRefresh && (
            <button
              className="pwa-toast-button pwa-toast-button-primary"
              onClick={() => updateServiceWorker(true)}
            >
              Reload
            </button>
          )}

          {/* Close/Dismiss button */}
          <button
            className="pwa-toast-button pwa-toast-button-secondary"
            onClick={handleSecondaryAction}
          >
            {canInstall && !needRefresh
              ? 'Not Now'
              : showPostInstallHint
                ? 'Got It'
                : showOfflineReadyConfirmation
                  ? 'Got It'
                  : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
