/**
 * Umami Analytics Client
 * Core client interface for Umami analytics integration
 */

import { UmamiConfig, getUmamiConfig, UmamiConfigError } from './umami-config';
import { UmamiEventQueue, QueuedEvent, BatchConfig } from './umami-event-queue';

export interface UmamiPageView {
  url: string;
  title?: string;
  referrer?: string;
  timestamp?: number;
}

export interface UmamiEvent {
  name: string;
  data?: Record<string, any>;
  url?: string;
  timestamp?: number;
}

export interface UmamiClientOptions {
  enableTimeTracking?: boolean;
  batchEvents?: boolean;
  respectDNT?: boolean;
  debug?: boolean;
  batchConfig?: Partial<BatchConfig>;
}

export interface UmamiClientStatus {
  initialized: boolean;
  scriptLoaded: boolean;
  configValid: boolean;
  lastError?: string;
}

/**
 * Umami client error types
 */
export class UmamiClientError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'UmamiClientError';
  }
}

/**
 * Core Umami Analytics Client
 */
export class UmamiClient {
  private config: UmamiConfig | null = null;
  private options: UmamiClientOptions;
  private initialized = false;
  private scriptLoaded = false;
  private eventQueue: UmamiEventQueue | null = null;
  private lastError: string | undefined;

  constructor(options: UmamiClientOptions = {}) {
    this.options = {
      enableTimeTracking: true,
      batchEvents: true,
      respectDNT: true,
      debug: false,
      ...options,
    };

    // Initialize event queue if batching is enabled
    if (this.options.batchEvents) {
      this.eventQueue = new UmamiEventQueue(
        this.sendBatchedEvents.bind(this),
        this.options.batchConfig
      );
    }
  }

  /**
   * Initialize the Umami client
   */
  async initialize(): Promise<void> {
    try {
      // Check Do Not Track if enabled
      if (this.options.respectDNT && this.isDNTEnabled()) {
        this.log('Do Not Track is enabled, skipping Umami initialization');
        return;
      }

      // Load and validate configuration
      this.config = getUmamiConfig();
      if (!this.config) {
        throw new UmamiClientError('Umami configuration is invalid or missing', 'CONFIG_INVALID');
      }

      // Load Umami script
      await this.loadScript();
      
      this.initialized = true;
      this.lastError = undefined;
      
      // Process queued events
      await this.processQueuedEvents();
      
      this.log('Umami client initialized successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown initialization error';
      this.lastError = errorMessage;
      this.log('Failed to initialize Umami client:', errorMessage);
      
      // Don't throw in production to avoid breaking the app
      if (this.options.debug) {
        throw error;
      }
    }
  }

  /**
   * Track a page view
   */
  async trackPageView(pageView: UmamiPageView): Promise<void> {
    try {
      if (!this.isReady()) {
        // Use event queue for page views if batching is enabled
        if (this.eventQueue) {
          this.eventQueue.enqueue(`pageview:${pageView.url}`, {
            title: pageView.title,
            referrer: pageView.referrer,
          }, {
            url: pageView.url,
            priority: 'normal'
          });
        }
        this.log('Queued page view:', pageView.url);
        return;
      }

      await this.sendPageView(pageView);
      this.log('Tracked page view:', pageView.url);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown page view error';
      this.lastError = errorMessage;
      this.log('Failed to track page view:', errorMessage);
      
      // Queue for retry if not in debug mode and batching is enabled
      if (!this.options.debug && this.eventQueue) {
        this.eventQueue.enqueue(`pageview:${pageView.url}`, {
          title: pageView.title,
          referrer: pageView.referrer,
        }, {
          url: pageView.url,
          priority: 'normal'
        });
      }
    }
  }

  /**
   * Track a custom event
   */
  async trackEvent(event: UmamiEvent): Promise<void> {
    try {
      if (!this.isReady()) {
        // Use event queue if batching is enabled
        if (this.eventQueue) {
          this.eventQueue.enqueue(event.name, event.data, {
            url: event.url,
            priority: 'normal'
          });
        }
        this.log('Queued event:', event.name);
        return;
      }

      await this.sendEvent(event);
      this.log('Tracked event:', event.name);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown event error';
      this.lastError = errorMessage;
      this.log('Failed to track event:', errorMessage);
      
      // Queue for retry if not in debug mode and batching is enabled
      if (!this.options.debug && this.eventQueue) {
        this.eventQueue.enqueue(event.name, event.data, {
          url: event.url,
          priority: 'normal'
        });
      }
    }
  }

  /**
   * Get client status
   */
  getStatus(): UmamiClientStatus {
    return {
      initialized: this.initialized,
      scriptLoaded: this.scriptLoaded,
      configValid: this.config !== null,
      lastError: this.lastError,
    };
  }

  /**
   * Check if client is ready to track
   */
  isReady(): boolean {
    return this.initialized && this.scriptLoaded && this.config !== null;
  }

  /**
   * Get current configuration
   */
  getConfig(): UmamiConfig | null {
    return this.config;
  }

  /**
   * Clear error state
   */
  clearError(): void {
    this.lastError = undefined;
  }

  /**
   * Retry failed operations
   */
  async retry(): Promise<void> {
    if (!this.isReady()) {
      await this.initialize();
    }
    
    if (this.isReady()) {
      await this.processQueuedEvents();
    }
  }

  /**
   * Get event queue statistics
   */
  getQueueStats() {
    return this.eventQueue?.getStats() || null;
  }

  /**
   * Set online/offline status for event queue
   */
  setOnlineStatus(isOnline: boolean): void {
    this.eventQueue?.setOnlineStatus(isOnline);
  }

  /**
   * Clear all queued events
   */
  clearQueue(): void {
    this.eventQueue?.clear();
  }

  /**
   * Flush queued events immediately
   */
  async flushQueue(): Promise<void> {
    if (this.eventQueue) {
      await this.eventQueue.flush();
    }
  }

  /**
   * Destroy client and cleanup resources
   */
  destroy(): void {
    this.eventQueue?.destroy();
    this.eventQueue = null;
    this.initialized = false;
    this.scriptLoaded = false;
  }

  /**
   * Load Umami script asynchronously
   */
  private async loadScript(): Promise<void> {
    if (!this.config) {
      throw new UmamiClientError('Configuration not available', 'CONFIG_MISSING');
    }

    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      const existingScript = document.querySelector(`script[src="${this.config!.scriptUrl}"]`);
      if (existingScript) {
        this.scriptLoaded = true;
        resolve();
        return;
      }

      // Create and load script
      const script = document.createElement('script');
      script.src = this.config.scriptUrl;
      script.defer = true;
      script.setAttribute('data-website-id', this.config.websiteId);
      
      // Add domains if configured
      if (this.config.domains && this.config.domains.length > 0) {
        script.setAttribute('data-domains', this.config.domains.join(','));
      }

      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };

      script.onerror = () => {
        reject(new UmamiClientError('Failed to load Umami script', 'SCRIPT_LOAD_FAILED'));
      };

      // Add to document head
      document.head.appendChild(script);
    });
  }

  /**
   * Send page view to Umami
   */
  private async sendPageView(pageView: UmamiPageView): Promise<void> {
    if (typeof window === 'undefined' || !window.umami) {
      throw new UmamiClientError('Umami is not available', 'UMAMI_NOT_AVAILABLE');
    }

    // Use Umami's track method for page views
    window.umami.track(pageView.url, {
      title: pageView.title,
      referrer: pageView.referrer,
    });
  }

  /**
   * Send event to Umami
   */
  private async sendEvent(event: UmamiEvent): Promise<void> {
    if (typeof window === 'undefined' || !window.umami) {
      throw new UmamiClientError('Umami is not available', 'UMAMI_NOT_AVAILABLE');
    }

    // Use Umami's track method for events
    window.umami.track(event.name, event.data);
  }

  /**
   * Send batched events to Umami
   */
  private async sendBatchedEvents(events: QueuedEvent[]): Promise<void> {
    if (typeof window === 'undefined' || !window.umami) {
      throw new UmamiClientError('Umami is not available', 'UMAMI_NOT_AVAILABLE');
    }

    // Process each event in the batch
    for (const event of events) {
      try {
        // Handle page view events (prefixed with 'pageview:')
        if (event.name.startsWith('pageview:')) {
          const url = event.name.replace('pageview:', '');
          window.umami.track(url, event.data);
        } else {
          // Handle regular events
          window.umami.track(event.name, event.data);
        }
      } catch (error) {
        this.log('Failed to send individual event in batch:', event.name, error);
        // Continue processing other events in the batch
      }
    }
  }

  /**
   * Process queued events
   */
  private async processQueuedEvents(): Promise<void> {
    // If event queue is available, flush it
    if (this.eventQueue) {
      try {
        await this.eventQueue.flush();
        this.log('Processed queued events');
      } catch (error) {
        this.log('Failed to process queued events:', error);
      }
    }
  }

  /**
   * Check if Do Not Track is enabled
   */
  private isDNTEnabled(): boolean {
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return false;
    }

    return (
      navigator.doNotTrack === '1' ||
      navigator.doNotTrack === 'yes' ||
      (window as any).doNotTrack === '1' ||
      (navigator as any).msDoNotTrack === '1'
    );
  }

  /**
   * Log debug messages
   */
  private log(...args: any[]): void {
    if (this.options.debug) {
      console.log('[UmamiClient]', ...args);
    }
  }
}

/**
 * Global Umami client instance
 */
let globalUmamiClient: UmamiClient | null = null;

/**
 * Get or create global Umami client instance
 */
export function getUmamiClient(options?: UmamiClientOptions): UmamiClient {
  if (!globalUmamiClient) {
    globalUmamiClient = new UmamiClient(options);
  }
  return globalUmamiClient;
}

/**
 * Initialize global Umami client
 */
export async function initializeUmami(options?: UmamiClientOptions): Promise<UmamiClient> {
  const client = getUmamiClient(options);
  await client.initialize();
  return client;
}

/**
 * Type declarations for Umami global object
 */
declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, any>) => void;
    };
  }
}