
import { useEffect, useRef, useCallback } from 'react';
import { CampaignRefreshEvent } from './fetch-utils/eventHandlers';

type FetchFunction = (force?: boolean) => void;

/**
 * Hook for setting up campaign-related event listeners with improved refresh handling
 */
export function useCampaignEventListeners(
  fetchCampaigns: FetchFunction,
  incrementDisplayRefresh: () => void,
  forceUiRefresh: () => void,
  clearCampaigns: () => void,
  status?: string
) {
  const mountedRef = useRef<boolean>(true);
  
  // Handle manual refresh requests
  const handleManualRefresh = useCallback((e: CampaignRefreshEvent) => {
    console.log("Manual campaign refresh requested", e.detail);
    // Clear campaigns first to ensure UI resets
    clearCampaigns();
    // If force refresh is specified, pass through the force parameter
    fetchCampaigns(e.detail?.force);
  }, [fetchCampaigns, clearCampaigns]);
  
  // Handle display refresh requests
  const handleDisplayRefresh = useCallback(() => {
    console.log("Campaign display refresh requested");
    incrementDisplayRefresh();
    forceUiRefresh();
    localStorage.setItem('had_display_issues', 'true');
  }, [incrementDisplayRefresh, forceUiRefresh]);

  // Handle ad account change events
  const handleAdAccountChange = useCallback(() => {
    console.log("Ad account changed, refreshing campaigns...");
    // Clear campaigns first to reset UI
    clearCampaigns();
    // Add a slight delay to let any other UI updates complete
    setTimeout(() => fetchCampaigns(true), 100);
  }, [fetchCampaigns, clearCampaigns]);

  useEffect(() => {
    mountedRef.current = true;
    
    console.log(`CampaignList(${status}): Component mounted, setting up listeners`);
    
    // Add delay between initial auth and data fetch to prevent race conditions
    const timer = setTimeout(() => {
      fetchCampaigns();
    }, 500);
    
    // Register all event listeners
    window.addEventListener('ad-account-changed', handleAdAccountChange);
    window.addEventListener('campaign-data-refresh', handleManualRefresh as EventListener);
    window.addEventListener('campaign-display-refresh', handleDisplayRefresh);
    
    return () => {
      console.log(`CampaignList(${status}): Component unmounting`);
      mountedRef.current = false;
      clearTimeout(timer);
      window.removeEventListener('ad-account-changed', handleAdAccountChange);
      window.removeEventListener('campaign-data-refresh', handleManualRefresh as EventListener);
      window.removeEventListener('campaign-display-refresh', handleDisplayRefresh);
    };
  }, [fetchCampaigns, handleAdAccountChange, handleDisplayRefresh, handleManualRefresh, status]);

  return { mountedRef };
}
