
import { useState, useEffect } from 'react';
import { FunnelData } from '@/services/api/types/funnelTypes';
import { FunnelDateService } from '@/services/api/funnel/FunnelDateService';
import { FunnelStorageService } from '@/services/api/funnel/FunnelStorageService';
import { FunnelFetchService } from '@/services/api/funnel/FunnelFetchService';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

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
    const version = FunnelDateService.getInitialBuildVersion();
    setBuildVersion(version);
    
    // Extract date preset from query
    const extractedDatePreset = FunnelDateService.getDatePresetFromQuery();
    setDatePreset(extractedDatePreset);
    
    // Notify user
    FunnelDateService.notifyUserOfVersion(version, extractedDatePreset);
    
    // Clear caches
    FunnelStorageService.clearCaches();
    
    setTimeout(() => {
      triggerCampaignRefresh(true);
    }, 500);
  }, []);

  // Load stored API response
  useEffect(() => {
    const storedResponse = FunnelStorageService.loadRawApiResponse();
    if (storedResponse) {
      setRawApiResponse(storedResponse);
    }
  }, [retryCount]);

  // Fetch funnel data
  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingFunnel(true);
      
      try {
        const { data, error, accountId } = await FunnelFetchService.fetchFunnelData(
          datePreset,
          buildVersion,
          lastFetchedAdAccount
        );
        
        if (error) {
          setFunnelError(error);
        } else {
          setFunnelData(data);
          if (accountId) {
            setLastFetchedAdAccount(accountId);
          }
          setFunnelError(null);
        }
        
        // Update request details if we actually made a request
        if (accountId) {
          setLastRequestDetails({
            endpoint: `${accountId}/campaigns`,
            accountId: accountId,
            tokenLength: 0, // We don't store the actual token length for security
            timestamp: new Date().toISOString(),
            datePreset: datePreset
          });
        }
      } catch (err) {
        console.error('[FUNNEL] Unexpected error in fetch data effect:', err);
        
        const errorMessage = err instanceof Error 
          ? err.message 
          : 'Failed to fetch funnel data';
        
        setFunnelError(errorMessage);
      } finally {
        setIsFetchingFunnel(false);
      }
    };

    fetchData();
  }, [lastFetchedAdAccount, retryCount, datePreset]);

  const handleManualRefresh = () => {
    setRetryCount(prev => prev + 1);
    FunnelFetchService.triggerManualRefresh(datePreset, buildVersion);
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
