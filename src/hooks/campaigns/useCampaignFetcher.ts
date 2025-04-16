import { useCallback } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { useErrorHandler } from './fetch-hooks/useErrorHandler';
import { useFetchState } from './fetch-hooks/useFetchState';
import { toast } from '@/hooks/use-toast';
import { debounce } from 'lodash';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { handleSuccessfulFetch, logFetchDetails, prepareFetchRequest } from './fetch-utils/campaignFetchUtils';
import { validateAdAccountPermissions } from '@/services/api/meta-accounts/permissionChecker';
import { metaAuthService } from '@/services/MetaAuthService';
import { TokenFormatDebugger } from '@/utils/debugging/tokenFormatDebugger';

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

    // Log token format for debugging comparison with /me endpoint
    TokenFormatDebugger.logInsightsToken(token);

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
      // Validate token permissions before making API call
      try {
        validateAdAccountPermissions();
      } catch (permError) {
        console.error('[CAMPAIGNS DEBUG] Permission validation failed:', permError);
        const error = permError instanceof Error ? permError.message : 'Missing required permissions';
        return { 
          campaigns: [], 
          error, 
          errorDetails: { 
            permissionError: true, 
            status: 403,
            message: error
          } 
        };
      }

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
      
      // Special handling for 403 errors to provide better error messages
      if (err.status === 403 || (err.message && err.message.includes('403'))) {
        console.error('[CAMPAIGNS DEBUG] 403 Permission error detected');
        
        // Check token freshness
        const tokenInfo = metaAuthService.checkTokenFreshness();
        
        let errorMessage = 'Access denied: Your token lacks required permissions or has expired.';
        if (!tokenInfo.isFresh) {
          errorMessage += ` Token is ${tokenInfo.age} days old and may have expired.`;
        }
        
        return { 
          campaigns: [], 
          error: errorMessage, 
          errorDetails: { 
            permissionError: true,
            status: 403,
            code: err.code || 200,
            subcode: err.error_subcode,
            message: err.message || errorMessage
          } 
        };
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
