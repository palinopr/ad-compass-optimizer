
import { useCallback, useEffect } from 'react';
import { useMockCampaigns } from './mock/useMockCampaigns';
import { useRefreshLogic } from './refresh/useRefreshLogic';
import { useCampaignFetchState } from './useCampaignFetchState';
import { useCampaignEventListeners } from './useCampaignEventListeners';
import { useCampaignFilters } from './useCampaignFilters';
import { UseCampaignsResult } from './types';

export function useCampaigns(status?: string): UseCampaignsResult {
  const isMockMode = useCallback(() => {
    return localStorage.getItem("USE_MOCK_MODE") === "true";
  }, []);

  const {
    campaigns, setCampaigns, updateCampaigns,
    isLoading, setIsLoading,
    error, setError,
    errorDetails, setErrorDetails,
    displayRefresh, forceRender,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh,
  } = useCampaignFetchState();

  const { mockCampaigns, loadMockCampaigns } = useMockCampaigns(status);
  const { fetchCampaigns, mountedRef } = useRefreshLogic(status);
  const { filteredCampaigns, filters } = useCampaignFilters(campaigns);

  const handleFetchCampaigns = useCallback(async (forceRefresh = false) => {
    console.log(`[MOCK DEBUG] handleFetchCampaigns called, mockMode: ${isMockMode()}, forceRefresh: ${forceRefresh}`);
    
    if (isMockMode()) {
      console.log(`🎭 Mock mode fetch triggered, forceRefresh: ${forceRefresh}`);
      const result = loadMockCampaigns(forceRefresh);
      if (result && result.campaigns) {
        console.log(`🎭 Mock fetch returned ${result.campaigns.length} campaigns, updating state...`);
        updateCampaigns(result.campaigns);
        console.log(`[MOCK DEBUG] After updateCampaigns call, campaigns state should be updated`);
      }
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    const result = await fetchCampaigns(forceRefresh);
    
    if (mountedRef.current) {
      if (result?.error) {
        setError(result.error);
        setErrorDetails(result.errorDetails);
      } else if (result && 'campaigns' in result && result.campaigns) {
        console.log(`[DEBUG] Real API returned ${result.campaigns.length} campaigns`);
        updateCampaigns(result.campaigns);
      }
      setIsLoading(false);
    }
  }, [isMockMode, loadMockCampaigns, fetchCampaigns, mountedRef, 
      setIsLoading, setError, setErrorDetails, updateCampaigns]);

  // Update campaigns when mock data changes (this is now a backup mechanism)
  useEffect(() => {
    if (isMockMode() && mockCampaigns.length > 0 && campaigns.length === 0) {
      console.log(`[MOCK DEBUG] Mock campaigns sync: found ${mockCampaigns.length} mock campaigns but state has ${campaigns.length}. Syncing...`);
      updateCampaigns(mockCampaigns);
      console.log(`[MOCK DEBUG] After updateCampaigns in effect hook`);
    }
  }, [isMockMode, mockCampaigns, updateCampaigns, campaigns.length]);

  // ENHANCED: Explicitly handle the sync-mock-campaigns event
  useEffect(() => {
    const handleSyncMockCampaigns = (event: CustomEvent) => {
      if (event.detail?.campaigns && Array.isArray(event.detail.campaigns)) {
        const incomingCampaigns = event.detail.campaigns;
        console.log(`[MOCK META SYNC] Received ${incomingCampaigns.length} campaigns to update`);
        
        // Save current ad account context to storage for diagnostic purposes
        const selectedAdAccount = localStorage.getItem('selected_ad_account') || 'unknown';
        localStorage.setItem('last_mock_sync_adaccount', selectedAdAccount);
        
        // Get current campaign count for logging
        const prevCount = campaigns.length;
        
        // Update campaigns state with incoming data
        updateCampaigns(incomingCampaigns);
        
        // Log detailed information for debugging
        console.log(`[MOCK META SYNC] Updated campaigns: ${prevCount} → ${incomingCampaigns.length}`, {
          firstCampaignId: incomingCampaigns[0]?.id || 'none',
          adAccountContext: selectedAdAccount,
          timestamp: new Date().toISOString()
        });
      }
    };
    
    // Add event listener for sync events
    window.addEventListener('sync-mock-campaigns', handleSyncMockCampaigns as EventListener);
    
    return () => {
      window.removeEventListener('sync-mock-campaigns', handleSyncMockCampaigns as EventListener);
    };
  }, [campaigns.length, updateCampaigns]);

  // Export forceUiRefresh to be used by other components
  const exposedForceUiRefresh = useCallback(() => {
    console.log('🎭 [MOCK DEBUG] External component called forceUiRefresh');
    forceUiRefresh();
    // Small delay and then force render again to ensure UI updates
    setTimeout(() => {
      setForceRender(prev => prev + 1);
    }, 200);
  }, [forceUiRefresh]);

  useCampaignEventListeners(
    handleFetchCampaigns,
    incrementDisplayRefresh,
    forceUiRefresh,
    clearCampaigns,
    status
  );

  return {
    campaigns,
    filteredCampaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: handleFetchCampaigns,
    displayRefresh,
    forceRender,
    forceUiRefresh: exposedForceUiRefresh
  };
}
