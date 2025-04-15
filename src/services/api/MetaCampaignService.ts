
import { BaseApiService } from './BaseApiService';
import { InsightsThrottling } from './insights/throttling';
import { MetaFunnelService } from './MetaFunnelService';
import { CampaignThrottling } from './campaign/throttling';
import { MockApiService } from './mock/MockApiService';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';

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
      CampaignFetchLogger.logAttempt(adAccountId);
    
      this.validateToken(token, 'fetchCampaigns');
    
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }

      if (!this.isMockMode()) {
        CampaignThrottling.checkThrottling(adAccountId);
      }

      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);
    
      try {
        const endpoint = `/act_${adAccountId}/campaigns`;
        // Include insights fields in the campaign request
        const fields = 'id,name,objective,status,spend,results,cost_per_result,budget,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time,insights.date_preset(last_30d){impressions,clicks,cpc,ctr,spend,cost_per_action_type}';
        
        console.log(`[CAMPAIGN FETCH] Fetching campaigns with insights for act_${adAccountId}`);
        console.log(`[CAMPAIGN FETCH] Fields requested: ${fields}`);
        
        const response = await fetch(
          `${this.BASE_URL}/${this.API_VERSION}${endpoint}?fields=${fields}&access_token=${token}`,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        await CampaignFetchLogger.logResponse(response, adAccountId);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!data || !data.data) {
          throw new Error('Invalid response format');
        }

        console.log(`[CAMPAIGN FETCH] Received ${data.data.length} campaigns with insights data`);
        
        // Process campaign data including insights
        const campaigns = data.data.map((campaign: any) => {
          // Extract insights data if available
          const insightsData = campaign.insights?.data?.[0] || {};
          
          // Log insights data for debugging
          if (campaign.insights?.data?.length > 0) {
            console.log(`[CAMPAIGN FETCH] Campaign ${campaign.id} has insights data:`, insightsData);
          }
          
          return {
            ...campaign,
            spend: campaign.spend || '$0.00',
            results: campaign.results || '0',
            cost_per_result: campaign.cost_per_result || '$0.00',
            budget: campaign.daily_budget ? 
              `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}/day` : 
              (campaign.lifetime_budget ? 
                `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)} total` : 
                '-'),
            insights: {
              impressions: insightsData.impressions || '0',
              clicks: insightsData.clicks || '0',
              cpa: insightsData.cost_per_action_type?.[0]?.value || '$0.00',
              roas: insightsData.roas || '0.00'
            }
          };
        });

        localStorage.setItem('last_campaign_count', campaigns.length.toString());
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.removeItem('last_empty_result');
      
        return campaigns;
      } catch (fetchError: any) {
        CampaignFetchLogger.logError(fetchError, adAccountId);
        throw fetchError;
      }
    } catch (error: any) {
      console.error(`[CAMPAIGN FETCH] Error fetching campaigns for ad account ${adAccountId}:`, error);
    
      localStorage.setItem('last_campaign_fetch_success', 'false');
      localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
        message: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }));
    
      throw error;
    }
  }
  
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
