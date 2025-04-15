
import { MetaCampaign } from '../../types/metaCampaignTypes';

export class CampaignProcessor {
  static processCampaigns(campaigns: any[]): MetaCampaign[] {
    console.log(`[CAMPAIGN FETCH] Processing ${campaigns.length} campaigns`);
    
    // Analyze campaigns before returning them
    if (campaigns.length > 0) {
      // Log the first campaign as sample (redact sensitive data)
      const sampleCampaign = { ...campaigns[0] };
      console.log('[CAMPAIGN FETCH] Sample campaign structure:', 
        JSON.stringify({
          id: sampleCampaign.id,
          name: sampleCampaign.name,
          status: sampleCampaign.status,
          hasInsights: !!sampleCampaign.insights,
          insightsFields: sampleCampaign.insights ? Object.keys(sampleCampaign.insights) : [],
          datePreset: sampleCampaign.insights?.date_preset || 'missing'
        }, null, 2)
      );
    }
    
    // Don't filter out campaigns with missing insights - this could cause hydration issues
    return campaigns.map(campaign => ({
      ...campaign,
      // Ensure insights is always at least an empty object to prevent null reference errors
      insights: campaign.insights || {},
    }));
  }
}
