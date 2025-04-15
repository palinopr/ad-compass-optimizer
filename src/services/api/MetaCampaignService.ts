import { BaseApiService } from './BaseApiService';
import { InsightsThrottling } from './insights/throttling';
import { MetaFunnelService } from './MetaFunnelService';
import { CampaignThrottling } from './campaign/throttling';
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
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    try {
      CampaignFetchLogger.logAttempt(adAccountId);
    
      this.validateToken(token, 'fetchCampaigns');
    
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }
      
      // Validate account ID format
      if (!/^act_\d+$/.test(adAccountId)) {
        throw new Error('Invalid ad account ID format');
      }

      CampaignThrottling.checkThrottling(adAccountId);

      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);
    
      try {
        const endpoint = `/act_${adAccountId}/campaigns`;
        // Include insights fields in the campaign request with date_preset
        const datePreset = 'last_30d';
        const fields = 'id,name,objective,status,spend,results,cost_per_result,budget,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time,insights.date_preset(last_30d){impressions,clicks,cpc,ctr,spend,cost_per_action_type}';
        
        const queryParams = `fields=${fields}&date_preset=${datePreset}&access_token=${token}`;
        console.log(`[CAMPAIGN FETCH] Fetching campaigns with insights for act_${adAccountId}`);
        console.log(`[CAMPAIGN FETCH] Using date_preset: ${datePreset}`);
        
        const response = await fetch(
          `${this.BASE_URL}/${this.API_VERSION}${endpoint}?${queryParams}`,
          {
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        await CampaignFetchLogger.logResponse(response, adAccountId, queryParams);

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
            console.log(`[CAMPAIGN FETCH] Campaign ${campaign.id} has insights:`, {
              id: campaign.id,
              name: campaign.name,
              status: campaign.status,
              spend: campaign.spend || '$0.00',
              results: campaign.results || '0',
              impressions: insightsData.impressions || '0',
              clicks: insightsData.clicks || '0'
            });
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
}

export default MetaCampaignService;
