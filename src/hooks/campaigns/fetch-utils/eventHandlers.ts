
/**
 * Event handlers for campaign-related events
 */

// Trigger a refresh of campaign data
export const triggerCampaignRefresh = (
  force: boolean = false, 
  accountId?: string,
  immediate: boolean = false
): void => {
  if (typeof window !== 'undefined') {
    console.log(`[CAMPAIGN EVENT] Triggering campaign refresh. Force: ${force}, Immediate: ${immediate}, Account: ${accountId || 'current'}`);
    
    const event = new CustomEvent('campaign-data-refresh', {
      detail: { 
        force,
        accountId,
        immediate
      }
    });
    
    window.dispatchEvent(event);
  }
};

// Trigger a display-only refresh (no data fetching)
export const triggerDisplayRefresh = (): void => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('campaign-display-refresh');
    window.dispatchEvent(event);
  }
};

// Trigger a UI refresh (force re-render)
export const triggerUIRefresh = (): void => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('campaign-ui-refresh');
    window.dispatchEvent(event);
  }
};

// Clear campaign data
export const clearCampaignData = (): void => {
  if (typeof window !== 'undefined') {
    const event = new CustomEvent('campaign-data-clear');
    window.dispatchEvent(event);
  }
};
