
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
  const [fetchCompleted, setFetchCompleted] = useState(false);
  const [insightsFetchStatus, setInsightsFetchStatus] = useState<'pending' | 'success' | 'partial' | 'failed' | null>(null);

  const { fetchCampaigns, mountedRef } = useRefreshLogic(status);
  const { filteredCampaigns, filters } = useCampaignFilters(campaigns);

  const handleFetchCampaigns = useCallback(async (forceRefresh = false) => {
    console.log(`[CAMPAIGN FETCH] handleFetchCampaigns called, forceRefresh: ${forceRefresh}`);
    
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setFetchCompleted(false);
    setInsightsFetchStatus('pending');

    const result = await fetchCampaigns(forceRefresh);
    
    if (mountedRef.current) {
      if (result?.error) {
        setError(result.error);
        setErrorDetails(result.errorDetails);
        setInsightsFetchStatus('failed');
        // Store error details for better diagnostics
        localStorage.setItem('last_campaign_fetch_error_details', JSON.stringify({
          error: result.error,
          timestamp: new Date().toISOString()
        }));
      } else if (result && 'campaigns' in result && Array.isArray(result.campaigns)) {
        console.log(`[CAMPAIGN FETCH] API returned ${result.campaigns.length} campaigns`);
        
        // Mark that API call completed successfully
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_campaign_count', result.campaigns.length.toString());
        
        // Update campaigns with the fetched data
        updateCampaigns(result.campaigns)
          .then(insightsResult => {
            // Update insights fetch status based on result
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
          })
          .catch(() => {
            console.error('[CAMPAIGN FETCH] Error during insights fetch');
            setInsightsFetchStatus('failed');
          });
        
        // If we have campaigns, mark this in localStorage for synchronization checks
        if (result.campaigns.length > 0) {
          localStorage.setItem('has_campaigns_data', 'true');
          localStorage.setItem('campaign_fetch_timestamp', Date.now().toString());
        } else {
          localStorage.setItem('has_campaigns_data', 'false');
          console.log('[CAMPAIGN FETCH] API returned empty campaigns array');
        }
      } else {
        console.warn('[CAMPAIGN FETCH] Fetch returned no campaigns and no error');
        localStorage.setItem('has_campaigns_data', 'false');
        setInsightsFetchStatus('failed');
      }
      
      // Always mark fetch as completed and exit loading state
      setFetchCompleted(true);
      setIsLoading(false);
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
          setFetchCompleted(true);
          setInsightsFetchStatus('failed');
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
    forceUiRefresh: exposedForceUiRefresh,
    fetchCompleted,
    insightsFetchStatus
  };
}
