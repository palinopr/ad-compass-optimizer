
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import CampaignsAuthentication from '@/components/campaigns/page/CampaignsAuthentication';
import CampaignsContent from '@/components/campaigns/page/CampaignsContent';
import { useCampaignsPage } from '@/components/campaigns/page/useCampaignsPage';

// Import the API call logger to activate it
import '@/utils/debugging/apiCallLogger';

const Campaigns = () => {
  const {
    // Auth state
    isAuthenticated,
    hasPermissions,
    hasAdAccount,
    isAuthSyncing,
    
    // Campaign data
    campaigns,
    filteredCampaigns,
    campaignsError,
    isLoading,
    selectedAdAccount,
    
    // UI state
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    
    // Actions
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection
  } = useCampaignsPage();

  return (
    <AppLayout>
      <div className="space-y-4">
        <CampaignHeader 
          onCreateCampaign={() => setShowCreateWizard(true)}
          disabled={showCreateWizard || !isAuthenticated || !hasAdAccount || !hasPermissions}
        />
        
        {!showCreateWizard && (
          <>
            <CampaignsAuthentication 
              isAuthenticated={isAuthenticated}
              hasPermissions={hasPermissions}
              hasAdAccount={hasAdAccount}
              isAuthSyncing={isAuthSyncing}
              refreshConnection={refreshConnection}
              resetConnection={resetConnection}
            />
            
            <CampaignsContent 
              isAuthenticated={isAuthenticated}
              hasAdAccount={hasAdAccount}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              showCreateWizard={showCreateWizard}
              campaigns={campaigns}
              filteredCampaigns={filteredCampaigns}
              isLoading={isLoading}
              campaignsError={campaignsError}
              selectedAdAccount={selectedAdAccount}
            />
          </>
        )}
      </div>
      
      <MetaConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
      
      <CampaignCreationTrigger />
    </AppLayout>
  );
};

export default Campaigns;
