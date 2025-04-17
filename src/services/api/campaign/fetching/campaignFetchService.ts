
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { CampaignThrottling } from '../../campaign/throttling';
import { BaseApiService } from '@/services/api/BaseApiService';
import { CampaignProcessor } from './campaignProcessor';
import { FallbackCampaignLoader } from './fallbackCampaignLoader';
import { CampaignApiClient } from './api/campaignApiClient';
import { CampaignUrlBuilder } from './api/urlBuilder';
import { ResponseHandler } from './api/responseHandler';
import { toast } from '@/hooks/use-toast';

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
      
      // Call validateToken on BaseApiService instead of CampaignFetchService
      BaseApiService.validateToken(token, 'fetchCampaigns');
      
      // Check for rate limiting
      CampaignThrottling.checkThrottling(adAccountId);

      // Check if we're using fallback due to previous errors
      const forcingMaximum = localStorage.getItem('force_maximum_date_preset') === 'true';
      if (forcingMaximum && datePreset !== 'maximum') {
        console.log('[CAMPAIGN FETCH] Overriding date preset to maximum due to previous errors');
        datePreset = 'maximum';
        
        // Show notification toast (only once)
        if (!localStorage.getItem('fallback_notified')) {
          toast({
            title: "Using extended date range",
            description: "Using maximum date range to find all available campaigns.",
            duration: 5000
          });
          localStorage.setItem('fallback_notified', 'true');
        }
      }

      // Build the URL with proper validation
      try {
        var { url, formattedAccountId } = CampaignUrlBuilder.prepareUrlWithValidation(token, adAccountId, datePreset);
      } catch (urlError) {
        // If URL building fails, likely due to invalid date preset, fallback to maximum
        console.error('[CAMPAIGN FETCH] URL preparation failed, likely due to invalid preset:', urlError);
        localStorage.setItem('force_maximum_date_preset', 'true');
        localStorage.setItem('date_preset_fallback_reason', `URL preparation failed: ${urlError.message}`);
        
        console.log('[CAMPAIGN FETCH] Retrying with maximum date preset');
        const result = await this.fetchCampaigns(token, adAccountId, 'maximum');
        return result;
      }
      
      // Execute the fetch and get campaigns
      const campaignData = await CampaignApiClient.executeFetch(url);
      const campaigns = await CampaignProcessor.processCampaigns(campaignData);
      
      // If we get empty data and datePreset is not already maximum, try with maximum
      if (campaigns.length === 0) {
        console.log('[CAMPAIGN FETCH] No campaigns returned, attempting fallback...');
        
        // If already using maximum, try fallback loader
        if (datePreset === 'maximum') {
          const fallbackCampaigns = await FallbackCampaignLoader.loadCampaignsFromInsights(token, formattedAccountId);
          
          if (fallbackCampaigns.length > 0) {
            console.log(`[CAMPAIGN FETCH] Fallback successful, loaded ${fallbackCampaigns.length} campaigns`);
            localStorage.setItem('using_fallback_campaigns', 'true');
            
            // Clear fallback notification flag on success
            localStorage.removeItem('fallback_notified');
            
            return fallbackCampaigns;
          } else {
            // If fallback also returns empty, log this clearly
            console.log('[CAMPAIGN FETCH] Both primary and fallback fetches returned no campaigns');
            localStorage.setItem('empty_campaigns_confirmed', 'true');
          }
        } else {
          // Not yet using maximum, switch to it and retry
          console.log('[CAMPAIGN FETCH] Switching to maximum date preset and retrying');
          localStorage.setItem('force_maximum_date_preset', 'true');
          localStorage.setItem('date_preset_fallback_reason', 'Empty results with current date preset');
          
          // Show notification toast
          toast({
            title: "No data found",
            description: "Automatically switching to maximum date range to find campaigns",
            duration: 5000
          });
          
          // Retry with maximum
          return await this.fetchCampaigns(token, adAccountId, 'maximum');
        }
      } else {
        localStorage.removeItem('using_fallback_campaigns');
        localStorage.removeItem('empty_campaigns_confirmed');
        
        // Reset fallback notification flag on success
        localStorage.removeItem('fallback_notified');
      }
      
      return campaigns;
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Critical Error:', error);
      
      // Check if error is related to date preset
      const errorStr = String(error);
      if (errorStr.includes('date_preset') || errorStr.includes('preset')) {
        console.warn('[CAMPAIGN FETCH] Date preset error detected, falling back to maximum');
        localStorage.setItem('force_maximum_date_preset', 'true');
        localStorage.setItem('date_preset_fallback_reason', `API error: ${errorStr}`);
        
        // Show notification toast
        toast({
          title: "Date range issue detected",
          description: "Automatically switching to maximum date range",
          duration: 5000
        });
        
        // Only retry with maximum if we weren't already using it
        if (datePreset !== 'maximum') {
          try {
            console.log('[CAMPAIGN FETCH] Retrying with maximum date preset');
            return await this.fetchCampaigns(token, adAccountId, 'maximum');
          } catch (retryError) {
            console.error('[CAMPAIGN FETCH] Retry with maximum also failed:', retryError);
          }
        }
      }
      
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
