
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';
import { insightsQueue } from '../queue/InsightsQueueManager';

export class RequestThrottlingService {
  static async throttleRequest<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Check rate limiting
    if (RateLimitManager.isRateLimited()) {
      const timeRemaining = RateLimitManager.getRateLimitTimeRemaining();
      throw new Error(`Rate limited. Try again in ${Math.ceil((timeRemaining || 0) / 60)} minutes.`);
    }

    console.log(`[INSIGHTS] Queueing request: ${requestId}`);
    
    return insightsQueue.enqueueRequest(requestFn);
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static reset(): void {
    insightsQueue.clearQueue();
  }
}
