
import { BaseApiService } from './BaseApiService';

export class MetaFunnelService extends BaseApiService {
  // Valid date presets according to Meta API - strictly enforced from documentation
  private static validDatePresets = [
    'today', 'yesterday', 'this_month', 'last_month', 'this_quarter',
    'lifetime', 'last_3d', 'last_7d', 'last_14d', 'last_30d', 
    'last_90d', 'last_week_mon_sun', 'last_week_sun_sat', 'last_quarter', 
    'last_year', 'this_week_mon_today', 'this_week_sun_today', 'this_year',
    'maximum'
  ];
  
  private static strictlyValidateDatePreset(preset: string = 'maximum'): string {
    // Direct check against valid presets
    if (this.validDatePresets.includes(preset)) {
      return preset;
    }
    
    // Explicit mapping for legacy values
    const mapping: Record<string, string> = {
      'last30days': 'last_30d',
      'last_28d': 'maximum',
      'last28d': 'maximum',
      'last7days': 'last_7d'
    };
    
    if (mapping[preset]) {
      console.log(`[META FUNNEL] Mapped legacy preset '${preset}' to '${mapping[preset]}'`);
      return mapping[preset];
    }
    
    // Default to maximum
    console.warn(`[META FUNNEL] Invalid preset '${preset}', using default 'maximum'`);
    return 'maximum';
  }

  static async fetchFunnelData(token: string, adAccountId: string, datePreset: string = 'maximum') {
    const validDatePreset = this.strictlyValidateDatePreset(datePreset);
    console.log(`[META FUNNEL] Fetching funnel data with validated date preset: ${validDatePreset}`);
    
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
