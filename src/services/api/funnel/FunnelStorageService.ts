
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

  static clearCaches() {
    localStorage.removeItem('campaign_query_cache');
    localStorage.removeItem('campaign_data_cache');
  }
}
