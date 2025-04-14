
import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import NoCampaignsFoundPanel from './diagnostic-components/NoCampaignsFoundPanel';
import { LoadingState, ErrorState } from './CampaignListStates';
import CampaignFilteredResults from './CampaignFilteredResults';
import CampaignDebugInfo from './CampaignDebugInfo';
import EmptyCampaignState from './EmptyCampaignState';
import { useCampaignListState } from '@/hooks/campaigns/useCampaignListState';
import { useCampaignMetrics } from '@/hooks/campaigns/useCampaignMetrics';
import MockApiControls from './diagnostic-components/MockApiControls';

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const {
    campaigns,
    filteredCampaigns,
    isLoading,
    error,
    errorDetails,
    effectiveIsAuthenticated,
    filters,
    setDateRange,
    setStatusFilter,
    setSearchQuery,
    refetchCampaigns,
    localRenderKey
  } = useCampaignListState(status);

  const metrics = useCampaignMetrics(filteredCampaigns);
  
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  const isMockApiMode = localStorage.getItem("USE_MOCK_META_API") === "true";
  
  useEffect(() => {
    if (isMockMode && campaigns.length === 0 && !isLoading) {
      console.log('🎭 Mock mode: No campaigns showing, triggering refresh');
      refetchCampaigns(true);
    }
  }, [isMockMode, campaigns.length, isLoading, refetchCampaigns]);
  
  useEffect(() => {
    console.log("[MOCK DEBUG] campaigns in CampaignList state:", campaigns.length);
  }, [campaigns.length]);

  const handleRefresh = () => {
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    console.log('Manual refresh requested for', status, 'campaigns');
    refetchCampaigns(true);
    toast({
      title: "Refreshing Campaigns",
      description: "Fetching latest campaign data from Meta...",
    });
  };

  const handleCreateCampaign = () => {
    window.dispatchEvent(new CustomEvent('show-campaign-creation'));
    toast({
      title: "Create Campaign",
      description: "Opening campaign creation wizard...",
    });
  };

  const handleClearFilters = () => {
    setStatusFilter('all');
    setDateRange({ from: null, to: null }, 'custom');
    setSearchQuery('');
  };
  
  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  if (error && !isMockMode && !isMockApiMode) {
    return (
      <Card>
        <ErrorState 
          error={error} 
          isAuthenticated={effectiveIsAuthenticated}
          onRetry={() => refetchCampaigns(true)}
          errorDetails={errorDetails}
        />
        
        {/* Add detailed API error display for debugging */}
        <div className="px-6 pb-4 mt-2">
          <div className="text-sm bg-red-50 border border-red-200 rounded p-3">
            <h4 className="font-medium mb-1">🚫 Campaign Fetch Error Details</h4>
            <div className="text-red-600 text-xs overflow-auto max-h-32 font-mono">
              {error}
            </div>
            {errorDetails && (
              <div className="mt-2 pt-2 border-t border-red-200">
                <div className="text-xs font-mono text-red-500 overflow-auto max-h-48">
                  {typeof errorDetails === 'object' ? 
                    JSON.stringify(errorDetails, null, 2) : 
                    String(errorDetails)
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>
    );
  }

  const shouldShowCampaigns = isMockMode || isMockApiMode ? 
    filteredCampaigns.length > 0 : 
    filteredCampaigns.length > 0 || (effectiveIsAuthenticated && localStorage.getItem('last_campaign_fetch_success') === 'true');

  if (!shouldShowCampaigns && !isMockMode && !isMockApiMode) {
    return <EmptyCampaignState onRefresh={handleRefresh} hasLastFetchSuccess={localStorage.getItem('last_campaign_fetch_success') === 'true'} />;
  }

  return (
    <div key={`campaign-list-${localRenderKey}-${status}`}>
      <CampaignFilterToolbar 
        filters={filters}
        onDateRangeChange={setDateRange}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />
      
      {filteredCampaigns.length > 0 && (
        <CampaignMetrics 
          impressions={metrics.impressions}
          clicks={metrics.clicks}
          spend={metrics.spend}
          cpa={metrics.cpa}
        />
      )}

      <CampaignFilteredResults
        campaigns={filteredCampaigns}
        status={status}
        hasFilteredResults={filteredCampaigns.length > 0}
        onClearFilters={handleClearFilters}
      />
      
      <MockApiControls onRefresh={handleRefresh} />
      
      {isMockMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
          <p className="text-yellow-800">🎭 Mock Mode Active - Using simulated campaign data</p>
        </div>
      )}
      
      <CampaignDebugInfo campaigns={campaigns} />
    </div>
  );
};

export default CampaignList;
