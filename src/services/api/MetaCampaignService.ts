
import { BaseApiService } from './BaseApiService';
import { CampaignFetchService } from './campaign/fetching/campaignFetchService';
import { MetaCampaign } from './types/metaCampaignTypes';

export type { MetaCampaign };

export class MetaCampaignService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string, datePreset?: string): Promise<MetaCampaign[]> {
    try {
      if (!token) {
        console.error('[META CAMPAIGN] Missing access token');
        return [];
      }
      
      if (!adAccountId) {
        console.error('[META CAMPAIGN] Missing ad account ID');
        return [];
      }
      
      console.log(`[META CAMPAIGN] Fetching campaigns for account ${adAccountId} with date preset ${datePreset || 'last_28d'}`);
      
      // Store timestamp of fetch attempt
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_fetch_account', adAccountId);
      
      const campaigns = await CampaignFetchService.fetchCampaigns(token, adAccountId, datePreset);
      
      // Log success information
      console.log(`[META CAMPAIGN] Successfully fetched ${campaigns.length} campaigns`);
      if (campaigns.length > 0) {
        console.log('[META CAMPAIGN] First campaign sample:', {
          id: campaigns[0]?.id || 'missing',
          name: campaigns[0]?.name || 'unnamed',
          status: campaigns[0]?.status || 'unknown'
        });
      } else {
        console.log('[META CAMPAIGN] No campaigns returned from API');
      }
      
      // If data is empty and datePreset is not already "maximum", try with "maximum" preset
      if (campaigns.length === 0 && datePreset !== "maximum") {
        console.log(`[META CAMPAIGN] No campaigns found with ${datePreset}, trying fallback to "maximum"`);
        return await CampaignFetchService.fetchCampaigns(token, adAccountId, "maximum");
      }
      
      return campaigns;
    } catch (error) {
      console.error('[META CAMPAIGN] Error in fetchCampaigns:', error);
      
      // Store error information for debugging
      try {
        localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error('[META CAMPAIGN] Error storing fetch error details:', e);
      }
      
      // If there's an error and datePreset is not already "maximum", try with "maximum" preset
      if (datePreset !== "maximum") {
        console.log(`[META CAMPAIGN] Error with ${datePreset}, trying fallback to "maximum"`);
        try {
          return await CampaignFetchService.fetchCampaigns(token, adAccountId, "maximum");
        } catch (fallbackError) {
          console.error('[META CAMPAIGN] Fallback also failed:', fallbackError);
        }
      }
      
      // Return empty array instead of throwing to prevent UI breaks
      return [];
    }
  }
}
