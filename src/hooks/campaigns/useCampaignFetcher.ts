
import { useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useErrorHandler } from './fetch-hooks/useErrorHandler';
import { useFetchState } from './fetch-hooks/useFetchState';
import { useTokenValidation } from './fetch-hooks/useTokenValidation';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import { getCachedCampaigns, storeCampaignsInCache } from './fetch-utils/campaignCache';
import { BaseApiService } from '@/services/api/BaseApiService';
import { mockFunnelData } from '@/services/api/mock/mockCampaignData';

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
  
  // Function to check if mock mode is active
  const isMockMode = () => {
    return localStorage.getItem("USE_MOCK_MODE") === "true";
  };

  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string,
    forceRefresh: boolean = false
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    // Handle mock mode
    if (isMockMode()) {
      console.log('🎭 Mock mode: Returning mock campaign data');
      
      // Get campaigns from mock data
      let campaigns = [...mockFunnelData.campaigns];
      
      // Apply status filter if provided
      if (status && status !== 'all') {
        campaigns = campaigns.filter(campaign => 
          campaign.status?.toLowerCase() === status.toLowerCase()
        );
      }
      
      return { campaigns, error: null };
    }
    
    if (!canFetch()) {
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress or throttled',
        errorDetails: { concurrent: true, throttled: true }
      };
    }

    if (!forceRefresh) {
      const { campaigns, isFresh } = getCachedCampaigns(adAccountId);
      if (campaigns && isFresh) {
        console.log(`Using cached campaigns for account ${adAccountId}`);
        return { 
          campaigns, 
          error: null
        };
      }
    }
    
    startFetch();
    clearErrors();
    
    try {
      console.log('[CAMPAIGN DEBUG] Starting fetch for account:', adAccountId);
      console.log('[CAMPAIGN DEBUG] Token starts with:', token ? token.substring(0, 5) + '...' : 'null');

      const tokenValidation = validateToken();
      if (!tokenValidation.isValid) {
        console.error('[CAMPAIGN DEBUG] Token validation failed:', tokenValidation.error);
        return { campaigns: [], error: tokenValidation.error };
      }

      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('last_campaign_fetch_account', adAccountId);

      const MetaCampaignService = (await import('@/services/api/MetaCampaignService')).default;
      console.log('[CAMPAIGN DEBUG] Calling MetaCampaignService.fetchCampaigns...');
      const campaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId);
      
      console.log('[CAMPAIGN DEBUG] Fetch successful:', campaigns.length, 'campaigns returned');
      
      if (mountedRef.current) {
        storeCampaignsInCache(campaigns, adAccountId);
        
        localStorage.setItem('last_campaign_count', campaigns.length.toString());
        localStorage.setItem('last_campaign_fetch_success', 'true');
        
        if (campaigns.length > 0) {
          toast({
            title: "Campaign Data Loaded Successfully",
            description: `Found ${campaigns.length} campaigns.`,
            variant: "default",
          });
        }

        const appUsage = BaseApiService.lastResponseHeaders['x-app-usage'];
        if (appUsage) {
          try {
            const usage = JSON.parse(appUsage);
            if (usage.call_count > 80 || usage.total_cputime > 80 || usage.total_time > 80) {
              toast({
                title: "⚠️ Approaching Meta Rate Limit",
                description: "Please refresh less frequently to avoid rate limiting.",
                variant: "destructive",
                duration: 10000,
              });
              
              localStorage.setItem('last_rate_limit_warning', new Date().toISOString());
              increaseCooldown();
            }
          } catch (e) {
            console.error('Error parsing Meta API usage headers:', e);
          }
        }
      }

      return { campaigns, error: null };
    } catch (err: any) {
      console.error('[CAMPAIGN DEBUG] Fetch error:', err);
      
      // Log error details
      console.error('[CAMPAIGN DEBUG] Error type:', typeof err);
      console.error('[CAMPAIGN DEBUG] Error properties:', Object.keys(err));
      
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
      return { campaigns: [], error, errorDetails };
    } finally {
      endFetch();
    }
  }, [canFetch, startFetch, endFetch, clearErrors, handleError, validateToken, mountedRef, increaseCooldown]);

  const debouncedFetchCampaignData = useCallback(
    debounce(fetchCampaignData, 1000),
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
