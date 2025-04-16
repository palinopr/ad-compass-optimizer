
import { ErrorDetails } from '../types/errorTypes';

export function parseApiError(error: any): { error: string; errorDetails: ErrorDetails } {
  console.log('[API ERROR] Parsing API error:', error);
  
  if (!error) {
    return {
      error: 'Unknown error occurred',
      errorDetails: { general: 'No error details available' }
    };
  }
  
  // Handle GraphMethodException (code 100, subcode 33) specifically 
  if (error.code === 100 && error.subcode === 33) {
    return {
      error: 'Permission denied: This ad account is not accessible with your current token',
      errorDetails: {
        code: error.code,
        subcode: error.subcode,
        type: 'GraphMethodException',
        message: error.message || 'Ad account not accessible',
        isPermissionError: true
      }
    };
  }
  
  // Handle token errors (code 190)
  if (error.code === 190) {
    return {
      error: 'Authentication error: Your Meta token is invalid or expired',
      errorDetails: {
        code: error.code,
        subcode: error.error_subcode,
        type: error.type || 'OAuthException',
        message: error.message || 'Invalid token',
        isPermissionError: true
      }
    };
  }
  
  // Handle permission errors (code 200)
  if (error.code === 200) {
    return {
      error: 'Permission error: Missing required permissions to access this resource',
      errorDetails: {
        code: error.code,
        subcode: error.error_subcode,
        type: error.type || 'PermissionError',
        message: error.message || 'Insufficient permissions',
        isPermissionError: true
      }
    };
  }
  
  // Handle rate limit errors
  if (error.code === 4 || error.code === 17 || (error.message && error.message.toLowerCase().includes('rate'))) {
    return {
      error: 'Rate limit exceeded: Too many requests to Meta API',
      errorDetails: {
        code: error.code,
        type: 'RateLimitError',
        message: error.message || 'Rate limit exceeded'
      }
    };
  }
  
  // Generic error with details
  return {
    error: error.message || 'Unknown API error',
    errorDetails: {
      code: error.code,
      subcode: error.error_subcode,
      type: error.type || 'Unknown',
      message: error.message || 'No message provided',
      fbtrace_id: error.fbtrace_id,
      status: error.status
    }
  };
}
