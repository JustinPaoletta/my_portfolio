import * as Sentry from '@sentry/react';
import { env } from './env';

/**
 * Initialize Sentry for error monitoring in production
 * Only runs when VITE_SENTRY_DSN is configured
 */
export const initSentry = () => {
  // Only initialize Sentry if DSN is provided and we're not in development
  if (!env.services.sentryDsn) {
    console.log('Sentry: No DSN configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: env.services.sentryDsn,

    // Set environment (production, staging, development)
    environment: env.app.mode,

    // Integrations
    integrations: [
      // Automatic instrumentation for React components
      Sentry.browserTracingIntegration(),

      // Capture user interactions (clicks, navigation)
      Sentry.replayIntegration({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance Monitoring
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production to a lower rate
    tracesSampleRate: env.app.mode === 'production' ? 0.1 : 1.0,

    // Session Replay
    // This sets the sample rate at 10%. You may want to change it to 100% while in development
    // and then sample at a lower rate in production.
    replaysSessionSampleRate: env.app.mode === 'production' ? 0.1 : 1.0,

    // If you're not already sampling the entire session, change the sample rate to 100%
    // when sampling sessions where errors occur.
    replaysOnErrorSampleRate: 1.0,

    // Filter out errors that shouldn't be sent to Sentry
    beforeSend(event, hint) {
      // Filter out errors from browser extensions
      if (
        event.exception?.values?.some((exception) =>
          exception.stacktrace?.frames?.some(
            (frame) =>
              frame.filename?.includes('extensions/') ||
              frame.filename?.includes('chrome-extension://') ||
              frame.filename?.includes('moz-extension://')
          )
        )
      ) {
        return null;
      }

      // Log errors in development for debugging
      if (env.app.mode === 'development') {
        console.error(
          'Sentry error:',
          hint.originalException || hint.syntheticException
        );
      }

      return event;
    },

    // Ignore certain errors
    ignoreErrors: [
      // Random plugins/extensions
      'top.GLOBALS',
      // See: http://blog.errorception.com/2012/03/tale-of-unfindable-js-error.html
      'originalCreateNotification',
      'canvas.contentDocument',
      'MyApp_RemoveAllHighlights',
      'http://tt.epicplay.com',
      "Can't find variable: ZiteReader",
      'jigsaw is not defined',
      'ComboSearch is not defined',
      'http://loading.retry.widdit.com/',
      'atomicFindClose',
      // Facebook borked
      'fb_xd_fragment',
      // ISP "optimizing" proxy - `Cache-Control: no-transform` seems to reduce this. (thanks @acdha)
      // See http://stackoverflow.com/questions/4113268/how-to-stop-javascript-injection-from-vodafone-proxy
      'bmi_SafeAddOnload',
      'EBCallBackMessageReceived',
      // See http://toolbar.conduit.com/Developer/HtmlAndGadget/Methods/JSInjection.aspx
      'conduitPage',
      // Network errors
      'NetworkError',
      'Network request failed',
      'Failed to fetch',
      'Load failed',
    ],

    // Don't send errors for certain URLs
    denyUrls: [
      // Browser extensions
      /extensions\//i,
      /^chrome:\/\//i,
      /^chrome-extension:\/\//i,
      /^moz-extension:\/\//i,
      // Facebook flakiness
      /graph\.facebook\.com/i,
      // Facebook blocked
      /connect\.facebook\.net\/en_US\/all\.js/i,
    ],
  });

  console.log('Sentry initialized for environment:', env.app.mode);
};

/**
 * Manually capture an exception
 */
export const captureException = (
  error: Error,
  context?: Record<string, unknown>
) => {
  if (context) {
    Sentry.setContext('custom', context);
  }
  Sentry.captureException(error);
};

/**
 * Manually capture a message
 */
export const captureMessage = (
  message: string,
  level: Sentry.SeverityLevel = 'info'
) => {
  Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setUser = (user: {
  id: string;
  email?: string;
  username?: string;
}) => {
  Sentry.setUser(user);
};

/**
 * Clear user context
 */
export const clearUser = () => {
  Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (breadcrumb: Sentry.Breadcrumb) => {
  Sentry.addBreadcrumb(breadcrumb);
};
