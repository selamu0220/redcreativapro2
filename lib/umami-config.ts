/**
 * Umami Analytics Configuration
 * Handles environment variables, validation, and configuration for Umami integration
 */

export interface UmamiConfig {
  websiteId: string;
  scriptUrl: string;
  domains?: string[];
  enableTimeTracking: boolean;
  batchEvents: boolean;
  respectDNT: boolean;
  batchSize: number;
  flushInterval: number;
}

export interface UmamiEnvironmentVariables {
  NEXT_PUBLIC_UMAMI_WEBSITE_ID?: string;
  NEXT_PUBLIC_UMAMI_SCRIPT_URL?: string;
  NEXT_PUBLIC_UMAMI_DOMAINS?: string;
}

/**
 * Configuration validation error types
 */
export class UmamiConfigError extends Error {
  constructor(message: string, public field?: string) {
    super(message);
    this.name = 'UmamiConfigError';
  }
}

/**
 * Validates Umami configuration
 */
export function validateUmamiConfig(config: Partial<UmamiConfig>): void {
  if (!config.websiteId) {
    throw new UmamiConfigError('Website ID is required', 'websiteId');
  }

  if (!config.scriptUrl) {
    throw new UmamiConfigError('Script URL is required', 'scriptUrl');
  }

  // Validate website ID format (should be a UUID-like string)
  const websiteIdRegex = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
  if (!websiteIdRegex.test(config.websiteId)) {
    throw new UmamiConfigError('Website ID must be a valid UUID format', 'websiteId');
  }

  // Validate script URL format
  try {
    const url = new URL(config.scriptUrl);
    if (!url.protocol.startsWith('http')) {
      throw new UmamiConfigError('Script URL must use HTTP or HTTPS protocol', 'scriptUrl');
    }
  } catch (error) {
    throw new UmamiConfigError('Script URL must be a valid URL', 'scriptUrl');
  }

  // Validate domains if provided
  if (config.domains && config.domains.length > 0) {
    config.domains.forEach((domain, index) => {
      if (!domain || typeof domain !== 'string') {
        throw new UmamiConfigError(`Domain at index ${index} must be a non-empty string`, 'domains');
      }
      
      // Basic domain validation
      const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9])*$/;
      if (!domainRegex.test(domain)) {
        throw new UmamiConfigError(`Invalid domain format: ${domain}`, 'domains');
      }
    });
  }

  // Validate batch size
  if (config.batchSize !== undefined && (config.batchSize < 1 || config.batchSize > 100)) {
    throw new UmamiConfigError('Batch size must be between 1 and 100', 'batchSize');
  }

  // Validate flush interval
  if (config.flushInterval !== undefined && (config.flushInterval < 1000 || config.flushInterval > 60000)) {
    throw new UmamiConfigError('Flush interval must be between 1000ms and 60000ms', 'flushInterval');
  }
}

/**
 * Creates Umami configuration from environment variables
 */
export function createUmamiConfig(): UmamiConfig | null {
  const env: UmamiEnvironmentVariables = {
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    NEXT_PUBLIC_UMAMI_DOMAINS: process.env.NEXT_PUBLIC_UMAMI_DOMAINS,
  };

  // Return null if required environment variables are missing
  if (!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID || !env.NEXT_PUBLIC_UMAMI_SCRIPT_URL) {
    return null;
  }

  const config: UmamiConfig = {
    websiteId: env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    scriptUrl: env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    domains: env.NEXT_PUBLIC_UMAMI_DOMAINS 
      ? env.NEXT_PUBLIC_UMAMI_DOMAINS.split(',').map(d => d.trim())
      : undefined,
    enableTimeTracking: true, // Default to enabled
    batchEvents: true, // Default to enabled for performance
    respectDNT: true, // Default to respecting Do Not Track
    batchSize: 10, // Default batch size
    flushInterval: 5000, // Default flush interval (5 seconds)
  };

  try {
    validateUmamiConfig(config);
    return config;
  } catch (error) {
    console.warn('Umami configuration validation failed:', error);
    return null;
  }
}

/**
 * Gets Umami configuration with fallback handling
 */
export function getUmamiConfig(): UmamiConfig | null {
  try {
    return createUmamiConfig();
  } catch (error) {
    console.warn('Failed to create Umami configuration:', error);
    return null;
  }
}

/**
 * Checks if Umami is properly configured
 */
export function isUmamiConfigured(): boolean {
  return getUmamiConfig() !== null;
}

/**
 * Gets configuration status for debugging
 */
export function getUmamiConfigStatus(): {
  configured: boolean;
  websiteId: boolean;
  scriptUrl: boolean;
  domains: boolean;
  error?: string;
} {
  const env: UmamiEnvironmentVariables = {
    NEXT_PUBLIC_UMAMI_WEBSITE_ID: process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    NEXT_PUBLIC_UMAMI_SCRIPT_URL: process.env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    NEXT_PUBLIC_UMAMI_DOMAINS: process.env.NEXT_PUBLIC_UMAMI_DOMAINS,
  };

  const status = {
    configured: false,
    websiteId: !!env.NEXT_PUBLIC_UMAMI_WEBSITE_ID,
    scriptUrl: !!env.NEXT_PUBLIC_UMAMI_SCRIPT_URL,
    domains: !!env.NEXT_PUBLIC_UMAMI_DOMAINS,
    error: undefined as string | undefined,
  };

  try {
    const config = createUmamiConfig();
    status.configured = config !== null;
  } catch (error) {
    status.error = error instanceof Error ? error.message : 'Unknown error';
  }

  return status;
}