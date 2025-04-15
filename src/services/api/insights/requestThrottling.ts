
/**
 * Utility to handle request throttling for insights fetches
 */
export class InsightsRequestThrottler {
  private static queue: Promise<any>[] = [];
  private static processing = false;
  private static readonly BATCH_SIZE = 5; // Reduced batch size to avoid rate limits
  private static readonly BATCH_INTERVAL = 2000; // Increased to 2 seconds between batches

  public static async throttleRequests<T>(requests: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    console.log(`[INSIGHTS] Throttling ${requests.length} requests with batch size ${this.BATCH_SIZE}`);
    
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      // Process each batch
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      console.log(`[INSIGHTS] Processing batch ${Math.floor(i/this.BATCH_SIZE) + 1} with ${batch.length} requests`);
      
      const batchPromises = batch.map(async (req, index) => {
        try {
          // Add small delay between individual requests in the same batch
          if (index > 0) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }
          return await req();
        } catch (error) {
          console.error('[INSIGHTS] Request failed:', error);
          return null;
        }
      });
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      // Process results and wait before next batch
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
      
      // Wait between batches if there are more to process
      if (i + this.BATCH_SIZE < requests.length) {
        console.log(`[INSIGHTS] Waiting ${this.BATCH_INTERVAL}ms before next batch`);
        await new Promise(resolve => setTimeout(resolve, this.BATCH_INTERVAL));
      }
    }
    
    console.log(`[INSIGHTS] Completed ${results.length} requests successfully`);
    return results;
  }
}
