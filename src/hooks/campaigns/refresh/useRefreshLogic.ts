
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
      console.log('Starting campaign fetch process...', { status, forceRefresh });
      
      const token = metaAuthService.getAccessToken();
      if (!token || token.length < 50) {
        return { error: 'Not authenticated with Meta. Please connect your account.' };
      }
      
      const authResult = validateAuthentication();
      if (!authResult.isValid) {
        return { error: authResult.error };
      }
      
      const accountResult = getSelectedAdAccount();
      if (!accountResult.hasAccount) {
        return { 
          error: accountResult.error,
          errorDetails: accountResult.errorDetails 
        };
      }

      const currentAccountId = accountResult.adAccountId;
      localStorage.setItem('last_fetched_ad_account', currentAccountId);
      
      const result = await fetchCampaignData(token, currentAccountId, status);
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
