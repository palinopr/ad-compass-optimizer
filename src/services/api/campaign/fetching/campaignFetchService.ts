
import { MetaCampaign } from '../../types/metaCampaignTypes';
import { CampaignThrottling } from '../../campaign/throttling';
import { CampaignQueryBuilder } from './campaignQueryBuilder';
import { ErrorStorage } from '../../campaign/error/errorStorage';
import { BaseApiService } from '../../BaseApiService';
import { CampaignProcessor } from './campaignProcessor';
import { PaginationHandler } from './paginationHandler';

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

      const fields = CampaignQueryBuilder.buildCampaignQuery();
      console.group('[CAMPAIGN FETCH] Query Details');
      console.log('Fields:', fields);
      console.log('Date Preset:', 'last_28d');
      console.groupEnd();
      
      const url = `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      console.log(`[CAMPAIGN FETCH] Request URL: ${url.replace(token, 'REDACTED')}`);
      
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
      await this.handleErrorResponse(response);
    }

    const data = await response.json();
    ErrorStorage.storeRawSuccessResponse(data);
    
    console.log('[CAMPAIGN FETCH] Raw response:', JSON.stringify(data).substring(0, 500) + '...');
    
    if (!data || !data.data) {
      console.error('[CAMPAIGN FETCH] Invalid response format:', data);
      throw new Error('Invalid response format from Meta API');
    }

    console.log(`[CAMPAIGN FETCH] Successfully received ${data.data.length} campaigns`);
    
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

  private static async handleErrorResponse(response: Response): Promise<never> {
    const errorData = await response.json();
    console.error('[GRAPH API ERROR] Response:', {
      status: response.status,
      data: errorData,
      headers: Object.fromEntries(response.headers.entries())
    });
    
    const error = errorData?.error || {};
    console.error('[GRAPH API ERROR] Details:', {
      message: error.message || 'Unknown error',
      type: error.type || 'Unknown type',
      code: error.code || 'Unknown code',
      subcode: error.error_subcode
    });
    
    ErrorStorage.storeRawErrorResponse(errorData);
    
    throw {
      message: error.message || `HTTP error! status: ${response.status}`,
      code: error.code,
      type: error.type,
      subcode: error.error_subcode,
      status: response.status,
      response: {
        data: errorData,
        status: response.status,
        headers: Object.fromEntries(response.headers.entries())
      }
    };
  }
}
