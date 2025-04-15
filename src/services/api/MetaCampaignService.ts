
import { BaseApiService } from './BaseApiService';
import { CampaignThrottling } from './campaign/throttling';
import CampaignFetchLogger from '@/utils/debugging/campaignFetchLogger';

export interface MetaCampaign {
  id: string;
  name: string;
  status: string;
  daily_budget?: string;
  insights?: {
    impressions: string;
    clicks: string;
    spend: string;
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
      return data.data;
      
    } catch (error: any) {
      console.error(`[CAMPAIGN FETCH] Failed:`, error);
      throw error;
    }
  }
}
