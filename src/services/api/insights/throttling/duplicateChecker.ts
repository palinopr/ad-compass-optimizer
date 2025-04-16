
export class DuplicateRequestChecker {
  private static processedRequests: Set<string> = new Set();
  private static failedWith400: Set<string> = new Set(); // Track requests that failed with 400
  private static readonly LOCAL_STORAGE_KEY = 'insights_permanent_failures';
  private static readonly LAST_28D_BLOCK_KEY = 'insights_blocked_last28d';
  private static initialized = false;

  static isDuplicate(campaignId: string, datePreset: string): boolean {
    // Always log what we're checking
    console.log(`[INSIGHTS] Checking for duplicate request: campaign=${campaignId}, datePreset=${datePreset}`);
    
    // Special case: if using last_28d or similar patterns, immediately flag as duplicate
    if (datePreset === 'last_28d' || 
        datePreset.includes('28d') || 
        datePreset.includes('28day') ||
        datePreset === 'last28d') {
      console.log(`[INSIGHTS] Automatically blocking request with problematic date preset "${datePreset}" for campaign=${campaignId}`);
      
      // Store information about this blocked request
      try {
        const blockedLast28d = JSON.parse(localStorage.getItem(this.LAST_28D_BLOCK_KEY) || '[]');
        blockedLast28d.push({
          timestamp: new Date().toISOString(),
          campaignId,
          datePreset,
          location: 'isDuplicate-method'
        });
        localStorage.setItem(this.LAST_28D_BLOCK_KEY, JSON.stringify(blockedLast28d.slice(-30)));
      } catch (e) {
        // Ignore storage errors
      }
      
      return true;
    }
  
    const requestKey = `${campaignId}_${datePreset}`;
    if (this.processedRequests.has(requestKey)) {
      console.log(`[INSIGHTS] Skipping duplicate request: campaign=${campaignId}, date_preset=${datePreset}`);
      return true;
    }
    
    // ADDITIONAL CHECK: Also check if the campaign ID itself has been marked as permanently failed
    const objectFailureKey = `object-${campaignId}-failed`;
    const nonexistentKey = `object-${campaignId}-nonexistent`;
    if (this.failedWith400.has(objectFailureKey) || this.failedWith400.has(nonexistentKey)) {
      console.log(`[INSIGHTS] ✓ Skipped insights request for previously failed object: ${campaignId}`);
      return true;
    }
    
    this.processedRequests.add(requestKey);
    this.cleanupOldRequests();
    return false;
  }

  static isPermanentlyFailed(requestSignature: string): boolean {
    // Initialize from localStorage if needed
    this.loadPersistedFailures();
    
    // Special case: Always block last_28d requests regardless of previous history
    if (requestSignature.includes('date_preset=last_28d') || 
        requestSignature.includes('"datePreset":"last_28d"') ||
        requestSignature.includes('last28d') ||
        requestSignature.includes('28d') ||
        requestSignature.includes('28day')) {
      console.log(`[INSIGHTS] Auto-blocking request with problematic date preset signature: ${requestSignature}`);
      this.markAsPermanentlyFailed(requestSignature); // Add to permanent failures
      
      // Store information about this blocked request
      try {
        const blockedSignatures = JSON.parse(localStorage.getItem('insights_signature_blocks') || '[]');
        blockedSignatures.push({
          timestamp: new Date().toISOString(),
          signature: requestSignature,
          reason: 'contains_28d_pattern',
          location: 'isPermanentlyFailed-method'
        });
        localStorage.setItem('insights_signature_blocks', JSON.stringify(blockedSignatures.slice(-30)));
      } catch (e) {
        // Ignore storage errors
      }
      
      return true;
    }
    
    // NEW: Check if this is an object ID that has been previously marked as failed
    if (requestSignature.startsWith('object-') && requestSignature.endsWith('-failed')) {
      const objectId = requestSignature.split('-')[1];
      console.log(`[INSIGHTS] ✓ Object ${objectId} previously failed with 400 - skipping`);
      return true;
    }
    
    // NEW: Check if this is an object ID that has been marked as nonexistent
    if (requestSignature.startsWith('object-') && requestSignature.endsWith('-nonexistent')) {
      const objectId = requestSignature.split('-')[1];
      console.log(`[INSIGHTS] ✓ Object ${objectId} previously marked as nonexistent - skipping`);
      return true;
    }
    
    // Standard check for failed requests
    if (this.failedWith400.has(requestSignature)) {
      console.log(`[INSIGHTS] ✓ Skipped insights request due to permanent failure (400): ${requestSignature}`);
      return true;
    }
    
    return false;
  }

  static markAsPermanentlyFailed(requestSignature: string): void {
    console.log(`[INSIGHTS] ✓ Marking request as permanently failed: ${requestSignature}`);
    this.failedWith400.add(requestSignature);
    this.persistFailedRequests();
    this.cleanupOldFailures();
    
    // Ensure this is persisted immediately
    try {
      // Also store in a separate key for debugging
      const allMarked = JSON.parse(localStorage.getItem('all_marked_permanent_failures') || '[]');
      allMarked.push({
        timestamp: new Date().toISOString(),
        signature: requestSignature
      });
      localStorage.setItem('all_marked_permanent_failures', JSON.stringify(allMarked.slice(-50)));
    } catch (e) {
      // Ignore storage errors
    }
  }

  private static loadPersistedFailures(): void {
    // Only load once if the set is empty and not initialized
    if (this.failedWith400.size === 0 && !this.initialized) {
      try {
        const storedFailures = localStorage.getItem(this.LOCAL_STORAGE_KEY);
        if (storedFailures) {
          const failures = JSON.parse(storedFailures);
          failures.forEach((signature: string) => this.failedWith400.add(signature));
          console.log(`[INSIGHTS] Loaded ${this.failedWith400.size} persisted failed requests`);
          
          // Also check for any last_28d signatures to automatically block
          const blockedCount = Array.from(this.failedWith400)
            .filter(sig => sig.includes('last_28d') || sig.includes('28d') || sig.includes('28day'))
            .length;
            
          if (blockedCount > 0) {
            console.log(`[INSIGHTS] Found ${blockedCount} problematic date preset signatures in failed requests`);
          }
        }
        this.initialized = true;
      } catch (e) {
        console.error('[INSIGHTS] Error loading persisted failures:', e);
        this.initialized = true; // Mark as initialized even on error to avoid repeated attempts
      }
    }
  }

  private static persistFailedRequests(): void {
    try {
      const failuresArray = Array.from(this.failedWith400);
      localStorage.setItem(this.LOCAL_STORAGE_KEY, JSON.stringify(failuresArray));
      console.log(`[INSIGHTS] Persisted ${failuresArray.length} failed requests to localStorage`);
      
      // Also update a timestamp to track when we last persisted
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

  static reset(): void {
    this.processedRequests.clear();
    this.failedWith400.clear();
    localStorage.removeItem(this.LOCAL_STORAGE_KEY);
    localStorage.removeItem(this.LAST_28D_BLOCK_KEY);
    localStorage.removeItem('insights_signature_blocks');
    localStorage.removeItem('all_marked_permanent_failures');
    this.initialized = false;
    console.log('[INSIGHTS] Reset all duplicate checker state and cleared localStorage');
  }

  // Generate a unique signature for a request that includes all relevant parameters
  static generateRequestSignature(
    objectId: string, 
    endpoint: string, 
    options: Record<string, any> = {}
  ): string {
    // Log what we're generating 
    console.log(`[INSIGHTS] Generating request signature for ${endpoint}:${objectId}`, options);
    
    // Special handling for last_28d - force modify it before generating signature
    if (options.datePreset === 'last_28d' || 
        (typeof options.datePreset === 'string' && 
         (options.datePreset.includes('28d') || options.datePreset.includes('28day')))) {
      console.log(`[INSIGHTS] Replacing problematic date preset "${options.datePreset}" with maximum in signature generation`);
      options = { ...options, datePreset: 'maximum' };
      
      // Log this replacement for debugging
      try {
        const signatureReplacements = JSON.parse(localStorage.getItem('signature_date_preset_replacements') || '[]');
        signatureReplacements.push({
          timestamp: new Date().toISOString(),
          objectId,
          endpoint,
          original: options.datePreset,
          replacedWith: 'maximum'
        });
        localStorage.setItem('signature_date_preset_replacements', JSON.stringify(signatureReplacements.slice(-20)));
      } catch (e) {
        // Ignore storage errors
      }
    }
  
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
    
    const signature = `${endpoint}:${objectId}:${optionsStr}`;
    console.log(`[INSIGHTS] Generated request signature: ${signature}`);
    return signature;
  }
}
