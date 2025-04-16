
/**
 * Specialized throttler for insights API requests
 */
export class InsightsRequestThrottler {
  private static queue: Promise<any>[] = [];
  private static processing = false;
  private static readonly BATCH_SIZE = 3; // Reduced batch size to avoid rate limits
  private static readonly BATCH_INTERVAL = 2000; // 2 seconds between batches
  private static readonly REQUEST_DELAY = 300; // 300ms between individual requests

  /**
   * Process an array of request functions with controlled rate limiting
   * @param requests Array of request functions to be executed
   * @returns Array of results in the same order as the requests
   */
  public static async throttleRequests<T>(requests: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    console.log(`[INSIGHTS] Throttling ${requests.length} requests with batch size ${this.BATCH_SIZE}`);
    
    // Track consecutive errors to implement exponential backoff
    let consecutiveErrors = 0;
    
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      console.log(`[INSIGHTS] Processing batch ${Math.floor(i/this.BATCH_SIZE) + 1} with ${batch.length} requests`);
      
      // If we had consecutive errors, increase the delay exponentially
      const currentDelay = consecutiveErrors > 0 
        ? Math.min(this.REQUEST_DELAY * Math.pow(2, consecutiveErrors), 3000) 
        : this.REQUEST_DELAY;
      
      const batchPromises = batch.map(async (req, index) => {
        try {
          // Add progressive delay between requests in the same batch
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }
          
          const result = await req();
          consecutiveErrors = 0; // Reset on success
          return result;
        } catch (error) {
          console.error('[INSIGHTS] Request failed:', error);
          consecutiveErrors++; // Increment on failure
          return null;
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
      
      // If there are more batches to process, wait before the next batch
      // Use longer delays if we've encountered errors
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
