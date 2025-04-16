
import { MetaCampaign } from '../../types/metaCampaignTypes';
import { CampaignThrottling } from '../../campaign/throttling';
import { CampaignQueryBuilder } from './campaignQueryBuilder';
import { ErrorStorage } from '../../campaign/error/errorStorage';
import { BaseApiService } from '../../BaseApiService';
import { CampaignProcessor } from './campaignProcessor';
import { PaginationHandler } from './paginationHandler';
import { ErrorHandler } from '../../campaign/error/errorHandler';
import { FallbackCampaignLoader } from './fallbackCampaignLoader';

export class CampaignFetchService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string, datePreset?: string): Promise<MetaCampaign[]> {
    try {
      console.group('[CAMPAIGN FETCH] Authentication Check');
      console.log('Access Token:', token ? 'PRESENT' : 'MISSING');
      console.log('Ad Account ID:', adAccountId);
      console.log('Date Preset:', datePreset || 'last_28d');
      
      if (!token) {
        console.error('❌ No access token found');
        throw new Error('Missing Meta access token. Please re-authenticate.');
      }

      if (!adAccountId) {
        console.error('❌ No ad account selected');
        throw new Error('No ad account selected. Please choose an ad account.');
      }
      console.groupEnd();
      
      this.validateToken(token, 'fetchCampaigns');
      
      // Ensure the account ID is properly formatted
      CampaignQueryBuilder.validateAdAccountId(adAccountId);
      const formattedAccountId = CampaignQueryBuilder.formatAccountId(adAccountId);
      console.log(`[CAMPAIGN FETCH] Using formatted account ID: ${formattedAccountId}`);
      
      CampaignThrottling.checkThrottling(formattedAccountId);

      // Use the provided date preset or default to last_28d
      // CampaignQueryBuilder.normalizePreset will validate/map the preset
      const fieldsQuery = CampaignQueryBuilder.buildCampaignQuery(datePreset || 'last_28d');
      
      // Verify that the date preset is valid
      CampaignQueryBuilder.verifyDatePreset(fieldsQuery);
      
      console.log('[CAMPAIGN FETCH] Using query fields:', fieldsQuery);

      // Build URL - IMPORTANT: Use fields= for the first part, then append the rest
      // This structure mimics the successful format from previous fixes
      const url = `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=${fieldsQuery}&limit=500&access_token=${token}`;
      
      // Log the actual URL that will be used (with token redacted)
      const redactedUrl = url.replace(token, 'REDACTED');
      console.log(`[CAMPAIGN FETCH] Request URL: ${redactedUrl}`);
      
      // Store the URL for debugging
      try {
        localStorage.setItem('last_campaign_request_url', redactedUrl);
        localStorage.setItem('last_campaign_request_timestamp', new Date().toISOString());
        localStorage.setItem('last_campaign_request_date_preset', datePreset || 'last_28d');
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Error storing request info:', e);
      }
      
      // Execute the fetch and get campaigns
      let campaigns = await this.executeFetch(url);
      
      // If we get empty data and datePreset is not already maximum, try with maximum
      if (campaigns.length === 0) {
        console.log('[CAMPAIGN FETCH] No campaigns returned, attempting fallback...');
        const fallbackCampaigns = await FallbackCampaignLoader.loadCampaignsFromInsights(token, formattedAccountId);
        
        if (fallbackCampaigns.length > 0) {
          console.log(`[CAMPAIGN FETCH] Fallback successful, loaded ${fallbackCampaigns.length} campaigns`);
          campaigns = fallbackCampaigns;
          
          // Store that we used fallback loader
          localStorage.setItem('using_fallback_campaigns', 'true');
        } else {
          // If fallback also returns empty, log this clearly
          console.log('[CAMPAIGN FETCH] Both primary and fallback fetches returned no campaigns');
          localStorage.setItem('empty_campaigns_confirmed', 'true');
        }
      } else {
        localStorage.removeItem('using_fallback_campaigns');
        localStorage.removeItem('empty_campaigns_confirmed');
      }
      
      return campaigns;
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Critical Error:', error);
      
      // Try fallback on error
      try {
        console.log('[CAMPAIGN FETCH] Attempting fallback after error...');
        const fallbackCampaigns = await FallbackCampaignLoader.loadCampaignsFromInsights(token, adAccountId);
        if (fallbackCampaigns.length > 0) {
          localStorage.setItem('using_fallback_campaigns', 'true');
          return fallbackCampaigns;
        }
      } catch (fallbackError) {
        console.error('[CAMPAIGN FETCH] Fallback also failed:', fallbackError);
      }
      
      throw error;
    }
  }

  private static async executeFetch(url: string): Promise<MetaCampaign[]> {
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
        
        // NEW: Log the raw response data as requested
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
  
      let allCampaigns = [...data.data];
      
      if (data.paging && data.paging.next) {
        console.log('[CAMPAIGN FETCH] Pagination detected, fetching more pages');
        try {
          const nextPageCampaigns = await PaginationHandler.fetchPaginatedCampaigns(data.paging.next);
          allCampaigns = [...allCampaigns, ...nextPageCampaigns];
        } catch (paginationError) {
          console.error('[CAMPAIGN FETCH] Error fetching additional pages:', paginationError);
        }
      }
      
      console.log(`[CAMPAIGN FETCH] Successfully fetched ${allCampaigns.length} campaigns`);
      
      // Mark successful fetch in localStorage
      localStorage.setItem('last_campaign_fetch_success', 'true');
      localStorage.setItem('last_campaign_count', String(allCampaigns.length));
      localStorage.setItem('last_campaign_fetch_completed', new Date().toISOString());
      
      if (allCampaigns.length > 0) {
        localStorage.setItem('has_campaigns_data', 'true');
      } else {
        localStorage.setItem('has_campaigns_data', 'false');
        localStorage.setItem('empty_campaigns_response', 'true');
      }
      
      return CampaignProcessor.processCampaigns(allCampaigns);
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Fetch execution error:', error);
      
      // NEW: Log the error in the requested format
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
