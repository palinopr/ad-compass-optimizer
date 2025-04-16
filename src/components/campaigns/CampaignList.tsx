
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
    console.log(`[CAMPAIGN LIST] Rendering with ${filteredCampaigns?.length || 0} campaigns`, {
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

  // Ensure we have an array of campaigns
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];
  
  // Show a clear "No Campaigns" UI when we have no campaigns but fetch completed successfully
  if ((safeFilteredCampaigns.length === 0 || !safeFilteredCampaigns) && fetchCompleted && !isLoading && !error && !metaPermissionsInvalid) {
    return <NoCampaignsFoundPanel onRefresh={refetchCampaigns} onCreateCampaign={() => {
      // Dispatch an event to show the campaign creation wizard
      window.dispatchEvent(new CustomEvent('show-campaign-creator'));
    }} />;
  }

  // When we have campaigns, show the table
  return (
    <Card className="overflow-hidden" key={forceRender}>
      <CampaignTable 
        campaigns={safeFilteredCampaigns} 
        status={activeTab || status as 'active' | 'draft' | 'archived'}
        campaignsFetchStatus={campaignsFetchStatus}
      />
    </Card>
  );
};

export default CampaignList;
