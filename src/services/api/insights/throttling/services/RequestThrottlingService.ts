
import { THROTTLING_CONFIG } from '../config/ThrottlingConfig';
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';

export class RequestThrottlingService {
  private static currentRequestCount = 0;
  private static isProcessing = false;
  private static lastRequestTime = 0;
  private static requestQueue: Array<{
    id: string;
    requestFn: () => Promise<any>;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  static async throttleRequest<T>(
    requestFn: () => Promise<T>,
    requestId: string
  ): Promise<T> {
    // Check if we're at max concurrent requests
    if (this.currentRequestCount >= THROTTLING_CONFIG.MAX_CONCURRENT_REQUESTS) {
      console.log(`[INSIGHTS] Request queued: ${requestId} (${this.currentRequestCount}/${THROTTLING_CONFIG.MAX_CONCURRENT_REQUESTS} active requests)`);
      
      // Return a promise that will be resolved when the request can be processed
      return new Promise<T>((resolve, reject) => {
        this.requestQueue.push({ id: requestId, requestFn, resolve, reject });
        this.processQueueIfAvailable();
      });
    }

    // Check rate limiting
    if (RateLimitManager.isRateLimited()) {
      const timeRemaining = RateLimitManager.getRateLimitTimeRemaining();
      throw new Error(`Rate limited. Try again in ${Math.ceil((timeRemaining || 0) / 60)} minutes.`);
    }
    
    // Enforce minimum time between requests
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (this.lastRequestTime > 0 && timeSinceLastRequest < THROTTLING_CONFIG.MIN_REQUEST_INTERVAL) {
      const waitTime = THROTTLING_CONFIG.MIN_REQUEST_INTERVAL - timeSinceLastRequest;
      console.log(`[INSIGHTS] Enforcing minimum interval, waiting ${waitTime}ms before processing ${requestId}`);
      await this.delay(waitTime);
    }

    try {
      this.currentRequestCount++;
      this.lastRequestTime = Date.now();
      console.log(`[INSIGHTS] Starting request #${this.currentRequestCount}: ${requestId}`);
      
      return await requestFn();
    } finally {
      this.currentRequestCount = Math.max(0, this.currentRequestCount - 1);
      console.log(`[INSIGHTS] Request completed: ${requestId}. ${this.currentRequestCount} active requests remaining.`);
      
      // Process next request in queue if available
      this.processQueueIfAvailable();
    }
  }

  private static async processQueueIfAvailable(): Promise<void> {
    if (this.requestQueue.length === 0 || this.isProcessing) {
      return;
    }
    
    // Don't process if at max concurrent requests
    if (this.currentRequestCount >= THROTTLING_CONFIG.MAX_CONCURRENT_REQUESTS) {
      return;
    }
    
    this.isProcessing = true;
    
    try {
      const queuedRequest = this.requestQueue.shift();
      if (!queuedRequest) {
        return;
      }
      
      const { id, requestFn, resolve, reject } = queuedRequest;
      
      console.log(`[INSIGHTS] Processing queued request: ${id}`);
      
      try {
        // Apply throttling to the dequeued request
        const result = await this.throttleRequest(requestFn, id);
        resolve(result);
      } catch (error) {
        reject(error);
      }
    } finally {
      this.isProcessing = false;
      
      // Check if more requests can be processed
      if (this.requestQueue.length > 0) {
        this.processQueueIfAvailable();
      }
    }
  }

  static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static reset(): void {
    this.currentRequestCount = 0;
    this.isProcessing = false;
    this.lastRequestTime = 0;
    this.requestQueue = [];
  }
}
