
import { CampaignExtraStats } from '@/services/api/types/metaCampaignTypes';
import { validateCampaignForInsights } from './validation/insightsFetchValidator';
import { handleInsightsFetchError } from './error/insightsErrorHandler';
import { fetchCampaignInsightData } from './service/insightsFetchService';

// Helper function to mark campaigns as blocked
const markCampaignAsBlocked = (campaignId: string): void => {
  try {
    const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (!blockedCampaigns.includes(campaignId)) {
      blockedCampaigns.push(campaignId);
      localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
      console.log(`[INSIGHTS FETCH] ✅ Permanently blocked campaign: ${campaignId}`);
    }
    
    // Also add to failed_insights_signatures for cross-checking
    const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
    const objectFailSignature = `object-${campaignId}-failed`;
    if (!failedSignatures.includes(objectFailSignature)) {
      failedSignatures.push(objectFailSignature);
      localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
    }
  } catch (e) {
    console.error('[INSIGHTS FETCH] Error marking campaign as blocked:', e);
  }
};

// Helper function to check if a campaign is blocked
const isCampaignBlocked = (campaignId: string): boolean => {
  try {
    const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
      return true;
    }

    // Also check failed_insights_signatures
    const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
    const objectFailSignature = `object-${campaignId}-failed`;
    
    if (failedSignatures.includes(objectFailSignature)) {
      console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (in signatures)`);
      // Ensure it's also in the main blocklist for consistency
      markCampaignAsBlocked(campaignId);
      return true;
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
  // IMMEDIATE GUARD: Check if campaign is blocked before doing anything
  if (isCampaignBlocked(campaignId)) {
    console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
    return null;
  }

  try {
    // STRICT VALIDATION: First check if campaign is allowed to fetch insights
    const { isValid, reason } = validateCampaignForInsights(campaignId);
    if (!isValid) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – insights blocked after 400`);
      return null;
    }

    return await fetchCampaignInsightData(campaignId, token, datePreset);
  } catch (error: any) {
    console.error(`[INSIGHTS FETCH] Error fetching insights for campaign ${campaignId}:`, error);
    
    // Enhanced error handling to ensure 400 errors are properly blocked
    handleInsightsFetchError(error, campaignId);
    
    // IMMEDIATE BLOCKING: If this is a 400 error, mark as blocked immediately
    if (error.status === 400 || (error.response && error.response.status === 400)) {
      markCampaignAsBlocked(campaignId);
    }
    
    return null;
  }
};

// Export helper functions to be used elsewhere
export { markCampaignAsBlocked, isCampaignBlocked };
