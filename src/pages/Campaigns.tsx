
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
    campaignsFetchStatus
  } = useCampaignsPage();

  return (
    <div className="container py-4 space-y-4">
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
            campaigns={campaigns}
            filteredCampaigns={filteredCampaigns}
            isLoading={isLoading}
            campaignsError={campaignsError}
            selectedAdAccount={selectedAdAccount}
            campaignsFetchStatus={campaignsFetchStatus}
          />
          
          <CampaignFilterToolbar 
            showCreateWizard={showCreateWizard}
          />
          
          <CampaignList
            isLoading={isLoading}
            campaigns={campaigns}
            error={campaignsError}
            errorDetails={null}
            activeTab={activeTab}
            filteredCampaigns={filteredCampaigns}
            refetchCampaigns={() => refetchCampaigns(true)}
            forceRender={0}
            isAuthenticated={isAuthenticated}
            fetchCompleted={fetchCompleted}
            campaignsFetchStatus={campaignsFetchStatus}
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
            <CampaignCreationTrigger
              onClick={() => setShowCreateWizard(true)}
              isAuthenticated={isAuthenticated}
              hasAdAccount={hasAdAccount}
              hasPermissions={hasPermissions}
            />
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
