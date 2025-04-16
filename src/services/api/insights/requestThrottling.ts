
/**
 * Specialized throttler for insights API requests
 */
import { RequestQueueManager } from '../queue/RequestQueueManager';
import { DuplicateRequestChecker } from './throttling/duplicateChecker';

export class InsightsRequestThrottler {
  private static queue: Promise<any>[] = [];
  private static processing = false;
  private static readonly BATCH_SIZE = 3;
  private static readonly BATCH_INTERVAL = 2000;
  private static readonly REQUEST_DELAY = 300;
  private static readonly SKIPPED_400_KEY = 'insights_skipped_400_requests';

  /**
   * Process an array of request functions with controlled rate limiting
   * @param requests Array of request functions to be executed
   * @returns Array of results in the same order as the requests
   */
  public static async throttleRequests<T>(requests: (() => Promise<T>)[], idPrefix: string = 'insight'): Promise<T[]> {
    const results: T[] = [];
    console.log(`[INSIGHTS] Throttling ${requests.length} requests with batch size ${this.BATCH_SIZE}`);
    
    // Track consecutive errors to implement exponential backoff
    let consecutiveErrors = 0;
    
    // Filter out requests that are known to fail with 400
    const filteredRequests = requests.filter((_, index) => {
      // We can't actually filter by signature here, but we'll count how many we skip
      // The actual filtering happens in the wrapped request function
      return true;
    });
    
    for (let i = 0; i < filteredRequests.length; i += this.BATCH_SIZE) {
      const batch = filteredRequests.slice(i, i + this.BATCH_SIZE);
      console.log(`[INSIGHTS] Processing batch ${Math.floor(i/this.BATCH_SIZE) + 1} with ${batch.length} requests`);
      
      const currentDelay = consecutiveErrors > 0 
        ? Math.min(this.REQUEST_DELAY * Math.pow(2, consecutiveErrors), 3000) 
        : this.REQUEST_DELAY;
      
      const batchPromises = batch.map(async (req, index) => {
        try {
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }
          
          // Generate a unique request ID that includes the request function hash
          const requestId = `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          
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
          return result;
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
          
          return null;
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
      
      if (i + this.BATCH_SIZE < filteredRequests.length) {
        const batchWaitTime = consecutiveErrors > 0
          ? Math.min(this.BATCH_INTERVAL * Math.pow(1.5, consecutiveErrors), 10000)
          : this.BATCH_INTERVAL;
        
        console.log(`[INSIGHTS] Waiting ${batchWaitTime}ms before next batch (consecutive errors: ${consecutiveErrors})`);
        await new Promise(resolve => setTimeout(resolve, batchWaitTime));
      }
    }
    
    console.log(`[INSIGHTS] Completed ${results.filter(r => r !== null).length}/${requests.length} requests successfully`);
    return results;
  }
}
