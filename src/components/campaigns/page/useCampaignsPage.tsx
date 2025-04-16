
import { useEffect, useRef } from 'react';
import { useCampaignsPage as useBaseCampaignsPage } from '@/hooks/campaigns/useCampaignsPage';
import { useCampaigns } from '@/hooks/campaigns';
import { metaAuthService } from '@/services/MetaAuthService';
import { DatePresetVerifier } from '@/utils/debugging/DatePresetVerifier';

export const useCampaignsPage = () => {
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
  } = useBaseCampaignsPage();

  const { 
    campaigns, 
    filteredCampaigns, 
    error: campaignsError, 
    refetchCampaigns, 
    isLoading, 
    fetchCompleted, 
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid
  } = useCampaigns(activeTab);
  
  const selectedAdAccount = localStorage.getItem('selected_ad_account');
  const initialFetchTriggeredRef = useRef(false);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('USE_MOCK_MODE');
      localStorage.removeItem('USE_MOCK_META_API');
      localStorage.removeItem('mock_campaigns_data');
      localStorage.removeItem('mock_account_data');
      localStorage.removeItem('FORCE_MOCK_REFRESH');
      
      console.log('[CAMPAIGNS] Ensuring real API data is used, mock mode disabled');
    }
    
    if (process.env.NODE_ENV !== 'production') {
      setTimeout(() => {
        try {
          DatePresetVerifier.verifyAllDatePresets();
        } catch (e) {
          console.error('[DATE PRESET] Verification error:', e);
        }
      }, 1000);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && hasAdAccount && selectedAdAccount && hasPermissions && !initialFetchTriggeredRef.current) {
      console.log(`[CAMPAIGN FETCH] Full auth validated (token: ${isAuthenticated}, account: ${selectedAdAccount}, permissions: ${hasPermissions}), triggering fetch`);
      
      initialFetchTriggeredRef.current = true;
      
      const token = metaAuthService.getAccessToken();
      console.log('[CAMPAIGN FETCH] Auth state check:', {
        tokenExists: !!token,
        tokenLength: token ? token.length : 0,
        accountSelected: !!selectedAdAccount,
        isAuthenticated, 
        hasAdAccount,
        hasPermissions
      });
      
      setTimeout(() => {
        console.log('[CAMPAIGN FETCH] Initial fetch attempt for account:', selectedAdAccount);
        refetchCampaigns(true);
      }, 500);
    } else {
      console.log('[CAMPAIGN FETCH] Prerequisites not met:', {
        isAuthenticated,
        hasAdAccount,
        selectedAdAccount,
        hasPermissions,
        initialFetchTriggered: initialFetchTriggeredRef.current
      });
    }
  }, [isAuthenticated, hasAdAccount, selectedAdAccount, hasPermissions, refetchCampaigns]);

  useEffect(() => {
    const handleAccountChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.accountId) {
        console.log('[CAMPAIGNS] Ad account changed, triggering campaign refresh');
        initialFetchTriggeredRef.current = false;
        setTimeout(() => refetchCampaigns(true), 300);
      }
    };
    
    window.addEventListener('ad-account-changed', handleAccountChange as EventListener);
    return () => {
      window.removeEventListener('ad-account-changed', handleAccountChange as EventListener);
    };
  }, [refetchCampaigns]);

  return {
    // Auth state
    isAuthenticated,
    hasPermissions,
    hasAdAccount,
    isAuthSyncing,
    
    // Campaign data
    campaigns,
    filteredCampaigns,
    campaignsError,
    isLoading,
    selectedAdAccount,
    fetchCompleted,
    insightsFetchStatus,
    campaignsFetchStatus,
    metaPermissionsInvalid, // Expose the new flag
    
    // UI state
    activeTab,
    setActiveTab,
    showCreateWizard,
    setShowCreateWizard,
    showConnectionDialog,
    setShowConnectionDialog,
    
    // Actions
    handleConnectionSuccess,
    handleConnectionError,
    refreshConnection,
    resetConnection,
    refetchCampaigns
  };
};

