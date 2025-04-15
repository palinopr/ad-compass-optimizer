
import { useCallback, useRef, useEffect } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { metaAuthService } from '@/services/MetaAuthService';
import { CampaignThrottling } from '@/services/api/campaign/throttling';

export const useRefreshLogic = (status?: string) => {
  const mountedRef = useRef(true);
  const lastRefreshTimeRef = useRef(0);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    try {
      console.log('[REFRESH LOGIC] fetchCampaigns called', { forceRefresh, status });
      
      // Ensure we have a valid token
      const token = metaAuthService.getAccessToken();
      console.log('[REFRESH LOGIC] Token check:', token ? 'Token exists' : 'No token');
      
      // Get selected ad account
      const selectedAdAccount = localStorage.getItem('selected_ad_account');
      console.log('[REFRESH LOGIC] Selected account:', selectedAdAccount || 'None');
      
      if (!token || !selectedAdAccount) {
        console.error('[REFRESH LOGIC] Missing token or account');
        return { 
          error: 'Missing authentication token or ad account', 
          campaigns: [] 
        };
      }

      // Check throttling (bypass if forceRefresh is true)
      try {
        if (!forceRefresh) {
          CampaignThrottling.checkThrottling(selectedAdAccount);
        } else {
          console.log('[REFRESH LOGIC] Force refresh - bypassing throttling');
        }
      } catch (throttleError: any) {
        console.error('[REFRESH LOGIC] Throttled:', throttleError.message);
        return {
          error: throttleError.message,
          campaigns: [],
          errorDetails: { throttled: true }
        };
      }

      // Log the actual fetch request
      console.log(`[REFRESH LOGIC] Fetching data for act_${selectedAdAccount} with date_preset=last_28d`);
      
      // Update last refresh time
      lastRefreshTimeRef.current = Date.now();
      localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
      localStorage.setItem('campaign_fetch_attempts', 
        ((parseInt(localStorage.getItem('campaign_fetch_attempts') || '0')) + 1).toString());
      localStorage.setItem('last_campaign_fetch_account', selectedAdAccount);
      
      // Fetch the data
      const data = await MetaFunnelService.fetchFunnelData(token, selectedAdAccount);
      
      console.log(`[REFRESH LOGIC] Fetch successful, received ${data.campaigns.length} campaigns`);
      return { campaigns: data.campaigns, error: null };
      
    } catch (error: any) {
      console.error('[REFRESH LOGIC] Fetch error:', error);
      return {
        error: error.message || 'Failed to fetch campaigns',
        campaigns: [],
        errorDetails: error
      };
    }
  }, [status]);

  return {
    fetchCampaigns,
    mountedRef,
    lastRefreshTimeRef
  };
};
