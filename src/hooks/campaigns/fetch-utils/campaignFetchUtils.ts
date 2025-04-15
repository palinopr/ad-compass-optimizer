
import { toast } from '@/hooks/use-toast';
import { BaseApiService } from '@/services/api/BaseApiService';
import { validateToken } from './tokenUtils';
import { runFinalDiagnosticCheck } from '@/utils/campaign-diagnostics/finalDiagnosticCheck';
import { CampaignThrottling } from '@/services/api/campaign/throttling';

// Define API constants that match BaseApiService values
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
  
  // Must start with act_ and contain only digits after the prefix, or be convertible
  const adAccountIdString = String(adAccountId);
  const formattedId = adAccountIdString.startsWith('act_') ? adAccountIdString : `act_${adAccountIdString}`;
  const isValidFormat = /^act_\d+$/.test(formattedId);
  
  if (!isValidFormat) {
    console.error('[CAMPAIGN FETCH] Invalid ad account format:', adAccountId);
    return false;
  }
  
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
    console.error('[CAMPAIGNS] Fetch error details:', {
      error,
      message: error?.message,
      stack: error?.stack?.substring(0, 200) || 'No stack',
      adAccountId
    });
    
    // Save raw error response for debugging if available
    try {
      if (error.response?.data) {
        localStorage.setItem('raw_campaign_error_response', JSON.stringify(error.response.data));
      }
    } catch (e) {
      console.error('[CAMPAIGNS] Error saving error response to storage:', e);
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
  const cleanAccountId = formattedId.replace(/^act_/, '');
  
  console.log('[CAMPAIGNS] Preparing to call API with:', {
    adAccountId: formattedId,
    cleanAccountId,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 5) + '...',
    tokenEnd: '...' + token?.substring(token?.length - 5),
    endpoint: `/${formattedId}/campaigns`,
    url: `${API_BASE_URL}/${API_VERSION}/${formattedId}/campaigns`,
    lastManualFetch
  });

  // Log the full URL format (without actual token) for debugging
  console.log('[CAMPAIGNS] Full URL format:', 
    `${API_BASE_URL}/${API_VERSION}/${formattedId}/campaigns` +
    `?fields=name,status,daily_budget,effective_status,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}` +
    `&access_token=[REDACTED]`
  );
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
