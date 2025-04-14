
import React, { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/campaigns';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import NoCampaignsFoundPanel from './diagnostic-components/NoCampaignsFoundPanel';
import { useCampaignFilters } from '@/hooks/campaigns/useCampaignFilters';
import { LoadingState, ErrorState } from './CampaignListStates';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from '@/hooks/campaigns/useAuthCheck';
import { toast } from '@/hooks/use-toast';
import { RefreshCw } from 'lucide-react';
import { useCampaignMetrics } from '@/hooks/campaigns/useCampaignMetrics';
import CampaignFilteredResults from './CampaignFilteredResults';

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const { campaigns, isLoading, error, refetchCampaigns, errorDetails, displayRefresh, forceRender } = useCampaigns(status);
  const { filters, setDateRange, setStatusFilter, setSearchQuery, filteredCampaigns } = 
    useCampaignFilters(campaigns);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const campaignsRef = useRef<typeof campaigns>([]);
  const renderCountRef = useRef(0);
  const metrics = useCampaignMetrics(filteredCampaigns);
  // Add internal counter for local UI updates
  const [localRenderKey, setLocalRenderKey] = useState(0);
  
  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;
  
  // Track when campaigns change to help diagnose render issues
  useEffect(() => {
    renderCountRef.current += 1;
    console.log(`CampaignList (${status}): Render #${renderCountRef.current}`, { 
      campaignsLength: campaigns.length,
      filteredLength: filteredCampaigns.length,
      campaignsChanged: campaigns !== campaignsRef.current,
      displayRefresh,
      forceRender,
      localRenderKey
    });
    campaignsRef.current = campaigns;
    
    // Force a re-render when campaigns change to ensure UI updates
    if (campaigns.length > 0) {
      setLocalRenderKey(prev => prev + 1);
    }
  }, [campaigns, filteredCampaigns.length, status, displayRefresh, forceRender]);
  
  // Force UI refresh when ad account changes
  useEffect(() => {
    const handleAdAccountChange = () => {
      console.log('Ad account changed, forcing UI refresh in CampaignList');
      setLocalRenderKey(prev => prev + 1);
    };
    
    window.addEventListener('ad-account-changed', handleAdAccountChange);
    return () => {
      window.removeEventListener('ad-account-changed', handleAdAccountChange);
    };
  }, []);
  
  // Check authentication status on mount and when it changes
  useEffect(() => {
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    console.log(`CampaignList (${status}): Direct auth check:`, 
      directAuthCheck ? 'Valid token found' : 'No valid token',
      'Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated'
    );
    if (directAuthCheck !== isAuthenticated) {
      console.log('Authentication state mismatch detected in CampaignList, refreshing...');
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, status]);
  
  // Handle refreshing the campaign data
  const handleRefresh = () => {
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    console.log('Manual refresh requested for', status, 'campaigns');
    refetchCampaigns(true);
    toast({
      title: "Refreshing Campaigns",
      description: "Fetching latest campaign data from Meta...",
    });
    // Force local render key update
    setLocalRenderKey(prev => prev + 1);
  };
  
  // Handle creating a new campaign
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
    // Force UI update when filters are cleared
    setLocalRenderKey(prev => prev + 1);
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
  
  if ((!campaigns || campaigns.length === 0) && 
      effectiveIsAuthenticated && 
      localStorage.getItem('last_campaign_fetch_success') === 'true' &&
      localStorage.getItem('last_empty_result') === 'true') {
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
    return (
      <Card className="p-4">
        <div className="text-center text-gray-500">
          <p className="mb-2">No campaigns found in this ad account.</p>
          <div className="flex justify-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className="flex gap-1 text-xs"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-3 w-3" />
              Refresh Campaigns
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  // Use multiple keys to ensure component re-renders when any related state changes
  const renderKey = `campaign-list-${forceRender}-${displayRefresh}-${localRenderKey}-${status}`;
  console.log(`CampaignList rendering with key: ${renderKey}, campaigns: ${campaigns.length}`);
  
  return (
    <div key={renderKey}>
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
      
      {/* Debug info that shows data is actually available */}
      {campaigns.length > 0 && process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs">
          <p>Debug: {campaigns.length} campaigns loaded. First campaign ID: {campaigns[0]?.id || 'unknown'}</p>
        </div>
      )}
    </div>
  );
};

export default CampaignList;
