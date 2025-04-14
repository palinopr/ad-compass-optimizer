import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import NoCampaignsFoundPanel from './diagnostic-components/NoCampaignsFoundPanel';
import { LoadingState, ErrorState, EmptyState } from './CampaignListStates';
import CampaignFilteredResults from './CampaignFilteredResults';
import CampaignDebugInfo from './CampaignDebugInfo';
import EmptyCampaignState from './EmptyCampaignState';
import { useCampaignListState } from '@/hooks/campaigns/useCampaignListState';
import { useCampaignMetrics } from '@/hooks/campaigns/useCampaignMetrics';
import MockApiControls from './diagnostic-components/MockApiControls';
import NoCampaignsFoundWarning from './NoCampaignsFoundWarning';
import { metaAuthService } from '@/services/MetaAuthService';
import { META_API_CONFIG } from '@/config/socialAuth';

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

  const hasValidConnection = React.useMemo(() => {
    const token = metaAuthService.getAccessToken();
    const selectedAdAccount = localStorage.getItem('selected_ad_account');
    const missingPermissions = JSON.parse(localStorage.getItem('meta_permissions') || '[]')
      .filter((perm: string) => !META_API_CONFIG.adPermissions.includes(perm));
    
    return !!token && !!selectedAdAccount && missingPermissions.length === 0;
  }, []);
  
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
      </Card>
    );
  }

  const shouldShowCampaigns = isMockMode || isMockApiMode ? 
    filteredCampaigns.length > 0 : 
    filteredCampaigns.length > 0 || (effectiveIsAuthenticated && localStorage.getItem('last_campaign_fetch_success') === 'true');

  if (!shouldShowCampaigns) {
    return (
      <EmptyState status={status} />
    );
  }

  const debugMode = process.env.NODE_ENV !== 'production';

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
      
      {debugMode && (
        <>
          <MockApiControls onRefresh={handleRefresh} />
          {isMockMode && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mt-4">
              <p className="text-yellow-800">🎭 Mock Mode Active - Using simulated campaign data</p>
            </div>
          )}
          <CampaignDebugInfo campaigns={campaigns} />
        </>
      )}
    </div>
  );
};

export default CampaignList;
