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
  // STRICT PRE-CHECK: Don't even create a queue item if the campaign is already blocked
  // This is a hard fail-fast check to prevent any queuing of blocked campaigns
  
  // First check in-memory status
  if (campaign.insightsStatus === 'blocked') {
    console.log(`⛔ Not queuing insights for ${campaign.id} – already blocked.`);
    return Promise.resolve(null); // Return immediately without queueing
  }
  
  // Then check if campaign is blocked using our helper
  if (isCampaignBlocked(campaign.id)) {
    console.log(`⛔ Not queuing insights for ${campaign.id} – already blocked.`);
    // Update in-memory status to match
    campaign.insightsStatus = 'blocked';
    campaign.insights = null;
    return Promise.resolve(null); // Return immediately without queueing
  }
  
  // If not blocked, queue the request normally
  return RequestQueueManager.addToQueue(() => {
    return fetchCampaignInsights(campaign.id, token, datePreset);
  });
};

export const fetchInsightsForCampaigns = async (
  campaigns: MetaCampaign[], 
  token: string,
  datePreset: string = 'last_28d'
): Promise<MetaCampaign[]> => {
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
  
  // PRE-FILTER: Filter out all blocked campaigns before starting the batch process
  const filteredCampaigns = campaigns.filter(campaign => {
    // Skip already blocked campaigns
    if (campaign.insightsStatus === 'blocked') {
      console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400`);
      return false;
    }
    
    // Check if campaign is blocked using our helper
    if (isCampaignBlocked(campaign.id)) {
      console.log(`🚫 Skipped ${campaign.id} – insights blocked after 400`);
      // Update in-memory status to match
      campaign.insightsStatus = 'blocked';
      campaign.insights = null;
      return false;
    }
    
    return true;
  });
  
  console.log(`[INSIGHTS FETCH] After filtering blocked campaigns: ${filteredCampaigns.length}/${campaigns.length} will be processed`);
  
  const campaignsWithInsights = [...filteredCampaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  for (let i = 0; i < campaignsWithInsights.length; i += BATCH_CONFIG.BATCH_SIZE) {
    const batch = campaignsWithInsights.slice(i, i + BATCH_CONFIG.BATCH_SIZE);
    
    console.log(`[INSIGHTS FETCH] Processing batch ${Math.floor(i/BATCH_CONFIG.BATCH_SIZE) + 1} with ${batch.length} campaigns`);
    
    for (let j = 0; j < batch.length; j++) {
      const campaign = batch[j];
      
      if (processedCampaignIds.has(campaign.id)) {
        console.log(`[INSIGHTS FETCH] Skipping duplicate campaign ID: ${campaign.id}`);
        continue;
      }
      
      // EARLY SKIP: Don't process already blocked campaigns
      if (campaign.insightsStatus === 'blocked') {
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
        
        // IMMEDIATE BLOCKING: Mark campaign as blocked immediately if 400 error
        if (error.status === 400 || (error.response && error.response.status === 400)) {
          console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaign.id}`);
          
          // Update in-memory state
          campaign.insightsStatus = 'blocked';
          campaign.insights = null;
          
          // Update localStorage
          try {
            if (!blockedCampaigns.includes(campaign.id)) {
              markCampaignAsBlocked(campaign.id);
            }
          } catch (e) {
            console.error('[INSIGHTS FETCH] Error updating blocked campaigns:', e);
          }
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
  
  return campaignsWithInsights;
};
