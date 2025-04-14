
/**
 * Rate limit configuration and utilities
 */

// Default waiting period after rate limit in minutes
export const DEFAULT_RATE_LIMIT_WAIT = 10;

// Time between requests in milliseconds to avoid triggering rate limits
export const MIN_REQUEST_INTERVAL = 2000;

/**
 * Check if rate limit override is enabled (for development purposes only)
 */
export const shouldBypassRateLimit = (): boolean => {
  // Check for development override - NEVER use in production
  return localStorage.getItem('meta_bypass_rate_limit') === 'true';
};

/**
 * Calculate adaptive backoff time based on failure history
 */
export const getBackoffTime = (
  lastFetchSuccess: boolean, 
  rateLimitHistory: string[], 
  callCount?: number
): number => {
  // Start with base backoff of 2 seconds
  let backoff = 2000;
  
  // If the last fetch failed, increase backoff
  if (!lastFetchSuccess) {
    backoff = 5000;
  }
  
  // If we've had multiple rate limits recently, increase backoff
  if (rateLimitHistory.length > 0) {
    const multiplier = Math.min(rateLimitHistory.length, 5);
    backoff = backoff * multiplier;
  }
  
  // If we're approaching API limits (over 80% usage), add more backoff
  if (callCount && callCount > 80) {
    const usageMultiplier = (callCount - 80) / 10; // 0 to 2 for 80-100% usage
    backoff = backoff * (1 + usageMultiplier);
  }
  
  // Cap at 30 seconds max backoff
  return Math.min(backoff, 30000);
};
