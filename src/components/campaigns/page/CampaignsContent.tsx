
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
}) => {
  if (!showCreateWizard) {
    return (
      <>
        {isAuthenticated && hasAdAccount && (
          <DebuggerPanel
            campaigns={campaigns}
            isLoading={isLoading}
            error={campaignsError}
          />
        )}
        
        {isAuthenticated && hasAdAccount && <RefreshControls />}
        
        <CampaignTabs 
          activeTab={activeTab} 
          setActiveTab={setActiveTab} 
        />

        {filteredCampaigns?.length === 0 && !showCreateWizard && (
          <EmptyStateMessage adAccountId={selectedAdAccount} />
        )}
      </>
    );
  }
  return null;
};

export default CampaignsContent;
