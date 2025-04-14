
import { useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useErrorHandler } from './fetch-hooks/useErrorHandler';
import { useFetchState } from './fetch-hooks/useFetchState';
import { useTokenValidation } from './fetch-hooks/useTokenValidation';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';

export function useCampaignFetcher() {
  const { error, errorDetails, handleError, clearErrors } = useErrorHandler();
  const { 
    isLoading, 
    startFetch, 
    debouncedStartFetch,
    endFetch, 
    canFetch, 
    mountedRef, 
    increaseCooldown
  } = useFetchState();
  const { validateToken } = useTokenValidation();

  // Create a debounced fetch implementation
  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    if (!canFetch()) {
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress or throttled',
        errorDetails: { concurrent: true, throttled: true }
      };
    }
    
    startFetch();
    clearErrors();
    
    try {
      const tokenValidation = validateToken();
      if (!tokenValidation.isValid) {
        return { campaigns: [], error: tokenValidation.error };
      }

      // Save to localStorage for troubleshooting
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);

      // Execute the campaign fetch with API service
      const MetaCampaignService = (await import('@/services/api/MetaCampaignService')).default;
      const campaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId);
      
      if (mountedRef.current) {
        localStorage.setItem('last_campaign_count', campaigns.length.toString());
        localStorage.setItem('last_campaign_fetch_success', 'true');
        
        if (campaigns.length > 0) {
          toast({
            title: "Campaign Data Loaded Successfully",
            description: `Found ${campaigns.length} campaigns.`,
            variant: "default",
          });
        }
      }

      return { campaigns, error: null };
    } catch (err: any) {
      // Check for rate limit errors (status 429)
      if (err?.status === 429 || 
          (err?.message && err.message.toLowerCase().includes('rate limit')) ||
          (err?.code === 4 || err?.code === 17)) {
        // Increase cooldown time when rate limits are hit
        increaseCooldown();
        
        toast({
          title: "Meta API Rate Limited",
          description: "Too many requests sent to Meta. Please wait a few minutes before trying again.",
          variant: "destructive",
          duration: 10000,
        });
      }
      
      // Fix: Include the empty campaigns array in the error response
      const { error, errorDetails } = handleError(err, adAccountId);
      return { campaigns: [], error, errorDetails };
    } finally {
      endFetch();
    }
  }, [canFetch, startFetch, endFetch, clearErrors, handleError, validateToken, mountedRef, increaseCooldown]);

  // Create a debounced version of the function
  const debouncedFetchCampaignData = useCallback(
    debounce(fetchCampaignData, 1000), // 1 second debounce
    [fetchCampaignData]
  );

  return { 
    fetchCampaignData,
    debouncedFetchCampaignData,
    isLoading,
    error,
    errorDetails
  };
}
