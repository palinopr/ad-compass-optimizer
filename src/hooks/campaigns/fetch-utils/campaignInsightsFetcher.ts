
import { MetaInsightsService } from '@/services/api/insights/MetaInsightsService';
import { toast } from '@/hooks/use-toast';
import { MetaCampaign } from '@/services/api/types/metaCampaignTypes';

// Interface for the extra stats we'll add to each campaign
export interface CampaignExtraStats {
  results: string;
  cpa: string;
  roas: string;
}

/**
 * Fetches detailed insights for a single campaign
 */
export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string
): Promise<CampaignExtraStats | null> => {
  try {
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId}`);
    
    // Use the MetaInsightsService to fetch campaign insights
    // Using the Meta API compatible date_preset value - last_28d
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=actions,cost_per_action_type,website_purchase_roas&date_preset=last_28d&access_token=${token}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, errorData);
      return null;
    }
    
    const data = await response.json();
    
    // Check if we have data
    if (!data || !data.data || data.data.length === 0) {
      console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId}`);
      return null;
    }
    
    const insightsData = data.data[0];
    let results = '-';
    let cpa = '-';
    let roas = '-';
    
    // Extract results from actions array
    if (insightsData.actions && Array.isArray(insightsData.actions)) {
      // Find the most relevant action type for results
      const relevantAction = insightsData.actions.find(
        (a: any) => a.action_type === 'offsite_conversion' || 
                  a.action_type === 'purchase' || 
                  a.action_type === 'omni_purchase'
      );
      
      if (relevantAction) {
        results = relevantAction.value;
      }
    }
    
    // Extract CPA from cost_per_action_type
    if (insightsData.cost_per_action_type && Array.isArray(insightsData.cost_per_action_type)) {
      if (insightsData.cost_per_action_type.length > 0) {
        cpa = insightsData.cost_per_action_type[0].value;
      }
    }
    
    // Extract ROAS from website_purchase_roas
    if (insightsData.website_purchase_roas && Array.isArray(insightsData.website_purchase_roas)) {
      if (insightsData.website_purchase_roas.length > 0) {
        const roasValue = parseFloat(insightsData.website_purchase_roas[0].value);
        roas = `${roasValue.toFixed(2)}x`;
      }
    }
    
    console.log(`[INSIGHTS FETCH] Successfully fetched insights for campaign ${campaignId}:`, { results, cpa, roas });
    
    return { results, cpa, roas };
  } catch (error) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    return null;
  }
};

/**
 * Enhanced version to batch fetch insights for multiple campaigns
 */
export const fetchInsightsForCampaigns = async (
  campaigns: MetaCampaign[], 
  token: string
): Promise<MetaCampaign[]> => {
  console.log(`[INSIGHTS FETCH] Starting batch insights fetch for ${campaigns.length} campaigns`);
  let successCount = 0;
  
  // Create a copy of campaigns to update
  const campaignsWithInsights = [...campaigns];
  
  // Process campaigns in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < campaignsWithInsights.length; i += batchSize) {
    const batch = campaignsWithInsights.slice(i, i + batchSize);
    
    // Process each batch concurrently
    await Promise.all(batch.map(async (campaign, index) => {
      const campaignIndex = i + index;
      try {
        const extraStats = await fetchCampaignInsights(campaign.id, token);
        
        if (extraStats) {
          // Update the campaign with the extra stats
          campaignsWithInsights[campaignIndex] = {
            ...campaignsWithInsights[campaignIndex],
            extraStats,
          };
          successCount++;
        }
      } catch (error) {
        console.error(`[INSIGHTS FETCH] Error in batch processing for campaign ${campaign.id}:`, error);
      }
    }));
  }
  
  console.log(`[INSIGHTS FETCH] Completed insights fetch for ${successCount}/${campaigns.length} campaigns`);
  
  // Show toast for successful fetch
  if (successCount > 0) {
    toast({
      title: "Campaign Insights Loaded",
      description: `Successfully loaded detailed metrics for ${successCount} campaigns`,
      variant: "default",
    });
  }
  
  return campaignsWithInsights;
};
