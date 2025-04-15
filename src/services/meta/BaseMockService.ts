
import { RequestQueueManager } from '../api/queue/RequestQueueManager';
import { CampaignThrottling } from '../api/campaign/throttling';

export abstract class BaseMockService {
  protected static readonly API_VERSION = 'v17.0';
  protected static readonly BASE_URL = 'https://graph.facebook.com';

  // Updated to use proper throttling logic
  public static async executeWithRateLimiting<T>(
    requestFn: () => Promise<T>, 
    options: { bypassQueue?: boolean, skipRateLimitCheck?: boolean } = {}
  ): Promise<T> {
    // Check throttling using CampaignThrottling
    try {
      CampaignThrottling.checkThrottling();
    } catch (throttleError: any) {
      console.warn('API request throttled:', throttleError.message);
      
      if (options.bypassQueue) {
        throw throttleError;
      }
      
      // Queue the request if not bypassing queue
      return RequestQueueManager.addToQueue(requestFn);
    }
    
    try {
      return await requestFn();
    } catch (error: any) {
      // Check if it's a rate limit error
      const isRateLimit = error?.code === 4 || 
                          error?.code === 17 || 
                          error?.status === 429 ||
                          (error?.message && error?.message.toLowerCase().includes('rate limit'));
      
      if (isRateLimit) {
        console.warn('Rate limit detected:', error.message || 'Rate limit error');
        
        if (options.bypassQueue) {
          throw error;
        }
        
        // Queue the request
        return RequestQueueManager.addToQueue(requestFn);
      }
      
      throw error;
    }
  }
}
