
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';
import { strictInsightsQueue } from '../queue/StrictQueueManager';

export class RequestThrottlingService {
  /**
   * Enhanced throttle request method that ensures only one request is processed at a time
   * This is the main entry point for all insights API requests
   */
  static async throttleRequest<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Check rate limiting
    if (RateLimitManager.isRateLimited()) {
      const timeRemaining = RateLimitManager.getRateLimitTimeRemaining();
      throw new Error(`Rate limited. Try again in ${Math.ceil((timeRemaining || 0) / 60)} minutes.`);
    }

    console.log(`[INSIGHTS] Queueing request via StrictQueueManager: ${requestId}`);
    
    // Use the new StrictQueueManager singleton
    return strictInsightsQueue.enqueueRequest(requestFn, requestId);
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static reset(): void {
    // Clear both queue systems to be safe
    strictInsightsQueue.clearQueue();
  }
  
  /**
   * Returns true if there are active requests being processed
   */
  static isProcessing(): boolean {
    return strictInsightsQueue.isActive();
  }
  
  /**
   * Get current queue stats for monitoring
   */
  static getQueueStats() {
    return strictInsightsQueue.getStats();
  }
}
