
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
      
      // NEW: Log raw campaign data after fetch but before mapping/filtering
      console.log('[MetaCampaignService] Raw campaigns response:', campaigns);
      
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
        
        // Check if the campaigns are empty objects and warn if so
        const emptyCount = safeCampaigns.filter(c => Object.keys(c).length === 0).length;
        if (emptyCount > 0) {
          console.warn(`⚠️ Meta API returned ${emptyCount}/${safeCampaigns.length} empty campaign objects. Possible permissions or token issue.`);
          // NEW: Log the request URL if available
          console.warn(`⚠️ Check request parameters: date_preset=last_30d was ${safeCampaigns[0]?.insights?.date_preset ? 'included' : 'missing'}`);
        }
        
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
      
      // If data is empty and datePreset is not already "last_30d", try with "last_30d" preset
      if (safeCampaigns.length === 0 && datePreset !== "last_30d") {
        console.log(`[META CAMPAIGN] No campaigns found with ${datePreset}, trying fallback to "last_30d"`);
        return await CampaignFetchService.fetchCampaigns(token, adAccountId, "last_30d");
      }
      
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
