
import { useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useErrorHandler } from './fetch-hooks/useErrorHandler';
import { useFetchState } from './fetch-hooks/useFetchState';
import { useTokenValidation } from './fetch-hooks/useTokenValidation';
import { toast } from '@/hooks/use-toast';

export function useCampaignFetcher() {
  const { error, errorDetails, handleError, clearErrors } = useErrorHandler();
  const { isLoading, startFetch, endFetch, canFetch, mountedRef } = useFetchState();
  const { validateToken } = useTokenValidation();

  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    if (!canFetch()) {
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress',
        errorDetails: { concurrent: true }
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
      return handleError(err, adAccountId);
    } finally {
      endFetch();
    }
  }, [canFetch, startFetch, endFetch, clearErrors, handleError, validateToken, mountedRef]);

  return { 
    fetchCampaignData,
    isLoading,
    error,
    errorDetails
  };
}
