
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

    // Track fetch attempt
    try {
      // Record fetch attempt in localStorage for diagnostics
      if (typeof window !== 'undefined') {
        const attempts = parseInt(localStorage.getItem('campaign_fetch_attempts') || '0', 10);
        localStorage.setItem('campaign_fetch_attempts', (attempts + 1).toString());
        localStorage.setItem('last_manual_campaign_fetch', new Date().toISOString());
      
        // Dispatch event to notify that a fetch attempt is being made
        try {
          const fetchAttemptEvent = new CustomEvent('campaign-fetch-attempt', {
            detail: { accountId: adAccountId, timestamp: new Date().toISOString() }
          });
          window.dispatchEvent(fetchAttemptEvent);
        } catch (e) {
          console.error('[CAMPAIGNS DEBUG] Error dispatching fetch attempt event:', e);
        }
      }
    } catch (e) {
      console.error('[CAMPAIGNS DEBUG] Error tracking fetch attempt:', e);
      // Continue execution - this is non-critical
    }

    // Validate token and account ID immediately
    if (!token) {
      console.error('[CAMPAIGNS DEBUG] Missing Meta access token');
      return { 
        campaigns: [], 
        error: '🔴 Please authenticate with Meta to load campaigns.',
        errorDetails: { invalid: true, message: 'Missing Meta access token', status: 401 }
      };
    }

    // Validate ad account ID format
    if (!adAccountId || !/^act_\d+$/.test(adAccountId)) {
      console.error('[CAMPAIGNS DEBUG] Invalid or missing ad account ID:', adAccountId);
      return { 
        campaigns: [], 
        error: '🔴 Please select a valid ad account to load campaigns.',
        errorDetails: { invalid: true, message: 'Invalid or missing ad account ID', status: 400 }
      };
    }

    // Check for throttling - only allow one request every 30 seconds unless forced
    try {
      const lastFetchTime = localStorage.getItem(`last_api_fetch_time_${adAccountId}`);
      if (!forceRefresh && lastFetchTime) {
        const lastFetch = new Date(lastFetchTime);
        const now = new Date();
        const secondsSinceLastFetch = (now.getTime() - lastFetch.getTime()) / 1000;
        
        if (secondsSinceLastFetch < 30) {
          console.log(`[CAMPAIGNS DEBUG] Throttling: Last fetch was ${secondsSinceLastFetch.toFixed(1)} seconds ago`);
          
          if (!canFetch()) {
            console.log('[CAMPAIGNS DEBUG] Fetch blocked: already in progress or throttled');
            return { 
              campaigns: [], 
              error: `Rate limited. Please wait ${Math.ceil(30 - secondsSinceLastFetch)} seconds before trying again.`,
              errorDetails: { throttled: true, waitTime: Math.ceil(30 - secondsSinceLastFetch), status: 429 }
            };
          }
        }
      }
    } catch (e) {
      console.error('[CAMPAIGNS DEBUG] Error checking throttling:', e);
      // Continue execution - this is non-critical
    }

    if (!canFetch()) {
      console.log('[CAMPAIGNS DEBUG] Fetch blocked: already in progress');
      return { 
        campaigns: [], 
        error: 'A campaign fetch request is already in progress.',
        errorDetails: { concurrent: true, status: 429 }
      };
    }

    startFetch();
    clearErrors();
    
    try {
      console.log('[CAMPAIGNS DEBUG] Starting API fetch for account:', adAccountId);
      
      // Safe preparation
      try {
        const { error: prepError } = await prepareFetchRequest(token, adAccountId);
        if (prepError) {
          console.error('[CAMPAIGNS DEBUG] Preparation error:', prepError);
          return { 
            campaigns: [], 
            error: prepError,
            errorDetails: { message: prepError, status: 400 }
          };
        }
      } catch (prepErr) {
        console.error('[CAMPAIGNS DEBUG] Exception during preparation:', prepErr);
        return { 
          campaigns: [], 
          error: prepErr instanceof Error ? prepErr.message : 'Error preparing fetch request',
          errorDetails: { message: 'Preparation error', status: 500 }
        };
      }

      try {
        logFetchDetails(adAccountId, token);
      } catch (logErr) {
        console.error('[CAMPAIGNS DEBUG] Error logging fetch details:', logErr);
        // Continue execution - this is non-critical
      }

      console.log('[CAMPAIGNS DEBUG] Calling MetaFunnelService.fetchFunnelData...');
      let data;
      try {
        data = await MetaFunnelService.fetchFunnelData(token, adAccountId);
      } catch (fetchErr: any) {
        console.error('[CAMPAIGNS DEBUG] Error fetching funnel data:', fetchErr);
        // Re-throw as a standardized error
        throw {
          message: fetchErr.message || 'Error fetching campaign data',
          status: fetchErr.status || 500,
          code: fetchErr.code,
          name: fetchErr.name
        };
      }

      console.log('[CAMPAIGNS DEBUG] Fetch successful, campaigns:', data.campaigns.length);
      
      try {
        handleSuccessfulFetch(data.campaigns, mountedRef, increaseCooldown);
      } catch (successErr) {
        console.error('[CAMPAIGNS DEBUG] Error in handleSuccessfulFetch:', successErr);
        // Continue execution - this is non-critical
      }
      
      handleFetchSuccess(false);
      
      // Update localStorage with success
      try {
        localStorage.setItem('last_campaign_fetch_success', 'true');
        localStorage.setItem('last_campaign_count', String(data.campaigns.length));
        localStorage.setItem('last_campaign_fetch_time', new Date().toISOString());
        localStorage.setItem(`last_api_fetch_time_${adAccountId}`, new Date().toISOString());
      } catch (storageErr) {
        console.error('[CAMPAIGNS DEBUG] Error updating localStorage:', storageErr);
        // Continue execution - this is non-critical
      }
      
      return { campaigns: data.campaigns, error: null };
    } catch (err: any) {
      console.error('[CAMPAIGNS DEBUG] Fetch error:', err);
      
      try {
        logFetchDetails(adAccountId, token, err);
      } catch (e) {
        console.error('[CAMPAIGNS DEBUG] Error logging fetch details:', e);
      }
      
      // Store detailed error information for debugging
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('last_campaign_fetch_error', JSON.stringify({
            message: err?.message || String(err),
            status: err?.status || err?.code || 'unknown',
            timestamp: new Date().toISOString(),
            details: {
              fbTraceId: err?.fbtraceId || err?.error?.fbtrace_id,
              code: err?.code || err?.error?.code,
              type: err?.type || err?.error?.type,
              subcode: err?.error?.error_subcode
            }
          }));
        }
      } catch (e) {
        console.error('[CAMPAIGNS DEBUG] Error storing error details:', e);
      }
      
      if (err.name === 'ThrottleError') {
        toast({
          title: "Campaign Fetch Throttled",
          description: err.message,
          variant: "default",
          duration: 5000,
        });
        return { 
          campaigns: [], 
          error: err.message,
          errorDetails: { status: 429, message: err.message }
        };
      }

      if (err?.status === 429 || 
          (err?.message && typeof err.message === 'string' && err.message.toLowerCase().includes('rate limit')) ||
          (err?.code === 4 || err?.code === 17)) {
        increaseCooldown();
        
        toast({
          title: "Meta API Rate Limited",
          description: "Too many requests sent to Meta. Please wait a few minutes before trying again.",
          variant: "destructive",
          duration: 10000,
        });
        
        return {
          campaigns: [],
          error: 'Meta API rate limit reached. Please try again in a few minutes.',
          errorDetails: { 
            status: 429, 
            message: err?.message || 'Rate limit error', 
            code: err?.code 
          }
        };
      }
      
      const { error, errorDetails } = handleError(err, adAccountId);
      handleFetchFailure();
      console.error('[CAMPAIGNS DEBUG] Error after handling:', error, errorDetails);
      
      // Set localStorage to indicate fetch failure
      try {
        localStorage.setItem('last_campaign_fetch_success', 'false');
      } catch (e) {
        console.error('[CAMPAIGNS DEBUG] Error updating localStorage:', e);
      }
      
      return { 
        campaigns: [], 
        error, 
        errorDetails: {
          ...errorDetails,
          status: err?.status || err?.code || 500,
          message: err?.message || error,
          type: err?.type || 'ApiError',
          code: err?.code
        }
      };
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
