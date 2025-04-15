
import { BaseApiService } from './BaseApiService';

export class MetaFunnelService extends BaseApiService {
  // Valid date presets according to Meta API
  private static validDatePresets = [
    'today', 'yesterday', 'this_week', 'last_week',
    'this_month', 'last_month', 'last_3_months', 'last_6_months',
    'this_quarter', 'lifetime', 'last_30d', 'last_14d',
    'last_7d', 'last_28d', 'maximum'
  ];
  
  private static mapDatePreset(preset: string = 'last_28d'): string {
    // Explicit mapping for legacy values
    const mapping: Record<string, string> = {
      'last30days': 'last_28d',
      'last_30d': 'last_28d',
      'last7days': 'last_7d'
    };
    
    if (mapping[preset]) {
      return mapping[preset];
    }
    
    // If already a valid preset, use it
    if (this.validDatePresets.includes(preset)) {
      return preset;
    }
    
    // Default to last_28d
    return 'last_28d';
  }

  static async fetchFunnelData(token: string, adAccountId: string, datePreset: string = 'last_28d') {
    const validDatePreset = this.mapDatePreset(datePreset);
    console.log(`[META FUNNEL] Fetching funnel data with date preset: ${validDatePreset}`);
    
    // For demo purposes, return sample data
    // In a real implementation, this would call the Meta API with the datePreset parameter
    
    // Import the meta campaign service that uses our date preset
    const { MetaCampaignService } = await import('./MetaCampaignService');
    
    try {
      // Fetch campaigns with the validated date preset
      const campaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId, validDatePreset);
      
      // If no campaigns and not already maximum, try with maximum
      if (campaigns.length === 0 && validDatePreset !== 'maximum') {
        console.log('[META FUNNEL] No campaigns found, trying maximum date preset');
        const maximumCampaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId, 'maximum');
        
        return {
          campaigns: maximumCampaigns,
          adsets: [],
          ads: []
        };
      }
      
      return {
        campaigns: campaigns,
        adsets: [],
        ads: []
      };
    } catch (error) {
      console.error('[META FUNNEL] Error fetching funnel data:', error);
      
      // Try with maximum preset if another preset failed and we're not already using maximum
      if (validDatePreset !== 'maximum') {
        console.log('[META FUNNEL] Error with current preset, trying with maximum');
        try {
          const maximumCampaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId, 'maximum');
          return {
            campaigns: maximumCampaigns,
            adsets: [],
            ads: []
          };
        } catch (maximumError) {
          console.error('[META FUNNEL] Maximum fallback also failed:', maximumError);
          // Continue to throw the original error
        }
      }
      
      throw error;
    }
  }
}
