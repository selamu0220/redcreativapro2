
export interface QueueConfig {
  maxConcurrent: number;
  rateLimitPerMinute: number;
}

interface QueuedRequest<T> {
  id: string;
  execute: () => Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: any) => void;
  priority: number;
  timestamp: number;
}

export class RequestQueue {
  private queue: QueuedRequest<any>[] = [];
  private activeRequests = 0;
  private requestTimestamps: number[] = [];
  private config: QueueConfig;
  private isProcessing = false;

  constructor(config: QueueConfig = { maxConcurrent: 1, rateLimitPerMinute: 60 }) {
    this.config = config;
  }

  /**
   * Add a request to the queue
   * @param execute Function that returns a promise
   * @param priority Higher number means higher priority
   */
  async add<T>(execute: () => Promise<T>, priority: number = 0): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const request: QueuedRequest<T> = {
        id: Math.random().toString(36).substring(7),
        execute,
        resolve,
        reject,
        priority,
        timestamp: Date.now()
      };

      this.queue.push(request);
      this.queue.sort((a, b) => b.priority - a.priority); // Sort by priority desc
      this.processQueue();
    });
  }

  /**
   * Clear all pending requests
   */
  clear() {
    this.queue.forEach(req => {
      req.reject(new Error('Queue cleared'));
    });
    this.queue = [];
  }

  private async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    try {
      while (this.queue.length > 0 && this.activeRequests < this.config.maxConcurrent) {
        // Check rate limit
        if (this.isRateLimited()) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s if rate limited
          continue;
        }

        const request = this.queue.shift();
        if (!request) break;

        this.activeRequests++;
        this.requestTimestamps.push(Date.now());
        
        // Clean old timestamps
        const oneMinuteAgo = Date.now() - 60000;
        this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);

        // Execute request
        request.execute()
          .then(request.resolve)
          .catch(request.reject)
          .finally(() => {
            this.activeRequests--;
            this.processQueue();
          });
      }
    } finally {
      this.isProcessing = false;
    }
  }

  private isRateLimited(): boolean {
    const oneMinuteAgo = Date.now() - 60000;
    const requestsLastMinute = this.requestTimestamps.filter(t => t > oneMinuteAgo).length;
    return requestsLastMinute >= this.config.rateLimitPerMinute;
  }

  getPendingCount(): number {
    return this.queue.length;
  }

  getActiveCount(): number {
    return this.activeRequests;
  }
}

// Export singleton for global use
export const globalRequestQueue = new RequestQueue({
  maxConcurrent: 2, // Allow 2 concurrent requests
  rateLimitPerMinute: 20 // Limit to 20 requests per minute to be safe
});
