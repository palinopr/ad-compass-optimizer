
import { BaseApiService } from './BaseApiService';
import { CampaignThrottling } from './campaign/throttling';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  lifetime_budget?: string;
  budget?: string; // Derived field
  spend?: string; // Derived field
  results?: string; // Derived field
  cost_per_result?: string;
  created_time?: string;
  updated_time?: string;
  start_time?: string;
  end_time?: string;
  objective?: string;
  insights?: {
    impressions: string;
    clicks: string;
    spend: string;
    cpa?: string; // Derived field
    roas?: string; // Derived field
    cost_per_action_type: Array<{
      action_type: string;
      value: string;
    }>;
    actions: Array<{
      action_type: string;
      value: string;
    }>;
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
      
      if (!/^act_\d+$/.test(adAccountId)) {
        console.error(`[CAMPAIGN FETCH] Invalid ad account ID format: ${adAccountId}`);
        throw new Error(`Invalid ad account ID format: ${adAccountId}`);
      }

      const cleanAccountId = adAccountId.replace(/^act_/, '');
      CampaignThrottling.checkThrottling(adAccountId);

      // Using proper GET request format with fields parameter
      const fields = 'name,status,daily_budget,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}';
      const url = `${this.BASE_URL}/${this.API_VERSION}/act_${cleanAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      console.log(`[CAMPAIGN FETCH] Fetching from: ${url.replace(token, 'REDACTED')}`);
      
      const response = await fetch(url);
      this.lastResponseHeaders = {};
      response.headers.forEach((value, key) => {
        this.lastResponseHeaders[key] = value;
      });

      // Store response headers for debugging
      try {
        localStorage.setItem('last_campaign_fetch_headers', JSON.stringify(this.lastResponseHeaders));
      } catch (e) {
        console.error('[CAMPAIGN FETCH] Failed to store headers:', e);
      }

      await CampaignFetchLogger.logResponse(response.clone(), adAccountId, fields);

      if (!response.ok) {
        const errorText = await response.text();
        let errorData;
        
        try {
          errorData = JSON.parse(errorText);
        } catch (e) {
          console.error('[CAMPAIGN FETCH] Failed to parse error response:', e);
          errorData = { error: { message: 'Failed to parse error response', code: 'PARSE_ERROR' }};
        }
        
        console.error('[CAMPAIGN FETCH] Error response:', {
          status: response.status,
          errorText: errorText.substring(0, 500),
          errorData
        });
        
        const error = errorData?.error || {};
        
        // Enhanced error logging
        console.error('[CAMPAIGN FETCH] Error response details:', {
          status: response.status,
          code: error.code,
          type: error.type,
          message: error.message,
          subcode: error.error_subcode,
          fbTraceId: error.fbtrace_id,
          rawResponse: errorText.substring(0, 500)
        });
        
        throw {
          message: error.message || `HTTP error! status: ${response.status}`,
          code: error.code,
          type: error.type,
          subcode: error.error_subcode,
          status: response.status,
          rawResponse: errorText
        };
      }

      const data = await response.json();
      
      if (!data || !data.data) {
        console.error('[CAMPAIGN FETCH] Invalid response format:', data);
        throw new Error('Invalid response format from Meta API');
      }

      console.log(`[CAMPAIGN FETCH] Successfully received ${data.data.length} campaigns`);
      
      // Process campaigns to include derived fields
      const campaigns = data.data.map((campaign: any) => {
        let budget = '-';
        if (campaign.daily_budget) {
          budget = `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}/day`;
        } else if (campaign.lifetime_budget) {
          budget = `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)} total`;
        }
        
        let results = '0';
        let spend = campaign.insights?.spend || '$0.00';
        
        if (campaign.insights?.data?.[0]) {
          const insightData = campaign.insights.data[0];
          
          // Calculate CPA
          let cpa = '-';
          const purchaseCpa = insightData.cost_per_action_type?.find(
            (item: any) => item.action_type === 'purchase'
          );
          if (purchaseCpa) {
            cpa = purchaseCpa.value;
          }
          
          // Calculate results (purchases)
          const purchaseAction = insightData.actions?.find(
            (action: any) => action.action_type === 'purchase'
          );
          if (purchaseAction) {
            results = purchaseAction.value;
          }
          
          campaign.insights = {
            ...insightData,
            cpa,
            spend: insightData.spend || '$0.00'
          };
        }
        
        return {
          ...campaign,
          budget,
          results,
          spend
        };
      });
      
      return campaigns;
    } catch (error: any) {
      console.error('[CAMPAIGN FETCH] Failed:', error);
      throw error;
    }
  }
}
