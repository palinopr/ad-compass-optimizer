
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

  // NEW: Fallback rendering to ensure visibility of all campaigns
  return (
    <Card className="overflow-hidden" key={forceRender}>
      {/* Campaign count header */}
      <div className="bg-green-100 p-4 border-b border-green-200">
        <h2 className="text-lg font-bold text-green-800">Total campaigns: {campaigns.length}</h2>
        <p className="text-sm text-green-700">Raw campaign data debug view</p>
      </div>

      {/* Simple fallback rendering of all campaigns */}
      <div className="p-4 space-y-2">
        {campaigns.map((c, i) => (
          <div 
            key={c?.id || i}
            className="p-3 bg-gray-100 border border-gray-300 rounded-md"
            style={{ padding: '12px', border: '1px solid #ccc', marginBottom: '8px' }}
          >
            <strong>{c?.name || 'Unnamed Campaign'}</strong><br />
            ID: {c?.id || 'N/A'}<br />
            Status: {c?.status || 'Unknown'}
          </div>
        ))}
      </div>

      {/* Show count at the bottom as well */}
      <div className="bg-gray-100 p-3 text-center text-sm border-t border-gray-200">
        Displayed {campaigns.length} total campaigns
      </div>
    </Card>
  );
};

export default CampaignList;
