
import React, { useEffect } from 'react';
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
import { triggerCampaignRefresh } from '@/hooks/campaigns/fetch-utils/eventHandlers';
import { DatePresetVerifier } from '@/utils/debugging/DatePresetVerifier';

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

  const { campaigns, filteredCampaigns, error: campaignsError, refetchCampaigns } = useCampaigns(activeTab);
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  
  // Clear any mock data and ensure we're using real API data
  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      // Clear any mock mode flags or cached mock data
      localStorage.removeItem('USE_MOCK_MODE');
      localStorage.removeItem('USE_MOCK_META_API');
      localStorage.removeItem('mock_campaigns_data');
      localStorage.removeItem('mock_account_data');
      localStorage.removeItem('FORCE_MOCK_REFRESH');
      
      console.log('[CAMPAIGNS] Ensuring real API data is used, mock mode disabled');
    }
    
    // Run date preset verification
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => {
        DatePresetVerifier.verifyAllDatePresets();
      }, 1000);
    }
  }, []);
  
  // Ensure we fetch fresh data when the component mounts with insights
  useEffect(() => {
    if (isAuthenticated && hasAdAccount && selectedAdAccount) {
      console.log(`[CAMPAIGN FETCH] Initial fetch for act_${selectedAdAccount} to ensure fresh data with insights`);
      setTimeout(() => {
        refetchCampaigns(true);
      }, 1000);
    }
  }, [isAuthenticated, hasAdAccount, selectedAdAccount, refetchCampaigns]);
  
  // Add console logs for debugging
  useEffect(() => {
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
    
    // Check if the CampaignQueryBuilder is correctly configured
    try {
      const { CampaignQueryBuilder } = require('@/services/api/campaign/fetching/campaignQueryBuilder');
      const campaignQuery = CampaignQueryBuilder.buildCampaignQuery();
      const datePreset = campaignQuery.match(/date_preset\(([^)]+)\)/)?.[1];
      console.log('[CAMPAIGNS DEBUG] CampaignQueryBuilder is using date preset:', datePreset);
    } catch (e) {
      console.error('[CAMPAIGNS DEBUG] Error checking CampaignQueryBuilder:', e);
    }
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
