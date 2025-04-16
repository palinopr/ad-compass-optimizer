/**
 * Request Queue Manager
 * Handles sequential processing of API requests with rate limiting
 */
export class RequestQueueManager {
  private static requestQueue: (() => Promise<any>)[] = [];
  private static isProcessingQueue = false;
  private static requestInterval = 500;
  private static lastRequestTime = 0;
  private static permanentlyFailedRequests = new Set<string>();
  private static readonly PERMANENT_FAILURES_KEY = 'permanently_failed_requests';
  private static readonly REQUEST_ERROR_LOG_KEY = 'request_error_log';
  private static readonly BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';

  /**
   * Add a request to the queue and return a promise that resolves when it's processed
   */
  public static async addToQueue<T>(requestFn: () => Promise<T>, requestId?: string): Promise<T> {
    // If this request previously failed with 400, reject immediately - don't even queue it
    if (requestId && this.isPermanentlyFailed(requestId)) {
      console.log(`[REQUEST QUEUE] 🚫 Skipped permanently blocked campaign request: ${requestId}`);
      
      // Extract campaign ID if present in the request ID
      let campaignId = "unknown";
      if (requestId.includes(':')) {
        const parts = requestId.split(':');
        if (parts.length >= 2) {
          campaignId = parts[1]; // Usually the second part is the object ID
        }
      }
      
      // Log that we skipped this request to ensure we can verify
      try {
        const skippedRequests = JSON.parse(localStorage.getItem('skipped_requests_log') || '[]');
        skippedRequests.push({
          timestamp: new Date().toISOString(),
          requestId,
          campaignId,
          reason: 'previous_400_failure'
        });
        localStorage.setItem('skipped_requests_log', JSON.stringify(skippedRequests.slice(-50)));
      } catch (e) {
        console.error('[REQUEST QUEUE] Error logging skipped request:', e);
      }
      
      return Promise.reject({
        message: 'Request previously failed with 400 status',
        status: 400,
        skipped: true
      });
    }

    // Load previously failed requests from localStorage if needed
    this.loadPermanentlyFailedRequests();

    return new Promise((resolve, reject) => {
      const wrappedRequest = async () => {
        try {
          console.log('[REQUEST QUEUE] Processing queued request');
          
          // Enforce minimum time since last request
          const now = Date.now();
          const timeSinceLastRequest = now - this.lastRequestTime;
          
          if (timeSinceLastRequest < this.requestInterval && this.lastRequestTime > 0) {
            const waitTime = this.requestInterval - timeSinceLastRequest;
            console.log(`[REQUEST QUEUE] Enforcing ${waitTime}ms delay since last request`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
          
          this.lastRequestTime = Date.now();
          const result = await requestFn();
          resolve(result);
          return result;
        } catch (error: any) {
          console.error('[REQUEST QUEUE] Error executing queued request:', error);

          // STRICT ENFORCEMENT: If it's a 400 error, mark this request as permanently failed
          // Also store the campaign ID in a blocked campaigns list
          if (error.status === 400 || (error.response && error.response.status === 400)) {
            if (requestId) {
              console.log(`[REQUEST QUEUE] ✅ Permanently blocking request due to 400 error: ${requestId}`);
              this.permanentlyFailedRequests.add(requestId);
              this.persistPermanentlyFailedRequests();
              
              // Extract campaign ID if present in the request ID and add it to blocked campaigns
              if (requestId.includes(':')) {
                const parts = requestId.split(':');
                if (parts.length >= 2) {
                  const campaignId = parts[1]; // Usually the second part is the object ID
                  this.addToBlockedCampaigns(campaignId);
                }
              }
              
              // If error has an objectId, block it too
              if (error.objectId) {
                this.addToBlockedCampaigns(error.objectId);
              }
              
              // Additional logging for 400 errors for diagnostics
              try {
                const errorLogs = JSON.parse(localStorage.getItem(this.REQUEST_ERROR_LOG_KEY) || '[]');
                errorLogs.push({
                  timestamp: new Date().toISOString(),
                  requestId,
                  errorMessage: error.message || 'Unknown error',
                  status: error.status || (error.response && error.response.status),
                  objectId: error.objectId || 'unknown'
                });
                localStorage.setItem(this.REQUEST_ERROR_LOG_KEY, JSON.stringify(errorLogs.slice(-50)));
              } catch (e) {
                console.error('[REQUEST QUEUE] Error logging error details:', e);
              }
            }
          }

          reject(error);
          throw error;
        }
      };
      
      this.requestQueue.push(wrappedRequest);
      console.log(`[REQUEST QUEUE] Request added to queue. Queue size: ${this.requestQueue.length}`);
      
      if (!this.isProcessingQueue) {
        this.processQueue();
      }
    });
  }

  /**
   * Add a campaign ID to the blocked campaigns list
   */
  private static addToBlockedCampaigns(campaignId: string): void {
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
      if (!blockedCampaigns.includes(campaignId)) {
        blockedCampaigns.push(campaignId);
        localStorage.setItem(this.BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
        console.log(`[REQUEST QUEUE] ✅ Added campaign ${campaignId} to permanently blocked campaigns list`);
      }
    } catch (e) {
      console.error('[REQUEST QUEUE] Error adding to blocked campaigns:', e);
    }
  }

  /**
   * Load permanently failed requests from localStorage
   */
  private static loadPermanentlyFailedRequests() {
    if (this.permanentlyFailedRequests.size === 0) {
      try {
        const storedFailures = localStorage.getItem(this.PERMANENT_FAILURES_KEY);
        if (storedFailures) {
          const failures = JSON.parse(storedFailures);
          failures.forEach((id: string) => this.permanentlyFailedRequests.add(id));
          console.log(`[REQUEST QUEUE] Loaded ${this.permanentlyFailedRequests.size} permanently failed requests from storage`);
          
          // Log when we last loaded from storage for diagnostics
          localStorage.setItem('last_failed_requests_load_time', new Date().toISOString());
        }
      } catch (e) {
        console.error('[REQUEST QUEUE] Error loading permanently failed requests:', e);
      }
    }
  }

  /**
   * Persist permanently failed requests to localStorage
   */
  private static persistPermanentlyFailedRequests() {
    try {
      const failuresArray = Array.from(this.permanentlyFailedRequests);
      localStorage.setItem(this.PERMANENT_FAILURES_KEY, JSON.stringify(failuresArray));
      console.log(`[REQUEST QUEUE] Persisted ${failuresArray.length} permanently failed requests to storage`);
      
      // Update timestamp for when we last persisted
      localStorage.setItem('last_persistence_time', new Date().toISOString());
    } catch (e) {
      console.error('[REQUEST QUEUE] Error persisting permanently failed requests:', e);
    }
  }

  /**
   * Process requests in the queue sequentially with rate limiting
   */
  private static async processQueue() {
    if (this.isProcessingQueue) {
      console.log('[REQUEST QUEUE] Queue processing already in progress');
      return;
    }
    
    console.log('[REQUEST QUEUE] Started processing queue');
    this.isProcessingQueue = true;
    
    try {
      while (this.requestQueue.length > 0) {
        const request = this.requestQueue.shift();
        if (request) {
          const startTime = Date.now();
          
          try {
            await request();
          } catch (error) {
            console.error('[REQUEST QUEUE] Error processing queued request:', error);
            // Continue processing other requests even after an error
          }
          
          // Calculate and enforce minimum interval between requests
          const processingTime = Date.now() - startTime;
          const waitTime = Math.max(0, this.requestInterval - processingTime);
          
          if (waitTime > 0 && this.requestQueue.length > 0) {
            console.log(`[REQUEST QUEUE] Waiting ${waitTime}ms before next request. Queue size: ${this.requestQueue.length}`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
          }
        }
      }
    } finally {
      console.log('[REQUEST QUEUE] Finished processing queue');
      this.isProcessingQueue = false;
    }
  }

  /**
   * Update the minimum interval between requests
   */
  public static setRequestInterval(interval: number) {
    if (interval >= 0) {
      this.requestInterval = interval;
      console.log(`[REQUEST QUEUE] Request interval updated to ${interval}ms`);
    }
  }

  /**
   * Get the current queue length
   */
  public static getQueueLength(): number {
    return this.requestQueue.length;
  }
  
  /**
   * Reset the queue and timing
   */
  public static reset() {
    this.requestQueue = [];
    this.isProcessingQueue = false;
    this.lastRequestTime = 0;
    this.permanentlyFailedRequests.clear();
    localStorage.removeItem(this.PERMANENT_FAILURES_KEY);
    console.log('[REQUEST QUEUE] Queue and timing reset');
  }
  
  /**
   * Check if a request is permanently failed
   */
  public static isPermanentlyFailed(requestId: string): boolean {
    // Load from storage if needed
    this.loadPermanentlyFailedRequests();
    
    if (this.permanentlyFailedRequests.has(requestId)) {
      console.log(`[REQUEST QUEUE] 🚫 Skipped permanently blocked campaign request: ${requestId}`);
      return true;
    }
    
    // Check if the requestId contains any object ID that's been marked as failed
    if (requestId.includes(':')) {
      const parts = requestId.split(':');
      if (parts.length >= 2) {
        const objectId = parts[1]; // Typically the object ID is the second part
        
        // Check if this campaign is in our blocked campaigns list
        try {
          const blockedCampaigns = JSON.parse(localStorage.getItem(this.BLOCKED_CAMPAIGNS_KEY) || '[]');
          if (blockedCampaigns.includes(objectId)) {
            console.log(`[REQUEST QUEUE] 🚫 Skipped request for permanently blocked campaign: ${objectId}`);
            // Also mark this specific request as failed to prevent future attempts
            this.markAsPermanentlyFailed(requestId);
            return true;
          }
        } catch (e) {
          // Ignore storage errors
        }
        
        const objectFailKey = `object-${objectId}-failed`;
        const nonexistentKey = `object-${objectId}-nonexistent`;
        
        if (this.permanentlyFailedRequests.has(objectFailKey) || 
            this.permanentlyFailedRequests.has(nonexistentKey)) {
          console.log(`[REQUEST QUEUE] 🚫 Skipped request for permanently blocked campaign: ${objectId}`);
          // Also mark this specific request as failed
          this.markAsPermanentlyFailed(requestId);
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Mark a request as permanently failed
   */
  public static markAsPermanentlyFailed(requestId: string) {
    console.log(`[REQUEST QUEUE] ✅ Permanently blocking request: ${requestId}`);
    this.permanentlyFailedRequests.add(requestId);
    this.persistPermanentlyFailedRequests();
    
    // Cleanup if the set gets too large
    if (this.permanentlyFailedRequests.size > 1000) {
      const entries = Array.from(this.permanentlyFailedRequests);
      const toRemove = entries.slice(0, 200);
      toRemove.forEach(key => this.permanentlyFailedRequests.delete(key));
      this.persistPermanentlyFailedRequests();
    }
    
    // Log this marking action for debugging
    try {
      const markedActions = JSON.parse(localStorage.getItem('marked_permanent_failures_log') || '[]');
      markedActions.push({
        timestamp: new Date().toISOString(),
        requestId,
        action: 'marked_as_permanent_failure',
        source: 'RequestQueueManager'
      });
      localStorage.setItem('marked_permanent_failures_log', JSON.stringify(markedActions.slice(-50)));
    } catch (e) {
      // Ignore storage errors
    }
  }
}
