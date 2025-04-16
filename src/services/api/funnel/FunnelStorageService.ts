
export class FunnelStorageService {
  static loadRawApiResponse() {
    try {
      const storedResponse = localStorage.getItem('raw_campaign_response');
      if (storedResponse) {
        try {
          const parsed = JSON.parse(storedResponse);
          console.log('[FUNNEL DEBUG] Loaded stored API response:', parsed);
          return parsed;
        } catch (e) {
          console.error('[FUNNEL DEBUG] Error parsing stored response:', e);
          return { text: storedResponse };
        }
      }
      
      const storedError = localStorage.getItem('raw_campaign_error_response');
      if (storedError) {
        try {
          const parsedError = JSON.parse(storedError);
          console.log('[FUNNEL DEBUG] Loaded stored error response:', parsedError);
          return { error: parsedError };
        } catch (e) {
          console.error('[FUNNEL DEBUG] Error parsing error response:', e);
        }
      }
    } catch (e) {
      console.error('[FUNNEL DEBUG] Error loading stored API response:', e);
    }
    
    return null;
  }

  static storeRawApiResponse(response: any) {
    try {
      if (!response) return;
      
      // If response is an error object, store it separately
      if (response.error) {
        localStorage.setItem('raw_campaign_error_response', JSON.stringify(response));
        console.log('[FUNNEL DEBUG] Stored error response');
        return;
      }
      
      // For regular responses, store the data
      localStorage.setItem('raw_campaign_response', JSON.stringify({
        data: response.data?.slice(0, 10), // Store first 10 campaigns to avoid huge storage
        paging: response.paging,
        timestamp: new Date().toISOString()
      }));
      console.log('[FUNNEL DEBUG] Stored raw API response');
    } catch (e) {
      console.error('[FUNNEL DEBUG] Error storing raw API response:', e);
    }
  }

  static clearCaches() {
    localStorage.removeItem('campaign_query_cache');
    localStorage.removeItem('campaign_data_cache');
  }
}
