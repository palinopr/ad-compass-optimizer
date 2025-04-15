
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
  
  /**
   * Handle error responses from Meta API
   */
  private static async handleErrorResponse(response: Response): Promise<never> {
    const errorText = await response.text();
    console.error(`[CAMPAIGN FETCH] API Error (${response.status}):`, errorText);
    
    let errorMessage: string;
    let errorDetails: any = {};
    
    try {
      // Try to parse as JSON
      const errorJson = JSON.parse(errorText);
      ErrorStorage.storeRawErrorResponse(errorJson);
      
      if (errorJson.error) {
        errorMessage = errorJson.error.message || `API Error: ${response.status}`;
        errorDetails = errorJson.error;
        
        // Check for specific error codes and provide better error messages
        if (errorJson.error.code === 190) {
          errorMessage = 'Your access token has expired or is invalid. Please reconnect your account.';
          // Clear invalid token
          localStorage.removeItem('meta_access_token');
        } else if (errorJson.error.code === 4 || errorJson.error.code === 17 || errorJson.error.code === 32) {
          errorMessage = `Rate limit reached: ${errorJson.error.message}. Please wait before trying again.`;
        }
      } else {
        errorMessage = `API Error: ${response.status}`;
        errorDetails = errorJson;
      }
    } catch (parseError) {
      // If not valid JSON, use the raw error text
      errorMessage = `API Error (${response.status}): ${errorText.substring(0, 100)}`;
      ErrorStorage.storeRawErrorResponse({ raw: errorText });
    }

    const error = new Error(errorMessage);
    (error as any).details = errorDetails;
    (error as any).status = response.status;
    throw error;
  }
}
