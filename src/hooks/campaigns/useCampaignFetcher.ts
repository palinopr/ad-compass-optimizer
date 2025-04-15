
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
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    console.log('[CAMPAIGNS DEBUG] Starting campaign fetch...');
    
    // Validate token and account ID immediately
    if (!token) {
      console.error('[CAMPAIGNS DEBUG] Missing Meta access token');
      return { 
        campaigns: [], 
        error: '🔴 Please authenticate with Meta to load campaigns.',
        errorDetails: { invalid: true }
      };
    }

    // Validate ad account ID format
    if (!adAccountId || !/^act_\d+$/.test(adAccountId)) {
      console.error('[CAMPAIGNS DEBUG] Invalid or missing ad account ID:', adAccountId);
      return { 
        campaigns: [], 
        error: '🔴 Please select a valid ad account to load campaigns.',
        errorDetails: { invalid: true }
      };
    }

    if (!canFetch()) {
      console.log('[CAMPAIGNS DEBUG] Fetch blocked: already in progress or throttled');
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress or throttled',
        errorDetails: { concurrent: true, throttled: true }
      };
    }

    startFetch();
    clearErrors();
    
    try {
      console.log('[CAMPAIGNS DEBUG] Starting API fetch for account:', adAccountId);
      
      const { error: prepError } = await prepareFetchRequest(token, adAccountId);
      if (prepError) {
        console.error('[CAMPAIGNS DEBUG] Preparation error:', prepError);
        return { campaigns: [], error: prepError };
      }

      logFetchDetails(adAccountId, token);

      console.log('[CAMPAIGNS DEBUG] Calling MetaFunnelService.fetchFunnelData...');
      const data = await MetaFunnelService.fetchFunnelData(token, adAccountId);
      console.log('[CAMPAIGNS DEBUG] Fetch successful, campaigns:', data.campaigns.length);
      
      handleSuccessfulFetch(data.campaigns, mountedRef, increaseCooldown);
      
      handleFetchSuccess(false);
      return { campaigns: data.campaigns, error: null };
    } catch (err: any) {
      console.error('[CAMPAIGNS DEBUG] Fetch error:', err);
      logFetchDetails(adAccountId, token, err);
      
      if (err.name === 'ThrottleError') {
        toast({
          title: "Campaign Fetch Throttled",
          description: err.message,
          variant: "default",
          duration: 5000,
        });
        return { campaigns: [], error: err.message };
      }

      if (err?.status === 429 || 
          (err?.message && err.message.toLowerCase().includes('rate limit')) ||
          (err?.code === 4 || err?.code === 17)) {
        increaseCooldown();
        
        toast({
          title: "Meta API Rate Limited",
          description: "Too many requests sent to Meta. Please wait a few minutes before trying again.",
          variant: "destructive",
          duration: 10000,
        });
      }
      
      const { error, errorDetails } = handleError(err, adAccountId);
      handleFetchFailure();
      console.error('[CAMPAIGNS DEBUG] Error after handling:', error, errorDetails);
      return { campaigns: [], error, errorDetails };
    } finally {
      endFetch();
      console.log('[CAMPAIGNS DEBUG] Fetch process completed');
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
