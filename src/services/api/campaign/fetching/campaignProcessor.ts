import { MetaCampaign } from '../../types/metaCampaignTypes';

export class CampaignProcessor {
  static processCampaigns(campaigns: any[]): MetaCampaign[] {
    console.log(`[CAMPAIGN FETCH] Processing ${campaigns.length} campaigns`);
    return campaigns.map(campaign => ({
      ...campaign,
      // Add any campaign processing logic here
    }));
  }
}
