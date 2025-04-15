
import { MetaBatchService } from './batch/MetaBatchService';
import { MetaFunnelBatchService } from './funnel/MetaFunnelBatchService';
import { FunnelData } from './types/funnelTypes';
import { InsightsThrottling } from './insights/throttling';
import { BaseApiService } from './BaseApiService';
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
      
      console.log('[META FUNNEL] Fetching funnel data for account:', formattedAccountId);
      
      // First try with batch request
      try {
        console.log('[META FUNNEL] Attempting batch request');
        // Build batch requests with the properly formatted account ID
        const batchRequests = MetaFunnelBatchService.buildBatchRequests(formattedAccountId);
        
        // Execute batch request with token
        const batchResponses = await MetaBatchService.executeBatch(token, batchRequests);
        
        // Parse responses
        const [campaignsResponse, adsetsResponse, adsResponse] = batchResponses;
        
        if (campaignsResponse && campaignsResponse.body) {
          try {
            localStorage.setItem('raw_campaign_response', campaignsResponse.body);
            console.log('[META FUNNEL] Raw response stored for debugging');
          } catch (e) {
            console.error('[META FUNNEL] Error storing raw response:', e);
          }
          
          const campaigns = MetaBatchService.parseBatchResponse(campaignsResponse)?.data || [];
          const adsets = MetaBatchService.parseBatchResponse(adsetsResponse)?.data || [];
          const ads = MetaBatchService.parseBatchResponse(adsResponse)?.data || [];
          
          console.log(`[META FUNNEL] Batch response parsed: ${campaigns.length} campaigns, ${adsets.length} adsets, ${ads.length} ads`);
          
          if (campaigns.length > 0) {
            return processFunnelData(campaigns, adsets, ads);
          } else {
            console.warn('[META FUNNEL] No campaigns in batch response, trying direct API call');
          }
        } else {
          console.warn('[META FUNNEL] Invalid batch response, trying direct API call');
        }
      } catch (batchError) {
        console.error('[META FUNNEL] Batch request failed:', batchError);
        console.log('[META FUNNEL] Falling back to direct API call');
        // Continue to direct API call
      }
      
      // If batch fails or returns no campaigns, try direct API call
      console.log('[META FUNNEL] Attempting direct API call to fetch campaigns');
      const fields = 'id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}';
      const url = `${BaseApiService.BASE_URL}/${BaseApiService.API_VERSION}/${formattedAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      
      console.log('[META FUNNEL] Direct API URL:', url.replace(token, 'REDACTED'));
      
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('[META FUNNEL] Direct API error:', errorData);
        throw new Error(errorData?.error?.message || `HTTP error ${response.status}`);
      }
      
      const data = await response.json();
      
      // Store raw response for debugging
      try {
        localStorage.setItem('raw_campaign_response', JSON.stringify(data));
        console.log('[META FUNNEL] Raw direct response stored for debugging');
      } catch (e) {
        console.error('[META FUNNEL] Error storing raw response:', e);
      }
      
      if (!data || !data.data) {
        console.error('[META FUNNEL] Invalid response format from direct API call:', data);
        throw new Error('Invalid response format from Meta API');
      }
      
      console.log(`[META FUNNEL] Direct API returned ${data.data.length} campaigns`);
      
      // Fetch adsets and ads directly
      const adsetsUrl = `${BaseApiService.BASE_URL}/${BaseApiService.API_VERSION}/${formattedAccountId}/adsets?fields=id,name,campaign_id,status,effective_status&access_token=${token}`;
      const adsUrl = `${BaseApiService.BASE_URL}/${BaseApiService.API_VERSION}/${formattedAccountId}/ads?fields=id,name,adset_id,status,effective_status&access_token=${token}`;
      
      const [adsetsResponse, adsResponse] = await Promise.all([
        fetch(adsetsUrl).then(res => res.json()),
        fetch(adsUrl).then(res => res.json())
      ]);
      
      const adsets = adsetsResponse?.data || [];
      const ads = adsResponse?.data || [];
      
      return processFunnelData(data.data, adsets, ads);
      
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

function processFunnelData(campaigns: any[], adsets: any[], ads: any[]): FunnelData {
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
}
