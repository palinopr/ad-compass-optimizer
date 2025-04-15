
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
      
      // Log raw response details first
      console.log(`[CAMPAIGN FETCH] Status:`, apiErr.response.status, apiErr.response.statusText);
      console.log(`[CAMPAIGN FETCH] Headers:`, Object.fromEntries([...apiErr.response.headers.entries()]));
      
      // Get the raw response text
      const responseText = await apiErr.response.text();
      console.log(`[CAMPAIGN FETCH] Raw Body:`, responseText);
      
      try {
        const parsed = JSON.parse(responseText);
        console.log(`[CAMPAIGN FETCH] Parsed JSON:`, parsed);
        
        // Store the complete error details
        errorDetails = parsed;
        
        // Check for specific Meta API errors
        if (parsed.error) {
          apiErrorMessage = `Meta API Error ${parsed.error.code}: ${parsed.error.message}`;
          console.error(`[CAMPAIGN FETCH] Meta API Error:`, {
            code: parsed.error.code,
            message: parsed.error.message,
            type: parsed.error.type,
            fbtraceId: parsed.error.fbtrace_id
          });
          
          // Add specific error context based on code
          if (parsed.error.code === 190) {
            apiErrorMessage += "\nYour access token has expired or is invalid.";
          } else if (parsed.error.code === 200) {
            apiErrorMessage += "\nPermission denied - check app permissions.";
          } else if (parsed.error.code === 100) {
            apiErrorMessage += "\nInvalid parameter in request.";
          }
          
          // Check for rate limit errors
          if (parsed.error.code === 4 || 
              parsed.error.code === 17 ||
              (parsed.error.code >= 80000 && parsed.error.code <= 80014) ||
              parsed.error.message?.toLowerCase().includes('rate limit')) {
            isRateLimitDetected = true;
          }
        }
      } catch (jsonErr) {
        console.error(`[CAMPAIGN FETCH] ❌ JSON parse error:`, jsonErr);
        apiErrorMessage = "Failed to load campaigns. Check console for full error.";
      }
    } catch (textErr) {
      console.error(`[CAMPAIGN FETCH] ❌ Failed to read response body:`, textErr);
    }
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
