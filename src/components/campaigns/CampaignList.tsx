
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
      console.warn("Campaign data is empty at CampaignList");
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
    
    // Explicitly log the raw campaigns data received
    console.log("[CampaignList] Received campaigns:", campaigns);
    console.log("[CampaignList] Filtered campaigns:", filteredCampaigns);
  }, [filteredCampaigns, isLoading, error, activeTab, status, campaignsFetchStatus, fetchCompleted, campaigns]);

  // Always log when rendering campaign list
  console.log("Rendering campaign list with", filteredCampaigns?.length || 0, "campaigns");
  
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
    
    // IMPORTANT: If we have campaigns but filtering removed them, still show all campaigns
    console.log('[CAMPAIGN LIST] Forcing display of all campaigns despite filtering');
    return (
      <Card className="overflow-hidden" key={forceRender}>
        <div className="bg-orange-100 p-4 border-b border-orange-200">
          <p className="text-md font-medium text-orange-800">
            Forcing display of all {campaigns.length} campaigns (filter removed all)
          </p>
          <p className="text-sm text-orange-700">
            Tab: {activeTab}, Filter removed all campaigns but we're showing them anyway
          </p>
        </div>
        <CampaignTable 
          campaigns={campaigns} 
          status={activeTab || status as 'active' | 'draft' | 'archived'}
          campaignsFetchStatus={campaignsFetchStatus}
        />
      </Card>
    );
  }
  
  // Show a clear "No Campaigns" UI when we have no campaigns but fetch completed successfully
  if ((safeFilteredCampaigns.length === 0 || !safeFilteredCampaigns) && fetchCompleted && !isLoading && !error && !metaPermissionsInvalid) {
    // Check if we have any campaigns at all before showing the empty state
    if (Array.isArray(campaigns) && campaigns.length > 0) {
      console.log('[CAMPAIGN LIST] Using all campaigns instead of empty filtered result');
      return (
        <Card className="overflow-hidden" key={forceRender}>
          <div className="bg-blue-100 p-4 border-b border-blue-200">
            <p className="text-md font-medium text-blue-800">
              Displaying all {campaigns.length} campaigns (ignoring filters)
            </p>
          </div>
          <CampaignTable 
            campaigns={campaigns} 
            status={activeTab || status as 'active' | 'draft' | 'archived'}
            campaignsFetchStatus={campaignsFetchStatus}
          />
        </Card>
      );
    }
    
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
      {/* Debug information banner - make this more prominent */}
      <div className="bg-blue-100 p-4 border-b border-blue-200 flex flex-col gap-2">
        <p className="text-md font-medium text-blue-800">
          Rendering {safeFilteredCampaigns.length} campaigns
        </p>
        <p className="text-sm text-blue-700">
          Status: {fetchCompleted ? 'Fetch completed' : 'Fetch in progress'}, 
          Tab: {activeTab}, 
          Error: {error ? 'Yes' : 'None'}
        </p>
        {safeFilteredCampaigns.length > 0 && (
          <p className="text-sm font-medium text-green-700 bg-green-50 p-2 rounded-md">
            ✅ Have campaigns data: {safeFilteredCampaigns.length} campaigns available to render
          </p>
        )}
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
