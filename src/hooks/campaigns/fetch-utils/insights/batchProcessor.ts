
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { fetchCampaignInsights, isCampaignBlocked } from './singleCampaignFetcher';
import { requestedCampaignIds, insightsThrottlingState } from './batchConfig';
import { strictInsightsQueue } from '@/services/api/insights/throttling/queue/StrictQueueManager';
import { BATCH_CONFIG } from './batchConfig';

// Track already processed campaigns in this session to avoid duplication
const processedCampaignIds = new Set<string>();

export const fetchInsightsForCampaigns = async (
  campaigns: MetaCampaign[], 
  token: string,
  datePreset: string = 'last_30d'
): Promise<MetaCampaign[]> => {
  if (!campaigns || campaigns.length === 0) {
    console.log('[INSIGHTS BATCH] No campaigns to process');
    return campaigns;
  }

  // Check if global throttling is active
  if (insightsThrottlingState.isActiveThrottling()) {
    console.log('[INSIGHTS BATCH] Skipping batch processing - global throttling is active');
    return campaigns;
  }

  console.log(`[INSIGHTS BATCH] Processing insights for ${campaigns.length} campaigns`);

  // First pass: Filter out campaigns that shouldn't be processed
  const eligibleCampaigns = campaigns.filter(campaign => {
    // Skip if no ID
    if (!campaign.id) {
      console.log(`🚫 Skipping insights for campaign with no ID`);
      return false;
    }
    
    // Skip if already processed in this session
    if (processedCampaignIds.has(campaign.id)) {
      console.log(`🔄 Skipping already processed campaign ${campaign.id}`);
      return false;
    }

    // Skip inactive campaigns
    if (campaign.status !== 'ACTIVE' && campaign.effective_status !== 'ACTIVE') {
      console.log(`🚫 Skipping insights for inactive campaign ${campaign.id}`);
      return false;
    }

    // Skip campaigns that are already blocked
    if (isCampaignBlocked(campaign.id)) {
      console.log(`🚫 Skipping insights for blocked campaign ${campaign.id}`);
      return false;
    }
    
    // Skip campaigns we've already requested in this session
    if (requestedCampaignIds.has(campaign.id)) {
      console.log(`🔄 Skipping duplicate request for campaign ${campaign.id}`);
      return false;
    }
    
    // Campaign is eligible for insights
    return true;
  });

  console.log(`[INSIGHTS BATCH] Found ${eligibleCampaigns.length} eligible campaigns out of ${campaigns.length}`);
  
  // Mark all eligible campaigns as requested to prevent duplicate requests
  eligibleCampaigns.forEach(campaign => {
    requestedCampaignIds.add(campaign.id);
    processedCampaignIds.add(campaign.id);
  });

  // Early return if no eligible campaigns
  if (eligibleCampaigns.length === 0) {
    console.log('[INSIGHTS BATCH] No eligible campaigns to process');
    return campaigns;
  }

  // Process campaigns sequentially through the strict queue
  console.log(`[INSIGHTS BATCH] Processing ${eligibleCampaigns.length} campaigns sequentially`);
  
  // CRITICAL: Use for...of with await to ensure sequential processing
  for (const campaign of eligibleCampaigns) {
    try {
      // Queue the request through our strict queue manager
      await strictInsightsQueue.enqueueRequest(
        async () => {
          try {
            const insightsData = await fetchCampaignInsights(campaign.id, token, datePreset);
            if (insightsData) {
              // Create a proper insights object with the required properties
              campaign.insights = {
                impressions: insightsData.impressions || '0',
                clicks: insightsData.clicks || '0',
                spend: insightsData.spend || '0',
                cpa: insightsData.cpa,
                roas: insightsData.roas,
                cost_per_action_type: [],
                actions: []
              };
              campaign.insightsStatus = 'ok';
              return insightsData;
            } else {
              campaign.insightsStatus = 'failed';
              campaign.insights = null;
              return null;
            }
          } catch (error) {
            console.error(`[INSIGHTS BATCH] Error fetching insights for campaign ${campaign.id}:`, error);
            campaign.insightsStatus = 'failed';
            campaign.insights = null;
            return null;
          }
        },
        `batch-campaign-${campaign.id}`
      );
      
      // Ensure we don't flood the queue system
      await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.MIN_REQUEST_INTERVAL));
    } catch (error) {
      console.error(`[INSIGHTS BATCH] Error queuing insights for campaign ${campaign.id}:`, error);
      campaign.insightsStatus = 'failed';
      campaign.insights = null;
    }
  }

  console.log(`[INSIGHTS BATCH] Finished processing ${eligibleCampaigns.length} campaigns`);
  
  // Return the original campaigns array with updated insights
  return campaigns;
};
