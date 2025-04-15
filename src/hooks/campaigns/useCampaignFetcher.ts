
import { useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useErrorHandler } from './fetch-hooks/useErrorHandler';
import { useFetchState } from './fetch-hooks/useFetchState';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { isMockMode, handleMockData } from './fetch-utils/mockModeUtils';
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
    const mockMode = isMockMode();
    
    console.log('[CAMPAIGNS TAB] fetchCampaignData called with:', {
      adAccountId,
      tokenLength: token ? token.length : 0,
      status: status || 'all',
      forceRefresh,
      mockMode
    });
    
    if (mockMode) {
      console.log('🎭 Mock mode: Returning mock campaign data');
      // Use fetchFunnelData with mock token/account
      const mockData = await MetaFunnelService.fetchFunnelData('mock-token', adAccountId);
      handleMockData(mockData, adAccountId);
      handleFetchSuccess(true);
      return { campaigns: mockData.campaigns, error: null };
    }
    
    if (!canFetch()) {
      console.log('[CAMPAIGNS TAB] Fetch blocked: already in progress or throttled');
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress or throttled',
        errorDetails: { concurrent: true, throttled: true }
      };
    }

    startFetch();
    clearErrors();
    
    try {
      console.log('[CAMPAIGNS TAB] Starting API fetch for account:', adAccountId);
      
      const { error: prepError } = await prepareFetchRequest(token, adAccountId, mockMode);
      if (prepError) {
        return { campaigns: [], error: prepError };
      }

      logFetchDetails(adAccountId, token);

      const data = await MetaFunnelService.fetchFunnelData(token, adAccountId);
      handleSuccessfulFetch(data.campaigns, mountedRef, increaseCooldown);
      
      handleFetchSuccess(false);
      return { campaigns: data.campaigns, error: null };
    } catch (err: any) {
      logFetchDetails(adAccountId, token, err);
      
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
