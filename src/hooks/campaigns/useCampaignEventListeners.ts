
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
  const lastFetchTimeRef = useRef<number>(0);
  
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
    setTimeout(() => {
      // Only fetch if we haven't fetched recently
      const now = Date.now();
      if (now - lastFetchTimeRef.current > 2000) {
        lastFetchTimeRef.current = now;
        fetchCampaigns(true);
      }
    }, 100);
  }, [fetchCampaigns, clearCampaigns]);

  // Set up initial fetch and event listeners
  useEffect(() => {
    mountedRef.current = true;
    
    console.log(`CampaignList(${status}): Component mounted, setting up listeners`);
    
    // Add delay between initial auth and data fetch to prevent race conditions
    const timer = setTimeout(() => {
      console.log(`Initial campaign fetch for status: ${status}`);
      fetchCampaigns();
    }, 800);
    
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

  // Add an effect to force refresh on visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && mountedRef.current) {
        console.log('Page became visible, checking if campaigns need refresh');
        // Force a display refresh but don't refetch data
        forceUiRefresh();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [forceUiRefresh]);

  return { mountedRef };
}
