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
      
      try {
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
      } catch (fetchError: any) {
        // Enhanced error logging for the API call
        console.error(`[CAMPAIGN FETCH] Error in MetaFunnelService.fetchFunnelData:`, fetchError);
        
        // Extract and log the raw response if available
        if (fetchError?.response) {
          console.log(`[CAMPAIGN FETCH] Status:`, fetchError.response.status, fetchError.response.statusText);
          console.log(`[CAMPAIGN FETCH] Headers:`, Object.fromEntries([...fetchError.response.headers.entries()]));
          
          try {
            const responseText = await fetchError.response.text();
            console.log(`[CAMPAIGN FETCH] Raw Body:`, responseText);
            
            try {
              const parsed = JSON.parse(responseText);
              console.log(`[CAMPAIGN FETCH] Parsed JSON:`, parsed);
              
              // Check specifically for Meta API errors
              if (parsed.error) {
                console.error(`[CAMPAIGN FETCH] Meta API Error:`, {
                  code: parsed.error.code,
                  message: parsed.error.message,
                  type: parsed.error.type,
                  fbtraceId: parsed.error.fbtrace_id
                });
              }
            } catch (jsonErr) {
              console.error(`[CAMPAIGN FETCH] ❌ JSON parse error:`, jsonErr);
              console.error(`[CAMPAIGN FETCH] Unparseable response body:`, responseText);
            }
          } catch (textErr) {
            console.error(`[CAMPAIGN FETCH] ❌ Failed to read response body:`, textErr);
          }
        } else {
          console.error(`[CAMPAIGN FETCH] No response object in error:`, fetchError);
        }
        
        // Rethrow the error after logging
        throw fetchError;
      }
    } catch (error: any) {
      console.error(`[CAMPAIGN FETCH] Error fetching campaigns for ad account ${adAccountId}:`, error);
      console.error(`[CAMPAIGN FETCH] Error details:`, error?.response ? {
        status: error.response.status,
        statusText: error.response.statusText,
        headers: Object.fromEntries([...error.response.headers.entries()]),
      } : 'No response details available');
      
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
