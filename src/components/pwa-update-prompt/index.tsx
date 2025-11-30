import { usePWA } from '@/hooks/usePWA';
import './PWAUpdatePrompt.css';

/**
 * Component to prompt user when a PWA update is available
 * or when the app is ready for offline use
 */
export default function PWAUpdatePrompt() {
  const { needRefresh, offlineReady, updateServiceWorker, closePrompt } =
    usePWA();

  // Don't render anything if no updates and not offline ready
  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div className="pwa-toast" role="alert" aria-live="polite">
      <div className="pwa-toast-content">
        {needRefresh && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon">🔄</span>
            <div>
              <p className="pwa-toast-title">Update Available</p>
              <p className="pwa-toast-description">
                A new version of this app is available
              </p>
            </div>
          </div>
        )}

        {offlineReady && !needRefresh && (
          <div className="pwa-toast-message">
            <span className="pwa-toast-icon">✅</span>
            <div>
              <p className="pwa-toast-title">Ready for Offline Use</p>
              <p className="pwa-toast-description">
                This app now works offline
              </p>
            </div>
          </div>
        )}

        <div className="pwa-toast-actions">
          {needRefresh && (
            <button
              className="pwa-toast-button pwa-toast-button-primary"
              onClick={() => updateServiceWorker(true)}
              aria-label="Reload to update app"
            >
              Reload
            </button>
          )}
          <button
            className="pwa-toast-button pwa-toast-button-secondary"
            onClick={closePrompt}
            aria-label="Close update notification"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
