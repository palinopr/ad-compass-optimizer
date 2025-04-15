
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
      // Log the fetch attempt
      CampaignFetchLogger.logAttempt(adAccountId);
    
      this.validateToken(token, 'fetchCampaigns');
    
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }
      
      // Validate account ID format - ensure it begins with act_ but doesn't have duplication
      if (!/^act_\d+$/.test(adAccountId)) {
        console.error(`[CAMPAIGN FETCH] Invalid ad account ID format: ${adAccountId}`);
        throw new Error(`Invalid ad account ID format: ${adAccountId}`);
      }

      // Remove any act_ prefix for the API call since we'll add it in the endpoint
      const cleanAccountId = adAccountId.replace(/^act_/, '');
      
      // Check throttling
      CampaignThrottling.checkThrottling(adAccountId);

      // Record fetch attempt in localStorage
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);
      
      // Update fetch attempts counter
      const attempts = parseInt(localStorage.getItem('campaign_fetch_attempts') || '0', 10);
      localStorage.setItem('campaign_fetch_attempts', (attempts + 1).toString());
      
      console.log(`[CAMPAIGN FETCH] 🔄 Fetching campaigns for account ${adAccountId}, attempt #${attempts + 1}`);
    
      try {
        // Correctly format the endpoint with the account ID
        const endpoint = `/act_${cleanAccountId}/campaigns`;
        
        // Include insights fields in the campaign request with date_preset
        const datePreset = 'last_30d';
        const fields = 'id,name,objective,status,effective_status,spend,results,cost_per_result,budget_remaining,daily_budget,lifetime_budget,start_time,end_time,created_time,updated_time,insights.date_preset(last_30d){impressions,clicks,cpc,ctr,spend,cost_per_action_type,actions}';
        
        const queryParams = `fields=${encodeURIComponent(fields)}&date_preset=${datePreset}&effective_status=["ACTIVE","PAUSED","ARCHIVED"]&access_token=${token}`;
        const fullUrl = `${this.BASE_URL}/${this.API_VERSION}${endpoint}?${queryParams}`;
        
        console.log(`[CAMPAIGN FETCH] Fetching campaigns from: ${endpoint}`);
        console.log(`[CAMPAIGN FETCH] Using date_preset: ${datePreset}`);
        
        // Log the API request URL (without token for security)
        const logUrl = `${this.BASE_URL}/${this.API_VERSION}${endpoint}?fields=${fields}&date_preset=${datePreset}`;
        CampaignFetchLogger.logRequest(adAccountId, logUrl);
        
        const response = await fetch(
          fullUrl,
          {
            method: 'GET',  // Explicitly set to GET for clarity
            headers: {
              'Content-Type': 'application/json',
            }
          }
        );

        // Store response headers for rate limit checking
        this.lastResponseHeaders = {};
        response.headers.forEach((value, key) => {
          this.lastResponseHeaders[key] = value;
        });

        // Log the full response for debugging
        await CampaignFetchLogger.logResponse(response, adAccountId, fields);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`[CAMPAIGN FETCH] Error response: ${response.status} ${response.statusText}`, errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        
        if (!data || !data.data) {
          console.error('[CAMPAIGN FETCH] Invalid response format:', data);
          throw new Error('Invalid response format from Meta API');
        }

        console.log(`[CAMPAIGN FETCH] Received ${data.data.length} campaigns with insights data`);
        
        // Process campaign data including insights
        const campaigns = data.data.map((campaign: any) => {
          // Extract insights data if available
          const insightsData = campaign.insights?.data?.[0] || {};
          
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
