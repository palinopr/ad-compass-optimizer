
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
 * Maps a date preset to a valid Meta API date_preset
 */
const mapToValidDatePreset = (preset: string = 'last_28d'): string => {
  const mapping: Record<string, string> = {
    'last30days': 'last_28d',
    'last_30d': 'last_28d',
    'last7days': 'last_7d'
  };
  
  // Return the mapped value if exists, otherwise use the original (if valid) or last_28d
  const validPresets = ['today', 'yesterday', 'this_week', 'last_week', 'this_month', 
                      'last_month', 'last_3_months', 'last_6_months', 'this_quarter',
                      'lifetime', 'last_30d', 'last_14d', 'last_7d', 'last_28d', 'maximum'];
  
  if (mapping[preset]) {
    return mapping[preset];
  }
  
  if (validPresets.includes(preset)) {
    return preset;
  }
  
  return 'last_28d';
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
    const validDatePreset = mapToValidDatePreset(datePreset);
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
    // Use the MetaInsightsService to fetch campaign insights with the valid date preset
    const response = await fetch(
      `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=actions,cost_per_action_type,website_purchase_roas&date_preset=${validDatePreset}&access_token=${token}`,
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
      
      // Try with maximum as fallback if we get an error and didn't already use maximum
      if (validDatePreset !== 'maximum') {
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=maximum for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'maximum');
      }
      
      return null;
    }
    
    const data = await response.json();
    
    // Check if we have data
    if (!data || !data.data || data.data.length === 0) {
      console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId} with date_preset=${validDatePreset}`);
      
      // Try with maximum as fallback if we didn't get data and didn't already use maximum
      if (validDatePreset !== 'maximum') {
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=maximum for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'maximum');
      }
      
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
  token: string,
  datePreset: string = 'last_28d'
): Promise<MetaCampaign[]> => {
  const validDatePreset = mapToValidDatePreset(datePreset);
  console.log(`[INSIGHTS FETCH] Starting batch insights fetch for ${campaigns.length} campaigns with date_preset=${validDatePreset}`);
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
        const extraStats = await fetchCampaignInsights(campaign.id, token, validDatePreset);
        
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
