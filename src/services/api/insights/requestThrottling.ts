
/**
 * Specialized throttler for insights API requests
 */
import { RequestQueueManager } from '../queue/RequestQueueManager';
import { DuplicateRequestChecker } from './throttling/duplicateChecker';

export class InsightsRequestThrottler {
  private static queue: Promise<any>[] = [];
  private static processing = false;
  private static readonly BATCH_SIZE = 2; // Reduced batch size to 2 per spec
  private static readonly BATCH_INTERVAL = 3500; // 3.5s between batches
  private static readonly REQUEST_DELAY = 750; // 750ms between requests
  private static readonly SKIPPED_400_KEY = 'insights_skipped_400_requests';
  private static readonly processedRequests = new Set<string>();

  /**
   * Process an array of request functions with controlled rate limiting
   * @param requests Array of request functions to be executed
   * @returns Array of results in the same order as the requests
   */
  public static async throttleRequests<T>(requests: (() => Promise<T>)[], idPrefix: string = 'insight'): Promise<T[]> {
    const results: T[] = [];
    console.log(`[INSIGHTS] Throttling ${requests.length} requests with batch size ${this.BATCH_SIZE}`);
    
    // NEW: Abort if too many requests in queue
    const MAX_QUEUE_SIZE = 100;
    if (requests.length > MAX_QUEUE_SIZE) {
      console.warn(`⚠️ Skipping insights fetch: too many campaigns in queue (${requests.length})`);
      return [];
    }
    
    // Track consecutive errors to implement exponential backoff
    let consecutiveErrors = 0;
    
    // Calculate total batches for logging
    const totalBatches = Math.ceil(requests.length / this.BATCH_SIZE);
    
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      const batchNumber = Math.floor(i / this.BATCH_SIZE) + 1;
      console.log(`[INSIGHTS] Processing batch ${batchNumber}/${totalBatches} with ${batch.length} requests`);
      
      // Define delay based on consecutive errors but with minimum from config
      const currentDelay = consecutiveErrors > 0 
        ? Math.max(this.REQUEST_DELAY, this.REQUEST_DELAY * Math.pow(2, consecutiveErrors))
        : this.REQUEST_DELAY;
      
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
          // Wait for explicit delay before each request (except first in batch)
          if (j > 0) {
            console.log(`⏳ Waiting ${currentDelay}ms between requests...`);
            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }
          
          // Generate a unique request ID that includes the request function hash
          console.log(`✅ Executing request ${requestId} (batch ${batchNumber}/${totalBatches})...`);
          
          // Create a wrapper function to capture the request signature before execution
          const wrappedRequest = () => {
            const requestSignature = `${requestId}-execution`;
            
            // Check if this request previously failed with 400 (IMPROVED CHECK)
            if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
              console.log(`[INSIGHTS] Skipped insights request due to permanent failure (400): ${requestId}`);
              
              // Track this skipped request for debugging
              try {
                const skippedRequests = JSON.parse(localStorage.getItem(this.SKIPPED_400_KEY) || '[]');
                skippedRequests.push({
                  timestamp: new Date().toISOString(),
                  requestId,
                  signature: requestSignature,
                  location: 'throttleRequests-wrapper'
                });
                localStorage.setItem(this.SKIPPED_400_KEY, JSON.stringify(skippedRequests.slice(-30)));
              } catch (e) {
                // Ignore storage errors
              }
              
              return Promise.reject({
                message: 'Request skipped due to previous 400 error',
                status: 400,
                skipped: true
              });
            }
            
            // Execute the actual request
            return req().catch(error => {
              // If it's a 400 error, mark this request signature as permanently failed
              if (error.status === 400 || (error.response && error.response.status === 400)) {
                console.error(`[INSIGHTS] Request failed with 400, marking as permanently failed: ${requestSignature}`);
                DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
                
                // Store additional info about this 400 error
                try {
                  const failures = JSON.parse(localStorage.getItem('throttler_400_failures') || '[]');
                  failures.push({
                    timestamp: new Date().toISOString(),
                    requestId,
                    signature: requestSignature,
                    error: error.message || 'Unknown 400 error',
                    location: 'throttleRequests-catch'
                  });
                  localStorage.setItem('throttler_400_failures', JSON.stringify(failures.slice(-30)));
                } catch (e) {
                  // Ignore storage errors
                }
              }
              throw error;
            });
          };
          
          const result = await RequestQueueManager.addToQueue(wrappedRequest, requestId);
          consecutiveErrors = 0;
          results.push(result);
        } catch (error: any) {
          console.error('[INSIGHTS] Request failed:', error);
          
          // Skip logging for already-skipped 400 errors to reduce noise
          if (!error.skipped) {
            console.log('[INSIGHTS] Logging non-skipped error:', error);
          }
          
          // If it's a 400 error, don't increment consecutive errors
          if (error.status !== 400 && (!error.response || error.response.status !== 400)) {
            consecutiveErrors++;
          } else {
            console.log('[INSIGHTS] Skipped insights request due to permanent failure (400)');
          }
          
          // Push null for failed requests to maintain array positions
          results.push(null as T);
          
          // If error is rate limit (code 4), break completely to avoid further calls
          if (error.code === 4 || (error.error && error.error.code === 4)) {
            console.warn("🚫 Skipping fetch - hit Meta rate limit (#4)");
            break;
          }
        }
      }
      
      // Wait between batches unless this is the last batch
      if (i + this.BATCH_SIZE < requests.length) {
        console.log(`⏲️ Waiting ${this.BATCH_INTERVAL}ms before next batch...`);
        await new Promise(resolve => setTimeout(resolve, this.BATCH_INTERVAL));
      }
    }
    
    console.log(`[INSIGHTS] Completed ${results.filter(r => r !== null).length}/${requests.length} requests successfully`);
    return results;
  }
}
