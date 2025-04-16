
import { ErrorHandler } from '../../campaign/error/errorHandler';
import { ErrorStorage } from '../../campaign/error/errorStorage';
import { BaseApiService } from '../../BaseApiService';

export class CampaignApiClient extends BaseApiService {
  /**
   * Executes a fetch request to the Meta API with proper error handling
   */
  public static async executeFetch(url: string): Promise<any[]> {
    // Log the actual request URL (with sensitive parts redacted)
    const redactedForLogging = url.replace(/access_token=[^&]+/, 'access_token=REDACTED');
    console.log(`[CAMPAIGN FETCH] Executing fetch to: ${redactedForLogging}`);

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'meta-marketing-dashboard/1.0'
        }
      });
      
      this.lastResponseHeaders = {};
      response.headers.forEach((value, key) => {
        this.lastResponseHeaders[key] = value;
      });
  
      if (!response.ok) {
        console.error(`[CAMPAIGN FETCH] API request failed with status: ${response.status}`);
        // Use the separate ErrorHandler class with correct casing
        await ErrorHandler.handleErrorResponse(response);
      }
  
      // Get response text first to inspect and debug
      const responseText = await response.text();
      console.log('[CAMPAIGN FETCH] Response received, length:', responseText.length);
      
      let data;
      try {
        // Parse JSON from text - if this fails, we'll catch it
        data = JSON.parse(responseText);
        
        // Log the raw response data as requested
        console.log('[MetaCampaignService] Raw campaigns response:', data);
      } catch (parseError) {
        console.error('[CAMPAIGN FETCH] Failed to parse response as JSON:', parseError);
        throw new Error('Invalid JSON response from Meta API');
      }
      
      // Store raw response for debugging
      try {
        localStorage.setItem('raw_campaign_response', JSON.stringify(data));
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Error storing raw response:', e);
      }
      
      ErrorStorage.storeRawSuccessResponse(data);
      
      // Validate data structure before accessing properties
      if (!data) {
        console.error('[CAMPAIGN FETCH] Response data is null or undefined');
        throw new Error('Empty response from Meta API');
      }
      
      // Check if data.data exists before using it
      if (!data.data) {
        console.error('[CAMPAIGN FETCH] Response missing data array:', data);
        // Return empty array instead of throwing an error
        return [];
      }
      
      if (!Array.isArray(data.data)) {
        console.error('[CAMPAIGN FETCH] data.data is not an array:', data.data);
        // Return empty array for consistent handling
        return [];
      }
  
      return data.data;
    } catch (error: any) {
      console.error('[CAMPAIGN FETCH] Fetch execution error:', error);
      
      // Log the error in the requested format
      console.error('[MetaCampaignService] Failed to fetch campaigns:', error);
      
      // Store error for debugging
      try {
        localStorage.setItem('raw_campaign_error_response', JSON.stringify({
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Error storing error details:', e);
      }
      
      // Return empty array instead of throwing to prevent UI breaks
      return [];
    }
  }
}
