
import { BaseApiService } from './BaseApiService';
import { InsightsThrottling } from './insights/throttling';
import { MetaFunnelService } from './MetaFunnelService';
import { CampaignThrottling } from './campaign/throttling';
import { MockApiService } from './mock/MockApiService';

export interface MetaCampaign {
  id: string;
  name: string;
  objective: string;
  status: string;
  spend: string;
  results: string;
  cost_per_result: string;
  budget: string;
  daily_budget?: string;
  lifetime_budget?: string;
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
    return MockApiService.isMockMetaApiMode() || localStorage.getItem("USE_MOCK_MODE") === "true";
  }

  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    if (this.isMockMode()) {
      console.warn('🎭 Direct MetaCampaignService.fetchCampaigns call attempted in mock mode');
      throw new Error('Cannot make direct API calls in mock mode. Use MetaApiService instead.');
    }

    try {
      console.log(`[CAMPAIGN FETCH] Starting campaign fetch for ad account: ${adAccountId}...`);
      console.log(`[CAMPAIGN FETCH] Token: ${token.substring(0, 8)}...${token.substring(token.length - 8)}`);
      
      this.validateToken(token, 'fetchCampaigns');
      
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }

      // Skip throttling check in mock mode and log it clearly
      if (this.isMockMode()) {
        console.log('🎭 Mock mode active - bypassing throttling checks');
      } else {
        console.log('Real API mode - checking throttling status');
        CampaignThrottling.checkThrottling(adAccountId);
      }
      
      // Track the fetch attempt for diagnostics
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);
      
      // Use the funnel service to get campaign data via batch API
      console.log('[CAMPAIGN FETCH] Making API call via MetaFunnelService...');
      const response = await MetaFunnelService.fetchFunnelData(token, adAccountId);
      
      console.log('[CAMPAIGN FETCH] MetaFunnelService Response:', {
        campaignsCount: response.campaigns.length,
        adsetsCount: response.adsets.length,
        adsCount: response.ads.length,
        status: 'success'
      });
      
      // Log response details
      console.log(`[CAMPAIGN FETCH] Success! Received ${response.campaigns.length} campaigns`);
      
      // Store metadata for diagnostics
      localStorage.setItem('last_campaign_count', response.campaigns.length.toString());
      localStorage.setItem('last_campaign_fetch_success', 'true');
      localStorage.removeItem('last_empty_result');
      
      return response.campaigns;
    } catch (error: any) {
      console.error(`[CAMPAIGN FETCH] Error fetching campaigns for ad account ${adAccountId}:`, error);
      console.error(`[CAMPAIGN FETCH] Error details:`, error?.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: Object.fromEntries([...error.response.headers.entries()]),
      } : 'No response details available');
      
      if (error?.response) {
        try {
          const responseText = await error.response.text();
          console.error(`[CAMPAIGN FETCH] Error response body:`, responseText);
          
          try {
            const json = JSON.parse(responseText);
            console.error('[CAMPAIGN FETCH] Parsed error JSON:', json);
          } catch (parseErr) {
            console.error('[CAMPAIGN FETCH] ❌ Failed to parse error JSON:', parseErr);
          }
        } catch (e) {
          console.error(`[CAMPAIGN FETCH] Could not read error response text:`, e);
        }
      }
      
      localStorage.setItem('last_campaign_fetch_success', 'false');
      localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
      
      throw error;
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
