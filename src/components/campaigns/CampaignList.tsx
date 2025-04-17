
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

  // Display an error message if campaigns array is empty
  if (!campaigns || campaigns.length === 0) {
    return (
      <div style={{ background: 'red', color: 'white', padding: '20px', borderRadius: '5px', margin: '10px 0' }}>
        ⚠ No campaigns reached CampaignList
      </div>
    );
  }
  
  // IMPORTANT: Always use the raw campaigns directly - no filtering
  console.log('[UI] Rendering raw campaign list with', campaigns.length, 'campaigns');
  
  return (
    <Card className="overflow-hidden" key={forceRender}>
      {/* Raw campaign rendering banner */}
      <div className="bg-green-100 p-4 border-b border-green-200">
        <h3 className="text-lg font-bold text-green-800">✅ Loaded {campaigns.length} Raw Campaigns</h3>
        <p className="text-sm text-green-700">Displaying unfiltered campaign data</p>
      </div>
      
      {/* Simple campaign list rendering with divs */}
      <div className="p-4 space-y-2">
        {campaigns.map((campaign, index) => (
          <div 
            key={campaign?.id || index}
            className="p-3 bg-gray-100 border border-gray-300 rounded-md"
          >
            <div className="font-medium">{campaign?.name || 'Unnamed Campaign'} - <span className="font-mono text-sm">{campaign?.id || 'No ID'}</span></div>
            <div className="text-xs text-gray-500">Status: {campaign?.status || 'Unknown'}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default CampaignList;
