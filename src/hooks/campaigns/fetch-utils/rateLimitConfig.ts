
/**
 * Configuration for rate limiting and backoff strategies
 */

/**
 * Calculate appropriate backoff time based on recent rate limiting history
 * 
 * @param lastFetchSuccess Whether the last fetch was successful
 * @param rateLimitHistory Array of timestamps when rate limits were hit
 * @param callCount Current API call count percentage if available
 * @returns Backoff time in milliseconds
 */
export const getBackoffTime = (
  lastFetchSuccess: boolean,
  rateLimitHistory: string[],
  callCount?: number
): number => {
  // Base backoff time
  let backoffTime = 2000; // 2 seconds default
  
  // If the last fetch failed, add more backoff
  if (!lastFetchSuccess) {
    backoffTime += 3000; // additional 3 seconds
  }
  
  // If we have rate limit history, add progressive backoff
  if (rateLimitHistory && rateLimitHistory.length > 0) {
    // Count recent rate limits (within last hour)
    const recentLimits = rateLimitHistory.filter(timestamp => {
      const limitTime = new Date(timestamp).getTime();
      const now = new Date().getTime();
      return (now - limitTime) < 60 * 60 * 1000; // Within last hour
    });
    
    // Exponential backoff based on recent rate limits
    if (recentLimits.length > 0) {
      // Add 5 seconds for each recent rate limit, up to 30 seconds max
      const additionalBackoff = Math.min(recentLimits.length * 5000, 30000);
      backoffTime += additionalBackoff;
    }
  }
  
  // If call count is high, add even more backoff
  if (callCount && callCount > 50) {
    // Add up to 10 seconds based on how close we are to the limit
    const usageBackoff = Math.min(((callCount - 50) / 50) * 10000, 10000);
    backoffTime += usageBackoff;
  }
  
  return backoffTime;
};

/**
 * Get the recommended delay between API requests based on API usage
 * 
 * @param apiUsagePercentage Current API usage percentage (0-100)
 * @returns Recommended delay in milliseconds
 */
export const getRequestDelay = (apiUsagePercentage?: number): number => {
  if (!apiUsagePercentage) return 1000; // Default 1 second
  
  if (apiUsagePercentage > 90) return 5000;  // 5 seconds if near limit
  if (apiUsagePercentage > 80) return 3000;  // 3 seconds if high usage
  if (apiUsagePercentage > 60) return 2000;  // 2 seconds if moderate usage
  
  return 1000; // 1 second for normal usage
};
