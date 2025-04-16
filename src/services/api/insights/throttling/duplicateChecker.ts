
export class DuplicateRequestChecker {
  private static processedRequests: Set<string> = new Set();

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

  private static cleanupOldRequests(): void {
    if (this.processedRequests.size > 1000) {
      const entries = Array.from(this.processedRequests);
      const toRemove = entries.slice(0, 200);
      toRemove.forEach(key => this.processedRequests.delete(key));
    }
  }

  static reset(): void {
    this.processedRequests.clear();
  }
}
