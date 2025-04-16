
import { toast } from '@/hooks/use-toast';
import { MetaCampaign, CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { mapToValidDatePreset, isValidMetaDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';
import { processInsightsData } from './insights/insightsProcessor';
import { buildInsightsUrl } from './insights/insightsUrlBuilder';
import { InsightsThrottling } from '@/services/api/insights/throttling';
import { RequestQueueManager } from '@/services/api/queue/RequestQueueManager';

// Rate limit configuration - stricter limits
const MIN_REQUEST_INTERVAL = 300; // milliseconds between requests, exact 300ms as requested
const BATCH_SIZE = 2; // Reduced from 3 to 2 campaigns per batch to be more conservative
const BATCH_INTERVAL = 3000; // Increased from 2500ms to 3000ms between batches

// Additional tracking for duplicate request prevention
const recentRequests = new Map<string, number>();

/**
 * Validate date_preset before sending request
 */
const validateDatePreset = (datePreset: string): string => {
  // First ensure we have a valid preset format
  const validatedPreset = mapToValidDatePreset(datePreset);
  
  if (!isValidMetaDatePreset(validatedPreset)) {
    console.warn(`[INSIGHTS FETCH] Invalid date_preset "${datePreset}" detected, defaulting to last_28d`);
    return 'last_28d';
  }
  
  return validatedPreset;
};

/**
 * Fetches detailed insights for a single campaign
 */
export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'last_28d'
): Promise<CampaignExtraStats | null> => {
  try {
    const validDatePreset = validateDatePreset(datePreset);
    
    // Check for recent duplicate requests to the same campaign with same preset
    const requestKey = `${campaignId}-${validDatePreset}`;
    const now = Date.now();
    const lastRequestTime = recentRequests.get(requestKey);
    
    if (lastRequestTime && (now - lastRequestTime) < 60000) { // 60 second duplicate prevention
      console.log(`[INSIGHTS FETCH] Duplicate request for campaign ${campaignId} prevented`);
      return null;
    }
    
    // Log the validated request
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
    // Record this request
    recentRequests.set(requestKey, now);
    
    // Limit the map size to avoid memory leaks
    if (recentRequests.size > 100) {
      const oldestKey = [...recentRequests.keys()][0];
      recentRequests.delete(oldestKey);
    }
    
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
      
      // Check and log specific error types for better debugging
      if (errorData.error && errorData.error.code) {
        console.error(`[INSIGHTS FETCH] Error code: ${errorData.error.code}, Message: ${errorData.error.message}`);
        
        // Handle invalid parameter errors specifically
        if (errorData.error.code === 100 && errorData.error.message.includes('date_preset')) {
          console.error(`[INSIGHTS FETCH] Invalid date_preset parameter detected`);
          
          // If we're already using a fallback, don't retry
          if (validDatePreset === 'last_28d' || validDatePreset === 'maximum') {
            return null;
          }
          
          // Try with standard last_28d preset instead
          console.log(`[INSIGHTS FETCH] Retrying with date_preset=last_28d for campaign ${campaignId}`);
          return fetchCampaignInsights(campaignId, token, 'last_28d');
        }
      }
      
      InsightsThrottling.checkErrorForRateLimit(errorData);
      
      if (validDatePreset !== 'maximum' && validDatePreset !== 'last_28d') {
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=last_28d for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'last_28d');
      }
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.data || data.data.length === 0) {
      console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId}`);
      
      if (validDatePreset !== 'maximum' && validDatePreset !== 'last_28d') {
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=last_28d for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'last_28d');
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
  // Always validate the date preset before proceeding
  const validDatePreset = validateDatePreset(datePreset);
  console.log(`[INSIGHTS FETCH] Starting strictly controlled insights fetch for ${campaigns.length} campaigns with date_preset=${validDatePreset}`);
  
  // Set the request interval to exactly 300ms as requested
  RequestQueueManager.setRequestInterval(300);
  
  const processedCampaignIds = new Map<string, boolean>();
  let successCount = 0;
  
  const campaignMap = new Map<string, MetaCampaign>();
  const campaignsWithInsights = [...campaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  // Process in smaller batches with stricter pacing
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
          
          // Force minimum time between requests within a batch - exact 300ms as requested
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
