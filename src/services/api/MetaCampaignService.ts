
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
      
      // IMPORTANT: Ensure we always return an array, even if empty
      const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
      
      // Log success information
      console.log(`[META CAMPAIGN] Successfully fetched ${safeCampaigns.length} campaigns`);
      
      // Add IDs to any campaigns without them
      safeCampaigns.forEach((campaign, index) => {
        if (!campaign.id) {
          campaign.id = `generated-id-${index}`;
          console.warn(`[META CAMPAIGN] Generated ID for campaign: ${campaign.name || 'unnamed'}`);
        }
      });
      
      if (safeCampaigns.length > 0) {
        console.log('[META CAMPAIGN] First campaign sample:', {
          id: safeCampaigns[0]?.id || 'missing',
          name: safeCampaigns[0]?.name || 'unnamed',
          status: safeCampaigns[0]?.status || 'unknown',
          hasInsights: !!safeCampaigns[0]?.insights
        });
        
        // Ensure each campaign has at least basic properties even if API didn't provide them
        safeCampaigns.forEach(campaign => {
          if (!campaign.name) campaign.name = `Campaign ${campaign.id}`;
          if (!campaign.status) campaign.status = 'unknown';
          
          // Log each campaign for debugging
          console.log(`[META CAMPAIGN] Processing campaign: ${campaign.name} (${campaign.id}), status: ${campaign.status}, hasInsights: ${!!campaign.insights}`);
        });
      } else {
        console.log('[META CAMPAIGN] No campaigns returned from API');
      }
      
      // If data is empty and datePreset is not already "maximum", try with "maximum" preset
      if (safeCampaigns.length === 0 && datePreset !== "maximum") {
        console.log(`[META CAMPAIGN] No campaigns found with ${datePreset}, trying fallback to "maximum"`);
        return await CampaignFetchService.fetchCampaigns(token, adAccountId, "maximum");
      }
      
      return safeCampaigns;
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
      
      // Always return empty array instead of throwing to prevent UI breaks
      return [];
    }
  }
}
