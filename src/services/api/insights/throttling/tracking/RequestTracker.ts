
/**
 * Tracks processed requests in memory
 */
export class RequestTracker {
  private static processedRequests: Set<string> = new Set();
  private static failedWith400: Set<string> = new Set();
  private static initialized = false;

  static isProcessed(requestKey: string): boolean {
    return this.processedRequests.has(requestKey);
  }

  static markProcessed(requestKey: string): void {
    this.processedRequests.add(requestKey);
  }

  static isPermanentlyFailed(signature: string): boolean {
    return this.failedWith400.has(signature);
  }

  static markPermanentlyFailed(signature: string): void {
    this.failedWith400.add(signature);
    this.persistFailedRequests();
  }

  private static persistFailedRequests(): void {
    try {
      const failuresArray = Array.from(this.failedWith400);
      localStorage.setItem('insights_permanent_failures', JSON.stringify(failuresArray));
      localStorage.setItem('last_failure_persist_time', new Date().toISOString());
    } catch (e) {
      console.error('[INSIGHTS] Error persisting failures:', e);
    }
  }

  static cleanupOldRequests(): void {
    if (this.processedRequests.size > 1000) {
      const entries = Array.from(this.processedRequests);
      const toRemove = entries.slice(0, 200);
      toRemove.forEach(key => this.processedRequests.delete(key));
    }
  }

  static reset(): void {
    this.processedRequests.clear();
    this.failedWith400.clear();
    this.initialized = false;
  }
}
