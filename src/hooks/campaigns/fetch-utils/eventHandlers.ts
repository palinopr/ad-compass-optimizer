
import { toast } from "@/hooks/use-toast";

/**
 * Trigger a campaign data refresh
 * @param forceRefresh - Force a refresh even if throttling would normally prevent it
 * @param accountId - Optional account ID to use (defaults to currently selected account)
 * @param withInsights - Include insights data in the fetch
 */
export const triggerCampaignRefresh = (
  forceRefresh = false,
  accountId?: string,
  withInsights = false
): void => {
  try {
    console.log(`[CAMPAIGN REFRESH] Triggering refresh, force=${forceRefresh}, withInsights=${withInsights}`);
    
    // If account ID is provided, ensure it's properly formatted
    if (accountId) {
      const formattedId = accountId.startsWith('act_') ? accountId : `act_${accountId}`;
      console.log(`[CAMPAIGN REFRESH] Using specified account: ${formattedId}`);
    }

    // Store the fetch request time
    localStorage.setItem('last_manual_campaign_fetch', new Date().toISOString());
    
    // Track the attempt count
    try {
      const attempts = parseInt(localStorage.getItem('campaign_fetch_attempts') || '0', 10);
      localStorage.setItem('campaign_fetch_attempts', (attempts + 1).toString());
    } catch (e) {
      console.error('[CAMPAIGN FETCH] Error updating fetch attempts:', e);
    }

    // Dispatch the event to trigger the fetch
    const event = new CustomEvent('campaign-refresh', {
      detail: {
        force: forceRefresh,
        accountId: accountId || localStorage.getItem('selected_ad_account'),
        withInsights,
        timestamp: new Date().toISOString(),
        manual: true
      }
    });
    window.dispatchEvent(event);

    // Show toast notification for manual refreshes
    if (forceRefresh) {
      toast({
        title: "Refreshing Campaigns",
        description: "Fetching latest campaign data from Meta API...",
        duration: 3000,
      });
    }
  } catch (e) {
    console.error('[CAMPAIGN REFRESH] Error triggering campaign refresh:', e);
    toast({
      title: "Refresh Error",
      description: "Failed to trigger campaign refresh",
      variant: "destructive",
    });
  }
};

// Listen for force-refresh events
if (typeof window !== 'undefined') {
  window.addEventListener('force-campaign-refresh', (event: Event) => {
    const customEvent = event as CustomEvent;
    console.log('[CAMPAIGN REFRESH] Force refresh event received:', customEvent.detail);
    triggerCampaignRefresh(true, undefined, true);
  });
}
