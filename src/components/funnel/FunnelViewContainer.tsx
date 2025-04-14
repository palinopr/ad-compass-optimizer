
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
  const { campaigns, isLoading, error } = useCampaigns();
  const [funnelData, setFunnelData] = useState<FunnelData>({ campaigns: [], adsets: [], ads: [] });
  const [isFetchingFunnel, setIsFetchingFunnel] = useState(false);
  const [funnelError, setFunnelError] = useState<string | null>(null);

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
      const token = metaAuthService.getAccessToken();
      const selectedAdAccount = localStorage.getItem('selected_ad_account');
      const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
      
      if (!token && !isMockMode) {
        setFunnelError('Missing access token or ad account');
        return;
      }

      if (!selectedAdAccount && !isMockMode) {
        setFunnelError('No ad account selected');
        return;
      }

      try {
        setIsFetchingFunnel(true);
        console.log('[MOCK DEBUG] FunnelViewContainer: Fetching funnel data');
        const data = await MetaFunnelService.fetchFunnelData(
          token || 'mock-token', 
          selectedAdAccount || 'act_mock_account'
        );
        
        console.log(`[MOCK DEBUG] FunnelViewContainer: Received funnel data with ${data.campaigns.length} campaigns`);
        setFunnelData(data);
        setFunnelError(null);
        
        // In mock mode, make sure campaigns are synchronized to global state
        if (isMockMode && data.campaigns.length > 0 && campaigns.length === 0) {
          console.log('[MOCK DEBUG] FunnelViewContainer: Mock mode detected with data, triggering campaign refresh');
          // This will trigger useCampaigns to update its state with mock data
          triggerCampaignRefresh(true);
          
          toast({
            title: "Mock Data Loaded",
            description: `${data.campaigns.length} mock campaigns loaded from funnel data`,
          });
        }
      } catch (err) {
        console.error('[MOCK DEBUG] Error fetching funnel data:', err);
        setFunnelError(err instanceof Error ? err.message : 'Failed to fetch funnel data');
      } finally {
        setIsFetchingFunnel(false);
      }
    };

    fetchFunnelData();
  }, [campaigns.length]);

  if (isLoading || isFetchingFunnel) {
    return (
      <Card>
        <div className="p-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (error || funnelError) {
    return (
      <Card>
        <div className="p-8 text-center text-red-500">
          {error || funnelError}
        </div>
      </Card>
    );
  }

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
      </div>
    </Card>
  );
};

export default FunnelViewContainer;
