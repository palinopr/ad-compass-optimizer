
import React from 'react';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import CampaignFilteredResults from './CampaignFilteredResults';
import CampaignDebugInfo from './CampaignDebugInfo';
import { useCampaignListState } from '@/hooks/campaigns/useCampaignListState';
import { useCampaignMetrics } from '@/hooks/campaigns/useCampaignMetrics';
import { useCampaignListEffects } from '@/hooks/campaigns/useCampaignListEffects';
import MockApiControls from './diagnostic-components/MockApiControls';
import EmptyState from './states/EmptyState';
import AdAccountDiagnostics from './diagnostic-components/AdAccountDiagnostics';
import LoadingView from './states/LoadingView';
import ErrorView from './states/ErrorView';

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
    statusMessage,
    filters,
    setDateRange,
    setStatusFilter,
    setSearchQuery,
    refetchCampaigns,
    effectiveIsAuthenticated,
    fetchCompleted,
    insightsFetchStatus,
    forceUiRefresh,
  } = useCampaignListState(status);

  const metrics = useCampaignMetrics(filteredCampaigns);
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  const debugMode = process.env.NODE_ENV !== 'production';
  
  // Use the extracted effects hook
  useCampaignListEffects({
    isLoading,
    campaigns,
    fetchCompleted,
    insightsFetchStatus,
    refetchCampaigns,
    forceUiRefresh
  });

  // Log component render to track state changes
  console.log(`[CAMPAIGN LIST] Rendering with state:`, { 
    status,
    isLoading, 
    hasError: !!error,
    campaignCount: campaigns.length,
    filteredCount: filteredCampaigns.length,
    currentDatePreset: filters.datePreset,
    fetchCompleted,
    insightsFetchStatus
  });

  if (isLoading) {
    return <LoadingView />;
  }
  
  // Only show error state if we have a genuine error and:
  // 1. We don't have any campaigns OR
  // 2. Insights fetch completely failed AND we're not in mock mode
  const hasValidData = campaigns.length > 0 && 
    (insightsFetchStatus === 'success' || insightsFetchStatus === 'partial');
    
  if (error && !isMockMode && !hasValidData) {
    return (
      <ErrorView 
        error={error}
        errorDetails={errorDetails}
        effectiveIsAuthenticated={effectiveIsAuthenticated}
        onRetry={() => refetchCampaigns(true)}
      />
    );
  }

  // Only show empty state if:
  // 1. Fetch is completed AND
  // 2. No campaigns were found AND 
  // 3. No error exists (meaning API returned empty array, not an error)
  if (fetchCompleted && campaigns.length === 0 && !error) {
    const selectedAccount = localStorage.getItem('selected_ad_account');
    const accountText = selectedAccount ? ` in account ${selectedAccount}` : '';
    
    return (
      <EmptyState
        icon="📭"
        title="No campaigns found"
        description={`There are no ${status} campaigns${accountText}. Campaigns will appear here once they are created.`}
      />
    );
  }

  return (
    <div>
      <AdAccountDiagnostics />
      <CampaignFilterToolbar 
        filters={filters}
        onDateRangeChange={setDateRange}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onRefresh={() => refetchCampaigns(true)}
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
        onClearFilters={() => {
          setDateRange(null, 'maximum');
          setStatusFilter(null);
          setSearchQuery('');
        }}
        key={`campaign-results-${campaigns.length}-${filteredCampaigns.length}`}
      />
      
      {debugMode && <MockApiControls onRefresh={() => refetchCampaigns(true)} />}
      {debugMode && <CampaignDebugInfo campaigns={campaigns} />}
    </div>
  );
};

export default CampaignList;
