
import { parseApiError } from './apiErrorParser';
import { handleRateLimitError } from './rateLimitHandler';
import { enhanceHttpError } from './httpErrorHandler';
import { isRateLimitError } from '../rateLimit';

export const handleApiError = parseApiError;

export const processFetchError = (err: any, onFetchFailure?: () => void): {
  error: string;
  errorDetails: any;
} => {
  // Check for rate limit messages in the error
  if (isRateLimitError(err)) {
    return handleRateLimitError(err, onFetchFailure);
  }
  
  const errorMessage = err?.message || (err instanceof Error ? err.message : 'Failed to fetch campaigns');
  
  // Enhanced error storage for troubleshooting
  let errorDetails = err?.details || {
    error: {
      message: errorMessage,
      timestamp: new Date().toISOString()
    }
  };
  
  return enhanceHttpError(errorMessage, errorDetails);
};
