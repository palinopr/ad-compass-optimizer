
import { useCallback, useRef } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from '../useAuthCheck';
import { useAdAccountSelection } from '../useAdAccountSelection';
import { useCampaignFetcher } from '../useCampaignFetcher';
import { toast } from '@/hooks/use-toast';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

export const useRefreshLogic = (status?: string) => {
  const { validateAuthentication } = useAuthCheck();
  const { getSelectedAdAccount } = useAdAccountSelection();
  const { fetchCampaignData } = useCampaignFetcher();
  
  const isFetchingRef = useRef(false);
  const lastFetchTimeRef = useRef(0);
  const mountedRef = useRef(true);

  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    const now = Date.now();
    if (isFetchingRef.current && !forceRefresh) {
      console.log('Fetch already in progress, skipping this request');
      return null;
    }
    
    if (now - lastFetchTimeRef.current < 5000 && !forceRefresh) {
      console.log('Throttling fetch campaigns request - too soon after last fetch');
      return null;
    }
    
    isFetchingRef.current = true;
    lastFetchTimeRef.current = now;
    
    try {
      console.log('[CAMPAIGNS TAB] Starting campaign fetch process...', { status, forceRefresh });
      
      const token = metaAuthService.getAccessToken();
      console.log('[CAMPAIGNS TAB] Token check:', {
        exists: !!token,
        length: token ? token.length : 0,
        snippet: token ? `${token.substring(0, 5)}...${token.substring(token.length - 5)}` : 'null'
      });
      
      if (!token || token.length < 50) {
        console.log('[CAMPAIGNS TAB] Invalid token, cancelling fetch');
        return { error: 'Not authenticated with Meta. Please connect your account.' };
      }
      
      const authResult = validateAuthentication();
      console.log('[CAMPAIGNS TAB] Auth validation result:', {
        isValid: authResult.isValid,
        error: authResult.error || 'none'
      });
      
      if (!authResult.isValid) {
        return { error: authResult.error };
      }
      
      const accountResult = getSelectedAdAccount();
      console.log('[CAMPAIGNS TAB] Selected account result:', {
        hasAccount: accountResult.hasAccount,
        adAccountId: accountResult.adAccountId,
        error: accountResult.error || 'none',
        details: accountResult.errorDetails || 'none'
      });
      
      if (!accountResult.hasAccount) {
        return { 
          error: accountResult.error,
          errorDetails: accountResult.errorDetails 
        };
      }

      const currentAccountId = accountResult.adAccountId;
      localStorage.setItem('last_fetched_ad_account', currentAccountId);
      
      console.log('[CAMPAIGNS TAB] Fetch triggered with:', {
        token: `${token.substring(0, 10)}...${token.substring(token.length - 10)}`,
        adAccountId: currentAccountId,
        endpoint: `/act_${currentAccountId}/campaigns`,
        status: status || 'all'
      });
      
      const result = await fetchCampaignData(token, currentAccountId, status);
      console.log('[CAMPAIGNS TAB] Fetch result:', {
        success: !result.error,
        campaignsCount: result.campaigns?.length || 0,
        error: result.error || 'none'
      });
      
      return result;
    } finally {
      if (mountedRef.current) {
        isFetchingRef.current = false;
      }
    }
  }, [status, validateAuthentication, getSelectedAdAccount, fetchCampaignData]);

  return {
    fetchCampaigns,
    isFetchingRef,
    lastFetchTimeRef,
    mountedRef
  };
};
