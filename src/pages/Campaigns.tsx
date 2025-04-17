
import React from 'react';
import CampaignList from '@/components/campaigns/CampaignList';
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import CampaignFilterToolbar from '@/components/campaigns/CampaignFilterToolbar';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import CampaignsAuthentication from '@/components/campaigns/page/CampaignsAuthentication';
import CampaignsContent from '@/components/campaigns/page/CampaignsContent';
import { useCampaignsPage } from '@/components/campaigns/page/useCampaignsPage';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';

const Campaigns = () => {
  const {
    isAuthenticated,
    hasPermissions,
    hasAdAccount,
    isAuthSyncing,
    campaigns,
    filteredCampaigns,
    campaignsError,
    isLoading,
    selectedAdAccount,
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    refetchCampaigns,
    fetchCompleted,
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid
  } = useCampaignsPage();

  // Debug log to track render cycle
  React.useEffect(() => {
    console.log('[CAMPAIGNS] Page rendered with:', { 
      isAuthenticated,
      hasPermissions, 
      hasAdAccount,
      campaignsCount: campaigns?.length || 0,
      isLoading,
      showCreateWizard,
      activeTab,
      metaPermissionsInvalid
    });
    
    // Check if campaigns array is valid
    if (campaigns) {
      console.log(`[CAMPAIGNS] Has ${campaigns.length} campaigns`);
      
      if (campaigns.length > 0) {
        // Log first campaign for debugging
        console.log('[CAMPAIGNS] First campaign:', {
          id: campaigns[0]?.id,
          name: campaigns[0]?.name,
          hasInsights: !!campaigns[0]?.insights,
          insightsKeys: campaigns[0]?.insights ? Object.keys(campaigns[0].insights) : [],
          insightsStatus: campaigns[0]?.insightsStatus
        });
      }
    } else {
      console.warn('[CAMPAIGNS] Campaigns array is undefined or null');
    }
  }, [campaigns, isAuthenticated, hasPermissions, hasAdAccount, isLoading, showCreateWizard, activeTab, metaPermissionsInvalid]);

  // Safety check for campaign data - always use raw campaigns
  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  
  // NEW: Debug banner at top of page
  const renderDebugBanner = () => {
    if (!campaigns || campaigns.length === 0) {
      return (
        <div style={{ background: 'red', color: 'white', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
          ⚠️ No campaigns data available
        </div>
      );
    }
    
    return (
      <div style={{ background: '#e6ffe6', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid green' }}>
        ✅ Raw campaign data: {campaigns.length} campaigns
      </div>
    );
  };

  return (
    <div className="container py-4 space-y-4">
      {renderDebugBanner()}
      
      <CampaignHeader
        onCreateCampaign={() => setShowCreateWizard(true)}
        disabled={!isAuthenticated || !hasAdAccount || !hasPermissions}
        isAuthenticated={isAuthenticated}
        hasAdAccount={hasAdAccount}
        hasPermissions={hasPermissions}
        showConnectionDialog={showConnectionDialog}
        setShowConnectionDialog={setShowConnectionDialog}
        refreshConnection={refreshConnection}
        isAuthSyncing={isAuthSyncing}
      />

      {!isAuthenticated || !hasAdAccount || !hasPermissions ? (
        <CampaignsAuthentication 
          isAuthenticated={isAuthenticated}
          hasAdAccount={hasAdAccount}
          hasPermissions={hasPermissions}
          showConnectionDialog={showConnectionDialog}
          setShowConnectionDialog={setShowConnectionDialog}
          resetConnection={resetConnection}
          refreshConnection={refreshConnection}
          isAuthSyncing={isAuthSyncing}
        />
      ) : (
        <>
          <CampaignsContent
            isAuthenticated={isAuthenticated}
            hasAdAccount={hasAdAccount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showCreateWizard={showCreateWizard}
            campaigns={safeCampaigns}
            filteredCampaigns={safeCampaigns} /* MODIFIED: Always use raw campaigns */
            isLoading={isLoading}
            campaignsError={campaignsError}
            selectedAdAccount={selectedAdAccount}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
          
          <CampaignFilterToolbar 
            showCreateWizard={showCreateWizard}
          />
          
          <CampaignList
            isLoading={isLoading}
            campaigns={safeCampaigns}
            error={campaignsError}
            errorDetails={null}
            activeTab={activeTab}
            filteredCampaigns={safeCampaigns} /* MODIFIED: Always use raw campaigns */
            refetchCampaigns={() => refetchCampaigns(true)}
            forceRender={0}
            isAuthenticated={isAuthenticated}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
          
          {showCreateWizard && (
            <CampaignCreationWizard 
              onClose={() => setShowCreateWizard(false)} 
              onSuccess={() => {
                setShowCreateWizard(false);
                refetchCampaigns(true);
              }}
            />
          )}
          
          {!showCreateWizard && (
            <CampaignCreationTrigger />
          )}
        </>
      )}

      <MetaConnectionDialog
        open={showConnectionDialog} 
        onOpenChange={setShowConnectionDialog}
        onSuccess={handleConnectionSuccess}
        onError={handleConnectionError}
        requestedPermissions={['ads_management', 'ads_read', 'business_management']}
      />
    </div>
  );
};

export default Campaigns;
