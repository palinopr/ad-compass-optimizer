
import { toast } from '@/hooks/use-toast';
import { RateLimitManager } from '../../rate-limit/RateLimitManager';
import { ThrottleStorage } from './storage';
import { DuplicateRequestChecker } from './duplicateChecker';
import { ResponseMonitor } from './responseMonitor';
import { IRateLimitInfo } from './types';

export class InsightsThrottling {
  // Singleton instance for tracking in-flight requests
  private static currentRequestCount = 0;
  private static readonly MAX_CONCURRENT_REQUESTS = 2;
  private static readonly processedRequestIds = new Set<string>();

  static checkThrottling(accountId: string = 'default'): void {
    // First check if we have too many concurrent requests
    if (this.currentRequestCount >= this.MAX_CONCURRENT_REQUESTS) {
      console.warn(`[INSIGHTS] Too many concurrent requests (${this.currentRequestCount}/${this.MAX_CONCURRENT_REQUESTS})`);
      
      toast({
        title: "Request Throttled",
        description: `Too many concurrent requests (${this.currentRequestCount}/${this.MAX_CONCURRENT_REQUESTS})`,
        variant: "destructive",
      });
      
      throw new Error(`Too many concurrent requests (${this.currentRequestCount}/${this.MAX_CONCURRENT_REQUESTS})`);
    }

    const throttleData = ThrottleStorage.getThrottleData(accountId);
    
    if (throttleData) {
      const now = Date.now();
      if (now < throttleData.expiryTime) {
        const remainingSeconds = Math.ceil((throttleData.expiryTime - now) / 1000);
        console.warn(`[INSIGHTS] API requests throttled for ${remainingSeconds} seconds`);
        
        toast({
          title: "API Throttled",
          description: "Paused to avoid Meta API limits. Please wait.",
          variant: "destructive",
        });
        
        throw new Error(`API throttled. Try again in ${remainingSeconds} seconds.`);
      }
    }

    if (RateLimitManager.isRateLimited()) {
      const remainingTime = RateLimitManager.getRateLimitTimeRemaining();
      const rateLimitInfo = RateLimitManager.getRateLimitInfo();
      throw new Error(`Rate limit active. Try again in ${Math.ceil(remainingTime! / 60)} minutes.`);
    }
    
    // Increment the request count
    this.currentRequestCount++;
  }

  static markRequestCompleted(): void {
    // Decrement the request count when a request completes
    this.currentRequestCount = Math.max(0, this.currentRequestCount - 1);
  }

  static markThrottled(accountId: string = 'default', durationSeconds: number = 60): void {
    ThrottleStorage.storeThrottleData(accountId, durationSeconds);
    
    toast({
      title: "Pausing API Requests",
      description: `Paused for ${durationSeconds} seconds to avoid Meta API limits`,
      variant: "destructive",
    });
  }

  static monitorResponseHeaders(response: Response): void {
    // Always mark the request as completed after processing
    this.markRequestCompleted();
    
    // Then delegate to the response monitor
    ResponseMonitor.monitorHeaders(response);
  }

  static checkErrorForRateLimit(error: any): void {
    // Always mark the request as completed on error
    this.markRequestCompleted();
    
    const errorMessage = error?.message || '';
    const errorResponse = error?.response;
    const errorBody = errorResponse?.data || error?.error || {};
    
    const isRateLimitError = 
      errorMessage.includes('rate limit') ||
      errorMessage.includes('too many requests') ||
      errorBody?.error?.code === 4 || // API rate limit code
      errorBody?.error?.code === 17 || // User rate limit code
      errorBody?.error?.code === 80003 || // Ad account rate limit
      errorBody?.error?.code === 80004 || // Ad account rate limit
      errorResponse?.status === 429;
    
    if (isRateLimitError) {
      let retryAfter = error?.response?.headers?.['retry-after'] || 
                       error?.response?.headers?.get?.('retry-after') ||
                       5 * 60; // Default to 5 minutes
      
      if (typeof retryAfter === 'string') {
        retryAfter = parseInt(retryAfter, 10) || 5 * 60;
      }
      
      RateLimitManager.setRateLimit(retryAfter, {
        code: errorBody?.error?.code,
        message: errorMessage
      });
      
      this.markThrottled('default', 30);
    }
  }

  static isDuplicateRequest(campaignId: string, datePreset: string): boolean {
    // Check our in-memory set first
    const requestId = `${campaignId}-${datePreset}`;
    if (this.processedRequestIds.has(requestId)) {
      return true;
    }
    
    // Then check the DuplicateRequestChecker
    const isDuplicate = DuplicateRequestChecker.isDuplicate(campaignId, datePreset);
    
    // If not a duplicate, add to our set
    if (!isDuplicate) {
      this.processedRequestIds.add(requestId);
    }
    
    return isDuplicate;
  }

  static resetThrottling(): void {
    // Reset all throttling state
    this.currentRequestCount = 0;
    this.processedRequestIds.clear();
    DuplicateRequestChecker.reset();
  }
}
