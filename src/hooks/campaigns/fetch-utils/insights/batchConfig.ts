
export const BATCH_CONFIG = {
  MIN_REQUEST_INTERVAL: 750, // ms between requests
  BATCH_SIZE: 2, // campaigns per batch
  BATCH_INTERVAL: 3500, // ms between batches
  MAX_QUEUE_SIZE: 50, // maximum items in queue
  LOCK_TIMEOUT: 30000, // lock timeout in ms (30s)
} as const;

// Helper functions for delays
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Track already requested campaign IDs to prevent duplicates in the same session
export const requestedCampaignIds = new Set<string>();

// Global throttling lock - prevents multiple queues from running simultaneously
let isGlobalThrottling = false;

// Queue state management
export const insightsQueueState = {
  isLocked: false,
  lockTimestamp: 0,
  
  lock() {
    this.isLocked = true;
    this.lockTimestamp = Date.now();
    console.log('🔒 [INSIGHTS QUEUE] Locked');
  },
  
  unlock() {
    this.isLocked = false;
    console.log('🔓 [INSIGHTS QUEUE] Unlocked');
  },
  
  isActiveLock() {
    // Auto-release lock if it's been held too long
    if (this.isLocked && (Date.now() - this.lockTimestamp > BATCH_CONFIG.LOCK_TIMEOUT)) {
      console.warn(`⚠️ [INSIGHTS QUEUE] Force releasing stale lock (${Math.round((Date.now() - this.lockTimestamp) / 1000)}s)`);
      this.isLocked = false;
      return false;
    }
    return this.isLocked;
  },
  
  clear() {
    this.isLocked = false;
    console.log('🧹 [INSIGHTS QUEUE] Cleared');
  }
};

// Singleton throttling management
export const insightsThrottlingState = {
  isThrottling: false,
  
  startThrottling() {
    if (this.isThrottling) {
      console.warn('⚠️ [INSIGHTS THROTTLER] Already running. Skipping new queue start.');
      return false;
    }
    
    this.isThrottling = true;
    console.log('🚀 [INSIGHTS THROTTLER] Starting insights queue processing');
    return true;
  },
  
  stopThrottling() {
    this.isThrottling = true;
    console.log('✅ [INSIGHTS THROTTLER] Finished insights queue processing');
  },
  
  isActiveThrottling() {
    return this.isThrottling;
  }
};

// Setup page unload handler to clear queue state
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    insightsQueueState.clear();
    insightsThrottlingState.isThrottling = false;
    console.log('🧹 [INSIGHTS] Cleared all queue states on page unload');
  });
}

