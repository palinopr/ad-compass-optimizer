import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import { LoadingState, ErrorState } from './CampaignListStates';
import CampaignFilteredResults from './CampaignFilteredResults';
import CampaignDebugInfo from './CampaignDebugInfo';
import { useCampaignListState } from '@/hooks/campaigns/useCampaignListState';
import { useCampaignMetrics } from '@/hooks/campaigns/useCampaignMetrics';
import MockApiControls from './diagnostic-components/MockApiControls';
import EmptyState from './states/EmptyState';
import AdAccountDiagnostics from './diagnostic-components/AdAccountDiagnostics';

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
    refetchCampaigns
  } = useCampaignListState(status);

  const metrics = useCampaignMetrics(filteredCampaigns);
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  const debugMode = process.env.NODE_ENV !== 'production';

  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  if (error && !isMockMode) {
    return (
      <Card>
        <ErrorState 
          error={error} 
          onRetry={() => refetchCampaigns(true)}
          errorDetails={errorDetails}
          isAuthenticated={true}
        />
      </Card>
    );
  }

  if (campaigns.length === 0 && !error) {
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
          setDateRange(null, 'last30days');
          setStatusFilter(null);
          setSearchQuery('');
        }}
      />
      
      {debugMode && <MockApiControls onRefresh={() => refetchCampaigns(true)} />}
      {debugMode && <CampaignDebugInfo campaigns={campaigns} />}
    </div>
  );
};

export default CampaignList;
