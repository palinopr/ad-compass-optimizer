
import { useState, useEffect } from 'react';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { FunnelData } from '@/services/api/types/funnelTypes';
import { metaAuthService } from '@/services/MetaAuthService';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { CampaignQueryBuilder } from '@/services/api/campaign/fetching/campaignQueryBuilder';

export const useFunnelData = () => {
  const [funnelData, setFunnelData] = useState<FunnelData>({ campaigns: [], adsets: [], ads: [] });
  const [isFetchingFunnel, setIsFetchingFunnel] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);
  const [lastFetchedAdAccount, setLastFetchedAdAccount] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [lastRequestDetails, setLastRequestDetails] = useState<any>(null);
  const [datePreset, setDatePreset] = useState<string>('last_28d');
  const [buildVersion, setBuildVersion] = useState<string>('');

  // Initialize build version and date preset
  useEffect(() => {
    const version = CampaignQueryBuilder.getVersion();
    const timestamp = CampaignQueryBuilder.getBuildTimestamp();
    setBuildVersion(version);
    
    // Extract date preset directly from query
    const queryWithDatePreset = CampaignQueryBuilder.buildCampaignQuery();
    const extractedDatePreset = queryWithDatePreset.match(/date_preset\(([^)]+)\)/)?.[1] || 'unknown';
    setDatePreset(extractedDatePreset);
    
    console.log(`[FUNNEL] Running on build version: ${version} (${timestamp})`);
    console.log(`[FUNNEL] Using date preset: ${extractedDatePreset}`);
    
    // Force clear all caches to ensure we use the fresh config
    localStorage.removeItem('campaign_query_cache');
    localStorage.removeItem('campaign_data_cache');
    
    toast({
      title: "Build Version",
      description: `Running ${version} with ${extractedDatePreset} date preset`,
      duration: 5000
    });
    
    setTimeout(() => {
      triggerCampaignRefresh(true);
    }, 500);
  }, []);

  // Load stored API response
  useEffect(() => {
    try {
      const storedResponse = localStorage.getItem('raw_campaign_response');
      if (storedResponse) {
        try {
          const parsed = JSON.parse(storedResponse);
          setRawApiResponse(parsed);
          console.log('[FUNNEL DEBUG] Loaded stored API response:', parsed);
        } catch (e) {
          console.error('[FUNNEL DEBUG] Error parsing stored response:', e);
          setRawApiResponse({ text: storedResponse });
        }
      }
      
      const storedError = localStorage.getItem('raw_campaign_error_response');
      if (storedError) {
        try {
          const parsedError = JSON.parse(storedError);
          if (!rawApiResponse) {
            setRawApiResponse({ error: parsedError });
          }
          console.log('[FUNNEL DEBUG] Loaded stored error response:', parsedError);
        } catch (e) {
          console.error('[FUNNEL DEBUG] Error parsing error response:', e);
        }
      }
    } catch (e) {
      console.error('[FUNNEL DEBUG] Error loading stored API response:', e);
    }
  }, [retryCount]);

  // Fetch funnel data
  useEffect(() => {
    const fetchFunnelData = async () => {
      let token: string | null = null;
      const formattedAccount = getFormattedAdAccountId();
      
      if (typeof window !== 'undefined') {
        token = metaAuthService.getAccessToken();
      }
      
      console.log('[FUNNEL] Fetch attempt with token:', token ? 'Valid token' : 'No token');
      console.log('[FUNNEL] Selected ad account:', formattedAccount);
      
      if (!token) {
        setFunnelError('Missing access token');
        return;
      }

      if (!formattedAccount) {
        setFunnelError('No ad account selected');
        return;
      }
      
      setLastRequestDetails({
        endpoint: `${formattedAccount}/campaigns`,
        accountId: formattedAccount,
        tokenLength: token?.length || 0,
        timestamp: new Date().toISOString(),
        datePreset: datePreset
      });
      
      if (formattedAccount === lastFetchedAdAccount && 
          funnelData.campaigns.length > 0 &&
          retryCount === 0) {
        return;
      }

      try {
        setIsFetchingFunnel(true);
        console.log('[FUNNEL] Fetching funnel data for account:', formattedAccount);
        
        // Important: Log the exact API URL format that will be used with the correct datePreset
        const campaignsUrl = `https://graph.facebook.com/v17.0/${formattedAccount}/campaigns?fields=id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(${datePreset}){impressions,clicks,spend,actions,cost_per_action_type}&access_token=[REDACTED]`;
        console.log('[FUNNEL] API URL format:', campaignsUrl);
        
        const data = await MetaFunnelService.fetchFunnelData(token, formattedAccount);
        
        try {
          const storedResponse = localStorage.getItem('raw_campaign_response');
          if (storedResponse) {
            try {
              const parsed = JSON.parse(storedResponse);
              setRawApiResponse(parsed);
            } catch (e) {
              setRawApiResponse({ text: storedResponse });
            }
          }
        } catch (e) {
          console.error('[FUNNEL] Error loading API response:', e);
        }
        
        console.log(`[FUNNEL] Received funnel data with ${data.campaigns.length} campaigns`);
        if (data.campaigns.length > 0) {
          console.log('[FUNNEL] First campaign sample:', data.campaigns[0]);
        } else {
          console.warn('[FUNNEL] No campaigns found in response');
        }
        
        setFunnelData(data);
        setLastFetchedAdAccount(formattedAccount);
        setFunnelError(null);
        
        if (data.campaigns.length > 0) {
          console.log("[FUNNEL] Ensuring campaign state is in sync with funnel data");
          
          setTimeout(() => {
            triggerCampaignRefresh(true);
          }, 500);
        } else {
          console.warn('[FUNNEL] No campaigns received from API');
        }
      } catch (err: any) {
        console.error('[FUNNEL] Error fetching funnel data:', err);
        
        if (err?.error) {
          console.error('[FUNNEL] API Error details:', {
            message: err.error.message,
            code: err.error.code,
            type: err.error.type,
            subcode: err.error.error_subcode
          });
          
          try {
            const storedError = localStorage.getItem('raw_campaign_error_response');
            if (storedError) {
              try {
                const parsedError = JSON.parse(storedError);
                setRawApiResponse({ error: parsedError });
              } catch (e) {
                setRawApiResponse({ text: storedError });
              }
            }
          } catch (e) {
            console.error('[FUNNEL] Error loading API error:', e);
          }
        }
        
        const errorMessage = err instanceof Error 
          ? err.message 
          : (err?.error?.message || 'Failed to fetch funnel data');
        
        setFunnelError(errorMessage);
                     
        if (err?.error) {
          console.error('[FUNNEL] Error details:', {
            code: err.error.code,
            type: err.error.type,
            message: err.error.message
          });
        }
      } finally {
        setIsFetchingFunnel(false);
      }
    };

    fetchFunnelData();
  }, [lastFetchedAdAccount, retryCount, datePreset, funnelData.campaigns.length]);

  const getFormattedAdAccountId = () => {
    let selectedAdAccount = null;
    try {
      if (typeof localStorage !== 'undefined') {
        selectedAdAccount = localStorage.getItem('selected_ad_account');
      }
    } catch (e) {
      console.error("Error accessing localStorage in FunnelViewContainer:", e);
    }
    
    if (!selectedAdAccount) return null;
    
    return selectedAdAccount.startsWith('act_') 
      ? selectedAdAccount
      : `act_${selectedAdAccount}`;
  };

  const handleManualRefresh = () => {
    console.log('[FUNNEL] Manually triggering refresh...');
    setRetryCount(prev => prev + 1);
    triggerCampaignRefresh(true);
    toast({
      title: "Refreshing campaigns",
      description: `Fetching latest data from Meta with ${datePreset} preset (${buildVersion})...`
    });
  };

  return {
    funnelData,
    isFetchingFunnel,
    funnelError,
    rawApiResponse,
    lastRequestDetails,
    buildVersion,
    datePreset,
    handleManualRefresh
  };
};
