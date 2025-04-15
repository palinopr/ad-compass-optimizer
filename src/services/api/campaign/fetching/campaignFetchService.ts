
import { MetaCampaign } from '../../types/metaCampaignTypes';
import { CampaignThrottling } from '../../campaign/throttling';
import { CampaignQueryBuilder } from './campaignQueryBuilder';
import { ErrorStorage } from '../../campaign/error/errorStorage';
import { BaseApiService } from '../../BaseApiService';
import { CampaignProcessor } from './campaignProcessor';
import { PaginationHandler } from './paginationHandler';
import { ErrorHandler } from '../../campaign/error/errorHandler';

export class CampaignFetchService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    try {
      console.group('[CAMPAIGN FETCH] Authentication Check');
      console.log('Access Token:', token ? 'PRESENT' : 'MISSING');
      console.log('Ad Account ID:', adAccountId);
      
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
      
      CampaignQueryBuilder.validateAdAccountId(adAccountId);
      const formattedAccountId = CampaignQueryBuilder.formatAccountId(adAccountId);
      console.log(`[CAMPAIGN FETCH] Using formatted account ID: ${formattedAccountId}`);
      
      CampaignThrottling.checkThrottling(formattedAccountId);

      // This is the important part - we're using the updated query builder that uses last_28d
      const fields = CampaignQueryBuilder.buildCampaignQuery();
      
      // Verify that the correct date preset is being used
      CampaignQueryBuilder.verifyDatePreset(fields);
      
      console.log('[CAMPAIGN FETCH] Using query fields:', fields);

      const url = `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      
      // Log the actual URL that will be used (with token redacted)
      const redactedUrl = url.replace(token, 'REDACTED');
      console.log(`[CAMPAIGN FETCH] Request URL: ${redactedUrl}`);
      
      // Store the URL for debugging
      try {
        localStorage.setItem('last_campaign_request_url', redactedUrl);
        localStorage.setItem('last_campaign_request_timestamp', new Date().toISOString());
        localStorage.setItem('last_campaign_request_date_preset', fields.match(/date_preset\(([^)]+)\)/)?.[1] || 'unknown');
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Error storing request info:', e);
      }
      
      return await this.executeFetch(url);
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Critical Error:', error);
      throw error;
    }
  }

  private static async executeFetch(url: string): Promise<MetaCampaign[]> {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    this.lastResponseHeaders = {};
    response.headers.forEach((value, key) => {
      this.lastResponseHeaders[key] = value;
    });

    if (!response.ok) {
      // Use the separate ErrorHandler class with correct casing
      await ErrorHandler.handleErrorResponse(response);
    }

    const data = await response.json();
    ErrorStorage.storeRawSuccessResponse(data);
    
    if (!data || !data.data) {
      console.error('[CAMPAIGN FETCH] Invalid response format:', data);
      throw new Error('Invalid response format from Meta API');
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
    
    return CampaignProcessor.processCampaigns(allCampaigns);
  }
}
