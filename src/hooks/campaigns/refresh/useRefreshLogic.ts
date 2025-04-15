
import { useCallback, useRef } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { metaAuthService } from '@/services/MetaAuthService';
import { CampaignThrottling } from '@/services/api/campaign/throttling';

export const useRefreshLogic = (status?: string) => {
  const mountedRef = useRef(true);
  
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    try {
      const token = metaAuthService.getAccessToken();
      const selectedAdAccount = localStorage.getItem('selected_ad_account');
      
      if (!token || !selectedAdAccount) {
        return { 
          error: 'Missing authentication token or ad account', 
          campaigns: [] 
        };
      }

      // Check throttling
      try {
        CampaignThrottling.checkThrottling(selectedAdAccount);
      } catch (throttleError: any) {
        return {
          error: throttleError.message,
          campaigns: [],
          errorDetails: { throttled: true }
        };
      }

      const data = await MetaFunnelService.fetchFunnelData(token, selectedAdAccount);
      return { campaigns: data.campaigns, error: null };
      
    } catch (error: any) {
      return {
        error: error.message || 'Failed to fetch campaigns',
        campaigns: [],
        errorDetails: error
      };
    }
  }, []);

  return {
    fetchCampaigns,
    mountedRef
  };
};
