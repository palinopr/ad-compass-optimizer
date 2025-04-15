
import { toast } from '@/hooks/use-toast';
import { BaseApiService } from '@/services/api/BaseApiService';
import { validateToken } from './tokenUtils';
import { runFinalDiagnosticCheck } from '@/utils/campaign-diagnostics/finalDiagnosticCheck';

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

export const logFetchDetails = (
  adAccountId: string,
  token: string | null,
  error?: any
) => {
  if (error) {
    console.error('[CAMPAIGNS TAB] Fetch error details:', {
      error,
      message: error?.message,
      stack: error?.stack?.substring(0, 200) || 'No stack',
      adAccountId
    });
    return;
  }

  console.log('[CAMPAIGNS TAB] Preparing to call API with:', {
    adAccountId,
    tokenLength: token?.length,
    tokenStart: token?.substring(0, 5) + '...',
    tokenEnd: '...' + token?.substring(token?.length - 5),
    endpoint: `/act_${adAccountId}/campaigns`
  });
};

export const prepareFetchRequest = async (
  token: string,
  adAccountId: string,
  isMockMode: boolean
) => {
  if (!isMockMode) {
    const tokenValidation = validateToken(token);
    console.log('[CAMPAIGNS TAB] Token validation:', tokenValidation);
    
    if (!tokenValidation.isValid) {
      console.error('[CAMPAIGNS TAB] Token validation failed:', tokenValidation.error);
      return { error: tokenValidation.error };
    }

    console.log('[CAMPAIGNS TAB] Running diagnostic check...');
    const diagnosticResult = await runFinalDiagnosticCheck();
    if (!diagnosticResult.success) {
      console.error('[CAMPAIGNS TAB] Diagnostic check failed:', diagnosticResult.error);
      throw new Error(diagnosticResult.error);
    }
  }

  return { error: null };
};
