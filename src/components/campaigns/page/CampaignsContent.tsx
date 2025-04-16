
import React from 'react';
import DebuggerPanel from '@/components/campaigns/debugger/DebuggerPanel';
import RefreshControls from '@/components/campaigns/refresh/RefreshControls';
import CampaignTabs from '@/components/campaigns/CampaignTabs';
import EmptyStateMessage from '@/components/campaigns/EmptyStateMessage';
import { MetaCampaign } from '@/services/api/MetaCampaignService';

interface CampaignsContentProps {
  isAuthenticated: boolean;
  hasAdAccount: boolean;
  activeTab: 'active' | 'draft' | 'archived';
  setActiveTab: (tab: 'active' | 'draft' | 'archived') => void;
  showCreateWizard: boolean;
  campaigns: MetaCampaign[];
  filteredCampaigns: MetaCampaign[];
  isLoading: boolean;
  campaignsError: any;
  selectedAdAccount: string | null;
  campaignsFetchStatus?: 'success' | 'unauthorized' | 'error' | null;
  metaPermissionsInvalid?: boolean;
}

const CampaignsContent: React.FC<CampaignsContentProps> = ({
  isAuthenticated,
  hasAdAccount,
  activeTab,
  setActiveTab,
  showCreateWizard,
  campaigns,
  filteredCampaigns,
  isLoading,
  campaignsError,
  selectedAdAccount,
  campaignsFetchStatus,
  metaPermissionsInvalid
}) => {
  // Add debug info
  React.useEffect(() => {
    console.log('[CAMPAIGNS CONTENT] Rendered with:', {
      isAuthenticated,
      hasAdAccount,
      activeTab,
      showCreateWizard,
      campaignsCount: campaigns?.length || 0,
      filteredCount: filteredCampaigns?.length || 0,
      isLoading,
      hasError: !!campaignsError,
      selectedAdAccount,
      campaignsFetchStatus,
      metaPermissionsInvalid
    });
  }, [
    isAuthenticated,
    hasAdAccount,
    activeTab,
    showCreateWizard,
    campaigns,
    filteredCampaigns,
    isLoading,
    campaignsError,
    selectedAdAccount,
    campaignsFetchStatus,
    metaPermissionsInvalid
  ]);

  // Safety check for arrays
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];

  if (!showCreateWizard) {
    return (
      <>
        {isAuthenticated && hasAdAccount && (
          <DebuggerPanel
            campaigns={safeCampaigns}
            isLoading={isLoading}
            error={campaignsError}
          />
        )}
        
        {isAuthenticated && hasAdAccount && <RefreshControls />}
        
        <CampaignTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {safeFilteredCampaigns.length === 0 && 
         !showCreateWizard && 
         !isLoading && 
         campaignsFetchStatus !== 'unauthorized' && 
         !metaPermissionsInvalid && (
          <EmptyStateMessage adAccountId={selectedAdAccount} />
        )}
      </>
    );
  }
  return null;
};

export default CampaignsContent;

