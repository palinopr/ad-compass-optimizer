
import { BaseApiService } from './BaseApiService';
import { CampaignFetchService } from './campaign/fetching/campaignFetchService';
import { MetaCampaign } from './types/metaCampaignTypes';

export type { MetaCampaign };

export class MetaCampaignService extends BaseApiService {
  public static async fetchCampaigns(token: string, adAccountId: string, datePreset?: string): Promise<MetaCampaign[]> {
    try {
      const campaigns = await CampaignFetchService.fetchCampaigns(token, adAccountId, datePreset);
      
      // If data is empty and datePreset is not already "maximum", try with "maximum" preset
      if (campaigns.length === 0 && datePreset !== "maximum") {
        console.log(`[META CAMPAIGN] No campaigns found with ${datePreset}, trying fallback to "maximum"`);
        return await CampaignFetchService.fetchCampaigns(token, adAccountId, "maximum");
      }
      
      return campaigns;
    } catch (error) {
      console.error('[META CAMPAIGN] Error in fetchCampaigns:', error);
      
      // If there's an error and datePreset is not already "maximum", try with "maximum" preset
      if (datePreset !== "maximum") {
        console.log(`[META CAMPAIGN] Error with ${datePreset}, trying fallback to "maximum"`);
        try {
          return await CampaignFetchService.fetchCampaigns(token, adAccountId, "maximum");
        } catch (fallbackError) {
          console.error('[META CAMPAIGN] Fallback also failed:', fallbackError);
          throw fallbackError;
        }
      }
      
      throw error;
    }
  }
}
