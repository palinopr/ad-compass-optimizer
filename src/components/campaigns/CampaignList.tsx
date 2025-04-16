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
    
    if (filteredCampaigns && filteredCampaigns.length > 0) {
      console.log('[CAMPAIGN LIST] First few campaigns:', filteredCampaigns.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        hasInsights: !!c.insights && Object.keys(c.insights).length > 0
      })));
    }
    
    console.log("[CampaignList] Received campaigns:", campaigns);
    console.log("[CampaignList] Filtered campaigns:", filteredCampaigns);
  }, [filteredCampaigns, isLoading, error, activeTab, status, campaignsFetchStatus, fetchCompleted, campaigns]);

  // Always log when rendering campaign list
  console.log("Rendering campaign list with", filteredCampaigns?.length || 0, "campaigns");
  console.log("UNFILTERED CAMPAIGNS:", campaigns?.length || 0);
  
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

  // NEW: Display an error message if campaigns array is empty
  if (!campaigns || campaigns.length === 0) {
    return (
      <div style={{ background: 'red', color: 'white', padding: '20px', borderRadius: '5px', margin: '10px 0' }}>
        ⚠ No campaigns reached CampaignList
      </div>
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

  // MODIFIED: Always use the original campaigns regardless of filters
  const campaignsToRender = campaigns;
  console.log('[CAMPAIGN LIST] Bypassing filters, rendering ALL campaigns:', campaignsToRender?.length || 0);
  
  // When we have campaigns, show the table
  return (
    <Card className="overflow-hidden" key={forceRender}>
      {/* Debug information banner - make this more prominent */}
      <div className="bg-blue-100 p-4 border-b border-blue-200 flex flex-col gap-2">
        <p className="text-md font-medium text-blue-800">
          Rendering {campaignsToRender.length} campaigns (BYPASS FILTER MODE)
        </p>
        <p className="text-sm text-blue-700">
          Status: {fetchCompleted ? 'Fetch completed' : 'Fetch in progress'}, 
          Tab: {activeTab}, 
          Error: {error ? 'Yes' : 'None'}
        </p>
        {campaignsToRender.length > 0 && (
          <p className="text-sm font-medium text-green-700 bg-green-50 p-2 rounded-md">
            ✅ Have campaigns data: {campaignsToRender.length} campaigns available to render
          </p>
        )}
      </div>
      <CampaignTable 
        campaigns={campaignsToRender} 
        status={activeTab || status as 'active' | 'draft' | 'archived'}
        campaignsFetchStatus={campaignsFetchStatus}
      />
    </Card>
  );
};

export default CampaignList;
