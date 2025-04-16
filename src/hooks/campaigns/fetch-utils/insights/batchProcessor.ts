
import { MetaCampaign, CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { RequestQueueManager } from '@/services/api/queue/RequestQueueManager';
import { toast } from '@/hooks/use-toast';
import { fetchCampaignInsights, isCampaignBlocked, markCampaignAsBlocked } from './singleCampaignFetcher';
import { BATCH_CONFIG } from './batchConfig';

/**
 * Queue a campaign insights fetch with extra blocking checks
 */
const queueCampaignInsightsFetch = (
  campaign: MetaCampaign,
  token: string,
  datePreset: string
): Promise<CampaignExtraStats | null> => {
  // ENHANCED STRICT PRE-CHECK: Triple verification to prevent any API calls for blocked campaigns
  
  // First check in-memory status
  if (campaign.insightsStatus === 'blocked') {
    console.log(`⛔ Not queuing insights for ${campaign.id} – already blocked.`);
    return Promise.resolve(null); // Return immediately without queueing
  }
  
  // Then check if campaign is blocked using our localStorage helper
  if (isCampaignBlocked(campaign.id)) {
    console.log(`⛔ Not queuing insights for ${campaign.id} – already blocked.`);
    // Update in-memory status to match
    campaign.insightsStatus = 'blocked';
    campaign.insights = null;
    return Promise.resolve(null); // Return immediately without queueing
  }
  
  // Final check: directly check localStorage as ultimate failsafe
  try {
    const blockedCampaigns = JSON.parse(localStorage.getItem('permanently_blocked_campaigns') || '[]');
    if (blockedCampaigns.includes(campaign.id)) {
      console.log(`⛔ Not queuing insights for ${campaign.id} – already blocked (direct localStorage check).`);
      campaign.insightsStatus = 'blocked';
      campaign.insights = null;
      markCampaignAsBlocked(campaign.id); // Ensure it's properly marked in all storage mechanisms
      return Promise.resolve(null);
    }
  } catch (e) {
    // Ignore storage errors
  }
  
  // If not blocked by any of the checks, queue the request normally
  return RequestQueueManager.addToQueue(() => {
    return fetchCampaignInsights(campaign.id, token, datePreset);
  });
};

// The main function to fetch insights for a list of campaigns
export const fetchInsightsForCampaigns = async (
  campaigns: MetaCampaign[], 
  token: string,
  datePreset: string = 'last_28d'
): Promise<MetaCampaign[]> => {
  // Important: Always return the campaigns array even if insights fetch fails
  if (!campaigns || !Array.isArray(campaigns) || campaigns.length === 0) {
    console.log(`[INSIGHTS FETCH] No campaigns to process, returning empty array`);
    return campaigns || [];
  }
  
  if (!token) {
    console.error('[INSIGHTS FETCH] Missing token, cannot fetch insights');
    return campaigns;
  }
  
  const { MIN_REQUEST_INTERVAL, BATCH_SIZE, BATCH_INTERVAL } = BATCH_CONFIG;
  
  console.log(`[INSIGHTS FETCH] Starting strictly controlled insights fetch for ${campaigns.length} campaigns with date_preset=${datePreset}`);
  
  try {
    localStorage.setItem('current_date_preset', datePreset);
    localStorage.setItem('date_preset_timestamp', new Date().toISOString());
  } catch (e) {
    // Ignore storage errors
  }
  
  RequestQueueManager.setRequestInterval(500);
  
  const processedCampaignIds = new Map<string, boolean>();
  let successCount = 0;
  
  const campaignMap = new Map<string, MetaCampaign>();
  
  // ENHANCED PRE-FILTER: Triple verification to filter out all blocked campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Skip already blocked campaigns via insightsStatus
    if (campaign.insightsStatus === 'blocked') {
      console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400`);
      return false;
    }
    
    // Check if campaign is blocked using localStorage helper
    if (isCampaignBlocked(campaign.id)) {
      console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400`);
      // Update in-memory status to match
      campaign.insightsStatus = 'blocked';
      campaign.insights = null;
      return false;
    }
    
    // Final check: directly check localStorage as ultimate failsafe
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem('permanently_blocked_campaigns') || '[]');
      if (blockedCampaigns.includes(campaign.id)) {
        console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400 (direct localStorage check)`);
        campaign.insightsStatus = 'blocked';
        campaign.insights = null;
        markCampaignAsBlocked(campaign.id); // Ensure it's marked everywhere
        return false;
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    return true;
  });
  
  console.log(`[INSIGHTS FETCH] After filtering blocked campaigns: ${filteredCampaigns.length}/${campaigns.length} will be processed`);
  
  const campaignsWithInsights = [...filteredCampaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  // If there are no campaigns to process after filtering, return the original array
  if (campaignsWithInsights.length === 0) {
    console.log('[INSIGHTS FETCH] No non-blocked campaigns to process, returning original array');
    return campaigns;
  }
  
  // Process campaigns in batches
  for (let i = 0; i < campaignsWithInsights.length; i += BATCH_CONFIG.BATCH_SIZE) {
    const batch = campaignsWithInsights.slice(i, i + BATCH_CONFIG.BATCH_SIZE);
    
    console.log(`[INSIGHTS FETCH] Processing batch ${Math.floor(i/BATCH_CONFIG.BATCH_SIZE) + 1} with ${batch.length} campaigns`);
    
    // Process each campaign in the current batch
    for (let j = 0; j < batch.length; j++) {
      const campaign = batch[j];
      
      if (processedCampaignIds.has(campaign.id)) {
        console.log(`[INSIGHTS FETCH] Skipping duplicate campaign ID: ${campaign.id}`);
        continue;
      }
      
      // FINAL RECHECK: Don't process already blocked campaigns (in case status changed during processing)
      if (campaign.insightsStatus === 'blocked' || isCampaignBlocked(campaign.id)) {
        console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaign.id} – insights blocked after 400`);
        processedCampaignIds.set(campaign.id, true);
        continue;
      }
      
      try {
        processedCampaignIds.set(campaign.id, true);
        
        const extraStats = await queueCampaignInsightsFetch(campaign, token, datePreset);
        
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
        
        if (j < batch.length - 1) {
          await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.MIN_REQUEST_INTERVAL));
        }
      } catch (error: any) {
        console.error(`[INSIGHTS FETCH] Error in processing for campaign ${campaign.id}:`, error);
        
        // ENHANCED IMMEDIATE BLOCKING: Mark campaign as blocked immediately if 400 error
        if (error.status === 400 || (error.response && error.response.status === 400)) {
          console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaign.id}`);
          
          // Update in-memory state
          campaign.insightsStatus = 'blocked';
          campaign.insights = null;
          
          // Update localStorage and add to all blocking mechanisms
          markCampaignAsBlocked(campaign.id);
          
          // Logging for visibility
          console.log(`[INSIGHTS FETCH] Campaign ${campaign.id} is now BLOCKED from future insights fetches`);
        }
      }
    }
    
    if (i + BATCH_CONFIG.BATCH_SIZE < campaignsWithInsights.length) {
      console.log(`[INSIGHTS FETCH] Waiting ${BATCH_CONFIG.BATCH_INTERVAL}ms before next batch`);
      await new Promise(resolve => setTimeout(resolve, BATCH_CONFIG.BATCH_INTERVAL));
    }
  }
  
  console.log(`[INSIGHTS FETCH] Completed insights fetch for ${successCount}/${campaigns.length} campaigns`);
  
  if (successCount > 0) {
    toast({
      title: "Campaign Insights Loaded",
      description: `Successfully loaded detailed metrics for ${successCount} campaigns using preset: ${datePreset}`,
      variant: "default",
    });
  }
  
  // Always return the original campaigns array to ensure we render what we have
  return campaigns;
};
