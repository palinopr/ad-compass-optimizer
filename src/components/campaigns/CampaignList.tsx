
import React from 'react';
import { toast } from '@/hooks/use-toast';
import { Card } from '@/components/ui/card';
import { Info } from 'lucide-react';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import { LoadingState, ErrorState, EmptyState } from './CampaignListStates';
import CampaignFilteredResults from './CampaignFilteredResults';
import CampaignDebugInfo from './CampaignDebugInfo';
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

  // If no campaigns and no error, show status message
  if (campaigns.length === 0 && !error) {
    return (
      <Card className="p-6 text-center">
        <div className="flex flex-col items-center justify-center">
          <Info className="h-12 w-12 text-blue-500 mb-4" />
          <p className="text-gray-600">{statusMessage || "No campaigns found"}</p>
          <button 
            onClick={() => refetchCampaigns(true)} 
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Refresh Campaigns
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div>
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
      />
      
      {debugMode && <MockApiControls onRefresh={() => refetchCampaigns(true)} />}
      {debugMode && <CampaignDebugInfo campaigns={campaigns} />}
    </div>
  );
};

export default CampaignList;
