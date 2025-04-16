
export const parseResponseBody = async (response: Response): Promise<{ text: string; error: any }> => {
  try {
    // Check if response is valid
    if (!response) {
      console.error('[RESPONSE PARSER] Invalid or undefined response object');
      return { text: '', error: { message: 'Invalid API response object', code: 'INVALID_RESPONSE' } };
    }

    // Clone the response before reading to avoid "body already read" errors
    const text = await response.clone().text();
    let error = null;
    
    // Check if response text is empty
    if (!text || text.trim() === '') {
      console.error('[RESPONSE PARSER] Empty response body');
      return { text: '', error: { message: 'Empty response from API', code: 'EMPTY_RESPONSE' } };
    }
    
    try {
      const data = JSON.parse(text);
      
      // Enhanced logging for debugging campaign loading issues
      console.log('[RESPONSE PARSER] Response structure overview:', {
        hasData: !!data,
        hasDataArray: data && Array.isArray(data.data),
        dataLength: data && data.data ? data.data.length : 'N/A',
        hasPaging: !!(data && data.paging),
        hasError: !!(data && data.error)
      });

      // If data.data exists and is an array, log information about the first item
      if (data && data.data && Array.isArray(data.data) && data.data.length > 0) {
        // Check specifically for campaigns API response
        if (data.data[0].name && data.data[0].status) {
          console.log('[RESPONSE PARSER] First campaign in response:', {
            id: data.data[0].id,
            name: data.data[0].name,
            status: data.data[0].status,
            hasInsights: !!data.data[0].insights
          });
        }
      }
      
      // Check specifically for empty data arrays to help debug insights issues
      if (data && Array.isArray(data.data) && data.data.length === 0) {
        console.log('[RESPONSE PARSER] API returned empty data array []');
      }
      
      if (data.error) {
        error = data.error;
        console.error('[RESPONSE PARSER] API error:', error);
      }
    } catch (e) {
      console.error('[RESPONSE PARSER] Error parsing response JSON:', e);
      error = { message: 'Invalid JSON in response', parseError: e };
    }
    
    return { text, error };
  } catch (e) {
    console.error('[RESPONSE PARSER] Error reading response:', e);
    return { text: 'Could not read response', error: { message: 'Error reading response', readError: e } };
  }
};
