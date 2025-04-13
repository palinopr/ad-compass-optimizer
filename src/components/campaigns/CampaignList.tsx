
import React, { useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { useCampaigns } from '@/hooks/campaigns';
import { useMetaConnection } from '@/components/meta/SharedMetaConnectionProvider';
import CampaignTable from './CampaignTable';
import CampaignFilterToolbar from './CampaignFilterToolbar';
import CampaignMetrics from './CampaignMetrics';
import { useCampaignFilters } from '@/hooks/campaigns/useCampaignFilters';
import { LoadingState, ErrorState, EmptyState } from './CampaignListStates';
import { metaAuthService } from '@/services/MetaAuthService';
import { useAuthCheck } from '@/hooks/campaigns/useAuthCheck'; 

interface CampaignListProps {
  status: 'active' | 'draft' | 'archived';
}

const CampaignList: React.FC<CampaignListProps> = ({ status }) => {
  const { campaigns, isLoading, error, refetchCampaigns, errorDetails } = useCampaigns(status);
  const { filters, setDateRange, setStatusFilter, setSearchQuery, filteredCampaigns } = 
    useCampaignFilters(campaigns);
  const { isAuthenticated, checkAuth } = useMetaConnection();
  const { validateAuthentication } = useAuthCheck();
  
  // Always use direct token validation as the source of truth
  const authResult = validateAuthentication();
  const effectiveIsAuthenticated = authResult.isValid;
  
  // Force check auth status when component mounts
  useEffect(() => {
    // Check token directly from localStorage for consistency
    const token = metaAuthService.getAccessToken();
    const directAuthCheck = token && token.length >= 50;
    
    console.log(`CampaignList (${status}): Direct auth check:`, 
      directAuthCheck ? 'Valid token' : 'No valid token',
      'Context auth state:', isAuthenticated ? 'Authenticated' : 'Not authenticated'
    );
    
    // If there's a state mismatch, trigger a shared context refresh
    if (directAuthCheck !== isAuthenticated) {
      console.log('Authentication state mismatch detected in CampaignList, refreshing...');
      checkAuth();
    }
  }, [checkAuth, isAuthenticated, status]);
  
  // Calculate metrics from campaigns
  const metrics = {
    impressions: filteredCampaigns.length > 0 ? '15,432' : '0', // placeholder value
    clicks: filteredCampaigns.length > 0 ? '843' : '0', // placeholder value
    spend: filteredCampaigns.reduce((total, campaign) => {
      const spendStr = campaign.spend || '$0.00';
      const numericValue = parseFloat(spendStr.replace(/[^0-9.-]+/g, '')) || 0;
      return total + numericValue;
    }, 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' }),
    cpa: filteredCampaigns.length > 0 ? '$12.54' : '$0.00', // placeholder value
  };
  
  // Handle loading state
  if (isLoading) {
    return (
      <Card>
        <LoadingState />
      </Card>
    );
  }
  
  // Handle error state
  if (error) {
    return (
      <Card>
        <ErrorState 
          error={error} 
          isAuthenticated={effectiveIsAuthenticated}
          onRetry={refetchCampaigns}
          errorDetails={errorDetails}
        />
      </Card>
    );
  }
  
  // Handle empty state
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card>
        <EmptyState status={status} />
      </Card>
    );
  }
  
  // Handle data state
  return (
    <>
      <CampaignFilterToolbar 
        filters={filters}
        onDateRangeChange={setDateRange}
        onStatusChange={setStatusFilter}
        onSearchChange={setSearchQuery}
        onRefresh={refetchCampaigns}
        isLoading={isLoading}
      />
      
      <CampaignMetrics {...metrics} />
      
      <Card>
        <CampaignTable campaigns={filteredCampaigns} status={status} />
      </Card>
    </>
  );
};

export default CampaignList;
