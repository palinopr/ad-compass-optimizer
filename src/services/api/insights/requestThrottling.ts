
/**
 * Specialized throttler for insights API requests
 */
import { RequestQueueManager } from '../queue/RequestQueueManager';

export class InsightsRequestThrottler {
  private static queue: Promise<any>[] = [];
  private static processing = false;
  private static readonly BATCH_SIZE = 3;
  private static readonly BATCH_INTERVAL = 2000;
  private static readonly REQUEST_DELAY = 300;

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
    
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      console.log(`[INSIGHTS] Processing batch ${Math.floor(i/this.BATCH_SIZE) + 1} with ${batch.length} requests`);
      
      const currentDelay = consecutiveErrors > 0 
        ? Math.min(this.REQUEST_DELAY * Math.pow(2, consecutiveErrors), 3000) 
        : this.REQUEST_DELAY;
      
      const batchPromises = batch.map(async (req, index) => {
        try {
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }
          
          // Generate a unique request ID
          const requestId = `${idPrefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
          
          const result = await RequestQueueManager.addToQueue(req, requestId);
          consecutiveErrors = 0;
          return result;
        } catch (error: any) {
          console.error('[INSIGHTS] Request failed:', error);
          
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
      
      if (i + this.BATCH_SIZE < requests.length) {
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
