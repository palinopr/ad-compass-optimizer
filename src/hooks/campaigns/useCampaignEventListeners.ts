
import { useEffect, useRef, useCallback } from 'react';
import { CampaignRefreshEvent } from './fetch-utils/eventHandlers';
import { debounce, throttle } from 'lodash';

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
  const visibilityThrottleRef = useRef<boolean>(false);
  
  // Throttled UI refresh - limits how often we can refresh the UI
  const throttledUiRefresh = useCallback(
    throttle(() => {
      console.log("Throttled UI refresh triggered");
      forceUiRefresh();
    }, 5000), // Only allow UI refresh every 5 seconds
    [forceUiRefresh]
  );
  
  // Debounced fetch implementation - waits until activity settles
  const debouncedFetchCampaigns = useCallback(
    debounce((force: boolean = false) => {
      console.log(`Debounced campaign fetch for status: ${status}, force: ${force}`);
      fetchCampaigns(force);
    }, 3000), // 3 second debounce
    [fetchCampaigns, status]
  );
  
  // Handle manual refresh requests with less aggressive debouncing
  const handleManualRefresh = useCallback((e: CampaignRefreshEvent) => {
    console.log("Manual campaign refresh requested", e.detail);
    // Clear campaigns first to ensure UI resets
    clearCampaigns();
    
    // If this is a forced refresh, bypass debounce
    if (e.detail?.force) {
      fetchCampaigns(true);
    } else {
      // Use shorter debounce for manual actions
      setTimeout(() => {
        fetchCampaigns(false);
      }, 500);
    }
  }, [fetchCampaigns, clearCampaigns]);
  
  // Handle display refresh requests
  const handleDisplayRefresh = useCallback(() => {
    console.log("Campaign display refresh requested");
    // Use throttled implementation
    throttledUiRefresh();
    localStorage.setItem('had_display_issues', 'true');
  }, [throttledUiRefresh]);

  // Handle ad account change events
  const handleAdAccountChange = useCallback(() => {
    console.log("Ad account changed, refreshing campaigns...");
    // Clear campaigns first to reset UI
    clearCampaigns();
    // Use debounced implementation for fetch after account change
    debouncedFetchCampaigns(true);
  }, [debouncedFetchCampaigns, clearCampaigns]);

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

  // Add a throttled effect to handle visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only refresh when page becomes visible AND we haven't refreshed recently
      if (!document.hidden && mountedRef.current && !visibilityThrottleRef.current) {
        console.log('Page became visible, refreshing UI display only');
        // Set throttle flag to prevent multiple quick refreshes
        visibilityThrottleRef.current = true;
        
        // Only force a display refresh but don't refetch data
        throttledUiRefresh();
        
        // Reset the throttle flag after cooldown period
        setTimeout(() => {
          visibilityThrottleRef.current = false;
        }, 10000); // 10 second cooldown on visibility refreshes
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [throttledUiRefresh]);

  return { mountedRef };
}
