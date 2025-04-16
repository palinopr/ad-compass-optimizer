
import { useCallback, useState } from 'react';
import { useRefreshLogic } from './refresh/useRefreshLogic';
import { useCampaignFetchState } from './useCampaignFetchState';
import { useCampaignEventListeners } from './useCampaignEventListeners';
import { useCampaignFilters } from './useCampaignFilters';
import { useLoadingTimeout } from './fetch-hooks/useLoadingTimeout';
import { useInitialFetch } from './fetch-hooks/useInitialFetch';
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
    hasEverHadCampaignsRef,
    fetchCompleted,
    setFetchCompleted,
    insightsFetchStatus,
    setInsightsFetchStatus
  } = useCampaignFetchState();

  const [localForceRender, setLocalForceRender] = useState(0);

  const { fetchCampaigns, mountedRef } = useRefreshLogic(status);
  const { filteredCampaigns, filters } = useCampaignFilters(campaigns);

  const handleFetchCampaigns = useCallback(async (forceRefresh = false) => {
    console.log(`[CAMPAIGN FETCH] handleFetchCampaigns called, forceRefresh: ${forceRefresh}`);
    
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setFetchCompleted(false);
    setInsightsFetchStatus('pending');

    // Clear the existing status flags
    localStorage.removeItem('has_valid_campaign_insights');
    
    const result = await fetchCampaigns(forceRefresh);
    
    if (mountedRef.current) {
      if (result?.error) {
        setError(result.error);
        setErrorDetails(result.errorDetails);
        setInsightsFetchStatus('failed');
        localStorage.setItem('last_campaign_fetch_error_details', JSON.stringify({
          error: result.error,
          timestamp: new Date().toISOString()
        }));
        setIsLoading(false);
        setFetchCompleted(true);
      } else if (result && 'campaigns' in result && Array.isArray(result.campaigns)) {
        console.log(`[CAMPAIGN FETCH] API returned ${result.campaigns.length} campaigns`);
        
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_campaign_count', result.campaigns.length.toString());
        
        const hasValidCampaigns = result.campaigns.length > 0;
        const hasValidInsightsData = result.campaigns.some(campaign => 
          campaign.insights && Object.keys(campaign.insights).length > 0
        );
        
        if (hasValidCampaigns) {
          console.log('[CAMPAIGN FETCH] Valid campaigns found in response');
          localStorage.setItem('has_campaigns_data', 'true');
          
          if (hasValidInsightsData) {
            console.log('[CAMPAIGN FETCH] Valid insights data found in response');
            localStorage.setItem('has_valid_campaign_insights', 'true');
            setInsightsFetchStatus('success');
            setCampaigns(result.campaigns);
            setFetchCompleted(true);
            setIsLoading(false);
          } else {
            console.log('[CAMPAIGN FETCH] No insights data in campaign response, updating campaigns');
            updateCampaigns(result.campaigns)
              .then(insightsResult => {
                if (insightsResult && insightsResult.success) {
                  console.log('[CAMPAIGN FETCH] Insights fetch completed successfully');
                  setInsightsFetchStatus('success');
                  localStorage.setItem('has_valid_campaign_insights', 'true');
                } else if (insightsResult && insightsResult.partial) {
                  console.log('[CAMPAIGN FETCH] Insights fetch partially completed');
                  setInsightsFetchStatus('partial');
                  localStorage.setItem('has_valid_campaign_insights', 'true');
                } else {
                  console.log('[CAMPAIGN FETCH] Insights fetch failed');
                  setInsightsFetchStatus('failed');
                }
                
                setFetchCompleted(true);
                setIsLoading(false);
                setLocalForceRender(prev => prev + 1);
              })
              .catch((error) => {
                console.error('[CAMPAIGN FETCH] Error during insights fetch:', error);
                setInsightsFetchStatus('failed');
                setFetchCompleted(true);
                setIsLoading(false);
                setLocalForceRender(prev => prev + 1);
              });
          }
        } else {
          console.log('[CAMPAIGN FETCH] API returned empty campaigns array');
          localStorage.setItem('has_campaigns_data', 'false');
          localStorage.setItem('empty_campaigns_response', 'true');
          setCampaigns([]);
          setFetchCompleted(true);
          setIsLoading(false);
          setInsightsFetchStatus(null);
        }
      } else {
        console.warn('[CAMPAIGN FETCH] Fetch returned no campaigns and no error');
        localStorage.setItem('has_campaigns_data', 'false');
        setInsightsFetchStatus('failed');
        setCampaigns([]);
        setFetchCompleted(true);
        setIsLoading(false);
      }
    }
  }, [fetchCampaigns, mountedRef, setIsLoading, setError, setErrorDetails, updateCampaigns, setCampaigns]);

  // Create a function to explicitly force UI refresh
  const exposedForceUiRefresh = useCallback(() => {
    console.log('[UI REFRESH] External component called forceUiRefresh');
    forceUiRefresh();
    setTimeout(() => {
      setLocalForceRender(prev => prev + 1);
    }, 50);
  }, [forceUiRefresh]);

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

  return {
    campaigns,
    filteredCampaigns,
    isLoading,
    error,
    errorDetails,
    refetchCampaigns: handleFetchCampaigns,
    displayRefresh,
    forceRender: forceRender || localForceRender,
    forceUiRefresh: exposedForceUiRefresh,
    fetchCompleted,
    insightsFetchStatus
  };
}
