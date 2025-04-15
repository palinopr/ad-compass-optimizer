
export const parseResponseBody = async (response: Response): Promise<{ text: string; error?: any }> => {
  try {
    const responseText = await response.clone().text();
    let parsedError;
    
    // Try to parse error details if response is not OK
    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        parsedError = {
          status: response.status,
          statusText: response.statusText,
          message: errorData?.error?.message || 'Unknown error',
          code: errorData?.error?.code,
          type: errorData?.error?.type,
          subcode: errorData?.error?.error_subcode,
          timestamp: new Date().toISOString(),
          fbTraceId: errorData?.error?.fbtrace_id
        };
      } catch (parseErr) {
        parsedError = {
          status: response.status,
          statusText: response.statusText,
          message: 'Failed to parse error response',
          timestamp: new Date().toISOString()
        };
      }
    }
    
    return { 
      text: responseText,
      error: parsedError
    };
  } catch (err) {
    console.error('[CAMPAIGN FETCH] ❌ Failed to parse response body:', err);
    return { 
      text: '',
      error: {
        message: err instanceof Error ? err.message : 'Unknown error parsing response',
        timestamp: new Date().toISOString()
      }
    };
  }
};
