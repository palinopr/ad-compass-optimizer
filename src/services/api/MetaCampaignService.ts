
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
      
      // Validate ad account ID format
      if (!/^act_\d+$/.test(adAccountId)) {
        console.error(`[CAMPAIGN FETCH] Invalid ad account ID format: ${adAccountId}`);
        throw new Error(`Invalid ad account ID format: ${adAccountId}`);
      }

      // Ensure the ad account ID has the proper format, removing 'act_' prefix if present
      const cleanAccountId = adAccountId.replace(/^act_/, '');
      
      // Check if we should throttle the request
      CampaignThrottling.checkThrottling(adAccountId);

      // Build the proper GET URL with fields including insights
      const fields = 'id,name,status,daily_budget,lifetime_budget,objective,created_time,updated_time,start_time,end_time,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}';
      const url = `${this.BASE_URL}/${this.API_VERSION}/act_${cleanAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      
      console.log(`[CAMPAIGN FETCH] Request URL: ${url.replace(token, 'REDACTED')}`);
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });
      
      // Store response headers for rate limit analysis
      this.lastResponseHeaders = {};
      response.headers.forEach((value, key) => {
        this.lastResponseHeaders[key] = value;
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('[GRAPH API ERROR] Response:', {
          status: response.status,
          data: errorData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        const error = errorData?.error || {};
        console.error('[GRAPH API ERROR] Details:', {
          message: error.message || 'Unknown error',
          type: error.type || 'Unknown type',
          code: error.code || 'Unknown code',
          subcode: error.error_subcode
        });
        
        throw {
          message: error.message || `HTTP error! status: ${response.status}`,
          code: error.code,
          type: error.type,
          subcode: error.error_subcode,
          status: response.status,
          response: {
            data: errorData,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries())
          }
        };
      }

      const data = await response.json();
      
      // Log raw response for debugging
      console.log('[CAMPAIGN FETCH] Raw response:', JSON.stringify(data).substring(0, 500) + '...');
      
      if (!data || !data.data) {
        console.error('[CAMPAIGN FETCH] Invalid response format:', data);
        throw new Error('Invalid response format from Meta API');
      }

      console.log(`[CAMPAIGN FETCH] Successfully received ${data.data.length} campaigns`);
      
      // Handle pagination if needed
      let allCampaigns = [...data.data];
      
      // Check if there's a next page
      if (data.paging && data.paging.next) {
        console.log('[CAMPAIGN FETCH] Pagination detected, fetching more pages');
        try {
          const nextPageCampaigns = await this.fetchPaginatedCampaigns(data.paging.next);
          allCampaigns = [...allCampaigns, ...nextPageCampaigns];
        } catch (paginationError) {
          console.error('[CAMPAIGN FETCH] Error fetching additional pages:', paginationError);
          // Continue with what we have
        }
      }
      
      return this.processCampaigns(allCampaigns);
    } catch (error: any) {
      console.error('[GRAPH API ERROR]:', error.response?.data || error);
      throw error;
    }
  }
  
  // Helper method to handle pagination
  private static async fetchPaginatedCampaigns(nextPageUrl: string): Promise<any[]> {
    try {
      // Remove access token from URL for logging
      console.log(`[CAMPAIGN FETCH] Fetching next page: ${nextPageUrl.replace(/access_token=([^&]+)/, 'access_token=REDACTED')}`);
      
      const response = await fetch(nextPageUrl);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        throw new Error('Invalid pagination response format');
      }
      
      let campaigns = [...data.data];
      
      // Check if there's another page
      if (data.paging && data.paging.next) {
        const moreCampaigns = await this.fetchPaginatedCampaigns(data.paging.next);
        campaigns = [...campaigns, ...moreCampaigns];
      }
      
      return campaigns;
    } catch (error) {
      console.error('[CAMPAIGN FETCH] Pagination error:', error);
      throw error;
    }
  }

  private static processCampaigns(campaigns: any[]): MetaCampaign[] {
    return campaigns.map((campaign: any) => {
      let budget = '-';
      if (campaign.daily_budget) {
        budget = `$${(parseInt(campaign.daily_budget) / 100).toFixed(2)}/day`;
      } else if (campaign.lifetime_budget) {
        budget = `$${(parseInt(campaign.lifetime_budget) / 100).toFixed(2)} total`;
      }
      
      // Default values for metrics to ensure UI always has values to display
      let results = '0';
      let spend = '$0.00';
      let impressions = '0';
      let clicks = '0';
      let cpa = '-';
      
      // Process insights data if available, but don't block if missing
      if (campaign.insights && campaign.insights.data && campaign.insights.data.length > 0) {
        const insightData = campaign.insights.data[0];
        
        // Format impressions with commas
        if (insightData.impressions) {
          const impressionsVal = parseInt(insightData.impressions);
          impressions = impressionsVal.toLocaleString();
        }
        
        // Format clicks with commas
        if (insightData.clicks) {
          const clicksVal = parseInt(insightData.clicks);
          clicks = clicksVal.toLocaleString();
        }
        
        // Format spend as currency
        if (insightData.spend) {
          const spendVal = parseFloat(insightData.spend);
          spend = `$${spendVal.toFixed(2)}`;
        }
        
        // Calculate CPA
        const purchaseCpa = insightData.cost_per_action_type?.find(
          (item: any) => item.action_type === 'purchase'
        );
        if (purchaseCpa) {
          cpa = `$${parseFloat(purchaseCpa.value).toFixed(2)}`;
        }
        
        // Calculate results (purchases)
        const purchaseAction = insightData.actions?.find(
          (action: any) => action.action_type === 'purchase'
        );
        if (purchaseAction) {
          results = purchaseAction.value;
        }
      }
      
      // Always ensure insights object exists with default values
      const insights = {
        impressions: impressions || '0',
        clicks: clicks || '0',
        spend: spend || '$0.00',
        cpa: cpa || '-',
        actions: campaign.insights?.data?.[0]?.actions || [],
        cost_per_action_type: campaign.insights?.data?.[0]?.cost_per_action_type || []
      };
      
      return {
        ...campaign,
        budget,
        results,
        spend,
        insights
      };
    });
  }
}
