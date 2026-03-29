export interface AppConfig {
  app: {
    title: string;
    description: string;
    version: string;
    isDevelopment: boolean;
    isProduction: boolean;
    mode: string;
  };
  api: {
    url: string;
    timeout: number;
  };
  features: {
    analytics: boolean;
    debug: boolean;
    errorMonitoring: boolean;
  };
  services: {
    googleAnalyticsId?: string;
    mapboxToken?: string;
  };
  analytics: {
    umami: {
      websiteId?: string;
      src: string;
    };
  };
  monitoring: {
    newrelic: {
      accountId?: string;
      trustKey?: string;
      agentId?: string;
      licenseKey?: string;
      applicationId?: string;
      ajaxDenyList: string[];
    };
  };
  social: {
    github: string;
    linkedin: string;
    email: string;
  };
  github: {
    username: string;
    apiEnabled: boolean;
  };
  site: {
    url?: string;
  };
}

type RawEnv = Record<string, string | undefined>;

interface BuildContext {
  mode: string;
  version: string;
  analyticsEnabled: boolean;
  debugEnabled: boolean;
  errorMonitoringEnabled: boolean;
}

function requiredString(rawEnv: RawEnv, key: string): string {
  const value = rawEnv[key]?.trim();
  if (!value) {
    throw new Error(`[env] ${key} is required.`);
  }
  return value;
}

function optionalString(rawEnv: RawEnv, key: string): string | undefined {
  const value = rawEnv[key]?.trim();
  return value ? value : undefined;
}

function requiredUrl(rawEnv: RawEnv, key: string): string {
  const value = requiredString(rawEnv, key);
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }
  } catch {
    throw new Error(`[env] ${key} must be a valid http(s) URL.`);
  }
  return value;
}

function optionalUrl(rawEnv: RawEnv, key: string): string | undefined {
  const value = optionalString(rawEnv, key);
  if (!value) {
    return undefined;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('unsupported protocol');
    }
  } catch {
    throw new Error(`[env] ${key} must be a valid http(s) URL when provided.`);
  }

  return value;
}

function requiredEmail(rawEnv: RawEnv, key: string): string {
  const value = requiredString(rawEnv, key);
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(value)) {
    throw new Error(`[env] ${key} must be a valid email address.`);
  }
  return value;
}

function requiredPositiveInt(
  rawEnv: RawEnv,
  key: string,
  fallback: number
): number {
  const rawValue = rawEnv[key]?.trim();
  if (!rawValue) {
    return fallback;
  }

  const value = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`[env] ${key} must be a positive integer.`);
  }
  return value;
}

function optionalCsv(rawEnv: RawEnv, key: string): string[] {
  const value = optionalString(rawEnv, key);
  return value
    ? value
        .split(',')
        .map((part) => part.trim())
        .filter(Boolean)
    : [];
}

function requiredGitHubUsername(rawEnv: RawEnv, key: string): string {
  const value = requiredString(rawEnv, key);
  const usernamePattern = /^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/;
  if (!usernamePattern.test(value)) {
    throw new Error(`[env] ${key} must be a valid GitHub username.`);
  }
  return value;
}

export function createAppConfig(
  rawEnv: RawEnv,
  context: BuildContext
): AppConfig {
  const isDevelopment = context.mode === 'development';
  const isProduction = context.mode === 'production';
  const analyticsConfigured = Boolean(
    optionalString(rawEnv, 'VITE_UMAMI_WEBSITE_ID')
  );

  return {
    app: {
      title: requiredString(rawEnv, 'VITE_APP_TITLE'),
      description: requiredString(rawEnv, 'VITE_APP_DESCRIPTION'),
      version: context.version,
      isDevelopment,
      isProduction,
      mode: context.mode,
    },
    api: {
      url: requiredUrl(rawEnv, 'VITE_API_URL'),
      timeout: requiredPositiveInt(rawEnv, 'VITE_API_TIMEOUT', 5000),
    },
    features: {
      analytics: context.analyticsEnabled && analyticsConfigured,
      debug: context.debugEnabled,
      errorMonitoring: context.errorMonitoringEnabled,
    },
    services: {
      googleAnalyticsId: optionalString(rawEnv, 'VITE_GOOGLE_ANALYTICS_ID'),
      mapboxToken: optionalString(rawEnv, 'VITE_MAPBOX_TOKEN'),
    },
    analytics: {
      umami: {
        websiteId: optionalString(rawEnv, 'VITE_UMAMI_WEBSITE_ID'),
        src:
          optionalUrl(rawEnv, 'VITE_UMAMI_SRC') ??
          'https://cloud.umami.is/script.js',
      },
    },
    monitoring: {
      newrelic: {
        accountId: optionalString(rawEnv, 'VITE_NEWRELIC_ACCOUNT_ID'),
        trustKey: optionalString(rawEnv, 'VITE_NEWRELIC_TRUST_KEY'),
        agentId: optionalString(rawEnv, 'VITE_NEWRELIC_AGENT_ID'),
        licenseKey: optionalString(rawEnv, 'VITE_NEWRELIC_LICENSE_KEY'),
        applicationId: optionalString(rawEnv, 'VITE_NEWRELIC_APPLICATION_ID'),
        ajaxDenyList: optionalCsv(rawEnv, 'VITE_NEWRELIC_AJAX_DENY_LIST'),
      },
    },
    social: {
      github: requiredUrl(rawEnv, 'VITE_GITHUB_URL'),
      linkedin: requiredUrl(rawEnv, 'VITE_LINKEDIN_URL'),
      email: requiredEmail(rawEnv, 'VITE_EMAIL'),
    },
    github: {
      username: requiredGitHubUsername(rawEnv, 'VITE_GITHUB_USERNAME'),
      apiEnabled:
        rawEnv.VITE_GITHUB_API_ENABLED === 'true' ||
        rawEnv.VITE_GITHUB_API_ENABLED === '1',
    },
    site: {
      url: optionalUrl(rawEnv, 'VITE_SITE_URL'),
    },
  };
}
