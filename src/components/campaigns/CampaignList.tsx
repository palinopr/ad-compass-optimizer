
import React, { useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCampaigns } from '@/hooks/campaigns';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import CampaignTable from './CampaignTable';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import NoCampaignsFoundPanel from './diagnostic-components/NoCampaignsFoundPanel';
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
  
  // Handle refreshing the campaign data
  const handleRefresh = () => {
    // Force cache invalidation
    localStorage.removeItem('campaign_filter_state');
    localStorage.removeItem('cached_campaign_data');
    
    console.log('Manual refresh requested for', status, 'campaigns');
    refetchCampaigns(true);
    
    toast({
      title: "Refreshing Campaigns",
      description: "Fetching latest campaign data from Meta...",
    });
  };
  
  // Handle creating a new campaign
  const handleCreateCampaign = () => {
    // Navigate to campaign creation flow or show wizard
    window.dispatchEvent(new CustomEvent('show-campaign-creation'));
    
    toast({
      title: "Create Campaign",
      description: "Opening campaign creation wizard...",
    });
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
  
  // If we're authenticated and have verified API access but found no campaigns,
  // this means the account actually has no campaigns (instead of an error)
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
  
  // Standard empty state (not the "verified empty" state above)
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
            onClick={handleRefresh}
          >
            <InfoIcon className="h-3 w-3" />
            Debug Refresh
          </Button>
        </div>
      </Card>
    );
  }

  const hasFilteredResults = filteredCampaigns.length > 0;
  
  // Calculate metrics summaries from campaign data
  const calculateMetrics = () => {
    let totalImpressions = 0;
    let totalClicks = 0;
    let totalSpend = 0;
    let totalCPA = 0;
    let validCPACount = 0;
    
    filteredCampaigns.forEach(campaign => {
      if (campaign.insights) {
        // Handle impressions
        if (campaign.insights.impressions) {
          totalImpressions += parseInt(campaign.insights.impressions.replace(/,/g, '')) || 0;
        }
        
        // Handle clicks
        if (campaign.insights.clicks) {
          totalClicks += parseInt(campaign.insights.clicks.replace(/,/g, '')) || 0;
        }
        
        // Handle spend (removing $ and converting to number)
        if (campaign.spend) {
          const spendValue = parseFloat(campaign.spend.replace(/[$,]/g, '')) || 0;
          totalSpend += spendValue;
        }
        
        // Handle CPA
        if (campaign.insights.cpa && campaign.insights.cpa !== '-') {
          const cpaValue = parseFloat(campaign.insights.cpa.replace(/[$,]/g, '')) || 0;
          if (cpaValue > 0) {
            totalCPA += cpaValue;
            validCPACount++;
          }
        }
      }
    });
    
    // Format numbers for display
    const formatter = new Intl.NumberFormat('en-US');
    const currencyFormatter = new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    
    return {
      impressions: formatter.format(totalImpressions),
      clicks: formatter.format(totalClicks),
      spend: currencyFormatter.format(totalSpend),
      cpa: validCPACount > 0 ? currencyFormatter.format(totalCPA / validCPACount) : '$0.00'
    };
  };
  
  const metrics = calculateMetrics();
  
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
      
      <CampaignMetrics 
        impressions={metrics.impressions}
        clicks={metrics.clicks}
        spend={metrics.spend}
        cpa={metrics.cpa}
      />
  
      <Card>
        {hasFilteredResults ? (
          <CampaignTable 
            campaigns={filteredCampaigns}
            status={status} 
          />
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No campaigns match the current filters.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              setStatusFilter('all');
              setDateRange({ from: null, to: null }, 'custom');
              setSearchQuery('');
            }}>
              Clear Filters
            </Button>
          </div>
        )}
      </Card>
    </>
  );
};

export default CampaignList;
