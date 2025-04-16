
import { BLOCKED_CAMPAIGNS_KEY } from '../constants';

export const validateCampaignForInsights = (campaignId: string): { isValid: boolean; reason?: string } => {
  try {
    // Check if this campaign is in the blocked campaigns list
    const blockedCampaigns = JSON.parse(localStorage.getItem(BLOCKED_CAMPAIGNS_KEY) || '[]');
    if (blockedCampaigns.includes(campaignId)) {
      console.log(`[INSIGHTS FETCH] 🚫 Skipped ${campaignId} – insights blocked after 400`);
      return { isValid: false, reason: 'blocked_campaign' };
    }
    return { isValid: true };
  } catch (e) {
    console.error('[INSIGHTS FETCH] Error checking blocked campaigns:', e);
    return { isValid: true }; // Default to allowing fetch on storage error
  }
};
