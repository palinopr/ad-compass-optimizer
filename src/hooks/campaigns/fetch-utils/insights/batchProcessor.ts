
import { MetaCampaign, CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { RequestQueueManager } from '@/services/api/queue/RequestQueueManager';
import { toast } from '@/hooks/use-toast';
import { fetchCampaignInsights, isCampaignBlocked, markCampaignAsBlocked } from './singleCampaignFetcher';
import { BATCH_CONFIG } from './batchConfig';

// Create a storage for processed campaign IDs to avoid duplicates within the same session
const processedCampaignIds = new Set<string>();

// Helper function to create a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Queue a campaign insights fetch with extra blocking checks
 */
const queueCampaignInsightsFetch = (
  campaign: MetaCampaign,
  token: string,
  datePreset: string
): Promise<CampaignExtraStats | null> => {
  // Skip invalid campaigns early
  if (!campaign.id || !campaign.status) {
    console.log(`⚠️ Skipping insights fetch: Campaign missing ID or status`);
    return Promise.resolve(null);
  }
  
  // Skip non-active campaigns
  if (campaign.status !== "ACTIVE") {
    console.log(`⚠️ Skipping insights fetch for campaign ${campaign.id}: Status is ${campaign.status}, not ACTIVE`);
    return Promise.resolve(null);
  }

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

  // Check if we've already processed this campaign ID in this session
  if (processedCampaignIds.has(campaign.id)) {
    console.log(`🔄 Skipping duplicate fetch for campaign ${campaign.id} in this session`);
    return Promise.resolve(null);
  }

  // Add to processed IDs set
  processedCampaignIds.add(campaign.id);
  
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
    console.log(`✅ No campaigns available, skipping insights fetch`);
    return campaigns || [];
  }
  
  if (!token) {
    console.error('[INSIGHTS FETCH] Missing token, cannot fetch insights');
    return campaigns;
  }
  
  // Log total campaign count for monitoring
  console.log(`🔍 Attempting to fetch insights for ${campaigns.length} campaigns`);
  
  const { MIN_REQUEST_INTERVAL, BATCH_SIZE, BATCH_INTERVAL } = BATCH_CONFIG;
  
  console.log(`[INSIGHTS FETCH] Starting strictly controlled insights fetch for ${campaigns.length} campaigns with date_preset=${datePreset}`);
  
  try {
    localStorage.setItem('current_date_preset', datePreset);
    localStorage.setItem('date_preset_timestamp', new Date().toISOString());
  } catch (e) {
    // Ignore storage errors
  }
  
  // Set stricter request interval for throttling
  RequestQueueManager.setRequestInterval(750); // Increased from 500ms
  
  let successCount = 0;
  
  const campaignMap = new Map<string, MetaCampaign>();
  
  // ENHANCED PRE-FILTER: Triple verification to filter out all blocked campaigns
  const filteredCampaigns = campaigns.filter(campaign => {
    // Skip campaigns missing required fields
    if (!campaign.id || !campaign.status) {
      console.log(`⚠️ Skipping insights fetch: Campaign missing ID or status`);
      return false;
    }
    
    // Skip non-active campaigns
    if (campaign.status !== "ACTIVE") {
      console.log(`⚠️ Skipping insights fetch for campaign ${campaign.id}: Status is ${campaign.status}, not ACTIVE`);
      return false;
    }
  
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
    
    // Check if we've already processed this campaign
    if (processedCampaignIds.has(campaign.id)) {
      console.log(`🔄 Skipping duplicate fetch for campaign ${campaign.id} in this session`);
      return false;
    }
    
    return true;
  });
  
  console.log(`[INSIGHTS FETCH] After filtering: ${filteredCampaigns.length}/${campaigns.length} campaigns qualify for insights fetch`);
  
  // If no campaigns after filtering, return early
  if (filteredCampaigns.length === 0) {
    console.log('[INSIGHTS FETCH] No qualifying campaigns to fetch insights for, returning original array');
    return campaigns;
  }
  
  // NEW: Abort if too many campaigns in queue
  const MAX_QUEUE_SIZE = 100;
  if (filteredCampaigns.length > MAX_QUEUE_SIZE) {
    console.warn(`⚠️ Skipping insights fetch: too many campaigns in queue (${filteredCampaigns.length})`);
    return campaigns;
  }
  
  const campaignsWithInsights = [...filteredCampaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  // Use the strict batch size from config
  const BATCH_LIMIT = BATCH_SIZE; // Use config value (2 campaigns per batch)
  
  // Calculate total number of batches for logging
  const totalBatches = Math.ceil(campaignsWithInsights.length / BATCH_LIMIT);
  console.log(`[INSIGHTS FETCH] Will process ${campaignsWithInsights.length} campaigns in ${totalBatches} batches of ${BATCH_LIMIT}`);
  
  // Process campaigns in batches
  for (let i = 0; i < campaignsWithInsights.length; i += BATCH_LIMIT) {
    const batch = campaignsWithInsights.slice(i, i + BATCH_LIMIT);
    const batchNumber = Math.floor(i / BATCH_LIMIT) + 1;
    
    console.log(`[INSIGHTS FETCH] Processing batch ${batchNumber}/${totalBatches} with ${batch.length} campaigns`);
    
    // Process each campaign in the current batch sequentially with delay
    for (let j = 0; j < batch.length; j++) {
      const campaign = batch[j];
      
      // Add to processed IDs set to prevent duplicates
      processedCampaignIds.add(campaign.id);
      
      try {
        console.log(`✅ Fetching insights for campaign ${campaign.id} (batch ${batchNumber}/${totalBatches})...`);
        const extraStats = await fetchCampaignInsights(campaign.id, token, datePreset);
        
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
          }
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
        }
      }
      
      // Add delay between individual requests within a batch
      if (j < batch.length - 1) {
        console.log(`⏳ Waiting ${MIN_REQUEST_INTERVAL}ms between requests...`);
        await delay(MIN_REQUEST_INTERVAL);
      }
    }
    
    // Add delay between batches unless this is the last batch
    if (i + BATCH_LIMIT < campaignsWithInsights.length) {
      console.log(`⏲️ Waiting ${BATCH_INTERVAL}ms before next batch...`);
      await delay(BATCH_INTERVAL);
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
