
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { validateCampaignForInsights } from './validation/insightsFetchValidator';
import { handleInsightsFetchError } from './error/insightsErrorHandler';
import { fetchCampaignInsightData } from './service/insightsFetchService';

// Constants for storage keys
const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
const FAILED_SIGNATURES_KEY = 'failed_insights_signatures';

// Enhanced helper function to mark campaigns as blocked
const markCampaignAsBlocked = (campaignId: string): void => {
  try {
    // Add to primary blocked campaigns list
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (!blockedCampaigns.includes(campaignId)) {
      blockedCampaigns.push(campaignId);
      localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
      console.log(`[INSIGHTS FETCH] ✅ Permanently blocked campaign: ${campaignId}`);
    }
    
    // Also add to failed_insights_signatures for cross-checking
    const failedSignatures = JSON.parse(localStorage.getItem(FAILED_SIGNATURES_KEY) || '[]');
    const objectFailSignature = `object-${campaignId}-failed`;
    if (!failedSignatures.includes(objectFailSignature)) {
      failedSignatures.push(objectFailSignature);
      localStorage.setItem(FAILED_SIGNATURES_KEY, JSON.stringify(failedSignatures));
      console.log(`[INSIGHTS FETCH] ✅ Added to failed signatures: ${objectFailSignature}`);
    }
    
    // Also add to 400 failures log for diagnostic purposes
    try {
      const failures400 = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
      const entry = {
        timestamp: new Date().toISOString(),
        campaignId,
        error: 'Manually blocked'
      };
      
      // Only add if not already present
      if (!failures400.some((f: any) => f.campaignId === campaignId)) {
        failures400.push(entry);
        localStorage.setItem('insights_400_failures', JSON.stringify(failures400.slice(-30)));
      }
    } catch (e) {
      console.error('[INSIGHTS FETCH] Error adding to 400 failures log:', e);
    }
  } catch (e) {
    console.error('[INSIGHTS FETCH] Error marking campaign as blocked:', e);
    
    // Fallback direct write attempt if parsing fails
    try {
      localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify([campaignId]));
    } catch (innerError) {
      console.error('[INSIGHTS FETCH] Critical error storing blocked campaigns:', innerError);
    }
  }
};

// Enhanced helper function to check if a campaign is blocked with multiple fallbacks
const isCampaignBlocked = (campaignId: string): boolean => {
  try {
    // Check primary blocked campaigns list
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
      return true;
    }

    // Also check failed_insights_signatures
    const failedSignatures = JSON.parse(localStorage.getItem(FAILED_SIGNATURES_KEY) || '[]');
    const objectFailSignature = `object-${campaignId}-failed`;
    
    if (failedSignatures.includes(objectFailSignature)) {
      console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (in signatures)`);
      // Ensure it's also in the main blocklist for consistency
      markCampaignAsBlocked(campaignId);
      return true;
    }
    
    // Additional check in 400 failures log
    try {
      const failures400 = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
      if (failures400.some((f: any) => f.campaignId === campaignId)) {
        console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (in 400 failures log)`);
        // Ensure it's in the main blocklist for consistency
        markCampaignAsBlocked(campaignId);
        return true;
      }
    } catch (e) {
      // Ignore errors in this additional check
    }
  } catch (e) {
    console.error('[INSIGHTS FETCH] Error checking if campaign is blocked:', e);
  }
  
  return false;
};

export const fetchCampaignInsights = async (
  campaignId: string, 
  token: string,
  datePreset: string = 'maximum'
): Promise<CampaignExtraStats | null> => {
  // ENHANCED TRIPLE-CHECK GUARD: Check all possible sources of blocking information
  if (isCampaignBlocked(campaignId)) {
    console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
    return null;
  }
  
  // Additional direct check of localStorage as final failsafe
  try {
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (direct localStorage check)`);
      return null;
    }
  } catch (e) {
    // Ignore storage errors in this additional check
  }

  try {
    // STRICT VALIDATION: First check if campaign is allowed to fetch insights
    const { isValid, reason } = validateCampaignForInsights(campaignId);
    if (!isValid) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – ${reason || 'validation failed'}`);
      return null;
    }

    return await fetchCampaignInsightData(campaignId, token, datePreset);
  } catch (error: any) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    
    // ENHANCED ERROR HANDLING: Mark as blocked for all 400 errors
    if (error.status === 400 || (error.response && error.response.status === 400)) {
      console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaignId}`);
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
