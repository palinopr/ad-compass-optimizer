
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
    if (isMockMode()) {
      loadMockCampaigns(forceRefresh);
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
        updateCampaigns(result.campaigns);
      }
      setIsLoading(false);
    }
  }, [isMockMode, loadMockCampaigns, fetchCampaigns, mountedRef, 
      setIsLoading, setError, setErrorDetails, updateCampaigns]);

  // Update campaigns when mock data changes
  useEffect(() => {
    if (isMockMode() && mockCampaigns.length > 0) {
      updateCampaigns(mockCampaigns);
    }
  }, [isMockMode, mockCampaigns, updateCampaigns]);

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
