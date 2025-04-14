
import { MetaBatchService } from './batch/MetaBatchService';
import { MetaFunnelBatchService } from './funnel/MetaFunnelBatchService';
import { FunnelData } from './types/funnelTypes';
import { InsightsThrottling } from './insights/throttling';

export class MetaFunnelService {
  public static async fetchFunnelData(token: string, adAccountId: string): Promise<FunnelData> {
    try {
      InsightsThrottling.checkThrottling(adAccountId);
      
      console.log('Fetching funnel data via batch request for account:', adAccountId);
      const batchRequests = MetaFunnelBatchService.buildBatchRequests(adAccountId);
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
