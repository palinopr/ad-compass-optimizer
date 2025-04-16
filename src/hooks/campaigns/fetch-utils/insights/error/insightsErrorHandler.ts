
import { BLOCKED_CAMPAIGNS_KEY } from '../constants';
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';

export const handleInsightsFetchError = (error: any, campaignId: string): void => {
  // Handle 400 errors specifically
  if (error.status === 400 || (error.response && error.response.status === 400)) {
    console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaignId}`);
    addToBlockedCampaigns(campaignId);
    
    // Add to DuplicateRequestChecker to ensure cross-component blocking
    const objectFailSignature = `object-${campaignId}-failed`;
    DuplicateRequestChecker.markAsPermanentlyFailed(objectFailSignature);
    
    // Store additional info about this specific 400 error
    try {
      const failed400s = JSON.parse(localStorage.getItem('insights_400_failures') || '[]');
      failed400s.push({
        timestamp: new Date().toISOString(),
        campaignId,
        error: error.message || 'Unknown error'
      });
      localStorage.setItem('insights_400_failures', JSON.stringify(failed400s.slice(-20)));
      
      // Also store in failed_insights_signatures for cross-referencing
      const failedSignatures = JSON.parse(localStorage.getItem('failed_insights_signatures') || '[]');
      if (!failedSignatures.includes(objectFailSignature)) {
        failedSignatures.push(objectFailSignature);
        localStorage.setItem('failed_insights_signatures', JSON.stringify(failedSignatures));
        console.log(`[INSIGHTS FETCH] Added signature to failed_insights_signatures: ${objectFailSignature}`);
      }
    } catch (e) {
      // Ignore storage errors
    }
  } else {
    // For other errors, just log them but don't block the campaign
    console.error(`[INSIGHTS FETCH] Error for campaign ${campaignId}:`, error);
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
    
    // Backup mechanism: Try to create a new array if parsing failed
    try {
      localStorage.setItem(BLOCKED_CAMPAIGNS_KEY, JSON.stringify([campaignId]));
    } catch (innerError) {
      console.error('[INSIGHTS FETCH] Critical error storing blocked campaigns:', innerError);
    }
  }
};
