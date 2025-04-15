import { BaseApiService } from './BaseApiService';
import { CampaignThrottling } from './campaign/throttling';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';
import { MetaCampaign } from './types/metaCampaignTypes';
import { CampaignProcessor } from './campaign/fetching/campaignProcessor';
import { PaginationHandler } from './campaign/fetching/paginationHandler';
import { CampaignQueryBuilder } from './campaign/fetching/campaignQueryBuilder';
import { ErrorStorage } from './campaign/error/errorStorage';
import { metaAuthService } from '../MetaAuthService';

export type { MetaCampaign };

export class MetaCampaignService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    try {
      // Enhanced authentication and permission logging
      console.group('[CAMPAIGN FETCH] Authentication Check');
      console.log('Access Token:', token ? 'PRESENT' : 'MISSING');
      console.log('Ad Account ID:', adAccountId);
      
      // Validate token existence
      if (!token) {
        console.error('❌ No access token found');
        throw new Error('Missing Meta access token. Please re-authenticate.');
      }

      // Validate ad account ID
      if (!adAccountId) {
        console.error('❌ No ad account selected');
        throw new Error('No ad account selected. Please choose an ad account.');
      }
      console.groupEnd();

      CampaignFetchLogger.logAttempt(adAccountId);
      
      this.validateToken(token, 'fetchCampaigns');
      
      // Validate and format account ID
      CampaignQueryBuilder.validateAdAccountId(adAccountId);
      const formattedAccountId = CampaignQueryBuilder.formatAccountId(adAccountId);
      console.log(`[CAMPAIGN FETCH] Using formatted account ID: ${formattedAccountId}`);
      
      // Check if we should throttle the request
      CampaignThrottling.checkThrottling(formattedAccountId);

      // Build query fields
      const fields = CampaignQueryBuilder.buildCampaignQuery();
      const url = `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      
      console.log(`[CAMPAIGN FETCH] Request URL: ${url.replace(token, 'REDACTED')}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Store response headers for rate limit analysis
      this.lastResponseHeaders = {};
      response.headers.forEach((value, key) => {
        this.lastResponseHeaders[key] = value;
      });

      if (!response.ok) {
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
        
        // Store raw response for debugging
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

      const data = await response.json();
      
      // Store raw response for debugging
      ErrorStorage.storeRawSuccessResponse(data);
      
      // Log raw response for debugging
      console.log('[CAMPAIGN FETCH] Raw response:', JSON.stringify(data).substring(0, 500) + '...');
      
      if (!data || !data.data) {
        console.error('[CAMPAIGN FETCH] Invalid response format:', data);
        throw new Error('Invalid response format from Meta API');
      }

      console.log(`[CAMPAIGN FETCH] Successfully received ${data.data.length} campaigns`);
      
      // Handle pagination if needed
      let allCampaigns = [...data.data];
      
      // Check if there's a next page
      if (data.paging && data.paging.next) {
        console.log('[CAMPAIGN FETCH] Pagination detected, fetching more pages');
        try {
          const nextPageCampaigns = await PaginationHandler.fetchPaginatedCampaigns(data.paging.next);
          allCampaigns = [...allCampaigns, ...nextPageCampaigns];
        } catch (paginationError) {
          console.error('[CAMPAIGN FETCH] Error fetching additional pages:', paginationError);
          // Continue with what we have
        }
      }
      
      return CampaignProcessor.processCampaigns(allCampaigns);
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Critical Error:', error);
      throw error;
    }
  }
}
