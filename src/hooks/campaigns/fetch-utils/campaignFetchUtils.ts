
import { toast } from '@/hooks/use-toast';
import { BaseApiService } from '@/services/api/BaseApiService';
import { validateToken } from './tokenUtils';
import { runFinalDiagnosticCheck } from '@/utils/campaign-diagnostics/finalDiagnosticCheck';
import { CampaignThrottling } from '@/services/api/campaign/throttling';

// Define these constants to remove direct usage of protected properties
const API_BASE_URL = 'https://graph.facebook.com';
const API_VERSION = 'v17.0';

export const handleSuccessfulFetch = (
  campaigns: any[],
  mountedRef: React.MutableRefObject<boolean>,
  increaseCooldown: () => void
) => {
  if (!mountedRef.current) return;

  localStorage.setItem('last_campaign_count', campaigns.length.toString());
  localStorage.setItem('last_campaign_fetch_success', 'true');
  
  if (campaigns.length > 0) {
    toast({
      title: "Campaign Data Loaded Successfully",
      description: `Found ${campaigns.length} campaigns.`,
      variant: "default",
    });
  } else {
    console.warn('[CAMPAIGN FETCH] No campaigns returned from API');
    toast({
      title: "No Campaigns Found",
      description: "The API returned 0 campaigns for your account.",
      variant: "default",
    });
  }

  checkApiUsage(increaseCooldown);
};

export const checkApiUsage = (increaseCooldown: () => void) => {
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
};

export const validateAdAccount = (adAccountId: string | null): boolean => {
  if (!adAccountId) {
    console.error('[CAMPAIGN FETCH] Missing ad account ID');
    return false;
  }
  
  // Store the original ID format for debugging
  localStorage.setItem('last_requested_ad_account', String(adAccountId));
  
  // Must start with act_ or be convertible to the act_ format
  const adAccountIdString = String(adAccountId);
  const formattedId = adAccountIdString.startsWith('act_') ? adAccountIdString : `act_${adAccountIdString}`;
  
  // Basic validation that it's not completely invalid
  if (!/^act_\d+$/.test(formattedId)) {
    console.error('[CAMPAIGN FETCH] Invalid ad account format:', adAccountId);
    localStorage.setItem('ad_account_validation_error', JSON.stringify({
      adAccountId,
      formattedId,
      error: 'Invalid format - must contain only digits after act_ prefix',
      timestamp: new Date().toISOString()
    }));
    return false;
  }
  
  // Store the formatted ID for debugging
  localStorage.setItem('last_formatted_ad_account', formattedId);
  return true;
};

export const logFetchDetails = (
  adAccountId: string | null,
  token: string | null,
  error?: any
) => {
  if (!validateAdAccount(adAccountId)) {
    console.error('[CAMPAIGNS] Invalid or missing ad account ID:', adAccountId);
    throw new Error('🔴 Please select a valid ad account to load campaigns.');
  }

  if (error) {
    // Enhanced error logging
    const errorContext = {
      error: {
        message: error?.message,
        code: error?.error?.code || error?.code,
        type: error?.error?.type || error?.type,
        subcode: error?.error?.error_subcode,
        fbtrace_id: error?.error?.fbtrace_id,
      },
      response: error?.response?.data,
      adAccountId,
      timestamp: new Date().toISOString()
    };

    console.error('[CAMPAIGNS] Fetch error details:', errorContext);
    
    try {
      // Store detailed error information for debugging
      if (typeof window !== 'undefined') {
        localStorage.setItem('campaign_fetch_error', JSON.stringify(errorContext));
        
        if (error.response?.data) {
          localStorage.setItem('raw_campaign_error_response', JSON.stringify(error.response.data));
        }
      }
    } catch (e) {
      console.error('[CAMPAIGNS] Error storing error details:', e);
    }
    return;
  }

  // Get the last manual fetch time for logging
  const lastManualFetch = CampaignThrottling.getLastManualFetchTime();
  if (lastManualFetch) {
    console.log(`[CAMPAIGNS] Last manual fetch time: ${lastManualFetch}`);
  }

  // Make sure we're using a valid account ID format for the API
  const adAccountIdString = String(adAccountId);
  const formattedId = adAccountIdString.startsWith('act_') ? adAccountIdString : `act_${adAccountIdString}`;
  
  // Use a generic URL construction approach
  const fullUrl = `${API_BASE_URL}/${API_VERSION}/${formattedId}/campaigns`;
  
  console.log('[CAMPAIGNS] Preparing to call API with:', {
    adAccountId: formattedId,
    cleanAccountId: formattedId.replace(/^act_/, ''),
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 5) + '...',
    tokenEnd: '...' + token?.substring(token?.length - 5),
    endpoint: `/${formattedId}/campaigns`,
    url: fullUrl,
  });

  // Log the full URL format (without actual token) for debugging - HERE'S THE FIX!
  console.log('[CAMPAIGNS] Full URL format:', 
    `${fullUrl}` +
    `?fields=name,status,daily_budget,effective_status,insights.date_preset(last_28d){impressions,clicks,spend,actions,cost_per_action_type}` +
    `&access_token=[REDACTED]`
  );
  
  // Store request context for debugging
  localStorage.setItem('campaign_fetch_request', JSON.stringify({
    adAccountId: formattedId,
    endpoint: `/${formattedId}/campaigns`,
    timestamp: new Date().toISOString(),
    tokenLength: token?.length || 0
  }));
};

export const prepareFetchRequest = async (
  token: string,
  adAccountId: string
) => {
  // Always ensure ad account ID is properly formatted
  const adAccountIdString = String(adAccountId);
  const formattedId = adAccountIdString.startsWith('act_') ? adAccountIdString : `act_${adAccountIdString}`;
  
  if (!validateAdAccount(formattedId)) {
    return { error: '🔴 Please select a valid ad account to load campaigns.' };
  }

  const tokenValidation = validateToken(token);
  console.log('[CAMPAIGNS] Token validation:', tokenValidation);
  
  if (!tokenValidation.isValid) {
    console.error('[CAMPAIGNS] Token validation failed:', tokenValidation.error);
    return { error: tokenValidation.error };
  }

  console.log('[CAMPAIGNS] Running diagnostic check...');
  const diagnosticResult = await runFinalDiagnosticCheck();
  if (!diagnosticResult.success) {
    console.error('[CAMPAIGNS] Diagnostic check failed:', diagnosticResult.error);
    throw new Error(diagnosticResult.error);
  }

  return { error: null };
};
