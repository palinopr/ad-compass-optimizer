
/**
 * Calculate backoff time based on recent API issues
 */
export const getBackoffTime = (lastFetchSuccess: boolean, rateLimitHistory: string[], callCount?: number): number => {
  // Base backoff time
  let backoffTime = 2000; // 2 seconds minimum
  
  // If we've had failures, increase backoff
  if (!lastFetchSuccess) {
    backoffTime = 5000; // 5 seconds
  }
  
  // If we've had rate limits, increase further
  if (rateLimitHistory && rateLimitHistory.length > 0) {
    // Exponential backoff based on number of recent rate limits
    backoffTime = 5000 * Math.pow(1.5, Math.min(rateLimitHistory.length, 5));
  }
  
  // If we're close to API limits, be more conservative
  if (callCount && callCount > 80) {
    backoffTime = Math.max(backoffTime, 10000); // At least 10 seconds
  }
  
  // Cap at 60 seconds
  return Math.min(backoffTime, 60000);
};

// Check if rate limit should be bypassed (for debugging)
export const shouldBypassRateLimit = (): boolean => {
  // Check URL parameters for override flag
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('bypass_rate_limit') === 'true') {
    console.warn("⚠️ Rate limit bypass detected via URL parameter");
    return true;
  }
  
  // Check for override in localStorage (for developer testing)
  if (localStorage.getItem('meta_api_bypass_rate_limit') === 'true') {
    console.warn("⚠️ Rate limit bypass detected via localStorage flag");
    return true;
  }
  
  return false;
};
