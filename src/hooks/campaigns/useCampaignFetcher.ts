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
import { runFinalDiagnosticCheck } from '@/utils/campaign-diagnostics/finalDiagnosticCheck';

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
  const { validateToken } = useTokenValidation();
  
  const isMockMode = () => {
    return localStorage.getItem("USE_MOCK_MODE") === "true";
  };

  const fetchCampaignData = useCallback(async (
    token: string,
    adAccountId: string, 
    status?: string,
    forceRefresh: boolean = false
  ): Promise<{ campaigns: MetaCampaign[], error: string | null, errorDetails?: any }> => {
    const mockMode = isMockMode();
    
    if (mockMode) {
      console.log('🎭 Mock mode: Returning mock campaign data');
      
      let campaigns = [...mockFunnelData.campaigns];
      
      if (status && status !== 'all') {
        campaigns = campaigns.filter(campaign => 
          campaign.status?.toLowerCase() === status.toLowerCase()
        );
      }
      
      handleFetchSuccess(true); // Pass true to indicate mock mode
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
        console.log(`[CAMPAIGN FETCH] Using cached campaigns for account ${adAccountId}`);
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
      
      const tokenValidation = validateToken();
      if (!tokenValidation.isValid) {
        console.error('[CAMPAIGN FETCH] Token validation failed:', tokenValidation.error);
        return { campaigns: [], error: tokenValidation.error };
      }

      // Run diagnostic check in production mode
      if (!isMockMode()) {
        console.log('[CAMPAIGN FETCH] Running diagnostic check...');
        const diagnosticResult = await runFinalDiagnosticCheck();
        if (!diagnosticResult.success) {
          console.error('[CAMPAIGN FETCH] Diagnostic check failed:', diagnosticResult.error);
          throw new Error(diagnosticResult.error);
        }
      }

      console.log('[CAMPAIGN DEBUG] Token validation:', {
        tokenLength: token ? token.length : 0,
        tokenStart: token ? token.substring(0, 5) + '...' : 'null',
        adAccountId
      });

      const MetaCampaignService = (await import('@/services/api/MetaCampaignService')).default;
      console.log('[CAMPAIGN DEBUG] Calling MetaCampaignService.fetchCampaigns...');
      const campaigns = await MetaCampaignService.fetchCampaigns(token, adAccountId);
      
      console.log('[CAMPAIGN DEBUG] Fetch successful:', {
        campaignCount: campaigns.length,
        adAccountId,
        timestamp: new Date().toISOString()
      });
      
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

      handleFetchSuccess(false); // Pass false to indicate live API mode
      return { campaigns, error: null };
    } catch (err: any) {
      console.error('[CAMPAIGN DEBUG] Fetch error:', {
        error: err,
        type: typeof err,
        properties: Object.keys(err),
        message: err?.message,
        stack: err?.stack
      });
      
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
      handleFetchFailure();
      return { campaigns: [], error, errorDetails };
    } finally {
      endFetch();
    }
  }, [canFetch, startFetch, endFetch, clearErrors, handleError, validateToken, mountedRef, increaseCooldown, handleFetchSuccess, handleFetchFailure]);

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
