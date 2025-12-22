// RetryManager.ts - Stub (audit logger removed)

export class RetryManager {
  async retry<T>(fn: () => Promise<T>, maxRetries: number = 3): Promise<T> {
    let lastError;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError;
  }
}

export default new RetryManager();
