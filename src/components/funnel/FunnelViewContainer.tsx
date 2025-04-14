
import React from 'react';
import { useCampaigns } from '@/hooks/campaigns';
import FunnelView from './FunnelView';
import FunnelControls from './FunnelControls';
import { Card } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { MetaFunnelService } from '@/services/api/MetaFunnelService';
import { useState, useEffect } from 'react';
import { metaAuthService } from '@/services/MetaAuthService';
import { FunnelData } from '@/services/api/types/funnelTypes';
import { useFunnelFilters } from '@/hooks/funnel/useFunnelFilters';
import { toast } from '@/hooks/use-toast';
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';

const FunnelViewContainer = () => {
  const { campaigns, isLoading: campaignsLoading, refetchCampaigns } = useCampaigns();
  const [funnelData, setFunnelData] = useState<FunnelData>({ campaigns: [], adsets: [], ads: [] });
  const [isFetchingFunnel, setIsFetchingFunnel] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);
  const [lastFetchedAdAccount, setLastFetchedAdAccount] = useState<string | null>(null);

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
    const fetchFunnelData = async () => {
      // Safely get token and ad account ID
      let token: string | null = null;
      let selectedAdAccount: string | null = null;
      let isMockMode = false;
      
      // Safe environment check
      if (typeof window !== 'undefined') {
        token = metaAuthService.getAccessToken();
        
        try {
          if (typeof localStorage !== 'undefined') {
            selectedAdAccount = localStorage.getItem('selected_ad_account');
            isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true" || 
                       MetaFunnelService.isMockMode();
          }
        } catch (e) {
          console.error("Error accessing localStorage in FunnelViewContainer:", e);
        }
      }
      
      if (!token && !isMockMode) {
        setFunnelError('Missing access token or ad account');
        return;
      }

      if (!selectedAdAccount && !isMockMode) {
        setFunnelError('No ad account selected');
        return;
      }
      
      // If ad account hasn't changed and we have data, skip refetching
      if (selectedAdAccount === lastFetchedAdAccount && 
          funnelData.campaigns.length > 0 && 
          !isMockMode) {
        return;
      }

      try {
        setIsFetchingFunnel(true);
        console.log('[MOCK DEBUG] FunnelViewContainer: Fetching funnel data for account:', selectedAdAccount);
        const data = await MetaFunnelService.fetchFunnelData(
          token || 'mock-token', 
          selectedAdAccount || 'act_mock_account'
        );
        
        console.log(`[MOCK DEBUG] FunnelViewContainer: Received funnel data with ${data.campaigns.length} campaigns`);
        setFunnelData(data);
        setLastFetchedAdAccount(selectedAdAccount);
        
        // If in mock mode and we have data but campaigns state is empty or stale, trigger a refresh
        if (isMockMode && data.campaigns.length > 0) {
          console.log("[MOCK DEBUG] Ensuring campaign state is in sync with funnel data");
          
          // Small delay to ensure state updates happen after render
          setTimeout(() => {
            // Force UI refresh for the campaign components
            triggerCampaignRefresh(true);
          }, 500);
        }
        
        setFunnelError(null);
      } catch (err) {
        console.error('[MOCK DEBUG] Error fetching funnel data:', err);
        setFunnelError(err instanceof Error ? err.message : 'Failed to fetch funnel data');
      } finally {
        setIsFetchingFunnel(false);
      }
    };

    fetchFunnelData();
  }, [campaigns.length, refetchCampaigns, lastFetchedAdAccount, funnelData.campaigns.length]);

  return (
    <Card>
      <div className="p-6">
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
        <FunnelView 
          campaigns={filteredData.campaigns} 
          adsets={filteredData.adsets} 
          ads={filteredData.ads} 
        />
        
        {campaignsLoading || isFetchingFunnel ? (
          <div className="flex justify-center my-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
          </div>
        ) : null}
        
        {funnelError && (
          <div className="p-4 text-center text-red-500 bg-red-50 rounded-md mt-4">
            {funnelError}
          </div>
        )}
      </div>
    </Card>
  );
};

export default FunnelViewContainer;
