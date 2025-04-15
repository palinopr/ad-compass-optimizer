
import { useEffect } from 'react';

export const useCampaignEventListeners = (
  fetchCampaigns: (forceRefresh?: boolean) => void,
  incrementDisplayRefresh: () => void,
  forceUiRefresh: () => void,
  clearCampaigns: () => void,
  status?: string
) => {
  // Listen for campaign data refresh events
  useEffect(() => {
    const handleCampaignRefresh = (event: CustomEvent<{ force: boolean, accountId?: string, immediate?: boolean }>) => {
      const { force = false, accountId, immediate = false } = event.detail || {};
      console.log(`[CAMPAIGN EVENT] Refresh requested. Force: ${force}, Immediate: ${immediate}, Account: ${accountId || 'not specified'}`);
      
      // If immediate is set to true, fetch campaigns without any delay
      if (immediate) {
        console.log(`[CAMPAIGN FETCH] Started for act_${accountId || localStorage.getItem('selected_ad_account')}`);
        fetchCampaigns(force);
      } else {
        // Add a small delay for non-immediate refreshes to allow other state updates to complete
        setTimeout(() => fetchCampaigns(force), 100);
      }
    };
    
    const handleDataClear = () => {
      clearCampaigns();
    };
    
    const handleDisplayRefresh = () => {
      incrementDisplayRefresh();
    };
    
    const handleForceUiRefresh = () => {
      forceUiRefresh();
    };
    
    const handleAdAccountChange = (event: CustomEvent<{ accountId: string }>) => {
      const accountId = event.detail?.accountId;
      console.log(`[CAMPAIGN EVENT] Ad account changed to: ${accountId}`);
      
      // Log the account change
      console.log(`[CAMPAIGN FETCH] Started for act_${accountId}`);
      
      // When the ad account changes, trigger an immediate campaign refresh
      setTimeout(() => {
        fetchCampaigns(true);
      }, 300);
    };
    
    window.addEventListener('campaign-data-refresh', handleCampaignRefresh as EventListener);
    window.addEventListener('campaign-display-refresh', handleDisplayRefresh as EventListener);
    window.addEventListener('campaign-ui-refresh', handleForceUiRefresh as EventListener);
    window.addEventListener('campaign-data-clear', handleDataClear as EventListener);
    window.addEventListener('ad-account-changed', handleAdAccountChange as EventListener);

    return () => {
      window.removeEventListener('campaign-data-refresh', handleCampaignRefresh as EventListener);
      window.removeEventListener('campaign-display-refresh', handleDisplayRefresh as EventListener);
      window.removeEventListener('campaign-ui-refresh', handleForceUiRefresh as EventListener);
      window.removeEventListener('campaign-data-clear', handleDataClear as EventListener);
      window.removeEventListener('ad-account-changed', handleAdAccountChange as EventListener);
    };
  }, [fetchCampaigns, incrementDisplayRefresh, forceUiRefresh, clearCampaigns, status]);
};
