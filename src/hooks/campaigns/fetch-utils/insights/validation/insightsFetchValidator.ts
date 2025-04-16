
import { BLOCKED_CAMPAIGNS_KEY } from '../constants';
import { isCampaignBlocked } from '../singleCampaignFetcher';

export const validateCampaignForInsights = (campaignId: string): { isValid: boolean; reason?: string } => {
  // IMMEDIATE GUARD: Check if campaign is blocked using the utility function
  if (isCampaignBlocked(campaignId)) {
    console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
    return { isValid: false, reason: 'blocked_campaign' };
  }

  try {
    // Check if this campaign is in the blocked campaigns list
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
      return { isValid: false, reason: 'blocked_campaign' };
    }
    
    // Additionally check in failed_insights_signatures
    try {
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      const objectFailSignature = `object-${campaignId}-failed`;
      
      if (failedSignatures.includes(objectFailSignature)) {
        console.log(`🚫 Skipped ${campaignId} – insights blocked after 400`);
        
        // For consistency, also add to blocked campaigns if not already there
        if (!blockedCampaigns.includes(campaignId)) {
          blockedCampaigns.push(campaignId);
          localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
        }
        
        return { isValid: false, reason: 'failed_signature' };
      }
    } catch (e) {
      console.error('[INSIGHTS FETCH] Error checking failed signatures:', e);
    }
    
    // Also check the 400 failures log as a final check
    try {
      const failures400 = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
      const isInFailureLog = failures400.some((failure: any) => failure.campaignId === campaignId);
      
      if (isInFailureLog) {
        console.log(`🚫 Skipped ${campaignId} – found in 400 failures log`);
        
        // For consistency, also add to blocked campaigns if not already there
        if (!blockedCampaigns.includes(campaignId)) {
          blockedCampaigns.push(campaignId);
          localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify(blockedCampaigns));
        }
        
        return { isValid: false, reason: 'in_failure_log' };
      }
    } catch (e) {
      // Ignore storage errors
    }
    
    return { isValid: true };
  } catch (e) {
    console.error('[INSIGHTS FETCH] Error checking blocked campaigns:', e);
    
    // Check a second source of truth for safety
    try {
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      if (failedSignatures.includes(`object-${campaignId}-failed`)) {
        console.log(`🚫 Skipped ${campaignId} – insights blocked after 400 (fallback check)`);
        return { isValid: false, reason: 'blocked_campaign_fallback' };
      }
    } catch (e) {
      // Ignore nested error
    }
    return { isValid: true }; // Default to allowing fetch on storage error
  }
};
