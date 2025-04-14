
/**
 * Rate limit detection utilities
 */

/**
 * Check if an error is related to API rate limiting
 */
export const isRateLimitError = (error: any): boolean => {
  // Check for common rate limit indicators in error messages
  if (error && typeof error === 'object') {
    // For error objects
    const errorMessage = error.message || '';
    const errorString = String(errorMessage).toLowerCase();
    
    // Direct rate limit keywords in the error message
    if (errorString.includes('rate limit') || 
        errorString.includes('too many requests') ||
        errorString.includes('request limit') ||
        errorString.includes('too many calls')) {
      return true;
    }
    
    // Check for Facebook/Meta specific error codes
    // Error code 4 = API Limit, 17 = User Rate Limit
    if (error.code === 4 || error.code === 17 || 
        (error.details && error.details.error && 
         (error.details.error.code === 4 || error.details.error.code === 17))) {
      return true;
    }
    
    // Check for Business Use Case rate limit error codes (80000-80014)
    if ((error.code >= 80000 && error.code <= 80014) ||
        (error.details && error.details.error && 
         error.details.error.code >= 80000 && error.details.error.code <= 80014)) {
      return true;
    }
    
    // Check for HTTP 429 status (too many requests)
    if (error.status === 429 || 
        (error.response && error.response.status === 429)) {
      return true;
    }
  }
  
  return false;
};
