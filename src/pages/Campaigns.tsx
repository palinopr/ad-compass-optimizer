
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import ConnectionStatusAlerts from '@/components/campaigns/ConnectionStatusAlerts';
import CampaignTabs from '@/components/campaigns/CampaignTabs';
import { useCampaignsPage } from '@/hooks/campaigns/useCampaignsPage';
import { useCampaigns } from '@/hooks/campaigns';
import ConnectionSection from '@/components/campaigns/connection/ConnectionSection';
import RefreshControls from '@/components/campaigns/refresh/RefreshControls';
import EmptyStateMessage from '@/components/campaigns/EmptyStateMessage';
import AdAccountSection from '@/components/meta/integration/AdAccountSection';
import { metaAuthService } from '@/services/MetaAuthService';
import DebuggerPanel from '@/components/campaigns/debugger/DebuggerPanel';

// Import the API call logger to activate it
import '@/utils/debugging/apiCallLogger';

const Campaigns = () => {
  const {
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    isAuthenticated,
    hasPermissions,
    hasAdAccount,
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    isAuthSyncing
  } = useCampaignsPage();

  const { campaigns, filteredCampaigns, error: campaignsError } = useCampaigns(activeTab);
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  
  // Add console logs for debugging
  React.useEffect(() => {
    console.log('[CAMPAIGNS DEBUG] Component mounted');
    const token = metaAuthService.getAccessToken();
    console.log('[CAMPAIGNS DEBUG] Meta token:', token ? 'FOUND' : 'NOT FOUND');
    console.log('[CAMPAIGNS DEBUG] Selected Ad Account:', selectedAdAccount);
    console.log('[CAMPAIGNS DEBUG] Campaign count:', campaigns.length);
    console.log('[CAMPAIGNS DEBUG] Authentication status:', { 
      isAuthenticated, 
      hasPermissions, 
      hasAdAccount 
    });
  }, [isAuthenticated, hasPermissions, hasAdAccount, campaigns.length, selectedAdAccount]);

  return (
    <AppLayout>
      <div className="space-y-4">
        <CampaignHeader 
          onCreateCampaign={() => setShowCreateWizard(true)}
          disabled={showCreateWizard || !isAuthenticated || !hasAdAccount || !hasPermissions}
        />
        
        {!showCreateWizard && (
          <>
            <ConnectionStatusAlerts 
              isAuthenticated={isAuthenticated} 
              hasPermissions={hasPermissions} 
              hasAdAccount={hasAdAccount}
            />
          
            <ConnectionSection 
              isAuthenticated={isAuthenticated}
              isAuthSyncing={isAuthSyncing}
              refreshConnection={refreshConnection}
              resetConnection={resetConnection}
            />
            
            {isAuthenticated && <AdAccountSection isAuthenticated={isAuthenticated} />}
            
            {/* Add our new in-app debugger panel */}
            {isAuthenticated && hasAdAccount && (
              <DebuggerPanel
                campaigns={campaigns}
                isLoading={false}
                error={campaignsError}
              />
            )}
            
            {isAuthenticated && hasAdAccount && <RefreshControls />}
            
            <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {filteredCampaigns?.length === 0 && !showCreateWizard && (
              <EmptyStateMessage adAccountId={selectedAdAccount} />
            )}
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
