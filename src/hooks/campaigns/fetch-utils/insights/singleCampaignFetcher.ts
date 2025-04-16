
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
  datePreset: string = 'maximum'  // Default to 'maximum'
): Promise<CampaignExtraStats | null> => {
  const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
  
  try {
    console.log(`[INSIGHTS FETCH] Starting insights fetch for campaign ${campaignId} with initial datePreset=${datePreset}`);
    
    // FIRST CHECK: Check if this campaign is already in the blocked campaigns list
    try {
      const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
      if (blockedCampaigns.includes(campaignId)) {
        console.log(`[INSIGHTS FETCH] 🚫 Skipped permanently blocked campaign: ${campaignId}`);
        return null;
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    // Block last_28d directly at the entry point
    if (datePreset === 'last_28d' || datePreset.includes('28d') || datePreset.includes('28day')) {
      console.warn(`[INSIGHTS FETCH] Blocking problematic date_preset "${datePreset}" at entry point, using "maximum" instead`);
      datePreset = 'maximum';
      
      // Log this early blocking
      try {
        const earlyBlocks = JSON.parse(localStorage.getItem('insights_early_blocks') || '[]');
        earlyBlocks.push({
          timestamp: new Date().toISOString(),
          campaignId,
          original: datePreset,
          replacedWith: 'maximum',
          location: 'fetchCampaignInsights-entry'
        });
        localStorage.setItem('insights_early_blocks', JSON.stringify(earlyBlocks.slice(-20)));
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    // Strictly validate the date preset using our validator
    const validDatePreset = validateDatePreset(datePreset);
    
    // Generate a unique request signature for this insights request - EARLY CHECK
    const requestSignature = DuplicateRequestChecker.generateRequestSignature(
      campaignId, 
      'campaign-insights', 
      { datePreset: validDatePreset }
    );
    
    // Check if this exact request previously failed with 400 - BEFORE any other processing
    if (DuplicateRequestChecker.isPermanentlyFailed(requestSignature)) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped permanently blocked campaign signature: ${campaignId} with preset ${validDatePreset}`);
      
      // Log this skipped request to verify our fix is working
      try {
        const skippedRequests = JSON.parse(localStorage.getItem('singleCampaignFetcher_skipped') || '[]');
        skippedRequests.push({
          timestamp: new Date().toISOString(),
          campaignId,
          datePreset: validDatePreset,
          signature: requestSignature
        });
        localStorage.setItem('singleCampaignFetcher_skipped', JSON.stringify(skippedRequests.slice(-30)));
      } catch (e) {
        // Ignore storage errors
      }
      
      return null;
    }
    
    // Also check if the campaign ID itself has been marked as a failed object
    const objectFailureKey = `object-${campaignId}-failed`;
    const nonexistentKey = `object-${campaignId}-nonexistent`;
    if (DuplicateRequestChecker.isPermanentlyFailed(objectFailureKey) || 
        DuplicateRequestChecker.isPermanentlyFailed(nonexistentKey)) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped permanently blocked campaign: ${campaignId}`);
      return null;
    }
    
    if (InsightsThrottling.isDuplicateRequest(campaignId, validDatePreset)) {
      console.log(`[INSIGHTS FETCH] Skipped duplicate insights request: ${campaignId} with preset ${validDatePreset}`);
      return null;
    }
    
    console.log(`[INSIGHTS FETCH] Fetching insights for campaign ${campaignId} with date_preset=${validDatePreset}`);
    
    const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'default';
    InsightsThrottling.checkThrottling(selectedAdAccount);
    
    // Build URL using our improved URL builder with proper validation
    const url = buildInsightsUrl(campaignId, token, validDatePreset);
    
    // Final check to ensure the URL does not contain last_28d
    if (url.includes('date_preset=last_28d')) {
      console.error(`[INSIGHTS FETCH] CRITICAL: URL still contains last_28d after all validations. Aborting request.`);
      
      // Mark this signature as permanently failed to prevent future attempts
      DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
      
      // Log this critical failure
      try {
        const criticalFailures = JSON.parse(localStorage.getItem('critical_date_preset_failures') || '[]');
        criticalFailures.push({
          timestamp: new Date().toISOString(),
          campaignId,
          requestSignature,
          url: url.replace(token, 'REDACTED_TOKEN')
        });
        localStorage.setItem('critical_date_preset_failures', JSON.stringify(criticalFailures.slice(-20)));
      } catch (e) {
        // Ignore storage errors
      }
      
      return null;
    }
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'meta-marketing-dashboard/1.2.0' 
      }
    });
    
    InsightsThrottling.monitorResponseHeaders(response);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, errorData);
      
      // STRICT BLOCKING: Immediately mark any 400 error as permanent failure
      if (response.status === 400) {
        console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaignId}`);
        DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
        
        // ALSO mark the campaign ID itself as permanently failed
        const objectFailKey = `object-${campaignId}-failed`;
        DuplicateRequestChecker.markAsPermanentlyFailed(objectFailKey);
        
        // Add to the blocked campaigns list
        try {
          const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
          if (!blockedCampaigns.includes(campaignId)) {
            blockedCampaigns.push(campaignId);
            localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
            console.log(`[INSIGHTS FETCH] Added to permanently blocked campaigns: ${campaignId}`);
          }
        } catch (e) {
          console.error('[INSIGHTS FETCH] Error adding to blocked campaigns:', e);
        }
        
        // Check if this is a "does not exist" error
        if (errorData.error && errorData.error.message && 
            (errorData.error.message.includes('does not exist') || 
             errorData.error.message.includes('not found'))) {
          console.log(`[INSIGHTS FETCH] ✅ Permanently blocking nonexistent object: ${campaignId}`);
          const nonexistentKey = `object-${campaignId}-nonexistent`;
          DuplicateRequestChecker.markAsPermanentlyFailed(nonexistentKey);
        }
        
        // Store additional info about this specific 400 error
        try {
          const failed400s = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
          failed400s.push({
            timestamp: new Date().toISOString(),
            campaignId,
            datePreset: validDatePreset,
            requestSignature,
            objectFailKey,
            error: errorData.error ? {
              code: errorData.error.code,
              message: errorData.error.message
            } : 'Unknown error'
          });
          localStorage.setItem('insights_400_failures', JSON.stringify(failed400s.slice(-20))); // Keep last 20
        } catch (e) {
          // Ignore storage errors
        }
        
        return null;
      }
      
      if (errorData.error && errorData.error.code) {
        console.error(`[INSIGHTS FETCH] Error code: ${errorData.error.code}, Message: ${errorData.error.message}`);
        
        if (errorData.error.code === 100 && errorData.error.message.includes('date_preset')) {
          console.error(`[INSIGHTS FETCH] Invalid date_preset parameter detected: "${validDatePreset}"`);
          
          // Mark as permanently failed for this specific date preset
          DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
          
          // Do NOT try again with a known preset - completely abort instead
          console.log(`[INSIGHTS FETCH] Not retrying - parameter error marked as permanently failed`);
          return null;
        }
      }
      
      InsightsThrottling.checkErrorForRateLimit(errorData);
      
      // Don't retry with any other preset - completely abort
      console.log(`[INSIGHTS FETCH] Not retrying insights fetch after error`);
      return null;
    }
    
    const data = await response.json();
    
    if (!data || !data.data || data.data.length === 0) {
      console.log(`[INSIGHTS FETCH] No insights data available for campaign ${campaignId}`);
      // Don't retry - return null
      return null;
    }
    
    console.log(`[INSIGHTS FETCH] Insights response for campaign ${campaignId}:`, data);
    
    const insightsData = data.data[0];
    const results = processInsightsData(insightsData);
    
    console.log(`[INSIGHTS FETCH] Successfully extracted metrics for campaign ${campaignId}:`, results);
    
    return results;
  } catch (error) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    
    // STRICT BLOCKING: If it's a 400 error, mark it as permanently failed
    if ((error as any).status === 400) {
      console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaignId}`);
      const requestSignature = DuplicateRequestChecker.generateRequestSignature(
        campaignId, 
        'campaign-insights', 
        { datePreset: datePreset }
      );
      DuplicateRequestChecker.markAsPermanentlyFailed(requestSignature);
      
      // ALSO mark the campaign ID as failed
      const objectFailKey = `object-${campaignId}-failed`;
      DuplicateRequestChecker.markAsPermanentlyFailed(objectFailKey);
      
      // Add to the blocked campaigns list
      try {
        const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
        if (!blockedCampaigns.includes(campaignId)) {
          blockedCampaigns.push(campaignId);
          localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
          console.log(`[INSIGHTS FETCH] Added to permanently blocked campaigns: ${campaignId}`);
        }
      } catch (e) {
        console.error('[INSIGHTS FETCH] Error adding to blocked campaigns:', e);
      }
      
      // Log the error for debugging
      try {
        const catchErrors = JSON.parse(localStorage.getItem('insights_catch_errors') || '[]');
        catchErrors.push({
          timestamp: new Date().toISOString(),
          campaignId,
          message: (error as any).message || 'Unknown error',
          status: (error as any).status
        });
        localStorage.setItem('insights_catch_errors', JSON.stringify(catchErrors.slice(-20)));
      } catch (e) {
        // Ignore storage errors
      }
    }
    
    InsightsThrottling.checkErrorForRateLimit(error);
    return null;
  }
};
