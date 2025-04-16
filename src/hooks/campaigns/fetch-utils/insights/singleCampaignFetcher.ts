
import { toast } from '@/hooks/use-toast';
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { InsightsThrottling } from '@/services/api/insights/throttling/InsightsThrottling';
import { buildInsightsUrl } from './insightsUrlBuilder';
import { processInsightsData } from './insightsProcessor';
import { validateDatePreset } from './datePresetValidator';

export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'last_28d'
): Promise<CampaignExtraStats | null> => {
  try {
    const validDatePreset = validateDatePreset(datePreset);
    
    if (InsightsThrottling.isDuplicateRequest(campaignId, validDatePreset)) {
      return null;
    }
    
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
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
      
      if (errorData.error && errorData.error.code) {
        console.error(`[INSIGHTS FETCH] Error code: ${errorData.error.code}, Message: ${errorData.error.message}`);
        
        if (errorData.error.code === 100 && errorData.error.message.includes('date_preset')) {
          console.error(`[INSIGHTS FETCH] Invalid date_preset parameter detected: "${validDatePreset}"`);
          
          if (validDatePreset === 'last_28d' || validDatePreset === 'maximum') {
            return null;
          }
          
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
