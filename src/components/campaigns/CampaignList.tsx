
import React, { useEffect } from 'react';
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
import { metaAuthService } from '@/services/MetaAuthService';

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
    effectiveIsAuthenticated
  } = useCampaignListState(status);

  const metrics = useCampaignMetrics(filteredCampaigns);
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  const debugMode = process.env.NODE_ENV !== 'production';
  
  // Force a fetch on component mount if authenticated but no campaigns loaded
  useEffect(() => {
    const token = metaAuthService.getAccessToken();
    const selectedAdAccount = localStorage.getItem('selected_ad_account');
    const hasAuth = token && token.length > 50 && selectedAdAccount;
    
    if (hasAuth && !isLoading && campaigns.length === 0) {
      console.log('[CAMPAIGN LIST] Authenticated but no campaigns, forcing fetch');
      refetchCampaigns(true);
    }
  }, []);
  
  // Add safety timeout to exit loading state if stuck
  useEffect(() => {
    let safetyTimeout: number | undefined;
    
    if (isLoading) {
      console.log(`[CAMPAIGN LIST] Loading state started, setting safety timeout`);
      safetyTimeout = window.setTimeout(() => {
        if (isLoading) {
          console.log('[CAMPAIGN LIST] Safety timeout triggered - forcing exit from loading state');
          toast({
            title: "Loading timeout",
            description: "Campaign loading took too long. Please try refreshing.",
            variant: "destructive",
          });
          // We don't call setIsLoading directly to prevent dependency cycle,
          // instead trigger a refresh that will reset loading state
          refetchCampaigns(true);
        }
      }, 15000); // 15 seconds safety timeout
    }
    
    return () => {
      if (safetyTimeout) {
        window.clearTimeout(safetyTimeout);
      }
    };
  }, [isLoading, refetchCampaigns]);

  // Log component render to track state changes
  console.log(`[CAMPAIGN LIST] Rendering with state:`, { 
    status,
    isLoading, 
    hasError: !!error,
    campaignCount: campaigns.length,
    filteredCount: filteredCampaigns.length
  });

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
          isAuthenticated={effectiveIsAuthenticated}
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
