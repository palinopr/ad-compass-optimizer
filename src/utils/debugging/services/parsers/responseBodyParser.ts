
export const parseResponseBody = async (response: Response): Promise<{ text: string; error: any }> => {
  try {
    // Check if response is valid
    if (!response) {
      console.error('[RESPONSE PARSER] Invalid or undefined response object');
      return { text: '', error: { message: 'Invalid API response object', code: 'INVALID_RESPONSE' } };
    }

    // Additional response debugging info
    console.log('[RESPONSE PARSER] Processing response:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    // Clone the response before reading to avoid "body already read" errors
    const text = await response.clone().text();
    let error = null;
    
    // Check if response text is empty
    if (!text || text.trim() === '') {
      console.error('[RESPONSE PARSER] Empty response body');
      return { text: '', error: { message: 'Empty response from API', code: 'EMPTY_RESPONSE' } };
    }
    
    // Always log full response for debugging campaign loading issues
    console.log('[RESPONSE PARSER] Full response:', text);
    
    try {
      const data = JSON.parse(text);
      
      // Enhanced logging for debugging campaign loading issues
      console.log('[RESPONSE PARSER] Response structure overview:', {
        hasData: !!data,
        hasDataArray: data && Array.isArray(data.data),
        dataLength: data && data.data ? data.data.length : 'N/A',
        hasPaging: !!(data && data.paging),
        hasError: !!(data && data.error),
        keys: data ? Object.keys(data) : []
      });

      // If data.data exists and is an array, log information about all items
      if (data && data.data && Array.isArray(data.data)) {
        console.log('[RESPONSE PARSER] Found', data.data.length, 'items in response');
        
        // Log every campaign in the response
        data.data.forEach((item: any, index: number) => {
          if (item.name && item.status) {
            console.log(`[RESPONSE PARSER] Campaign ${index + 1}:`, {
              id: item.id,
              name: item.name,
              status: item.status,
              hasInsights: !!item.insights,
              rawItem: item
            });
          }
        });
        
        // Additional campaign debugging
        if (data.data.length > 0) {
          console.log('[RESPONSE PARSER] Sample campaign data structure:', {
            hasId: !!data.data[0].id,
            hasName: !!data.data[0].name,
            hasStatus: !!data.data[0].status,
            hasObjective: !!data.data[0].objective,
            knownProperties: Object.keys(data.data[0])
          });
        }
      } else if (data && !data.data) {
        console.warn('[RESPONSE PARSER] Response has no data array:', data);
      } else if (data && !Array.isArray(data.data)) {
        console.warn('[RESPONSE PARSER] data.data is not an array:', data.data);
      }
      
      // Check specifically for empty data arrays to help debug insights issues
      if (data && Array.isArray(data.data) && data.data.length === 0) {
        console.log('[RESPONSE PARSER] API returned empty data array []');
        console.log('[RESPONSE PARSER] Full response for empty data[]:', data);
      }
      
      // Check for empty objects in the data array
      if (data && data.data && Array.isArray(data.data)) {
        const emptyObjects = data.data.filter(item => 
          typeof item === 'object' && 
          item !== null && 
          Object.keys(item).length === 0
        ).length;
        
        if (emptyObjects > 0) {
          console.warn(`⚠️ [RESPONSE PARSER] Meta API returned ${emptyObjects}/${data.data.length} empty campaign objects. Possible permissions or token issue.`);
        }
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
