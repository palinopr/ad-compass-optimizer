
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
        
        console.error('[GRAPH API ERROR] Details:', {
          ...errorDetails,
          raw: errorData
        });
      }
      
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
