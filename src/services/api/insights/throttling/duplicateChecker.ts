
export class DuplicateRequestChecker {
  private static processedRequests: Set<string> = new Set();
  private static failedWith400: Set<string> = new Set(); // Track requests that failed with 400
  private static readonly LOCAL_STORAGE_KEY = 'insights_permanent_failures';

  static isDuplicate(campaignId: string, datePreset: string): boolean {
    const requestKey = `${campaignId}_${datePreset}`;
    if (this.processedRequests.has(requestKey)) {
      console.log(`[INSIGHTS] Skipping duplicate request: campaign=${campaignId}, date_preset=${datePreset}`);
      return true;
    }
    
    this.processedRequests.add(requestKey);
    this.cleanupOldRequests();
    return false;
  }

  static isPermanentlyFailed(requestSignature: string): boolean {
    // Initialize from localStorage if needed
    this.loadPersistedFailures();
    
    if (this.failedWith400.has(requestSignature)) {
      console.log(`[INSIGHTS] Skipped insights request due to permanent failure (400): ${requestSignature}`);
      return true;
    }
    return false;
  }

  static markAsPermanentlyFailed(requestSignature: string): void {
    console.log(`[INSIGHTS] Marking request as permanently failed: ${requestSignature}`);
    this.failedWith400.add(requestSignature);
    this.persistFailedRequests();
    this.cleanupOldFailures();
  }

  private static loadPersistedFailures(): void {
    // Only load once if the set is empty
    if (this.failedWith400.size === 0) {
      try {
        const storedFailures = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (storedFailures) {
          const failures = JSON.parse(storedFailures);
          failures.forEach((signature: string) => this.failedWith400.add(signature));
          console.log(`[INSIGHTS] Loaded ${this.failedWith400.size} persisted failed requests`);
        }
      } catch (e) {
        console.error('[INSIGHTS] Error loading persisted failures:', e);
      }
    }
  }

  private static persistFailedRequests(): void {
    try {
      const failuresArray = Array.from(this.failedWith400);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(failuresArray));
      console.log(`[INSIGHTS] Persisted ${failuresArray.length} failed requests to localStorage`);
    } catch (e) {
      console.error('[INSIGHTS] Error persisting failures:', e);
    }
  }

  private static cleanupOldRequests(): void {
    if (this.processedRequests.size > 1000) {
      const entries = Array.from(this.processedRequests);
      const toRemove = entries.slice(0, 200);
      toRemove.forEach(key => this.processedRequests.delete(key));
    }
  }

  private static cleanupOldFailures(): void {
    if (this.failedWith400.size > 500) {
      const entries = Array.from(this.failedWith400);
      const toRemove = entries.slice(0, 100);
      toRemove.forEach(key => this.failedWith400.delete(key));
      this.persistFailedRequests();
    }
  }

  static reset(): void {
    this.processedRequests.clear();
    this.failedWith400.clear();
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
  }

  // Generate a unique signature for a request that includes all relevant parameters
  static generateRequestSignature(
    objectId: string, 
    endpoint: string, 
    options: Record<string, any> = {}
  ): string {
    const optionsStr = JSON.stringify(options, (key, value) => {
      // Sort object keys for consistent serialization
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        return Object.keys(value).sort().reduce((sorted, key) => {
          sorted[key] = value[key];
          return sorted;
        }, {} as Record<string, any>);
      }
      return value;
    });
    
    return `${endpoint}:${objectId}:${optionsStr}`;
  }
}
