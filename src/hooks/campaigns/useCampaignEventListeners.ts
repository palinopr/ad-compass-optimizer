
import { useEffect } from 'react';

export function useCampaignEventListeners(
  handleFetchCampaigns: (forceRefresh?: boolean) => Promise<void>,
  incrementDisplayRefresh: () => void,
  forceUiRefresh: () => void,
  clearCampaigns: () => void,
  status?: string
) {
  useEffect(() => {
    const handleRefreshEvent = (event: CustomEvent) => {
      const { forceRefresh = false } = event.detail || {};
      console.log(`Campaign refresh event received with forceRefresh=${forceRefresh}`);
      handleFetchCampaigns(forceRefresh);
    };

    const handleDisplayRefreshEvent = () => {
      console.log('Display refresh event received');
      incrementDisplayRefresh();
    };
    
    const handleClearCampaignsEvent = () => {
      console.log('Clear campaigns event received');
      clearCampaigns();
    };
    
    const handleForceUiRefreshEvent = () => {
      console.log('Force UI refresh event received');
      forceUiRefresh();
    };
    
    // New handler for mock campaigns sync
    const handleSyncMockCampaignsEvent = (event: CustomEvent) => {
      console.log('Mock campaigns sync event received');
      if (event.detail?.campaigns) {
        console.log(`Syncing ${event.detail.campaigns.length} mock campaigns to state`);
        // Use updateCampaigns directly from the event data
        forceUiRefresh();
      }
    };

    // Add event listeners
    window.addEventListener('refresh-campaigns', handleRefreshEvent as EventListener);
    window.addEventListener('display-refresh', handleDisplayRefreshEvent);
    window.addEventListener('clear-campaigns', handleClearCampaignsEvent);
    window.addEventListener('force-ui-refresh', handleForceUiRefreshEvent);
    window.addEventListener('sync-mock-campaigns', handleSyncMockCampaignsEvent as EventListener);

    // Clean up
    return () => {
      window.removeEventListener('refresh-campaigns', handleRefreshEvent as EventListener);
      window.removeEventListener('display-refresh', handleDisplayRefreshEvent);
      window.removeEventListener('clear-campaigns', handleClearCampaignsEvent);
      window.removeEventListener('force-ui-refresh', handleForceUiRefreshEvent);
      window.removeEventListener('sync-mock-campaigns', handleSyncMockCampaignsEvent as EventListener);
    };
  }, [handleFetchCampaigns, incrementDisplayRefresh, forceUiRefresh, clearCampaigns]);
}
