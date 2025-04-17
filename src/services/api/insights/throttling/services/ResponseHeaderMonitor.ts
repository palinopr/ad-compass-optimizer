
import { RateLimitManager } from '../../../rate-limit/RateLimitManager';

export class ResponseHeaderMonitor {
  static monitorHeaders(response: Response): void {
    try {
      const usageHeader = response.headers.get('x-business-use-case-usage') || 
                         response.headers.get('x-app-usage') ||
                         response.headers.get('x-ad-account-usage');
                         
      if (usageHeader) {
        const usage = JSON.parse(usageHeader);
        
        // Check for high usage levels
        if (usage.call_count > 95 || usage.total_cputime > 95 || usage.total_time > 95) {
          console.warn('[INSIGHTS] High API usage detected:', usage);
          
          // Convert retry-after to a number, defaulting to 300 if not a valid number
          const retryAfter = response.headers.get('retry-after') || '300';
          const parsedRetryAfter = parseInt(retryAfter, 10);
          
          // Apply rate limiting with appropriate retry-after
          RateLimitManager.setRateLimit(
            isNaN(parsedRetryAfter) ? 300 : parsedRetryAfter
          );
        }
      }
      
      const rateLimitHeader = response.headers.get('x-rate-limit-remaining');
      if (rateLimitHeader && parseInt(rateLimitHeader, 10) < 10) {
        console.warn('[INSIGHTS] Rate limit threshold approaching');
        RateLimitManager.setRateLimit(300); // 5 minute cooldown
      }
    } catch (error) {
      console.error('[INSIGHTS] Error monitoring response headers:', error);
    }
  }
}
