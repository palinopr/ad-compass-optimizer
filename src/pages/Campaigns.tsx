import React, { useState, useEffect } from 'react';
import CampaignHeader from '@/components/campaigns/CampaignHeader';
import CampaignFilterToolbar from '@/components/campaigns/CampaignFilterToolbar';
import CampaignCreationTrigger from '@/components/campaigns/CampaignCreationTrigger';
import CampaignCreationWizard from '@/components/campaigns/CampaignCreationWizard';
import CampaignsAuthentication from '@/components/campaigns/page/CampaignsAuthentication';
import CampaignsContent from '@/components/campaigns/page/CampaignsContent';
import { useCampaignsPage } from '@/components/campaigns/page/useCampaignsPage';
import MetaConnectionDialog from '@/components/meta/MetaConnectionDialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

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

  const [isFallbackBannerVisible, setIsFallbackBannerVisible] = useState(true);

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

  useEffect(() => {
    if (isUsingMaximumFallback) {
      const timer = setTimeout(() => setIsFallbackBannerVisible(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [isUsingMaximumFallback]);

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

      {isUsingMaximumFallback && isFallbackBannerVisible && (
        <div className="relative bg-amber-50 border border-amber-300 rounded-md p-3 text-sm flex items-center justify-between">
          <div>
            <h4 className="font-medium text-amber-800">Using fallback date range: Maximum</h4>
            <p className="text-amber-700 text-sm mt-1">
              No data found for Last 30 Days. {fallbackReason ? `Reason: ${fallbackReason}` : ''}
            </p>
          </div>
          <button 
            onClick={() => setIsFallbackBannerVisible(false)}
            className="text-amber-600 hover:text-amber-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

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
      
      <div className="mt-8 text-center">
        <button 
          onClick={() => {
            localStorage.removeItem('force_maximum_date_preset');
            localStorage.removeItem('fallback_notified');
            localStorage.removeItem('date_preset_fallback_reason');
            refetchCampaigns(true);
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 mr-2"
        >
          Reset & Refresh (Default Range)
        </button>
        
        <button 
          onClick={() => {
            localStorage.setItem('force_maximum_date_preset', 'true');
            localStorage.setItem('date_preset_fallback_reason', 'Manually triggered');
            console.log('👉 Switched to fallback date preset: maximum');
            refetchCampaigns(true);
          }}
          className="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
        >
          Force Maximum Range
        </button>
      </div>
    </div>
  );
};

export default Campaigns;
