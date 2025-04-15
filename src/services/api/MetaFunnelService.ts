
import { MetaBatchService } from './batch/MetaBatchService';
import { MetaFunnelBatchService } from './funnel/MetaFunnelBatchService';
import { FunnelData } from './types/funnelTypes';
import { InsightsThrottling } from './insights/throttling';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

export class MetaFunnelService {
  public static isMockMode(): boolean {
    return false; // Mock mode is disabled
  }

  public static async fetchFunnelData(token: string, adAccountId: string): Promise<FunnelData> {
    try {
      // Ensure proper account ID format
      const formattedAccountId = adAccountId.startsWith('act_') ? adAccountId : `act_${adAccountId}`;
      
      InsightsThrottling.checkThrottling(formattedAccountId);
      
      console.log('[META FUNNEL] Fetching funnel data via batch request for account:', formattedAccountId);
      
      // Build batch requests with the properly formatted account ID
      const batchRequests = MetaFunnelBatchService.buildBatchRequests(formattedAccountId);
      
      // Execute batch request with token
      const batchResponses = await MetaBatchService.executeBatch(token, batchRequests);
      
      // Store raw response for debugging
      try {
        if (batchResponses && batchResponses.length > 0) {
          const firstResponse = batchResponses[0];
          localStorage.setItem('raw_campaign_response', JSON.stringify(firstResponse));
          console.log('[META FUNNEL] Raw response stored for debugging');
        }
      } catch (e) {
        console.error('[META FUNNEL] Error storing raw response:', e);
      }
      
      // Parse responses
      const [campaignsResponse, adsetsResponse, adsResponse] = batchResponses;
      
      if (!campaignsResponse || !campaignsResponse.body) {
        console.error('[META FUNNEL] Empty campaigns response:', campaignsResponse);
        throw new Error('Empty campaign response from Meta API');
      }
      
      console.log('[META FUNNEL] Campaign response body:', campaignsResponse.body.substring(0, 500));
      
      const campaigns = MetaBatchService.parseBatchResponse(campaignsResponse)?.data || [];
      const adsets = MetaBatchService.parseBatchResponse(adsetsResponse)?.data || [];
      const ads = MetaBatchService.parseBatchResponse(adsResponse)?.data || [];
      
      console.log(`[META FUNNEL] Batch response parsed: ${campaigns.length} campaigns, ${adsets.length} adsets, ${ads.length} ads`);
      
      if (campaigns.length === 0) {
        console.warn('[META FUNNEL] No campaigns returned from API');
      } else {
        console.log('[META FUNNEL] First campaign sample:', campaigns[0]);
      }
      
      return {
        campaigns: campaigns.map(campaign => ({
          ...campaign,
          spend: campaign.insights?.data?.[0]?.spend ? '$' + parseFloat(campaign.insights.data[0].spend).toFixed(2) : '$0.00',
          results: '0',
          budget: campaign.daily_budget ? 
            '$' + (parseInt(campaign.daily_budget) / 100).toFixed(2) + '/day' : 
            (campaign.lifetime_budget ? 
              '$' + (parseInt(campaign.lifetime_budget) / 100).toFixed(2) + ' total' : 
              '-'),
          insights: {
            ...(campaign.insights?.data?.[0] || {}),
            cpa: '-',
            roas: '-'
          }
        })),
        adsets,
        ads
      };
    } catch (error) {
      console.error('[META FUNNEL] Error fetching funnel data:', error);
      
      // Store error for debugging
      try {
        localStorage.setItem('raw_campaign_error_response', JSON.stringify(error));
      } catch (e) {
        console.error('[META FUNNEL] Error storing error data:', e);
      }
      
      throw error;
    }
  }
}
