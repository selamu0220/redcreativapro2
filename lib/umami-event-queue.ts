/**
 * Umami Event Batching and Queue System
 * Handles event batching, retry logic, and offline support
 */

export interface QueuedEvent {
  id: string;
  name: string;
  data?: Record<string, any>;
  url?: string;
  timestamp: number;
  retryCount: number;
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface BatchConfig {
  maxBatchSize: number;
  flushInterval: number;
  maxRetries: number;
  baseRetryDelay: number;
  maxRetryDelay: number;
  enableOfflineStorage: boolean;
  storageKey: string;
}

export interface QueueStats {
  totalEvents: number;
  pendingEvents: number;
  failedEvents: number;
  batchesSent: number;
  lastFlushTime: number;
  isOnline: boolean;
}

/**
 * Event queue error types
 */
export class EventQueueError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = 'EventQueueError';
  }
}

/**
 * Event Batching and Queue Manager
 */
export class UmamiEventQueue {
  private config: BatchConfig;
  private eventQueue: QueuedEvent[] = [];
  private failedEvents: QueuedEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private retryTimer: NodeJS.Timeout | null = null;
  private isOnline = true;
  private stats: QueueStats;
  private sendFunction: (events: QueuedEvent[]) => Promise<void>;

  constructor(
    sendFunction: (events: QueuedEvent[]) => Promise<void>,
    config: Partial<BatchConfig> = {}
  ) {
    this.sendFunction = sendFunction;
    this.config = {
      maxBatchSize: 10,
      flushInterval: 5000, // 5 seconds
      maxRetries: 3,
      baseRetryDelay: 1000, // 1 second
      maxRetryDelay: 30000, // 30 seconds
      enableOfflineStorage: true,
      storageKey: 'umami_event_queue',
      ...config,
    };

    this.stats = {
      totalEvents: 0,
      pendingEvents: 0,
      failedEvents: 0,
      batchesSent: 0,
      lastFlushTime: 0,
      isOnline: true,
    };

    this.initializeQueue();
  }

  /**
   * Add event to queue
   */
  enqueue(
    name: string,
    data?: Record<string, any>,
    options: {
      url?: string;
      priority?: 'low' | 'normal' | 'high' | 'critical';
    } = {}
  ): void {
    const event: QueuedEvent = {
      id: this.generateEventId(),
      name,
      data,
      url: options.url || (typeof window !== 'undefined' ? window.location.href : ''),
      timestamp: Date.now(),
      retryCount: 0,
      priority: options.priority || 'normal',
    };

    this.eventQueue.push(event);
    this.stats.totalEvents++;
    this.stats.pendingEvents++;

    // Store critical events immediately for offline support
    if (event.priority === 'critical' && this.config.enableOfflineStorage) {
      this.storeEventOffline(event);
    }

    // Flush immediately for high priority events or if batch is full
    if (event.priority === 'high' || event.priority === 'critical' || 
        this.eventQueue.length >= this.config.maxBatchSize) {
      this.flush();
    } else {
      this.scheduleFlush();
    }
  }

  /**
   * Flush events immediately
   */
  async flush(): Promise<void> {
    if (this.eventQueue.length === 0) {
      return;
    }

    // Clear scheduled flush
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    // Sort events by priority and timestamp
    const eventsToSend = this.sortEventsByPriority([...this.eventQueue]);
    this.eventQueue = [];

    try {
      await this.sendBatch(eventsToSend);
      this.stats.batchesSent++;
      this.stats.lastFlushTime = Date.now();
      this.stats.pendingEvents -= eventsToSend.length;

      // Remove successfully sent events from offline storage
      if (this.config.enableOfflineStorage) {
        this.removeEventsFromOfflineStorage(eventsToSend.map(e => e.id));
      }
    } catch (error) {
      // Add failed events to retry queue
      this.handleFailedBatch(eventsToSend, error);
    }
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    return { ...this.stats };
  }

  /**
   * Clear all queued events
   */
  clear(): void {
    this.eventQueue = [];
    this.failedEvents = [];
    this.stats.pendingEvents = 0;
    this.stats.failedEvents = 0;

    if (this.config.enableOfflineStorage) {
      this.clearOfflineStorage();
    }
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(isOnline: boolean): void {
    const wasOffline = !this.isOnline;
    this.isOnline = isOnline;
    this.stats.isOnline = isOnline;

    // If coming back online, try to process offline events
    if (wasOffline && isOnline) {
      this.processOfflineEvents();
      this.retryFailedEvents();
    }
  }

  /**
   * Destroy queue and cleanup
   */
  destroy(): void {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    // Flush remaining events before destroying
    if (this.eventQueue.length > 0) {
      this.flush().catch(() => {
        // Store remaining events offline as fallback
        if (this.config.enableOfflineStorage) {
          this.eventQueue.forEach(event => this.storeEventOffline(event));
        }
      });
    }
  }

  /**
   * Initialize queue and setup event listeners
   */
  private initializeQueue(): void {
    // Setup online/offline detection
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setOnlineStatus(true));
      window.addEventListener('offline', () => this.setOnlineStatus(false));
      this.isOnline = navigator.onLine;
      this.stats.isOnline = this.isOnline;

      // Setup page unload handler to flush remaining events
      window.addEventListener('beforeunload', () => {
        if (this.eventQueue.length > 0) {
          // Use sendBeacon for reliable delivery during page unload
          this.sendBeaconBatch(this.eventQueue);
        }
      });
    }

    // Load offline events on initialization
    if (this.config.enableOfflineStorage) {
      this.processOfflineEvents();
    }

    // Start retry timer for failed events
    this.scheduleRetry();
  }

  /**
   * Schedule flush timer
   */
  private scheduleFlush(): void {
    if (this.flushTimer) {
      return; // Already scheduled
    }

    this.flushTimer = setTimeout(() => {
      this.flush().catch(error => {
        console.warn('[UmamiEventQueue] Scheduled flush failed:', error);
      });
    }, this.config.flushInterval);
  }

  /**
   * Send batch of events
   */
  private async sendBatch(events: QueuedEvent[]): Promise<void> {
    if (!this.isOnline) {
      throw new EventQueueError('Device is offline', 'OFFLINE');
    }

    if (events.length === 0) {
      return;
    }

    try {
      await this.sendFunction(events);
    } catch (error) {
      throw new EventQueueError(
        `Failed to send batch: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SEND_FAILED'
      );
    }
  }

  /**
   * Send batch using sendBeacon for page unload
   */
  private sendBeaconBatch(events: QueuedEvent[]): void {
    if (typeof navigator === 'undefined' || !navigator.sendBeacon || events.length === 0) {
      return;
    }

    try {
      const payload = JSON.stringify(events);
      const blob = new Blob([payload], { type: 'application/json' });
      
      // Try to send via beacon (best effort)
      navigator.sendBeacon('/api/analytics/batch', blob);
    } catch (error) {
      console.warn('[UmamiEventQueue] SendBeacon failed:', error);
    }
  }

  /**
   * Handle failed batch with retry logic
   */
  private handleFailedBatch(events: QueuedEvent[], error: any): void {
    console.warn('[UmamiEventQueue] Batch failed:', error);

    // Increment retry count and add to failed events
    const failedEvents = events.map(event => ({
      ...event,
      retryCount: event.retryCount + 1,
    }));

    // Filter events that haven't exceeded max retries
    const retryableEvents = failedEvents.filter(
      event => event.retryCount <= this.config.maxRetries
    );

    // Add to failed events queue
    this.failedEvents.push(...retryableEvents);
    this.stats.failedEvents += retryableEvents.length;

    // Store critical failed events offline
    if (this.config.enableOfflineStorage) {
      retryableEvents
        .filter(event => event.priority === 'critical')
        .forEach(event => this.storeEventOffline(event));
    }

    // Schedule retry
    this.scheduleRetry();
  }

  /**
   * Schedule retry for failed events
   */
  private scheduleRetry(): void {
    if (this.retryTimer || this.failedEvents.length === 0) {
      return;
    }

    // Calculate delay with exponential backoff
    const maxRetryCount = Math.max(...this.failedEvents.map(e => e.retryCount));
    const delay = Math.min(
      this.config.baseRetryDelay * Math.pow(2, maxRetryCount - 1),
      this.config.maxRetryDelay
    );

    this.retryTimer = setTimeout(() => {
      this.retryFailedEvents();
    }, delay);
  }

  /**
   * Retry failed events
   */
  private async retryFailedEvents(): Promise<void> {
    if (this.retryTimer) {
      clearTimeout(this.retryTimer);
      this.retryTimer = null;
    }

    if (this.failedEvents.length === 0 || !this.isOnline) {
      return;
    }

    const eventsToRetry = [...this.failedEvents];
    this.failedEvents = [];
    this.stats.failedEvents = 0;

    try {
      await this.sendBatch(eventsToRetry);
      console.log('[UmamiEventQueue] Successfully retried failed events');
    } catch (error) {
      this.handleFailedBatch(eventsToRetry, error);
    }
  }

  /**
   * Sort events by priority and timestamp
   */
  private sortEventsByPriority(events: QueuedEvent[]): QueuedEvent[] {
    const priorityOrder = { critical: 0, high: 1, normal: 2, low: 3 };
    
    return events.sort((a, b) => {
      const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
      if (priorityDiff !== 0) {
        return priorityDiff;
      }
      return a.timestamp - b.timestamp;
    });
  }

  /**
   * Generate unique event ID
   */
  private generateEventId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Store event in offline storage
   */
  private storeEventOffline(event: QueuedEvent): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      const events: QueuedEvent[] = stored ? JSON.parse(stored) : [];
      
      events.push(event);
      
      // Limit offline storage size (keep last 100 events)
      if (events.length > 100) {
        events.splice(0, events.length - 100);
      }
      
      localStorage.setItem(this.config.storageKey, JSON.stringify(events));
    } catch (error) {
      console.warn('[UmamiEventQueue] Failed to store event offline:', error);
    }
  }

  /**
   * Remove events from offline storage
   */
  private removeEventsFromOfflineStorage(eventIds: string[]): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) {
        return;
      }

      const events: QueuedEvent[] = JSON.parse(stored);
      const filteredEvents = events.filter(event => !eventIds.includes(event.id));
      
      if (filteredEvents.length === 0) {
        localStorage.removeItem(this.config.storageKey);
      } else {
        localStorage.setItem(this.config.storageKey, JSON.stringify(filteredEvents));
      }
    } catch (error) {
      console.warn('[UmamiEventQueue] Failed to remove events from offline storage:', error);
    }
  }

  /**
   * Process offline stored events
   */
  private processOfflineEvents(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      const stored = localStorage.getItem(this.config.storageKey);
      if (!stored) {
        return;
      }

      const offlineEvents: QueuedEvent[] = JSON.parse(stored);
      if (offlineEvents.length === 0) {
        return;
      }

      // Add offline events to queue for processing
      this.eventQueue.push(...offlineEvents);
      this.stats.pendingEvents += offlineEvents.length;

      console.log(`[UmamiEventQueue] Loaded ${offlineEvents.length} offline events`);

      // Clear offline storage since events are now in queue
      localStorage.removeItem(this.config.storageKey);

      // Flush offline events
      if (this.isOnline) {
        this.flush().catch(error => {
          console.warn('[UmamiEventQueue] Failed to flush offline events:', error);
        });
      }
    } catch (error) {
      console.warn('[UmamiEventQueue] Failed to process offline events:', error);
    }
  }

  /**
   * Clear offline storage
   */
  private clearOfflineStorage(): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    try {
      localStorage.removeItem(this.config.storageKey);
    } catch (error) {
      console.warn('[UmamiEventQueue] Failed to clear offline storage:', error);
    }
  }
}