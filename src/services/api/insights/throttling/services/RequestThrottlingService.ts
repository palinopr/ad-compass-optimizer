
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';

export class RequestThrottlingService {
  private static currentRequestCount = 0;
  private static isProcessing = false;

  static async throttleRequest<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Check if we're at max concurrent requests
    if (this.currentRequestCount >= THROTTLING_CONFIG.MAX_CONCURRENT_REQUESTS) {
      throw new Error(`Too many concurrent requests (${this.currentRequestCount}/${THROTTLING_CONFIG.MAX_CONCURRENT_REQUESTS})`);
    }

    // Check rate limiting
    if (RateLimitManager.isRateLimited()) {
      const timeRemaining = RateLimitManager.getRateLimitTimeRemaining();
      throw new Error(`Rate limited. Try again in ${Math.ceil((timeRemaining || 0) / 60)} minutes.`);
    }

    try {
      this.currentRequestCount++;
      console.log(`[INSIGHTS] Starting request #${this.currentRequestCount}: ${requestId}`);
      
      return await requestFn();
    } finally {
      this.currentRequestCount = Math.max(0, this.currentRequestCount - 1);
      console.log(`[INSIGHTS] Request completed: ${requestId}. ${this.currentRequestCount} active requests remaining.`);
    }
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static reset(): void {
    this.currentRequestCount = 0;
    this.isProcessing = false;
  }
}
