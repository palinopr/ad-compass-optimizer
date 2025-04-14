
import React from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import DiagnosticButton from '@/components/campaigns/DiagnosticButton';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';

// Import our components
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import ConnectionStatusAlerts from '@/components/campaigns/ConnectionStatusAlerts';
import CampaignTabs from '@/components/campaigns/CampaignTabs';
import { useCampaignsPage } from '@/hooks/campaigns/useCampaignsPage';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power, RotateCcw } from 'lucide-react';
import { triggerCampaignRefresh, triggerDisplayRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { toast } from '@/hooks/use-toast';

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

  const handleForceRefresh = () => {
    // Force refresh of campaign data
    triggerCampaignRefresh(true);
    toast({
      title: "Forcing Campaign Refresh",
      description: "Clearing cache and fetching fresh data from Meta...",
    });
  };

  const handleForceDisplayRefresh = () => {
    // Force refresh of UI display
    triggerDisplayRefresh();
    toast({
      title: "UI Refresh Triggered",
      description: "Forcing component re-render without fetching new data...",
    });
  };

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
          
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex flex-col space-y-2">
                <MetaConnect />
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={refreshConnection}
                    disabled={isAuthSyncing}
                    className="flex-1"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isAuthSyncing ? 'animate-spin' : ''}`} />
                    {isAuthSyncing ? 'Refreshing...' : 'Refresh Connection'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={resetConnection}
                    disabled={isAuthSyncing}
                    className="flex-1"
                  >
                    <Power className="w-4 h-4 mr-2" />
                    Reset Connection
                  </Button>
                </div>
              </div>
              {isAuthenticated && <AdAccountSelector />}
            </div>
            
            {isAuthenticated && hasAdAccount && (
              <div className="flex gap-2 justify-end mb-4">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleForceRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Campaign Data
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleForceDisplayRefresh}
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Force UI Refresh
                </Button>
              </div>
            )}
            
            <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            
            {/* Make the diagnostic button more visible with a border */}
            <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="text-sm font-medium text-center mb-2">Campaign Connection Troubleshooter</h3>
              <DiagnosticButton />
            </div>
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
      
      {/* Campaign Creation Trigger */}
      <CampaignCreationTrigger />
    </AppLayout>
  );
};

export default Campaigns;
