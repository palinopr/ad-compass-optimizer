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
      // CRITICAL: Check if the URL contains the fields parameter with proper values
      if (!url.includes('fields=')) {
        const error = '[CAMPAIGN FETCH] ERROR: Missing fields parameter in URL!';
        console.error(error);
        throw new Error('Missing fields parameter in Meta API request URL');
      }
      
      // Verify that the fields include at minimum required fields (id, name)
      const requiredFields = ['id', 'name', 'status'];
      const fieldsMatch = url.match(/fields=([^&]+)/);
      const fieldsValue = fieldsMatch ? fieldsMatch[1] : '';
      
      requiredFields.forEach(field => {
        if (!fieldsValue.includes(field)) {
          const error = `[CAMPAIGN FETCH] ERROR: Missing required field '${field}' in fields parameter!`;
          console.error(error);
          throw new Error(`Missing required field '${field}' in Meta API request`);
        }
      });

      // Check for date_preset and ensure it's not using last_28d
      const datePresetMatch = url.match(/date_preset=([^&]+)/);
      if (datePresetMatch) {
        const datePreset = datePresetMatch[1];
        if (datePreset === 'last_28d') {
          console.warn('[CAMPAIGN FETCH] Found problematic last_28d date preset in URL, request may fail');
        }
      } else if (url.includes('insights')) {
        // If there's insights in the URL but no date_preset, that might be a problem
        console.warn('[CAMPAIGN FETCH] URL contains insights but no date_preset parameter found');
      }

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
      console.log('[CAMPAIGN FETCH] Raw response text (first 500 chars):', responseText.substring(0, 500));
      
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

      // Log whether any campaign objects are empty
      if (data.data.length > 0) {
        const emptyObjects = data.data.filter(item => 
          typeof item === 'object' && 
          item !== null && 
          Object.keys(item).length === 0
        ).length;
        
        if (emptyObjects > 0) {
          console.warn(`⚠️ Meta API returned ${emptyObjects}/${data.data.length} empty campaign objects. Possible permissions or token issue.`);
          console.warn(`⚠️ Request URL used: ${redactedForLogging}`);
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
