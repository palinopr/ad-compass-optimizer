
import { BaseApiService } from './BaseApiService';

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
  };
}

export class MetaCampaignService extends BaseApiService {
  /**
   * Fetch campaigns for a specific ad account
   */
  public static async fetchCampaigns(token: string, adAccountId: string): Promise<MetaCampaign[]> {
    try {
      console.log(`Fetching campaigns for ad account ${adAccountId}...`);
      this.validateToken(token, 'fetchCampaigns');
      
      if (!adAccountId) {
        throw new Error('Ad Account ID is required');
      }
      
      // Ensure ad account ID has the proper format with 'act_' prefix
      const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      // Get basic campaign data first
      const response = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/campaigns?fields=id,name,objective,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget&access_token=${token}`
      );
      
      const campaignsData = await this.processApiResponse(response, 'fetchCampaigns');
      const campaigns = campaignsData.data || [];
      
      if (campaigns.length === 0) {
        console.log('No campaigns found for this ad account');
        return [];
      }
      
      console.log(`Found ${campaigns.length} campaigns`);
      
      // Now fetch insights for these campaigns
      const campaignIds = campaigns.map(campaign => campaign.id).join(',');
      const insightsResponse = await fetch(
        `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/insights?level=campaign&fields=campaign_id,spend,actions,cost_per_action_type&time_range[since]=2020-01-01&time_range[until]=2030-12-31&filtering=[{"field":"campaign.id","operator":"IN","value":[${campaignIds}]}]&access_token=${token}`
      );
      
      const insightsData = await this.processApiResponse(insightsResponse, 'fetchCampaignInsights');
      const insights = insightsData.data || [];
      
      // Map insights data to campaigns
      const campaignsWithInsights = campaigns.map(campaign => {
        const campaignInsights = insights.find(insight => insight.campaign_id === campaign.id);
        
        let results = '0';
        let cpa = '-';
        let roas = '-';
        
        if (campaignInsights) {
          // Parse spend from insights
          const spend = campaignInsights.spend || '0';
          
          // Try to get purchase or lead actions
          const actions = campaignInsights.actions || [];
          const purchaseAction = actions.find(action => action.action_type === 'purchase' || action.action_type === 'offsite_conversion.fb_pixel_purchase');
          const leadAction = actions.find(action => action.action_type === 'lead' || action.action_type === 'leadgen.other');
          
          // Get the value for results based on purchase or lead actions
          if (purchaseAction) {
            results = purchaseAction.value.toString();
            
            // Calculate ROAS
            const purchaseValue = parseFloat(purchaseAction.value) * 50; // Assuming average order value of $50
            const spendValue = parseFloat(spend);
            if (spendValue > 0) {
              roas = (purchaseValue / spendValue).toFixed(1) + 'x';
            }
          } else if (leadAction) {
            results = leadAction.value.toString() + ' leads';
          }
          
          // Get CPA from cost_per_action_type
          const costPerActions = campaignInsights.cost_per_action_type || [];
          const purchaseCPA = costPerActions.find(item => item.action_type === 'purchase' || item.action_type === 'offsite_conversion.fb_pixel_purchase');
          const leadCPA = costPerActions.find(item => item.action_type === 'lead' || item.action_type === 'leadgen.other');
          
          if (purchaseCPA) {
            cpa = '$' + parseFloat(purchaseCPA.value).toFixed(2);
          } else if (leadCPA) {
            cpa = '$' + parseFloat(leadCPA.value).toFixed(2);
          }
          
          return {
            ...campaign,
            spend: '$' + parseFloat(spend).toFixed(2),
            results: results + (purchaseAction ? ' sales' : ''),
            budget: campaign.daily_budget ? 
              '$' + (parseInt(campaign.daily_budget) / 100).toFixed(2) + '/day' : 
              (campaign.lifetime_budget ? 
                '$' + (parseInt(campaign.lifetime_budget) / 100).toFixed(2) + ' total' : 
                '-'),
            insights: {
              cpa,
              roas
            }
          };
        } else {
          return {
            ...campaign,
            spend: '$0.00',
            results: '0',
            budget: campaign.daily_budget ? 
              '$' + (parseInt(campaign.daily_budget) / 100).toFixed(2) + '/day' : 
              (campaign.lifetime_budget ? 
                '$' + (parseInt(campaign.lifetime_budget) / 100).toFixed(2) + ' total' : 
                '-'),
            insights: {
              cpa: '-',
              roas: '-'
            }
          };
        }
      });
      
      return campaignsWithInsights;
    } catch (error) {
      console.error(`Error fetching campaigns for ad account ${adAccountId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('permission') || errorMessage.includes('403')) {
        console.error('This appears to be a permissions error. For campaign access, your token needs ads_read permission.');
      }
      
      return this.handleApiError(error, 'fetchCampaigns');
    }
  }
}

export default MetaCampaignService;
