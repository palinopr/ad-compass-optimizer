
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';
import { strictSequentialQueue } from '../queue/StrictSequentialQueue';

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

    console.log(`[INSIGHTS] Queueing request via StrictSequentialQueue: ${requestId}`);
    return strictSequentialQueue.enqueueRequest(requestFn, requestId);
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static reset(): void {
    strictSequentialQueue.reset();
  }
  
  static isProcessing(): boolean {
    return strictSequentialQueue.isActive();
  }
}
