
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
      
      // Map basic campaign data (without insights)
      const campaignsWithBasicInfo = campaigns.map(campaign => {
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
      });
      
      // Try to fetch insights, but don't fail the whole request if insights fetch fails
      try {
        // Now fetch insights for these campaigns if there are any
        if (campaigns.length > 0) {
          const campaignIds = campaigns.map(campaign => campaign.id).join(',');
          
          // Using a simpler insights request to avoid potential errors
          const insightsResponse = await fetch(
            `${this.BASE_URL}/${this.API_VERSION}/${formattedAccountId}/insights?level=campaign&fields=campaign_id,spend&time_range[since]=2020-01-01&time_range[until]=2030-12-31&access_token=${token}`
          );
          
          if (!insightsResponse.ok) {
            console.warn(`Insights fetch returned status ${insightsResponse.status}. Will continue with basic campaign data.`);
            // Return the campaigns without insights rather than failing
            return campaignsWithBasicInfo;
          }
          
          const insightsData = await this.processApiResponse(insightsResponse, 'fetchCampaignInsights');
          const insights = insightsData.data || [];
          
          // Map insights data to campaigns
          return campaignsWithBasicInfo.map(campaign => {
            const campaignInsights = insights.find(insight => insight.campaign_id === campaign.id);
            
            if (campaignInsights) {
              // Parse spend from insights
              const spend = campaignInsights.spend || '0';
              
              return {
                ...campaign,
                spend: '$' + parseFloat(spend).toFixed(2)
              };
            }
            
            return campaign;
          });
        }
      } catch (insightsError) {
        console.error('Error fetching campaign insights:', insightsError);
        console.log('Returning campaigns without insights data');
        // Return the campaigns without insights rather than failing
      }
      
      return campaignsWithBasicInfo;
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
