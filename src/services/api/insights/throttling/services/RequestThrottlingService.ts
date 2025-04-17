
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';
import { strictSequentialQueue } from '../queue/StrictSequentialQueue';
import { insightsThrottlingState } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

// Global tracking of attempted requests to prevent duplicates
const attemptedRequests = new Set<string>();

export class RequestThrottlingService {
  static async throttleRequest<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Check if this exact request has already been attempted this session
    if (attemptedRequests.has(requestId)) {
      console.log(`[INSIGHTS] Skipping duplicate request: ${requestId}`);
      throw new Error(`Duplicate request: ${requestId}`);
    }
    
    // Mark this request as attempted
    attemptedRequests.add(requestId);
    
    // Check global throttling state
    if (insightsThrottlingState.isActiveThrottling()) {
      console.warn(`[INSIGHTS] Global throttling active, rejecting: ${requestId}`);
      throw new Error('Global throttling active');
    }
    
    // Check rate limiting
    if (RateLimitManager.isRateLimited()) {
      const timeRemaining = RateLimitManager.getRateLimitTimeRemaining();
      throw new Error(`Rate limited. Try again in ${Math.ceil((timeRemaining || 0) / 60)} minutes.`);
    }

    console.log(`[INSIGHTS] Queueing request via StrictSequentialQueue: ${requestId}`);
    
    // This enqueues the request and returns a promise that resolves when the request is processed
    return strictSequentialQueue.enqueueRequest(requestFn, requestId);
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static reset(): void {
    strictSequentialQueue.reset();
    attemptedRequests.clear();
  }
  
  static isProcessing(): boolean {
    return strictSequentialQueue.isActive();
  }
  
  static getStats() {
    return {
      queueStats: strictSequentialQueue.getStats(),
      attemptedRequestsCount: attemptedRequests.size,
    };
  }
}
