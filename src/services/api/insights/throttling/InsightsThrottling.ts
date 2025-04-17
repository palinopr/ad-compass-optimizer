
import { toast } from '@/hooks/use-toast';
import { RateLimitManager } from '../../rate-limit/RateLimitManager';
import { ThrottleStorage } from './storage';
import { DuplicateRequestChecker } from './duplicateChecker';
import { ResponseMonitor } from './responseMonitor';
import { IRateLimitInfo } from './types';
import { requestedCampaignIds } from '@/hooks/campaigns/fetch-utils/insights/batchConfig';

export class InsightsThrottling {
  // Singleton instance for tracking in-flight requests
  private static currentRequestCount = 0;
  private static readonly MAX_CONCURRENT_REQUESTS = 2;
  
  // Use the shared Set from batchConfig to track processed requests across the app
  private static get processedRequestIds() {
    return requestedCampaignIds;
  }

  // Prevent fetches if another is already in progress
  private static isFetchingInProgress = false;
  private static fetchLock = new Date().getTime();

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

    // Check if another fetch is already in progress (with 3s grace period)
    if (this.isFetchingInProgress) {
      const now = new Date().getTime();
      if (now - this.fetchLock < 3000) { // 3s lock
        console.warn(`[INSIGHTS] Another fetch is already in progress. Prevent concurrent fetch.`);
        throw new Error(`Another insights fetch is already in progress. Please wait.`);
      } else {
        // Lock expired, reset it
        this.isFetchingInProgress = false;
      }
    }

    // Set fetching in progress and update lock time
    this.isFetchingInProgress = true;
    this.fetchLock = new Date().getTime();

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
    
    // If no more requests, release the fetch lock
    if (this.currentRequestCount === 0) {
      this.isFetchingInProgress = false;
    }
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
    // Check our in-memory set first (shared with batchConfig)
    if (this.processedRequestIds.has(campaignId)) {
      return true;
    }
    
    // Then check the DuplicateRequestChecker
    const isDuplicate = DuplicateRequestChecker.isDuplicate(campaignId, datePreset);
    
    // If not a duplicate, add to our set
    if (!isDuplicate) {
      this.processedRequestIds.add(campaignId);
    }
    
    return isDuplicate;
  }

  static resetThrottling(): void {
    // Reset all throttling state
    this.currentRequestCount = 0;
    this.isFetchingInProgress = false;
    DuplicateRequestChecker.reset();
    // Don't clear processedRequestIds as it's now shared
  }
}
