
import { useCallback } from 'react';
import { resetMetaPermissionsInvalid, handleCampaignFetchError } from '../utils/metaPermissionsUtils';

export function useCampaignRefresh(
  fetchCampaigns: (forceRefresh?: boolean) => Promise<any>,
  mountedRef: React.MutableRefObject<boolean>,
  setIsLoading: (loading: boolean) => void,
  setError: (error: any) => void,
  setErrorDetails: (details: any) => void,
  setFetchCompleted: (completed: boolean) => void,
  setInsightsFetchStatus: (status: 'pending' | 'success' | 'partial' | 'failed' | null) => void,
  setCampaignsFetchStatus: (status: 'success' | 'unauthorized' | 'error' | null) => void,
  setCampaigns: (campaigns: any[]) => void,
  updateCampaigns: (campaigns: any[]) => Promise<any>,
  setLocalForceRender: (cb: (prev: number) => number) => void
) {
  const handleFetchCampaigns = useCallback(async (forceRefresh = false) => {
    console.log(`📊 [CAMPAIGN FETCH] handleFetchCampaigns called, forceRefresh: ${forceRefresh}`);
    
    setIsLoading(true);
    setError(null);
    setErrorDetails(null);
    setFetchCompleted(false);
    setInsightsFetchStatus('pending');
    // Reset campaign fetch status
    setCampaignsFetchStatus(null);
    // Reset Meta permissions invalid flag
    resetMetaPermissionsInvalid();

    // Clear the existing status flags
    localStorage.removeItem('has_valid_campaign_insights');
    
    const result = await fetchCampaigns(forceRefresh);
    
    if (mountedRef.current) {
      if (result?.error) {
        setError(result.error);
        setErrorDetails(result.errorDetails);
        setInsightsFetchStatus('failed');
        
        handleCampaignFetchError(result.error, result.errorDetails, setCampaignsFetchStatus);
        
        setIsLoading(false);
        setFetchCompleted(true);
      } else if (result && 'campaigns' in result && Array.isArray(result.campaigns)) {
        console.log(`✅ [CAMPAIGN FETCH] API returned ${result.campaigns.length} campaigns`);
        
        // Always store campaigns first, regardless of insights status
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_campaign_count', result.campaigns.length.toString());
        setCampaignsFetchStatus('success');
        localStorage.removeItem('campaign_fetch_unauthorized');
        localStorage.removeItem('meta_permissions_invalid');
        
        // BYPASS ALL FILTERING: Always set raw campaigns array
        setCampaigns(result.campaigns);
        
        const hasValidCampaigns = result.campaigns.length > 0;
        const hasValidInsightsData = result.campaigns.some(campaign => 
          campaign.insights && Object.keys(campaign.insights).length > 0
        );
        
        console.log(`[CAMPAIGN FETCH] Campaign validation: hasValidCampaigns=${hasValidCampaigns}, hasValidInsightsData=${hasValidInsightsData}`);
        
        if (hasValidCampaigns) {
          localStorage.setItem('has_campaigns_data', 'true');
          
          if (hasValidInsightsData) {
            console.log('[CAMPAIGN FETCH] Valid insights data found in response');
            localStorage.setItem('has_valid_campaign_insights', 'true');
            setInsightsFetchStatus('success');
          } else {
            console.log('[CAMPAIGN FETCH] No insights data in campaign response, will try to fetch separately');
            // Try to get insights but don't block campaign rendering
            try {
              const insightsResult = await updateCampaigns(result.campaigns);
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
            } catch (error: any) {
              console.error('[CAMPAIGN FETCH] Error during insights fetch:', error);
              
              // Check for specific Meta permissions error in insights fetch
              if (error?.code === 100 && error?.error_subcode === 33) {
                console.log('⚠️ Meta permission error in insights fetch – insights blocked due to missing access');
                resetMetaPermissionsInvalid();
                localStorage.setItem('meta_permissions_invalid', 'true');
              }
              
              setInsightsFetchStatus('failed');
            }
          }
        } else {
          console.log('[CAMPAIGN FETCH] API returned empty campaigns array');
          localStorage.setItem('has_campaigns_data', 'false');
          localStorage.setItem('empty_campaigns_response', 'true');
          setInsightsFetchStatus(null);
        }
        
        // CRITICAL FIX: Always complete fetch and remove loading state
        setFetchCompleted(true);
        setIsLoading(false);
        setLocalForceRender(prev => prev + 1);
      } else {
        console.warn('[CAMPAIGN FETCH] Fetch returned no campaigns and no error');
        localStorage.setItem('has_campaigns_data', 'false');
        setInsightsFetchStatus('failed');
        setCampaignsFetchStatus('error');
        
        // CRITICAL FIX: Ensure we have an empty array to render
        setCampaigns([]);
        setFetchCompleted(true);
        setIsLoading(false);
      }
    }
  }, [fetchCampaigns, mountedRef, setIsLoading, setError, setErrorDetails, updateCampaigns, setCampaigns, 
      setFetchCompleted, setInsightsFetchStatus, setCampaignsFetchStatus, setLocalForceRender]);

  return { handleFetchCampaigns };
}
