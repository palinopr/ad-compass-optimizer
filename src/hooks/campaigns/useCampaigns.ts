
import { useState } from 'react';
import { useRefreshLogic } from './refresh/useRefreshLogic';
import { useCampaignFetchState } from './useCampaignFetchState';
import { useCampaignEventListeners } from './useCampaignEventListeners';
import { useCampaignFilters } from './useCampaignFilters';
import { useLoadingTimeout } from './fetch-hooks/useLoadingTimeout';
import { useInitialFetch } from './fetch-hooks/useInitialFetch';
import { UseCampaignsResult } from './types';
import { useCampaignRefresh } from './hooks/useCampaignRefresh';
import { useUiRefresh } from './hooks/useUiRefresh';
import { metaPermissionsInvalid } from './utils/metaPermissionsUtils';

// Re-export Meta permissions flag 
export { metaPermissionsInvalid } from './utils/metaPermissionsUtils';

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
    hasEverHadCampaignsRef,
    fetchCompleted,
    setFetchCompleted,
    insightsFetchStatus,
    setInsightsFetchStatus
  } = useCampaignFetchState();

  // Add campaignsFetchStatus state to track permission/access issues
  const [campaignsFetchStatus, setCampaignsFetchStatus] = useState<'success' | 'unauthorized' | 'error' | null>(null);
  const [localForceRender, setLocalForceRender] = useState(0);

  const { fetchCampaigns, mountedRef } = useRefreshLogic(status);
  
  // MODIFIED: Still get filtered campaigns but don't use them for rendering
  const { filteredCampaigns, filters } = useCampaignFilters(campaigns);

  // Use the extracted campaign refresh hook
  const { handleFetchCampaigns } = useCampaignRefresh(
    fetchCampaigns, 
    mountedRef, 
    setIsLoading, 
    setError, 
    setErrorDetails, 
    setFetchCompleted, 
    setInsightsFetchStatus,
    setCampaignsFetchStatus,
    setCampaigns,
    updateCampaigns,
    setLocalForceRender
  );

  // Use the extracted UI refresh hook
  const { exposedForceUiRefresh } = useUiRefresh(forceUiRefresh, setLocalForceRender);

  // Add loading timeout management
  useLoadingTimeout(
    isLoading,
    setIsLoading,
    setFetchCompleted,
    setInsightsFetchStatus,
    hasEverHadCampaignsRef,
    campaigns
  );

  // Initialize campaign state and handle updates
  useInitialFetch(
    campaigns,
    isLoading,
    hasEverHadCampaignsRef,
    forceUiRefresh,
    setLocalForceRender
  );

  // Set up event listeners for campaign refresh events
  useCampaignEventListeners(
    handleFetchCampaigns,
    incrementDisplayRefresh,
    forceUiRefresh,
    clearCampaigns,
    status
  );

  // NEW: Check if filtered campaigns is empty but we have raw campaigns
  if (filteredCampaigns.length === 0 && campaigns.length > 0) {
    console.warn('⚠️ Filtered campaign list was empty — falling back to raw campaign data');
  }

  return {
    campaigns,  // Always return raw campaigns
    // Bypass filtered campaigns and always return raw campaigns
    filteredCampaigns: campaigns, // MODIFIED: Always return raw campaigns instead of filtered
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: handleFetchCampaigns,
    displayRefresh,
    forceRender: forceRender || localForceRender,
    forceUiRefresh: exposedForceUiRefresh,
    fetchCompleted,
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid
  };
}
