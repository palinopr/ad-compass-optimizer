
import { toast } from '@/hooks/use-toast';
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { InsightsThrottling } from '@/services/api/insights/throttling/InsightsThrottling';
import { buildInsightsUrl } from './insightsUrlBuilder';
import { processInsightsData } from './insightsProcessor';
import { validateDatePreset } from './datePresetValidator';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';

export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'last_28d'
): Promise<CampaignExtraStats | null> => {
  try {
    // Strictly validate the date preset using our new validator
    const validDatePreset = validateDatePreset(datePreset);
    
    if (InsightsThrottling.isDuplicateRequest(campaignId, validDatePreset)) {
      return null;
    }
    
    // Generate a unique request signature for this insights request
    const requestSignature = DuplicateRequestChecker.generateRequestSignature(
      campaignId, 
      'campaign-insights', 
      { datePreset: validDatePreset }
    );
    
    // Check if this exact request previously failed with 400
    if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
      console.log(`[INSIGHTS FETCH] Skipped insights request due to permanent failure (400): ${campaignId}`);
      return null;
    }
    
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
    const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'default';
    InsightsThrottling.checkThrottling(selectedAdAccount);
    
    // Build URL using our improved URL builder with proper validation
    const url = buildInsightsUrl(campaignId, token, validDatePreset);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'meta-marketing-dashboard/1.2.0' // Add user agent for better identification
      }
    });
    
    InsightsThrottling.monitorResponseHeaders(response);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, errorData);
      
      // Mark as permanently failed if it's a 400 error
      if (response.status === 400) {
        DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
        console.log(`[INSIGHTS FETCH] Skipped insights request due to permanent failure (400): ${campaignId}`);
        return null;
      }
      
      if (errorData.error && errorData.error.code) {
        console.error(`[INSIGHTS FETCH] Error code: ${errorData.error.code}, Message: ${errorData.error.message}`);
        
        if (errorData.error.code === 100 && errorData.error.message.includes('date_preset')) {
          console.error(`[INSIGHTS FETCH] Invalid date_preset parameter detected: "${validDatePreset}"`);
          
          // Mark as permanently failed for this specific date preset
          DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
          
          if (validDatePreset === 'last_28d' || validDatePreset === 'maximum') {
            return null;
          }
          
          // Try again with a known good preset, but don't retry if that was already a 400
          console.log(`[INSIGHTS FETCH] Retrying with date_preset=last_28d for campaign ${campaignId}`);
          const fallbackSignature = DuplicateRequestChecker.generateRequestSignature(
            campaignId, 
            'campaign-insights', 
            { datePreset: 'last_28d' }
          );
          
          if (DuplicateRequestChecker.isPermanentlyFailed(fallbackSignature)) {
            console.log(`[INSIGHTS FETCH] Skipped fallback insights request due to permanent failure (400): ${campaignId}`);
            return null;
          }
          
          return fetchCampaignInsights(campaignId, token, 'last_28d');
        }
      }
      
      InsightsThrottling.checkErrorForRateLimit(errorData);
      
      if (validDatePreset !== 'maximum' && validDatePreset !== 'last_28d') {
        // Don't retry if we've already marked the fallback as permanently failed
        const fallbackSignature = DuplicateRequestChecker.generateRequestSignature(
          campaignId, 
          'campaign-insights', 
          { datePreset: 'last_28d' }
        );
        
        if (DuplicateRequestChecker.isPermanentlyFailed(fallbackSignature)) {
          console.log(`[INSIGHTS FETCH] Skipped fallback insights request due to permanent failure (400): ${campaignId}`);
          return null;
        }
        
        console.log(`[INSIGHTS FETCH] Retrying with date_preset=last_28d for campaign ${campaignId}`);
        return fetchCampaignInsights(campaignId, token, 'last_28d');
      }
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.data || data.data.length === 0) {
      console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId}`);
      
      if (validDatePreset !== 'maximum' && validDatePreset !== 'last_28d') {
        // Don't retry if we've already marked the fallback as permanently failed
        const fallbackSignature = DuplicateRequestChecker.generateRequestSignature(
          campaignId, 
          'campaign-insights', 
          { datePreset: 'last_28d' }
        );
        
        if (DuplicateRequestChecker.isPermanentlyFailed(fallbackSignature)) {
          console.log(`[INSIGHTS FETCH] Skipped fallback insights request due to permanent failure (400): ${campaignId}`);
          return null;
        }
        
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
    
    // If it's a 400 error, mark it as permanently failed
    if ((error as any).status === 400) {
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(
        campaignId, 
        'campaign-insights', 
        { datePreset: datePreset }
      );
      DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
      console.log(`[INSIGHTS FETCH] Marked request as permanently failed due to 400 error: ${campaignId}`);
    }
    
    InsightsThrottling.checkErrorForRateLimit(error);
    return null;
  }
};
