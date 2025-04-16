
import React from 'react';
import { Card } from '@/components/ui/card';
import CampaignTable from './CampaignTable';
import { UseCampaignsResult } from '@/hooks/campaigns/types';
import { LoadingView } from './states/LoadingView';
import ErrorView from './states/ErrorView';
import { metaPermissionsInvalid } from '@/hooks/campaigns/useCampaigns';
import NoCampaignsFoundPanel from './diagnostic-components/NoCampaignsFoundPanel';

interface CampaignListProps {
  isLoading: boolean;
  campaigns: UseCampaignsResult['campaigns'];
  error: UseCampaignsResult['error'];
  errorDetails: UseCampaignsResult['errorDetails'];
  activeTab: 'active' | 'draft' | 'archived';
  filteredCampaigns: UseCampaignsResult['campaigns'];
  refetchCampaigns: () => void;
  forceRender: number;
  isAuthenticated: boolean;
  fetchCompleted: boolean;
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
  status?: 'active' | 'draft' | 'archived' | string;
  metaPermissionsInvalid?: boolean;
}

const CampaignList: React.FC<CampaignListProps> = ({
  isLoading,
  campaigns = [],
  error,
  errorDetails,
  activeTab,
  filteredCampaigns = [],
  refetchCampaigns,
  forceRender,
  isAuthenticated,
  fetchCompleted,
  campaignsFetchStatus,
  status
}) => {
  // Debug log to track campaign state
  React.useEffect(() => {
    console.log(`🧾 [CAMPAIGN LIST] Rendering with ${filteredCampaigns?.length || 0} campaigns`, {
      isLoading,
      hasError: !!error,
      activeTab,
      status,
      campaignsFetchStatus,
      fetchCompleted,
      metaPermissionsInvalid,
      selectedAdAccount: localStorage.getItem('selected_ad_account')
    });
    
    if (filteredCampaigns && filteredCampaigns.length === 0 && !isLoading && !error) {
      console.log('[CAMPAIGN LIST] Empty campaigns array but no loading or error state');
    }
    
    // Log the first few campaigns if available for debugging
    if (filteredCampaigns && filteredCampaigns.length > 0) {
      console.log('[CAMPAIGN LIST] First few campaigns:', filteredCampaigns.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        hasInsights: !!c.insights && Object.keys(c.insights).length > 0
      })));
    }
  }, [filteredCampaigns, isLoading, error, activeTab, status, campaignsFetchStatus, fetchCompleted]);

  // Show loading state if the app is loading campaigns
  if (isLoading) {
    return <LoadingView />;
  }

  // Show error state if there was an error (except for unauthorized or permissions issues, which are handled in CampaignTable)
  if (error && campaignsFetchStatus !== 'unauthorized' && !metaPermissionsInvalid) {
    return (
      <ErrorView
        error={error}
        errorDetails={errorDetails}
        effectiveIsAuthenticated={isAuthenticated}
        onRetry={refetchCampaigns}
      />
    );
  }

  // Add debug information to help understand what's happening
  console.log('[CAMPAIGN LIST] Before rendering, campaigns state:', {
    campaignsLength: campaigns?.length || 0, 
    filteredCampaignsLength: filteredCampaigns?.length || 0,
    isArray: Array.isArray(filteredCampaigns),
    fetchCompleted,
    isLoading,
    hasError: !!error
  });

  // Ensure we have an array of campaigns - add additional safety check
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];
  
  // Debug output if campaigns exist but filteredCampaigns is empty
  if (Array.isArray(campaigns) && campaigns.length > 0 && safeFilteredCampaigns.length === 0) {
    console.warn('[CAMPAIGN LIST] ⚠️ Campaigns exist but filtered list is empty:', {
      campaignsCount: campaigns.length,
      filteredCount: 0
    });
    
    // Log all campaigns in main array to help debug filtering issues
    console.log('[CAMPAIGN LIST] Original campaigns:', campaigns.map(c => ({
      id: c.id,
      name: c.name,
      status: c.status
    })));
  }
  
  // Show a clear "No Campaigns" UI when we have no campaigns but fetch completed successfully
  if ((safeFilteredCampaigns.length === 0 || !safeFilteredCampaigns) && fetchCompleted && !isLoading && !error && !metaPermissionsInvalid) {
    return (
      <>
        <div className="bg-muted p-4 mb-4 rounded-md">
          <p>Debug info: Campaign fetch completed with 0 campaigns. Fetch status: {campaignsFetchStatus || 'unknown'}</p>
        </div>
        <NoCampaignsFoundPanel onRefresh={refetchCampaigns} onCreateCampaign={() => {
          // Dispatch an event to show the campaign creation wizard
          window.dispatchEvent(new CustomEvent('show-campaign-creator'));
        }} />
      </>
    );
  }

  // When we have campaigns, show the table
  return (
    <Card className="overflow-hidden" key={forceRender}>
      {/* Debug information banner */}
      <div className="bg-blue-50 p-4 border-b border-blue-100">
        <p className="text-sm font-medium text-blue-800">
          Rendering campaign table with {safeFilteredCampaigns.length} campaigns
        </p>
        <p className="text-xs text-blue-600">
          Status: {fetchCompleted ? 'Fetch completed' : 'Fetch in progress'}, 
          Tab: {activeTab}, 
          Error: {error ? 'Yes' : 'None'}
        </p>
      </div>
      <CampaignTable 
        campaigns={safeFilteredCampaigns} 
        status={activeTab || status as 'active' | 'draft' | 'archived'}
        campaignsFetchStatus={campaignsFetchStatus}
      />
    </Card>
  );
};

export default CampaignList;
