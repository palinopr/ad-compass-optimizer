
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { validateCampaignForInsights } from './validation/insightsFetchValidator';
import { handleInsightsFetchError } from './error/insightsErrorHandler';
import { fetchCampaignInsightData } from './service/insightsFetchService';
import { CampaignBlockingService } from '@/services/api/insights/core/CampaignBlockingService';

// Constants for storage keys
const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
const FAILED_SIGNATURES_KEY = 'failed_insights_signatures';

// Enhanced helper function to mark campaigns as blocked
const markCampaignAsBlocked = (campaignId: string): void => {
  CampaignBlockingService.blockCampaign(campaignId);
};

// Enhanced helper function to check if a campaign is blocked with multiple fallbacks
const isCampaignBlocked = (campaignId: string): boolean => {
  return CampaignBlockingService.isCampaignBlocked(campaignId);
};

// Track failed fetches to avoid retries
const failedFetchAttempts = new Set<string>();

export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'maximum'
): Promise<CampaignExtraStats | null> => {
  // Strict validation of campaign ID with early return
  if (!campaignId || typeof campaignId !== 'string' || campaignId.trim() === '') {
    console.warn(`⚠️ Skipping insights fetch: Invalid campaign ID`);
    return null;
  }
  
  // Check if this is a duplicate fetch attempt with early return
  if (failedFetchAttempts.has(campaignId)) {
    console.log(`⚠️ Skipping insights fetch for campaign ${campaignId}: Previously failed`);
    return null;
  }
  
  // ENHANCED TRIPLE-CHECK GUARD: Check all possible sources of blocking information
  if (isCampaignBlocked(campaignId)) {
    console.log(`⚠️ Skipping insights fetch for campaign ${campaignId}: 400 error or missing data.`);
    return null;
  }
  
  // Additional direct check of localStorage as final failsafe
  try {
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`⚠️ Skipping insights fetch for campaign ${campaignId}: 400 error or missing data.`);
      return null;
    }
  } catch (e) {
    // Ignore storage errors in this additional check
  }

  try {
    // STRICT VALIDATION: First check if campaign is allowed to fetch insights
    const { isValid, reason } = validateCampaignForInsights(campaignId);
    if (!isValid) {
      console.log(`⚠️ Skipping insights fetch for campaign ${campaignId}: ${reason || 'validation failed'}`);
      return null;
    }
    
    // Log that we're proceeding with the fetch
    console.log(`🔍 Proceeding with insights fetch for campaign ${campaignId} with datePreset=${datePreset}`);

    return await fetchCampaignInsightData(campaignId, token, datePreset);
  } catch (error: any) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    
    // Add to failed attempts set to avoid retries
    failedFetchAttempts.add(campaignId);
    
    // ENHANCED ERROR HANDLING: Mark as blocked for all 400 errors
    if (error.status === 400 || (error.response && error.response.status === 400)) {
      console.log(`⚠️ Skipping insights fetch for campaign ${campaignId}: 400 error or missing data.`);
      markCampaignAsBlocked(campaignId);
      
      // Also handle with the error handler for consistency
      handleInsightsFetchError(error, campaignId);
    } else {
      // For other errors, just handle normally
      handleInsightsFetchError(error, campaignId);
    }
    
    return null;
  }
};

// Export helper functions to be used elsewhere
export { markCampaignAsBlocked, isCampaignBlocked };
