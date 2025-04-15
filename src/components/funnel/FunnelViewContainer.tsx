import React from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import FunnelControls from './FunnelControls';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw, Bug } from 'lucide-react';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { FunnelData } from '@/services/api/types/funnelTypes';
import { useFunnelFilters } from '@/hooks/funnel/useFunnelFilters';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { Button } from '@/components/ui/button';

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

  const handleManualRefresh = () => {
    console.log('[FUNNEL] Manually triggering refresh...');
    setRetryCount(prev => prev + 1);
    triggerCampaignRefresh(true);
    toast({
      title: "Refreshing campaigns",
      description: "Fetching latest data from Meta..."
    });
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
        
        const campaignsUrl = `https://graph.facebook.com/v17.0/${formattedAccount}/campaigns?fields=id,name,objective,status,effective_status,created_time,updated_time,start_time,end_time,daily_budget,lifetime_budget,insights.date_preset(last_30_days){impressions,clicks,spend,actions,cost_per_action_type}&access_token=[REDACTED]`;
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
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Campaign Funnel</h2>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setShowDebug(!showDebug)}
              className="flex items-center gap-2"
            >
              <Bug className="h-4 w-4" />
              {showDebug ? "Hide Debug" : "Debug"}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleManualRefresh} 
              disabled={isFetchingFunnel || campaignsLoading}
            >
              {isFetchingFunnel || campaignsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh Data
            </Button>
          </div>
        </div>
        
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
          <div className="bg-gray-50 p-6 rounded-md text-center">
            {(campaignsLoading || isFetchingFunnel) ? (
              <div className="flex flex-col items-center">
                <Loader2 className="h-6 w-6 animate-spin text-blue-500 mb-2" />
                <p>Loading campaign data...</p>
              </div>
            ) : funnelError ? (
              <div className="text-red-500">
                <p className="font-medium">Error loading campaigns:</p>
                <p>{funnelError}</p>
                {lastRequestDetails && (
                  <div className="mt-2 text-xs bg-gray-100 rounded p-2 text-left">
                    <p><strong>Last request:</strong> {lastRequestDetails.endpoint}</p>
                    <p><strong>Account ID:</strong> {lastRequestDetails.accountId}</p>
                    <p><strong>Token length:</strong> {lastRequestDetails.tokenLength} characters</p>
                    <p><strong>Timestamp:</strong> {lastRequestDetails.timestamp}</p>
                  </div>
                )}
                {showDebug && rawApiResponse && (
                  <div className="mt-4 text-left">
                    <p className="font-medium text-black mb-2">Raw API Response:</p>
                    <div className="text-left text-xs p-2 bg-gray-100 rounded overflow-auto max-h-96">
                      <pre className="whitespace-pre-wrap">
                        {rawApiResponse.error ? 
                          JSON.stringify(rawApiResponse.error, null, 2) : 
                          rawApiResponse.text ?
                            rawApiResponse.text :
                            JSON.stringify(rawApiResponse, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <p>No campaigns found. Try refreshing or selecting a different account.</p>
                <Button 
                  variant="outline" 
                  onClick={handleManualRefresh}
                  className="mt-4"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            )}
          </div>
        )}
        
        {showDebug && rawApiResponse && filteredData.campaigns.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="font-medium mb-2">API Response Debug:</p>
            <div className="text-xs p-2 bg-gray-100 rounded overflow-auto max-h-96">
              <pre className="whitespace-pre-wrap">
                {rawApiResponse.text ?
                  rawApiResponse.text :
                  JSON.stringify(rawApiResponse, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default FunnelViewContainer;
