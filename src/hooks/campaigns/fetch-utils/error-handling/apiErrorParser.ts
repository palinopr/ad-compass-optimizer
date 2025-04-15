
import { MetaApiError } from '../types/errorTypes';

export const parseApiError = async (apiErr: any): Promise<{
  message: string;
  details: any;
  isRateLimit: boolean;
}> => {
  console.error('[API ERROR DEBUG] API error during campaign fetch:', apiErr);
  
  let apiErrorMessage = apiErr?.message || 'Unknown API error';
  let errorDetails = null;
  let isRateLimitDetected = false;
  
  try {
    // Handle direct error object from Meta API
    if (apiErr?.error && typeof apiErr.error === 'object') {
      const metaError = apiErr.error;
      apiErrorMessage = `Meta API Error ${metaError.code || ''}: ${metaError.message || 'Unknown error'}`;
      errorDetails = {
        code: metaError.code,
        type: metaError.type,
        message: metaError.message,
        subcode: metaError.error_subcode,
        fbtraceId: metaError.fbtrace_id,
        error_user_title: metaError.error_user_title,
        error_user_msg: metaError.error_user_msg
      };
      
      console.error('[GRAPH API ERROR] Details:', {
        ...errorDetails,
        raw: metaError
      });
      
      // Check for rate limit in direct error object
      if (metaError.code === 4 || 
          metaError.code === 17 ||
          (metaError.code >= 80000 && metaError.code <= 80014) ||
          (metaError.message && typeof metaError.message === 'string' && 
           metaError.message.toLowerCase().includes('rate limit'))) {
        isRateLimitDetected = true;
      }
    }
    // Handle axios-style response error
    else if (apiErr?.response) {
      try {
        console.error('[GRAPH API ERROR] Full response:', {
          status: apiErr.response.status,
          data: apiErr.response.data,
          headers: apiErr.response.headers
        });
        
        const errorData = apiErr.response.data?.error || apiErr.response.data;
        
        if (errorData) {
          apiErrorMessage = `Meta API Error ${errorData.code || ''}: ${errorData.message || 'Unknown error'}`;
          errorDetails = {
            code: errorData.code,
            type: errorData.type,
            message: errorData.message,
            subcode: errorData.error_subcode,
            fbtraceId: errorData.fbtrace_id,
            error_user_title: errorData.error_user_title,
            error_user_msg: errorData.error_user_msg
          };
          
          console.error('[GRAPH API ERROR] Details:', {
            ...errorDetails,
            raw: errorData
          });
        }
        
        // Check for rate limit error codes
        if (errorData?.code === 4 || 
            errorData?.code === 17 ||
            (errorData?.code >= 80000 && errorData?.code <= 80014) ||
            (errorData?.message && typeof errorData.message === 'string' && 
             errorData.message.toLowerCase().includes('rate limit'))) {
          isRateLimitDetected = true;
        }
      } catch (parseErr) {
        console.error('[GRAPH API ERROR] Failed to parse error response:', parseErr);
      }
    }
    
    // Handle direct code/message properties (custom error object)
    if (apiErr?.code && apiErr?.message && !errorDetails) {
      errorDetails = {
        code: apiErr.code,
        type: apiErr.type || 'unknown',
        message: apiErr.message,
        subcode: apiErr.subcode,
        fbtraceId: apiErr.fbtraceId,
        error_user_title: apiErr.error_user_title,
        error_user_msg: apiErr.error_user_msg
      };
    }
    
    // If we still don't have details, create a generic error
    if (!errorDetails) {
      errorDetails = {
        message: apiErrorMessage,
        type: 'unknown',
        code: apiErr?.status || 'unknown'
      };
    }
  } catch (e) {
    console.error('[GRAPH API ERROR] Exception in parseApiError:', e);
  }
  
  // Safely store error details for diagnostics
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
        message: apiErrorMessage,
        details: errorDetails,
        timestamp: new Date().toISOString(),
        raw: apiErr?.response?.data || apiErr
      }));
      
      // Store the raw error response for debugging
      if (apiErr?.response?.data) {
        localStorage.setItem('raw_campaign_error_response', JSON.stringify({
          ...apiErr.response.data,
          status: apiErr.response.status,
          statusText: apiErr.response.statusText,
          timestamp: new Date().toISOString(),
          requestUrl: apiErr.response.config?.url
        }));
      } else if (apiErr?.error) {
        localStorage.setItem('raw_campaign_error_response', JSON.stringify({
          error: apiErr.error,
          timestamp: new Date().toISOString()
        }));
      }
    }
  } catch (storageErr) {
    console.error('[GRAPH API ERROR] Error storing error details:', storageErr);
  }
  
  return { 
    message: apiErrorMessage, 
    details: errorDetails,
    isRateLimit: isRateLimitDetected
  };
};
