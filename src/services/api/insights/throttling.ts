
import { RateLimitManager } from '../rate-limit/RateLimitManager';
import { toast } from '@/hooks/use-toast';

export class InsightsThrottling {
  private static readonly THROTTLE_STORAGE_KEY = 'meta_insights_throttle';

  public static checkThrottling(accountId: string = 'default'): void {
    // Check if rate limited via RateLimitManager first
    if (RateLimitManager.isRateLimited()) {
      const remainingTime = RateLimitManager.getRateLimitTimeRemaining();
      const rateLimitInfo = RateLimitManager.getRateLimitInfo();
      
      console.warn(`[INSIGHTS] Rate limited (${rateLimitInfo.limitType}). Remaining: ${remainingTime}s`);
      
      throw new Error(`Rate limit active. Try again in ${Math.ceil(remainingTime! / 60)} minutes.`);
    }

    // Check for API throttling
    try {
      const throttleKey = `${this.THROTTLE_STORAGE_KEY}_${accountId}`;
      const throttleData = localStorage.getItem(throttleKey);
      
      if (throttleData) {
        const { expiryTime } = JSON.parse(throttleData);
        const now = Date.now();
        
        if (now < expiryTime) {
          const remainingSeconds = Math.ceil((expiryTime - now) / 1000);
          console.warn(`[INSIGHTS] API requests throttled for ${remainingSeconds} seconds`);
          
          toast({
            title: "API Throttled",
            description: "Paused to avoid Meta API limits. Please wait.",
            variant: "destructive",
          });
          
          throw new Error(`API throttled. Try again in ${remainingSeconds} seconds.`);
        } else {
          localStorage.removeItem(throttleKey);
        }
      }
    } catch (e) {
      if (e instanceof Error && e.message.includes('API throttled')) {
        throw e;
      }
      console.error('[INSIGHTS] Error checking throttling:', e);
    }
  }

  public static markThrottled(accountId: string = 'default', durationSeconds: number = 60): void {
    try {
      const throttleKey = `${this.THROTTLE_STORAGE_KEY}_${accountId}`;
      const now = Date.now();
      const expiryTime = now + (durationSeconds * 1000);
      
      localStorage.setItem(throttleKey, JSON.stringify({ expiryTime }));
      
      toast({
        title: "Pausing API Requests",
        description: `Paused for ${durationSeconds} seconds to avoid Meta API limits`,
        variant: "destructive",
      });
    } catch (e) {
      console.error('[INSIGHTS] Error marking throttled:', e);
    }
  }

  /**
   * Monitor response headers for rate limit signals
   */
  public static monitorResponseHeaders(response: Response): void {
    try {
      // Check for rate limit headers
      const usageHeader = response.headers.get('x-business-use-case-usage') || 
                        response.headers.get('x-app-usage') ||
                        response.headers.get('x-ad-account-usage');
      
      if (usageHeader) {
        try {
          const usage = JSON.parse(usageHeader);
          
          // Check for high usage in any of the rate limit metrics
          const hasHighUsage = Object.values(usage).some((metric: any) => 
            typeof metric === 'object' && 
            (metric.call_count > 80 || metric.total_cputime > 80 || metric.total_time > 80)
          );
          
          if (hasHighUsage) {
            console.warn('[INSIGHTS] High API usage detected:', usage);
            this.markThrottled('default', 30); // 30-second throttling
          }
          
          // If usage is critical (>95%), apply stronger throttling
          const hasCriticalUsage = Object.values(usage).some((metric: any) => 
            typeof metric === 'object' && 
            (metric.call_count > 95 || metric.total_cputime > 95 || metric.total_time > 95)
          );
          
          if (hasCriticalUsage) {
            console.error('[INSIGHTS] Critical API usage detected');
            RateLimitManager.setRateLimit(300); // 5-minute rate limit
          }
        } catch (e) {
          console.error('[INSIGHTS] Error parsing usage headers:', e);
        }
      }
    } catch (e) {
      console.error('[INSIGHTS] Error monitoring response headers:', e);
    }
  }

  /**
   * Check if an error indicates rate limiting and handle accordingly
   */
  public static checkErrorForRateLimit(error: any): void {
    try {
      // Check error message for rate limit indicators
      const errorMessage = error?.message || '';
      const errorResponse = error?.response;
      const errorBody = errorResponse?.data || error?.error || {};
      
      // Check for rate limit error codes or messages
      const isRateLimitError = 
        errorMessage.includes('rate limit') ||
        errorMessage.includes('too many requests') ||
        errorBody?.error?.code === 4 || // API rate limit code
        errorBody?.error?.code === 17 || // User rate limit code
        errorBody?.error?.code === 80003 || // Ad account rate limit
        errorBody?.error?.code === 80004 || // Ad account rate limit
        errorResponse?.status === 429;
      
      if (isRateLimitError) {
        console.warn('[INSIGHTS] Rate limit error detected:', error);
        
        // Extract retry after time if available
        let retryAfter = 
          error?.response?.headers?.['retry-after'] || 
          error?.response?.headers?.get?.('retry-after') ||
          5 * 60; // Default to 5 minutes
        
        // Convert to number if it's a string
        if (typeof retryAfter === 'string') {
          retryAfter = parseInt(retryAfter, 10) || 5 * 60;
        }
        
        // Set rate limit with the appropriate time
        RateLimitManager.setRateLimit(retryAfter, {
          code: errorBody?.error?.code,
          message: errorMessage
        });
        
        // Also apply shorter throttling
        this.markThrottled('default', 30); 
      }
    } catch (e) {
      console.error('[INSIGHTS] Error checking for rate limiting:', e);
    }
  }
}
