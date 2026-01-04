import { usePWA } from '@/hooks/usePWA';
import './PWAUpdatePrompt.css';

/**
 * Component to prompt user when a PWA update is available,
 * when the app is ready for offline use, or when the app can be installed
 */
export default function PWAUpdatePrompt(): React.ReactElement | null {
  const {
    needRefresh,
    offlineReady,
    canInstall,
    isInstalling,
    updateServiceWorker,
    promptInstall,
    closePrompt,
  } = usePWA();

  // Don't render anything if no updates, not offline ready, and can't install
  if (!needRefresh && !offlineReady && !canInstall) {
    return null;
  }

  const handleInstall = (): void => {
    void promptInstall();
  };

  return (
    <div className="pwa-toast" role="alert" aria-live="polite">
      <div className="pwa-toast-content">
        {/* Install prompt - highest priority */}
        {canInstall && !needRefresh && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon" aria-hidden="true">
              📲
            </span>
            <div>
              <p className="pwa-toast-title">Install App</p>
              <p className="pwa-toast-description">
                Add this app to your home screen for quick access
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

        {/* Offline ready - only show if nothing else is showing */}
        {offlineReady && !needRefresh && !canInstall && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon" aria-hidden="true">
              ✅
            </span>
            <div>
              <p className="pwa-toast-title">Ready for Offline Use</p>
              <p className="pwa-toast-description">
                This app now works offline
              </p>
            </div>
          </div>
        )}

        <div className="pwa-toast-actions">
          {/* Install button */}
          {canInstall && !needRefresh && (
            <button
              className="pwa-toast-button pwa-toast-button-install"
              onClick={handleInstall}
              disabled={isInstalling}
              aria-label="Install app to your device"
            >
              {isInstalling ? 'Installing...' : 'Install'}
            </button>
          )}

          {/* Reload button for updates */}
          {needRefresh && (
            <button
              className="pwa-toast-button pwa-toast-button-primary"
              onClick={() => updateServiceWorker(true)}
              aria-label="Reload to update app"
            >
              Reload
            </button>
          )}

          {/* Close/Dismiss button */}
          <button
            className="pwa-toast-button pwa-toast-button-secondary"
            onClick={closePrompt}
            aria-label={
              canInstall ? 'Dismiss install prompt' : 'Close notification'
            }
          >
            {canInstall && !needRefresh ? 'Not Now' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
