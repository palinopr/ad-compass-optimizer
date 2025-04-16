
export const parseResponseBody = async (response: Response): Promise<{ text: string; error: any }> => {
  try {
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
