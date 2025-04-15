
import React from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import FunnelControls from './FunnelControls';
import { Card } from '@/components/ui/card';
import { Loader2, RefreshCw } from 'lucide-react';
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

  // Function to manually force a refresh
  const handleManualRefresh = () => {
    console.log('[FUNNEL] Manually triggering refresh...');
    setRetryCount(prev => prev + 1);
    triggerCampaignRefresh(true);
    toast({
      title: "Refreshing campaigns",
      description: "Fetching latest data from Meta..."
    });
  };

  useEffect(() => {
    const fetchFunnelData = async () => {
      // Safely get token and ad account ID
      let token: string | null = null;
      let selectedAdAccount: string | null = null;
      
      // Safe environment check
      if (typeof window !== 'undefined') {
        token = metaAuthService.getAccessToken();
        
        try {
          if (typeof localStorage !== 'undefined') {
            selectedAdAccount = localStorage.getItem('selected_ad_account');
          }
        } catch (e) {
          console.error("Error accessing localStorage in FunnelViewContainer:", e);
        }
      }
      
      // Log token and account for debugging
      console.log('[FUNNEL] Fetch attempt with token:', token ? 'Valid token' : 'No token');
      console.log('[FUNNEL] Selected ad account:', selectedAdAccount);
      
      if (!token) {
        setFunnelError('Missing access token');
        return;
      }

      if (!selectedAdAccount) {
        setFunnelError('No ad account selected');
        return;
      }
      
      // Always ensure ad account has act_ prefix
      const formattedAccount = selectedAdAccount.startsWith('act_') 
        ? selectedAdAccount 
        : `act_${selectedAdAccount}`;
      
      // Store request details for debugging
      setLastRequestDetails({
        endpoint: `${formattedAccount}/campaigns`,
        accountId: formattedAccount,
        tokenLength: token?.length || 0,
        timestamp: new Date().toISOString()
      });
      
      // If ad account hasn't changed and we have data, skip refetching
      if (formattedAccount === lastFetchedAdAccount && 
          funnelData.campaigns.length > 0 &&
          retryCount === 0) {
        return;
      }

      try {
        setIsFetchingFunnel(true);
        console.log('[FUNNEL] Fetching funnel data for account:', formattedAccount);
        
        const data = await MetaFunnelService.fetchFunnelData(token, formattedAccount);
        setRawApiResponse(data); // Store raw response for debugging
        
        console.log(`[FUNNEL] Received funnel data with ${data.campaigns.length} campaigns`);
        if (data.campaigns.length > 0) {
          console.log('[FUNNEL] First campaign sample:', data.campaigns[0]);
        }
        
        setFunnelData(data);
        setLastFetchedAdAccount(formattedAccount);
        setFunnelError(null);
        
        // If we have data but campaigns state is empty or stale, trigger a refresh
        if (data.campaigns.length > 0) {
          console.log("[FUNNEL] Ensuring campaign state is in sync with funnel data");
          
          // Small delay to ensure state updates happen after render
          setTimeout(() => {
            // Force UI refresh for the campaign components
            triggerCampaignRefresh(true);
          }, 500);
        } else {
          console.warn('[FUNNEL] No campaigns received from API');
        }
      } catch (err: any) {
        console.error('[FUNNEL] Error fetching funnel data:', err);
        
        // Enhanced error logging
        if (err?.error) {
          console.error('[FUNNEL] API Error details:', {
            message: err.error.message,
            code: err.error.code,
            type: err.error.type,
            subcode: err.error.error_subcode
          });
        }
        
        // Extract more detailed error information for display
        const errorMessage = err instanceof Error 
          ? err.message 
          : (err?.error?.message || 'Failed to fetch funnel data');
        
        setFunnelError(errorMessage);
                     
        // Log detailed error information
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
                {rawApiResponse && (
                  <div className="mt-2 text-left text-xs p-2 bg-gray-100 rounded overflow-auto max-h-32">
                    <pre>{JSON.stringify(rawApiResponse, null, 2)}</pre>
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
      </div>
    </Card>
  );
};

export default FunnelViewContainer;
