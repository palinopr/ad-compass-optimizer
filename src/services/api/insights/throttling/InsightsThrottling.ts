
import { toast } from '@/hooks/use-toast';
import { RateLimitManager } from '../../rate-limit/RateLimitManager';
import { ThrottleStorage } from './storage';
import { DuplicateRequestChecker } from './duplicateChecker';
import { ResponseMonitor } from './responseMonitor';
import { IRateLimitInfo } from './types';

export class InsightsThrottling {
  static checkThrottling(accountId: string = 'default'): void {
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
    ResponseMonitor.monitorHeaders(response);
  }

  static checkErrorForRateLimit(error: any): void {
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
    return DuplicateRequestChecker.isDuplicate(campaignId, datePreset);
  }

  static resetThrottling(): void {
    DuplicateRequestChecker.reset();
  }
}
