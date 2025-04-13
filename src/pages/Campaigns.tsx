
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import CampaignDiagnostics from '@/components/campaigns/CampaignDiagnostics';

// Import our new components
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import ConnectionStatusAlerts from '@/components/campaigns/ConnectionStatusAlerts';
import CampaignTabs from '@/components/campaigns/CampaignTabs';
import { useCampaignsPage } from '@/hooks/campaigns/useCampaignsPage';

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
    handleConnectionError
  } = useCampaignsPage();

  return (
    <AppLayout>
      <div className="space-y-4">
        <CampaignHeader 
          onCreateCampaign={() => setShowCreateWizard(true)}
          disabled={showCreateWizard || !isAuthenticated || !hasAdAccount || !hasPermissions}
        />
        
        {/* Add Lovable Campaign Diagnostics */}
        <CampaignDiagnostics />
        
        {showCreateWizard ? (
          <CampaignCreationWizard onCancel={() => setShowCreateWizard(false)} />
        ) : (
          <>
            <ConnectionStatusAlerts 
              isAuthenticated={isAuthenticated} 
              hasPermissions={hasPermissions} 
              hasAdAccount={hasAdAccount}
            />
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <MetaConnect />
              {isAuthenticated && <AdAccountSelector />}
            </div>
            
            <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />
          </>
        )}
      </div>
      
      {/* Meta Connection Dialog that automatically shows when needed */}
      <MetaConnectionDialog
        open={showConnectionDialog}
        onOpenChange={setShowConnectionDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
      />
    </AppLayout>
  );
};

export default Campaigns;
