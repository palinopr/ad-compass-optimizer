
import { ErrorDetails } from '../../types/campaignLogTypes';

export const parseMetaError = (error: any): ErrorDetails => {
  const defaultError: ErrorDetails = {
    code: 'unknown',
    type: 'unknown',
    message: 'Unknown error',
    timestamp: new Date().toISOString()
  };

  if (!error) return defaultError;

  // Handle nested error objects from Meta API
  const metaError = error.error || error;
  
  // Enhanced error parsing
  const errorDetails: ErrorDetails = {
    code: metaError.code || error.status || defaultError.code,
    type: metaError.type || defaultError.type,
    message: metaError.message || String(error) || defaultError.message,
    subcode: metaError.error_subcode,
    fbtraceId: metaError.fbtrace_id,
    error_user_title: metaError.error_user_title,
    error_user_msg: metaError.error_user_msg,
    timestamp: new Date().toISOString(),
    requestUrl: error.requestUrl, // Store the request URL if available
    httpStatus: error.status || error.httpStatus,
    rawResponse: error.rawResponse, // Store raw response for debugging
    rateLimitInfo: error.rateLimitInfo // Store rate limit info if present
  };

  // Log full error details to console for debugging
  console.error('[META API ERROR]', {
    ...errorDetails,
    stack: error.stack
  });

  return errorDetails;
};
