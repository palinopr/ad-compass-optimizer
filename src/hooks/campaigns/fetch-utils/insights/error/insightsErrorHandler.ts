
import { DuplicateRequestChecker } from '@/services/api/insights/throttling/duplicateChecker';
import { markCampaignAsBlocked } from '../singleCampaignFetcher';

// Constants for storage
const BLOCKED_CAMPAIGNS_KEY = 'permanently_blocked_campaigns';
const FAILED_SIGNATURES_KEY = 'failed_insights_signatures';
const INSIGHTS_400_FAILURES_KEY = 'insights_400_failures';

export const handleInsightsFetchError = (error: any, campaignId: string): void => {
  // Handle 400 errors specifically with IMMEDIATE triple-layered blocking
  if (error.status === 400 || (error.response && error.response.status === 400)) {
    console.log(`[INSIGHTS FETCH] ✅ Permanently blocking campaign due to 400 error: ${campaignId}`);
    
    // Use our utility function to mark campaign as blocked in localStorage
    markCampaignAsBlocked(campaignId);
    
    // Add to DuplicateRequestChecker to ensure cross-component blocking
    const objectFailSignature = `object-${campaignId}-failed`;
    DuplicateRequestChecker.markAsPermanentlyFailed(objectFailSignature);
    
    // Store additional info about this specific 400 error
    try {
      const failed400s = JSON.parse(localStorage.getItem(INSIGHTS_400_FAILURES_KEY) || '[]');
      failed400s.push({
        timestamp: new Date().toISOString(),
        campaignId,
        error: error.message || 'Unknown error'
      });
      localStorage.setItem(INSIGHTS_400_FAILURES_KEY, JSON.stringify(failed400s.slice(-30)));
      
      // Also store in failed_insights_signatures for cross-referencing
      const failedSignatures = JSON.parse(localStorage.getItem(FAILED_SIGNATURES_KEY) || '[]');
      if (!failedSignatures.includes(objectFailSignature)) {
        failedSignatures.push(objectFailSignature);
        localStorage.setItem(FAILED_SIGNATURES_KEY, JSON.stringify(failedSignatures));
        console.log(`[INSIGHTS FETCH] Added signature to failed_insights_signatures: ${objectFailSignature}`);
      }
      
      // Direct add to blocked campaigns as ultimate failsafe
      addToBlockedCampaigns(campaignId);
    } catch (e) {
      // Ignore storage errors, but try direct method as fallback
      addToBlockedCampaigns(campaignId);
    }
    
    // Log extra debug info about this blocking
    console.log(`[INSIGHTS FETCH] Campaign ${campaignId} blocked status:`, {
      markedByFunction: true,
      inDuplicateChecker: true,
      timestamp: new Date().toISOString()
    });
  } else {
    // For other errors, just log them but don't block the campaign
    console.error(`[INSIGHTS FETCH] Error for campaign ${campaignId}:`, error);
  }
};

// Reinforced helper function to ensure campaign is added to blocked list
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
      console.log(`[INSIGHTS FETCH] Created new blocked campaigns list with: ${campaignId}`);
    } catch (innerError) {
      console.error('[INSIGHTS FETCH] Critical error storing blocked campaigns:', innerError);
    }
  }
};
