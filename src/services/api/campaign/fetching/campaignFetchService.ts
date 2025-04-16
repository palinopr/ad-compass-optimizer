import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { CampaignThrottling } from '../../campaign/throttling';
import { BaseApiService } from '../../../BaseApiService';
import { CampaignProcessor } from './campaignProcessor';
import { FallbackCampaignLoader } from './fallbackCampaignLoader';
import { CampaignApiClient } from './api/campaignApiClient';
import { CampaignUrlBuilder } from './api/urlBuilder';
import { ResponseHandler } from './api/responseHandler';

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
      
      // Check for rate limiting
      CampaignThrottling.checkThrottling(adAccountId);

      // Build the URL with proper validation
      const { url, formattedAccountId } = CampaignUrlBuilder.prepareUrlWithValidation(token, adAccountId, datePreset);
      
      // Execute the fetch and get campaigns
      const campaignData = await CampaignApiClient.executeFetch(url);
      const campaigns = await CampaignProcessor.processCampaigns(campaignData);
      
      // If we get empty data and datePreset is not already maximum, try with maximum
      if (campaigns.length === 0) {
        console.log('[CAMPAIGN FETCH] No campaigns returned, attempting fallback...');
        const fallbackCampaigns = await FallbackCampaignLoader.loadCampaignsFromInsights(token, formattedAccountId);
        
        if (fallbackCampaigns.length > 0) {
          console.log(`[CAMPAIGN FETCH] Fallback successful, loaded ${fallbackCampaigns.length} campaigns`);
          localStorage.setItem('using_fallback_campaigns', 'true');
          return fallbackCampaigns;
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
}
