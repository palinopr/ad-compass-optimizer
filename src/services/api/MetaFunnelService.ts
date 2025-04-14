
import { MetaBatchService, BatchRequest } from './batch/MetaBatchService';
import { MetaCampaign } from './MetaCampaignService';
import { InsightsThrottling } from './insights/throttling';

interface AdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
}

interface Ad {
  id: string;
  name: string;
  adset_id: string;
  status: string;
}

export interface FunnelData {
  campaigns: MetaCampaign[];
  adsets: AdSet[];
  ads: Ad[];
}

export class MetaFunnelService {
  private static buildBatchRequests(adAccountId: string): BatchRequest[] {
    const formattedId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
    
    return [
      {
        method: 'GET',
        relative_url: `${formattedId}/campaigns?fields=id,name,objective,status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget`,
        name: 'campaigns'
      },
      {
        method: 'GET',
        relative_url: `${formattedId}/adsets?fields=id,name,campaign_id,status`,
        name: 'adsets'
      },
      {
        method: 'GET',
        relative_url: `${formattedId}/ads?fields=id,name,adset_id,status`,
        name: 'ads'
      }
    ];
  }

  public static async fetchFunnelData(token: string, adAccountId: string): Promise<FunnelData> {
    try {
      InsightsThrottling.checkThrottling(adAccountId);
      
      console.log('Fetching funnel data via batch request for account:', adAccountId);
      const batchRequests = this.buildBatchRequests(adAccountId);
      const batchResponses = await MetaBatchService.executeBatch(token, batchRequests);
      
      // Parse responses
      const [campaignsResponse, adsetsResponse, adsResponse] = batchResponses;
      
      const campaigns = MetaBatchService.parseBatchResponse(campaignsResponse)?.data || [];
      const adsets = MetaBatchService.parseBatchResponse(adsetsResponse)?.data || [];
      const ads = MetaBatchService.parseBatchResponse(adsResponse)?.data || [];
      
      console.log(`Batch response parsed: ${campaigns.length} campaigns, ${adsets.length} adsets, ${ads.length} ads`);
      
      return {
        campaigns: campaigns.map(campaign => ({
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
            roas: '-',
            impressions: '0',
            clicks: '0'
          }
        })),
        adsets,
        ads
      };
    } catch (error) {
      console.error('Error fetching funnel data:', error);
      throw error;
    }
  }
}
