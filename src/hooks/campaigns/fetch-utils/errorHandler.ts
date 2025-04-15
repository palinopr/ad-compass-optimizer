import { toast } from "@/hooks/use-toast";
import { isRateLimitError, markRateLimited } from './rateLimit';

/**
 * Error handling for campaign fetching
 */
export const handleApiError = async (apiErr: any): Promise<{
  message: string;
  details: any;
  isRateLimit: boolean;
}> => {
  console.error('[API ERROR DEBUG] API error during campaign fetch:', apiErr);
  
  // Record failed fetch for diagnostics
  localStorage.setItem('last_campaign_fetch_success', 'false');
  
  let apiErrorMessage = apiErr?.message || 'Unknown API error';
  let errorDetails = null;
  let isRateLimitDetected = false;
  
  // Extract Facebook API errors from response
  if (apiErr?.response) {
    try {
      console.error('[GRAPH API ERROR] Full response:', {
        status: apiErr.response.status,
        data: apiErr.response.data,
        headers: apiErr.response.headers
      });
      
      const errorData = apiErr.response.data?.error || apiErr.response.data;
      
      if (errorData) {
        apiErrorMessage = `Meta API Error ${errorData.code}: ${errorData.message}`;
        errorDetails = {
          code: errorData.code,
          type: errorData.type,
          message: errorData.message,
          subcode: errorData.error_subcode,
          fbtraceId: errorData.fbtrace_id
        };
        
        // Enhanced logging for debugging
        console.error('[GRAPH API ERROR] Details:', {
          ...errorDetails,
          raw: errorData
        });
      }
      
      // Check for rate limit errors
      if (errorData?.code === 4 || 
          errorData?.code === 17 ||
          (errorData?.code >= 80000 && errorData?.code <= 80014) ||
          errorData?.message?.toLowerCase().includes('rate limit')) {
        isRateLimitDetected = true;
      }
    } catch (parseErr) {
      console.error('[GRAPH API ERROR] Failed to parse error response:', parseErr);
    }
  }
  
  // Store full error details for diagnostics
  localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
    message: apiErrorMessage,
    details: errorDetails,
    timestamp: new Date().toISOString(),
    raw: apiErr?.response?.data || apiErr
  }));
  
  return { 
    message: apiErrorMessage, 
    details: errorDetails,
    isRateLimit: isRateLimitDetected
  };
};

export const processFetchError = (err: any, onFetchFailure?: () => void): {
  error: string;
  errorDetails: any;
} => {
  // Notify of fetch failure
  onFetchFailure?.();

  // Check for rate limit messages in the error
  if (isRateLimitError(err)) {
    console.log('Rate limit error detected in catch block');
    
    // Store rate limit timestamp if not already stored
    if (!localStorage.getItem('meta_rate_limit_timestamp')) {
      markRateLimited();
    }
    
    // Show specific toast for rate limiting
    toast({
      title: "API Rate Limit",
      description: "Meta API is rate limited. Please wait 5-10 minutes before trying again.",
      variant: "destructive",
      duration: 10000
    });
    
    return { 
      error: 'Meta API rate limit reached. Please wait 5-10 minutes before trying again.',
      errorDetails: err?.details || {
        error: {
          code: 4,
          message: 'Application request limit reached',
          isRateLimit: true,
          status: 429
        }
      }
    };
  }
  
  const errorMessage = err?.message || (err instanceof Error ? err.message : 'Failed to fetch campaigns');
  
  // Enhanced error storage for troubleshooting
  let errorDetails = err?.details || {
    error: {
      message: errorMessage,
      timestamp: new Date().toISOString()
    }
  };
  
  // Try to extract HTTP error code for more specific errors
  let enhancedError = errorMessage;
  if (typeof errorMessage === 'string') {
    // Extract error code if present
    const errorCodeMatch = errorMessage.match(/(\d{3})/);
    if (errorCodeMatch && errorCodeMatch[0]) {
      const errorCode = errorCodeMatch[0];
      
      if (errorCode === '400') {
        enhancedError = 'Failed to fetch campaign data (Error 400). This usually indicates an invalid token format or expired token.';
        errorDetails.status = 400;
      } else if (errorCode === '401') {
        enhancedError = 'Authentication failed (Error 401). Please reconnect your Meta account.';
        errorDetails.status = 401;
      } else if (errorCode === '403') {
        enhancedError = 'Permission denied (Error 403). Your account may not have access to this ad account.';
        errorDetails.status = 403;
      } else if (errorCode === '500') {
        enhancedError = 'Meta API server error (Error 500). Please try again later.';
        errorDetails.status = 500;
      }
    }
  }
  
  return { 
    error: enhancedError,
    errorDetails: {
      ...errorDetails,
      fullMessage: errorMessage
    }
  };
};
