
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

  // Add an additional effect to detect and fix empty campaign state in mock mode
  useEffect(() => {
    if (isMockMode() && campaigns.length === 0 && !isLoading) {
      // This is a safety mechanism to ensure we always have data in mock mode
      console.log('🎭 Mock mode safety check: No campaigns in state, triggering refresh');
      const timer = setTimeout(() => {
        handleFetchCampaigns(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [isMockMode, campaigns.length, isLoading, handleFetchCampaigns]);

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
    forceRender
  };
}
