
import { toast } from '@/hooks/use-toast';
import { MetaCampaign, CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { processInsightsData } from './insights/insightsProcessor';
import { buildInsightsUrl } from './insights/insightsUrlBuilder';
import { InsightsThrottling } from '@/services/api/insights/throttling';
import { RequestQueueManager } from '@/services/api/queue/RequestQueueManager';

// Rate limit configuration
const MIN_REQUEST_INTERVAL = 300; // milliseconds between requests
const BATCH_SIZE = 3; // Reduced from 5 to 3 campaigns per batch
const BATCH_INTERVAL = 2500; // milliseconds between batches

/**
 * Fetches detailed insights for a single campaign
 */
export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'last_28d'
): Promise<CampaignExtraStats | null> => {
  try {
    const validDatePreset = mapToValidDatePreset(datePreset);
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
    const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'default';
    InsightsThrottling.checkThrottling(selectedAdAccount);
    
    const url = buildInsightsUrl(campaignId, token, validDatePreset);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    InsightsThrottling.monitorResponseHeaders(response);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, errorData);
      
      InsightsThrottling.checkErrorForRateLimit(errorData);
      
      if (validDatePreset !== 'maximum') {
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=maximum for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'maximum');
      }
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.data || data.data.length === 0) {
      console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId}`);
      
      if (validDatePreset !== 'maximum') {
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=maximum for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'maximum');
      }
      return null;
    }
    
    console.log(`[INSIGHTS FETCH] Insights response for campaign ${campaignId}:`, data);
    
    const insightsData = data.data[0];
    const results = processInsightsData(insightsData);
    
    console.log(`[INSIGHTS FETCH] Successfully extracted metrics for campaign ${campaignId}:`, results);
    
    return results;
  } catch (error) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    
    InsightsThrottling.checkErrorForRateLimit(error);
    return null;
  }
};

/**
 * Queue a single campaign insights fetch with proper rate limiting
 */
const queueCampaignInsightsFetch = (
  campaign: MetaCampaign,
  token: string,
  datePreset: string
): Promise<CampaignExtraStats | null> => {
  return RequestQueueManager.addToQueue(() => {
    return fetchCampaignInsights(campaign.id, token, datePreset);
  });
};

/**
 * Enhanced version to batch fetch insights for multiple campaigns
 * with proper rate limiting and sequential processing
 */
export const fetchInsightsForCampaigns = async (
  campaigns: MetaCampaign[], 
  token: string,
  datePreset: string = 'last_28d'
): Promise<MetaCampaign[]> => {
  const validDatePreset = mapToValidDatePreset(datePreset);
  console.log(`[INSIGHTS FETCH] Starting controlled insights fetch for ${campaigns.length} campaigns with date_preset=${validDatePreset}`);
  
  const processedCampaignIds = new Map<string, boolean>();
  let successCount = 0;
  
  const campaignMap = new Map<string, MetaCampaign>();
  const campaignsWithInsights = [...campaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  // Process in smaller batches
  for (let i = 0; i < campaignsWithInsights.length; i += BATCH_SIZE) {
    const batch = campaignsWithInsights.slice(i, i + BATCH_SIZE);
    
    console.log(`[INSIGHTS FETCH] Processing batch ${Math.floor(i/BATCH_SIZE) + 1} with ${batch.length} campaigns`);
    
    try {
      const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'default';
      InsightsThrottling.checkThrottling(selectedAdAccount);
      
      // Process campaigns sequentially within each batch
      for (let j = 0; j < batch.length; j++) {
        const campaign = batch[j];
        
        if (processedCampaignIds.has(campaign.id)) {
          console.log(`[INSIGHTS FETCH] Skipping duplicate campaign ID: ${campaign.id}`);
          continue;
        }
        
        try {
          processedCampaignIds.set(campaign.id, true);
          
          // Queue the request with controlled timing
          const extraStats = await queueCampaignInsightsFetch(campaign, token, validDatePreset);
          
          if (extraStats) {
            const campaignToUpdate = campaignMap.get(campaign.id);
            if (campaignToUpdate) {
              campaignToUpdate.extraStats = extraStats;
              
              if (campaignToUpdate.insights) {
                campaignToUpdate.insights.cpa = campaignToUpdate.insights.cpa || extraStats.cpa;
                campaignToUpdate.insights.roas = campaignToUpdate.insights.roas || extraStats.roas;
                campaignToUpdate.insights.spend = campaignToUpdate.insights.spend || extraStats.spend;
              }
              
              if (!campaignToUpdate.results && extraStats.results !== '-') {
                campaignToUpdate.results = extraStats.results;
              }
              
              successCount++;
              console.log(`[INSIGHTS FETCH] Updated campaign ${campaign.id} with extra stats`);
            }
          }
          
          // Ensure minimum time between requests within a batch
          if (j < batch.length - 1) {
            await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL));
          }
        } catch (error) {
          console.error(`[INSIGHTS FETCH] Error in processing for campaign ${campaign.id}:`, error);
          InsightsThrottling.checkErrorForRateLimit(error);
        }
      }
    } catch (error) {
      console.error('[INSIGHTS FETCH] Batch processing error:', error);
      if (error instanceof Error && error.message.includes('rate limit')) {
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        continue;
      }
    }
    
    if (i + BATCH_SIZE < campaignsWithInsights.length) {
      console.log(`[INSIGHTS FETCH] Waiting ${BATCH_INTERVAL}ms before next batch`);
      await new Promise(resolve => setTimeout(resolve, BATCH_INTERVAL));
    }
  }
  
  console.log(`[INSIGHTS FETCH] Completed insights fetch for ${successCount}/${campaigns.length} campaigns`);
  
  if (successCount > 0) {
    toast({
      title: "Campaign Insights Loaded",
      description: `Successfully loaded detailed metrics for ${successCount} campaigns`,
      variant: "default",
    });
  }
  
  return campaignsWithInsights;
};
