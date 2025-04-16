
import { MetaCampaign, CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { RequestQueueManager } from '@/services/api/queue/RequestQueueManager';
import { toast } from '@/hooks/use-toast';
import { fetchCampaignInsights } from './singleCampaignFetcher';
import { BATCH_CONFIG } from './batchConfig';

const queueCampaignInsightsFetch = (
  campaign: MetaCampaign,
  token: string,
  datePreset: string
): Promise<CampaignExtraStats | null> => {
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
  const campaignsWithInsights = [...campaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  for (let i = 0; i < campaignsWithInsights.length; i += BATCH_SIZE) {
    const batch = campaignsWithInsights.slice(i, i + BATCH_SIZE);
    
    console.log(`[INSIGHTS FETCH] Processing batch ${Math.floor(i/BATCH_SIZE) + 1} with ${batch.length} campaigns`);
    
    for (let j = 0; j < batch.length; j++) {
      const campaign = batch[j];
      
      if (processedCampaignIds.has(campaign.id)) {
        console.log(`[INSIGHTS FETCH] Skipping duplicate campaign ID: ${campaign.id}`);
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
          await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL));
        }
      } catch (error) {
        console.error(`[INSIGHTS FETCH] Error in processing for campaign ${campaign.id}:`, error);
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
      description: `Successfully loaded detailed metrics for ${successCount} campaigns using preset: ${datePreset}`,
      variant: "default",
    });
  }
  
  return campaignsWithInsights;
};
