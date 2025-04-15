
/**
 * Check if an error is due to rate limiting
 */
export const isRateLimitError = (error: any): boolean => {
  // Check for specific rate limit error codes or messages from Meta
  if (!error) return false;
  
  // Check for standard rate limit HTTP status
  if (error.status === 429) return true;
  
  // Check for Meta API specific error codes
  if (error.code === 4 || error.code === 17) return true;
  
  // Check error message for rate limiting keywords
  const errorMessage = error?.message?.toLowerCase() || '';
  return errorMessage.includes('rate limit') || 
         errorMessage.includes('too many requests') ||
         errorMessage.includes('throttled');
};
