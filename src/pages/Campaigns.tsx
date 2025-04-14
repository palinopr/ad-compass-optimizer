
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
import MockDiagnosticPanel from '@/components/campaigns/diagnostic-components/MockDiagnosticPanel';
import CampaignTroubleshooter from '@/components/campaigns/troubleshooter/CampaignTroubleshooter';

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

  const { campaigns, filteredCampaigns } = useCampaigns(activeTab);
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  const debugMode = process.env.NODE_ENV !== 'production';

  return (
    <AppLayout>
      <div className="space-y-4">
        <CampaignHeader 
          onCreateCampaign={() => setShowCreateWizard(true)}
          disabled={showCreateWizard || !isAuthenticated || !hasAdAccount || !hasPermissions}
        />
        
        {showCreateWizard ? (
          <CampaignCreationWizard onCancel={() => setShowCreateWizard(false)} />
        ) : (
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
            
            {debugMode && localStorage.getItem("USE_MOCK_MODE") === "true" && (
              <MockDiagnosticPanel 
                displayedCampaignsCount={filteredCampaigns?.length || 0}
                rawCampaignsCount={campaigns?.length || 0}
                filters={{
                  status: activeTab,
                  datePreset: 'last30days',
                  search: ''
                }}
                adAccountId={selectedAdAccount || undefined}
              />
            )}
            
            {isAuthenticated && hasAdAccount && <RefreshControls />}
            
            <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {filteredCampaigns?.length === 0 && !showCreateWizard && (
              <EmptyStateMessage adAccountId={selectedAdAccount} />
            )}
            
            {debugMode && <CampaignTroubleshooter />}
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
