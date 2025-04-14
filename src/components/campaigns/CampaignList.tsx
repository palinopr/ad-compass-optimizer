
import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/campaigns';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import CampaignTable from './CampaignTable';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import { useCampaignFilters } from '@/hooks/campaigns/useCampaignFilters';
import { LoadingState, ErrorState, EmptyState } from './CampaignListStates';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from '@/hooks/campaigns/useAuthCheck'; 
import { toast } from '@/hooks/use-toast';
import { useEffect as useEffectKey } from 'react';
import { RefreshCw, InfoIcon } from 'lucide-react';

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const { campaigns, isLoading, error, refetchCampaigns, errorDetails, displayRefresh } = useCampaigns(status);
  const { filters, setDateRange, setStatusFilter, setSearchQuery, filteredCampaigns } = 
    useCampaignFilters(campaigns);
  const { isAuthenticated, hasPermissions, showConnectionDialog, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  const campaignsRef = useRef<typeof campaigns>([]);
  const renderCountRef = useRef(0);
  
  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;
  
  // Track when campaigns change to help diagnose render issues
  useEffect(() => {
    renderCountRef.current += 1;
    
    console.log(`CampaignList (${status}): Render #${renderCountRef.current}`, { 
      campaignsLength: campaigns.length,
      filteredLength: filteredCampaigns.length,
      campaignsChanged: campaigns !== campaignsRef.current,
      displayRefresh
    });
    
    campaignsRef.current = campaigns;
    
    // Log campaign data for debugging
    if (campaigns.length > 0) {
      console.log(`First campaign sample:`, campaigns[0]);
    }
  }, [campaigns, filteredCampaigns.length, status, displayRefresh]);
  
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
  
  useEffectKey(() => {
    const campaignCount = localStorage.getItem('last_campaign_count');
    if (campaignCount && parseInt(campaignCount) > 0 && campaigns.length === 0) {
      console.log('Display inconsistency detected - has campaigns in storage but not showing');
      localStorage.setItem('display_issue_detected', 'true');
      
      toast({
        title: "Display Issue Detected",
        description: "Campaign data was loaded but may not be displaying correctly. Try refreshing.",
        action: (
          <Button variant="outline" size="sm" onClick={() => refetchCampaigns(true)}>
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            Refresh
          </Button>
        )
      });
    }
  }, []);
  
  useEffectKey(() => {
    if (displayRefresh > 0) {
      console.log(`Display refresh triggered (${displayRefresh})`);
    }
  }, [displayRefresh]);
  
  // Log detailed information about the current state
  useEffect(() => {
    console.log('Campaign rendering state:', {
      status,
      isLoading,
      error: error ? 'Error present' : 'No error',
      campaignsLength: campaigns.length,
      filteredLength: filteredCampaigns.length,
      hasVisibleCampaigns: filteredCampaigns.length > 0,
      displayRefreshCount: displayRefresh
    });
  }, [campaigns.length, error, filteredCampaigns.length, isLoading, status, displayRefresh]);
  
  // Add manual refresh button for user debugging
  const handleDebugRefresh = () => {
    console.log('Manual debug refresh requested');
    
    // Clear any potential cached state
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    
    // Force a re-fetch with cleared caches
    refetchCampaigns(true);
    
    toast({
      title: "Debug Refresh Triggered",
      description: "Attempting to refresh campaign data with cleared caches",
    });
  };
  
  const metrics = {
    impressions: filteredCampaigns.reduce((total, campaign) => {
      const impressions = campaign.insights?.impressions || '0';
      return total + parseInt(impressions, 10);
    }, 0).toLocaleString(),
    
    clicks: filteredCampaigns.reduce((total, campaign) => {
      const clicks = campaign.insights?.clicks || '0';
      return total + parseInt(clicks, 10);
    }, 0).toLocaleString(),
    
    spend: filteredCampaigns.reduce((total, campaign) => {
      const spendStr = campaign.spend || '$0.00';
      const numericValue = parseFloat(spendStr.replace(/[^0-9.-]+/g, '')) || 0;
      return total + numericValue;
    }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    
    cpa: (() => {
      const totalSpend = filteredCampaigns.reduce((total, campaign) => {
        const spendStr = campaign.spend || '$0.00';
        const numericValue = parseFloat(spendStr.replace(/[^0-9.-]+/g, '')) || 0;
        return total + numericValue;
      }, 0);
      
      const totalClicks = filteredCampaigns.reduce((total, campaign) => {
        const clicks = campaign.insights?.clicks || '0';
        return total + parseInt(clicks, 10);
      }, 0);
      
      if (totalClicks === 0) return '$0.00';
      const cpa = totalSpend / totalClicks;
      return cpa.toLocaleString('en-US', { style: 'currency', currency: 'USD' });
    })()
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
  
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <EmptyState status={status} />
        
        {/* Add debug button for no campaigns case */}
        <div className="flex justify-center p-4 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm"
            className="flex gap-1 text-xs text-gray-500"
            onClick={handleDebugRefresh}
          >
            <InfoIcon className="h-3 w-3" />
            Debug Refresh
          </Button>
        </div>
      </Card>
    );
  }

  const hasFilteredResults = filteredCampaigns.length > 0;
  
  return (
    <>
      <CampaignFilterToolbar 
        filters={filters}
        onDateRangeChange={setDateRange}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onRefresh={() => refetchCampaigns(true)}
        isLoading={isLoading}
      />
      
      <CampaignMetrics {...metrics} />
      
      <Card>
        {hasFilteredResults ? (
          <CampaignTable campaigns={filteredCampaigns} status={status} />
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground">No campaigns match your current filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setStatusFilter(null);
              setSearchQuery('');
              setDateRange(
                { 
                  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
                  to: new Date() 
                },
                'last30days'
              );
            }}>
              Reset Filters
            </Button>
          </div>
        )}
        
        {/* Add debug button even when campaigns are present */}
        <div className="flex justify-center p-3 border-t border-gray-100">
          <Button 
            variant="outline" 
            size="sm"
            className="flex gap-1 text-xs text-gray-500"
            onClick={handleDebugRefresh}
          >
            <InfoIcon className="h-3 w-3" />
            Debug Refresh (Campaigns: {campaigns.length}, Filtered: {filteredCampaigns.length})
          </Button>
        </div>
      </Card>
    </>
  );
};

export default CampaignList;
