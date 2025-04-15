
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

    // Clear the existing status flags
    localStorage.removeItem('has_valid_campaign_insights');
    
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
        
        // Check if we have valid campaign data with insights
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
            
            // No need for additional insights fetch, they're already in the response
            setFetchCompleted(true);
            setIsLoading(false);
          } else {
            console.log('[CAMPAIGN FETCH] No insights data in campaign response, updating campaigns');
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
                
                // Always mark fetch as completed and exit loading state
                setFetchCompleted(true);
                setIsLoading(false);
              })
              .catch((error) => {
                console.error('[CAMPAIGN FETCH] Error during insights fetch:', error);
                setInsightsFetchStatus('failed');
                setFetchCompleted(true);
                setIsLoading(false);
              });
          }
        } else {
          console.log('[CAMPAIGN FETCH] API returned empty campaigns array');
          localStorage.setItem('has_campaigns_data', 'false');
          localStorage.setItem('empty_campaigns_response', 'true');
          setFetchCompleted(true);
          setIsLoading(false);
          setInsightsFetchStatus(null);
        }
      } else {
        console.warn('[CAMPAIGN FETCH] Fetch returned no campaigns and no error');
        localStorage.setItem('has_campaigns_data', 'false');
        setInsightsFetchStatus('failed');
        setFetchCompleted(true);
        setIsLoading(false);
      }
    }
  }, [fetchCampaigns, mountedRef, setIsLoading, setError, setErrorDetails, updateCampaigns]);

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
        // If we're still loading after 15 seconds, force exit loading state
        if (isLoading) {
          console.log('[CAMPAIGN FETCH] Safety timeout: forcing exit from loading state');
          setIsLoading(false);
          setFetchCompleted(true);
          
          // Check if we have any campaign data before marking insights as failed
          const campaignDataExists = campaigns.length > 0 || localStorage.getItem('has_campaigns_data') === 'true';
          if (campaignDataExists) {
            setInsightsFetchStatus('partial');
          } else {
            setInsightsFetchStatus('failed');
          }
        }
      }, 15000); // 15 second safety timeout
    }
    
    return () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [isLoading, hasEverHadCampaignsRef, campaigns.length]);

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
