
import { BLOCKED_CAMPAIGNS_KEY } from '../constants';

export const validateCampaignForInsights = (campaignId: string): { isValid: boolean; reason?: string } => {
  try {
    // Check if this campaign is in the blocked campaigns list
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – insights blocked after 400`);
      return { isValid: false, reason: 'blocked_campaign' };
    }
    
    // Additionally check in failed_insights_signatures
    try {
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      const objectFailSignature = `object-${campaignId}-failed`;
      
      if (failedSignatures.includes(objectFailSignature)) {
        console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – insights blocked after 400`);
        
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
    
    return { isValid: true };
  } catch (e) {
    console.error('[INSIGHTS FETCH] Error checking blocked campaigns:', e);
    // Check a second source of truth for safety
    try {
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      if (failedSignatures.includes(`object-${campaignId}-failed`)) {
        console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – insights blocked after 400 (fallback check)`);
        return { isValid: false, reason: 'blocked_campaign_fallback' };
      }
    } catch (e) {
      // Ignore nested error
    }
    return { isValid: true }; // Default to allowing fetch on storage error
  }
};
