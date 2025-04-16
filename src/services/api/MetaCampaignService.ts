
import { BaseApiService } from './BaseApiService';
import { CampaignFetchService } from './campaign/fetching/campaignFetchService';
import { MetaCampaign } from './types/metaCampaignTypes';

export type { MetaCampaign };

export class MetaCampaignService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string, datePreset: string = 'last_30d'): Promise<MetaCampaign[]> {
    try {
      if (!token) {
        console.error('[META CAMPAIGN] Missing access token');
        return [];
      }
      
      if (!adAccountId) {
        console.error('[META CAMPAIGN] Missing ad account ID');
        return [];
      }
      
      console.log(`[META CAMPAIGN] Fetching campaigns for account ${adAccountId} with date preset ${datePreset || 'last_30d'}`);
      
      // Log full request details for debugging
      console.log('[META CAMPAIGN] Full request details:', {
        tokenLength: token ? token.length : 0,
        adAccountId: adAccountId,
        datePreset: datePreset || 'last_30d',
        timestamp: new Date().toISOString()
      });
      
      // Store timestamp of fetch attempt
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_fetch_account', adAccountId);
      
      // NEW: Ensure datePreset is specifically set to last_30d
      const forcedDatePreset = 'last_30d';
      if (datePreset !== forcedDatePreset) {
        console.log(`[META CAMPAIGN] Overriding provided date_preset '${datePreset}' with forced value '${forcedDatePreset}'`);
      }
      
      const campaigns = await CampaignFetchService.fetchCampaigns(token, adAccountId, forcedDatePreset);
      
      // NEW: Log raw campaign data before any processing
      console.log('[MetaCampaignService] PIPELINE RAW INPUT - Raw campaigns response:', campaigns);
      
      // IMPORTANT: Ensure we always return an array, even if empty
      const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
      
      // NEW: No filtering or transformation - pass ALL campaigns through
      console.log('[MetaCampaignService] BYPASSING FILTERS - Using all campaigns');
      
      // Log success information
      console.log(`[META CAMPAIGN] Successfully fetched ${safeCampaigns.length} campaigns`);
      
      // Add IDs to any campaigns without them
      safeCampaigns.forEach((campaign, index) => {
        if (!campaign.id) {
          campaign.id = `generated-id-${index}`;
          console.warn(`[META CAMPAIGN] Generated ID for campaign: ${campaign.name || 'unnamed'}`);
        }
      });
      
      // NEW: Log the final output before returning
      console.log('[MetaCampaignService] PIPELINE OUTPUT - Returning campaigns:', {
        count: safeCampaigns.length,
        hasEmptyObjects: safeCampaigns.some(c => Object.keys(c).length === 0),
        allHaveIds: safeCampaigns.every(c => !!c.id)
      });
      
      return safeCampaigns;
    } catch (error) {
      console.error('[META CAMPAIGN] Error in fetchCampaigns:', error);
      
      // NEW: Log error in the requested format
      console.error('[MetaCampaignService] Failed to fetch campaigns:', error);
      
      // Store error information for debugging
      try {
        localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        console.error('[META CAMPAIGN] Error storing fetch error details:', e);
      }
      
      // If there's an error and datePreset is not already "last_30d", try with "last_30d" preset
      if (datePreset !== "last_30d") {
        console.log(`[META CAMPAIGN] Error with ${datePreset}, trying fallback to "last_30d"`);
        try {
          return await CampaignFetchService.fetchCampaigns(token, adAccountId, "last_30d");
        } catch (fallbackError) {
          console.error('[META CAMPAIGN] Fallback also failed:', fallbackError);
        }
      }
      
      // Always return empty array instead of throwing to prevent UI breaks
      return [];
    }
  }
}
