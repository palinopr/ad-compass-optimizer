
import { DuplicateStorage } from './storage/DuplicateStorage';
import { RequestSignatureGenerator } from './signature/RequestSignatureGenerator';

export class DuplicateRequestChecker {
  private static processedRequests: Set<string> = new Set();
  private static failedWith400: Set<string> = new Set();
  private static initialized = false;

  static isDuplicate(campaignId: string, datePreset: string): boolean {
    console.log(`[INSIGHTS] Checking for duplicate request: campaign=${campaignId}, datePreset=${datePreset}`);
    
    if (this.isProblematicDatePreset(datePreset)) {
      console.log(`[INSIGHTS] Automatically blocking request with problematic date preset "${datePreset}" for campaign=${campaignId}`);
      DuplicateStorage.storeBlocked28d(campaignId, datePreset);
      return true;
    }
  
    const requestKey = `${campaignId}_${datePreset}`;
    if (this.processedRequests.has(requestKey)) {
      console.log(`[INSIGHTS] Skipping duplicate request: campaign=${campaignId}, date_preset=${datePreset}`);
      return true;
    }
    
    const objectFailureKey = `object-${campaignId}-failed`;
    const nonexistentKey = `object-${campaignId}-nonexistent`;
    if (this.failedWith400.has(objectFailureKey) || this.failedWith400.has(nonexistentKey)) {
      console.log(`[INSIGHTS] 🚫 Skipped permanently blocked campaign: ${campaignId}`);
      return true;
    }
    
    this.processedRequests.add(requestKey);
    this.cleanupOldRequests();
    return false;
  }

  static isPermanentlyFailed(requestSignature: string): boolean {
    this.loadPersistedFailures();
    
    if (this.hasProblematicDatePreset(requestSignature)) {
      console.log(`[INSIGHTS] Auto-blocking request with problematic date preset signature: ${requestSignature}`);
      this.markAsPermanentlyFailed(requestSignature);
      DuplicateStorage.storeSignatureBlock(requestSignature);
      return true;
    }
    
    if (this.isBlockedObjectId(requestSignature)) {
      const objectId = requestSignature.split('-')[1];
      console.log(`[INSIGHTS] 🚫 Skipped permanently blocked campaign: ${objectId}`);
      return true;
    }
    
    if (this.failedWith400.has(requestSignature)) {
      console.log(`[INSIGHTS] 🚫 Skipped permanently blocked campaign signature: ${requestSignature}`);
      return true;
    }
    
    return false;
  }

  static markAsPermanentlyFailed(requestSignature: string): void {
    console.log(`[INSIGHTS] ✅ Permanently blocking request: ${requestSignature}`);
    this.failedWith400.add(requestSignature);
    this.persistFailedRequests();
    this.cleanupOldFailures();
    DuplicateStorage.storePermanentFailure(requestSignature);
  }

  private static loadPersistedFailures(): void {
    if (this.failedWith400.size === 0 && !this.initialized) {
      try {
        const storedFailures = localStorage.getItem('insights_permanent_failures');
        if (storedFailures) {
          const failures = JSON.parse(storedFailures);
          failures.forEach((signature: string) => this.failedWith400.add(signature));
          console.log(`[INSIGHTS] Loaded ${this.failedWith400.size} persisted failed requests`);
        }
        this.initialized = true;
      } catch (e) {
        console.error('[INSIGHTS] Error loading persisted failures:', e);
        this.initialized = true;
      }
    }
  }

  private static persistFailedRequests(): void {
    try {
      const failuresArray = Array.from(this.failedWith400);
      localStorage.setItem('insights_permanent_failures', JSON.stringify(failuresArray));
      console.log(`[INSIGHTS] Persisted ${failuresArray.length} failed requests to localStorage`);
      
      localStorage.setItem('last_failure_persist_time', new Date().toISOString());
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

  private static isProblematicDatePreset(value: string): boolean {
    return value === 'last_28d' || 
           value.includes('28d') || 
           value.includes('28day') ||
           value === 'last28d';
  }

  private static isBlockedObjectId(signature: string): boolean {
    return (signature.startsWith('object-') && 
            (signature.endsWith('-failed') || signature.endsWith('-nonexistent')));
  }

  static reset(): void {
    this.processedRequests.clear();
    this.failedWith400.clear();
    this.initialized = false;
    DuplicateStorage.clearStorage();
    console.log('[INSIGHTS] Reset all duplicate checker state and cleared localStorage');
  }

  static generateRequestSignature(
    objectId: string, 
    endpoint: string, 
    options: Record<string, any> = {}
  ): string {
    return RequestSignatureGenerator.generate(objectId, endpoint, options);
  }
}
