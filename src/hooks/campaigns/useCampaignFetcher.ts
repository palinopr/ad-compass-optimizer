
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
    
    // Check for required parameters first and log detailed information
    if (!token) {
      console.error('[CAMPAIGNS DEBUG] Missing token');
      return { 
        campaigns: [], 
        error: 'Missing Meta access token. Please authenticate.',
        errorDetails: { code: 'NO_TOKEN' }
      };
    }
    
    if (!adAccountId) {
      console.error('[CAMPAIGNS DEBUG] Missing ad account ID');
      return { 
        campaigns: [], 
        error: 'No ad account selected. Please select an account.',
        errorDetails: { code: 'NO_AD_ACCOUNT' }
      };
    }

    // Log the account ID being used for fetching
    console.log(`[CAMPAIGNS DEBUG] Using ad account ID: ${adAccountId}`);

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
      // Store fetch attempt information
      localStorage.setItem('campaign_fetch_timestamp', Date.now().toString());
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('campaign_fetch_ad_account', adAccountId);
      
      // Validate token permissions before making API call
      try {
        validateAdAccountPermissions();
      } catch (permError) {
        console.error('[CAMPAIGNS DEBUG] Permission validation failed:', permError);
        const error = permError instanceof Error ? permError.message : 'Missing required permissions';
        
        // Check if this is the specific Meta permissions error (code 100, subcode 33)
        const metaPermissionsError = 
          (permError as any)?.code === 100 && 
          (permError as any)?.error_subcode === 33;
          
        if (metaPermissionsError) {
          console.warn("🔒 Meta permissions invalid – showing fallback UI");
          localStorage.setItem('meta_permissions_invalid', 'true');
        }
        
        return { 
          campaigns: [], 
          error, 
          errorDetails: { 
            permissionError: true, 
            status: 403,
            message: error,
            code: (permError as any)?.code,
            subcode: (permError as any)?.error_subcode
          } 
        };
      }

      const { error: prepError } = await prepareFetchRequest(token, adAccountId);
      if (prepError) {
        endFetch();
        return { campaigns: [], error: prepError };
      }

      logFetchDetails(adAccountId, token);

      // CHANGED: Using last_30d instead of maximum for more reliable data
      try {
        console.log(`[CAMPAIGNS DEBUG] Fetching campaign data for account ${adAccountId} using "last_30d" date preset`);
        
        const data = await MetaFunnelService.fetchFunnelData(token, adAccountId, 'last_30d');
        
        // NEW: Log raw data response before any processing
        console.log('[RAW API RESPONSE] Complete funnel data:', data);
        console.log('[MetaCampaignService] Raw campaigns response from funnel service:', data);
        
        // Validate the response has campaigns property and it's an array
        if (!data) {
          console.error('[CAMPAIGNS DEBUG] Null or undefined response from API');
          localStorage.setItem('has_campaigns_data', 'false');
          localStorage.setItem('empty_campaigns_response', 'true');
          return { campaigns: [], error: 'Empty response from API', errorDetails: { emptyResponse: true } };
        }
        
        // Make sure campaigns is an array (even if empty)
        let campaigns = Array.isArray(data.campaigns) ? data.campaigns : [];
        
        // NEW: Add logging before and after any processing
        console.log('[CAMPAIGN PIPELINE] Before processing:', {
          campaignCount: campaigns.length,
          hasEmptyCampaigns: campaigns.some(c => Object.keys(c).length === 0),
          firstFew: campaigns.slice(0, 3).map(c => ({ id: c.id, name: c.name }))
        });
        
        // IMPORTANT: Don't filter campaigns - use ALL campaigns as-is
        console.log('[CAMPAIGN PIPELINE] BYPASSING FILTERS - Using all campaigns');
        
        if (campaigns.length === 0) {
          console.warn('[CAMPAIGNS DEBUG] No campaigns returned from API');
          localStorage.setItem('has_campaigns_data', 'false');
          localStorage.setItem('empty_campaigns_response', 'true');
        } else {
          localStorage.setItem('has_campaigns_data', 'true');
          localStorage.setItem('empty_campaigns_response', 'false');
          console.log(`[CAMPAIGNS DEBUG] Successfully fetched ${campaigns.length} campaigns`);
          
          // Check for empty campaign objects
          const emptyCount = campaigns.filter(c => Object.keys(c).length === 0).length;
          if (emptyCount > 0) {
            console.warn(`⚠️ Meta API returned ${emptyCount}/${campaigns.length} empty campaign objects. Possible permissions or token issue.`);
            console.warn(`⚠️ Fetch request URL may be malformed or invalid date_preset/fields parameters`);
          }
          
          // Log the first campaign to verify structure
          if (campaigns.length > 0) {
            console.log('[CAMPAIGNS DEBUG] First campaign sample:', {
              id: campaigns[0]?.id || 'missing-id',
              name: campaigns[0]?.name || 'unnamed',
              hasInsights: !!campaigns[0]?.insights,
              insights: campaigns[0]?.insights ? Object.keys(campaigns[0].insights) : 'none',
              fieldCount: Object.keys(campaigns[0] || {}).length
            });
          }
        }
        
        // NEW: Final pipeline output log
        console.log('[CAMPAIGN PIPELINE] Final output - returning campaigns:', {
          count: campaigns.length,
          allHaveIds: campaigns.every(c => !!c.id),
          allHaveNames: campaigns.every(c => !!c.name)
        });
        
        handleSuccessfulFetch(campaigns, mountedRef, increaseCooldown);
        handleFetchSuccess(false);
        
        return { campaigns, error: null };
      } catch (err: any) {
        console.error('[CAMPAIGNS DEBUG] MetaFunnelService.fetchFunnelData error:', err);
        
        // NEW: Log error in requested format
        console.error('[MetaCampaignService] Failed to fetch campaigns:', err);
        
        // Check for Meta permissions error (code 100, subcode 33)
        if (
          (err?.response?.data?.error?.code === 100 && 
          err?.response?.data?.error?.error_subcode === 33) ||
          (err?.code === 100 && err?.error_subcode === 33)
        ) {
          console.warn("🔒 Meta permissions invalid – showing fallback UI");
          localStorage.setItem('meta_permissions_invalid', 'true');
          
          // Store debugging information
          localStorage.setItem('meta_permissions_error_detail', JSON.stringify({
            timestamp: new Date().toISOString(),
            errorCode: err?.code || err?.response?.data?.error?.code,
            errorSubcode: err?.error_subcode || err?.response?.data?.error?.error_subcode
          }));
          
          return { 
            campaigns: [], 
            error: 'Missing Meta Graph API permissions', 
            errorDetails: { 
              permissionError: true,
              status: 403,
              code: 100,
              subcode: 33,
              message: 'Missing permissions for insights access'
            } 
          };
        }
        
        throw err; // Let the outer catch handle this
      }
    } catch (err: any) {
      console.error('[CAMPAIGNS DEBUG] Fetch error:', err);
      logFetchDetails(adAccountId, token, err);
      
      // Check for "Cannot read properties of undefined (reading 'data')" error
      if (err.message && (
        err.message.includes("Cannot read properties of undefined") ||
        err.message.includes("Cannot read property 'data'")
      )) {
        console.error('[CAMPAIGNS DEBUG] API response structure error:', err);
        return {
          campaigns: [],
          error: 'Invalid API response structure',
          errorDetails: {
            malformedResponse: true,
            message: 'The Meta API response was not in the expected format',
            originalError: err.message
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
