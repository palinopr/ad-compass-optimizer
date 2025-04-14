import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import MetaConnect from '@/components/meta/MetaConnect';
import AdAccountSelector from '@/components/meta/AdAccountSelector';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import DiagnosticButton from '@/components/campaigns/DiagnosticButton';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';
import MockDiagnosticPanel from '@/components/campaigns/diagnostic-components/MockDiagnosticPanel';

import CampaignHeader from '@/components/campaigns/CampaignHeader';
import ConnectionStatusAlerts from '@/components/campaigns/ConnectionStatusAlerts';
import CampaignTabs from '@/components/campaigns/CampaignTabs';
import { useCampaignsPage } from '@/hooks/campaigns/useCampaignsPage';
import { Button } from '@/components/ui/button';
import { RefreshCw, Power, RotateCcw } from 'lucide-react';
import { triggerCampaignRefresh, triggerDisplayRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { toast } from '@/hooks/use-toast';
import { useCampaigns } from '@/hooks/campaigns';
import { runLiveCampaignDiagnostic } from '@/utils/meta-diagnostics/liveCampaignDiagnostic';

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
  
  const [mockDataLoaded, setMockDataLoaded] = React.useState(false);
  const [debugResult, setDebugResult] = useState<string[]>([]);

  useEffect(() => {
    const isMockMode = localStorage.getItem("USE_MOCK_MODE") === "true";
    if (isMockMode && campaigns?.length > 0 && !mockDataLoaded) {
      console.log("Mock campaign data loaded, updating diagnostic panel state");
      setMockDataLoaded(true);
    }
  }, [campaigns, mockDataLoaded]);

  const handleForceRefresh = () => {
    triggerCampaignRefresh(true);
    toast({
      title: "Forcing Campaign Refresh",
      description: "Clearing cache and fetching fresh data from Meta...",
    });
  };

  const handleForceDisplayRefresh = () => {
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
            
            {localStorage.getItem("USE_MOCK_MODE") === "true" && (
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
            
            <div className="border-t border-gray-200 pt-6 mt-8">
              <h3 className="text-sm font-medium text-center mb-2">Campaign Connection Troubleshooter</h3>
              <div className="flex flex-col gap-2">
                <DiagnosticButton />
                
                <p className="text-sm text-muted-foreground mb-2 text-center">
                  🛠 Need help? Click "Run Live Campaign Debugger" to verify token and ad account status.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => runLiveCampaignDiagnostic(setDebugResult)}
                  className="w-full"
                >
                  Run Live Campaign Debugger
                </Button>
                
                {debugResult.length > 0 && (
                  <div className="mt-4 bg-muted p-3 rounded-md text-sm font-mono space-y-1">
                    {debugResult.map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
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
