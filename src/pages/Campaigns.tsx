
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
import CampaignTroubleshooter from '@/components/campaigns/troubleshooter/CampaignTroubleshooter';
import AdAccountSection from '@/components/meta/integration/AdAccountSection';
import { CampaignsDiagnosticPanel } from '@/components/campaigns/CampaignsDiagnosticPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { Bug } from 'lucide-react';
import { metaAuthService } from '@/services/MetaAuthService';
import { useCampaignDiagnostics } from '@/hooks/campaigns/useCampaignDiagnostics';

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
  
  // Get diagnostics for debugging
  const diagnostics = useCampaignDiagnostics();
  
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
            
            {/* Always show diagnostics panel */}
            <CampaignsDiagnosticPanel />
            
            {isAuthenticated && hasAdAccount && <RefreshControls />}
            
            <CampaignTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {filteredCampaigns?.length === 0 && !showCreateWizard && (
              <EmptyStateMessage adAccountId={selectedAdAccount} />
            )}
            
            {/* Persistent Debug Info */}
            <Card className="mt-4 p-4 border-dashed border-amber-400">
              <div className="flex items-center gap-2 mb-2">
                <Bug className="h-5 w-5 text-amber-500" />
                <h3 className="font-medium">Campaigns Debug Info</h3>
              </div>
              
              <div className="space-y-3 text-sm">
                <Alert variant={diagnostics.tokenInfo.exists ? "default" : "destructive"}>
                  <AlertTitle>
                    Meta Token: {diagnostics.tokenInfo.exists ? 'FOUND' : 'NOT FOUND'}
                  </AlertTitle>
                  {diagnostics.tokenInfo.exists && (
                    <AlertDescription className="mt-2 font-mono text-xs">
                      Type: {diagnostics.tokenInfo.type}
                    </AlertDescription>
                  )}
                </Alert>
                
                <Alert>
                  <AlertTitle>Selected Ad Account</AlertTitle>
                  <AlertDescription className="mt-2 font-mono text-xs">
                    {selectedAdAccount || 'None selected'}
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <AlertTitle>Campaign Fetch Status</AlertTitle>
                  <AlertDescription className="mt-2 font-mono text-xs">
                    Campaigns: {campaigns.length} | 
                    Filtered: {filteredCampaigns.length} | 
                    Error: {campaignsError || 'None'}
                  </AlertDescription>
                </Alert>
                
                {diagnostics.apiResponses.lastError && (
                  <Alert variant="destructive">
                    <AlertTitle>Last Error</AlertTitle>
                    <AlertDescription className="mt-2 font-mono text-xs overflow-auto max-h-24">
                      {diagnostics.apiResponses.lastError}
                    </AlertDescription>
                  </Alert>
                )}
                
                {diagnostics.adAccounts.raw.length > 0 && (
                  <Alert>
                    <AlertTitle>Raw Ad Accounts ({diagnostics.adAccounts.count})</AlertTitle>
                    <AlertDescription>
                      <pre className="mt-2 text-xs bg-gray-50 p-2 rounded overflow-auto max-h-32">
                        {JSON.stringify(diagnostics.adAccounts.raw, null, 2)}
                      </pre>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </Card>
            
            <CampaignTroubleshooter />
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
