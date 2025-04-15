import React from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import FunnelControls from './FunnelControls';
import { Card } from '@/components/ui/card';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { FunnelData } from '@/services/api/types/funnelTypes';
import { useFunnelFilters } from '@/hooks/funnel/useFunnelFilters';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { CampaignQueryBuilder } from '@/services/api/campaign/fetching/campaignQueryBuilder';
import FunnelHeader from './header/FunnelHeader';
import FunnelDebugPanel from './debug/FunnelDebugPanel';
import FunnelEmptyState from './states/FunnelEmptyState';
import FunnelApiResponse from './debug/FunnelApiResponse';

const FunnelViewContainer = () => {
  const { campaigns, isLoading: campaignsLoading, refetchCampaigns } = useCampaigns();
  const [funnelData, setFunnelData] = useState<FunnelData>({ campaigns: [], adsets: [], ads: [] });
  const [isFetchingFunnel, setIsFetchingFunnel] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);
  const [lastFetchedAdAccount, setLastFetchedAdAccount] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [rawApiResponse, setRawApiResponse] = useState<any>(null);
  const [lastRequestDetails, setLastRequestDetails] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(true);
  const [buildVersion, setBuildVersion] = useState<string>('');

  const {
    filteredData,
    sortField,
    sortDirection,
    statusFilter,
    searchQuery,
    setSortField,
    setSortDirection,
    setStatusFilter,
    setSearchQuery
  } = useFunnelFilters(funnelData);

  useEffect(() => {
    const version = CampaignQueryBuilder.getVersion();
    const timestamp = CampaignQueryBuilder.getBuildTimestamp();
    setBuildVersion(version);
    
    console.log(`[FUNNEL] Running on build version: ${version} (${timestamp})`);
    console.log(`[FUNNEL] Using date preset: ${CampaignQueryBuilder.buildCampaignQuery().match(/date_preset\(([^)]+)\)/)?.[1] || 'unknown'}`);
    
    localStorage.removeItem('campaign_query_cache');
    localStorage.removeItem('campaign_data_cache');
    
    toast({
      title: "Build Version",
      description: `Running ${version} with last_28d date preset`,
      duration: 5000
    });
    
    setTimeout(() => {
      triggerCampaignRefresh(true);
    }, 500);
  }, []);

  const handleManualRefresh = () => {
    console.log('[FUNNEL] Manually triggering refresh...');
    setRetryCount(prev => prev + 1);
    triggerCampaignRefresh(true);
    toast({
      title: "Refreshing campaigns",
      description: `Fetching latest data from Meta with last_28d preset (${buildVersion})...`
    });
  };

  const testDirectApiCall = async () => {
    try {
      setIsFetchingFunnel(true);
      toast({
        title: "Testing Direct API Call",
        description: "Making a minimal test request to Meta API..."
      });

      const token = metaAuthService.getAccessToken();
      if (!token) {
        setFunnelError('Missing access token');
        setIsFetchingFunnel(false);
        return;
      }

      const adAccountId = getFormattedAdAccountId();
      if (!adAccountId) {
        setFunnelError('No ad account selected');
        setIsFetchingFunnel(false);
        return;
      }

      console.log('[FUNNEL DEBUG] Making test request for account:', adAccountId);
      const testUrl = `https://graph.facebook.com/v17.0/${adAccountId}?fields=name,account_status&access_token=${token}`;
      
      const response = await fetch(testUrl);
      const responseText = await response.clone().text();
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        data = { parseError: true, text: responseText };
      }
      
      localStorage.setItem('api_test_response', JSON.stringify({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data,
        timestamp: new Date().toISOString(),
        url: testUrl.replace(token, 'REDACTED')
      }));
      
      setRawApiResponse({
        testResponse: {
          status: response.status,
          statusText: response.statusText,
          data
        }
      });
      
      if (!response.ok) {
        setFunnelError(`Test request failed: ${response.status} ${response.statusText}`);
        toast({
          title: "API Test Failed",
          description: `Status ${response.status}: ${data?.error?.message || response.statusText}`,
          variant: "destructive"
        });
      } else {
        toast({
          title: "API Test Successful",
          description: `Connected to account: ${data.name}`,
          variant: "default"
        });
      }
    } catch (err) {
      console.error('[FUNNEL DEBUG] Test API call failed:', err);
      setFunnelError(`Test API call failed: ${err.message}`);
      
      localStorage.setItem('api_test_error', JSON.stringify({
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString()
      }));
    } finally {
      setIsFetchingFunnel(false);
    }
  };

  const verifyPermissions = async () => {
    try {
      const token = metaAuthService.getAccessToken();
      if (!token) {
        toast({
          title: "Missing Token",
          description: "No access token found",
          variant: "destructive"
        });
        return;
      }
      
      toast({
        title: "Checking Permissions",
        description: "Verifying Meta API permissions..."
      });
      
      const response = await fetch(`https://graph.facebook.com/v17.0/me/permissions?access_token=${token}`);
      const data = await response.json();
      
      localStorage.setItem('permissions_check', JSON.stringify({
        data,
        timestamp: new Date().toISOString()
      }));
      
      setRawApiResponse({
        permissions: data
      });
      
      const requiredPermissions = ['ads_read', 'ads_management'];
      const missingPermissions = requiredPermissions.filter(perm => 
        !data.data?.some(p => p.permission === perm && p.status === 'granted')
      );
      
      if (missingPermissions.length > 0) {
        toast({
          title: "Missing Permissions",
          description: `Missing: ${missingPermissions.join(', ')}`,
          variant: "destructive",
          duration: 5000
        });
      } else {
        toast({
          title: "Permissions OK",
          description: "All required permissions are granted",
          variant: "default"
        });
      }
    } catch (err) {
      console.error('[FUNNEL DEBUG] Permission check failed:', err);
      toast({
        title: "Permission Check Failed",
        description: err.message,
        variant: "destructive"
      });
    }
  };

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
        timestamp: new Date().toISOString()
      });
      
      if (formattedAccount === lastFetchedAdAccount && 
          funnelData.campaigns.length > 0 &&
          retryCount === 0) {
        return;
      }

      try {
        setIsFetchingFunnel(true);
        console.log('[FUNNEL] Fetching funnel data for account:', formattedAccount);
        
        const campaignsUrl = `https://graph.facebook.com/v17.0/${formattedAccount}/campaigns?fields=id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(last_28d){impressions,clicks,spend,actions,cost_per_action_type}&access_token=[REDACTED]`;
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
  }, [campaigns.length, refetchCampaigns, lastFetchedAdAccount, retryCount]);

  return (
    <Card>
      <div className="p-6">
        <FunnelHeader
          buildVersion={buildVersion}
          showDebug={showDebug}
          onToggleDebug={() => setShowDebug(!showDebug)}
          onRefresh={handleManualRefresh}
          isLoading={isFetchingFunnel || campaignsLoading}
        />
        
        {showDebug && (
          <FunnelDebugPanel
            lastRequestDetails={lastRequestDetails}
            isLoading={isFetchingFunnel}
            testDirectApiCall={testDirectApiCall}
            verifyPermissions={verifyPermissions}
            buildVersion={buildVersion}
          />
        )}
        
        <FunnelControls
          sortField={sortField}
          sortDirection={sortDirection}
          statusFilter={statusFilter}
          searchQuery={searchQuery}
          onSortFieldChange={setSortField}
          onSortDirectionChange={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          onStatusFilterChange={setStatusFilter}
          onSearchChange={setSearchQuery}
        />
        
        {filteredData.campaigns.length > 0 ? (
          <FunnelView 
            campaigns={filteredData.campaigns} 
            adsets={filteredData.adsets} 
            ads={filteredData.ads} 
          />
        ) : (
          <FunnelEmptyState
            isLoading={campaignsLoading || isFetchingFunnel}
            error={funnelError}
            lastRequestDetails={lastRequestDetails}
            rawApiResponse={rawApiResponse}
            showDebug={showDebug}
            onRefresh={handleManualRefresh}
          />
        )}
        
        {showDebug && rawApiResponse && filteredData.campaigns.length > 0 && (
          <FunnelApiResponse rawApiResponse={rawApiResponse} />
        )}
      </div>
    </Card>
  );
};

export default FunnelViewContainer;
