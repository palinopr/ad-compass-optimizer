
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
    console.log(`🧾 [CAMPAIGN LIST] Rendering with ${campaigns?.length || 0} campaigns`, {
      isLoading,
      hasError: !!error,
      activeTab,
      status,
      campaignsFetchStatus,
      fetchCompleted,
      metaPermissionsInvalid,
      selectedAdAccount: localStorage.getItem('selected_ad_account')
    });
    
    if (campaigns && campaigns.length === 0 && !isLoading && !error) {
      console.log('[CAMPAIGN LIST] Empty campaigns array but no loading or error state');
      console.warn("Campaign data is empty at CampaignList");
    }
    
    if (campaigns && campaigns.length > 0) {
      console.log('[CAMPAIGN LIST] First few campaigns:', campaigns.slice(0, 3).map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        hasInsights: !!c.insights && Object.keys(c.insights).length > 0
      })));
    }
    
    // Added direct console log of raw campaign data
    console.log("[UI] Rendering raw campaign list:", campaigns);
  }, [campaigns, isLoading, error, activeTab, status, campaignsFetchStatus, fetchCompleted]);

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

  // First, check for empty campaign array to show user-friendly message
  if (!campaigns || campaigns.length === 0) {
    return (
      <Card className="p-4">
        <div className="bg-orange-100 border-2 border-orange-300 p-4 rounded-md text-center">
          <h2 className="text-xl font-bold text-orange-800">No Campaigns Found</h2>
          <p className="text-orange-700 mt-2">
            No campaign data is available to display at this time.
          </p>
        </div>
      </Card>
    );
  }

  // This is the main fallback rendering to ensure visibility of all campaigns
  return (
    <Card className="overflow-hidden">
      {/* Campaign count header */}
      <div className="bg-green-100 p-4 border-b border-green-200">
        <h2 className="text-xl font-bold text-green-800">Total campaigns: {campaigns.length}</h2>
        <p className="text-sm text-green-700">Raw campaign data debug view</p>
      </div>

      {/* Simple fallback rendering of all campaigns */}
      <div className="p-4">
        {campaigns.map((campaign, index) => (
          <div 
            key={campaign?.id || index}
            className="p-3 bg-gray-100 border border-gray-300 rounded-md my-2"
          >
            {campaign?.name || 'Unnamed Campaign'} — {campaign?.id || 'No ID'} — {campaign?.status || 'Unknown Status'}
          </div>
        ))}
      </div>

      {/* Display count at bottom for clarity */}
      <div className="bg-gray-100 p-3 text-center border-t border-gray-300">
        Displayed {campaigns.length} total campaigns
      </div>
    </Card>
  );
};

export default CampaignList;
