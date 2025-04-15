
import { useCallback, useRef, useEffect, useState } from 'react';
import { MetaCampaign } from '@/services/api/MetaCampaignService';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { metaAuthService } from '@/services/MetaAuthService';
import { CampaignThrottling } from '@/services/api/campaign/throttling';

export const useRefreshLogic = (status?: string) => {
  const mountedRef = useRef(true);
  const lastRefreshTimeRef = useRef(0);
  // Add a flag to prevent duplicate fetches in rapid succession
  const fetchInProgressRef = useRef(false);
  // Track the current date preset
  const [currentDatePreset, setCurrentDatePreset] = useState<string>('last_28d');
  
  useEffect(() => {
    // Listen for date preset changes
    const handleDatePresetChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.datePreset) {
        console.log(`[REFRESH LOGIC] Date preset changed to: ${customEvent.detail.datePreset}`);
        setCurrentDatePreset(customEvent.detail.datePreset);
      }
    };
    
    window.addEventListener('campaign-date-preset-changed', handleDatePresetChange);
    return () => {
      window.removeEventListener('campaign-date-preset-changed', handleDatePresetChange);
      mountedRef.current = false;
    };
  }, []);
  
  const fetchCampaigns = useCallback(async (forceRefresh = false) => {
    try {
      // Return early if a fetch is already in progress to prevent duplicates
      if (fetchInProgressRef.current && !forceRefresh) {
        console.log('[REFRESH LOGIC] Fetch already in progress, skipping duplicate request');
        return { 
          error: 'A fetch is already in progress', 
          campaigns: [],
          errorDetails: { skipped: true }
        };
      }
      
      fetchInProgressRef.current = true;
      console.log('[REFRESH LOGIC] fetchCampaigns called', { 
        forceRefresh, 
        status,
        datePreset: currentDatePreset 
      });
      
      // Reset insights valid flag before new fetch
      localStorage.setItem('has_valid_campaign_insights', 'false');
      localStorage.setItem('has_campaigns_data', 'false');
      
      try {
        // Ensure we have a valid token
        const token = metaAuthService.getAccessToken();
        console.log('[REFRESH LOGIC] Token check:', token ? 'Token exists' : 'No token');
        
        // Get selected ad account
        const selectedAdAccount = localStorage.getItem('selected_ad_account');
        console.log('[REFRESH LOGIC] Selected account:', selectedAdAccount || 'None');
        
        // Validate that we have both token and account before proceeding
        if (!token || !selectedAdAccount) {
          console.error('[REFRESH LOGIC] Missing token or account');
          fetchInProgressRef.current = false;
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
          fetchInProgressRef.current = false;
          return {
            error: throttleError.message,
            campaigns: [],
            errorDetails: { throttled: true }
          };
        }

        // Log the actual fetch request with the correct date_preset
        console.log(`[REFRESH LOGIC] Fetching data for act_${selectedAdAccount} with date_preset=${currentDatePreset}`);
        
        // Update last refresh time
        lastRefreshTimeRef.current = Date.now();
        localStorage.setItem('last_campaign_fetch_attempt', new Date().toISOString());
        localStorage.setItem('campaign_fetch_attempts', 
          ((parseInt(localStorage.getItem('campaign_fetch_attempts') || '0')) + 1).toString());
        localStorage.setItem('last_campaign_fetch_account', selectedAdAccount);
        localStorage.setItem('last_campaign_fetch_date_preset', currentDatePreset);
        
        // Fetch the data with the current date preset
        const data = await MetaFunnelService.fetchFunnelData(token, selectedAdAccount, currentDatePreset);
        
        console.log(`[REFRESH LOGIC] Fetch successful, received ${data.campaigns.length} campaigns`);
        fetchInProgressRef.current = false;

        // Store fetch completion information
        localStorage.setItem('last_campaign_fetch_completed', new Date().toISOString());
        localStorage.setItem('last_campaign_count', String(data.campaigns.length));
        
        // Mark if we have data or empty result (both are valid fetch completions)
        if (data.campaigns.length === 0) {
          console.log('[REFRESH LOGIC] No campaigns returned from valid API response');
          localStorage.setItem('has_campaigns_data', 'false');
          localStorage.setItem('empty_campaigns_response', 'true');
        } else {
          localStorage.setItem('has_campaigns_data', 'true');
          localStorage.setItem('empty_campaigns_response', 'false');
        }
        
        return { campaigns: data.campaigns, error: null };
      } catch (error: any) {
        console.error('[REFRESH LOGIC] Fetch error:', error);
        localStorage.setItem('last_fetch_error', JSON.stringify({
          message: error.message,
          timestamp: new Date().toISOString()
        }));
        
        fetchInProgressRef.current = false;
        return {
          error: error.message || 'Failed to fetch campaigns',
          campaigns: [],
          errorDetails: error
        };
      }
    } catch (error: any) {
      console.error('[REFRESH LOGIC] Unexpected error:', error);
      fetchInProgressRef.current = false;
      return {
        error: error.message || 'Failed to fetch campaigns',
        campaigns: [],
        errorDetails: error
      };
    } finally {
      // Always ensure fetchInProgress is reset, even if there was an error
      setTimeout(() => {
        fetchInProgressRef.current = false;
      }, 300);
    }
  }, [status, currentDatePreset]);

  return {
    fetchCampaigns,
    mountedRef,
    lastRefreshTimeRef,
    fetchInProgress: fetchInProgressRef.current,
    currentDatePreset
  };
};
