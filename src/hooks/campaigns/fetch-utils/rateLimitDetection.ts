
/**
 * Checks whether an error is related to API rate limiting
 */
export const isRateLimitError = (error: any): boolean => {
  if (!error) return false;
  
  // Check message content
  if (typeof error.message === 'string' && 
      (error.message.includes('rate limit') || 
       error.message.includes('request limit') ||
       error.message.includes('too many calls'))) {
    return true;
  }
  
  // Check error codes - expanded to include all Meta rate limit error codes
  // Meta error codes: 4 (app rate limit), 17 (user rate limit), 32 (page rate limit),
  // 80000-80014 (BUC rate limits)
  if (error.details?.error?.code === 4 ||
      error.details?.error?.code === 17 ||
      error.details?.error?.code === 32 ||
      (error.details?.error?.code >= 80000 && error.details?.error?.code <= 80014)) {
    return true;
  }
  
  // Check for subcode 2446079 which indicates rate limiting in v3.3 and older APIs
  if (error.details?.error?.error_subcode === 2446079) {
    return true;
  }
  
  return false;
};

/**
 * Determines if a fetch request should be throttled based on time since last fetch
 * Following Meta's best practice to spread requests evenly
 */
export const shouldThrottleFetch = (lastFetchTime: number): boolean => {
  const now = Date.now();
  
  // Check if less than 2 seconds since last fetch
  if (now - lastFetchTime < 2000) {
    return true;
  }
  
  // Check if we've had multiple rate limits recently
  // If so, increase throttling time
  const rateLimitHistory = JSON.parse(localStorage.getItem('meta_rate_limit_history') || '[]');
  if (rateLimitHistory.length >= 3) {
    // If we've had 3+ rate limits, enforce stricter throttling
    // of 10 seconds between requests
    return now - lastFetchTime < 10000;
  }
  
  return false;
};
