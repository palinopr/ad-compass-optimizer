
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
    effectiveIsAuthenticated,
    fetchCompleted,
    insightsFetchStatus,
    forceUiRefresh,
  } = useCampaignListState(status);

  const metrics = useCampaignMetrics(filteredCampaigns);
  const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
  const debugMode = process.env.NODE_ENV !== 'production';
  
  // Force a fetch on component mount if authenticated but no campaigns loaded
  useEffect(() => {
    const token = metaAuthService.getAccessToken();
    const selectedAdAccount = localStorage.getItem('selected_ad_account');
    const hasAuth = token && token.length > 50 && selectedAdAccount;
    const campaignsFetched = localStorage.getItem('last_campaign_fetch_completed');
    const hasRecentFetch = campaignsFetched && (Date.now() - new Date(campaignsFetched).getTime() < 60000); // 1 minute
    
    if (hasAuth && !isLoading && campaigns.length === 0 && !hasRecentFetch) {
      console.log('[CAMPAIGN LIST] Authenticated but no campaigns or old data, forcing fetch');
      refetchCampaigns(true);
    }
  }, []);
  
  // Listen for date preset changes and trigger a refresh
  useEffect(() => {
    const handleDatePresetChange = () => {
      console.log('[CAMPAIGN LIST] Date preset changed, refreshing campaigns');
      refetchCampaigns(true);
    };
    
    window.addEventListener('campaign-date-preset-changed', handleDatePresetChange);
    return () => {
      window.removeEventListener('campaign-date-preset-changed', handleDatePresetChange);
    };
  }, [refetchCampaigns]);
  
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
  
  // Track insight sync status to force UI refresh if needed
  useEffect(() => {
    if (fetchCompleted && campaigns.length > 0 && insightsFetchStatus !== 'success' && insightsFetchStatus !== 'partial') {
      // Only force a refresh if we have campaigns but insights fetch was not successful
      const insightCheckTimeout = setTimeout(() => {
        const hasValidInsights = localStorage.getItem('has_valid_campaign_insights') === 'true';
        if (!hasValidInsights) {
          console.log('[CAMPAIGN LIST] No valid insights detected after campaign load, forcing UI refresh');
          forceUiRefresh();
        } else {
          console.log('[CAMPAIGN LIST] Valid insights confirmed after campaign load');
        }
      }, 1000);
      
      return () => clearTimeout(insightCheckTimeout);
    }
  }, [fetchCompleted, campaigns.length, forceUiRefresh, insightsFetchStatus]);
  
  // Force render on successful campaign data load if we have valid campaigns
  useEffect(() => {
    if (campaigns.length > 0 && fetchCompleted) {
      console.log('[CAMPAIGN LIST] Campaigns data loaded, forcing UI refresh');
      const forceRenderTimeout = setTimeout(() => {
        // Force a UI refresh to ensure all campaign data is properly displayed
        forceUiRefresh();
        window.dispatchEvent(new Event('force-campaign-ui-refresh'));
      }, 300);
      
      return () => clearTimeout(forceRenderTimeout);
    }
  }, [campaigns.length, fetchCompleted, forceUiRefresh]);

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
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  // Only show error state if we have a genuine error and:
  // 1. We don't have any campaigns OR
  // 2. Insights fetch completely failed AND we're not in mock mode
  const hasValidData = campaigns.length > 0 && 
    (insightsFetchStatus === 'success' || insightsFetchStatus === 'partial');
    
  if (error && !isMockMode && !hasValidData) {
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
          setDateRange(null, 'last_28d');
          setStatusFilter(null);
          setSearchQuery('');
        }}
        key={`campaign-results-${campaigns.length}-${filteredCampaigns.length}`} // Force re-render
      />
      
      {debugMode && <MockApiControls onRefresh={() => refetchCampaigns(true)} />}
      {debugMode && <CampaignDebugInfo campaigns={campaigns} />}
    </div>
  );
};

export default CampaignList;
