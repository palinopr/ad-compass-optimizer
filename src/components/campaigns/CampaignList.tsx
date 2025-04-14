
import React from 'react';
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
  
  if (error) {
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

  const hasLastFetchSuccess = localStorage.getItem('last_campaign_fetch_success') === 'true';
  const hasEmptyResult = localStorage.getItem('last_empty_result') === 'true';
  
  if ((!campaigns || campaigns.length === 0) && 
      effectiveIsAuthenticated && 
      hasLastFetchSuccess &&
      hasEmptyResult) {
    return (
      <>
        <CampaignFilterToolbar 
          filters={filters}
          onDateRangeChange={setDateRange}
          onStatusChange={setStatusFilter}
          onSearchChange={setSearchQuery}
          onRefresh={handleRefresh}
          isLoading={isLoading}
        />
        <NoCampaignsFoundPanel
          onRefresh={handleRefresh}
          onCreateCampaign={handleCreateCampaign}
          isLoading={isLoading}
        />
      </>
    );
  }
  
  if (!campaigns || campaigns.length === 0) {
    return <EmptyCampaignState onRefresh={handleRefresh} hasLastFetchSuccess={hasLastFetchSuccess} />;
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
      
      <CampaignMetrics 
        impressions={metrics.impressions}
        clicks={metrics.clicks}
        spend={metrics.spend}
        cpa={metrics.cpa}
      />

      <CampaignFilteredResults
        campaigns={filteredCampaigns}
        status={status}
        hasFilteredResults={filteredCampaigns.length > 0}
        onClearFilters={handleClearFilters}
      />
      
      <CampaignDebugInfo campaigns={campaigns} />
    </div>
  );
};

export default CampaignList;
