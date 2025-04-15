
import { MetaBatchService } from './batch/MetaBatchService';
import { MetaFunnelBatchService } from './funnel/MetaFunnelBatchService';
import { FunnelData } from './types/funnelTypes';
import { InsightsThrottling } from './insights/throttling';
import { BaseApiService } from './BaseApiService';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

// Define API constants to match BaseApiService values
const API_BASE_URL = 'https://graph.facebook.com';
const API_VERSION = 'v17.0';

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
            
            // Store the complete raw batch response for advanced debugging
            try {
              localStorage.setItem('complete_batch_response', JSON.stringify({
                responses: batchResponses,
                timestamp: new Date().toISOString()
              }));
            } catch (e) {
              console.error('[META FUNNEL] Error storing complete batch response:', e);
            }
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
          
          // Log any batch error for debugging
          if (campaignsResponse && campaignsResponse.code && campaignsResponse.code !== 200) {
            console.error('[META FUNNEL] Batch request error:', {
              code: campaignsResponse.code,
              body: campaignsResponse.body
            });
            
            try {
              localStorage.setItem('batch_error_response', JSON.stringify({
                code: campaignsResponse.code,
                body: campaignsResponse.body,
                timestamp: new Date().toISOString()
              }));
            } catch (e) {
              console.error('[META FUNNEL] Error storing batch error:', e);
            }
          }
        }
      } catch (batchError) {
        console.error('[META FUNNEL] Batch request failed:', batchError);
        console.log('[META FUNNEL] Falling back to direct API call');
        
        // Store batch error for debugging
        try {
          localStorage.setItem('batch_error_details', JSON.stringify({
            message: batchError?.message || String(batchError),
            stack: batchError?.stack,
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.error('[META FUNNEL] Error storing batch error details:', e);
        }
      }
      
      // If batch fails or returns no campaigns, try direct API call
      console.log('[META FUNNEL] Attempting direct API call to fetch campaigns');
      const fields = 'id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}';
      const url = `${API_BASE_URL}/${API_VERSION}/${formattedAccountId}/campaigns?fields=${fields}&access_token=${token}`;
      
      console.log('[META FUNNEL] Direct API URL:', url.replace(token, 'REDACTED'));
      
      // Enhanced direct request with full error logging
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        });
        
        // Store full response headers for debugging
        const responseHeaders = {};
        response.headers.forEach((value, key) => {
          responseHeaders[key] = value;
        });
        
        console.log('[META FUNNEL] Response status:', response.status, response.statusText);
        console.log('[META FUNNEL] Response headers:', responseHeaders);
        
        // Store response metadata for debugging
        try {
          localStorage.setItem('campaign_response_metadata', JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            headers: responseHeaders,
            url: url.replace(token, 'REDACTED'),
            timestamp: new Date().toISOString()
          }));
        } catch (e) {
          console.error('[META FUNNEL] Error storing response metadata:', e);
        }
        
        // Clone the response to get text for debugging and JSON for processing
        const responseClone = response.clone();
        
        // Get response text for debugging regardless of status
        const responseText = await responseClone.text();
        try {
          localStorage.setItem('raw_campaign_response_text', responseText);
          console.log('[META FUNNEL] Raw response text stored for debugging');
        } catch (e) {
          console.error('[META FUNNEL] Error storing raw response text:', e);
        }
        
        if (!response.ok) {
          // Parse error details
          let errorData;
          try {
            errorData = JSON.parse(responseText);
          } catch (parseError) {
            console.error('[META FUNNEL] Error parsing error response:', parseError);
            errorData = { parseError: true, text: responseText };
          }
          
          console.error('[META FUNNEL] Direct API error:', errorData);
          
          // Store detailed error for debugging
          try {
            localStorage.setItem('raw_campaign_error_response', JSON.stringify({
              errorData,
              status: response.status,
              statusText: response.statusText,
              headers: responseHeaders,
              timestamp: new Date().toISOString()
            }));
          } catch (e) {
            console.error('[META FUNNEL] Error storing detailed error:', e);
          }
          
          // Enhanced error with more details
          throw {
            message: errorData?.error?.message || `HTTP error ${response.status}: ${response.statusText}`,
            status: response.status,
            errorData: errorData,
            headers: responseHeaders
          };
        }
        
        // Try to parse the response as JSON
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (parseError) {
          console.error('[META FUNNEL] Error parsing response JSON:', parseError);
          
          // Store parse error details
          localStorage.setItem('campaign_parse_error', JSON.stringify({
            error: String(parseError),
            responseText: responseText.substring(0, 1000),
            timestamp: new Date().toISOString()
          }));
          
          throw new Error('Invalid JSON response from Meta API');
        }
        
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
        const adsetsUrl = `${API_BASE_URL}/${API_VERSION}/${formattedAccountId}/adsets?fields=id,name,campaign_id,status,effective_status&access_token=${token}`;
        const adsUrl = `${API_BASE_URL}/${API_VERSION}/${formattedAccountId}/ads?fields=id,name,adset_id,status,effective_status&access_token=${token}`;
        
        const [adsetsResponse, adsResponse] = await Promise.all([
          fetch(adsetsUrl).then(res => res.json()),
          fetch(adsUrl).then(res => res.json())
        ]);
        
        const adsets = adsetsResponse?.data || [];
        const ads = adsResponse?.data || [];
        
        return processFunnelData(data.data, adsets, ads);
      } catch (directApiError) {
        console.error('[META FUNNEL] Direct API request failed:', directApiError);
        
        // Enrich error with detailed debugging info
        const enhancedError = {
          ...directApiError,
          adAccountId: formattedAccountId,
          timestamp: new Date().toISOString(),
          requestUrl: url.replace(token, 'REDACTED')
        };
        
        throw enhancedError;
      }
    } catch (error) {
      console.error('[META FUNNEL] Error fetching funnel data:', error);
      
      // Enhanced error storage with more detailed information
      try {
        const errorToStore = {
          message: error?.message || String(error),
          status: error?.status,
          errorData: error?.errorData,
          headers: error?.headers,
          adAccountId: adAccountId,
          timestamp: new Date().toISOString(),
          stack: error?.stack
        };
        
        localStorage.setItem('raw_campaign_error_response', JSON.stringify(errorToStore));
        console.error('[META FUNNEL] Detailed error stored for debugging:', errorToStore);
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
