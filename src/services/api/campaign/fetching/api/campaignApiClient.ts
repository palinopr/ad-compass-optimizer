
import { ErrorHandler } from '../../../error/errorHandler';
import { ErrorStorage } from '../../../error/errorStorage';
import { BaseApiService } from '@/services/api/BaseApiService';
import { ResponseHandler } from './responseHandler';

export class CampaignApiClient extends BaseApiService {
  // Define lastResponseHeaders to match the BaseApiService property
  public static lastResponseHeaders: Record<string, string> = {};

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
        // Log the error but don't throw - continue processing and return empty array if needed
        try {
          // Attempt to parse error response
          const errorText = await response.clone().text();
          let errorData;
          
          try {
            errorData = JSON.parse(errorText);
          } catch (e) {
            errorData = { rawText: errorText };
          }
          
          console.error('[CAMPAIGN FETCH] Error response:', errorData);
          ErrorStorage.storeRawErrorResponse(errorData);
        } catch (e) {
          console.error('[CAMPAIGN FETCH] Failed to read error response:', e);
        }
        
        // Continue with error handling but don't throw - we want to return empty array
        return [];
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
        return []; // Return empty array instead of throwing
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
        return []; // Return empty array instead of throwing
      }
      
      // Check if data.data exists before using it
      if (!data.data) {
        console.error('[CAMPAIGN FETCH] Response missing data array:', data);
        // Return empty array instead of throwing an error
        return [];
      }
      
      if (!Array.isArray(data.data)) {
        console.error('[CAMPAIGN FETCH] data.data is not an array:', data.data);
        // If data.data exists but isn't an array, try to convert it to an array
        if (data.data) {
          return [data.data];
        }
        // Return empty array for consistent handling
        return [];
      }

      // NEW: Check for empty campaign objects
      if (data.data.length > 0) {
        const emptyObjects = data.data.filter(item => 
          typeof item === 'object' && 
          item !== null && 
          Object.keys(item).length === 0
        ).length;
        
        if (emptyObjects > 0) {
          console.warn(`⚠️ Meta API returned ${emptyObjects}/${data.data.length} empty campaign objects. Possible permissions or token issue.`);
        }
        
        // Log specific details about the first few campaigns
        data.data.slice(0, 5).forEach((campaign, idx) => {
          console.log(`[CAMPAIGN FETCH] Campaign ${idx+1} details:`, {
            isEmpty: Object.keys(campaign).length === 0,
            id: campaign.id || 'missing',
            name: campaign.name || 'missing',
            status: campaign.status || 'missing',
            keys: Object.keys(campaign)
          });
        });
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
