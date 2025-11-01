/**
 * New Relic Browser Agent Utility
 * Error monitoring and performance tracking
 */

import { BrowserAgent } from '@newrelic/browser-agent/loaders/browser-agent';
import { env } from '@/config/env';

// Type definitions for New Relic API
interface NewRelicCustomAttributes {
  [key: string]: string | number | boolean | undefined;
}

let agent: BrowserAgent | null = null;
let isInitialized = false;

/**
 * Initialize New Relic Browser Agent
 * Should be called once at application startup
 */
export function initializeNewRelic(): void {
  // Skip if monitoring is disabled or not configured
  if (
    !env.features.errorMonitoring ||
    !env.monitoring.newrelic.accountId ||
    !env.monitoring.newrelic.trustKey ||
    !env.monitoring.newrelic.agentId ||
    !env.monitoring.newrelic.licenseKey ||
    !env.monitoring.newrelic.applicationId
  ) {
    if (env.app.isDevelopment) {
      console.log('[New Relic] Skipped - disabled or not configured');
    }
    return;
  }

  // Skip if already initialized
  if (isInitialized) {
    if (env.app.isDevelopment) {
      console.log('[New Relic] Already initialized');
    }
    return;
  }

  try {
    // Initialize the New Relic Browser Agent
    agent = new BrowserAgent({
      init: {
        distributed_tracing: { enabled: true },
        privacy: { cookies_enabled: true },
        ajax: { deny_list: env.monitoring.newrelic.ajaxDenyList },
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

    if (env.app.isDevelopment) {
      console.log('[New Relic] Successfully initialized');
    }

    // Set global attributes
    setGlobalAttributes({
      environment: env.app.mode,
      appVersion: env.app.version,
      isDevelopment: env.app.isDevelopment,
    });
  } catch (error) {
    if (error instanceof Error) {
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
  // Skip if not initialized or monitoring is disabled
  if (!isInitialized || !env.features.errorMonitoring) {
    if (env.app.isDevelopment) {
      console.log('[New Relic] Error not reported - not initialized:', error);
    }
    return;
  }

  try {
    // Use the noticeError API - it accepts Error or string
    if (agent && typeof agent.noticeError === 'function') {
      agent.noticeError(error, customAttributes);

      if (env.app.isDevelopment) {
        console.log('[New Relic] Error reported:', error, customAttributes);
      }
    }
  } catch (reportError) {
    if (reportError instanceof Error) {
      console.error('[New Relic] Failed to report error:', reportError.message);
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

      if (env.app.isDevelopment) {
        console.log('[New Relic] Global attributes set:', attributes);
      }
    }
  } catch (error) {
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

      if (env.app.isDevelopment) {
        console.log('[New Relic] Page action tracked:', name, attributes);
      }
    }
  } catch (error) {
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
  } catch (error) {
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
    } catch (error) {
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
