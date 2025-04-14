
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
  
  // Check code property directly (common in Meta API responses)
  if (error.code === 4 || error.code === 17 || error.code === 32 || 
      (error.code >= 80000 && error.code <= 80014)) {
    return true;
  }
  
  // Check for subcode 2446079 which indicates rate limiting in v3.3 and older APIs
  if (error.details?.error?.error_subcode === 2446079 || 
      error.error_subcode === 2446079) {
    return true;
  }
  
  return false;
};
