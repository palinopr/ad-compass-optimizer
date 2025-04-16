
import { BLOCKED_CAMPAIGNS_KEY } from '../constants';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';

export const handleInsightsFetchError = (error: any, campaignId: string): void => {
  // Handle 400 errors specifically
  if (error.status === 400 || (error.response && error.response.status === 400)) {
    console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaignId}`);
    addToBlockedCampaigns(campaignId);
    
    // Store additional info about this specific 400 error
    try {
      const failed400s = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
      failed400s.push({
        timestamp: new Date().toISOString(),
        campaignId,
        error: error.message || 'Unknown error'
      });
      localStorage.setItem('insights_400_failures', JSON.stringify(failed400s.slice(-20)));
    } catch (e) {
      // Ignore storage errors
    }
  }
};

const addToBlockedCampaigns = (campaignId: string): void => {
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
};

