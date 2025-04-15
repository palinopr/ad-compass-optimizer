
import { MetaCampaign } from '../../types/metaCampaignTypes';
import { BaseApiService } from '../../BaseApiService';

export class FallbackCampaignLoader extends BaseApiService {
  static async loadCampaignsFromInsights(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    console.log('[FALLBACK] Attempting to load campaigns from insights...');
    
    try {
      // First get insights to extract campaign IDs
      const insightsUrl = `${this.BASE_URL}/${this.API_VERSION}/${adAccountId}/insights?fields=campaign_id,campaign_name&date_preset=last_28d&access_token=${token}`;
      const insightsResponse = await fetch(insightsUrl);
      const insightsData = await insightsResponse.json();

      if (!insightsData?.data?.length) {
        console.log('[FALLBACK] No insights data available');
        return [];
      }

      // Extract unique campaign IDs and names
      const uniqueCampaigns = new Map<string, { name: string }>();
      insightsData.data.forEach((insight: any) => {
        if (insight.campaign_id && !uniqueCampaigns.has(insight.campaign_id)) {
          uniqueCampaigns.set(insight.campaign_id, {
            name: insight.campaign_name || 'Unnamed Campaign'
          });
        }
      });

      console.log(`[FALLBACK] Found ${uniqueCampaigns.size} unique campaigns in insights`);

      // Fetch additional details for each campaign
      const campaignPromises = Array.from(uniqueCampaigns.entries()).map(async ([id, basicInfo]) => {
        try {
          const campaignUrl = `${this.BASE_URL}/${this.API_VERSION}/${id}?fields=name,status,effective_status&access_token=${token}`;
          const response = await fetch(campaignUrl);
          const data = await response.json();

          return {
            id,
            name: data.name || basicInfo.name,
            status: data.status || 'UNKNOWN',
            effective_status: data.effective_status,
            loadedFromFallback: true
          } as MetaCampaign;
        } catch (err) {
          console.warn(`[FALLBACK] Error fetching details for campaign ${id}:`, err);
          // Return basic info if detailed fetch fails
          return {
            id,
            name: basicInfo.name,
            status: 'UNKNOWN',
            effective_status: 'UNKNOWN',
            loadedFromFallback: true
          } as MetaCampaign;
        }
      });

      const campaigns = await Promise.all(campaignPromises);
      console.log(`[FALLBACK] Successfully loaded ${campaigns.length} campaigns`);
      return campaigns;
    } catch (error) {
      console.error('[FALLBACK] Error in fallback campaign loader:', error);
      return [];
    }
  }
}
