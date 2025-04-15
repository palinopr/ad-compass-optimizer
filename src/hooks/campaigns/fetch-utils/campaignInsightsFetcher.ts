import { MetaInsightsService } from '@/services/api/insights/MetaInsightsService';
import { toast } from '@/hooks/use-toast';
import { MetaCampaign, CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { mapToValidDatePreset } from '@/utils/debugging/services/parsers/datePresetParser';

/**
 * Fetches detailed insights for a single campaign
 */
export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'last_28d'
): Promise<CampaignExtraStats | null> => {
  try {
    // Map legacy or invalid presets to valid Meta API values
    const validDatePreset = mapToValidDatePreset(datePreset);
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
    // Common fields for insights requests
    const fields = 'actions,cost_per_action_type,website_purchase_roas,impressions,clicks,spend';
    
    // Build URL with proper time_increment parameter for reliable data
    let url = `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&time_increment=1&access_token=${token}`;
    
    // For short time ranges, use time_range instead of date_preset for better precision
    if (['today', 'yesterday'].includes(validDatePreset)) {
      // Calculate time range for today/yesterday
      const date = validDatePreset === 'today' 
        ? new Date() 
        : new Date(Date.now() - 86400000); // yesterday
      
      const formattedDate = date.toISOString().split('T')[0];
      url = `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&time_range={"since":"${formattedDate}","until":"${formattedDate}"}&time_increment=1&access_token=${token}`;
    } else {
      // Use date_preset for other ranges
      url = `https://graph.facebook.com/v17.0/${campaignId}/insights?fields=${fields}&date_preset=${validDatePreset}&time_increment=1&access_token=${token}`;
    }
    
    // Send the request
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
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
    
    // Log insights response for debugging
    console.log(`[INSIGHTS FETCH] Insights response for campaign ${campaignId}:`, data);
    
    // Process the most recent data point (first in the array with time_increment=1)
    const insightsData = data.data[0];
    
    // Initialize results with defaults
    const results: CampaignExtraStats = {
      results: '-',
      cpa: '-',
      roas: '-',
      spend: insightsData.spend || '-',
      clicks: insightsData.clicks || '-',
      impressions: insightsData.impressions || '-'
    };
    
    // Extract results from actions array
    if (insightsData.actions && Array.isArray(insightsData.actions)) {
      // Find the most relevant action type for results (in priority order)
      const conversionTypes = [
        'offsite_conversion.fb_pixel_purchase',
        'purchase', 
        'omni_purchase', 
        'offsite_conversion'
      ];
      
      let relevantAction = null;
      // Try each conversion type in order
      for (const actionType of conversionTypes) {
        relevantAction = insightsData.actions.find((a: any) => a.action_type === actionType);
        if (relevantAction) {
          console.log(`[INSIGHTS FETCH] Found ${actionType} action for campaign ${campaignId}:`, relevantAction);
          break;
        }
      }
      
      if (relevantAction) {
        results.results = relevantAction.value;
      }
    }
    
    // Extract CPA from cost_per_action_type
    if (insightsData.cost_per_action_type && Array.isArray(insightsData.cost_per_action_type)) {
      // Find the most relevant CPA (in priority order)
      const cpaTypes = [
        'offsite_conversion.fb_pixel_purchase',
        'purchase', 
        'omni_purchase', 
        'offsite_conversion'
      ];
      
      let relevantCpa = null;
      // Try each CPA type in order
      for (const cpaType of cpaTypes) {
        relevantCpa = insightsData.cost_per_action_type.find((c: any) => c.action_type === cpaType);
        if (relevantCpa) {
          console.log(`[INSIGHTS FETCH] Found ${cpaType} CPA for campaign ${campaignId}:`, relevantCpa);
          break;
        }
      }
      
      if (relevantCpa) {
        results.cpa = relevantCpa.value;
      }
    }
    
    // Extract ROAS from website_purchase_roas
    if (insightsData.website_purchase_roas && Array.isArray(insightsData.website_purchase_roas)) {
      if (insightsData.website_purchase_roas.length > 0) {
        const roasValue = parseFloat(insightsData.website_purchase_roas[0].value);
        results.roas = `${roasValue.toFixed(2)}x`;
        console.log(`[INSIGHTS FETCH] Found ROAS for campaign ${campaignId}:`, results.roas);
      }
    }
    
    console.log(`[INSIGHTS FETCH] Successfully extracted metrics for campaign ${campaignId}:`, results);
    
    return results;
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
  // Map legacy or invalid presets to valid Meta API values
  const validDatePreset = mapToValidDatePreset(datePreset);
  console.log(`[INSIGHTS FETCH] Starting batch insights fetch for ${campaigns.length} campaigns with date_preset=${validDatePreset}`);
  
  // Create a map to prevent duplicate fetches for the same campaign ID
  const processedCampaignIds = new Map<string, boolean>();
  let successCount = 0;
  
  // Create a campaign ID to campaign object map for quick lookups
  const campaignMap = new Map<string, MetaCampaign>();
  
  // Create a copy of campaigns to update
  const campaignsWithInsights = [...campaigns];
  campaignsWithInsights.forEach(campaign => {
    campaignMap.set(campaign.id, campaign);
  });
  
  // Process campaigns in batches to avoid overwhelming the API
  const batchSize = 5;
  for (let i = 0; i < campaignsWithInsights.length; i += batchSize) {
    const batch = campaignsWithInsights.slice(i, i + batchSize);
    
    console.log(`[INSIGHTS FETCH] Processing batch ${Math.floor(i/batchSize) + 1} with ${batch.length} campaigns`);
    
    // Process each batch concurrently
    await Promise.all(batch.map(async (campaign) => {
      // Skip if we've already processed this campaign ID
      if (processedCampaignIds.has(campaign.id)) {
        console.log(`[INSIGHTS FETCH] Skipping duplicate campaign ID: ${campaign.id}`);
        return;
      }
      
      try {
        processedCampaignIds.set(campaign.id, true);
        const extraStats = await fetchCampaignInsights(campaign.id, token, validDatePreset);
        
        if (extraStats) {
          // Get the campaign from the map (could be updated by now)
          const campaignToUpdate = campaignMap.get(campaign.id);
          if (campaignToUpdate) {
            // Update the campaign with the extra stats
            campaignToUpdate.extraStats = extraStats;
            
            // Also enhance the existing insights object if it exists
            if (campaignToUpdate.insights) {
              campaignToUpdate.insights.cpa = campaignToUpdate.insights.cpa || extraStats.cpa;
              campaignToUpdate.insights.roas = campaignToUpdate.insights.roas || extraStats.roas;
              campaignToUpdate.insights.spend = campaignToUpdate.insights.spend || extraStats.spend;
            }
            
            // Set results if not already present
            if (!campaignToUpdate.results && extraStats.results !== '-') {
              campaignToUpdate.results = extraStats.results;
            }
            
            successCount++;
            console.log(`[INSIGHTS FETCH] Updated campaign ${campaign.id} with extra stats`);
          }
        }
      } catch (error) {
        console.error(`[INSIGHTS FETCH] Error in batch processing for campaign ${campaign.id}:`, error);
      }
    }));
    
    // Add a delay between batches to avoid rate limiting
    if (i + batchSize < campaignsWithInsights.length) {
      console.log(`[INSIGHTS FETCH] Waiting 2000ms before next batch`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
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
  
  // Return updated campaigns array
  return campaignsWithInsights;
};
