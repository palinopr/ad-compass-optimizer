
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

      const fields = 'name,status,daily_budget,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}';
      const queryParams = new URLSearchParams({
        fields,
        access_token: token
      });
      
      const url = `${this.BASE_URL}/${this.API_VERSION}/act_${cleanAccountId}/campaigns?${queryParams}`;
      console.log(`[CAMPAIGN FETCH] Fetching from: ${url.replace(token, 'REDACTED')}`);
      
      const response = await fetch(url);
      this.lastResponseHeaders = {};
      response.headers.forEach((value, key) => {
        this.lastResponseHeaders[key] = value;
      });

      await CampaignFetchLogger.logResponse(response.clone(), adAccountId, fields);

      if (!response.ok) {
        const errorData = await response.json();
        console.error(`[CAMPAIGN FETCH] Error response:`, {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        throw new Error(errorData?.error?.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data || !data.data) {
        throw new Error('Invalid response format from Meta API');
      }

      console.log(`[CAMPAIGN FETCH] Successfully received ${data.data.length} campaigns`);
      
      // Process campaigns to include derived fields like budget, etc.
      const campaigns = data.data.map((campaign: any) => {
        // Format budget for display
        let budget = '-';
        if (campaign.daily_budget) {
          budget = `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}/day`;
        } else if (campaign.lifetime_budget) {
          budget = `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)} total`;
        }
        
        // Process insights data if available
        if (campaign.insights && campaign.insights.data && campaign.insights.data.length > 0) {
          const insightData = campaign.insights.data[0];
          
          // Calculate CPA from cost_per_action_type
          let cpa = '-';
          if (insightData.cost_per_action_type && insightData.cost_per_action_type.length) {
            const purchaseCpa = insightData.cost_per_action_type.find(
              (item: any) => item.action_type === 'purchase'
            );
            if (purchaseCpa) {
              cpa = purchaseCpa.value;
            }
          }
          
          // Calculate ROAS if available
          let roas = '-';
          if (insightData.purchase_roas && insightData.purchase_roas.length) {
            const purchaseRoas = insightData.purchase_roas.find(
              (item: any) => item.action_type === 'purchase'
            );
            if (purchaseRoas) {
              roas = purchaseRoas.value;
            }
          }
          
          // Add calculated fields to insights
          campaign.insights = {
            ...insightData,
            cpa,
            roas,
          };
        }
        
        // Calculate results
        let results = '0';
        if (campaign.insights && campaign.insights.actions) {
          const purchaseAction = campaign.insights.actions.find(
            (action: any) => action.action_type === 'purchase'
          );
          if (purchaseAction) {
            results = purchaseAction.value;
          }
        }
        
        return {
          ...campaign,
          budget,
          results,
          spend: campaign.insights ? campaign.insights.spend : '$0.00'
        };
      });
      
      return campaigns;
    } catch (error: any) {
      console.error(`[CAMPAIGN FETCH] Failed:`, error);
      throw error;
    }
  }
}
