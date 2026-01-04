/**
 * New Relic Browser Agent Utility
 * Error monitoring and performance tracking
 *
 * Uses MicroAgent instead of BrowserAgent for smaller bundle size (~80% reduction).
 * MicroAgent supports: Page View, Page Action, and Error events (manual only).
 * This is sufficient for our use case of error monitoring and custom events.
 *
 * @see https://www.npmjs.com/package/@newrelic/browser-agent#deploying-one-or-more-micro-agents-per-page
 */

import { MicroAgent } from '@newrelic/browser-agent/loaders/micro-agent';
import { env } from '@/config/env';

// Type definitions for New Relic API
interface NewRelicCustomAttributes {
  [key: string]: string | number | boolean | undefined;
}

let agent: MicroAgent | null = null;
let isInitialized = false;
const monitoringEnabled = __ENABLE_ERROR_MONITORING__;
const shouldLog = import.meta.env.DEV && __ENABLE_DEBUG_TOOLS__;

/**
 * Initialize New Relic Browser Agent
 * Should be called once at application startup
 */
export function initializeNewRelic(): void {
  if (!monitoringEnabled) {
    if (shouldLog) {
      console.log('[New Relic] Skipped - disabled by feature flag');
    }
    return;
  }

  if (
    !env.features.errorMonitoring ||
    !env.monitoring.newrelic.accountId ||
    !env.monitoring.newrelic.trustKey ||
    !env.monitoring.newrelic.agentId ||
    !env.monitoring.newrelic.licenseKey ||
    !env.monitoring.newrelic.applicationId
  ) {
    if (shouldLog) {
      console.log('[New Relic] Skipped - disabled or not configured');
    }
    return;
  }

  if (isInitialized) {
    if (shouldLog) {
      console.log('[New Relic] Already initialized');
    }
    return;
  }

  try {
    agent = new MicroAgent({
      init: {
        distributed_tracing: { enabled: true },
        privacy: { cookies_enabled: true },
        ajax: { deny_list: env.monitoring.newrelic.ajaxDenyList },
        // MicroAgent requires explicit feature configuration
        jserrors: { enabled: true, autoStart: true },
        metrics: { enabled: true, autoStart: true },
        generic_events: { enabled: true, autoStart: true },
      },
      info: {
        beacon: 'bam.nr-data.net',
        errorBeacon: 'bam.nr-data.net',
        licenseKey: env.monitoring.newrelic.licenseKey,
        applicationID: env.monitoring.newrelic.applicationId,
        sa: 1,
      },
      loader_config: {
        accountID: env.monitoring.newrelic.accountId,
        trustKey: env.monitoring.newrelic.trustKey,
        agentID: env.monitoring.newrelic.agentId,
        licenseKey: env.monitoring.newrelic.licenseKey,
        applicationID: env.monitoring.newrelic.applicationId,
      },
    });

    isInitialized = true;

    if (shouldLog) {
      console.log('[New Relic] Successfully initialized');
    }

    setGlobalAttributes({
      environment: env.app.mode,
      appVersion: env.app.version,
      isDevelopment: env.app.isDevelopment,
    });
  } catch (error: unknown) {
    if (error instanceof Error && shouldLog) {
      console.error('[New Relic] Initialization failed:', error.message);
    }
  }
}

/**
 * Report an error to New Relic
 * @param error - The error object or message
 * @param customAttributes - Optional custom attributes to attach
 */
export function reportError(
  error: Error | string,
  customAttributes?: NewRelicCustomAttributes
): void {
  if (!monitoringEnabled || !isInitialized || !env.features.errorMonitoring) {
    if (shouldLog) {
      console.log('[New Relic] Error not reported - not initialized:', error);
    }
    return;
  }

  try {
    if (agent && typeof agent.noticeError === 'function') {
      agent.noticeError(error, customAttributes);

      if (shouldLog) {
        console.log('[New Relic] Error reported:', error, customAttributes);
      }
    }
  } catch (reportErr: unknown) {
    if (reportErr instanceof Error && shouldLog) {
      console.error('[New Relic] Failed to report error:', reportErr.message);
    }
  }
}

/**
 * Set custom attributes for all events
 * @param attributes - Key-value pairs of attributes
 */
export function setGlobalAttributes(
  attributes: NewRelicCustomAttributes
): void {
  if (!isInitialized || !agent) {
    return;
  }

  try {
    if (typeof agent.setCustomAttribute === 'function') {
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== undefined && agent) {
          agent.setCustomAttribute(key, value);
        }
      });

      if (shouldLog) {
        console.log('[New Relic] Global attributes set:', attributes);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error(
        '[New Relic] Failed to set global attributes:',
        error.message
      );
    }
  }
}

/**
 * Set a user identifier for tracking
 * @param userId - The user's unique identifier
 * @param userName - Optional user name
 * @param userEmail - Optional user email
 */
export function setUser(
  userId: string,
  userName?: string,
  userEmail?: string
): void {
  const attributes: NewRelicCustomAttributes = {
    userId,
    ...(userName && { userName }),
    ...(userEmail && { userEmail }),
  };

  setGlobalAttributes(attributes);
}

/**
 * Track a custom page action/event
 * @param name - Name of the action
 * @param attributes - Optional attributes
 */
export function trackPageAction(
  name: string,
  attributes?: NewRelicCustomAttributes
): void {
  if (!isInitialized || !agent) {
    return;
  }

  try {
    if (typeof agent.addPageAction === 'function') {
      agent.addPageAction(name, attributes);

      if (shouldLog) {
        console.log('[New Relic] Page action tracked:', name, attributes);
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[New Relic] Failed to track page action:', error.message);
    }
  }
}

/**
 * Add custom timing measurement
 * @param name - Name of the timing
 * @param startTime - Start time in milliseconds
 */
export function addTiming(name: string, startTime: number): void {
  if (!isInitialized || !agent) {
    return;
  }

  try {
    const duration = performance.now() - startTime;
    trackPageAction('customTiming', { name, duration });

    if (env.app.isDevelopment) {
      console.log(`[New Relic] Custom timing "${name}": ${duration}ms`);
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('[New Relic] Failed to add timing:', error.message);
    }
  }
}

/**
 * Check if New Relic is initialized and ready
 */
export function isNewRelicReady(): boolean {
  return isInitialized && agent !== null;
}

/**
 * Helper to wrap async functions with error reporting
 * @param fn - The async function to wrap
 * @param errorContext - Additional context for errors
 */
export function withErrorReporting<T extends unknown[], R>(
  fn: (...args: T) => Promise<R>,
  errorContext?: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args);
    } catch (error: unknown) {
      if (error instanceof Error) {
        reportError(error, {
          context: errorContext || fn.name || 'unknown',
          functionName: fn.name,
        });
      }
      throw error;
    }
  };
}

/**
 * New Relic monitoring utilities
 */
export const newrelic = {
  initialize: initializeNewRelic,
  reportError,
  setGlobalAttributes,
  setUser,
  trackPageAction,
  addTiming,
  isReady: isNewRelicReady,
  withErrorReporting,
};

export default newrelic;
