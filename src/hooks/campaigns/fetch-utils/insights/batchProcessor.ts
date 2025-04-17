
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';
import { fetchCampaignInsights, isCampaignBlocked } from './singleCampaignFetcher';
import { InsightsRequestThrottler } from '@/services/api/insights/requestThrottling';
import { requestedCampaignIds } from './batchConfig';

export const fetchInsightsForCampaigns = async (
  campaigns: MetaCampaign[], 
  token: string,
  datePreset: string = 'last_30d'
): Promise<MetaCampaign[]> => {
  if (!campaigns || campaigns.length === 0) {
    console.log('[INSIGHTS BATCH] No campaigns to process');
    return campaigns;
  }

  console.log(`[INSIGHTS BATCH] Processing insights for ${campaigns.length} campaigns`);

  // First pass: Filter out campaigns that shouldn't be processed
  const eligibleCampaigns = campaigns.filter(campaign => {
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
  eligibleCampaigns.forEach(campaign => requestedCampaignIds.add(campaign.id));

  // Create request functions for each campaign
  const requestFunctions = eligibleCampaigns.map(campaign => {
    return async () => {
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
            // Add the required properties that were missing
            cost_per_action_type: [],
            actions: []
          };
          campaign.insightsStatus = 'ok'; // Changed from 'fetched' to 'ok'
          return insightsData;
        } else {
          campaign.insightsStatus = 'failed';
          campaign.insights = null;
          return null;
        }
      } catch (error) {
        console.error(`[INSIGHTS BATCH] Error fetching insights for campaign ${campaign.id}:`, error);
        campaign.insightsStatus = 'failed'; // Changed from 'error' to 'failed'
        campaign.insights = null;
        return null;
      }
    };
  });
  
  // Use the throttler to process requests with controlled rate limits
  if (requestFunctions.length > 0) {
    console.log(`[INSIGHTS BATCH] Submitting ${requestFunctions.length} insights requests to throttler`);
    await InsightsRequestThrottler.throttleRequests(requestFunctions, 'campaign-insights');
  }

  // Return the original campaigns array with updated insights
  return campaigns;
};
