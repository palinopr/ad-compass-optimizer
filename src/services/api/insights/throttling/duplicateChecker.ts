
export class DuplicateRequestChecker {
  private static processedRequests: Set<string> = new Set();
  private static failedWith400: Set<string> = new Set(); // Track requests that failed with 400

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
    if (this.failedWith400.has(requestSignature)) {
      console.log(`[INSIGHTS] Skipped insights request due to permanent failure (400): ${requestSignature}`);
      return true;
    }
    return false;
  }

  static markAsPermanentlyFailed(requestSignature: string): void {
    console.log(`[INSIGHTS] Marking request as permanently failed: ${requestSignature}`);
    this.failedWith400.add(requestSignature);
    this.cleanupOldFailures();
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
    }
  }

  static reset(): void {
    this.processedRequests.clear();
    this.failedWith400.clear();
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
