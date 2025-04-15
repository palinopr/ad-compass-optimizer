
import { useCallback, useEffect, useState } from 'react';
import { useRefreshLogic } from './refresh/useRefreshLogic';
import { useCampaignFetchState } from './useCampaignFetchState';
import { useCampaignEventListeners } from './useCampaignEventListeners';
import { useCampaignFilters } from './useCampaignFilters';
import { UseCampaignsResult } from './types';

export function useCampaigns(status?: string): UseCampaignsResult {
  const {
    campaigns, setCampaigns, updateCampaigns,
    isLoading, setIsLoading,
    error, setError,
    errorDetails, setErrorDetails,
    displayRefresh, forceRender,
    incrementDisplayRefresh,
    clearCampaigns,
    forceUiRefresh,
    hasEverHadCampaignsRef
  } = useCampaignFetchState();

  const [localForceRender, setLocalForceRender] = useState(0);

  const { fetchCampaigns, mountedRef } = useRefreshLogic(status);
  const { filteredCampaigns, filters } = useCampaignFilters(campaigns);

  const handleFetchCampaigns = useCallback(async (forceRefresh = false) => {
    console.log(`[CAMPAIGN FETCH] handleFetchCampaigns called, forceRefresh: ${forceRefresh}`);
    
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);

    const result = await fetchCampaigns(forceRefresh);
    
    if (mountedRef.current) {
      if (result?.error) {
        setError(result.error);
        setErrorDetails(result.errorDetails);
        // Exit loading state even on error to prevent stuck loading state
        setIsLoading(false);
      } else if (result && 'campaigns' in result && result.campaigns) {
        console.log(`[CAMPAIGN FETCH] API returned ${result.campaigns.length} campaigns`);
        
        // Exit loading state before updating campaigns
        if (result.campaigns.length > 0) {
          setIsLoading(false);
        }
        
        updateCampaigns(result.campaigns);
      } else {
        console.warn('[CAMPAIGN FETCH] Fetch returned no campaigns and no error');
        // Exit loading state to prevent stuck state
        setIsLoading(false);
      }
    }
  }, [fetchCampaigns, mountedRef, 
      setIsLoading, setError, setErrorDetails, updateCampaigns]);

  // Create a function to explicitly force UI refresh
  const exposedForceUiRefresh = useCallback(() => {
    console.log('[UI REFRESH] External component called forceUiRefresh');
    forceUiRefresh();
    setTimeout(() => {
      setLocalForceRender(prev => prev + 1);
    }, 200);
  }, [forceUiRefresh]);

  // Add a safety check for stuck loading state
  useEffect(() => {
    let timeoutId: number | undefined;
    
    if (isLoading) {
      timeoutId = window.setTimeout(() => {
        // If we're still loading after 10 seconds and we've had campaigns before,
        // force exit loading state to prevent stuck UI
        if (isLoading && hasEverHadCampaignsRef?.current) {
          console.log('[CAMPAIGN FETCH] Safety timeout: forcing exit from loading state');
          setIsLoading(false);
        }
      }, 10000); // 10 second safety timeout
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, hasEverHadCampaignsRef]);

  // Set up event listeners for campaign refresh events
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
    forceRender: forceRender || localForceRender,
    forceUiRefresh: exposedForceUiRefresh
  };
}
