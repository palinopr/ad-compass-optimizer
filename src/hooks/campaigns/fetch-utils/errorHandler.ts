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
  console.error('[API ERROR DEBUG] Error type:', typeof apiErr);
  console.error('[API ERROR DEBUG] Error properties:', Object.keys(apiErr));
  
  // Record failed fetch for diagnostics
  localStorage.setItem('last_campaign_fetch_success', 'false');
  
  let apiErrorMessage = apiErr?.message || 'Unknown API error';
  let errorDetails = null;
  let isRateLimitDetected = false;
  
  // Extract Facebook API errors from response
  if (apiErr?.response) {
    try {
      console.log('[API ERROR DEBUG] Found response object, attempting to parse');
      const responseData = await apiErr.response.json();
      console.error('[API ERROR DEBUG] API error response data:', responseData);
      
      // Store the complete error details
      errorDetails = responseData;
      
      // Check for rate limit errors - now checking more Meta rate limit error codes
      // Meta error codes: 4 (app rate limit), 17 (user rate limit), 80000-80014 (BUC rate limits)
      if (responseData.error && 
          (responseData.error.code === 4 || 
           responseData.error.code === 17 ||
           (responseData.error.code >= 80000 && responseData.error.code <= 80014) ||
           responseData.error.message?.includes('rate limit') || 
           responseData.error.message?.includes('request limit') ||
           responseData.error.message?.includes('too many calls'))) {
        
        console.log('[API ERROR DEBUG] Rate limit error detected - code:', responseData.error.code);
        markRateLimited();
        
        // Parse estimated time to regain access if available in headers
        let waitTime = "5-10 minutes";
        if (responseData.headers && 
            responseData.headers['x-business-use-case-usage'] || 
            responseData.headers['x-app-usage']) {
          try {
            // Try to extract estimated time from business use case header
            const usageData = JSON.parse(responseData.headers['x-business-use-case-usage'] || '{}');
            const businessId = Object.keys(usageData)[0];
            if (businessId && usageData[businessId][0]?.estimated_time_to_regain_access) {
              waitTime = `${usageData[businessId][0].estimated_time_to_regain_access} minutes`;
            }
          } catch (headerErr) {
            console.error('[API ERROR DEBUG] Failed to parse rate limit headers:', headerErr);
          }
        }
        
        apiErrorMessage = `Meta API rate limit reached. Please wait ${waitTime} before trying again.`;
        isRateLimitDetected = true;
      }
      else if (responseData.error && responseData.error.message) {
        apiErrorMessage = responseData.error.message;
        
        // Add more context based on error code
        if (responseData.error.code === 200) {
          apiErrorMessage += " (Permission error)";
        } else if (responseData.error.code === 100) {
          apiErrorMessage += " (Invalid parameter)";
        } else if (responseData.error.code === 190) {
          apiErrorMessage += " (Invalid/expired access token)";
        } else if (responseData.error.code === 294) {
          apiErrorMessage += " (Ad account access denied)";
        } else if (responseData.error.code === 2601) {
          apiErrorMessage += " (App Review required)";
        }
      }
    } catch (jsonErr) {
      console.error('[API ERROR DEBUG] Failed to parse API error response:', jsonErr);
      
      // Try to get raw text
      try {
        const responseText = await apiErr.response.text();
        console.error('[API ERROR DEBUG] Raw error response text:', responseText);
        errorDetails = { rawResponse: responseText };
      } catch (textErr) {
        console.error('[API ERROR DEBUG] Failed to get response text:', textErr);
      }
    }
  } else {
    console.error('[API ERROR DEBUG] No response object found in error');
    // Store whatever error data we have
    errorDetails = {
      errorType: typeof apiErr,
      errorObject: apiErr instanceof Error ? { 
        name: apiErr.name, 
        message: apiErr.message, 
        stack: apiErr.stack 
      } : apiErr
    };
  }
  
  // Store error details for diagnostics
  localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
    message: apiErrorMessage,
    timestamp: new Date().toISOString(),
    details: errorDetails
  }));
  
  return { 
    message: apiErrorMessage, 
    details: errorDetails,
    isRateLimit: isRateLimitDetected
  };
};

export const processFetchError = (err: any): {
  error: string;
  errorDetails: any;
} => {
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
          isRateLimit: true
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
      } else if (errorCode === '401') {
        enhancedError = 'Authentication failed (Error 401). Your Meta access token has expired.';
      } else if (errorCode === '403') {
        enhancedError = 'Permission denied (Error 403). You don\'t have the required permissions to access this data.';
      }
    }
  }
  
  // Show toast notification with more friendly error message
  toast({
    title: "Error Loading Campaigns",
    description: "There was a problem loading your campaign data. Please check your connection.",
    variant: "destructive"
  });
  
  return { error: enhancedError, errorDetails };
};
