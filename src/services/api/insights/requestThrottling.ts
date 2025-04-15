
/**
 * Utility to handle request throttling for insights fetches
 */
export class InsightsRequestThrottler {
  private static queue: Promise<any>[] = [];
  private static processing = false;
  private static readonly BATCH_SIZE = 10;
  private static readonly BATCH_INTERVAL = 1000; // 1 second

  public static async throttleRequests<T>(requests: (() => Promise<T>)[]): Promise<T[]> {
    const results: T[] = [];
    
    for (let i = 0; i < requests.length; i += this.BATCH_SIZE) {
      const batch = requests.slice(i, i + this.BATCH_SIZE);
      const batchResults = await Promise.allSettled(batch.map(req => req()));
      
      // Process results and wait before next batch
      batchResults.forEach((result) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        }
      });
      
      if (i + this.BATCH_SIZE < requests.length) {
        await new Promise(resolve => setTimeout(resolve, this.BATCH_INTERVAL));
      }
    }
    
    return results;
  }
}
