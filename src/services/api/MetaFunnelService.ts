
import { BaseApiService } from './BaseApiService';

export class MetaFunnelService extends BaseApiService {
  static async fetchFunnelData(token: string, adAccountId: string, datePreset: string = 'last_28d') {
    console.log(`[META FUNNEL] Fetching funnel data with date preset: ${datePreset}`);
    
    // For demo purposes, return sample data
    // In a real implementation, this would call the Meta API with the datePreset parameter
    
    // Import the meta campaign service that uses our date preset
    const { MetaCampaignService } = await import('./MetaCampaignService');
    
    try {
      // Fetch campaigns with the specified date preset
      const campaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId, datePreset);
      
      return {
        campaigns: campaigns,
        adsets: [],
        ads: []
      };
    } catch (error) {
      console.error('[META FUNNEL] Error fetching funnel data:', error);
      throw error;
    }
  }
}
