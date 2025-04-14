import { BaseApiService } from './BaseApiService';
import { InsightsThrottling } from './insights/throttling';
import { MetaFunnelService } from './MetaFunnelService';
import { CampaignThrottling } from './campaign/throttling';

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: string;
  results: string;
  cost_per_result: string;
  budget: string;
  daily_budget: string;
  lifetime_budget: string;
  start_time: string;
  end_time: string | null;
  created_time: string;
  updated_time: string;
  insights?: {
    cpa?: string;
    roas?: string;
    impressions?: string;
    clicks?: string;
  };
}

export class MetaCampaignService extends BaseApiService {
  private static isMockMode(): boolean {
    return window.location.search.includes('mock=true');
  }

  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    try {
      console.log(`Fetching campaigns for ad account ${adAccountId}...`);
      this.validateToken(token, 'fetchCampaigns');
      
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }

      // Skip throttling check in mock mode
      if (!this.isMockMode()) {
        CampaignThrottling.checkThrottling(adAccountId);
      }
      
      // Track the fetch attempt for diagnostics
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);
      
      // Use the funnel service to get campaign data via batch API
      const { campaigns } = await MetaFunnelService.fetchFunnelData(token, adAccountId);
      
      // Store metadata for diagnostics
      localStorage.setItem('last_campaign_count', campaigns.length.toString());
      localStorage.setItem('last_campaign_fetch_success', 'true');
      localStorage.removeItem('last_empty_result');
      
      return campaigns;
    } catch (error) {
      console.error(`Error fetching campaigns for ad account ${adAccountId}:`, error);
      
      localStorage.setItem('last_campaign_fetch_success', 'false');
      localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
      
      return this.handleApiError(error, 'fetchCampaigns');
    }
  }
  
  /**
   * Verify access to the ad account by fetching adsets
   * This is a fallback check when campaigns are not found
   */
  private static async verifyAdAccountAccess(token: string, adAccountId: string): Promise<void> {
    try {
      console.log(`Verifying ad account access by fetching adsets for ${adAccountId}...`);
      
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${adAccountId}/adsets?fields=id,name&limit=10&access_token=${token}`,
        {
          headers: {
            'User-Agent': 'meta-marketing-dashboard/1.0',
            'Accept': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        console.warn(`Adsets verification failed with status ${response.status}`);
        localStorage.setItem('adsets_verification_failed', 'true');
        return;
      }
      
      const adsetsData = await this.processApiResponse(response, 'verifyAdAccountAccess');
      const adsets = adsetsData.data || [];
      
      console.log(`Found ${adsets.length} adsets`);
      
      localStorage.setItem('has_adsets', adsets.length > 0 ? 'true' : 'false');
      localStorage.setItem('adset_count', adsets.length.toString());
    } catch (error) {
      console.error('Error verifying ad account access:', error);
      localStorage.setItem('adsets_verification_error', error instanceof Error ? error.message : String(error));
    }
  }
}

export default MetaCampaignService;
