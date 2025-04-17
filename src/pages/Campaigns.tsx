import React, { useState, useEffect } from 'react';
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import CampaignFilterToolbar from '@/components/campaigns/CampaignFilterToolbar';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import CampaignsAuthentication from '@/components/campaigns/page/CampaignsAuthentication';
import CampaignsContent from '@/components/campaigns/page/CampaignsContent';
import { useCampaignsPage } from '@/components/campaigns/page/useCampaignsPage';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import FallbackBanner from '@/components/campaigns/FallbackBanner';
import CampaignControls from '@/components/campaigns/CampaignControls';

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
    metaPermissionsInvalid,
    fallbackForceRender,
    currentDatePreset
  } = useCampaignsPage();

  useEffect(() => {
    console.log('[CAMPAIGNS PAGE] Rendered with:', { 
      isAuthenticated,
      hasPermissions, 
      hasAdAccount,
      campaignsCount: campaigns?.length || 0,
      isLoading,
      showCreateWizard,
      activeTab,
      metaPermissionsInvalid,
      fallbackForceRender,
      currentDatePreset
    });
    
    if (campaigns) {
      console.log(`[CAMPAIGNS PAGE] Has ${campaigns.length} campaigns`);
    } else {
      console.warn('[CAMPAIGNS PAGE] Campaigns array is undefined or null');
    }
  }, [campaigns, isAuthenticated, hasPermissions, hasAdAccount, isLoading, showCreateWizard, activeTab, metaPermissionsInvalid, fallbackForceRender, currentDatePreset]);

  const isUsingMaximumFallback = localStorage.getItem('force_maximum_date_preset') === 'true';
  const fallbackReason = localStorage.getItem('date_preset_fallback_reason') || '';

  const safeCampaigns = Array.isArray(campaigns) ? campaigns : [];
  const safeFilteredCampaigns = Array.isArray(filteredCampaigns) ? filteredCampaigns : [];

  const handleResetDefault = () => {
    localStorage.removeItem('force_maximum_date_preset');
    localStorage.removeItem('fallback_notified');
    localStorage.removeItem('date_preset_fallback_reason');
    refetchCampaigns(true);
  };

  const handleForceMaximum = () => {
    localStorage.setItem('force_maximum_date_preset', 'true');
    localStorage.setItem('date_preset_fallback_reason', 'Manually triggered');
    console.log('👉 Switched to fallback date preset: maximum');
    refetchCampaigns(true);
  };

  return (
    <div className="container py-4 space-y-4">
      <div style={{ background: '#e6ffe6', padding: '10px', margin: '10px 0', borderRadius: '5px', border: '1px solid green' }}>
        ✅ Campaigns Page Loaded - {safeCampaigns.length} campaigns available
        {isUsingMaximumFallback && (
          <div className="mt-1 text-amber-700 font-medium">
            Using fallback date range: Maximum (no data found for Last 30 Days)
          </div>
        )}
      </div>
      
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

      <FallbackBanner 
        isUsingMaximumFallback={isUsingMaximumFallback}
        fallbackReason={fallbackReason}
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
            key={`campaigns-content-${fallbackForceRender}`}
            isAuthenticated={isAuthenticated}
            hasAdAccount={hasAdAccount}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            showCreateWizard={showCreateWizard}
            campaigns={safeCampaigns}
            filteredCampaigns={safeFilteredCampaigns}
            isLoading={isLoading}
            campaignsError={campaignsError}
            selectedAdAccount={selectedAdAccount}
            campaignsFetchStatus={campaignsFetchStatus}
            metaPermissionsInvalid={metaPermissionsInvalid}
          />
          
          <CampaignFilterToolbar 
            showCreateWizard={showCreateWizard}
            onRefresh={() => refetchCampaigns(true)}
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
      
      <CampaignControls 
        onResetDefault={handleResetDefault}
        onForceMaximum={handleForceMaximum}
      />
    </div>
  );
};

export default Campaigns;
