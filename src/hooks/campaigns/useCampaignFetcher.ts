
import { useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useErrorHandler } from './fetch-hooks/useErrorHandler';
import { useFetchState } from './fetch-hooks/useFetchState';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { handleSuccessfulFetch, logFetchDetails, prepareFetchRequest } from './fetch-utils/campaignFetchUtils';

export function useCampaignFetcher() {
  const { error, errorDetails, handleError, clearErrors } = useErrorHandler();
  const { 
    isLoading, 
    startFetch, 
    debouncedStartFetch,
    endFetch, 
    canFetch, 
    mountedRef, 
    increaseCooldown,
    handleFetchSuccess,
    handleFetchFailure,
    consecutiveFailures
  } = useFetchState();

  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string,
    forceRefresh: boolean = false
  ) => {
    console.log('[CAMPAIGNS DEBUG] Starting campaign fetch...');

    if (!canFetch() && !forceRefresh) {
      console.log('[CAMPAIGNS DEBUG] Fetch already in progress or cooling down');
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress.',
        errorDetails: { concurrent: true, status: 429 }
      };
    }

    startFetch();
    clearErrors();
    
    try {
      const { error: prepError } = await prepareFetchRequest(token, adAccountId);
      if (prepError) {
        endFetch();
        return { campaigns: [], error: prepError };
      }

      logFetchDetails(adAccountId, token);

      // Store attempt timestamp for rate limiting & debugging
      localStorage.setItem('campaign_fetch_timestamp', Date.now().toString());
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());

      const data = await MetaFunnelService.fetchFunnelData(token, adAccountId, 'last_28d');
      
      // Validate the response has campaigns
      if (!data || !data.campaigns || data.campaigns.length === 0) {
        console.warn('[CAMPAIGNS DEBUG] No campaigns returned from API');
        localStorage.setItem('has_campaigns_data', 'false');
        localStorage.setItem('empty_campaigns_response', 'true');
      } else {
        localStorage.setItem('has_campaigns_data', 'true');
        localStorage.setItem('empty_campaigns_response', 'false');
        console.log(`[CAMPAIGNS DEBUG] Successfully fetched ${data.campaigns.length} campaigns`);
        
        // Log the first campaign to verify structure
        if (data.campaigns.length > 0) {
          console.log('[CAMPAIGNS DEBUG] First campaign sample:', {
            id: data.campaigns[0].id,
            name: data.campaigns[0].name,
            hasInsights: !!data.campaigns[0].insights,
            insights: data.campaigns[0].insights ? Object.keys(data.campaigns[0].insights) : 'none'
          });
        }
      }
      
      handleSuccessfulFetch(data.campaigns, mountedRef, increaseCooldown);
      handleFetchSuccess(false);
      
      return { campaigns: data.campaigns, error: null };
    } catch (err: any) {
      console.error('[CAMPAIGNS DEBUG] Fetch error:', err);
      logFetchDetails(adAccountId, token, err);
      
      const { error, errorDetails } = handleError(err, adAccountId);
      handleFetchFailure();
      
      return { campaigns: [], error, errorDetails };
    } finally {
      endFetch();
    }
  }, [canFetch, startFetch, endFetch, clearErrors, handleError, mountedRef, increaseCooldown, handleFetchSuccess, handleFetchFailure]);

  const debouncedFetchCampaignData = useCallback(
    debounce(fetchCampaignData, 1000),
    [fetchCampaignData]
  );

  return { 
    fetchCampaignData,
    debouncedFetchCampaignData,
    isLoading,
    error,
    errorDetails,
    consecutiveFailures
  };
}
