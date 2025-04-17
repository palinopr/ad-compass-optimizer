
/**
 * Specialized throttler for insights API requests
 */
import { RequestQueueManager } from '../queue/RequestQueueManager';
import { DuplicateRequestChecker } from './throttling/duplicateChecker';
import { BATCH_CONFIG, delay, insightsQueueState, requestedCampaignIds, insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

export class InsightsRequestThrottler {
  private static readonly processedRequests = new Set<string>();
  private static isProcessing = false;
  private static requestQueue: (() => Promise<any>)[] = [];
  private static readonly SKIPPED_400_KEY = 'insights_skipped_400_requests';

  /**
   * Process an array of request functions with controlled rate limiting
   * @param requests Array of request functions to be executed
   * @returns Array of results in the same order as the requests
   */
  public static async throttleRequests<T>(requests: (() => Promise<T>)[], idPrefix: string = 'insight'): Promise<T[]> {
    // Check if global throttling is already in progress
    if (insightsThrottlingState.isActiveThrottling()) {
      console.warn(`⚠️ [INSIGHTS] Global throttling already in progress. Skipping new batch of requests.`);
      return [];
    }
    
    // Check if queue is locked from another process
    if (insightsQueueState.isActiveLock()) {
      console.warn(`⚠️ [INSIGHTS] Skipping request - queue is locked by another process`);
      return [];
    }
    
    // Early abort if too many requests
    if (requests.length > BATCH_CONFIG.MAX_QUEUE_SIZE) {
      console.warn(`⚠️ Skipping insights fetch: too many campaigns in queue (${requests.length})`);
      return [];
    }

    // Set global throttling flag
    if (!insightsThrottlingState.startThrottling()) {
      return []; // Another throttling process is already running
    }
    
    // Add requests to queue
    this.requestQueue.push(...requests);
    
    // If already processing, just return (the current processor will handle these requests)
    if (this.isProcessing) {
      console.log(`[INSIGHTS] Already processing queue. Current queue size: ${this.requestQueue.length}`);
      return [];
    }

    console.log(`🚀 [INSIGHTS] Starting to process ${this.requestQueue.length} requests with batch size ${BATCH_CONFIG.BATCH_SIZE}`);
    
    // Set global lock
    insightsQueueState.lock();
    
    try {
      this.isProcessing = true;
      return await this.processQueue(idPrefix);
    } finally {
      this.isProcessing = false;
      insightsQueueState.unlock();
      insightsThrottlingState.stopThrottling();
    }
  }

  /**
   * Process the request queue sequentially with proper throttling
   */
  private static async processQueue<T>(idPrefix: string): Promise<T[]> {
    const results: T[] = [];
    const queue = [...this.requestQueue]; // Copy the queue
    this.requestQueue = []; // Clear the queue
    
    // Calculate total batches for logging
    const totalBatches = Math.ceil(queue.length / BATCH_CONFIG.BATCH_SIZE);
    let consecutiveErrors = 0;
    
    // Strict sequential processing using for loops
    for (let i = 0; i < queue.length; i += BATCH_CONFIG.BATCH_SIZE) {
      const batch = queue.slice(i, i + BATCH_CONFIG.BATCH_SIZE);
      const batchNumber = Math.floor(i / BATCH_CONFIG.BATCH_SIZE) + 1;
      
      console.log(`🔄 Starting batch ${batchNumber}/${totalBatches} with ${batch.length} requests`);
      
      // Process each request in the batch sequentially with explicit delay
      for (let j = 0; j < batch.length; j++) {
        const req = batch[j];
        const requestId = `${idPrefix}-${Date.now()}-${j}-${Math.random().toString(36).slice(2, 7)}`;
        
        // Skip if we've already processed this request ID
        if (this.processedRequests.has(requestId)) {
          console.log(`🔄 Skipping duplicate request ${requestId} in this session`);
          continue;
        }
        
        // Add to processed requests set
        this.processedRequests.add(requestId);
        
        try {
          // Wait for explicit delay between requests (except first in batch)
          if (j > 0) {
            console.log(`⏳ Waiting ${BATCH_CONFIG.MIN_REQUEST_INTERVAL}ms between requests...`);
            await delay(BATCH_CONFIG.MIN_REQUEST_INTERVAL);
          }
          
          console.log(`✅ Executing request ${requestId} (batch ${batchNumber}/${totalBatches})...`);
          
          // Check if this request previously failed with 400
          const requestSignature = `${requestId}-execution`;
          if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
            console.log(`[INSIGHTS] Skipped insights request due to permanent failure (400): ${requestId}`);
            this.logSkippedRequest(requestId, requestSignature);
            results.push(null as unknown as T);
            continue;
          }
          
          // Execute the request using the queue manager for additional safety
          const result = await RequestQueueManager.addToQueue(() => req(), requestId);
          consecutiveErrors = 0;
          results.push(result);
        } catch (error: any) {
          console.error('[INSIGHTS] Request failed:', error);
          
          // Skip logging for already-skipped 400 errors to reduce noise
          if (!error.skipped) {
            console.log('[INSIGHTS] Logging non-skipped error:', error);
          }
          
          // If it's a 400 error, mark this request signature as permanently failed
          if (error.status === 400 || (error.response && error.response.status === 400)) {
            const failSignature = `${requestId}-execution`;
            console.error(`[INSIGHTS] Request failed with 400, marking as permanently failed: ${failSignature}`);
            DuplicateRequestChecker.markAsPermanentlyFailed(failSignature);
            this.logFailure(requestId, failSignature, error);
          } else {
            consecutiveErrors++;
          }
          
          // Push null for failed requests to maintain array positions
          results.push(null as unknown as T);
          
          // If error is rate limit (code 4), break completely to avoid further calls
          if (error.code === 4 || (error.error && error.error.code === 4)) {
            console.warn("🚫 Skipping remaining fetch operations - hit Meta rate limit (#4)");
            break;
          }
          
          // Back off if we encounter consecutive errors
          if (consecutiveErrors >= 2) {
            console.warn(`⚠️ Multiple consecutive errors (${consecutiveErrors}), adding extra delay...`);
            await delay(1500); // Extra delay for error recovery
          }
        }
      }
      
      // Wait between batches unless this is the last batch
      if (i + BATCH_CONFIG.BATCH_SIZE < queue.length) {
        console.log(`⏲️ Waiting ${BATCH_CONFIG.BATCH_INTERVAL}ms before next batch...`);
        await delay(BATCH_CONFIG.BATCH_INTERVAL);
      }
    }
    
    console.log(`[INSIGHTS] Completed ${results.filter(r => r !== null).length}/${queue.length} requests successfully`);
    return results;
  }
  
  private static logSkippedRequest(requestId: string, signature: string): void {
    try {
      const skippedRequests = JSON.parse(localStorage.getItem(this.SKIPPED_400_KEY) || '[]');
      skippedRequests.push({
        timestamp: new Date().toISOString(),
        requestId,
        signature,
        location: 'throttleRequests-wrapper'
      });
      localStorage.setItem(this.SKIPPED_400_KEY, JSON.stringify(skippedRequests.slice(-30)));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  private static logFailure(requestId: string, signature: string, error: any): void {
    try {
      const failures = JSON.parse(localStorage.getItem('throttler_400_failures') || '[]');
      failures.push({
        timestamp: new Date().toISOString(),
        requestId,
        signature,
        error: error.message || 'Unknown 400 error',
        location: 'throttleRequests-catch'
      });
      localStorage.setItem('throttler_400_failures', JSON.stringify(failures.slice(-30)));
    } catch (e) {
      // Ignore storage errors
    }
  }
  
  /**
   * Reset the throttler state (for testing or recovery)
   */
  public static reset(): void {
    this.processedRequests.clear();
    this.isProcessing = false;
    this.requestQueue = [];
    insightsQueueState.clear();
    insightsThrottlingState.isThrottling = false;
  }
}

